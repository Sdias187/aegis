import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { DashboardSummary, SystemHealth, ExternalServiceHealth } from '../common/interfaces';

const EXTERNAL_AEGIS_URL = 'http://brtlvbgs2355co:8081/ms-b2c-vivo-aegis/v1/actuator/health';

export interface RecentActivity {
  id: string;
  type: 'import' | 'lock' | 'record' | 'monitoring';
  description: string;
  timestamp: string;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private cachedExternalHealth: ExternalServiceHealth | null = null;
  private lastExternalHealthCheck = 0;
  private readonly HEALTH_CACHE_TTL = 30_000; // 30s

  constructor(private readonly db: DatabaseService) {}

  async getSummary(): Promise<DashboardSummary> {
    const [result, successResult] = await Promise.all([
      this.db.executeQuery<{
        TOTAL_RECORDS: number;
        ACTIVE_LOCKS: number;
        DISABLED_LOCKS: number;
      }>(`
        SELECT
          (SELECT COUNT(*) FROM AEGIS_FICHAS) AS TOTAL_RECORDS,
          (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 'TRUE') AS ACTIVE_LOCKS,
          (SELECT COUNT(*) FROM AEGIS_TRAVAS WHERE ATIVO = 'FALSE') AS DISABLED_LOCKS
        FROM DUAL
      `),
      this.db.executeQuery<{ TOTAL: number }>(`
        SELECT COUNT(*) AS TOTAL FROM AEGIS_LOGS
        WHERE UPPER(ENDPOINT) LIKE '%TRAVAS%'
          AND STATUS = 'SUCCESS'
          AND CREATED_AT >= SYSTIMESTAMP - INTERVAL '1' HOUR
      `),
    ]);

    const row = result.rows[0];

    return {
      totalRecords: Number(row?.TOTAL_RECORDS ?? 0),
      activeLocks: Number(row?.ACTIVE_LOCKS ?? 0),
      disabledLocks: Number(row?.DISABLED_LOCKS ?? 0),
      totalImports: 0,
      successfulImports: 0,
      failedImports: 0,
      travasComSucessoUltimaHora: Number(successResult.rows[0]?.TOTAL ?? 0),
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

  async getExternalHealth(): Promise<ExternalServiceHealth> {
    const now = Date.now();

    // Cache por 30s para nao spammar a API externa
    if (this.cachedExternalHealth && now - this.lastExternalHealthCheck < this.HEALTH_CACHE_TTL) {
      return this.cachedExternalHealth;
    }

    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(EXTERNAL_AEGIS_URL, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeout);

      const responseTime = Date.now() - start;
      let details = '';

      if (response.ok) {
        try {
          const body = await response.json();
          details = JSON.stringify(body);
        } catch {
          details = response.statusText;
        }
      }

      const health: ExternalServiceHealth = {
        url: EXTERNAL_AEGIS_URL,
        status: response.ok ? 'healthy' : 'degraded',
        statusCode: response.status,
        responseTimeMs: responseTime,
        lastCheck: new Date().toISOString(),
        details: response.ok ? details : `HTTP ${response.status}`,
      };

      this.cachedExternalHealth = health;
      this.lastExternalHealthCheck = now;
      return health;
    } catch (err) {
      const responseTime = Date.now() - start;
      const health: ExternalServiceHealth = {
        url: EXTERNAL_AEGIS_URL,
        status: 'down',
        responseTimeMs: responseTime,
        lastCheck: new Date().toISOString(),
        details: err instanceof Error ? err.message : 'Conexao recusada',
      };

      this.cachedExternalHealth = health;
      this.lastExternalHealthCheck = now;
      return health;
    }
  }

  private getActivityType(endpoint: unknown): RecentActivity['type'] {
    const value = String(endpoint ?? '').toLowerCase();
    if (value.includes('import')) return 'import';
    if (value.includes('travas')) return 'lock';
    if (value.includes('monitor')) return 'monitoring';
    return 'record';
  }
}
