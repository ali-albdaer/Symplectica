type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

function timestamp(): string {
    return new Date().toISOString();
}

export const logger = {
    debug(...args: unknown[]): void {
        if (shouldLog('debug')) console.log(`[${timestamp()}] [DEBUG]`, ...args);
    },
    info(...args: unknown[]): void {
        if (shouldLog('info')) console.log(`[${timestamp()}] [INFO]`, ...args);
    },
    warn(...args: unknown[]): void {
        if (shouldLog('warn')) console.warn(`[${timestamp()}] [WARN]`, ...args);
    },
    error(...args: unknown[]): void {
        if (shouldLog('error')) console.error(`[${timestamp()}] [ERROR]`, ...args);
    },
};
