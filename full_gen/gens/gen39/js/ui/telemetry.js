export function setupTelemetry({ element, engine }) {
  let frameCount = 0;
  let timeAccum = 0;
  let fps = 0;

  function update(dt) {
    if (!element) return;
    frameCount++;
    timeAccum += dt;
    if (timeAccum >= 0.5) {
      fps = frameCount / timeAccum;
      frameCount = 0;
      timeAccum = 0;
    }

    const cam = engine.camera;
    const p = cam.position;
    element.textContent =
      `FPS: ${fps.toFixed(1)}\n` +
      `dt: ${(dt * 1000).toFixed(1)} ms\n` +
      `Cam: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}`;

    element.classList.toggle('hidden', !engine.config.telemetry.enabled);
  }

  return { update };
}
