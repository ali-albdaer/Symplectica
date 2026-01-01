/**
 * Global Configuration for Solar System Simulation
 * All values are scientifically scaled for playability while maintaining realistic ratios
 */

// Scale factors for playability (1 unit = 1000 km in real space)
const SCALE = {
    distance: 0.00001,  // Distance scale
    size: 0.001,        // Body size scale
    time: 60,           // Time acceleration (60x real time)
    gravity: 1.5        // Gravity multiplier for gameplay
};

// Physics constants
const PHYSICS = {
    gravitationalConstant: 6.674e-11,
    timeStep: 1/60,                    // 60 FPS target
    maxTimeStep: 1/30,                 // Minimum 30 FPS
    gravityMultiplier: SCALE.gravity,
    collisionIterations: 3,
    damping: 0.98,
    airResistance: 0.99,
    groundFriction: 0.85
};

// Sun configuration
const SUN = {
    name: 'Sun',
    mass: 1.989e30,                    // kg
    radius: 696340 * SCALE.size,       // km
    rotationPeriod: 25.4 * 24 * 3600,  // seconds (equatorial)
    luminosity: 3.828e26,              // watts
    temperature: 5778,                  // Kelvin
    color: 0xFDB813,
    emissive: 0xFFA500,
    emissiveIntensity: 1.5,
    position: { x: 0, y: 0, z: 0 }
};

// Planet 1 configuration (Earth-like)
const PLANET_1 = {
    name: 'Terra',
    mass: 5.972e24,                    // kg
    radius: 6371 * SCALE.size,         // km
    orbitRadius: 149.6e6 * SCALE.distance,  // km (1 AU)
    orbitPeriod: 365.25 * 24 * 3600,   // seconds (1 year)
    rotationPeriod: 24 * 3600,         // seconds (1 day)
    axialTilt: 23.5,                   // degrees
    eccentricity: 0.0167,
    density: 5514,                     // kg/m³
    albedo: 0.306,
    color: 0x4169E1,
    hasAtmosphere: true,
    atmosphereColor: 0x87CEEB,
    atmosphereOpacity: 0.3,
    surfaceGravity: 9.81               // m/s²
};

// Planet 2 configuration (Mars-like)
const PLANET_2 = {
    name: 'Ares',
    mass: 6.39e23,                     // kg
    radius: 3389.5 * SCALE.size,       // km
    orbitRadius: 227.9e6 * SCALE.distance,  // km
    orbitPeriod: 687 * 24 * 3600,      // seconds
    rotationPeriod: 24.6 * 3600,       // seconds
    axialTilt: 25.2,                   // degrees
    eccentricity: 0.0934,
    density: 3933,                     // kg/m³
    albedo: 0.25,
    color: 0xCD5C5C,
    hasAtmosphere: true,
    atmosphereColor: 0xFFB6C1,
    atmosphereOpacity: 0.15,
    surfaceGravity: 3.71               // m/s²
};

// Moon configuration (orbiting Planet 1)
const MOON = {
    name: 'Luna',
    mass: 7.342e22,                    // kg
    radius: 1737.4 * SCALE.size,       // km
    orbitRadius: 384400 * SCALE.distance,   // km from Planet 1
    orbitPeriod: 27.3 * 24 * 3600,     // seconds
    rotationPeriod: 27.3 * 24 * 3600,  // seconds (tidally locked)
    eccentricity: 0.0549,
    density: 3344,                     // kg/m³
    albedo: 0.12,
    color: 0xC0C0C0,
    parentBody: 'Terra',
    surfaceGravity: 1.62               // m/s²
};

// Player configuration
const PLAYER = {
    height: 1.8,                       // meters
    radius: 0.3,                       // meters
    mass: 70,                          // kg
    walkSpeed: 3,                      // m/s
    runSpeed: 6,                       // m/s
    jumpForce: 6,                      // m/s
    mouseSensitivity: 0.002,
    
    // Flight mode
    flightSpeed: 20,                   // m/s
    flightAcceleration: 2,
    flightMaxSpeed: 100,
    
    // Camera
    cameraOffset: { x: 0, y: 0.6, z: 0 },  // First person eye level
    thirdPersonDistance: 5,
    thirdPersonHeight: 2,
    cameraSmoothing: 0.1,
    cameraLookAhead: 1.5
};

// Interactable objects configuration
const INTERACTABLES = {
    count: 8,
    spawnRadius: 10,                   // meters from player
    types: [
        { name: 'Cube', mass: 10, size: 0.5, color: 0xFF6B6B },
        { name: 'Sphere', mass: 8, size: 0.4, color: 0x4ECDC4 },
        { name: 'Cylinder', mass: 12, size: 0.6, color: 0x45B7D1 },
        { name: 'Cone', mass: 7, size: 0.5, color: 0xFFA07A }
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
    renderDistance: 30000,
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
