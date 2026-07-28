const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

type LogFn = (message: string, ...args: unknown[]) => void;

const levels = { debug: 0, info: 1, warn: 2, error: 3 } as const;

function shouldLog(level: keyof typeof levels): boolean {
  return levels[level] >= (levels[LOG_LEVEL as keyof typeof levels] ?? levels.info);
}

function timestamp(): string {
  return new Date().toISOString();
}

export const logger: Record<string, LogFn> = {
  debug: (msg, ...args) => shouldLog('debug') && console.debug(`[${timestamp()}] [DEBUG] ${msg}`, ...args),
  info: (msg, ...args) => shouldLog('info') && console.info(`[${timestamp()}] [INFO] ${msg}`, ...args),
  warn: (msg, ...args) => shouldLog('warn') && console.warn(`[${timestamp()}] [WARN] ${msg}`, ...args),
  error: (msg, ...args) => shouldLog('error') && console.error(`[${timestamp()}] [ERROR] ${msg}`, ...args),
};
