export interface BadlistEntry {
  id: string;
  fichaId: string;
  servico?: string;
  atendimentoPara?: string;
  ofertaServico?: string;
  detalheFalha?: string;
  words: string;
  active: number;
  createdAt?: string;
}

export interface BadlistListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  atendimentoPara?: string;
  servico?: string;
  active?: string;
}

export interface BadlistCreatePayload {
  fichaIds: string[];
  words: string;
  active: number;
}

export interface BadlistUpdatePayload {
  words?: string;
  active?: number;
}
