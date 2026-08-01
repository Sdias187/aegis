# Variáveis de Ambiente

Referência completa das variáveis de ambiente do frontend e do backend, com valores padrão e uso em cada ambiente.

## Frontend (raiz)

O frontend usa variáveis prefixadas com `VITE_` (embutidas no build pelo Vite). Os arquivos de ambiente na raiz são:

| Arquivo            | Uso                                      |
| ------------------ | ---------------------------------------- |
| `.env.development` | Ambiente de desenvolvimento (`pnpm dev`) |
| `.env.production`  | Build de produção (`pnpm build`)         |
| `.env.example`     | Modelo de referência                     |

### `VITE_API_URL`

- **Padrão (dev):** `/api/v1`
- **Padrão (example):** `http://localhost:8090/api/v1`

Base URL das chamadas HTTP. Em desenvolvimento com o proxy do Vite, use **URL relativa** (`/api/v1`) para que o proxy funcione — e para que o MSW consiga interceptar quando estiver ativo (URL relativa garante _same-origin_).

### `VITE_API_TIMEOUT`

- **Padrão:** `30000`

Timeout (ms) do cliente HTTP.

### `VITE_APP_NAME` / `VITE_APP_VERSION`

- **Padrão:** `AEGIS` / `1.0.0`

Nome e versão exibidos na aplicação.

### `VITE_ENV`

- **Valores:** `development` | `production`

Identifica o ambiente de execução.

### `VITE_SENTRY_DSN` / `VITE_SENTRY_ENVIRONMENT`

- **Padrão:** vazio / `development`

Configuração do Sentry (rastreamento de erros). Vazio = desabilitado.

### `VITE_FF_DARK_MODE_DEFAULT`

- **Padrão:** `true`

Tema escuro como padrão na primeira visita.

### `VITE_FF_ENABLE_GLOBAL_SEARCH`

- **Padrão:** `true`

Habilita a busca global na interface.

### `VITE_FF_ENABLE_MOCK_API`

- **Padrão (dev):** `false` · **Padrão (example):** `true`

Habilita o **MSW (Mock Service Worker)**. Quando `true`, as requisições são interceptadas no navegador e respondidas com **dados fictícios** — o backend não é chamado.

> ⚠️ **Atenção:** com o MSW ativo, os dados exibidos **não são reais**. Para trabalhar com o backend real, mantenha `false` e reinicie o frontend.

### `VITE_PWA_ENABLED`

- **Padrão (dev):** `false` · **Padrão (prod):** `true`

Habilita o registro do service worker (PWA).

### `VITE_POLLING_INTERVAL`

- **Padrão:** `30000`

Intervalo (ms) de polling de consultas (ex.: status da importação massiva).

## Backend (`backend/.env`)

O backend lê variáveis de ambiente do arquivo `backend/.env` (criado a partir de `backend/.env.example`).

### Conexão Oracle

| Variável                   | Padrão                  | Descrição                                     |
| -------------------------- | ----------------------- | --------------------------------------------- |
| `ORACLE_USER`              | `AEGIS`                 | Usuário do banco                              |
| `ORACLE_PASSWORD`          | `aegis123`              | Senha do usuário                              |
| `ORACLE_CONNECTION_STRING` | `localhost:1521/XEPDB1` | String de conexão Oracle (host:porta/serviço) |

### Pool de conexões

| Variável            | Padrão | Descrição                  |
| ------------------- | ------ | -------------------------- |
| `DB_POOL_MIN`       | `2`    | Mínimo de conexões no pool |
| `DB_POOL_MAX`       | `10`   | Máximo de conexões no pool |
| `DB_POOL_INCREMENT` | `1`    | Incremento do pool         |

### Servidor

| Variável    | Padrão | Descrição             |
| ----------- | ------ | --------------------- |
| `PORT`      | `8090` | Porta HTTP do backend |
| `LOG_LEVEL` | `info` | Nível de log (NestJS) |

### Modo mock

| Variável  | Padrão                | Descrição                                                                 |
| --------- | --------------------- | ------------------------------------------------------------------------- |
| `MOCK_DB` | — (ausente = `false`) | `true` executa o backend **sem banco** — toda query retorna listas vazias |

Exemplo de uso:

```env
MOCK_DB=true
```

## Docker Compose

As variáveis de ambiente do `docker-compose.yml` controlam a stack de produção:

| Variável                   | Padrão                  | Descrição                                      |
| -------------------------- | ----------------------- | ---------------------------------------------- |
| `ORACLE_USER`              | `AEGIS`                 | Usuário Oracle (injetado no backend)           |
| `ORACLE_PASSWORD`          | `aegis123`              | Senha Oracle (backend e container do banco)    |
| `ORACLE_CONNECTION_STRING` | `oracle-db:1521/XEPDB1` | Conexão interna do backend ao container Oracle |
| `ORACLE_PORT`              | `1521`                  | Porta do Oracle exposta no host                |
| `PORT`                     | `80`                    | Porta do frontend (Nginx) exposta no host      |

No `docker-compose.test.yml` (Oracle corporativo), `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECTION_STRING` **devem** ser informadas na linha de comando:

```bash
ORACLE_USER=usuario ORACLE_PASSWORD=senha \
ORACLE_CONNECTION_STRING=servidor:1521/SERVICO \
docker compose -f docker-compose.test.yml up -d
```

Veja também: [Guia de desenvolvimento](../guides/desenvolvimento.md) · [Guia de deploy](../guides/deploy.md)
