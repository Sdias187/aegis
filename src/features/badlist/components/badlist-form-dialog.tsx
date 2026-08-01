import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, Button, Input } from '@/components/ui';
import { useCreateBadlist, useUpdateBadlist } from '../hooks/use-badlist-mutations';
import { useFichasForSelect } from '../hooks/use-badlist';
import type { BadlistEntry } from '../types/badlist.types';
import type { Ficha } from '@/features/records/types/records.types';

interface BadlistFormDialogProps {
  open: boolean;
  editEntry: BadlistEntry | null;
  onClose: () => void;
}

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

function FichaSelector({
  fichas,
  selectedIds,
  onToggle,
  isLoading,
}: {
  fichas: Ficha[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  isLoading: boolean;
}) {
  const [filter, setFilter] = useState('');

  const filtered = fichas.filter((f) => {
    if (!filter) return true;
    const s = filter.toLowerCase();
    return (
      f.servico?.toLowerCase().includes(s) ||
      f.atendimentoPara?.toLowerCase().includes(s) ||
      f.ofertaServico?.toLowerCase().includes(s)
    );
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Carregando fichas...</p>;
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        Selecione as fichas ({selectedIds.size} selecionada{selectedIds.size !== 1 ? 's' : ''})
      </label>
      <Input
        placeholder="Filtrar por serviço, atendimento..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-2"
      />
      <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-background">
        {filtered.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Nenhuma ficha encontrada</p>
        ) : (
          filtered.map((ficha) => (
            <label
              key={ficha.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-elevated cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(ficha.id)}
                onChange={() => onToggle(ficha.id)}
                className="size-4 rounded border-border bg-background text-primary focus:ring-primary"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ficha.servico}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {ficha.atendimentoPara}
                  {ficha.ofertaServico && ` / ${ficha.ofertaServico}`}
                </p>
              </div>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

export function BadlistFormDialog({ open, editEntry, onClose }: BadlistFormDialogProps) {
  const { data: fichasData, isLoading: fichasLoading } = useFichasForSelect();
  const createMutation = useCreateBadlist();
  const updateMutation = useUpdateBadlist();

  const [selectedFichaIds, setSelectedFichaIds] = useState<Set<string>>(new Set());
  const [words, setWords] = useState('');
  const [active, setActive] = useState(1);
  const [wordsError, setWordsError] = useState<string | null>(null);

  const isEdit = !!editEntry;
  const fichas = fichasData?.data ?? [];

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
            fichas={fichas}
            selectedIds={selectedFichaIds}
            onToggle={toggleFicha}
            isLoading={fichasLoading}
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
          {wordsError && (
            <p className="mt-1 text-xs text-danger">{wordsError}</p>
          )}
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
