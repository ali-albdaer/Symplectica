export const Config = {
    physics: {
        G: 1.0, // Gravitational Constant
        substeps: 5, // Physics accuracy
        dt: 1 / 60
    },
    rendering: {
        fidelity: 'medium', // low, medium, ultra
        shadowMapSize: {
            low: 512,
            medium: 1024,
            ultra: 2048
        }
    },
    player: {
        speed: 10,
        jumpForce: 15,
        flySpeed: 20,
        height: 2,
        sensitivity: 0.002,
        reach: 10
    },
    world: {
        bodies: [
            {
                name: "Sun",
                type: "star",
                mass: 10000,
                radius: 20,
                color: 0xffff00,
                emissive: 0xffaa00,
                position: { x: 0, y: 0, z: 0 },
                velocity: { x: 0, y: 0, z: 0 }
            },
            {
                name: "Terra",
                type: "planet",
                mass: 200,
                radius: 5,
                color: 0x2233ff,
                distance: 200, // Distance from Sun
                startAngle: 0
            },
            {
                name: "Marsy",
                type: "planet",
                mass: 150,
                radius: 4,
                color: 0xff3322,
                distance: 350,
                startAngle: Math.PI / 2
            },
            {
                name: "Luna",
                type: "moon",
                parent: "Marsy",
                mass: 10,
                radius: 1.5,
                color: 0x888888,
                distance: 20, // Distance from Parent
                startAngle: 0
            }
        ]
    }
};
