import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const breadcrumbLabels: Record<string, string> = {
  '': 'Dashboard',
  records: 'Fichas',
  new: 'Nova Ficha',
  edit: 'Editar Ficha',
  locks: 'Travas',
  import: 'Importação',
  logs: 'Logs',
  execution: 'Execução',
  monitoring: 'Monitoramento',
  'consulta-logs': 'Consulta de Logs',
  gps: 'GPS',
  'vivo-360': 'VIVO 360',
  servicos: 'Serviços',
  siebel: 'Siebel',
};

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {segments.map((segment, index) => {
        const label = breadcrumbLabels[segment] || segment;
        const isLast = index === segments.length - 1;

        return (
          <span key={segment} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            <span
              className={
                isLast
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              }
            >
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}
