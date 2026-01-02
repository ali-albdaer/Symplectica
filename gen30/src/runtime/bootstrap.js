import { DebugLog } from './debugLog.js';
import { createTelemetry } from './telemetry.js';
import { Input } from './input.js';
import { createRenderer } from './renderer.js';
import { createWorld } from '../world/world.js';

export async function bootstrap() {
  const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('canvas'));
  const debugEl = document.getElementById('debugLog');
  const telemetryEl = document.getElementById('telemetry');
  const devMenuEl = document.getElementById('devMenu');

  const debugLog = new DebugLog(debugEl);
  debugLog.installGlobalHandlers();

  const telemetry = createTelemetry(telemetryEl);
  const input = new Input(canvas);

  const { renderer, scene, camera, onResize, setFidelity } = createRenderer(canvas);

  const world = await createWorld({
    scene,
    camera,
    renderer,
    input,
    debugLog,
    telemetry,
    devMenuEl,
    setFidelity,
  });

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    onResize(w, h);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    world.update(dt, now / 1000);
    renderer.render(scene, camera);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
