// Telemetry overlay: FPS, frame time, coordinates

import { Config } from "../core/config.js";

const telemetryEl = document.getElementById("telemetryOverlay");

export function setupTelemetry({ playerBody, camera }) {
  let accum = 0;
  let frames = 0;
  let lastFps = 0;

  window.addEventListener("keydown", (e) => {
    if (e.key === "F3" || e.key === "f3") {
      Config.ui.telemetryVisible = !Config.ui.telemetryVisible;
      telemetryEl.style.display = Config.ui.telemetryVisible ? "block" : "none";
    }
  });

  telemetryEl.style.display = Config.ui.telemetryVisible ? "block" : "none";

  function update(dt) {
    if (!Config.ui.telemetryVisible) return;
    accum += dt;
    frames++;
    if (accum >= 0.5) {
      lastFps = frames / accum;
      accum = 0;
      frames = 0;
    }

    const pos = playerBody.position;
    const camPos = camera.position;

    telemetryEl.textContent = `FPS: ${lastFps.toFixed(1)} | Player: (${pos.x.toFixed(
      1
    )}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}) | Camera: (${camPos.x.toFixed(1)}, ${camPos.y.toFixed(
      1
    )}, ${camPos.z.toFixed(1)})`;
  }

  return { update };
}
