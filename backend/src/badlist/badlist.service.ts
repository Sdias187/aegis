import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBadlistDto } from '../common/dto/create-badlist.dto';
import { UpdateBadlistDto } from '../common/dto/update-badlist.dto';
import type { Badlist, PaginatedResponse, PaginationParams } from '../common/interfaces';

const BADLIST_TRAVA_ID = '12';

const SORT_COLUMNS: Record<string, string> = {
  id: 'BD.ID',
  servico: 'F.SERVICO',
  atendimentoPara: 'F.ATENDIMENTO_PARA',
  ofertaServico: 'F.OFERTA_SERVICO',
  detalheFalha: 'F.DETALHE_FALHA',
  words: 'BD.WORDS',
  active: 'BD.ACTIVE',
  createdAt: 'BD.CREATED_AT',
};

function orderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
  const column = sortBy ? SORT_COLUMNS[sortBy] : undefined;
  return `ORDER BY ${column ?? 'BD.ID'} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
}

@Injectable()
export class BadlistService {
  constructor(private readonly db: DatabaseService) {}

  async list(params: PaginationParams): Promise<PaginatedResponse<Badlist>> {
    const offset = (params.page - 1) * params.limit;
    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

    if (params.search) {
      conditions.push(
        `(UPPER(F.SERVICO) LIKE UPPER('%' || :search || '%') OR UPPER(F.ATENDIMENTO_PARA) LIKE UPPER('%' || :search || '%') OR UPPER(F.OFERTA_SERVICO) LIKE UPPER('%' || :search || '%') OR UPPER(F.DETALHE_FALHA) LIKE UPPER('%' || :search || '%') OR UPPER(BD.WORDS) LIKE UPPER('%' || :search || '%'))`,
      );
      binds.search = params.search;
    }

    if (params.atendimentoPara) {
      conditions.push(`UPPER(F.ATENDIMENTO_PARA) LIKE UPPER('%' || :atendimentoPara || '%')`);
      binds.atendimentoPara = params.atendimentoPara;
    }

    if (params.servico) {
      conditions.push(`UPPER(F.SERVICO) LIKE UPPER('%' || :servico || '%')`);
      binds.servico = params.servico;
    }

    if (params.active !== undefined && params.active !== '') {
      conditions.push(`BD.ACTIVE = :active`);
      binds.active = Number(params.active);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const countBinds = Object.fromEntries(
      Object.entries(binds).filter(([key]) => key !== 'offset' && key !== 'limit'),
    );

    const baseSelect = `FROM AEGIS_BADLIST BD JOIN AEGIS_FICHAS F ON BD.FICHA_ID = F.ID`;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(
        `SELECT BD.ID, BD.FICHA_ID, F.SERVICO, F.ATENDIMENTO_PARA, F.OFERTA_SERVICO, F.DETALHE_FALHA, BD.WORDS, BD.ACTIVE, BD.CREATED_AT ${baseSelect} ${where} ${orderBy(params.sortBy, params.sortOrder)} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
        binds,
      ),
      this.db.executeQuery<{ TOTAL: number }>(
        `SELECT COUNT(*) AS TOTAL ${baseSelect} ${where}`,
        countBinds,
      ),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);
    return {
      data: dataResult.rows.map((row) => this.mapBadlist(row)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async getById(id: string): Promise<Badlist | null> {
    const result = await this.db.executeQuery<any>(
      `SELECT BD.ID, BD.FICHA_ID, F.SERVICO, F.ATENDIMENTO_PARA, F.OFERTA_SERVICO, F.DETALHE_FALHA, BD.WORDS, BD.ACTIVE, BD.CREATED_AT FROM AEGIS_BADLIST BD JOIN AEGIS_FICHAS F ON BD.FICHA_ID = F.ID WHERE BD.ID = :id`,
      { id },
    );
    return result.rows[0] ? this.mapBadlist(result.rows[0]) : null;
  }

  async create(data: CreateBadlistDto): Promise<{ inserted: number }> {
    const words = this.normalizeWords(data.words);
    const fichaIds = this.dedupeFichaIds(data.fichaIds);

    let inserted = 0;
    for (const fichaId of fichaIds) {
      const ficha = await this.fichaExists(fichaId);
      if (!ficha) {
        throw new BadRequestException({
          type: 'VALIDATION',
          message: `Ficha ${fichaId} não encontrada`,
        });
      }

      const existing = await this.badlistExistsForFicha(fichaId);
      if (existing) {
        throw new BadRequestException({
          type: 'VALIDATION',
          message: `A ficha ${fichaId} já possui palavras na badlist`,
        });
      }

      await this.db.executeQuery(
        `INSERT INTO AEGIS_BADLIST (FICHA_ID, WORDS, ACTIVE, CREATED_AT) VALUES (:fichaId, :words, :active, SYSDATE)`,
        { fichaId, words, active: data.active },
      );

      await this.db.executeQuery(
        `INSERT INTO AEGIS_FICHAS_TRAVAS (FICHA_ID, TRAVA_ID) SELECT :fichaId, :travid FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM AEGIS_FICHAS_TRAVAS WHERE FICHA_ID = :fichaId AND TRAVA_ID = :travid)`,
        { fichaId, travid: BADLIST_TRAVA_ID },
      );

      inserted++;
    }

    return { inserted };
  }

  async update(id: string, data: UpdateBadlistDto): Promise<Badlist> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Badlist não encontrada' });
    }

    const words = data.words !== undefined ? this.normalizeWords(data.words) : existing.words;
    const active = data.active !== undefined ? data.active : existing.active;

    await this.db.executeQuery(
      `UPDATE AEGIS_BADLIST SET WORDS = :words, ACTIVE = :active WHERE ID = :id`,
      { words, active, id },
    );

    return { ...existing, words, active };
  }

  async remove(id: string): Promise<void> {
    const result = await this.db.executeQuery('DELETE FROM AEGIS_BADLIST WHERE ID = :id', { id });
    if (!result.rowsAffected) {
      throw new NotFoundException({ type: 'NOT_FOUND', message: 'Badlist não encontrada' });
    }
  }

  private async fichaExists(fichaId: string): Promise<boolean> {
    const result = await this.db.executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL FROM AEGIS_FICHAS WHERE ID = :id`,
      { id: fichaId },
    );
    return Number(result.rows[0]?.TOTAL ?? 0) > 0;
  }

  private async badlistExistsForFicha(fichaId: string): Promise<boolean> {
    const result = await this.db.executeQuery<{ TOTAL: number }>(
      `SELECT COUNT(*) AS TOTAL FROM AEGIS_BADLIST WHERE FICHA_ID = :fichaId`,
      { fichaId },
    );
    return Number(result.rows[0]?.TOTAL ?? 0) > 0;
  }

  private normalizeWords(words: string): string {
    if (!words || !words.trim()) {
      throw new BadRequestException({
        type: 'VALIDATION',
        message: 'Palavras são obrigatórias',
      });
    }

    const cleaned = words.trim().replace(/\s*\|\s*/g, '|');
    const parts = cleaned.split('|').filter((p) => p.trim().length > 0);

    if (parts.length === 0) {
      throw new BadRequestException({
        type: 'VALIDATION',
        message: 'Palavras inválidas. Use o formato palavra1|palavra2',
      });
    }

    const seen = new Set<string>();
    for (const part of parts) {
      const lower = part.trim().toLowerCase();
      if (seen.has(lower)) {
        throw new BadRequestException({
          type: 'VALIDATION',
          message: `Palavra duplicada: ${part.trim()}`,
        });
      }
      seen.add(lower);
    }

    return parts.map((p) => p.trim()).join('|');
  }

  private dedupeFichaIds(fichaIds: string[]): string[] {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const id of fichaIds) {
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(id);
      }
    }
    return unique;
  }

  private mapBadlist(row: any): Badlist {
    return {
      id: String(row.ID),
      fichaId: String(row.FICHA_ID),
      servico: row.SERVICO ?? undefined,
      atendimentoPara: row.ATENDIMENTO_PARA ?? undefined,
      ofertaServico: row.OFERTA_SERVICO ?? undefined,
      detalheFalha: row.DETALHE_FALHA ?? undefined,
      words: row.WORDS,
      active: Number(row.ACTIVE),
      createdAt: row.CREATED_AT ? new Date(row.CREATED_AT).toISOString() : undefined,
    };
  }
}
