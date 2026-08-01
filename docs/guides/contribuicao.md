# Guia de Contribuição

Este guia explica como o código está organizado e como adicionar novas funcionalidades ao AEGIS seguindo os padrões do projeto.

## 1. Padrões do repositório

- **Gerenciadores:** raiz usa **pnpm**; `backend/` usa **npm**.
- **CI/CD:** Azure Pipelines (`.azuredevops/`) — o pipeline compila a branch `master` e **exige lint limpo**.
- **Husky + lint-staged:** pré-commit roda `eslint --max-warnings 0` + `prettier` nos arquivos alterados. Commit falha se houver warning.
- **Changesets:** versões e changelog controlados por changesets (`.changeset/`).

### Antes de qualquer PR

```bash
# Da raiz
pnpm run lint
pnpm run typecheck
pnpm run format:check
pnpm run test:run
```

## 2. Estrutura de uma feature no frontend

Cada módulo vive em `src/features/<nome>/` e segue o mesmo esqueleto:

```
src/features/<nome>/
├── components/        # Componentes de UI do módulo
├── hooks/             # Hooks de dados (React Query) e lógica
├── services/          # Chamadas HTTP específicas do módulo
├── types/             # Tipos TypeScript do módulo
└── index.ts           # Export público do módulo
```

Exemplo real — `src/features/badlist/`:

```
badlist/
├── components/
│   ├── badlist-page.tsx          # Página
│   ├── badlist-filters.tsx       # Barra de filtros
│   ├── badlist-form-dialog.tsx   # Dialog de criação/edição
│   └── badlist-delete-dialog.tsx # Confirmação de exclusão
├── hooks/
│   ├── use-badlist.ts            # Query (leitura)
│   └── use-badlist-mutations.ts  # Mutations (create/update/delete)
├── services/
│   └── badlist-api.ts            # axios: listar, criar, editar, deletar
├── types/
│   └── badlist.types.ts
└── index.ts
```

### Passo a passo para criar uma feature frontend

1. **Tipos** — defina a interface do domínio em `types/`.
2. **Serviço** — crie as funções HTTP em `services/` usando o `http-client` global (`src/services/http-client.ts`).
3. **Hooks** — crie queries/mutations com TanStack React Query (ex.: `useBadlist`, `useBadlistMutations`).
4. **Componentes** — página + subcomponentes; use os componentes de UI compartilhados (DataTable, diálogos, formulários com React Hook Form + Zod).
5. **Rota** — adicione a rota em `src/routes/routes.ts` e o lazy load em `src/routes/lazy-routes.ts`.
6. **Sidebar** — adicione o item no grupo correto em `src/components/layout/sidebar.tsx`.
7. **API mock (MSW)** — se o projeto usa mock, registre o handler em `src/mocks/handlers/`.

> Existe um **gerador plop** (`pnpm run generate`) para acelerar a criação de módulos/componentes padrão.

## 3. Estrutura de um módulo no backend

Cada domínio vive em `backend/src/<nome>/` seguindo o padrão NestJS:

```
backend/src/<nome>/
├── <nome>.controller.ts   # Rotas HTTP
├── <nome>.service.ts      # Regras de negócio + SQL
└── <nome>.module.ts       # Registro do módulo
```

Os DTOs ficam em `backend/src/common/dto/` e as interfaces compartilhadas em `backend/src/common/interfaces/`.

### Passo a passo para criar um módulo backend

1. **DTO** — crie `CreateXDto` / `UpdateXDto` em `common/dto/` com **class-validator** (o `ValidationPipe` global rejeita campos não declarados).
2. **Service** — implemente `list` (com paginação + filtros), `getById`, `create`, `update`, `remove`.
3. **Controller** — declare as rotas com decorators do NestJS.
4. **Module** — crie o módulo e **importe no `AppModule`** (`backend/src/app.module.ts`).
5. **Banco** — adicione a tabela/colunas no ambiente Oracle (ver [Modelo de dados](../explanation/modelo-de-dados.md)).

## 4. Convenções obrigatórias de banco e dados

| Regra                           | Detalhe                                                                                                                                                                     |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID, nunca ROWID**             | Toda leitura/update/delete usa `WHERE ID = :id`                                                                                                                             |
| **Identity Oracle**             | Não passar ID no INSERT (é auto-gerado)                                                                                                                                     |
| **SELECT com todas as colunas** | Inclua colunas extras como `ACAO`, `BODY_TEMPLATE`, `CORRELATION_ID` quando a tabela tiver                                                                                  |
| **`ATIVO` é texto**             | `'TRUE'`/`'FALSE'` — nunca `1`/`0`                                                                                                                                          |
| **`ACTIVE` (badlist) é número** | `1`/`0`                                                                                                                                                                     |
| **Normalização**                | Aplicada apenas na importação massiva: `ATENDIMENTO_PARA` minúsculo; demais textos MAIÚSCULO; acentos preservados. No CRUD de fichas, valores são persistidos como enviados |
| **Campos opcionais**            | Trim; vazio salvo como `NULL` (interface exibe `---`) — sem default `'N/A'`                                                                                                 |
| **ORDER BY seguro**             | `sortBy` sempre validado por allowlist — nunca interpolar input do usuário em SQL                                                                                           |
| **Binds**                       | Sempre usar binds (`:param`) no SQL — nunca concatenação de valores                                                                                                         |

## 5. Testes

| Tipo      | Ferramenta               | Comando                  | Onde                        |
| --------- | ------------------------ | ------------------------ | --------------------------- |
| Unitário  | Vitest + Testing Library | `pnpm run test`          | junto aos componentes/hooks |
| E2E       | Playwright + axe-core    | `pnpm run test:e2e`      | `e2e/`                      |
| Cobertura | Vitest (v8)              | `pnpm run test:coverage` | —                           |
| Visual    | Storybook                | `pnpm run storybook`     | `src/stories/`              |

Ao adicionar comportamento novo, escreva/atualize testes para ele. Em particular:

- Validações de DTO → testes de unidade no backend (se houver).
- Novos filtros de listagem → testes dos filtros.
- Fluxos de UI críticos → testes e2e.

## 6. Fluxo de trabalho de commit

1. Trabalhe em uma branch a partir de `master`.
2. Rode `pnpm run lint` e `pnpm run format:check` antes de commitar.
3. O Husky valida ESLint (0 warnings) e Prettier automaticamente.
4. Se o módulo novo for uma mudança visível (feature), crie um changeset:

```bash
pnpm changeset
```

5. Abra um PR. O pipeline Azure roda lint/build automaticamente.

> **Regra do projeto:** o lint precisa passar com `--max-warnings 0`. O pipeline de CI constrói a `master` e falha se o lint não estiver limpo.

## 7. Dicas específicas do AEGIS

- **DataTable:** tabelas de dados usam o componente compartilhado (TanStack Table + virtualização). Não crie tabelas manuais novas.
- **Toasts:** notificações usam **sonner** (não crie sistema próprio).
- **Diálogos:** use os componentes Radix (`@radix-ui/react-dialog`) já embrulhados no projeto.
- **Seletores com muitas opções** (ex.: seletor de fichas da badlist): exigem **busca server-side paginada** (~10 itens iniciais + "Carregar mais"), nunca carregamento bulk no cliente.
- **Sidebar:** novos itens entram em grupos existentes (`Travas`, `Consulta de Logs`, `Serviços`).

Veja também: [Guia de desenvolvimento](desenvolvimento.md) · [Estrutura do projeto](../reference/estrutura-do-projeto.md) · [Referência da API](../reference/api.md)
