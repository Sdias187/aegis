import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

export interface DbConfig {
  user: string;
  password: string;
  connectionString: string;
  poolMin: number;
  poolMax: number;
  poolIncrement: number;
}

function getConfig(): DbConfig {
  return {
    user: process.env.ORACLE_USER || 'AEGIS',
    password: process.env.ORACLE_PASSWORD || 'aegis123',
    connectionString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XEPDB1',
    poolMin: Number(process.env.DB_POOL_MIN) || 2,
    poolMax: Number(process.env.DB_POOL_MAX) || 10,
    poolIncrement: Number(process.env.DB_POOL_INCREMENT) || 1,
  };
}

let pool: oracledb.Pool | null = null;

export async function getPool(): Promise<oracledb.Pool> {
  if (pool) return pool;

  const config = getConfig();

  pool = await oracledb.createPool({
    user: config.user,
    password: config.password,
    connectionString: config.connectionString,
    poolMin: config.poolMin,
    poolMax: config.poolMax,
    poolIncrement: config.poolIncrement,
    queueTimeout: 30000,
  });

  console.log(`[DB] Pool created — user: ${config.user}, max: ${config.poolMax}`);
  return pool;
}

export async function getConnection(): Promise<oracledb.Connection> {
  const p = await getPool();
  return p.getConnection();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('[DB] Pool closed');
  }
}

export async function executeQuery<T>(
  sql: string,
  binds: Record<string, unknown> = {},
): Promise<{ rows: T[]; rowsAffected?: number }> {
  const conn = await getConnection();
  try {
    const result = await conn.execute<T>(sql, binds as oracledb.BindParameters);
    return {
      rows: (result.rows ?? []) as T[],
      rowsAffected: result.rowsAffected,
    };
  } finally {
    await conn.close();
  }
}
