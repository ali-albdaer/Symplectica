/**
 * Solar System Simulation - Main Application
 * Integrates all systems and manages the game loop
 */

import { CONFIG, SCALE, scalePosition } from '../config/globals.js';
import { GravityEngine } from './physics/GravityEngine.js';
import { Star } from './celestial/Star.js';
import { Planet } from './celestial/Planet.js';
import { Moon } from './celestial/Moon.js';
import { Player } from './player/Player.js';
import { CameraController } from './player/Camera.js';
import { InteractiveObject } from './objects/InteractiveObject.js';
import { Renderer } from './rendering/Renderer.js';
import { LightingSystem } from './rendering/LightingSystem.js';
import { PerformanceMonitor } from './ui/PerformanceMonitor.js';
import { DevMenu } from './ui/DevMenu.js';

class SolarSystemGame {
    constructor() {
        // Core systems
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.gravityEngine = null;
        this.lightingSystem = null;
        
        // Game objects
        this.celestialBodies = {};
        this.player = null;
        this.cameraController = null;
        this.interactiveObjects = [];
        
        // UI
        this.performanceMonitor = null;
        this.devMenu = null;
        this.coordinatesDisplay = null;
        
        // State
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        
        // Loading
        this.loadingProgress = 0;
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgressBar = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.loadingDetails = document.getElementById('loading-details');
    }

    /**
     * Initialize the game
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Solar System Simulation...');
            
            // Step 1: Initialize renderer
            this.updateLoading(10, 'Initializing renderer...');
            await this.delay(100);
            this.initializeRenderer();
            
            // Step 2: Initialize physics
            this.updateLoading(20, 'Initializing physics engine...');
            await this.delay(100);
            this.initializePhysics();
            
            // Step 3: Initialize lighting
            this.updateLoading(30, 'Setting up lighting...');
            await this.delay(100);
            this.initializeLighting();
            
            // Step 4: Create celestial bodies
            this.updateLoading(40, 'Creating solar system...');
            await this.delay(100);
            this.createCelestialBodies();
            
            // Step 5: Create player
            this.updateLoading(60, 'Spawning player...');
            await this.delay(100);
            this.createPlayer();
            
            // Step 6: Create interactive objects
            this.updateLoading(70, 'Placing interactive objects...');
            await this.delay(100);
            this.createInteractiveObjects();
            
            // Step 7: Initialize UI
            this.updateLoading(80, 'Initializing UI...');
            await this.delay(100);
            this.initializeUI();
            
            // Step 8: Setup controls
            this.updateLoading(90, 'Setting up controls...');
            await this.delay(100);
            this.setupControls();
            
            // Step 9: Final setup
            this.updateLoading(100, 'Ready!');
            await this.delay(500);
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Start game loop
            this.start();
            
            console.log('✅ Initialization complete!');
            this.showNotification('Welcome to Solar System Simulation! Press H for help.');
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.loadingText.textContent = 'Initialization failed!';
            this.loadingDetails.textContent = error.message;
            this.loadingDetails.style.color = '#ff4444';
        }
    }

    /**
     * Initialize renderer
     */
    initializeRenderer() {
        this.renderer = new Renderer();
        const { scene, camera, renderer } = this.renderer.initialize();
        
        this.scene = scene;
        this.camera = camera;
        
        console.log('✓ Renderer ready');
    }

    /**
     * Initialize physics engine
     */
    initializePhysics() {
        this.gravityEngine = new GravityEngine();
        console.log('✓ Physics engine ready');
    }

    /**
     * Initialize lighting
     */
    initializeLighting() {
        this.lightingSystem = new LightingSystem(this.scene);
        this.lightingSystem.initialize();
        console.log('✓ Lighting ready');
    }

    /**
     * Create celestial bodies
     */
    createCelestialBodies() {
        // Create Sun
        const sunConfig = {
            ...CONFIG.CELESTIAL.SUN,
            position: scalePosition(CONFIG.CELESTIAL.SUN.position),
        };
        
        const sun = new Star(sunConfig);
        sun.createMesh(this.scene);
        sun.createLight(this.scene);
        this.gravityEngine.addBody(sun);
        this.celestialBodies.sun = sun;
        
        // Create sun light for lighting system
        this.lightingSystem.createSunLight(sun);
        
        // Create Planet 1 (spawn planet)
        const planet1Config = {
            ...CONFIG.CELESTIAL.PLANET1,
            position: scalePosition(CONFIG.CELESTIAL.PLANET1.position),
        };
        
        const planet1 = new Planet(planet1Config);
        planet1.createMesh(this.scene);
        planet1.createOrbitLine(this.scene);
        this.gravityEngine.addBody(planet1);
        this.celestialBodies.planet1 = planet1;
        
        // Create Planet 2
        const planet2Config = {
            ...CONFIG.CELESTIAL.PLANET2,
            position: scalePosition(CONFIG.CELESTIAL.PLANET2.position),
        };
        
        const planet2 = new Planet(planet2Config);
        planet2.createMesh(this.scene);
        planet2.createOrbitLine(this.scene);
        this.gravityEngine.addBody(planet2);
        this.celestialBodies.planet2 = planet2;
        
        // Create Moon
        const moon1Config = {
            ...CONFIG.CELESTIAL.MOON1,
            position: scalePosition(CONFIG.CELESTIAL.MOON1.position),
        };
        
        const moon1 = new Moon(moon1Config);
        moon1.parentBody = planet1; // Set parent reference
        moon1.createMesh(this.scene);
        moon1.createOrbitLine(this.scene);
        this.gravityEngine.addBody(moon1);
        this.celestialBodies.moon1 = moon1;
        
        console.log('✓ Celestial bodies created');
    }

    /**
     * Create player
     */
    createPlayer() {
        this.player = new Player();
        
        // Spawn on planet 1
        const spawnPlanet = this.celestialBodies.planet1;
        this.player.spawnOnPlanet(spawnPlanet);
        
        // Create player mesh
        this.player.createMesh(this.scene);
        
        // Add to physics
        this.gravityEngine.addBody(this.player);
        
        // Create camera controller
        this.cameraController = new CameraController(this.camera, this.player);
        this.player.setCamera(this.cameraController);
        
        console.log('✓ Player created');
    }

    /**
     * Create interactive objects
     */
    createInteractiveObjects() {
        const spawnPlanet = this.celestialBodies.planet1;
        const playerPos = this.player.position;
        
        // Spawn objects around player
        this.interactiveObjects = InteractiveObject.spawnMultiple(
            playerPos,
            CONFIG.OBJECTS.spawnCount,
            CONFIG.OBJECTS.spawnRadius,
            this.scene
        );
        
        // Add to physics
        this.interactiveObjects.forEach(obj => {
            this.gravityEngine.addBody(obj);
        });
        
        console.log('✓ Interactive objects created');
    }

    /**
     * Initialize UI
     */
    initializeUI() {
        // Performance monitor
        this.performanceMonitor = new PerformanceMonitor(this.renderer, this.gravityEngine);
        
        // Developer menu
        this.devMenu = new DevMenu(this.gravityEngine, this.lightingSystem, this.renderer);
        
        // Coordinates display
        this.coordinatesDisplay = document.getElementById('coordinates-display');
        
        console.log('✓ UI initialized');
    }

    /**
     * Setup controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'f':
                    this.performanceMonitor.toggle();
                    break;
                case 'c':
                    this.coordinatesDisplay.classList.toggle('hidden');
                    break;
                case 'h':
                    document.getElementById('controls-help').classList.toggle('hidden');
                    break;
                case 'p':
                    this.togglePause();
                    break;
            }
        });
        
        console.log('✓ Controls setup');
    }

    /**
     * Start game loop
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    /**
     * Game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = this.renderer.render();
        
        if (!this.isPaused) {
            // Update physics
            this.gravityEngine.update(deltaTime);
            
            // Update player
            this.player.update(deltaTime);
            
            // Update camera
            this.cameraController.update(deltaTime);
            
            // Update interactive objects (planet surface snapping)
            this.interactiveObjects.forEach(obj => {
                const planet = this.celestialBodies.planet1;
                obj.snapToPlanetSurface(planet);
            });
            
            // Update lighting
            this.lightingSystem.update(deltaTime);
        }
        
        // Update UI (always)
        this.performanceMonitor.update(currentTime);
        this.updateCoordinatesDisplay();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update coordinates display
     */
    updateCoordinatesDisplay() {
        if (!this.coordinatesDisplay || this.coordinatesDisplay.classList.contains('hidden')) return;
        
        const state = this.player.getState();
        
        document.getElementById('player-position').textContent = 
            `Position: (${state.position[0].toFixed(1)}, ${state.position[1].toFixed(1)}, ${state.position[2].toFixed(1)})`;
        
        document.getElementById('player-velocity').textContent = 
            `Velocity: (${state.velocity[0].toFixed(2)}, ${state.velocity[1].toFixed(2)}, ${state.velocity[2].toFixed(2)})`;
        
        document.getElementById('current-body').textContent = 
            `On: ${state.currentPlanet}`;
        
        document.getElementById('altitude').textContent = 
            `Altitude: ${state.altitude.toFixed(2)}m`;
    }

    /**
     * Toggle pause
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        this.showNotification(this.isPaused ? 'Paused' : 'Resumed');
    }

    /**
     * Update loading screen
     */
    updateLoading(progress, text, details = '') {
        this.loadingProgress = progress;
        this.loadingProgressBar.style.width = `${progress}%`;
        this.loadingText.textContent = text;
        this.loadingDetails.textContent = details;
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        this.loadingScreen.classList.add('fade-out');
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500);
    }

    /**
     * Show notification
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    /**
     * Helper delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new SolarSystemGame();
    game.initialize();
    
    // Make game accessible globally for debugging
    window.game = game;
});

export default SolarSystemGame;
