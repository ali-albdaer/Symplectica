import { getConfig, subscribeConfig } from "../config.js";

export class DebugOverlay {
    constructor(panel) {
        this.panel = panel;
        this.enabled = getConfig().ui.debugOverlay;
        this.samples = [];
        this.maxSamples = 120;
        this.lastTime = performance.now();
        this.unsubscribe = subscribeConfig("ui.debugOverlay", (value) => this.toggle(value));
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
        const now = performance.now();
        const frameTime = now - this.lastTime;
        this.lastTime = now;
        this.samples.push(frameTime);
        if (this.samples.length > this.maxSamples) {
            this.samples.shift();
        }
        const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
        const fps = 1000 / average;
        const position = playerBody ? playerBody.position : { x: 0, y: 0, z: 0 };
        const velocity = playerBody ? playerBody.velocity : { x: 0, y: 0, z: 0 };
        this.panel.innerHTML = [
            `FPS: ${fps.toFixed(1)}`,
            `Frame Time: ${average.toFixed(2)} ms`,
            `Position: ${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}`,
            `Velocity: ${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)}, ${velocity.z.toFixed(2)}`,
            `Mode: ${playerBody && playerBody.controller ? playerBody.controller.mode : ""}`
        ].join("<br/>");
    }

    dispose() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
