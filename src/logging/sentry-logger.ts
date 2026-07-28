import * as Sentry from '@sentry/react';
import type { Logger, LogLevel } from './logger.interface';

export class SentryLogger implements Logger {
  constructor(_level: LogLevel = 'info') {}

  debug(_message: string, ..._args: unknown[]): void {
    // Sentry does not support debug level
  }

  info(message: string, ..._args: unknown[]): void {
    Sentry.addBreadcrumb({
      category: 'info',
      message,
      level: 'info',
    });
  }

  warn(message: string, ..._args: unknown[]): void {
    Sentry.addBreadcrumb({
      category: 'warning',
      message,
      level: 'warning',
    });
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    Sentry.captureException(error || new Error(message), {
      extra: { message, args },
    });
  }

  fatal(message: string, error?: Error, ...args: unknown[]): void {
    Sentry.captureException(error || new Error(message), {
      extra: { message, args },
      level: 'fatal',
    });
  }
}
