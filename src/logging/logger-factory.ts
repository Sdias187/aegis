import { appConfig } from '@/config';
import { ConsoleLogger } from './console-logger';
import type { Logger } from './logger.interface';
import { SentryLogger } from './sentry-logger';

let instance: Logger | null = null;

export function createLogger(): Logger {
  if (instance) {
    return instance;
  }

  const isProduction = appConfig.env === 'production';

  if (isProduction && appConfig.sentry.dsn) {
    instance = new SentryLogger(appConfig.logging.level);
  } else {
    instance = new ConsoleLogger(appConfig.logging.level);
  }

  return instance;
}

export function getLogger(): Logger {
  return instance || createLogger();
}

export const logger = createLogger();
