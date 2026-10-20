import { pool } from "../../db";
import { AppError } from "../../security/http";
import type { Principal } from "../../security/session";
import { placeOrder } from "./service";
import { confirmPayment, initiate, processCapture } from "../commerce/service";
import { razorpay, PaymentProviderAuthError } from "../commerce/provider";

async function owned(p: Principal, checkoutId: string) {
  const row = (
    await pool.query(
      "SELECT o.*,p.id AS payment_id,p.provider_order_id,p.gateway_status,p.state AS provider_state FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.checkout_id=$1 AND o.user_id=$2",
      [checkoutId, p.userId],
    )
  ).rows[0];
  if (!row)
    throw new AppError(404, "PAYMENT_ATTEMPT", "Payment attempt not found");
  return row;
}
export async function paymentStatus(
  p: Principal,
  checkoutId: string,
  refresh = false,
) {
  let row = await owned(p, checkoutId);
  if (
    refresh &&
    !row.confirmed_at &&
    row.provider_order_id &&
    row.provider_state !== "captured"
  ) {
    // Bound provider polling across tabs and workers, independently of browser state.
    const due = await pool.query(
      "UPDATE payments SET last_checked_at=now() WHERE id=$1 AND (last_checked_at IS NULL OR last_checked_at<now()-interval '10 seconds') RETURNING id",
      [row.payment_id],
    );
    if (due.rowCount) {
      try {
        const result = await razorpay(
          "orders/" + encodeURIComponent(row.provider_order_id) + "/payments",
        );
        const statuses = (result.items || []).map((i: any) => i.status);
        const gatewayStatus = statuses.includes("captured")
          ? "captured"
          : statuses.includes("authorized")
            ? "authorized"
            : statuses.length && statuses.every((s: string) => s === "failed")
              ? "failed"
              : "created";
        await pool.query("UPDATE payments SET gateway_status=$2 WHERE id=$1", [
          row.payment_id,
          gatewayStatus,
        ]);
        for (const payment of result.items || [])
          if (payment.status === "captured") await processCapture(payment.id);
      } catch (error) {
        if (error instanceof PaymentProviderAuthError) throw error;
        /* Durable webhook jobs and worker reconciliation continue recovery. */
      }
      row = await owned(p, checkoutId);
    }
  }
  const confirmed = Boolean(row.confirmed_at);
  return {
    state: confirmed
      ? "confirmed"
      : row.payment_status === "refund_pending" ||
          row.payment_status === "refunded"
        ? "refund_pending"
        : row.payment_status === "expired" || row.expires_at <= new Date()
          ? "expired"
          : ["authorized", "captured"].includes(row.gateway_status) ||
              ["ambiguous", "creating", "review"].includes(row.provider_state)
            ? "confirming"
            : "pending",
    orderId: confirmed ? row.id : null,
    expiresAt: row.expires_at,
    payment:
      !confirmed &&
      !["authorized", "captured"].includes(row.gateway_status) &&
      row.payment_status === "pending" &&
      row.expires_at > new Date() &&
      row.provider_state === "ready"
        ? {
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: row.provider_order_id,
            amount: row.total_minor,
            currency: row.currency,
            prefill: {
              name: row.shipping_address.recipient,
              email: row.email_snapshot,
              contact: row.shipping_address.phone,
            },
          }
        : null,
  };
}
export async function startPayment(
  p: Principal,
  checkoutId: string,
  version: number,
  key: string,
) {
  const attempt = await placeOrder(p, checkoutId, version, key);
  await initiate(attempt.id);
  return paymentStatus(p, checkoutId);
}
export async function confirmCheckoutPayment(
  p: Principal,
  checkoutId: string,
  input: { paymentId: string; orderId: string; signature: string },
) {
  const attempt = await owned(p, checkoutId);
  await confirmPayment(p, attempt.id, input);
  return paymentStatus(p, checkoutId);
}
