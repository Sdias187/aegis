import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../services/dashboard-api';

export function useDashboard() {
  const summary = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });

  const recentActivity = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: dashboardApi.getRecentActivity,
  });

  const health = useQuery({
    queryKey: ['dashboard', 'health'],
    queryFn: dashboardApi.getHealth,
  });

  const externalHealth = useQuery({
    queryKey: ['dashboard', 'external-health'],
    queryFn: dashboardApi.getExternalHealth,
    refetchInterval: 30000,
  });

  return {
    summary,
    recentActivity,
    health,
    externalHealth,
    isLoading: summary.isLoading || recentActivity.isLoading || health.isLoading,
    isError: summary.isError || recentActivity.isError || health.isError,
  };
}
