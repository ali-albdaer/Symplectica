export const Config = {
    physics: {
        G: 1.0, // Gravitational constant
        dt: 1 / 60, // Fixed time step
        substeps: 4, // Physics substeps per frame for stability
        drag: 0.0, // Space has no drag
    },
    graphics: {
        fidelity: 'medium', // low, medium, ultra
        shadows: true,
        shadowMapSize: 2048,
        starsCount: 5000,
    },
    bodies: {
        sun: {
            name: "Sun",
            mass: 10000,
            radius: 20,
            color: 0xffff00,
            emissive: 0xffaa00,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            rotationSpeed: 0.001,
            type: 'star'
        },
        planet1: {
            name: "Terra",
            mass: 100,
            radius: 5,
            color: 0x2288ff,
            distance: 200, // From Sun
            rotationSpeed: 0.01,
            type: 'planet'
        },
        moon1: {
            name: "Luna",
            mass: 1,
            radius: 1,
            color: 0x888888,
            distance: 15, // From Planet 1
            rotationSpeed: 0.02,
            type: 'moon'
        },
        planet2: {
            name: "Marsy",
            mass: 80,
            radius: 4,
            color: 0xff4400,
            distance: 350, // From Sun
            rotationSpeed: 0.008,
            type: 'planet'
        }
    },
    player: {
        mass: 0.001, // Tiny mass compared to planets
        height: 1.8,
        speed: 10,
        jumpForce: 5,
        flySpeed: 20,
        mouseSensitivity: 0.002,
        spawnPlanet: 'planet1'
    },
    debug: {
        showTelemetry: false,
        showPhysicsDebug: false
    }
};

// Helper to calculate orbital velocity for circular orbit
export function calculateOrbitalVelocity(centralBody, distance) {
    const v = Math.sqrt((Config.physics.G * centralBody.mass) / distance);
    return v;
}
