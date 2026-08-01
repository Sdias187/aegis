# AEGIS

Sistema corporativo para **gerenciamento de travas e incidentes**. Centraliza fichas de incidentes, controle de travas, importação massiva, badlist (palavras bloqueadas) e consulta de logs de execução e monitoramento.

---

## Índice

1. [Sobre o projeto](#sobre-o-projeto)
2. [Stack](#stack)
3. [Quick Start](#quick-start)
4. [Documentação completa](#documentação-completa)
5. [Scripts](#scripts)
6. [Estrutura](#estrutura)

---

## Sobre o projeto

O AEGIS é formado por um **frontend** React/Vite, um **backend** NestJS e um banco **Oracle**. Ele organiza a operação em três grupos de navegação:

- **Travas** — Dashboard, Fichas, Travas, Importação, Badlist, Logs de Execução, Monitoramento
- **Consulta de Logs** — GPS, VIVO 360
- **Serviços** — Siebel

Para entender cada módulo e a arquitetura, veja a [documentação completa](#documentação-completa).

## Stack

| Camada     | Tecnologia                           |
| ---------- | ------------------------------------ |
| Frontend   | React 19, TypeScript, Vite, Tailwind |
| Estado     | TanStack React Query, Zustand        |
| Roteamento | React Router v7                      |
| Backend    | NestJS 10, TypeScript                |
| Banco      | OracleDB (oracledb v7, Thin Mode)    |
| Container  | Docker, Docker Compose               |
| Proxy      | Nginx (produção)                     |

## Quick Start

> Pré-requisitos: Node.js >= 22, pnpm >= 10. Oracle é **opcional** para desenvolvimento (use `MOCK_DB=true`).

### 1. Instalar dependências

```bash
pnpm install        # frontend (raiz)
cd backend && npm install && cd ..
```

### 2. Subir o backend (sem Oracle)

```bash
cd backend
MOCK_DB=true npm run start:dev
# Backend em http://localhost:8090 — health em /health
```

### 3. Subir o frontend

```bash
# na raiz
pnpm run dev
# Abrir http://localhost:5173
```

> **MSW:** se `VITE_FF_ENABLE_MOCK_API=true` no `.env.development`, as requisições são interceptadas no navegador por dados fictícios. Mantenha `false` para usar o backend real.

### Com Docker (produção)

```bash
docker compose up -d
# Acessar http://localhost
```

### Com Oracle real

Configure `backend/.env` (a partir de `backend/.env.example`) e rode sem `MOCK_DB`:

```env
ORACLE_USER=AEGIS
ORACLE_PASSWORD=...
ORACLE_CONNECTION_STRING=host:1521/SERVICO
```

## Documentação completa

A documentação é organizada pelo modelo **Diátaxis** em [`docs/`](./docs/):

| Quadrante          | Conteúdo                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tutorial**       | [Primeiro acesso](docs/tutorials/primeiro-acesso.md) — do zero até criar a primeira ficha                                                                                                               |
| **Guias (How-to)** | [Desenvolvimento](docs/guides/desenvolvimento.md) · [Deploy](docs/guides/deploy.md) · [Contribuição](docs/guides/contribuicao.md) · [Guias de uso](docs/guides/uso/)                                    |
| **Referência**     | [API](docs/reference/api.md) · [Variáveis de ambiente](docs/reference/variaveis-de-ambiente.md) · [Estrutura do projeto](docs/reference/estrutura-do-projeto.md) · [Scripts](docs/reference/scripts.md) |
| **Explanação**     | [Visão geral](docs/explanation/visao-geral.md) · [Arquitetura](docs/explanation/arquitetura.md) · [Modelo de dados](docs/explanation/modelo-de-dados.md)                                                |

**Acesse a landing page da documentação: [`docs/README.md`](docs/README.md)**

## Scripts

Principais comandos:

| Comando                                        | Descrição                     |
| ---------------------------------------------- | ----------------------------- |
| `pnpm run dev`                                 | Frontend (Vite, porta 5173)   |
| `pnpm run build`                               | Build de produção             |
| `pnpm run lint` / `typecheck` / `format:check` | Qualidade                     |
| `pnpm run test` / `test:run` / `test:e2e`      | Testes (Vitest/Playwright)    |
| `pnpm run storybook`                           | Storybook (porta 6006)        |
| `pnpm run generate`                            | Gerador de código (plop)      |
| `npm run start:dev` (em `backend/`)            | Backend NestJS com hot reload |

Lista completa em [Scripts](docs/reference/scripts.md).

## Estrutura

```
aegis/
├── src/        # Frontend (features, routes, components, store, mocks...)
├── backend/    # NestJS (fichas, travas, badlist, dashboard, import-massivo, logs)
├── docs/       # Documentação
├── e2e/        # Testes end-to-end
└── docker-compose*.yml / Dockerfile
```

Detalhamento em [Estrutura do projeto](docs/reference/estrutura-do-projeto.md). Para implantação, veja o [Guia de deploy](docs/guides/deploy.md) e o [Manual de produção](MANUAL_PRODUCAO.md).
