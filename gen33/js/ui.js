import GUI from 'lil-gui';
import { Config } from './config.js';

export class UI {
    constructor(physicsEngine, renderer) {
        this.physicsEngine = physicsEngine;
        this.renderer = renderer;
        this.gui = new GUI({ title: 'Dev Console' });
        this.gui.hide(); // Hidden by default, toggle with '/'

        this.setupGUI();
        
        this.fpsElem = document.getElementById('fps');
        this.ftElem = document.getElementById('frame-time');
        this.coordsElem = document.getElementById('coords');
        this.modeElem = document.getElementById('mode');
        this.telemetryElem = document.getElementById('telemetry');
        
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    setupGUI() {
        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(Config.physics, 'G', 0.1, 10).name('Gravity Const');
        physicsFolder.add(Config.physics, 'substeps', 1, 10, 1).name('Substeps');

        const graphicsFolder = this.gui.addFolder('Graphics');
        graphicsFolder.add(Config.graphics, 'shadows').onChange(v => {
            this.renderer.renderer.shadowMap.enabled = v;
        });
        
        const debugFolder = this.gui.addFolder('Debug');
        debugFolder.add(Config.debug, 'showTelemetry').onChange(v => {
            if (v) this.telemetryElem.classList.remove('hidden');
            else this.telemetryElem.classList.add('hidden');
        });
    }

    toggle() {
        this.gui._hidden ? this.gui.show() : this.gui.hide();
    }

    update(player) {
        // FPS Counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fpsElem.textContent = this.frameCount;
            this.ftElem.textContent = (1000 / this.frameCount).toFixed(2);
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Coords
        if (Config.debug.showTelemetry) {
            this.coordsElem.textContent = `${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}, ${player.position.z.toFixed(1)}`;
            this.modeElem.textContent = player.flyMode ? 'Fly' : 'Walk';
        }
    }
}
