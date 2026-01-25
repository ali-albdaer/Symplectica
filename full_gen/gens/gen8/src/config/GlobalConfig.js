/**
 * GlobalConfig.js
 * Central configuration file for all simulation parameters.
 * All values are accessible and modifiable at runtime via the developer menu.
 * 
 * UNITS:
 * - Distance: kilometers (km)
 * - Mass: kilograms (kg)
 * - Time: seconds (s)
 * - Velocity: km/s
 * 
 * SCALE NOTE:
 * We use a scale factor to render the solar system at manageable sizes.
 * Physics calculations use real values, rendering uses scaled values.
 */

// Scale factors for rendering (not physics)
export const RENDER_SCALE = {
    distance: 1e-6,      // 1 million km = 1 unit
    bodySize: 1e-4,      // Size multiplier for visibility
    minBodySize: 0.5,    // Minimum rendered size
    maxBodySize: 50,     // Maximum rendered size
};

// Physics constants
export const PHYSICS = {
    G: 6.67430e-20,              // Gravitational constant (km³/kg/s²)
    timeScale: 1,                 // Real-time multiplier (1 = real time)
    maxTimeScale: 1000000,        // Maximum time acceleration
    minTimeScale: 0.001,          // Minimum time scale
    physicsStepsPerFrame: 4,      // Sub-steps for accuracy
    collisionEnabled: true,       // Enable body collisions
    softeningFactor: 0.1,         // Prevents singularities in gravity calc
};

// Celestial body definitions
// IMPORTANT: These values are tuned to create a STABLE orbital system
export const CELESTIAL_BODIES = {
    sun: {
        name: "Sol",
        type: "star",
        mass: 1.989e30,              // kg
        radius: 696340,               // km
        rotationPeriod: 2160000,      // seconds (~25 days)
        luminosity: 3.828e26,         // watts
        temperature: 5778,            // Kelvin (surface)
        color: 0xFFDD44,
        emissive: 0xFFAA00,
        emissiveIntensity: 1.0,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        textureFile: null,            // Will use procedural
    },
    
    planet1: {
        name: "Terra",
        type: "planet",
        mass: 5.972e24,               // kg (Earth-like)
        radius: 6371,                  // km
        rotationPeriod: 86400,         // seconds (24 hours)
        axialTilt: 23.5,               // degrees
        atmosphereDensity: 1.0,
        atmosphereColor: 0x88AAFF,
        hasAtmosphere: true,
        color: 0x4488FF,
        // Orbital parameters - STABLE ORBIT
        orbitalRadius: 149600000,      // km (1 AU)
        orbitalPeriod: 31557600,       // seconds (1 year)
        // Initial position and velocity calculated for circular orbit
        position: { x: 149600000, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 29.78 },  // km/s for stable orbit
        isPlayerSpawn: true,
        textureFile: null,
    },
    
    planet2: {
        name: "Vulcan",
        type: "planet", 
        mass: 6.39e23,                 // kg (Mars-like)
        radius: 3389,                  // km
        rotationPeriod: 88620,         // seconds
        axialTilt: 25.2,
        atmosphereDensity: 0.01,
        atmosphereColor: 0xFFAA88,
        hasAtmosphere: true,
        color: 0xDD6644,
        // Orbital parameters - STABLE ORBIT
        orbitalRadius: 227900000,      // km (1.5 AU)
        orbitalPeriod: 59355000,       // seconds (~1.88 years)
        position: { x: 0, y: 0, z: 227900000 },
        velocity: { x: 24.07, y: 0, z: 0 },  // km/s
        isPlayerSpawn: false,
        textureFile: null,
    },
    
    moon1: {
        name: "Luna",
        type: "moon",
        parentBody: "planet1",
        mass: 7.342e22,                // kg
        radius: 1737,                  // km
        rotationPeriod: 2360591,       // seconds (tidally locked)
        color: 0xAAAAAA,
        // Orbital parameters relative to parent
        orbitalRadius: 384400,         // km from planet1
        orbitalPeriod: 2360591,        // seconds (~27.3 days)
        // Position/velocity will be calculated relative to parent
        relativePosition: { x: 384400, y: 0, z: 0 },
        relativeVelocity: { x: 0, y: 0, z: 1.022 },  // km/s
        textureFile: null,
    },
};

// Player configuration
export const PLAYER = {
    height: 0.002,                 // km (2 meters in km)
    walkSpeed: 0.000005,           // km per frame
    runSpeed: 0.00001,             // km per frame
    jumpForce: 0.00001,            // km/s
    mouseSensitivity: 0.002,
    freeFlightSpeed: 0.001,        // km per frame
    freeFlightFastMultiplier: 5,
    mass: 80,                      // kg
    spawnAltitude: 0.01,           // km above surface
    interactionRange: 0.005,       // km
};

// Camera settings
export const CAMERA = {
    fov: 75,
    near: 0.0001,
    far: 1e10,
    thirdPersonDistance: 0.005,    // km behind player
    thirdPersonHeight: 0.002,      // km above player
    smoothingFactor: 0.1,
    cinematicMode: false,
    cinematicSmoothness: 0.02,
};

// Interactive objects spawned near player
export const INTERACTIVE_OBJECTS = {
    spawnRadius: 0.01,             // km from player
    objects: [
        {
            name: "Rock1",
            type: "rock",
            mass: 100,             // kg
            size: 0.0005,          // km
            color: 0x888888,
        },
        {
            name: "Rock2", 
            type: "rock",
            mass: 50,
            size: 0.0003,
            color: 0x666655,
        },
        {
            name: "Crate",
            type: "crate",
            mass: 200,
            size: 0.001,
            color: 0x8B4513,
        },
        {
            name: "Sphere",
            type: "sphere",
            mass: 75,
            size: 0.0004,
            color: 0xFF4444,
        },
        {
            name: "Cylinder",
            type: "cylinder",
            mass: 150,
            size: 0.0006,
            color: 0x44FF44,
        },
    ],
};

// Visual quality settings
export const QUALITY_PRESETS = {
    low: {
        shadowMapSize: 512,
        shadowsEnabled: false,
        atmosphereQuality: 0,
        starCount: 1000,
        antialiasing: false,
        bloomEnabled: false,
        ambientOcclusionEnabled: false,
        textureResolution: 256,
        maxLights: 2,
        particleCount: 100,
    },
    medium: {
        shadowMapSize: 1024,
        shadowsEnabled: true,
        atmosphereQuality: 1,
        starCount: 5000,
        antialiasing: true,
        bloomEnabled: true,
        ambientOcclusionEnabled: false,
        textureResolution: 512,
        maxLights: 4,
        particleCount: 500,
    },
    high: {
        shadowMapSize: 2048,
        shadowsEnabled: true,
        atmosphereQuality: 2,
        starCount: 10000,
        antialiasing: true,
        bloomEnabled: true,
        ambientOcclusionEnabled: true,
        textureResolution: 1024,
        maxLights: 8,
        particleCount: 2000,
    },
};

// Current quality level (modifiable at runtime)
export let currentQuality = 'medium';

// Debug and performance settings
export const DEBUG = {
    showFPS: true,
    showCoordinates: true,
    showPhysicsDebug: false,
    showOrbitPaths: true,
    showVelocityVectors: false,
    showGravityVectors: false,
    logPhysicsUpdates: false,
    logRenderUpdates: false,
    verboseLogging: false,
    pauseOnError: true,
};

// UI settings
export const UI = {
    devMenuKey: '/',
    toggleFlightKey: 'Insert',
    toggleViewKey: 'V',
    toggleDebugKey: 'F3',
    pauseKey: 'P',
    timeSlowKey: '[',
    timeFastKey: ']',
};

/**
 * Runtime configuration manager
 * Allows modifying config values at runtime and notifies listeners
 */
class ConfigManager {
    constructor() {
        this.listeners = new Map();
        this.history = [];
    }

    /**
     * Update a configuration value
     * @param {string} path - Dot-notation path like "PHYSICS.timeScale"
     * @param {any} value - New value
     */
    set(path, value) {
        const parts = path.split('.');
        let obj = this.getConfigObject(parts[0]);
        
        if (!obj) {
            console.error(`[Config] Unknown config section: ${parts[0]}`);
            return false;
        }

        const oldValue = this.get(path);
        
        // Navigate to the property
        for (let i = 1; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
            if (obj === undefined) {
                console.error(`[Config] Invalid path: ${path}`);
                return false;
            }
        }

        const key = parts[parts.length - 1];
        obj[key] = value;

        // Log the change
        this.history.push({
            timestamp: Date.now(),
            path,
            oldValue,
            newValue: value,
        });

        console.log(`[Config] ${path}: ${oldValue} -> ${value}`);

        // Notify listeners
        this.notifyListeners(path, value, oldValue);
        
        return true;
    }

    /**
     * Get a configuration value
     * @param {string} path - Dot-notation path
     */
    get(path) {
        const parts = path.split('.');
        let obj = this.getConfigObject(parts[0]);
        
        for (let i = 1; i < parts.length; i++) {
            if (obj === undefined) return undefined;
            obj = obj[parts[i]];
        }
        
        return obj;
    }

    getConfigObject(name) {
        const configs = {
            RENDER_SCALE,
            PHYSICS,
            CELESTIAL_BODIES,
            PLAYER,
            CAMERA,
            INTERACTIVE_OBJECTS,
            QUALITY_PRESETS,
            DEBUG,
            UI,
        };
        return configs[name];
    }

    /**
     * Subscribe to configuration changes
     */
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, []);
        }
        this.listeners.get(path).push(callback);
    }

    notifyListeners(path, newValue, oldValue) {
        // Notify exact path listeners
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(cb => cb(newValue, oldValue));
        }
        
        // Notify wildcard listeners
        const section = path.split('.')[0];
        if (this.listeners.has(section + '.*')) {
            this.listeners.get(section + '.*').forEach(cb => cb(path, newValue, oldValue));
        }
    }

    /**
     * Get all configuration as a flat object for the dev menu
     */
    getAllFlat() {
        const result = {};
        const addFlat = (obj, prefix) => {
            for (const key in obj) {
                const path = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    addFlat(obj[key], path);
                } else {
                    result[path] = obj[key];
                }
            }
        };

        addFlat({ PHYSICS, PLAYER, CAMERA, DEBUG }, '');
        return result;
    }

    /**
     * Reset to defaults (would need to store initial values)
     */
    getHistory() {
        return [...this.history];
    }
}

// Global config manager instance
export const configManager = new ConfigManager();

// Helper function to calculate stable orbital velocity
export function calculateOrbitalVelocity(centralMass, orbitalRadius) {
    // v = sqrt(G * M / r)
    return Math.sqrt(PHYSICS.G * centralMass / orbitalRadius);
}

// Validate orbital stability
export function validateOrbitalStability() {
    console.log('[Config] Validating orbital stability...');
    
    const sun = CELESTIAL_BODIES.sun;
    
    for (const [key, body] of Object.entries(CELESTIAL_BODIES)) {
        if (body.type === 'planet') {
            const expectedV = calculateOrbitalVelocity(sun.mass, body.orbitalRadius);
            const actualV = Math.sqrt(
                body.velocity.x ** 2 + 
                body.velocity.y ** 2 + 
                body.velocity.z ** 2
            );
            const error = Math.abs(actualV - expectedV) / expectedV * 100;
            
            console.log(`[Config] ${body.name}: Expected v=${expectedV.toFixed(4)} km/s, Actual v=${actualV.toFixed(4)} km/s, Error=${error.toFixed(2)}%`);
            
            if (error > 5) {
                console.warn(`[Config] WARNING: ${body.name} may have unstable orbit!`);
            }
        }
    }
}

export default {
    RENDER_SCALE,
    PHYSICS,
    CELESTIAL_BODIES,
    PLAYER,
    CAMERA,
    INTERACTIVE_OBJECTS,
    QUALITY_PRESETS,
    DEBUG,
    UI,
    configManager,
    calculateOrbitalVelocity,
    validateOrbitalStability,
};
