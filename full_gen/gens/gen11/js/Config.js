/**
 * Config.js - Centralized Configuration for Solar System Simulation
 * 
 * All physical constants, celestial body parameters, and game settings
 * are stored here for easy modification and expandability.
 */

export const Config = {
    // ═══════════════════════════════════════════════════════════════
    // PHYSICS CONSTANTS
    // ═══════════════════════════════════════════════════════════════
    physics: {
        // Gravitational constant (scaled for game simulation)
        G: 6.674,
        
        // Time scale multiplier (1.0 = real-time, higher = faster)
        timeScale: 1.0,
        
        // Physics update substeps for stability
        substeps: 3,
        
        // Physics world damping
        linearDamping: 0.01,
        angularDamping: 0.01,
        
        // Fixed timestep for physics calculations
        fixedTimeStep: 1 / 60,
    },

    // ═══════════════════════════════════════════════════════════════
    // CELESTIAL BODIES
    // ═══════════════════════════════════════════════════════════════
    celestialBodies: {
        // THE SUN (Central Star)
        sun: {
            name: 'Sun',
            type: 'star',
            mass: 1000000,              // Arbitrary units
            radius: 50,                 // Visual radius
            position: [0, 0, 0],        // Center of the system
            velocity: [0, 0, 0],        // Stationary
            rotationSpeed: 0.001,       // Self-rotation
            color: 0xFFDD44,
            emissive: 0xFFAA00,
            emissiveIntensity: 1.0,
            luminosity: 2000,           // Light intensity
            castShadow: false,
            receiveShadow: false,
        },

        // PLANET 1 (Inner Planet - Rocky)
        planet1: {
            name: 'Mercurius',
            type: 'planet',
            mass: 800,                  // Smaller mass
            radius: 8,                  // Visual radius
            position: [200, 0, 0],      // Distance from sun
            velocity: [0, 0, -28.5],    // Orbital velocity (tangential)
            rotationSpeed: 0.005,
            color: 0x8B7355,            // Rocky brown
            emissive: 0x000000,
            emissiveIntensity: 0,
            density: 5.4,
            castShadow: true,
            receiveShadow: true,
            
            // Atmosphere properties (for future expansion)
            atmosphere: {
                enabled: false,
            }
        },

        // PLANET 2 (Outer Planet - Gas Giant)
        planet2: {
            name: 'Jovian',
            type: 'planet',
            mass: 2500,                 // Larger mass
            radius: 20,                 // Visual radius
            position: [450, 0, 0],      // Distance from sun
            velocity: [0, 0, -18.5],    // Orbital velocity (tangential)
            rotationSpeed: 0.008,
            color: 0x4169E1,            // Blue gas giant
            emissive: 0x000000,
            emissiveIntensity: 0,
            density: 1.3,
            castShadow: true,
            receiveShadow: true,
            
            atmosphere: {
                enabled: true,
                color: 0x8BA3FF,
                opacity: 0.3,
            }
        },

        // MOON (Orbits Planet 2)
        moon1: {
            name: 'Luna Prima',
            type: 'moon',
            mass: 150,
            radius: 5,
            position: [450, 0, 60],     // Offset from Planet 2
            velocity: [10.5, 0, -18.5], // Planet's velocity + orbital velocity
            rotationSpeed: 0.003,
            color: 0xAAAAAA,            // Gray rocky
            emissive: 0x000000,
            emissiveIntensity: 0,
            density: 3.3,
            castShadow: true,
            receiveShadow: true,
            
            // Reference to parent body
            parentBody: 'planet2',
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // INTERACTIVE OBJECTS (Micro-physics near spawn)
    // ═══════════════════════════════════════════════════════════════
    interactiveObjects: [
        {
            name: 'Boulder_1',
            type: 'sphere',
            mass: 5,
            radius: 1.5,
            position: [205, 5, 5],      // Near Planet 1
            velocity: [0, 0, -28.5],    // Match planet's orbit
            color: 0x666666,
            interactable: true,
        },
        {
            name: 'Boulder_2',
            type: 'sphere',
            mass: 3,
            radius: 1.0,
            position: [203, 3, -3],
            velocity: [0, 0, -28.5],
            color: 0x996633,
            interactable: true,
        },
        {
            name: 'Cube_1',
            type: 'box',
            mass: 4,
            dimensions: [2, 2, 2],
            position: [207, 4, 0],
            velocity: [0, 0, -28.5],
            color: 0x994444,
            interactable: true,
        },
        {
            name: 'Crystal_1',
            type: 'octahedron',
            mass: 2,
            radius: 1.2,
            position: [200, 8, 8],
            velocity: [0, 0, -28.5],
            color: 0x00FFFF,
            interactable: true,
        },
    ],

    // ═══════════════════════════════════════════════════════════════
    // PLAYER CONFIGURATION
    // ═══════════════════════════════════════════════════════════════
    player: {
        // Spawn location (on surface of Planet 1)
        spawnPosition: [200, 15, 0],
        spawnVelocity: [0, 0, -28.5],   // Match planet's orbit
        
        // Physical properties
        mass: 1,
        radius: 1,
        height: 2,
        
        // Movement parameters
        walkSpeed: 5.0,
        sprintMultiplier: 1.5,
        flightSpeed: 20.0,
        jumpForce: 8.0,
        
        // Camera settings
        cameraOffset: [0, 1.6, 0],      // Eye level (First Person)
        thirdPersonDistance: 10,
        cameraLerpSpeed: 0.1,
        
        // Interaction
        grabDistance: 5,
        grabForce: 10,
    },

    // ═══════════════════════════════════════════════════════════════
    // RENDERING SETTINGS
    // ═══════════════════════════════════════════════════════════════
    rendering: {
        // Fidelity levels
        fidelity: {
            low: {
                shadowMapSize: 512,
                antialias: false,
                particleCount: 1000,
                maxLights: 1,
                enablePostProcessing: false,
            },
            medium: {
                shadowMapSize: 1024,
                antialias: true,
                particleCount: 5000,
                maxLights: 1,
                enablePostProcessing: false,
            },
            ultra: {
                shadowMapSize: 2048,
                antialias: true,
                particleCount: 10000,
                maxLights: 1,
                enablePostProcessing: true,
            },
        },
        
        // Current fidelity setting
        currentFidelity: 'medium',
        
        // Shadow settings
        enableShadows: true,
        shadowBias: -0.0001,
        shadowNormalBias: 0.02,
        
        // Camera
        fov: 75,
        near: 0.1,
        far: 100000,
        
        // Background
        backgroundColor: 0x000000,
        
        // Star field
        starField: {
            enabled: true,
            count: 5000,
            size: 0.5,
            spread: 50000,
        },
        
        // LOD (Level of Detail) distances
        lod: {
            high: 500,
            medium: 2000,
            low: 5000,
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTROL SETTINGS
    // ═══════════════════════════════════════════════════════════════
    controls: {
        mouseSensitivity: 0.5,
        invertY: false,
        
        // Key bindings
        keys: {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            jump: 'Space',
            sprint: 'ShiftLeft',
            toggleFlight: 'KeyF',
            interact: 'MouseRight',
            toggleCamera: 'KeyC',
            toggleTelemetry: 'KeyT',
            toggleDebugLog: 'KeyL',
            toggleDevConsole: 'Slash',
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // UI SETTINGS
    // ═══════════════════════════════════════════════════════════════
    ui: {
        showTelemetry: false,
        showDebugLog: false,
        showControls: true,
        
        telemetryUpdateRate: 100,   // ms
        debugLogMaxLines: 50,
        
        colors: {
            success: '#0f0',
            warning: '#ff0',
            error: '#f00',
            info: '#0ff',
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // SPECIAL ENTITIES (For future expansion)
    // ═══════════════════════════════════════════════════════════════
    specialEntities: {
        // Example: Black Hole
        blackhole: {
            enabled: false,
            name: 'Singularity',
            mass: 5000000,
            schwarzschildRadius: 100,
            position: [-2000, 0, 0],
            eventHorizonShader: true,
        },
        
        // Example: Telescope entity
        telescope: {
            enabled: false,
            position: [300, 50, 0],
            volumetricShader: true,
            zoomLevels: [2, 5, 10, 20],
        },
        
        // Example: Wormhole
        wormhole: {
            enabled: false,
            entryPosition: [1000, 0, 0],
            exitPosition: [-1000, 0, -1000],
            radius: 20,
        },
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBUG SETTINGS
    // ═══════════════════════════════════════════════════════════════
    debug: {
        showPhysicsDebug: false,
        showFPS: true,
        showAxesHelper: false,
        showGridHelper: false,
        logPhysicsUpdates: false,
        logCollisions: false,
        
        // Performance monitoring
        enablePerformanceMonitoring: true,
        performanceWarningThreshold: 30, // FPS
    },
};

/**
 * Utility function to update config values at runtime
 * Used by the Developer Console
 */
export function updateConfig(path, value) {
    const keys = path.split('.');
    let current = Config;
    
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            console.error(`Config path not found: ${path}`);
            return false;
        }
        current = current[keys[i]];
    }
    
    const lastKey = keys[keys.length - 1];
    if (current.hasOwnProperty(lastKey)) {
        current[lastKey] = value;
        console.log(`Config updated: ${path} = ${value}`);
        return true;
    } else {
        console.error(`Config key not found: ${path}`);
        return false;
    }
}

/**
 * Get a nested config value
 */
export function getConfig(path) {
    const keys = path.split('.');
    let current = Config;
    
    for (const key of keys) {
        if (!current[key]) {
            console.error(`Config path not found: ${path}`);
            return undefined;
        }
        current = current[key];
    }
    
    return current;
}

export default Config;
