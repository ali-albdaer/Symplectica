import { DevSchema } from '../config/globals.js';

function getByPath(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) cur = cur[p];
  return cur;
}

function setByPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

export function createDevMenu({ Globals, onGlobalsChanged }) {
  const el = document.getElementById('devMenu');
  if (!el) throw new Error('Dev menu element not found');

  let open = false;

  function render() {
    const rows = [];
    rows.push(`<h2>Developer Menu</h2>`);

    rows.push(`<div class="hint">Press '/' to toggle. Changes apply immediately.</div>`);
    rows.push(`<div class="divider"></div>`);

    for (const [path, spec] of Object.entries(DevSchema)) {
      const value = getByPath(Globals, path);
      const id = `dev_${path.replaceAll('.', '_')}`;

      if (spec.type === 'boolean') {
        rows.push(`
          <div class="row">
            <label for="${id}">${path}</label>
            <select id="${id}" data-path="${path}">
              <option value="true" ${value === true ? 'selected' : ''}>true</option>
              <option value="false" ${value === false ? 'selected' : ''}>false</option>
            </select>
          </div>
        `);
      } else if (spec.type === 'enum') {
        rows.push(`
          <div class="row">
            <label for="${id}">${path}</label>
            <select id="${id}" data-path="${path}">
              ${spec.options.map(o => `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`).join('')}
            </select>
          </div>
        `);
      } else {
        rows.push(`
          <div class="row">
            <label for="${id}">${path}</label>
            <input id="${id}" data-path="${path}" type="number" value="${value}" step="${spec.step ?? 'any'}" ${spec.min != null ? `min="${spec.min}"` : ''} ${spec.max != null ? `max="${spec.max}"` : ''} />
          </div>
        `);
      }
    }

    el.innerHTML = rows.join('');

    el.querySelectorAll('input,select').forEach(input => {
      input.addEventListener('input', () => {
        const path = input.dataset.path;
        const spec = DevSchema[path];

        let v;
        if (spec.type === 'boolean') {
          v = input.value === 'true';
        } else if (spec.type === 'enum') {
          v = Number(input.value);
        } else {
          v = Number(input.value);
        }

        if (!Number.isFinite(v) && spec.type !== 'boolean') return;

        setByPath(Globals, path, v);
        onGlobalsChanged?.(path, v);
      });
    });
  }

  function setOpen(next) {
    open = next;
    el.style.display = open ? 'block' : 'none';
    el.setAttribute('aria-hidden', open ? 'false' : 'true');

    // When open, release pointer lock so you can edit.
    if (open) document.exitPointerLock?.();

    if (open) render();
  }

  function toggle() {
    setOpen(!open);
  }

  // initial
  setOpen(false);

  return { toggle, setOpen, isOpen: () => open };
}
