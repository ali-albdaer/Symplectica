/**
 * Central Configuration File
 * All physical constants, celestial body parameters, and game settings
 * All values can be modified in real-time via the developer console
 */

const CONFIG = {
    // Physics Constants
    PHYSICS: {
        GRAVITATIONAL_CONSTANT: 6.674e-11, // m^3 kg^-1 s^-2
        TIME_SCALE: 100000, // Speed up simulation (real seconds per frame second)
        INTEGRATION_SUBSTEPS: 4, // Number of physics substeps per frame for stability
        COLLISION_ELASTICITY: 0.6, // Bounciness of collisions
        FRICTION_COEFFICIENT: 0.7, // Surface friction
        MIN_DISTANCE_SQR: 1.0, // Minimum distance squared to prevent singularities (meters)
    },

    // Celestial Bodies - Sun
    SUN: {
        name: 'Sun',
        mass: 1.989e30, // kg
        radius: 696340000, // meters (actual size, will be scaled for rendering)
        visualScale: 5.0, // Visual scale multiplier for rendering
        rotationPeriod: 2160000, // seconds (25 days)
        luminosity: 3.828e26, // watts
        temperature: 5778, // kelvin
        color: 0xffdd44,
        emissiveIntensity: 1.0,
        position: { x: 0, y: 0, z: 0 }, // meters
        velocity: { x: 0, y: 0, z: 0 }, // m/s
    },

    // Planet 1 (Earth-like)
    PLANET1: {
        name: 'Planet-1',
        mass: 5.972e24, // kg (Earth mass)
        radius: 6371000, // meters (Earth radius)
        visualScale: 15.0, // Visual scale for rendering
        rotationPeriod: 86400, // seconds (24 hours)
        orbitalRadius: 1.496e11, // meters (1 AU - distance from sun)
        density: 5514, // kg/m^3
        albedo: 0.3, // Reflectivity
        color: 0x3388ff,
        hasAtmosphere: true,
        atmosphereColor: 0x88ccff,
        atmosphereOpacity: 0.15,
        // Initial position and velocity calculated for stable circular orbit
        position: null, // Will be calculated
        velocity: null, // Will be calculated
    },

    // Planet 2 (Mars-like)
    PLANET2: {
        name: 'Planet-2',
        mass: 6.417e23, // kg (Mars mass)
        radius: 3389500, // meters (Mars radius)
        visualScale: 12.0,
        rotationPeriod: 88642, // seconds (24.6 hours)
        orbitalRadius: 2.279e11, // meters (1.524 AU)
        density: 3933, // kg/m^3
        albedo: 0.25,
        color: 0xff6644,
        hasAtmosphere: false,
        position: null, // Will be calculated
        velocity: null, // Will be calculated
    },

    // Moon (orbiting Planet 1)
    MOON1: {
        name: 'Moon-1',
        mass: 7.342e22, // kg (Luna mass)
        radius: 1737400, // meters (Luna radius)
        visualScale: 8.0,
        rotationPeriod: 2360592, // seconds (27.3 days - tidally locked)
        orbitalRadius: 3.844e8, // meters (distance from Planet 1)
        density: 3344, // kg/m^3
        albedo: 0.12,
        color: 0xaaaaaa,
        hasAtmosphere: false,
        parentBody: 'PLANET1', // Orbits Planet 1
        position: null, // Will be calculated relative to Planet 1
        velocity: null, // Will be calculated
    },

    // Interactive Objects Configuration
    INTERACTIVE_OBJECTS: {
        count: 8, // Number of objects to spawn
        spawnRadius: 50, // meters from player
        spawnHeight: 2, // meters above surface
        types: [
            {
                name: 'Crate',
                mass: 50, // kg
                size: 1.5, // meters
                color: 0x8b4513,
                luminous: false,
            },
            {
                name: 'Metal Sphere',
                mass: 100, // kg
                radius: 0.8, // meters
                color: 0xcccccc,
                luminous: false,
                metalness: 0.9,
            },
            {
                name: 'Crystal',
                mass: 30, // kg
                size: 1.0, // meters
                color: 0x44ffff,
                luminous: true,
                emissiveIntensity: 0.5,
            },
            {
                name: 'Glowing Orb',
                mass: 20, // kg
                radius: 0.6, // meters
                color: 0xff44ff,
                luminous: true,
                emissiveIntensity: 0.8,
            },
        ],
    },

    // Player Configuration
    PLAYER: {
        mass: 80, // kg
        height: 1.8, // meters
        radius: 0.4, // meters (collision radius)
        walkSpeed: 5, // m/s
        runSpeed: 10, // m/s (not implemented yet)
        flySpeed: 20, // m/s
        jumpForce: 400, // Newtons
        mouseSensitivity: 0.002,
        // Spawn location (on Planet 1 surface)
        spawnPlanet: 'PLANET1',
        spawnAltitude: 2, // meters above surface
    },

    // Camera Configuration
    CAMERA: {
        fov: 75, // degrees
        near: 0.1, // meters
        far: 1e13, // meters (very far for space)
        firstPerson: {
            offset: { x: 0, y: 0.7, z: 0 }, // Eye level offset from player center
        },
        thirdPerson: {
            distance: 8, // meters behind player
            height: 3, // meters above player
            smoothness: 0.1, // Camera follow smoothness (0-1, lower = smoother)
            lookAhead: 2, // meters to look ahead of player
        },
    },

    // Rendering Configuration
    RENDERING: {
        defaultQuality: 'medium', // 'low', 'medium', 'ultra'
        qualities: {
            low: {
                shadows: false,
                shadowMapSize: 512,
                antialias: false,
                pixelRatio: 1,
                anisotropy: 1,
                particleCount: 1000,
                starCount: 5000,
            },
            medium: {
                shadows: true,
                shadowMapSize: 1024,
                antialias: true,
                pixelRatio: Math.min(window.devicePixelRatio, 1.5),
                anisotropy: 4,
                particleCount: 2000,
                starCount: 10000,
            },
            ultra: {
                shadows: true,
                shadowMapSize: 2048,
                antialias: true,
                pixelRatio: window.devicePixelRatio,
                anisotropy: 16,
                particleCount: 5000,
                starCount: 20000,
            },
        },
        enableLOD: false, // Level of Detail (off by default)
        lodDistances: [1e8, 1e9, 1e10], // meters
    },

    // Lighting Configuration
    LIGHTING: {
        sunIntensity: 1.0,
        sunColor: 0xffffff,
        ambientIntensity: 0.02, // Very minimal ambient (space is dark)
        ambientColor: 0x222244,
        shadowBias: -0.0001,
        shadowNormalBias: 0.02,
        shadowCameraNear: 1000,
        shadowCameraFar: 1e10,
    },

    // Skybox / Starfield Configuration
    SKYBOX: {
        type: 'starfield', // 'starfield' or 'skybox'
        starCount: 10000,
        starSize: 2.0,
        starColors: [0xffffff, 0xffffcc, 0xccccff, 0xffcccc],
        milkyWayIntensity: 0.3,
        backgroundColor: 0x000000,
    },

    // UI Configuration
    UI: {
        showControlsHelp: true,
        showTelemetry: false,
        telemetryUpdateRate: 100, // ms
        fpsUpdateRate: 500, // ms
    },

    // Debug Configuration
    DEBUG: {
        showDebugLog: false,
        logPhysicsWarnings: true,
        logPerformanceWarnings: true,
        showCollisionBoxes: false,
        showOrbitPaths: false,
        showVelocityVectors: false,
    },
};

/**
 * Calculate stable orbital velocities for celestial bodies
 * Uses vis-viva equation: v = sqrt(G * M / r)
 * For circular orbits around the sun
 */
function calculateOrbitalParameters() {
    const G = CONFIG.PHYSICS.GRAVITATIONAL_CONSTANT;
    const sunMass = CONFIG.SUN.mass;

    // Planet 1 - Circular orbit around sun
    const r1 = CONFIG.PLANET1.orbitalRadius;
    const v1 = Math.sqrt(G * sunMass / r1);
    CONFIG.PLANET1.position = { x: r1, y: 0, z: 0 };
    CONFIG.PLANET1.velocity = { x: 0, y: 0, z: v1 }; // Tangential velocity

    // Planet 2 - Circular orbit around sun
    const r2 = CONFIG.PLANET2.orbitalRadius;
    const v2 = Math.sqrt(G * sunMass / r2);
    CONFIG.PLANET2.position = { x: 0, y: 0, z: r2 }; // Different orbital plane
    CONFIG.PLANET2.velocity = { x: v2, y: 0, z: 0 }; // Tangential velocity

    // Moon 1 - Circular orbit around Planet 1
    const moonOrbitRadius = CONFIG.MOON1.orbitalRadius;
    const planet1Mass = CONFIG.PLANET1.mass;
    const vMoon = Math.sqrt(G * planet1Mass / moonOrbitRadius);
    
    // Position relative to Planet 1's position
    CONFIG.MOON1.position = {
        x: CONFIG.PLANET1.position.x + moonOrbitRadius,
        y: 0,
        z: CONFIG.PLANET1.position.z
    };
    
    // Velocity is Planet 1's velocity + orbital velocity around Planet 1
    CONFIG.MOON1.velocity = {
        x: CONFIG.PLANET1.velocity.x,
        y: 0,
        z: CONFIG.PLANET1.velocity.z + vMoon
    };

    console.log('Orbital parameters calculated:');
    console.log(`Planet 1: Orbital velocity = ${(v1/1000).toFixed(2)} km/s`);
    console.log(`Planet 2: Orbital velocity = ${(v2/1000).toFixed(2)} km/s`);
    console.log(`Moon 1: Orbital velocity = ${(vMoon/1000).toFixed(2)} km/s (relative to Planet 1)`);
}

// Calculate orbital parameters on load
calculateOrbitalParameters();

// Export for access in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
