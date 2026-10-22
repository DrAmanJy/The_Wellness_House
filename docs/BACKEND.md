Latest customer/commerce implementation: see [CUSTOMER-CHECKOUT.md](CUSTOMER-CHECKOUT.md). It extends the baseline below with saved addresses, login-required checkout and an opt-in payment integration.

# The Wellness House backend

The storefront now uses PostgreSQL. The default release is a consultation-only catalog; checkout, payments, stock reservations and live appointment allocation are intentionally disabled. Existing editorial claims are imported as supplied content and need editorial approval before launch.

## Local development

Use Node 22 or newer. Copy `.env.example` to `.env.local` and generate a 32-byte base64 `NOTES_ENCRYPTION_KEY`. A development environment file and a seeded local database were created during implementation; no provider credentials were invented.

1. `npm install`
2. `npm run db:local` in a separate terminal, or `docker compose up -d`. Both use loopback port 55432; run only one.
3. `npm run db:migrate`
4. `npm run db:seed`
5. `npm run dev`
6. `npm run worker` in another terminal after configuring transactional email.

The embedded database persists in ignored `work/postgres`. Private images persist in `work/private-media`. Back up these paths for local use. Production should use managed PostgreSQL and a persistent private media volume; ephemeral/serverless filesystems are unsupported by this local media adapter.

`npm run build` then `npm start` runs production. **Use these custom-server commands**, not `next start`, standalone output, or a platform that bypasses `server/http.ts`. AsyncLocalStorage provides one immutable content resolution per entity per HTTP request, shared by metadata and body. It is discarded after the response; no content is cached between requests. A missing request context fails closed instead of producing inconsistent metadata. This requires a persistent Node process and excludes Next's standalone output mode.

## Identity and staff

Google and Apple use `openid-client` Authorization Code/OIDC, signature validation, exact issuer/audience/nonce/state checking, single-use server transactions and a hashed browser correlation cookie. Google uses PKCE. Apple receives `form_post`; its short-lived correlation cookie is Secure/SameSite=None. Apple needs HTTPS even in staging. The application session remains HttpOnly/SameSite=Lax, uses a `__Host-` cookie in production, idle expiry and absolute expiry, and stores only token hashes.

Set each provider's client ID and secret, with callbacks:

- `APP_ORIGIN/api/v1/auth/google/callback`
- `APP_ORIGIN/api/v1/auth/apple/callback`

Apple's client secret is a signed JWT created from the developer key; rotate it before expiry. Configure relay senders with Apple. Access and refresh tokens are not retained. Accounts are keyed by provider + issuer + subject; matching emails never merge identities. Linking needs a recently authenticated existing session and a fresh second-provider callback. Unlinking keeps at least one identity.

Open `/account`, sign in with a verified provider identity, obtain its UUID from `/api/v1/me`, then run `npm run owner:bootstrap -- <uuid>`. This one-time command records completion in PostgreSQL and revokes existing sessions. Sign in again and enroll a security key. No default staff password exists. WebAuthn user verification is required for enrollment and staff step-up; privileged service calls expire after 15 minutes. Staff invitation acceptance matches a verified provider email, and staff services still require enrollment/step-up.

Provider credentials, real browser Apple callback/relay tests, Apple account-change notification and token-revocation/account-deletion lifecycle integration require deployment work before launch. Do not represent local unit tests as end-to-end provider certification. There is no password fallback or development authorization bypass.

## CMS and privacy

`/admin` offers field editing plus an advanced JSON document editor. Products, collections, journal, pages, videos, global configuration, locations and email templates share `content_entities` and immutable `content_revisions`. This avoids separate competing revision engines. SQL composite foreign keys enforce revision ownership. SQL triggers protect immutable revisions and append-only publication/audit records.

Save creates a Preview revision. Publish/Unpublish/Rollback require a current entity version and publisher permission. A stale edit returns 409. Publishing verifies schema and ready media. Changing a product/post slug becomes public only on publication, reserves historical slugs, and creates 308 redirects. Scheduled publications recheck actor role/account status and expected version at execution; stale schedules are rejected. Their authorization was granted with MFA when scheduled, not synthesized by a logged-in browser at execution.

Page documents accept text, hero, FAQ and product-reference sections; `enabled` and array order control visibility/order. Create `home` to replace the homepage with CMS sections. Existing informational pages allow CMS overrides with their route slug; other published page slugs render through the dynamic page route. Existing original page layouts remain the default until an override is published. Navigation, footer links, announcement, approved fonts, primary/background colors, logo and radius are editable in `site-config/global`. New section/component types still require development.

Private preview links contain 32 random bytes, return the raw secret once, expire by default in 72 hours (maximum seven days), and exchange into a scoped HttpOnly preview session before redirecting. Revocation and expiry are rechecked on every page/media request. Links remain pinned to their revision. Optional reviewer login currently means **any signed-in reviewer**, not a named-reviewer allowlist. Link holders can forward bearer links.

Product previews reuse the dossier renderer and omit purchasing controls. Generic page previews use the same section renderer. Other content types use a read-only editorial preview. Preview responses are no-store/noindex/nofollow/noarchive/nosnippet with no-referrer; the application suppresses preview-entry request logging. Configure the reverse proxy, APM and error tracker to redact `/preview/rituals/*` completely too.

Images are uploaded into private local storage, decoded and re-encoded as WebP with pixel/byte bounds and metadata removal. Only ready images referenced by a live revision are public. Other image reads require a current staff step-up or matching preview grant. Private paths are excluded from the Next image optimizer. This adapter accepts JPEG/PNG/WebP; S3 signed uploads, malware-scanned/transcoded video uploads, resumable uploads and video range serving are deployment extensions, not implemented by the image adapter. Existing allowlisted hosted films can be edited in the CMS. Do not use publicly hosted URLs for confidential draft media.

## Forms, customer state and jobs

Contact and consultation requests validate strict schemas, explicit consent, body limits, same-origin CSRF tokens and database rate limits. A UUID Idempotency-Key protects retries. The request, consent and two durable notification jobs commit atomically. Consultation status begins `requested`; the UI does not claim a reservation or sent invitation. Health notes are AES-256-GCM encrypted in a separate table and excluded from jobs/email/logs. Only assigned authorized staff can read notes, and reads are audited. Rotate encryption keys through a controlled re-encryption migration before retiring an old key; the current runtime has one configured active key.

Carts use hashed random guest cookies or authenticated ownership, store variant IDs/quantities, cap quantities and merge at sign-in. Saved rituals require sign-in. Existing localStorage bookings and cart objects are not imported. No client price is trusted; no paid checkout endpoint exists. Consultation scheduling statuses are manually managed; changing a status is not a slot reservation or calendar invitation.

The worker uses `FOR UPDATE SKIP LOCKED`, finite leases and per-attempt lease tokens. Notification jobs use Resend with provider idempotency keys. Failures back off up to eight attempts, then remain inspectable in `/admin` jobs. Email templates support only `{{name}}`, `{{reference}}`, `{{status}}` text substitutions, not executable expressions. Provider idempotency windows are finite, so exactly-once delivery cannot be guaranteed after an ambiguous outage.

## API

Versioned APIs live in `app/api/v1/[...path]/route.ts`. Domain code under `server/modules` does not import Next. All mutations use Origin plus synchronizer CSRF tokens except validated OAuth callbacks. `/api/v1/csrf` issues the session-bound browser cookie/token pair. Responses include request IDs and consistent errors. List endpoints use an `after` UUID cursor and a maximum of 50 items. Public readers expose only live content.

Key routes: products, collections, journal, videos, search, cart/items/:slug, saved-rituals, consultation-requests, contact-inquiries, me, me/consultations, account/unlink, auth/:provider, auth/:provider/link, mfa/:register-or-verify/:options-or-verify; admin content CRUD/revisions/publication/preview-links, consultations/inquiries, staff, redirects, integrations, jobs; media; health/live and health/ready.

Cart mutation compatibility currently addresses a product slug and resolves its default active variant on the server. Multiple selectable variants, operational pricing and inventory editing await commerce activation. Variant identities exist separately from editorial snapshots, and collection-product membership is revision-owned.

## Verification and deployment

- `npm run typecheck`
- `npm test`
- `npm run test:backend` (creates a separate `wellness_test` database on a loopback PostgreSQL host)
- `npm run build`
- `npm audit --omit=dev`

Integration tests cover revision immutability, publication conflicts, request snapshot consistency during publication, preview revocation/pinning, staff MFA, CSRF, URL/section injection, authenticated encryption, form idempotency, cart isolation/merge and worker leases. Production HTTP checks cover actual HTML, metadata, no-store headers and forbidden mutations. Google/Apple and physical security-key ceremonies still need real configured staging browsers.

Use separate migration/application/worker database credentials. Run migrations as schema owner; never automatically on web startup. Restrict application grants to the required tables and sequences, with SELECT/INSERT only on immutable history. Provide a trusted APP_ORIGIN, trusted-proxy configuration only behind a header-replacing proxy, HTTPS and private database networking. No shared response cache, ISR, React cache or CDN caching for HTML/API/media. Static assets are a separate deployment policy.

Before launch: configure provider secrets and mail, review seeded claims and policy/retention text, verify Apple lifecycle requirements, migrate media to the intended storage/processing provider if needed, test proxy cache/log redaction, run measured load tests, configure queue/error alerts and perform a backup/restore drill. Back up PostgreSQL and private media together. Google rich-result and search-console checks require a deployed public origin. Optional commerce/scheduling must remain unavailable until their business rules and separate transaction/security tests are implemented.
