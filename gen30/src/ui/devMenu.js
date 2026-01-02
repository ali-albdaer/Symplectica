export function createDevMenu({ el, debugLog, getConfig, onToggle, actions }) {
  const state = { open: false };

  function isOpen() { return state.open; }

  function toggle() {
    setOpen(!state.open);
  }

  async function setOpen(open) {
    state.open = open;
    el.classList.toggle('hidden', !open);
    el.setAttribute('aria-hidden', String(!open));

    if (open) render();
    await onToggle?.(open);
  }

  function render() {
    const cfg = getConfig();

    el.innerHTML = `
      <h3>Developer Menu</h3>
      <div class="row">
        <label>Time Scale</label>
        <input id="ts" type="number" step="1" value="${cfg.sim.timeScale}" />
      </div>
      <div class="row">
        <label>Fixed Dt (s)</label>
        <input id="fd" type="number" step="0.001" value="${cfg.sim.fixedDt}" />
      </div>
      <div class="row">
        <label>Fidelity</label>
        <select id="fid">
          <option value="0" ${cfg.render.fidelity === 0 ? 'selected' : ''}>Low</option>
          <option value="1" ${cfg.render.fidelity === 1 ? 'selected' : ''}>Medium</option>
          <option value="2" ${cfg.render.fidelity === 2 ? 'selected' : ''}>Ultra</option>
        </select>
      </div>

      <h3 style="margin-top:12px">System</h3>
      <div class="row">
        <label>Planet 1 Orbit Radius (m)</label>
        <input id="p1r" type="number" step="1000" value="${cfg.system.orbits.planet1RadiusM}" />
      </div>
      <div class="row">
        <label>Planet 2 Orbit Radius (m)</label>
        <input id="p2r" type="number" step="1000" value="${cfg.system.orbits.planet2RadiusM}" />
      </div>
      <div class="row">
        <label>Moon Orbit Radius (m)</label>
        <input id="mr" type="number" step="100" value="${cfg.system.orbits.moonRadiusM}" />
      </div>

      <h3 style="margin-top:12px">Mass / Radius</h3>
      <div class="row">
        <label>Sun Mass (kg)</label>
        <input id="sm" type="number" step="1e26" value="${cfg.system.bodies.sun.massKg}" />
      </div>
      <div class="row">
        <label>Planet 1 Mass (kg)</label>
        <input id="p1m" type="number" step="1e22" value="${cfg.system.bodies.planet1.massKg}" />
      </div>
      <div class="row">
        <label>Planet 1 Radius (m)</label>
        <input id="p1rad" type="number" step="100" value="${cfg.system.bodies.planet1.radiusM}" />
      </div>

      <div class="btnRow">
        <button id="reset">Recompute Stable Orbits</button>
        <button id="dbg">Toggle Debug Log</button>
      </div>
    `;

    const $ = (id) => /** @type {HTMLInputElement} */ (el.querySelector(`#${id}`));

    $('ts').addEventListener('input', () => { cfg.sim.timeScale = num($('ts').value, cfg.sim.timeScale); });
    $('fd').addEventListener('input', () => { cfg.sim.fixedDt = clamp(num($('fd').value, cfg.sim.fixedDt), 1 / 600, 1 / 10); });
    el.querySelector('#fid').addEventListener('change', (e) => {
      const level = Number(e.target.value);
      cfg.render.fidelity = level;
      actions?.setFidelity?.(level);
    });

    $('p1r').addEventListener('input', () => { cfg.system.orbits.planet1RadiusM = num($('p1r').value, cfg.system.orbits.planet1RadiusM); });
    $('p2r').addEventListener('input', () => { cfg.system.orbits.planet2RadiusM = num($('p2r').value, cfg.system.orbits.planet2RadiusM); });
    $('mr').addEventListener('input', () => { cfg.system.orbits.moonRadiusM = num($('mr').value, cfg.system.orbits.moonRadiusM); });

    $('sm').addEventListener('input', () => { cfg.system.bodies.sun.massKg = num($('sm').value, cfg.system.bodies.sun.massKg); });
    $('p1m').addEventListener('input', () => { cfg.system.bodies.planet1.massKg = num($('p1m').value, cfg.system.bodies.planet1.massKg); });
    $('p1rad').addEventListener('input', () => { cfg.system.bodies.planet1.radiusM = num($('p1rad').value, cfg.system.bodies.planet1.radiusM); });

    el.querySelector('#reset').addEventListener('click', () => {
      try {
        actions?.resetOrbits?.();
      } catch (err) {
        debugLog?.error(err?.stack || String(err));
      }
    });

    el.querySelector('#dbg').addEventListener('click', () => actions?.toggleDebugLog?.());
  }

  // Default hidden
  el.classList.add('hidden');

  return { toggle, setOpen, isOpen };
}

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
