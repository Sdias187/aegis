import app from './app.js';
import { getPool, closePool } from './config/database.js';
import { logger } from './config/logger.js';

const PORT = Number(process.env.PORT) || 3000;

async function start(): Promise<void> {
  try {
    // Inicializa pool de conexões Oracle
    await getPool();
    logger.info('[Server] Oracle pool initialized');

    app.listen(PORT, () => {
      logger.info(`[Server] AEGIS Backend running on port ${PORT}`);
      logger.info(`[Server] Health: http://localhost:${PORT}/health`);
      logger.info(`[Server] API:    http://localhost:${PORT}/api/v1`);
    });
  } catch (err) {
    logger.error('[Server] Failed to start', err as Error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('[Server] SIGTERM received — shutting down');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('[Server] SIGINT received — shutting down');
  await closePool();
  process.exit(0);
});

start();
