/**
 * Energy Drift Test
 * 
 * Validates that total mechanical energy drift stays below 0.01% per orbit.
 * Uses the Velocity-Verlet integrator with Sun-Earth system.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Physical constants
const G = 6.67430e-11;
const SOLAR_MASS = 1.989e30;
const EARTH_MASS = 5.972e24;
const AU = 1.495978707e11;

// Simulation constants
const DT = 1 / 60;
const SOFTENING = 1e6;

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

interface Body {
    mass: number;
    position: Vec3;
    velocity: Vec3;
}

function vec3(x = 0, y = 0, z = 0): Vec3 {
    return { x, y, z };
}

function magnitude(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function circularVelocity(centralMass: number, distance: number): number {
    return Math.sqrt(G * centralMass / distance);
}

function orbitalPeriod(centralMass: number, semiMajorAxis: number): number {
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}

/**
 * Calculate total kinetic energy
 */
function kineticEnergy(bodies: Body[]): number {
    let ke = 0;
    for (const b of bodies) {
        const v2 = b.velocity.x ** 2 + b.velocity.y ** 2 + b.velocity.z ** 2;
        ke += 0.5 * b.mass * v2;
    }
    return ke;
}

/**
 * Calculate total gravitational potential energy
 */
function potentialEnergy(bodies: Body[]): number {
    let pe = 0;
    for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
            const bi = bodies[i]!;
            const bj = bodies[j]!;
            const dx = bj.position.x - bi.position.x;
            const dy = bj.position.y - bi.position.y;
            const dz = bj.position.z - bi.position.z;
            const r = Math.sqrt(dx * dx + dy * dy + dz * dz + SOFTENING * SOFTENING);
            pe -= G * bi.mass * bj.mass / r;
        }
    }
    return pe;
}

/**
 * Calculate total mechanical energy
 */
function totalEnergy(bodies: Body[]): number {
    return kineticEnergy(bodies) + potentialEnergy(bodies);
}

function computeAcceleration(bodies: Body[], i: number): Vec3 {
    const acc = vec3();
    const bi = bodies[i]!;

    for (let j = 0; j < bodies.length; j++) {
        if (i === j) continue;
        const bj = bodies[j]!;

        const dx = bj.position.x - bi.position.x;
        const dy = bj.position.y - bi.position.y;
        const dz = bj.position.z - bi.position.z;

        const r2 = dx * dx + dy * dy + dz * dz + SOFTENING * SOFTENING;
        const r = Math.sqrt(r2);
        const r3 = r * r2;

        const factor = G * bj.mass / r3;
        acc.x += factor * dx;
        acc.y += factor * dy;
        acc.z += factor * dz;
    }

    return acc;
}

function velocityVerletStep(bodies: Body[], dt: number): void {
    const n = bodies.length;

    const oldAccs: Vec3[] = [];
    for (let i = 0; i < n; i++) {
        oldAccs.push(computeAcceleration(bodies, i));
    }

    for (let i = 0; i < n; i++) {
        const b = bodies[i]!;
        const a = oldAccs[i]!;
        b.position.x += b.velocity.x * dt + 0.5 * a.x * dt * dt;
        b.position.y += b.velocity.y * dt + 0.5 * a.y * dt * dt;
        b.position.z += b.velocity.z * dt + 0.5 * a.z * dt * dt;
    }

    const newAccs: Vec3[] = [];
    for (let i = 0; i < n; i++) {
        newAccs.push(computeAcceleration(bodies, i));
    }

    for (let i = 0; i < n; i++) {
        const b = bodies[i]!;
        const oldA = oldAccs[i]!;
        const newA = newAccs[i]!;
        b.velocity.x += 0.5 * (oldA.x + newA.x) * dt;
        b.velocity.y += 0.5 * (oldA.y + newA.y) * dt;
        b.velocity.z += 0.5 * (oldA.z + newA.z) * dt;
    }
}

describe('Energy Conservation Test', () => {
    it('should maintain total energy within 0.01% per orbit', () => {
        const earthV = circularVelocity(SOLAR_MASS, AU);
        const period = orbitalPeriod(SOLAR_MASS, AU);

        const bodies: Body[] = [
            {
                mass: SOLAR_MASS,
                position: vec3(0, 0, 0),
                velocity: vec3(0, 0, 0),
            },
            {
                mass: EARTH_MASS,
                position: vec3(AU, 0, 0),
                velocity: vec3(0, earthV, 0),
            },
        ];

        const initialEnergy = totalEnergy(bodies);
        console.log(`Initial total energy: ${initialEnergy.toExponential(6)} J`);

        // Simulate one full orbit with 1-hour timestep for speed
        const testDt = 3600;
        const totalSteps = Math.ceil(period / testDt);
        const progressInterval = Math.floor(totalSteps / 20);
        let maxDrift = 0;
        let minEnergy = initialEnergy;
        let maxEnergy = initialEnergy;

        console.log(`Running ${totalSteps} steps for one orbit...`);
        for (let step = 0; step < totalSteps; step++) {
            velocityVerletStep(bodies, testDt);

            // Progress indicator
            if (step % progressInterval === 0) {
                process.stdout.write(`\r  Progress: ${((step / totalSteps) * 100).toFixed(0)}%`);
            }

            // Sample energy periodically
            if (step % 100 === 0 || step === totalSteps - 1) {
                const currentEnergy = totalEnergy(bodies);
                const drift = Math.abs(currentEnergy - initialEnergy) / Math.abs(initialEnergy);
                
                if (drift > maxDrift) {
                    maxDrift = drift;
                }
                if (currentEnergy < minEnergy) minEnergy = currentEnergy;
                if (currentEnergy > maxEnergy) maxEnergy = currentEnergy;
            }
        }

        const finalEnergy = totalEnergy(bodies);
        const totalDrift = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);

        console.log(`Final total energy: ${finalEnergy.toExponential(6)} J`);
        console.log(`Total drift: ${(totalDrift * 100).toFixed(6)}%`);
        console.log(`Max drift during orbit: ${(maxDrift * 100).toFixed(6)}%`);
        console.log(`Energy range: [${minEnergy.toExponential(4)}, ${maxEnergy.toExponential(4)}]`);

        // Assert energy drift is below 0.01%
        assert.ok(
            totalDrift < 0.0001,
            `Energy drift ${(totalDrift * 100).toFixed(6)}% exceeds 0.01% tolerance`
        );
    });

    it('should show symplectic behavior (bounded oscillation)', () => {
        const earthV = circularVelocity(SOLAR_MASS, AU);
        const period = orbitalPeriod(SOLAR_MASS, AU);

        const bodies: Body[] = [
            {
                mass: SOLAR_MASS,
                position: vec3(0, 0, 0),
                velocity: vec3(0, 0, 0),
            },
            {
                mass: EARTH_MASS,
                position: vec3(AU, 0, 0),
                velocity: vec3(0, earthV, 0),
            },
        ];

        const initialEnergy = totalEnergy(bodies);
        const energySamples: number[] = [];

        // Simulate 5 orbits with 1-hour timestep
        const orbits = 5;
        const testDt = 3600;
        const totalSteps = Math.ceil(orbits * period / testDt);
        const sampleInterval = Math.max(1, Math.floor(totalSteps / 1000));
        const progressInterval = Math.floor(totalSteps / 10);

        console.log(`Running ${totalSteps} steps for ${orbits} orbits...`);
        for (let step = 0; step < totalSteps; step++) {
            velocityVerletStep(bodies, testDt);

            if (step % progressInterval === 0) {
                process.stdout.write(`\r  Progress: ${((step / totalSteps) * 100).toFixed(0)}%`);
            }

            if (step % sampleInterval === 0) {
                energySamples.push(totalEnergy(bodies));
            }
        }
        console.log('\r  Progress: 100%');

        // Calculate energy statistics
        const avgEnergy = energySamples.reduce((a, b) => a + b, 0) / energySamples.length;
        const maxDeviation = Math.max(...energySamples.map(e => Math.abs(e - avgEnergy)));
        const relativeDeviation = maxDeviation / Math.abs(avgEnergy);

        console.log(`Average energy over ${orbits} orbits: ${avgEnergy.toExponential(6)} J`);
        console.log(`Max deviation from average: ${maxDeviation.toExponential(4)} J`);
        console.log(`Relative deviation: ${(relativeDeviation * 100).toFixed(6)}%`);

        // Symplectic integrators should have bounded energy oscillation
        // Energy should oscillate but not drift monotonically
        const firstHalf = energySamples.slice(0, energySamples.length / 2);
        const secondHalf = energySamples.slice(energySamples.length / 2);
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const avgDrift = Math.abs(secondAvg - firstAvg) / Math.abs(firstAvg);

        console.log(`Average drift between first and second half: ${(avgDrift * 100).toFixed(6)}%`);

        // The average energy shouldn't drift significantly
        assert.ok(
            avgDrift < 0.001,
            `Energy shows monotonic drift of ${(avgDrift * 100).toFixed(4)}%`
        );
    });

    it('should handle multi-body system energy conservation', () => {
        // Simple 3-body system: Sun, Earth, Mars
        const earthV = circularVelocity(SOLAR_MASS, AU);
        const marsDistance = 2.279e11;
        const marsV = circularVelocity(SOLAR_MASS, marsDistance);
        const marsMass = 6.4171e23;

        const bodies: Body[] = [
            {
                mass: SOLAR_MASS,
                position: vec3(0, 0, 0),
                velocity: vec3(0, 0, 0),
            },
            {
                mass: EARTH_MASS,
                position: vec3(AU, 0, 0),
                velocity: vec3(0, earthV, 0),
            },
            {
                mass: marsMass,
                position: vec3(marsDistance, 0, 0),
                velocity: vec3(0, marsV, 0),
            },
        ];

        const initialEnergy = totalEnergy(bodies);
        console.log(`Initial 3-body energy: ${initialEnergy.toExponential(6)} J`);

        // Simulate for 100 days with 1-hour timestep
        const simDays = 100;
        const testDt = 3600;
        const totalSteps = Math.ceil((simDays * 86400) / testDt);
        const progressInterval = Math.floor(totalSteps / 10);

        console.log(`Simulating ${simDays} days...`);
        for (let step = 0; step < totalSteps; step++) {
            velocityVerletStep(bodies, testDt);
            if (step % progressInterval === 0) {
                process.stdout.write(`\r  Progress: ${((step / totalSteps) * 100).toFixed(0)}%`);
            }
        }
        console.log('\r  Progress: 100%');

        const finalEnergy = totalEnergy(bodies);
        const drift = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);

        console.log(`Final 3-body energy: ${finalEnergy.toExponential(6)} J`);
        console.log(`Energy drift over ${simDays} days: ${(drift * 100).toFixed(6)}%`);

        // Energy should still be well conserved in 3-body case
        assert.ok(
            drift < 0.001,
            `3-body energy drift ${(drift * 100).toFixed(4)}% exceeds 0.1% tolerance`
        );
    });
});
