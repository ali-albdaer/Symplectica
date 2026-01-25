/**
 * DebugLogger.js
 * Centralized logging system with categories, levels, and performance tracking.
 * Helps debug issues without getting stuck in loading screens.
 */

// Log levels
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4,
};

class LogEntry {
    constructor(level, category, message, data, timestamp) {
        this.level = level;
        this.category = category;
        this.message = message;
        this.data = data;
        this.timestamp = timestamp;
    }
}

class DebugLoggerSystem {
    constructor() {
        this.currentLevel = LogLevel.INFO;
        this.logs = [];
        this.maxLogs = 1000;
        this.categories = new Map();
        this.listeners = [];
        this.startTime = performance.now();
        
        // Performance markers
        this.markers = new Map();
    }

    setLevel(level) {
        this.currentLevel = level;
    }

    enableCategory(category, enabled = true) {
        this.categories.set(category, enabled);
    }

    isCategoryEnabled(category) {
        return this.categories.get(category) !== false;
    }

    log(level, category, message, data = null) {
        if (level < this.currentLevel) return;
        if (!this.isCategoryEnabled(category)) return;

        const timestamp = performance.now() - this.startTime;
        const entry = new LogEntry(level, category, message, data, timestamp);
        
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with styling
        const timeStr = (timestamp / 1000).toFixed(3);
        const prefix = `[${timeStr}s] [${category}]`;
        
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`%c${prefix} ${message}`, 'color: #888', data || '');
                break;
            case LogLevel.INFO:
                console.info(`%c${prefix} ${message}`, 'color: #4a9eff', data || '');
                break;
            case LogLevel.WARN:
                console.warn(`${prefix} ${message}`, data || '');
                break;
            case LogLevel.ERROR:
                console.error(`${prefix} ${message}`, data || '');
                break;
        }

        // Notify listeners (for UI display)
        this.listeners.forEach(cb => cb(entry));
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        const idx = this.listeners.indexOf(callback);
        if (idx !== -1) this.listeners.splice(idx, 1);
    }

    // Performance timing
    mark(name) {
        this.markers.set(name, performance.now());
    }

    measure(name, startMark) {
        const endTime = performance.now();
        const startTime = this.markers.get(startMark) || this.startTime;
        const duration = endTime - startTime;
        
        this.log(LogLevel.DEBUG, 'Performance', `${name}: ${duration.toFixed(2)}ms`);
        return duration;
    }

    // Get logs for display
    getLogs(minLevel = LogLevel.DEBUG, category = null, count = 100) {
        return this.logs
            .filter(log => log.level >= minLevel && (!category || log.category === category))
            .slice(-count);
    }

    // Clear logs
    clear() {
        this.logs = [];
    }

    // Export logs
    export() {
        return JSON.stringify(this.logs, null, 2);
    }
}

// Global logger instance
export const loggerSystem = new DebugLoggerSystem();

/**
 * Category-specific logger for modules
 */
export class DebugLogger {
    constructor(category) {
        this.category = category;
        loggerSystem.enableCategory(category, true);
    }

    debug(message, data = null) {
        loggerSystem.log(LogLevel.DEBUG, this.category, message, data);
    }

    info(message, data = null) {
        loggerSystem.log(LogLevel.INFO, this.category, message, data);
    }

    warn(message, data = null) {
        loggerSystem.log(LogLevel.WARN, this.category, message, data);
    }

    error(message, data = null) {
        loggerSystem.log(LogLevel.ERROR, this.category, message, data);
    }

    mark(name) {
        loggerSystem.mark(`${this.category}:${name}`);
    }

    measure(name, startMark) {
        return loggerSystem.measure(name, `${this.category}:${startMark}`);
    }
}

// Loading state tracker to prevent stuck loading screens
export class LoadingTracker {
    constructor() {
        this.tasks = new Map();
        this.logger = new DebugLogger('Loading');
        this.onProgress = null;
        this.onComplete = null;
        this.onError = null;
    }

    startTask(id, description, timeout = 30000) {
        this.tasks.set(id, {
            description,
            startTime: performance.now(),
            timeout,
            completed: false,
            error: null,
        });

        this.logger.info(`Starting: ${description}`);

        // Set timeout to detect stuck tasks
        setTimeout(() => {
            const task = this.tasks.get(id);
            if (task && !task.completed) {
                const elapsed = ((performance.now() - task.startTime) / 1000).toFixed(1);
                this.logger.warn(`Task may be stuck: ${description} (${elapsed}s elapsed)`);
                
                if (this.onError) {
                    this.onError(id, `Task timeout: ${description}`);
                }
            }
        }, timeout);

        this.updateProgress();
    }

    completeTask(id, success = true, error = null) {
        const task = this.tasks.get(id);
        if (task) {
            task.completed = true;
            task.success = success;
            task.error = error;
            
            const elapsed = ((performance.now() - task.startTime) / 1000).toFixed(2);
            
            if (success) {
                this.logger.info(`Completed: ${task.description} (${elapsed}s)`);
            } else {
                this.logger.error(`Failed: ${task.description} - ${error}`);
            }
        }

        this.updateProgress();
    }

    updateProgress() {
        const total = this.tasks.size;
        const completed = [...this.tasks.values()].filter(t => t.completed).length;
        
        if (this.onProgress) {
            this.onProgress(completed, total, this.getCurrentTask());
        }

        if (completed === total && total > 0 && this.onComplete) {
            this.onComplete();
        }
    }

    getCurrentTask() {
        for (const [id, task] of this.tasks) {
            if (!task.completed) {
                return task.description;
            }
        }
        return null;
    }

    getStatus() {
        const tasks = [];
        for (const [id, task] of this.tasks) {
            tasks.push({
                id,
                ...task,
                elapsed: performance.now() - task.startTime,
            });
        }
        return tasks;
    }

    reset() {
        this.tasks.clear();
    }
}

// Global loading tracker
export const loadingTracker = new LoadingTracker();
