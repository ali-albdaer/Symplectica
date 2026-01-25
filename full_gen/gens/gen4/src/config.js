/**
 * Global Configuration System
 * All celestial body parameters, physics constants, and game settings
 * Accessible in real-time via developer menu
 */

// Physics Constants
export const PHYSICS = {
    G: 6.674e-11,           // Gravitational constant (m³/kg/s²)
    SCALE: 1e-9,            // World scale (1 unit = 1e9 meters)
    TIME_SCALE: 1,          // Time multiplier (1 = real time)
    PHYSICS_STEPS: 4,       // Sub-steps per frame for accuracy
    MIN_DISTANCE: 0.001,    // Minimum distance for force calculation
    COLLISION_ELASTICITY: 0.7,
    FRICTION_COEFFICIENT: 0.5,
    AIR_RESISTANCE: 0.01,
};

// Player Constants
export const PLAYER = {
    HEIGHT: 1.8,            // meters
    RADIUS: 0.3,            // collision radius
    WALK_SPEED: 5,          // m/s
    RUN_SPEED: 10,          // m/s
    JUMP_FORCE: 8,          // m/s initial velocity
    FLIGHT_SPEED: 50,       // m/s in free flight
    FLIGHT_SPEED_FAST: 200, // m/s when holding shift in flight
    MOUSE_SENSITIVITY: 0.002,
    GRAVITY_MULTIPLIER: 1,  // Local gravity multiplier
    MASS: 80,               // kg
};

// Camera Settings
export const CAMERA = {
    FOV: 75,
    NEAR: 0.1,
    FAR: 1e12,              // Very far for space
    THIRD_PERSON_DISTANCE: 5,
    THIRD_PERSON_HEIGHT: 2,
    SMOOTHING: 0.1,         // Camera follow smoothing
    CINEMATIC_SMOOTHING: 0.03,
};

// Celestial Body Definitions
export const CELESTIAL_BODIES = {
    sun: {
        name: "Sol",
        type: "star",
        mass: 1.989e30,         // kg
        radius: 696340,          // km
        rotationPeriod: 25.38,   // days (equatorial)
        axialTilt: 7.25,         // degrees
        luminosity: 3.828e26,    // watts
        temperature: 5778,       // Kelvin (surface)
        color: 0xFFFF00,
        emissiveColor: 0xFFAA00,
        emissiveIntensity: 2,
        position: { x: 0, y: 0, z: 0 },
        velocity: { x: 0, y: 0, z: 0 },
        hasAtmosphere: false,
        isLightSource: true,
        coronaColor: 0xFFDDAA,
        coronaSize: 1.2,
    },
    
    planet1: {
        name: "Terra",
        type: "planet",
        mass: 5.972e24,          // kg
        radius: 6371,            // km
        rotationPeriod: 1,       // days
        axialTilt: 23.44,        // degrees
        orbitalPeriod: 365.25,   // days
        semiMajorAxis: 149.6e6,  // km (1 AU)
        eccentricity: 0.0167,
        inclination: 0,          // degrees
        density: 5514,           // kg/m³
        surfaceGravity: 9.81,    // m/s²
        escapeVelocity: 11.186,  // km/s
        color: 0x4488FF,
        hasAtmosphere: true,
        atmosphereColor: 0x88AAFF,
        atmosphereHeight: 100,   // km
        atmosphereDensity: 1.225, // kg/m³ at sea level
        cloudCoverage: 0.6,
        oceanCoverage: 0.71,
        parentBody: "sun",
        moons: ["moon1"],
        spawnPoint: true,        // Player spawns here
        terrainVariation: 0.02,  // Height variation as fraction of radius
    },
    
    planet2: {
        name: "Ember",
        type: "planet",
        mass: 6.39e23,           // kg (Mars-like)
        radius: 3390,            // km
        rotationPeriod: 1.03,    // days
        axialTilt: 25.19,        // degrees
        orbitalPeriod: 687,      // days
        semiMajorAxis: 227.9e6,  // km
        eccentricity: 0.0934,
        inclination: 1.85,       // degrees
        density: 3933,           // kg/m³
        surfaceGravity: 3.71,    // m/s²
        escapeVelocity: 5.03,    // km/s
        color: 0xDD6644,
        hasAtmosphere: true,
        atmosphereColor: 0xFFAA88,
        atmosphereHeight: 50,    // km
        atmosphereDensity: 0.02, // kg/m³
        cloudCoverage: 0.1,
        oceanCoverage: 0,
        parentBody: "sun",
        moons: [],
        terrainVariation: 0.03,
    },
    
    moon1: {
        name: "Luna",
        type: "moon",
        mass: 7.342e22,          // kg
        radius: 1737,            // km
        rotationPeriod: 27.32,   // days (tidally locked)
        axialTilt: 6.68,         // degrees
        orbitalPeriod: 27.32,    // days
        semiMajorAxis: 384400,   // km
        eccentricity: 0.0549,
        inclination: 5.14,       // degrees
        density: 3344,           // kg/m³
        surfaceGravity: 1.62,    // m/s²
        escapeVelocity: 2.38,    // km/s
        color: 0xCCCCCC,
        hasAtmosphere: false,
        parentBody: "planet1",
        tidallyLocked: true,
        terrainVariation: 0.01,
        craterDensity: 0.8,
    },
};

// Interactive Objects Configuration
export const INTERACTIVE_OBJECTS = {
    spawnCount: 10,
    types: {
        crate: {
            name: "Crate",
            mass: 50,            // kg
            size: { x: 1, y: 1, z: 1 },
            color: 0x8B4513,
            friction: 0.6,
            restitution: 0.3,
        },
        barrel: {
            name: "Barrel",
            mass: 30,            // kg
            radius: 0.4,
            height: 1.2,
            color: 0x444466,
            friction: 0.4,
            restitution: 0.4,
        },
        sphere: {
            name: "Ball",
            mass: 5,             // kg
            radius: 0.5,
            color: 0xFF4444,
            friction: 0.2,
            restitution: 0.8,
        },
        rock: {
            name: "Rock",
            mass: 200,           // kg
            size: { x: 1.5, y: 1, z: 1.2 },
            color: 0x666666,
            friction: 0.8,
            restitution: 0.1,
        },
    },
};

// Graphics Settings
export const GRAPHICS = {
    qualityPresets: {
        low: {
            shadowMapSize: 512,
            shadowCascades: 1,
            atmosphereSamples: 4,
            bloomEnabled: false,
            bloomStrength: 0,
            antiAliasing: 'off',
            starCount: 1000,
            planetSegments: 32,
            textureSize: 512,
            maxLights: 2,
            reflections: false,
        },
        medium: {
            shadowMapSize: 1024,
            shadowCascades: 2,
            atmosphereSamples: 8,
            bloomEnabled: true,
            bloomStrength: 0.5,
            antiAliasing: 'fxaa',
            starCount: 3000,
            planetSegments: 64,
            textureSize: 1024,
            maxLights: 4,
            reflections: false,
        },
        high: {
            shadowMapSize: 2048,
            shadowCascades: 3,
            atmosphereSamples: 16,
            bloomEnabled: true,
            bloomStrength: 1,
            antiAliasing: 'msaa',
            starCount: 5000,
            planetSegments: 128,
            textureSize: 2048,
            maxLights: 8,
            reflections: true,
        },
    },
    currentPreset: 'high',
    
    // Specific overrides
    shadows: {
        enabled: true,
        quality: 'high',        // off, low, medium, high
        bias: -0.0001,
        normalBias: 0.02,
    },
    atmosphere: {
        enabled: true,
        quality: 'high',        // off, low, medium, high
        scatteringStrength: 1,
    },
    bloom: {
        enabled: true,
        threshold: 0.8,
        strength: 1,
        radius: 0.5,
    },
    postProcessing: {
        enabled: true,
        fxaa: true,
        toneMappingExposure: 1,
    },
};

// Performance Metrics Configuration
export const PERFORMANCE = {
    showMetrics: false,
    targetFPS: 60,
    adaptiveQuality: true,
    minFPS: 30,              // Reduce quality below this
    maxFrameTime: 33,        // ms
    gcInterval: 30000,       // ms between GC hints
};

// Debug Settings
export const DEBUG = {
    showColliders: false,
    showOrbits: true,
    showVelocityVectors: false,
    showForceVectors: false,
    showGrid: false,
    pausePhysics: false,
    logPhysics: false,
    wireframeMode: false,
};

// Create a reactive config proxy for real-time updates
class ConfigManager {
    constructor() {
        this.listeners = new Map();
        this.physics = this.createProxy(PHYSICS, 'physics');
        this.player = this.createProxy(PLAYER, 'player');
        this.camera = this.createProxy(CAMERA, 'camera');
        this.graphics = this.createProxy(GRAPHICS, 'graphics');
        this.performance = this.createProxy(PERFORMANCE, 'performance');
        this.debug = this.createProxy(DEBUG, 'debug');
        this.celestialBodies = CELESTIAL_BODIES;
        this.interactiveObjects = INTERACTIVE_OBJECTS;
    }
    
    createProxy(obj, category) {
        const self = this;
        return new Proxy(obj, {
            set(target, property, value) {
                const oldValue = target[property];
                target[property] = value;
                self.notifyListeners(category, property, value, oldValue);
                return true;
            },
            get(target, property) {
                return target[property];
            }
        });
    }
    
    onChange(category, callback) {
        if (!this.listeners.has(category)) {
            this.listeners.set(category, []);
        }
        this.listeners.get(category).push(callback);
    }
    
    notifyListeners(category, property, value, oldValue) {
        if (this.listeners.has(category)) {
            this.listeners.get(category).forEach(cb => cb(property, value, oldValue));
        }
    }
    
    updateCelestialBody(id, property, value) {
        if (this.celestialBodies[id]) {
            const path = property.split('.');
            let obj = this.celestialBodies[id];
            for (let i = 0; i < path.length - 1; i++) {
                obj = obj[path[i]];
            }
            obj[path[path.length - 1]] = value;
            this.notifyListeners('celestialBodies', `${id}.${property}`, value);
        }
    }
    
    getCelestialBodyList() {
        return Object.entries(this.celestialBodies).map(([id, body]) => ({
            id,
            ...body
        }));
    }
    
    applyQualityPreset(preset) {
        const settings = GRAPHICS.qualityPresets[preset];
        if (settings) {
            GRAPHICS.currentPreset = preset;
            Object.assign(GRAPHICS.shadows, {
                quality: preset,
                enabled: preset !== 'low'
            });
            Object.assign(GRAPHICS.atmosphere, {
                quality: preset,
            });
            Object.assign(GRAPHICS.bloom, {
                enabled: settings.bloomEnabled,
                strength: settings.bloomStrength,
            });
            this.notifyListeners('graphics', 'preset', preset);
        }
    }
    
    export() {
        return JSON.stringify({
            physics: PHYSICS,
            player: PLAYER,
            camera: CAMERA,
            graphics: GRAPHICS,
            celestialBodies: CELESTIAL_BODIES,
            interactiveObjects: INTERACTIVE_OBJECTS,
        }, null, 2);
    }
    
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.physics) Object.assign(PHYSICS, data.physics);
            if (data.player) Object.assign(PLAYER, data.player);
            if (data.camera) Object.assign(CAMERA, data.camera);
            if (data.graphics) Object.assign(GRAPHICS, data.graphics);
            if (data.celestialBodies) Object.assign(CELESTIAL_BODIES, data.celestialBodies);
            if (data.interactiveObjects) Object.assign(INTERACTIVE_OBJECTS, data.interactiveObjects);
            this.notifyListeners('all', 'import', data);
            return true;
        } catch (e) {
            console.error('Failed to import config:', e);
            return false;
        }
    }
}

// Singleton export
export const Config = new ConfigManager();
export default Config;
