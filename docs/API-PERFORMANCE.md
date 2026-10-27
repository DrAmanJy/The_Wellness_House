# API latency improvements — 27 October 2026

Implemented in the repository without Redis. The additive migration was applied to the project's configured Neon database and isolated local databases. The application changes have not been deployed to Vercel by this task. Live HTTP measurements were read-only.

## Diagnosis

The supplied screenshot shows approximately four seconds waiting for the cart mutation response. The deployed response headers identify the function region as `iad1` (Washington), while the repository's configured Neon database endpoint is in AWS `ap-southeast-1` (Singapore). Verify that production uses this same database region when deploying. A mutation previously ran two application transactions and many sequential SQL calls, multiplying cross-region network latency. Redis would not remove that write-path problem.

Read-only production measurements from this machine, before deployment of the fix (four samples per route, including cold/cache effects):

| Route | Observed median | Largest sample | Observation |
| --- | ---: | ---: | --- |
| `/api/v1/health/live` | 398 ms | 651 ms | No DB work; already pays the distant function/network baseline |
| `/api/v1/bootstrap` | 602 ms | 1,935 ms | Unnecessary and fragmented private-data lookups |
| `/api/v1/cart` | 806 ms | 827 ms | Empty-cart lookup and rate limiting; first exploratory request also took 2.2 s |
| `/api/v1/variants/metabolic-balance-protocol` | 66 ms | 157 ms | Existing public CDN cache was serving stale-while-revalidate responses |
| `/api/v1/products` | 110 ms | 931 ms | Existing CDN hits were fast; origin misses were slower |
| `/api/v1/search?q=botanical` | 806 ms | 813 ms | Rate-limit SQL followed by search SQL |

These are diagnostic samples, not a production load test. No live customer cart POST/PUT/DELETE was replayed or altered to gather these measurements.

## Changes

- Set Vercel function region to `sin1` in `vercel.json`, with matching Next.js API/root-layout `preferredRegion` exports, colocating functions with the configured Singapore database on the next deployment.
- Migration `010_cart_round_trips.sql` adds invoker-rights PostgreSQL functions for consistent snapshots, owned cart mutation and owned cart clearing. Cart row locks, ownership/guest capability checks, expected versions, replay fingerprints, the 50-line/99-unit limits, published supply validation, monotonic additions and the returned snapshot execute in one database call. The functions retain a three-second lock timeout. No intermediate transaction or extra connection is opened.
- Cart reads return contents and version from one statement instead of separate snapshots. A cart is created lazily on the first successful add; empty visitors do not need an empty database row. Fixed the frontend's refusal to add when that initial cart ID is empty.
- Bootstrap uses zero DB calls for a brand-new anonymous visitor, one for a returning guest cart, and one combined data query after the authenticated session query. Guest-cookie rotation handles consumed carts without swallowing database errors.
- Checkout, paid-order details and saved-address reads each use one database statement. Ownership filters, confirmed-order visibility and authoritative financial calculations remain intact.
- Cart checkout resumption reuses its current transaction connection instead of opening a nested transaction/pool checkout. This avoids pool starvation under load. Other transactions combine `BEGIN` and their fixed local lock-timeout setting into one call.
- Keep one existing process-wide PostgreSQL pool with TCP keep-alive. Do not increase pool size indiscriminately; the configured endpoint already uses Neon's pooler.
- OAuth, WebAuthn, media processing and Razorpay modules load only for the routes that use them, reducing unrelated cold-start initialization.
- Product cards, product detail and Add to Bag share public variant requests with a bounded 30-second per-tab cache. Only public SKU display data is cached; checkout always recalculates prices from PostgreSQL. No auth/session/cart/stock/order snapshots are cached across requests or users.
- Account/consultation navigation links no longer trigger speculative Next.js prefetch work just because they are visible. Root catalog/config reads run together, and React request-scoped caching deduplicates repeated published-content reads during one server render.
- API responses expose `Server-Timing` for total handler time, summed DB execution/network time and DB call count. No SQL text, credentials or user data are exposed. `app` excludes the edge-to-function/network transit; DB connection/pool waiting can also explain a gap between `app` and summed `db`. Parallel DB durations can add up beyond wall time. Cached public responses can contain timing from their original render.

## Local benchmark and regression checks

Twenty warm samples on the same local PostgreSQL instance, with no artificial latency:

| Cart service path | DB calls | Median | p95 |
| --- | ---: | ---: | ---: |
| Retained legacy ensure-cart + mutation | 15 | 3.77 ms | 4.36 ms |
| New owned atomic mutation | 1 | 0.97 ms | 1.33 ms |

Both service measurements exclude common HTTP, authentication and rate-limit work. Shared transaction/snapshot helpers are already optimized in the retained legacy path, making this a conservative comparison. The HTTP customer check asserts at most three database calls per successful cart item write, including session validation and rate limiting. The seven new tests cover single-call budgets, first add, replay/mismatched replay, concurrent increments, optimistic edit conflicts, guest merge isolation, foreign ownership, clearing, bootstrap budgets, checkout/address reads and public-variant request deduplication/retry.

Local HTTP read measurements with a local database were approximately 5–9 ms median across health, bootstrap, cart, variants, products and search, with larger cold first requests. Those values are **not** claimed as deployed Vercel latency. The original four-second cart write can only be remeasured after the migration and regional redeployment.

Three controlled local HTTP cart POSTs took 18.42 ms, 11.30 ms and 7.37 ms, with respectively 3, 2 and 2 DB calls including authentication/rate limiting. These used isolated fixtures and did not mutate a live customer's cart. All 41 tests also passed with the pool limited to one connection, checking that checkout resumption no longer depends on nested pool acquisitions. Shared bootstrap state is invalidated on logout/expiry/account changes, and delayed add actions recheck their account generation before posting.

Validation: 41 backend/regression tests, TypeScript, lint, production build, HTTP customer/ownership/cart replay checks, security-header checks, HTTP smoke and media/CMS boundary checks. Lint retains existing image optimization warnings. No successful payment or refund was fabricated or executed for this performance task.

## Rollout order

1. Confirm the production `DATABASE_URL` is the Singapore endpoint. If it uses another region, choose that region consistently in `vercel.json` and both `preferredRegion` exports.
2. Confirm migration 010 is installed in the deployment database **before deploying**. It has already been applied to the repository's configured Neon database and isolated local databases. If Vercel uses another database, apply `npm run db:migrate` there first. Migration 010 only creates the cart functions; it does not rewrite customer cart or financial records. Readiness now requires migration 010.
3. Deploy the updated repository to Vercel. Normal builds still use `.next`; `NEXT_BUILD_DIR=.next-production` is only an optional isolated local build setting. No Redis or extra cache service is needed.
4. Verify new dynamic responses show `sin1` in `x-vercel-id`, then inspect the cart POST in DevTools. Check `Server-Timing`: a successful signed-in write should show `db_calls` at most 3, and a guest write at most 2. Existing public CDN hits are measured separately.
5. Test a new visitor's first add, retry of the same operation ID, quantity changes, clearing, login merge and checkout. Retain private/no-store caching on customer endpoints.

Repeatable commands:

- `npm run test:backend` — requires a loopback database; uses isolated `wellness_test`.
- `npm run bench:cart` — deliberately refuses non-loopback/non-test databases.
- `npm run bench:http` — read-only route measurements; defaults to localhost:3100. Set `BENCH_ORIGIN` and optionally `BENCH_SAMPLES` for another environment.
- `npm run test:http:customer`, `npm run test:http:security`, `npm run test:http:boundaries`.

Benchmark JSON is written beneath ignored `work/performance/`. The unrelated pre-existing `a.js` file was left untouched.

References: [Vercel function regions](https://vercel.com/docs/functions/configuring-functions/region), [node-postgres pooling](https://node-postgres.com/features/pooling).
