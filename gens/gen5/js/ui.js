import GUI from 'lil-gui';
import { CONFIG } from './config.js';

export class UIManager {
    constructor(renderer, scene, physicsWorld) {
        this.renderer = renderer;
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.gui = new GUI({ title: 'Dev Menu (/)' });
        this.gui.hide(); // Hidden by default
        
        this.isVisible = false;
        this.setupGUI();
        this.setupMetrics();
        
        window.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                this.toggleGUI();
            }
        });
    }

    toggleGUI() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) this.gui.show();
        else this.gui.hide();
    }

    setupGUI() {
        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(CONFIG.physics, 'G').name('Gravity Constant');
        physicsFolder.add(CONFIG.physics, 'physicsSubsteps', 1, 20, 1).name('Substeps');
        
        const graphicsFolder = this.gui.addFolder('Graphics');
        graphicsFolder.add(CONFIG.graphics, 'fidelity', ['low', 'medium', 'high']).onChange(v => this.updateFidelity(v));
        graphicsFolder.add(CONFIG.graphics, 'enableShadows').onChange(v => {
            this.renderer.shadowMap.enabled = v;
            this.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = v;
                    child.receiveShadow = v;
                }
            });
        });
        
        const debugFolder = this.gui.addFolder('Debug');
        debugFolder.add(CONFIG.debug, 'showPhysics');
        debugFolder.add(CONFIG.debug, 'showOrbits');
        
        const playerFolder = this.gui.addFolder('Player');
        playerFolder.add(CONFIG.player, 'speed', 1, 100);
        playerFolder.add(CONFIG.player, 'jumpForce', 1, 50);
    }

    setupMetrics() {
        this.fpsElem = document.getElementById('fps');
        this.coordsElem = document.getElementById('coords');
        this.speedElem = document.getElementById('speed');
        this.debugInfo = document.getElementById('debug-info');
        
        // Toggle metrics visibility
        this.gui.add({ showMetrics: false }, 'showMetrics').onChange(v => {
            this.debugInfo.style.display = v ? 'block' : 'none';
        });
    }

    updateFidelity(level) {
        // Simple fidelity switch
        switch(level) {
            case 'low':
                this.renderer.shadowMap.enabled = false;
                this.renderer.setPixelRatio(1);
                break;
            case 'medium':
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
                this.renderer.setPixelRatio(window.devicePixelRatio);
                break;
            case 'high':
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.setPixelRatio(window.devicePixelRatio);
                break;
        }
    }

    update(dt, player) {
        if (this.debugInfo.style.display !== 'none') {
            // Update FPS (approx)
            this.fpsElem.innerText = Math.round(1/dt);
            
            // Update Coords
            const p = player.position;
            this.coordsElem.innerText = `${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}`;
            
            // Update Speed
            const s = player.velocity.length();
            this.speedElem.innerText = s.toFixed(1);
        }
    }
}
