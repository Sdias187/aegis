/*
 * ──────────────────────────────────────────────────────────────────────────────
 * AEGIS_FICHAS
 * ──────────────────────────────────────────────────────────────────────────────
 * Schema real:
 *   ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
 *
 * Consulta base:
 *   SELECT ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
 *   FROM AEGIS_FICHAS
 *
 * INSERT:
 *   INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
 *   VALUES (:atendimentoPara, :servico, :ofertaServico, :detalheFalha, :categoria, :subcategoria)
 */

export interface Ficha {
  id: string;
  atendimentoPara: string;
  servico: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
}

export interface FichaListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  atendimentoPara?: string;
  servico?: string;
  ofertaServico?: string;
  detalheFalha?: string;
  categoria?: string;
  subcategoria?: string;
}

export type FichaCreatePayload = Pick<Ficha, 'atendimentoPara' | 'servico'> & Partial<Pick<Ficha, 'ofertaServico' | 'detalheFalha' | 'categoria' | 'subcategoria'>>;

export type FichaUpdatePayload = Partial<FichaCreatePayload>;
