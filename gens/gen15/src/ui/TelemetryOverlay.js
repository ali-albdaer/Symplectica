export class TelemetryOverlay {
  constructor({ mountId = "telemetry" }) {
    this.mount = document.getElementById(mountId);
    this.visible = false;
    this.samples = [];
  }

  toggle() {
    this.visible = !this.visible;
    if (this.mount) {
      this.mount.style.display = this.visible ? "block" : "none";
    }
  }

  update({ delta, position }) {
    if (!this.visible || !this.mount) return;
    const frameTime = delta * 1000;
    const fps = 1000 / Math.max(frameTime, 0.001);
    this.samples.push({ fps, frameTime });
    if (this.samples.length > 20) {
      this.samples.shift();
    }
    const avg = this.samples.reduce(
      (acc, sample) => {
        acc.fps += sample.fps;
        acc.frameTime += sample.frameTime;
        return acc;
      },
      { fps: 0, frameTime: 0 }
    );
    const len = this.samples.length;
    const avgFps = avg.fps / len;
    const avgFrame = avg.frameTime / len;
    this.mount.innerHTML = `
      <div><strong>FPS</strong>: ${avgFps.toFixed(1)}</div>
      <div><strong>Frame</strong>: ${avgFrame.toFixed(2)} ms</div>
      <div><strong>World</strong>: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})</div>
    `;
  }
}
