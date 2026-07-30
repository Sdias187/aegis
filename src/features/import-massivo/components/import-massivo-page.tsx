import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { importMassivoApi, type ImportRow, type ImportStatus } from '../services/import-massivo-api';
import { ROUTES } from '@/routes/routes';

type PageState = 'idle' | 'preview' | 'running' | 'completed' | 'failed';

export default function ImportMassivoPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<{
    totalRows: number;
    validCount: number;
    invalidCount: number;
    preview: ImportRow[];
    invalidRows: ImportRow[];
  } | null>(null);
  const [status, setStatus] = useState<ImportStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);

  // Polling for import status
  useEffect(() => {
    if (pageState !== 'running' || !sessionId) return;

    const poll = setInterval(async () => {
      try {
        const result = await importMassivoApi.status(sessionId);
        setStatus(result);

        if (result.status === 'completed') {
          setPageState('completed');
          clearInterval(poll);
        } else if (result.status === 'failed') {
          setPageState('failed');
          clearInterval(poll);
        }
      } catch {
        clearInterval(poll);
        setPageState('failed');
        setError('Erro ao verificar status da importação');
      }
    }, 1500);

    return () => clearInterval(poll);
  }, [pageState, sessionId]);

  const handleFileSelect = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
      setError(`Arquivo ".${ext}" não suportado. Apenas arquivos .csv e .xlsx são aceitos.`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setPageState('idle');

    try {
      const result = await importMassivoApi.preview(selectedFile);
      setSessionId(result.sessionId);
      setPreviewData(result);
      setPageState('preview');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao processar arquivo');
      setPageState('failed');
    }
  }, []);

  const handleStartImport = async () => {
    if (!sessionId) return;
    setPageState('running');

    try {
      await importMassivoApi.execute(sessionId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Erro ao iniciar importação');
      setPageState('failed');
    }
  };

  const handleRetry = () => {
    if (sessionId) {
      // Re-execute the same session (backend resets progress for retry)
      handleStartImport();
    }
  };

  const handleReset = () => {
    setPageState('idle');
    setFile(null);
    setSessionId(null);
    setPreviewData(null);
    setStatus(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadTemplate = (formato: 'csv' | 'xlsx') => {
    const url = importMassivoApi.downloadModelo(formato);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modelo-importacao-fichas.${formato}`;
    a.click();
    setShowTemplateMenu(false);
  };

  const progressPercent = status
    ? Math.round((status.processedRows / (status.totalRows || 1)) * 100)
    : 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importação Massiva</h1>
          <p className="text-sm text-muted-foreground">
            Importe múltiplas fichas a partir de um arquivo CSV ou XLSX
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button variant="outline" onClick={() => setShowTemplateMenu(!showTemplateMenu)}>
              Baixar Modelo
            </Button>
            {showTemplateMenu && (
              <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-border bg-surface shadow-lg">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-surface-elevated transition-colors"
                  onClick={() => handleDownloadTemplate('csv')}
                >
                  .csv
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm hover:bg-surface-elevated transition-colors"
                  onClick={() => handleDownloadTemplate('xlsx')}
                >
                  .xlsx
                </button>
              </div>
            )}
          </div>
          <Button variant="ghost" onClick={() => navigate(ROUTES.RECORDS.LIST)}>
            Voltar
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl p-6">
        {/* Estado IDLE: Upload */}
        {pageState === 'idle' && (
          <div className="space-y-6">
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-12 transition-colors hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files[0];
                if (droppedFile) handleFileSelect(droppedFile);
              }}
            >
              <p className="text-lg font-medium text-foreground">
                Clique para selecionar ou arraste o arquivo
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Formatos aceitos: .csv, .xlsx
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
          </div>
        )}

        {/* Estado PREVIEW: Mostrar dados parseados */}
        {pageState === 'preview' && previewData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Arquivo: <span className="font-medium text-foreground">{file?.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {previewData.totalRows} linha(s) encontrada(s):
                  {' '}
                  <span className="text-success">{previewData.validCount} válida(s)</span>
                  {previewData.invalidCount > 0 && (
                    <span className="text-danger">, {previewData.invalidCount} inválida(s)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleReset}>
                  Trocar Arquivo
                </Button>
                <Button onClick={handleStartImport} disabled={previewData.validCount === 0}>
                  Iniciar Importação ({previewData.validCount} registros)
                </Button>
              </div>
            </div>

            {/* Preview table */}
            <div className="max-h-80 overflow-auto rounded-md border border-border">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-surface">
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">ATENDIMENTO_PARA</th>
                    <th className="px-3 py-2 font-medium">SERVICO</th>
                    <th className="px-3 py-2 font-medium">OFERTA_SERVICO</th>
                    <th className="px-3 py-2 font-medium">DETALHE_FALHA</th>
                    <th className="px-3 py-2 font-medium">CATEGORIA</th>
                    <th className="px-3 py-2 font-medium">SUBCATEGORIA</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className={`border-b border-border ${
                        row.errors && row.errors.length > 0 ? 'bg-danger/5' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-muted-foreground">{row.rowNumber}</td>
                      <td className="px-3 py-2">{row.atendimentoPara}</td>
                      <td className="px-3 py-2">{row.servico}</td>
                      <td className="px-3 py-2">{row.ofertaServico || '-'}</td>
                      <td className="px-3 py-2">{row.detalheFalha || '-'}</td>
                      <td className="px-3 py-2">{row.categoria || '-'}</td>
                      <td className="px-3 py-2">{row.subcategoria || '-'}</td>
                      <td className="px-3 py-2">
                        {row.errors && row.errors.length > 0 ? (
                          <span className="text-xs text-danger" title={row.errors.join('; ')}>
                            Inválido
                          </span>
                        ) : (
                          <span className="text-xs text-success">Válido</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.totalRows > 50 && (
              <p className="text-xs text-muted-foreground">
                Mostrando as primeiras 50 linhas. Total: {previewData.totalRows} linhas.
              </p>
            )}

            {/* Invalid rows */}
            {previewData.invalidRows.length > 0 && (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-3">
                <p className="mb-2 text-sm font-medium text-danger">Linhas com erro:</p>
                <ul className="space-y-1 text-xs text-danger">
                  {previewData.invalidRows.map((row) => (
                    <li key={row.rowNumber}>
                      Linha {row.rowNumber}: {row.errors?.join('; ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estado RUNNING: Progresso */}
        {pageState === 'running' && status && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">Importando...</p>
              <p className="text-sm text-muted-foreground">
                {status.successCount} sucessos, {status.errorCount} erros
              </p>
            </div>

            <div className="mx-auto max-w-md">
              <div className="mb-2 flex justify-between text-sm">
                <span>{progressPercent}%</span>
                <span>
                  {status.processedRows} de {status.totalRows}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {status.errors.length > 0 && (
              <div className="max-h-32 overflow-auto rounded-md border border-danger/30 bg-danger/5 p-3">
                <p className="mb-1 text-xs font-medium text-danger">
                  {status.errors.length} erro(s) até agora:
                </p>
                <ul className="space-y-0.5 text-xs text-danger">
                  {status.errors.slice(-5).map((e, i) => (
                    <li key={i}>Linha {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Estado COMPLETED: Resultado */}
        {pageState === 'completed' && status && (
          <div className="space-y-6 py-8 text-center">
            <div className="text-4xl">✓</div>
            <p className="text-lg font-medium text-foreground">Importação concluída!</p>
            <div className="flex justify-center gap-8">
              <div>
                <p className="text-2xl font-bold text-success">{status.successCount}</p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </div>
              {status.errorCount > 0 && (
                <div>
                  <p className="text-2xl font-bold text-danger">{status.errorCount}</p>
                  <p className="text-sm text-muted-foreground">Erros</p>
                </div>
              )}
            </div>

            {status.errors.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-md border border-danger/30 bg-danger/5 p-3 text-left">
                <p className="mb-1 text-xs font-medium text-danger">Detalhes dos erros:</p>
                <ul className="space-y-0.5 text-xs text-danger">
                  {status.errors.map((e, i) => (
                    <li key={i}>Linha {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleReset}>
                Nova Importação
              </Button>
              <Button onClick={() => navigate(ROUTES.RECORDS.LIST)}>
                Ver Fichas
              </Button>
            </div>
          </div>
        )}

        {/* Estado FAILED: Erro */}
        {pageState === 'failed' && (
          <div className="space-y-6 py-8 text-center">
            <div className="text-4xl">✕</div>
            <p className="text-lg font-medium text-danger">Erro na importação</p>
            <p className="text-sm text-muted-foreground">
              {error || status?.errors?.[0]?.message || 'Ocorreu um erro durante a importação'}
            </p>

            {status && status.processedRows > 0 && (
              <div className="flex justify-center gap-8">
                <div>
                  <p className="text-2xl font-bold text-success">{status.successCount}</p>
                  <p className="text-sm text-muted-foreground">Importados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-danger">{status.errorCount}</p>
                  <p className="text-sm text-muted-foreground">Com erro</p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleReset}>
                Novo Arquivo
              </Button>
              {sessionId && (
                <Button onClick={handleRetry}>
                  Tentar Novamente
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Estado idle também mostra erro se houver */}
        {pageState === 'idle' && error && (
          <div className="mt-4 rounded-md border border-danger/30 bg-danger/5 p-3">
            <p className="text-sm text-danger">{error}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setError(null)}>
              OK
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
