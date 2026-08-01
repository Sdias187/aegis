# Guia de Desenvolvimento

Este guia mostra como preparar o ambiente de desenvolvimento do AEGIS e rodar a aplicação localmente.

## Pré-requisitos

| Ferramenta        | Versão   | Observação                                        |
| ----------------- | -------- | ------------------------------------------------- |
| Node.js           | >= 22    | Necessário para frontend e backend                |
| pnpm              | >= 10    | Gerenciador de pacotes do **frontend (raiz)**     |
| npm               | —        | Gerenciador de pacotes do **backend**             |
| Docker (opcional) | >= 24    | Para Oracle local ou execução em container        |
| Oracle DB         | 19c / XE | Opcional — dá para desenvolver com `MOCK_DB=true` |

> **Importante sobre gerenciadores:** o repositório raiz usa **pnpm** e o `backend/` usa **npm**. Não misture os dois dentro da mesma pasta.

## 1. Clonar e instalar dependências

```bash
git clone <url-do-repo> aegis
cd aegis

# Frontend (raiz) — pnpm
pnpm install

# Backend — npm
cd backend
npm install
cd ..
```

## 2. Configurar variáveis de ambiente

### Backend

```bash
cd backend
cp .env.example .env
```

O arquivo `backend/.env` já vem com valores padrão que funcionam contra um Oracle local:

```env
ORACLE_USER=AEGIS
ORACLE_PASSWORD=aegis123
ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1
PORT=8090
```

Se você **não tem** Oracle disponível, use o modo mock (ver passo 3).

### Frontend

O frontend lê `.env.development` (raiz), que já existe no repositório com valores padrão. Não é preciso criar nada para o fluxo básico.

## 3. Subir o backend

### Opção A — Sem banco (MOCK_DB)

```bash
cd backend
MOCK_DB=true npm run start:dev
```

Você verá no log:

```
WARN [DatabaseService]  MOCK_DB = true — rodando sem banco
WARN [DatabaseService]  Todas as queries retornarão dados vazios
```

Todos os endpoints funcionam, mas retornam listas vazias — ideal para testar navegação e fluxos de interface.

### Opção B — Com Oracle real

1. Tenha um Oracle acessível (instância local, container Docker ou servidor corporativo).
2. Configure `ORACLE_USER`, `ORACLE_PASSWORD` e `ORACLE_CONNECTION_STRING` no `backend/.env`.
3. Garanta que as tabelas existam (ver [Modelo de dados](../explanation/modelo-de-dados.md)).
4. Suba:

```bash
cd backend
npm run start:dev
```

O servidor sobe em `http://localhost:8090` — health check em `http://localhost:8090/health`.

### Subir Oracle via Docker (opcional)

Se preferir um Oracle local em container:

```bash
docker compose up -d oracle-db
# aguardar ~2 min na primeira execução
```

## 4. Subir o frontend

```bash
# na raiz do projeto
pnpm run dev
```

O Vite sobe em `http://localhost:5173` e faz **proxy** de `/api` para `http://localhost:8090` (configurado em `vite.config.ts`).

> **MSW:** se `VITE_FF_ENABLE_MOCK_API=true` no `.env.development`, as requisições são interceptadas no navegador por dados fictícios e **não** chegam ao backend. Para trabalhar com o backend real, mantenha a flag em `false` e reinicie o frontend.

## 5. Verificar se está tudo rodando

```bash
# Health do backend
curl http://localhost:8090/health
# → {"status":"healthy","uptime":...,"lastCheck":...}

# Fichas (paginado)
curl "http://localhost:8090/api/v1/fichas?page=1&limit=5"
```

No navegador, acesse `http://localhost:5173` — o dashboard deve carregar.

## Fluxo de trabalho diário

```bash
# Terminal 1 — backend
cd backend
MOCK_DB=true npm run start:dev      # ou npm run start:dev com Oracle

# Terminal 2 — frontend
pnpm run dev
```

## Scripts úteis

| Comando (raiz)       | Descrição                                  |
| -------------------- | ------------------------------------------ |
| `pnpm run dev`       | Dev server (Vite) na porta 5173            |
| `pnpm run build`     | Build de produção (`tsc -b && vite build`) |
| `pnpm run preview`   | Previsualizar o build                      |
| `pnpm run lint`      | ESLint (máx. 10 warnings)                  |
| `pnpm run typecheck` | TypeScript sem emitir                      |
| `pnpm run test`      | Testes unitários (Vitest, watch)           |
| `pnpm run test:run`  | Testes unitários (uma execução)            |
| `pnpm run test:e2e`  | Testes end-to-end (Playwright)             |
| `pnpm run storybook` | Storybook na porta 6006                    |
| `pnpm run generate`  | Gerador de código (plop)                   |

| Comando (backend)   | Descrição                             |
| ------------------- | ------------------------------------- |
| `npm run start:dev` | NestJS com watch (hot reload)         |
| `npm run build`     | Compilar TypeScript                   |
| `npm start`         | Iniciar o build (`node dist/main.js`) |

Veja a lista completa em [Scripts](../reference/scripts.md).

## Ferramentas de qualidade

- **Husky + lint-staged**: antes de cada commit, roda `eslint --max-warnings 0` e `prettier` nos arquivos alterados. Se falhar, o commit é bloqueado.
- **Prettier**: formatação de código (`.prettierrc` na raiz).
- **Storybook**: documentação visual dos componentes (`pnpm run storybook`).
- **Playwright + axe-core**: testes e2e com verificações de acessibilidade.
- **Azure Pipelines**: CI que roda lint na branch `master` — o pipeline não passa se o lint falhar.

## Dicas de depuração

| Sintoma                           | Causa provável                   | Solução                                                                           |
| --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `ECONNREFUSED` no console do Vite | Backend não está rodando         | Suba o backend na porta 8090                                                      |
| Dados aparecem sem backend        | MSW ativo                        | `VITE_FF_ENABLE_MOCK_API=false` e reinicie                                        |
| Erro `ORA-12170` no backend       | Oracle inacessível               | Confira a connection string / use `MOCK_DB=true`                                  |
| Erro `ORA-01722`                  | Uso de `1`/`0` em coluna `ATIVO` | Use `'TRUE'`/`'FALSE'` (ver [Modelo de dados](../explanation/modelo-de-dados.md)) |

Veja também: [Guia de deploy](deploy.md) · [Guia de contribuição](contribuicao.md) · [Variáveis de ambiente](../reference/variaveis-de-ambiente.md)
