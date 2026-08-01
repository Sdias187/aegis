export interface Ficha {
  id?: string;
  atendimentoPara: string;
  servico: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
}

export interface Trava {
  id: string;
  nome: string;
  descricao?: string;
  endpoint: string;
  metodo: string;
  ativo: boolean;
  acao?: string;
  bodyTemplate?: string;
}

export interface ExecLog {
  id: string;
  correlationId?: string;
  endpoint: string;
  validationName: string;
  result?: string;
  status: string;
  executionTimeMs: number;
  createdAt: string;
  inputValue?: string;
}

export interface MonitoringLog {
  id: string;
  correlationId?: string;
  sourceSystem: string;
  requestBody?: string;
  durationMs: number;
  remoteAddr?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  // Fichas
  atendimentoPara?: string;
  servico?: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
  // Travas
  nome?: string;
  descricao?: string;
  endpoint?: string;
  metodo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardSummary {
  totalRecords: number;
  activeLocks: number;
  disabledLocks: number;
  totalImports: number;
  successfulImports: number;
  failedImports: number;
  travasComSucessoUltimaHora: number;
}

export interface ExternalServiceHealth {
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  statusCode?: number;
  responseTimeMs: number;
  lastCheck: string;
  details?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  lastCheck: string;
}
