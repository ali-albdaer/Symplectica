/**
 * Engine.js - Main Game Engine
 * Orchestrates all systems: rendering, physics, input, and game logic
 */

import { Config } from './Config.js';
import { Logger, EventBus, Utils } from './Utils.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { Star, Planet, Moon, BlackHole } from './CelestialBody.js';
import { Player } from './Player.js';
import { InputManager } from './InputManager.js';
import { CameraController } from './CameraController.js';
import { UIManager } from './UIManager.js';
import { InteractiveObjectFactory } from './InteractiveObject.js';
import { Shaders, createShaderMaterial } from './Shaders.js';

export class Engine {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        
        // Core systems
        this.renderer = null;
        this.scene = null;
        this.physicsWorld = null;
        this.inputManager = null;
        this.cameraController = null;
        this.uiManager = null;
        this.player = null;
        
        // Game objects
        this.celestialBodies = new Map();
        this.interactiveFactory = null;
        
        // Timing
        this.clock = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        
        // Fidelity settings
        this.fidelityLevel = Config.rendering.fidelityLevel;
        this.fidelitySettings = Config.rendering.fidelitySettings[this.fidelityLevel];
        
        // Debug objects
        this.orbitLines = [];
        this.debugHelpers = [];
        
        Logger.system('Engine instance created');
    }

    /**
     * Initialize all engine systems
     */
    async initialize() {
        try {
            Logger.system('Engine initialization started');
            
            // Create UI manager first for loading screen
            this.uiManager = new UIManager();
            this.uiManager.showLoading('Initializing Solar System...');
            
            // Check WebGL support
            if (!Utils.isWebGL2Available()) {
                throw new Error('WebGL 2 is not available. Please use a modern browser.');
            }
            
            this.uiManager.updateLoading(0.1, 'Creating renderer...');
            await this.initRenderer();
            
            this.uiManager.updateLoading(0.2, 'Setting up scene...');
            await this.initScene();
            
            this.uiManager.updateLoading(0.3, 'Initializing physics...');
            await this.initPhysics();
            
            this.uiManager.updateLoading(0.4, 'Creating celestial bodies...');
            await this.initCelestialBodies();
            
            this.uiManager.updateLoading(0.6, 'Setting up input...');
            await this.initInput();
            
            this.uiManager.updateLoading(0.7, 'Creating player...');
            await this.initPlayer();
            
            this.uiManager.updateLoading(0.8, 'Setting up camera...');
            await this.initCamera();
            
            this.uiManager.updateLoading(0.9, 'Spawning objects...');
            await this.initInteractiveObjects();
            
            this.uiManager.updateLoading(1.0, 'Ready!');
            
            // Setup event listeners
            this.setupEvents();
            
            // Initialize clock
            this.clock = new THREE.Clock();
            
            this.isInitialized = true;
            
            // Small delay before hiding loading screen
            await Utils.sleep(500);
            this.uiManager.hideLoading();
            
            Logger.system('Engine initialization complete');
            
        } catch (error) {
            Logger.error('Engine initialization failed', error);
            this.uiManager.showFatalError(
                'Initialization Failed',
                error.message,
                error.stack
            );
            throw error;
        }
    }

    /**
     * Initialize Three.js renderer
     */
    async initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.fidelitySettings.antialias,
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Shadow settings
        if (this.fidelitySettings.shadowsEnabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Tone mapping for better HDR
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Output encoding
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        document.body.appendChild(this.renderer.domElement);
        
        Logger.render('Renderer initialized', { 
            antialias: this.fidelitySettings.antialias,
            shadows: this.fidelitySettings.shadowsEnabled 
        });
    }

    /**
     * Initialize the scene
     */
    async initScene() {
        this.scene = new THREE.Scene();
        
        // Create space skybox
        this.createSkybox();
        
        // NO ambient light - sun is the only light source
        // But add minimal ambient for debugging visibility
        if (Config.debug.showColliders) {
            const debugAmbient = new THREE.AmbientLight(0xFFFFFF, 0.1);
            this.scene.add(debugAmbient);
        }
        
        Logger.render('Scene initialized');
    }

    /**
     * Create space skybox with stars
     */
    createSkybox() {
        const skyboxGeometry = new THREE.SphereGeometry(40000, 32, 32);
        
        const skyboxMaterial = new THREE.ShaderMaterial({
            vertexShader: Shaders.spaceSkybox.vertexShader,
            fragmentShader: Shaders.spaceSkybox.fragmentShader,
            uniforms: {
                time: { value: 0 },
                starDensity: { value: 0.015 }
            },
            side: THREE.BackSide,
            depthWrite: false
        });
        
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(this.skybox);
    }

    /**
     * Initialize physics world
     */
    async initPhysics() {
        this.physicsWorld = new PhysicsWorld();
        Logger.physics('Physics world initialized');
    }

    /**
     * Create all celestial bodies from config
     */
    async initCelestialBodies() {
        const bodies = Config.celestialBodies;
        
        // Create the Sun (star)
        const sun = new Star(bodies.sun, this.scene, this.fidelitySettings);
        this.celestialBodies.set('sun', sun);
        this.physicsWorld.addBody(sun);
        
        // Create Planet 1 (Terra)
        const planet1 = new Planet(bodies.planet1, this.scene, this.fidelitySettings);
        this.celestialBodies.set('planet1', planet1);
        this.physicsWorld.addBody(planet1);
        
        // Create Planet 2 (Crimson)
        const planet2 = new Planet(bodies.planet2, this.scene, this.fidelitySettings);
        this.celestialBodies.set('planet2', planet2);
        this.physicsWorld.addBody(planet2);
        
        // Create Moon (orbits Planet 1)
        const moon1 = new Moon(bodies.moon1, this.scene, this.fidelitySettings, planet1);
        this.celestialBodies.set('moon1', moon1);
        this.physicsWorld.addBody(moon1);
        planet1.addMoon(moon1);
        
        // Create debug orbit lines if enabled
        if (Config.debug.showOrbits) {
            this.createOrbitLines();
        }
        
        Logger.system(`Created ${this.celestialBodies.size} celestial bodies`);
    }

    /**
     * Create orbit visualization lines
     */
    createOrbitLines() {
        // Planet 1 orbit
        const orbit1Radius = Config.celestialBodies.planet1.position.x;
        this.createOrbitLine(orbit1Radius, 0x4488FF, new THREE.Vector3(0, 0, 0));
        
        // Planet 2 orbit (approximate)
        const p2pos = Config.celestialBodies.planet2.position;
        const orbit2Radius = Math.sqrt(p2pos.x * p2pos.x + p2pos.z * p2pos.z);
        this.createOrbitLine(orbit2Radius, 0xCC4422, new THREE.Vector3(0, 0, 0));
    }

    /**
     * Create a single orbit line
     */
    createOrbitLine(radius, color, center) {
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                center.x + Math.cos(angle) * radius,
                center.y,
                center.z + Math.sin(angle) * radius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.3 
        });
        
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.orbitLines.push(line);
    }

    /**
     * Initialize input manager
     */
    async initInput() {
        this.inputManager = new InputManager();
        Logger.input('Input manager initialized');
    }

    /**
     * Initialize player
     */
    async initPlayer() {
        this.player = new Player(this.scene, this.physicsWorld, this.inputManager);
        
        // Spawn player on the configured planet
        const spawnPlanetName = Config.player.spawnPlanet;
        const spawnPlanet = this.celestialBodies.get(spawnPlanetName);
        
        if (spawnPlanet) {
            this.player.spawnOnPlanet(spawnPlanet);
        } else {
            Logger.error(`Spawn planet '${spawnPlanetName}' not found`);
        }
        
        Logger.player('Player initialized');
    }

    /**
     * Initialize camera controller
     */
    async initCamera() {
        this.cameraController = new CameraController(this.scene, this.renderer);
        this.cameraController.setPlayer(this.player);
        Logger.render('Camera controller initialized');
    }

    /**
     * Initialize interactive objects near player
     */
    async initInteractiveObjects() {
        this.interactiveFactory = new InteractiveObjectFactory(this.scene, this.physicsWorld);
        
        if (Config.interactiveObjects.spawnNearPlayer) {
            const spawnPlanet = this.celestialBodies.get(Config.player.spawnPlanet);
            if (spawnPlanet) {
                const spawnPos = this.player.position.clone();
                const surfaceNormal = this.player.upVector.clone();
                this.interactiveFactory.spawnNearPosition(spawnPos, surfaceNormal);
            }
        }
        
        Logger.system('Interactive objects spawned');
    }

    /**
     * Setup global event listeners
     */
    setupEvents() {
        // Grab raycast event
        EventBus.on('raycastForGrab', (data) => {
            const result = this.interactiveFactory.raycast(data.origin, data.direction, data.maxDistance);
            data.callback(result);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
        
        // Global error handler
        window.addEventListener('error', (event) => {
            Logger.error(`Runtime error: ${event.message}`, event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            Logger.error(`Unhandled promise rejection: ${event.reason}`);
        });
    }

    /**
     * Start the game loop
     */
    start() {
        if (!this.isInitialized) {
            Logger.error('Cannot start: Engine not initialized');
            return;
        }
        
        if (this.isRunning) {
            Logger.system('Engine already running');
            return;
        }
        
        this.isRunning = true;
        this.clock.start();
        this.lastTime = performance.now();
        
        Logger.system('Engine started');
        
        this.gameLoop();
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        // Calculate delta time
        const now = performance.now();
        this.deltaTime = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = now;
        this.totalTime += this.deltaTime;
        
        try {
            this.update(this.deltaTime);
            this.render();
        } catch (error) {
            Logger.error('Error in game loop', error);
        }
    }

    /**
     * Update all systems
     */
    update(deltaTime) {
        // Update physics
        this.physicsWorld.update(deltaTime);
        
        // Update celestial bodies
        const cameraPos = this.cameraController.getPosition();
        this.celestialBodies.forEach(body => {
            body.update(deltaTime, cameraPos);
        });
        
        // Update skybox time uniform
        if (this.skybox && this.skybox.material.uniforms) {
            this.skybox.material.uniforms.time.value = this.totalTime;
        }
        
        // Update player
        this.player.update(deltaTime);
        
        // Update camera
        this.cameraController.update(deltaTime);
        
        // Update UI telemetry
        this.updateTelemetry();
        
        // Update debug visualizations
        if (Config.debug.showOrbits) {
            this.updateDebugVisuals();
        }
    }

    /**
     * Render the scene
     */
    render() {
        // Perform frustum culling
        this.performFrustumCulling();
        
        // Render main scene
        this.renderer.render(this.scene, this.cameraController.getCamera());
    }

    /**
     * Perform frustum culling for optimization
     */
    performFrustumCulling() {
        const camera = this.cameraController.getCamera();
        const frustum = new THREE.Frustum();
        const projScreenMatrix = new THREE.Matrix4();
        
        projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);
        
        // Check celestial bodies
        this.celestialBodies.forEach(body => {
            if (body.mesh) {
                const sphere = new THREE.Sphere(body.position, body.radius);
                body.mesh.visible = frustum.intersectsSphere(sphere);
                
                if (body.atmosphere) {
                    body.atmosphere.visible = body.mesh.visible;
                }
            }
        });
    }

    /**
     * Update telemetry display
     */
    updateTelemetry() {
        const playerDebug = this.player.getDebugInfo();
        const { body: nearestBody, distance } = this.physicsWorld.getNearestBody(this.player.position);
        
        const altitude = nearestBody ? distance - nearestBody.radius : 0;
        
        this.uiManager.updateTelemetry({
            position: playerDebug.position,
            velocity: playerDebug.velocity,
            altitude: altitude,
            isFlying: playerDebug.isFlying,
            isGrounded: playerDebug.isGrounded,
            currentPlanet: playerDebug.currentPlanet
        });
    }

    /**
     * Update debug visualizations
     */
    updateDebugVisuals() {
        // Update orbit lines to follow sun (in case sun moves)
        // In this implementation, sun is static, but this supports dynamic systems
    }

    /**
     * Pause the engine
     */
    pause() {
        this.isRunning = false;
        this.clock.stop();
        Logger.system('Engine paused');
    }

    /**
     * Resume the engine
     */
    resume() {
        if (this.isInitialized && !this.isRunning) {
            this.isRunning = true;
            this.clock.start();
            this.lastTime = performance.now();
            Logger.system('Engine resumed');
            this.gameLoop();
        }
    }

    /**
     * Change fidelity level
     */
    setFidelityLevel(level) {
        if (!Config.rendering.fidelitySettings[level]) {
            Logger.error(`Invalid fidelity level: ${level}`);
            return;
        }
        
        this.fidelityLevel = level;
        this.fidelitySettings = Config.rendering.fidelitySettings[level];
        Config.rendering.fidelityLevel = level;
        
        // Update renderer settings
        this.renderer.shadowMap.enabled = this.fidelitySettings.shadowsEnabled;
        
        // Update shadow map sizes
        this.celestialBodies.forEach(body => {
            if (body.light && body.light.shadow) {
                body.light.shadow.mapSize.width = this.fidelitySettings.shadowMapSize;
                body.light.shadow.mapSize.height = this.fidelitySettings.shadowMapSize;
                body.light.shadow.map?.dispose();
                body.light.shadow.map = null;
            }
        });
        
        Logger.system(`Fidelity level set to: ${level}`);
    }

    /**
     * Get a celestial body by name
     */
    getCelestialBody(name) {
        return this.celestialBodies.get(name);
    }

    /**
     * Add a new celestial body at runtime
     */
    addCelestialBody(config) {
        let body;
        
        switch (config.type) {
            case 'star':
                body = new Star(config, this.scene, this.fidelitySettings);
                break;
            case 'planet':
                body = new Planet(config, this.scene, this.fidelitySettings);
                break;
            case 'blackhole':
                body = new BlackHole(config, this.scene, this.fidelitySettings);
                break;
            default:
                body = new Planet(config, this.scene, this.fidelitySettings);
        }
        
        const id = config.id || config.name.toLowerCase().replace(/\s/g, '_');
        this.celestialBodies.set(id, body);
        this.physicsWorld.addBody(body);
        
        Logger.system(`Added celestial body: ${config.name}`);
        return body;
    }

    /**
     * Clean up and dispose all resources
     */
    dispose() {
        this.isRunning = false;
        
        // Dispose celestial bodies
        this.celestialBodies.forEach(body => body.dispose());
        this.celestialBodies.clear();
        
        // Dispose interactive objects
        if (this.interactiveFactory) {
            this.interactiveFactory.dispose();
        }
        
        // Dispose player
        if (this.player) {
            this.player.dispose();
        }
        
        // Dispose camera controller
        if (this.cameraController) {
            this.cameraController.dispose();
        }
        
        // Dispose input manager
        if (this.inputManager) {
            this.inputManager.dispose();
        }
        
        // Dispose UI manager
        if (this.uiManager) {
            this.uiManager.dispose();
        }
        
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
        
        // Dispose orbit lines
        this.orbitLines.forEach(line => {
            line.geometry.dispose();
            line.material.dispose();
            this.scene.remove(line);
        });
        
        // Dispose skybox
        if (this.skybox) {
            this.skybox.geometry.dispose();
            this.skybox.material.dispose();
            this.scene.remove(this.skybox);
        }
        
        Logger.system('Engine disposed');
    }
}

export default Engine;
