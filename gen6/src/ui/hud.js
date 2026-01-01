import { lerp } from '../utils/math.js';

export function createHud({ Globals }) {
  const el = document.getElementById('hud');
  if (!el) throw new Error('HUD element not found');

  const state = {
    fps: 0,
    frameMs: 0,
    simSteps: 0
  };

  let _lastT = performance.now();

  function tick({ dtMs, player, simSteps }) {
    const now = performance.now();
    const frameMs = now - _lastT;
    _lastT = now;

    // Smooth FPS
    const instantFps = dtMs > 0 ? 1000 / dtMs : 0;
    state.fps = lerp(state.fps || instantFps, instantFps, 0.08);
    state.frameMs = lerp(state.frameMs || frameMs, frameMs, 0.08);
    state.simSteps = simSteps;

    let text = '';

    if (Globals.hud.showMetrics) {
      text += `FPS: ${state.fps.toFixed(1)}  |  frame: ${state.frameMs.toFixed(2)} ms  |  substeps: ${state.simSteps}\n`;
    }

    if (Globals.hud.showCoords && player) {
      const p = player.getPositionAU();
      text += `Player AU: x=${p.x.toFixed(6)} y=${p.y.toFixed(6)} z=${p.z.toFixed(6)}\n`;
      text += `Mode: ${player.getModeLabel()}  |  Camera: ${player.getCameraModeLabel()}\n`;
    }

    el.textContent = text;
  }

  return { tick };
}
