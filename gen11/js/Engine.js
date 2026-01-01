/**
 * Engine.js - Core Game Engine
 * 
 * Main game loop, scene management, and orchestration of all subsystems.
 * Implements a robust render loop with fixed timestep physics and variable rendering.
 */

import Config from './Config.js';

export class Engine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        
        // Subsystems (injected after creation)
        this.physicsWorld = null;
        this.player = null;
        this.uiManager = null;
        
        // Celestial bodies and objects
        this.celestialBodies = [];
        this.interactiveObjects = [];
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 0;
        this.lastFpsUpdate = 0;
        this.deltaTime = 0;
        this.frameTime = 0;
        
        // Engine state
        this.isRunning = false;
        this.isPaused = false;
        
        // Animation frame ID
        this.animationId = null;
        
        // Lighting
        this.sunLight = null;
        
        // Debug helpers
        this.axesHelper = null;
        this.gridHelper = null;
    }

    /**
     * Initialize the engine
     */
    async init() {
        try {
            this.log('Initializing Engine...', 'info');
            
            // Setup Three.js scene
            this.setupScene();
            this.setupRenderer();
            this.setupCamera();
            this.setupLighting();
            this.setupBackground();
            
            // Setup debug helpers if enabled
            if (Config.debug.showAxesHelper) {
                this.axesHelper = new THREE.AxesHelper(100);
                this.scene.add(this.axesHelper);
            }
            
            if (Config.debug.showGridHelper) {
                this.gridHelper = new THREE.GridHelper(1000, 50);
                this.scene.add(this.gridHelper);
            }
            
            // Handle window resize
            window.addEventListener('resize', () => this.onWindowResize());
            
            this.log('Engine initialized successfully', 'success');
            return true;
        } catch (error) {
            this.log(`Engine initialization failed: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(Config.rendering.backgroundColor);
    }

    /**
     * Setup WebGL renderer
     */
    setupRenderer() {
        const fidelity = Config.rendering.fidelity[Config.rendering.currentFidelity];
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: fidelity.antialias,
            powerPreference: 'high-performance',
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Shadow settings
        if (Config.rendering.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Add canvas to DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
    }

    /**
     * Setup camera
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            Config.rendering.fov,
            window.innerWidth / window.innerHeight,
            Config.rendering.near,
            Config.rendering.far
        );
        
        // Initial camera position (will be controlled by player)
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * Setup lighting (Sun as the sole light source)
     */
    setupLighting() {
        // The Sun will have a PointLight attached to it
        // This is a placeholder - will be replaced when Sun is created
        const ambientLight = new THREE.AmbientLight(0x111111, 0.1); // Very dim ambient
        this.scene.add(ambientLight);
    }

    /**
     * Create the sun's point light
     */
    createSunLight(position, intensity) {
        this.sunLight = new THREE.PointLight(0xFFFFFF, intensity, 0, 2);
        this.sunLight.position.copy(position);
        
        if (Config.rendering.enableShadows) {
            this.sunLight.castShadow = true;
            
            const shadowMapSize = Config.rendering.fidelity[Config.rendering.currentFidelity].shadowMapSize;
            this.sunLight.shadow.mapSize.width = shadowMapSize;
            this.sunLight.shadow.mapSize.height = shadowMapSize;
            this.sunLight.shadow.camera.near = 1;
            this.sunLight.shadow.camera.far = 10000;
            this.sunLight.shadow.bias = Config.rendering.shadowBias;
            this.sunLight.shadow.normalBias = Config.rendering.shadowNormalBias;
        }
        
        this.scene.add(this.sunLight);
    }

    /**
     * Setup background star field
     */
    setupBackground() {
        if (!Config.rendering.starField.enabled) return;
        
        const starGeometry = new THREE.BufferGeometry();
        const starCount = Config.rendering.starField.count;
        const positions = new Float32Array(starCount * 3);
        const spread = Config.rendering.starField.spread;
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * spread;
            positions[i + 1] = (Math.random() - 0.5) * spread;
            positions[i + 2] = (Math.random() - 0.5) * spread;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: Config.rendering.starField.size,
            sizeAttenuation: false,
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    /**
     * Add a celestial body to the engine
     */
    addCelestialBody(body) {
        this.celestialBodies.push(body);
        this.scene.add(body.mesh);
        
        // If this is the sun, create the light
        if (body.config.type === 'star') {
            this.createSunLight(body.mesh.position, body.config.luminosity);
        }
    }

    /**
     * Add an interactive object to the engine
     */
    addInteractiveObject(obj) {
        this.interactiveObjects.push(obj);
        this.scene.add(obj.mesh);
    }

    /**
     * Inject subsystems
     */
    setPhysicsWorld(physicsWorld) {
        this.physicsWorld = physicsWorld;
    }

    setPlayer(player) {
        this.player = player;
        if (player.mesh) {
            this.scene.add(player.mesh);
        }
    }

    setUIManager(uiManager) {
        this.uiManager = uiManager;
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.clock.start();
        this.lastFpsUpdate = performance.now();
        
        this.log('Engine started', 'success');
        this.animate();
    }

    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.log('Engine stopped', 'warning');
    }

    /**
     * Pause/unpause the simulation
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        this.log(`Engine ${this.isPaused ? 'paused' : 'resumed'}`, 'info');
    }

    /**
     * Main animation loop (Variable timestep for rendering)
     */
    animate() {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const frameStart = performance.now();
        
        // Get delta time
        this.deltaTime = this.clock.getDelta();
        
        if (!this.isPaused) {
            // Update subsystems
            this.update(this.deltaTime);
        }
        
        // Render
        this.render();
        
        // Performance tracking
        this.updatePerformanceMetrics(frameStart);
    }

    /**
     * Update all subsystems
     */
    update(deltaTime) {
        // Apply time scale
        const scaledDelta = deltaTime * Config.physics.timeScale;
        
        // Update physics world (fixed timestep internally)
        if (this.physicsWorld) {
            this.physicsWorld.update(deltaTime);
        }
        
        // Update celestial bodies
        for (const body of this.celestialBodies) {
            body.update(scaledDelta);
        }
        
        // Update interactive objects
        for (const obj of this.interactiveObjects) {
            if (obj.update) {
                obj.update(scaledDelta);
            }
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update camera position based on player
        if (this.player && this.camera) {
            this.updateCamera();
        }
        
        // Update UI
        if (this.uiManager) {
            this.uiManager.update();
        }
    }

    /**
     * Update camera to follow player
     */
    updateCamera() {
        // Camera is controlled by the Player class
        // Player updates camera position/rotation each frame
    }

    /**
     * Render the scene
     */
    render() {
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(frameStart) {
        this.frameCount++;
        this.frameTime = performance.now() - frameStart;
        
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Performance warning
            if (Config.debug.enablePerformanceMonitoring && 
                this.fps < Config.debug.performanceWarningThreshold) {
                this.log(`Low FPS detected: ${this.fps}`, 'warning');
            }
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Update graphics settings
     */
    updateGraphicsSettings(settings) {
        if (settings.fidelity) {
            Config.rendering.currentFidelity = settings.fidelity;
            const fidelity = Config.rendering.fidelity[settings.fidelity];
            
            // Update shadow quality
            if (this.sunLight && this.sunLight.shadow) {
                this.sunLight.shadow.mapSize.width = fidelity.shadowMapSize;
                this.sunLight.shadow.mapSize.height = fidelity.shadowMapSize;
                this.sunLight.shadow.map = null; // Force regeneration
            }
        }
        
        if (settings.enableShadows !== undefined) {
            Config.rendering.enableShadows = settings.enableShadows;
            this.renderer.shadowMap.enabled = settings.enableShadows;
            if (this.sunLight) {
                this.sunLight.castShadow = settings.enableShadows;
            }
        }
        
        if (settings.fov) {
            Config.rendering.fov = settings.fov;
            this.camera.fov = settings.fov;
            this.camera.updateProjectionMatrix();
        }
        
        this.log('Graphics settings updated', 'success');
    }

    /**
     * Get a body by name
     */
    getBodyByName(name) {
        return this.celestialBodies.find(body => body.config.name === name) ||
               this.interactiveObjects.find(obj => obj.name === name);
    }

    /**
     * Logging utility
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        if (this.uiManager) {
            this.uiManager.addLog(logMessage, type);
        }
        
        // Console logging
        switch (type) {
            case 'error':
                console.error(logMessage);
                break;
            case 'warning':
                console.warn(logMessage);
                break;
            case 'success':
            case 'info':
            default:
                console.log(logMessage);
                break;
        }
    }

    /**
     * Get engine statistics
     */
    getStats() {
        return {
            fps: this.fps,
            frameTime: this.frameTime.toFixed(2),
            bodies: this.celestialBodies.length + this.interactiveObjects.length,
            isPaused: this.isPaused,
        };
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        this.stop();
        
        // Dispose of geometries and materials
        this.scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Dispose renderer
        this.renderer.dispose();
        
        this.log('Engine disposed', 'info');
    }
}

export default Engine;
