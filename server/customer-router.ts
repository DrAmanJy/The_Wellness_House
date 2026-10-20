import {
  purchaseCookie,
  clearPurchaseCookies,
} from "./modules/identity/purchase-cookies";
import { z } from "zod";
import { pool, transaction } from "./db";
import { type Principal, authenticated, authorize } from "./security/session";
import {
  AppError,
  body,
  json,
  cookie,
  cookieValue,
  limit,
} from "./security/http";
import { token, hash } from "./security/crypto";
import * as customers from "./modules/customers/service";
import * as carts from "./modules/cart/service";
import * as checkout from "./modules/checkout/service";
import * as checkoutPayments from "./modules/checkout/payments";
const uuid = z.string().uuid(),
  version = z.number().int().nonnegative();
async function paymentInput(req: Request) {
  const parsed = z
    .object({
      paymentId: z.string().regex(/^pay_[A-Za-z0-9]{1,100}$/),
      orderId: z.string().regex(/^order_[A-Za-z0-9]{1,100}$/),
      signature: z.string().regex(/^[a-f0-9]{64}$/i),
    })
    .strict()
    .safeParse(await body(req, z.unknown()));
  if (!parsed.success)
    throw new AppError(
      400,
      "PAYMENT_FIELDS",
      "Provide a valid payment ID, order ID and signature",
    );
  return parsed.data;
}
export async function customerRoute(
  req: Request,
  path: string[],
  p: Principal | null,
): Promise<Response | null> {
  const [area, id, action] = path,
    method = req.method;
  if (area === "variants" && method === "GET") {
    return json(await checkout.variants(z.string().max(120).parse(id)));
  }
  if (area === "cart") {
    await limit(req, "cart", 120, p?.userId);
    let guest = cookieValue(req, "guest") || token();
    let cartId: string;
    try {
      cartId = await carts.cart(p, guest);
    } catch (e) {
      if (
        !p &&
        method === "GET" &&
        e instanceof AppError &&
        e.code === "GUEST_CART_CONSUMED"
      ) {
        guest = token();
        cartId = await carts.cart(null, guest);
      } else throw e;
    }
    let result;
    if (method === "GET" && !id) result = await carts.snapshot(cartId);
    else if (method === "POST" && id === "merge") {
      authenticated(p);
      await carts.merge(p, guest);
      result = await carts.snapshot(cartId);
      guest = token();
    } else if (
      id === "items" &&
      action &&
      ["POST", "PUT", "DELETE"].includes(method)
    ) {
      uuid.parse(action);
      const input = await body(
        req,
        z
          .object({
            quantity: z.number().int().min(0).max(99),
            expectedVersion: version.optional(),
            cartId: uuid,
            operationId: uuid,
          })
          .strict(),
      );
      if (input.cartId !== cartId)
        throw new AppError(
          409,
          "CART_OWNER_CHANGED",
          "Your account changed. Refresh the bag first",
        );
      if (method !== "POST" && input.expectedVersion === undefined)
        throw new AppError(
          422,
          "VERSION_REQUIRED",
          "Include the current bag version",
        );
      result = await carts.mutateItem(cartId, action, {
        ...input,
        quantity: method === "DELETE" ? 0 : input.quantity,
        increment: method === "POST",
      });
    } else if (method === "DELETE" && !id) {
      const input = await body(
        req,
        z.object({ expectedVersion: version, cartId: uuid }).strict(),
      );
      if (input.cartId !== cartId)
        throw new AppError(
          409,
          "CART_OWNER_CHANGED",
          "Refresh the bag after changing accounts",
        );
      result = await carts.clear(cartId, input.expectedVersion);
    } else throw new AppError(405, "METHOD", "Unsupported bag action");
    const response = json(result);
    response.headers.append("Set-Cookie", cookie("guest", guest, 2592000));
    return response;
  }
  if (area === "purchase-intents") {
    await limit(req, "purchase-intents", 30, p?.userId);
    let capability = id ? cookieValue(req, purchaseCookie(id)) : token(),
      guest = cookieValue(req, "guest") || token();
    let result;
    let cookieIntent = id;
    if (method === "POST" && !id) {
      const intent = await checkout.createIntent(
        p,
        guest,
        capability,
        await body(req, checkout.intentSchema),
      );
      cookieIntent = intent.id;
      const session = p
        ? await checkout.resume(p, intent.id, capability)
        : null;
      result = {
        intentId: intent.id,
        requiresAuth: !p,
        url: session
          ? "/checkout?session=" + session.id
          : "/account?intent=" + intent.id,
      };
    } else if (method === "POST" && action === "resume") {
      authenticated(p);
      uuid.parse(id);
      await checkout.authorizeIntent(p, id, capability);
      if (cookieValue(req, "guest")) await carts.merge(p, guest);
      const session = await checkout.resume(p, id, capability);
      result = { url: "/checkout?session=" + session.id };
      guest = token();
    } else throw new AppError(405, "METHOD", "Unsupported purchase action");
    const response = json(result);
    response.headers.append(
      "Set-Cookie",
      cookie(purchaseCookie(cookieIntent), capability, 1800),
    );
    response.headers.append("Set-Cookie", cookie("guest", guest, 2592000));
    return response;
  }
  if (area === "checkout-sessions") {
    authenticated(p);
    uuid.parse(id);
    if (method === "GET" && !action)
      return json(await checkout.getCheckout(p, id));
    if (method === "PATCH" && !action) {
      const input = await body(
        req,
        z
          .object({
            version,
            addressId: uuid.optional(),
            shipping: z.unknown().optional(),
            billing: z.unknown().optional(),
          })
          .strict(),
      );
      return json(await checkout.updateCheckout(p, id, input));
    }
    if (method === "POST" && action === "quote")
      return json(await checkout.quote(p, id));
    if (["GET", "POST"].includes(method) && action === "payment-status") {
      await limit(req, "payment-status", 60, p.userId);
      return json(
        await checkoutPayments.paymentStatus(p, id, method === "POST"),
      );
    }
    if (method === "POST" && action === "confirm-payment") {
      await limit(req, "payment-confirmation", 15, p.userId);
      return json(
        await checkoutPayments.confirmCheckoutPayment(
          p,
          id,
          await paymentInput(req),
        ),
      );
    }
    if (method === "POST" && action === "payment-attempts") {
      await limit(req, "orders", 10, p.userId);
      const input = await body(req, z.object({ version }).strict());
      return json(
        await checkoutPayments.startPayment(
          p,
          id,
          input.version,
          uuid.parse(req.headers.get("idempotency-key")),
        ),
        201,
      );
    }
    throw new AppError(405, "METHOD", "Unsupported checkout action");
  }
  if (
    area === "me" &&
    [
      "profile",
      "preferences",
      "addresses",
      "default-addresses",
      "sessions",
      "sign-out-all",
      "orders",
      "privacy-requests",
      "consents",
      "verify-contact",
    ].includes(id)
  ) {
    authenticated(p);
    if (method !== "GET") await limit(req, "account-write", 30, p.userId);
    if (id === "profile") {
      if (method === "GET") return json(await customers.profile(p));
      if (method === "PATCH")
        return json(
          await customers.saveProfile(p, await body(req, z.unknown())),
        );
    }
    if (id === "preferences") {
      if (method === "GET") return json(await customers.preferences(p));
      if (method === "PATCH")
        return json(
          await customers.savePreferences(p, await body(req, z.unknown())),
        );
    }
    if (id === "verify-contact" && method === "POST") {
      const input = await body(
        req,
        z.object({ token: z.string().max(100) }).strict(),
      );
      return json(await customers.verifyContact(p, input.token));
    }
    if (id === "addresses") {
      if (method === "GET" && !action)
        return json(await customers.addresses(p));
      if (method === "DELETE" && action)
        return json(await customers.deleteAddress(p, uuid.parse(action)));
      if (method === "POST" || method === "PATCH") {
        const input = await body(
          req,
          z
            .object({
              address: z.unknown(),
              version: version.optional(),
              makeDefault: z.boolean().default(false),
            })
            .strict(),
        );
        return json(
          await customers.saveAddress(
            p,
            input.address,
            action ? uuid.parse(action) : undefined,
            input.version,
            input.makeDefault,
          ),
          method === "POST" ? 201 : 200,
        );
      }
    }
    if (id === "default-addresses" && method === "PUT") {
      const input = await body(req, z.object({ addressId: uuid }).strict());
      return json(await customers.defaultAddress(p, input.addressId));
    }
    if (id === "sessions") {
      if (method === "GET")
        return json(
          (
            await pool.query(
              "SELECT id,created_at,last_seen_at,(id=$2) AS current FROM sessions WHERE user_id=$1 AND revoked_at IS NULL AND expires_at>now() ORDER BY last_seen_at DESC LIMIT 50",
              [p.userId, p.id],
            )
          ).rows,
        );
      if (method === "DELETE" && action) {
        customers.recent(p);
        const deleted = await pool.query(
          "UPDATE sessions SET revoked_at=now() WHERE id=$1 AND user_id=$2 RETURNING id",
          [uuid.parse(action), p.userId],
        );
        if (!deleted.rowCount)
          throw new AppError(404, "SESSION", "Session not found");
        return json({ revoked: true });
      }
    }
    if (id === "sign-out-all" && method === "POST") {
      customers.recent(p);
      await pool.query(
        "UPDATE sessions SET revoked_at=now() WHERE user_id=$1",
        [p.userId],
      );
      const r = json({ revoked: true });
      r.headers.append("Set-Cookie", cookie("session", "", 0));
      r.headers.append("Set-Cookie", cookie("guest", token(), 2592000));
      r.headers.append("Set-Cookie", cookie("purchase", "", 0));
      await clearPurchaseCookies(req, r);
      return r;
    }
    if (id === "orders" && method === "GET") {
      if (action) return json(await checkout.getOrder(p, uuid.parse(action)));
      const after = new URL(req.url).searchParams.get("after") || "";
      return json(await checkout.listOrders(p, after));
    }
    if (id === "privacy-requests") {
      if (method === "GET")
        return json(
          (
            await pool.query(
              "SELECT id,kind,status,created_at FROM privacy_requests WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
              [p.userId],
            )
          ).rows,
        );
      if (method === "POST") {
        customers.recent(p);
        const input = await body(
          req,
          z.object({ kind: z.enum(["export", "deletion"]) }).strict(),
        );
        return json(
          await transaction(async (c) => {
            await c.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
              p.userId,
            ]);
            const existing = (
              await c.query(
                "SELECT id FROM privacy_requests WHERE user_id=$1 AND kind=$2 AND status IN ('requested','processing')",
                [p.userId, input.kind],
              )
            ).rows[0];
            if (existing) return existing;
            return (
              await c.query(
                "INSERT INTO privacy_requests(user_id,kind) VALUES($1,$2) RETURNING id",
                [p.userId, input.kind],
              )
            ).rows[0];
          }),
          201,
        );
      }
    }
    if (id === "consents" && method === "GET")
      return json(
        (
          await pool.query(
            "SELECT purpose,granted,policy_version,occurred_at FROM consent_events WHERE subject_reference=$1 AND purpose='marketing-email' ORDER BY occurred_at DESC LIMIT 50",
            [p.userId],
          )
        ).rows,
      );
    throw new AppError(405, "METHOD", "Unsupported account action");
  }
  if (area === "admin" && id === "commerce") {
    const actor = authorize(p, "staff.manage");
    if (method === "GET") {
      return json({
        settings: (
          await pool.query("SELECT * FROM commerce_settings WHERE singleton")
        ).rows[0],
        variants: (
          await pool.query(
            "SELECT v.*,coalesce(i.on_hand,0) AS on_hand,coalesce(i.reserved,0) AS reserved,e.slug FROM product_variants v JOIN content_entities e ON e.id=v.product_id LEFT JOIN inventory i ON i.variant_id=v.id ORDER BY v.id LIMIT 50",
          )
        ).rows,
        providerConfigured: !!(
          process.env.RAZORPAY_KEY_ID &&
          process.env.RAZORPAY_KEY_SECRET &&
          process.env.RAZORPAY_WEBHOOK_SECRET
        ),
      });
    }
    if (method === "PATCH" && action === "settings") {
      const v = await body(
        req,
        z
          .object({
            enabled: z.boolean(),
            shippingMinor: z.string().regex(/^\d{1,10}$/),
            taxBasisPoints: z.number().int().min(0).max(10000),
            postalPrefixes: z
              .array(z.string().regex(/^[1-9][0-9]{0,5}$/))
              .max(100),
            version,
          })
          .strict(),
      );
      await transaction(async (c) => {
        if (
          !(
            await c.query(
              "UPDATE commerce_settings SET enabled=$1,shipping_minor=$2,tax_basis_points=$3,postal_prefixes=$4,version=version+1 WHERE singleton AND version=$5",
              [
                v.enabled,
                v.shippingMinor,
                v.taxBasisPoints,
                v.postalPrefixes,
                v.version,
              ],
            )
          ).rowCount
        )
          throw new AppError(409, "VERSION", "Settings changed");
        await c.query(
          "INSERT INTO audit_logs(actor_id,action,entity_id,changes) VALUES($1,'commerce.settings','global',$2)",
          [actor.userId, JSON.stringify(v)],
        );
      });
      return json({ saved: true });
    }
    if (method === "PATCH" && action === "variants") {
      const v = await body(
        req,
        z
          .object({
            id: uuid,
            priceMinor: z.string().regex(/^\d{1,10}$/),
            onHand: z.number().int().min(0).max(10000000),
            active: z.boolean(),
            version,
          })
          .strict(),
      );
      await transaction(async (c) => {
        const variant = (
          await c.query(
            "SELECT version FROM product_variants WHERE id=$1 FOR UPDATE",
            [v.id],
          )
        ).rows[0];
        if (!variant) throw new AppError(404, "VARIANT", "Supply not found");
        if (variant.version !== v.version)
          throw new AppError(409, "VERSION", "Supply changed");
        await c.query(
          "INSERT INTO inventory(variant_id) VALUES($1) ON CONFLICT DO NOTHING",
          [v.id],
        );
        const stock = (
          await c.query(
            "SELECT reserved FROM inventory WHERE variant_id=$1 FOR UPDATE",
            [v.id],
          )
        ).rows[0];
        if (v.onHand < stock.reserved)
          throw new AppError(
            422,
            "RESERVED",
            "Stock cannot be lower than reserved units",
          );
        await c.query(
          "UPDATE product_variants SET price_minor=$2,active=$3,version=version+1 WHERE id=$1",
          [v.id, v.priceMinor, v.active],
        );
        await c.query("UPDATE inventory SET on_hand=$2 WHERE variant_id=$1", [
          v.id,
          v.onHand,
        ]);
        await c.query(
          "INSERT INTO audit_logs(actor_id,action,entity_id,changes) VALUES($1,'commerce.variant',$2,$3)",
          [actor.userId, v.id, JSON.stringify(v)],
        );
      });
      return json({ saved: true });
    }
    throw new AppError(405, "METHOD", "Unsupported commerce action");
  }
  if (area === "admin" && id === "customer-requests") {
    const actor = authorize(p, "staff.manage");
    if (method === "GET")
      return json(
        (
          await pool.query(
            "SELECT r.id,r.kind,r.status,r.created_at,u.display_name,u.contact_email FROM privacy_requests r JOIN users u ON u.id=r.user_id ORDER BY r.created_at DESC LIMIT 50",
          )
        ).rows,
      );
    if (method === "PATCH" && action) {
      const input = await body(
        req,
        z
          .object({
            status: z.enum([
              "requested",
              "processing",
              "completed",
              "rejected",
            ]),
          })
          .strict(),
      );
      await transaction(async (c) => {
        if (
          !(
            await c.query("UPDATE privacy_requests SET status=$2 WHERE id=$1", [
              uuid.parse(action),
              input.status,
            ])
          ).rowCount
        )
          throw new AppError(404, "REQUEST", "Request not found");
        await c.query(
          "INSERT INTO audit_logs(actor_id,action,entity_id,changes) VALUES($1,'customer.privacy-request',$2,$3)",
          [actor.userId, action, JSON.stringify(input)],
        );
      });
      return json({ saved: true });
    }
    throw new AppError(405, "METHOD", "Unsupported customer request action");
  }
  return null;
}
