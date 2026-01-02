import GUI from 'lil-gui';
import { Config } from '../config.js';

export class DebugUI {
    constructor(player, physicsWorld) {
        this.gui = new GUI({ title: 'Dev Console' });
        this.gui.hide(); // Hidden by default, toggle with /
        this.visible = false;
        this.player = player;
        this.physicsWorld = physicsWorld;

        this.setupPhysicsGUI();
        this.setupRenderingGUI();
        this.setupPlayerGUI();
        
        window.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                this.toggle();
            }
        });

        this.fpsElement = document.getElementById('fps');
        this.coordsElement = document.getElementById('coords');
        this.telemetryElement = document.getElementById('telemetry');
        
        this.lastTime = performance.now();
        this.frameCount = 0;
    }

    toggle() {
        this.visible = !this.visible;
        if (this.visible) {
            this.gui.show();
            document.exitPointerLock();
        } else {
            this.gui.hide();
            document.body.requestPointerLock();
        }
    }

    setupPhysicsGUI() {
        const folder = this.gui.addFolder('Physics');
        folder.add(Config.physics, 'G', 0.1, 10).name('Gravity Const');
        folder.add(Config.physics, 'dt', 0.001, 0.1).name('Time Step');
    }

    setupRenderingGUI() {
        const folder = this.gui.addFolder('Rendering');
        folder.add(Config.rendering, 'fidelity', ['low', 'medium', 'high']).onChange(val => {
            // Trigger re-render settings (would need callback to main)
            console.log("Fidelity changed to " + val);
        });
        folder.add(Config.rendering, 'shadows');
    }

    setupPlayerGUI() {
        const folder = this.gui.addFolder('Player');
        folder.add(this.player, 'speed', 1, 50);
        folder.add(this.player, 'jumpForce', 5, 50);
        folder.add(this.player, 'mass', 1, 200);
    }

    update() {
        // FPS Counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fpsElement.innerText = `FPS: ${this.frameCount}`;
            this.frameCount = 0;
            this.lastTime = now;
        }

        // Coords
        const p = this.player.position;
        this.coordsElement.innerText = `Pos: (${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)})`;
        
        // Toggle telemetry visibility
        // (Maybe add a key for this, but for now it's always on if UI layer is there)
        this.telemetryElement.classList.remove('hidden');
    }
}
