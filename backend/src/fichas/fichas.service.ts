import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateFichaDto } from '../common/dto/create-ficha.dto';
import { UpdateFichaDto } from '../common/dto/update-ficha.dto';
import type { Ficha, PaginatedResponse, PaginationParams } from '../common/interfaces';

const SORT_COLUMNS: Record<string, string> = {
  atendimentoPara: 'ATENDIMENTO_PARA',
  servico: 'SERVICO',
  ofertaServico: 'OFERTA_SERVICO',
  detalheFalha: 'DETALHE_FALHA',
  categoria: 'CATEGORIA',
  subcategoria: 'SUBCATEGORIA',
  ATENDIMENTO_PARA: 'ATENDIMENTO_PARA',
  SERVICO: 'SERVICO',
  OFERTA_SERVICO: 'OFERTA_SERVICO',
  DETALHE_FALHA: 'DETALHE_FALHA',
  CATEGORIA: 'CATEGORIA',
  SUBCATEGORIA: 'SUBCATEGORIA',
};

function orderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
  const column = sortBy ? SORT_COLUMNS[sortBy] : undefined;
  return `ORDER BY ${column ?? 'ATENDIMENTO_PARA'} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
}

@Injectable()
export class FichasService {
  constructor(private readonly db: DatabaseService) {}

  async list(params: PaginationParams): Promise<PaginatedResponse<Ficha>> {
    const offset = (params.page - 1) * params.limit;
    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];
    const filters: Array<[keyof PaginationParams, string]> = [
      ['atendimentoPara', 'ATENDIMENTO_PARA'],
      ['servico', 'SERVICO'],
      ['ofertaServico', 'OFERTA_SERVICO'],
      ['detalheFalha', 'DETALHE_FALHA'],
    ];

    if (params.search) {
      conditions.push(
        `(UPPER(ATENDIMENTO_PARA) LIKE UPPER('%' || :search || '%') OR UPPER(SERVICO) LIKE UPPER('%' || :search || '%') OR UPPER(OFERTA_SERVICO) LIKE UPPER('%' || :search || '%') OR UPPER(DETALHE_FALHA) LIKE UPPER('%' || :search || '%'))`,
      );
      binds.search = params.search;
    }
    for (const [key, column] of filters) {
      if (params[key]) {
        conditions.push(`UPPER(${column}) LIKE UPPER('%' || :${key} || '%')`);
        binds[key] = params[key];
      }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countBinds = Object.fromEntries(
      Object.entries(binds).filter(([key]) => key !== 'offset' && key !== 'limit'),
    );
    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(
        `SELECT ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA FROM AEGIS_FICHAS ${where} ${orderBy(params.sortBy, params.sortOrder)} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        binds,
      ),
      this.db.executeQuery<{ TOTAL: number }>(
        `SELECT COUNT(*) AS TOTAL FROM AEGIS_FICHAS ${where}`,
        countBinds,
      ),
    ]);
    const total = Number(countResult.rows[0]?.TOTAL ?? 0);
    return {
      data: dataResult.rows.map((row) => this.mapFicha(row)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: string): Promise<Ficha | null> {
    const result = await this.db.executeQuery<any>(
      `SELECT ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA FROM AEGIS_FICHAS WHERE ID = :id`,
      { id },
    );
    return result.rows[0] ? this.mapFicha(result.rows[0]) : null;
  }

  async create(data: CreateFichaDto): Promise<Ficha> {
    await this.db.executeQuery(
      `INSERT INTO AEGIS_FICHAS (ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA) VALUES (:atendimentoPara, :servico, :ofertaServico, :detalheFalha, :categoria, :subcategoria)`,
      this.toBinds(data),
    );
    return {
      atendimentoPara: data.atendimentoPara,
      servico: data.servico,
      ofertaServico: data.ofertaServico,
      detalheFalha: data.detalheFalha,
      categoria: data.categoria?.trim() || undefined,
      subcategoria: data.subcategoria?.trim() || undefined,
    };
  }

  async update(id: string, data: UpdateFichaDto): Promise<Ficha> {
    const existing = await this.getById(id);
    if (!existing)
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
    const merged: CreateFichaDto = { ...existing, ...data };
    await this.db.executeQuery(
      `UPDATE AEGIS_FICHAS SET ATENDIMENTO_PARA = :atendimentoPara, SERVICO = :servico, OFERTA_SERVICO = :ofertaServico, DETALHE_FALHA = :detalheFalha, CATEGORIA = :categoria, SUBCATEGORIA = :subcategoria WHERE ID = :id`,
      { id, ...this.toBinds(merged) },
    );
    return {
      id,
      atendimentoPara: merged.atendimentoPara,
      servico: merged.servico,
      ofertaServico: merged.ofertaServico,
      detalheFalha: merged.detalheFalha,
      categoria: merged.categoria,
      subcategoria: merged.subcategoria,
    };
  }

  async remove(id: string): Promise<void> {
    const result = await this.db.executeQuery('DELETE FROM AEGIS_FICHAS WHERE ID = :id', { id });
    if (!result.rowsAffected)
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
  }

  private toBinds(data: CreateFichaDto): Record<string, unknown> {
    return {
      atendimentoPara: data.atendimentoPara,
      servico: data.servico,
      ofertaServico: data.ofertaServico ?? null,
      detalheFalha: data.detalheFalha ?? null,
      categoria: data.categoria?.trim() || null,
      subcategoria: data.subcategoria?.trim() || null,
    };
  }

  private mapFicha(row: any): Ficha {
    return {
      id: row.ROW_ID,
      atendimentoPara: row.ATENDIMENTO_PARA,
      servico: row.SERVICO,
      ofertaServico: row.OFERTA_SERVICO ?? undefined,
      detalheFalha: row.DETALHE_FALHA ?? undefined,
      categoria: row.CATEGORIA ?? undefined,
      subcategoria: row.SUBCATEGORIA ?? undefined,
    };
  }
}
