/**
 * Gravity Engine - N-Body Gravitational Physics Simulation
 * Accurately simulates gravitational interactions between all bodies
 * Uses Verlet integration for stability
 */

import { Vector3D } from '../utils/Vector3D.js';
import { CONFIG } from '../../config/globals.js';

export class GravityEngine {
    constructor() {
        this.bodies = [];
        this.timeScale = CONFIG.PHYSICS.timeScale;
        this.G = CONFIG.PHYSICS.G;
        
        // Physics accumulator for fixed timestep
        this.accumulator = 0;
        this.fixedDeltaTime = 1 / CONFIG.PHYSICS.physicsTickRate;
        
        // Statistics
        this.stats = {
            iterations: 0,
            totalEnergy: 0,
            totalMomentum: new Vector3D(),
        };
    }

    /**
     * Register a body in the simulation
     */
    addBody(body) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
            console.log(`✓ Registered body: ${body.name} (mass: ${body.mass.toExponential(2)} kg)`);
        }
    }

    /**
     * Remove a body from simulation
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Calculate gravitational force between two bodies
     * F = G * (m1 * m2) / r²
     */
    calculateGravitationalForce(body1, body2) {
        // Direction vector from body1 to body2
        const direction = Vector3D.sub(body2.position, body1.position);
        const distanceSquared = direction.magnitudeSquared();
        
        // Avoid singularity at r=0 and very close distances
        const minDistance = (body1.radius + body2.radius) * 0.5;
        const minDistanceSquared = minDistance * minDistance;
        
        if (distanceSquared < minDistanceSquared) {
            return new Vector3D(); // No force if too close
        }

        const distance = Math.sqrt(distanceSquared);
        direction.normalize();

        // Calculate force magnitude: F = G * m1 * m2 / r²
        const forceMagnitude = this.G * body1.mass * body2.mass / distanceSquared;

        // Force vector
        const force = Vector3D.multiply(direction, forceMagnitude);
        
        return force;
    }

    /**
     * Apply N-body gravitational forces to all bodies
     */
    applyGravity() {
        // Calculate forces between all pairs of bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const body1 = this.bodies[i];
            
            if (body1.isStatic || !body1.affectedByGravity) continue;

            for (let j = i + 1; j < this.bodies.length; j++) {
                const body2 = this.bodies[j];
                
                if (!body2.affectedByGravity) continue;

                // Calculate gravitational force
                const force = this.calculateGravitationalForce(body1, body2);

                // Apply force to body1 (attraction toward body2)
                body1.applyForce(force);

                // Apply equal and opposite force to body2 (Newton's 3rd law)
                if (!body2.isStatic) {
                    body2.applyForce(Vector3D.multiply(force, -1));
                }
            }
        }
    }

    /**
     * Update physics simulation
     * Uses semi-implicit Euler with fixed timestep
     */
    update(deltaTime) {
        // Scale time
        deltaTime *= this.timeScale;

        // Accumulate time
        this.accumulator += deltaTime;

        // Fixed timestep loop
        let iterations = 0;
        const maxIterations = CONFIG.PHYSICS.maxIterations;

        while (this.accumulator >= this.fixedDeltaTime && iterations < maxIterations) {
            this.physicsStep(this.fixedDeltaTime);
            this.accumulator -= this.fixedDeltaTime;
            iterations++;
        }

        this.stats.iterations = iterations;

        // Interpolate render positions if needed
        // const alpha = this.accumulator / this.fixedDeltaTime;
        // this.interpolatePositions(alpha);
    }

    /**
     * Single physics step
     */
    physicsStep(dt) {
        // Apply gravitational forces
        this.applyGravity();

        // Update all bodies
        for (const body of this.bodies) {
            body.update(dt);
        }

        // Check and resolve collisions if enabled
        if (CONFIG.PHYSICS.enableCollisions) {
            this.handleCollisions();
        }

        // Update statistics
        this.updateStatistics();
    }

    /**
     * Handle collisions between bodies
     */
    handleCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];

                if (body1.checkCollision(body2)) {
                    body1.resolveCollision(body2);
                }
            }
        }
    }

    /**
     * Update simulation statistics
     */
    updateStatistics() {
        let totalEnergy = 0;
        const totalMomentum = new Vector3D();

        for (const body of this.bodies) {
            // Kinetic energy
            totalEnergy += body.getKineticEnergy();

            // Momentum
            totalMomentum.add(body.getMomentum());
        }

        // Add potential energy
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                const distance = body1.position.distanceTo(body2.position);
                
                if (distance > 0) {
                    const potentialEnergy = -this.G * body1.mass * body2.mass / distance;
                    totalEnergy += potentialEnergy;
                }
            }
        }

        this.stats.totalEnergy = totalEnergy;
        this.stats.totalMomentum = totalMomentum;
    }

    /**
     * Get center of mass of the system
     */
    getCenterOfMass() {
        const com = new Vector3D();
        let totalMass = 0;

        for (const body of this.bodies) {
            com.add(Vector3D.multiply(body.position, body.mass));
            totalMass += body.mass;
        }

        if (totalMass > 0) {
            com.divideScalar(totalMass);
        }

        return com;
    }

    /**
     * Get body by name
     */
    getBodyByName(name) {
        return this.bodies.find(b => b.name === name);
    }

    /**
     * Get simulation statistics
     */
    getStatistics() {
        return {
            bodyCount: this.bodies.length,
            totalEnergy: this.stats.totalEnergy,
            totalMomentum: this.stats.totalMomentum.magnitude(),
            iterations: this.stats.iterations,
            timeScale: this.timeScale,
        };
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
        CONFIG.PHYSICS.timeScale = this.timeScale;
    }

    /**
     * Pause simulation
     */
    pause() {
        this.timeScale = 0;
    }

    /**
     * Resume simulation
     */
    resume(scale = 1) {
        this.timeScale = scale;
    }

    /**
     * Reset simulation
     */
    reset() {
        this.bodies = [];
        this.accumulator = 0;
        this.stats = {
            iterations: 0,
            totalEnergy: 0,
            totalMomentum: new Vector3D(),
        };
    }

    /**
     * Debug: Log all body states
     */
    logBodyStates() {
        console.log('=== Physics Engine State ===');
        console.log(`Bodies: ${this.bodies.length}`);
        console.log(`Time Scale: ${this.timeScale}x`);
        console.log(`Total Energy: ${this.stats.totalEnergy.toExponential(2)} J`);
        console.log(`Total Momentum: ${this.stats.totalMomentum.magnitude().toExponential(2)} kg⋅m/s`);
        console.log('\nBodies:');
        
        for (const body of this.bodies) {
            const state = body.getState();
            console.log(`  ${state.name}:`);
            console.log(`    Position: (${state.position.map(v => v.toExponential(2)).join(', ')})`);
            console.log(`    Velocity: (${state.velocity.map(v => v.toExponential(2)).join(', ')})`);
            console.log(`    Mass: ${state.mass.toExponential(2)} kg`);
        }
    }
}

export default GravityEngine;
