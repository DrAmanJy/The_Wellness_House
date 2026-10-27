import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../server/db";
import { token } from "../server/security/crypto";
import type { Principal } from "../server/security/session";
import * as carts from "../server/modules/cart/service";
import { bootstrap } from "../server/modules/customers/bootstrap";
import { apiMetrics } from "../server/performance";
import * as checkout from "../server/modules/checkout/service";
import { addresses } from "../server/modules/customers/service";
import { getVariants } from "../lib/variants-client";
after(() => pool.end());
async function fixture() {
  const user = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Performance fixture','performance@example.invalid') RETURNING id",
    )
  ).rows[0];
  const p: Principal = {
    id: randomUUID(),
    userId: user.id,
    name: "Performance fixture",
    email: "performance@example.invalid",
    roles: [],
    stepUp: null,
    createdAt: new Date(),
  };
  const variant = (
    await pool.query(
      "SELECT v.id FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE e.slug='metabolic-balance-protocol' AND v.supply_code='standard-30' AND v.active",
    )
  ).rows[0].id;
  return { p, variant };
}
test("first cart addition is atomic, replay-safe and uses one database round trip", async () => {
  const { p, variant } = await fixture(),
    guest = token(),
    input = {
      cartId: "",
      quantity: 1,
      operationId: randomUUID(),
      increment: true,
    };
  const stats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const added = await apiMetrics.run(stats, () =>
    carts.mutateOwnedCart(p, guest, variant, input),
  );
  assert.equal(stats.dbCalls, 1);
  assert(added.id);
  assert.equal(added.version, 1);
  assert.equal(added.items[0].quantity, 1);
  const repeated = await carts.mutateOwnedCart(p, guest, variant, input);
  assert.equal(repeated.id, added.id);
  assert.equal(repeated.version, 1);
  assert.equal(repeated.items[0].quantity, 1);
  await assert.rejects(
    () => carts.mutateOwnedCart(p, guest, variant, { ...input, quantity: 2 }),
    (e: any) => e.code === "OPERATION_REUSED",
  );
});
test("concurrent fast-path additions and snapshots preserve versions and quantities", async () => {
  const { p, variant } = await fixture(),
    guest = token();
  const initial = await carts.mutateOwnedCart(p, guest, variant, {
    cartId: "",
    quantity: 1,
    operationId: randomUUID(),
    increment: true,
  });
  await Promise.all(
    Array.from({ length: 12 }, () =>
      carts.mutateOwnedCart(p, guest, variant, {
        cartId: initial.id,
        quantity: 1,
        operationId: randomUUID(),
        increment: true,
      }),
    ),
  );
  const final = await carts.snapshot(initial.id);
  assert.equal(final.version, 13);
  assert.equal(final.items[0].quantity, 13);
  assert.equal(final.items[0].totalAdded, "13");
  const results = await Promise.allSettled(
    [2, 3].map((quantity) =>
      carts.mutateOwnedCart(p, guest, variant, {
        cartId: initial.id,
        quantity,
        expectedVersion: final.version,
        operationId: randomUUID(),
        increment: false,
      }),
    ),
  );
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(results.filter((x) => x.status === "rejected").length, 1);
});
test("fast path rejects foreign carts, consumed guest carts and invalid supplies", async () => {
  const { p, variant } = await fixture(),
    other = (await fixture()).p,
    guest = token();
  const source = await carts.mutateOwnedCart(null, guest, variant, {
    cartId: "",
    quantity: 1,
    operationId: randomUUID(),
    increment: true,
  });
  await assert.rejects(
    () =>
      carts.mutateOwnedCart(other, guest, variant, {
        cartId: source.id,
        quantity: 1,
        operationId: randomUUID(),
        increment: true,
      }),
    (e: any) => e.code === "CART_OWNER_CHANGED",
  );
  await carts.merge(p, guest);
  await assert.rejects(
    () =>
      carts.mutateOwnedCart(null, guest, variant, {
        cartId: source.id,
        quantity: 1,
        operationId: randomUUID(),
        increment: true,
      }),
    (e: any) => e.code === "CART_INACTIVE",
  );
  await assert.rejects(
    () =>
      carts.mutateOwnedCart(p, guest, randomUUID(), {
        cartId: "",
        quantity: 1,
        operationId: randomUUID(),
        increment: true,
      }),
    (e: any) => e.code === "PRODUCT_UNAVAILABLE",
  );
});
test("bootstrap does zero DB calls for a new visitor and one for authenticated cart/profile data", async () => {
  const anonymousStats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const empty = await apiMetrics.run(anonymousStats, () => bootstrap(null, ""));
  assert.equal(anonymousStats.dbCalls, 0);
  assert.equal(empty.cart.id, "");
  const { p, variant } = await fixture();
  await carts.mutateOwnedCart(p, token(), variant, {
    cartId: "",
    quantity: 2,
    operationId: randomUUID(),
    increment: true,
  });
  const stats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const result = await apiMetrics.run(stats, () => bootstrap(p, ""));
  assert.equal(stats.dbCalls, 1);
  assert.equal(result.user!.userId, p.userId);
  assert.equal(result.cart.items[0].quantity, 2);
});
test("clear uses one owned transaction and retains optimistic version checks", async () => {
  const { p, variant } = await fixture(),
    other = (await fixture()).p,
    guest = token();
  const bag = await carts.mutateOwnedCart(p, guest, variant, {
    cartId: "",
    quantity: 2,
    operationId: randomUUID(),
    increment: true,
  });
  await assert.rejects(
    () => carts.clearOwnedCart(other, guest, bag.id, bag.version),
    (e: any) => e.code === "CART_OWNER_CHANGED",
  );
  await assert.rejects(
    () => carts.clearOwnedCart(p, guest, bag.id, bag.version + 1),
    (e: any) => e.code === "CART_VERSION",
  );
  const stats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const cleared = await apiMetrics.run(stats, () =>
    carts.clearOwnedCart(p, guest, bag.id, bag.version),
  );
  assert.equal(stats.dbCalls, 1);
  assert.equal(cleared.version, bag.version + 1);
  assert.deepEqual(cleared.items, []);
});
test("checkout and address snapshots each use one DB call with ownership checks", async () => {
  const { p, variant } = await fixture(),
    cap = token();
  const intent = await checkout.createIntent(p, token(), cap, {
      mode: "buy_now",
      variantId: variant,
      quantity: 1,
    }),
    selection = await checkout.resume(p, intent.id, cap);
  const stats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const detail = await apiMetrics.run(stats, () =>
    checkout.getCheckout(p, selection.id),
  );
  assert.equal(stats.dbCalls, 1);
  assert.equal(detail.items[0].variantId, variant);
  assert.equal(detail.order, null);
  const addressStats = { started: performance.now(), dbCalls: 0, dbMs: 0 };
  const result = await apiMetrics.run(addressStats, () => addresses(p));
  assert.equal(addressStats.dbCalls, 1);
  assert.deepEqual(result.items, []);
  await assert.rejects(
    () => checkout.getCheckout({ ...p, userId: randomUUID() }, selection.id),
    /not found/,
  );
});
test("public variant lookups share requests and failed requests remain retryable", async () => {
  const savedFetch = globalThis.fetch;
  let calls = 0,
    fail = false;
  globalThis.fetch = async () => {
    calls++;
    return fail
      ? Response.json({ message: "Unavailable" }, { status: 503 })
      : Response.json([{ id: "fixture", priceMinor: "100" }]);
  };
  try {
    const slug = "fixture-" + randomUUID();
    await Promise.all([
      getVariants(slug),
      getVariants(slug),
      getVariants(slug),
    ]);
    await getVariants(slug);
    assert.equal(calls, 1);
    fail = true;
    const failedSlug = "failed-" + randomUUID();
    await assert.rejects(() => getVariants(failedSlug));
    fail = false;
    assert.equal((await getVariants(failedSlug))[0].priceMinor, "100");
    assert.equal(calls, 3);
  } finally {
    globalThis.fetch = savedFetch;
  }
});
