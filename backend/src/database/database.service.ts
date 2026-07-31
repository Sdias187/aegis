import { Injectable, Logger, OnModuleInit, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import oracledb from 'oracledb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  private pool: oracledb.Pool | null = null;
  private readonly logger = new Logger(DatabaseService.name);
  private mockMode = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.mockMode = process.env.MOCK_DB === 'true';

    if (this.mockMode) {
      this.logger.warn('══════════════════════════════════════════');
      this.logger.warn('  MOCK_DB = true — rodando sem banco');
      this.logger.warn('  Todas as queries retornarão dados vazios');
      this.logger.warn('══════════════════════════════════════════');
      return;
    }

    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;

    const dbConfig = this.configService.get<{
      user: string;
      password: string;
      connectionString: string;
      poolMin: number;
      poolMax: number;
      poolIncrement: number;
    }>('database')!;

    this.pool = await oracledb.createPool({
      user: dbConfig.user,
      password: dbConfig.password,
      connectionString: dbConfig.connectionString,
      poolMin: dbConfig.poolMin,
      poolMax: dbConfig.poolMax,
      poolIncrement: dbConfig.poolIncrement,
      queueTimeout: 30000,
    });

    this.logger.log(`Oracle pool created — user: ${dbConfig.user}, max: ${dbConfig.poolMax}`);
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.logger.log('Oracle pool closed');
    }
  }

  private async getConnection(): Promise<oracledb.Connection> {
    return this.pool!.getConnection();
  }

  async executeQuery<T>(
    sql: string,
    binds: Record<string, unknown> = {},
  ): Promise<{ rows: T[]; rowsAffected?: number; outBinds?: Record<string, unknown> }> {
    if (this.mockMode) {
      this.logger.debug(`[MOCK] Query ignorada: ${sql.slice(0, 80)}...`);
      return { rows: [] as T[] };
    }

    const conn = await this.getConnection();
    try {
      const result = await conn.execute<T>(sql, binds as oracledb.BindParameters);
      return {
        rows: (result.rows ?? []) as T[],
        rowsAffected: result.rowsAffected,
        outBinds: result.outBinds as Record<string, unknown> | undefined,
      };
    } finally {
      await conn.close();
    }
  }
}
