import type { LogLevel } from '@/logging/logger.interface';

export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'AEGIS',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  env: import.meta.env.VITE_ENV || 'development',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'development',
  },
  polling: {
    interval: Number(import.meta.env.VITE_POLLING_INTERVAL) || 30000,
  },
  logging: {
    level: (import.meta.env.VITE_LOG_LEVEL || 'info') as LogLevel,
  },
} as const;

export type AppConfig = typeof appConfig;
