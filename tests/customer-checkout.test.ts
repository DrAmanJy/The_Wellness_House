import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHmac } from "node:crypto";
import { pool } from "../server/db";
import { token } from "../server/security/crypto";
import type { Principal } from "../server/security/session";
import * as carts from "../server/modules/cart/service";
import * as customers from "../server/modules/customers/service";
import * as checkout from "../server/modules/checkout/service";
import { save, publish } from "../server/modules/content/service";
import { RITUAL_FORMULATIONS } from "../lib/rituals-data";
import {
  processCapture,
  expireOrders,
  webhook,
  confirmPayment,
  initiate,
} from "../server/modules/commerce/service";
import { verifyWebhook } from "../server/modules/commerce/provider";
import { createProviderOrder } from "../server/modules/commerce/provider";
import { PaymentProviderAuthError } from "../server/modules/commerce/provider";
import { paymentStatus } from "../server/modules/checkout/payments";
after(() => pool.end());
async function customer(): Promise<Principal> {
  const id = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Customer checkout test','customer@example.invalid') RETURNING id",
    )
  ).rows[0].id;
  return {
    id: randomUUID(),
    userId: id,
    name: "Test customer",
    email: "customer@example.invalid",
    roles: ["owner"],
    createdAt: new Date(),
    stepUp: new Date(),
  };
}
async function product(p: Principal, stock = 100) {
  const slug = "purchase-test-" + randomUUID();
  const d = await save(p, "products", {
    slug,
    expectedVersion: 0,
    content: { ...RITUAL_FORMULATIONS[0], slug },
    seo: {},
  });
  await publish(p, d.id, d.version);
  const v = (await checkout.variants(slug)).find(
    (v) => v.supplyCode === "standard-30",
  )!;
  await pool.query(
    "UPDATE product_variants SET price_minor=12345 WHERE id=$1",
    [v.id],
  );
  await pool.query("INSERT INTO inventory(variant_id,on_hand) VALUES($1,$2)", [
    v.id,
    stock,
  ]);
  return { slug, variantId: v.id, productId: d.id };
}
const address = {
  label: "Home",
  recipient: "Test Customer",
  phone: "+91 9876543210",
  line1: "10 Test Street",
  line2: "",
  landmark: "",
  city: "New Delhi",
  region: "Delhi",
  postal_code: "110001",
  country_code: "IN",
};
test("OAuth state-pinned guest carts merge without a callback guest cookie", async () => {
  const p = await customer(),
    v = await product(p),
    source = await carts.cart(null, token());
  await carts.mutateItem(source, v.variantId, {
    quantity: 1,
    increment: true,
    operationId: randomUUID(),
  });
  await carts.mergeSource(p, source);
  await carts.mergeSource(p, source);
  const account = await carts.cart(p, "");
  assert.equal((await carts.cartItems(account))[0].quantity, 1);
});
test("login preserves an unavailable supply as a non-purchasable bag line", async () => {
  await configure();
  const p = await customer(),
    v = await product(p),
    guest = token(),
    source = await carts.cart(null, guest);
  await carts.setItem(source, v.slug, 1);
  await pool.query("UPDATE product_variants SET active=false WHERE id=$1", [
    v.variantId,
  ]);
  await carts.merge(p, guest);
  const account = await carts.cart(p, guest),
    bag = await carts.snapshot(account);
  assert.equal(bag.items.length, 1);
  assert.equal(bag.items[0].available, false);
  const cap = token(),
    i = await checkout.createIntent(p, guest, cap, {
      mode: "cart",
      cartVersion: bag.version,
    }),
    s = await checkout.resume(p, i.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  await assert.rejects(() => checkout.quote(p, s.id), /unavailable/);
});
async function configure() {
  Object.assign(process.env, {
    RAZORPAY_KEY_ID: "test_key",
    RAZORPAY_KEY_SECRET: "test_secret",
    RAZORPAY_WEBHOOK_SECRET: "test_webhook",
  });
  await pool.query(
    "UPDATE commerce_settings SET enabled=true,shipping_minor=5000,tax_basis_points=500,postal_prefixes=ARRAY['110'],version=version+1 WHERE singleton",
  );
}
test("cart retries and simultaneous login merges apply deliberate additions once", async () => {
  const p = await customer(),
    v = await product(p),
    guest = token(),
    account = await carts.cart(p, guest),
    source = await carts.cart(null, guest),
    op = randomUUID();
  await carts.mutateItem(account, v.variantId, {
    quantity: 2,
    increment: true,
    operationId: randomUUID(),
  });
  await Promise.all(
    [1, 2].map(() =>
      carts.mutateItem(source, v.variantId, {
        quantity: 1,
        increment: true,
        operationId: op,
      }),
    ),
  );
  assert.equal((await carts.cartItems(source))[0].quantity, 1);
  await Promise.all([carts.merge(p, guest), carts.merge(p, guest)]);
  await carts.merge(p, guest);
  assert.equal((await carts.cartItems(account))[0].quantity, 3);
  assert.equal(
    (
      await pool.query(
        "SELECT count(*) FROM cart_merge_receipts WHERE source_id=$1",
        [source],
      )
    ).rows[0].count,
    "1",
  );
  await assert.rejects(
    () =>
      carts.mutateItem(source, v.variantId, {
        quantity: 1,
        increment: true,
        operationId: randomUUID(),
      }),
    /no longer active/,
  );
  await assert.rejects(
    async () => carts.merge({ ...p, userId: (await customer()).userId }, guest),
    /already claimed/,
  );
});
test("addresses enforce ownership, concurrent defaults and version checks", async () => {
  const p = await customer(),
    other = await customer();
  const a = await customers.saveAddress(p, address),
    b = await customers.saveAddress(p, { ...address, label: "Work" });
  await Promise.all([
    customers.defaultAddress(p, a.id),
    customers.defaultAddress(p, b.id),
  ]);
  assert(
    [a.id, b.id].includes(
      (await customers.addresses(p)).defaults.shipping_address_id,
    ),
  );
  await assert.rejects(
    () => customers.defaultAddress(other, a.id),
    /not found/,
  );
  await assert.rejects(
    () => customers.saveAddress(other, address, a.id, 0),
    /not found/,
  );
  await customers.saveAddress(
    p,
    { ...address, line1: "Changed" },
    a.id,
    a.version,
  );
  await assert.rejects(
    () => customers.saveAddress(p, address, a.id, 0),
    /changed/,
  );
  await assert.rejects(() =>
    customers.saveAddress(p, { ...address, postal_code: "123" }),
  );
  await customers.deleteAddress(p, b.id);
  assert(!(await customers.addresses(p)).items.some((i) => i.id === b.id));
});
test("Buy Now resumes to one owned checkout without changing the bag", async () => {
  const p = await customer(),
    v = await product(p),
    guest = token(),
    cap = token(),
    bag = await carts.cart(p, guest);
  await carts.setItem(bag, v.slug, 2);
  const intent = await checkout.createIntent(null, guest, cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  await assert.rejects(
    () => checkout.resume(p, intent.id, token()),
    /unavailable/,
  );
  const sessions = await Promise.all([
    checkout.resume(p, intent.id, cap),
    checkout.resume(p, intent.id, cap),
  ]);
  assert.equal(sessions[0].id, sessions[1].id);
  assert.equal((await carts.cartItems(bag))[0].quantity, 2);
  const detail = await checkout.getCheckout(p, sessions[0].id);
  assert.equal(detail.items[0].quantity, 1);
  await assert.rejects(
    async () =>
      checkout.getCheckout(
        { ...p, userId: (await customer()).userId },
        detail.id,
      ),
    /not found/,
  );
});
test("orders are server-priced, idempotent and do not remove later bag additions", async () => {
  await configure();
  const p = await customer(),
    v = await product(p),
    guest = token(),
    cap = token(),
    bag = await carts.cart(p, guest);
  await carts.mutateItem(bag, v.variantId, {
    quantity: 2,
    increment: true,
    operationId: randomUUID(),
  });
  const intent = await checkout.createIntent(p, guest, cap, {
      mode: "cart",
      cartVersion: (await carts.snapshot(bag)).version,
    }),
    s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  const q = await checkout.quote(p, s.id);
  assert.equal(q.subtotalMinor, "24690");
  assert.equal(q.totalMinor, "30925");
  const session = await checkout.getCheckout(p, s.id),
    key = randomUUID();
  const orders = await Promise.all([
    checkout.placeOrder(p, s.id, session.version, key),
    checkout.placeOrder(p, s.id, session.version, key),
  ]);
  assert.equal(orders[0].id, orders[1].id);
  await assert.rejects(
    () => checkout.placeOrder(p, randomUUID(), session.version, key),
    /different checkout/,
  );
  await carts.mutateItem(bag, v.variantId, {
    quantity: 1,
    increment: true,
    operationId: randomUUID(),
  });
  const providerId = "order_" + randomUUID().replaceAll("-", ""),
    paymentId = "pay_" + randomUUID().replaceAll("-", "");
  await pool.query(
    "UPDATE payments SET provider_order_id=$2,state='ready' WHERE order_id=$1",
    [orders[0].id, providerId],
  );
  const fake = async () => ({
    id: paymentId,
    order_id: providerId,
    status: "captured",
    amount: Number(q.totalMinor),
    currency: "INR",
  });
  await Promise.all([
    processCapture(paymentId, undefined, fake),
    processCapture(paymentId, undefined, fake),
  ]);
  assert.equal((await carts.cartItems(bag))[0].quantity, 1);
  assert.equal(
    (await checkout.getOrder(p, orders[0].id)).payment_status,
    "paid",
  );
  assert.equal(
    (
      await pool.query(
        "SELECT on_hand,reserved FROM inventory WHERE variant_id=$1",
        [v.variantId],
      )
    ).rows[0].on_hand,
    98,
  );
  assert.equal(
    (
      await pool.query(
        "SELECT count(*) FROM payment_captures WHERE provider_payment_id=$1",
        [paymentId],
      )
    ).rows[0].count,
    "1",
  );
  await customers.saveAddress(p, address);
  assert.equal(
    (await checkout.getOrder(p, orders[0].id)).shipping_address.line1,
    address.line1,
  );
});
test("checkout confirmation rejects forged, foreign and mismatched payments before accepting a captured payment once", async () => {
  await configure();
  const p = await customer(),
    other = await customer(),
    v = await product(p),
    cap = token();
  const intent = await checkout.createIntent(p, token(), cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  const s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  const q = await checkout.quote(p, s.id),
    current = await checkout.getCheckout(p, s.id);
  const order = await checkout.placeOrder(
    p,
    s.id,
    current.version,
    randomUUID(),
  );
  const orderId = "order_" + randomUUID().replaceAll("-", ""),
    paymentId = "pay_" + randomUUID().replaceAll("-", "");
  await pool.query(
    "UPDATE payments SET provider_order_id=$2,state='ready' WHERE order_id=$1",
    [order.id, orderId],
  );
  const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex");
  const input = { orderId, paymentId, signature };
  const external = {
    id: paymentId,
    order_id: orderId,
    amount: Number(q.totalMinor),
    currency: "INR",
    status: "captured",
  };
  let fetched = 0;
  const fetchPayment = async () => {
    fetched++;
    return external;
  };
  await assert.rejects(
    () => confirmPayment(other, order.id, input, fetchPayment),
    /not found/,
  );
  await assert.rejects(
    () =>
      confirmPayment(
        p,
        order.id,
        { ...input, signature: "0".repeat(64) },
        fetchPayment,
      ),
    /signature/,
  );
  await assert.rejects(
    () =>
      confirmPayment(
        p,
        order.id,
        { ...input, orderId: "order_Foreign" },
        fetchPayment,
      ),
    /match/,
  );
  assert.equal(fetched, 0);
  await assert.rejects(
    () =>
      confirmPayment(p, order.id, input, async () => ({
        ...external,
        order_id: "order_Foreign",
      })),
    /match/,
  );
  await assert.rejects(
    () =>
      confirmPayment(p, order.id, input, async () => ({
        ...external,
        amount: 1,
      })),
    /AMOUNT_MISMATCH/,
  );
  await assert.rejects(
    () =>
      confirmPayment(p, order.id, input, async () => ({
        ...external,
        currency: "USD",
      })),
    /AMOUNT_MISMATCH/,
  );
  await assert.rejects(
    () =>
      confirmPayment(p, order.id, input, async () => ({
        ...external,
        id: "pay_Foreign",
      })),
    /ID_MISMATCH/,
  );
  assert.equal(
    (
      await confirmPayment(p, order.id, input, async () => ({
        ...external,
        status: "authorized",
      }))
    ).verified,
    false,
  );
  await assert.rejects(() => checkout.getOrder(p, order.id), /not found/);
  assert.equal((await checkout.listOrders(p)).length, 0);
  assert.equal((await paymentStatus(p, s.id)).state, "confirming");
  await Promise.all([
    confirmPayment(p, order.id, input, fetchPayment),
    confirmPayment(p, order.id, input, fetchPayment),
  ]);
  assert.equal((await checkout.getOrder(p, order.id)).payment_status, "paid");
  assert.equal(
    (
      await pool.query("SELECT on_hand FROM inventory WHERE variant_id=$1", [
        v.variantId,
      ])
    ).rows[0].on_hand,
    99,
  );
});

test("minimum payment total is enforced before contacting the provider", async () => {
  for (const amount of [0, 99, -1, 100.5, Number.NaN])
    await assert.rejects(
      () =>
        createProviderOrder({
          amount,
          currency: "INR",
          receipt: "minimum-test",
        }),
      (e: any) => e.status === 400,
    );
  await configure();
  const p = await customer(),
    v = await product(p),
    cap = token();
  await pool.query("UPDATE product_variants SET price_minor=99 WHERE id=$1", [
    v.variantId,
  ]);
  await pool.query(
    "UPDATE commerce_settings SET shipping_minor=0,tax_basis_points=0 WHERE singleton",
  );
  const intent = await checkout.createIntent(p, token(), cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  const s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  await assert.rejects(
    () => checkout.quote(p, s.id),
    (e: any) => e.code === "PAYMENT_AMOUNT",
  );
});

test("provider order creation reuses the ready order without creating it twice", async () => {
  await configure();
  const p = await customer(),
    v = await product(p),
    cap = token();
  const intent = await checkout.createIntent(p, token(), cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  const s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  const q = await checkout.quote(p, s.id),
    current = await checkout.getCheckout(p, s.id);
  const order = await checkout.placeOrder(
    p,
    s.id,
    current.version,
    randomUUID(),
  );
  let calls = 0;
  await assert.rejects(
    () =>
      initiate(order.id, async () => {
        throw new PaymentProviderAuthError();
      }),
    (e: any) => e.code === "PAYMENT_PROVIDER_AUTH",
  );
  assert.equal(
    (
      await pool.query("SELECT state FROM payments WHERE order_id=$1", [
        order.id,
      ])
    ).rows[0].state,
    "queued",
  );
  await initiate(order.id, async (input) => {
    calls++;
    assert.equal(input.amount, Number(q.totalMinor));
    assert.equal(input.currency, "INR");
    return { id: "order_" + randomUUID().replaceAll("-", ""), ...input } as any;
  });
  await initiate(order.id, async () => {
    calls++;
    throw new Error("must not create twice");
  });
  assert.equal(calls, 1);
  await assert.rejects(() => checkout.getOrder(p, order.id), /not found/);
  assert((await paymentStatus(p, s.id)).payment);
  assert.equal((await checkout.listOrders(p)).length, 0);
});

test("concurrent last-unit orders cannot oversell", async () => {
  await configure();
  const p = await customer(),
    v = await product(p, 1);
  const sessions = [];
  for (let n = 0; n < 2; n++) {
    const cap = token(),
      i = await checkout.createIntent(p, token(), cap, {
        mode: "buy_now",
        variantId: v.variantId,
        quantity: 1,
      }),
      s = await checkout.resume(p, i.id, cap);
    await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
    await checkout.quote(p, s.id);
    sessions.push(await checkout.getCheckout(p, s.id));
  }
  const results = await Promise.allSettled(
    sessions.map((s) => checkout.placeOrder(p, s.id, s.version, randomUUID())),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    (
      await pool.query("SELECT reserved FROM inventory WHERE variant_id=$1", [
        v.variantId,
      ])
    ).rows[0].reserved,
    1,
  );
});
test("late capture without stock queues exactly one refund and never fulfillment", async () => {
  await configure();
  const p = await customer(),
    v = await product(p, 1),
    cap = token(),
    i = await checkout.createIntent(p, token(), cap, {
      mode: "buy_now",
      variantId: v.variantId,
      quantity: 1,
    }),
    s = await checkout.resume(p, i.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  const q = await checkout.quote(p, s.id),
    session = await checkout.getCheckout(p, s.id),
    order = await checkout.placeOrder(p, s.id, session.version, randomUUID());
  await pool.query(
    "UPDATE orders SET expires_at=now()-interval '1 minute' WHERE id=$1",
    [order.id],
  );
  await expireOrders();
  await pool.query("UPDATE inventory SET on_hand=0 WHERE variant_id=$1", [
    v.variantId,
  ]);
  const providerId = "order_" + randomUUID().replaceAll("-", ""),
    paymentId = "pay_" + randomUUID().replaceAll("-", "");
  await pool.query(
    "UPDATE payments SET provider_order_id=$2,state='ready' WHERE order_id=$1",
    [order.id, providerId],
  );
  const fake = async () => ({
    id: paymentId,
    order_id: providerId,
    status: "captured",
    amount: Number(q.totalMinor),
    currency: "INR",
  });
  await processCapture(paymentId, undefined, fake);
  await processCapture(paymentId, undefined, fake);
  await assert.rejects(() => checkout.getOrder(p, order.id), /not found/);
  assert.equal((await checkout.listOrders(p)).length, 0);
  assert.equal((await paymentStatus(p, s.id)).state, "refund_pending");
  assert.equal(
    (
      await pool.query(
        "SELECT count(*) FROM refunds WHERE provider_payment_id=$1",
        [paymentId],
      )
    ).rows[0].count,
    "1",
  );
});
test("only verified purchases become visible and remain visible after refund", async () => {
  await configure();
  const p = await customer(),
    other = await customer(),
    v = await product(p),
    cap = token();
  const intent = await checkout.createIntent(p, token(), cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  const s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  assert.deepEqual(await checkout.listOrders(p), []);
  const q = await checkout.quote(p, s.id),
    current = await checkout.getCheckout(p, s.id),
    key = randomUUID();
  const order = await checkout.placeOrder(p, s.id, current.version, key);
  assert.equal((await checkout.getCheckout(p, s.id)).order, null);
  assert.equal((await checkout.getCheckout(p, s.id)).paymentAttempt, true);
  assert.deepEqual(await checkout.listOrders(p), []);
  await assert.rejects(() => checkout.getOrder(p, order.id), /not found/);
  await assert.rejects(() => paymentStatus(other, s.id), /not found/);
  await assert.rejects(
    () =>
      pool.query(
        "UPDATE orders SET payment_status='paid',confirmed_at=now() WHERE id=$1",
        [order.id],
      ),
    /Verified capture/,
  );
  const providerId = "order_" + randomUUID().replaceAll("-", ""),
    paymentId = "pay_" + randomUUID().replaceAll("-", "");
  await pool.query(
    "UPDATE payments SET provider_order_id=$2,state='ready' WHERE order_id=$1",
    [order.id, providerId],
  );
  // Dismissed/failed attempts leave the provisional snapshot and bag intact, reusable by the same checkout.
  assert.equal(
    (await checkout.placeOrder(p, s.id, current.version, randomUUID())).id,
    order.id,
  );
  assert.deepEqual(await checkout.listOrders(p), []);
  const fetchPayment = async () => ({
    id: paymentId,
    order_id: providerId,
    status: "captured",
    amount: Number(q.totalMinor),
    currency: "INR",
  });
  await Promise.all([
    processCapture(paymentId, undefined, fetchPayment),
    processCapture(paymentId, undefined, fetchPayment),
  ]);
  assert.equal((await checkout.listOrders(p)).length, 1);
  const paid = await checkout.getOrder(p, order.id);
  assert(paid.confirmed_at);
  assert.equal(paid.fulfillment_status, "processing");
  assert.equal((await checkout.getCheckout(p, s.id)).state, "completed");
  assert.equal((await paymentStatus(p, s.id)).orderId, order.id);
  await assert.rejects(() => checkout.getOrder(other, order.id), /not found/);
  await pool.query(
    "UPDATE orders SET payment_status='refunded',fulfillment_status='cancelled' WHERE id=$1",
    [order.id],
  );
  assert.equal((await checkout.listOrders(p)).length, 1);
  assert.equal(
    (await checkout.getOrder(p, order.id)).payment_status,
    "refunded",
  );
  await assert.rejects(
    () =>
      pool.query("UPDATE orders SET confirmed_at=NULL WHERE id=$1", [order.id]),
    /immutable/,
  );
});

test("failed finalization rolls back stock and can be retried after captured payment", async () => {
  await configure();
  const p = await customer(),
    v = await product(p, 2),
    cap = token();
  const intent = await checkout.createIntent(p, token(), cap, {
    mode: "buy_now",
    variantId: v.variantId,
    quantity: 1,
  });
  const s = await checkout.resume(p, intent.id, cap);
  await checkout.updateCheckout(p, s.id, { version: 0, shipping: address });
  const q = await checkout.quote(p, s.id),
    current = await checkout.getCheckout(p, s.id),
    order = await checkout.placeOrder(p, s.id, current.version, randomUUID());
  const providerId = "order_" + randomUUID().replaceAll("-", ""),
    paymentId = "pay_" + randomUUID().replaceAll("-", "");
  await pool.query(
    "UPDATE payments SET provider_order_id=$2,state='ready' WHERE order_id=$1",
    [order.id, providerId],
  );
  const fetchPayment = async () => ({
    id: paymentId,
    order_id: providerId,
    status: "captured",
    amount: Number(q.totalMinor),
    currency: "INR",
  });
  const name = "test_block_" + randomUUID().replaceAll("-", "");
  await pool.query(
    `CREATE FUNCTION ${name}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.id='${order.id}' AND NEW.confirmed_at IS NOT NULL THEN RAISE EXCEPTION 'Injected finalization failure'; END IF; RETURN NEW; END $$`,
  );
  await pool.query(
    `CREATE TRIGGER ${name} BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION ${name}()`,
  );
  try {
    await assert.rejects(
      () => processCapture(paymentId, undefined, fetchPayment),
      /Injected finalization/,
    );
    assert.deepEqual(await checkout.listOrders(p), []);
    assert.equal(
      (
        await pool.query(
          "SELECT count(*) FROM payment_captures WHERE provider_payment_id=$1",
          [paymentId],
        )
      ).rows[0].count,
      "0",
    );
    assert.equal(
      (
        await pool.query("SELECT on_hand FROM inventory WHERE variant_id=$1", [
          v.variantId,
        ])
      ).rows[0].on_hand,
      2,
    );
  } finally {
    await pool.query(`DROP TRIGGER ${name} ON orders`);
    await pool.query(`DROP FUNCTION ${name}()`);
  }
  await processCapture(paymentId, undefined, fetchPayment);
  assert.equal((await checkout.listOrders(p)).length, 1);
  assert.equal((await checkout.getOrder(p, order.id)).payment_status, "paid");
  assert.equal(
    (
      await pool.query("SELECT on_hand FROM inventory WHERE variant_id=$1", [
        v.variantId,
      ])
    ).rows[0].on_hand,
    1,
  );
});

test("webhook signatures reject tampering and signed replay is deduplicated", async () => {
  const secret = (process.env.RAZORPAY_WEBHOOK_SECRET = "test_webhook"),
    raw = Buffer.from(
      JSON.stringify({
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_Test123" } } },
      }),
    ),
    signature = createHmac("sha256", secret).update(raw).digest("hex"),
    eventId = "test-" + randomUUID();
  verifyWebhook(raw, signature);
  assert.throws(() => verifyWebhook(Buffer.from("{}"), signature));
  function req() {
    return new Request("http://localhost/api/v1/webhooks/razorpay", {
      method: "POST",
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": eventId,
      },
      body: raw,
    });
  }
  await webhook(req());
  await webhook(req());
  assert.equal(
    (
      await pool.query("SELECT count(*) FROM jobs WHERE dedupe_key=$1", [
        "capture:" + eventId,
      ])
    ).rows[0].count,
    "1",
  );
});
