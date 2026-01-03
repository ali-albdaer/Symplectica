/**
 * Game - Main game loop and initialization
 */

const Game = (function() {
    'use strict';
    
    // Game state
    let isInitialized = false;
    let isRunning = false;
    let lastTime = 0;
    let deltaTime = 0;
    
    // Core systems
    let scene = null;
    let camera = null;
    let skybox = null;
    let player = null;
    let cameraController = null;
    
    // Animation frame ID
    let animationFrameId = null;
    
    /**
     * Initialize all game systems
     */
    async function initialize() {
        try {
            Logger.updateStatus('Initializing renderer...');
            Logger.updateProgress(10);
            
            // Initialize renderer
            const renderResult = Renderer.init();
            scene = renderResult.scene;
            
            Logger.updateStatus('Initializing physics...');
            Logger.updateProgress(20);
            
            // Initialize physics
            PhysicsEngine.init();
            
            Logger.updateStatus('Initializing entities...');
            Logger.updateProgress(30);
            
            // Initialize entity manager
            EntityManager.init();
            
            Logger.updateStatus('Creating solar system...');
            Logger.updateProgress(40);
            
            // Create celestial bodies
            await createSolarSystem();
            
            Logger.updateStatus('Creating player...');
            Logger.updateProgress(60);
            
            // Create camera controller
            cameraController = new CameraController();
            camera = cameraController.init(Renderer.getRenderer());
            
            // Create player
            const planet1 = EntityManager.getPlanets()[0];
            player = new PlayerController();
            player.init(scene, planet1, cameraController);
            EntityManager.register(player);
            
            // Set camera target
            cameraController.setTarget(player);
            
            Logger.updateStatus('Creating interactive objects...');
            Logger.updateProgress(70);
            
            // Create interactive objects near player
            const playerPos = player.getWorldPosition();
            const playerVel = planet1.getSurfaceVelocityAtPoint(playerPos);
            const objects = createInteractiveObjects(scene, playerPos, playerVel);
            objects.forEach(obj => EntityManager.register(obj));
            
            Logger.updateStatus('Creating skybox...');
            Logger.updateProgress(80);
            
            // Create skybox
            skybox = new Skybox();
            skybox.init(scene);
            
            Logger.updateStatus('Initializing UI...');
            Logger.updateProgress(90);
            
            // Initialize UI systems
            DeveloperConsole.init();
            Telemetry.init();
            MenuManager.init();
            InputManager.init();
            
            // Set references
            InputManager.setPlayer(player);
            InputManager.setCameraController(cameraController);
            
            // Post-processing (optional)
            PostProcessing.init(Renderer.getRenderer(), scene, camera);
            
            Logger.updateStatus('Ready!');
            Logger.updateProgress(100);
            
            isInitialized = true;
            Logger.info('Game', 'Initialization complete');
            
            return true;
            
        } catch (error) {
            Logger.error('Game', 'Initialization failed', error);
            throw error;
        }
    }
    
    /**
     * Create the solar system
     */
    async function createSolarSystem() {
        Logger.info('Game', 'Creating solar system...');
        
        // Create and initialize the sun
        const sun = new Sun();
        sun.init(scene);
        EntityManager.register(sun);
        
        Logger.info('Game', `Created Sun at origin`);
        
        // Create planets
        const planet1 = new Planet('planet1');
        planet1.init(scene, sun);
        EntityManager.register(planet1);
        
        const planet2 = new Planet('planet2');
        planet2.init(scene, sun);
        EntityManager.register(planet2);
        
        Logger.info('Game', `Created ${planet1.name} and ${planet2.name}`);
        
        // Create moon orbiting planet1
        const moon1 = new Moon('moon1');
        moon1.init(scene, planet1);
        EntityManager.register(moon1);
        
        // Add moon to planet's children
        planet1.addMoon(moon1);
        
        Logger.info('Game', `Created ${moon1.name} orbiting ${planet1.name}`);
        
        // Add orbit lines to scene
        addOrbitLines(scene);
        
        Logger.info('Game', 'Solar system created successfully');
    }
    
    /**
     * Add orbit visualization lines to scene
     */
    function addOrbitLines(scene) {
        const planets = EntityManager.getPlanets();
        const moons = EntityManager.getMoons();
        
        for (const planet of planets) {
            if (planet.orbitLine) {
                scene.add(planet.orbitLine);
            }
        }
        
        for (const moon of moons) {
            if (moon.orbitLine) {
                scene.add(moon.orbitLine);
            }
        }
    }
    
    /**
     * Main game loop
     */
    function gameLoop(currentTime) {
        animationFrameId = requestAnimationFrame(gameLoop);
        
        // Calculate delta time
        if (lastTime === 0) {
            lastTime = currentTime;
        }
        deltaTime = (currentTime - lastTime) / 1000;  // Convert to seconds
        lastTime = currentTime;
        
        // Clamp delta time to prevent spiral of death
        deltaTime = Math.min(deltaTime, 0.1);
        
        // Skip if paused
        if (!isRunning) return;
        
        // Process input
        InputManager.update();
        
        // Update physics
        PhysicsEngine.update(deltaTime);
        
        // Update player
        if (player) {
            player.update(deltaTime);
        }
        
        // Update camera
        if (cameraController) {
            cameraController.update(deltaTime);
        }
        
        // Update entities
        EntityManager.update(deltaTime, camera);
        
        // Update skybox
        if (skybox && camera) {
            skybox.update(deltaTime, camera.position);
        }
        
        // Update telemetry
        Telemetry.update(deltaTime, player);
        
        // Render
        if (!PostProcessing.render()) {
            Renderer.render(camera);
        }
    }
    
    /**
     * Hide loading screen
     */
    function hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }
    }
    
    return {
        /**
         * Start the game
         */
        start: async function() {
            if (isRunning) return;
            
            Logger.info('Game', 'Starting game...');
            
            try {
                if (!isInitialized) {
                    await initialize();
                }
                
                isRunning = true;
                lastTime = 0;
                
                // Hide loading screen
                hideLoadingScreen();
                
                // Start game loop
                animationFrameId = requestAnimationFrame(gameLoop);
                
                // Show telemetry by default
                Telemetry.show();
                
                Logger.info('Game', 'Game started');
                
            } catch (error) {
                Logger.error('Game', 'Failed to start game', error);
                
                // Show error on loading screen
                const statusEl = document.getElementById('loading-status');
                if (statusEl) {
                    statusEl.textContent = 'Error: ' + error.message;
                    statusEl.style.color = '#e84118';
                }
            }
        },
        
        /**
         * Stop the game
         */
        stop: function() {
            isRunning = false;
            
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            
            Logger.info('Game', 'Game stopped');
        },
        
        /**
         * Pause/unpause
         */
        togglePause: function() {
            isRunning = !isRunning;
            Logger.info('Game', isRunning ? 'Resumed' : 'Paused');
        },
        
        /**
         * Check if running
         */
        isRunning: function() {
            return isRunning;
        },
        
        /**
         * Get the scene
         */
        getScene: function() {
            return scene;
        },
        
        /**
         * Get the camera
         */
        getCamera: function() {
            return camera;
        },
        
        /**
         * Get player
         */
        getPlayer: function() {
            return player;
        },
        
        /**
         * Get delta time
         */
        getDeltaTime: function() {
            return deltaTime;
        }
    };
})();

window.Game = Game;
