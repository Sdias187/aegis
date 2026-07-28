# =============================================================================
# AEGIS Backend - Dockerfile
# =============================================================================
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install --frozen-lockfile --prod=false

COPY . .
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-alpine AS production

WORKDIR /app

# Apenas produção (sem devDependencies)
COPY package.json ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
