import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { DashboardSummary, SystemHealth } from '../common/interfaces';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly db: DatabaseService) {}

  async getSummary(): Promise<DashboardSummary> {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM AEGIS_FICHAS) AS TOTAL_RECORDS,
        (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE NOME IS NOT NULL) AS ACTIVE_LOCKS,
        0 AS DISABLED_LOCKS,
        0 AS TOTAL_IMPORTS,
        0 AS SUCCESSFUL_IMPORTS,
        0 AS FAILED_IMPORTS
      FROM DUAL
    `;

    const result = await this.db.executeQuery<{
      TOTAL_RECORDS: number;
      ACTIVE_LOCKS: number;
      DISABLED_LOCKS: number;
      TOTAL_IMPORTS: number;
      SUCCESSFUL_IMPORTS: number;
      FAILED_IMPORTS: number;
    }>(sql);

    const row = result.rows[0];

    return {
      totalRecords: Number(row?.TOTAL_RECORDS ?? 0),
      activeLocks: Number(row?.ACTIVE_LOCKS ?? 0),
      disabledLocks: Number(row?.DISABLED_LOCKS ?? 0),
      totalImports: Number(row?.TOTAL_IMPORTS ?? 0),
      successfulImports: Number(row?.SUCCESSFUL_IMPORTS ?? 0),
      failedImports: Number(row?.FAILED_IMPORTS ?? 0),
    };
  }

  async getHealth(): Promise<SystemHealth> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  }
}
