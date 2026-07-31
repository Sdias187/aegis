import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { MonitoringLog, PaginatedResponse } from '../common/interfaces';

export interface MonitoringQueryParams {
  page: number;
  limit: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  durationMin?: number;
  durationMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const VALID_SORT_COLUMNS = new Set([
  'SOURCE_SYSTEM',
  'DURATION_MS',
  'CREATED_AT',
]);

function resolveOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
  if (sortBy && VALID_SORT_COLUMNS.has(sortBy)) {
    return `ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }
  return 'ORDER BY CREATED_AT DESC';
}

@Injectable()
export class MonitoringService {
  constructor(private readonly db: DatabaseService) {}

  async list(params: MonitoringQueryParams): Promise<PaginatedResponse<MonitoringLog>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

    // Default: ultimas 24h
    if (!params.dateFrom && !params.dateTo) {
      conditions.push("CREATED_AT >= SYSTIMESTAMP - INTERVAL '24' HOUR");
    } else {
      if (params.dateFrom) {
        conditions.push("CREATED_AT >= TO_TIMESTAMP(:dateFrom, 'YYYY-MM-DD HH24:MI:SS')");
        binds.dateFrom = params.dateFrom;
      }
      if (params.dateTo) {
        conditions.push("CREATED_AT <= TO_TIMESTAMP(:dateTo, 'YYYY-MM-DD HH24:MI:SS')");
        binds.dateTo = params.dateTo;
      }
    }

    if (params.search) {
      conditions.push(`(UPPER(SOURCE_SYSTEM) LIKE UPPER('%' || :search || '%')
                     OR UPPER(REQUEST_BODY) LIKE UPPER('%' || :search || '%')
                     OR UPPER(REMOTE_ADDR) LIKE UPPER('%' || :search || '%'))`);
      binds.search = params.search;
    }

    if (params.durationMin !== undefined) {
      conditions.push('DURATION_MS >= :durationMin');
      binds.durationMin = params.durationMin;
    }

    if (params.durationMax !== undefined) {
      conditions.push('DURATION_MS <= :durationMax');
      binds.durationMax = params.durationMax;
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
      SELECT ID, CORRELATION_ID, SOURCE_SYSTEM, REQUEST_BODY, DURATION_MS, REMOTE_ADDR, USER_AGENT, CREATED_AT
      FROM AEGIS_MONITORING_LOGS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_MONITORING_LOGS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(sql, binds),
      this.db.executeQuery<{ TOTAL: number }>(countSql, countBinds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row) => ({
        id: String(row.ID),
        correlationId: row.CORRELATION_ID ?? undefined,
        sourceSystem: row.SOURCE_SYSTEM,
        requestBody: row.REQUEST_BODY ?? undefined,
        durationMs: Number(row.DURATION_MS ?? 0),
        remoteAddr: row.REMOTE_ADDR ?? undefined,
        userAgent: row.USER_AGENT ?? undefined,
        createdAt: row.CREATED_AT?.toISOString?.() ?? String(row.CREATED_AT ?? ''),
      })),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }
}
