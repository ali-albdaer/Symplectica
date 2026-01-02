import { getDefaults } from '../sim/config.js';

export function createDevMenu({ rootEl, contentEl, resetBtn, closeBtn, onOpenChanged, getConfig, onReset }) {
  const state = {
    open: false,
    rows: []
  };

  function setOpen(open) {
    state.open = !!open;
    rootEl?.classList.toggle('hidden', !state.open);
    onOpenChanged?.(state.open);
  }

  function toggle() {
    setOpen(!state.open);
  }

  function build() {
    if (!contentEl) return;
    contentEl.textContent = '';
    state.rows = [];

    const cfg = getConfig();
    const defaults = getDefaults();

    const flat = flattenConfig(cfg);
    const flatDefaults = flattenConfig(defaults);

    for (const key of Object.keys(flat).sort()) {
      const { value, unit } = flat[key];
      const defaultValue = flatDefaults[key]?.value;

      if (typeof value === 'object') continue;
      if (typeof value === 'function') continue;

      const rowEl = document.createElement('div');
      rowEl.className = 'devRow';

      const keyEl = document.createElement('div');
      keyEl.className = 'devKey';
      keyEl.textContent = key;

      const inputEl = document.createElement('input');
      inputEl.className = 'devVal';
      inputEl.value = String(value);

      const unitEl = document.createElement('div');
      unitEl.className = 'devUnit';
      unitEl.textContent = unit ?? '';

      inputEl.addEventListener('change', () => {
        const raw = inputEl.value;
        const parsed = parseValue(raw, value);
        setByPath(cfg, key.split('.'), parsed);
      });

      inputEl.addEventListener('keydown', (e) => {
        e.stopPropagation();
      });

      if (defaultValue !== undefined && defaultValue !== value) {
        inputEl.style.borderColor = 'rgba(255,255,255,0.22)';
      }

      rowEl.appendChild(keyEl);
      rowEl.appendChild(inputEl);
      rowEl.appendChild(unitEl);

      contentEl.appendChild(rowEl);
      state.rows.push({ key, inputEl });
    }

    resetBtn?.addEventListener('click', () => {
      onReset?.();
      build();
    });

    closeBtn?.addEventListener('click', () => setOpen(false));
  }

  return { build, toggle, setOpen };
}

function parseValue(raw, original) {
  if (typeof original === 'number') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : original;
  }
  if (typeof original === 'boolean') {
    return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
  }
  return raw;
}

function setByPath(obj, path, value) {
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i]];
    if (!cur) return;
  }
  cur[path[path.length - 1]] = value;
}

function flattenConfig(obj) {
  const out = {};
  walk(obj, [], out);
  return out;
}

function walk(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const path = [...prefix, k];
    const key = path.join('.');

    if (v && typeof v === 'object' && !Array.isArray(v)) {
      walk(v, path, out);
      continue;
    }

    out[key] = {
      value: v,
      unit: guessUnit(key)
    };
  }
}

function guessUnit(key) {
  if (key.endsWith('massKg')) return 'kg';
  if (key.endsWith('radiusMeters')) return 'm';
  if (key.endsWith('distanceFromSunMeters')) return 'm';
  if (key.endsWith('distanceFromPlanetMeters')) return 'm';
  if (key.endsWith('softeningMeters')) return 'm';
  if (key.includes('Speed')) return 'm/s';
  if (key.endsWith('G')) return 'm^3 kg^-1 s^-2';
  if (key.endsWith('luminosityWatts')) return 'W';
  if (key.endsWith('fovDeg')) return 'deg';
  return '';
}
