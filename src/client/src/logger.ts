type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    none: 4,
};

let currentLevel: LogLevel = 'info';

function shouldLog(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[currentLevel];
}

export const logger = {
    setLevel(level: LogLevel): void {
        currentLevel = level;
    },
    debug(...args: unknown[]): void {
        if (shouldLog('debug')) console.log('[DEBUG]', ...args);
    },
    info(...args: unknown[]): void {
        if (shouldLog('info')) console.log('[INFO]', ...args);
    },
    warn(...args: unknown[]): void {
        if (shouldLog('warn')) console.warn('[WARN]', ...args);
    },
    error(...args: unknown[]): void {
        if (shouldLog('error')) console.error('[ERROR]', ...args);
    },
};
