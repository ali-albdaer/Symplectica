/**
 * Debug System
 * Provides error logging, debug tracking, and on-screen error display
 */

window.DebugSystem = {
    logs: [],
    maxLogs: 100,
    isInitialized: false,

    init() {
        this.isInitialized = true;
        this.log('info', 'Debug system initialized');
    },

    log(level, message, data = null) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = { timestamp, level, message, data };
        
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Also log to browser console
        const logLevel = level.toUpperCase();
        console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](
            `[${timestamp}] [${logLevel}] ${message}`,
            data || ''
        );

        return entry;
    },

    info(message, data) {
        return this.log('info', message, data);
    },

    warn(message, data) {
        return this.log('warning', message, data);
    },

    error(message, data) {
        return this.log('error', message, data);
    },

    getLogs(level = null, limit = 50) {
        let filtered = this.logs;
        if (level) {
            filtered = filtered.filter(entry => entry.level === level);
        }
        return filtered.slice(-limit);
    },

    clear() {
        this.logs = [];
    },

    showError(title, message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.classList.remove('hidden');
            errorElement.textContent = `${title}\n\n${message}`;
        }
        this.error(title, message);
    },

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },

    setLoadingStatus(status) {
        const statusElement = document.getElementById('loadingStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
        this.info('Loading: ' + status);
    },

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }
};

// Setup global error handler
window.addEventListener('error', (event) => {
    DebugSystem.error('Uncaught Error', `${event.message}\n${event.filename}:${event.lineno}`);
});

window.addEventListener('unhandledrejection', (event) => {
    DebugSystem.error('Unhandled Promise Rejection', event.reason);
});

// Initialize
DebugSystem.init();
