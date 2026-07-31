export interface MonitoringLog {
  id: string;
  sourceSystem: string;
  requestBody?: string;
  durationMs: number;
  remoteAddr?: string;
  userAgent?: string;
  createdAt: string;
}

export interface MonitoringListParams {
  page: number;
  limit: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  durationMin?: number;
  durationMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
