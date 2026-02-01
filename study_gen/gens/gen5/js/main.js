/**
 * main.js - Application Entry Point
 * 
 * Initializes all systems and runs the main render/update loop.
 * This is the orchestrator that brings together all modules.
 */

import { initState, getState, AppMode } from './state.js';
import { initSimulation, getSimulation } from './simulation.js';
import { initRenderer, getRenderer } from './renderer.js';
import { initBodyVisuals, syncBodyVisuals, updateTrails } from './bodyVisuals.js';
import { initCameraController, getCameraController } from './camera.js';
import { initInputManager, getInputManager } from './input.js';
import { initUIManager, getUIManager } from './ui.js';
import { getDiagnostics } from './diagnostics.js';
import { loadPreset } from './presets.js';
import { runAllTests } from './validation.js';

/**
 * Application class - main controller
 */
class Application {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.animationFrameId = null;
        
        // Systems
        this.state = null;
        this.simulation = null;
        this.renderer = null;
        this.camera = null;
        this.input = null;
        this.ui = null;
        this.diagnostics = null;
        
        // Debug mode
        this.debugMode = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Celestial Mechanics Simulator...');
        console.log('================================================');
        
        try {
            // Check for WebGL support
            if (!this._checkWebGL()) {
                throw new Error('WebGL is not supported in this browser');
            }
            
            // Initialize core systems in order
            console.log('Initializing state...');
            this.state = initState();
            
            console.log('Initializing simulation...');
            this.simulation = initSimulation();
            
            console.log('Initializing renderer...');
            const container = document.getElementById('canvas-container');
            if (!container) {
                throw new Error('Container element not found');
            }
            this.renderer = initRenderer(container);
            
            console.log('Initializing body visuals...');
            initBodyVisuals();
            
            console.log('Initializing camera controller...');
            this.camera = initCameraController(this.renderer);
            
            console.log('Initializing input manager...');
            this.input = initInputManager(this.renderer.getCanvas());
            
            console.log('Initializing UI manager...');
            this.ui = initUIManager();
            
            console.log('Initializing diagnostics...');
            this.diagnostics = getDiagnostics();
            
            // Load default preset
            console.log('Loading default preset...');
            loadPreset('solar-system');
            syncBodyVisuals();
            
            // Subscribe to state changes
            this._setupStateSubscriptions();
            
            // Initial UI update
            this.ui.update();
            
            // Check for debug mode in URL
            if (window.location.hash.includes('debug')) {
                this.enableDebugMode();
            }
            
            console.log('================================================');
            console.log('Initialization complete!');
            console.log('Controls: T=Play/Pause, V=Toggle View, H=Hide UI, R=Reset, ?=Help');
            console.log('');
            
            return true;
            
        } catch (err) {
            console.error('Initialization failed:', err);
            this._showFatalError(err);
            return false;
        }
    }

    /**
     * Check WebGL support
     * @returns {boolean}
     * @private
     */
    _checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }

    /**
     * Set up state change subscriptions
     * @private
     */
    _setupStateSubscriptions() {
        const state = getState();
        
        // Mode changes
        state.subscribe('modeChanged', (mode) => {
            console.log(`Mode changed to: ${mode}`);
            this.camera.setMode(mode);
            this.input.handleModeChange(mode);
            this.ui.update();
        });
        
        // Selection changes
        state.subscribe('selectionChanged', (bodyId) => {
            this.ui.update();
            // Update visual selection indicator
            const renderer = getRenderer();
            renderer.updateSelection(bodyId);
        });
        
        // Spawn mode changes
        state.subscribe('spawnModeChanged', (isSpawning) => {
            this.ui.update();
        });
    }

    /**
     * Show fatal error to user
     * @param {Error} err
     * @private
     */
    _showFatalError(err) {
        const container = document.getElementById('container');
        if (container) {
            container.innerHTML = `
                <div style="color: #ff4444; padding: 50px; text-align: center;">
                    <h1>⚠️ Initialization Error</h1>
                    <p>${err.message}</p>
                    <p style="color: #888; font-size: 14px;">
                        Please check the console for more details.
                    </p>
                </div>
            `;
        }
    }

    /**
     * Start the main loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this._loop();
        
        console.log('Main loop started');
    }

    /**
     * Stop the main loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('Main loop stopped');
    }

    /**
     * Main loop
     * @private
     */
    _loop() {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;
        
        // Record frame for diagnostics
        this.diagnostics.recordFrame(deltaTime);
        
        // Update simulation (if running)
        this.diagnostics.startPhysicsTimer();
        if (this.simulation.isRunning) {
            this.simulation.step(deltaTime);
        }
        this.diagnostics.endPhysicsTimer();
        
        // Update camera
        this.camera.update(deltaTime);
        
        // Sync body visuals with physics
        syncBodyVisuals();
        
        // Update trails
        if (this.state.showTrails && this.simulation.isRunning) {
            updateTrails();
        }
        
        // Render
        this.diagnostics.startRenderTimer();
        this.renderer.render();
        this.diagnostics.endRenderTimer();
        
        // Update diagnostics
        this.diagnostics.update();
        
        // Update UI (throttled)
        this.ui.updateFPS(deltaTime);
        if (Math.floor(now / 100) !== Math.floor((now - deltaTime * 1000) / 100)) {
            this.ui.update();
        }
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(() => this._loop());
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;
        console.log('Debug mode enabled');
        
        // Expose globals for debugging
        window.debug = {
            app: this,
            state: getState(),
            simulation: getSimulation(),
            renderer: getRenderer(),
            camera: getCameraController(),
            input: getInputManager(),
            ui: getUIManager(),
            diagnostics: getDiagnostics(),
            
            // Utility functions
            runTests: runAllTests,
            getReport: () => getDiagnostics().getReport(),
            
            // Quick actions
            pause: () => getSimulation().stop(),
            play: () => getSimulation().start(),
            step: () => getSimulation().singleStep(),
            reset: () => getSimulation().reset(),
        };
        
        console.log('Debug utilities available via window.debug');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.renderer.handleResize();
    }
}

// Global application instance
let app = null;

/**
 * Get the application instance
 * @returns {Application}
 */
export function getApp() {
    return app;
}

/**
 * Main entry point
 */
async function main() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║       CELESTIAL MECHANICS SIMULATOR v1.0         ║');
    console.log('║  High-Precision N-Body Gravitational Dynamics    ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');
    
    app = new Application();
    
    // Initialize
    const success = await app.init();
    
    if (success) {
        // Handle window resize
        window.addEventListener('resize', () => app.handleResize());
        
        // Start the main loop
        app.start();
        
        // Log startup info
        console.log('');
        console.log('Simulation ready. Add #debug to URL for developer tools.');
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

export default {
    Application,
    getApp,
};
