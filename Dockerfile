# =============================================================================
# AEGIS - Dockerfile Multi-Stage
# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:22-alpine AS builder

LABEL stage=aegis-builder

# Segurança: não rodar como root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 aegis

WORKDIR /app

# Cache de dependências: copiar apenas arquivos de configuração primeiro
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml pnpm-approved-builds.json ./
COPY .npmrc* ./

# Instalar dependências (com frozen lockfile para consistência)
RUN corepack enable && \
    pnpm install --frozen-lockfile --prod=false

# Copiar código fonte
COPY . .

# Ajustar permissões e rodar build como usuário não-root
RUN chown -R aegis:nodejs /app
USER aegis

# Build de produção
RUN pnpm run build

# =============================================================================
# Stage 2: Production (Nginx)
# =============================================================================
FROM nginx:1.27-alpine AS production

LABEL maintainer="AEGIS Team" \
      description="AEGIS Frontend Application" \
      version="1.0.0"

# O usuário nginx já existe na imagem base (remover padrão)
RUN rm -rf /etc/nginx/conf.d/default.conf && \
    rm -rf /usr/share/nginx/html/*

# Copiar build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .docker/entrypoint.sh /docker-entrypoint.d/40-aegis-config.sh

# Ajustar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chmod +x /docker-entrypoint.d/40-aegis-config.sh

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
