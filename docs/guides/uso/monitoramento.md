# Monitoramento (`/monitoring`)

A tela de **Monitoramento** consulta a tabela `AEGIS_MONITORING_LOGS`, que registra requisições recebidas de sistemas de monitoramento externos (Sentry, Grafana, Prometheus, Azure Monitor, Elastic APM, etc.).

> **Importante:** o AEGIS apenas **lê** esses registros. A escrita é feita pelos próprios sistemas de monitoramento externos na tabela do banco.

## 1. O que a tela mostra

| Coluna         | Conteúdo                                               |
| -------------- | ------------------------------------------------------ |
| **Sistema**    | `SOURCE_SYSTEM` — qual ferramenta enviou a requisição  |
| **Duração**    | `DURATION_MS` formatado (ex.: `1.5s`, `234ms`)         |
| **Origem**     | `REMOTE_ADDR` (IP) em fonte monoespaçada               |
| **User-Agent** | Agente HTTP (truncado)                                 |
| **Data**       | `CREATED_AT` no formato pt-BR                          |
| **Requisição** | `REQUEST_BODY` (payload, fonte monoespaçada, truncado) |

A lista é paginada e ordenada por **Data (desc)** por padrão. Você pode ordenar por **Sistema** e **Duração** clicando nos cabeçalhos.

## 2. Filtros

### Busca geral

Campo de texto que procura em **sistema de origem**, **corpo da requisição** e **endereço IP** simultaneamente.

### Período (presets)

Atalhos rápidos de intervalo de datas:

- **Última hora**
- **Últimas 6h**
- **Últimas 24h**
- **Últimos 7 dias**
- **Personalizado** — intervalo de data/hora definido manualmente

> **Padrão:** se nenhum período for escolhido, o sistema mostra as **últimas 24 horas**.

### Duração

- **Duração mínima** (`durationMin`) e **máxima** (`durationMax`) em milissegundos — filtra por tempo de resposta.

## 3. Dicas de uso

- Use o **preset de período** para consultas frequentes (ex.: "últimas 6h" ao investigar um incidente recente).
- Combine a **busca geral** com o **período** para localizar requisições de um sistema específico em uma janela de tempo.
- Use os filtros de **duração** para achar requisições lentas (acima de um limite).

Veja também: [Logs de execução](logs-de-execucao.md) · [Consulta de logs](consulta-logs.md)
