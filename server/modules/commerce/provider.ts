import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "../../security/http";
import Razorpay from "razorpay";
export class PaymentProviderAuthError extends AppError {
  constructor() {
    super(
      503,
      "PAYMENT_PROVIDER_AUTH",
      "Payment service is temporarily unavailable. Your order has not been placed. Please contact support.",
    );
  }
}
export async function createProviderOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
}) {
  if (!Number.isSafeInteger(input.amount) || input.amount < 100)
    throw new AppError(
      400,
      "PAYMENT_AMOUNT",
      "Order total must be at least ₹1 (100 paise)",
    );
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    throw new AppError(
      500,
      "PAYMENT_CONFIG",
      "Payment service is not configured",
    );
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // A timed-out creation is ambiguous; the caller reconciles by receipt instead of retrying creation.
    return await Promise.race([
      client.orders.create({ ...input, partial_payment: false }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("PAYMENT_PROVIDER_TIMEOUT")),
          15000,
        );
      }),
    ]);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "statusCode" in error &&
      [401, 403].includes(Number(error.statusCode))
    )
      throw new PaymentProviderAuthError();
    throw error;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret = process.env.RAZORPAY_KEY_SECRET || "",
) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature))
    throw new AppError(400, "PAYMENT_SIGNATURE", "Invalid payment signature");
  const expected = createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    throw new AppError(400, "PAYMENT_SIGNATURE", "Invalid payment signature");
}
export function verifyWebhook(
  raw: Buffer,
  signature: string,
  secret = process.env.RAZORPAY_WEBHOOK_SECRET || "",
) {
  if (!secret || !/^[a-f0-9]{64}$/i.test(signature))
    throw new AppError(400, "WEBHOOK_SIGNATURE", "Invalid webhook signature");
  const expected = createHmac("sha256", secret).update(raw).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex")))
    throw new AppError(400, "WEBHOOK_SIGNATURE", "Invalid webhook signature");
}
export async function razorpay(
  path: string,
  method = "GET",
  payload?: unknown,
  headers: Record<string, string> = {},
) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET)
    throw new Error("PAYMENT_PROVIDER_NOT_CONFIGURED");
  const response = await fetch("https://api.razorpay.com/v1/" + path, {
    method,
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.RAZORPAY_KEY_ID + ":" + process.env.RAZORPAY_KEY_SECRET,
        ).toString("base64"),
      "Content-Type": "application/json",
      ...headers,
    },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if ([401, 403].includes(response.status))
    throw new PaymentProviderAuthError();
  if (!response.ok) throw new Error("PAYMENT_PROVIDER_" + response.status);
  return response.json();
}
