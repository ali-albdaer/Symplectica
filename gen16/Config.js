/**
 * Config.js - Centralized Configuration & Constants
 * All game constants and physics parameters stored here
 */

const Config = {
    // ===== RENDER SETTINGS =====
    RENDER: {
        FOV: 75,
        NEAR_PLANE: 0.1,
        FAR_PLANE: 500000,
        FIDELITY: 'MEDIUM', // 'LOW', 'MEDIUM', 'ULTRA'
        SHADOW_MAP_SIZE: 2048,
        ENABLE_FRUSTUM_CULLING: false,
        ENABLE_LOD: false,
        BACKGROUND_COLOR: 0x000000,
        BLOOM_THRESHOLD: 0.8,
        BLOOM_STRENGTH: 1.2,
    },

    // ===== PHYSICS SETTINGS =====
    PHYSICS: {
        GRAVITY_CONSTANT: 6.674e-11, // m^3 kg^-1 s^-2
        TIME_SCALE: 1.0, // Speed multiplier for simulation
        SUBSTEPS: 3, // Physics substeps per frame
        INTEGRATOR_ACCURACY: 0.01, // Integration accuracy
    },

    // ===== ORBITAL MECHANICS =====
    ORBITAL: {
        // Scale factor: real distances are divided by this for gameplay
        DISTANCE_SCALE: 1e9, // 1 billion km = 1 unit
        
        // Velocity scale (m/s in simulation)
        VELOCITY_SCALE: 1000,

        // Mass scale (kg in simulation)
        MASS_SCALE: 1e24, // Septillion kg = 1 unit
    },

    // ===== CELESTIAL BODIES =====
    BODIES: {
        SUN: {
            name: 'Sun',
            radius: 696000 / 1e9, // km to units
            mass: 1.989e30 / 1e24, // kg to units
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0xFDB813,
            emissive: 0xFFA500,
            emissiveIntensity: 1.0,
            segments: 64,
            castShadow: false,
            receiveShadow: false,
        },

        PLANET_1: {
            name: 'Earth',
            radius: 6371 / 1e9,
            mass: 5.972e24 / 1e24,
            position: { x: 149.6, y: 0, z: 0 }, // 149.6 million km
            velocity: { x: 0, y: 0, z: 29.78 }, // m/s ≈ 29.78 km/s orbital speed
            color: 0x4169E1,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            segments: 32,
            castShadow: true,
            receiveShadow: true,
            rotationSpeed: 0.00416, // rad/frame for day-night cycle
        },

        PLANET_2: {
            name: 'Mars',
            radius: 3389.5 / 1e9,
            mass: 6.4171e23 / 1e24,
            position: { x: 0, y: 227.9, z: 0 }, // 227.9 million km
            velocity: { x: -24.07, y: 0, z: 0 }, // m/s ≈ 24.07 km/s orbital speed
            color: 0xFF6347,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            segments: 24,
            castShadow: true,
            receiveShadow: true,
            rotationSpeed: 0.00240,
        },

        MOON_1: {
            name: 'Moon',
            radius: 1737.4 / 1e9,
            mass: 7.342e22 / 1e24,
            position: { x: 149.6 + 0.3844, y: 0, z: 0 }, // ~384,400 km from Earth
            velocity: { x: 0, y: 0, z: 29.78 + 1.022 }, // Orbital velocity around Earth
            color: 0xC0C0C0,
            emissive: 0x000000,
            emissiveIntensity: 0.0,
            segments: 16,
            castShadow: true,
            receiveShadow: true,
            rotationSpeed: 0.0,
            parentBody: 'PLANET_1', // Moon orbits Earth
        },
    },

    // ===== PLAYER SETTINGS =====
    PLAYER: {
        SPAWN_POSITION: { x: 150, y: 50, z: 10 },
        SPAWN_ROTATION: { x: 0, y: 0, z: 0 },
        
        // Walking physics
        WALK_SPEED: 50, // units/s
        WALK_ACCELERATION: 200, // units/s^2
        WALK_DECELERATION: 150, // units/s^2
        JUMP_FORCE: 120, // units/s
        GROUND_DRAG: 0.1,
        AIR_DRAG: 0.02,
        
        // Flight physics (6-DOF)
        FLIGHT_SPEED: 200, // units/s
        FLIGHT_ACCELERATION: 500, // units/s^2
        FLIGHT_DECELERATION: 300, // units/s^2
        FLIGHT_DRAG: 0.05,
        
        // Camera
        MOUSE_SENSITIVITY: 0.005,
        CAMERA_HEIGHT: 1.7, // meters above ground
        CAMERA_LERP_SPEED: 0.1, // Smooth transition speed
        
        // Third-person distance
        THIRD_PERSON_DISTANCE: 10,
        THIRD_PERSON_HEIGHT: 5,
    },

    // ===== INTERACTION SETTINGS =====
    INTERACTION: {
        GRAB_DISTANCE: 50,
        GRAB_FORCE: 5000,
        GRAB_DAMPING: 0.5,
    },

    // ===== INTERACTIVE OBJECTS (near spawn) =====
    OBJECTS: [
        {
            name: 'MetalSphere',
            type: 'sphere',
            radius: 1,
            mass: 100,
            position: { x: 150, y: 2, z: 20 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0x888888,
            castShadow: true,
            receiveShadow: true,
        },
        {
            name: 'IceBlock',
            type: 'box',
            dimensions: { x: 2, y: 2, z: 2 },
            mass: 200,
            position: { x: 160, y: 5, z: 15 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0x87CEEB,
            castShadow: true,
            receiveShadow: true,
        },
        {
            name: 'RockBlock',
            type: 'box',
            dimensions: { x: 3, y: 1, z: 1.5 },
            mass: 500,
            position: { x: 140, y: 3, z: 25 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0x8B7355,
            castShadow: true,
            receiveShadow: true,
        },
    ],

    // ===== FIDELITY PRESETS =====
    FIDELITY_PRESETS: {
        LOW: {
            SHADOW_MAP_SIZE: 512,
            ENABLE_FRUSTUM_CULLING: true,
            ENABLE_LOD: true,
        },
        MEDIUM: {
            SHADOW_MAP_SIZE: 2048,
            ENABLE_FRUSTUM_CULLING: false,
            ENABLE_LOD: false,
        },
        ULTRA: {
            SHADOW_MAP_SIZE: 4096,
            ENABLE_FRUSTUM_CULLING: true,
            ENABLE_LOD: true,
        },
    },

    // ===== DEBUG SETTINGS =====
    DEBUG: {
        ENABLE_AXES_HELPER: false,
        ENABLE_GRID_HELPER: false,
        ENABLE_WIREFRAME: false,
        ENABLE_PHYSICS_DEBUG: false,
        SHOW_TELEMETRY: true,
        SHOW_ENTITY_BOUNDS: false,
    },

    /**
     * Apply a fidelity preset
     */
    applyFidelityPreset(preset) {
        if (!this.FIDELITY_PRESETS[preset]) {
            console.warn(`Unknown fidelity preset: ${preset}`);
            return;
        }
        Object.assign(this.RENDER, this.FIDELITY_PRESETS[preset]);
        this.RENDER.FIDELITY = preset;
    },

    /**
     * Get all entities (celestial bodies + interactive objects)
     */
    getAllEntities() {
        const bodies = Object.values(this.BODIES);
        return [...bodies, ...this.OBJECTS];
    },

    /**
     * Validate orbital stability
     */
    validateOrbits() {
        const G = this.PHYSICS.GRAVITY_CONSTANT;
        const sun = this.BODIES.SUN;
        const validations = {};

        for (const key of Object.keys(this.BODIES)) {
            if (key === 'SUN') continue;
            
            const body = this.BODIES[key];
            const dx = body.position.x - sun.position.x;
            const dy = body.position.y - sun.position.y;
            const dz = body.position.z - sun.position.z;
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            // Theoretical orbital velocity: v = sqrt(GM/r)
            const theoreticalV = Math.sqrt((G * sun.mass) / distance);
            const actualV = Math.sqrt(body.velocity.x**2 + body.velocity.y**2 + body.velocity.z**2);
            const error = Math.abs(theoreticalV - actualV) / theoreticalV * 100;
            
            validations[body.name] = {
                distance,
                theoreticalV,
                actualV,
                errorPercent: error,
                isStable: error < 5, // Less than 5% error
            };
        }

        return validations;
    },
};

// Freeze critical constants
Object.freeze(Config.PHYSICS);
Object.freeze(Config.ORBITAL);
