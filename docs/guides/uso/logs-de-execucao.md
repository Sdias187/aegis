# Logs de Execução (`/logs/execution`)

A tela de **Logs de Execução** consulta a tabela `AEGIS_LOGS`, que registra as operações executadas contra as travas e os serviços do AEGIS (desativações, validações, importações, etc.).

## 1. O que a tela mostra

| Coluna         | Conteúdo                                                        |
| -------------- | --------------------------------------------------------------- |
| **Endpoint**   | `ENDPOINT` — recurso acessado (ex.: `/api/v1/travas/1/disable`) |
| **Validação**  | `VALIDATION_NAME` — nome da validação executada                 |
| **Resultado**  | `RESULT` — mensagem de resultado da operação                    |
| **Status**     | `STATUS` — `SUCCESS`, `ERROR`, `VALIDATION_ERROR`, etc.         |
| **Duração**    | `EXECUTION_TIME_MS` — tempo de execução em milissegundos        |
| **Data**       | `CREATED_AT`                                                    |
| **Correlação** | `CORRELATION_ID` — identificador de correlação                  |
| **Entrada**    | `INPUT_VALUE` — payload enviado (CLOB)                          |

A lista é paginada e ordenada por **Data (desc)** por padrão. Você pode ordenar por **Endpoint**, **Validação**, **Status** e **Duração** clicando nos cabeçalhos.

## 2. Filtros

| Filtro                   | Descrição                                                           |
| ------------------------ | ------------------------------------------------------------------- |
| **Busca geral**          | Procura em endpoint, validação e resultado                          |
| **Endpoint**             | Filtra pelo endpoint (LIKE)                                         |
| **Validação**            | Filtra pelo nome da validação (LIKE)                                |
| **Status**               | Filtra por status exato (`SUCCESS`, `ERROR`, `VALIDATION_ERROR`...) |
| **Data inicial / final** | Intervalo personalizado (`YYYY-MM-DD HH24:MI:SS`)                   |
| **Duração mín. / máx.**  | Filtra por tempo de execução em ms                                  |

> **Padrão:** se nenhum período for escolhido, o sistema mostra a **última hora**.

## 3. Dicas de uso

- Para investigar uma falha, filtre por **Status = `ERROR`** e combine com o **endpoint** afetado.
- Para medir desempenho, ordene por **Duração** e use os filtros de duração mín./máx.
- O **correlationId** pode ser usado para correlacionar um log de execução com os registros de monitoramento.

Veja também: [Monitoramento](monitoramento.md) · [Consulta de logs](consulta-logs.md)
