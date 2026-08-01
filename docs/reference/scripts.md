# Scripts

Referência dos comandos disponíveis no projeto, divididos por contexto.

## Frontend / raiz (pnpm)

Definidos em `package.json`:

| Script            | Comando                                                            | Descrição                                     |
| ----------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| `dev`             | `vite`                                                             | Dev server (porta 5173) com hot reload        |
| `build`           | `tsc -b && vite build`                                             | Compila TypeScript e gera o build de produção |
| `preview`         | `vite preview`                                                     | Serve o build localmente para inspeção        |
| `lint`            | `eslint src/ --report-unused-disable-directives --max-warnings 10` | Lint do código                                |
| `lint:fix`        | `eslint src/ --fix`                                                | Lint + correção automática                    |
| `format`          | `prettier --write "src/**/*.{ts,tsx,css,json}"`                    | Formata o código                              |
| `format:check`    | `prettier --check "src/**/*.{ts,tsx,css,json}"`                    | Verifica formatação                           |
| `typecheck`       | `tsc -b --noEmit`                                                  | Checagem de tipos sem emitir arquivos         |
| `test`            | `vitest`                                                           | Testes unitários (modo watch)                 |
| `test:run`        | `vitest run`                                                       | Testes unitários (execução única)             |
| `test:coverage`   | `vitest run --coverage`                                            | Testes com relatório de cobertura             |
| `test:e2e`        | `playwright test`                                                  | Testes end-to-end                             |
| `storybook`       | `storybook dev -p 6006`                                            | Storybook (porta 6006)                        |
| `storybook:build` | `storybook build`                                                  | Build estático do Storybook                   |
| `generate`        | `plop`                                                             | Gerador de código (componentes/módulos)       |
| `prepare`         | `husky`                                                            | Instala os hooks do Husky                     |

## Backend (npm)

Definidos em `backend/package.json`:

| Script        | Comando                      | Descrição                              |
| ------------- | ---------------------------- | -------------------------------------- |
| `build`       | `nest build`                 | Compila o backend para `dist/`         |
| `start`       | `node dist/main.js`          | Inicia o build compilado               |
| `start:dev`   | `nest start --watch`         | Inicia em desenvolvimento (hot reload) |
| `start:debug` | `nest start --debug --watch` | Inicia em debug com watch              |

### Backend com banco mock

```bash
cd backend
MOCK_DB=true npm run start:dev
```

> Veja [Modo MOCK_DB](../guides/deploy.md#6-modo-mock_db) para detalhes.

## Docker

| Comando                                                                | Descrição                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `docker compose up -d`                                                 | Sobe a stack de produção (frontend + backend + Oracle) |
| `docker compose down`                                                  | Para e remove os containers                            |
| `docker compose down -v`                                               | Para e remove containers + volume do Oracle            |
| `docker compose logs -f`                                               | Acompanha os logs                                      |
| `docker compose logs aegis-api`                                        | Logs de um serviço específico                          |
| `docker compose build <serviço>`                                       | Rebuild de um serviço                                  |
| `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d` | Dev com hot reload em container                        |
| `docker compose -f docker-compose.test.yml up -d`                      | Stack de teste com Oracle corporativo                  |

## Git / CI

| Comando                 | Descrição                                                          |
| ----------------------- | ------------------------------------------------------------------ |
| `pnpm changeset`        | Cria um changeset para versionamento                               |
| `pnpm changeset status` | Verifica changesets pendentes                                      |
| (Husky) pré-commit      | Roda `eslint --max-warnings 0` + `prettier` nos arquivos alterados |

> O pipeline Azure Pipelines compila a branch `master` e **exige lint limpo**. O hook do Husky bloqueia commits que quebrem lint/formatação.

## Exemplos combinados

**Rodar o ambiente de desenvolvimento completo:**

```bash
# Terminal 1 — backend
cd backend
MOCK_DB=true npm run start:dev

# Terminal 2 — frontend
pnpm run dev
```

**Validar tudo antes de um PR:**

```bash
pnpm run lint
pnpm run format:check
pnpm run typecheck
pnpm run test:run
```

Veja também: [Guia de desenvolvimento](../guides/desenvolvimento.md) · [Guia de deploy](../guides/deploy.md)
