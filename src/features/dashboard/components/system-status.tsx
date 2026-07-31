import { CheckCircle, AlertTriangle, XCircle, Activity, Globe } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { cn } from '@/utils';
import type { ExternalServiceHealth } from '../types/dashboard.types';

interface SystemStatusProps {
  externalHealth?: ExternalServiceHealth;
  isLoading: boolean;
}

export function SystemStatus({ externalHealth, isLoading }: SystemStatusProps) {
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
    healthy: { icon: CheckCircle, label: 'MS Aegis Operacional', color: 'text-success', bg: 'bg-success/10' },
    degraded: { icon: AlertTriangle, label: 'MS Aegis Degradado', color: 'text-warning', bg: 'bg-warning/10' },
    down: { icon: XCircle, label: 'MS Aegis Indisponível', color: 'text-danger', bg: 'bg-danger/10' },
  };

  const status = externalHealth?.status ?? 'down';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Status do Sistema
      </h3>

      {externalHealth ? (
        <div className={cn('flex items-center gap-4 rounded-lg border p-4', config.bg, 'border-transparent')}>
          <div className={cn('rounded-full p-2', config.bg)}>
            <StatusIcon className={cn('size-6', config.color)} />
          </div>
          <div className="flex-1">
            <p className={cn('text-base font-semibold', config.color)}>{config.label}</p>
            <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="size-3" />
                ms-b2c-vivo-aegis
              </span>
              {externalHealth.statusCode && (
                <span className="flex items-center gap-1">
                  HTTP {externalHealth.statusCode}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Activity className="size-3" />
                {externalHealth.responseTimeMs}ms
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-lg border border-transparent bg-danger/10 p-4">
          <div className="rounded-full bg-danger/10 p-2">
            <XCircle className="size-6 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-base font-semibold text-danger">MS Aegis Indisponível</p>
            <p className="mt-1 text-xs text-muted-foreground">Não foi possível verificar o status</p>
          </div>
        </div>
      )}
    </Card>
  );
}
