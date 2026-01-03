let GUI = null;

export class DevMenu {
	constructor({ containerEl, config, debugLog, onAnyChange }) {
		this.containerEl = containerEl;
		this.config = config;
		this.debugLog = debugLog;
		this.onAnyChange = onAnyChange;
		this.gui = null;
		this.visible = false;
	}

	async ensureGUI() {
		if (GUI) return;
		// No npm: load from CDN as ES module.
		const mod = await import('https://unpkg.com/lil-gui@0.19.2/dist/lil-gui.esm.js');
		GUI = mod.default;
	}

	async show() {
		await this.ensureGUI();
		if (!this.gui) {
			this.gui = new GUI({ container: this.containerEl, title: 'Dev Menu' });
			this.gui.domElement.style.pointerEvents = 'auto';
			this._build();
		}
		this.visible = true;
		this.containerEl.classList.remove('hidden');
	}

	hide() {
		this.visible = false;
		this.containerEl.classList.add('hidden');
	}

	toggle() {
		if (this.visible) this.hide();
		else return this.show();
	}

	_build() {
		const cfg = this.config;

		const sim = this.gui.addFolder('Simulation');
		sim.add(cfg.sim, 'paused');
		sim.add(cfg.sim, 'timeScale', 0, 50, 0.01).onChange(this._changed);
		sim.add(cfg.sim, 'dt', 1 / 600, 1 / 30, 1 / 600).name('fixed dt').onChange(this._changed);
		sim.add(cfg.sim, 'maxSubSteps', 1, 30, 1).onChange(this._changed);
		sim.add(cfg.sim, 'G', 0.05, 5, 0.01).onChange(this._changed);
		sim.add(cfg.sim, 'softening', 0.0, 0.2, 0.001).onChange(this._changed);

		const r = this.gui.addFolder('Rendering');
		r.add(cfg.render, 'fidelity', ['Low', 'Medium', 'Ultra']).onChange(this._changed);
		r.add(cfg.render, 'pixelRatioCap', 0.5, 3, 0.1).onChange(this._changed);
		r.add(cfg.render, 'shadows').onChange(this._changed);
		r.add(cfg.render.lod, 'enabled').name('LOD (off by default)').onChange(this._changed);

		const ui = this.gui.addFolder('UI');
		ui.add(cfg.ui, 'showTelemetry').onChange(this._changed);
		ui.add(cfg.ui, 'showDebugLog').onChange(this._changed);

		const p = this.gui.addFolder('Player');
		p.add(cfg.player.walk, 'speed', 0.5, 30, 0.1).onChange(this._changed);
		p.add(cfg.player.walk, 'jumpSpeed', 0.5, 30, 0.1).onChange(this._changed);
		p.add(cfg.player.flight, 'speed', 0.5, 80, 0.1).onChange(this._changed);

		const b = this.gui.addFolder('Bodies');
		for (const [id, bc] of Object.entries(cfg.bodies)) {
			const f = b.addFolder(id);
			f.add(bc, 'mass', 0.0001, 50, 0.0001).onChange(this._changed);
			f.add(bc, 'radius', 0.05, 10, 0.01).onChange(this._changed);
			f.add(bc, 'luminosity', 0, 5, 0.01).onChange(this._changed);
			if (bc.orbit) {
				const o = f.addFolder('orbit');
				o.add(bc.orbit, 'radius', 0.5, 80, 0.01).onChange(this._changed);
				o.add(bc.orbit, 'phase', -Math.PI, Math.PI, 0.001).onChange(this._changed);
			}
		}

		this.gui.onFinishChange(() => this._changed());
	}

	_changed = () => {
		try { this.onAnyChange?.(); } catch (e) { this.debugLog?.push('error', 'DevMenu onChange failed', e?.stack || e); }
	};
}
