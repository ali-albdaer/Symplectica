import { Config } from '../Config.js';
import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19.1/+esm';

export class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.gui = null;
        this.debugOverlay = null;
        this.errorLog = null;
        
        this.initDOM();
        this.initGUI();
        this.setupErrorHandling();
    }

    initDOM() {
        // Telemetry Overlay
        this.debugOverlay = document.createElement('div');
        this.debugOverlay.style.position = 'absolute';
        this.debugOverlay.style.top = '10px';
        this.debugOverlay.style.left = '10px';
        this.debugOverlay.style.color = '#0f0';
        this.debugOverlay.style.fontFamily = 'monospace';
        this.debugOverlay.style.pointerEvents = 'none';
        this.debugOverlay.style.whiteSpace = 'pre';
        document.body.appendChild(this.debugOverlay);

        // Error Log
        this.errorLog = document.createElement('div');
        this.errorLog.style.position = 'absolute';
        this.errorLog.style.bottom = '10px';
        this.errorLog.style.left = '10px';
        this.errorLog.style.color = '#f00';
        this.errorLog.style.fontFamily = 'monospace';
        this.errorLog.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.errorLog.style.padding = '10px';
        this.errorLog.style.display = 'none';
        document.body.appendChild(this.errorLog);

        // Instructions
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.top = '50%';
        instructions.style.left = '50%';
        instructions.style.transform = 'translate(-50%, -50%)';
        instructions.style.color = '#fff';
        instructions.style.fontFamily = 'sans-serif';
        instructions.style.textAlign = 'center';
        instructions.style.pointerEvents = 'none';
        instructions.innerHTML = '<h1>Solar System Sim</h1><p>Click to Start</p><p>WASD to Move | Space to Jump | F to Fly</p>';
        instructions.id = 'instructions';
        document.body.appendChild(instructions);
    }

    initGUI() {
        this.gui = new GUI({ title: 'Dev Console' });
        this.gui.close(); // Closed by default, toggle with /
        this.gui.domElement.style.display = 'none';

        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(Config.physics, 'G', 0.1, 10);
        
        const playerFolder = this.gui.addFolder('Player');
        playerFolder.add(Config.player, 'speed', 1, 50);
        playerFolder.add(Config.player, 'flySpeed', 1, 100);
        playerFolder.add(Config.player, 'jumpForce', 1, 50);

        window.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                const display = this.gui.domElement.style.display;
                this.gui.domElement.style.display = display === 'none' ? 'block' : 'none';
                if (this.gui.domElement.style.display === 'block') {
                    document.exitPointerLock();
                }
            }
        });
    }

    setupErrorHandling() {
        window.onerror = (msg, url, line, col, error) => {
            this.errorLog.style.display = 'block';
            this.errorLog.innerHTML += `<div>Error: ${msg} <br> ${url}:${line}:${col}</div>`;
            console.error(error);
            return false;
        };
    }

    update(dt) {
        if (!this.engine.player) return;

        const p = this.engine.player.position;
        const fps = Math.round(1 / dt);
        
        this.debugOverlay.innerText = `FPS: ${fps}
Pos: ${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}
Mode: ${this.engine.player.isFlying ? 'FLY' : 'WALK'}
G-Force: ${this.engine.player.currentGravity ? this.engine.player.currentGravity.length().toFixed(2) : 0}`;
    }

    hideInstructions() {
        const el = document.getElementById('instructions');
        if (el) el.style.display = 'none';
    }

    showInstructions() {
        const el = document.getElementById('instructions');
        if (el) el.style.display = 'block';
    }
}
