import { Units } from '../utils/Constants.js';
import { PRESETS } from '../data/Presets.js';

export class UIManager {
    constructor(stateManager, physicsEngine, inputManager) {
        this.stateManager = stateManager;
        this.physicsEngine = physicsEngine;
        this.inputManager = inputManager;

        // Elements
        this.elFPS = document.getElementById('fps-counter');
        this.elBodyCount = document.getElementById('body-count');
        this.elEnergy = document.getElementById('energy-stat');
        this.elIntegrator = document.getElementById('integrator-stat'); // Added
        this.elTimestep = document.getElementById('timestep-stat');     // Added
        this.elTimer = document.getElementById('time-stat');
        this.elMode = document.getElementById('mode-indicator');
        
        this.setupBindings();
    }

    setupBindings() {
        // Spawn Presets
        document.getElementById('btn-load-preset').onclick = () => {
            const val = document.getElementById('preset-selector').value;
            if (val && PRESETS[val]) {
                this.stateManager.clear();
                PRESETS[val].forEach(bd => this.stateManager.addBody(bd));
            }
        };

        // Clear
        document.getElementById('btn-clear').onclick = () => {
            this.stateManager.clear();
        };
        
        // Spawn Manual
        document.getElementById('btn-spawn').onclick = () => {
           this.spawnFromUI(); 
        };

        // Integrator
        document.getElementById('integrator-select').onchange = (e) => {
            this.physicsEngine.setIntegrator(e.target.value);
        };

        // Physics Model
        document.getElementById('physics-model-select').onchange = (e) => {
            this.physicsEngine.setPhysicsModel(e.target.value);
        };
        
        // Export
        document.getElementById('btn-export').onclick = () => {
            const json = this.stateManager.serialize();
            const blob = new Blob([json], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "scene_state.json";
            a.click();
        };

        document.getElementById('btn-dismiss-error').onclick = () => {
            document.getElementById('error-overlay').classList.add('hidden');
        };
    }

    setMode(mode) {
        this.elMode.innerText = mode;
        if (mode === 'EDIT') {
            this.elMode.classList.add('highlight'); // Assuming css handles color
        } else {
            this.elMode.classList.remove('highlight');
        }
    }
    
    spawnFromUI() {
        // Get values
        const type = document.getElementById('spawn-type').value;
        const mass = parseFloat(document.getElementById('spawn-mass').value);
        const radius = parseFloat(document.getElementById('spawn-radius').value);
        
        // Spawn in front of camera or at center of screen (Edit Mode: At 0,0,0 usually or Ray hit)
        // Let's spawn at Origin + offset for now
        const offset = Math.random() * 1e9;
        this.stateManager.addBody({
            type, mass, radius,
            pos: { x: offset, y: 0, z: offset },
            vel: { x: 0, y: 0, z: 0 },
            color: Math.random() * 0xffffff
        });
    }

    update(dt, diagnostics) {
        this.elBodyCount.innerText = `Bodies: ${diagnostics.count}`;
        this.elEnergy.innerText = `Energy: ${diagnostics.totalEnergy.toExponential(4)} J`;
        
        // Update Integrator and Timestep from physics engine via hacky access or passed diagnostics
        // It's cleaner to access via physicsEngine instance passed in constructor
        this.elIntegrator.innerText = `Integrator: ${this.physicsEngine.integrator.type}`;
        this.elTimestep.innerText = `dt: ${dt.toFixed(3)} s (Sim)`; // Showing frame dt. 
        // Ideally show physics step dt if fixed, but we use variable. 

        this.elFPS.innerText = `FPS: ${(1/dt).toFixed(1)}`;
        this.elTimer.innerText = `Sim Time: ${(this.stateManager.time / 31536000).toFixed(4)} yrs`;
        
        // Error Check
        if (isNaN(diagnostics.totalEnergy) || Math.abs(diagnostics.totalEnergy) > 1e40) { // arbitrary explosions
            // document.getElementById('error-overlay').classList.remove('hidden');
            // document.getElementById('error-message').innerText = "Numerical Instability Detected!";
        }
    }
}