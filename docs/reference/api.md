# Referência da API

Referência técnica de todos os endpoints HTTP do backend NestJS do AEGIS.

## Visão geral

- **Base URL (dev):** `http://localhost:8090`
- **Prefixo global:** `/api/v1` (todas as rotas, exceto `/health`)
- **Formato:** JSON
- **Autenticação:** nenhuma atualmente
- **Validação:** `ValidationPipe` global — campos não declarados nos DTOs são rejeitados (HTTP 400)
- **CORS:** habilitado · **Helmet:** cabeçalhos de segurança ativos

### Paginação (comum a todas as listagens)

| Parâmetro   | Tipo   | Padrão                  | Observação                                                   |
| ----------- | ------ | ----------------------- | ------------------------------------------------------------ |
| `page`      | number | `1`                     | Mínimo 1                                                     |
| `limit`     | number | `20`                    | 1–100                                                        |
| `search`    | string | —                       | Busca textual ampla (varia por endpoint)                     |
| `sortBy`    | string | —                       | Validado por allowlist por endpoint                          |
| `sortOrder` | string | `asc` ou `desc` (varia) | `asc` em fichas/travas/badlist; `desc` em logs/monitoramento |

**Resposta padrão de listagem:**

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Formato de erro

Erros de negócio retornam objetos `{ type, message }` (HTTP 400/404) e os demais são normalizados pelo `AllExceptionsFilter`:

```json
{ "type": "NOT_FOUND", "message": "Ficha não encontrada" }
```

---

## Health check

### `GET /health`

Sem prefixo `/api/v1`. Usado pelo Nginx, pelo dashboard e por healthchecks.

**Resposta:**

```json
{ "status": "healthy", "uptime": 123.45, "lastCheck": "2026-08-01T12:00:00.000Z" }
```

---

## Fichas

### `GET /api/v1/fichas`

Lista fichas com paginação e filtros.

**Filtros:** `search` (atendimento, serviço, oferta, detalhe), `atendimentoPara`, `servico`, `ofertaServico`, `detalheFalha`.

**Sort:** `sortBy` em `atendimentoPara | servico | ofertaServico | detalheFalha | categoria | subcategoria`.

**Exemplo:**

```bash
curl "http://localhost:8090/api/v1/fichas?page=1&limit=20&search=rede&atendimentoPara=b2c"
```

**Item:**

```json
{
  "id": "1",
  "atendimentoPara": "b2c",
  "servico": "REDE",
  "ofertaServico": "GOV",
  "detalheFalha": "LATENCIA ELEVADA NO LINK",
  "categoria": "Rede",
  "subcategoria": "Conectividade"
}
```

### `GET /api/v1/fichas/:id`

Retorna uma ficha ou `404 NOT_FOUND` (`{ type: "NOT_FOUND", message: "Ficha não encontrada" }`).

### `POST /api/v1/fichas`

Cria uma ficha.

**Corpo (`CreateFichaDto`):**

```json
{
  "atendimentoPara": "b2c",
  "servico": "Suporte Tecnico",
  "ofertaServico": "Premium",
  "detalheFalha": "Falha na autenticacao",
  "categoria": "Seguranca",
  "subcategoria": "Autenticacao"
}
```

| Campo             | Obrigatório | Limite |
| ----------------- | ----------- | ------ |
| `atendimentoPara` | sim         | 100    |
| `servico`         | sim         | 100    |
| `ofertaServico`   | não         | 100    |
| `detalheFalha`    | não         | 200    |
| `categoria`       | não         | 100    |
| `subcategoria`    | não         | 100    |

Os valores são armazenados **como enviados** (sem conversão de caixa). `categoria` e `subcategoria` vazias são salvas como `NULL`. A normalização de caixa (minúsculo/maiúsculo) ocorre apenas no fluxo de [importação massiva](#importação-massiva).

### `PUT /api/v1/fichas/:id`

Atualiza uma ficha (mesmo corpo do POST, campos opcionais). Retorna `404` se não existir.

### `DELETE /api/v1/fichas/:id`

Remove uma ficha. Retorna **HTTP 204** (sem corpo) ou `404`.

---

## Travas

### `GET /api/v1/travas`

Lista travas com paginação e filtros.

**Filtros:** `search` (nome, descrição, endpoint, método), `nome`, `endpoint`.

**Sort:** `sortBy` em `nome | descricao | endpoint | metodo | ativo`.

**Item:**

```json
{
  "id": "1",
  "nome": "Login Legado",
  "descricao": "Trava de seguranca para login",
  "endpoint": "/api/v2/login",
  "metodo": "POST",
  "ativo": true,
  "acao": null,
  "bodyTemplate": null
}
```

> `ativo` é booleano (mapeado de `ATIVO = 'TRUE'/'FALSE'`).

### `GET /api/v1/travas/:id`

Retorna uma trava ou `404`.

### `POST /api/v1/travas/:id/disable`

Desativa uma trava:

```sql
UPDATE AEGIS_TRAVAS SET ATIVO = 'FALSE' WHERE ID = :id AND ATIVO = 'TRUE'
```

Retorna a trava atualizada. Se já estiver inativa, retorna a trava como está (200). `404` se não existir.

---

## Badlist

### `GET /api/v1/badlist`

Lista entradas da badlist (JOIN com fichas).

**Filtros:** `search` (serviço, atendimento, oferta, detalhe, palavras), `atendimentoPara`, `servico`, `active` (`1` = ativa, `0` = inativa).

**Sort:** `sortBy` em `id | servico | atendimentoPara | ofertaServico | detalheFalha | words | active | createdAt`.

**Item:**

```json
{
  "id": "1",
  "fichaId": "5",
  "servico": "SEGURANCA",
  "atendimentoPara": "b2c",
  "ofertaServico": "PREMIUM",
  "detalheFalha": "TENTATIVA DE ACESSO NAO AUTORIZADO",
  "words": "cancelamento|cancela|desistencia",
  "active": 1,
  "createdAt": "2026-07-31T18:00:00.000Z"
}
```

> `active` é numérico (`1`/`0`).

### `GET /api/v1/badlist/:id`

Retorna uma entrada ou `404`.

### `POST /api/v1/badlist`

Cria uma badlist (pode vincular várias fichas de uma vez).

**Corpo (`CreateBadlistDto`):**

```json
{
  "fichaIds": ["5", "6"],
  "words": "cancelamento|cancela",
  "active": 1
}
```

| Campo      | Obrigatório | Regra                                                                                |
| ---------- | ----------- | ------------------------------------------------------------------------------------ |
| `fichaIds` | sim         | Array não vazio de strings                                                           |
| `words`    | sim         | Max 4000; palavras separadas por `\|` sem espaços; sem duplicatas (case-insensitive) |
| `active`   | sim         | inteiro                                                                              |

**Validações de negócio (400 `VALIDATION`):**

- Ficha inexistente → `Ficha X não encontrada`
- Ficha já possui badlist → `A ficha X já possui palavras na badlist`
- Palavras duplicadas → `Palavra duplicada: X`

**Efeitos:** insere em `AEGIS_BADLIST` **e** garante `AEGIS_FICHAS_TRAVAS (FICHA_ID, TRAVA_ID=12)`.

**Resposta:** `{ "inserted": <n> }`

### `PUT /api/v1/badlist/:id`

Atualiza `words` e/ou `active` de uma entrada existente. `404` se não existir.

### `DELETE /api/v1/badlist/:id`

Remove uma entrada. Retorna **HTTP 204** ou `404`.

---

## Dashboard

### `GET /api/v1/dashboard/summary`

Resumo de KPIs:

```json
{
  "totalRecords": 150,
  "activeLocks": 8,
  "disabledLocks": 2,
  "totalImports": 0,
  "successfulImports": 0,
  "failedImports": 0,
  "travasComSucessoUltimaHora": 42
}
```

### `GET /api/v1/dashboard/recent-activity`

Últimas atividades (importações, travas, monitoramento, registros).

### `GET /api/v1/dashboard/health`

Health check do backend (idêntico ao `/health`).

### `GET /api/v1/dashboard/external-health`

Consulta o health do serviço externo MS Aegis (`http://brtlvbgs2355co:8081/ms-b2c-vivo-aegis/v1/actuator/health`), com cache de 30 s e timeout de 5 s.

**Resposta:**

```json
{
  "url": "http://brtlvbgs2355co:8081/ms-b2c-vivo-aegis/v1/actuator/health",
  "status": "healthy",
  "statusCode": 200,
  "responseTimeMs": 120,
  "lastCheck": "2026-08-01T12:00:00.000Z",
  "details": "{\"status\":\"UP\"}"
}
```

`status` pode ser `healthy` (HTTP 2xx), `degraded` (erro HTTP) ou `down` (timeout/inacessível). `statusCode` e `details` aparecem conforme o caso; em `down` não há `statusCode`.

---

## Importação massiva

### `POST /api/v1/import-massivo/preview`

Envio **multipart/form-data** com o campo `file` (`.csv`, `.xlsx` ou `.xls`).

**Resposta:**

```json
{
  "sessionId": "uuid",
  "totalRows": 150,
  "validCount": 148,
  "invalidCount": 2,
  "preview": [{ "rowNumber": 1, "atendimentoPara": "b2c", "servico": "REDE", "...": "..." }],
  "invalidRows": [
    { "rowNumber": 7, "errors": ["ATENDIMENTO_PARA invalido: xyz. Use b2c, b2b ou interno"] }
  ]
}
```

**Erros (400):** arquivo vazio, extensão inválida, leitura impossível, cabeçalhos obrigatórios ausentes, apenas cabeçalho.

### `POST /api/v1/import-massivo/execute/:sessionId`

Inicia a importação em background.

**Resposta:** `{ "message": "Importação iniciada", "sessionId": "..." }`

### `GET /api/v1/import-massivo/status/:sessionId`

Acompanha o progresso:

```json
{
  "id": "uuid",
  "status": "running",
  "totalRows": 150,
  "processedRows": 30,
  "successCount": 28,
  "errorCount": 2,
  "errors": [{ "row": 7, "message": "..." }],
  "updatedAt": "...",
  "fileName": "fichas.csv"
}
```

`status`: `pending` → `running` → `completed`. Erros com `message` por linha.

### `GET /api/v1/import-massivo/modelo?formato=csv|xlsx`

Baixa o arquivo-modelo para preenchimento.

---

## Logs de execução

### `GET /api/v1/logs/execucao`

Lista registros de `AEGIS_LOGS`.

**Filtros:** `search` (endpoint, validação, resultado), `endpoint`, `validationName`, `status`, `dateFrom`, `dateTo` (formato `YYYY-MM-DD HH24:MI:SS`), `executionTimeMin`, `executionTimeMax`.

**Padrão de período:** sem `dateFrom`/`dateTo`, usa a **última hora**.

**Sort:** `sortBy` em `ENDPOINT | VALIDATION_NAME | STATUS | EXECUTION_TIME_MS | CREATED_AT` (default `CREATED_AT DESC`).

**Item:**

```json
{
  "id": "1",
  "correlationId": "abc-123",
  "endpoint": "/api/v1/travas/1/disable",
  "validationName": "valida.desativar.trava",
  "result": "Trava desativada com sucesso",
  "status": "SUCCESS",
  "executionTimeMs": 234,
  "createdAt": "...",
  "inputValue": "{\"id\":1}"
}
```

---

## Monitoramento

### `GET /api/v1/monitoring/logs`

Lista registros de `AEGIS_MONITORING_LOGS`.

**Filtros:** `search` (sistema, corpo da requisição, IP), `dateFrom`, `dateTo`, `durationMin`, `durationMax`.

**Padrão de período:** sem `dateFrom`/`dateTo`, usa as **últimas 24 horas**.

**Sort:** `sortBy` em `SOURCE_SYSTEM | DURATION_MS | CREATED_AT` (default `CREATED_AT DESC`).

**Item:**

```json
{
  "id": "1",
  "correlationId": "abc-123",
  "sourceSystem": "Sentry",
  "requestBody": "{\"event\":\"error\"}",
  "durationMs": 145,
  "remoteAddr": "10.0.0.1",
  "userAgent": "Sentry/1.0",
  "createdAt": "..."
}
```

---

## Modelo de dados relacionado

As tabelas usadas por cada endpoint estão documentadas em [Modelo de dados](../explanation/modelo-de-dados.md).

## Limites e observações

- `limit` é limitado a **100** por request.
- Datas nos filtros de logs/monitoramento usam o formato Oracle `YYYY-MM-DD HH24:MI:SS`.
- Sessões de importação são em memória — reiniciar o backend invalida `sessionId` ativas.
- Não há autenticação; endpoints são públicos dentro da rede.
