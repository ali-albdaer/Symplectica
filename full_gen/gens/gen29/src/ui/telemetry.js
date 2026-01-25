export class TelemetryOverlay {
  constructor(el) {
    this.el = el;
    this._acc = 0;
    this._frames = 0;
    this._fps = 0;
    this._ms = 0;

    this._world = null;
    this._player = null;
    this._configStore = null;

    this.setVisible(false);
  }

  bind({ configStore, world, player }) {
    this._configStore = configStore;
    this._world = world;
    this._player = player;
  }

  setVisible(v) {
    if (!this.el) return;
    this.el.classList.toggle('hidden', !v);
  }

  update(realDt, physicsSteps) {
    if (!this.el || !this._configStore) return;
    if (!this._configStore.get('debug.showTelemetry')) return;

    this._acc += realDt;
    this._frames += 1;
    this._ms = realDt * 1000;

    if (this._acc >= 0.5) {
      this._fps = this._frames / this._acc;
      this._frames = 0;
      this._acc = 0;
    }

    const p = this._player?.body?.position;
    const pos = p ? `${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)}` : '—';

    const E = this._world?.totalEnergy?.();
    const Et = E ? E.total.toFixed(6) : '—';

    this.el.textContent =
      `FPS: ${this._fps.toFixed(1)}\n` +
      `Frame: ${this._ms.toFixed(2)} ms\n` +
      `Physics steps: ${physicsSteps}\n` +
      `Player pos: ${pos}\n` +
      `Total energy: ${Et}`;
  }
}
