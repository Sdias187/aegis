import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { PaginatedResponse, PaginationParams, Trava } from '../common/interfaces';

const SORT_COLUMNS: Record<string, string> = {
  nome: 'NOME',
  descricao: 'DESCRICAO',
  endpoint: 'ENDPOINT',
  metodo: 'METODO',
  ativo: 'ATIVO',
  NOME: 'NOME',
  DESCRICAO: 'DESCRICAO',
  ENDPOINT: 'ENDPOINT',
  METODO: 'METODO',
  ATIVO: 'ATIVO',
};

@Injectable()
export class TravasService {
  constructor(private readonly db: DatabaseService) {}

  async list(params: PaginationParams): Promise<PaginatedResponse<Trava>> {
    const offset = (params.page - 1) * params.limit;
    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];
    if (params.search) {
      conditions.push(
        `(UPPER(NOME) LIKE UPPER('%' || :search || '%') OR UPPER(DESCRICAO) LIKE UPPER('%' || :search || '%') OR UPPER(ENDPOINT) LIKE UPPER('%' || :search || '%') OR UPPER(METODO) LIKE UPPER('%' || :search || '%'))`,
      );
      binds.search = params.search;
    }
    for (const [key, column] of [
      ['nome', 'NOME'],
      ['endpoint', 'ENDPOINT'],
    ] as const) {
      if (params[key]) {
        conditions.push(`UPPER(${column}) LIKE UPPER('%' || :${key} || '%')`);
        binds[key] = params[key];
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countBinds = Object.fromEntries(
      Object.entries(binds).filter(([key]) => key !== 'offset' && key !== 'limit'),
    );
    const sortColumn = params.sortBy ? SORT_COLUMNS[params.sortBy] : undefined;
    const orderBy = `ORDER BY ${sortColumn ?? 'NOME'} ${params.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(
        `SELECT ID, ACAO, BODY_TEMPLATE, NOME, DESCRICAO, ENDPOINT, METODO, ATIVO FROM AEGIS_TRAVAS ${where} ${orderBy} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        binds,
      ),
      this.db.executeQuery<{ TOTAL: number }>(
        `SELECT COUNT(*) AS TOTAL FROM AEGIS_TRAVAS ${where}`,
        countBinds,
      ),
    ]);
    const total = Number(countResult.rows[0]?.TOTAL ?? 0);
    return {
      data: dataResult.rows.map((row) => this.mapTrava(row)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: string): Promise<Trava | null> {
    const result = await this.db.executeQuery<any>(
      'SELECT ID, ACAO, BODY_TEMPLATE, NOME, DESCRICAO, ENDPOINT, METODO, ATIVO FROM AEGIS_TRAVAS WHERE ID = :id',
      { id },
    );
    return result.rows[0] ? this.mapTrava(result.rows[0]) : null;
  }

  async disable(id: string): Promise<Trava> {
    const result = await this.db.executeQuery(
      "UPDATE AEGIS_TRAVAS SET ATIVO = 'FALSE' WHERE ID = :id AND ATIVO = 'TRUE'",
      { id },
    );
    if (!result.rowsAffected) {
      const existing = await this.getById(id);
      if (!existing)
        throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
      return existing;
    }
    const lock = await this.getById(id);
    if (!lock) throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
    return lock;
  }

  private mapTrava(row: any): Trava {
    return {
      id: String(row.ID),
      nome: row.NOME,
      descricao: row.DESCRICAO ?? undefined,
      endpoint: row.ENDPOINT,
      metodo: row.METODO,
      ativo: row.ATIVO === 'TRUE' || row.ATIVO === true,
      acao: row.ACAO ?? undefined,
      bodyTemplate: row.BODY_TEMPLATE ?? undefined,
    };
  }
}
