/**
 * Debug Logging System
 * Provides a centralized logging system with on-screen and console output
 */
class DebugLog {
    constructor() {
        this.logs = [];
        this.maxLogs = 50;
        this.listeners = [];
    }

    log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            timestamp,
            message,
            level
        };
        this.logs.push(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Also log to console
        const output = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        switch (level) {
            case 'error':
                console.error(output);
                break;
            case 'warning':
                console.warn(output);
                break;
            default:
                console.log(output);
        }

        // Notify listeners
        this.listeners.forEach(listener => listener(entry));
    }

    info(message) {
        this.log(message, 'info');
    }

    warn(message) {
        this.log(message, 'warning');
    }

    error(message) {
        this.log(message, 'error');
    }

    debug(message) {
        this.log(message, 'debug');
    }

    getLogs() {
        return [...this.logs];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    clear() {
        this.logs = [];
    }
}

// Global instance
window.DebugLog = new DebugLog();

// Setup global error handler
window.addEventListener('error', (event) => {
    DebugLog.error(`Runtime Error: ${event.message} at ${event.filename}:${event.lineno}`);
});

window.addEventListener('unhandledrejection', (event) => {
    DebugLog.error(`Unhandled Promise Rejection: ${event.reason}`);
});
