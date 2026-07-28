import { executeQuery } from '../config/database.js';
import type { Trava, PaginationParams, PaginatedResponse } from '../types/index.js';

export const travasService = {
  async list(params: PaginationParams): Promise<PaginatedResponse<Trava>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

    /*
     * AEGIS_TRAVAS: NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
     */

    if (params.search) {
      conditions.push(`(UPPER(NOME) LIKE UPPER('%' || :search || '%')
                     OR UPPER(DESCRICAO) LIKE UPPER('%' || :search || '%')
                     OR UPPER(ENDPOINT) LIKE UPPER('%' || :search || '%')
                     OR UPPER(METODO) LIKE UPPER('%' || :search || '%'))`);
      binds.search = params.search;
    }
    if (params.nome) {
      conditions.push("UPPER(NOME) LIKE UPPER('%' || :nome || '%')");
      binds.nome = params.nome;
    }
    if (params.endpoint) {
      conditions.push("UPPER(ENDPOINT) LIKE UPPER('%' || :endpoint || '%')");
      binds.endpoint = params.endpoint;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = params.sortBy
      ? `ORDER BY ${params.sortBy} ${params.sortOrder === 'desc' ? 'DESC' : 'ASC'}`
      : 'ORDER BY NOME ASC';

    const sql = `
      SELECT NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
      FROM AEGIS_TRAVAS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_TRAVAS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      executeQuery<any>(sql, binds),
      executeQuery<{ TOTAL: number }>(countSql, binds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row, i) => ({
        id: offset + i + 1,
        nome: row.NOME,
        descricao: row.DESCRICAO ?? undefined,
        endpoint: row.ENDPOINT,
        metodo: row.METODO,
        ativo: row.ATIVO === 1 || row.ATIVO === true,
        dataCriacao: new Date().toISOString(),
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  async getById(id: number): Promise<Trava | null> {
    const sql = `
      SELECT NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
      FROM AEGIS_TRAVAS
      OFFSET ${id - 1} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    const result = await executeQuery<any>(sql);
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return {
      id,
      nome: r.NOME,
      descricao: r.DESCRICAO ?? undefined,
      endpoint: r.ENDPOINT,
      metodo: r.METODO,
      ativo: r.ATIVO === 1 || r.ATIVO === true,
      dataCriacao: new Date().toISOString(),
    };
  },
};
