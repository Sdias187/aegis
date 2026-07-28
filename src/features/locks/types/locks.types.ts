/*
 * ──────────────────────────────────────────────────────────────────────────────
 * AEGIS_TRAVAS
 * ──────────────────────────────────────────────────────────────────────────────
 * Schema real: NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
 *
 * Consulta base:
 *   SELECT NOME, DESCRICAO, ENDPOINT, METODO, ATIVO FROM AEGIS_TRAVAS
 */

export interface Trava {
  id: string;
  nome: string;
  descricao?: string;
  endpoint: string;
  metodo: string;
  ativo: boolean;
  dataCriacao: string;
  dataDesativacao?: string;
}

export interface TravaListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  nome?: string;
  descricao?: string;
  endpoint?: string;
  metodo?: string;
}
