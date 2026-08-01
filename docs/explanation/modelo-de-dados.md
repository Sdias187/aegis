# Modelo de Dados

Este documento descreve as tabelas do banco Oracle usadas pelo AEGIS, as convenções de dados e as regras de normalização aplicadas pela aplicação.

## Visão geral

O banco é um **Oracle Database** acessado pelo backend via `oracledb` (Thin Mode) com um pool de conexões. Existem **6 tabelas** de negócio:

| Tabela                  | Finalidade                                        | Escrita pelo AEGIS                   |
| ----------------------- | ------------------------------------------------- | ------------------------------------ |
| `AEGIS_FICHAS`          | Fichas de incidentes                              | Sim (CRUD + importação)              |
| `AEGIS_TRAVAS`          | Catálogo de travas (bloqueios)                    | Parcial (desativação)                |
| `AEGIS_BADLIST`         | Palavras bloqueadas por ficha                     | Sim (CRUD)                           |
| `AEGIS_FICHAS_TRAVAS`   | Relação N:M ficha × trava                         | Sim (badlist insere `TRAVA_ID = 12`) |
| `AEGIS_LOGS`            | Logs de execução das travas                       | Não (somente leitura)                |
| `AEGIS_MONITORING_LOGS` | Requisições de sistemas de monitoramento externos | Não (somente leitura)                |

## Esquemas das tabelas

### AEGIS_FICHAS

```sql
CREATE TABLE AEGIS_FICHAS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ATENDIMENTO_PARA VARCHAR2(100) NOT NULL,
    SERVICO VARCHAR2(100) NOT NULL,
    OFERTA_SERVICO VARCHAR2(100),
    DETALHE_FALHA VARCHAR2(2000),
    CATEGORIA VARCHAR2(100),
    SUBCATEGORIA VARCHAR2(100),
    DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DATA_ATUALIZACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### AEGIS_TRAVAS

```sql
CREATE TABLE AEGIS_TRAVAS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    NOME VARCHAR2(200) NOT NULL,
    DESCRICAO VARCHAR2(500),
    ENDPOINT VARCHAR2(500) NOT NULL,
    METODO VARCHAR2(10) NOT NULL,
    ATIVO VARCHAR2(5) DEFAULT 'TRUE',
    ACAO VARCHAR2(200),
    BODY_TEMPLATE CLOB,
    DATA_CRIACAO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DATA_DESATIVACAO TIMESTAMP
);
```

> As colunas `ACAO` e `BODY_TEMPLATE` existem apenas em `AEGIS_TRAVAS` (não em `AEGIS_FICHAS`) e são mapeadas pelo serviço de travas.

### AEGIS_BADLIST

```sql
CREATE TABLE AEGIS_BADLIST (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FICHA_ID NUMBER NOT NULL,
    WORDS VARCHAR2(4000) NOT NULL,
    ACTIVE NUMBER(1) DEFAULT 1,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### AEGIS_FICHAS_TRAVAS

```sql
CREATE TABLE AEGIS_FICHAS_TRAVAS (
    FICHA_ID NUMBER NOT NULL,
    TRAVA_ID NUMBER NOT NULL,
    PRIMARY KEY (FICHA_ID, TRAVA_ID)
);
```

### AEGIS_LOGS

```sql
CREATE TABLE AEGIS_LOGS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CORRELATION_ID VARCHAR2(100),
    ENDPOINT VARCHAR2(500) NOT NULL,
    VALIDATION_NAME VARCHAR2(200),
    RESULT VARCHAR2(2000),
    STATUS VARCHAR2(50) NOT NULL,
    EXECUTION_TIME_MS NUMBER DEFAULT 0,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INPUT_VALUE CLOB
);
```

### AEGIS_MONITORING_LOGS

```sql
CREATE TABLE AEGIS_MONITORING_LOGS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CORRELATION_ID VARCHAR2(100),
    SOURCE_SYSTEM VARCHAR2(200) NOT NULL,
    REQUEST_BODY CLOB,
    DURATION_MS NUMBER DEFAULT 0,
    REMOTE_ADDR VARCHAR2(50),
    USER_AGENT VARCHAR2(500),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Convenções de dados

### Identificação

- Todas as tabelas usam a coluna **`ID`** (identity Oracle) como chave primária.
- Todas as operações de leitura/atualização/remoção usam `WHERE ID = :id`.
- **Nunca** usar `ROWID`.

### Valores de domínio

| Campo                        | Regra                                     | Observação                                                                                                                                  |
| ---------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `ATENDIMENTO_PARA`           | Valores `b2c`, `b2b` ou `interno`         | A interface exibe "B2C", "B2B", "Interno" e envia em minúsculo; a importação massiva normaliza para minúsculo. O CRUD armazena como enviado |
| `CATEGORIA` / `SUBCATEGORIA` | Campo opcional; vazio é salvo como `NULL` | A interface exibe `---` quando vazio; não há default `N/A`                                                                                  |
| `DETALHE_FALHA`              | Campo de texto regular                    | Exibido como `<Input>`, não como textarea                                                                                                   |

### Booleans: ATIVO vs ACTIVE

| Tabela          | Coluna   | Tipo          | Valores                       |
| --------------- | -------- | ------------- | ----------------------------- |
| `AEGIS_TRAVAS`  | `ATIVO`  | `VARCHAR2(5)` | `'TRUE'` / `'FALSE'` (texto!) |
| `AEGIS_BADLIST` | `ACTIVE` | `NUMBER(1)`   | `1` / `0`                     |

> ⚠️ **Atenção:** `ATIVO` é texto (`'TRUE'`/`'FALSE'`), **não** `1`/`0`. Usar `1`/`0` em `ATIVO` causa o erro `ORA-01722: invalid number`. Já `ACTIVE` (badlist) é numérico. Nunca misture os dois padrões.

### Palavras da badlist (`WORDS`)

- Armazenadas **separadas por pipe, sem espaços**: `cancelamento|cancela|desistencia`.
- Palavras **únicas** — duplicatas (case-insensitive) são rejeitadas na criação.
- Cada ficha pode ter **no máximo uma** entrada na badlist.
- Uma entrada pode referenciar **uma ou mais fichas** (criação múltipla).
- A trava da badlist é fixa: **`TRAVA_ID = 12`** em `AEGIS_FICHAS_TRAVAS`. Ao criar uma badlist, o backend insere `(FICHA_ID, 12)` nessa tabela caso ainda não exista:

```sql
INSERT INTO AEGIS_FICHAS_TRAVAS (FICHA_ID, TRAVA_ID)
SELECT :fichaId, 12 FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM AEGIS_FICHAS_TRAVAS
    WHERE FICHA_ID = :fichaId AND TRAVA_ID = 12
);
```

## Normalização aplicada

A normalização de caixa acontece na camada de **serviço** do backend, **apenas no fluxo de importação massiva** (`ImportMassivoService`). No CRUD de fichas, os valores são persistidos como enviados (com `trim()` em campos opcionais).

| Campo              | Regra                | Exemplo                                           | Onde se aplica     |
| ------------------ | -------------------- | ------------------------------------------------- | ------------------ |
| `ATENDIMENTO_PARA` | Lowercase            | `B2C` → `b2c`, `B2c` → `b2c`                      | Importação massiva |
| `SERVICO`          | UPPERCASE            | `suporte técnico` → `SUPORTE TECNICO`             | Importação massiva |
| `OFERTA_SERVICO`   | UPPERCASE            | `premium` → `PREMIUM`                             | Importação massiva |
| `DETALHE_FALHA`    | UPPERCASE            | `falha na autenticação` → `FALHA NA AUTENTICACAO` | Importação massiva |
| `CATEGORIA`        | UPPERCASE (opcional) | —                                                 | Importação massiva |
| `SUBCATEGORIA`     | UPPERCASE (opcional) | —                                                 | Importação massiva |
| Acentos            | **Preservados**      | `ç`, `ã`, `é` permanecem como digitados           | Todos os fluxos    |

> **Importante:** acentos e caracteres especiais **não** são removidos nem convertidos (sem ASCII-folding). `MÁQUINA` permanece `MÁQUINA`.

## Índices

O script de criação define índices para as buscas mais comuns:

```sql
CREATE INDEX IDX_FICHAS_ATENDIMENTO ON AEGIS_FICHAS(ATENDIMENTO_PARA);
CREATE INDEX IDX_FICHAS_SERVICO    ON AEGIS_FICHAS(SERVICO);
CREATE INDEX IDX_TRAVAS_NOME       ON AEGIS_TRAVAS(NOME);
CREATE INDEX IDX_TRAVAS_ENDPOINT   ON AEGIS_TRAVAS(ENDPOINT);
CREATE INDEX IDX_LOGS_STATUS       ON AEGIS_LOGS(STATUS);
CREATE INDEX IDX_LOGS_CREATED_AT   ON AEGIS_LOGS(CREATED_AT);
CREATE INDEX IDX_MONITORING_SOURCE ON AEGIS_MONITORING_LOGS(SOURCE_SYSTEM);
CREATE INDEX IDX_MONITORING_CREATED_AT ON AEGIS_MONITORING_LOGS(CREATED_AT);
```

## Permissões

O usuário `AEGIS` recebe privilégios distintos por tabela:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON AEGIS_FICHAS TO AEGIS;
GRANT SELECT, INSERT, UPDATE, DELETE ON AEGIS_TRAVAS TO AEGIS;
GRANT SELECT ON AEGIS_LOGS TO AEGIS;
GRANT SELECT ON AEGIS_MONITORING_LOGS TO AEGIS;
```

Ou seja, os logs são **somente leitura** para o AEGIS. A escrita em `AEGIS_MONITORING_LOGS` é responsabilidade dos sistemas de monitoramento externos (Sentry, Grafana, etc.).

## Scripts de inicialização

Os scripts DDL e seed ficam em `backend/init-scripts/`:

| Arquivo                | Conteúdo                                               |
| ---------------------- | ------------------------------------------------------ |
| `01-create-tables.sql` | Criação das tabelas, índices e grants                  |
| `02-seed-data.sql`     | Dados de exemplo (fichas, travas, logs, monitoramento) |

> ⚠️ **Segurança:** esses scripts **não** são executados automaticamente pelo docker-compose. Eles existem apenas no disco para execução manual quando necessário (o Docker do Oracle monta a pasta, mas não os roda por padrão). Em produção corporativa, as tabelas já são criadas pelo DBA.

> **Nota:** a estrutura descrita acima reflete as tabelas e colunas usadas pelo código atual. Ao aplicar `01-create-tables.sql` em um banco novo, verifique se as tabelas `AEGIS_BADLIST`, `AEGIS_FICHAS_TRAVAS` e as colunas `ACAO`/`BODY_TEMPLATE`/`CORRELATION_ID` estão presentes (elas podem precisar ser adicionadas ao script conforme a versão do ambiente).

Veja também: [Arquitetura](arquitetura.md) · [Referência da API](../reference/api.md)
