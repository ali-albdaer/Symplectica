/**
 * MAIN GAME LOOP
 * Initializes all systems and runs the main update/render loop.
 */

class SolarSystemGame {
    constructor() {
        this.config = CONFIG;
        
        // Core systems
        this.scene = null;
        this.renderer = null;
        this.physics = null;
        this.celestialSystem = null;
        this.player = null;
        this.camera = null;
        this.ui = null;
        
        // Timing
        this.clock = new THREE.Clock();
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;
        this.frameTime = 0;
        this.physicsTime = 0;
        this.renderTime = 0;
        
        // State
        this.isRunning = false;
        this.isPaused = false;
        
        this.initialize();
    }

    /**
     * Initialize all game systems
     */
    async initialize() {
        try {
            console.log('=== SOLAR SYSTEM SIMULATION ===');
            console.log('Initializing systems...');
            
            // Create renderer
            this.createRenderer();
            
            // Create scene
            this.createScene();
            
            // Create physics engine
            this.physics = new PhysicsEngine(this.config);
            console.log('✓ Physics engine initialized');
            
            // Create UI
            this.ui = new UIManager(this.config);
            console.log('✓ UI initialized');
            
            // Create camera controller
            this.camera = new CameraController(this.config, this.renderer);
            console.log('✓ Camera initialized');
            
            // Create celestial system
            this.celestialSystem = new CelestialSystem(this.scene, this.physics, this.config);
            console.log('✓ Celestial system initialized');
            
            // Create player
            this.createPlayer();
            console.log('✓ Player initialized');
            
            // Create interactive objects
            this.celestialSystem.createInteractiveObjects(this.player.position);
            
            // Setup input handlers
            this.setupInputHandlers();
            
            // Start game loop
            this.isRunning = true;
            this.start();
            
            console.log('=== INITIALIZATION COMPLETE ===');
            console.log('Click the screen to lock cursor and start playing!');
            
        } catch (error) {
            console.error('INITIALIZATION ERROR:', error);
            this.ui.showError('Initialization Failed', error.message);
        }
    }

    /**
     * Create WebGL renderer
     */
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: this.config.rendering.antialiasing,
            powerPreference: 'high-performance',
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Enable shadows
        if (this.config.rendering.shadowsEnabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Set tone mapping for better lighting
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.body.appendChild(this.renderer.domElement);
        console.log('✓ Renderer created');
    }

    /**
     * Create scene with basic lighting
     */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Minimal ambient light (space is dark!)
        const ambientLight = new THREE.AmbientLight(
            0xffffff, 
            this.config.rendering.ambientLightIntensity
        );
        this.scene.add(ambientLight);
        
        console.log('✓ Scene created');
    }

    /**
     * Create and spawn player
     */
    createPlayer() {
        this.player = new PlayerController(this.config, this.physics, this.camera);
        
        // Spawn on designated planet
        const spawnPlanet = this.celestialSystem.getSpawnPlanet();
        this.player.spawn(spawnPlanet);
        
        // Set camera target
        this.camera.setTarget(this.player);
    }

    /**
     * Setup input handlers
     */
    setupInputHandlers() {
        // Camera toggle
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyV') {
                this.camera.toggleMode();
            }
            
            // Pause/unpause
            if (e.code === 'Escape') {
                this.togglePause();
            }
        });
        
        // Object interaction
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                e.preventDefault();
                if (this.camera.isLocked) {
                    this.player.grabObject(this.celestialSystem.interactiveObjects);
                }
            }
        });
        
        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Start game loop
     */
    start() {
        this.clock.start();
        this.animate();
    }

    /**
     * Main game loop
     */
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.animate());
        
        const frameStart = performance.now();
        
        // Calculate delta time
        const currentTime = this.clock.getElapsedTime();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Cap delta time to prevent physics explosions
        const cappedDelta = Math.min(this.deltaTime, 0.1);
        
        if (!this.isPaused) {
            this.update(cappedDelta);
        }
        
        this.render();
        
        // Performance tracking
        this.updatePerformanceMetrics(frameStart);
    }

    /**
     * Update all systems
     */
    update(dt) {
        const physicsStart = performance.now();
        
        // Update physics
        this.physics.update(dt);
        
        this.physicsTime = performance.now() - physicsStart;
        
        // Update celestial system
        this.celestialSystem.update(dt);
        
        // Update player
        this.player.update(dt, this.celestialSystem);
        
        // Update camera
        this.camera.update(dt);
        
        // Update UI
        this.updateUI();
    }

    /**
     * Render scene
     */
    render() {
        const renderStart = performance.now();
        
        this.renderer.render(this.scene, this.camera.camera);
        
        this.renderTime = performance.now() - renderStart;
    }

    /**
     * Update UI elements
     */
    updateUI() {
        this.ui.updateCoordinates(this.player, this.physics);
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(frameStart) {
        this.frameTime = performance.now() - frameStart;
        this.frameCount++;
        this.fpsTime += this.deltaTime;
        
        // Update FPS every second
        if (this.fpsTime >= 1.0) {
            this.fps = Math.round(this.frameCount / this.fpsTime);
            this.frameCount = 0;
            this.fpsTime = 0;
        }
        
        // Update UI
        this.ui.updatePerformance({
            fps: this.fps,
            frameTime: this.frameTime,
            physicsTime: this.physicsTime,
            renderTime: this.renderTime,
        });
    }

    /**
     * Toggle pause
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(`Game ${this.isPaused ? 'paused' : 'resumed'}`);
        
        if (this.isPaused) {
            this.camera.releaseLock();
        }
    }

    /**
     * Clean shutdown
     */
    shutdown() {
        console.log('Shutting down...');
        this.isRunning = false;
        
        // Cleanup
        if (this.celestialSystem) {
            this.celestialSystem.dispose();
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('RUNTIME ERROR:', event.error);
    
    // Try to show error in UI if available
    if (window.game && window.game.ui) {
        window.game.ui.showError('Runtime Error', event.error.message);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('UNHANDLED PROMISE REJECTION:', event.reason);
    
    if (window.game && window.game.ui) {
        window.game.ui.showError('Promise Rejection', event.reason);
    }
});

// Initialize game when page loads
window.addEventListener('load', () => {
    try {
        console.log('Page loaded, initializing game...');
        window.game = new SolarSystemGame();
    } catch (error) {
        console.error('FATAL ERROR:', error);
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ff4444;
                color: white;
                padding: 30px;
                border-radius: 10px;
                font-family: monospace;
                text-align: center;
                max-width: 600px;
            ">
                <h2>⚠️ Fatal Error</h2>
                <p>${error.message}</p>
                <p style="margin-top: 20px; opacity: 0.8; font-size: 0.9em;">
                    Open the browser console (F12) for detailed error information.
                </p>
            </div>
        `;
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.shutdown();
    }
});
