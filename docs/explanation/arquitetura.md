# Arquitetura

Este documento explica como o AEGIS funciona por dentro: as camadas, o fluxo de uma requisição, as decisões de design e os mecanismos de segurança.

## Visão geral das camadas

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Navegador                               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
              ┌─────────────────┴──────────────────┐
              │                                    │
   Dev: Vite :5173 (proxy /api)          Prod: Nginx :80 (proxy_pass)
              │                                    │
              └─────────────────┬──────────────────┘
                                │  /api/*
                     ┌──────────▼──────────┐
                     │   Backend NestJS    │
                     │        :8090        │
                     │                     │
                     │  DatabaseService    │
                     │  (oracledb pool)    │
                     └──────────┬──────────┘
                                │
                     ┌──────────▼──────────┐
                     │   Oracle DB :1521   │
                     │  (AEGIS_FICHAS,     │
                     │   AEGIS_TRAVAS,     │
                     │   AEGIS_LOGS,       │
                     │   AEGIS_MONITORING, │
                     │   AEGIS_BADLIST)    │
                     └─────────────────────┘
```

## Frontend (React + Vite)

O frontend é uma **SPA (Single Page Application)** em React 19 + TypeScript, construída com Vite.

### Estrutura de dados e estado

| Camada           | Tecnologia                             | Papel                                                             |
| ---------------- | -------------------------------------- | ----------------------------------------------------------------- |
| **Roteamento**   | React Router v7                        | Rotas com _lazy loading_ por módulo (`src/routes/lazy-routes.ts`) |
| **Server state** | TanStack React Query                   | Busca, cache e invalidação de dados vindos da API                 |
| **Client state** | Zustand                                | Estado global de UI (sidebar, tema) — `src/store/`                |
| **Tabelas**      | TanStack Table + React Virtual         | Tabelas de dados com ordenação e virtualização                    |
| **Formulários**  | React Hook Form + Zod                  | Validação de formulários (resolvers)                              |
| **UI**           | Radix UI + Tailwind CSS + shadcn-style | Componentes acessíveis e estilização                              |

### Camadas internas

- `src/api/` — Definição dos endpoints (rotas da API).
- `src/services/` — Cliente HTTP (axios) com política de retry e timeout.
- `src/features/` — Cada módulo da aplicação (dashboard, records, locks, badlist, etc.) segue um padrão interno: `components/`, `hooks/`, `services/`, `types/`, `utils/`.
- `src/mocks/` — **MSW (Mock Service Worker)** para desenvolvimento sem backend. Quando ativo, intercepta as requisições no _service worker_ e devolve dados fictícios (ver [Variáveis de ambiente](../reference/variaveis-de-ambiente.md), `VITE_FF_ENABLE_MOCK_API`).
- `src/routes/` — Definição de rotas + componentes _lazy_.
- `src/store/` — Stores Zustand (`sidebar-store`, `ui-store`).
- `src/logging/` — Instrumentação (Sentry) para captura de erros.

### Integração com a API

Em desenvolvimento, o Vite faz **proxy** de `/api` para `http://localhost:8090` (configurado em `vite.config.ts`). Assim, o frontend usa sempre URLs relativas (`/api/v1/...`), e o proxy decide o destino — exceto quando o MSW está ativo, caso em que as requisições são interceptadas antes de sair do navegador.

Em produção, o Nginx faz o mesmo papel: `location /api/ { proxy_pass http://aegis-api:8090; }`.

## Backend (NestJS)

O backend é uma aplicação **NestJS 10** com arquitetura modular. Cada domínio de negócio é um módulo:

```
backend/src/
├── fichas/            # CRUD de fichas
├── travas/            # Listagem e desativação de travas
├── badlist/           # CRUD de palavras bloqueadas
├── dashboard/         # Resumo, atividade recente, health, health externo
├── import-massivo/    # Importação CSV/XLSX (sessões em memória)
├── execution-logs/    # Consulta a AEGIS_LOGS
├── monitoring/        # Consulta a AEGIS_MONITORING_LOGS
├── database/          # Pool Oracle + executeQuery
└── common/            # Pipes, filters, DTOs, interfaces
```

Cada módulo segue o padrão NestJS: `controller` (rotas HTTP) → `service` (regras de negócio) → `DatabaseService` (SQL).

### Bootstrap e configuração global (`main.ts`)

- `setGlobalPrefix('api/v1', { exclude: ['/health'] })` — todas as rotas são prefixadas com `/api/v1`, exceto `/health`.
- `helmet()` — cabeçalhos de segurança HTTP.
- `enableCors()` — CORS habilitado.
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — valida e remove campos não declarados nos DTOs, rejeitando payloads fora do contrato.
- `AllExceptionsFilter` — normaliza erros do oracledb (objetos circulares como `ConnectDescription → cOpts`) para que respostas de erro nunca quebrem o JSON.
- `enableShutdownHooks()` — fecha o pool de conexões Oracle no desligamento.

### Camada de banco (`DatabaseService`)

O acesso a dados passa obrigatoriamente por um único serviço que gerencia o **pool de conexões Oracle**:

| Comportamento                   | Detalhe                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Pool                            | Criado com `oracledb.createPool` (min/max/increment configuráveis)                        |
| `OUT_FORMAT_OBJECT`             | Resultados como objetos, não arrays                                                       |
| `autoCommit = true`             | Cada `executeQuery` comita automaticamente                                                |
| `fetchAsString = [CLOB, NCLOB]` | CLOB/NCLOB são devolvidos como string — evita objetos `Lob` circulares que quebram o JSON |
| Erros                           | Normalizados para `Error(message)` antes de propagar                                      |
| `MOCK_DB=true`                  | Nenhuma conexão é criada; toda query retorna `{ rows: [] }`                               |

### Paginação e filtros

Todos os endpoints de listagem seguem o mesmo contrato (via `PaginationPipe`):

- `page` (padrão `1`), `limit` (padrão `20`, máximo `100`).
- `search` — busca textual ampla (varia por endpoint).
- Filtros específicos por endpoint (ex.: `atendimentoPara`, `servico`, `status`, `dateFrom`...).
- `sortBy` + `sortOrder` — ordenação. **O valor de `sortBy` é validado contra uma allowlist** (`SORT_COLUMNS` / `VALID_SORT_COLUMNS`) antes de ser interpolado no `ORDER BY`; valores fora da lista caem para a ordenação padrão.

Resposta padrão:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## Fluxo de uma requisição

### Exemplo: listar fichas

```
1. Usuário abre /records
2. useFichas (React Query) chama GET /api/v1/fichas?page=1&limit=20&search=x
3. axios (src/services/http-client) envia a requisição
4. Vite proxy (dev) ou Nginx (prod) encaminha para o backend :8090
5. FichasController.list → FichasService.list
6. DatabaseService.executeQuery monta o SQL com binds (:search, :offset, :limit)
7. Oracle executa e retorna as linhas + COUNT(*)
8. Service mapeia as linhas para o formato da Ficha e monta a paginação
9. Resposta JSON volta ao frontend; React Query atualiza a tabela
```

### Exemplo: desativar uma trava

```
1. Usuário clica em "Desativar" em /locks
2. POST /api/v1/travas/:id/disable
3. TravasService.disable executa:
   UPDATE AEGIS_TRAVAS SET ATIVO = 'FALSE' WHERE ID = :id AND ATIVO = 'TRUE'
4. Retorna a trava atualizada; a interface atualiza o status
```

### Exemplo: importação massiva

```
1. POST /api/v1/import-massivo/preview (multipart: arquivo CSV/XLSX)
2. Service valida cabeçalhos e normaliza cada linha; cria uma sessão em memória (Map)
3. Frontend exibe o preview e chama POST /api/v1/import-massivo/execute/:sessionId
4. A execução roda em background, em lotes de 10 linhas
5. Frontend faz polling em GET /import-massivo/status/:sessionId a cada 1,5s
6. Em falha, a sessão preserva o progresso; "Tentar Novamente" retoma do último lote
```

> **Importante:** as sessões de importação ficam em **memória do backend** (um `Map<string, ImportSession>`). Se o backend reiniciar no meio de uma importação, a sessão é perdida e o arquivo precisa ser reenviado.

## Decisões de design relevantes

### 1. Validação de entrada

Todos os corpos de requisição passam por **DTOs com class-validator** (`CreateFichaDto`, `CreateBadlistDto`, etc.) e o `ValidationPipe` global rejeita campos não declarados (`forbidNonWhitelisted`). Nada do que chega da rede é interpolado em SQL sem passar por binds.

### 2. Proteção contra SQL injection no ORDER BY

Nunca se interpola o valor do usuário diretamente em SQL. A ordenação é resolvida por uma função que consulta um mapa/allowlist de colunas:

```ts
const column = sortBy ? SORT_COLUMNS[sortBy] : undefined;
// `ORDER BY ${column ?? default} ${order}`  — column só existe se estiver no mapa
```

### 3. Normalização de dados

A normalização de caixa acontece apenas no fluxo de **importação massiva** (`ImportMassivoService`):

- `ATENDIMENTO_PARA` → sempre minúsculo (`b2c`, `b2b`, `interno`).
- Demais campos de texto → sempre MAIÚSCULO.
- Acentos e caracteres especiais são preservados.

No **CRUD de fichas** (`POST`/`PUT /fichas`) os valores são persistidos **como enviados**, sem conversão de caixa — apenas `trim()` em campos opcionais. O mesmo vale para `WORDS` na badlist (normalizada para separação por `|`).

### 4. Identificação por coluna `ID`

Todas as tabelas usam `ID` (identity Oracle) como chave primária. **Nunca se usa `ROWID`** — todos os `getById`, `update` e `delete` usam `WHERE ID = :id`.

### 5. Modo mock

Dois níveis de mock, independentes:

| Modo                                      | Mecanismo                           | Efeito                                                           |
| ----------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| `MOCK_DB=true` (backend)                  | `DatabaseService` nunca cria o pool | Toda query retorna lista vazia; útil para testar fluxo/interface |
| `VITE_FF_ENABLE_MOCK_API=true` (frontend) | MSW intercepta no navegador         | Dados fictícios são devolvidos sem chamar o backend              |

> **Atenção:** com o MSW ativo, os dados exibidos **não são reais**. Desligue a flag ao trabalhar com o backend real.

### 6. Segurança de produção (Nginx)

O Nginx de produção aplica cabeçalhos de segurança (CSP, `X-Frame-Options: DENY`, `nosniff`, etc.), compressão gzip, cache de assets imutáveis e nega acesso a arquivos ocultos. O HTML principal e o service worker nunca são cacheados, garantindo que o PWA atualize corretamente.

## Limites e observações

- **Sessões em memória** — Além da importação massiva, o cache de health externo do dashboard vive em memória (TTL de 30 s). Reiniciar o backend zera esses estados.
- **Escrita externa no monitoramento** — `AEGIS_MONITORING_LOGS` é apenas **leitura** para o AEGIS (GRANT SELECT). Os sistemas de monitoramento externos são os responsáveis por gravar registros nessa tabela.
- **Sem autenticação** — Atualmente a API não possui autenticação/autorização. Os controles existentes são de transporte (helmet, CORS, validação). Isso deve ser considerado em implantações expostas à internet.

Veja também: [Modelo de dados](modelo-de-dados.md) · [Referência da API](../reference/api.md) · [Variáveis de ambiente](../reference/variaveis-de-ambiente.md)
