export interface ExecLog {
  id: string;
  endpoint: string;
  validationName?: string;
  result?: string;
  status: string;
  executionTimeMs: number;
  createdAt: string;
  inputValue?: string;
}

export interface LogsListParams {
  page: number;
  limit: number;
  search?: string;
  endpoint?: string;
  validationName?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  executionTimeMin?: number;
  executionTimeMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
