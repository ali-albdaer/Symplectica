const LEVELS = ["error", "warn", "info", "debug"];

export class Logger {
    constructor({ level = "info", sink = () => {} } = {}) {
        this.level = level;
        this.sink = sink;
        this.entries = [];
        this.maxEntries = 200;
    }

    setLevel(level) {
        if (!LEVELS.includes(level)) {
            throw new Error(`Unknown log level ${level}`);
        }
        this.level = level;
    }

    log(level, message, context = null) {
        if (LEVELS.indexOf(level) > LEVELS.indexOf(this.level)) {
            return;
        }
        const entry = {
            timestamp: performance.now(),
            level,
            message,
            context
        };
        this.entries.push(entry);
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
        this.sink(entry);
        const formatted = `[${level.toUpperCase()}] ${message}`;
        if (context) {
            console[level === "debug" ? "log" : level]?.(formatted, context);
        } else {
            console[level === "debug" ? "log" : level]?.(formatted);
        }
    }

    error(message, context) {
        this.log("error", message, context);
    }

    warn(message, context) {
        this.log("warn", message, context);
    }

    info(message, context) {
        this.log("info", message, context);
    }

    debug(message, context) {
        this.log("debug", message, context);
    }

    getRecentEntries(count = 50) {
        return this.entries.slice(-count);
    }
}
