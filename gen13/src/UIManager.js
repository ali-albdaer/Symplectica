import { Config } from './Config.js';

export class UIManager {
  constructor() {
    this.telemetryEl = document.getElementById('telemetry');
    this.debugEl = document.getElementById('debug-log');
    this.consoleEl = document.getElementById('dev-console');
    this.menuEl = document.getElementById('menu');
    this.resumeBtn = document.getElementById('resume-btn');
    this.fidelityBtn = document.getElementById('toggle-fidelity');

    this.debugVisible = false;
    this.consoleVisible = false;
    this.menuVisible = false;
    this.lines = [];

    this._buildConsole();
  }

  _buildConsole() {
    const frag = document.createDocumentFragment();
    const title = document.createElement('div');
    title.textContent = 'Live Config Tweaks';
    title.style.marginBottom = '8px';
    frag.appendChild(title);

    const addSlider = (label, path, min, max, step) => {
      const wrap = document.createElement('div');
      const lab = document.createElement('label');
      lab.textContent = `${label}: ${this._getPath(path).toFixed(3)}`;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = this._getPath(path);
      input.oninput = () => {
        this._setPath(path, parseFloat(input.value));
        lab.textContent = `${label}: ${parseFloat(input.value).toFixed(3)}`;
      };
      wrap.appendChild(lab);
      wrap.appendChild(input);
      frag.appendChild(wrap);
    };

    addSlider('G (scaled)', ['G'], 1e-4, 2e-2, 1e-4);
    addSlider('Time Scale', ['timeScale'], 0.1, 5, 0.05);
    addSlider('Player Speed', ['player', 'speedWalk'], 2, 25, 0.5);
    addSlider('Flight Speed', ['player', 'speedFlight'], 5, 50, 0.5);

    this.consoleEl.appendChild(frag);
  }

  toggleDebug() {
    this.debugVisible = !this.debugVisible;
    this.debugEl.style.display = this.debugVisible ? 'block' : 'none';
  }

  toggleConsole() {
    this.consoleVisible = !this.consoleVisible;
    this.consoleEl.style.display = this.consoleVisible ? 'block' : 'none';
  }

  toggleMenu(fidelityText) {
    this.menuVisible = !this.menuVisible;
    this.menuEl.style.display = this.menuVisible ? 'block' : 'none';
    this.fidelityBtn.textContent = `Fidelity: ${fidelityText}`;
    return this.menuVisible;
  }

  log(message) {
    const line = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.lines.push(line);
    if (this.lines.length > 50) this.lines.shift();
    this.debugEl.innerText = this.lines.join('\n');
  }

  updateTelemetry({ fps, frameTime, worldPos, playerText }) {
    this.telemetryEl.innerText = `FPS: ${fps.toFixed(1)} | Frame: ${frameTime.toFixed(2)} ms | World: ${worldPos}\n${playerText}`;
  }

  _getPath(path) {
    return path.reduce((obj, key) => obj[key], Config);
  }

  _setPath(path, value) {
    let target = Config;
    for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
    target[path[path.length - 1]] = value;
  }
}
