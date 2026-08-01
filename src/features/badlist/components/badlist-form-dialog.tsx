import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Search, Check, X } from 'lucide-react';
import { Dialog, Button, Input, Select } from '@/components/ui';
import { useCreateBadlist, useUpdateBadlist } from '../hooks/use-badlist-mutations';
import { useFichasForSelect } from '../hooks/use-badlist';
import { useDebouncedValue } from '@/hooks';
import { SEARCH_DEBOUNCE_DELAY } from '@/utils';
import type { BadlistEntry } from '../types/badlist.types';
import type { Ficha } from '@/features/records/types/records.types';

interface BadlistFormDialogProps {
  open: boolean;
  editEntry: BadlistEntry | null;
  onClose: () => void;
}

const FICHA_PAGE_SIZE = 10;

function normalizeWords(words: string): string {
  return words.trim().replace(/\s*\|\s*/g, '|');
}

function validateWords(words: string): string | null {
  if (!words.trim()) return 'Palavras são obrigatórias';
  const normalized = normalizeWords(words);
  const parts = normalized.split('|').filter((p) => p.trim().length > 0);
  if (parts.length === 0) return 'Formato inválido. Use: palavra1|palavra2';
  const seen = new Set<string>();
  for (const part of parts) {
    const lower = part.trim().toLowerCase();
    if (seen.has(lower)) return `Palavra duplicada: ${part.trim()}`;
    seen.add(lower);
  }
  return null;
}

const ATENDIMENTO_OPTIONS = [
  { value: '', label: 'Todos os atendimentos' },
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
  { value: 'interno', label: 'Interno' },
];

function fichaLabel(ficha: Ficha): string {
  return ficha.servico || ficha.ofertaServico || ficha.atendimentoPara || ficha.id;
}

interface FichaSelectorProps {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearAll: (ids: string[]) => void;
}

function FichaSelector({ selectedIds, onToggle, onSelectAll, onClearAll }: FichaSelectorProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_DELAY);
  const [atendimento, setAtendimento] = useState('');
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<Ficha[]>([]);
  const [selectedMap, setSelectedMap] = useState<Map<string, Ficha>>(new Map());

  const { data, isLoading, isFetching, isError, refetch } = useFichasForSelect({
    page,
    limit: FICHA_PAGE_SIZE,
    search: debouncedSearch || undefined,
    atendimentoPara: atendimento || undefined,
  });

  const total = data?.pagination?.total ?? 0;
  const hasMore = accumulated.length < total;
  const accumulationKey = `${debouncedSearch}|${atendimento}`;
  const lastAccumKey = useRef<string>('');

  // Reset pagina quando busca/atendimento muda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, atendimento]);

  // Acumula resultados das paginas carregadas
  useEffect(() => {
    if (!data) return;
    if (lastAccumKey.current !== accumulationKey) {
      lastAccumKey.current = accumulationKey;
      setAccumulated(data.data);
      return;
    }
    setAccumulated((prev) => {
      const seen = new Map(prev.map((f) => [f.id, f]));
      data.data.forEach((f) => seen.set(f.id, f));
      return Array.from(seen.values());
    });
  }, [data, accumulationKey]);

  const allVisibleSelected =
    accumulated.length > 0 && accumulated.every((f) => selectedIds.has(f.id));

  const handleToggle = (ficha: Ficha) => {
    if (selectedIds.has(ficha.id)) {
      onToggle(ficha.id);
      setSelectedMap((prev) => {
        const next = new Map(prev);
        next.delete(ficha.id);
        return next;
      });
    } else {
      onToggle(ficha.id);
      setSelectedMap((prev) => new Map(prev).set(ficha.id, ficha));
    }
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      onClearAll(accumulated.map((f) => f.id));
      setSelectedMap((prev) => {
        const next = new Map(prev);
        accumulated.forEach((f) => next.delete(f.id));
        return next;
      });
    } else {
      onSelectAll(accumulated.map((f) => f.id));
      setSelectedMap((prev) => {
        const next = new Map(prev);
        accumulated.forEach((f) => next.set(f.id, f));
        return next;
      });
    }
  };

  const handleClearEverything = () => {
    onClearAll(Array.from(selectedIds));
    setSelectedMap(new Map());
  };

  const selectedFichas = Array.from(selectedMap.values());

  if (isLoading && page === 1) {
    return <p className="py-4 text-sm text-muted-foreground">Carregando fichas...</p>;
  }

  return (
    <div className="space-y-3">
      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fichas por serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-[160px] shrink-0">
          <Select
            options={ATENDIMENTO_OPTIONS}
            value={atendimento}
            onChange={(e) => setAtendimento(e.target.value)}
          />
        </div>
      </div>

      {/* Fichas selecionadas */}
      {selectedFichas.length > 0 && (
        <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
          <p className="mb-1.5 text-xs font-medium text-primary-light">
            {selectedFichas.length} ficha{selectedFichas.length !== 1 ? 's' : ''} selecionada
            {selectedFichas.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedFichas.map((ficha) => (
              <span
                key={ficha.id}
                className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-surface px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {fichaLabel(ficha)}
                <button
                  type="button"
                  onClick={() => handleToggle(ficha)}
                  className="text-muted-foreground hover:text-danger transition-colors"
                  aria-label={`Remover ${fichaLabel(ficha)}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lista de fichas */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {total} resultado{total !== 1 ? 's' : ''} · {accumulated.length} carregado
            {accumulated.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              disabled={accumulated.length === 0}
              className="text-xs font-medium text-primary-light hover:text-primary transition-colors disabled:opacity-40"
            >
              {allVisibleSelected ? 'Limpar visíveis' : 'Selecionar visíveis'}
            </button>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={handleClearEverything}
                className="text-xs font-medium text-danger hover:text-danger/80 transition-colors"
              >
                Limpar tudo
              </button>
            )}
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto rounded-md border border-border bg-background">
          {isError ? (
            <div className="p-4 text-center">
              <p className="text-sm text-danger">Erro ao carregar fichas</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-xs font-medium text-primary-light hover:text-primary"
              >
                Tentar novamente
              </button>
            </div>
          ) : accumulated.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {search || atendimento
                ? 'Nenhuma ficha encontrada com esses filtros'
                : 'Nenhuma ficha disponível'}
            </p>
          ) : (
            accumulated.map((ficha) => {
              const isSelected = selectedIds.has(ficha.id);
              return (
                <button
                  key={ficha.id}
                  type="button"
                  onClick={() => handleToggle(ficha)}
                  className={`flex w-full items-center gap-3 border-b border-border/50 px-3 py-2.5 text-left transition-colors last:border-b-0 ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-surface-elevated'
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background'
                    }`}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${
                        isSelected ? 'text-primary-light' : 'text-foreground'
                      }`}
                    >
                      {ficha.servico || '—'}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {ficha.atendimentoPara}
                      {ficha.ofertaServico && ` / ${ficha.ofertaServico}`}
                      {ficha.detalheFalha && ` — ${ficha.detalheFalha}`}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>

        {hasMore && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={isFetching}
              loading={isFetching}
            >
              Carregar mais
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function BadlistFormDialog({ open, editEntry, onClose }: BadlistFormDialogProps) {
  const createMutation = useCreateBadlist();
  const updateMutation = useUpdateBadlist();

  const [selectedFichaIds, setSelectedFichaIds] = useState<Set<string>>(new Set());
  const [words, setWords] = useState('');
  const [active, setActive] = useState(1);
  const [wordsError, setWordsError] = useState<string | null>(null);

  const isEdit = !!editEntry;

  useEffect(() => {
    if (open) {
      if (editEntry) {
        setSelectedFichaIds(new Set([editEntry.fichaId]));
        setWords(editEntry.words);
        setActive(editEntry.active);
      } else {
        setSelectedFichaIds(new Set());
        setWords('');
        setActive(1);
      }
      setWordsError(null);
    }
  }, [open, editEntry]);

  const toggleFicha = (id: string) => {
    setSelectedFichaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedFichaIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleClearAll = (ids: string[]) => {
    setSelectedFichaIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleSubmit = () => {
    const error = validateWords(words);
    if (error) {
      setWordsError(error);
      return;
    }

    const normalized = normalizeWords(words);

    if (isEdit && editEntry) {
      updateMutation.mutate(
        { id: editEntry.id, data: { words: normalized, active } },
        {
          onSuccess: () => {
            toast.success('Badlist atualizada com sucesso');
            onClose();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Erro ao atualizar badlist';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
          },
        },
      );
    } else {
      if (selectedFichaIds.size === 0) {
        toast.error('Selecione pelo menos uma ficha');
        return;
      }

      createMutation.mutate(
        { fichaIds: Array.from(selectedFichaIds), words: normalized, active },
        {
          onSuccess: (result) => {
            toast.success(`${result.inserted} badlist(s) criada(s) com sucesso`);
            onClose();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || 'Erro ao criar badlist';
            toast.error(Array.isArray(msg) ? msg[0] : msg);
          },
        },
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? 'Editar Badlist' : 'Nova Badlist'}>
      <div className="space-y-5">
        {!isEdit && (
          <FichaSelector
            selectedIds={selectedFichaIds}
            onToggle={toggleFicha}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Palavras (separadas por pipe: palavra1|palavra2)
          </label>
          <textarea
            value={words}
            onChange={(e) => {
              setWords(e.target.value);
              setWordsError(null);
            }}
            placeholder="Ex: cancelamento|cancela|desistencia"
            className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          />
          {wordsError && <p className="mt-1 text-xs text-danger">{wordsError}</p>}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Ativo</label>
          <button
            type="button"
            onClick={() => setActive(active === 1 ? 0 : 1)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              active === 1 ? 'bg-primary' : 'bg-muted'
            }`}
            disabled={isLoading}
          >
            <span
              className={`inline-block size-4 rounded-full bg-white transition-transform ${
                active === 1 ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
