import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../server/db";
import { token, hash } from "../server/security/crypto";
const base = process.env.SMOKE_ORIGIN || "http://localhost:3100";
if (
  !["127.0.0.1", "localhost"].includes(
    new URL(process.env.DATABASE_URL!).hostname,
  )
)
  throw new Error("HTTP fixtures require a local database");
class Browser {
  cookies = new Map<string, string>();
  async request(
    path: string,
    method = "GET",
    value?: unknown,
    status = 200,
    key?: string,
  ) {
    if (method !== "GET") {
      const csrf = await this.request("csrf");
      this.cookies.set("_csrf-token", csrf.token);
    }
    const r = await fetch(base + "/api/v1/" + path, {
      method,
      redirect: "manual",
      headers: {
        cookie: [...this.cookies]
          .filter(([k]) => k !== "_csrf-token")
          .map(([k, v]) => k + "=" + v)
          .join("; "),
        origin: base,
        "content-type": "application/json",
        ...(method !== "GET"
          ? { "x-csrf-token": this.cookies.get("_csrf-token")! }
          : {}),
        ...(key ? { "idempotency-key": key } : {}),
      },
      body: value === undefined ? undefined : JSON.stringify(value),
    });
    for (const cookie of r.headers.getSetCookie()) {
      const pair = cookie.split(";")[0],
        i = pair.indexOf("=");
      this.cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    const result = await r.json();
    assert.equal(
      r.status,
      status,
      `${method} ${path}: ${JSON.stringify(result)}`,
    );
    assert.match(r.headers.get("cache-control") || "", /no-store/);
    return result;
  }
}
const users: string[] = [];
async function account() {
  const id = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Customer HTTP fixture',$1) RETURNING id",
      ["http-" + randomUUID() + "@example.invalid"],
    )
  ).rows[0].id;
  users.push(id);
  const raw = token();
  await pool.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
    [hash(raw), id],
  );
  const browser = new Browser();
  browser.cookies.set("__Host-twh_session", raw);
  return { id, browser };
}
try {
  const a = await account(),
    b = await account(),
    guest = new Browser();
  await guest.request("health/fake", "GET", undefined, 404);
  await guest.request("me/profile/ignored", "GET", undefined, 404);
  await guest.request("cart", "POST", {}, 405);
  await guest.request("saved-rituals", "PATCH", {}, 405);
  await guest.request("admin/redirects", "DELETE", {}, 405);
  await guest.request(
    "checkout-sessions/" + randomUUID() + "/orders",
    "POST",
    {},
    404,
  );
  await guest.request(
    "me/orders/" + randomUUID() + "/confirm-payment",
    "POST",
    {},
    404,
  );
  await a.browser.request("mfa/register/options", "POST", {}, 403);
  const variants = await guest.request("variants/metabolic-balance-protocol"),
    variant = variants.find((v: any) => v.supplyCode === "standard-30");
  assert(variant);
  const accountBag = await a.browser.request("cart");
  await a.browser.request("cart/items/" + variant.id, "POST", {
    quantity: 2,
    operationId: randomUUID(),
    cartId: accountBag.id,
  });
  const source = await guest.request("cart"),
    op = randomUUID();
  const added = await guest.request("cart/items/" + variant.id, "POST", {
    quantity: 1,
    operationId: op,
    cartId: source.id,
  });
  const repeated = await guest.request("cart/items/" + variant.id, "POST", {
    quantity: 1,
    operationId: op,
    cartId: source.id,
  });
  assert.equal(added.items[0].quantity, 1);
  assert.equal(repeated.items[0].quantity, 1);
  const intent = await guest.request("purchase-intents", "POST", {
    mode: "cart",
    cartVersion: added.version,
  });
  assert.equal(intent.requiresAuth, true);
  const secondTabIntent = await guest.request("purchase-intents", "POST", {
    mode: "buy_now",
    variantId: variant.id,
    quantity: 1,
  });
  await guest.request(
    "checkout-sessions/" + randomUUID(),
    "GET",
    undefined,
    401,
  );
  guest.cookies.set(
    "__Host-twh_session",
    a.browser.cookies.get("__Host-twh_session")!,
  );
  const resumed = await guest.request(
    "purchase-intents/" + intent.intentId + "/resume",
    "POST",
  );
  assert.match(resumed.url, /^\/checkout\?session=/);
  const second = await guest.request(
    "purchase-intents/" + intent.intentId + "/resume",
    "POST",
  );
  assert.equal(second.url, resumed.url);
  const merged = await guest.request("cart");
  assert.equal(
    merged.items.filter((i: any) => i.variantId === variant.id).length,
    1,
  );
  assert.equal(
    merged.items.find((i: any) => i.variantId === variant.id).quantity,
    3,
  );
  await guest.request(
    "cart/items/" + variant.id,
    "POST",
    { quantity: 1, operationId: randomUUID(), cartId: source.id },
    409,
  );
  const checkoutId = new URL(resumed.url, base).searchParams.get("session")!;
  const selection = await guest.request("checkout-sessions/" + checkoutId);
  assert.equal(selection.items[0].quantity, 3);
  const secondTab = await guest.request(
    "purchase-intents/" + secondTabIntent.intentId + "/resume",
    "POST",
  );
  const secondSelection = await guest.request(
    "checkout-sessions/" +
      new URL(secondTab.url, base).searchParams.get("session"),
  );
  assert.equal(secondSelection.mode, "buy_now");
  assert.equal(secondSelection.items[0].quantity, 1);
  await b.browser.request(
    "checkout-sessions/" + checkoutId,
    "GET",
    undefined,
    404,
  );
  const address = {
    label: "HTTP test",
    recipient: "Customer Test",
    phone: "+91 9876543210",
    line1: "HTTP fixture address",
    line2: "",
    landmark: "",
    city: "New Delhi",
    region: "Delhi",
    postal_code: "110001",
    country_code: "IN",
  };
  const saved = await guest.request(
    "me/addresses",
    "POST",
    { address, makeDefault: true },
    201,
  );
  await b.browser.request(
    "me/addresses/" + saved.id,
    "PATCH",
    { address, version: saved.version },
    404,
  );
  await guest.request("checkout-sessions/" + checkoutId, "PATCH", {
    version: selection.version,
    addressId: saved.id,
  });
  const stored = await guest.request("checkout-sessions/" + checkoutId);
  assert.equal(stored.shipping_address.line1, address.line1);
  const direct = await guest.request("purchase-intents", "POST", {
    mode: "buy_now",
    variantId: variant.id,
    quantity: 1,
  });
  assert.equal(direct.requiresAuth, false);
  assert.equal(
    (await guest.request("cart")).items.find(
      (i: any) => i.variantId === variant.id,
    ).quantity,
    3,
  );
  const page = await fetch(base + "/checkout", { redirect: "manual" });
  assert.equal(page.status, 303);
  assert.match(page.headers.get("location") || "", /^\/account/);
  assert.match(page.headers.get("x-robots-tag") || "", /noindex/);
  await guest.request("auth/dev-login", "POST", {}, 404);
  await guest.request("auth/dev-stepup", "POST", {}, 404);
  const confirmationPath =
    "checkout-sessions/" + randomUUID() + "/confirm-payment";
  const confirmation = {
    paymentId: "pay_Test123",
    orderId: "order_Test123",
    signature: "0".repeat(64),
  };
  await guest.request(confirmationPath, "POST", confirmation, 404);
  await guest.request(
    confirmationPath,
    "POST",
    { ...confirmation, paymentId: "../../orders" },
    400,
  );
  await guest.request(confirmationPath, "POST", {}, 400);
  const csrfRejected = await fetch(base + "/api/v1/" + confirmationPath, {
    method: "POST",
    headers: {
      origin: "https://attacker.example",
      "content-type": "application/json",
    },
    body: JSON.stringify(confirmation),
  });
  assert.equal(csrfRejected.status, 403);
  await guest.request("logout", "POST");
  assert.equal(await guest.request("me"), null);
  assert.equal((await guest.request("cart")).items.length, 0);
  await guest.request("me/addresses", "GET", undefined, 401);
  await guest.request(confirmationPath, "POST", confirmation, 401);
  const again = token();
  await pool.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",
    [hash(again), a.id],
  );
  a.browser.cookies.set("__Host-twh_session", again);
  assert.equal(
    (await a.browser.request("cart")).items.find(
      (i: any) => i.variantId === variant.id,
    ).quantity,
    3,
  );
  console.log(
    "Customer HTTP checks passed: login gate, exact-once merge, stale-cart isolation, owned checkout/addresses, Buy Now preservation, logout and production bypass rejection.",
  );
} finally {
  await pool.query(
    "UPDATE sessions SET revoked_at=now() WHERE user_id=ANY($1::uuid[])",
    [users],
  );
  await pool.query(
    "UPDATE addresses SET archived_at=now() WHERE user_id=ANY($1::uuid[])",
    [users],
  );
  await pool.end();
}
