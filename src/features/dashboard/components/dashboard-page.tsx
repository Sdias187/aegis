import { PageHeader, ErrorState } from '@/components/shared';
import { useDashboard } from '../hooks/use-dashboard';
import { StatsCards } from './stats-cards';
import { QuickActions } from './quick-actions';
import { RecentActivity } from './recent-activity';
import { SystemStatus } from './system-status';

export default function DashboardPage() {
  const { summary, recentActivity, health, isLoading, isError } = useDashboard();

  if (isError) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Visão geral do sistema" />
        <ErrorState
          title="Erro ao carregar dashboard"
          description="Não foi possível carregar os indicadores. Tente novamente."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de gerenciamento de incidentes"
      />

      {/* KPI Cards */}
      <StatsCards data={summary.data} isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity data={recentActivity.data} isLoading={isLoading} />
        <SystemStatus data={health.data} isLoading={isLoading} />
      </div>
    </div>
  );
}
