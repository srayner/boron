# ---- Stage 1: build ----
# Full dependency set (incl. dev) to generate the Prisma client and build Next.js.
FROM node:26-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Dependencies first so this layer is cached until the lockfile changes
COPY package*.json ./
RUN npm ci

# Everything else (see .dockerignore)
COPY . .

RUN npx prisma generate
RUN npm run build

# ---- Stage 2: production dependencies ----
# Dev dependencies (vitest, playwright, tsx, prisma CLI, ...) are never installed here.
FROM node:26-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Reuse the Prisma client generated in the builder (same platform and version).
# It lands in node_modules/.prisma, next to the prod @prisma/client.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# ---- Stage 3: runtime ----
FROM node:26-alpine AS runner

# Prisma's query engine needs openssl at runtime
RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
