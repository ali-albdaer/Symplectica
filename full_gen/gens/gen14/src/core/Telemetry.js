import { Config } from "../Config.js";

export class Telemetry {
	constructor() {
		this.el = document.getElementById("telemetry");
		this.enabled = !!Config.ui.telemetryEnabled;
		this._last = performance.now();
		this._accum = 0;
		this._frames = 0;
		this._fps = 0;
		this._frameMs = 0;
	}

	toggle() {
		this.enabled = !this.enabled;
		Config.ui.telemetryEnabled = this.enabled;
		if (this.el) this.el.classList.toggle("hidden", !this.enabled);
	}

	update({ now, dt, playerPos }) {
		this._frameMs = dt * 1000;
		this._frames++;
		this._accum += dt;
		if (this._accum >= 0.5) {
			this._fps = Math.round(this._frames / this._accum);
			this._frames = 0;
			this._accum = 0;
		}

		if (!this.enabled || !this.el) return;
		const p = playerPos ?? { x: 0, y: 0, z: 0 };
		this.el.textContent =
			`FPS: ${this._fps}\n` +
			`Frame: ${this._frameMs.toFixed(2)} ms\n` +
			`Pos: (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`;
	}
}
