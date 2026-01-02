import GUI from 'lil-gui';
import { Config } from '../config.js';

export class DebugUI {
    constructor(player, physicsEngine) {
        this.player = player;
        this.physics = physicsEngine;
        this.gui = new GUI({ title: 'Dev Console' });
        this.gui.hide(); // Hidden by default, toggle with /

        this.setupConfigGUI();
        this.setupTelemetry();
        
        window.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                this.gui._hidden ? this.gui.show() : this.gui.hide();
            }
        });
    }

    setupConfigGUI() {
        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(Config.physics, 'timeScale', 0, 10000).name('Time Scale');
        physicsFolder.add(Config.physics, 'G', 0, 1e-9).name('G Constant'); // Be careful editing this live!

        const renderFolder = this.gui.addFolder('Rendering');
        renderFolder.add(Config.rendering, 'fidelity', ['low', 'medium', 'ultra']).onChange(val => {
            // Trigger re-render setup if needed
            console.log('Fidelity changed to', val);
        });

        const playerFolder = this.gui.addFolder('Player');
        playerFolder.add(Config.player, 'walkSpeed', 1, 50);
        playerFolder.add(Config.player, 'flightSpeed', 10, 1000);
        playerFolder.add(Config.player, 'mass', 1, 1000);
    }

    setupTelemetry() {
        this.fpsElem = document.getElementById('fps');
        this.coordsElem = document.getElementById('coords');
        this.speedElem = document.getElementById('speed');
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    update() {
        // FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fpsElem.innerText = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Coords
        const p = this.player.position;
        this.coordsElem.innerText = `X: ${p.x.toFixed(1)} Y: ${p.y.toFixed(1)} Z: ${p.z.toFixed(1)}`;

        // Speed
        const speed = this.player.velocity.length();
        this.speedElem.innerText = `Speed: ${speed.toFixed(1)} m/s`;
    }
}
