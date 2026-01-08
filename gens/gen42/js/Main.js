/**
 * Main.js - Application Entry Point
 * 
 * Initializes all modules and runs the main game loop.
 * Handles module loading with error catching.
 */

// Import all modules
import Config from './Config.js';
import Debug from './Debug.js';
import Utils from './Utils.js';
import Physics from './Physics.js';
import Renderer from './Renderer.js';
import { createCelestialBodies } from './CelestialBody.js';
import Player from './Player.js';
import Controls from './Controls.js';
import InteractiveManager from './InteractiveObjects.js';
import UI from './UI.js';
import Stars from './Stars.js';

/**
 * Main Application Class
 */
class SolarSystemSimulation {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.celestialBodies = [];
        
        // Frame timing
        this.deltaTime = 0;
        this.maxDeltaTime = 1 / 30; // Cap at 30fps equivalent
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Initialize debug system first (catches errors)
            Debug.init();
            Debug.setLoadingStatus('Starting initialization...');
            
            // Initialize renderer
            Debug.setLoadingStatus('Initializing renderer...');
            const rendererSuccess = Renderer.init();
            if (!rendererSuccess) {
                throw new Error('Renderer initialization failed');
            }
            
            const THREE = Renderer.getTHREE();
            const scene = Renderer.getScene();
            const camera = Renderer.getCamera();
            
            // Initialize stars background
            Debug.setLoadingStatus('Creating star field...');
            Stars.init(THREE, scene);
            
            // Create celestial bodies
            Debug.setLoadingStatus('Creating celestial bodies...');
            this.celestialBodies = createCelestialBodies();
            
            // Add bodies to physics and renderer
            for (const body of this.celestialBodies) {
                Physics.addBody(body);
                Renderer.addCelestialBody(body);
            }
            
            // Initialize physics
            Debug.setLoadingStatus('Initializing physics engine...');
            Physics.init();
            
            // Initialize player
            Debug.setLoadingStatus('Initializing player...');
            const playerMesh = Player.init(THREE, camera);
            scene.add(playerMesh);
            
            // Initialize controls
            Debug.setLoadingStatus('Setting up controls...');
            Controls.init(Renderer.getRenderer());
            
            // Setup control callbacks
            this.setupControlCallbacks();
            
            // Initialize interactive objects
            Debug.setLoadingStatus('Spawning interactive objects...');
            InteractiveManager.init(THREE, scene, camera);
            InteractiveManager.spawnObjects();
            
            // Register interactive objects with physics
            for (const obj of InteractiveManager.getObjects()) {
                Physics.addInteractiveObject(obj);
            }
            
            // Initialize UI
            Debug.setLoadingStatus('Initializing UI...');
            UI.init(this.celestialBodies);
            
            // Setup complete
            Debug.setLoadingStatus('Ready!');
            Debug.success('All systems initialized successfully');
            
            // Hide loading screen and show start prompt
            setTimeout(() => {
                UI.hideLoadingScreen();
                UI.showStartPrompt();
            }, 500);
            
            // Start the main loop
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
            
        } catch (error) {
            Debug.error(`Initialization failed: ${error.message}`);
            console.error(error);
            
            // Show error on loading screen
            const loadingStatus = document.getElementById('loading-status');
            if (loadingStatus) {
                loadingStatus.textContent = `Error: ${error.message}`;
                loadingStatus.style.color = '#ef4444';
            }
        }
    }
    
    /**
     * Setup control callbacks
     */
    setupControlCallbacks() {
        Controls.onToggleFlightMode = () => {
            Player.toggleFlightMode();
        };
        
        Controls.onToggleCameraView = () => {
            Player.toggleCameraView();
        };
        
        Controls.onToggleTelemetry = () => {
            UI.toggleTelemetry();
        };
        
        Controls.onToggleUI = () => {
            UI.toggleUI();
        };
        
        Controls.onToggleDevConsole = () => {
            const isOpen = UI.toggleDevConsole();
            Controls.setMenuOpen(isOpen);
        };
        
        Controls.onGrab = () => {
            InteractiveManager.tryGrab();
        };
        
        Controls.onRelease = () => {
            InteractiveManager.release();
        };
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        if (this.deltaTime > this.maxDeltaTime) {
            this.deltaTime = this.maxDeltaTime;
        }
        
        // Update all systems
        this.update(this.deltaTime);
        
        // Render
        this.render();
        
        // Request next frame
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Update all systems
     */
    update(deltaTime) {
        // Update controls (input handling)
        Controls.update(deltaTime);
        
        // Update physics (celestial bodies and interactive objects)
        Physics.update(deltaTime);
        
        // Sync celestial bodies with their meshes
        for (const body of this.celestialBodies) {
            body.update(deltaTime);
        }
        
        // Update interactive objects
        InteractiveManager.update(deltaTime);
        
        // Update player
        Player.update(deltaTime);
        
        // Update stars (for twinkling effect)
        Stars.update(deltaTime);
    }
    
    /**
     * Render the scene
     */
    render() {
        Renderer.render();
    }
    
    /**
     * Pause the simulation
     */
    pause() {
        Physics.pause();
        Debug.info('Simulation paused');
    }
    
    /**
     * Resume the simulation
     */
    resume() {
        Physics.resume();
        Debug.info('Simulation resumed');
    }
    
    /**
     * Stop and cleanup
     */
    dispose() {
        this.isRunning = false;
        
        Stars.dispose();
        InteractiveManager.dispose();
        Renderer.dispose();
        UI.dispose();
        
        Debug.info('Application disposed');
    }
}

// Create and initialize the application
const app = new SolarSystemSimulation();

// Wait for DOM and Three.js to be ready
window.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure Three.js is loaded from CDN
    setTimeout(() => {
        if (window.THREE) {
            app.init();
        } else {
            Debug.error('Three.js failed to load from CDN');
            const loadingStatus = document.getElementById('loading-status');
            if (loadingStatus) {
                loadingStatus.textContent = 'Error: Three.js failed to load. Check your internet connection.';
                loadingStatus.style.color = '#ef4444';
            }
        }
    }, 100);
});

// Expose app to window for debugging
window.solarSystemApp = app;
window.Config = Config;
window.Debug = Debug;
