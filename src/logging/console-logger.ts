import type { Logger, LogLevel } from './logger.interface';

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(`[AEGIS:DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(`[AEGIS:INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[AEGIS:WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[AEGIS:ERROR] ${message}`, error, ...args);
    }
  }

  fatal(message: string, error?: Error, ...args: unknown[]): void {
    if (this.shouldLog('fatal')) {
      console.error(`[AEGIS:FATAL] ${message}`, error, ...args);
    }
  }
}
