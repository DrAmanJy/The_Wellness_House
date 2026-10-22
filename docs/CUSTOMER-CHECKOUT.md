# Customer accounts and checkout

Implemented from the customer authentication, checkout and account plan, 17 October 2026.

**Payment-flow update:** [Captured-payment-only orders](./PAYMENT-FLOW-FIX.md) supersedes the initiation and order-page payment instructions below. Checkout now opens Razorpay directly. Private unpaid attempts are excluded from order history and detail routes, and confirmed purchases appear only after verified capture. Use `/checkout-sessions/:id/payment-attempts`, `/confirm-payment` and `/payment-status` for this flow.

## What the customer can do

- Browse and add supplies without signing in. Each 30-day/60-day supply has a separate server variant ID and price.
- Click Buy Now to buy only that supply, preserving the ordinary bag. A server purchase intent retains the selection through Google/Apple sign-in.
- Continue from the bag through sign-in. Guest bags are merged once under locks, with a unique source receipt and replay-safe operations. The authenticated server bag replaces browser state.
- Manage profile details, saved addresses/default delivery address, reduced-motion and marketing preferences, linked sign-ins, active sessions, saved rituals, privacy requests and orders under `/account`.
- Choose a saved address or a new address at checkout. Saving a new address is opt-in; billing can differ from delivery. Orders retain immutable address snapshots.
- Review a server quote, place an idempotent order and open hosted Razorpay checkout when the merchant enables ordering. The order page polls for verified payment status. Browser callbacks never mark an order paid.

The previous timer-based order confirmation and localStorage cart success fallback have been removed. No prices, discounts, stock levels, delivery promises or provider credentials are fabricated by this implementation. Existing default SKU prices remain unset until approved. Newly created products get unpriced 30-day and 60-day variants. Normal customers do not see development admin sign-in or staff MFA.

## Setup

1. Start local PostgreSQL with `npm run db:local` (or the existing Docker Compose configuration).
2. Run `npm run db:migrate` and `npm run db:seed`. Migrations 003–007 add customers, address ownership constraints, purchase/checkout records, stock, payment captures and cart operation tracking. Future migrations remain explicit deployment steps.
3. Configure Google/Apple credentials and `APP_ORIGIN` in `.env.local`. Callback paths remain `/api/v1/auth/google/callback` and `/api/v1/auth/apple/callback`. Apple needs HTTPS for its Secure cross-site transaction cookie. Each OAuth attempt has its own state-bound cookie, so separate tabs do not overwrite one correlation cookie. The OAuth transaction also pins its guest source cart before redirect, so Apple form_post callbacks can merge it even when SameSite=Lax guest cookies are absent.
4. Configure `MAIL_API_KEY` and `MAIL_FROM` for email verification and paid-order receipts. Transactional mail uses the existing Resend worker integration. Contact email changes stay pending until the signed-in user confirms the emailed link; phone storage does not claim verification.
5. Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Subscribe `payment.captured` to `APP_ORIGIN/api/v1/webhooks/razorpay`. Do not enable sales before staging-provider tests pass.
6. An owner signs in, completes staff security-key verification at `/admin/security`, then opens `/admin/commerce` to approve each variant's price in paise, stock, shipping charge, exclusive tax basis points, and serviceable Indian PIN prefixes. Turn on ordering only after reviewing those rules. If configuration/credentials are absent, checkout remains a review screen and never simulates payment success.
7. Run `npm run worker` continuously. It processes provider-order initiation, captured payments, refunds, email and scheduled publications; every minute it expires reservations and reconciles pending/ambiguous provider states.

`ALLOW_DEV_ADMIN_AUTH` defaults to false. The existing local-only development auth routes now require an explicit opt-in and always return 404 in production. This option is for isolated local staff testing, not customer authentication or deployment.

## Cart and account isolation

The server enforces active carts and expiry on writes. A guest source is rechecked after deterministic row locks. A merge receipt identifies the consuming account; a source cannot be replayed into another account. Guest cookies rotate after successful login/merge and logout. Cart mutations bind to both the resolved principal and the expected cart identity, preventing stale-tab writes after account switches. Quantity edits have optimistic versions; increments have operation IDs and request hashes.

Browser state is cleared/refetched on login/logout, expiry and cross-tab account changes. Legacy browser cart snapshots are removed, never summed into the database. No offline write success is claimed. The app waits for server persistence before displaying Added.

Bag checkout snapshots line IDs and a monotonic addition count. On verified payment, only the purchased quantities belonging to those line generations are removed; later additions and re-created lines remain. Buy Now never changes the ordinary bag.

## Financial behavior

All commercial totals are PostgreSQL bigint minor units, computed from approved variants and merchant settings. Price/settings changes require a fresh quote. Order submission locks inventory, creates immutable item/address snapshots and durable payment-initiation work in one transaction. Browser-supplied prices/discounts are not accepted.

Provider creation occurs outside locks. A timeout/crash after creation leaves an ambiguous attempt. The worker searches provider orders for the unique receipt instead of blindly creating another order. Unresolved cases require operator review in the provider dashboard; the code does not guess that a timeout means failure.

Webhook signatures use exact raw bytes. Event IDs and provider payment captures are unique. Processing fetches the payment from the provider and checks the stored provider-order linkage, amount, currency and captured state. Duplicate/out-of-order events do not repeat stock consumption or receipts. A late capture reallocates available stock; insufficient stock queues an idempotent full refund and keeps fulfillment unconfirmed. Duplicate distinct captures for a paid order are refunded without changing its fulfilled stock.

Refunds use Razorpay's `X-Refund-Idempotency` header with a durable request key; pending refunds are reconciled. Supported refund behavior currently covers automatic full refunds for late/duplicate captures. A general staff partial-refund/returns interface and customer cancellation policies require a separate business workflow.

Orders are paid only after server verification. Closing/failing the hosted window leaves a pending order rather than a fictitious paid receipt. Receipts are queued only for a committed paid transition; provider delivery failure remains retryable. The printable order record is not labeled a tax invoice.

The checkout success handler posts the Razorpay payment ID, order ID and signature to `POST /api/v1/me/orders/:id/confirm-payment`. This requires the customer's session, same-origin CSRF token and an account rate limit. The server loads the owned order, verifies HMAC-SHA256 against its stored provider order ID, fetches the payment directly from Razorpay and checks linkage, amount, currency and captured status. An authorized payment remains pending. Concurrent confirmation/webhook retries share the same capture transaction and cannot consume stock twice. If browser confirmation fails, webhooks and the worker still reconcile the payment.

Before testing a real purchase, set test-mode Razorpay credentials in `.env.local`, configure automatic capture in the Razorpay dashboard, register a publicly reachable HTTPS `/api/v1/webhooks/razorpay` URL for `payment.captured` with the matching webhook secret, approve variant prices/stock and merchant shipping/tax/coverage in `/admin/commerce`, and run the worker alongside the web server. A localhost webhook URL cannot receive Razorpay deliveries. Keep test and live keys, webhook secrets and transactions separate. Complete test-mode success, failure, dismissal and refund checks before changing to live keys.

## Standard Checkout setup and testing

Stack: Next.js App Router, React, TypeScript, custom Node HTTP server and PostgreSQL. The Razorpay Node SDK is installed. Existing routes and database tables are reused; no parallel payment flow was added.

Secrets are stored in Next.js's existing `.env.local`, which is excluded by `.gitignore` along with `.env`. Do not duplicate credentials in source or add a public secret variable. The browser receives only the public key ID through the owned order response; `NEXT_PUBLIC_RAZORPAY_KEY_ID` is unnecessary. A random local webhook secret has been generated. Copy the value from `.env.local` into the dashboard webhook's Secret field; generating it locally does not register the webhook.

- Create order: `POST /api/v1/checkout-sessions/:id/orders`, body `{ "version": 1 }` using the current checkout version, a UUID `Idempotency-Key`, session cookie and CSRF header. The server computes amounts from the approved quote, persists the order and immediately creates its Razorpay order using the SDK. Response includes `id` (internal order), `order_id` (Razorpay order), `amount` (paise as a decimal string) and `currency`. The worker retains creation/reconciliation recovery. Browser-supplied totals cannot override prices. Totals below 100 paise return 400. Missing customer authentication returns 401. Provider creation failures return a sanitized 500; the persisted order remains available in account orders and ambiguous requests are reconciled before another provider order is created.
- Modal: the order page's **Continue to secure payment** button loads `https://checkout.razorpay.com/v1/checkout.js` and opens Standard Checkout using the server order ID, amount, currency and public key. Delivery/contact fields prefill the modal. Dismissal, failed payment, script loading failure and script timeout show a message. Test keys display a test payment notice.
- Verify: `POST /api/v1/me/orders/:id/confirm-payment`, body `{ "paymentId": "pay_…", "orderId": "order_…", "signature": "…" }`. The success handler maps all three Razorpay fields into this request. Missing/invalid fields or signature mismatch return 400 and never mark the order paid. Ownership failures return 404. HMAC verification uses the stored provider order ID, and an independent API fetch confirms capture before stock/order state changes.

To test in the browser:

1. Keep PostgreSQL running, start the app with `npm run dev` (port 3000) or `npm run preview:production` after building (port 3100), and run `npm run worker` in a separate terminal for recovery, capture processing and expiration.
2. Open a priced, stocked product and click **Buy Now**. Complete Google sign-in, using the redirect URI for the active port. Choose/save a delivery address and calculate the total.
3. Click **Place order & continue to payment**, then **Continue to secure payment** on the saved order page. Use Razorpay's documented test payment options in the modal. Confirm that a completed captured payment changes the order to paid. Also test failure and closing the modal; neither should produce a paid order.
4. Configure automatic capture and a public HTTPS webhook URL ending in `/api/v1/webhooks/razorpay`, subscribed to `payment.captured`. Use the local secret as the dashboard secret. Test delivery and recovery when the browser closes before confirmation. Production needs live keys and its own webhook configuration.

`npm run test:http:razorpay` performs an explicit test-mode provider check against the local app: it creates a synthetic customer session and an actual unpaid Razorpay test order, verifies totals and retry reuse, rejects missing/forged signatures, then expires the unpaid local fixture and revokes its session. It cannot run against live keys or non-loopback app/database hosts. It does not collect payment or substitute for the browser payment test.

Verified locally: the authenticated app endpoint created and retrieved a real Razorpay test order with matching totals/currency; duplicate submission reused its provider order. Twenty backend integration tests, customer HTTP tests, type checking and production build passed. Browser payment completion, Google consent and dashboard webhook delivery still require manual end-to-end testing.

Files changed for this completion: `package.json`, `package-lock.json`, ignored `.env.local`, `server/modules/commerce/provider.ts`, `server/modules/commerce/service.ts`, `server/modules/checkout/service.ts`, `server/customer-router.ts`, `components/customer/order-detail.tsx`, `tests/customer-checkout.test.ts`, `scripts/http-customer.ts`, this guide and `docs/PAYMENT-SECURITY-REVIEW.md`. Created `scripts/http-razorpay.ts`. Existing `.gitignore` already excludes environment secrets and required no change. No database tables were added.

## Verification

`npm run test:backend` migrates and seeds a separate loopback `wellness_test` database. Customer tests cover simultaneous cart merges, operation replay, consumed-cart isolation, address ownership/defaults/versions, Buy Now continuation, checkout ownership, authoritative totals, duplicate orders, last-stock concurrency, later bag additions, late-capture refunds and signed webhook replay/tampering. Existing CMS/operations tests remain included.

`npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` cover source/build compatibility. `npm run test:http:customer` verifies real production HTTP auth gates, cart operations, saved addresses, checkout ownership and development-route rejection. Local tests use synthetic database sessions only inside the test fixture; no customer bypass endpoint is introduced.

Real Google/Apple consent, Apple relay delivery, physical WebAuthn ceremonies and Razorpay test-mode payment/refund delivery require configured staging credentials and the developer/provider dashboards. They cannot be certified by mocked provider responses. Keep production ordering disabled until those end-to-end checks and the merchant's tax/shipping/price approvals are complete.

## Customer settings scope

English (India) and INR are the supported language/currency; unavailable theme, language or notification-channel controls are not shown. Reduced motion uses MotionConfig; essential order messages are separate from optional marketing, which defaults off. Address limits are ten active addresses per account. Indian PIN format validation is separate from merchant-configured serviceability.

Privacy export/deletion buttons create tracked review requests; they do not immediately erase financial records or claim an export was delivered. Staff can inspect these requests using the owner-authorized customer operations API. Retention decisions and provider account-deletion lifecycle must follow the business's launch policy.

## Official integration references

- [Razorpay hosted/standard checkout steps](https://github.com/razorpay/markdown-docs/blob/master/payments/payment-gateway/web-integration/hosted/integration-steps.md)
- [Razorpay webhook validation](https://razorpay.com/docs/webhooks/validate-test/)
- [Razorpay idempotent normal refunds](https://github.com/razorpay/markdown-docs/blob/master/api/refunds/normal-refunds-idempotent.md)

