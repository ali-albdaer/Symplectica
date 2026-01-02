export function setupDevConsole({ element, config, engine }) {
  if (!element) return;

  function buildUI() {
    element.innerHTML = '';
    const title = document.createElement('h2');
    title.textContent = 'Developer Console (/ to close)';
    element.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'dev-console-grid';
    element.appendChild(grid);

    function addNumberControl(label, obj, key, step, min, max) {
      const l = document.createElement('div');
      l.textContent = label;
      const input = document.createElement('input');
      input.type = 'number';
      input.step = step;
      if (min !== undefined) input.min = String(min);
      if (max !== undefined) input.max = String(max);
      input.value = obj[key];
      input.addEventListener('change', () => {
        const v = parseFloat(input.value);
        if (!Number.isNaN(v)) obj[key] = v;
      });
      grid.appendChild(l);
      grid.appendChild(input);
      const span = document.createElement('div');
      span.textContent = '';
      grid.appendChild(span);
    }

    function addSelectControl(label, obj, key, options) {
      const l = document.createElement('div');
      l.textContent = label;
      const select = document.createElement('select');
      for (const opt of options) {
        const o = document.createElement('option');
        o.value = opt;
        o.textContent = opt;
        if (opt === obj[key]) o.selected = true;
        select.appendChild(o);
      }
      select.addEventListener('change', () => {
        obj[key] = select.value;
      });
      grid.appendChild(l);
      grid.appendChild(select);
      const span = document.createElement('div');
      span.textContent = '';
      grid.appendChild(span);
    }

    addNumberControl('Time Scale', config.time, 'timeScale', '1', 0.1, 200);
    addSelectControl('Fidelity', config.rendering, 'fidelity', ['low', 'medium', 'ultra']);
    addNumberControl('G (scaled)', config.physics, 'G', '1e-11');
    addNumberControl('Damping', config.physics, 'damping', '0.0001', 0.9, 1.0);

    const bodies = config.solarSystem.bodies;
    for (const key of Object.keys(bodies)) {
      const b = bodies[key];
      addNumberControl(`${b.name} Mass`, b, 'mass', '1e20');
      if (b.orbitalRadius) addNumberControl(`${b.name} OrbitR`, b, 'orbitalRadius', '1e8');
    }
  }

  let visible = false;

  function setVisible(v) {
    visible = v;
    element.classList.toggle('hidden', !visible);
    if (visible) {
      document.exitPointerLock();
      document.body.classList.add('pointer-visible');
    }
  }

  buildUI();

  document.addEventListener('keydown', (e) => {
    if (e.key === '/') {
      e.preventDefault();
      setVisible(!visible);
    }
    if (visible && e.key === 'Escape') {
      setVisible(false);
    }
  });
}
