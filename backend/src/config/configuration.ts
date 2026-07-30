export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 8090,
  database: {
    user: process.env.ORACLE_USER || 'AEGIS',
    password: process.env.ORACLE_PASSWORD || 'aegis123',
    connectionString: process.env.ORACLE_CONNECTION_STRING || 'localhost:1521/XEPDB1',
    poolMin: parseInt(process.env.DB_POOL_MIN ?? '', 10) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX ?? '', 10) || 10,
    poolIncrement: parseInt(process.env.DB_POOL_INCREMENT ?? '', 10) || 1,
  },
  logLevel: process.env.LOG_LEVEL || 'info',
});
