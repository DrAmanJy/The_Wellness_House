import { test } from "node:test";
import assert from "node:assert/strict";
import { openRazorpay } from "../lib/razorpay-checkout";

test("a failed gateway attempt can retry successfully in the same modal", async () => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "window");
  let options: any,
    failed: (() => void) | undefined,
    opened = 0,
    closed = 0,
    notices = 0;
  class Modal {
    constructor(value: any) {
      options = value;
    }
    on(event: string, handler: () => void) {
      assert.equal(event, "payment.failed");
      failed = handler;
    }
    open() {
      opened++;
    }
    close() {
      closed++;
    }
  }
  Object.defineProperty(globalThis, "window", {
    value: { Razorpay: Modal },
    configurable: true,
  });
  try {
    let resolved = false;
    const payment = openRazorpay(
      {
        keyId: "rzp_test_fixture",
        orderId: "order_Original",
        amount: "100",
        currency: "INR",
        prefill: {},
      },
      () => {
        notices++;
      },
    );
    void payment.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    assert(options.retry.enabled);
    failed!();
    failed!();
    await Promise.resolve();
    assert.equal(resolved, false);
    assert.equal(closed, 0);
    assert.equal(opened, 1);
    assert.equal(notices, 2);
    const success = {
      razorpay_payment_id: "pay_Retry",
      razorpay_order_id: "order_Original",
      razorpay_signature: "fixture",
    };
    options.handler(success);
    assert.deepEqual(await payment, success);
    options.modal.ondismiss();
    assert.equal(closed, 0);
  } finally {
    if (prior) Object.defineProperty(globalThis, "window", prior);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("dismissal after a failed attempt rejects without reporting success", async () => {
  const prior = Object.getOwnPropertyDescriptor(globalThis, "window");
  let options: any, failed: (() => void) | undefined;
  class Modal {
    constructor(value: any) {
      options = value;
    }
    on(_: string, handler: () => void) {
      failed = handler;
    }
    open() {}
  }
  Object.defineProperty(globalThis, "window", {
    value: { Razorpay: Modal },
    configurable: true,
  });
  try {
    const payment = openRazorpay({
      keyId: "rzp_test_fixture",
      orderId: "order_Original",
      amount: "100",
      currency: "INR",
      prefill: {},
    });
    const rejected = assert.rejects(payment, /Payment wasn't completed/);
    await Promise.resolve();
    failed!();
    options.modal.ondismiss();
    await rejected;
  } finally {
    if (prior) Object.defineProperty(globalThis, "window", prior);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
