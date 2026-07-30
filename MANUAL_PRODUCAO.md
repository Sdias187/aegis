# Manual de Uso — Producao (Provisorio)

Este documento descreve os passos para execucao do AEGIS em ambiente de pre-producao e producao.

> **Nota:** Este e um manual provisorio para uso durante a fase de testes. A versao final sera atualizada conforme a implantacao avancar.

---

## Indice

1. [Visao Geral](#1-visao-geral)
2. [Pre-requisitos](#2-pre-requisitos)
3. [Configuracao de Ambiente](#3-configuracao-de-ambiente)
4. [Deploy com Docker](#4-deploy-com-docker)
5. [Deploy Manual (sem Docker)](#5-deploy-manual-sem-docker)
6. [Modo MOCK_DB (Teste sem Banco)](#6-modo-mock_db-teste-sem-banco)
7. [Importacao Massiva](#8-importacao-massiva)
8. [Referencia de Portas](#9-referencia-de-portas)
9. [Verificacao](#10-verificacao)
10. [Solucao de Problemas](#11-solucao-de-problemas)

---

## 1. Visao Geral

O AEGIS e composto por tres camadas:

| Camada     | Tecnologia          | Porta     |
| ---------- | ------------------- | --------- |
| Frontend   | React 19 + Vite     | 5173      |
| Backend    | NestJS 10           | 8090      |
| Proxy      | Nginx (producao)    | 80        |
| Banco      | Oracle DB           | 1521      |

### Fluxo de requisicao

```
Usuario → Nginx :80 → /api/* → Backend :8090 → Oracle :1521
                     → /*     → Frontend (arquivos estaticos)
```

---

## 2. Pre-requisitos

- **Node.js 22+** (para deploy manual)
- **pnpm 10+** (frontend)
- **npm** (backend)
- **Docker Desktop 24+** (para deploy em container)
- **Acesso ao Oracle** com as tabelas `AEGIS_FICHAS` e `AEGIS_TRAVAS` criadas
- Scripts DDL disponiveis em `backend/init-scripts/01-create-tables.sql`

---

## 3. Configuracao de Ambiente

### 3.1 Backend — `.env`

Arquivo: `backend/.env` (criar a partir de `backend/.env.example`)

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
VITE_FF_ENABLE_MOCK_API=false
```

### 3.3 Frontend — `.env.development` (para testes locais)

```env
VITE_API_URL=/api/v1
VITE_FF_ENABLE_MOCK_API=false
```

---

## 4. Deploy com Docker

### 4.1 Stack completa (Oracle local + Backend + Frontend)

```bash
# Subir tudo
docker compose up -d

# Acompanhar logs
docker compose logs -f

# Acessar
# http://localhost
```

Isso inicia tres servicos:
- `oracle-db` — Oracle XE 21c (cria as tabelas via `init-scripts/`)
- `aegis-api` — Backend NestJS na porta 8090
- `aegis-app` — Nginx servindo o frontend na porta 80

> Na primeira execucao, o Oracle leva ~2 minutos para inicializar e rodar os scripts DDL.

### 4.2 Apenas Backend + Frontend (Oracle remoto)

Se o Oracle estiver em um servidor corporativo, use o `docker-compose.test.yml`:

```bash
ORACLE_USER=usuario \
ORACLE_PASSWORD=senha \
ORACLE_CONNECTION_STRING=servidor:1521/SERVICO \
docker compose -f docker-compose.test.yml up -d
```

### 4.3 Comandos uteis

```bash
# Ver logs de um servico especifico
docker compose logs aegis-api
docker compose logs oracle-db

# Parar tudo
docker compose down

# Parar e apagar volume do Oracle (recriar banco)
docker compose down -v

# Rebuildar um servico
docker compose build aegis-api
```

---

## 5. Deploy Manual (sem Docker)

### 5.1 Backend

```bash
cd backend

# 1. Configurar ambiente
cp .env.example .env
# Editar .env com as credenciais Oracle

# 2. Instalar dependencias
npm install

# 3. Compilar
npm run build

# 4. Iniciar
npm start
# Servidor em http://localhost:8090
```

### 5.2 Frontend

```bash
# 1. Instalar dependencias
pnpm install

# 2. Build de producao
npm run build

# 3. Servir com Nginx (recomendado)
# Usar config em .docker/nginx.conf
# Ou via preview do Vite:
npm run preview
# Servidor em http://localhost:4173
```

### 5.3 Proxy Nginx manual

Configuracao minima para rodar o frontend buildado com o backend:

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

---

## 6. Modo MOCK_DB (Teste sem Banco)

Para testar o backend sem acesso ao Oracle, ative o modo mock:

```bash
MOCK_DB=true npm run start:dev
```

Neste modo:
- O backend **ignora a conexao Oracle** e inicializa normalmente
- Todas as queries retornam arrays vazios
- Os endpoints funcionam mas retornam `{ data: [], pagination: { total: 0 } }`
- Ideal para testar fluxo da interface, navegacao e importacao massiva
- Log mostrado na inicializacao:

```
WARN [DatabaseService]  MOCK_DB = true — rodando sem banco
WARN [DatabaseService]  Todas as queries retornarao dados vazios
```

### Ativacao via .env

Adicionar no `backend/.env`:

```
MOCK_DB=true
```

---

## 7. Importacao Massiva

### Fluxo de uso

1. Acessar `/records/new` e clicar em **Importacao Massiva**
2. Ou acessar diretamente `/import/massivo`
3. Clicar em **Baixar Modelo** para obter o template (.csv ou .xlsx)
4. Preencher o template com os dados
5. Arrastar ou selecionar o arquivo preenchido
6. Revisar o preview dos dados
7. Clicar em **Iniciar Importacao**
8. Acompanhar o progresso em tempo real
9. Ao finalizar, ver o resumo de importacao

### Regras de validacao

- `ATENDIMENTO_PARA`: apenas `b2c`, `b2b` ou `interno` (case insensitive)
- `SERVICO`: obrigatorio
- `CATEGORIA` e `SUBCATEGORIA`: opcionais (valor padrao: `N/A`)
- Formatos aceitos: `.csv` e `.xlsx`

### Normalizacao aplicada

| Campo             | Regra                    | Exemplo                    |
| ----------------- | ------------------------ | -------------------------- |
| ATENDIMENTO_PARA  | lowercase                | `b2c`, `b2b`, `interno`   |
| SERVICO           | UPPERCASE                | `SUPORTE TECNICO`          |
| OFERTA_SERVICO    | UPPERCASE                | `PREMIUM`                  |
| DETALHE_FALHA     | UPPERCASE                | `FALHA NA AUTENTICACAO`    |
| CATEGORIA         | UPPERCASE (opcional)     | `SEGURANCA`                |
| SUBCATEGORIA      | UPPERCASE (opcional)     | `AUTENTICACAO`             |

### Retry em caso de erro

Se a importacao falhar no meio (por exemplo, perda de conexao):
- O sistema exibe quantos registros foram importados com sucesso
- O boto **Tentar Novamente** retoma a partir do ultimo lote processado
- Nao e necessario reenviar o arquivo

---

## 8. Referencia de Portas

| Ambiente | Servico   | Porta     | Observacao                |
| -------- | --------- | --------- | ------------------------- |
| Dev      | Frontend  | 5173      | Vite dev server           |
| Dev      | Backend   | 8090      | NestJS                    |
| Prod     | Nginx     | 80        | Frontend buildado         |
| Prod     | Backend   | 8090      | Interna (so o Nginx acessa)|
| Todos    | Oracle    | 1521      | Conforme configurado      |

---

## 9. Verificacao

Apos iniciar o backend, testar os endpoints:

```bash
# Health check
curl http://localhost:8090/health

# Dashboard
curl http://localhost:8090/api/v1/dashboard/summary

# Fichas
curl http://localhost:8090/api/v1/fichas?page=1&limit=5

# Travas
curl http://localhost:8090/api/v1/travas?page=1&limit=5
```

Com Docker, todos os endpoints ficam disponiveis em `http://localhost/api/v1/...`

---

## 10. Solucao de Problemas

### Backend nao inicializa (erro Oracle)

```text
[Nest] ERROR [ExceptionHandler] ORA-12170: TNS:Connect timeout occurred
```

**Causa:** O backend nao consegue conectar no Oracle.
**Solucao:**
- Verificar se `ORACLE_CONNECTION_STRING` esta correta
- Verificar se o Oracle esta acessivel (ping, firewall)
- Usar `MOCK_DB=true` para testes sem banco

### ECONNREFUSED no frontend

```text
[vite] http proxy error: /api/v1/fichas
AggregateError [ECONNREFUSED]
```

**Causa:** O frontend tenta fazer proxy para o backend mas ele nao esta rodando.
**Solucao:**
- Iniciar o backend: `cd backend && npm run start:dev`
- Verificar se a porta esta correta (8090)

### MSW retornando dados mockados

```text
Dados aparecem mesmo com backend rodando
```

**Causa:** `VITE_FF_ENABLE_MOCK_API=true` no `.env.development`.
**Solucao:** Alterar para `VITE_FF_ENABLE_MOCK_API=false` e reiniciar o frontend.

### Importacao Massiva — "Invalid HTML: could not find <table>"

**Causa:** Arquivo CSV mal formatado ou com extensao incorreta.
**Solucao:**
- Usar o template baixado pelo sistema
- Verificar se o arquivo nao foi salvo como HTML
- Confirmar que a extensao e `.csv` ou `.xlsx`

### Docker — Oracle demora para iniciar

**Causa:** O Oracle XE leva ate 2 minutos para inicializar na primeira execucao.
**Solucao:** Aguardar e verificar com `docker compose logs -f oracle-db`.

### Docker — "group nginx in use"

**Causa:** A imagem `nginx:1.27-alpine` ja possui o usuario `nginx` criado.
**Solucao:** Ja corrigido na versao atual do `Dockerfile`. Usar `--no-cache` no build.
