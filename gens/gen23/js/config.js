/**
 * Global Configuration and State
 * Accessible via window.Config
 */

const Config = {
    physics: {
        G: 0.5, // Gravitational Constant
        dt: 1 / 60, // Fixed time step for physics
        substeps: 4, // Physics substeps per frame for stability
        softening: 0.5, // To prevent singularities when objects get too close
    },
    graphics: {
        fidelity: 'high', // low, medium, high
        shadowMapSize: 2048,
        fov: 75,
        far: 50000,
        near: 0.1,
    },
    debug: {
        showPhysics: false,
        showOrbits: true,
    },
    initialState: {
        sun: {
            name: "Sun",
            mass: 100000,
            radius: 60,
            color: 0xffaa00,
            emissive: 0xffaa00,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            isStar: true
        },
        bodies: [
            {
                name: "Planet 1",
                mass: 500,
                radius: 15,
                color: 0x4488ff,
                distance: 600, // Distance from Sun
                // Velocity will be calculated automatically for circular orbit if not provided
                type: "planet",
                texture: "planet1"
            },
            {
                name: "Planet 2",
                mass: 1200,
                radius: 25,
                color: 0xff4444,
                distance: 1100,
                type: "planet",
                texture: "planet2"
            }
        ],
        moons: [
            {
                name: "Moon 1",
                parent: "Planet 1",
                mass: 10,
                radius: 4,
                color: 0x888888,
                distance: 50, // Distance from Parent
                type: "moon"
            }
        ]
    }
};

// Expose to window for easy access
window.Config = Config;
