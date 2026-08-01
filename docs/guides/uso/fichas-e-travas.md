# Fichas, Travas e Dashboard

Este guia cobre as tarefas mais comuns do AEGIS: gerenciar fichas de incidentes, consultar e desativar travas, e acompanhar o dashboard.

## 1. Fichas (`/records`)

A tela **Fichas** lista os registros de incidentes em uma tabela paginada com busca e filtros.

### Navegar e pesquisar

| Elemento             | Descrição                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Busca geral          | "Buscar em todos os campos..." — procura em atendimento, serviço, oferta e detalhe da falha |
| Filtro Atendimento   | Filtra por `b2c`, `b2b`, `interno`                                                          |
| Filtro Serviço       | Filtra pelo nome do serviço                                                                 |
| Filtro Oferta        | Filtra pela oferta de serviço                                                               |
| Filtro Detalhe Falha | Filtra pelo texto do detalhe                                                                |
| Ordenação            | Clique nos cabeçalhos das colunas para ordenar                                              |
| Paginação            | Navegação por páginas (20 itens por padrão)                                                 |

> A busca é **insensível a maiúsculas/minúsculas** (o backend normaliza com `UPPER`).

### Criar uma ficha

1. Clique em **Nova Ficha**.
2. Preencha o formulário na ordem: **Atendimento** → **Serviço + Oferta de Serviço** (lado a lado) → **Detalhe da Falha** → **Categoria + Subcategoria** (lado a lado).
3. Em **Atendimento**, escolha uma das opções: `B2C`, `B2B` ou `Interno` — a interface envia o valor em minúsculo (`b2c`, `b2b`, `interno`).
4. Campos opcionais: Oferta de Serviço, Detalhe da Falha, Categoria, Subcategoria.
5. Clique em **Criar Ficha**.

> **Observação:** os valores são salvos **como digitados** (sem conversão de caixa). A normalização para minúsculo/maiúsculo ocorre apenas na importação massiva. Acentos são preservados. Campos opcionais vazios são salvos como nulos e exibidos como `---`.

### Editar uma ficha

1. Clique em uma ficha da lista para abrir o detalhe (drawer).
2. Use a ação **Editar**.
3. Ajuste os campos e clique em **Salvar Alterações**.

### Excluir uma ficha

1. Use a ação **Excluir** na linha da ficha.
2. Confirme na caixa de diálogo.

> **Atenção:** excluir uma ficha remove o registro. Se a ficha tiver vínculos (badlist, travas), verifique antes de excluir.

## 2. Travas (`/locks`)

A tela **Travas** exibe o catálogo de travas com nome, endpoint, método HTTP e status (Ativa/Inativa).

### Consultar travas

| Elemento        | Descrição                                          |
| --------------- | -------------------------------------------------- |
| Busca geral     | Procura em nome, descrição, endpoint e método      |
| Filtro Nome     | Filtra pelo nome da trava                          |
| Filtro Endpoint | Filtra pelo endpoint                               |
| Detalhe         | Clique em uma trava para abrir o modal de detalhes |

### Desativar uma trava

1. Localize a trava desejada.
2. Clique em **Desativar**.
3. Confirme na caixa de diálogo.

A trava tem o status alterado de `ATIVO = 'TRUE'` para `'FALSE'`, e a operação fica registrada nos logs de execução (`/logs/execution`).

> **Limitação atual:** a desativação é a única ação de escrita disponível no catálogo de travas. Cadastro, edição e reativação não estão expostos na interface — o catálogo é alimentado diretamente no banco.

## 3. Dashboard (`/`)

O dashboard é a página inicial e apresenta um resumo operacional:

| Componente            | Conteúdo                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Stat cards**        | Total de registros (fichas), travas ativas, travas desativadas e travas com sucesso na última hora         |
| **Atividade recente** | Últimas operações registradas em `AEGIS_LOGS` (importações, travas, monitoramento, registros)              |
| **Status do sistema** | Health check do backend (`/health`) e **health externo** do MS Aegis (`/api/v1/dashboard/external-health`) |

### Health externo

O dashboard consulta o endpoint de saúde do serviço externo `http://brtlvbgs2355co:8081/ms-b2c-vivo-aegis/v1/actuator/health` (com cache de 30 segundos e timeout de 5 segundos). O status exibido pode ser:

- **healthy** — serviço respondeu com HTTP 2xx.
- **degraded** — serviço respondeu com erro HTTP.
- **down** — serviço inacessível/timeout.

Se o serviço externo não estiver acessível a partir do ambiente, esse cartão exibirá **down** — verifique a rede/firewall antes de tratar como incidente.

## Dicas rápidas

- Prefira a **busca geral** para encontrar registros quando não souber a coluna exata.
- Use os filtros específicos para reduzir o resultado (eles combinam com a busca geral).
- O dashboard reflete dados reais de `AEGIS_LOGS` — sem logs gravados, os contadores aparecem zerados.

Veja também: [Importação massiva](importacao-massiva.md) · [Badlist](badlist.md) · [Logs de execução](logs-de-execucao.md)
