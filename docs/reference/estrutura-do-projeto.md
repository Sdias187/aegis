# Estrutura do Projeto

Mapa da organização do repositório, atualizado para o estado atual do código.

## Visão geral

```
aegis/
├── src/                     # Frontend (React + Vite)
├── backend/                 # Backend (NestJS)
├── e2e/                     # Testes end-to-end (Playwright)
├── docs/                    # Documentação (este guia)
├── .azuredevops/            # Pipeline CI/CD (Azure Pipelines)
├── .docker/                 # Configurações do Docker (nginx.conf, entrypoint.sh)
├── .husky/                  # Hooks de pré-commit (lint + prettier)
├── .changeset/              # Changesets (versões/changelog)
├── .storybook/              # Configuração do Storybook
├── .env.development         # Variáveis de ambiente (dev)
├── .env.production          # Variáveis de ambiente (prod)
├── .env.example             # Modelo de variáveis
├── docker-compose.yml       # Stack de produção (frontend + backend + Oracle)
├── docker-compose.dev.yml   # Override de desenvolvimento (hot reload)
├── docker-compose.test.yml  # Stack de teste (Oracle corporativo)
├── Dockerfile               # Build da imagem do frontend
├── plopfile.js              # Gerador de código (plop)
├── playwright.config.ts     # Configuração do Playwright
└── vite.config.ts           # Configuração do Vite (proxy, PWA, chunks)
```

## Frontend — `src/`

| Pasta         | Conteúdo                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| `api/`        | Definição dos endpoints da API (`endpoints.ts`, `index.ts`)                 |
| `app/`        | Bootstrap da aplicação                                                      |
| `components/` | Componentes compartilhados (UI, layout, data-table)                         |
| `config/`     | Configurações de ambiente/flag                                              |
| `contexts/`   | Contextos React                                                             |
| `features/`   | **Módulos da aplicação** (ver abaixo)                                       |
| `hooks/`      | Hooks compartilhados (`use-debounced-value`, etc.)                          |
| `i18n/`       | Internacionalização                                                         |
| `logging/`    | Instrumentação (Sentry)                                                     |
| `mocks/`      | **MSW** — dados fictícios (`browser.ts`, `handlers/`, `data/`, `server.ts`) |
| `providers/`  | Providers globais (React Query, tema)                                       |
| `routes/`     | Definição de rotas + lazy loading                                           |
| `services/`   | Cliente HTTP global (`http-client.ts`, `retry-policy.ts`)                   |
| `store/`      | Stores Zustand (`sidebar-store`, `ui-store`)                                |
| `stories/`    | Histórias do Storybook                                                      |
| `styles/`     | Estilos globais                                                             |
| `test/`       | Testes e utilitários de teste                                               |
| `types/`      | Tipos compartilhados                                                        |
| `utils/`      | Funções utilitárias                                                         |

### Features (`src/features/`)

Cada feature segue o padrão `components/`, `hooks/`, `services/`, `types/` (+ `utils/` quando necessário):

| Feature           | Página                                          | Descrição                          |
| ----------------- | ----------------------------------------------- | ---------------------------------- |
| `dashboard/`      | `/`                                             | KPIs, atividade recente, health    |
| `records/`        | `/records`                                      | CRUD de fichas                     |
| `locks/`          | `/locks`                                        | Catálogo de travas                 |
| `import-massivo/` | `/import/massivo`                               | Importação CSV/XLSX                |
| `badlist/`        | `/badlist`                                      | Palavras bloqueadas                |
| `execution-logs/` | `/logs/execution`                               | Logs de execução                   |
| `monitoring/`     | `/monitoring`                                   | Logs de monitoramento              |
| `consulta-logs/`  | `/consulta-logs/gps`, `/consulta-logs/vivo-360` | Busca em logs externos             |
| `servicos/`       | `/servicos/siebel`                              | Consulta Siebel (mock)             |
| `import/`         | —                                               | Importação simples (módulo legado) |

### Rotas (`src/routes/`)

| Constante                       | Caminho                                         |
| ------------------------------- | ----------------------------------------------- |
| `ROUTES.DASHBOARD`              | `/`                                             |
| `ROUTES.RECORDS.LIST/NEW/EDIT`  | `/records`, `/records/new`, `/records/:id/edit` |
| `ROUTES.LOCKS.LIST`             | `/locks`                                        |
| `ROUTES.IMPORT`                 | `/import`                                       |
| `ROUTES.IMPORT_MASSIVO`         | `/import/massivo`                               |
| `ROUTES.BADLIST`                | `/badlist`                                      |
| `ROUTES.LOGS.EXECUTION`         | `/logs/execution`                               |
| `ROUTES.MONITORING`             | `/monitoring`                                   |
| `ROUTES.CONSULTA_LOGS.GPS`      | `/consulta-logs/gps`                            |
| `ROUTES.CONSULTA_LOGS.VIVO_360` | `/consulta-logs/vivo-360`                       |
| `ROUTES.SERVICOS.SIEBEL`        | `/servicos/siebel`                              |

### Navegação (sidebar)

A sidebar (`src/components/layout/sidebar.tsx`) organiza a navegação em grupos:

```
Travas
├── Dashboard        /
├── Fichas           /records
├── Travas           /locks
├── Importação       /import/massivo
├── Badlist          /badlist
├── Logs de Execução /logs/execution
└── Monitoramento    /monitoring

Consulta de Logs
├── GPS              /consulta-logs/gps
└── VIVO 360         /consulta-logs/vivo-360

Serviços
└── Siebel           /servicos/siebel
```

## Backend — `backend/src/`

| Pasta               | Conteúdo                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| `main.ts`           | Bootstrap: helmet, CORS, prefixo `/api/v1`, ValidationPipe, filtro de erros |
| `app.module.ts`     | Módulo raiz (importa todos os módulos)                                      |
| `app.controller.ts` | Rota `/health`                                                              |
| `fichas/`           | CRUD de fichas                                                              |
| `travas/`           | Lista e desativação de travas                                               |
| `badlist/`          | CRUD de badlist (`TRAVA_ID=12`)                                             |
| `dashboard/`        | Summary, recent-activity, health, external-health                           |
| `import-massivo/`   | Importação CSV/XLSX (sessões em memória)                                    |
| `execution-logs/`   | Consulta a `AEGIS_LOGS`                                                     |
| `monitoring/`       | Consulta a `AEGIS_MONITORING_LOGS`                                          |
| `database/`         | `DatabaseService` — pool Oracle + `executeQuery`                            |
| `config/`           | Configuração central (`configuration.ts`)                                   |
| `common/`           | `pipes/` (pagination), `dto/`, `filters/` (all-exceptions), `interfaces/`   |

### Estrutura padrão de um módulo

```
backend/src/<modulo>/
├── <modulo>.controller.ts   # Rotas HTTP (decorators NestJS)
├── <modulo>.service.ts      # Regras de negócio + SQL (binds)
└── <modulo>.module.ts       # Registro do módulo
```

DTOs ficam em `backend/src/common/dto/` (ex.: `create-ficha.dto.ts`, `create-badlist.dto.ts`).

### Estrutura padrão de uma feature frontend

```
src/features/<feature>/
├── components/   # Páginas e subcomponentes
├── hooks/        # Queries/mutations (React Query)
├── services/     # Chamadas HTTP
├── types/        # Tipos TypeScript
└── index.ts      # Export público
```

## Backend — outros arquivos

| Caminho                                     | Conteúdo                           |
| ------------------------------------------- | ---------------------------------- |
| `backend/init-scripts/01-create-tables.sql` | DDL das tabelas + índices + grants |
| `backend/init-scripts/02-seed-data.sql`     | Dados de exemplo                   |
| `backend/Dockerfile`                        | Imagem do backend                  |
| `backend/.env.example`                      | Modelo de variáveis do backend     |

> **Importante:** os scripts de `init-scripts/` **não são executados automaticamente** — existem no disco para execução manual (ver [Modelo de dados](../explanation/modelo-de-dados.md)).

Veja também: [Arquitetura](../explanation/arquitetura.md) · [Guia de contribuição](../guides/contribuicao.md) · [Scripts](scripts.md)
