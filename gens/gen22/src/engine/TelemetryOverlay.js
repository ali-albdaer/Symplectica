import { getConfig, subscribeConfig } from "../config.js";

export class TelemetryOverlay {
    constructor(panel) {
        this.panel = panel;
        this.enabled = getConfig().ui.metricsDisplay;
        this.samples = [];
        this.maxSamples = 60;
        this.unsubscribe = subscribeConfig("ui.metricsDisplay", (value) => this.toggle(value));
        this.toggle(this.enabled);
    }

    toggle(state) {
        this.enabled = state;
        if (!this.panel) {
            return;
        }
        this.panel.classList.toggle("hidden", !state);
    }

    update({ deltaTime, playerBody }) {
        if (!this.enabled || !this.panel) {
            return;
        }
        this.samples.push(deltaTime);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
        const fps = 1 / average;
        const pos = playerBody ? playerBody.position : { x: 0, y: 0, z: 0 };
        this.panel.innerHTML = [
            `FPS: ${fps.toFixed(1)}`,
            `Frame Time: ${(average * 1000).toFixed(2)} ms`,
            `Coordinates: ${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)}`
        ].join("<br/>");
    }

    dispose() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
