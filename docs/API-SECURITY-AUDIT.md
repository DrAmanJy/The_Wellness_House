# API and security audit — 17 October 2026

Scope: the actual Next.js/Node HTTP server, the `/api/v1` dispatcher, customer and staff services, PostgreSQL constraints, OAuth/MFA, checkout/Razorpay, worker recovery, browser API client, dependencies and production headers. This is a scoped source review and regression audit, not a claim that every possible exploit has been eliminated.

## Findings fixed

| Finding | Result |
| --- | --- |
| Development step-up endpoint bypassed the explicit development-auth opt-in | Both development shortcuts require `ALLOW_DEV_ADMIN_AUTH=true` and always reject production access. |
| Dispatchers ignored trailing path segments and accepted unintended methods | A central exact route/method inventory rejects unknown shapes with 404 and unsupported methods with 405 before session or database work. Apple and Google callbacks accept only their intended methods. |
| Duplicate/dead cart controller and older payment API aliases increased the surface | Removed the obsolete cart controller, order-initiation alias and order-ID payment confirmation alias. The active customer cart and checkout-session payment routes remain. |
| Session authentication wrote on every request and separately fetched staff roles | One database statement reads the current user/session/roles and updates activity only after five minutes. Revocation and role changes still take effect on the next request. Malformed tokens are rejected before SQL. Public catalog/search/variant routes skip unnecessary session work. |
| Profile/preferences GETs inserted rows | Reads now return defaults without writing. Rows are created only when a customer saves settings. |
| Every frontend mutation fetched another CSRF token | The client reuses a token with single-flight acquisition, refreshes after an explicit CSRF rejection and retries once. Permission failures do not trigger another mutation. |
| Payment-status GET could contact Razorpay and finalize transactions | GET is now read-only. The checkout uses CSRF-protected POST for explicit provider refresh/reconciliation, retaining owner checks, rate limits and provider throttling. |
| A duplicate initial status request and retry state could undermine bounded confirmation polling | Removed the duplicate request; polling stays bounded across pending/confirming states and does not unconditionally enable payment during authorization/capture confirmation. |
| Static fallback could republish seed content when publication data was unavailable | Public content queries now fail closed rather than bypassing the authoritative publication state during a database outage. |
| Inline JavaScript was broadly permitted in production | Production uses unique cryptographic nonces and strict dynamic script policy. Server overwrites supplied nonce headers; Next scripts and structured-data scripts carry the request nonce. Frame headers deny embedding. Development keeps the allowances needed for its tooling. |
| OAuth POST callback read an unbounded request body | OAuth callbacks and JSON APIs use bounded body reading. JSON APIs require the correct media type. Signed null/array webhook bodies return 400 rather than an internal error. |
| Staff-factor completion did not repeat current eligibility/enrollment checks | Verification checks current staff eligibility; registration checks recent sign-in and any existing-factor step-up under the user lock. |
| Account linking could finish after the initiating session was revoked, especially when Apple omits a Lax session cookie | OAuth transactions record the initiating session. Linking requires that stored session to remain valid, even when callback cookies omit it. Existing in-flight link transactions without that proof must restart. |
| An older email-verification request could remain usable after a newer request | A new request invalidates previous unused tokens under the existing customer lock, preserving their records. |
| Public cart and customer-write endpoints lacked a consistent abuse bound | Added per-account/network cart limits and per-account write limits. Existing payment, OAuth, forms, search and media bounds remain. |
| Expired rate-limit/OAuth/challenge state accumulated indefinitely | Migration 009 adds expiry indexes and initiating-session linkage. Worker cleanup removes disposable expired state in bounded batches and never removes financial/audit records. |
| Integration status API reported commerce as always unavailable | Owner/MFA-protected status now reflects complete configured credential sets without exposing their values. It reports configuration, not successful provider authentication. |
| Unused SDK/tooling dependencies expanded the installed surface | Removed unused `@google/genai`, `firebase-tools`, `drizzle-kit`, and `@tailwindcss/typography`. The removal eliminated 556 installed packages. Existing PostgreSQL SQL migrations and Drizzle ORM remain supported. |
| Production build depended on mutable remote Google-font responses | The final build exposed a Next Google-font loader failure. The same Plus Jakarta Sans and Cormorant Garamond fonts now use bundled variable font files with `next/font/local`. No visual redesign or third-party font request is needed at build time. |

## API inventory and behavior

The authoritative inventory is `server/security/routes.ts`. It includes public catalog/search, forms, bounded analytics, signed Razorpay webhooks, Google/Apple sign-in, customer cart/purchase intent/checkout/account routes, protected staff WebAuthn, private media and CMS/operations/admin routes. Unknown suffixes and unused aliases do not fall through to another controller.

The active payment endpoints are `POST /checkout-sessions/:id/payment-attempts`, `POST /checkout-sessions/:id/confirm-payment`, read-only `GET /checkout-sessions/:id/payment-status`, and CSRF-protected refresh `POST /checkout-sessions/:id/payment-status`, all beneath `/api/v1`. Only confirmed paid purchases enter customer history; refund history remains visible. Signed raw-body webhooks and the worker still recover independently of the browser.

Readiness checks now require migration 009 instead of reporting success from an unexamined foundation query. Production public/private responses remain no-store except hashed static assets; private media, previews and customer data keep their ownership/access boundaries.

## Verification

- 34 automated regression/integration tests passed, including route rejection, explicit dev bypass gating, immediate session revocation, fresh staff roles, conditional activity writes, read-only account defaults, superseded verification tokens, staff ceremony denial, bounded input, signed malformed webhooks, fail-closed content and CSRF recovery.
- Existing payment tests cover authoritative amounts, identity ownership, signature tampering, authorized-only invisibility, capture/confirmation deduplication, stock concurrency, late refunds and transaction-failure recovery.
- Production HTTP customer suite passed with added malformed-route, obsolete-alias, method and non-staff MFA cases.
- Production HTTP security suite passed: unique server nonces, every rendered script carries the matching nonce, client-supplied nonce ignored, no production unsafe-inline/unsafe-eval script policy, unknown paths and methods denied.
- Production HTTP CMS/media/preview boundary suite passed.
- Real browser hydration and shopping-bag interaction worked under CSP, with no recorded browser error logs during that check. No purchase or bag content mutation was performed for the browser check.
- TypeScript, lint and production build passed. Lint retains eight image optimization warnings; no errors.
- Migration 009 applied to the local database and isolated test database.

Repeat checks: `npm run test:backend`, `npm run test:http:customer`, `npm run test:http:security`, `npm run test:http:boundaries`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm audit --omit=dev`.

## Remaining limits requiring attention

1. Production dependency audit reports zero known vulnerabilities. The complete development audit still reports five high findings in the `braces` → `micromatch` → `fast-glob` → Next ESLint tooling chain. npm's proposed automatic fix downgrades the Next ESLint configuration to a different major version. That downgrade was not forced and these findings are not represented as fixed. They are not dependencies of the deployed application runtime.
2. The last direct Razorpay authentication check returned HTTP 401 using the values saved in `.env.local`. Valid matching provider credentials and process restart are still necessary for live-provider verification; this audit does not change secrets or claim payment completion.
3. Actual Google/Apple consent, physical WebAuthn ceremonies, a complete Razorpay browser payment/refund and provider dashboard webhook delivery require external accounts/devices/configuration. Local isolated tests do not certify those external steps.
4. Production deployment, TLS termination, trusted-proxy configuration, database roles/backups, infrastructure rate limits and host access were not penetration-tested. Development intentionally uses local HTTP and development-only script allowances.

No external messages were sent, financial audit records deleted, or pending purchases fabricated as paid during this audit.
