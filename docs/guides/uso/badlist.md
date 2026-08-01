# Badlist (`/badlist`)

A badlist associa **palavras bloqueadas** a fichas do catálogo. Cada entrada liga uma ficha a um conjunto de palavras separadas por `|` (ex.: `cancelamento|cancela|desistencia`). A criação de uma badlist também vincula a ficha à trava de bloqueio de palavras (`TRAVA_ID = 12`).

## 1. Entendendo a badlist

| Conceito                | Detalhe                                                                         |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Entrada**             | Um registro: 1 ficha + N palavras + status ativo/inativo                        |
| **Palavras**            | Separadas por **pipe, sem espaços** — ex.: `cancelamento\|cancela\|desistencia` |
| **Vínculo com trava**   | Ao criar, o sistema garante o vínculo `(FICHA_ID, 12)` em `AEGIS_FICHAS_TRAVAS` |
| **Unicidade**           | Cada ficha pode ter **no máximo uma** entrada na badlist                        |
| **Palavras duplicadas** | Rejeitadas na criação (comparação ignora maiúsculas/minúsculas)                 |
| **Status**              | `ACTIVE = 1` (ativa) ou `0` (inativa)                                           |

> **Regra:** uma única criação pode associar as **mesmas palavras a várias fichas** (multiseleção). Mas cada ficha só pode ter uma entrada — se uma ficha já tiver badlist, a criação falha para ela.

## 2. Navegar e pesquisar

| Elemento           | Descrição                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------- |
| Busca geral        | Procura em serviço, atendimento, oferta, detalhe da falha **e** nas palavras                 |
| Filtro Atendimento | Filtra pelo atendimento da ficha                                                             |
| Filtro Serviço     | Filtra pelo serviço da ficha                                                                 |
| Filtro Status      | Filtra por ativa (`1`) ou inativa (`0`)                                                      |
| Ordenação          | Colunas ordenáveis: Serviço, Atendimento, Oferta, Detalhe Falha, Palavras, Status, Criado em |

A tabela mostra: ficha (serviço/atendimento/oferta/detalhe), palavras, status e data de criação.

## 3. Criar uma badlist

1. Clique em **Nova Badlist**.
2. **Selecione as fichas** no seletor:
   - A busca é **server-side**: digite para pesquisar (com debounce) e use **Carregar mais** para trazer mais resultados (10 por página).
   - Use **Selecionar visíveis** para marcar os itens da página atual ou **Limpar tudo** para desmarcar.
   - As fichas selecionadas aparecem como **chips removíveis**.
3. **Digite as palavras** separadas por `|` (sem espaços). Ex.: `cancelamento|cancela|desistencia`.
4. Informe o **status** (ativo/inativo).
5. Clique em **Salvar**.

> **O que acontece no backend:** valida a existência de cada ficha, rejeita fichas que já têm badlist, rejeita palavras duplicadas, insere em `AEGIS_BADLIST` e garante o vínculo `AEGIS_FICHAS_TRAVAS (FICHA_ID, TRAVA_ID=12)`.

## 4. Editar uma badlist

1. Use a ação **Editar** na linha.
2. Altere as palavras ou o status (a ficha não é alterável na edição).
3. Clique em **Salvar Alterações**.

A edição atualiza `WORDS` e `ACTIVE`; o vínculo com a trava 12 permanece.

## 5. Excluir uma badlist

1. Use a ação **Excluir** na linha.
2. Confirme na caixa de diálogo.

> **Nota:** a exclusão remove a entrada da `AEGIS_BADLIST`, mas **não** remove automaticamente o vínculo `AEGIS_FICHAS_TRAVAS`. Se for necessário remover o vínculo da trava, isso é feito na camada de banco/operação.

## 6. Dicas e limitações

- **Formato das palavras:** use pipe sem espaços. O backend normaliza `palavra1 | palavra2` → `palavra1|palavra2` e remove espaços em branco extras.
- **"Importação Massiva" (badlist):** o botão existe na interface como placeholder desabilitado — previsto para versões futuras. A importação de fichas usa o módulo `/import/massivo`.
- **Criação em lote:** se alguma ficha selecionada já tiver badlist, a criação falha para ela — revise a seleção e remova a ficha conflitante.

Veja também: [Fichas, travas e dashboard](fichas-e-travas.md) · [Importação massiva](importacao-massiva.md)
