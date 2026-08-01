# Guia de Deploy

Este guia cobre a implantação do AEGIS em pre-produção e produção, via Docker ou manualmente, incluindo o modo de teste sem banco e a solução de problemas.

## Índice

1. [Visão geral do deploy](#1-visão-geral-do-deploy)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Configuração de ambiente](#3-configuração-de-ambiente)
4. [Deploy com Docker](#4-deploy-com-docker)
5. [Deploy manual (sem Docker)](#5-deploy-manual-sem-docker)
6. [Modo MOCK_DB](#6-modo-mock_db)
7. [Verificação](#7-verificação)
8. [Referência de portas](#8-referência-de-portas)
9. [Solução de problemas](#9-solução-de-problemas)

## 1. Visão geral do deploy

O AEGIS é implantado em três camadas:

```
Usuário → Nginx :80  → /api/*  → Backend NestJS :8090 → Oracle DB :1521
                    → /*      → Frontend (arquivos estáticos)
```

| Camada   | Tecnologia             | Porta          |
| -------- | ---------------------- | -------------- |
| Frontend | React buildado (Nginx) | 80             |
| Backend  | NestJS 10              | 8090 (interna) |
| Banco    | Oracle DB              | 1521           |

## 2. Pré-requisitos

- **Node.js 22+** e **pnpm 10+** (deploy manual)
- **npm** (backend)
- **Docker Desktop 24+** (deploy em container)
- **Acesso ao Oracle** com as tabelas `AEGIS_FICHAS`, `AEGIS_TRAVAS`, `AEGIS_BADLIST`, `AEGIS_FICHAS_TRAVAS`, `AEGIS_LOGS` e `AEGIS_MONITORING_LOGS` (ver [Modelo de dados](../explanation/modelo-de-dados.md))
- Scripts DDL em `backend/init-scripts/` (executados manualmente — **não** automáticos)

## 3. Configuração de ambiente

### 3.1 Backend — `backend/.env`

Criar a partir de `backend/.env.example`:

```env
# Oracle
ORACLE_USER=SEU_USUARIO
ORACLE_PASSWORD=SUA_SENHA
ORACLE_CONNECTION_STRING=host:1521/NOME_DO_SERVICO

# Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=1

# Servidor
PORT=8090
LOG_LEVEL=info

# Mock (false para usar banco real)
MOCK_DB=false
```

### 3.2 Frontend — `.env.production`

```env
VITE_API_URL=/api/v1
VITE_API_TIMEOUT=30000
VITE_FF_ENABLE_MOCK_API=false
VITE_PWA_ENABLED=true
```

> O build de produção usa `.env.production`. Todas as variáveis `VITE_*` são embutidas no bundle no momento do build.

## 4. Deploy com Docker

### 4.1 Stack completa (Oracle local + Backend + Frontend)

```bash
docker compose up -d

# Acompanhar logs
docker compose logs -f

# Acessar
# http://localhost
```

Isso inicia três serviços:

| Serviço     | Imagem / conteúdo         | Porta          |
| ----------- | ------------------------- | -------------- |
| `aegis-app` | Nginx servindo o frontend | 80             |
| `aegis-api` | Backend NestJS            | 8090 (interna) |
| `oracle-db` | Oracle XE 21c             | 1521           |

> Na primeira execução, o Oracle leva **~2 minutos** para inicializar (`start_period: 120s` no healthcheck). O backend só sobe depois que o Oracle estiver saudável (`condition: service_healthy`).

> **Nota:** os scripts de criação de tabelas **não são executados automaticamente**. Se o banco for novo, rode `01-create-tables.sql` manualmente (ver [Modelo de dados](../explanation/modelo-de-dados.md)).

### 4.2 Apenas Backend + Frontend (Oracle remoto/corporativo)

Quando o Oracle está em um servidor corporativo, use o `docker-compose.test.yml`:

```bash
ORACLE_USER=usuario \
ORACLE_PASSWORD=senha \
ORACLE_CONNECTION_STRING=servidor:1521/SERVICO \
docker compose -f docker-compose.test.yml up -d
```

### 4.3 Desenvolvimento com hot reload (Docker)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

O serviço `aegis-app` vira um container Node 22 rodando `pnpm dev --host` na porta 5173 com o código montado em volume (hot reload).

### 4.4 Comandos úteis

```bash
# Logs de um serviço específico
docker compose logs aegis-api
docker compose logs oracle-db

# Parar tudo
docker compose down

# Parar e apagar o volume do Oracle (recriar banco do zero)
docker compose down -v

# Rebuild de um serviço
docker compose build aegis-api
```

## 5. Deploy manual (sem Docker)

### 5.1 Backend

```bash
cd backend

# 1. Configurar ambiente
cp .env.example .env
# Editar .env com as credenciais Oracle

# 2. Instalar dependências
npm install

# 3. Compilar
npm run build

# 4. Iniciar
npm start
# Servidor em http://localhost:8090
```

### 5.2 Frontend

```bash
# 1. Instalar dependências (raiz)
pnpm install

# 2. Build de produção
pnpm run build

# 3. Servir com Nginx (recomendado)
# Usar a config em .docker/nginx.conf
# Ou via preview do Vite:
pnpm run preview
# Servidor em http://localhost:4173
```

### 5.3 Proxy Nginx manual

Configuração mínima para servir o build com o backend:

```nginx
server {
    listen 80;
    server_name localhost;
    root /caminho/para/aegis/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> A configuração de produção completa (cabeçalhos de segurança, gzip, cache, service worker) está em `.docker/nginx.conf` e é usada pela imagem Docker do frontend.

## 6. Modo MOCK_DB

Para executar o backend **sem Oracle** (testes, demonstração, desenvolvimento):

```bash
MOCK_DB=true npm run start:dev
```

Ou defina no `backend/.env`:

```env
MOCK_DB=true
```

Neste modo:

- O backend **ignora a conexão Oracle** e inicializa normalmente.
- Todas as queries retornam arrays vazios → `{ data: [], pagination: { total: 0 } }`.
- Ideal para testar navegação, fluxos de interface e importação massiva.
- Log de inicialização:

```
WARN [DatabaseService]  MOCK_DB = true — rodando sem banco
WARN [DatabaseService]  Todas as queries retornarão dados vazios
```

## 7. Verificação

Após subir o backend, teste os endpoints:

```bash
# Health check
curl http://localhost:8090/health

# Dashboard
curl http://localhost:8090/api/v1/dashboard/summary

# Fichas
curl "http://localhost:8090/api/v1/fichas?page=1&limit=5"

# Travas
curl "http://localhost:8090/api/v1/travas?page=1&limit=5"
```

Com Docker, os mesmos endpoints ficam disponíveis em `http://localhost/api/v1/...` (proxy do Nginx).

## 8. Referência de portas

| Ambiente | Serviço  | Porta | Observação                  |
| -------- | -------- | ----- | --------------------------- |
| Dev      | Frontend | 5173  | Vite dev server             |
| Dev      | Backend  | 8090  | NestJS                      |
| Prod     | Nginx    | 80    | Frontend buildado           |
| Prod     | Backend  | 8090  | Interna (só o Nginx acessa) |
| Todos    | Oracle   | 1521  | Conforme configurado        |

## 9. Solução de problemas

### Backend não inicializa (erro Oracle)

```text
[Nest] ERROR [ExceptionHandler] ORA-12170: TNS:Connect timeout occurred
```

**Causa:** o backend não consegue conectar no Oracle.
**Solução:**

- Conferir `ORACLE_CONNECTION_STRING` (formato `host:porta/SERVICO`).
- Verificar conectividade (ping, firewall).
- Usar `MOCK_DB=true` para testes sem banco.

### `ECONNREFUSED` no frontend

```text
[vite] http proxy error: /api/v1/fichas
AggregateError [ECONNREFUSED]
```

**Causa:** o proxy tenta alcançar o backend, mas ele não está rodando.
**Solução:**

- Subir o backend: `cd backend && npm run start:dev`.
- Conferir a porta (8090).

### MSW retornando dados fictícios

**Causa:** `VITE_FF_ENABLE_MOCK_API=true` no `.env.*`.
**Solução:** alterar para `false` e reiniciar o frontend.

### Importação massiva — "Invalid HTML: could not find \<table\>"

**Causa:** arquivo CSV mal formatado ou salvo como HTML (extensão `.csv` mas conteúdo HTML).
**Solução:**

- Usar o modelo baixado pelo sistema (`GET /import-massivo/modelo`).
- Confirmar que o conteúdo é CSV real e a extensão é `.csv` ou `.xlsx`.

### Docker — Oracle demora para iniciar

**Causa:** o Oracle XE leva até ~2 minutos na primeira execução.
**Solução:** aguardar e acompanhar: `docker compose logs -f oracle-db`.

### Docker — "group nginx in use"

**Causa:** a imagem `nginx:1.27-alpine` já cria o usuário `nginx`.
**Solução:** já corrigido no `Dockerfile` atual; rebuildar com `--no-cache` se persistir.

### Erro `ORA-01722: invalid number`

**Causa:** uso de `1`/`0` na coluna `ATIVO` de `AEGIS_TRAVAS` (que é texto `'TRUE'`/`'FALSE'`).
**Solução:** consultar com `ATIVO = 'TRUE'` / `ATIVO = 'FALSE'`. Ver [Modelo de dados](../explanation/modelo-de-dados.md).

Veja também: [Guia de desenvolvimento](desenvolvimento.md) · [Variáveis de ambiente](../reference/variaveis-de-ambiente.md) · [Referência da API](../reference/api.md)
