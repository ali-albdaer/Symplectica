/**
 * Global Configuration System
 * All configurable parameters for the solar system simulation
 * Accessible and modifiable in real-time through the developer menu
 */

export const CONFIG = {
    // === PHYSICS SETTINGS ===
    PHYSICS: {
        // Gravitational constant (scaled for simulation)
        G: 6.674e-11,
        
        // Time scale (higher = faster simulation)
        timeScale: 1.0,
        
        // Physics update rate (Hz)
        physicsTickRate: 60,
        
        // Maximum physics iterations per frame
        maxIterations: 10,
        
        // Collision detection enabled
        enableCollisions: true,
        
        // Atmospheric drag coefficient
        atmosphericDrag: 0.05,
        
        // Ground friction
        groundFriction: 0.8,
    },

    // === CELESTIAL BODIES ===
    CELESTIAL: {
        // Sun (Star)
        SUN: {
            name: 'Sun',
            mass: 1.989e30,              // kg
            radius: 696340000,           // meters (scaled down for rendering)
            renderRadius: 50,            // visual radius in scene units
            color: 0xFDB813,
            emissive: 0xFFA500,
            emissiveIntensity: 1.0,
            rotationPeriod: 2160000,     // seconds (25 Earth days)
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            luminosity: 3.828e26,        // watts
            temperature: 5778,           // Kelvin
        },

        // Planet 1 (Earth-like, player spawn)
        PLANET1: {
            name: 'Terra Prime',
            mass: 5.972e24,              // kg (Earth-like)
            radius: 6371000,             // meters
            renderRadius: 10,            // visual radius
            color: 0x2233AA,
            emissive: 0x000000,
            emissiveIntensity: 0,
            rotationPeriod: 86400,       // seconds (24 hours)
            orbitalPeriod: 31557600,     // seconds (1 Earth year)
            semiMajorAxis: 149600000000, // meters (1 AU)
            eccentricity: 0.0167,        // orbital eccentricity
            inclination: 0.0,            // degrees
            atmosphereHeight: 100000,    // meters
            atmosphereColor: 0x4488FF,
            surfaceGravity: 9.807,       // m/s²
            
            // Initial position and velocity (circular orbit approximation)
            position: { x: 149600000000, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 29780 }, // ~29.78 km/s
        },

        // Planet 2 (Mars-like)
        PLANET2: {
            name: 'Rust World',
            mass: 6.417e23,              // kg (Mars-like)
            radius: 3389500,             // meters
            renderRadius: 6,
            color: 0xCD5C5C,
            emissive: 0x000000,
            emissiveIntensity: 0,
            rotationPeriod: 88775,       // seconds (24.6 hours)
            orbitalPeriod: 59355000,     // seconds (~687 Earth days)
            semiMajorAxis: 227900000000, // meters (1.52 AU)
            eccentricity: 0.0934,
            inclination: 1.85,           // degrees
            atmosphereHeight: 50000,
            atmosphereColor: 0xFFAA88,
            surfaceGravity: 3.721,       // m/s²
            
            position: { x: 227900000000, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 24070 }, // ~24.07 km/s
        },

        // Moon (orbiting Planet 1)
        MOON1: {
            name: 'Luna',
            mass: 7.342e22,              // kg
            radius: 1737400,             // meters
            renderRadius: 3,
            color: 0xAAAAAA,
            emissive: 0x000000,
            emissiveIntensity: 0,
            rotationPeriod: 2360592,     // seconds (27.3 days, tidally locked)
            orbitalPeriod: 2360592,      // same as rotation (tidally locked)
            semiMajorAxis: 384400000,    // meters from Planet 1
            eccentricity: 0.0549,
            inclination: 5.145,          // degrees
            parentBody: 'PLANET1',       // orbits Planet 1
            surfaceGravity: 1.62,        // m/s²
            
            // Position relative to Planet 1 (will be calculated)
            position: { x: 149600000000 + 384400000, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 29780 + 1022 }, // planet velocity + moon orbital velocity
        },
    },

    // === PLAYER SETTINGS ===
    PLAYER: {
        // Spawn location
        spawnPlanet: 'PLANET1',
        spawnHeight: 2.0,              // meters above surface
        
        // Player physics
        height: 1.8,                   // meters
        mass: 70,                      // kg
        walkSpeed: 5.0,                // m/s
        runSpeed: 8.0,                 // m/s
        jumpForce: 6.0,                // m/s
        
        // Free flight mode
        flightSpeed: 20.0,             // m/s
        flightAcceleration: 50.0,      // m/s²
        flightDamping: 0.9,
        
        // Camera settings
        mouseSensitivity: 0.002,
        minPitch: -Math.PI / 2 + 0.1,
        maxPitch: Math.PI / 2 - 0.1,
        
        // Third person camera
        thirdPersonDistance: 8.0,
        thirdPersonHeight: 2.0,
        cameraSmoothing: 0.15,         // lower = smoother, higher = more responsive
        cameraPanSpeed: 2.0,
    },

    // === INTERACTIVE OBJECTS ===
    OBJECTS: {
        spawnCount: 8,                 // number of objects to spawn
        spawnRadius: 10,               // meters from player
        
        types: [
            {
                name: 'Cube',
                mass: 5,
                size: 1,
                color: 0xFF5555,
                friction: 0.6,
                restitution: 0.4,
            },
            {
                name: 'Sphere',
                mass: 3,
                size: 0.8,
                color: 0x55FF55,
                friction: 0.4,
                restitution: 0.7,
            },
            {
                name: 'Cylinder',
                mass: 4,
                size: 1.2,
                color: 0x5555FF,
                friction: 0.5,
                restitution: 0.5,
            },
        ],
    },

    // === GRAPHICS SETTINGS ===
    GRAPHICS: {
        // Render quality presets
        quality: 'high', // 'low', 'medium', 'high'
        
        // Shadows
        shadows: {
            enabled: true,
            quality: 'high',           // 'low', 'medium', 'high'
            mapSize: 2048,             // shadow map resolution
            bias: -0.0001,
            radius: 2,
            cascadeLevels: 3,
        },
        
        // Anti-aliasing
        antialiasing: true,
        
        // Ambient occlusion
        ambientOcclusion: {
            enabled: true,
            quality: 'medium',
        },
        
        // Bloom effect
        bloom: {
            enabled: true,
            strength: 0.5,
            radius: 0.4,
            threshold: 0.85,
        },
        
        // Stars background
        stars: {
            enabled: true,
            count: 10000,
        },
        
        // Planet details
        planetDetails: {
            atmosphereEnabled: true,
            cloudsEnabled: true,
            terrainDetail: 'high',     // 'low', 'medium', 'high'
        },
        
        // Rendering
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        fov: 75,
        nearClip: 0.1,
        farClip: 1e12,                 // very far for space rendering
    },

    // === LIGHTING ===
    LIGHTING: {
        // Ambient light
        ambient: {
            enabled: true,
            color: 0x111122,
            intensity: 0.05,
        },
        
        // Sun light
        sunLight: {
            enabled: true,
            intensity: 1.5,
            castShadows: true,
        },
        
        // Planet surface lighting
        surfaceLight: {
            enabled: true,
            intensity: 0.3,
        },
    },

    // === PERFORMANCE ===
    PERFORMANCE: {
        // Target frame rate
        targetFPS: 60,
        
        // Enable GPU optimizations
        useGPU: true,
        
        // Level of detail distances
        lodDistances: {
            high: 1000,
            medium: 5000,
            low: 20000,
        },
        
        // Frustum culling
        frustumCulling: true,
        
        // Occlusion culling
        occlusionCulling: true,
        
        // Max lights per frame
        maxLights: 8,
    },

    // === DEBUG SETTINGS ===
    DEBUG: {
        showOrbits: false,
        showVectors: false,
        showColliders: false,
        showGrid: false,
        showAxes: false,
        logPhysics: false,
        logPerformance: false,
    },
};

/**
 * Scaling factors for visual representation
 * Real distances are too large to render effectively
 */
export const SCALE = {
    // Distance scale (1 scene unit = X meters)
    DISTANCE: 1e9,                     // 1 scene unit = 1 billion meters
    
    // Size scale for celestial bodies
    SIZE: 1e7,                         // 1 scene unit = 10 million meters
    
    // Time scale
    TIME: 1,                           // adjustable in real-time
};

/**
 * Physical constants
 */
export const CONSTANTS = {
    AU: 149597870700,                  // 1 Astronomical Unit in meters
    LIGHT_SPEED: 299792458,            // m/s
    EARTH_MASS: 5.972e24,              // kg
    EARTH_RADIUS: 6371000,             // meters
    SOLAR_MASS: 1.989e30,              // kg
    SOLAR_RADIUS: 696340000,           // meters
};

/**
 * Helper function to get scaled position
 */
export function scalePosition(pos) {
    return {
        x: pos.x / SCALE.DISTANCE,
        y: pos.y / SCALE.DISTANCE,
        z: pos.z / SCALE.DISTANCE,
    };
}

/**
 * Helper function to get real position from scaled
 */
export function unscalePosition(pos) {
    return {
        x: pos.x * SCALE.DISTANCE,
        y: pos.y * SCALE.DISTANCE,
        z: pos.z * SCALE.DISTANCE,
    };
}

/**
 * Calculate orbital velocity for circular orbit
 */
export function calculateOrbitalVelocity(mass, distance) {
    return Math.sqrt(CONFIG.PHYSICS.G * mass / distance);
}

/**
 * Initialize orbital parameters to ensure stable orbits
 */
export function initializeStableOrbits() {
    // Calculate proper velocities for stable circular orbits
    const sunMass = CONFIG.CELESTIAL.SUN.mass;
    
    // Planet 1
    const v1 = calculateOrbitalVelocity(sunMass, CONFIG.CELESTIAL.PLANET1.semiMajorAxis);
    CONFIG.CELESTIAL.PLANET1.velocity.z = v1;
    
    // Planet 2
    const v2 = calculateOrbitalVelocity(sunMass, CONFIG.CELESTIAL.PLANET2.semiMajorAxis);
    CONFIG.CELESTIAL.PLANET2.velocity.z = v2;
    
    // Moon (relative to Planet 1)
    const vMoon = calculateOrbitalVelocity(
        CONFIG.CELESTIAL.PLANET1.mass,
        CONFIG.CELESTIAL.MOON1.semiMajorAxis
    );
    CONFIG.CELESTIAL.MOON1.velocity.z = v1 + vMoon;
    
    console.log('✓ Orbital velocities initialized for stable system');
    console.log(`  Planet 1: ${(v1/1000).toFixed(2)} km/s`);
    console.log(`  Planet 2: ${(v2/1000).toFixed(2)} km/s`);
    console.log(`  Moon: ${(vMoon/1000).toFixed(2)} km/s (relative to planet)`);
}

// Initialize stable orbits on load
initializeStableOrbits();

export default CONFIG;
