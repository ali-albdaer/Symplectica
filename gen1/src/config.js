export const Config = {
    physics: {
        G: 0.0001, // Gravitational constant (scaled for game)
        substeps: 5, // Physics substeps for accuracy
        dt: 1 / 60,
    },
    world: {
        sunMass: 100000,
        sunSize: 500,
        planet1Mass: 1000,
        planet1Size: 50,
        planet1Distance: 2000,
        planet2Mass: 2000,
        planet2Size: 80,
        planet2Distance: 3500,
        moonMass: 100,
        moonSize: 15,
        moonDistance: 150,
    },
    player: {
        speed: 10,
        jumpForce: 15,
        height: 2,
        mass: 1,
        flightSpeed: 50,
    },
    graphics: {
        shadowMapSize: 2048,
        shadowBias: -0.0001,
        enableShadows: true,
        fidelity: 'high', // low, medium, high
    },
    debug: {
        showPhysics: false,
        showOrbits: true,
    }
};