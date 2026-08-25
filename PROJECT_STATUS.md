# Dinventa — Project Status & Context

Living handoff doc for resuming this project in a future session. Last updated: end of Phase 4 (all four AI features built).

## What this is

An ecommerce site for Bangladesh (BDT pricing) with four AI-driven features layered on a normal storefront:

1. **Chat-based product search** — floating widget, natural-language query → Gemini extracts filters → redirects to `/products?...`.
2. **Admin AI trending-product discovery** — button on `/admin` → Gemini proposes candidate products → admin approve/reject queue → approved ones go live.
3. **AI phone order confirmation** — after checkout, an outbound call confirms the order in natural language; Gemini interprets the spoken response; order status updates.
4. **Automatic courier dispatch** — once an order is confirmed, a delivery parcel is created automatically with a courier.

All four are built and working. Full history/reasoning lives in the Claude plan file if you have access to it (`compiled-crunching-ritchie.md`), but this doc is the self-contained version.

## Tech stack

- **Next.js 16.3.3** (App Router, TypeScript, Turbopack) — note: Next 16 renamed `middleware.ts` → `proxy.ts` (`src/proxy.ts` here). This version is new enough that training-data assumptions about Next.js are often wrong — check `node_modules/next/dist/docs/` before assuming API shapes.
- **PostgreSQL 16** via Docker Compose, **Prisma 6.19.3** (deliberately *not* v8 — v8 requires a driver-adapter rewrite with `prisma.config.ts` + `@prisma/adapter-pg`; not worth the churn here).
- **Auth**: custom cookie-session (`jose` JWT + `bcryptjs`), not Auth.js/NextAuth — chosen because Next 16 is too new to trust a beta auth library's compatibility. See `src/lib/session.ts`, `src/lib/dal.ts`.
- **Checkout**: Cash-on-delivery only, client-side cart (localStorage), no payment gateway.
- **Dockerized**: `docker compose up --build` runs everything (app + Postgres + Adminer on :8080). No local Node/Postgres install needed.

## ⚠️ Standing rules (read before touching Docker)

1. **`docker compose restart app` is often NOT enough.** Both `node_modules` and `.next` are anonymous Docker volumes (see `docker-compose.yml`) — they persist stale state across a plain restart, causing new npm packages to be invisible or new routes to 404 even though the source is correct. **Always use `docker compose up -d --force-recreate --renew-anon-volumes app`** after adding a route, a dependency, or any change that "should have worked but didn't."
2. **`prisma/seed.ts` must never be destructive.** It used to prune any `Product`/`Category` not in its static list (a leftover from an early category migration) — this crashed the whole app on startup once real orders existed that referenced admin-approved AI products, via an FK constraint. Seeding is now purely additive (upsert-only). Don't reintroduce a "delete anything unknown" step.
3. **Server Actions can't be tested with `curl`.** They use React's internal RSC invocation protocol, not a plain POST body. To verify Server Action behavior, either (a) mint a session JWT with `jose` matching `src/lib/session.ts`'s `encrypt()` shape and hit pages/routes directly, or (b) simulate the DB-level effect via `psql` and check the resulting page render, or (c) write a temporary standalone `tsx` script that replicates the logic (see note below on `server-only`).
4. **Files with `import "server-only"` can't run via plain `tsx`** outside Next's bundler (fails with `Cannot find module 'server-only'`). For ad-hoc verification scripts, either inline-replicate the logic without that import, or strip the import temporarily. Several `src/lib/*` files (`gemini.ts`, `calls/*`, `courier/*`) have this guard.
5. **The host machine and the Docker container have separate `node_modules`.** After any Prisma schema change, run `npx prisma generate` on the host too (not just inside the container) or `tsc --noEmit` will show stale-type errors.

## Environment variables (`.env`, gitignored — see `.env.example` for the full annotated list)

Every external service has a **mock fallback** that activates automatically when its env vars are unset, so the whole app works end-to-end with zero external accounts. Real credentials upgrade specific features:

| Service | Purpose | Mock behavior when unset | Status as of last session |
|---|---|---|---|
| `GEMINI_API_KEY` | Chat search + trending products (structured AI calls) | N/A (required) | Configured, free tier, quota shared per Google Cloud *project* not per key |
| `OPENROUTER_API_KEY` | 3rd-tier LLM fallback when Gemini's quota is exhausted | N/A (required, but cheap/free-tier) | Configured, working |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | Real outbound phone calls | Logs `MOCK: would call...`, order stays pending until admin manually confirms/declines | Configured — **trial account**, see open issue below |
| `PUBLIC_BASE_URL` | Tunnel URL so Twilio webhooks reach local Docker | N/A | Was set to an ngrok URL that **will have changed** by next session — get a fresh one |
| `STEADFAST_API_KEY` / `STEADFAST_SECRET_KEY` | Real courier parcel creation | Sets a fake `MOCK-...` tracking code, still moves order to `SHIPPED` | **Not configured** — mock mode only, never tested against a real account |

None of these secrets are in this file or committed anywhere — check the actual `.env` for current values.

## Architecture patterns worth reusing

- **`generateStructured(prompt, schema, jsonShapeDescription)`** (`src/lib/llm.ts`) — the one entry point for any structured-JSON AI call. Chains Gemini primary (`gemini-flash-latest`) → Gemini fallback (`gemini-3.6-flash`, pinned) → OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`, confirmed genuinely independent — some OpenRouter ":free" models are secretly proxied through Google AI Studio and share Gemini's quota, watch for that if picking a different model). Always use this instead of calling Gemini directly.
- **External-service abstraction pattern** (`src/lib/calls/`, `src/lib/courier/`): a `types.ts` interface, a `mock.ts` implementation, a real implementation, and an `index.ts` that dynamically imports the real one only if fully configured (avoids crashing on missing env vars at module load). Follow this shape for any future external integration.
- **Admin manual-override pattern**: every automated flow (AI trending products, phone confirmation, courier creation) has a corresponding manual admin action (approve/reject, mark confirmed/declined, retry courier) so nothing gets permanently stuck if an external API fails.

## Known open issues

1. **Twilio trial account**: outbound calls work correctly (verified end-to-end with real calls), but Twilio prepends a mandatory spoken disclaimer requiring a keypress before your own TwiML plays — easy to mistake for "no audio" bug. Also, trial accounts can only call *verified* numbers (Console → Verified Caller IDs). Both restrictions go away by adding a payment method to the Twilio account. Left unresolved by user's choice when we hit it.
2. **Steadfast courier integration is unverified against a real account.** Field names/endpoint (`https://portal.steadfast.com.bd/api/v1/create_order`, `Api-Key`/`Secret-Key` headers, `invoice`/`recipient_name`/`recipient_phone`/`recipient_address`/`cod_amount` body) are cross-referenced from third-party docs/packages, not Steadfast's own official docs (couldn't get a clean fetch of those). Get real credentials and test before trusting this in production.
3. **`PUBLIC_BASE_URL`** will be stale — free ngrok/cloudflared tunnels don't have stable URLs across restarts. Get a fresh tunnel URL and update `.env` + restart before testing Phase 3 live again.

## Quick resume checklist

```bash
cd e:\Projects\dinventa
docker compose up -d --force-recreate --renew-anon-volumes app   # don't trust a plain restart
# if testing Twilio: start a tunnel (cloudflared tunnel --url http://localhost:3000, no signup needed)
#   and update PUBLIC_BASE_URL in .env, then restart again
```

Admin login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults in `.env.example`: `admin@dinventa.local` / `change-me-please`, but check `.env` for what's actually set).
