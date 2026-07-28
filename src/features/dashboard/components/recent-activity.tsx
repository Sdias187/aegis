import { Clock, FileText, Lock, Upload, Activity } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { formatRelativeDate, cn } from '@/utils';
import type { RecentActivityItem } from '../types/dashboard.types';

interface RecentActivityProps {
  data?: RecentActivityItem[];
  isLoading: boolean;
}

const activityIcons = {
  import: Upload,
  lock: Lock,
  record: FileText,
  monitoring: Activity,
} as const;

const activityVariants = {
  import: 'text-info bg-info/10',
  lock: 'text-warning bg-warning/10',
  record: 'text-primary-light bg-primary/10',
  monitoring: 'text-success bg-success/10',
} as const;

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  return (
    <Card>
      <div className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Atividade Recente
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="Nenhuma atividade recente"
            description="As atividades aparecerão aqui conforme o sistema for utilizado."
          />
        ) : (
          <div className="space-y-0">
            {data.map((item) => {
              const Icon = activityIcons[item.type] || Clock;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 border-b border-border/50 py-3 last:border-0"
                >
                  <div className={cn('rounded-full p-2', activityVariants[item.type] || 'text-muted-foreground bg-muted/10')}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{item.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRelativeDate(item.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
