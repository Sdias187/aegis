import { Search, X } from 'lucide-react';
import { Input, Select } from '@/components/ui';

const ATENDIMENTO_PARA_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
  { value: 'interno', label: 'Interno' },
];

const ACTIVE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '1', label: 'Ativo' },
  { value: '0', label: 'Inativo' },
];

interface BadlistFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  atendimentoPara: string;
  onAtendimentoParaChange: (value: string) => void;
  servico: string;
  onServicoChange: (value: string) => void;
  active: string;
  onActiveChange: (value: string) => void;
}

export function BadlistFilters({
  search,
  onSearchChange,
  atendimentoPara,
  onAtendimentoParaChange,
  servico,
  onServicoChange,
  active,
  onActiveChange,
}: BadlistFiltersProps) {
  const hasFilters = search || atendimentoPara || servico || active;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por serviço, palavras..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="w-[140px]">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Atendimento</label>
        <Select
          options={ATENDIMENTO_PARA_OPTIONS}
          value={atendimentoPara}
          onChange={(e) => onAtendimentoParaChange(e.target.value)}
        />
      </div>
      <div className="w-[140px]">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
        <Select
          options={ACTIVE_OPTIONS}
          value={active}
          onChange={(e) => onActiveChange(e.target.value)}
        />
      </div>
      {hasFilters && (
        <button
          onClick={() => {
            onSearchChange('');
            onAtendimentoParaChange('');
            onServicoChange('');
            onActiveChange('');
          }}
          className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
        >
          <X className="size-3" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
