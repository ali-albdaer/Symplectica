import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function initDevConsole() {
  const root = document.getElementById('dev-console');
  root.innerHTML = '';

  const physicsSection = document.createElement('div');
  physicsSection.className = 'dev-console-section';
  physicsSection.appendChild(makeHeader('Physics'));
  physicsSection.appendChild(makeNumberRow('G', Config.physics.G, (v) => (Config.physics.G = v)));
  physicsSection.appendChild(makeNumberRow('TimeScale', Config.physics.timeScale, (v) => (Config.physics.timeScale = v)));

  const bodiesSection = document.createElement('div');
  bodiesSection.className = 'dev-console-section';
  bodiesSection.appendChild(makeHeader('Bodies (mass)'));
  for (const key of Object.keys(Config.bodies)) {
    const body = Config.bodies[key];
    bodiesSection.appendChild(
      makeNumberRow(body.name || key, body.mass, (v) => {
        body.mass = v;
        const entry = State.celestialBodies.find((b) => b.config === body);
        if (entry) entry.body.mass = v;
      })
    );
  }

  root.appendChild(physicsSection);
  root.appendChild(bodiesSection);
}

function makeHeader(title) {
  const h = document.createElement('h3');
  h.textContent = title;
  return h;
}

function makeNumberRow(labelText, value, onChange) {
  const row = document.createElement('div');
  row.className = 'dev-console-row';
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'number';
  input.step = 'any';
  input.value = value;
  input.addEventListener('change', () => {
    const v = parseFloat(input.value);
    if (!isNaN(v)) onChange(v);
  });
  row.appendChild(label);
  row.appendChild(input);
  return row;
}
