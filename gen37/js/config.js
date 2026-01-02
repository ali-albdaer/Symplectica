/**
 * Configuration - Centralized storage for all simulation parameters
 * All values can be modified at runtime through the developer console
 */

const Config = (function() {
    'use strict';
    
    // =========================================
    // PHYSICAL CONSTANTS
    // =========================================
    const PHYSICS = {
        // Gravitational constant (scaled for simulation)
        // Real G = 6.674e-11 m³/(kg·s²)
        // We use a scaled version for manageable numbers
        G: 6.674e-11,
        
        // Speed of light (m/s) - for future relativistic effects
        C: 299792458,
        
        // Simulation time scale (simulation seconds per real second)
        timeScale: 1000,
        
        // Physics update rate (Hz)
        physicsRate: 60,
        
        // Minimum distance for gravity calculations (prevents singularities)
        minGravityDistance: 1000,
        
        // Maximum velocity allowed (prevents numerical instability)
        maxVelocity: 1e8,
        
        // Integration method: 'euler', 'verlet', 'rk4'
        integrationMethod: 'verlet',
        
        // Softening parameter for gravity (prevents extreme forces at close range)
        softeningParameter: 1e6
    };
    
    // =========================================
    // SCALE FACTORS
    // For visualization - real scales would make planets invisible
    // =========================================
    const SCALE = {
        // Distance scale (1 unit = X meters)
        distance: 1e9,  // 1 unit = 1 million km
        
        // Size scale for celestial bodies (multiplier for visibility)
        bodySize: 1e-6,
        
        // Exaggerate planet sizes for visibility (multiplier)
        sizeExaggeration: 50,
        
        // Player scale relative to planets
        playerScale: 1
    };
    
    // =========================================
    // SUN CONFIGURATION
    // =========================================
    const SUN = {
        name: 'Sol',
        mass: 1.989e30,        // kg
        radius: 6.96e8,        // meters
        temperature: 5778,      // Kelvin (surface)
        luminosity: 3.828e26,   // Watts
        color: 0xFFDD44,
        emissiveIntensity: 2.0,
        rotationPeriod: 25.38 * 24 * 3600,  // seconds (equatorial)
        
        // Corona effect settings
        coronaSize: 1.5,
        coronaOpacity: 0.3,
        
        // Light settings
        lightIntensity: 2.0,
        lightDistance: 1e12,
        castShadow: true,
        shadowMapSize: 2048
    };
    
    // =========================================
    // PLANET CONFIGURATIONS
    // =========================================
    const PLANETS = {
        planet1: {
            name: 'Terra',
            mass: 5.972e24,         // kg (Earth-like)
            radius: 6.371e6,        // meters
            color: 0x4488FF,
            
            // Orbital parameters
            orbitalRadius: 1.496e11,     // meters (1 AU)
            orbitalInclination: 0,       // degrees
            orbitalEccentricity: 0,      // circular orbit for stability
            
            // Rotation
            rotationPeriod: 24 * 3600,   // seconds
            axialTilt: 23.5,             // degrees
            
            // Atmosphere (visual only for now)
            hasAtmosphere: true,
            atmosphereColor: 0x88AAFF,
            atmosphereOpacity: 0.15,
            atmosphereScale: 1.02,
            
            // Surface properties
            surfaceGravity: 9.81,        // m/s² (calculated from mass/radius)
            density: 5515,               // kg/m³
            
            // Visuals
            roughness: 0.8,
            metalness: 0.1
        },
        
        planet2: {
            name: 'Ruber',
            mass: 6.39e23,           // kg (Mars-like)
            radius: 3.39e6,          // meters
            color: 0xCC6644,
            
            // Orbital parameters - further out for stability
            orbitalRadius: 2.28e11,      // meters (~1.5 AU)
            orbitalInclination: 1.85,    // degrees
            orbitalEccentricity: 0,      // circular for stability
            
            // Rotation
            rotationPeriod: 24.6 * 3600, // seconds
            axialTilt: 25.2,             // degrees
            
            // Atmosphere
            hasAtmosphere: true,
            atmosphereColor: 0xFFAA88,
            atmosphereOpacity: 0.08,
            atmosphereScale: 1.01,
            
            // Surface properties
            surfaceGravity: 3.72,
            density: 3933,
            
            // Visuals
            roughness: 0.9,
            metalness: 0.05
        }
    };
    
    // =========================================
    // MOON CONFIGURATION
    // =========================================
    const MOONS = {
        moon1: {
            name: 'Luna',
            parentPlanet: 'planet1',
            mass: 7.342e22,          // kg
            radius: 1.737e6,         // meters
            color: 0xAAAAAA,
            
            // Orbital parameters (relative to parent planet)
            orbitalRadius: 3.844e8,      // meters
            orbitalInclination: 5.145,   // degrees
            orbitalEccentricity: 0,      // circular for stability
            
            // Rotation (tidally locked)
            rotationPeriod: 27.3 * 24 * 3600,  // seconds
            tidallyLocked: true,
            
            // Surface properties
            surfaceGravity: 1.62,
            density: 3344,
            
            // Visuals
            roughness: 0.95,
            metalness: 0.0
        }
    };
    
    // =========================================
    // INTERACTIVE OBJECTS
    // =========================================
    const OBJECTS = {
        spawnDistance: 10,      // meters from player
        spawnHeight: 2,         // meters above ground
        
        types: [
            {
                name: 'Metal Cube',
                shape: 'box',
                size: { x: 0.5, y: 0.5, z: 0.5 },
                mass: 50,
                color: 0x888888,
                metalness: 0.9,
                roughness: 0.2,
                luminous: false
            },
            {
                name: 'Glowing Orb',
                shape: 'sphere',
                size: { radius: 0.3 },
                mass: 10,
                color: 0x00FFAA,
                metalness: 0.1,
                roughness: 0.3,
                luminous: true,
                emissiveColor: 0x00FFAA,
                emissiveIntensity: 2.0,
                lightRadius: 20,
                lightIntensity: 1.0
            },
            {
                name: 'Stone Sphere',
                shape: 'sphere',
                size: { radius: 0.4 },
                mass: 100,
                color: 0x666655,
                metalness: 0.0,
                roughness: 0.95,
                luminous: false
            },
            {
                name: 'Energy Crystal',
                shape: 'octahedron',
                size: { radius: 0.35 },
                mass: 15,
                color: 0xFF44AA,
                metalness: 0.3,
                roughness: 0.1,
                luminous: true,
                emissiveColor: 0xFF44AA,
                emissiveIntensity: 1.5,
                lightRadius: 15,
                lightIntensity: 0.8
            },
            {
                name: 'Wooden Crate',
                shape: 'box',
                size: { x: 0.6, y: 0.6, z: 0.6 },
                mass: 25,
                color: 0x8B4513,
                metalness: 0.0,
                roughness: 0.9,
                luminous: false
            }
        ]
    };
    
    // =========================================
    // PLAYER CONFIGURATION
    // =========================================
    const PLAYER = {
        // Physical properties
        height: 1.8,            // meters
        radius: 0.3,            // meters (collision)
        mass: 70,               // kg
        
        // Walking mode
        walkSpeed: 5,           // m/s
        runSpeed: 10,           // m/s
        jumpForce: 8,           // m/s initial velocity
        
        // Flight mode
        flySpeed: 20,           // m/s
        flySprintSpeed: 50,     // m/s
        flyAcceleration: 30,    // m/s²
        flyDamping: 0.95,       // velocity retention per frame
        
        // Camera
        eyeHeight: 1.6,         // meters from feet
        mouseSensitivity: 0.002,
        
        // Third person
        thirdPersonDistance: 5, // meters behind player
        thirdPersonHeight: 2,   // meters above player
        cameraSmoothness: 0.1,  // lerp factor
        
        // Interaction
        grabDistance: 5,        // meters
        holdDistance: 2,        // meters in front
        throwForce: 15          // m/s
    };
    
    // =========================================
    // RENDERING CONFIGURATION
    // =========================================
    const RENDERING = {
        // Quality presets
        fidelityLevel: 'medium',  // 'low', 'medium', 'ultra'
        
        // Shadow settings per fidelity
        shadows: {
            low: {
                enabled: true,
                mapSize: 512,
                cascades: 1
            },
            medium: {
                enabled: true,
                mapSize: 1024,
                cascades: 2
            },
            ultra: {
                enabled: true,
                mapSize: 2048,
                cascades: 3
            }
        },
        
        // Geometry detail per fidelity
        geometry: {
            low: {
                sphereSegments: 16,
                planetSegments: 32
            },
            medium: {
                sphereSegments: 32,
                planetSegments: 64
            },
            ultra: {
                sphereSegments: 64,
                planetSegments: 128
            }
        },
        
        // Post-processing
        postProcessing: {
            enabled: true,
            bloom: {
                enabled: true,
                strength: 0.5,
                radius: 0.4,
                threshold: 0.8
            },
            antialiasing: true
        },
        
        // LOD settings
        lod: {
            enabled: false,  // Off by default as requested
            distances: [100, 500, 2000]
        },
        
        // Skybox / Stars
        stars: {
            count: 5000,
            size: 1.0,
            opacity: 0.9,
            colorVariation: 0.3
        },
        
        // General
        maxFPS: 0,              // 0 = uncapped
        pixelRatio: 1.0,        // DPI scaling (1.0 = native)
        fogEnabled: false,
        backgroundColor: 0x000000
    };
    
    // =========================================
    // DEBUG CONFIGURATION
    // =========================================
    const DEBUG = {
        showOrbits: true,
        showVelocityVectors: false,
        showForceVectors: false,
        showCollisionBounds: false,
        showAxes: false,
        logPhysicsUpdates: false,
        pausePhysics: false
    };
    
    // =========================================
    // RUNTIME STATE (not saved)
    // =========================================
    let runtimeState = {
        isPaused: false,
        currentTime: 0,
        simulationTime: 0
    };
    
    // =========================================
    // CONFIG CHANGE LISTENERS
    // =========================================
    const changeListeners = [];
    
    function notifyChange(category, key, value) {
        changeListeners.forEach(fn => fn(category, key, value));
    }
    
    // =========================================
    // PUBLIC API
    // =========================================
    return {
        PHYSICS: PHYSICS,
        SCALE: SCALE,
        SUN: SUN,
        PLANETS: PLANETS,
        MOONS: MOONS,
        OBJECTS: OBJECTS,
        PLAYER: PLAYER,
        RENDERING: RENDERING,
        DEBUG: DEBUG,
        
        getState: function() {
            return { ...runtimeState };
        },
        
        setState: function(newState) {
            Object.assign(runtimeState, newState);
        },
        
        /**
         * Update a configuration value
         */
        set: function(category, key, value) {
            if (this[category] && this[category].hasOwnProperty(key)) {
                this[category][key] = value;
                notifyChange(category, key, value);
                Logger.debug('Config', `Updated ${category}.${key} = ${value}`);
                return true;
            }
            Logger.warn('Config', `Unknown config: ${category}.${key}`);
            return false;
        },
        
        /**
         * Get a configuration value
         */
        get: function(category, key) {
            if (this[category] && this[category].hasOwnProperty(key)) {
                return this[category][key];
            }
            return undefined;
        },
        
        /**
         * Add change listener
         */
        onChange: function(callback) {
            changeListeners.push(callback);
        },
        
        /**
         * Remove change listener
         */
        offChange: function(callback) {
            const idx = changeListeners.indexOf(callback);
            if (idx !== -1) changeListeners.splice(idx, 1);
        },
        
        /**
         * Export current configuration as JSON
         */
        export: function() {
            return JSON.stringify({
                PHYSICS: PHYSICS,
                SCALE: SCALE,
                SUN: SUN,
                PLANETS: PLANETS,
                MOONS: MOONS,
                PLAYER: PLAYER,
                RENDERING: RENDERING,
                DEBUG: DEBUG
            }, null, 2);
        },
        
        /**
         * Import configuration from JSON
         */
        import: function(json) {
            try {
                const data = JSON.parse(json);
                Object.keys(data).forEach(category => {
                    if (this[category]) {
                        Object.assign(this[category], data[category]);
                    }
                });
                Logger.info('Config', 'Configuration imported successfully');
                return true;
            } catch (e) {
                Logger.error('Config', 'Failed to import configuration', e);
                return false;
            }
        },
        
        /**
         * Calculate stable orbital velocity for a given orbital radius around the sun
         */
        calculateStableOrbitVelocity: function(orbitalRadius) {
            return MathUtils.calculateOrbitalVelocity(SUN.mass, orbitalRadius, PHYSICS.G);
        },
        
        /**
         * Get scaled position for rendering
         */
        scalePosition: function(realPosition) {
            return {
                x: realPosition.x / SCALE.distance,
                y: realPosition.y / SCALE.distance,
                z: realPosition.z / SCALE.distance
            };
        },
        
        /**
         * Get scaled size for rendering
         */
        scaleSize: function(realSize) {
            return realSize * SCALE.bodySize * SCALE.sizeExaggeration;
        }
    };
})();

Logger.info('Config', 'Configuration module loaded');
