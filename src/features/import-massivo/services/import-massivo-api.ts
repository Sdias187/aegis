import { httpClient } from '@/services';
import { API_ENDPOINTS } from '@/api';

export interface ImportRow {
  rowNumber: number;
  atendimentoPara: string;
  servico: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
  errors?: string[];
}

export interface PreviewResponse {
  sessionId: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  preview: ImportRow[];
  invalidRows: ImportRow[];
}

export interface ImportStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  errors: { row: number; message: string }[];
  updatedAt: string;
  fileName: string;
}

export const importMassivoApi = {
  preview: async (file: File): Promise<PreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await httpClient.post(API_ENDPOINTS.IMPORT_MASSIVO.PREVIEW, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  execute: async (sessionId: string): Promise<{ message: string; sessionId: string }> => {
    const response = await httpClient.post(API_ENDPOINTS.IMPORT_MASSIVO.EXECUTE(sessionId));
    return response.data;
  },

  status: async (sessionId: string): Promise<ImportStatus> => {
    const response = await httpClient.get(API_ENDPOINTS.IMPORT_MASSIVO.STATUS(sessionId));
    return response.data;
  },

  downloadModelo: (formato: 'csv' | 'xlsx'): string => {
    return `${API_ENDPOINTS.IMPORT_MASSIVO.MODELO}?formato=${formato}`;
  },
};
