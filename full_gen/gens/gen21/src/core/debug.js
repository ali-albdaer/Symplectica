// Centralized debug log and on-screen error reporting

const debugOverlay = document.getElementById("debugOverlay");

class DebugLogger {
  constructor() {
    this.lines = [];
    this.visible = false;
  }

  log(message) {
    console.log(message);
    this.append("INFO", message);
  }

  warn(message) {
    console.warn(message);
    this.append("WARN", message);
  }

  error(message) {
    console.error(message);
    this.append("ERROR", message);
    this.show();
  }

  append(level, message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level}] ${message}`;
    this.lines.push(line);
    if (this.lines.length > 200) this.lines.shift();
    if (this.visible && debugOverlay) {
      debugOverlay.textContent = this.lines.join("\n");
    }
  }

  show() {
    this.visible = true;
    if (debugOverlay) {
      debugOverlay.style.display = "block";
      debugOverlay.textContent = this.lines.join("\n");
    }
  }

  hide() {
    this.visible = false;
    if (debugOverlay) {
      debugOverlay.style.display = "none";
    }
  }
}

export const Debug = new DebugLogger();

// Global error handler so load failures are visible in-scene
window.addEventListener("error", (ev) => {
  Debug.error(`Uncaught error: ${ev.message} @ ${ev.filename}:${ev.lineno}`);
});

window.addEventListener("unhandledrejection", (ev) => {
  Debug.error(`Unhandled promise rejection: ${ev.reason}`);
});
