import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { DashboardSummary, RecentActivityItem, SystemHealth, ExternalServiceHealth } from '../types/dashboard.types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
    return response.data;
  },

  getRecentActivity: async (): Promise<RecentActivityItem[]> => {
    const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.RECENT_ACTIVITY);
    return response.data.data ?? response.data;
  },

  getHealth: async (): Promise<SystemHealth> => {
    const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.HEALTH);
    return response.data;
  },

  getExternalHealth: async (): Promise<ExternalServiceHealth> => {
    const response = await httpClient.get(API_ENDPOINTS.DASHBOARD.EXTERNAL_HEALTH);
    return response.data;
  },
};
