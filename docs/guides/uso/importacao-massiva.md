# Importação Massiva (`/import/massivo`)

A importação massiva cria **centenas de fichas de uma vez** a partir de um arquivo **CSV ou XLSX**. Ela funciona em etapas: upload → validação → pré-visualização → execução → acompanhamento.

## 1. Baixar o modelo

O AEGIS fornece um arquivo-modelo pronto com o cabeçalho correto e uma linha de exemplo.

- Na tela de importação, use o botão **Baixar modelo** (CSV ou XLSX).

O modelo tem exatamente estas colunas (nesta ordem):

| Coluna             | Obrigatória | Exemplo                |
| ------------------ | ----------- | ---------------------- |
| `ATENDIMENTO_PARA` | Sim         | `b2c`                  |
| `SERVICO`          | Sim         | `EXEMPLO DE SERVICO`   |
| `OFERTA_SERVICO`   | Não         | `EXEMPLO DE OFERTA`    |
| `DETALHE_FALHA`    | Não         | `EXEMPLO DE FALHA`     |
| `CATEGORIA`        | Não         | `EXEMPLO CATEGORIA`    |
| `SUBCATEGORIA`     | Não         | `EXEMPLO SUBCATEGORIA` |

## 2. Regras de validação

Antes de importar, cada linha é validada:

| Regra                   | Detalhe                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------- |
| Cabeçalhos obrigatórios | As colunas `ATENDIMENTO_PARA` e `SERVICO` devem existir (maiúsculas ou minúsculas) |
| `ATENDIMENTO_PARA`      | Deve ser `b2c`, `b2b` ou `interno` (qualquer caixa)                                |
| `SERVICO`               | Obrigatório                                                                        |
| Arquivo vazio           | Arquivo com apenas cabeçalho é rejeitado                                           |
| Formato                 | Apenas `.csv`, `.xlsx`, `.xls`                                                     |
| Conteúdo                | CSV deve ser texto real (não HTML); XLSX deve ter planilha válida                  |

## 3. Fluxo da importação

```
1. Selecionar arquivo
        ↓
2. Upload (POST /import-massivo/preview)
        ↓
3. Validação + Pré-visualização (até 50 linhas)
        ↓
4. Confirmar execução (POST /import-massivo/execute/:sessionId)
        ↓
5. Acompanhar progresso (polling de status a cada 1,5s)
```

### Etapa 3 — Pré-visualização

Após o upload, o sistema mostra:

- **Total de linhas** lidas no arquivo.
- **Linhas válidas** e **inválidas** (com o motivo de cada erro).
- **Preview** das primeiras 50 linhas.
- Lista dos **erros encontrados** (primeiras 20).

Revise os erros antes de prosseguir. Você pode corrigir o arquivo e enviar novamente.

### Etapa 4 — Execução

Ao confirmar, a importação roda em **background**, em lotes de **10 linhas**:

- Sucessos e falhas são contabilizados por linha.
- Linhas com erro não impedem a importação das demais.

### Etapa 5 — Acompanhamento

O sistema faz _polling_ do status e exibe:

- **Status**: `pending` → `running` → `completed`.
- **Progresso**: `processedRows` / `totalRows`.
- **Sucessos** e **erros** (com número da linha e mensagem).

## 4. Tratar erros

### Retry de uma importação com falha

Se uma importação falhou ou teve erros, você pode **Tentar Novamente**:

- As linhas **já importadas com sucesso são preservadas**.
- A importação **retoma a partir do próximo lote** — não há duplicação.

### Erros comuns

| Erro                                   | Causa                   | Solução                                 |
| -------------------------------------- | ----------------------- | --------------------------------------- |
| `ATENDIMENTO_PARA é obrigatório`       | Célula vazia            | Preencher com `b2c`, `b2b` ou `interno` |
| `ATENDIMENTO_PARA inválido`            | Valor fora do domínio   | Usar `b2c`, `b2b` ou `interno`          |
| `SERVICO é obrigatório`                | Célula vazia            | Preencher o serviço                     |
| `Colunas obrigatórias não encontradas` | Cabeçalho diferente     | Usar o modelo baixado                   |
| `Arquivo contém apenas cabeçalho`      | Sem dados               | Preencher linhas com registros          |
| `Não foi possível ler o arquivo`       | Arquivo corrompido/HTML | Gerar CSV/XLSX real; baixar o modelo    |
| `Sessão não encontrada ou expirada`    | Backend reiniciou       | Enviar o arquivo novamente              |

## 5. Normalização aplicada

Ao importar, os dados são normalizados automaticamente:

| Campo                                                                     | Regra             |
| ------------------------------------------------------------------------- | ----------------- |
| `ATENDIMENTO_PARA`                                                        | minúsculo (`b2c`) |
| `SERVICO`, `OFERTA_SERVICO`, `DETALHE_FALHA`, `CATEGORIA`, `SUBCATEGORIA` | MAIÚSCULAS        |
| Acentos                                                                   | Preservados       |

## 6. Limitações

- **Sessão em memória:** a sessão de importação vive na memória do backend. Se o backend reiniciar, a sessão é perdida e o arquivo deve ser reenviado.
- **Preview limitado:** o preview mostra até 50 linhas e a lista de erros até 20 — para conferir tudo, valide o arquivo no modelo baixado.
- **Sem edição pós-upload:** os dados não são editáveis na pré-visualização; corrija no arquivo e reenvie.

Veja também: [Fichas, travas e dashboard](fichas-e-travas.md) · [Badlist](badlist.md)
