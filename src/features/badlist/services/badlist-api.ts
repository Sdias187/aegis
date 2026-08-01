import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { PaginatedResponse } from '@/types';
import type {
  BadlistEntry,
  BadlistCreatePayload,
  BadlistUpdatePayload,
  BadlistListParams,
} from '../types/badlist.types';
import type { Ficha } from '@/features/records/types/records.types';

export const badlistApi = {
  list: async (params: BadlistListParams): Promise<PaginatedResponse<BadlistEntry>> => {
    const response = await httpClient.get(API_ENDPOINTS.BADLIST.LIST, { params });
    return response.data;
  },

  getById: async (id: string): Promise<BadlistEntry> => {
    const response = await httpClient.get(API_ENDPOINTS.BADLIST.DETAILS(id));
    return response.data;
  },

  create: async (data: BadlistCreatePayload): Promise<{ inserted: number }> => {
    const response = await httpClient.post(API_ENDPOINTS.BADLIST.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: BadlistUpdatePayload): Promise<BadlistEntry> => {
    const response = await httpClient.put(API_ENDPOINTS.BADLIST.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(API_ENDPOINTS.BADLIST.DELETE(id));
  },

  listFichas: async (): Promise<PaginatedResponse<Ficha>> => {
    const response = await httpClient.get(API_ENDPOINTS.FICHAS.LIST, {
      params: { page: 1, limit: 1000, sortBy: 'servico', sortOrder: 'asc' },
    });
    return response.data;
  },
};
