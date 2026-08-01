# Documentação do AEGIS

O **AEGIS** é um sistema corporativo para **gerenciamento de travas e incidentes**. Ele centraliza o cadastro de fichas de incidentes, o controle de travas (bloqueios) de serviços, a importação massiva de dados, a gestão de palavras bloqueadas (badlist) e a consulta de logs de execução e monitoramento.

Esta documentação foi organizada seguindo o modelo **Diátaxis**, que divide a documentação em quatro quadrantes, cada um respondendo a uma necessidade diferente:

| Quadrante          | Pergunta que responde                   | Para quem                   | Onde está                        |
| ------------------ | --------------------------------------- | --------------------------- | -------------------------------- |
| **Tutorial**       | Quero aprender, por onde começo?        | Novatos                     | [`tutorials/`](./tutorials/)     |
| **Guias (How-to)** | Quero resolver uma tarefa específica    | Usuários e desenvolvedores  | [`guides/`](./guides/)           |
| **Referência**     | Quero consultar detalhes técnicos       | Desenvolvedores e operações | [`reference/`](./reference/)     |
| **Explanação**     | Quero entender como funciona por dentro | Todos                       | [`explanation/`](./explanation/) |

---

## Comece por aqui

Não sabe por onde começar? Siga o **tutorial de primeiro acesso** — ele leva você do zero até rodar a aplicação e criar a primeira ficha.

> 👉 [Tutorial: Primeiro acesso](tutorials/primeiro-acesso.md)

---

## Mapa da documentação por público

### 👨‍💻 Desenvolvedores

| Objetivo                                       | Documento                                                   |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Entender a arquitetura e o fluxo de requisição | [Arquitetura](explanation/arquitetura.md)                   |
| Conhecer o modelo de dados e convenções        | [Modelo de dados](explanation/modelo-de-dados.md)           |
| Preparar o ambiente de desenvolvimento         | [Guia de desenvolvimento](guides/desenvolvimento.md)        |
| Consultar todos os endpoints da API            | [Referência da API](reference/api.md)                       |
| Consultar variáveis de ambiente                | [Variáveis de ambiente](reference/variaveis-de-ambiente.md) |
| Entender a estrutura do projeto                | [Estrutura do projeto](reference/estrutura-do-projeto.md)   |
| Consultar os scripts disponíveis               | [Scripts](reference/scripts.md)                             |
| Contribuir com código novo                     | [Guia de contribuição](guides/contribuicao.md)              |

### 🚀 Operações / Deploy

| Objetivo                                 | Documento                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Implantar em produção (Docker ou manual) | [Guia de deploy](guides/deploy.md)                                               |
| Configurar variáveis de ambiente         | [Variáveis de ambiente](reference/variaveis-de-ambiente.md)                      |
| Solucionar problemas comuns              | [Guia de deploy → Solução de problemas](guides/deploy.md#9-solução-de-problemas) |
| Entender o modelo de dados do banco      | [Modelo de dados](explanation/modelo-de-dados.md)                                |

### 🧑‍💼 Usuários finais

| Tarefa                                      | Guia                                                        |
| ------------------------------------------- | ----------------------------------------------------------- |
| Gerenciar fichas e travas, usar o dashboard | [Fichas, travas e dashboard](guides/uso/fichas-e-travas.md) |
| Importar fichas em massa (CSV/XLSX)         | [Importação massiva](guides/uso/importacao-massiva.md)      |
| Gerenciar palavras bloqueadas (badlist)     | [Badlist](guides/uso/badlist.md)                            |
| Consultar logs do GPS, VIVO 360 e Siebel    | [Consulta de logs](guides/uso/consulta-logs.md)             |
| Acompanhar o monitoramento                  | [Monitoramento](guides/uso/monitoramento.md)                |
| Consultar logs de execução                  | [Logs de execução](guides/uso/logs-de-execucao.md)          |

---

## Visão geral em uma imagem

```
Navegador
   │
   ├── Dev:  Vite :5173 ── proxy /api ──→ Backend NestJS :8090 ──→ Oracle DB :1521
   │
   └── Prod: Nginx :80 ── proxy_pass /api ──→ Backend NestJS :8090 ──→ Oracle DB :1521
```

| Camada   | Tecnologia                           |
| -------- | ------------------------------------ |
| Frontend | React 19, TypeScript, Vite, Tailwind |
| Backend  | NestJS 10, TypeScript                |
| Banco    | Oracle DB (oracledb v7, Thin Mode)   |
| Proxy    | Nginx (produção)                     |

Para entender cada peça em detalhe, leia a [Explanação de arquitetura](explanation/arquitetura.md).
