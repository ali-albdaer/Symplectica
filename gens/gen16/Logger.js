/**
 * Logger.js - Centralized Logging & Error Handling
 * Provides console logging with on-screen debug output and error recovery
 */

// Save original console methods BEFORE intercepting them
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

const Logger = (() => {
    const logs = [];
    const maxLogs = 500;
    let debugUI = null;
    
    return {
        /**
         * Initialize logger with DebugUI reference
         */
        init(ui) {
            debugUI = ui;
            originalLog('[Logger] Initialized');
        },

        /**
         * Log info message
         */
        info(message) {
            const timestamp = new Date().toLocaleTimeString();
            const formatted = `[${timestamp}] ℹ ${message}`;
            
            logs.push({ level: 'info', message, timestamp });
            originalLog(formatted);
            
            if (debugUI) {
                debugUI.addConsoleLine(message, 'info');
            }
            
            this.maintainLogSize();
        },

        /**
         * Log warning message
         */
        warn(message) {
            const timestamp = new Date().toLocaleTimeString();
            const formatted = `[${timestamp}] ⚠ ${message}`;
            
            logs.push({ level: 'warn', message, timestamp });
            originalWarn(formatted);
            
            if (debugUI) {
                debugUI.addConsoleLine(message, 'warn');
            }
            
            this.maintainLogSize();
        },

        /**
         * Log error message
         */
        error(message) {
            const timestamp = new Date().toLocaleTimeString();
            const formatted = `[${timestamp}] ✗ ${message}`;
            
            logs.push({ level: 'error', message, timestamp });
            originalError(formatted);
            
            if (debugUI) {
                debugUI.addConsoleLine(message, 'error');
            }
            
            this.maintainLogSize();
        },

        /**
         * Log debug message
         */
        debug(message) {
            if (typeof message === 'object') {
                message = JSON.stringify(message, null, 2);
            }
            
            const timestamp = new Date().toLocaleTimeString();
            const formatted = `[${timestamp}] 🔍 ${message}`;
            
            logs.push({ level: 'debug', message, timestamp });
            originalLog(formatted);
            
            this.maintainLogSize();
        },

        /**
         * Assert condition
         */
        assert(condition, message) {
            if (!condition) {
                this.error(`Assertion failed: ${message}`);
            }
        },

        /**
         * Get all logs
         */
        getLogs() {
            return [...logs];
        },

        /**
         * Get logs of a specific level
         */
        getLogsByLevel(level) {
            return logs.filter(log => log.level === level);
        },

        /**
         * Clear logs
         */
        clear() {
            logs.length = 0;
            originalLog('Logs cleared');
        },

        /**
         * Export logs as text
         */
        exportLogs() {
            return logs.map(log => `[${log.level.toUpperCase()}] ${log.timestamp}: ${log.message}`).join('\n');
        },

        /**
         * Maintain log size
         */
        maintainLogSize() {
            if (logs.length > maxLogs) {
                logs.splice(0, logs.length - maxLogs);
            }
        },

        /**
         * Setup global error handler
         */
        setupGlobalErrorHandler(debugUI) {
            window.addEventListener('error', (event) => {
                const message = `${event.message}\nat ${event.filename}:${event.lineno}:${event.colno}`;
                Logger.error(message);
                
                if (debugUI) {
                    debugUI.showErrorOverlay('RUNTIME ERROR', message);
                }
            });
            
            window.addEventListener('unhandledrejection', (event) => {
                const message = `Unhandled Promise Rejection: ${event.reason}`;
                Logger.error(message);
                
                if (debugUI) {
                    debugUI.showErrorOverlay('PROMISE REJECTION', message);
                }
            });
            
            Logger.info('Global error handler installed');
        },
    };
})();

/**
 * Intercept console methods to also log to debugUI
 * Use original console methods to avoid infinite recursion
 */
console.log = function(...args) {
    originalLog.apply(console, args);
    // Don't recursively call Logger.info() - just log directly
};

console.warn = function(...args) {
    originalWarn.apply(console, args);
    // Don't recursively call Logger.warn()
};

console.error = function(...args) {
    originalError.apply(console, args);
    // Don't recursively call Logger.error()
};
