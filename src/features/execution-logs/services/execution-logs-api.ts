import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { PaginatedResponse } from '@/types';
import type { ExecLog, LogsListParams } from '../types/execution-logs.types';

export const executionLogsApi = {
  list: async (params: LogsListParams): Promise<PaginatedResponse<ExecLog>> => {
    const response = await httpClient.get(API_ENDPOINTS.LOGS.EXECUTION, { params });
    return response.data;
  },
};
