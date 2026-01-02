/**
 * Solar System Simulation - Logger Utility
 * =========================================
 * Robust logging system with on-screen debug console.
 * Ensures errors are visible even during loading failures.
 */

const Logger = {
    logs: [],
    maxLogs: 500,
    listeners: [],
    initialized: false,
    
    // Log levels
    LEVELS: {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        SUCCESS: 4,
    },
    
    currentLevel: 0, // Show all logs by default
    
    /**
     * Initialize the logger system
     */
    init() {
        if (this.initialized) return;
        
        // Capture global errors
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            this.error(`Global Error: ${msg}`, {
                url: url,
                line: lineNo,
                column: columnNo,
                stack: error?.stack
            });
            this.showLoadingError(`${msg} at ${url}:${lineNo}`);
            return false;
        };
        
        // Capture unhandled promise rejections
        window.onunhandledrejection = (event) => {
            this.error(`Unhandled Promise Rejection: ${event.reason}`, {
                reason: event.reason,
                stack: event.reason?.stack
            });
            this.showLoadingError(`Promise Rejection: ${event.reason}`);
        };
        
        // Override console methods to capture all output
        const originalConsole = {
            log: console.log.bind(console),
            warn: console.warn.bind(console),
            error: console.error.bind(console),
            info: console.info.bind(console),
        };
        
        console.log = (...args) => {
            originalConsole.log(...args);
            this.addLog('info', args.join(' '));
        };
        
        console.warn = (...args) => {
            originalConsole.warn(...args);
            this.addLog('warn', args.join(' '));
        };
        
        console.error = (...args) => {
            originalConsole.error(...args);
            this.addLog('error', args.join(' '));
        };
        
        console.info = (...args) => {
            originalConsole.info(...args);
            this.addLog('info', args.join(' '));
        };
        
        this.initialized = true;
        this.info('Logger initialized');
    },
    
    /**
     * Add a log entry
     */
    addLog(level, message, data = null) {
        const entry = {
            timestamp: new Date(),
            level: level,
            message: message,
            data: data,
        };
        
        this.logs.push(entry);
        
        // Trim old logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Notify listeners
        this.listeners.forEach(listener => listener(entry));
        
        // Update debug console if visible
        this.updateDebugConsole(entry);
    },
    
    /**
     * Log methods
     */
    debug(message, data = null) {
        if (this.currentLevel <= this.LEVELS.DEBUG) {
            this.addLog('debug', message, data);
        }
    },
    
    info(message, data = null) {
        if (this.currentLevel <= this.LEVELS.INFO) {
            this.addLog('info', message, data);
        }
    },
    
    warn(message, data = null) {
        if (this.currentLevel <= this.LEVELS.WARN) {
            this.addLog('warn', message, data);
        }
    },
    
    error(message, data = null) {
        if (this.currentLevel <= this.LEVELS.ERROR) {
            this.addLog('error', message, data);
        }
    },
    
    success(message, data = null) {
        this.addLog('success', message, data);
    },
    
    /**
     * Subscribe to log updates
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    },
    
    /**
     * Update the on-screen debug console
     */
    updateDebugConsole(entry) {
        const debugLog = document.getElementById('debug-log');
        if (!debugLog) return;
        
        const entryDiv = document.createElement('div');
        entryDiv.className = `log-entry ${entry.level}`;
        
        const time = entry.timestamp.toLocaleTimeString();
        entryDiv.innerHTML = `<span class="timestamp">[${time}]</span> ${this.escapeHtml(entry.message)}`;
        
        debugLog.appendChild(entryDiv);
        debugLog.scrollTop = debugLog.scrollHeight;
    },
    
    /**
     * Show error in loading screen
     */
    showLoadingError(message) {
        const errorsDiv = document.getElementById('loading-errors');
        if (!errorsDiv) return;
        
        const errorItem = document.createElement('div');
        errorItem.className = 'error-item';
        errorItem.textContent = message;
        errorsDiv.appendChild(errorItem);
        
        // Update loading status
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = 'Error occurred during loading';
            statusEl.style.color = '#f44336';
        }
    },
    
    /**
     * Update loading progress
     */
    setLoadingProgress(progress, status) {
        const progressBar = document.getElementById('loading-progress');
        const statusEl = document.getElementById('loading-status');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (statusEl && status) {
            statusEl.textContent = status;
        }
        
        this.info(`Loading: ${progress}% - ${status}`);
    },
    
    /**
     * Clear all logs
     */
    clear() {
        this.logs = [];
        const debugLog = document.getElementById('debug-log');
        if (debugLog) {
            debugLog.innerHTML = '';
        }
        this.info('Logs cleared');
    },
    
    /**
     * Get all logs
     */
    getLogs(level = null) {
        if (level === null) return this.logs;
        return this.logs.filter(log => log.level === level);
    },
    
    /**
     * Export logs as string
     */
    export() {
        return this.logs.map(log => {
            const time = log.timestamp.toISOString();
            const data = log.data ? ` | ${JSON.stringify(log.data)}` : '';
            return `[${time}] [${log.level.toUpperCase()}] ${log.message}${data}`;
        }).join('\n');
    },
    
    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Performance timing helper
     */
    time(label) {
        this._timers = this._timers || {};
        this._timers[label] = performance.now();
    },
    
    timeEnd(label) {
        if (!this._timers || !this._timers[label]) {
            this.warn(`Timer '${label}' not found`);
            return;
        }
        const duration = performance.now() - this._timers[label];
        this.debug(`${label}: ${duration.toFixed(2)}ms`);
        delete this._timers[label];
        return duration;
    },
    
    /**
     * Group logs
     */
    group(label) {
        this.addLog('info', `▼ ${label}`);
    },
    
    groupEnd() {
        // Visual separator
    },
};

// Initialize logger immediately
Logger.init();
