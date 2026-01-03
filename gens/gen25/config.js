/**
 * SOLAR SYSTEM CONFIGURATION
 * All physical constants, celestial body parameters, and gameplay settings.
 * Easily expandable for new celestial bodies and features.
 */

const CONFIG = {
    // === SIMULATION SETTINGS ===
    simulation: {
        timeScale: 1.0,              // Time multiplier for simulation speed
        gravitationalConstant: 6.67430e-11, // G in m^3 kg^-1 s^-2
        physicsSubsteps: 4,          // Physics substeps per frame for stability
        integrationMethod: 'verlet', // 'euler', 'verlet', 'rk4'
    },

    // === RENDERING SETTINGS ===
    rendering: {
        fidelity: 'medium',          // 'low', 'medium', 'ultra'
        shadowsEnabled: true,
        shadowMapSize: 2048,         // 1024, 2048, 4096
        antialiasing: true,
        maxLights: 8,
        ambientLightIntensity: 0.0,  // No ambient light - sun only
        useLOD: false,               // Level of Detail for distant objects
        lodDistances: [1000, 5000, 20000], // LOD transition distances
    },

    // === CELESTIAL BODIES ===
    // All distances in meters, masses in kg, radii in meters
    // Initial velocities calculated for stable circular orbits
    
    sun: {
        name: 'Sun',
        type: 'star',
        mass: 1.989e30,              // Solar mass
        radius: 696340000,           // ~696,340 km (scaled down for visibility)
        visualScale: 0.05,           // Visual size multiplier for gameplay
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        rotation: [0, 0, 0],
        rotationSpeed: 0.0001,       // Radians per second
        luminosity: 3.828e26,        // Watts
        color: 0xFDB813,
        emissive: 0xFDB813,
        emissiveIntensity: 1.0,
        temperature: 5778,           // Kelvin
        lightIntensity: 1.5,
        castShadow: false,
    },

    planet1: {
        name: 'Planet Alpha',
        type: 'planet',
        mass: 5.972e24,              // Earth-like mass
        radius: 6371000,             // ~6,371 km
        visualScale: 1.0,
        position: [1.496e11, 0, 0],  // 1 AU from sun
        velocity: [0, 0, 29780],     // Orbital velocity for stable orbit (calculated)
        rotation: [0, 0, 0],
        rotationSpeed: 0.0007272,    // ~24 hour day
        color: 0x4A90E2,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        atmosphere: true,
        atmosphereColor: 0x88CCFF,
        atmosphereOpacity: 0.15,
        hasPlayerSpawn: true,
        surfaceGravity: 9.81,        // m/s^2
    },

    moon1: {
        name: 'Luna',
        type: 'moon',
        mass: 7.342e22,              // Moon mass
        radius: 1737400,             // ~1,737 km
        visualScale: 1.0,
        parent: 'planet1',           // Orbits planet1
        // Position relative to parent
        position: [1.496e11 + 384400000, 0, 0], // 384,400 km from planet1
        velocity: [0, 0, 29780 + 1022], // Planet velocity + orbital velocity around planet
        rotation: [0, 0, 0],
        rotationSpeed: 0.00026617,   // Tidally locked - ~27.3 day rotation
        color: 0xC0C0C0,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
    },

    planet2: {
        name: 'Planet Beta',
        type: 'planet',
        mass: 1.898e27,              // Jupiter-like mass
        radius: 69911000,            // ~69,911 km
        visualScale: 0.8,
        position: [0, 0, 7.785e11],  // ~5.2 AU from sun
        velocity: [13070, 0, 0],     // Orbital velocity for stable orbit
        rotation: [0, 0, 0],
        rotationSpeed: 0.0001758,    // ~10 hour day
        color: 0xE8B881,
        emissive: 0x000000,
        emissiveIntensity: 0.0,
        atmosphere: true,
        atmosphereColor: 0xD4A574,
        atmosphereOpacity: 0.25,
    },

    // === INTERACTIVE OBJECTS ===
    // Small objects spawned near the player
    interactiveObjects: [
        {
            id: 'cube1',
            type: 'cube',
            mass: 10,                // kg
            size: 1,                 // meters
            color: 0xFF6B6B,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            luminous: false,
            offsetFromPlayer: [5, 2, 0],
        },
        {
            id: 'sphere1',
            type: 'sphere',
            mass: 15,
            radius: 0.8,
            color: 0x4ECDC4,
            emissive: 0x4ECDC4,
            emissiveIntensity: 0.5,
            luminous: true,
            offsetFromPlayer: [-3, 1.5, 4],
        },
        {
            id: 'cube2',
            type: 'cube',
            mass: 8,
            size: 0.7,
            color: 0xFFE66D,
            emissive: 0xFFE66D,
            emissiveIntensity: 0.8,
            luminous: true,
            offsetFromPlayer: [2, 1, -5],
        },
        {
            id: 'sphere2',
            type: 'sphere',
            mass: 20,
            radius: 1.0,
            color: 0x95E1D3,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            luminous: false,
            offsetFromPlayer: [-6, 2.5, -2],
        },
        {
            id: 'tetrahedron1',
            type: 'tetrahedron',
            mass: 5,
            size: 1.2,
            color: 0xF38181,
            emissive: 0xF38181,
            emissiveIntensity: 0.3,
            luminous: true,
            offsetFromPlayer: [0, 3, 6],
        },
    ],

    // === PLAYER SETTINGS ===
    player: {
        height: 1.8,                 // meters
        mass: 70,                    // kg
        walkSpeed: 5,                // m/s
        sprintMultiplier: 2.0,
        jumpForce: 300,              // Newtons
        flightSpeed: 50,             // m/s in flight mode
        flightSprintMultiplier: 5.0,
        mouseSensitivity: 0.002,
        interactionDistance: 5,      // meters
        grabForceMultiplier: 100,
    },

    // === CAMERA SETTINGS ===
    camera: {
        fov: 75,
        near: 0.1,
        far: 1e13,                   // Very far for space viewing
        firstPerson: {
            height: 1.7,             // Eye height
        },
        thirdPerson: {
            distance: 8,
            height: 3,
            smoothness: 0.1,         // Lower = smoother, higher = more responsive
            rotationSpeed: 2.0,
            minDistance: 3,
            maxDistance: 50,
        },
    },

    // === UI SETTINGS ===
    ui: {
        showPerformanceMetrics: false,
        showCoordinates: false,
        showDebugLog: true,
        debugLogMaxLines: 10,
        crosshairEnabled: true,
    },

    // === SKYBOX / STARFIELD ===
    skybox: {
        enabled: true,
        starCount: 10000,            // Number of background stars
        starSize: 2.0,
        starColor: 0xFFFFFF,
        galaxyPlaneVisible: true,
        nebulaEnabled: false,        // Expandable for future
    },

    // === SPECIAL ENTITIES (Expandable) ===
    specialEntities: {
        // Example structure for future features:
        // blackholes: [],
        // wormholes: [],
        // asteroidBelts: [],
        // comets: [],
        // spaceStations: [],
    },

    // === PERFORMANCE PRESETS ===
    performancePresets: {
        low: {
            shadowMapSize: 1024,
            shadowsEnabled: true,
            antialiasing: false,
            physicsSubsteps: 2,
            maxLights: 4,
            starCount: 3000,
            useLOD: true,
        },
        medium: {
            shadowMapSize: 2048,
            shadowsEnabled: true,
            antialiasing: true,
            physicsSubsteps: 4,
            maxLights: 8,
            starCount: 10000,
            useLOD: false,
        },
        ultra: {
            shadowMapSize: 4096,
            shadowsEnabled: true,
            antialiasing: true,
            physicsSubsteps: 6,
            maxLights: 16,
            starCount: 20000,
            useLOD: false,
        },
    },

    // === CONTROL BINDINGS ===
    controls: {
        forward: 'KeyW',
        backward: 'KeyS',
        left: 'KeyA',
        right: 'KeyD',
        jump: 'Space',
        down: 'ShiftLeft',
        toggleFlight: 'KeyF',
        toggleCamera: 'KeyV',
        interact: 'Mouse2',          // Right click
        toggleDevConsole: 'Slash',
        toggleMetrics: 'F3',
        toggleCoordinates: 'F4',
    },
};

// Helper function to apply performance preset
CONFIG.applyPreset = function(preset) {
    if (this.performancePresets[preset]) {
        const settings = this.performancePresets[preset];
        this.rendering.fidelity = preset;
        this.rendering.shadowMapSize = settings.shadowMapSize;
        this.rendering.shadowsEnabled = settings.shadowsEnabled;
        this.rendering.antialiasing = settings.antialiasing;
        this.simulation.physicsSubsteps = settings.physicsSubsteps;
        this.rendering.maxLights = settings.maxLights;
        this.skybox.starCount = settings.starCount;
        this.rendering.useLOD = settings.useLOD;
        console.log(`Applied ${preset} preset`);
    }
};

// Calculate orbital velocity for circular orbit: v = sqrt(G * M / r)
CONFIG.calculateOrbitalVelocity = function(centralMass, distance) {
    return Math.sqrt(this.simulation.gravitationalConstant * centralMass / distance);
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
