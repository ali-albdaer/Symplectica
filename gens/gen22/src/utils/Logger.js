const logs = [];
let logPanel = null;

export function initLogger(panelElement) {
    logPanel = panelElement;
    flush();
}

export function logInfo(message) {
    pushLog("info", message);
}

export function logWarn(message) {
    pushLog("warn", message);
}

export function logError(message) {
    pushLog("error", message);
}

export function clearLogs() {
    logs.length = 0;
    flush();
}

function pushLog(level, message) {
    const entry = {
        timestamp: performance.now(),
        level,
        message
    };
    logs.push(entry);
    if (logs.length > 200) {
        logs.shift();
    }
    flush();
    if (level === "error") {
        console.error(message);
    } else if (level === "warn") {
        console.warn(message);
    } else {
        console.log(message);
    }
}

function flush() {
    if (!logPanel) {
        return;
    }
    const lines = logs.map((entry) => {
        const time = (entry.timestamp / 1000).toFixed(2);
        return `[${time}s][${entry.level.toUpperCase()}] ${entry.message}`;
    });
    logPanel.textContent = lines.join("\n");
}
