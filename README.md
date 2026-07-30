# AEGIS

Sistema corporativo para gerenciamento de travas e incidentes.

---

## Indice

1. [Arquitetura](#1-arquitetura)
2. [Tecnologias](#2-tecnologias)
3. [Pre-requisitos](#3-pre-requisitos)
4. [Quick Start](#4-quick-start)
5. [Docker](#5-docker)
6. [Variaveis de Ambiente](#6-variaveis-de-ambiente)
7. [Estrutura do Projeto](#7-estrutura-do-projeto)
8. [Navegacao (Sidebar)](#8-navegacao-sidebar)
9. [Endpoints da API](#9-endpoints-da-api)
10. [Scripts](#10-scripts)

---

## 1. Arquitetura

```
Navegador
    │
    ├── Dev: Vite :5173 ─── proxy /api ──→ Backend :8090
    │
    └── Prod: Nginx :80 ─── proxy_pass ──→ Backend :8090
                                              │
                                         Oracle DB :1521
```

### Fluxo de requisicao

```
Browser → Vite (:5173) / Nginx (:80)
    → /api/v1/fichas
        → Backend NestJS (:8090)
            → Oracle DB (ou MOCK_DB=true retorna vazio)
```

---

## 2. Tecnologias

| Camada     | Tecnologia                            |
| ---------- | ------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind  |
| Estado     | TanStack React Query, Zustand         |
| Roteamento | React Router v7                       |
| Backend    | NestJS 10, TypeScript                 |
| Banco      | OracleDB (oracledb v7, Thin Mode)     |
| Container  | Docker, Docker Compose                |
| Proxy      | Nginx (producao)                      |

---

## 3. Pre-requisitos

| Ferramenta        | Versao    |
| ----------------- | --------- |
| Node.js           | >= 22     |
| pnpm              | >= 10     |
| Docker (opcional) | >= 24     |
| Oracle DB         | 19c / XE  |

---

## 4. Quick Start

### 4.1 Apenas frontend + backend (sem Oracle)

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env       # configurar credenciais (ou deixar padrao)
npm install
MOCK_DB=true npm run start:dev   # sobe na :8090 sem banco

# Terminal 2 - Frontend
pnpm install
npm run dev                     # sobe na :5173
```

Acessar: http://localhost:5173

### 4.2 Com banco Oracle real

```bash
# Terminal 1 - Backend
cd backend
cp .env.example .env
# Editar .env: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECTION_STRING
npm install
npm run start:dev

# Terminal 2 - Frontend (desativar MSW)
# Editar .env.development: VITE_FF_ENABLE_MOCK_API=false
npm run dev
```

### 4.3 Stack completa via Docker (Oracle local)

```bash
docker compose up -d
# Aguardar ~2min para Oracle inicializar
# Acessar: http://localhost
```

---

## 5. Docker

### 5.1 Producao (Oracle + Backend + Frontend)

```bash
docker compose up -d
docker compose logs -f
```

| Servico     | Imagem                 | Porta              |
| ----------- | ---------------------- | ------------------ |
| `aegis-app` | Nginx (frontend build) | 80                 |
| `aegis-api` | Node (backend NestJS)  | 8090 (interna)     |
| `oracle-db` | Oracle XE 21c          | 1521               |

### 5.2 Apenas backend + frontend (sem Oracle local)

```bash
ORACLE_USER=usuario \
ORACLE_PASSWORD=senha \
ORACLE_CONNECTION_STRING=host:1521/SERVICO \
docker compose -f docker-compose.test.yml up -d
```

### 5.3 Desenvolvimento com hot reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

---

## 6. Variaveis de Ambiente

### 6.1 Frontend (.env.development / .env.production)

| Variavel                  | Descricao                          | Padrao     |
| ------------------------- | ---------------------------------- | ---------- |
| `VITE_API_URL`            | URL base da API                    | `/api/v1`  |
| `VITE_FF_ENABLE_MOCK_API` | Ativar MSW (dados mockados)        | `false`    |

### 6.2 Backend (.env)

| Variavel                   | Descricao                    | Padrao                  |
| -------------------------- | ---------------------------- | ----------------------- |
| `PORT`                     | Porta do servidor            | `8090`                  |
| `ORACLE_USER`              | Usuario Oracle               | `AEGIS`                 |
| `ORACLE_PASSWORD`          | Senha Oracle                 | `aegis123`              |
| `ORACLE_CONNECTION_STRING` | String de conexao Oracle     | `localhost:1521/XEPDB1` |
| `DB_POOL_MIN`              | Minimo de conexoes no pool   | `2`                     |
| `DB_POOL_MAX`              | Maximo de conexoes no pool   | `10`                    |
| `LOG_LEVEL`                | Nivel de log                 | `info`                  |
| `MOCK_DB`                  | Ignorar Oracle (dados vazios)| `false`                 |

---

## 7. Estrutura do Projeto

```
/
├── src/                          # Frontend React + Vite
│   ├── api/                      # Endpoints da API
│   ├── components/
│   │   ├── layout/               # Sidebar, Topbar, Breadcrumb
│   │   └── ui/                   # Button, Input, Select, Card, Dialog
│   ├── features/
│   │   ├── dashboard/            # Dashboard com KPIs
│   │   ├── records/              # CRUD AEGIS_FICHAS
│   │   ├── locks/                # Listagem AEGIS_TRAVAS
│   │   ├── import/               # Importacao (legado)
│   │   ├── import-massivo/       # Importacao CSV/XLSX
│   │   ├── consulta-logs/        # GPS, VIVO 360
│   │   ├── servicos/             # Siebel
│   │   ├── execution-logs/       # Logs de execucao
│   │   └── monitoring/           # Monitoramento
│   ├── routes/                   # Router + lazy loading
│   └── store/                    # Zustand stores
│
├── backend/                      # Backend NestJS
│   ├── src/
│   │   ├── main.ts               # Entry point
│   │   ├── app.module.ts         # Modulo raiz
│   │   ├── fichas/               # CRUD fichas
│   │   ├── travas/               # Listagem travas
│   │   ├── dashboard/            # Dashboard + health
│   │   ├── database/             # Pool Oracle + executeQuery
│   │   ├── import-massivo/       # Importacao CSV/XLSX
│   │   └── common/               # Pipes, filters, interfaces
│   ├── init-scripts/             # DDL + seed para Oracle
│   ├── Dockerfile
│   └── .env.example
│
├── .docker/                      # Nginx + entrypoint
├── docker-compose.yml            # Producao
├── docker-compose.dev.yml        # Desenvolvimento
├── Dockerfile                    # Frontend multi-stage
└── .env.development / .env.production
```

---

## 8. Navegacao (Sidebar)

```
Travas
├── Dashboard
├── Fichas
├── Travas
├── Importacao
├── Logs de Execucao
└── Monitoramento
Consulta de Logs
├── GPS
└── VIVO 360
Servicos
└── Siebel
```

---

## 9. Endpoints da API

### Fichas

| Metodo | Rota                        | Descricao              |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/fichas`            | Listar (paginado)      |
| GET    | `/api/v1/fichas/:id`        | Detalhe                |
| POST   | `/api/v1/fichas`            | Criar                  |

### Travas

| Metodo | Rota                        | Descricao              |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/travas`            | Listar (paginado)      |
| GET    | `/api/v1/travas/:id`        | Detalhe                |

### Dashboard

| Metodo | Rota                                | Descricao              |
| ------ | ----------------------------------- | ---------------------- |
| GET    | `/api/v1/dashboard/summary`         | Resumo                 |
| GET    | `/api/v1/dashboard/health`          | Health check           |

### Importacao Massiva

| Metodo | Rota                                           | Descricao              |
| ------ | ---------------------------------------------- | ---------------------- |
| POST   | `/api/v1/import-massivo/preview`               | Upload + preview       |
| POST   | `/api/v1/import-massivo/execute/:sessionId`    | Executar importacao    |
| GET    | `/api/v1/import-massivo/status/:sessionId`     | Progresso              |
| GET    | `/api/v1/import-massivo/modelo?formato=csv|xlsx` | Download template    |

### Saude

| Metodo | Rota           | Descricao                          |
| ------ | -------------- | ---------------------------------- |
| GET    | `/health`      | Health check (sem prefixo /api/v1) |

---

## 10. Scripts

### Frontend

| Comando       | Descricao              |
| ------------- | ---------------------- |
| `npm run dev` | Iniciar dev server     |
| `npm run build` | Build de producao    |
| `npm run preview` | Preview do build    |

### Backend

| Comando               | Descricao              |
| --------------------- | ---------------------- |
| `npm run start:dev`   | Iniciar em modo dev    |
| `npm run build`       | Compilar TypeScript    |
| `npm start`           | Iniciar build          |
