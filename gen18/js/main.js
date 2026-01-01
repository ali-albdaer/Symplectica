/**
 * Main Game Loop
 * Orchestrates all systems: physics, rendering, input, and entities
 */
class GameEngine {
    constructor() {
        try {
            this.initializeSystems();
            this.setupControlBindings();
            this.createWorld();
            this.startGameLoop();
            
            DebugLog.info('Game Engine: Initialized and ready');
        } catch (error) {
            console.error('%c[GameEngine] CRITICAL ERROR', 'color: red; font-weight: bold;', error);
            DebugLog.error(`Game Engine initialization failed: ${error.message}`);
            this.displayCriticalError(error);
        }
    }

    /**
     * Initialize all core systems
     */
    initializeSystems() {
        // Get canvas
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Physics
        this.physicsEngine = new PhysicsEngine();
        DebugLog.info('Physics Engine: Ready');

        // Renderer
        this.renderer = new Renderer(canvas);
        DebugLog.info('Renderer: Ready');

        // Input
        this.inputHandler = new InputHandler(canvas);
        window.InputHandler = this.inputHandler;
        DebugLog.info('Input Handler: Ready');

        // Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new CameraController(canvas, aspect);
        DebugLog.info('Camera Controller: Ready');

        // Entity Manager
        this.entityManager = new EntityManager();
        DebugLog.info('Entity Manager: Ready');

        // Telemetry
        this.telemetry = new Telemetry();
        DebugLog.info('Telemetry: Ready');

        // Dev Console
        this.devConsole = new DevConsole();
        window.DevConsole = this.devConsole;
        DebugLog.info('Dev Console: Ready');

        // Game state
        this.running = true;
        this.paused = false;
        this.deltaTime = 0;
        this.lastFrameTime = performance.now();
        this.player = null;
        this.sun = null;
    }

    /**
     * Setup keyboard and input bindings
     */
    setupControlBindings() {
        document.addEventListener('keydown', (e) => {
            // Dev console toggle
            if (e.key === '/') {
                this.devConsole.toggle();
                e.preventDefault();
            }

            // Telemetry toggle
            if (e.key === 'Tab') {
                this.telemetry.toggle();
                e.preventDefault();
            }

            // Free flight toggle
            if (e.key === 'f' && !this.devConsole.isOpen) {
                if (this.player) {
                    this.player.toggleFreeFlyMode();
                }
                e.preventDefault();
            }

            // Escape to unlock pointer
            if (e.key === 'Escape') {
                this.inputHandler.releasePointerLock();
                e.preventDefault();
            }
        });

        // Lock pointer on canvas click
        this.renderer.canvas.addEventListener('click', () => {
            if (!this.devConsole.isOpen) {
                this.inputHandler.requestPointerLock();
            }
        });

        // Prevent context menu on right click
        this.renderer.canvas.addEventListener('contextmenu', (e) => {
            if (!this.devConsole.isOpen) {
                e.preventDefault();
            }
        });
    }

    /**
     * Create world with celestial bodies and player
     */
    createWorld() {
        try {
            // Create celestial bodies
            for (const bodyConfig of Config.celestialBodies) {
                this.createCelestialBody(bodyConfig);
            }

            // Create interactive objects
            for (const objConfig of Config.interactiveObjects) {
                this.createInteractiveObject(objConfig);
            }

            // Create player
            this.createPlayer();

            // Initialize sun light
            if (this.sun) {
                this.renderer.initializeSunLight(this.sun.position);
            }

            DebugLog.info(`World created: ${this.entityManager.getCount()} entities`);
        } catch (error) {
            DebugLog.error(`World creation failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create celestial body
     */
    createCelestialBody(config) {
        const entity = new CelestialBody(this.entityManager.nextId++, config);
        
        // Register with entity manager
        this.entityManager.entities.set(entity.id, entity);
        this.entityManager.entityList.push(entity);
        if (!this.entityManager.groups.has(entity.type)) {
            this.entityManager.groups.set(entity.type, []);
        }
        this.entityManager.groups.get(entity.type).push(entity);
        
        // Create mesh
        const mesh = entity.createMesh(this.renderer.fidelity);
        entity.mesh = mesh;
        
        // Add to renderer
        if (mesh) {
            this.renderer.scene.add(mesh);
        }

        // Create physics body (static - they're moved by gravity interactions)
        const sphereShape = new CANNON.Sphere(config.sceneRadius);
        entity.physicsBody = this.physicsEngine.addBody(entity.id, {
            mass: config.mass, // Non-zero for gravity calculations
            shape: sphereShape,
            position: new CANNON.Vec3(config.position.x, config.position.y, config.position.z),
            velocity: new CANNON.Vec3(config.velocity.x, config.velocity.y, config.velocity.z),
            linearDamping: 0,
            angularDamping: 0
        });

        // Store reference to sun
        if (config.type === 'star') {
            this.sun = entity;
        }

        DebugLog.info(`Celestial body created: ${config.name}`);
        return entity;
    }

    /**
     * Create interactive object
     */
    createInteractiveObject(config) {
        const entity = new Entity(this.entityManager.nextId++, config);
        
        // Register with entity manager
        this.entityManager.entities.set(entity.id, entity);
        this.entityManager.entityList.push(entity);
        if (!this.entityManager.groups.has(entity.type)) {
            this.entityManager.groups.set(entity.type, []);
        }
        this.entityManager.groups.get(entity.type).push(entity);

        // Create mesh based on type
        let geometry, material;
        
        material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(config.color),
            metalness: 0.3,
            roughness: 0.7
        });

        switch (config.type) {
            case 'box':
                geometry = new THREE.BoxGeometry(config.size.x, config.size.y, config.size.z);
                break;
            case 'sphere':
                geometry = new THREE.IcosahedronGeometry(config.radius, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(config.radius, config.radius, config.height, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        entity.createMesh(geometry, material);
        
        // Add mesh to scene
        if (entity.mesh) {
            this.renderer.scene.add(entity.mesh);
        }

        // Create physics body
        let shape;
        switch (config.type) {
            case 'box':
                shape = new CANNON.Box(new CANNON.Vec3(config.size.x / 2, config.size.y / 2, config.size.z / 2));
                break;
            case 'sphere':
                shape = new CANNON.Sphere(config.radius);
                break;
            case 'cylinder':
                shape = new CANNON.Cylinder(config.radius, config.radius, config.height, 32);
                break;
            default:
                shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        }

        entity.physicsBody = this.physicsEngine.addBody(entity.id, {
            mass: config.mass,
            shape: shape,
            position: new CANNON.Vec3(config.position.x, config.position.y, config.position.z),
            velocity: new CANNON.Vec3(config.velocity.x, config.velocity.y, config.velocity.z)
        });

        DebugLog.info(`Interactive object created: ${config.name}`);
        return entity;
    }

    /**
     * Create player
     */
    createPlayer() {
        this.player = new Player(this.entityManager.nextId++, this.renderer.getScene());
        
        // Create physics body
        this.player.createPhysicsBody(this.physicsEngine);

        // Position player near earth
        const earthEntity = this.entityManager.find(e => e.name === 'Earth')[0];
        if (earthEntity) {
            const surfaceHeight = earthEntity.sceneRadius + 5;
            this.player.setPosition(
                earthEntity.position.x,
                earthEntity.position.y + surfaceHeight,
                earthEntity.position.z
            );
        }

        // Don't add to entity manager's list - handled separately
        DebugLog.info('Player created');
    }

    /**
     * Update game state
     */
    update() {
        // Calculate delta time
        const now = performance.now();
        this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.033); // Cap at 30ms
        this.lastFrameTime = now;

        if (this.paused) {
            this.deltaTime = 0;
        }

        try {
            // Update input
            this.inputHandler.update();

            // Get movement and look input
            const moveInput = this.inputHandler.getMovementInput();
            const lookInput = this.inputHandler.getLookInput();

            // Update camera
            this.camera.update(this.player, this.deltaTime, lookInput);
            
            // Update player movement
            if (this.player && !this.devConsole.isOpen) {
                this.player.setMovementInput(moveInput.x, moveInput.y, moveInput.z);
                this.player.applyMovement(this.deltaTime, this.camera.getForwardDirection());

                // Handle jump
                if (this.inputHandler.isJumpPressed()) {
                    this.player.jump();
                }

                // Handle grab
                if (this.inputHandler.wasKeyPressed('') && this.inputHandler.rightMouseDown) {
                    this.player.grabObject({}, this.physicsEngine);
                } else if (!this.inputHandler.rightMouseDown && this.player.heldObject) {
                    this.player.releaseObject();
                }
            }

            // Get all entities
            const allEntities = this.entityManager.getAll();
            if (this.player) {
                allEntities.push(this.player);
            }

            // Apply gravitational forces (N-body)
            this.physicsEngine.applyGravitationalForces(allEntities);

            // Update physics
            this.physicsEngine.update(this.deltaTime);

            // Update entities
            this.entityManager.updateAll(this.deltaTime);
            if (this.player) {
                this.player.update(this.deltaTime, allEntities);
            }

            // Update LOD
            this.renderer.updateLOD(allEntities, this.camera.camera.position);

            // Frustum culling
            this.renderer.performFrustumCulling(allEntities);

            // Update telemetry
            this.telemetry.update(this.player, this.renderer, allEntities.length);

        } catch (error) {
            DebugLog.error(`Update error: ${error.message}`);
        }
    }

    /**
     * Render frame
     */
    render() {
        try {
            this.renderer.render(this.camera.camera);
        } catch (error) {
            DebugLog.error(`Render error: ${error.message}`);
        }
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
        DebugLog.info('Game loop started');
    }

    /**
     * Display critical error on screen
     */
    displayCriticalError(error) {
        const debugEl = document.getElementById('debug-overlay');
        if (debugEl) {
            debugEl.classList.add('active');
            debugEl.innerHTML = `
                <strong>CRITICAL ERROR</strong><br>
                ${error.message}<br><br>
                Stack: ${error.stack}
            `;
        }
    }

    /**
     * Pause/resume
     */
    setPaused(paused) {
        this.paused = paused;
        DebugLog.info(`Game ${paused ? 'paused' : 'resumed'}`);
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        Config.physics.timeScale = Math.max(0, scale);
    }

    /**
     * Get game state
     */
    getState() {
        return {
            running: this.running,
            paused: this.paused,
            deltaTime: this.deltaTime,
            entityCount: this.entityManager.getCount() + (this.player ? 1 : 0),
            playerPosition: this.player ? this.player.position.toArray() : null
        };
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.game = new GameEngine();
    });
} else {
    window.game = new GameEngine();
}
