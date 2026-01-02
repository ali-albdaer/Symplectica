export const Config = {
    physics: {
        G: 6.67430e-11, // Gravitational Constant
        timeScale: 1.0, // Simulation speed multiplier
        physicsSubsteps: 5, // Physics steps per frame for stability
    },
    rendering: {
        fidelity: 'medium', // low, medium, ultra
        shadows: true,
        starsCount: 5000,
        logarithmicDepthBuffer: true,
    },
    player: {
        walkSpeed: 10,
        runSpeed: 20,
        jumpForce: 8,
        flightSpeed: 100,
        flightBoostMultiplier: 10,
        height: 1.8,
        mass: 70,
    },
    initialState: {
        bodies: [
            {
                name: "Sun",
                type: "star",
                mass: 1.989e30,
                radius: 696340000,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 },
                color: 0xffff00,
                emissive: 0xffaa00,
                emissiveIntensity: 1,
                lightIntensity: 2,
            },
            {
                name: "Planet 1",
                type: "planet",
                mass: 5.972e24, // Earth-like
                radius: 6371000,
                distanceFromSun: 149.6e9, // 1 AU
                color: 0x2233ff,
                roughness: 0.8,
                metalness: 0.1,
                hasAtmosphere: true,
            },
            {
                name: "Moon 1",
                type: "moon",
                parent: "Planet 1",
                mass: 7.348e22,
                radius: 1737000,
                distanceFromParent: 384400000, // Distance from Earth
                color: 0x888888,
            },
            {
                name: "Planet 2",
                type: "planet",
                mass: 1.898e27, // Jupiter-like
                radius: 69911000,
                distanceFromSun: 778.5e9, // 5.2 AU
                color: 0xffaa88,
            }
        ]
    }
};

// Helper to calculate orbital velocity for circular orbit
export function calculateOrbitalVelocity(centralMass, radius) {
    return Math.sqrt((Config.physics.G * centralMass) / radius);
}
