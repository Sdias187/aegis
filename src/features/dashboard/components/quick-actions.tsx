import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Lock, Activity } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nova Ficha',
      icon: Plus,
      onClick: () => navigate('/records/new'),
      variant: 'default' as const,
    },
    {
      label: 'Importar',
      icon: Upload,
      onClick: () => navigate('/import'),
      variant: 'secondary' as const,
    },
    {
      label: 'Travas Ativas',
      icon: Lock,
      onClick: () => navigate('/locks'),
      variant: 'secondary' as const,
    },
    {
      label: 'Monitoramento',
      icon: Activity,
      onClick: () => navigate('/monitoring'),
      variant: 'secondary' as const,
    },
  ];

  return (
    <Card>
      <div className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Ações Rápidas
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              onClick={action.onClick}
              className="w-full justify-start gap-3 h-12"
            >
              <action.icon className="size-5 shrink-0" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
