export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortDirection;
}

export type SortDirection = 'asc' | 'desc';

export interface ApiError {
  type: 'NETWORK' | 'TIMEOUT' | 'VALIDATION' | 'NOT_FOUND' | 'SERVER' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'UNKNOWN';
  message: string;
  errors?: Record<string, string[]>;
  retry?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
}
