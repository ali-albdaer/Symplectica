import { config, updateFidelity } from './config.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

export class UIOverlay {
  constructor() {
    this.overlay = document.getElementById('overlay');
    this.debugLog = document.getElementById('debug-log');
    this.debugEntries = document.getElementById('debug-log-entries');
    this.logBuffer = [];
  }

  update({ fps, frameTimeMs, position, velocity, fidelity }) {
    if (!config.debug.showOverlay) {
      this.overlay.style.display = 'none';
      return;
    }
    this.overlay.style.display = 'block';
    this.overlay.innerHTML = [
      `FPS: ${fps.toFixed(1)}`,
      `Frame: ${frameTimeMs.toFixed(2)} ms`,
      `Coords: (${position.x.toFixed(0)}, ${position.y.toFixed(0)}, ${position.z.toFixed(0)})`,
      `Speed: ${(velocity.length()).toFixed(1)} m/s`,
      `Fidelity: ${fidelity}`,
      `Controls: WASD move, Space jump/up, Shift down (flight), F free-flight, V camera, / DevGUI, Right-click grab`
    ].join('<br/>');
  }

  log(msg) {
    if (!config.debug.showDebugLog) return;
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'entry';
    entry.textContent = `[${time}] ${msg}`;
    this.debugEntries.appendChild(entry);
    this.debugEntries.scrollTop = this.debugEntries.scrollHeight;
    this.logBuffer.push(msg);
    if (this.logBuffer.length > 200) {
      this.logBuffer.shift();
      this.debugEntries.removeChild(this.debugEntries.firstChild);
    }
  }
}

export function createDevConsole({ onReinit, onFidelityChange, onToggleFreeze }) {
  const container = document.getElementById('dev-console');
  const gui = new GUI({ container });
  gui.title('Developer Console');

  const sceneFolder = gui.addFolder('Scene');
  sceneFolder.add(config, 'timeScale', 100, 20000, 100).name('Time Scale (s/s)');
  sceneFolder.add(config, 'softeningLength', 1e5, 1e7, 1e5).name('Softening');
  sceneFolder.add(config, 'lodEnabled').name('Enable LOD');
  sceneFolder.add(config, 'enableShadows').name('Shadows');

  const fidelityCtrl = sceneFolder.add({ fidelity: config.fidelity }, 'fidelity', ['Low', 'Medium', 'Ultra']).name('Fidelity');
  fidelityCtrl.onChange(v => {
    updateFidelity(v);
    if (onFidelityChange) onFidelityChange(v);
  });

  const bodiesFolder = gui.addFolder('Bodies');
  addBodyControls(bodiesFolder, 'Sun', config.sun);
  addBodyControls(bodiesFolder, 'Planet A', config.planetA);
  addBodyControls(bodiesFolder, 'Planet B', config.planetB);
  addBodyControls(bodiesFolder, 'Moon', config.moon);

  const actionsFolder = gui.addFolder('Actions');
  actionsFolder.add({ reinit: () => onReinit && onReinit() }, 'reinit').name('Reinitialize Orbits');
  actionsFolder.add({ freeze: () => onToggleFreeze && onToggleFreeze() }, 'freeze').name('Toggle Freeze');

  return gui;
}

function addBodyControls(folder, label, target) {
  const f = folder.addFolder(label);
  f.add(target, 'mass', target.mass * 0.2, target.mass * 5, target.mass * 0.01).name('Mass');
  f.add(target, 'radius', target.radius * 0.5, target.radius * 2, target.radius * 0.01).name('Radius');
  if (target.semiMajorAxis) f.add(target, 'semiMajorAxis', target.semiMajorAxis * 0.5, target.semiMajorAxis * 2, target.semiMajorAxis * 0.01).name('Orbit Radius');
  if (target.eccentricity !== undefined) f.add(target, 'eccentricity', 0, 0.6, 0.001).name('Eccentricity');
}
