import { formatVec3 } from '../util/format.js';

export function createTelemetry(el) {
  const state = {
    enabled: false
  };

  function setEnabled(enabled) {
    state.enabled = !!enabled;
    el?.classList.toggle('hidden', !state.enabled);
  }

  function toggle() {
    setEnabled(!state.enabled);
  }

  function update({ fps, frameMs, playerPos, playerVel, activeBodyName }) {
    if (!state.enabled || !el) return;

    el.textContent = [
      `FPS: ${fps.toFixed(1)}`,
      `Frame: ${frameMs.toFixed(2)} ms`,
      `Body: ${activeBodyName ?? '—'}`,
      `Pos: ${formatVec3(playerPos)}`,
      `Vel: ${formatVec3(playerVel)}`
    ].join('\n');
  }

  return { setEnabled, toggle, update };
}
