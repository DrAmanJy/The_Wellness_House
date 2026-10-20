import { randomUUID } from "node:crypto";
import { pool, transaction } from "../../db";
import { hash } from "../../security/crypto";
import { AppError } from "../../security/http";
import {
  razorpay,
  verifyWebhook,
  verifyCheckoutSignature,
  createProviderOrder,
  PaymentProviderAuthError,
} from "./provider";
import type { Principal } from "../../security/session";
export async function confirmPayment(
  p: Principal,
  orderId: string,
  input: { paymentId: string; orderId: string; signature: string },
  fetchPayment = razorpay,
) {
  const payment = (
    await pool.query(
      "SELECT p.provider_order_id,o.total_minor,o.currency FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.id=$1 AND o.user_id=$2",
      [orderId, p.userId],
    )
  ).rows[0];
  if (!payment) throw new AppError(404, "ORDER", "Order not found");
  if (!payment.provider_order_id || payment.provider_order_id !== input.orderId)
    throw new AppError(
      400,
      "PAYMENT_ORDER",
      "Payment does not match this order",
    );
  // The HMAC uses our stored order ID, never an untrusted browser selection.
  verifyCheckoutSignature(
    payment.provider_order_id,
    input.paymentId,
    input.signature,
  );
  const external = await fetchPayment(
    "payments/" + encodeURIComponent(input.paymentId),
  );
  if (external.order_id !== payment.provider_order_id)
    throw new AppError(
      400,
      "PAYMENT_ORDER",
      "Payment does not match this order",
    );
  if (external.id !== input.paymentId)
    throw new Error("PROVIDER_PAYMENT_ID_MISMATCH");
  if (
    external.amount !== Number(payment.total_minor) ||
    external.currency !== payment.currency
  )
    throw new Error("PAYMENT_AMOUNT_MISMATCH");
  if (["authorized", "captured"].includes(external.status))
    await pool.query(
      "UPDATE payments SET gateway_status=$2 WHERE provider_order_id=$1",
      [payment.provider_order_id, external.status],
    );
  await processCapture(input.paymentId, undefined, async () => external);
  return { verified: external.status === "captured" };
}
export async function initiate(
  orderId: string,
  createOrder = createProviderOrder,
) {
  const state = await transaction(async (c) => {
    const row = (
      await c.query(
        "SELECT p.*,o.public_reference,o.total_minor,o.currency,o.payment_status,o.created_at AS order_created FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.order_id=$1 FOR UPDATE OF p",
        [orderId],
      )
    ).rows[0];
    if (!row || row.provider_order_id || row.payment_status !== "pending")
      return null;
    if (row.state !== "queued") return { ...row, reconcile: true };
    await c.query(
      "UPDATE payments SET state='creating',last_checked_at=now() WHERE id=$1",
      [row.id],
    );
    return { ...row, reconcile: false };
  });
  if (!state) return;
  if (state.reconcile) {
    await reconcileCreation(state);
    return;
  }
  try {
    const external = await createOrder({
      amount: Number(state.total_minor),
      currency: state.currency,
      receipt: state.public_reference,
    });
    if (
      external.amount !== Number(state.total_minor) ||
      external.currency !== state.currency ||
      !external.id
    )
      throw new Error("PROVIDER_ORDER_MISMATCH");
    await pool.query(
      "UPDATE payments SET provider_order_id=$2,state='ready',last_checked_at=now() WHERE id=$1 AND provider_order_id IS NULL",
      [state.id, external.id],
    );
  } catch (error) {
    if (error instanceof PaymentProviderAuthError) {
      // An explicit authentication rejection did not create a gateway order.
      // Keep this attempt retryable, unlike a timeout with unknown outcome.
      await pool.query(
        "UPDATE payments SET state='queued',last_checked_at=now() WHERE id=$1 AND provider_order_id IS NULL",
        [state.id],
      );
      throw error;
    }
    await pool.query(
      "UPDATE payments SET state='ambiguous',last_checked_at=now() WHERE id=$1 AND provider_order_id IS NULL",
      [state.id],
    );
    throw new AppError(
      500,
      "PAYMENT_CREATION_REQUIRES_RECONCILIATION",
      "Payment setup could not be confirmed. Stay on checkout and check payment status before retrying.",
    );
  }
}
async function reconcileCreation(state: any) {
  for (let page = 0; page < 10; page++) {
    const data = await razorpay(
      `orders?from=${Math.floor(new Date(state.order_created).getTime() / 1000) - 60}&count=100&skip=${page * 100}`,
    );
    const found =
      data.items?.filter((i: any) => i.receipt === state.public_reference) ||
      [];
    if (
      found.length === 1 &&
      found[0].amount === Number(state.total_minor) &&
      found[0].currency === state.currency
    ) {
      await pool.query(
        "UPDATE payments SET provider_order_id=$2,state='ready',last_checked_at=now() WHERE id=$1 AND provider_order_id IS NULL",
        [state.id, found[0].id],
      );
      return;
    }
    if (found.length > 1) {
      await pool.query("UPDATE payments SET state='review' WHERE id=$1", [
        state.id,
      ]);
      throw new Error("AMBIGUOUS_MULTIPLE_PROVIDER_ORDERS");
    }
    if ((data.items?.length || 0) < 100) break;
  }
  await pool.query(
    "UPDATE payments SET state='ambiguous',last_checked_at=now() WHERE id=$1",
    [state.id],
  );
  throw new Error("PROVIDER_ORDER_NOT_FOUND_REVIEW_REQUIRED");
}
export async function webhook(req: Request) {
  const reader = req.body?.getReader(),
    chunks: Uint8Array[] = [];
  let size = 0;
  if (reader)
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > 262144) {
        await reader.cancel();
        throw new AppError(413, "BODY_SIZE", "Webhook too large");
      }
      chunks.push(part.value);
    }
  const raw = Buffer.concat(chunks);
  verifyWebhook(raw, req.headers.get("x-razorpay-signature") || "");
  let value;
  try {
    value = JSON.parse(raw.toString("utf8"));
  } catch {
    throw new AppError(400, "WEBHOOK_JSON", "Invalid webhook");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AppError(400, "WEBHOOK_JSON", "Invalid webhook");
  const eventId = req.headers.get("x-razorpay-event-id");
  if (!eventId || eventId.length > 200)
    throw new AppError(400, "WEBHOOK_EVENT", "Missing event ID");
  const paymentId = value.payload?.payment?.entity?.id;
  if (value.event !== "payment.captured") return { accepted: true };
  if (typeof paymentId !== "string" || !/^pay_[A-Za-z0-9]+$/.test(paymentId))
    throw new AppError(400, "WEBHOOK_PAYMENT", "Invalid payment");
  await transaction(async (c) => {
    const inserted = await c.query(
      "INSERT INTO payment_events(event_id,payload_hash,payment_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING event_id",
      [eventId, hash(raw.toString("base64")), paymentId],
    );
    if (!inserted.rowCount) {
      const prior = (
        await c.query(
          "SELECT payload_hash FROM payment_events WHERE event_id=$1",
          [eventId],
        )
      ).rows[0];
      if (prior.payload_hash !== hash(raw.toString("base64")))
        throw new AppError(
          409,
          "WEBHOOK_REPLAY",
          "Event ID reused with different data",
        );
      return;
    }
    await c.query(
      "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3)",
      [
        "payment-captured",
        JSON.stringify({ eventId, paymentId }),
        "capture:" + eventId,
      ],
    );
  });
  return { accepted: true };
}
export async function processCapture(
  paymentId: string,
  eventId?: string,
  fetchPayment = razorpay,
) {
  const external = await fetchPayment(
    "payments/" + encodeURIComponent(paymentId),
  );
  if (external.status !== "captured") return;
  if (external.id !== paymentId)
    throw new Error("PROVIDER_PAYMENT_ID_MISMATCH");
  await transaction(async (c) => {
    const p = (
      await c.query(
        "SELECT * FROM payments WHERE provider_order_id=$1 FOR UPDATE",
        [external.order_id],
      )
    ).rows[0];
    if (!p) throw new Error("UNKNOWN_PROVIDER_ORDER");
    const order = (
      await c.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [p.order_id])
    ).rows[0];
    if (
      Number(order.total_minor) !== external.amount ||
      order.currency !== external.currency
    )
      throw new Error("PAYMENT_AMOUNT_MISMATCH");
    if (
      (
        await c.query(
          "SELECT 1 FROM payment_captures WHERE provider_payment_id=$1",
          [paymentId],
        )
      ).rowCount
    ) {
      if (eventId)
        await c.query(
          "UPDATE payment_events SET processed_at=now() WHERE event_id=$1",
          [eventId],
        );
      return;
    }
    await c.query(
      "INSERT INTO payment_captures(provider_payment_id,payment_id,amount_minor,currency) VALUES($1,$2,$3,$4)",
      [paymentId, p.id, external.amount, external.currency],
    );
    const reservations = (
      await c.query(
        "SELECT * FROM stock_reservations WHERE order_id=$1 ORDER BY variant_id FOR UPDATE",
        [order.id],
      )
    ).rows;
    await c.query(
      "SELECT variant_id FROM inventory WHERE variant_id=ANY($1::uuid[]) ORDER BY variant_id FOR UPDATE",
      [reservations.map((r) => r.variant_id)],
    );
    let refund =
      Boolean(order.confirmed_at) ||
      ["paid", "refund_pending", "refunded"].includes(order.payment_status);
    if (!refund) {
      for (const r of reservations) {
        const stock = (
          await c.query("SELECT * FROM inventory WHERE variant_id=$1", [
            r.variant_id,
          ])
        ).rows[0];
        if (
          r.state === "released" &&
          stock.on_hand - stock.reserved < r.quantity
        )
          refund = true;
      }
    }
    if (refund) {
      const r = (
        await c.query(
          "INSERT INTO refunds(payment_id,provider_payment_id,amount_minor,request_key) VALUES($1,$2,$3,$4) RETURNING id",
          [p.id, paymentId, external.amount, randomUUID()],
        )
      ).rows[0];
      await c.query(
        "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3)",
        [
          "payment-refund",
          JSON.stringify({ refundId: r.id }),
          "refund:" + r.id,
        ],
      );
      if (order.payment_status !== "paid")
        await c.query(
          "UPDATE orders SET payment_status='refund_pending' WHERE id=$1",
          [order.id],
        );
    } else {
      for (const r of reservations) {
        await c.query(
          "UPDATE inventory SET on_hand=on_hand-$2,reserved=reserved-$3 WHERE variant_id=$1",
          [r.variant_id, r.quantity, r.state === "active" ? r.quantity : 0],
        );
        await c.query(
          "UPDATE stock_reservations SET state='consumed' WHERE order_id=$1 AND variant_id=$2",
          [order.id, r.variant_id],
        );
      }
      const checkout = (
        await c.query("SELECT * FROM checkout_sessions WHERE id=$1", [
          order.checkout_id,
        ])
      ).rows[0];
      if (checkout.mode === "cart" && !order.cart_consumed_at) {
        await c.query("SELECT id FROM carts WHERE id=$1 FOR UPDATE", [
          checkout.cart_id,
        ]);
        for (const item of checkout.items) {
          const line = (
            await c.query(
              "SELECT * FROM cart_items WHERE cart_id=$1 AND variant_id=$2",
              [checkout.cart_id, item.variantId],
            )
          ).rows[0];
          if (!line || line.line_id !== item.lineId) continue;
          const added = BigInt(line.total_added) - BigInt(item.totalAdded);
          const retain = Math.min(line.quantity, Math.max(0, Number(added)));
          const remaining = Math.max(retain, line.quantity - item.quantity);
          if (remaining)
            await c.query(
              "UPDATE cart_items SET quantity=$3 WHERE cart_id=$1 AND variant_id=$2",
              [checkout.cart_id, item.variantId, remaining],
            );
          else
            await c.query(
              "DELETE FROM cart_items WHERE cart_id=$1 AND variant_id=$2",
              [checkout.cart_id, item.variantId],
            );
        }
        await c.query("UPDATE carts SET version=version+1 WHERE id=$1", [
          checkout.cart_id,
        ]);
      }
      await c.query(
        "UPDATE orders SET payment_status='paid',confirmed_at=coalesce(confirmed_at,now()),fulfillment_status='processing',cart_consumed_at=now() WHERE id=$1",
        [order.id],
      );
      await c.query(
        "UPDATE checkout_sessions SET state='completed' WHERE id=$1",
        [order.checkout_id],
      );
      await c.query(
        "INSERT INTO jobs(type,payload,dedupe_key) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
        [
          "order-receipt",
          JSON.stringify({ orderId: order.id }),
          "receipt:" + order.id,
        ],
      );
    }
    await c.query(
      "UPDATE payments SET provider_payment_id=coalesce(provider_payment_id,$2),state='captured',gateway_status='captured',last_checked_at=now() WHERE id=$1",
      [p.id, paymentId],
    );
    if (eventId)
      await c.query(
        "UPDATE payment_events SET processed_at=now() WHERE event_id=$1",
        [eventId],
      );
  });
}
export async function refund(refundId: string) {
  const row = (
    await pool.query("SELECT * FROM refunds WHERE id=$1", [refundId])
  ).rows[0];
  if (!row || row.state === "processed" || row.state === "failed") return;
  const result = row.provider_refund_id
    ? await razorpay("refunds/" + row.provider_refund_id)
    : await razorpay(
        "payments/" + row.provider_payment_id + "/refund",
        "POST",
        { amount: Number(row.amount_minor), speed: "normal", receipt: row.id },
        { "X-Refund-Idempotency": row.request_key },
      );
  if (
    !result.id ||
    result.payment_id !== row.provider_payment_id ||
    result.amount !== Number(row.amount_minor)
  )
    throw new Error("REFUND_MISMATCH");
  await pool.query(
    "UPDATE refunds SET provider_refund_id=$2,state=$3 WHERE id=$1",
    [
      row.id,
      result.id,
      result.status === "processed"
        ? "processed"
        : result.status === "failed"
          ? "failed"
          : "pending",
    ],
  );
  if (result.status === "processed")
    await pool.query(
      "UPDATE orders SET payment_status='refunded' WHERE id=(SELECT order_id FROM payments WHERE id=$1) AND payment_status='refund_pending'",
      [row.payment_id],
    );
}
export async function expireOrders() {
  const ids = (
    await pool.query(
      "SELECT id FROM orders WHERE payment_status='pending' AND expires_at<now() ORDER BY id LIMIT 100",
    )
  ).rows;
  for (const { id } of ids)
    await transaction(async (c) => {
      const o = (
        await c.query("SELECT * FROM orders WHERE id=$1 FOR UPDATE", [id])
      ).rows[0];
      if (o.payment_status !== "pending" || o.expires_at > new Date()) return;
      const rows = (
        await c.query(
          "SELECT * FROM stock_reservations WHERE order_id=$1 AND state='active' ORDER BY variant_id FOR UPDATE",
          [id],
        )
      ).rows;
      await c.query(
        "SELECT variant_id FROM inventory WHERE variant_id=ANY($1::uuid[]) ORDER BY variant_id FOR UPDATE",
        [rows.map((r) => r.variant_id)],
      );
      for (const r of rows)
        await c.query(
          "UPDATE inventory SET reserved=reserved-$2 WHERE variant_id=$1",
          [r.variant_id, r.quantity],
        );
      await c.query(
        "UPDATE stock_reservations SET state='released' WHERE order_id=$1 AND state='active'",
        [id],
      );
      await c.query("UPDATE orders SET payment_status='expired' WHERE id=$1", [
        id,
      ]);
    });
}
export async function reconcile() {
  await expireOrders();
  const pending = (
    await pool.query(
      "SELECT p.*,o.created_at AS order_created,o.public_reference,o.total_minor,o.currency FROM payments p JOIN orders o ON o.id=p.order_id WHERE (p.state IN ('ready','creating','ambiguous')) AND (p.last_checked_at IS NULL OR p.last_checked_at<now()-interval '1 minute') ORDER BY p.last_checked_at NULLS FIRST LIMIT 20",
    )
  ).rows;
  for (const p of pending) {
    try {
      if (!p.provider_order_id) await reconcileCreation(p);
      else {
        const result = await razorpay(
          "orders/" + p.provider_order_id + "/payments",
        );
        for (const payment of result.items || [])
          if (payment.status === "captured") await processCapture(payment.id);
        await pool.query(
          "UPDATE payments SET last_checked_at=now() WHERE id=$1",
          [p.id],
        );
      }
    } catch {
      await pool.query(
        "UPDATE payments SET last_checked_at=now() WHERE id=$1",
        [p.id],
      );
    }
  }
  const refunds = (
    await pool.query("SELECT id FROM refunds WHERE state='pending' LIMIT 20")
  ).rows;
  for (const row of refunds)
    try {
      await refund(row.id);
    } catch {}
}
