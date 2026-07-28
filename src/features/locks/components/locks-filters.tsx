import { Search, X } from 'lucide-react';

interface LocksFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  nome: string;
  onNomeChange: (value: string) => void;
  endpoint: string;
  onEndpointChange: (value: string) => void;
}

export function LocksFilters({ search, onSearchChange, nome, onNomeChange, endpoint, onEndpointChange }: LocksFiltersProps) {
  const hasFilters = search || nome || endpoint;
  const clear = () => { onSearchChange(''); onNomeChange(''); onEndpointChange(''); };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome, endpoint, método..." className="h-10 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Nome da Trava</span>
          <input type="text" value={nome} onChange={(e) => onNomeChange(e.target.value)} placeholder="Filtrar por nome..."
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Endpoint</span>
          <input type="text" value={endpoint} onChange={(e) => onEndpointChange(e.target.value)} placeholder="Filtrar por endpoint..."
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
      </div>
      {hasFilters && (
        <button onClick={clear} className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 transition-colors"><X className="size-3" />Limpar filtros</button>
      )}
    </div>
  );
}
