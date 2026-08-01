# Tutorial: Primeiro Acesso ao AEGIS

Este tutorial leva você, do zero, até ter o AEGIS rodando na sua máquina e criar a primeira ficha de incidente. Ele é destinado a **desenvolvedores** e leva em torno de 15 minutos.

Ao final, você terá:

- O **backend** AEGIS rodando na porta 8090 (sem precisar de Oracle — usaremos o modo mock).
- O **frontend** rodando na porta 5173.
- A primeira **ficha** criada pela interface.

## Pré-requisitos

Verifique antes de começar:

```bash
node --version   # >= 22
pnpm --version   # >= 10
npm --version
```

> Se não tiver pnpm: `npm install -g pnpm` (ou `corepack enable` para habilitar via Node).

## Passo 1 — Clonar o repositório

```bash
git clone <url-do-repo> aegis
cd aegis
```

## Passo 2 — Instalar dependências

O frontend (raiz) usa **pnpm**; o backend usa **npm**.

```bash
# Frontend
pnpm install

# Backend
cd backend
npm install
cd ..
```

## Passo 3 — Subir o backend (modo mock)

O modo `MOCK_DB` roda o backend **sem banco de dados**: todos os endpoints funcionam, mas retornam listas vazias — perfeito para o primeiro contato.

```bash
cd backend
MOCK_DB=true npm run start:dev
```

Espere aparecer no log:

```
WARN [DatabaseService]  MOCK_DB = true — rodando sem banco
AEGIS Backend running on port 8090
```

> **Windows (PowerShell):** use `$env:MOCK_DB="true"; npm run start:dev`.

Deixe o backend rodando neste terminal e abra outro.

## Passo 4 — Verificar o health check

Em um novo terminal:

```bash
curl http://localhost:8090/health
```

Você deve ver:

```json
{ "status": "healthy", "uptime": 1.23, "lastCheck": "2026-..." }
```

## Passo 5 — Subir o frontend

Na raiz do projeto:

```bash
pnpm run dev
```

O Vite inicia em `http://localhost:5173`. Abra no navegador.

> **Importante:** confirme que `VITE_FF_ENABLE_MOCK_API` está como `false` no `.env.development`. Se estiver `true`, o MSW intercepta as requisições e você verá dados fictícios em vez de dados do backend. Ao alterar o `.env`, reinicie o frontend.

## Passo 6 — Conhecer a tela

Ao abrir `http://localhost:5173`, você verá a sidebar com os grupos:

- **Travas** → Dashboard, Fichas, Travas, Importação, Badlist, Logs de Execução, Monitoramento
- **Consulta de Logs** → GPS, VIVO 360
- **Serviços** → Siebel

Navegue pela interface. Como o banco está em mock, as listas estarão vazias — é o esperado.

## Passo 7 — Criar a primeira ficha

1. Na sidebar, clique em **Fichas** (`/records`).
2. Clique no botão **Nova Ficha**.
3. Preencha o formulário:
   - **Atendimento:** escolha `B2C`.
   - **Serviço:** `Suporte Tecnico`.
   - **Oferta de Serviço:** `Premium`.
   - **Detalhe da Falha:** `Falha na autenticacao do sistema legado`.
   - **Categoria:** `Seguranca`.
   - **Subcategoria:** `Autenticacao`.
4. Clique em **Criar Ficha**.

> Em modo mock, a criação retorna sucesso mas **nada é persistido** — ao recarregar a página a lista continua vazia. É o comportamento esperado sem banco. Para persistência real, configure um Oracle e suba sem `MOCK_DB` (ver [Guia de desenvolvimento](../guides/desenvolvimento.md)).

## Passo 8 — Testar a API diretamente

Enquanto o backend roda, experimente alguns endpoints:

```bash
# Listar fichas (vazio em mock)
curl "http://localhost:8090/api/v1/fichas?page=1&limit=5"

# Listar travas
curl "http://localhost:8090/api/v1/travas?page=1&limit=5"

# Dashboard
curl "http://localhost:8090/api/v1/dashboard/summary"
```

## Próximos passos

| Objetivo                     | Documento                                               |
| ---------------------------- | ------------------------------------------------------- |
| Rodar com Oracle real        | [Guia de desenvolvimento](../guides/desenvolvimento.md) |
| Implantar em produção        | [Guia de deploy](../guides/deploy.md)                   |
| Entender a arquitetura       | [Arquitetura](../explanation/arquitetura.md)            |
| Consultar todos os endpoints | [Referência da API](../reference/api.md)                |
| Usar cada módulo             | [Guias de uso](../guides/uso/fichas-e-travas.md)        |

## O que você aprendeu

- O AEGIS é dividido em **frontend** (React/Vite, porta 5173) e **backend** (NestJS, porta 8090).
- O frontend conversa com o backend via proxy `/api` → `:8090`.
- O backend usa **Oracle DB**, mas o modo `MOCK_DB=true` permite desenvolvê-lo e testá-lo sem banco.
- Fichas, travas, badlist, importação, monitoramento e logs são módulos expostos na API `api/v1`.
