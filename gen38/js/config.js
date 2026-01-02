/**
 * Solar System Simulation - Configuration
 * ========================================
 * Central configuration file for all simulation parameters.
 * All values can be modified in real-time via the developer console.
 */

const Config = {
    // ==========================================
    // SIMULATION SCALE
    // ==========================================
    // These scale factors convert real-world values to simulation units
    scale: {
        // Distance scale: 1 unit = X meters (1e9 = 1 billion meters)
        distance: 1e-9,
        // Time scale: simulation seconds per real second
        timeScale: 1.0,
        // Mass scale for physics calculations
        massScale: 1e-24,
        // Size multiplier for visual representation (planets would be invisible at true scale)
        visualSizeMultiplier: 50,
    },

    // ==========================================
    // PHYSICS CONSTANTS
    // ==========================================
    physics: {
        // Gravitational constant (scaled for simulation)
        // Real G = 6.674e-11 m³/(kg·s²)
        G: 6.674e-11,
        // Physics timestep (seconds)
        fixedDeltaTime: 1 / 60,
        // Maximum physics substeps per frame
        maxSubsteps: 4,
        // Minimum distance for force calculation (prevents infinite forces)
        minDistance: 0.001,
        // Softening parameter for N-body simulation
        softening: 0.01,
        // Enable N-body interactions for small objects
        microPhysicsEnabled: true,
        // Gravity strength multiplier for player/objects (for gameplay feel)
        localGravityMultiplier: 1.0,
    },

    // ==========================================
    // SUN CONFIGURATION
    // ==========================================
    sun: {
        name: "Sol",
        // Mass in kg (real: 1.989e30)
        mass: 1.989e30,
        // Radius in meters (real: 6.96e8)
        radius: 6.96e8,
        // Visual radius (scaled for visibility)
        visualRadius: 15,
        // Position (center of solar system)
        position: { x: 0, y: 0, z: 0 },
        // Rotation period in seconds (real: ~25 days)
        rotationPeriod: 2160000,
        // Luminosity (relative to real sun = 1.0)
        luminosity: 1.0,
        // Surface temperature in Kelvin
        temperature: 5778,
        // Color
        color: 0xFFDD44,
        // Emission intensity
        emissionIntensity: 2.0,
    },

    // ==========================================
    // PLANET 1 CONFIGURATION (Player spawn planet)
    // ==========================================
    planet1: {
        name: "Terra",
        // Mass in kg (Earth-like)
        mass: 5.972e24,
        // Radius in meters
        radius: 6.371e6,
        // Visual radius
        visualRadius: 3,
        // Semi-major axis (distance from sun) in meters
        orbitalRadius: 1.496e11,
        // Orbital period calculated from Kepler's third law
        // For stable orbit: v = sqrt(G * M_sun / r)
        // Initial orbital velocity (tangential) - calculated for circular orbit
        orbitalVelocity: 29780, // m/s (Earth's actual orbital velocity)
        // Starting angle in orbit (radians)
        orbitalAngle: 0,
        // Axial tilt (radians)
        axialTilt: 0.4101,
        // Rotation period (day length) in seconds
        rotationPeriod: 86400,
        // Has atmosphere
        hasAtmosphere: true,
        // Atmosphere color
        atmosphereColor: 0x4488FF,
        // Surface colors
        color: 0x228855,
        // Density kg/m³
        density: 5514,
    },

    // ==========================================
    // PLANET 2 CONFIGURATION
    // ==========================================
    planet2: {
        name: "Helios",
        // Larger, Mars-like planet
        mass: 6.39e23,
        radius: 3.389e6,
        visualRadius: 2,
        // Further from sun
        orbitalRadius: 2.279e11,
        // Orbital velocity for stable orbit
        orbitalVelocity: 24070, // m/s
        orbitalAngle: Math.PI * 0.7,
        axialTilt: 0.44,
        rotationPeriod: 88620,
        hasAtmosphere: true,
        atmosphereColor: 0xFF8866,
        color: 0xCC4422,
        density: 3933,
    },

    // ==========================================
    // MOON CONFIGURATION (Orbits Planet 1)
    // ==========================================
    moon: {
        name: "Luna",
        parentPlanet: "planet1",
        mass: 7.342e22,
        radius: 1.737e6,
        visualRadius: 0.8,
        // Distance from parent planet
        orbitalRadius: 3.844e8,
        // Orbital velocity around parent
        orbitalVelocity: 1022, // m/s
        orbitalAngle: 0,
        rotationPeriod: 2360592, // Tidally locked
        color: 0xAAAAAA,
        density: 3344,
    },

    // ==========================================
    // PLAYER CONFIGURATION
    // ==========================================
    player: {
        // Spawn on Planet 1
        spawnPlanet: "planet1",
        // Height above surface
        spawnHeight: 5,
        // Player dimensions
        height: 1.8,
        radius: 0.3,
        mass: 70,
        // Movement speeds
        walkSpeed: 5,
        runSpeed: 10,
        flySpeed: 20,
        fastFlySpeed: 100,
        // Jump force
        jumpForce: 8,
        // Mouse sensitivity
        mouseSensitivity: 0.002,
        // Camera settings
        firstPersonFOV: 75,
        thirdPersonFOV: 60,
        thirdPersonDistance: 8,
        thirdPersonHeight: 3,
        // Smoothing
        movementSmoothing: 0.15,
        cameraSmoothing: 0.08,
    },

    // ==========================================
    // INTERACTIVE OBJECTS
    // ==========================================
    interactiveObjects: {
        // Number of objects to spawn near player
        count: 8,
        // Spawn radius from player
        spawnRadius: 15,
        // Object types
        types: [
            {
                name: "Cube",
                geometry: "box",
                size: { x: 0.5, y: 0.5, z: 0.5 },
                mass: 10,
                color: 0x44AAFF,
                luminous: false,
            },
            {
                name: "Sphere",
                geometry: "sphere",
                size: { radius: 0.3 },
                mass: 5,
                color: 0xFF4444,
                luminous: false,
            },
            {
                name: "Glowing Orb",
                geometry: "sphere",
                size: { radius: 0.25 },
                mass: 3,
                color: 0x44FF88,
                luminous: true,
                luminosity: 2,
            },
            {
                name: "Crystal",
                geometry: "octahedron",
                size: { radius: 0.4 },
                mass: 8,
                color: 0xFF44FF,
                luminous: true,
                luminosity: 1.5,
            },
            {
                name: "Large Rock",
                geometry: "dodecahedron",
                size: { radius: 0.6 },
                mass: 50,
                color: 0x666666,
                luminous: false,
            },
        ],
        // Grab settings
        grabDistance: 5,
        holdDistance: 3,
        throwForce: 15,
    },

    // ==========================================
    // RENDERING SETTINGS
    // ==========================================
    rendering: {
        // Fidelity level: 'low', 'medium', 'ultra'
        fidelityLevel: 'medium',
        
        // Shadow settings
        shadows: {
            enabled: true,
            mapSize: 2048, // Will be adjusted by fidelity
            cascades: 3,
            bias: -0.0001,
        },
        
        // Anti-aliasing
        antialias: true,
        
        // Post-processing
        bloom: {
            enabled: true,
            intensity: 0.5,
            threshold: 0.8,
            radius: 0.5,
        },
        
        // LOD settings
        lod: {
            enabled: false, // Off by default as requested
            distances: [50, 150, 400],
        },
        
        // Atmosphere rendering
        atmosphere: {
            enabled: true,
            quality: 'medium',
        },
        
        // Star field
        starField: {
            count: 10000,
            size: 1.0,
            brightness: 1.0,
        },
        
        // Maximum render distance
        farPlane: 1e12,
        nearPlane: 0.1,
        
        // Texture quality multiplier
        textureQuality: 1.0,
    },

    // ==========================================
    // FIDELITY PRESETS
    // ==========================================
    fidelityPresets: {
        low: {
            shadowMapSize: 512,
            shadowCascades: 1,
            bloomEnabled: false,
            atmosphereQuality: 'low',
            starFieldCount: 3000,
            antialias: false,
            textureQuality: 0.5,
        },
        medium: {
            shadowMapSize: 2048,
            shadowCascades: 2,
            bloomEnabled: true,
            atmosphereQuality: 'medium',
            starFieldCount: 10000,
            antialias: true,
            textureQuality: 1.0,
        },
        ultra: {
            shadowMapSize: 4096,
            shadowCascades: 4,
            bloomEnabled: true,
            atmosphereQuality: 'high',
            starFieldCount: 25000,
            antialias: true,
            textureQuality: 2.0,
        },
    },

    // ==========================================
    // UI SETTINGS
    // ==========================================
    ui: {
        telemetryVisible: false,
        controlsHelpVisible: true,
        debugConsoleVisible: false,
        crosshairVisible: true,
        modeIndicatorVisible: true,
    },

    // ==========================================
    // DEBUG SETTINGS
    // ==========================================
    debug: {
        // Show orbit paths
        showOrbits: false,
        // Show velocity vectors
        showVelocityVectors: false,
        // Show force vectors
        showForceVectors: false,
        // Show colliders
        showColliders: false,
        // Physics debug info
        physicsDebug: false,
        // Log physics calculations
        logPhysics: false,
        // Pause physics
        physicsPaused: false,
    },
};

// ==========================================
// CONFIGURATION HELPER METHODS
// ==========================================
Config.applyFidelityPreset = function(level) {
    const preset = this.fidelityPresets[level];
    if (!preset) {
        console.warn(`Unknown fidelity level: ${level}`);
        return;
    }
    
    this.rendering.fidelityLevel = level;
    this.rendering.shadows.mapSize = preset.shadowMapSize;
    this.rendering.shadows.cascades = preset.shadowCascades;
    this.rendering.bloom.enabled = preset.bloomEnabled;
    this.rendering.atmosphere.quality = preset.atmosphereQuality;
    this.rendering.starField.count = preset.starFieldCount;
    this.rendering.antialias = preset.antialias;
    this.rendering.textureQuality = preset.textureQuality;
    
    Logger.info(`Applied fidelity preset: ${level}`);
};

Config.calculateOrbitalVelocity = function(parentMass, orbitalRadius) {
    // v = sqrt(G * M / r) for circular orbit
    return Math.sqrt(this.physics.G * parentMass / orbitalRadius);
};

Config.validateOrbitalParameters = function() {
    // Verify that orbital velocities will produce stable orbits
    const sunMass = this.sun.mass;
    
    // Check Planet 1
    const p1ExpectedV = this.calculateOrbitalVelocity(sunMass, this.planet1.orbitalRadius);
    const p1Diff = Math.abs(this.planet1.orbitalVelocity - p1ExpectedV) / p1ExpectedV;
    if (p1Diff > 0.01) {
        Logger.warn(`Planet 1 orbital velocity differs from stable orbit by ${(p1Diff * 100).toFixed(1)}%`);
    }
    
    // Check Planet 2
    const p2ExpectedV = this.calculateOrbitalVelocity(sunMass, this.planet2.orbitalRadius);
    const p2Diff = Math.abs(this.planet2.orbitalVelocity - p2ExpectedV) / p2ExpectedV;
    if (p2Diff > 0.01) {
        Logger.warn(`Planet 2 orbital velocity differs from stable orbit by ${(p2Diff * 100).toFixed(1)}%`);
    }
    
    // Check Moon
    const p1Mass = this.planet1.mass;
    const moonExpectedV = this.calculateOrbitalVelocity(p1Mass, this.moon.orbitalRadius);
    const moonDiff = Math.abs(this.moon.orbitalVelocity - moonExpectedV) / moonExpectedV;
    if (moonDiff > 0.01) {
        Logger.warn(`Moon orbital velocity differs from stable orbit by ${(moonDiff * 100).toFixed(1)}%`);
    }
    
    Logger.info("Orbital parameters validated");
};

// Freeze the structure (not values) to prevent accidental property addition
Object.seal(Config);
Object.seal(Config.scale);
Object.seal(Config.physics);
Object.seal(Config.sun);
Object.seal(Config.planet1);
Object.seal(Config.planet2);
Object.seal(Config.moon);
Object.seal(Config.player);
Object.seal(Config.interactiveObjects);
Object.seal(Config.rendering);
Object.seal(Config.ui);
Object.seal(Config.debug);
