/**
 * ============================================
 * Game Engine
 * ============================================
 * 
 * Main game engine that coordinates all systems.
 */

class Engine {
    constructor() {
        // Core systems
        this.renderer = null;
        this.physics = null;
        this.inputManager = null;
        this.cameraSystem = null;
        this.lightingSystem = null;
        this.skySystem = null;
        this.entityManager = null;
        
        // UI
        this.hud = null;
        this.devConsole = null;
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // Loading
        this.loadingScreen = null;
        this.loadingProgress = null;
        this.loadingStatus = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize all engine systems
     */
    async init() {
        console.info('=== Solar System Simulation v' + CONFIG.VERSION + ' ===');
        console.info('Initializing engine...');
        
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingStatus = document.getElementById('loading-status');
        
        try {
            // Initialize debug log first
            this.updateLoadingProgress(5, 'Initializing debug system...');
            DebugLog.init();
            
            // Initialize renderer
            this.updateLoadingProgress(10, 'Initializing renderer...');
            this.renderer = new Renderer();
            this.renderer.init();
            
            // Get fidelity settings
            const fidelitySettings = this.renderer.getFidelitySettings();
            
            // Initialize physics
            this.updateLoadingProgress(20, 'Initializing physics...');
            this.physics = new Physics();
            this.physics.init();
            
            // Initialize input
            this.updateLoadingProgress(25, 'Initializing input...');
            this.inputManager = new InputManager();
            this.inputManager.init(this.renderer.canvas);
            
            // Initialize camera
            this.updateLoadingProgress(30, 'Initializing camera...');
            this.cameraSystem = new CameraSystem();
            this.cameraSystem.init();
            
            // Initialize sky system
            this.updateLoadingProgress(35, 'Creating star field...');
            this.skySystem = new SkySystem();
            this.skySystem.init(this.renderer.scene, fidelitySettings);
            
            // Initialize lighting
            this.updateLoadingProgress(40, 'Setting up lighting...');
            this.lightingSystem = new LightingSystem();
            this.lightingSystem.init(this.renderer.scene, fidelitySettings);
            
            // Initialize entity manager
            this.updateLoadingProgress(50, 'Initializing entities...');
            this.entityManager = new EntityManager();
            this.entityManager.init(this.renderer.scene, this.physics);
            
            // Create celestial bodies
            this.updateLoadingProgress(60, 'Creating celestial bodies...');
            this.entityManager.createCelestialBodies(fidelitySettings);
            
            // Set sun for lighting
            const sun = this.entityManager.getSun();
            if (sun) {
                this.lightingSystem.setSunBody(sun);
            }
            
            // Create player
            this.updateLoadingProgress(80, 'Creating player...');
            const player = this.entityManager.createPlayer(this.inputManager, fidelitySettings);
            
            if (player) {
                this.cameraSystem.setTarget(player);
            }
            
            // Initialize HUD
            this.updateLoadingProgress(90, 'Initializing UI...');
            this.hud = new HUD();
            this.hud.init();
            
            // Initialize dev console
            this.devConsole = new DevConsole();
            this.devConsole.init(this);
            this.devConsole.setReferences(
                this.entityManager,
                this.physics,
                this.renderer,
                this.lightingSystem
            );
            
            // Complete
            this.updateLoadingProgress(100, 'Complete!');
            
            this.isInitialized = true;
            console.success('Engine initialized successfully!');
            
            // Hide loading screen after a short delay
            setTimeout(() => this.hideLoadingScreen(), 500);
            
            return this;
            
        } catch (error) {
            console.error('Engine initialization failed: ' + error.message);
            console.error(error.stack);
            this.updateLoadingProgress(0, 'ERROR: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Update loading screen progress
     */
    updateLoadingProgress(percent, status) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = percent + '%';
        }
        if (this.loadingStatus) {
            this.loadingStatus.textContent = status;
        }
        console.info(`[${percent}%] ${status}`);
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
        
        // Optionally hide debug log after successful load
        if (!CONFIG.DEBUG_MODE) {
            DebugLog.hide();
        }
    }
    
    /**
     * Start the game loop
     */
    start() {
        if (!this.isInitialized) {
            console.error('Engine not initialized!');
            return;
        }
        
        console.info('Starting game loop...');
        this.isRunning = true;
        this.lastTime = performance.now();
        
        // Start the loop
        this.loop();
    }
    
    /**
     * Main game loop
     */
    loop() {
        if (!this.isRunning) return;
        
        // Request next frame
        requestAnimationFrame(() => this.loop());
        
        // Calculate delta time
        const now = performance.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        // Cap delta time to prevent spiral of death
        if (this.deltaTime > 0.1) {
            this.deltaTime = 0.1;
        }
        
        // Update if not paused
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        
        // Always render
        this.render();
        
        // Update input state (must be last)
        this.inputManager.update();
    }
    
    /**
     * Update all systems
     */
    update(deltaTime) {
        // Update dev console (handles toggle)
        if (this.devConsole) {
            this.devConsole.update(this.inputManager);
        }
        
        // Skip game updates if console is open
        if (this.devConsole && this.devConsole.isOpen) {
            return;
        }
        
        // Update physics
        if (this.physics) {
            this.physics.update(deltaTime);
        }
        
        // Update entities
        if (this.entityManager) {
            this.entityManager.update(deltaTime, this.inputManager);
        }
        
        // Update camera
        if (this.cameraSystem) {
            this.cameraSystem.update(deltaTime, this.inputManager);
        }
        
        // Update lighting
        if (this.lightingSystem) {
            this.lightingSystem.update(this.cameraSystem.getCamera());
        }
        
        // Update sky
        if (this.skySystem) {
            this.skySystem.update(deltaTime);
        }
        
        // Update HUD
        if (this.hud) {
            this.hud.update(
                deltaTime,
                this.entityManager.getPlayer(),
                this.physics,
                this.inputManager
            );
        }
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.renderer && this.cameraSystem) {
            this.renderer.render(this.cameraSystem.getCamera());
        }
    }
    
    /**
     * Pause/unpause the simulation
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.info(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
    }
    
    /**
     * Stop the game loop
     */
    stop() {
        this.isRunning = false;
        console.info('Game stopped');
    }
    
    /**
     * Clean up and dispose resources
     */
    dispose() {
        this.stop();
        
        if (this.entityManager) {
            this.entityManager.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}
