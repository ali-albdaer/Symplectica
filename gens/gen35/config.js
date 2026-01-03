/**
 * GLOBAL CONFIGURATION
 * All physical constants, celestial body parameters, and game settings
 * This file is the single source of truth for all configurable parameters
 */

const CONFIG = {
    // === PHYSICS CONSTANTS ===
    physics: {
        G: 1.0,                          // Scaled gravitational constant for display units
        timeScale: 0.0001,               // Time multiplier (slowed way down)
        integrationSteps: 1,             // Substeps per frame for physics accuracy
        collisionEnabled: true,          // Enable collision detection
        minDistance: 0.01,               // Minimum distance to prevent singularities
    },

    // === CELESTIAL BODIES ===
    sun: {
        mass: 1000,                      // Scaled mass (display units)
        radius: 696340000,               // meters (scaled for visibility)
        displayRadius: 5,                // Visual scale for rendering
        rotationPeriod: 2160000,         // seconds (25 days)
        luminosity: 3.828e26,            // watts
        lightIntensity: 2.5,             // Three.js light intensity
        lightColor: 0xFFFFDD,            // Warm white
        color: 0xFDB813,                 // Sun color
        emissiveIntensity: 1.5,          // Glow strength
        position: { x: 0, y: 0, z: 0 },  // Origin
        velocity: { x: 0, y: 0, z: 0 },  // Stationary
    },

    planet1: {
        mass: 1,                         // Scaled mass (display units)
        radius: 6371000,                 // meters
        displayRadius: 1.0,              // Visual scale
        rotationPeriod: 86400,           // seconds (24 hours)
        orbitalRadius: 150e9,            // meters (1 AU)
        displayOrbitalRadius: 50,        // Visual scale for orbit
        orbitalVelocity: null,           // Auto-calculated for stable orbit
        color: 0x4169E1,                 // Royal blue
        density: 5514,                   // kg/m³
        hasAtmosphere: true,
        atmosphereColor: 0x87CEEB,
        atmosphereOpacity: 0.3,
    },

    planet2: {
        mass: 0.3,                       // Scaled mass (display units)
        radius: 3389500,                 // meters
        displayRadius: 0.6,              // Visual scale
        rotationPeriod: 88800,           // seconds (~24.6 hours)
        orbitalRadius: 228e9,            // meters (1.5 AU)
        displayOrbitalRadius: 80,        // Visual scale
        orbitalVelocity: null,           // Auto-calculated
        color: 0xCD5C5C,                 // Indian red
        density: 3933,                   // kg/m³
        hasAtmosphere: false,
    },

    moon1: {
        mass: 0.05,                      // Scaled mass (display units)
        radius: 1737400,                 // meters
        displayRadius: 0.3,              // Visual scale
        rotationPeriod: 2360000,         // seconds (27.3 days - tidally locked)
        orbitalRadius: 384400000,        // meters from planet1
        displayOrbitalRadius: 3,         // Visual scale
        orbitalVelocity: null,           // Auto-calculated relative to planet1
        color: 0xAAAAAA,                 // Grey
        density: 3344,                   // kg/m³
        parentBody: 'planet1',           // Orbits planet1
    },

    // === INTERACTIVE OBJECTS ===
    interactiveObjects: {
        count: 8,                        // Number of objects to spawn
        spawnRadius: 5,                  // Radius around player spawn
        types: [
            { 
                name: 'Crate', 
                mass: 50, 
                size: 0.5, 
                color: 0x8B4513,
                luminous: false 
            },
            { 
                name: 'Sphere', 
                mass: 20, 
                size: 0.3, 
                color: 0x4682B4,
                luminous: false 
            },
            { 
                name: 'Crystal', 
                mass: 10, 
                size: 0.4, 
                color: 0x00FFFF,
                luminous: true,
                emissiveIntensity: 0.5
            },
            { 
                name: 'Lantern', 
                mass: 15, 
                size: 0.35, 
                color: 0xFFFF00,
                luminous: true,
                emissiveIntensity: 0.8,
                lightIntensity: 2,
                lightDistance: 10
            },
        ],
    },

    // === PLAYER ===
    player: {
        mass: 70,                        // kg
        height: 1.8,                     // meters
        radius: 0.4,                     // Collision radius
        walkSpeed: 3,                    // m/s
        runSpeed: 6,                     // m/s (shift)
        flightSpeed: 10,                 // m/s in free flight
        jumpForce: 300,                  // Newtons
        mouseSensitivity: 0.002,         // Radians per pixel
        spawnHeight: 2,                  // meters above planet surface
        grabDistance: 3,                 // meters
        grabForce: 50,                   // Spring force for held objects
    },

    // === CAMERA ===
    camera: {
        fov: 75,                         // Field of view
        near: 0.01,                      // Near clipping plane
        far: 10000,                      // Far clipping plane
        thirdPersonDistance: 5,          // Distance behind player
        thirdPersonHeight: 2,            // Height above player
        smoothness: 0.1,                 // Camera interpolation (lower = smoother)
    },

    // === RENDERING ===
    rendering: {
        fidelity: 'Ultra',               // 'Low', 'Medium', 'Ultra'
        shadowsEnabled: true,
        shadowMapSize: 2048,             // Low: 512, Medium: 1024, Ultra: 2048
        maxLights: 10,                   // Maximum point lights
        antialias: true,
        ambientLight: 0x000000,          // No ambient light (Sun only)
        starCount: 5000,                 // Skybox stars
        starSize: 1.0,
        lodEnabled: false,               // Level of Detail (off by default)
        lodDistances: [50, 150, 500],    // LOD switching distances
    },

    // === UI & DEBUG ===
    ui: {
        showMetrics: false,              // FPS, frame time, coordinates
        showDebugLog: true,              // On-screen debug messages
        devConsoleKey: '/',              // Key to toggle dev console
        metricsKey: 'F3',                // Toggle metrics
        cameraToggleKey: 'v',            // First/third person toggle
        flightToggleKey: 'f',            // Free flight toggle
        maxDebugMessages: 10,            // Max messages in debug overlay
    },

    // === PERFORMANCE ===
    performance: {
        targetFPS: 60,
        adaptiveQuality: false,          // Auto-adjust quality based on FPS
        fpsThreshold: 30,                // Trigger quality reduction
    },

    // === SCENE ===
    scene: {
        backgroundColor: 0x000000,       // Black space
        fogEnabled: false,               // No atmospheric fog in space
    },
};

/**
 * Calculate stable orbital velocities for celestial bodies
 * V = sqrt(G * M / r) for circular orbits
 * Using DISPLAY units, not real units!
 */
function calculateOrbitalVelocities() {
    const G = CONFIG.physics.G;
    const sunMass = CONFIG.sun.mass;

    // Planet 1 orbital velocity around Sun (in display units!)
    const r1 = CONFIG.planet1.displayOrbitalRadius;
    CONFIG.planet1.orbitalVelocity = Math.sqrt(G * sunMass / r1);

    // Planet 2 orbital velocity around Sun (in display units!)
    const r2 = CONFIG.planet2.displayOrbitalRadius;
    CONFIG.planet2.orbitalVelocity = Math.sqrt(G * sunMass / r2);

    // Moon orbital velocity around Planet 1 (in display units!)
    const rMoon = CONFIG.moon1.displayOrbitalRadius;
    CONFIG.moon1.orbitalVelocity = Math.sqrt(G * CONFIG.planet1.mass / rMoon);

    console.log('[CONFIG] Orbital velocities calculated (display units):');
    console.log(`  Planet 1: ${CONFIG.planet1.orbitalVelocity.toFixed(4)} units/s`);
    console.log(`  Planet 2: ${CONFIG.planet2.orbitalVelocity.toFixed(4)} units/s`);
    console.log(`  Moon 1: ${CONFIG.moon1.orbitalVelocity.toFixed(4)} units/s`);
}

/**
 * Apply fidelity settings
 */
function applyFidelitySettings(level) {
    CONFIG.rendering.fidelity = level;
    
    switch(level) {
        case 'Low':
            CONFIG.rendering.shadowMapSize = 512;
            CONFIG.rendering.maxLights = 4;
            CONFIG.rendering.starCount = 1000;
            CONFIG.rendering.antialias = false;
            break;
        case 'Medium':
            CONFIG.rendering.shadowMapSize = 1024;
            CONFIG.rendering.maxLights = 7;
            CONFIG.rendering.starCount = 3000;
            CONFIG.rendering.antialias = true;
            break;
        case 'Ultra':
            CONFIG.rendering.shadowMapSize = 2048;
            CONFIG.rendering.maxLights = 10;
            CONFIG.rendering.starCount = 5000;
            CONFIG.rendering.antialias = true;
            break;
    }
    
    console.log(`[CONFIG] Fidelity set to: ${level}`);
}

// Initialize
calculateOrbitalVelocities();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, calculateOrbitalVelocities, applyFidelitySettings };
}
