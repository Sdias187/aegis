import { executeQuery } from '../config/database.js';
import type { DashboardSummary, SystemHealth } from '../types/index.js';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    /*
     * SELECT
     *   (SELECT COUNT(*) FROM AEGIS_FICHAS) AS TOTAL_RECORDS,
     *   (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 1) AS ACTIVE_LOCKS,
     *   (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 0) AS DISABLED_LOCKS,
     *   (SELECT COUNT(*) FROM AEGIS_IMPORTACOES) AS TOTAL_IMPORTS,
     *   (SELECT COUNT(*) FROM AEGIS_IMPORTACOES WHERE STATUS = 'SUCCESS') AS SUCCESSFUL_IMPORTS,
     *   (SELECT COUNT(*) FROM AEGIS_IMPORTACOES WHERE STATUS = 'ERROR') AS FAILED_IMPORTS
     * FROM DUAL
     */

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

    const result = await executeQuery<{
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
  },

  async getHealth(): Promise<SystemHealth> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  },
};
