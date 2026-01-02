import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm";

export class UI {
  constructor(config) {
    this.hud = document.getElementById("hud");
    this.hudText = document.getElementById("hud-text");
    this.telemetry = document.getElementById("telemetry");
    this.logEl = document.getElementById("log");
    this.crosshair = document.getElementById("crosshair");
    this.menu = document.getElementById("menu");
    this.fidelitySelect = document.getElementById("fidelity-select");
    this.devPanelContainer = document.getElementById("dev-panel-container");
    this.gui = new GUI({ autoPlace: false, width: 320 });
    this.devPanelContainer.appendChild(this.gui.domElement);
    this.gui.domElement.style.display = "none";
    this.logs = [];
    this.config = config;
    this.telemetryVisible = config.debug.showTelemetry;
    this.hudVisible = config.debug.showHud;
    this.logVisible = config.debug.showLog;
  }

  setupFidelityOptions(presets, onChange) {
    this.fidelitySelect.innerHTML = "";
    Object.keys(presets).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      this.fidelitySelect.appendChild(option);
    });
    this.fidelitySelect.addEventListener("change", () => onChange(this.fidelitySelect.value));
  }

  setFidelitySelection(name) {
    this.fidelitySelect.value = name;
  }

  toggleMenu(show) {
    this.menu.style.display = show ? "block" : "none";
  }

  toggleCrosshair(show) {
    this.crosshair.style.display = show ? "block" : "none";
  }

  toggleHUD(show) {
    this.hudVisible = show;
    this.hud.style.display = show ? "block" : "none";
  }

  toggleTelemetry(show) {
    this.telemetryVisible = show;
    this.telemetry.style.display = show ? "block" : "none";
  }

  toggleLog(show) {
    this.logVisible = show;
    this.logEl.style.display = show ? "block" : "none";
  }

  updateHUD(text) {
    if (!this.hudVisible) return;
    this.hudText.innerHTML = text;
  }

  updateTelemetry({ fps, frameTime, position }) {
    if (!this.telemetryVisible) return;
    this.telemetry.innerHTML = `FPS: ${fps.toFixed(1)}<br>Frame: ${(frameTime * 1000).toFixed(2)} ms<br>Pos: ${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}`;
  }

  log(message, type = "info") {
    const entry = `${new Date().toLocaleTimeString()} [${type.toUpperCase()}] ${message}`;
    this.logs.push(entry);
    if (this.logs.length > 50) this.logs.shift();
    if (this.logVisible) {
      this.logEl.style.display = "block";
      this.logEl.innerHTML = this.logs.slice(-20).map((l) => `<div>${l}</div>`).join("");
    }
    console[type === "error" ? "error" : "log"](message);
  }

  attachDevConsole(controllersFactory) {
    this.gui.domElement.style.display = "block";
    this.gui.destroy();
    this.gui = controllersFactory();
    this.gui.domElement.style.display = "none";
    this.devPanelContainer.innerHTML = "";
    this.devPanelContainer.appendChild(this.gui.domElement);
  }

  showDevConsole(show) {
    this.devPanelContainer.style.display = show ? "block" : "none";
    this.gui.domElement.style.display = show ? "block" : "none";
  }
}

export function wireGlobalError(ui) {
  window.addEventListener("error", (ev) => {
    ui.log(`Uncaught error: ${ev.message}`, "error");
  });
  window.addEventListener("unhandledrejection", (ev) => {
    ui.log(`Unhandled promise rejection: ${ev.reason}`, "error");
  });
}
