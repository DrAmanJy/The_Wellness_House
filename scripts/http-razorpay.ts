import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { pool } from "../server/db";
import { hash, token } from "../server/security/crypto";
import { cookieName } from "../server/security/http";
import { razorpay } from "../server/modules/commerce/provider";
import { expireOrders } from "../server/modules/commerce/service";

const base = process.env.SMOKE_ORIGIN || "http://localhost:3100";
if (
  ![new URL(base).hostname, new URL(process.env.DATABASE_URL!).hostname].every(
    (h) => ["localhost", "127.0.0.1"].includes(h),
  ) ||
  !process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_")
)
  throw new Error(
    "This provider check requires a loopback app/database and Razorpay test keys",
  );
const productionCookies = new URL(base).port === "3100";
const name = (key: string) =>
  productionCookies ? "__Host-twh_" + key : cookieName(key);
const jar = new Map<string, string>();
let userId: string | undefined, orderId: string | undefined;
async function request(
  path: string,
  method = "GET",
  data?: unknown,
  key?: string,
  expected = 200,
): Promise<any> {
  let csrf: string | undefined;
  if (method !== "GET") csrf = (await request("csrf")).token;
  const res = await fetch(base + "/api/v1/" + path, {
    method,
    headers: {
      cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "),
      origin: base,
      "content-type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
      ...(key ? { "idempotency-key": key } : {}),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  for (const value of res.headers.getSetCookie()) {
    const pair = value.split(";")[0],
      i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
  const value = await res.json();
  assert.equal(
    res.status,
    expected,
    `${method} ${path}: ${value.code || "unexpected status"}`,
  );
  return value;
}
try {
  userId = (
    await pool.query(
      "INSERT INTO users(display_name,contact_email) VALUES('Razorpay test fixture','razorpay-fixture@example.invalid') RETURNING id",
    )
  ).rows[0].id;
  const session = token();
  await pool.query(
    "INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '10 minutes')",
    [hash(session), userId],
  );
  jar.set(name("session"), session);
  const variant = (
    await pool.query(
      "SELECT v.id FROM product_variants v JOIN inventory i ON i.variant_id=v.id JOIN content_entities e ON e.id=v.product_id WHERE v.active AND v.price_minor>=100 AND i.on_hand-i.reserved>0 AND e.live_revision_id IS NOT NULL AND e.lifecycle='active' ORDER BY v.id LIMIT 1",
    )
  ).rows[0];
  assert(variant, "A priced, stocked, published product is required");
  const settings = (
    await pool.query("SELECT * FROM commerce_settings WHERE singleton")
  ).rows[0];
  assert(
    settings.enabled && settings.postal_prefixes.length,
    "Merchant ordering and delivery coverage must be configured",
  );
  const intent = await request("purchase-intents", "POST", {
    mode: "buy_now",
    variantId: variant.id,
    quantity: 1,
  });
  const checkoutId = new URL(intent.url, base).searchParams.get("session")!;
  const checkout = await request("checkout-sessions/" + checkoutId);
  assert(checkout.paymentConfigured);
  await request("checkout-sessions/" + checkoutId, "PATCH", {
    version: checkout.version,
    shipping: {
      label: "Test",
      recipient: "Payment Fixture",
      phone: "+91 9876543210",
      line1: "Test fixture address",
      line2: "",
      landmark: "",
      city: "Test",
      region: "Test",
      postal_code: settings.postal_prefixes[0].padEnd(6, "0"),
      country_code: "IN",
    },
  });
  const quote = await request(
    "checkout-sessions/" + checkoutId + "/quote",
    "POST",
  );
  const fresh = await request("checkout-sessions/" + checkoutId),
    key = randomUUID();
  const order = await request(
    "checkout-sessions/" + checkoutId + "/payment-attempts",
    "POST",
    { version: fresh.version },
    key,
    201,
  );
  assert.equal(order.orderId, null);
  assert.match(order.payment.orderId, /^order_/);
  assert.equal(order.payment.amount, quote.totalMinor);
  orderId = (
    await pool.query("SELECT id FROM orders WHERE checkout_id=$1", [checkoutId])
  ).rows[0].id;
  const repeat = await request(
    "checkout-sessions/" + checkoutId + "/payment-attempts",
    "POST",
    { version: fresh.version },
    key,
    201,
  );
  assert.equal(repeat.payment.orderId, order.payment.orderId);
  assert.equal((await request("me/orders")).length, 0);
  await request("me/orders/" + orderId, "GET", undefined, undefined, 404);
  const unpaidPage = await fetch(base + "/account/orders/" + orderId, {
    headers: { cookie: [...jar].map(([k, v]) => k + "=" + v).join("; ") },
    redirect: "manual",
  });
  assert.equal(unpaidPage.status, 404);
  const external = await razorpay("orders/" + order.payment.orderId);
  assert.equal(external.amount, Number(quote.totalMinor));
  assert.equal(external.currency, "INR");
  await request(
    "checkout-sessions/" + checkoutId + "/confirm-payment",
    "POST",
    {},
    undefined,
    400,
  );
  await request(
    "checkout-sessions/" + checkoutId + "/confirm-payment",
    "POST",
    {
      orderId: order.payment.orderId,
      paymentId: "pay_Forged123",
      signature: "0".repeat(64),
    },
    undefined,
    400,
  );
  assert.equal(
    (await request("checkout-sessions/" + checkoutId + "/payment-status"))
      .state,
    "pending",
  );
  assert.equal((await request("me/orders")).length, 0);
  console.log(
    "Razorpay test API checks passed: authenticated checkout, real provider order, authoritative totals, idempotent retry, missing/forged signature rejection. No payment collected.",
  );
} finally {
  if (userId) {
    // Preserve the financial audit record but release this unpaid fixture's reservation.
    await pool.query(
      "UPDATE orders SET expires_at=now()-interval '1 second' WHERE user_id=$1 AND payment_status='pending'",
      [userId],
    );
    await expireOrders();
    await pool.query("UPDATE sessions SET revoked_at=now() WHERE user_id=$1", [
      userId,
    ]);
  }
  await pool.end();
}
