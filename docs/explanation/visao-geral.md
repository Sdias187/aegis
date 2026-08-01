# Visão Geral do AEGIS

## O que é o AEGIS?

O AEGIS é um sistema corporativo de **gerenciamento de travas e incidentes**. Ele funciona como uma central de controle para equipes que precisam registrar incidentes (fichas), bloquear temporariamente a operação de serviços críticos (travas) e monitorar a saúde desses serviços.

O termo **trava** representa um bloqueio controlado: quando um serviço apresenta instabilidade ou uma manutenção é programada, uma trava é ativada para interromper a operação daquele endpoint até que o problema seja resolvido. O AEGIS permite **desativar uma trava** diretamente pela interface, registrando a operação em logs.

## Para que serve?

O sistema resolve três necessidades principais da operação:

1. **Cadastro e consulta de fichas** — Registros de incidentes com contexto de atendimento (`b2c`, `b2b` ou `interno`), serviço afetado, oferta de serviço e detalhe da falha. As fichas são a base de tudo: uma trava e uma badlist sempre se referenciam a uma ficha.

2. **Controle de travas** — Visualização do catálogo de travas (nome, endpoint, método HTTP, status ativo/inativo) e desativação de travas com um clique.

3. **Visibilidade operacional** — O AEGIS coleta e exibe:
   - **Logs de execução** (`AEGIS_LOGS`): registros das operações executadas contra as travas.
   - **Monitoramento** (`AEGIS_MONITORING_LOGS`): requisições recebidas de sistemas de monitoramento externos (Sentry, Grafana, Prometheus, etc.), permitindo saber quais ferramentas consultam o AEGIS e com que desempenho.
   - **Dashboard**: resumo em tempo real com contadores e saúde de serviços externos.

4. **Importação massiva** — Upload de arquivos CSV/XLSX para criar centenas de fichas de uma vez, com validação, pré-visualização e retomada automática em caso de falha.

5. **Badlist** — Associação de palavras bloqueadas (separadas por `|`) a fichas. A badlist alimenta a trava de bloqueio de palavras (`TRAVA_ID = 12`), impedindo que determinados termos sejam usados em chamadas bloqueadas.

## Módulos da aplicação

A interface é organizada em três grupos de navegação:

### Travas

| Módulo           | Rota              | Função                                               |
| ---------------- | ----------------- | ---------------------------------------------------- |
| Dashboard        | `/`               | KPIs, atividade recente e saúde de serviços externos |
| Fichas           | `/records`        | CRUD de fichas de incidentes                         |
| Travas           | `/locks`          | Catálogo de travas e desativação                     |
| Importação       | `/import/massivo` | Importação massiva de fichas                         |
| Badlist          | `/badlist`        | Palavras bloqueadas por ficha                        |
| Logs de Execução | `/logs/execution` | Consulta dos registros de execução                   |
| Monitoramento    | `/monitoring`     | Consulta dos logs de monitoramento                   |

### Consulta de Logs

| Módulo   | Rota                      | Função                                        |
| -------- | ------------------------- | --------------------------------------------- |
| GPS      | `/consulta-logs/gps`      | Busca em logs do sistema GPS (servidor Linux) |
| VIVO 360 | `/consulta-logs/vivo-360` | Busca em logs do VIVO 360 (servidor Linux)    |

### Serviços

| Módulo | Rota               | Função                     |
| ------ | ------------------ | -------------------------- |
| Siebel | `/servicos/siebel` | Consulta ao serviço Siebel |

> **Nota:** Os módulos de Consulta de Logs (GPS, VIVO 360) são interfaces de busca simples sobre logs armazenados em servidores Linux — não são tabelas de dados do banco Oracle. O módulo Siebel é uma implementação de demonstração (mock).

## Stack tecnológica

| Camada    | Tecnologia                             | Porta padrão |
| --------- | -------------------------------------- | ------------ |
| Frontend  | React 19, TypeScript, Vite 8, Tailwind | 5173 (dev)   |
| Backend   | NestJS 10, TypeScript                  | 8090         |
| Banco     | Oracle DB (oracledb v7, Thin Mode)     | 1521         |
| Proxy     | Nginx                                  | 80 (prod)    |
| Estado FE | TanStack React Query + Zustand         | —            |
| Testes    | Vitest, Playwright, Storybook          | 6006 (SB)    |

## Ambiente de execução

O AEGIS suporta três formas de execução:

| Modo                           | Descrição                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Desenvolvimento**            | Frontend com Vite (hot reload) + backend NestJS com `start:dev`. Pode rodar sem banco usando `MOCK_DB=true`. |
| **Docker (produção)**          | Stack completa: Nginx (frontend buildado) + backend + Oracle XE 21c, via `docker compose up`.                |
| **Docker (teste/corporativo)** | Frontend + backend apontando para um Oracle corporativo remoto, via `docker-compose.test.yml`.               |

Para começar, siga o [Tutorial de primeiro acesso](../tutorials/primeiro-acesso.md). Para entender as camadas em detalhe, leia a [Arquitetura](arquitetura.md).
