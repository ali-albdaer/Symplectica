import { Config, updateConfig } from "./config.js";
import { setLoggerCallback } from "./logger.js";

export function initUI() {
  const telemetry = document.getElementById("telemetry");
  const debugLog = document.getElementById("debug-log");
  const devConsole = document.getElementById("dev-console");

  setLoggerCallback((lines) => {
    debugLog.innerHTML = lines.map((l) => `<div>${l}</div>`).join("");
  });

  renderDevConsole(devConsole);

  return {
    setTelemetry: (data) => {
      if (!Config.ui.telemetryVisible) {
        telemetry.style.display = "none";
        return;
      }
      telemetry.style.display = "block";
      telemetry.innerHTML = `FPS: ${data.fps.toFixed(1)}<br>Frame: ${(data.frameTime * 1000).toFixed(2)} ms<br>Pos: ${fmtVec(data.position)}<br>Vel: ${fmtVec(data.velocity)}<br>Gravity: ${fmtVec(data.gravity)}`;
    },
    toggleTelemetry: () => {
      Config.ui.telemetryVisible = !Config.ui.telemetryVisible;
      telemetry.style.display = Config.ui.telemetryVisible ? "block" : "none";
    },
    toggleDebugLog: () => {
      Config.ui.debugLogVisible = !Config.ui.debugLogVisible;
      debugLog.style.display = Config.ui.debugLogVisible ? "block" : "none";
    },
    toggleDevConsole: (show) => {
      const visible = show !== undefined ? show : !Config.ui.devConsoleVisible;
      Config.ui.devConsoleVisible = visible;
      devConsole.style.display = visible ? "block" : "none";
    },
  };
}

function fmtVec(v) {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

function renderDevConsole(container) {
  const bodyControls = Config.bodies
    .map((b, idx) => {
      const adjustable = ["mass", "radius", "semiMajorAxis", "inclination"]
        .filter((key) => b[key] !== undefined)
        .map((key) => inputRow(`bodies.${idx}.${key}`, key, b[key]))
        .join("");
      return `<div style="margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.05);">
        <h3>${b.name}</h3>
        ${adjustable}
      </div>`;
    })
    .join("");

  container.innerHTML = `
    <h3>Developer Console</h3>
    ${inputRow("sim.timeScale", "timeScale", Config.sim.timeScale)}
    ${inputRow("sim.softening", "softening", Config.sim.softening)}
    ${inputRow("sim.fixedTimeStep", "fixedTimeStep", Config.sim.fixedTimeStep)}
    ${selectRow("quality.level", "quality", ["low", "medium", "ultra"], Config.quality.level)}
    ${bodyControls}
  `;

  container.querySelectorAll("input[data-path]").forEach((el) => {
    el.addEventListener("change", (e) => {
      const path = e.target.dataset.path;
      const val = parseFloat(e.target.value);
      if (!Number.isNaN(val)) updateConfig(path, val);
    });
  });
  container.querySelectorAll("select[data-path]").forEach((el) => {
    el.addEventListener("change", (e) => updateConfig(e.target.dataset.path, e.target.value));
  });
}

function inputRow(path, label, value) {
  return `<label>${label}<input data-path="${path}" type="number" step="any" value="${value}"></label>`;
}

function selectRow(path, label, options, current) {
  const opts = options.map((o) => `<option value="${o}" ${o === current ? "selected" : ""}>${o}</option>`).join("");
  return `<label>${label}<select data-path="${path}">${opts}</select></label>`;
}
