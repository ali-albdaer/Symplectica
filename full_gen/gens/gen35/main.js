/**
 * MAIN GAME LOOP & INITIALIZATION
 * Sets up the scene, renderer, and runs the game loop
 */

// Global state
window.isMenuOpen = false;

// Three.js core
let scene, camera, renderer;

// Game systems
let physicsEngine, player, cameraController, objectManager, uiSystem;

// Celestial bodies
let solarSystem;

// Starfield
let starField;

// Timing
let lastTime = performance.now();

/**
 * Initialize Three.js scene and renderer
 */
function initRenderer() {
    console.log('[RENDERER] Initializing...');
    
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.scene.backgroundColor);
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        CONFIG.camera.near,
        CONFIG.camera.far
    );
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: CONFIG.rendering.antialias,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = CONFIG.rendering.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    document.body.appendChild(renderer.domElement);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('[RENDERER] Initialized successfully');
}

/**
 * Create starfield background
 */
function createStarField() {
    console.log('[STARFIELD] Creating...');
    
    const starGeometry = new THREE.BufferGeometry();
    const starCount = CONFIG.rendering.starCount;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
        // Random position on a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 5000 + Math.random() * 5000;
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
        
        // Random color (bluish to white)
        const color = new THREE.Color();
        const temp = 0.7 + Math.random() * 0.3;
        color.setHSL(0.6, 0.2, temp);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starMaterial = new THREE.PointsMaterial({
        size: CONFIG.rendering.starSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false
    });
    
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);
    
    console.log(`[STARFIELD] Created with ${starCount} stars`);
}

/**
 * Initialize game systems
 */
function initGame() {
    try {
        console.log('[GAME] Initializing...');
        
        // Physics Engine
        physicsEngine = new PhysicsEngine(CONFIG);
        window.physicsEngine = physicsEngine;
        
        // Create solar system
        solarSystem = createSolarSystem(CONFIG, scene, physicsEngine);
        window.solarSystem = solarSystem;
        
        // UI System
        uiSystem = new UISystem(CONFIG);
        
        // Player
        player = new Player(CONFIG, scene, physicsEngine, camera);
        player.spawn(solarSystem.planet1);
        
        // Camera Controller
        cameraController = new CameraController(CONFIG, camera, player);
        window.cameraController = cameraController;
        
        // Object Manager
        objectManager = new ObjectManager(CONFIG, scene, physicsEngine);
        window.objectManager = objectManager;
        objectManager.spawnObjects(player.position, solarSystem.planet1);
        
        // Create starfield
        createStarField();
        
        // Add very subtle ambient light so you can see on the dark side
        const ambientLight = new THREE.AmbientLight(0x404040, 0.05);
        scene.add(ambientLight);
        
        console.log('[GAME] Camera position:', camera.position);
        console.log('[GAME] Sun position:', solarSystem.sun.position);
        console.log('[GAME] Planet1 position:', solarSystem.planet1.position);
        
        console.log('[GAME] Initialization complete!');
        console.log('='.repeat(50));
        console.log('CONTROLS:');
        console.log('  WASD - Move');
        console.log('  Space - Jump');
        console.log('  F - Toggle Flight Mode');
        console.log('  V - Toggle Camera (First/Third Person)');
        console.log('  Right Click - Grab Object');
        console.log('  / - Developer Console');
        console.log('  F3 - Toggle Metrics');
        console.log('='.repeat(50));
        
        // Start game loop
        requestAnimationFrame(gameLoop);
        
    } catch (error) {
        console.error('[GAME] Initialization failed:', error);
        if (uiSystem) {
            uiSystem.showError(error);
        }
        throw error;
    }
}

/**
 * Main game loop
 */
function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    try {
        // Calculate delta time
        const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
        lastTime = currentTime;
        
        // Update physics
        physicsEngine.update(deltaTime);
        
        // Update celestial bodies
        for (const key in solarSystem) {
            solarSystem[key].update(deltaTime);
        }
        
        // Update player
        player.update(deltaTime);
        
        // Update camera
        cameraController.update(deltaTime);
        
        // Update objects
        objectManager.update(deltaTime);
        
        // Update UI
        uiSystem.update(deltaTime * 1000, player, physicsEngine);
        
        // Render
        renderer.render(scene, camera);
        
    } catch (error) {
        console.error('[GAME LOOP] Error:', error);
        uiSystem.showError(error);
        // Don't throw - allow recovery
    }
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Initialize everything when page loads
 */
window.addEventListener('load', () => {
    try {
        console.log('='.repeat(50));
        console.log('SOLAR SYSTEM SIMULATION');
        console.log('Realistic N-Body Physics Engine');
        console.log('='.repeat(50));
        
        initRenderer();
        initGame();
        
    } catch (error) {
        console.error('Failed to initialize:', error);
        
        // Show error overlay even if UI system failed
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 10px;
            font-family: monospace;
            max-width: 80%;
            z-index: 10000;
        `;
        errorDiv.innerHTML = `
            <h2>❌ Initialization Error</h2>
            <p>${error.message}</p>
            <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 300px;">${error.stack}</pre>
        `;
        document.body.appendChild(errorDiv);
    }
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (renderer) {
        renderer.dispose();
    }
});

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initRenderer, initGame, gameLoop };
}
