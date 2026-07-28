import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';
import type { PaginatedResponse } from '@/types';
import type { Ficha, FichaCreatePayload, FichaUpdatePayload, FichaListParams } from '../types/records.types';

export const recordsApi = {
  list: async (params: FichaListParams): Promise<PaginatedResponse<Ficha>> => {
    const response = await httpClient.get(API_ENDPOINTS.FICHAS.LIST, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Ficha> => {
    const response = await httpClient.get(API_ENDPOINTS.FICHAS.DETAILS(id));
    return response.data;
  },

  create: async (data: FichaCreatePayload): Promise<Ficha> => {
    const response = await httpClient.post(API_ENDPOINTS.FICHAS.CREATE, data);
    return response.data;
  },

  update: async (id: string, data: FichaUpdatePayload): Promise<Ficha> => {
    const response = await httpClient.put(API_ENDPOINTS.FICHAS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(API_ENDPOINTS.FICHAS.DELETE(id));
  },
};
