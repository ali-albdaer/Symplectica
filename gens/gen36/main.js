/**
 * Main Game Loop and Initialization
 * Orchestrates all game systems
 */

class SolarSystemGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.celestialSystem = null;
        this.player = null;
        this.cameraController = null;
        this.interactiveObjects = null;
        this.ui = null;
        this.starfield = null;
        
        // Lighting
        this.sunLight = null;
        this.ambientLight = null;
        
        // Timing
        this.lastTime = performance.now();
        this.isRunning = false;
        
        // Initialize
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Solar System Simulation...');
            
            // Create UI system first for loading progress
            this.ui = new UISystem(this);
            
            // Initialize Three.js
            this.ui.updateLoadingProgress(0.1, 'Initializing renderer...');
            await this.initRenderer();
            
            // Initialize physics
            this.ui.updateLoadingProgress(0.2, 'Initializing physics engine...');
            this.physicsEngine = new PhysicsEngine();
            
            // Create celestial bodies
            this.ui.updateLoadingProgress(0.4, 'Creating celestial bodies...');
            this.celestialSystem = new CelestialSystem(this.scene, this.physicsEngine);
            
            // Create starfield
            this.ui.updateLoadingProgress(0.5, 'Creating starfield...');
            this.starfield = new Starfield(this.scene);
            
            // Setup lighting
            this.ui.updateLoadingProgress(0.6, 'Setting up lighting...');
            this.setupLighting();
            
            // Create player
            this.ui.updateLoadingProgress(0.7, 'Creating player...');
            this.player = new Player(this.scene, this.physicsEngine, this.celestialSystem);
            
            // Create camera controller
            this.ui.updateLoadingProgress(0.8, 'Setting up camera...');
            this.cameraController = new CameraController(this.camera, this.player);
            
            // Create interactive objects
            this.ui.updateLoadingProgress(0.9, 'Spawning interactive objects...');
            this.interactiveObjects = new InteractiveObjectManager(
                this.scene,
                this.physicsEngine,
                this.player
            );
            
            // Finalize
            this.ui.updateLoadingProgress(1.0, 'Starting simulation...');
            
            // Start game loop
            setTimeout(() => {
                this.ui.hideLoadingScreen();
                this.start();
            }, 500);
            
            console.log('Initialization complete!');
            
        } catch (error) {
            console.error('FATAL ERROR during initialization:', error);
            this.ui.addDebugMessage(`FATAL: ${error.message}`, 'error');
            this.ui.debugLog.style.display = 'block';
        }
    }

    async initRenderer() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(CONFIG.SKYBOX.backgroundColor);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.CAMERA.near,
            CONFIG.CAMERA.far
        );
        
        // Create renderer
        const quality = CONFIG.RENDERING.qualities[CONFIG.RENDERING.defaultQuality];
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: quality.antialias,
            powerPreference: 'high-performance',
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(quality.pixelRatio);
        this.renderer.shadowMap.enabled = quality.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        document.body.appendChild(this.renderer.domElement);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        console.log('Renderer initialized');
    }

    setupLighting() {
        // Ambient light (very dim - space is dark)
        this.ambientLight = new THREE.AmbientLight(
            CONFIG.LIGHTING.ambientColor,
            CONFIG.LIGHTING.ambientIntensity
        );
        this.scene.add(this.ambientLight);
        
        // Sun as directional light
        this.sunLight = new THREE.DirectionalLight(
            CONFIG.LIGHTING.sunColor,
            CONFIG.LIGHTING.sunIntensity
        );
        
        // Position light at sun
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        
        // Configure shadow camera
        const shadowDistance = 1e6; // 1000 km in rendering units
        this.sunLight.shadow.camera.left = -shadowDistance;
        this.sunLight.shadow.camera.right = shadowDistance;
        this.sunLight.shadow.camera.top = shadowDistance;
        this.sunLight.shadow.camera.bottom = -shadowDistance;
        this.sunLight.shadow.camera.near = CONFIG.LIGHTING.shadowCameraNear;
        this.sunLight.shadow.camera.far = CONFIG.LIGHTING.shadowCameraFar;
        
        this.sunLight.shadow.bias = CONFIG.LIGHTING.shadowBias;
        this.sunLight.shadow.normalBias = CONFIG.LIGHTING.shadowNormalBias;
        
        const quality = CONFIG.RENDERING.qualities[CONFIG.RENDERING.defaultQuality];
        this.sunLight.shadow.mapSize.width = quality.shadowMapSize;
        this.sunLight.shadow.mapSize.height = quality.shadowMapSize;
        
        this.scene.add(this.sunLight);
        
        console.log('Lighting setup complete');
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        console.log('Game started!');
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
        this.lastTime = currentTime;
        
        try {
            this.update(dt, currentTime);
            this.render();
        } catch (error) {
            console.error('Error in game loop:', error);
            this.ui.addDebugMessage(`Runtime error: ${error.message}`, 'error');
        }
    }

    update(dt, currentTime) {
        // Update physics
        this.physicsEngine.update(dt);
        
        // Update celestial bodies
        this.celestialSystem.update(dt);
        
        // Update player
        this.player.update(dt);
        
        // Update camera
        this.cameraController.update(dt);
        
        // Update interactive objects
        this.interactiveObjects.update(dt);
        
        // Update starfield position
        this.starfield.update(this.camera);
        
        // Update sun light position to follow camera (for shadows)
        // In space, the sun light direction is what matters, not position
        // But we need to update shadow camera to follow player
        if (this.sunLight && this.player) {
            const playerPos = this.player.getPosition();
            const sunPos = this.celestialSystem.sun.position;
            
            // Direction from sun to player
            const direction = new THREE.Vector3(
                playerPos.x - sunPos.x,
                playerPos.y - sunPos.y,
                playerPos.z - sunPos.z
            ).normalize();
            
            // Position light relative to player for shadow mapping
            const lightDistance = 5e5; // 500 km in meters
            this.sunLight.position.set(
                (playerPos.x - direction.x * lightDistance) / 1e6,
                (playerPos.y - direction.y * lightDistance) / 1e6,
                (playerPos.z - direction.z * lightDistance) / 1e6
            );
            
            this.sunLight.target.position.set(
                playerPos.x / 1e6,
                playerPos.y / 1e6,
                playerPos.z / 1e6
            );
            this.sunLight.target.updateMatrixWorld();
        }
        
        // Update UI
        this.ui.update(dt, currentTime);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.stop();
        
        if (this.interactiveObjects) this.interactiveObjects.destroy();
        if (this.player) this.player.destroy();
        if (this.celestialSystem) this.celestialSystem.destroy();
        if (this.starfield) this.starfield.destroy();
        if (this.renderer) {
            document.body.removeChild(this.renderer.domElement);
            this.renderer.dispose();
        }
        
        console.log('Game destroyed');
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, starting game...');
    window.game = new SolarSystemGame();
});

// Handle errors globally
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.game && window.game.ui) {
        window.game.ui.addDebugMessage(`Global error: ${e.error.message}`, 'error');
        window.game.ui.debugLog.style.display = 'block';
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.game && window.game.ui) {
        window.game.ui.addDebugMessage(`Unhandled rejection: ${e.reason}`, 'error');
        window.game.ui.debugLog.style.display = 'block';
    }
});
