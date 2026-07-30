import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Ficha, PaginationParams, PaginatedResponse, CreateFichaDto } from '../common/interfaces';

const VALID_SORT_COLUMNS_FICHAS = new Set([
  'ATENDIMENTO_PARA',
  'SERVICO',
  'OFERTA_SERVICO',
  'DETALHE_FALHA',
  'CATEGORIA',
  'SUBCATEGORIA',
]);

function resolveOrderBy(
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  defaultSort = 'ATENDIMENTO_PARA ASC',
): string {
  if (sortBy && VALID_SORT_COLUMNS_FICHAS.has(sortBy)) {
    return `ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
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
      SELECT ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
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
  }

  async getById(id: number): Promise<Ficha | null> {
    const sql = `
      SELECT ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA
      FROM AEGIS_FICHAS
      OFFSET ${id - 1} ROWS FETCH NEXT 1 ROWS ONLY
    `;
    const result = await this.db.executeQuery<any>(sql);
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
  }

  async create(data: CreateFichaDto): Promise<Ficha> {
    // Buscar próximo ID disponível
    const idResult = await this.db.executeQuery<{ NEXT_ID: number }>(
      'SELECT COALESCE(MAX(ID), 0) + 1 AS NEXT_ID FROM AEGIS_FICHAS',
    );
    const newId = Number(idResult.rows[0]?.NEXT_ID ?? 1);

    // Default N/A para campos opcionais não preenchidos
    const categoria = data.categoria?.trim() || 'N/A';
    const subcategoria = data.subcategoria?.trim() || 'N/A';

    const sql = `
      INSERT INTO AEGIS_FICHAS (ID, ATENDIMENTO_PARA, SERVICO, OFERTA_SERVICO, DETALHE_FALHA, CATEGORIA, SUBCATEGORIA)
      VALUES (:id, :atendimentoPara, :servico, :ofertaServico, :detalheFalha, :categoria, :subcategoria)
    `;

    await this.db.executeQuery(sql, {
      id: newId,
      atendimentoPara: data.atendimentoPara,
      servico: data.servico,
      ofertaServico: data.ofertaServico ?? null,
      detalheFalha: data.detalheFalha ?? null,
      categoria,
      subcategoria,
    });

    this.logger.log(`Ficha created — ID: ${newId}`);

    return {
      id: newId,
      atendimentoPara: data.atendimentoPara,
      servico: data.servico,
      ofertaServico: data.ofertaServico ?? undefined,
      detalheFalha: data.detalheFalha ?? undefined,
      categoria,
      subcategoria,
    };
  }
}
