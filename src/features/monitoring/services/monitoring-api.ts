import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { PaginatedResponse } from '@/types';
import type { MonitoringLog, MonitoringListParams } from '../types/monitoring.types';

export const monitoringApi = {
  list: async (params: MonitoringListParams): Promise<PaginatedResponse<MonitoringLog>> => {
    const response = await httpClient.get(API_ENDPOINTS.MONITORING.LOGS, { params });
    return response.data;
  },
};
