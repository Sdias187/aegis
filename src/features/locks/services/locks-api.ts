import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { PaginatedResponse } from '@/types';
import type { Trava, TravaListParams } from '../types/locks.types';

export const locksApi = {
  list: async (params: TravaListParams): Promise<PaginatedResponse<Trava>> => {
    const response = await httpClient.get(API_ENDPOINTS.TRAVAS.LIST, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Trava> => {
    const response = await httpClient.get(API_ENDPOINTS.TRAVAS.DETAILS(id));
    return response.data;
  },

  disable: async (id: string, reason?: string): Promise<void> => {
    await httpClient.post(API_ENDPOINTS.TRAVAS.DISABLE(id), { reason });
  },
};
