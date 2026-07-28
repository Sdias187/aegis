import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/utils';
import type { SystemHealth } from '../types/dashboard.types';

interface SystemStatusProps {
  data?: SystemHealth;
  isLoading: boolean;
}

export function SystemStatus({ data, isLoading }: SystemStatusProps) {
  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-full" />
        </div>
      </Card>
    );
  }

  const statusConfig = {
    healthy: { icon: CheckCircle, label: 'Sistema Operacional', color: 'text-success', bg: 'bg-success/10' },
    degraded: { icon: AlertTriangle, label: 'Sistema Degradado', color: 'text-warning', bg: 'bg-warning/10' },
    down: { icon: XCircle, label: 'Sistema Indisponível', color: 'text-danger', bg: 'bg-danger/10' },
  };

  const config = statusConfig[data?.status ?? 'healthy'];
  const StatusIcon = config.icon;

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Status do Sistema
      </h3>
      <div className={cn('flex items-center gap-4 rounded-lg border p-4', config.bg, 'border-transparent')}>
        <div className={cn('rounded-full p-2', config.bg)}>
          <StatusIcon className={cn('size-6', config.color)} />
        </div>
        <div className="flex-1">
          <p className={cn('text-base font-semibold', config.color)}>{config.label}</p>
          <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="size-3" />
              {data?.uptime ? `${Math.floor(data.uptime / 3600)}h de uptime` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
