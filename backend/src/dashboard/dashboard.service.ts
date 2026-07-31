import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { DashboardSummary, SystemHealth } from '../common/interfaces';

export interface RecentActivity {
  id: string;
  type: 'import' | 'lock' | 'record' | 'monitoring';
  description: string;
  timestamp: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getSummary(): Promise<DashboardSummary> {
    const result = await this.db.executeQuery<{
      TOTAL_RECORDS: number;
      ACTIVE_LOCKS: number;
      DISABLED_LOCKS: number;
      TOTAL_IMPORTS: number;
      SUCCESSFUL_IMPORTS: number;
      FAILED_IMPORTS: number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM AEGIS_FICHAS) AS TOTAL_RECORDS,
        (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 1) AS ACTIVE_LOCKS,
        (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 0) AS DISABLED_LOCKS,
        0 AS TOTAL_IMPORTS,
        0 AS SUCCESSFUL_IMPORTS,
        0 AS FAILED_IMPORTS
      FROM DUAL
    `);

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

  async getRecentActivity(): Promise<RecentActivity[]> {
    const result = await this.db.executeQuery<any>(`
      SELECT ID, ENDPOINT, RESULT, CREATED_AT
      FROM AEGIS_LOGS
      ORDER BY CREATED_AT DESC
      FETCH FIRST 10 ROWS ONLY
    `);

    return result.rows.map((row) => ({
      id: String(row.ID),
      type: this.getActivityType(row.ENDPOINT),
      description: row.RESULT ?? row.ENDPOINT,
      timestamp: row.CREATED_AT?.toISOString?.() ?? String(row.CREATED_AT ?? ''),
    }));
  }

  async getHealth(): Promise<SystemHealth> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  }

  private getActivityType(endpoint: unknown): RecentActivity['type'] {
    const value = String(endpoint ?? '').toLowerCase();
    if (value.includes('import')) return 'import';
    if (value.includes('travas')) return 'lock';
    if (value.includes('monitor')) return 'monitoring';
    return 'record';
  }
}
