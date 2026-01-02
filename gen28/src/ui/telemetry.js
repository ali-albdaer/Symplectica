export class Telemetry {
	constructor(el) {
		this.el = el;
		this.samples = [];
		this.maxSamples = 60;
		this.visible = false;
		this._lastFrameMs = 0;
	}

	setVisible(v) {
		this.visible = v;
		this.el.classList.toggle('hidden', !v);
	}

	update(frameMs, playerPos, refBodyName) {
		this._lastFrameMs = frameMs;
		this.samples.push(frameMs);
		if (this.samples.length > this.maxSamples) this.samples.shift();
		const avg = this.samples.reduce((a, b) => a + b, 0) / Math.max(1, this.samples.length);
		const fps = avg > 0 ? 1000 / avg : 0;

		this.el.innerHTML = [
			`<div><b>Telemetry</b></div>`,
			`<div>FPS: ${fps.toFixed(1)}</div>`,
			`<div>Frame: ${avg.toFixed(2)} ms</div>`,
			`<div>Pos: (${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)})</div>`,
			`<div>Ref: ${refBodyName || '-'}</div>`
		].join('');
	}
}
