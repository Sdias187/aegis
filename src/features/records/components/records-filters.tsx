import { Search, X } from 'lucide-react';

interface RecordsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  atendimentoPara: string;
  onAtendimentoParaChange: (value: string) => void;
  servico: string;
  onServicoChange: (value: string) => void;
  ofertaServico: string;
  onOfertaServicoChange: (value: string) => void;
  detalheFalha: string;
  onDetalheFalhaChange: (value: string) => void;
}

export function RecordsFilters({
  search, onSearchChange, atendimentoPara, onAtendimentoParaChange,
  servico, onServicoChange, ofertaServico, onOfertaServicoChange,
  detalheFalha, onDetalheFalhaChange,
}: RecordsFiltersProps) {
  const hasActiveFilters = search || atendimentoPara || servico || ofertaServico || detalheFalha;
  const clearFilters = () => { onSearchChange(''); onAtendimentoParaChange(''); onServicoChange(''); onOfertaServicoChange(''); onDetalheFalhaChange(''); };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar em todos os campos..." className="h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <FilterInput value={atendimentoPara} onChange={onAtendimentoParaChange} placeholder="Filtrar atendimento" label="Atendimento" />
        <FilterInput value={servico} onChange={onServicoChange} placeholder="Filtrar serviço" label="Serviço" />
        <FilterInput value={ofertaServico} onChange={onOfertaServicoChange} placeholder="Filtrar oferta" label="Oferta" />
        <FilterInput value={detalheFalha} onChange={onDetalheFalhaChange} placeholder="Filtrar detalhe" label="Detalhe Falha" />
      </div>
      {hasActiveFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 transition-colors">
          <X className="size-3" />Limpar todos os filtros
        </button>
      )}
    </div>
  );
}

function FilterInput({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </div>
  );
}
