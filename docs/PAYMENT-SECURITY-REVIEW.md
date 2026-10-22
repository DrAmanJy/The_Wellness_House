# Payment and customer security verification

Checked 17 October 2026.

Updated payment behavior and current validation: [Captured-payment-only customer orders](./PAYMENT-FLOW-FIX.md). Unpaid provisional records are now inaccessible through customer listing/detail routes. The updated backend suite has 22 passing tests.

## Implemented and checked

- Purchase intents retain Buy Now selections through sign-in. Checkout, addresses, orders and payment confirmation require an authenticated account and enforce ownership.
- Guest carts merge once under locks; replayed merges and operation retries do not duplicate additions. Later additions survive paid-order cleanup.
- Server quotes and immutable order snapshots determine prices, tax, shipping, quantities and currency. Inventory reservations prevent concurrent last-unit overselling.
- Checkout confirmation validates the signature using the stored provider order ID and server secret, then fetches the payment from Razorpay. Wrong ownership, signatures, provider order/payment IDs, amounts and currencies cannot complete an order. Authorized-only payments remain pending.
- Browser confirmation and signed webhook processing share capture deduplication and stock transactions. Repeated confirmations cannot deduct stock twice. Late payments without stock queue refunds.
- Confirmation requires same-origin CSRF protection and is rate limited per account. CSRF tokens now require the generated ASCII token format before constant-time comparison, including rejection of malformed multibyte values.
- Provider secrets remain server-side. Production development-login bypasses return 404. Private responses use no-store caching.

## Validation results

- Backend integration suite: 18 passed, including malicious confirmation inputs, duplicate/concurrent captures, stock races, cart merges, webhook tampering and ownership boundaries. Provider responses in these tests are synthetic.
- Unit suite: 5 passed.
- Production HTTP customer checks: passed, including unauthenticated confirmation (401), unknown owned order (404), invalid IDs (422) and cross-origin confirmation (403).
- HTTP boundary checks and smoke checks: passed.
- Type check and production build: passed.
- Lint: zero errors; seven existing image optimization warnings.
- Production dependency audit: zero known vulnerabilities reported at the time of this check. This is not proof that dependencies have no undiscovered vulnerabilities.
- The full development dependency audit reports 18 findings (11 moderate, 7 high), including tooling dependency chains. Those tooling upgrades were not forced as part of the payment integration; the production dependency audit remains clear.

## Remaining provider verification

Google credentials are present, but this review did not complete a real Google consent ceremony. The login/checkout HTTP checks use test database sessions.

Razorpay test key ID and key secret were subsequently configured in the ignored local environment file. A read-only provider request returned HTTP 200. A separate INR 1 test-mode provider order was created and retrieved. The authenticated application checkout endpoint also created a real test-mode provider order with matching server totals and reused it on retry. A local webhook secret was generated, but dashboard registration and delivery remain unverified. No actual payment or refund was completed, so end-to-end payment success cannot be certified yet. Ordering, delivery coverage and purchasable variants are configured in the local database; those business values were not changed by this review. The updated backend suite has 20 passing tests, including the 100-paise minimum and provider-order reuse.

Follow [the setup guide](./CUSTOMER-CHECKOUT.md): install test credentials, configure automatic capture, register a public HTTPS payment.captured webhook, and run the worker. Complete a real test purchase after Google login, a declined payment, closing the payment window, duplicate webhook delivery, confirmation recovery and a refund before enabling live payments. Use approved production business settings and HTTPS deployment.

This is a scoped implementation review and regression check, not a complete penetration test or a guarantee of being exploit-free. Deployment configuration, provider dashboards and real account/payment flows still need verification.
