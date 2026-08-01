export interface SiebelService {
  id: string;
  serviceName: string;
  serviceType: string;
  status: string;
  endpoint: string;
  lastSync: string;
  errorMessage?: string;
}

export interface SiebelListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  serviceType?: string;
}
