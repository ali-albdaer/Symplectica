/**
 * Two-Body Orbital Test
 * 
 * Validates that a circular orbit maintains its period within 0.1% tolerance.
 * Uses Sun-Earth system with known orbital period of ~365.256 days.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Physical constants
const G = 6.67430e-11;
const SOLAR_MASS = 1.989e30;
const EARTH_MASS = 5.972e24;
const AU = 1.495978707e11;

// Simulation constants
const DT = 1 / 60; // 60 Hz
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

function sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Calculate circular velocity for a body orbiting a central mass
 */
function circularVelocity(centralMass: number, distance: number): number {
    return Math.sqrt(G * centralMass / distance);
}

/**
 * Calculate Keplerian orbital period
 */
function orbitalPeriod(centralMass: number, semiMajorAxis: number): number {
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}

/**
 * Calculate gravitational acceleration on body i from all other bodies
 */
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

/**
 * Velocity Verlet integration step
 */
function velocityVerletStep(bodies: Body[], dt: number): void {
    const n = bodies.length;

    // Store old accelerations
    const oldAccs: Vec3[] = [];
    for (let i = 0; i < n; i++) {
        oldAccs.push(computeAcceleration(bodies, i));
    }

    // Update positions: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
    for (let i = 0; i < n; i++) {
        const b = bodies[i]!;
        const a = oldAccs[i]!;
        b.position.x += b.velocity.x * dt + 0.5 * a.x * dt * dt;
        b.position.y += b.velocity.y * dt + 0.5 * a.y * dt * dt;
        b.position.z += b.velocity.z * dt + 0.5 * a.z * dt * dt;
    }

    // Compute new accelerations
    const newAccs: Vec3[] = [];
    for (let i = 0; i < n; i++) {
        newAccs.push(computeAcceleration(bodies, i));
    }

    // Update velocities: v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
    for (let i = 0; i < n; i++) {
        const b = bodies[i]!;
        const oldA = oldAccs[i]!;
        const newA = newAccs[i]!;
        b.velocity.x += 0.5 * (oldA.x + newA.x) * dt;
        b.velocity.y += 0.5 * (oldA.y + newA.y) * dt;
        b.velocity.z += 0.5 * (oldA.z + newA.z) * dt;
    }
}

describe('Two-Body Orbital Test', () => {
    it('should maintain orbital period within 0.1% tolerance', () => {
        // Setup Sun-Earth system
        const earthV = circularVelocity(SOLAR_MASS, AU);
        const expectedPeriod = orbitalPeriod(SOLAR_MASS, AU);

        console.log(`Expected orbital period: ${expectedPeriod / 86400} days`);
        console.log(`Initial circular velocity: ${earthV} m/s`);

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

        // Track orbital phase
        const initialPos = { ...bodies[1]!.position };
        let previousAngle = 0;
        let totalAngle = 0;
        let orbitStartTime = 0;
        let completedOrbits = 0;
        let measuredPeriod = 0;

        // Simulate for a bit more than one orbit
        // Use larger timestep for test speed (1 hour instead of 1/60 second)
        const testDt = 3600; // 1 hour timestep for faster testing
        const maxSimTime = expectedPeriod * 1.2;
        const totalSteps = Math.ceil(maxSimTime / testDt);
        const progressInterval = Math.floor(totalSteps / 20); // 20 progress updates

        console.log(`Running ${totalSteps} simulation steps (1-hour timestep)...`);

        for (let step = 0; step < totalSteps; step++) {
            velocityVerletStep(bodies, testDt);
            
            // Progress indicator
            if (step % progressInterval === 0) {
                const pct = ((step / totalSteps) * 100).toFixed(0);
                const simDays = (step * testDt) / 86400;
                process.stdout.write(`\r  Progress: ${pct}% (${simDays.toFixed(1)} days simulated)`);
            }

            // Calculate angle from initial position
            const earth = bodies[1]!;
            const angle = Math.atan2(earth.position.y, earth.position.x);

            // Detect orbit completion (crossing positive x-axis from below)
            if (previousAngle < 0 && angle >= 0 && step > 100) {
                completedOrbits++;
                const currentTime = step * testDt;
                
                if (completedOrbits === 1) {
                    measuredPeriod = currentTime - orbitStartTime;
                    console.log(`Orbit completed at step ${step}`);
                    console.log(`Measured period: ${measuredPeriod / 86400} days`);
                    break;
                }
            }

            if (step === 0) {
                orbitStartTime = 0;
            }

            totalAngle += Math.abs(angle - previousAngle);
            previousAngle = angle;
        }

        // Calculate error
        const periodError = Math.abs(measuredPeriod - expectedPeriod) / expectedPeriod;
        console.log(`Period error: ${(periodError * 100).toFixed(4)}%`);

        // Assert within 0.1% tolerance
        assert.ok(
            periodError < 0.001,
            `Orbital period error ${(periodError * 100).toFixed(4)}% exceeds 0.1% tolerance`
        );

        // Also verify orbit stays roughly circular (check distance from Sun)
        const earth = bodies[1]!;
        const finalDistance = magnitude(sub(earth.position, bodies[0]!.position));
        const distanceError = Math.abs(finalDistance - AU) / AU;
        console.log(`Final distance from Sun: ${finalDistance / AU} AU`);
        console.log(`Distance error: ${(distanceError * 100).toFixed(4)}%`);

        // Distance should stay within 1%
        assert.ok(
            distanceError < 0.01,
            `Orbital radius error ${(distanceError * 100).toFixed(4)}% exceeds 1% tolerance`
        );
    });

    it('should conserve total momentum', () => {
        const earthV = circularVelocity(SOLAR_MASS, AU);

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

        // Calculate initial momentum
        const initialMomentum = vec3();
        for (const b of bodies) {
            initialMomentum.x += b.mass * b.velocity.x;
            initialMomentum.y += b.mass * b.velocity.y;
            initialMomentum.z += b.mass * b.velocity.z;
        }

        // Run simulation for 30 days with 1-hour timestep
        const simDays = 30;
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

        // Calculate final momentum
        const finalMomentum = vec3();
        for (const b of bodies) {
            finalMomentum.x += b.mass * b.velocity.x;
            finalMomentum.y += b.mass * b.velocity.y;
            finalMomentum.z += b.mass * b.velocity.z;
        }

        // Compare magnitudes
        const initialMag = magnitude(initialMomentum);
        const finalMag = magnitude(finalMomentum);
        const momentumError = Math.abs(finalMag - initialMag) / (initialMag + 1e-30);

        console.log(`Initial momentum magnitude: ${initialMag}`);
        console.log(`Final momentum magnitude: ${finalMag}`);
        console.log(`Momentum error: ${(momentumError * 100).toFixed(6)}%`);

        // Momentum should be conserved to machine precision
        assert.ok(
            momentumError < 1e-10,
            `Momentum error ${momentumError} exceeds tolerance`
        );
    });
});
