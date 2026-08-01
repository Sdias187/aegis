import { useState } from 'react';
import { Search, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/shared';
import { Card, Input, Button } from '@/components/ui';

export default function GpsPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // TODO: Integrar com backend para buscar logs no servidor GPS
    setTimeout(() => setIsSearching(false), 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Consulta de Logs - GPS"
        description="Busca de logs no servidor do sistema GPS"
      />

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Terminal className="size-4" />
            <span>Parâmetro de busca nos logs do servidor</span>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ex: 2024-01-15, dispositivo GPS-001, erro conexão..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              loading={isSearching}
            >
              Buscar
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Insira o parâmetro para buscar nos logs do servidor GPS. O backend irá executar a busca
            remotamente.
          </p>
        </div>
      </Card>
    </div>
  );
}
