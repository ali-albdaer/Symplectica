import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { Config } from './Config.js';

export class UIManager {
  constructor({ rendererDom, telemetryEl, blockerEl, startBtn, camera, debug, engine, player }) {
    this.rendererDom = rendererDom;
    this.telemetryEl = telemetryEl;
    this.blockerEl = blockerEl;
    this.startBtn = startBtn;
    this.camera = camera;
    this.debug = debug;
    this.engine = engine;
    this.player = player;

    this.gui = null;
    this.guiVisible = false;

    this.telemetryVisible = Config.ui.telemetryEnabled;

    this._frames = 0;
    this._accTime = 0;
    this._fps = 0;
    this._ms = 0;

    this._onKeyDown = (e) => this._handleKeyDown(e);
    this._onPointerLockChange = () => this._handlePointerLockChange();
  }

  async init() {
    this.startBtn.addEventListener('click', () => {
      this.requestPointerLock();
    });

    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);

    this._initGui();
    this._updateBlocker();
    this._updateTelemetryVisibility();
  }

  requestPointerLock() {
    if (this.guiVisible) return;
    if (document.pointerLockElement === this.rendererDom) return;
    this.rendererDom.requestPointerLock?.();
  }

  exitPointerLock() {
    if (document.pointerLockElement) document.exitPointerLock?.();
  }

  setGuiVisible(visible) {
    this.guiVisible = visible;
    if (this.gui) this.gui.domElement.style.display = visible ? 'block' : 'none';

    if (visible) this.exitPointerLock();
    this._updateBlocker();
  }

  toggleGui() {
    this.setGuiVisible(!this.guiVisible);
  }

  toggleTelemetry() {
    this.telemetryVisible = !this.telemetryVisible;
    this._updateTelemetryVisibility();
  }

  postRender(dtReal) {
    // Telemetry update at ~10Hz
    this._frames++;
    this._accTime += dtReal;
    if (this._accTime >= 0.1) {
      this._fps = Math.round(this._frames / this._accTime);
      this._ms = Math.round((this._accTime / Math.max(1, this._frames)) * 1000);
      this._frames = 0;
      this._accTime = 0;

      if (this.telemetryVisible) {
        const p = this.player.getPosition();
        this.telemetryEl.textContent =
          `FPS: ${this._fps}\n` +
          `Frame: ${this._ms} ms\n` +
          `Pos: ${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}\n` +
          `Mode: ${this.player.isFlightEnabled() ? 'Flight' : 'Walk'}`;
      }
    }
  }

  _initGui() {
    this.gui = new GUI({ title: 'Dev Console' });
    this.gui.domElement.style.position = 'fixed';
    this.gui.domElement.style.top = '10px';
    this.gui.domElement.style.right = '10px';
    this.gui.domElement.style.zIndex = '30';

    // Start hidden by default
    this.setGuiVisible(false);

    const sim = this.gui.addFolder('Sim');
    sim.add(Config.sim, 'timeScale', 0.05, 5.0, 0.01).onChange(() => this.engine.onConfigChanged());
    sim.add(Config.sim, 'G', 0.0, 5.0, 0.001);
    sim.add(Config.sim, 'softening', 0.0, 5.0, 0.01);
    sim.add(Config.sim, 'fidelity', ['Low', 'Medium', 'Ultra']).onChange(() => this.engine.onConfigChanged());

    const render = this.gui.addFolder('Render');
    render.add(Config.render, 'shadows').onChange(() => this.engine.onConfigChanged());
    render.add(Config.render, 'shadowMapType', ['Basic', 'PCF', 'PCFSoft']).onChange(() => this.engine.onConfigChanged());
    render.add(Config.render, 'exposure', 0.1, 3.0, 0.01).onChange(() => this.engine.onConfigChanged());

    const player = this.gui.addFolder('Player');
    player.add(Config.player.flight, 'speed', 2, 60, 0.1);
    player.add(Config.player.walk, 'speed', 1, 25, 0.1);
    player.add(Config.player.walk, 'jumpSpeed', 1, 20, 0.1);

    this.gui.close();
  }

  _handleKeyDown(e) {
    if (e.code === Config.ui.devConsoleKey) {
      e.preventDefault();
      this.toggleGui();
      return;
    }

    if (e.code === Config.ui.telemetryKey) {
      e.preventDefault();
      this.toggleTelemetry();
      return;
    }

    // Prevent pointer lock request when using GUI shortcuts
    if (this.guiVisible) return;
  }

  _handlePointerLockChange() {
    this._updateBlocker();
  }

  _updateBlocker() {
    const locked = document.pointerLockElement === this.rendererDom;
    const show = !locked && !this.guiVisible;
    this.blockerEl.style.display = show ? 'grid' : 'none';
  }

  _updateTelemetryVisibility() {
    this.telemetryEl.style.display = this.telemetryVisible ? 'block' : 'none';
  }
}
