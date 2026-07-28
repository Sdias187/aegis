import { executeQuery } from '../config/database.js';
import type { Ficha, PaginationParams, PaginatedResponse } from '../types/index.js';

export const fichasService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Ficha>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

    /*
     * INSERT INTO AEGIS_FICHAS (ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
     */

    if (params.search) {
      conditions.push(`(UPPER(ATENDIMENTO_PARA) LIKE UPPER('%' || :search || '%')
                     OR UPPER(SERVICO) LIKE UPPER('%' || :search || '%')
                     OR UPPER(OFERTA_SERVICO) LIKE UPPER('%' || :search || '%')
                     OR UPPER(DETALHE_FALHA) LIKE UPPER('%' || :search || '%'))`);
      binds.search = params.search;
    }
    if (params.atendimentoPara) {
      conditions.push("UPPER(ATENDIMENTO_PARA) LIKE UPPER('%' || :atendimentoPara || '%')");
      binds.atendimentoPara = params.atendimentoPara;
    }
    if (params.servico) {
      conditions.push("UPPER(SERVICO) LIKE UPPER('%' || :servico || '%')");
      binds.servico = params.servico;
    }
    if (params.ofertaServico) {
      conditions.push("UPPER(OFERTA_SERVICO) LIKE UPPER('%' || :ofertaServico || '%')");
      binds.ofertaServico = params.ofertaServico;
    }
    if (params.detalheFalha) {
      conditions.push("UPPER(DETALHE_FALHA) LIKE UPPER('%' || :detalheFalha || '%')");
      binds.detalheFalha = params.detalheFalha;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = params.sortBy
      ? `ORDER BY ${params.sortBy} ${params.sortOrder === 'desc' ? 'DESC' : 'ASC'}`
      : 'ORDER BY ATENDIMENTO_PARA ASC';

    const sql = `
      SELECT ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
      FROM AEGIS_FICHAS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_FICHAS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      executeQuery<any>(sql, binds),
      executeQuery<{ TOTAL: number }>(countSql, binds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row, i) => ({
        id: offset + i + 1,
        atendimentoPara: row.ATENDIMENTO_PARA,
        servico: row.SERVICO,
        ofertaServico: row.OFERTA_SERVICO ?? undefined,
        detalheFalha: row.DETALHE_FALHA ?? undefined,
        categoria: row.CATEGORIA ?? undefined,
        subcategoria: row.SUBCATEGORIA ?? undefined,
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  async getById(id: number): Promise<Ficha | null> {
    const sql = `
      SELECT ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
      FROM AEGIS_FICHAS
      OFFSET ${id - 1} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    const result = await executeQuery<any>(sql);
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return {
      id,
      atendimentoPara: r.ATENDIMENTO_PARA,
      servico: r.SERVICO,
      ofertaServico: r.OFERTA_SERVICO ?? undefined,
      detalheFalha: r.DETALHE_FALHA ?? undefined,
      categoria: r.CATEGORIA ?? undefined,
      subcategoria: r.SUBCATEGORIA ?? undefined,
    };
  },
};
