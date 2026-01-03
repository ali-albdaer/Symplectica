export const CONFIG = {
    physics: {
        G: 6.67430e-11, // Real G, but we might need to tweak masses if we scale sizes
        physicsSubsteps: 5, // Substeps for accuracy
        dt: 1/60,
    },
    graphics: {
        shadowMapSize: 2048,
        enableShadows: true,
        fidelity: 'high', // low, medium, high
        logarithmicDepthBuffer: true,
        fov: 60,
    },
    debug: {
        showPhysics: false,
        showOrbits: true,
    },
    bodies: {
        sun: {
            name: "Sun",
            radius: 20000, // 20km radius sun (miniature)
            mass: 1.989e24, // Scaled mass to keep orbits reasonable with G
            color: 0xffaa00,
            emissive: 0xffaa00,
            emissiveIntensity: 2,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            type: 'star',
            lightIntensity: 2.5,
            rotationPeriod: 2000 // Seconds for full rotation
        },
        planet1: {
            name: "Terra",
            radius: 1000, // 1km radius planet
            mass: 1.5e17, // Gives approx 1g surface gravity
            color: 0x2233ff,
            position: { x: 100000, y: 0, z: 0 }, // 100km distance
            velocity: { x: 0, y: 0, z: 36434 }, // Will be calculated to be circular
            type: 'planet',
            texture: 'earth', // Placeholder
            rotationPeriod: 120, // Short day for visual effect
            atmosphere: {
                color: 0x44aaff,
                opacity: 0.3,
                scale: 1.1
            }
        },
        moon1: {
            name: "Luna",
            radius: 200,
            mass: 1e15,
            color: 0x888888,
            parent: 'planet1',
            distance: 3000, // Distance from planet center
            type: 'moon',
            rotationPeriod: 50
        },
        planet2: {
            name: "Marsy",
            radius: 800,
            mass: 8e16,
            color: 0xff4422,
            position: { x: -180000, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: -25000 },
            type: 'planet',
            rotationPeriod: 150
        }
    },
    player: {
        height: 1.8,
        speed: 10,
        jumpForce: 8,
        sensitivity: 0.002,
        startBody: 'planet1'
    }
};

// Helper to calculate orbital velocity for circular orbit
// v = sqrt(GM/r)
export function calculateOrbitalVelocity(centralMass, distance) {
    return Math.sqrt((CONFIG.physics.G * centralMass) / distance);
}

// Recalculate initial velocities to ensure stability
const sunMass = CONFIG.bodies.sun.mass;
const p1Dist = CONFIG.bodies.planet1.position.x;
CONFIG.bodies.planet1.velocity.z = calculateOrbitalVelocity(sunMass, p1Dist);

const p2Dist = Math.abs(CONFIG.bodies.planet2.position.x);
CONFIG.bodies.planet2.velocity.z = -calculateOrbitalVelocity(sunMass, p2Dist);

// Moon velocity: Planet Velocity + Orbital Velocity around Planet
const moonDist = CONFIG.bodies.moon1.distance;
const p1Mass = CONFIG.bodies.planet1.mass;
const moonOrbitalSpeed = calculateOrbitalVelocity(p1Mass, moonDist);
CONFIG.bodies.moon1.position = { x: p1Dist + moonDist, y: 0, z: 0 };
CONFIG.bodies.moon1.velocity = { x: 0, y: 0, z: CONFIG.bodies.planet1.velocity.z + moonOrbitalSpeed };
