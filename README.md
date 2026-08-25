# Dinventa

An AI-driven ecommerce platform. Standard storefront (browse, cart, checkout,
orders) today; AI features (chat-based product search, admin trending-product
discovery, phone order confirmation, courier dispatch) land in later phases.

## Getting started (Docker)

```bash
cp .env.example .env
# Generate a session secret and paste it into .env as SESSION_SECRET:
openssl rand -base64 32

docker compose up --build
```

This starts:

- **app** — Next.js on [http://localhost:3000](http://localhost:3000). On
  first boot it runs `prisma migrate dev` (creates the schema) and
  `prisma db seed` (demo categories/products + the admin account from
  `.env`) before starting the dev server. Both are safe to re-run.
- **db** — Postgres 16 on `localhost:5432`.
- **adminer** — DB browser at [http://localhost:8080](http://localhost:8080)
  (system: PostgreSQL, server: `db`, credentials from `.env`).

Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` to reach `/admin`, or
register a normal account to shop as a customer (Cash on Delivery checkout).

## Getting started (without Docker)

Requires a local Postgres instance; point `DATABASE_URL` in `.env` at it
(swap the `db` host for `localhost`), then:

```bash
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Project structure

- `prisma/schema.prisma` — data model (users, categories, products, orders).
- `src/lib/session.ts`, `src/lib/dal.ts` — cookie-based auth session +
  authorization checks (custom, not a third-party auth library — see note
  below).
- `src/proxy.ts` — optimistic route protection for `/admin` and the auth
  pages (Next.js 16 renamed `middleware.ts` to `proxy.ts`).
- `src/app/` — storefront, auth, and admin routes.

**Why custom auth instead of Auth.js/NextAuth:** this project runs on
Next.js 16, which is very new and has breaking changes (e.g. the
middleware→proxy rename). Rather than depend on a beta auth library of
uncertain compatibility with such a new Next.js version, this uses the
lightweight session pattern Next.js's own docs recommend: signed JWT cookies
via `jose`, password hashing via `bcryptjs`. It's a straightforward swap for
Auth.js later if needed.
