/**
 * Solar System Simulation - Main Entry Point
 * ===========================================
 * Initializes all systems and runs the main game loop.
 */

class SolarSystemGame {
    constructor() {
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Game objects
        this.celestialBodies = [];
        this.interactiveObjects = [];
        this.player = null;
        
        // References
        this.sun = null;
        this.planet1 = null;
        this.planet2 = null;
        this.moon = null;
        
        Logger.info('SolarSystemGame created');
    }
    
    /**
     * Initialize the game
     */
    async init() {
        Logger.time('Game initialization');
        
        try {
            // Initialize renderer
            MenuManager.setLoadingProgress(10, 'Initializing renderer...');
            Renderer.init();
            
            // Initialize shadow system
            MenuManager.setLoadingProgress(20, 'Setting up shadows...');
            Shadows.init(Renderer.renderer);
            
            // Initialize starfield
            MenuManager.setLoadingProgress(30, 'Creating starfield...');
            Sky.init(Renderer.scene);
            
            // Create celestial bodies
            MenuManager.setLoadingProgress(40, 'Creating sun...');
            this.createCelestialBodies();
            
            // Create player
            MenuManager.setLoadingProgress(60, 'Initializing player...');
            this.createPlayer();
            
            // Create interactive objects
            MenuManager.setLoadingProgress(70, 'Spawning objects...');
            this.createInteractiveObjects();
            
            // Initialize input
            MenuManager.setLoadingProgress(80, 'Setting up controls...');
            Input.init();
            this.setupInputHandlers();
            
            // Initialize camera controller
            Camera.init(Renderer.camera, this.player);
            
            // Initialize UI
            MenuManager.setLoadingProgress(90, 'Initializing UI...');
            DevMenu.init();
            Telemetry.init();
            MenuManager.init();
            
            // Validate orbital parameters
            Config.validateOrbitalParameters();
            
            // Complete
            MenuManager.setLoadingProgress(100, 'Ready!');
            
            Logger.timeEnd('Game initialization');
            Logger.success('Game initialized successfully');
            
            // Hide loading screen after short delay
            setTimeout(() => {
                MenuManager.hideLoadingScreen();
            }, 500);
            
            return true;
            
        } catch (error) {
            Logger.error('Game initialization failed', { error: error.message, stack: error.stack });
            throw error;
        }
    }
    
    /**
     * Create all celestial bodies
     */
    createCelestialBodies() {
        // Create Sun
        this.sun = new Sun({
            name: Config.sun.name,
            mass: Config.sun.mass,
            radius: Config.sun.radius,
            visualRadius: Config.sun.visualRadius,
            position: Config.sun.position,
            rotationPeriod: Config.sun.rotationPeriod,
            luminosity: Config.sun.luminosity,
            temperature: Config.sun.temperature,
            color: Config.sun.color,
            emissionIntensity: Config.sun.emissionIntensity,
        });
        
        const sunMesh = this.sun.createMesh();
        Renderer.add(sunMesh);
        Physics.addBody(this.sun);
        this.celestialBodies.push(this.sun);
        
        // Register sun light for shadows
        if (this.sun.light) {
            Shadows.registerLight(this.sun.light);
        }
        
        Logger.info('Sun created');
        
        // Create Planet 1 (Terra)
        this.planet1 = new Planet({
            name: Config.planet1.name,
            mass: Config.planet1.mass,
            radius: Config.planet1.radius,
            visualRadius: Config.planet1.visualRadius,
            orbitalRadius: Config.planet1.orbitalRadius,
            orbitalVelocity: Config.planet1.orbitalVelocity,
            orbitalAngle: Config.planet1.orbitalAngle,
            axialTilt: Config.planet1.axialTilt,
            rotationPeriod: Config.planet1.rotationPeriod,
            hasAtmosphere: Config.planet1.hasAtmosphere,
            atmosphereColor: Config.planet1.atmosphereColor,
            color: Config.planet1.color,
            density: Config.planet1.density,
        });
        
        const planet1Mesh = this.planet1.createMesh();
        Renderer.add(planet1Mesh);
        
        // Create orbit line
        const planet1Orbit = this.planet1.createOrbitLine(this.sun);
        if (planet1Orbit) {
            Renderer.add(planet1Orbit);
        }
        
        Physics.addBody(this.planet1);
        this.celestialBodies.push(this.planet1);
        
        Logger.info('Planet 1 (Terra) created');
        
        // Create Planet 2 (Helios)
        this.planet2 = new Planet({
            name: Config.planet2.name,
            mass: Config.planet2.mass,
            radius: Config.planet2.radius,
            visualRadius: Config.planet2.visualRadius,
            orbitalRadius: Config.planet2.orbitalRadius,
            orbitalVelocity: Config.planet2.orbitalVelocity,
            orbitalAngle: Config.planet2.orbitalAngle,
            axialTilt: Config.planet2.axialTilt,
            rotationPeriod: Config.planet2.rotationPeriod,
            hasAtmosphere: Config.planet2.hasAtmosphere,
            atmosphereColor: Config.planet2.atmosphereColor,
            color: Config.planet2.color,
            density: Config.planet2.density,
        });
        
        const planet2Mesh = this.planet2.createMesh();
        Renderer.add(planet2Mesh);
        
        // Create orbit line
        const planet2Orbit = this.planet2.createOrbitLine(this.sun);
        if (planet2Orbit) {
            Renderer.add(planet2Orbit);
        }
        
        Physics.addBody(this.planet2);
        this.celestialBodies.push(this.planet2);
        
        Logger.info('Planet 2 (Helios) created');
        
        // Create Moon (Luna)
        this.moon = new Moon({
            name: Config.moon.name,
            mass: Config.moon.mass,
            radius: Config.moon.radius,
            visualRadius: Config.moon.visualRadius,
            orbitalRadius: Config.moon.orbitalRadius,
            orbitalVelocity: Config.moon.orbitalVelocity,
            orbitalAngle: Config.moon.orbitalAngle,
            rotationPeriod: Config.moon.rotationPeriod,
            color: Config.moon.color,
            density: Config.moon.density,
        }, this.planet1);
        
        const moonMesh = this.moon.createMesh();
        Renderer.add(moonMesh);
        
        Physics.addBody(this.moon);
        this.celestialBodies.push(this.moon);
        
        Logger.info('Moon (Luna) created');
        
        // Update initial positions
        for (const body of this.celestialBodies) {
            body.updateMeshPosition();
        }
    }
    
    /**
     * Create player
     */
    createPlayer() {
        this.player = new Player();
        this.player.spawnOn(this.planet1);
        Physics.setPlayer(this.player);
        
        Logger.info('Player created and spawned');
    }
    
    /**
     * Create interactive objects near player spawn
     */
    createInteractiveObjects() {
        const spawnPosition = this.player.position.clone();
        const count = Config.interactiveObjects.count;
        const radius = Config.interactiveObjects.spawnRadius;
        
        this.interactiveObjects = InteractiveObjectFactory.createRandomObjects(
            spawnPosition,
            count,
            radius
        );
        
        // Add to scene and physics
        for (const obj of this.interactiveObjects) {
            Renderer.add(obj.mesh);
            Physics.addObject(obj);
        }
        
        Logger.info(`Created ${count} interactive objects`);
    }
    
    /**
     * Setup input handlers
     */
    setupInputHandlers() {
        // Key down handler for special actions
        Input.onKeyDown = (key, event) => {
            // Prevent default for game keys
            if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyV', 'KeyH', 'KeyP', 'Slash', 'Backquote'].includes(key)) {
                event.preventDefault();
            }
            
            // Handle menu keys
            MenuManager.handleKeyPress(key);
        };
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        Logger.info('Game loop started');
        
        this.loop();
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        Logger.info('Game loop stopped');
    }
    
    /**
     * Main game loop
     */
    loop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.loop());
        
        // Calculate delta time
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(this.deltaTime, 0.1);
        
        // Update
        this.update(this.deltaTime);
        
        // Render
        this.render();
        
        // Clear per-frame input state
        Input.clearFrameState();
    }
    
    /**
     * Update game state
     */
    update(deltaTime) {
        // Update physics (N-body simulation)
        Physics.update(deltaTime);
        
        // Update celestial bodies
        for (const body of this.celestialBodies) {
            body.update(deltaTime);
        }
        
        // Update camera and player
        Camera.update(deltaTime, this.interactiveObjects);
        
        // Update interactive objects (handled in physics)
        
        // Update sky
        Sky.update(deltaTime);
        
        // Update telemetry
        Telemetry.update(deltaTime, this.player);
    }
    
    /**
     * Render the scene
     */
    render() {
        Renderer.render();
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        this.stop();
        
        // Dispose celestial bodies
        for (const body of this.celestialBodies) {
            body.dispose();
        }
        
        // Dispose interactive objects
        for (const obj of this.interactiveObjects) {
            obj.dispose();
        }
        
        // Dispose systems
        Sky.dispose();
        Shadows.dispose();
        Renderer.dispose();
        Input.dispose();
        
        Logger.info('Game disposed');
    }
}

// ==========================================
// GAME INITIALIZATION
// ==========================================

// Create game instance
const Game = new SolarSystemGame();

// Initialize and start when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    Logger.info('DOM ready, initializing game...');
    
    try {
        await Game.init();
        Game.start();
    } catch (error) {
        Logger.error('Failed to start game', { error: error.message });
        
        // Show error in loading screen
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = 'Failed to start: ' + error.message;
            statusEl.style.color = '#f44336';
        }
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Could pause game here
        Logger.debug('Page hidden');
    } else {
        Logger.debug('Page visible');
    }
});

// Handle before unload
window.addEventListener('beforeunload', () => {
    Game.dispose();
});
