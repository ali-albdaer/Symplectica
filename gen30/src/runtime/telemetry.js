export function createTelemetry(el) {
  const state = {
    enabled: false,
    lastT: performance.now(),
    frames: 0,
    fps: 0,
    frameMs: 0,
    text: '',
  };

  function setEnabled(on) {
    state.enabled = on;
    el.classList.toggle('hidden', !on);
  }

  function toggle() {
    setEnabled(!state.enabled);
  }

  function update({ dt, playerPos, cameraPos }) {
    if (!state.enabled) return;

    const now = performance.now();
    state.frames++;
    state.frameMs = dt * 1000;

    if (now - state.lastT >= 250) {
      state.fps = (state.frames * 1000) / (now - state.lastT);
      state.frames = 0;
      state.lastT = now;
    }

    const fmt = (v) => (Number.isFinite(v) ? v.toFixed(2) : 'n/a');
    state.text = [
      `FPS: ${state.fps.toFixed(1)}`,
      `Frame: ${state.frameMs.toFixed(2)} ms`,
      `Player: (${fmt(playerPos.x)}, ${fmt(playerPos.y)}, ${fmt(playerPos.z)})`,
      `Camera: (${fmt(cameraPos.x)}, ${fmt(cameraPos.y)}, ${fmt(cameraPos.z)})`,
    ].join('<br/>');

    el.innerHTML = state.text;
  }

  return { setEnabled, toggle, update, get enabled() { return state.enabled; } };
}
