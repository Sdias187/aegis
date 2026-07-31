import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { PaginatedResponse, PaginationParams, Trava } from '../common/interfaces';

const SORT_COLUMNS: Record<string, string> = {
  id: 'ID',
  nome: 'NOME',
  descricao: 'DESCRICAO',
  endpoint: 'ENDPOINT',
  metodo: 'METODO',
  ativo: 'ATIVO',
  ID: 'ID',
  NOME: 'NOME',
  DESCRICAO: 'DESCRICAO',
  ENDPOINT: 'ENDPOINT',
  METODO: 'METODO',
  ATIVO: 'ATIVO',
};

function resolveOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  defaultSort = 'NOME ASC',
): string {
  const column = sortBy ? SORT_COLUMNS[sortBy] : undefined;
  if (column) {
    return `ORDER BY ${column} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
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
    const orderBy = resolveOrderBy(params.sortBy, params.sortOrder);

    const sql = `
      SELECT ID, NOME, DESCRICAO, ENDPOINT, METODO, ATIVO, DATA_CRIACAO, DATA_DESATIVACAO
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
      data: dataResult.rows.map((row) => this.mapTrava(row)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: number): Promise<Trava | null> {
    const result = await this.db.executeQuery<any>(
      `SELECT ID, NOME, DESCRICAO, ENDPOINT, METODO, ATIVO, DATA_CRIACAO, DATA_DESATIVACAO
       FROM AEGIS_TRAVAS
       WHERE ID = :id`,
      { id },
    );
    const row = result.rows[0];
    return row ? this.mapTrava(row) : null;
  }

  async disable(id: number): Promise<Trava> {
    const result = await this.db.executeQuery(
      `UPDATE AEGIS_TRAVAS
       SET ATIVO = 0, DATA_DESATIVACAO = SYSTIMESTAMP
       WHERE ID = :id AND ATIVO = 1`,
      { id },
    );

    if (!result.rowsAffected) {
      const existing = await this.getById(id);
      if (!existing) {
        throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
      }
      return existing;
    }

    const lock = await this.getById(id);
    if (!lock) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Trava não encontrada' });
    }
    return lock;
  }

  private mapTrava(row: any): Trava {
    return {
      id: String(row.ID),
      nome: row.NOME,
      descricao: row.DESCRICAO ?? undefined,
      endpoint: row.ENDPOINT,
      metodo: row.METODO,
      ativo: Number(row.ATIVO) === 1,
      dataCriacao: this.formatDate(row.DATA_CRIACAO),
      dataDesativacao: row.DATA_DESATIVACAO ? this.formatDate(row.DATA_DESATIVACAO) : undefined,
    };
  }

  private formatDate(value: unknown): string {
    return value instanceof Date ? value.toISOString() : String(value ?? '');
  }
}
