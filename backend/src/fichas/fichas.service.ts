import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import oracledb from 'oracledb';
import { DatabaseService } from '../database/database.service';
import type {
  CreateFichaDto,
  Ficha,
  PaginatedResponse,
  PaginationParams,
  UpdateFichaDto,
} from '../common/interfaces';

const SORT_COLUMNS: Record<string, string> = {
  id: 'ID',
  atendimentoPara: 'ATENDIMENTO_PARA',
  servico: 'SERVICO',
  ofertaServico: 'OFERTA_SERVICO',
  detalheFalha: 'DETALHE_FALHA',
  categoria: 'CATEGORIA',
  subcategoria: 'SUBCATEGORIA',
  ID: 'ID',
  ATENDIMENTO_PARA: 'ATENDIMENTO_PARA',
  SERVICO: 'SERVICO',
  OFERTA_SERVICO: 'OFERTA_SERVICO',
  DETALHE_FALHA: 'DETALHE_FALHA',
  CATEGORIA: 'CATEGORIA',
  SUBCATEGORIA: 'SUBCATEGORIA',
};

function resolveOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  defaultSort = 'ATENDIMENTO_PARA ASC',
): string {
  const column = sortBy ? SORT_COLUMNS[sortBy] : undefined;
  if (column) {
    return `ORDER BY ${column} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }
  return `ORDER BY ${defaultSort}`;
}

@Injectable()
export class FichasService {
  private readonly logger = new Logger(FichasService.name);

  constructor(private readonly db: DatabaseService) {}

  async list(params: PaginationParams): Promise<PaginatedResponse<Ficha>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

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

    const countBinds: Record<string, unknown> = {};
    Object.keys(binds).forEach((key) => {
      if (key !== 'offset' && key !== 'limit') {
        countBinds[key] = binds[key];
      }
    });

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = resolveOrderBy(params.sortBy, params.sortOrder);

    const sql = `
      SELECT ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
      FROM AEGIS_FICHAS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_FICHAS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(sql, binds),
      this.db.executeQuery<{ TOTAL: number }>(countSql, countBinds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row) => ({
        id: String(row.ID),
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
  }

  async getById(id: number): Promise<Ficha | null> {
    const sql = `
      SELECT ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
      FROM AEGIS_FICHAS
      WHERE ID = :id
    `;
    const result = await this.db.executeQuery<any>(sql, { id });
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      id: String(row.ID),
      atendimentoPara: row.ATENDIMENTO_PARA,
      servico: row.SERVICO,
      ofertaServico: row.OFERTA_SERVICO ?? undefined,
      detalheFalha: row.DETALHE_FALHA ?? undefined,
      categoria: row.CATEGORIA ?? undefined,
      subcategoria: row.SUBCATEGORIA ?? undefined,
    };
  }

  async create(data: CreateFichaDto): Promise<Ficha> {
    const categoria = data.categoria?.trim() || 'N/A';
    const subcategoria = data.subcategoria?.trim() || 'N/A';

    const result = await this.db.executeQuery(
      `INSERT INTO AEGIS_FICHAS (
         ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
       ) VALUES (
         :atendimentoPara, :servico, :ofertaServico, :detalheFalha, :categoria, :subcategoria
       ) RETURNING ID INTO :id`,
      {
        atendimentoPara: data.atendimentoPara,
        servico: data.servico,
        ofertaServico: data.ofertaServico ?? null,
        detalheFalha: data.detalheFalha ?? null,
        categoria,
        subcategoria,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
    );
    const newId = this.getReturnedId(result.outBinds?.id);

    this.logger.log(`Ficha created — ID: ${newId}`);

    return {
      id: String(newId),
      atendimentoPara: data.atendimentoPara,
      servico: data.servico,
      ofertaServico: data.ofertaServico ?? undefined,
      detalheFalha: data.detalheFalha ?? undefined,
      categoria,
      subcategoria,
    };
  }

  async update(id: number, data: UpdateFichaDto): Promise<Ficha> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
    }

    const fields = {
      atendimentoPara: data.atendimentoPara ?? existing.atendimentoPara,
      servico: data.servico ?? existing.servico,
      ofertaServico: data.ofertaServico ?? existing.ofertaServico ?? null,
      detalheFalha: data.detalheFalha ?? existing.detalheFalha ?? null,
      categoria: data.categoria?.trim() || existing.categoria || 'N/A',
      subcategoria: data.subcategoria?.trim() || existing.subcategoria || 'N/A',
    };

    await this.db.executeQuery(
      `UPDATE AEGIS_FICHAS
       SET ATENDIMENTO_PARA = :atendimentoPara,
           SERVICO = :servico,
           OFERTA_SERVICO = :ofertaServico,
           DETALHE_FALHA = :detalheFalha,
           CATEGORIA = :categoria,
           SUBCATEGORIA = :subcategoria,
           DATA_ATUALIZACAO = SYSTIMESTAMP
       WHERE ID = :id`,
      { id, ...fields },
    );

    return {
      id: String(id),
      atendimentoPara: fields.atendimentoPara,
      servico: fields.servico,
      ofertaServico: fields.ofertaServico ?? undefined,
      detalheFalha: fields.detalheFalha ?? undefined,
      categoria: fields.categoria,
      subcategoria: fields.subcategoria,
    };
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.executeQuery('DELETE FROM AEGIS_FICHAS WHERE ID = :id', { id });
    if (!result.rowsAffected) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Ficha não encontrada' });
    }
  }

  private getReturnedId(value: unknown): number {
    const id = Array.isArray(value) ? value[0] : value;
    if (typeof id !== 'number') {
      throw new InternalServerErrorException('Não foi possível obter o ID da ficha criada');
    }
    return id;
  }
}
