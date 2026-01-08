/**
 * Config.js - Centralized Configuration Module
 * 
 * All physical constants, simulation parameters, and settings are stored here.
 * This module is designed to be modified in real-time via the developer console.
 */

const Config = {
    // ==========================================
    // Physics Constants
    // ==========================================
    physics: {
        // Gravitational constant (scaled for simulation)
        // Real G = 6.674e-11 m³/(kg·s²), we use scaled version
        G: 6.674,
        
        // Time scale multiplier (1 = real-time, higher = faster)
        timeScale: 1.0,
        
        // Physics substeps per frame for accuracy
        substeps: 4,
        
        // Minimum distance for gravity calculation (prevents singularities)
        minDistance: 0.1,
        
        // Maximum velocity cap (prevents numerical instability)
        maxVelocity: 1000,
        
        // Integration method: 'euler', 'verlet', 'rk4'
        integrationMethod: 'verlet',
        
        // Enable N-body interactions (all bodies affect each other)
        nBodyEnabled: true,
        
        // Collision detection
        collisionEnabled: true,
        collisionElasticity: 0.5
    },
    
    // ==========================================
    // Celestial Bodies Configuration
    // ==========================================
    celestialBodies: {
        sun: {
            name: 'Sun',
            type: 'star',
            mass: 1000000,          // Scaled mass units
            radius: 50,              // Visual radius
            density: 1.41,           // g/cm³
            color: 0xffdd44,
            emissive: 0xffaa00,
            emissiveIntensity: 1.5,
            luminosity: 1.0,         // Relative luminosity
            rotationSpeed: 0.001,    // Radians per second
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            textureUrl: null,
            isLightSource: true
        },
        
        planet1: {
            name: 'Terra',
            type: 'planet',
            mass: 1000,
            radius: 12,
            density: 5.51,
            color: 0x4488ff,
            emissive: 0x000000,
            emissiveIntensity: 0,
            rotationSpeed: 0.02,
            // Orbital parameters calculated for stable orbit
            // v = sqrt(G * M / r) for circular orbit
            // At distance 400, v = sqrt(6.674 * 1000000 / 400) ≈ 129.2
            orbitalDistance: 400,
            position: { x: 400, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 129.2 },
            textureUrl: null,
            hasAtmosphere: true,
            atmosphereColor: 0x88aaff,
            atmosphereScale: 1.15
        },
        
        planet2: {
            name: 'Pyrrus',
            type: 'planet',
            mass: 800,
            radius: 10,
            density: 3.93,
            color: 0xff6644,
            emissive: 0x331100,
            emissiveIntensity: 0.1,
            rotationSpeed: 0.015,
            // At distance 700, v = sqrt(6.674 * 1000000 / 700) ≈ 97.7
            orbitalDistance: 700,
            position: { x: 700, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 97.7 },
            textureUrl: null,
            hasAtmosphere: true,
            atmosphereColor: 0xff8866,
            atmosphereScale: 1.1
        },
        
        moon1: {
            name: 'Luna',
            type: 'moon',
            mass: 50,
            radius: 4,
            density: 3.34,
            color: 0xaaaaaa,
            emissive: 0x000000,
            emissiveIntensity: 0,
            rotationSpeed: 0.01,
            // Moon orbits Planet1
            // Distance from planet: 60 (relative to planet)
            // Moon needs velocity perpendicular to its position relative to planet
            // Planet is at (400, 0, 0) with velocity (0, 0, 129.2)
            // Moon at (400, 0, 60) - offset in Z from planet
            // Moon orbital v around planet = sqrt(G * M_planet / r) = sqrt(6.674 * 1000 / 60) ≈ 10.55
            // Moon velocity = planet velocity + orbital velocity perpendicular to planet-moon line
            // Since moon is offset in +Z, orbital velocity is in +X direction
            parentBody: 'planet1',
            orbitalDistance: 60,
            position: { x: 400, y: 0, z: 60 },
            velocity: { x: 10.55, y: 0, z: 129.2 }, // Planet velocity (Z) + orbital velocity (X)
            textureUrl: null
        }
    },
    
    // ==========================================
    // Player Configuration
    // ==========================================
    player: {
        // Initial spawn position (near planet1)
        spawnPosition: { x: 420, y: 20, z: 0 },
        
        // Initial velocity - must match planet1's orbital velocity to stay in orbit!
        // This is calculated as sqrt(G * M_sun / r) at the spawn distance
        // At x=420, v = sqrt(6.674 * 1000000 / 420) ≈ 126.1, but we use planet1's velocity for co-orbit
        spawnVelocity: { x: 0, y: 0, z: 129.2 },
        
        // Walking mode
        walkSpeed: 30,
        runSpeed: 60,
        jumpForce: 15,
        
        // Flight mode
        flightSpeed: 100,
        flightSprintMultiplier: 3,
        
        // Physics
        mass: 1,
        height: 2,
        radius: 0.5,
        
        // Camera
        mouseSensitivity: 0.002,
        fov: 75,
        nearClip: 0.1,
        farClip: 100000,
        
        // Third person
        thirdPersonDistance: 10,
        thirdPersonHeight: 3,
        
        // Interaction
        grabDistance: 20,
        grabHoldDistance: 5,
        grabForce: 50
    },
    
    // ==========================================
    // Graphics Settings
    // ==========================================
    graphics: {
        // Quality presets
        currentQuality: 'medium',
        
        presets: {
            low: {
                shadowMapSize: 512,
                shadowsEnabled: false,
                antialias: false,
                starCount: 2000,
                atmosphereEnabled: false,
                bloomEnabled: false,
                lodEnabled: true,
                lodDistance: 500,
                pixelRatio: 0.75
            },
            medium: {
                shadowMapSize: 1024,
                shadowsEnabled: true,
                antialias: true,
                starCount: 5000,
                atmosphereEnabled: true,
                bloomEnabled: false,
                lodEnabled: true,
                lodDistance: 1000,
                pixelRatio: 1.0
            },
            ultra: {
                shadowMapSize: 4096,
                shadowsEnabled: true,
                antialias: true,
                starCount: 15000,
                atmosphereEnabled: true,
                bloomEnabled: true,
                lodEnabled: false,
                lodDistance: 2000,
                pixelRatio: window.devicePixelRatio || 1
            }
        },
        
        // LOD settings (off by default as specified)
        lodEnabled: false,
        
        // Lighting
        sunLightIntensity: 2.0,
        ambientLightIntensity: 0.0, // No ambient as specified
        
        // Shadows
        shadowBias: -0.0001,
        shadowNormalBias: 0.02
    },
    
    // ==========================================
    // Interactive Objects Configuration
    // ==========================================
    interactiveObjects: {
        // Number of objects to spawn near player
        spawnCount: 8,
        
        // Spawn radius around player
        spawnRadius: 50,
        
        // Object properties
        minMass: 0.1,
        maxMass: 5,
        minRadius: 0.3,
        maxRadius: 1.5,
        
        // How many should be luminous
        luminousCount: 3,
        luminousIntensity: 2,
        
        // Physics
        dragCoefficient: 0.98,
        
        // Colors for variety
        colors: [
            0xff4444, 0x44ff44, 0x4444ff,
            0xffff44, 0xff44ff, 0x44ffff,
            0xff8800, 0x8800ff
        ]
    },
    
    // ==========================================
    // UI Configuration
    // ==========================================
    ui: {
        // Telemetry update rate (ms)
        telemetryUpdateRate: 100,
        
        // Debug log max messages
        debugLogMaxMessages: 50,
        
        // Show controls help by default
        showControlsHelp: true,
        
        // Show telemetry by default
        showTelemetry: false
    },
    
    // ==========================================
    // Debug Configuration
    // ==========================================
    debug: {
        // Show debug log
        showDebugLog: true,
        
        // Log physics calculations
        logPhysics: false,
        
        // Show orbit paths
        showOrbits: false,
        
        // Show velocity vectors
        showVelocities: false,
        
        // Performance monitoring
        showPerformance: true
    }
};

// Helper function to get current quality settings
Config.getQualitySettings = function() {
    return this.graphics.presets[this.graphics.currentQuality];
};

// Helper function to calculate orbital velocity for stable orbit
Config.calculateOrbitalVelocity = function(centralMass, distance) {
    return Math.sqrt(this.physics.G * centralMass / distance);
};

// Deep clone helper for resetting
Config._defaults = JSON.parse(JSON.stringify(Config));

Config.reset = function() {
    const defaults = Config._defaults;
    Object.keys(defaults).forEach(key => {
        if (typeof defaults[key] === 'object' && key !== '_defaults') {
            Config[key] = JSON.parse(JSON.stringify(defaults[key]));
        }
    });
};

// Make Config globally accessible and freeze structure (not values)
Object.seal(Config);

export default Config;
