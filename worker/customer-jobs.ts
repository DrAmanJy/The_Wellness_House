import { pool } from "../server/db";
import { decrypt } from "../server/security/crypto";
import { origin } from "../server/security/http";
export async function customerMail(job: any) {
  if (!process.env.MAIL_API_KEY || !process.env.MAIL_FROM)
    throw new Error("MAIL_NOT_CONFIGURED");
  let to: string, subject: string, text: string;
  if (job.type === "contact-verification") {
    const v = (
      await pool.query(
        "SELECT email,expires_at,consumed_at FROM contact_verifications WHERE id=$1",
        [job.payload.id],
      )
    ).rows[0];
    if (!v || v.consumed_at || v.expires_at <= new Date()) return;
    to = v.email;
    subject = "Verify your Wellness House contact email";
    text = `Sign in to your account, then confirm your contact email using this link within 30 minutes:\n${origin()}/account/verify-contact#token=${decrypt(job.payload.token)}\n\nIf you did not request this change, ignore this message.`;
  } else {
    const order = (
      await pool.query(
        "SELECT email_snapshot,public_reference,total_minor,currency,payment_status FROM orders WHERE id=$1",
        [job.payload.orderId],
      )
    ).rows[0];
    if (!order || order.payment_status !== "paid") return;
    to = order.email_snapshot;
    subject = "Payment received — " + order.public_reference;
    text = `Your payment for ${order.public_reference} is verified. Total: ${order.currency} ${(Number(order.total_minor) / 100).toFixed(2)}.\nView your order after signing in: ${origin()}/account/orders/${job.payload.orderId}`;
  }
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.MAIL_API_KEY,
      "Content-Type": "application/json",
      "Idempotency-Key": job.dedupe_key,
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new Error("MAIL_DELIVERY_FAILED");
}
