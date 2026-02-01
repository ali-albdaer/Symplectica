/**
 * validation.js - Conservation Law Tests and Validation
 * 
 * Provides test functions to verify the accuracy of the physics simulation.
 * Essential for development and debugging.
 */

import { Vec3 } from './vector3.js';
import { Body, BodyType } from './body.js';
import { computeConservationQuantities } from './gravity.js';
import { velocityVerletStep, rk4Step, rk45Step } from './integrators.js';
import { G, AU, SOLAR_MASS } from './constants.js';

/**
 * Test results structure
 */
export class TestResult {
    constructor(name, passed, message, data = null) {
        this.name = name;
        this.passed = passed;
        this.message = message;
        this.data = data;
        this.timestamp = Date.now();
    }

    toString() {
        const status = this.passed ? '✓ PASS' : '✗ FAIL';
        return `[${status}] ${this.name}: ${this.message}`;
    }
}

/**
 * Run all validation tests
 * @returns {TestResult[]}
 */
export function runAllTests() {
    const results = [];
    
    console.log('Running validation tests...');
    
    results.push(testTwoBodyOrbit());
    results.push(testEnergyConservation());
    results.push(testMomentumConservation());
    results.push(testAngularMomentumConservation());
    results.push(testCenterOfMassMotion());
    results.push(testIntegratorSymmetry());
    results.push(testKeplerThirdLaw());
    
    const passed = results.filter(r => r.passed).length;
    console.log(`\nValidation complete: ${passed}/${results.length} tests passed`);
    
    return results;
}

/**
 * Test two-body circular orbit stability
 * @returns {TestResult}
 */
export function testTwoBodyOrbit() {
    const name = 'Two-Body Orbit Stability';
    
    try {
        // Create Sun-Earth-like system
        const sun = new Body({
            type: BodyType.STAR,
            name: 'Test Sun',
            mass: SOLAR_MASS,
            position: new Vec3(0, 0, 0),
            velocity: new Vec3(0, 0, 0),
            radius: 6.96e8,
        });
        
        // Calculate orbital velocity for circular orbit
        const r = AU;
        const v = Math.sqrt(G * SOLAR_MASS / r);
        
        const earth = new Body({
            type: BodyType.PLANET,
            name: 'Test Earth',
            mass: 5.972e24,
            position: new Vec3(r, 0, 0),
            velocity: new Vec3(0, v, 0),
            radius: 6.371e6,
        });
        
        const bodies = [sun, earth];
        
        // Get initial radius
        const initialR = earth.position.distanceTo(sun.position);
        const initialEnergy = computeConservationQuantities(bodies).totalEnergy;
        
        // Run for one orbit (approximately)
        const orbitalPeriod = 2 * Math.PI * Math.sqrt(r * r * r / (G * SOLAR_MASS));
        const dt = 3600; // 1 hour
        const steps = Math.floor(orbitalPeriod / dt);
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        // Check final radius
        const finalR = earth.position.distanceTo(sun.position);
        const radiusError = Math.abs(finalR - initialR) / initialR;
        
        // Check final energy
        const finalEnergy = computeConservationQuantities(bodies).totalEnergy;
        const energyError = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);
        
        const passed = radiusError < 0.01 && energyError < 0.001; // 1% radius, 0.1% energy
        
        return new TestResult(name, passed,
            `Radius error: ${(radiusError * 100).toFixed(4)}%, Energy error: ${(energyError * 100).toFixed(6)}%`,
            { radiusError, energyError, steps }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test energy conservation over many timesteps
 * @returns {TestResult}
 */
export function testEnergyConservation() {
    const name = 'Energy Conservation';
    
    try {
        // Three-body system
        const bodies = [
            new Body({
                type: BodyType.STAR,
                mass: 1e30,
                position: new Vec3(0, 0, 0),
                velocity: new Vec3(0, 0, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e26,
                position: new Vec3(1e11, 0, 0),
                velocity: new Vec3(0, 2e4, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e25,
                position: new Vec3(0, 2e11, 0),
                velocity: new Vec3(-1.5e4, 0, 0),
            }),
        ];
        
        const initialEnergy = computeConservationQuantities(bodies).totalEnergy;
        
        // Run simulation
        const dt = 3600;
        const steps = 10000;
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        const finalEnergy = computeConservationQuantities(bodies).totalEnergy;
        const errorPercent = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy) * 100;
        
        const passed = errorPercent < 0.1; // 0.1% error threshold
        
        return new TestResult(name, passed,
            `Energy drift: ${errorPercent.toFixed(6)}% after ${steps} steps`,
            { initialEnergy, finalEnergy, errorPercent }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test momentum conservation
 * @returns {TestResult}
 */
export function testMomentumConservation() {
    const name = 'Momentum Conservation';
    
    try {
        // Two bodies with opposite momenta
        const bodies = [
            new Body({
                type: BodyType.PLANET,
                mass: 1e20,
                position: new Vec3(-1e9, 0, 0),
                velocity: new Vec3(1000, 500, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e20,
                position: new Vec3(1e9, 0, 0),
                velocity: new Vec3(-1000, -500, 0),
            }),
        ];
        
        const initial = computeConservationQuantities(bodies);
        const initialMomentum = initial.totalMomentum.magnitude();
        
        // Run simulation
        const dt = 1000;
        const steps = 5000;
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        const final = computeConservationQuantities(bodies);
        const finalMomentum = final.totalMomentum.magnitude();
        
        // For zero initial momentum, check absolute value
        const error = Math.abs(finalMomentum - initialMomentum);
        const relativeError = initialMomentum > 1e-10 ? 
            error / initialMomentum : error;
        
        const passed = relativeError < 1e-10 || (initialMomentum < 1e-10 && finalMomentum < 1e5);
        
        return new TestResult(name, passed,
            `Initial: ${initialMomentum.toExponential(3)}, Final: ${finalMomentum.toExponential(3)}`,
            { initialMomentum, finalMomentum, error: relativeError }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test angular momentum conservation
 * @returns {TestResult}
 */
export function testAngularMomentumConservation() {
    const name = 'Angular Momentum Conservation';
    
    try {
        // Elliptical orbit
        const M = 1e30;
        const r = 1e11;
        const v = Math.sqrt(G * M / r) * 1.3; // Slightly more than circular
        
        const bodies = [
            new Body({
                type: BodyType.STAR,
                mass: M,
                position: new Vec3(0, 0, 0),
                velocity: new Vec3(0, 0, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e24,
                position: new Vec3(r, 0, 0),
                velocity: new Vec3(0, v, 0),
            }),
        ];
        
        const initial = computeConservationQuantities(bodies);
        const initialL = initial.angularMomentum.magnitude();
        
        // Run simulation
        const dt = 3600;
        const steps = 8760; // About one year in hours
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        const final = computeConservationQuantities(bodies);
        const finalL = final.angularMomentum.magnitude();
        
        const errorPercent = Math.abs(finalL - initialL) / initialL * 100;
        
        const passed = errorPercent < 0.01; // 0.01% threshold
        
        return new TestResult(name, passed,
            `Angular momentum drift: ${errorPercent.toFixed(6)}%`,
            { initialL, finalL, errorPercent }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test center of mass motion (should be constant in isolated system)
 * @returns {TestResult}
 */
export function testCenterOfMassMotion() {
    const name = 'Center of Mass Motion';
    
    try {
        // Bodies with net zero momentum -> CoM should not move
        const bodies = [
            new Body({
                type: BodyType.STAR,
                mass: 2e30,
                position: new Vec3(0, 0, 0),
                velocity: new Vec3(0, 0, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e28,
                position: new Vec3(5e10, 0, 0),
                velocity: new Vec3(0, 4e4, 0),
            }),
        ];
        
        // Calculate initial CoM
        const totalMass = bodies.reduce((sum, b) => sum + b.mass, 0);
        const initialCoM = new Vec3(0, 0, 0);
        for (const body of bodies) {
            initialCoM.x += body.mass * body.position.x / totalMass;
            initialCoM.y += body.mass * body.position.y / totalMass;
            initialCoM.z += body.mass * body.position.z / totalMass;
        }
        
        // Run simulation
        const dt = 1000;
        const steps = 5000;
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        // Calculate final CoM
        const finalCoM = new Vec3(0, 0, 0);
        for (const body of bodies) {
            finalCoM.x += body.mass * body.position.x / totalMass;
            finalCoM.y += body.mass * body.position.y / totalMass;
            finalCoM.z += body.mass * body.position.z / totalMass;
        }
        
        // Check drift
        const drift = initialCoM.distanceTo(finalCoM);
        const simTime = dt * steps;
        
        // CoM should drift only slightly (due to initial momentum)
        // If initial momentum is zero, drift should be essentially zero
        const passed = drift < 1e6; // Less than 1000 km
        
        return new TestResult(name, passed,
            `CoM drift: ${drift.toExponential(3)} m over ${simTime} s`,
            { initialCoM, finalCoM, drift }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test integrator time-reversal symmetry
 * @returns {TestResult}
 */
export function testIntegratorSymmetry() {
    const name = 'Integrator Time Reversibility';
    
    try {
        // Simple two-body system
        const createBodies = () => [
            new Body({
                type: BodyType.STAR,
                mass: 1e30,
                position: new Vec3(0, 0, 0),
                velocity: new Vec3(0, 0, 0),
            }),
            new Body({
                type: BodyType.PLANET,
                mass: 1e24,
                position: new Vec3(1e11, 0, 0),
                velocity: new Vec3(0, 3e4, 0),
            }),
        ];
        
        const bodies = createBodies();
        
        // Store initial state
        const initialPositions = bodies.map(b => b.position.clone());
        const initialVelocities = bodies.map(b => b.velocity.clone());
        
        // Run forward
        const dt = 3600;
        const steps = 1000;
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        // Run backward (reverse velocities, step with same dt)
        for (const body of bodies) {
            body.velocity = body.velocity.scale(-1);
        }
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        // Reverse velocities again to compare
        for (const body of bodies) {
            body.velocity = body.velocity.scale(-1);
        }
        
        // Check how close we are to initial state
        let maxPosError = 0;
        let maxVelError = 0;
        
        for (let i = 0; i < bodies.length; i++) {
            const posError = bodies[i].position.distanceTo(initialPositions[i]);
            const velError = bodies[i].velocity.distanceTo(initialVelocities[i]);
            
            maxPosError = Math.max(maxPosError, posError);
            maxVelError = Math.max(maxVelError, velError);
        }
        
        // Relative errors
        const initialPosScale = initialPositions[1].magnitude();
        const initialVelScale = initialVelocities[1].magnitude();
        const relPosError = maxPosError / initialPosScale;
        const relVelError = maxVelError / initialVelScale;
        
        const passed = relPosError < 0.01 && relVelError < 0.01; // 1% threshold
        
        return new TestResult(name, passed,
            `Position error: ${(relPosError * 100).toFixed(4)}%, Velocity error: ${(relVelError * 100).toFixed(4)}%`,
            { maxPosError, maxVelError, relPosError, relVelError }
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Test Kepler's third law: T² ∝ a³
 * @returns {TestResult}
 */
export function testKeplerThirdLaw() {
    const name = "Kepler's Third Law";
    
    try {
        const M = SOLAR_MASS;
        
        // Test at different orbital radii
        const results = [];
        
        for (const rFactor of [0.5, 1.0, 2.0]) {
            const r = AU * rFactor;
            const v = Math.sqrt(G * M / r);
            
            const bodies = [
                new Body({
                    type: BodyType.STAR,
                    mass: M,
                    position: new Vec3(0, 0, 0),
                    velocity: new Vec3(0, 0, 0),
                }),
                new Body({
                    type: BodyType.PLANET,
                    mass: 1e24, // Small mass
                    position: new Vec3(r, 0, 0),
                    velocity: new Vec3(0, v, 0),
                }),
            ];
            
            // Expected period from Kepler's third law
            const expectedPeriod = 2 * Math.PI * Math.sqrt(r * r * r / (G * M));
            
            // Run simulation and find period
            const dt = 3600;
            let lastY = 0;
            let crossings = [];
            
            for (let step = 0; step < 50000; step++) {
                velocityVerletStep(bodies, dt);
                
                const y = bodies[1].position.y;
                // Detect zero crossing (positive direction)
                if (lastY < 0 && y >= 0) {
                    crossings.push(step * dt);
                    if (crossings.length >= 2) break;
                }
                lastY = y;
            }
            
            if (crossings.length >= 2) {
                const measuredPeriod = crossings[1] - crossings[0];
                const error = Math.abs(measuredPeriod - expectedPeriod) / expectedPeriod;
                results.push({ r: rFactor, expectedPeriod, measuredPeriod, error });
            }
        }
        
        const maxError = Math.max(...results.map(r => r.error));
        const passed = maxError < 0.01; // 1% error
        
        const details = results.map(r => 
            `r=${r.r}AU: error=${(r.error * 100).toFixed(3)}%`
        ).join(', ');
        
        return new TestResult(name, passed,
            `Max period error: ${(maxError * 100).toFixed(3)}% (${details})`,
            results
        );
    } catch (err) {
        return new TestResult(name, false, `Error: ${err.message}`);
    }
}

/**
 * Compare integrator accuracy
 * @returns {Object} Comparison results
 */
export function compareIntegrators() {
    console.log('Comparing integrators...');
    
    const createBodies = () => [
        new Body({
            type: BodyType.STAR,
            mass: SOLAR_MASS,
            position: new Vec3(0, 0, 0),
            velocity: new Vec3(0, 0, 0),
        }),
        new Body({
            type: BodyType.PLANET,
            mass: 5.972e24,
            position: new Vec3(AU, 0, 0),
            velocity: new Vec3(0, 29783, 0),
        }),
    ];
    
    const results = {};
    const dt = 3600;
    const steps = 8760; // 1 year
    
    // Test Velocity Verlet
    {
        const bodies = createBodies();
        const initialEnergy = computeConservationQuantities(bodies).totalEnergy;
        const start = performance.now();
        
        for (let i = 0; i < steps; i++) {
            velocityVerletStep(bodies, dt);
        }
        
        const elapsed = performance.now() - start;
        const finalEnergy = computeConservationQuantities(bodies).totalEnergy;
        const error = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);
        
        results.velocityVerlet = {
            energyError: error,
            time: elapsed,
            stepsPerSecond: steps / (elapsed / 1000),
        };
    }
    
    // Test RK4
    {
        const bodies = createBodies();
        const initialEnergy = computeConservationQuantities(bodies).totalEnergy;
        const start = performance.now();
        
        for (let i = 0; i < steps; i++) {
            rk4Step(bodies, dt);
        }
        
        const elapsed = performance.now() - start;
        const finalEnergy = computeConservationQuantities(bodies).totalEnergy;
        const error = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);
        
        results.rk4 = {
            energyError: error,
            time: elapsed,
            stepsPerSecond: steps / (elapsed / 1000),
        };
    }
    
    // Test RK45 (adaptive)
    {
        const bodies = createBodies();
        const initialEnergy = computeConservationQuantities(bodies).totalEnergy;
        const start = performance.now();
        
        let actualSteps = 0;
        let currentDt = dt;
        let totalTime = 0;
        const targetTime = dt * steps;
        
        while (totalTime < targetTime) {
            const result = rk45Step(bodies, currentDt, 1e-6);
            currentDt = result.newDt;
            totalTime += result.actualDt;
            actualSteps++;
        }
        
        const elapsed = performance.now() - start;
        const finalEnergy = computeConservationQuantities(bodies).totalEnergy;
        const error = Math.abs(finalEnergy - initialEnergy) / Math.abs(initialEnergy);
        
        results.rk45 = {
            energyError: error,
            time: elapsed,
            stepsPerSecond: actualSteps / (elapsed / 1000),
            actualSteps,
        };
    }
    
    console.log('Integrator comparison:');
    console.table(results);
    
    return results;
}

export default {
    TestResult,
    runAllTests,
    testTwoBodyOrbit,
    testEnergyConservation,
    testMomentumConservation,
    testAngularMomentumConservation,
    testCenterOfMassMotion,
    testIntegratorSymmetry,
    testKeplerThirdLaw,
    compareIntegrators,
};
