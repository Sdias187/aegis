import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { ExecLog, PaginatedResponse } from '../common/interfaces';

export interface LogsQueryParams {
  page: number;
  limit: number;
  search?: string;
  endpoint?: string;
  validationName?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  executionTimeMin?: number;
  executionTimeMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const VALID_SORT_COLUMNS = new Set([
  'ENDPOINT',
  'VALIDATION_NAME',
  'STATUS',
  'EXECUTION_TIME_MS',
  'CREATED_AT',
]);

function resolveOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
  if (sortBy && VALID_SORT_COLUMNS.has(sortBy)) {
    return `ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }
  return 'ORDER BY CREATED_AT DESC';
}

@Injectable()
export class ExecutionLogsService {
  private readonly logger = new Logger(ExecutionLogsService.name);

  constructor(private readonly db: DatabaseService) {}

  async list(params: LogsQueryParams): Promise<PaginatedResponse<ExecLog>> {
    const offset = (params.page - 1) * params.limit;

    const binds: Record<string, unknown> = { offset, limit: params.limit };
    const conditions: string[] = [];

    // Default: ultima hora
    if (!params.dateFrom && !params.dateTo) {
      conditions.push('CREATED_AT >= SYSTIMESTAMP - INTERVAL \'1\' HOUR');
    } else {
      if (params.dateFrom) {
        conditions.push('CREATED_AT >= TO_TIMESTAMP(:dateFrom, \'YYYY-MM-DD HH24:MI:SS\')');
        binds.dateFrom = params.dateFrom;
      }
      if (params.dateTo) {
        conditions.push('CREATED_AT <= TO_TIMESTAMP(:dateTo, \'YYYY-MM-DD HH24:MI:SS\')');
        binds.dateTo = params.dateTo;
      }
    }

    if (params.search) {
      conditions.push(`(UPPER(ENDPOINT) LIKE UPPER('%' || :search || '%')
                     OR UPPER(VALIDATION_NAME) LIKE UPPER('%' || :search || '%')
                     OR UPPER(RESULT) LIKE UPPER('%' || :search || '%'))`);
      binds.search = params.search;
    }

    if (params.endpoint) {
      conditions.push('UPPER(ENDPOINT) LIKE UPPER(\'%\' || :endpoint || \'%\')');
      binds.endpoint = params.endpoint;
    }

    if (params.validationName) {
      conditions.push('UPPER(VALIDATION_NAME) LIKE UPPER(\'%\' || :validationName || \'%\')');
      binds.validationName = params.validationName;
    }

    if (params.status) {
      conditions.push('STATUS = :status');
      binds.status = params.status;
    }

    if (params.executionTimeMin !== undefined) {
      conditions.push('EXECUTION_TIME_MS >= :executionTimeMin');
      binds.executionTimeMin = params.executionTimeMin;
    }

    if (params.executionTimeMax !== undefined) {
      conditions.push('EXECUTION_TIME_MS <= :executionTimeMax');
      binds.executionTimeMax = params.executionTimeMax;
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
      SELECT ID, ENDPOINT, VALIDATION_NAME, RESULT, STATUS, EXECUTION_TIME_MS, CREATED_AT, INPUT_VALUE
      FROM AEGIS_LOGS
      ${where}
      ${orderBy}
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;

    const countSql = `SELECT COUNT(*) AS TOTAL FROM AEGIS_LOGS ${where}`;

    const [dataResult, countResult] = await Promise.all([
      this.db.executeQuery<any>(sql, binds),
      this.db.executeQuery<{ TOTAL: number }>(countSql, countBinds),
    ]);

    const total = Number(countResult.rows[0]?.TOTAL ?? 0);

    return {
      data: dataResult.rows.map((row) => ({
        id: String(row.ID),
        endpoint: row.ENDPOINT,
        validationName: row.VALIDATION_NAME ?? undefined,
        result: row.RESULT ?? undefined,
        status: row.STATUS,
        executionTimeMs: Number(row.EXECUTION_TIME_MS ?? 0),
        createdAt: row.CREATED_AT?.toISOString?.() ?? String(row.CREATED_AT ?? ''),
        inputValue: row.INPUT_VALUE ?? undefined,
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
