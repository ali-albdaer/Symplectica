export const Config = {
    physics: {
        G: 1.0, // Gravitational Constant
        dt: 1 / 60, // Fixed time step
        substeps: 4 // Physics substeps per frame for stability
    },
    rendering: {
        fidelity: 'high', // low, medium, high
        shadows: true,
        starsCount: 5000
    },
    bodies: [
        {
            name: "Sun",
            type: "star",
            mass: 10000,
            radius: 50,
            color: 0xffff00,
            emissive: 0xffaa00,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            lightIntensity: 2,
            fixed: true // Sun doesn't move in this simple model (or give it huge mass)
        },
        {
            name: "Planet 1",
            type: "planet",
            mass: 100,
            radius: 10,
            color: 0x00ff00,
            position: { x: 500, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 4.472135955 }, // sqrt(10000/500)
            texture: null
        },
        {
            name: "Moon 1",
            type: "moon",
            mass: 1,
            radius: 2,
            color: 0x888888,
            position: { x: 550, y: 0, z: 0 }, // 500 + 50
            velocity: { x: 0, y: 0, z: 5.886349517 }, // 4.472 + sqrt(100/50) = 4.472 + 1.414
            parent: "Planet 1" // For logical grouping if needed, but physics is N-body
        },
        {
            name: "Planet 2",
            type: "planet",
            mass: 200,
            radius: 15,
            color: 0x0000ff,
            position: { x: -800, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: -3.535533906 }, // -sqrt(10000/800)
            texture: null
        }
    ],
    player: {
        spawnBody: "Planet 1",
        height: 1.8,
        speed: 10,
        jumpForce: 15,
        mouseSensitivity: 0.002
    }
};
