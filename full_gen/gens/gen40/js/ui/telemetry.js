import { Config } from '../core/config.js';
import { State } from '../core/state.js';

let lastUpdate = performance.now();
let frameCount = 0;
let fps = 0;
let frameTimeMs = 0;

export function initTelemetry() {
  const el = document.getElementById('telemetry');
  State.ui.telemetry = {
    el,
    update
  };
}

function update(dt) {
  if (!Config.debug.telemetryEnabled) return;
  const now = performance.now();
  frameCount++;
  if (now - lastUpdate >= 500) {
    fps = (frameCount * 1000) / (now - lastUpdate);
    frameTimeMs = 1000 / (fps || 1);
    frameCount = 0;
    lastUpdate = now;
  }

  const pos = State.player && State.player.body ? State.player.body.position : null;
  const coords = pos ? `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}` : 'n/a';

  this.el.textContent = `FPS: ${fps.toFixed(1)}\nFrame: ${frameTimeMs.toFixed(1)} ms\nCoords: ${coords}`;
}
