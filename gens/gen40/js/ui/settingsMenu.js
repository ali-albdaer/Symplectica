import { Config } from '../core/config.js';
import { State } from '../core/state.js';

export function initSettingsMenu(setFidelity) {
  const root = document.getElementById('settings-menu');
  root.innerHTML = '';

  const title = document.createElement('h3');
  title.textContent = 'Settings';
  root.appendChild(title);

  const fidelityRow = document.createElement('div');
  fidelityRow.className = 'dev-console-row';
  const label = document.createElement('label');
  label.textContent = 'Fidelity';
  fidelityRow.appendChild(label);

  ['Low', 'Medium', 'Ultra'].forEach((level) => {
    const btn = document.createElement('button');
    btn.className = 'ui-button';
    btn.textContent = level;
    btn.addEventListener('click', () => {
      setFidelity(level);
      if (State.renderer) {
        State.renderer.shadowMap.enabled = Config.rendering.enableShadows;
      }
    });
    fidelityRow.appendChild(btn);
  });

  root.appendChild(fidelityRow);
}
