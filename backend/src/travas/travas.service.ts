import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Trava, PaginationParams, PaginatedResponse } from '../common/interfaces';

const VALID_SORT_COLUMNS_TRAVAS = new Set([
  'NOME',
  'DESCRICAO',
  'ENDPOINT',
  'METODO',
  'ATIVO',
]);

function resolveOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  defaultSort = 'NOME ASC',
): string {
  if (sortBy && VALID_SORT_COLUMNS_TRAVAS.has(sortBy)) {
    return `ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }
  return `ORDER BY ${defaultSort}`;
}

@Injectable()
export class TravasService {
  constructor(private readonly db: DatabaseService) {}

  async list(params: PaginationParams): Promise<PaginatedResponse<Trava>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

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

    const countBinds: Record<string, unknown> = {};
    Object.keys(binds).forEach((key) => {
      if (key !== 'offset' && key !== 'limit') {
        countBinds[key] = binds[key];
      }
    });

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = resolveOrderBy(params.sortBy, params.sortOrder, 'NOME ASC');

    const sql = `
      SELECT NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
      FROM AEGIS_TRAVAS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_TRAVAS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(sql, binds),
      this.db.executeQuery<{ TOTAL: number }>(countSql, countBinds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row, i) => ({
        id: offset + i + 1,
        nome: row.NOME,
        descricao: row.DESCRICAO ?? undefined,
        endpoint: row.ENDPOINT,
        metodo: row.METODO,
        ativo: Boolean(row.ATIVO),
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: number): Promise<Trava | null> {
    const sql = `
      SELECT NOME, DESCRICAO, ENDPOINT, METODO, ATIVO
      FROM AEGIS_TRAVAS
      OFFSET ${id - 1} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    const result = await this.db.executeQuery<any>(sql);
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return {
      id,
      nome: r.NOME,
      descricao: r.DESCRICAO ?? undefined,
      endpoint: r.ENDPOINT,
      metodo: r.METODO,
      ativo: Boolean(r.ATIVO),
    };
  }
}
