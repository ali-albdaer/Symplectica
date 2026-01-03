/**
 * Solar System Simulator - Main Entry Point
 * A realistic 3D solar system simulation with physics
 */

import { Config, PERFORMANCE } from './config.js';
import { Renderer } from './Renderer.js';
import { PhysicsEngine } from './Physics.js';
import { CelestialBodyManager } from './CelestialBody.js';
import { Player } from './Player.js';
import { CameraController } from './Camera.js';
import { InputManager } from './Input.js';
import { LightingSystem } from './Lighting.js';
import { InteractiveObjectManager } from './InteractiveObjects.js';
import { UIManager } from './UI.js';

class SolarSystemGame {
    constructor() {
        this.renderer = null;
        this.physics = null;
        this.celestialManager = null;
        this.player = null;
        this.cameraController = null;
        this.input = null;
        this.lighting = null;
        this.interactiveObjects = null;
        this.ui = null;
        
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.frameTime = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.currentFPS = 0;
        
        // Game state
        this.gameStarted = false;
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing Solar System Simulator...');
        
        try {
            // Get canvas
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Initialize UI first for loading updates
            this.ui = new UIManager();
            this.ui.initialize();
            this.ui.updateLoadingProgress(0.1, 'Initializing renderer...');
            
            // Initialize renderer
            this.renderer = new Renderer(canvas);
            this.ui.updateLoadingProgress(0.2, 'Setting up physics...');
            
            // Initialize physics engine
            this.physics = new PhysicsEngine();
            this.ui.updateLoadingProgress(0.3, 'Creating celestial bodies...');
            
            // Initialize celestial body manager
            this.celestialManager = new CelestialBodyManager(
                this.renderer.scene,
                this.physics
            );
            this.celestialManager.initialize();
            this.ui.updateLoadingProgress(0.5, 'Setting up lighting...');
            
            // Initialize lighting
            this.lighting = new LightingSystem(this.renderer.scene);
            this.lighting.initialize();
            this.ui.updateLoadingProgress(0.6, 'Creating player...');
            
            // Initialize input manager
            this.input = new InputManager();
            this.input.init(canvas);
            
            // Initialize player
            this.player = new Player(this.physics, this.celestialManager);
            this.player.initialize(this.renderer.scene);
            this.ui.updateLoadingProgress(0.7, 'Initializing camera...');
            
            // Initialize camera controller
            this.cameraController = new CameraController(this.renderer.camera);
            this.cameraController.setPlayer(this.player);
            this.ui.updateLoadingProgress(0.8, 'Spawning objects...');
            
            // Initialize interactive objects
            this.interactiveObjects = new InteractiveObjectManager(
                this.renderer.scene,
                this.physics
            );
            
            // Spawn objects near player
            this.interactiveObjects.spawnNearPlayer(
                this.player.position,
                this.player.localUp,
                10
            );
            this.ui.updateLoadingProgress(0.9, 'Finalizing...');
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Setup config listeners
            this.setupConfigListeners();
            
            this.ui.updateLoadingProgress(1.0, 'Ready!');
            
            // Show start screen
            setTimeout(() => {
                this.ui.showStartScreen();
                this.ui.startGame(() => this.start());
            }, 500);
            
            console.log('Initialization complete!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.ui.updateLoadingProgress(0, `Error: ${error.message}`);
        }
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameStarted = true;
        this.lastTime = performance.now();
        
        // Request pointer lock
        const canvas = document.getElementById('gameCanvas');
        canvas.requestPointerLock();
        
        // Start game loop
        this.gameLoop();
        
        console.log('Game started!');
    }
    
    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        const frameStart = performance.now();
        
        // Update game state
        if (!this.isPaused && !this.ui.isDevMenuOpen()) {
            this.update(this.deltaTime);
        }
        
        // Render
        this.render();
        
        // Calculate frame time
        this.frameTime = performance.now() - frameStart;
        
        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFPSTime >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSTime = currentTime;
        }
        
        // Update UI
        this.updateUI();
        
        // Clear per-frame input state
        this.input.update();
        
        // Next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Update physics
        this.physics.update(deltaTime);
        
        // Update celestial bodies
        this.celestialManager.update(deltaTime);
        
        // Update player
        this.player.update(deltaTime, this.input);
        
        // Update camera
        this.cameraController.update(deltaTime, this.input);
        
        // Update interactive objects
        this.interactiveObjects.update(deltaTime);
        
        // Update lighting
        const sun = this.celestialManager.getBody('sun');
        if (sun) {
            this.lighting.update(
                this.player.position,
                sun.mesh.position
            );
        }
    }
    
    /**
     * Render the scene
     */
    render() {
        this.renderer.render();
    }
    
    /**
     * Update UI elements
     */
    updateUI() {
        // Update HUD with player state
        this.ui.updateHUD(this.player.getState());
        
        // Update performance metrics
        if (PERFORMANCE.showMetrics) {
            const renderInfo = this.renderer.getInfo();
            const physicsMetrics = this.physics.getMetrics();
            
            this.ui.updatePerformanceMetrics({
                frameTime: this.frameTime,
                physicsTime: physicsMetrics.physicsTime,
                renderTime: renderInfo.renderTime,
                drawCalls: renderInfo.drawCalls,
                memory: this.renderer.getMemoryUsage()
            });
        }
    }
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        this.input.on('keyDown', (key) => {
            switch (key) {
                case 'Escape':
                    this.togglePause();
                    break;
                    
                case 'F11':
                    this.toggleFullscreen();
                    break;
                    
                case 'KeyR':
                    // Respawn at planet 1
                    if (this.input.isKeyDown('ControlLeft')) {
                        this.player.spawnOnPlanet('planet1');
                    }
                    break;
                    
                case 'KeyO':
                    // Toggle orbit view
                    if (this.cameraController.orbitMode) {
                        this.cameraController.exitOrbitMode();
                    } else {
                        const sun = this.celestialManager.getBody('sun');
                        if (sun) {
                            this.cameraController.enterOrbitMode(sun.position, 100);
                        }
                    }
                    break;
                    
                case 'KeyC':
                    // Toggle cinematic mode
                    this.cameraController.setCinematicMode(
                        !this.cameraController.cinematicMode
                    );
                    break;
                    
                case 'KeyG':
                    // Spawn new object
                    if (this.input.isKeyDown('ShiftLeft')) {
                        const types = ['crate', 'barrel', 'sphere', 'rock'];
                        const type = types[Math.floor(Math.random() * types.length)];
                        const forward = this.player.getForwardVector();
                        const spawnPos = {
                            x: this.player.position.x + forward.x * 3,
                            y: this.player.position.y + forward.y * 3 + 2,
                            z: this.player.position.z + forward.z * 3
                        };
                        this.interactiveObjects.createObject(type, spawnPos);
                    }
                    break;
                    
                case 'KeyB':
                    // Toggle debug colliders
                    Config.debug.showColliders = !Config.debug.showColliders;
                    break;
                    
                case 'KeyN':
                    // Toggle orbit lines
                    Config.debug.showOrbits = !Config.debug.showOrbits;
                    break;
            }
        });
    }
    
    /**
     * Setup config change listeners
     */
    setupConfigListeners() {
        Config.onChange('graphics', (property, value) => {
            if (property === 'preset') {
                this.renderer.updateQuality(value);
                this.lighting.updateQuality(value);
            }
        });
        
        Config.onChange('physics', (property, value) => {
            // Physics changes are applied automatically through config references
        });
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.input.unlockPointer();
        } else {
            const canvas = document.getElementById('gameCanvas');
            canvas.requestPointerLock();
        }
    }
    
    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    /**
     * Stop the game
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        this.stop();
        
        this.renderer?.dispose();
        this.physics = null;
        this.celestialManager?.dispose();
        this.player?.dispose();
        this.interactiveObjects?.dispose();
        this.lighting?.dispose();
        this.input?.dispose();
        this.ui?.dispose();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new SolarSystemGame();
    game.init();
    
    // Expose to window for debugging
    window.game = game;
    window.Config = Config;
});

export default SolarSystemGame;
