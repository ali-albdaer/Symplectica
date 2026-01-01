/**
 * Global Configuration for Solar System Simulation
 * All values are scientifically scaled for playability while maintaining realistic ratios
 */

// World scale: fully-gameplay values (units are arbitrary game units).
// Tuned for stability while keeping body sizes/render distances reasonable.
const SCALE = {
    distance: 1,      // Distances are authored directly in game units
    size: 1,          // Mesh sizes use authored units
    time: 1,          // Simulation time multiplier (can be >1 to accelerate orbits)
    gravity: 1        // Additional gravity multiplier for gameplay tweaks
};

// Physics constants (game-scaled)
const PHYSICS = {
    // Gravitational constant tuned for the authored masses/distances below.
    // Picked to produce a stable 2-planet + moon system with circular-ish orbits.
    gravitationalConstant: 0.001,
    timeStep: 1 / 120,              // Fixed physics step (seconds of simulation time)
    maxTimeStep: 1 / 30,            // Clamp per-frame delta to avoid spiral of death
    gravityMultiplier: SCALE.gravity,
    softeningLength: 5,             // Softening to prevent singularities at close range
    collisionIterations: 3,
    damping: 0.995,                 // Global velocity damping for dynamic bodies
    airResistance: 0.995,
    groundFriction: 0.9
};

// Sun configuration (game-scaled)
const SUN = {
    name: 'Sun',
    mass: 100000,          // Arbitrary game mass units
    radius: 500,           // Game units
    rotationPeriod: 180,   // Seconds per full rotation
    luminosity: 1,         // Kept for future post-processing use
    temperature: 6000,
    color: 0xFDB813,
    emissive: 0xFFA500,
    emissiveIntensity: 2,
    position: { x: 0, y: 0, z: 0 }
};

// Planet 1 configuration (spawn planet)
const PLANET_1 = {
    name: 'Terra',
    mass: 1500,
    radius: 60,
    orbitRadius: 2000,
    rotationPeriod: 120,   // Day length (s)
    axialTilt: 15,
    eccentricity: 0.01,
    density: 5.5,
    albedo: 0.3,
    color: 0x4169E1,
    hasAtmosphere: true,
    atmosphereColor: 0x87CEEB,
    atmosphereOpacity: 0.25,
    surfaceGravity: 9.5,
    parentBody: 'sun'
};

// Planet 2 configuration
const PLANET_2 = {
    name: 'Ares',
    mass: 2000,
    radius: 90,
    orbitRadius: 3400,
    rotationPeriod: 200,
    axialTilt: 20,
    eccentricity: 0.04,
    density: 3.9,
    albedo: 0.25,
    color: 0xCD5C5C,
    hasAtmosphere: true,
    atmosphereColor: 0xFFB6C1,
    atmosphereOpacity: 0.15,
    surfaceGravity: 7.5,
    parentBody: 'sun'
};

// Moon configuration (orbiting Planet 1)
const MOON = {
    name: 'Luna',
    mass: 80,
    radius: 18,
    orbitRadius: 180,
    rotationPeriod: 180,
    eccentricity: 0.02,
    density: 3.3,
    albedo: 0.12,
    color: 0xC0C0C0,
    parentBody: 'planet1',
    surfaceGravity: 1.6
};

// Player configuration
const PLAYER = {
    height: 1.8,
    radius: 0.4,
    mass: 80,
    walkSpeed: 6,
    runSpeed: 10,
    jumpForce: 10,
    mouseSensitivity: 0.002,

    // Flight mode
    flightSpeed: 24,
    flightAcceleration: 3,
    flightMaxSpeed: 90,
    
    // Camera
    cameraOffset: { x: 0, y: 0.8, z: 0 },
    thirdPersonDistance: 4.5,
    thirdPersonHeight: 2.2,
    cameraSmoothing: 0.08,
    cameraLookAhead: 1.1
};

// Interactable objects configuration
const INTERACTABLES = {
    count: 8,
    spawnRadius: 10,                   // meters from player
    types: [
        { name: 'Cube', mass: 10, size: 0.5, color: 0xFF6B6B },
        { name: 'Sphere', mass: 8, size: 0.4, color: 0x4ECDC4 },
        { name: 'Cylinder', mass: 12, size: 0.6, color: 0x45B7D1 },
        { name: 'Cone', mass: 7, size: 0.5, color: 0xFFA07A },
        { name: 'GlowOrb', mass: 5, size: 0.45, color: 0xFFFFAA, luminous: true }
    ],
    friction: 0.7,
    restitution: 0.4,                  // Bounciness
    interactionDistance: 3             // meters
};

// Graphics settings
const GRAPHICS = {
    // Quality presets
    presets: {
        ultra: {
            shadowMapSize: 4096,
            particleCount: 10000,
            renderDistance: 50000,
            antialiasing: true,
            bloom: true,
            lensFlare: true
        },
        high: {
            shadowMapSize: 2048,
            particleCount: 5000,
            renderDistance: 30000,
            antialiasing: true,
            bloom: true,
            lensFlare: true
        },
        medium: {
            shadowMapSize: 1024,
            particleCount: 2000,
            renderDistance: 20000,
            antialiasing: false,
            bloom: false,
            lensFlare: false
        },
        low: {
            shadowMapSize: 512,
            particleCount: 500,
            renderDistance: 10000,
            antialiasing: false,
            bloom: false,
            lensFlare: false
        }
    },
    
    // Current settings (defaults to high)
    currentPreset: 'high',
    shadowMapSize: 2048,
    particleCount: 5000,
    renderDistance: 12000,
    antialiasing: true,
    bloom: true,
    lensFlare: true,
    
    // Shadow settings
    shadowBias: -0.0001,
    shadowRadius: 2,
    shadowCameraNear: 0.5,
    shadowCameraFar: 500,
    
    // Rendering
    maxFPS: 144,
    vsync: true,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
};

// Lighting configuration
const LIGHTING = {
    ambient: {
        color: 0x404040,
        intensity: 0.3
    },
    sunLight: {
        color: 0xFFFFE0,
        intensity: 2.5,
        castShadow: true,
        shadowDarkness: 0.5
    },
    planetLights: {
        Terra: {
            color: 0x4169E1,
            intensity: 0.2
        },
        Ares: {
            color: 0xCD5C5C,
            intensity: 0.15
        }
    },
    moonLight: {
        color: 0xC0C0C0,
        intensity: 0.1
    }
};

// Performance monitoring
const PERFORMANCE = {
    enabled: false,
    updateInterval: 500,               // ms
    targetFPS: 60,
    warningThreshold: 45,
    criticalThreshold: 30
};

// Developer menu configuration
const DEV_MENU = {
    enabled: true,
    saveToLocalStorage: true,
    categories: [
        'celestial',
        'physics',
        'player',
        'graphics'
    ]
};

// Export all configurations
export {
    SCALE,
    PHYSICS,
    SUN,
    PLANET_1,
    PLANET_2,
    MOON,
    PLAYER,
    INTERACTABLES,
    GRAPHICS,
    LIGHTING,
    PERFORMANCE,
    DEV_MENU
};

// Make configs accessible globally for developer menu
if (typeof window !== 'undefined') {
    window.CONFIG = {
        SCALE,
        PHYSICS,
        SUN,
        PLANET_1,
        PLANET_2,
        MOON,
        PLAYER,
        INTERACTABLES,
        GRAPHICS,
        LIGHTING,
        PERFORMANCE,
        DEV_MENU
    };
}
