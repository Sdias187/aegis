export interface DashboardSummary {
  totalRecords: number;
  activeLocks: number;
  disabledLocks: number;
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  travasComSucessoUltimaHora: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'import' | 'lock' | 'record' | 'monitoring';
  description: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: string;
}

export interface ExternalServiceHealth {
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  statusCode?: number;
  responseTimeMs: number;
  lastCheck: string;
  details?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: RecentActivityItem[];
  systemHealth: SystemHealth;
}
