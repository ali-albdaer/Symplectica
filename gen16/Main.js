/**
 * Main.js - Game Loop & Initialization
 * Orchestrates all systems and runs the main game loop
 */

class Game {
    constructor() {
        this.config = Config;
        this.physics = null;
        this.renderer = null;
        this.entityManager = null;
        this.player = null;
        this.input = null;
        this.debugUI = null;
        
        this.lastFrameTime = performance.now();
        this.deltaTime = 0;
        this.running = false;
        
        // Verify only THREE is required
        if (typeof THREE === 'undefined') {
            throw new Error('THREE.js library is required and failed to load. Check your CDN connection.');
        }
        
        this.initialize();
    }

    /**
     * Initialize all systems
     */
    async initialize() {
        try {
            console.log('=== GAME INITIALIZATION START ===');
            Logger.info('=== GAME INITIALIZATION ===');
            
            // Initialize input manager
            console.log('Step 1: Initializing InputManager...');
            Logger.info('Initializing InputManager...');
            this.input = new InputManager();
            console.log('✓ InputManager initialized');
            
            // Initialize renderer
            console.log('Step 2: Initializing Renderer...');
            Logger.info('Initializing Renderer...');
            this.renderer = new ThreeRenderer(this.config);
            console.log('✓ Renderer initialized');
            
            // Initialize physics
            console.log('Step 3: Initializing Physics...');
            Logger.info('Initializing Physics...');
            this.physics = new PhysicsEngine(this.config);
            console.log('✓ Physics initialized');
            
            // Initialize debug UI
            console.log('Step 4: Initializing DebugUI...');
            Logger.info('Initializing DebugUI...');
            this.debugUI = new DebugUI(this.config, this.input);
            Logger.init(this.debugUI);
            Logger.setupGlobalErrorHandler(this.debugUI);
            console.log('✓ DebugUI initialized');
            
            // Initialize entity manager
            console.log('Step 5: Initializing EntityManager...');
            Logger.info('Initializing EntityManager...');
            this.entityManager = new EntityManager(this.config, this.physics, this.renderer);
            console.log('✓ EntityManager initialized');
            
            // Create all celestial bodies
            console.log('Step 6: Creating celestial bodies...');
            Logger.info('Creating celestial bodies...');
            this.entityManager.createCelestialBodies();
            console.log(`✓ Created ${Object.keys(this.config.BODIES).length} celestial bodies`);
            
            // Create interactive objects
            console.log('Step 7: Creating interactive objects...');
            Logger.info('Creating interactive objects...');
            this.entityManager.createInteractiveObjects();
            console.log(`✓ Created ${this.config.OBJECTS.length} interactive objects`);
            
            // Initialize player
            console.log('Step 8: Initializing Player...');
            Logger.info('Initializing Player...');
            this.player = new Player(this.config, this.physics, this.renderer, this.input);
            console.log(`✓ Player initialized at ${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)}, ${this.player.position.z.toFixed(2)}`);
            
            // Validate orbital stability
            console.log('Step 9: Validating orbits...');
            const validations = this.config.validateOrbits();
            Logger.info('Orbital validation:');
            for (const [name, data] of Object.entries(validations)) {
                const msg = `  ${name}: error ${data.errorPercent.toFixed(2)}% (stable: ${data.isStable})`;
                console.log(msg);
                Logger.info(msg);
            }
            
            // Setup input handlers
            console.log('Step 10: Setting up input handlers...');
            this.setupInputHandlers();
            console.log('✓ Input handlers configured');
            
            // Initial camera positioning
            console.log('Step 11: Setting initial camera position...');
            const initialCamPos = {
                x: this.player.position.x + 10,
                y: this.player.position.y + 5,
                z: this.player.position.z + 10
            };
            this.player.camera.position.set(initialCamPos.x, initialCamPos.y, initialCamPos.z);
            this.player.camera.lookAt(this.player.position.x, this.player.position.y + 1, this.player.position.z);
            console.log('✓ Initial camera position set');
            
            // Update sun light position
            console.log('Step 12: Updating sun light...');
            const sunPos = this.physics.getPosition('Sun');
            if (sunPos) {
                const sunVector = new THREE.Vector3(sunPos.x, sunPos.y, sunPos.z);
                this.renderer.updateSunLight(sunVector);
                console.log(`✓ Sun light positioned at ${sunPos.x}, ${sunPos.y}, ${sunPos.z}`);
            } else {
                console.warn('Sun position not found, skipping light update');
            }
            
            // Start game loop
            this.running = true;
            console.log('=== INITIALIZATION COMPLETE ===');
            console.log('Starting game loop...');
            Logger.info('Initialization complete. Starting game loop...');
            this.gameLoop();
            
        } catch (error) {
            console.error('=== INITIALIZATION FAILED ===');
            console.error(error);
            Logger.error(`Initialization failed: ${error.message}\n${error.stack}`);
            
            // Show error overlay
            try {
                const overlay = document.getElementById('error-overlay');
                const message = document.getElementById('error-message');
                if (overlay && message) {
                    message.textContent = error.message + '\n\n' + error.stack;
                    overlay.classList.add('active');
                }
            } catch (uiError) {
                console.error('Could not show error UI:', uiError);
            }
        }
    }

    /**
     * Setup input event handlers
     */
    setupInputHandlers() {
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'f':
                    if (!this.input.isUIActive()) {
                        this.player.toggleFlight();
                    }
                    break;
                case 'c':
                    if (!this.input.isUIActive()) {
                        this.player.toggleCameraMode();
                    }
                    break;
                case 't':
                    if (!this.input.isUIActive()) {
                        this.debugUI.toggleTelemetry();
                    }
                    break;
            }
        });
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2 && !this.input.isUIActive()) { // Right-click
                // Try to grab an object
                const raycast = this.renderer.raycast(
                    this.player.camera,
                    this.input.getNormalizedMouseCoords()
                );
                
                if (raycast.hit && raycast.name !== 'Sun' && raycast.distance < this.config.INTERACTION.GRAB_DISTANCE) {
                    this.player.grabObject(raycast.name);
                    this.entityManager.grabObject(raycast.name);
                }
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                if (this.player.isHoldingObject()) {
                    this.entityManager.releaseObject(this.player.heldObject);
                    this.player.releaseObject();
                }
            }
        });
    }

    /**
     * Main game loop
     */
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        if (!this.running) return;
        
        try {
            const now = performance.now();
            this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.016); // Cap at 16ms
            this.lastFrameTime = now;
            
            // Update systems
            this.update(this.deltaTime);
            this.render();
            
        } catch (error) {
            Logger.error(`Game loop error: ${error.message}`);
            this.running = false;
        }
    }

    /**
     * Update all game systems
     */
    update(deltaTime) {
        // Physics simulation
        this.physics.step(deltaTime);
        
        // Update entities from physics
        this.entityManager.updateEntities(deltaTime);
        this.entityManager.updateSunLight();
        
        // Update player
        this.player.update(deltaTime);
        
        // Update telemetry
        this.debugUI.updateTelemetry(
            this.renderer.getFPS(),
            deltaTime * 1000,
            this.player.getPosition(),
            this.entityManager.getEntityCount()
        );
    }

    /**
     * Render a frame
     */
    render() {
        this.renderer.render();
        
        // Hide startup indicator on first frame rendered
        const indicator = document.getElementById('startup-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    /**
     * Pause the game
     */
    pause() {
        this.running = false;
        Logger.info('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        this.running = true;
        this.lastFrameTime = performance.now();
        Logger.info('Game resumed');
        this.gameLoop();
    }

    /**
     * Get game state (for debugging)
     */
    getState() {
        return {
            running: this.running,
            deltaTime: this.deltaTime,
            fps: this.renderer.getFPS(),
            entityCount: this.entityManager.getEntityCount(),
            playerPos: this.player.getPosition(),
            playerVel: this.player.velocity,
            playerFlying: this.player.isFlying,
            cameraMode: this.player.cameraMode,
        };
    }
}

/**
 * Initialize game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking THREE.js...');
    
    // Wait for THREE to load (short timeout)
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max
    
    const initGame = setInterval(() => {
        attempts++;
        
        if (typeof THREE !== 'undefined') {
            clearInterval(initGame);
            console.log('✓ THREE.js loaded, starting game...');
            window.game = new Game();
            
            // Hide startup indicator on first frame
            setTimeout(() => {
                const indicator = document.getElementById('startup-indicator');
                if (indicator) {
                    indicator.style.display = 'none';
                }
            }, 100);
        } else if (attempts >= maxAttempts) {
            clearInterval(initGame);
            console.error('Failed to load THREE.js');
            const overlay = document.getElementById('error-overlay');
            const message = document.getElementById('error-message');
            if (overlay && message) {
                message.textContent = 'Failed to load THREE.js from CDN.\n\nCheck your internet connection.';
                overlay.classList.add('active');
            }
        }
    }, 100); // Check every 100ms
});

/**
 * Handle visibility change (pause when tab is hidden)
 */
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.pause();
        } else {
            window.game.resume();
        }
    }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.running = false;
    }
});
