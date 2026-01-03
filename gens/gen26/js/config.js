/**
 * ============================================
 * Solar System Simulation - Configuration
 * ============================================
 * 
 * This file contains all global configuration variables.
 * All values can be modified at runtime via the Developer Console.
 * 
 * UNITS:
 * - Distance: kilometers (scaled down for rendering)
 * - Mass: kilograms
 * - Time: seconds (simulation time)
 * - Velocity: km/s
 */

const CONFIG = {
    // ==========================================
    // VERSION & META
    // ==========================================
    VERSION: '1.0.0',
    DEBUG_MODE: true,

    // ==========================================
    // PHYSICS CONSTANTS
    // ==========================================
    PHYSICS: {
        // Gravitational constant (m³/kg/s²) - scaled for simulation
        // Real value: 6.674e-11, we use a scaled version for stability
        G: 6.674e-11,
        
        // Scale factor to convert real distances to simulation units
        // 1 simulation unit = DISTANCE_SCALE km
        DISTANCE_SCALE: 1e6, // 1 unit = 1,000,000 km
        
        // Time scale: simulation seconds per real second
        TIME_SCALE: 1,
        
        // Physics substeps per frame for accuracy
        SUBSTEPS: 4,
        
        // Minimum distance for gravity calculation (prevents singularities)
        MIN_DISTANCE: 0.001,
        
        // Softening parameter for N-body stability
        SOFTENING: 0.01,
        
        // Integration method: 'euler', 'verlet', 'rk4'
        INTEGRATOR: 'verlet',
    },

    // ==========================================
    // CELESTIAL BODIES
    // ==========================================
    // All distances in km, masses in kg, velocities in km/s
    // These are calculated to create stable orbits
    CELESTIAL_BODIES: {
        SUN: {
            name: 'Sol',
            type: 'star',
            mass: 1.989e30,           // kg
            radius: 695700,           // km
            rotationPeriod: 25.05 * 24 * 3600, // seconds (25 days)
            color: 0xFFDD44,
            emissiveColor: 0xFFAA00,
            luminosity: 3.828e26,     // Watts
            temperature: 5778,        // Kelvin
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
        },
        
        PLANET_1: {
            name: 'Terra',
            type: 'planet',
            mass: 5.972e24,           // kg (Earth-like)
            radius: 6371,             // km
            rotationPeriod: 24 * 3600, // seconds (24 hours)
            color: 0x4488FF,
            // Orbital parameters - calculated for stable orbit
            // Orbital radius: ~150 million km (1 AU)
            orbitalRadius: 149.6e6,   // km
            orbitalPeriod: 365.25 * 24 * 3600, // seconds
            // Initial position and velocity for circular orbit
            position: { x: 149.6e6, y: 0, z: 0 },
            // Orbital velocity: v = sqrt(GM/r)
            // v = sqrt(6.674e-11 * 1.989e30 / 149.6e9) ≈ 29.78 km/s
            velocity: { x: 0, y: 0, z: 29.78 },
            axialTilt: 23.44,         // degrees
            hasAtmosphere: true,
            atmosphereColor: 0x88AAFF,
            atmosphereScale: 1.02,
        },
        
        PLANET_2: {
            name: 'Aethon',
            type: 'planet',
            mass: 6.39e23,            // kg (Mars-like)
            radius: 3389,             // km
            rotationPeriod: 24.6 * 3600, // seconds
            color: 0xDD6644,
            // Orbital radius: ~228 million km (1.52 AU)
            orbitalRadius: 227.9e6,   // km
            orbitalPeriod: 687 * 24 * 3600, // seconds
            position: { x: 0, y: 0, z: -227.9e6 },
            // v = sqrt(6.674e-11 * 1.989e30 / 227.9e9) ≈ 24.13 km/s
            velocity: { x: 24.13, y: 0, z: 0 },
            axialTilt: 25.19,
            hasAtmosphere: true,
            atmosphereColor: 0xFFAA88,
            atmosphereScale: 1.01,
        },
        
        MOON_1: {
            name: 'Luna',
            type: 'moon',
            parentBody: 'PLANET_1',
            mass: 7.342e22,           // kg
            radius: 1737,             // km
            rotationPeriod: 27.3 * 24 * 3600, // seconds (tidally locked)
            color: 0xAAAAAA,
            // Orbital radius from parent: 384,400 km
            orbitalRadius: 384400,    // km from parent
            orbitalPeriod: 27.3 * 24 * 3600, // seconds
            // Relative position (will be added to parent position)
            relativePosition: { x: 384400, y: 0, z: 0 },
            // v = sqrt(GM_earth/r) ≈ 1.022 km/s
            relativeVelocity: { x: 0, y: 0, z: 1.022 },
        },
    },

    // ==========================================
    // PLAYER SETTINGS
    // ==========================================
    PLAYER: {
        // Movement
        WALK_SPEED: 5,              // m/s
        RUN_SPEED: 10,              // m/s
        FLIGHT_SPEED: 50,           // units/s
        FLIGHT_SPEED_FAST: 200,     // units/s with shift
        JUMP_FORCE: 8,              // m/s
        
        // Physics
        MASS: 80,                   // kg
        HEIGHT: 1.8,                // meters
        RADIUS: 0.4,                // meters (collision)
        
        // Camera
        MOUSE_SENSITIVITY: 0.002,
        
        // Spawn location (on Planet 1 surface)
        SPAWN_BODY: 'PLANET_1',
        SPAWN_LATITUDE: 0,          // degrees
        SPAWN_LONGITUDE: 0,         // degrees
    },

    // ==========================================
    // INTERACTIVE OBJECTS
    // ==========================================
    OBJECTS: {
        SPAWN_COUNT: 8,
        TYPES: [
            {
                name: 'Cube',
                geometry: 'box',
                size: { x: 0.5, y: 0.5, z: 0.5 },
                mass: 10,
                color: 0x44AAFF,
                luminous: false,
            },
            {
                name: 'Sphere',
                geometry: 'sphere',
                size: { radius: 0.3 },
                mass: 8,
                color: 0xFF4444,
                luminous: false,
            },
            {
                name: 'Glowing Orb',
                geometry: 'sphere',
                size: { radius: 0.25 },
                mass: 5,
                color: 0x44FF88,
                luminous: true,
                lightIntensity: 2,
                lightDistance: 10,
            },
            {
                name: 'Energy Crystal',
                geometry: 'octahedron',
                size: { radius: 0.4 },
                mass: 15,
                color: 0xAA44FF,
                luminous: true,
                lightIntensity: 3,
                lightDistance: 15,
            },
            {
                name: 'Metal Block',
                geometry: 'box',
                size: { x: 0.6, y: 0.3, z: 0.4 },
                mass: 50,
                color: 0x888888,
                luminous: false,
            },
        ],
    },

    // ==========================================
    // RENDERING SETTINGS
    // ==========================================
    RENDERING: {
        // Fidelity presets
        FIDELITY: 'medium', // 'low', 'medium', 'ultra'
        
        FIDELITY_PRESETS: {
            low: {
                shadowMapSize: 512,
                shadowsEnabled: true,
                antialias: false,
                pixelRatio: 0.75,
                starCount: 2000,
                planetSegments: 16,
                atmosphereEnabled: false,
                bloomEnabled: false,
            },
            medium: {
                shadowMapSize: 1024,
                shadowsEnabled: true,
                antialias: true,
                pixelRatio: 1,
                starCount: 5000,
                planetSegments: 32,
                atmosphereEnabled: true,
                bloomEnabled: false,
            },
            ultra: {
                shadowMapSize: 2048,
                shadowsEnabled: true,
                antialias: true,
                pixelRatio: window.devicePixelRatio || 1,
                starCount: 10000,
                planetSegments: 64,
                atmosphereEnabled: true,
                bloomEnabled: true,
            },
        },
        
        // LOD Settings
        LOD_ENABLED: false,
        LOD_DISTANCES: [100, 500, 2000],
        
        // Camera
        FOV: 75,
        NEAR_CLIP: 0.01,
        FAR_CLIP: 1e9,
        
        // Third person camera
        THIRD_PERSON_DISTANCE: 5,
        THIRD_PERSON_HEIGHT: 2,
        CAMERA_SMOOTHING: 0.1,
    },

    // ==========================================
    // SKY & ENVIRONMENT
    // ==========================================
    SKY: {
        // Background color (deep space)
        BACKGROUND_COLOR: 0x000005,
        
        // Star field
        STAR_COUNT: 5000,
        STAR_MIN_SIZE: 0.5,
        STAR_MAX_SIZE: 2.0,
        STAR_FIELD_RADIUS: 1e8,
        
        // Star colors (realistic distribution)
        STAR_COLORS: [
            0xFFFFFF, // White
            0xFFFFDD, // Warm white
            0xFFDDBB, // Yellow
            0xFFBB88, // Orange
            0xBBDDFF, // Blue-white
            0x88BBFF, // Blue
        ],
    },

    // ==========================================
    // UI SETTINGS
    // ==========================================
    UI: {
        // HUD
        SHOW_FPS: true,
        SHOW_COORDINATES: true,
        SHOW_CONTROLS_HINT: true,
        
        // Debug
        SHOW_DEBUG_LOG: true,
        MAX_DEBUG_ENTRIES: 50,
        
        // Dev console key
        DEV_CONSOLE_KEY: '/',
        TOGGLE_HUD_KEY: 't',
        TOGGLE_CAMERA_KEY: 'v',
        TOGGLE_FLIGHT_KEY: 'f',
    },
};

// ==========================================
// DERIVED CONSTANTS (calculated at runtime)
// ==========================================

// Calculate simulation scale factors
CONFIG.DERIVED = {
    // Convert real distance (km) to simulation units
    toSimUnits: (km) => km / CONFIG.PHYSICS.DISTANCE_SCALE,
    
    // Convert simulation units to real distance (km)
    toRealUnits: (units) => units * CONFIG.PHYSICS.DISTANCE_SCALE,
    
    // Scaled gravitational constant for simulation units
    // G_sim = G_real * (distance_scale)^3 / (distance_scale)
    get G_SCALED() {
        const ds = CONFIG.PHYSICS.DISTANCE_SCALE * 1000; // Convert to meters
        return CONFIG.PHYSICS.G;
    },
};

// Freeze the derived constants to prevent accidental modification
Object.freeze(CONFIG.DERIVED);

// Export for module systems (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
