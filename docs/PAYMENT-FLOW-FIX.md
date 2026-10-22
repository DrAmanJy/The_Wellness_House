# Captured-payment-only customer orders

Implemented 17 October 2026.

## Cause and scope

`components/customer/checkout-client.tsx` called the checkout `/orders` endpoint and immediately navigated to `/account/orders/:id`. `placeOrder` in `server/modules/checkout/service.ts` saved a pending internal record and inventory reservations before provider checkout. `server/customer-router.ts` listed every owned record, including unpaid ones. This caused unpaid attempts to look like customer purchases.

The project uses Next.js, Node, PostgreSQL and Razorpay Standard Checkout. There are no Prisma models. Existing SQL tables are preserved. Provisional internal orders remain private financial snapshots supporting reservations, immutable line items, idempotency and reconciliation. They are payment attempts until verified capture sets `confirmed_at`. This follows the requested allowance for inaccessible provisional internal records and avoids moving financial references between duplicate table structures.

## Current flow

Checkout → Continue to Payment → validate server quote/address/stock → create or reuse private payment attempt and Razorpay order → open the actual Razorpay modal on checkout → verify signature and fetch capture/amount/currency/order linkage server-side → atomically confirm one paid purchase → redirect to the protected `/account/orders/:id` confirmation/details page.

- `POST /api/v1/checkout-sessions/:id/payment-attempts`: authenticated, CSRF protected, rate limited and idempotent; accepts checkout version and UUID idempotency header. Returns payment modal configuration and state. `orderId` is null until confirmed. The legacy `/orders` initiation alias returns this same payment-attempt response and cannot expose an unpaid customer order.
- `POST /api/v1/checkout-sessions/:id/confirm-payment`: authenticates ownership, validates fields/signature, checks Razorpay payment linkage, amount/currency and actual capture, then returns the resulting payment status. Authorized-only payments remain under confirmation.
- `GET /api/v1/checkout-sessions/:id/payment-status`: owner-only, no-store, rate limited. Provider polling is throttled across tabs. Reports pending, confirming, expired, refund pending or confirmed. Only confirmed purchases expose a customer order ID. Polling may fetch Razorpay evidence and retry finalization; webhooks and the worker also operate independently of the browser.
- `/account/orders` and its API only include `confirmed_at IS NOT NULL`. The detail API and native page preflight enforce the same filter and ownership. Unpaid details return 404; anonymous page visits redirect to login.

Checkout reuses a valid provider order instead of creating duplicates. A synchronous ref lock guards double clicks. The modal loads before creating an attempt, preventing script-load failures from reserving inventory. Failure/dismissal shows “Payment wasn't completed. Your order hasn't been placed.” with Try Payment Again. The bag remains intact. Delayed verification shows Confirming your payment, polls every five seconds for up to 24 checks and offers an explicit Check payment status button afterward. Authorized or captured attempts cannot open another payment modal while finalization is pending. Expired attempts retain their audit snapshots and direct the customer to a fresh checkout with their bag preserved.

Delivery details are locked for the existing payment attempt so its gateway amount and address snapshot cannot diverge. Confirmed order payment and fulfillment states remain separate (`paid` and `processing`). Later refunds or fulfillment cancellations remain visible because confirmation is immutable.

## Database and recovery

Migration `008_confirmed_orders.sql` adds the confirmation marker and last observed gateway status, indexes visible orders and adds a completed checkout state. Confirmation requires a matching verified capture row. The database rejects clearing/changing an established confirmation timestamp or setting a paid state without confirmation.

Existing records are confirmed only when prior finalization and matching capture evidence exist. Unpaid provisional records are hidden without deletion. Provider order IDs, provider capture IDs, checkout references, idempotency keys, event IDs and refund keys retain their existing unique constraints.

Capture processing locks the payment, provisional snapshot, reservations and inventory. Paid confirmation, line snapshots, inventory consumption, cart cleanup, checkout completion and receipt enqueueing commit together. Duplicate client/webhook verification cannot consume inventory or send receipts twice. Raw signed webhook events and durable jobs survive a failed transaction; browser verification also records independently fetched authorized/captured evidence before finalization, and worker reconciliation retries captured payments. Late captures without available stock enter the existing full-refund workflow and never become customer purchases. Previously confirmed purchases remain visible through refunds.

`scripts/reconcile-payments.ts` fetches provider payment evidence for up to 100 unconfirmed records. It never deletes records or marks an order paid based solely on local state. Run it with `npx tsx --env-file-if-exists=.env.local scripts/reconcile-payments.ts`. Keep `npm run worker` running for ongoing reconciliation and expiry.

During this fix the existing provider-linked provisional record was checked against Razorpay: one record checked, no captured payment, one unpaid/pending record, zero provider errors. It remains hidden and auditable. The subsequent automated provider test also creates an unpaid fixture and explicitly expires it without deleting its financial records.

## Verification and limits

- 22 backend integration tests pass. Added assertions cover invisible provisional attempts, no purchase before payment, repeat attempt reuse, authorized-only invisibility, concurrent capture producing one visible paid purchase, completed checkout, foreign-owner denial, refund/cancellation visibility and database confirmation guards.
- Failure injection inside finalization proves that captures, stock and order visibility roll back together, and a later retry creates one paid purchase with one stock deduction.
- Production HTTP provider check creates a real unpaid Razorpay test-mode order through the application, verifies authoritative totals and provider ID reuse, rejects missing/forged signatures and asserts that both customer API and native detail page deny the unpaid provisional record.
- Customer HTTP tests and CMS/privacy boundary tests pass. TypeScript and production build pass. Lint has zero errors and existing image optimization warnings.
- Production uses real Razorpay calls; synthetic provider fixtures are limited to isolated automated integration tests. No actual payment completion is simulated in the application.

A real customer Google consent ceremony, completed Razorpay test payment, modal dismissal and provider webhook delivery were not performed in the browser during this change. Those require the signed-in customer and configured dashboard webhook. Register a public HTTPS `/api/v1/webhooks/razorpay` endpoint with the matching local webhook secret and `payment.captured`, enable automatic capture, and complete success/failure/dismissal checks in Razorpay test mode before live payments. The current preview is at http://localhost:3100.

Provider reference: [Razorpay Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/).

## Retry correction

The Standard Checkout wrapper previously treated `payment.failed` as a terminal modal result: it rejected the payment promise and called `modal.close()`. This prevented Razorpay's retry UI from completing a later successful attempt in the same modal. The wrapper now enables Razorpay retry, keeps its promise and modal open after a failed attempt, and only settles on success or dismissal. Checkout shows a retry message while the modal stays open and clears it when a successful result moves into server verification. It continues to use the original provider order and server-side capture checks.

Two regression tests cover failure → failure → success without a forced close, and failure → dismissal without false success. The full backend suite now has 24 passing tests. The current credentials returned Razorpay HTTP 401 during the retry investigation, so no real provider retry/payment completion was certified in this follow-up. A valid matching key pair and process restart are required before that provider check can succeed.

Authentication failures during provider order creation now return `PAYMENT_PROVIDER_AUTH` (503) and leave the attempt queued for retry after configuration is fixed. They no longer become ambiguous creation attempts. Timeouts and unknown failures still require receipt reconciliation before another create call. The retry regression test verifies an authentication rejection followed by successful creation of the same internal attempt. Provider status polling also surfaces authentication errors rather than silently implying verification is healthy.

For checkout `2046263f-d251-4628-b6c9-3da030d71371`, investigation found an unconfirmed provisional record in the old ambiguous state without a provider order ID. An independent request using the exact key pair parsed directly from `.env.local` returned HTTP 401; inherited environment variables matched the saved values. This rules out a stale process as the source of that authentication failure. The existing ambiguous record was not reset, deleted or marked paid without provider evidence. Reconcile it after a valid matching key pair is installed; restart the port-3000 development server and worker after changing environment values.
