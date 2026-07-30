#!/bin/sh
# =============================================================================
# AEGIS - Entrypoint Script
# =============================================================================
# Este script é executado pelo Nginx durante o startup para
# substituir variáveis de ambiente no nginx.conf
# =============================================================================

set -e

# Verificar se a variável API_URL está definida
if [ -z "${API_URL}" ]; then
    echo "[AEGIS] WARNING: API_URL não definida. Usando http://localhost:8090 como padrão."
    export API_URL="http://localhost:8090"
fi

# Substituir ${API_URL} no nginx.conf
# O Nginx não suporta envsubst por padrão, então fazemos manualmente
if [ -f /etc/nginx/conf.d/default.conf ]; then
    sed -i "s|\${API_URL}|${API_URL}|g" /etc/nginx/conf.d/default.conf
fi

echo "[AEGIS] Configuração aplicada:"
echo "[AEGIS]   API_URL: ${API_URL}"
echo "[AEGIS] Nginx iniciado com sucesso."
