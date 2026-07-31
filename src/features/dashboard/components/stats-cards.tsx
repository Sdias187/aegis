import { FileText, Lock, Shield, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { cn, formatNumber } from '@/utils';
import type { DashboardSummary } from '../types/dashboard.types';

interface StatsCardsProps {
  data?: DashboardSummary;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <Card className={cn('p-5 transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5 hover:border-primary/20')}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div
          className={cn(
            'rounded-lg p-2.5',
            variant === 'success' && 'bg-success/10 text-success',
            variant === 'danger' && 'bg-danger/10 text-danger',
            variant === 'warning' && 'bg-warning/10 text-warning',
            variant === 'info' && 'bg-info/10 text-info',
            variant === 'default' && 'bg-primary/10 text-primary-light',
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const cards: StatCardProps[] = [
    {
      title: 'Fichas',
      value: formatNumber(data.totalRecords),
      icon: <FileText className="size-5" />,
      variant: 'default',
    },
    {
      title: 'Travas Ativas',
      value: formatNumber(data.activeLocks),
      icon: <Lock className="size-5" />,
      variant: 'warning',
    },
    {
      title: 'Travas com Sucesso (1h)',
      value: formatNumber(data.travasComSucessoUltimaHora),
      icon: <CheckCircle className="size-5" />,
      variant: 'success',
    },
    {
      title: 'Travas Desativadas',
      value: formatNumber(data.disabledLocks),
      icon: <Shield className="size-5" />,
      variant: 'info',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
