/**
 * Configuration System
 * All physical constants and parameters for the solar system
 * These can be modified in real-time via the developer console
 */

window.Config = {
    // Physical constants
    physics: {
        G: 6.67430e-11,  // Gravitational constant (m^3 kg^-1 s^-2)
        dt: 0.016,        // Physics timestep (seconds, ~60fps)
        substeps: 4,      // Number of physics substeps per frame
    },

    // Scene scale (all real distances divided by this to make universe fit in view)
    // We use 1:1 scale with Floating Origin for best physics/visual alignment
    scales: {
        distanceScale: 1.0,   // 1 unit = 1 meter
        timeScale: 1.0,       // 1 unit = 1 second (physics time)
        sizeScale: 1.0,       // 1 unit = 1 meter
    },

    // Celestial bodies configuration
    bodies: {
        sun: {
            name: 'Sun',
            mass: 1.989e30,           // kg
            radius: 6.96e8,           // meters
            position: [0, 0, 0],      // scaled units
            velocity: [0, 0, 0],      // scaled units
            rotationAxis: [0, 1, 0],  // rotation axis
            rotationPeriod: 2.592e6,  // seconds (30 days)
            luminosity: 3.828e26,     // watts
            temperature: 5778,        // Kelvin
            color: { r: 1.0, g: 0.95, b: 0.8 },
            emissive: true,
            isLightSource: true,
        },

        planet1: {
            name: 'Planet 1',
            mass: 5.972e24,           // Earth mass
            radius: 6.371e6,          // meters
            semiMajorAxis: 1.496e11,  // 1 AU
            eccentricity: 0.0167,
            inclination: 0,
            position: [1.496e11, 0, 0],
            velocity: [0, 29780, 0],  // Scaled orbital velocity
            rotationAxis: [0.00005, 1, 0],
            rotationPeriod: 86400,    // seconds (1 day)
            color: { r: 0.2, g: 0.5, b: 0.8 },
            emissive: false,
            hasAtmosphere: true,
            atmosphereColor: { r: 0.5, g: 0.7, b: 1.0 },
        },

        moon1: {
            name: 'Moon 1',
            mass: 7.342e22,           // Earth's moon mass
            radius: 1.737e6,          // meters
            parent: 'planet1',
            semiMajorAxis: 3.844e8,   // Distance from parent
            position: [1.496e11 + 3.844e8, 0, 0],
            velocity: [0, 29780 + 1022, 0],  // Orbital velocity around planet
            rotationAxis: [0, 1, 0],
            rotationPeriod: 2.36e6,   // Tidally locked
            color: { r: 0.8, g: 0.8, b: 0.8 },
            emissive: false,
        },

        planet2: {
            name: 'Planet 2',
            mass: 1.898e27,           // Jupiter mass
            radius: 6.991e7,          // meters
            semiMajorAxis: 5.203e11,  // ~5 AU
            eccentricity: 0.0489,
            inclination: 0.022,
            position: [5.203e11, 0, 0],
            velocity: [0, 13070, 0],  // Scaled orbital velocity
            rotationAxis: [0, 1, 0.1],
            rotationPeriod: 35730,    // seconds (~10 hours)
            color: { r: 0.8, g: 0.7, b: 0.5 },
            emissive: false,
        },
    },

    // Interactive objects that spawn near player
    interactiveObjects: {
        enabled: true,
        count: 5,
        spawnRadius: 30,  // meters from player spawn
        types: [
            {
                name: 'Rock',
                mass: 100,        // kg
                radius: 0.5,      // meters
                color: { r: 0.7, g: 0.7, b: 0.7 },
                emissive: false,
                count: 3,
            },
            {
                name: 'Glowing Crystal',
                mass: 50,
                radius: 0.3,
                color: { r: 0.2, g: 0.8, b: 1.0 },
                emissive: true,
                luminosity: 100,
                count: 2,
            },
        ],
    },

    // Player configuration
    player: {
        mass: 100,                    // kg (player + suit + equipment)
        height: 1.8,                  // meters
        crouchHeight: 1.0,
        eyeHeight: 1.7,               // Offset from center
        walkSpeed: 4.5,               // m/s
        sprintSpeed: 7.0,             // m/s
        jumpForce: 6.0,               // m/s initial velocity on current body
        freeFlySpeed: 20.0,           // m/s in free flight mode
        freeFlyAccel: 50.0,           // m/s^2 acceleration
        damping: 0.95,                // Friction/air resistance
        spawnPosition: [1.496e11, 6.371e6 + 2, 0],  // On planet 1 surface
        canGrabObjects: true,
        grabDistance: 5.0,            // meters
    },

    // Camera configuration
    camera: {
        fov: 75,                      // degrees
        near: 0.01,                   // meters
        far: 1e15,                    // meters
        mouseSensitivity: 0.005,      // radians per pixel
        firstPersonOffset: [0, 1.7, 0],
        thirdPersonDistance: 5.0,
        thirdPersonHeight: 2.0,
        thirdPersonSmoothing: 0.1,    // Exponential smoothing factor
    },

    // Rendering configuration
    rendering: {
        fidelity: 'medium',           // 'low', 'medium', 'ultra'
        shadowMapSize: {
            low: 512,
            medium: 1024,
            ultra: 2048,
        },
        shadowCascades: {
            low: 1,
            medium: 2,
            ultra: 4,
        },
        lodEnabled: false,            // Disabled by default
        lodDistances: {
            low: [100, 500, 2000],
            medium: [500, 2000, 10000],
            ultra: [2000, 10000, 50000],
        },
        ambientLightIntensity: 0.0,   // No ambient light - sun only
        sunShadowBias: 0.0001,
        particlesEnabled: true,
        starCount: 5000,
    },

    // UI configuration
    ui: {
        showTelemetry: false,         // Toggle with 'G' key
        showDebugLog: false,          // Toggle with 'L' key
        telemetryUpdateInterval: 0.2, // seconds
        fpsCounter: true,
    },

    // Performance monitoring
    performance: {
        trackFrameTime: true,
        trackPhysicsTime: true,
        maxFrameTimeHistory: 300,     // samples
    },

    // Default method to get scaled values
    getScaledDistance(meters) {
        return meters / this.scales.distanceScale;
    },

    getScaledMass(kg) {
        return kg;  // Keep mass absolute
    },

    getScaledVelocity(mPerS) {
        // velocity in scaled distance / scaled time units
        return (mPerS / this.scales.distanceScale) * this.scales.timeScale;
    },

    getScaledSize(meters) {
        return meters / this.scales.sizeScale;
    },

    // Clone configuration for restoration
    createDefaults() {
        return JSON.parse(JSON.stringify(this));
    },

    // Restore all to defaults
    resetToDefaults() {
        const defaults = this.createDefaults();
        Object.keys(defaults).forEach(key => {
            if (typeof defaults[key] === 'object') {
                Object.assign(this[key], defaults[key]);
            } else {
                this[key] = defaults[key];
            }
        });
        DebugSystem.info('Configuration reset to defaults');
    },
};

// Store original defaults
Config._defaults = Config.createDefaults();

DebugSystem.info('Configuration system initialized', {
    distanceScale: Config.scales.distanceScale,
    timeScale: Config.scales.timeScale,
});
