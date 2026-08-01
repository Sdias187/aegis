# Consulta de Logs (GPS, VIVO 360, Siebel)

Os módulos de **Consulta de Logs** e **Serviços** permitem buscar registros em sistemas externos. Eles **não** consultam as tabelas do Oracle do AEGIS — são interfaces de busca simples sobre logs armazenados em servidores Linux (GPS e VIVO 360) e sobre o serviço Siebel.

> **Importante:** ao contrário das telas de Fichas/Travas (tabelas de dados), estas telas são **buscas simples**: você digita um termo, clica em buscar e visualiza os resultados. Não há paginação server-side nem filtros por coluna.

## 1. GPS (`/consulta-logs/gps`)

Interface de consulta aos logs do sistema **GPS**.

1. Digite o termo de busca (por exemplo, um `correlationId`, IP ou trecho da mensagem).
2. Clique em **Buscar**.
3. Os resultados dos logs do servidor são exibidos na tela.

## 2. VIVO 360 (`/consulta-logs/vivo-360`)

Interface de consulta aos logs do **VIVO 360**, com o mesmo comportamento:

1. Digite o termo de busca.
2. Clique em **Buscar**.
3. Visualize os resultados.

## 3. Siebel (`/servicos/siebel`)

Consulta ao serviço **Siebel**. É uma implementação de **demonstração (mock)** — os dados exibidos são fictícios e servem para validar o fluxo de consulta na interface.

## 4. Limitações atuais

| Aspecto                           | Situação                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Integração real com os servidores | GPS e VIVO 360 ainda **não** têm integração real implementada — a busca é a interface de consulta aos logs desses sistemas |
| Siebel                            | Implementação mock (dados fictícios)                                                                                       |
| Filtros avançados                 | Não disponíveis; apenas busca por termo                                                                                    |

## 5. Para desenvolvedores

Estes módulos ficam em `src/features/consulta-logs/` (GPS, VIVO 360) e `src/features/servicos/` (Siebel). Cada um tem:

- Componentes de página (`gps-page.tsx`, `vivo-360-page.tsx`, `siebel-page.tsx`).
- Serviços de API próprios (`siebel-api.ts`, etc.).

Quando a integração real com os sistemas de log for implementada, os serviços de API serão conectados aos endpoints correspondentes, mantendo a interface de busca atual.

Veja também: [Monitoramento](monitoramento.md) · [Logs de execução](logs-de-execucao.md)
