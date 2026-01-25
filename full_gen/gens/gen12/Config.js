/**
 * Config.js - Centralized Configuration for Solar System Simulation
 * All physical constants, visual settings, and gameplay parameters
 */

export const Config = {
    // ============================================
    // PHYSICS CONSTANTS
    // ============================================
    physics: {
        G: 6.674e-11,           // Gravitational constant (real)
        G_SCALED: 100,          // Scaled G for simulation stability
        TIME_SCALE: 1.0,        // Simulation time multiplier
        FIXED_TIMESTEP: 1/60,   // Physics update rate
        MAX_SUBSTEPS: 3,        // Maximum physics substeps per frame
        VELOCITY_DAMPING: 0.999 // Slight damping for stability
    },

    // ============================================
    // CELESTIAL BODIES - Mathematically balanced for stable orbits
    // ============================================
    celestialBodies: {
        sun: {
            name: "Sun",
            type: "star",
            mass: 1.989e10,         // Scaled mass for simulation
            radius: 50,             // Visual radius
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0.001, z: 0 },
            color: 0xFFDD44,
            emissive: 0xFFAA00,
            emissiveIntensity: 2.0,
            luminosity: 1.0,
            density: 1.41,
            isStatic: true,         // Sun doesn't move
            lightIntensity: 2.0,
            lightRange: 10000
        },
        
        planet1: {
            name: "Terra",
            type: "planet",
            mass: 5.972e6,          // Scaled Earth-like mass
            radius: 15,             // Visual radius
            position: { x: 400, y: 0, z: 0 },
            // Orbital velocity calculated for stable orbit: v = sqrt(G*M/r)
            velocity: { x: 0, y: 0, z: 50 },
            rotation: { x: 0, y: 0.005, z: 0.1 },
            color: 0x4488FF,
            emissive: 0x000000,
            emissiveIntensity: 0,
            luminosity: 0,
            density: 5.51,
            isStatic: false,
            hasAtmosphere: true,
            atmosphereColor: 0x88AAFF,
            atmosphereScale: 1.15
        },
        
        planet2: {
            name: "Crimson",
            type: "planet",
            mass: 3.285e6,          // Mars-like mass
            radius: 10,
            position: { x: -700, y: 50, z: 100 },
            velocity: { x: 5, y: 0, z: -38 },
            rotation: { x: 0.05, y: 0.004, z: 0 },
            color: 0xCC4422,
            emissive: 0x000000,
            emissiveIntensity: 0,
            luminosity: 0,
            density: 3.93,
            isStatic: false,
            hasAtmosphere: false
        },
        
        moon1: {
            name: "Luna",
            type: "moon",
            parentBody: "planet1",
            mass: 7.342e4,          // Scaled moon mass
            radius: 4,
            // Position relative to parent at spawn
            positionOffset: { x: 60, y: 0, z: 0 },
            // Orbital velocity around parent
            velocityOffset: { x: 0, y: 0, z: 15 },
            rotation: { x: 0, y: 0.002, z: 0 },
            color: 0xAAAAAA,
            emissive: 0x000000,
            emissiveIntensity: 0,
            luminosity: 0,
            density: 3.34,
            isStatic: false
        }
    },

    // ============================================
    // PLAYER SETTINGS
    // ============================================
    player: {
        height: 1.8,
        radius: 0.5,
        mass: 80,
        walkSpeed: 8,
        runSpeed: 16,
        jumpForce: 12,
        flySpeed: 50,
        flySprintMultiplier: 3,
        mouseSensitivity: 0.002,
        // Spawn position (on planet1 surface)
        spawnPlanet: "planet1",
        spawnHeight: 20,        // Above surface
        gravityAlignSpeed: 5,   // How fast player aligns to gravity
        grabDistance: 5,
        grabForce: 50
    },

    // ============================================
    // CAMERA SETTINGS
    // ============================================
    camera: {
        fov: 75,
        near: 0.1,
        far: 50000,
        thirdPersonDistance: 10,
        thirdPersonHeight: 3,
        lerpSpeed: 5,
        slerpSpeed: 5,
        cinematicLerpSpeed: 2
    },

    // ============================================
    // INTERACTIVE OBJECTS (Micro-Physics)
    // ============================================
    interactiveObjects: {
        spawnNearPlayer: true,
        objects: [
            { type: "crate", mass: 50, size: { x: 1, y: 1, z: 1 }, color: 0x8B4513 },
            { type: "sphere", mass: 20, radius: 0.5, color: 0xFF6600 },
            { type: "crate", mass: 30, size: { x: 0.5, y: 0.5, z: 0.5 }, color: 0x654321 },
            { type: "sphere", mass: 10, radius: 0.3, color: 0x00FF88 },
            { type: "crate", mass: 100, size: { x: 1.5, y: 1.5, z: 1.5 }, color: 0x4A4A4A }
        ],
        spawnRadius: 10,
        spawnHeightOffset: 3
    },

    // ============================================
    // RENDERING & FIDELITY
    // ============================================
    rendering: {
        fidelityLevel: "medium", // "low", "medium", "ultra"
        
        fidelitySettings: {
            low: {
                shadowMapSize: 512,
                shadowsEnabled: false,
                antialias: false,
                planetSegments: 16,
                atmosphereEnabled: false,
                lodDistances: [100, 300, 800],
                maxLights: 1,
                postProcessing: false
            },
            medium: {
                shadowMapSize: 1024,
                shadowsEnabled: true,
                antialias: true,
                planetSegments: 32,
                atmosphereEnabled: true,
                lodDistances: [200, 600, 1500],
                maxLights: 4,
                postProcessing: false
            },
            ultra: {
                shadowMapSize: 4096,
                shadowsEnabled: true,
                antialias: true,
                planetSegments: 64,
                atmosphereEnabled: true,
                lodDistances: [500, 1500, 4000],
                maxLights: 8,
                postProcessing: true
            }
        }
    },

    // ============================================
    // UI SETTINGS
    // ============================================
    ui: {
        showTelemetry: true,
        showDebugConsole: false,
        telemetryUpdateRate: 100,   // ms
        consoleMaxLines: 50,
        crosshairSize: 20,
        crosshairColor: "#FFFFFF",
        crosshairOpacity: 0.7
    },

    // ============================================
    // CONTROLS MAPPING
    // ============================================
    controls: {
        forward: "KeyW",
        backward: "KeyS",
        left: "KeyA",
        right: "KeyD",
        jump: "Space",
        descend: "ShiftLeft",
        sprint: "ShiftLeft",
        toggleFlight: "KeyF",
        toggleCamera: "KeyC",
        toggleTelemetry: "KeyT",
        toggleConsole: "Slash",
        grab: 2,                // Right mouse button
        interact: "KeyE"
    },

    // ============================================
    // DEBUG & DEVELOPMENT
    // ============================================
    debug: {
        showOrbits: false,
        showVelocityVectors: false,
        showGravityVectors: false,
        showColliders: false,
        logPhysics: false,
        pausePhysics: false
    }
};

// Make Config globally accessible for live editing
if (typeof window !== 'undefined') {
    window.GameConfig = Config;
}

export default Config;
