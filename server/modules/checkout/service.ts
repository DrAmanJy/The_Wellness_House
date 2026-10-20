import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PoolClient } from "pg";
import { pool, transaction } from "../../db";
import { hash } from "../../security/crypto";
import { AppError } from "../../security/http";
import type { Principal } from "../../security/session";
import { addressSchema } from "../customers/schemas";
import { cart, assertCart } from "../cart/service";
export const intentSchema = z.discriminatedUnion("mode", [
  z
    .object({
      mode: z.literal("buy_now"),
      variantId: z.string().uuid(),
      quantity: z.number().int().min(1).max(99),
    })
    .strict(),
  z
    .object({
      mode: z.literal("cart"),
      cartVersion: z.number().int().nonnegative(),
    })
    .strict(),
]);
export async function variants(slug: string) {
  return (
    await pool.query(
      "SELECT v.id,v.title,v.supply_code AS \"supplyCode\",v.price_minor AS \"priceMinor\",v.currency,v.active FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE e.slug=$1 AND e.kind='products' AND e.live_revision_id IS NOT NULL AND e.lifecycle='active' AND v.active ORDER BY v.supply_code DESC",
      [slug],
    )
  ).rows;
}
export async function createIntent(
  p: Principal | null,
  guest: string,
  capability: string,
  input: unknown,
) {
  const v = intentSchema.parse(input);
  const cartId = v.mode === "cart" ? await cart(p, guest) : null;
  return transaction(async (c) => {
    if (cartId) {
      const current = await assertCart(c, cartId);
      if (v.mode === "cart" && current.version !== v.cartVersion)
        throw new AppError(
          409,
          "CART_VERSION",
          "Your bag changed. Refresh before continuing",
        );
      if (
        !(await c.query("SELECT 1 FROM cart_items WHERE cart_id=$1", [cartId]))
          .rowCount
      )
        throw new AppError(422, "EMPTY_CART", "Your bag is empty");
    } else if (
      !(
        await c.query(
          "SELECT 1 FROM product_variants v JOIN content_entities e ON e.id=v.product_id WHERE v.id=$1 AND v.active AND e.live_revision_id IS NOT NULL AND e.lifecycle='active'",
          [v.mode === "buy_now" ? v.variantId : null],
        )
      ).rowCount
    )
      throw new AppError(404, "PRODUCT", "Product unavailable");
    return (
      await c.query(
        "INSERT INTO purchase_intents(user_id,capability_hash,mode,variant_id,quantity,cart_id,cart_version) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,expires_at",
        [
          p?.userId,
          hash(capability),
          v.mode,
          v.mode === "buy_now" ? v.variantId : null,
          v.mode === "buy_now" ? v.quantity : null,
          cartId,
          v.mode === "cart" ? v.cartVersion : null,
        ],
      )
    ).rows[0];
  });
}
export async function authorizeIntent(
  p: Principal | null,
  id: string,
  capability: string,
) {
  const i = (
    await pool.query(
      "SELECT * FROM purchase_intents WHERE id=$1 AND expires_at>now()",
      [id],
    )
  ).rows[0];
  if (
    !i ||
    (i.user_id
      ? i.user_id !== p?.userId
      : i.capability_hash !== hash(capability))
  )
    throw new AppError(
      404,
      "INTENT",
      "Purchase selection expired or unavailable",
    );
  return i;
}
export async function resume(
  p: Principal,
  id: string,
  capability?: string,
  oauthAuthorized = false,
) {
  if (!oauthAuthorized) await authorizeIntent(p, id, capability || "");
  return transaction(async (c) => {
    const intent = (
      await c.query("SELECT * FROM purchase_intents WHERE id=$1 FOR UPDATE", [
        id,
      ])
    ).rows[0];
    if (
      !intent ||
      intent.expires_at <= new Date() ||
      (intent.user_id && intent.user_id !== p.userId)
    )
      throw new AppError(
        404,
        "INTENT",
        "Purchase selection expired or unavailable",
      );
    const existing = (
      await c.query(
        "SELECT id FROM checkout_sessions WHERE intent_id=$1 AND user_id=$2",
        [id, p.userId],
      )
    ).rows[0];
    if (existing) return existing;
    let items: unknown[],
      cartId = null;
    if (intent.mode === "cart") {
      cartId = await cart(p, "");
      await assertCart(c, cartId);
      items = (
        await c.query(
          'SELECT variant_id AS "variantId",quantity,line_id AS "lineId",total_added::text AS "totalAdded" FROM cart_items WHERE cart_id=$1 ORDER BY variant_id',
          [cartId],
        )
      ).rows;
    } else
      items = [{ variantId: intent.variant_id, quantity: intent.quantity }];
    if (!items.length)
      throw new AppError(422, "EMPTY_CART", "Your bag is empty");
    await c.query("UPDATE purchase_intents SET user_id=$2 WHERE id=$1", [
      id,
      p.userId,
    ]);
    return (
      await c.query(
        "INSERT INTO checkout_sessions(user_id,intent_id,mode,cart_id,items) VALUES($1,$2,$3,$4,$5) RETURNING id",
        [p.userId, id, intent.mode, cartId, JSON.stringify(items)],
      )
    ).rows[0];
  });
}
export async function getCheckout(p: Principal, id: string) {
  const row = (
    await pool.query(
      "SELECT * FROM checkout_sessions WHERE id=$1 AND user_id=$2",
      [id, p.userId],
    )
  ).rows[0];
  if (!row) throw new AppError(404, "CHECKOUT", "Checkout not found");
  const lines = await pool.query(
    "SELECT v.id,v.title,v.supply_code,v.price_minor,v.currency,e.slug,r.content->>'imageUrl' AS image_url,coalesce(r.content->>'title',v.title) AS product_title,(v.active AND e.live_revision_id IS NOT NULL AND e.lifecycle='active') AS available FROM product_variants v JOIN content_entities e ON e.id=v.product_id LEFT JOIN content_revisions r ON r.id=e.live_revision_id WHERE v.id=ANY($1::uuid[])",
    [row.items.map((i: any) => i.variantId)],
  );
  const settings = (
    await pool.query("SELECT enabled FROM commerce_settings WHERE singleton")
  ).rows[0];
  return {
    ...row,
    items: row.items.map((i: any) => ({
      ...i,
      ...lines.rows.find((v) => v.id === i.variantId),
    })),
    paymentConfigured: !!(
      settings.enabled &&
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET
    ),
    order:
      (
        await pool.query(
          "SELECT id FROM orders WHERE checkout_id=$1 AND confirmed_at IS NOT NULL",
          [id],
        )
      ).rows[0] || null,
    paymentAttempt: row.state === "ordered",
  };
}
export async function updateCheckout(
  p: Principal,
  id: string,
  input: {
    version: number;
    addressId?: string;
    shipping?: unknown;
    billing?: unknown;
  },
) {
  return transaction(async (c) => {
    const row = (
      await c.query(
        "SELECT * FROM checkout_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE",
        [id, p.userId],
      )
    ).rows[0];
    if (!row) throw new AppError(404, "CHECKOUT", "Checkout not found");
    if (row.state !== "open" || row.version !== input.version)
      throw new AppError(409, "VERSION", "Checkout changed. Reload first");
    let shipping = input.shipping;
    if (input.addressId) {
      shipping = (
        await c.query(
          "SELECT label,recipient,phone,line1,line2,landmark,city,region,postal_code,country_code FROM addresses WHERE id=$1 AND user_id=$2 AND archived_at IS NULL",
          [input.addressId, p.userId],
        )
      ).rows[0];
      if (!shipping) throw new AppError(404, "ADDRESS", "Address not found");
    }
    const address = addressSchema.parse(shipping);
    const billing = input.billing
      ? addressSchema.parse(input.billing)
      : address;
    await c.query(
      "UPDATE checkout_sessions SET shipping_address=$3,billing_address=$4,version=version+1,quote=NULL,quote_expires_at=NULL,expires_at=now()+interval '30 minutes' WHERE id=$1 AND user_id=$2",
      [id, p.userId, JSON.stringify(address), JSON.stringify(billing)],
    );
    return { saved: true };
  });
}
export async function calculate(c: PoolClient, checkout: any) {
  if (!checkout.shipping_address)
    throw new AppError(422, "ADDRESS_REQUIRED", "Choose a delivery address");
  const settings = (
    await c.query("SELECT * FROM commerce_settings WHERE singleton FOR SHARE")
  ).rows[0];
  if (
    !settings.postal_prefixes.some((prefix: string) =>
      checkout.shipping_address.postal_code.startsWith(prefix),
    )
  )
    throw new AppError(
      422,
      "NOT_SERVICEABLE",
      "Delivery is not configured for this PIN code. Contact us for assistance.",
    );
  if (settings.shipping_minor === null || settings.tax_basis_points === null)
    throw new AppError(
      422,
      "COMMERCE_SETUP",
      "Shipping and tax settings require approval",
    );
  let subtotal = 0n;
  const items = [];
  for (const line of checkout.items) {
    const v = (
      await c.query(
        "SELECT v.*,e.live_revision_id,e.lifecycle,coalesce(i.on_hand-i.reserved,0) AS available FROM product_variants v JOIN content_entities e ON e.id=v.product_id LEFT JOIN inventory i ON i.variant_id=v.id WHERE v.id=$1",
        [line.variantId],
      )
    ).rows[0];
    if (
      !v ||
      !v.active ||
      !v.live_revision_id ||
      v.lifecycle !== "active" ||
      v.price_minor === null ||
      v.currency !== "INR"
    )
      throw new AppError(
        422,
        "PRODUCT_UNAVAILABLE",
        "A selected supply does not have an approved price or is unavailable",
      );
    if (v.available < line.quantity)
      throw new AppError(
        409,
        "STOCK",
        "A selected supply does not have enough available stock",
      );
    subtotal += BigInt(v.price_minor) * BigInt(line.quantity);
    items.push({
      variantId: v.id,
      sku: v.sku,
      title: v.title,
      quantity: line.quantity,
      priceMinor: v.price_minor,
      version: v.version,
    });
  }
  const shipping = BigInt(settings.shipping_minor),
    tax = (subtotal * BigInt(settings.tax_basis_points) + 5000n) / 10000n,
    total = subtotal + shipping + tax;
  if (total < 100n)
    throw new AppError(
      400,
      "PAYMENT_AMOUNT",
      "Order total must be at least ₹1 (100 paise)",
    );
  if (total > 9007199254740991n)
    throw new AppError(
      422,
      "TOTAL",
      "Order total exceeds the supported payment range",
    );
  return {
    items,
    subtotalMinor: subtotal.toString(),
    shippingMinor: shipping.toString(),
    taxMinor: tax.toString(),
    totalMinor: total.toString(),
    currency: "INR",
    settingsVersion: settings.version,
  };
}
export async function quote(p: Principal, id: string) {
  return transaction(async (c) => {
    const checkout = (
      await c.query(
        "SELECT * FROM checkout_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE",
        [id, p.userId],
      )
    ).rows[0];
    if (!checkout) throw new AppError(404, "CHECKOUT", "Checkout not found");
    if (checkout.state !== "open" || checkout.expires_at <= new Date())
      throw new AppError(
        409,
        "CHECKOUT_EXPIRED",
        "Checkout expired. Save your address again to refresh it",
      );
    const result = await calculate(c, checkout);
    await c.query(
      "UPDATE checkout_sessions SET quote=$3,quote_expires_at=now()+interval '5 minutes',version=version+1 WHERE id=$1 AND user_id=$2",
      [id, p.userId, JSON.stringify(result)],
    );
    return result;
  });
}
export async function placeOrder(
  p: Principal,
  id: string,
  version: number,
  key: string,
) {
  return transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      "order:" + p.userId + ":" + key,
    ]);
    const prior = (
      await c.query(
        "SELECT request_hash,response_body FROM idempotency_keys WHERE scope=$1 AND key=$2",
        ["order:" + p.userId, key],
      )
    ).rows[0];
    if (prior) {
      if (prior.request_hash !== hash(id))
        throw new AppError(
          409,
          "IDEMPOTENCY",
          "This request key belongs to a different checkout",
        );
      return prior.response_body;
    }
    const checkout = (
      await c.query(
        "SELECT * FROM checkout_sessions WHERE id=$1 AND user_id=$2 FOR UPDATE",
        [id, p.userId],
      )
    ).rows[0];
    if (!checkout) throw new AppError(404, "CHECKOUT", "Checkout not found");
    const existing = (
      await c.query(
        "SELECT id FROM orders WHERE checkout_id=$1 AND user_id=$2",
        [id, p.userId],
      )
    ).rows[0];
    if (existing) return existing;
    const settings = (
      await c.query("SELECT enabled FROM commerce_settings WHERE singleton")
    ).rows[0];
    if (
      !settings.enabled ||
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      !process.env.RAZORPAY_WEBHOOK_SECRET
    )
      throw new AppError(
        503,
        "PAYMENTS_UNAVAILABLE",
        "Online ordering is not yet enabled. Your selection and address are saved.",
      );
    if (
      checkout.version !== version ||
      !checkout.quote ||
      checkout.quote_expires_at <= new Date() ||
      checkout.expires_at <= new Date()
    )
      throw new AppError(
        409,
        "QUOTE_EXPIRED",
        "Review a fresh quote before placing your order",
      );
    const variantIds = checkout.items.map((i: any) => i.variantId).sort();
    await c.query(
      "SELECT id FROM product_variants WHERE id=ANY($1::uuid[]) ORDER BY id FOR SHARE",
      [variantIds],
    );
    await c.query(
      "SELECT variant_id FROM inventory WHERE variant_id=ANY($1::uuid[]) ORDER BY variant_id FOR UPDATE",
      [variantIds],
    );
    const current = await calculate(c, checkout);
    if (JSON.stringify(current) !== JSON.stringify(checkout.quote)) {
      // JSONB key order differs from JS insertion order; compare canonical content.
      if (hash(canonical(current)) !== hash(canonical(checkout.quote)))
        throw new AppError(
          409,
          "PRICE_CHANGED",
          "Prices changed. Review a fresh quote",
        );
    }
    const email = (
      await c.query("SELECT contact_email FROM users WHERE id=$1", [p.userId])
    ).rows[0].contact_email;
    if (!email)
      throw new AppError(
        422,
        "EMAIL_REQUIRED",
        "Add a contact email in your profile",
      );
    const orderId = randomUUID(),
      reference =
        "TWH-" + orderId.replaceAll("-", "").slice(0, 16).toUpperCase();
    await c.query(
      "INSERT INTO orders(id,public_reference,user_id,checkout_id,email_snapshot,shipping_address,billing_address,currency,subtotal_minor,shipping_minor,tax_minor,total_minor) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
      [
        orderId,
        reference,
        p.userId,
        id,
        email,
        checkout.shipping_address,
        checkout.billing_address,
        "INR",
        current.subtotalMinor,
        current.shippingMinor,
        current.taxMinor,
        current.totalMinor,
      ],
    );
    for (const line of current.items) {
      await c.query(
        "INSERT INTO order_items(order_id,variant_id,sku_snapshot,title_snapshot,quantity,unit_price_minor) VALUES($1,$2,$3,$4,$5,$6)",
        [
          orderId,
          line.variantId,
          line.sku,
          line.title,
          line.quantity,
          line.priceMinor,
        ],
      );
      const stock = await c.query(
        "UPDATE inventory SET reserved=reserved+$2 WHERE variant_id=$1 AND on_hand-reserved>=$2",
        [line.variantId, line.quantity],
      );
      if (!stock.rowCount)
        throw new AppError(
          409,
          "STOCK",
          "Stock changed. Please review your order",
        );
      await c.query(
        "INSERT INTO stock_reservations VALUES($1,$2,$3,'active')",
        [orderId, line.variantId, line.quantity],
      );
    }
    await c.query("INSERT INTO payments(order_id) VALUES($1)", [orderId]);
    await c.query(
      "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3)",
      ["payment-initiate", JSON.stringify({ orderId }), `payment:${orderId}`],
    );
    await c.query(
      "UPDATE checkout_sessions SET state='ordered',version=version+1 WHERE id=$1",
      [id],
    );
    const result = { id: orderId };
    await c.query(
      "INSERT INTO idempotency_keys(scope,key,request_hash,response_body) VALUES($1,$2,$3,$4)",
      ["order:" + p.userId, key, hash(id), JSON.stringify(result)],
    );
    return result;
  });
}
function canonical(value: any): string {
  return JSON.stringify(value, (_, v) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? Object.keys(v)
          .sort()
          .reduce((o: any, k) => ((o[k] = v[k]), o), {})
      : v,
  );
}
export async function getOrder(p: Principal, id: string) {
  const o = (
    await pool.query(
      "SELECT * FROM orders WHERE id=$1 AND user_id=$2 AND confirmed_at IS NOT NULL",
      [id, p.userId],
    )
  ).rows[0];
  if (!o) throw new AppError(404, "ORDER", "Order not found");
  const payment = (
    await pool.query(
      "SELECT state,provider_order_id FROM payments WHERE order_id=$1",
      [id],
    )
  ).rows[0];
  return {
    ...o,
    paymentState: payment?.state || null,
    items: (
      await pool.query(
        "SELECT title_snapshot,quantity,unit_price_minor FROM order_items WHERE order_id=$1 ORDER BY id",
        [id],
      )
    ).rows,
    payment:
      payment?.state === "ready" &&
      o.payment_status === "pending" &&
      o.expires_at > new Date()
        ? {
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: payment.provider_order_id,
            amount: o.total_minor,
            currency: o.currency,
          }
        : null,
  };
}
export async function listOrders(p: Principal, after = "") {
  return (
    await pool.query(
      "SELECT id,public_reference,currency,total_minor,payment_status,fulfillment_status,created_at,confirmed_at FROM orders WHERE user_id=$1 AND confirmed_at IS NOT NULL AND id::text>$2 ORDER BY id LIMIT 50",
      [p.userId, after],
    )
  ).rows;
}
