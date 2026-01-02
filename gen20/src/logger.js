const buffer = [];
const maxEntries = 200;
let onUpdate = null;

export function setLoggerCallback(fn) {
  onUpdate = fn;
}

export function logMessage(level, msg) {
  const line = `[${new Date().toISOString()}] [${level}] ${msg}`;
  buffer.push(line);
  if (buffer.length > maxEntries) buffer.shift();
  if (onUpdate) onUpdate(buffer.slice());
  console[level === "error" ? "error" : "log"](line);
}

export function logInfo(msg) { logMessage("info", msg); }
export function logWarn(msg) { logMessage("warn", msg); }
export function logError(msg) { logMessage("error", msg); }

export function getLogs() { return buffer.slice(); }
