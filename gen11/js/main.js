/**
 * main.js - Application Entry Point
 * 
 * Initializes all subsystems and starts the simulation.
 */

import Config from './Config.js';
import { Engine } from './Engine.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { CelestialBody, InteractiveObject } from './CelestialBody.js';
import { Player } from './Player.js';
import { UIManager } from './UIManager.js';

/**
 * Main application class
 */
class SolarSystemSimulation {
    constructor() {
        this.engine = null;
        this.physicsWorld = null;
        this.player = null;
        this.uiManager = null;
        
        this.celestialBodies = [];
        this.interactiveObjects = [];
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('═══════════════════════════════════════════════════');
            console.log('  SOLAR SYSTEM SIMULATION - Gen11');
            console.log('  Initializing...');
            console.log('═══════════════════════════════════════════════════');
            
            // Create engine
            this.engine = new Engine();
            await this.engine.init();
            
            // Create physics world
            this.physicsWorld = new PhysicsWorld();
            this.physicsWorld.init();
            
            // Inject physics world into engine
            this.engine.setPhysicsWorld(this.physicsWorld);
            
            // Create celestial bodies
            this.createCelestialBodies();
            
            // Create interactive objects
            this.createInteractiveObjects();
            
            // Create player
            this.player = new Player(
                this.engine.camera,
                this.physicsWorld,
                this.engine
            );
            this.engine.setPlayer(this.player);
            
            // Create UI Manager
            this.uiManager = new UIManager(this.engine, this.player);
            this.engine.setUIManager(this.uiManager);
            
            // Hide loading screen
            this.uiManager.hideLoading();
            
            // Start the engine
            this.engine.start();
            
            // Welcome message
            this.uiManager.notify('SOLAR SYSTEM SIMULATION READY', 3000);
            this.uiManager.addLog('System initialized successfully', 'success');
            this.uiManager.addLog('Press / to open Developer Console', 'info');
            this.uiManager.addLog('Press T to toggle Telemetry', 'info');
            this.uiManager.addLog('Press F to toggle Flight Mode', 'info');
            
            console.log('═══════════════════════════════════════════════════');
            console.log('  Initialization Complete!');
            console.log('═══════════════════════════════════════════════════');
            
        } catch (error) {
            console.error('Fatal Error during initialization:', error);
            this.handleFatalError(error);
        }
    }

    /**
     * Create all celestial bodies from config
     */
    createCelestialBodies() {
        console.log('Creating celestial bodies...');
        
        const celestialConfig = Config.celestialBodies;
        
        // Create Sun
        if (celestialConfig.sun) {
            const sun = new CelestialBody(celestialConfig.sun, this.physicsWorld);
            this.celestialBodies.push(sun);
            this.engine.addCelestialBody(sun);
            console.log(`✓ Created: ${celestialConfig.sun.name}`);
        }
        
        // Create Planet 1
        if (celestialConfig.planet1) {
            const planet1 = new CelestialBody(celestialConfig.planet1, this.physicsWorld);
            this.celestialBodies.push(planet1);
            this.engine.addCelestialBody(planet1);
            console.log(`✓ Created: ${celestialConfig.planet1.name}`);
        }
        
        // Create Planet 2
        if (celestialConfig.planet2) {
            const planet2 = new CelestialBody(celestialConfig.planet2, this.physicsWorld);
            this.celestialBodies.push(planet2);
            this.engine.addCelestialBody(planet2);
            console.log(`✓ Created: ${celestialConfig.planet2.name}`);
        }
        
        // Create Moon
        if (celestialConfig.moon1) {
            const moon1 = new CelestialBody(celestialConfig.moon1, this.physicsWorld);
            this.celestialBodies.push(moon1);
            this.engine.addCelestialBody(moon1);
            console.log(`✓ Created: ${celestialConfig.moon1.name}`);
        }
        
        console.log(`Total celestial bodies: ${this.celestialBodies.length}`);
    }

    /**
     * Create interactive objects from config
     */
    createInteractiveObjects() {
        console.log('Creating interactive objects...');
        
        const interactiveConfig = Config.interactiveObjects;
        
        for (const objConfig of interactiveConfig) {
            const obj = new InteractiveObject(objConfig, this.physicsWorld);
            this.interactiveObjects.push(obj);
            this.engine.addInteractiveObject(obj);
            console.log(`✓ Created: ${objConfig.name}`);
        }
        
        console.log(`Total interactive objects: ${this.interactiveObjects.length}`);
    }

    /**
     * Handle fatal errors
     */
    handleFatalError(error) {
        console.error('FATAL ERROR:', error);
        
        if (this.uiManager) {
            this.uiManager.showError(`
                <strong>Fatal Error:</strong><br>
                ${error.message}<br><br>
                <strong>Stack Trace:</strong><br>
                <pre style="text-align: left; font-size: 10px;">${error.stack}</pre>
            `);
        } else {
            // Fallback if UI manager doesn't exist
            document.body.innerHTML = `
                <div style="color: #f00; padding: 50px; font-family: monospace;">
                    <h1>FATAL ERROR</h1>
                    <p>${error.message}</p>
                    <pre>${error.stack}</pre>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
        
        if (this.physicsWorld) {
            this.physicsWorld.dispose();
        }
        
        if (this.player) {
            this.player.dispose();
        }
        
        if (this.uiManager) {
            this.uiManager.dispose();
        }
        
        console.log('Application disposed');
    }
}

/**
 * Entry point - Wait for DOM to load
 */
window.addEventListener('DOMContentLoaded', () => {
    // Check for WebGL support
    if (!window.WebGLRenderingContext) {
        alert('WebGL is not supported in your browser. This simulation requires WebGL.');
        return;
    }
    
    // Check for required libraries
    if (typeof THREE === 'undefined') {
        alert('Three.js failed to load. Please check your internet connection.');
        return;
    }
    
    if (typeof CANNON === 'undefined') {
        alert('Cannon.js failed to load. Please check your internet connection.');
        return;
    }
    
    // Create and initialize the application
    const app = new SolarSystemSimulation();
    app.init();
    
    // Store app instance globally for debugging
    window.solarSystemApp = app;
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.dispose();
    });
});

/**
 * Error handling for uncaught errors
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught Error:', event.error);
    
    // Display error on screen
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.9);
        color: #fff;
        padding: 15px 30px;
        font-family: monospace;
        font-size: 14px;
        z-index: 10000;
        border: 2px solid #fff;
        max-width: 80%;
    `;
    errorDiv.textContent = `ERROR: ${event.error.message}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 0, 0, 0.9);
        color: #fff;
        padding: 15px 30px;
        font-family: monospace;
        font-size: 14px;
        z-index: 10000;
        border: 2px solid #fff;
        max-width: 80%;
    `;
    errorDiv.textContent = `PROMISE ERROR: ${event.reason}`;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
});

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   SOLAR SYSTEM SIMULATION - Gen11                             ║
║   Graphics Engine & Physics Programmer                        ║
║                                                               ║
║   Three.js + Cannon.js                                        ║
║   N-Body Gravitational Physics                                ║
║   Dual-Mode Player Control                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
