# The Wellness House

Next.js storefront and PostgreSQL backend with revision-based CMS, private previews, Google/Apple identity, staff security keys, persistent consultation requests and carts, and a durable notification worker.

Use Node 22+. Copy `.env.example` to `.env.local` and generate the encryption key as described there. Run `npm install`, then keep `npm run db:local` running in a separate terminal (or use `docker compose up -d`). Run `npm run db:migrate`, `npm run db:seed`, and `npm run dev`.

For production: `npm run build` then `npm start`. The custom Node server is required for request-scoped metadata consistency. Configure email before running `npm run worker`.

Read [the backend guide](docs/BACKEND.md) for provider setup, one-time owner bootstrap, staff MFA, publication workflows, deployment limitations and verification commands. Payments depend on valid provider credentials and approved commerce settings; appointment allocation remains manual.

Customer checkout and account settings: see [CUSTOMER-CHECKOUT.md](docs/CUSTOMER-CHECKOUT.md). New purchases require sign-in; the merchant approves prices, inventory and delivery rules in `/admin/commerce` before enabling orders.
## Latest API audit

See [API security and efficiency audit](docs/API-SECURITY-AUDIT.md) for the current route inventory, fixes, regression checks and remaining provider/development-tool limitations.
