/**
 * Main Application
 * Entry point and main game loop
 */

window.GameApp = {
    // Timing
    lastFrameTime: performance.now() / 1000,
    deltaTime: 0,
    
    // State
    isRunning: false,
    isPaused: false,

    // Performance tracking
    performanceMetrics: {
        frameCount: 0,
        totalTime: 0,
        avgFrameTime: 0,
    },

    /**
     * Initialize the entire application
     */
    async initialize() {
        try {
            DebugSystem.setLoadingStatus('Initializing application');

            // Initialize subsystems in order
            DebugSystem.setLoadingStatus('Initializing physics engine');
            PhysicsEngine.init();

            DebugSystem.setLoadingStatus('Initializing renderer');
            Renderer.init();

            DebugSystem.setLoadingStatus('Initializing camera');
            CameraSystem.init(Renderer.camera);

            DebugSystem.setLoadingStatus('Initializing input');
            InputHandler.init();

            DebugSystem.setLoadingStatus('Initializing UI');
            gameUI.init();

            DebugSystem.setLoadingStatus('Setting up scene');
            SceneManager.init();

            DebugSystem.info('All systems initialized');
            DebugSystem.hideError();
            DebugSystem.hideLoading();

            // Start main loop
            this.isRunning = true;
            this.lastFrameTime = performance.now() / 1000;
            this.mainLoop();

        } catch (error) {
            DebugSystem.error('Application initialization failed', error.message);
            DebugSystem.showError(
                'INITIALIZATION ERROR',
                error.message + '\n\n' + error.stack
            );
        }
    },

    /**
     * Main game loop
     */
    mainLoop() {
        if (!this.isRunning) return;

        const frameStart = performance.now();
        const now = frameStart / 1000;
        this.deltaTime = Math.min(0.033, now - this.lastFrameTime);  // Cap at 33ms
        this.lastFrameTime = now;

        try {
            // Process input
            InputHandler.processInput();

            // Update game logic
            if (!this.isPaused) {
                this.updatePhysics();
                this.updateGameLogic();
            }

            // Update rendering
            this.updateRendering();

            // Update UI
            gameUI.update(this.deltaTime);

            // Track performance
            const frameTime = performance.now() - frameStart;
            this.updatePerformanceMetrics(frameTime);

        } catch (error) {
            DebugSystem.error('Frame loop error', error.message);
        }

        // Request next frame
        requestAnimationFrame(() => this.mainLoop());
    },

    /**
     * Update physics simulation
     */
    updatePhysics() {
        const physicsTime = PhysicsEngine.update(this.deltaTime);
        // Physics time is tracked internally
    },

    /**
     * Update game logic
     */
    updateGameLogic() {
        // Update player controller
        PlayerController.update(this.deltaTime);

        // Update camera
        CameraSystem.update(PlayerController.body, PlayerController, this.deltaTime);

        // Update scene
        SceneManager.update(this.deltaTime);
    },

    /**
     * Update rendering
     */
    updateRendering() {
        const renderTime = Renderer.render();
    },

    /**
     * Track performance metrics
     */
    updatePerformanceMetrics(frameTime) {
        this.performanceMetrics.frameCount++;
        this.performanceMetrics.totalTime += frameTime;
        this.performanceMetrics.avgFrameTime = 
            this.performanceMetrics.totalTime / this.performanceMetrics.frameCount;

        // Log every 5 seconds
        if (this.performanceMetrics.frameCount % 300 === 0) {
            DebugSystem.info('Performance metrics:', {
                avgFrameTime: this.performanceMetrics.avgFrameTime.toFixed(2) + 'ms',
                fps: (1000 / this.performanceMetrics.avgFrameTime).toFixed(1),
                frameCount: this.performanceMetrics.frameCount,
            });
        }
    },

    /**
     * Pause/Resume game
     */
    setPaused(paused) {
        this.isPaused = paused;
        DebugSystem.info(`Game ${paused ? 'paused' : 'resumed'}`);
    },

    /**
     * Get current game state
     */
    getState() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            deltaTime: this.deltaTime,
            frameCount: this.performanceMetrics.frameCount,
            avgFrameTime: this.performanceMetrics.avgFrameTime.toFixed(2),
        };
    },

    /**
     * Restart game
     */
    restart() {
        DebugSystem.info('Restarting game');
        location.reload();
    },

    /**
     * Shutdown application
     */
    shutdown() {
        this.isRunning = false;
        DebugSystem.info('Application shutdown');
    },
};

/**
 * Application entry point
 */
window.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load
    if (typeof THREE === 'undefined') {
        DebugSystem.showError(
            'LIBRARY ERROR',
            'Three.js failed to load. Please check your internet connection.'
        );
        return;
    }

    DebugSystem.setLoadingStatus('Starting application');
    GameApp.initialize();
});

/**
 * Handle unload
 */
window.addEventListener('beforeunload', () => {
    GameApp.shutdown();
});

/**
 * Prevent context menu for right-click interaction
 */
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

DebugSystem.info('Main application loaded');
