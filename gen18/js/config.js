/**
 * Configuration File
 * Centralized storage for all physical constants, entity parameters, and simulation settings
 */
const Config = {
    // Physics Engine Settings
    physics: {
        gravity: -9.81, // m/s^2 (local planet surface)
        universalG: 6.67430e-11, // Gravitational constant (m^3 kg^-1 s^-2)
        damping: 0.99,
        angularDamping: 0.99,
        substeps: 4,
        timeScale: 1.0 // Simulation speed multiplier
    },

    // Render Settings
    render: {
        fidelity: 'medium', // 'low', 'medium', 'ultra'
        shadowMapSize: 2048,
        enableLOD: false, // Disabled by default
        enableFrustumCulling: false, // Disabled by default
        ambientLight: 0.0, // No global illumination by default
        shadowCascades: 1
    },

    // Player Settings
    player: {
        height: 1.7, // meters
        radius: 0.3, // meters
        mass: 80, // kg
        walkSpeed: 6, // m/s
        jumpForce: 7, // m/s
        moveAccel: 30, // m/s^2
        freeFlySpeed: 25, // m/s
        freeFlyAccel: 50, // m/s^2
        groundDrag: 0.2,
        airDrag: 0.05,
        eyeHeight: 1.6, // relative to body
        cameraSmoothing: 0.1 // Lerp factor for camera
    },

    // Camera Settings
    camera: {
        fov: 75,
        near: 0.01,
        far: 1000000, // 1 million km
        firstPerson: {
            offset: new THREE.Vector3(0, 0, 0)
        },
        thirdPerson: {
            distance: 5,
            height: 2,
            lookAhead: 1.5,
            smoothing: 0.08
        }
    },

    // Celestial Bodies
    celestialBodies: [
        {
            name: 'Sun',
            type: 'star',
            mass: 1.989e30, // kg
            radius: 696340, // km (converted to scene units)
            sceneRadius: 20, // visual radius in scene
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            rotationSpeed: 0.004, // rad/frame
            luminosity: 3.828e26, // watts
            density: 1408.33, // kg/m^3
            color: 0xFDB813,
            emissive: 0xFDB813,
            emissiveIntensity: 2.0,
            castShadow: true,
            receiveShadow: false,
            isLightSource: true
        },
        {
            name: 'Earth',
            type: 'planet',
            mass: 5.972e24, // kg
            radius: 6371, // km
            sceneRadius: 6.371, // visual radius in scene
            position: { x: 149600, y: 0, z: 0 }, // ~1 AU in km
            velocity: { x: 0, y: 0, z: -29.78 }, // orbital velocity in km/s
            rotation: { x: 0, y: 0, z: 0 },
            rotationSpeed: 0.00007, // rad/frame
            luminosity: 0,
            density: 5514, // kg/m^3
            color: 0x4DA6FF,
            emissive: 0x000000,
            emissiveIntensity: 0,
            castShadow: true,
            receiveShadow: true,
            isLightSource: false
        },
        {
            name: 'Moon',
            type: 'satellite',
            mass: 7.342e22, // kg
            radius: 1737, // km
            sceneRadius: 1.737, // visual radius in scene
            position: { x: 149600 + 384400, y: 0, z: 0 }, // Earth + distance to Moon
            velocity: { x: 0, y: 0, z: -29.78 - 1.022 }, // Moon orbital velocity
            rotation: { x: 0, y: 0, z: 0 },
            rotationSpeed: 0.00002, // rad/frame
            luminosity: 0,
            density: 3340, // kg/m^3
            color: 0xB3B3B3,
            emissive: 0x000000,
            emissiveIntensity: 0,
            castShadow: true,
            receiveShadow: true,
            isLightSource: false
        },
        {
            name: 'Mars',
            type: 'planet',
            mass: 6.4171e23, // kg
            radius: 3389.5, // km
            sceneRadius: 3.39, // visual radius in scene
            position: { x: 227900, y: 50000, z: 30000 }, // ~1.5 AU
            velocity: { x: 5, y: 0, z: -24.07 }, // reduced orbital velocity
            rotation: { x: 0, y: 0, z: 0 },
            rotationSpeed: 0.00005,
            luminosity: 0,
            density: 3933, // kg/m^3
            color: 0xFF6B35,
            emissive: 0x000000,
            emissiveIntensity: 0,
            castShadow: true,
            receiveShadow: true,
            isLightSource: false
        }
    ],

    // Interactive Objects (spawned near player)
    interactiveObjects: [
        {
            name: 'Cube',
            type: 'box',
            mass: 10,
            size: { x: 1, y: 1, z: 1 },
            position: { x: 50, y: 5, z: 10 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0xFF0000,
            castShadow: true,
            receiveShadow: true
        },
        {
            name: 'Sphere',
            type: 'sphere',
            mass: 15,
            radius: 0.75,
            position: { x: 50, y: 5, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0x00FF00,
            castShadow: true,
            receiveShadow: true
        },
        {
            name: 'Cylinder',
            type: 'cylinder',
            mass: 12,
            radius: 0.5,
            height: 2,
            position: { x: 40, y: 5, z: 10 },
            velocity: { x: 0, y: 0, z: 0 },
            color: 0x0000FF,
            castShadow: true,
            receiveShadow: true
        }
    ],

    // Level of Detail Settings
    lod: {
        high: 100000, // km - within this distance, render full detail
        medium: 500000, // km
        low: 1000000 // km
    },

    // Audio Settings (future)
    audio: {
        masterVolume: 1.0,
        enabled: false
    },

    // Controls Settings
    controls: {
        pointerLock: true,
        invertY: false,
        sensitivity: 0.003,
        gamepadEnabled: true
    },

    // Dev Console Settings
    devConsole: {
        enabled: true,
        toggleKey: '/',
        telemetryToggleKey: 'Tab'
    },

    // Scale conversions (for visual representation)
    scales: {
        lengthScale: 0.001, // 1 km = 0.001 scene units (for visibility)
        velocityScale: 0.001, // km/s to scene units/frame
        massScale: 1 // kg (no scaling for physics)
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
