/**
 * Game.js
 * Main game class that initializes and manages all systems.
 * This is the central hub that connects physics, rendering, entities, and UI.
 */

import * as THREE from 'three';
import { CAMERA, PHYSICS, DEBUG, QUALITY_PRESETS, configManager, validateOrbitalStability } from '../config/GlobalConfig.js';
import { PhysicsEngine } from '../physics/PhysicsEngine.js';
import { SolarSystemManager } from '../entities/SolarSystemManager.js';
import { PlayerController } from '../entities/PlayerController.js';
import { CameraController } from '../entities/CameraController.js';
import { InteractiveObjectManager } from '../entities/InteractiveObjects.js';
import { LightingSystem } from '../rendering/LightingSystem.js';
import { SimpleBloom } from '../rendering/PostProcessing.js';
import { DevMenu } from '../ui/DevMenu.js';
import { DebugOverlay } from '../ui/DebugOverlay.js';
import { HUD } from '../ui/HUD.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { DebugLogger, loadingTracker } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Game');

export class Game {
    constructor() {
        // Core systems
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Game systems
        this.physics = null;
        this.solarSystem = null;
        this.player = null;
        this.cameraController = null;
        this.interactiveObjects = null;
        this.lighting = null;
        this.postProcessing = null;
        
        // UI systems
        this.devMenu = null;
        this.debugOverlay = null;
        this.hud = null;
        this.loadingScreen = null;
        
        // State
        this.isRunning = false;
        this.isPaused = false;
        this.lastFrameTime = 0;
        this.qualityLevel = 'medium';
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSCheck = 0;
        
        logger.info('Game instance created');
    }

    /**
     * Initialize all game systems
     */
    async init() {
        logger.mark('gameInit');
        
        // Show loading screen
        this.loadingScreen = new LoadingScreen();
        
        try {
            loadingTracker.startTask('init-renderer', 'Initializing renderer');
            await this.initRenderer();
            loadingTracker.completeTask('init-renderer', true);
            
            loadingTracker.startTask('init-physics', 'Initializing physics engine');
            await this.initPhysics();
            loadingTracker.completeTask('init-physics', true);
            
            loadingTracker.startTask('init-solar-system', 'Creating solar system');
            await this.initSolarSystem();
            loadingTracker.completeTask('init-solar-system', true);
            
            loadingTracker.startTask('init-player', 'Spawning player');
            await this.initPlayer();
            loadingTracker.completeTask('init-player', true);
            
            loadingTracker.startTask('init-objects', 'Creating interactive objects');
            await this.initInteractiveObjects();
            loadingTracker.completeTask('init-objects', true);
            
            loadingTracker.startTask('init-lighting', 'Setting up lighting');
            await this.initLighting();
            loadingTracker.completeTask('init-lighting', true);
            
            loadingTracker.startTask('init-ui', 'Initializing UI');
            await this.initUI();
            loadingTracker.completeTask('init-ui', true);
            
            // Setup input handlers
            this.setupInputHandlers();
            
            // Validate orbital stability
            validateOrbitalStability();
            
            logger.measure('Game initialized', 'gameInit');
            logger.info('All systems initialized successfully!');
            
            // Hide loading screen and start
            this.loadingScreen.hide();
            this.start();
            
        } catch (error) {
            logger.error('Failed to initialize game', error);
            this.loadingScreen.showError(error.message);
            throw error;
        }
    }

    /**
     * Initialize Three.js renderer and scene
     */
    async initRenderer() {
        logger.info('Initializing renderer...');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000005);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CAMERA.fov,
            window.innerWidth / window.innerHeight,
            CAMERA.near,
            CAMERA.far
        );
        
        // Create renderer
        const quality = QUALITY_PRESETS[this.qualityLevel];
        this.renderer = new THREE.WebGLRenderer({
            antialias: quality.antialiasing,
            powerPreference: 'high-performance',
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = quality.shadowsEnabled;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        logger.info(`Renderer initialized: ${window.innerWidth}x${window.innerHeight}`);
    }

    /**
     * Initialize physics engine
     */
    async initPhysics() {
        logger.info('Initializing physics engine...');
        this.physics = new PhysicsEngine();
    }

    /**
     * Initialize solar system with celestial bodies
     */
    async initSolarSystem() {
        logger.info('Creating solar system...');
        this.solarSystem = new SolarSystemManager(this.physics, this.scene);
        await this.solarSystem.init();
    }

    /**
     * Initialize player controller
     */
    async initPlayer() {
        logger.info('Initializing player...');
        
        // Create player controller
        this.player = new PlayerController(this.physics, this.solarSystem, this.camera);
        
        // Spawn player on the first planet
        const spawnBody = this.solarSystem.getPlayerSpawnBody();
        const spawnPos = this.solarSystem.getPlayerSpawnPosition();
        
        this.player.spawn(spawnPos, spawnBody);
        
        // Add player mesh to scene
        this.scene.add(this.player.getObject3D());
        
        // Create camera controller
        this.cameraController = new CameraController(this.camera, this.player);
        
        logger.info(`Player spawned on ${spawnBody?.name || 'unknown body'}`);
    }

    /**
     * Initialize interactive objects
     */
    async initInteractiveObjects() {
        logger.info('Creating interactive objects...');
        
        this.interactiveObjects = new InteractiveObjectManager(this.physics, this.scene);
        
        // Spawn objects near player
        const spawnBody = this.solarSystem.getPlayerSpawnBody();
        this.interactiveObjects.spawnNearPlayer(this.player.position, spawnBody);
    }

    /**
     * Initialize lighting system
     */
    async initLighting() {
        logger.info('Setting up lighting...');
        
        this.lighting = new LightingSystem(this.scene, this.qualityLevel);
        
        // Initialize post-processing
        if (QUALITY_PRESETS[this.qualityLevel].bloomEnabled) {
            this.postProcessing = new SimpleBloom(
                this.renderer,
                this.scene,
                this.camera,
                this.qualityLevel
            );
        }
    }

    /**
     * Initialize UI systems
     */
    async initUI() {
        logger.info('Initializing UI...');
        
        this.debugOverlay = new DebugOverlay(this);
        this.hud = new HUD(this);
        this.devMenu = new DevMenu(this);
    }

    /**
     * Setup global input handlers
     */
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            // Pause
            if (e.code === 'KeyP') {
                this.togglePause();
            }
            
            // Time controls
            if (e.code === 'BracketLeft') {
                this.adjustTimeScale(0.5);
            }
            if (e.code === 'BracketRight') {
                this.adjustTimeScale(2);
            }
            
            // Reset time scale
            if (e.code === 'Backslash') {
                this.physics.setTimeScale(1);
                this.hud?.showNotification('Time scale reset to 1x', 2000);
            }
        });
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        this.physics.setPaused(this.isPaused);
        
        if (this.hud) {
            this.hud.showNotification(
                this.isPaused ? '⏸ Paused' : '▶ Resumed',
                1500,
                'info'
            );
        }
        
        logger.info(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
    }

    /**
     * Adjust simulation time scale
     */
    adjustTimeScale(multiplier) {
        const newScale = this.physics.timeScale * multiplier;
        this.physics.setTimeScale(newScale);
        
        if (this.hud) {
            this.hud.showNotification(`Time: ${newScale.toFixed(1)}x`, 1500);
        }
    }

    /**
     * Set quality preset
     */
    setQualityPreset(preset) {
        if (!QUALITY_PRESETS[preset]) {
            logger.warn(`Unknown quality preset: ${preset}`);
            return;
        }
        
        this.qualityLevel = preset;
        const quality = QUALITY_PRESETS[preset];
        
        // Update renderer
        this.renderer.shadowMap.enabled = quality.shadowsEnabled;
        
        // Update lighting
        this.lighting?.setQuality(preset);
        
        // Update post-processing
        if (this.postProcessing) {
            this.postProcessing.setEnabled(quality.bloomEnabled);
        }
        
        logger.info(`Quality set to: ${preset}`);
        this.hud?.showNotification(`Quality: ${preset}`, 2000, 'success');
    }

    /**
     * Main game loop
     */
    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        
        logger.info('Game loop started');
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
        logger.info('Game loop stopped');
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        const cappedDelta = Math.min(deltaTime, 100);
        
        this.update(cappedDelta);
        this.render();
        
        this.frameCount++;
    }

    /**
     * Update all game systems
     */
    update(deltaTime) {
        // Update physics
        if (!this.isPaused) {
            this.physics.update(deltaTime);
        }
        
        // Update solar system (celestial body positions)
        this.solarSystem.update(deltaTime, this.physics.timeScale);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update camera
        this.cameraController.update(deltaTime);
        
        // Update interactive objects
        this.interactiveObjects.update(deltaTime);
        
        // Update lighting (sun position affects lights)
        const sun = this.solarSystem.getBody('sun');
        if (sun) {
            this.lighting.update(sun.position, this.player.position);
        }
        
        // Update UI
        this.debugOverlay.update(deltaTime);
        this.hud.update(deltaTime);
        this.devMenu.update();
    }

    /**
     * Render the scene
     */
    render() {
        if (this.postProcessing && this.postProcessing.enabled) {
            this.postProcessing.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        
        if (this.postProcessing) {
            this.postProcessing.setSize(width, height);
        }
        
        logger.debug(`Window resized: ${width}x${height}`);
    }

    /**
     * Cleanup and dispose resources
     */
    dispose() {
        logger.info('Disposing game resources...');
        
        this.stop();
        
        this.solarSystem?.dispose();
        this.interactiveObjects?.dispose();
        this.player?.dispose();
        this.cameraController?.dispose();
        this.lighting?.dispose();
        this.postProcessing?.dispose();
        
        this.renderer?.dispose();
        
        logger.info('Game disposed');
    }
}
