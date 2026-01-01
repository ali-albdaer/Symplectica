export class Logger {
  constructor({ mountId = "debug-log", maxEntries = 40 } = {}) {
    this.entries = [];
    this.maxEntries = maxEntries;
    this.mount = document.getElementById(mountId);
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString().split("T")[1].replace("Z", "");
    const entry = { timestamp, message, level };
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    console[level === "error" ? "error" : "log"](`[${level.toUpperCase()}] ${message}`);
    if (level === "error") {
      this.show();
    }
    this.render();
  }

  show() {
    if (this.mount) {
      this.mount.style.display = "block";
    }
  }

  hide() {
    if (this.mount) {
      this.mount.style.display = "none";
    }
  }

  render() {
    if (!this.mount) return;
    this.mount.innerHTML = this.entries
      .map(({ timestamp, level, message }) => `<div>[${timestamp}] <strong>${level.toUpperCase()}</strong> ${message}</div>`)
      .join("");
  }
}
