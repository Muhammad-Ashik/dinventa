FROM node:20-alpine AS base
# openssl is required by the Prisma query engine on Alpine; libc6-compat
# smooths over a handful of native deps Next.js sometimes pulls in on musl.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# postinstall runs `prisma generate`, which needs the schema present.
COPY prisma ./prisma
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM deps AS builder
ENV NODE_ENV=production
COPY . .
RUN npm run build

# Last stage = default `docker build` target (no --target flag), which is
# what Railway/Render use — keep this stage last so a plain build picks it.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# prisma/seed.ts imports src/lib/product-image.ts directly and runs via
# plain `tsx` (not Next's bundler), so the source tree needs to be present
# at runtime, not just the compiled .next output.
COPY --from=builder /app/src ./src
EXPOSE 3000
# migrate deploy (not `migrate dev`) applies committed migrations
# non-interactively — safe to run on every deploy, no-ops if already applied.
# Seeding is upsert-only (see prisma/seed.ts) so it's also safe to re-run.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]
