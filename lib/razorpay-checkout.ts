"use client";
type Result = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
let loading: Promise<void> | null = null;
export function loadRazorpay() {
  if ((window as any).Razorpay) return Promise.resolve();
  if (!loading)
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        loading = null;
        reject(new Error("Payment window could not load. Please try again."));
      };
      const timer = setTimeout(fail, 15000);
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        clearTimeout(timer);
        if ((window as any).Razorpay) resolve();
        else fail();
      };
      script.onerror = fail;
      document.body.appendChild(script);
    });
  return loading;
}
export async function openRazorpay(
  payment: {
    keyId: string;
    orderId: string;
    amount: string;
    currency: string;
    prefill: unknown;
  },
  onFailure?: () => void,
) {
  await loadRazorpay();
  return new Promise<Result>((resolve, reject) => {
    let settled = false;
    const fail = () => {
      if (!settled) {
        settled = true;
        reject(
          new Error("Payment wasn't completed. Your order hasn't been placed."),
        );
      }
    };
    const modal = new (window as any).Razorpay({
      key: payment.keyId,
      order_id: payment.orderId,
      amount: Number(payment.amount),
      currency: payment.currency,
      prefill: payment.prefill,
      name: "The Wellness House",
      theme: { color: "#30473B" },
      retry: { enabled: true },
      handler: (value: Result) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      },
      modal: { ondismiss: fail },
    });
    modal.on("payment.failed", () => {
      // A failed attempt is not a terminal modal result. Razorpay can retry
      // against the same order and call the success handler afterward.
      if (!settled) onFailure?.();
    });
    modal.open();
  });
}
