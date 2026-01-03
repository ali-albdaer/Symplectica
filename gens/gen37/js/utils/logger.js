/**
 * Logger - Centralized logging system with on-screen debug display
 * Captures all logs and errors for debugging during loading and runtime
 */

const Logger = (function() {
    'use strict';
    
    const logs = [];
    const MAX_LOGS = 500;
    const listeners = [];
    
    // Log levels
    const LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };
    
    let currentLevel = LEVELS.DEBUG;
    let initialized = false;
    
    /**
     * Format timestamp for display
     */
    function formatTime(date) {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        const ms = date.getMilliseconds().toString().padStart(3, '0');
        return `${h}:${m}:${s}.${ms}`;
    }
    
    /**
     * Create a log entry
     */
    function createEntry(level, module, message, data) {
        const entry = {
            timestamp: new Date(),
            level: level,
            module: module,
            message: message,
            data: data
        };
        
        logs.push(entry);
        
        // Trim old logs
        if (logs.length > MAX_LOGS) {
            logs.shift();
        }
        
        // Notify listeners
        listeners.forEach(fn => fn(entry));
        
        // Also log to browser console
        const consoleFn = level === 'error' ? console.error :
                         level === 'warn' ? console.warn :
                         level === 'info' ? console.info : console.log;
        
        const prefix = `[${formatTime(entry.timestamp)}] [${module}]`;
        if (data !== undefined) {
            consoleFn(prefix, message, data);
        } else {
            consoleFn(prefix, message);
        }
        
        // Update loading screen debug log if visible
        updateLoadingDebugLog(entry);
        
        return entry;
    }
    
    /**
     * Update the loading screen debug log
     */
    function updateLoadingDebugLog(entry) {
        const loadingLog = document.getElementById('loading-debug-log');
        if (loadingLog && !loadingLog.closest('#loading-screen').classList.contains('hidden')) {
            const div = document.createElement('div');
            div.className = `log-${entry.level}`;
            div.textContent = `[${formatTime(entry.timestamp)}] [${entry.module}] ${entry.message}`;
            loadingLog.appendChild(div);
            loadingLog.scrollTop = loadingLog.scrollHeight;
        }
    }
    
    /**
     * Update the loading status text
     */
    function updateLoadingStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }
    
    /**
     * Update the loading progress bar
     */
    function updateLoadingProgress(percent) {
        const barEl = document.getElementById('loading-bar');
        if (barEl) {
            barEl.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
    }
    
    /**
     * Setup global error handlers
     */
    function setupErrorHandlers() {
        window.onerror = function(message, source, lineno, colno, error) {
            createEntry('error', 'GLOBAL', `${message} at ${source}:${lineno}:${colno}`, error);
            return false;
        };
        
        window.onunhandledrejection = function(event) {
            createEntry('error', 'PROMISE', `Unhandled rejection: ${event.reason}`, event.reason);
        };
    }
    
    // Public API
    return {
        init: function() {
            if (initialized) return;
            setupErrorHandlers();
            initialized = true;
            this.info('Logger', 'Logging system initialized');
        },
        
        debug: function(module, message, data) {
            if (currentLevel <= LEVELS.DEBUG) {
                return createEntry('debug', module, message, data);
            }
        },
        
        info: function(module, message, data) {
            if (currentLevel <= LEVELS.INFO) {
                return createEntry('info', module, message, data);
            }
        },
        
        warn: function(module, message, data) {
            if (currentLevel <= LEVELS.WARN) {
                return createEntry('warn', module, message, data);
            }
        },
        
        error: function(module, message, data) {
            if (currentLevel <= LEVELS.ERROR) {
                return createEntry('error', module, message, data);
            }
        },
        
        setLevel: function(level) {
            if (LEVELS[level] !== undefined) {
                currentLevel = LEVELS[level];
            }
        },
        
        getLogs: function(filterLevel) {
            if (filterLevel) {
                return logs.filter(l => l.level === filterLevel);
            }
            return [...logs];
        },
        
        clearLogs: function() {
            logs.length = 0;
        },
        
        addListener: function(callback) {
            listeners.push(callback);
        },
        
        removeListener: function(callback) {
            const idx = listeners.indexOf(callback);
            if (idx !== -1) {
                listeners.splice(idx, 1);
            }
        },
        
        updateStatus: updateLoadingStatus,
        updateProgress: updateLoadingProgress,
        
        LEVELS: LEVELS
    };
})();

// Initialize immediately
Logger.init();
