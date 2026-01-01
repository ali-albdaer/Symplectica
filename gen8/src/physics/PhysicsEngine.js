/**
 * PhysicsEngine.js
 * N-body gravitational physics simulation with Verlet integration.
 * Handles all physics calculations including gravity, collisions, and orbital mechanics.
 * 
 * Features:
 * - N-body gravitational simulation (all bodies attract each other)
 * - Velocity Verlet integration for stable long-term orbits
 * - Collision detection and response
 * - Softening factor to prevent singularities
 * - Time scaling for simulation speed control
 * - Debug visualization support
 */

import { PHYSICS, RENDER_SCALE, configManager } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('PhysicsEngine');

export class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.smallObjects = []; // For rocks, crates, etc.
        this.timeScale = PHYSICS.timeScale;
        this.isPaused = false;
        this.totalSimulatedTime = 0;
        this.frameCount = 0;
        this.lastUpdateTime = 0;
        this.deltaAccumulator = 0;
        
        // Performance tracking
        this.metrics = {
            physicsTimeMs: 0,
            bodyCount: 0,
            interactionCount: 0,
        };

        // Subscribe to config changes
        configManager.subscribe('PHYSICS.timeScale', (value) => {
            this.timeScale = value;
            logger.info(`Time scale changed to ${value}`);
        });

        logger.info('Physics engine initialized');
    }

    /**
     * Register a celestial body for physics simulation
     * @param {Object} body - Body with position, velocity, mass properties
     */
    addBody(body) {
        if (!body.position || !body.velocity || !body.mass) {
            logger.error('Invalid body - missing required properties', body);
            throw new Error('Body must have position, velocity, and mass');
        }

        // Ensure 3D vectors
        body.position = {
            x: body.position.x || 0,
            y: body.position.y || 0,
            z: body.position.z || 0,
        };
        body.velocity = {
            x: body.velocity.x || 0,
            y: body.velocity.y || 0,
            z: body.velocity.z || 0,
        };
        body.acceleration = { x: 0, y: 0, z: 0 };
        body.previousAcceleration = { x: 0, y: 0, z: 0 };

        this.bodies.push(body);
        logger.info(`Added body: ${body.name || 'Unnamed'}, mass: ${body.mass.toExponential(2)} kg`);
        
        return body;
    }

    /**
     * Register a small object (affected by gravity but doesn't affect celestial bodies)
     */
    addSmallObject(obj) {
        obj.position = obj.position || { x: 0, y: 0, z: 0 };
        obj.velocity = obj.velocity || { x: 0, y: 0, z: 0 };
        obj.acceleration = { x: 0, y: 0, z: 0 };
        obj.previousAcceleration = { x: 0, y: 0, z: 0 };
        obj.isGrounded = false;
        
        this.smallObjects.push(obj);
        logger.debug(`Added small object: ${obj.name}`);
        
        return obj;
    }

    /**
     * Remove a body from simulation
     */
    removeBody(body) {
        const idx = this.bodies.indexOf(body);
        if (idx !== -1) {
            this.bodies.splice(idx, 1);
            logger.info(`Removed body: ${body.name}`);
        }
    }

    /**
     * Main physics update - called every frame
     * Uses sub-stepping for stability at high time scales
     */
    update(deltaTime) {
        if (this.isPaused) return;

        const startTime = performance.now();
        
        // Convert delta to seconds and apply time scale
        const scaledDelta = (deltaTime / 1000) * this.timeScale;
        
        // Limit max delta to prevent instability
        const maxDelta = 3600; // Max 1 hour per step
        const clampedDelta = Math.min(scaledDelta, maxDelta);
        
        // Sub-stepping for accuracy
        const steps = PHYSICS.physicsStepsPerFrame;
        const stepDelta = clampedDelta / steps;

        for (let i = 0; i < steps; i++) {
            this.physicsStep(stepDelta);
        }

        this.totalSimulatedTime += clampedDelta;
        this.frameCount++;
        
        // Update metrics
        this.metrics.physicsTimeMs = performance.now() - startTime;
        this.metrics.bodyCount = this.bodies.length;
        this.metrics.interactionCount = (this.bodies.length * (this.bodies.length - 1)) / 2;

        if (PHYSICS.logPhysicsUpdates && this.frameCount % 60 === 0) {
            logger.debug(`Physics update: ${this.metrics.physicsTimeMs.toFixed(2)}ms, ` +
                        `${this.bodies.length} bodies, simulated time: ${this.formatTime(this.totalSimulatedTime)}`);
        }
    }

    /**
     * Single physics step using Velocity Verlet integration
     * This provides better energy conservation than Euler integration
     */
    physicsStep(dt) {
        if (dt <= 0) return;

        // Step 1: Calculate accelerations for all bodies
        this.calculateAllAccelerations();

        // Step 2: Update positions using Velocity Verlet
        // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
        for (const body of this.bodies) {
            body.position.x += body.velocity.x * dt + 0.5 * body.acceleration.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * body.acceleration.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * body.acceleration.z * dt * dt;

            // Store current acceleration
            body.previousAcceleration = { ...body.acceleration };
        }

        // Step 3: Calculate new accelerations at new positions
        this.calculateAllAccelerations();

        // Step 4: Update velocities using average of old and new accelerations
        // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
        for (const body of this.bodies) {
            body.velocity.x += 0.5 * (body.previousAcceleration.x + body.acceleration.x) * dt;
            body.velocity.y += 0.5 * (body.previousAcceleration.y + body.acceleration.y) * dt;
            body.velocity.z += 0.5 * (body.previousAcceleration.z + body.acceleration.z) * dt;
        }

        // Update small objects (simplified - they're affected by celestial bodies only)
        this.updateSmallObjects(dt);

        // Check for collisions
        if (PHYSICS.collisionEnabled) {
            this.handleCollisions();
        }
    }

    /**
     * Calculate gravitational accelerations for all bodies (N-body)
     */
    calculateAllAccelerations() {
        // Reset all accelerations
        for (const body of this.bodies) {
            body.acceleration = { x: 0, y: 0, z: 0 };
        }

        // Calculate pairwise gravitational forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                // Direction vector from A to B
                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;

                // Distance squared with softening to prevent singularity
                const distSq = dx * dx + dy * dy + dz * dz + PHYSICS.softeningFactor * PHYSICS.softeningFactor;
                const dist = Math.sqrt(distSq);

                // Gravitational force magnitude: F = G * m1 * m2 / r²
                // Acceleration on A: a = F / m1 = G * m2 / r²
                const forceMag = PHYSICS.G / distSq;

                // Normalized direction
                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;

                // Apply acceleration to body A (towards B)
                bodyA.acceleration.x += forceMag * bodyB.mass * nx;
                bodyA.acceleration.y += forceMag * bodyB.mass * ny;
                bodyA.acceleration.z += forceMag * bodyB.mass * nz;

                // Apply acceleration to body B (towards A) - Newton's 3rd law
                bodyB.acceleration.x -= forceMag * bodyA.mass * nx;
                bodyB.acceleration.y -= forceMag * bodyA.mass * ny;
                bodyB.acceleration.z -= forceMag * bodyA.mass * nz;
            }
        }
    }

    /**
     * Update small objects - they experience gravity from celestial bodies
     */
    updateSmallObjects(dt) {
        for (const obj of this.smallObjects) {
            // Calculate gravitational acceleration from all celestial bodies
            let ax = 0, ay = 0, az = 0;

            for (const body of this.bodies) {
                const dx = body.position.x - obj.position.x;
                const dy = body.position.y - obj.position.y;
                const dz = body.position.z - obj.position.z;

                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);

                // Check if object is on/near surface
                const surfaceRadius = body.radius || 0;
                if (dist < surfaceRadius * 1.001) {
                    // Object is on surface - apply surface gravity and friction
                    obj.isGrounded = true;
                    obj.groundedOn = body;
                    
                    // Surface gravity: g = G * M / r²
                    const surfaceGravity = PHYSICS.G * body.mass / (surfaceRadius * surfaceRadius);
                    
                    // Apply gravity towards center
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const nz = dz / dist;
                    
                    // Only apply gravity component (object stays on surface)
                    ax += surfaceGravity * nx;
                    ay += surfaceGravity * ny;
                    az += surfaceGravity * nz;
                    
                    // Keep object on surface
                    const altitude = dist - surfaceRadius;
                    if (altitude < 0) {
                        obj.position.x = body.position.x - nx * surfaceRadius;
                        obj.position.y = body.position.y - ny * surfaceRadius;
                        obj.position.z = body.position.z - nz * surfaceRadius;
                        
                        // Cancel velocity component towards surface
                        const vDotN = obj.velocity.x * nx + obj.velocity.y * ny + obj.velocity.z * nz;
                        if (vDotN < 0) {
                            obj.velocity.x -= vDotN * nx;
                            obj.velocity.y -= vDotN * ny;
                            obj.velocity.z -= vDotN * nz;
                        }
                    }
                } else {
                    obj.isGrounded = false;
                    obj.groundedOn = null;
                    
                    // Normal gravitational acceleration
                    const forceMag = PHYSICS.G * body.mass / distSq;
                    ax += forceMag * dx / dist;
                    ay += forceMag * dy / dist;
                    az += forceMag * dz / dist;
                }
            }

            // Simple Euler integration for small objects (they're less critical)
            obj.velocity.x += ax * dt;
            obj.velocity.y += ay * dt;
            obj.velocity.z += az * dt;

            obj.position.x += obj.velocity.x * dt;
            obj.position.y += obj.velocity.y * dt;
            obj.position.z += obj.velocity.z * dt;

            // Apply friction if grounded
            if (obj.isGrounded) {
                const friction = 0.98;
                obj.velocity.x *= friction;
                obj.velocity.y *= friction;
                obj.velocity.z *= friction;
            }
        }
    }

    /**
     * Handle collisions between celestial bodies
     */
    handleCollisions() {
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                const minDist = (bodyA.radius || 0) + (bodyB.radius || 0);

                if (dist < minDist && dist > 0) {
                    // Collision detected!
                    logger.warn(`Collision detected: ${bodyA.name} and ${bodyB.name}`);

                    // Separate the bodies
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const nz = dz / dist;

                    const totalMass = bodyA.mass + bodyB.mass;
                    const ratioA = bodyB.mass / totalMass;
                    const ratioB = bodyA.mass / totalMass;

                    bodyA.position.x -= nx * overlap * ratioA;
                    bodyA.position.y -= ny * overlap * ratioA;
                    bodyA.position.z -= nz * overlap * ratioA;

                    bodyB.position.x += nx * overlap * ratioB;
                    bodyB.position.y += ny * overlap * ratioB;
                    bodyB.position.z += nz * overlap * ratioB;

                    // Elastic collision response
                    const relVelX = bodyB.velocity.x - bodyA.velocity.x;
                    const relVelY = bodyB.velocity.y - bodyA.velocity.y;
                    const relVelZ = bodyB.velocity.z - bodyA.velocity.z;

                    const relVelDotN = relVelX * nx + relVelY * ny + relVelZ * nz;

                    if (relVelDotN < 0) {
                        const restitution = 0.5; // Coefficient of restitution
                        const impulse = -(1 + restitution) * relVelDotN / (1 / bodyA.mass + 1 / bodyB.mass);

                        bodyA.velocity.x -= impulse / bodyA.mass * nx;
                        bodyA.velocity.y -= impulse / bodyA.mass * ny;
                        bodyA.velocity.z -= impulse / bodyA.mass * nz;

                        bodyB.velocity.x += impulse / bodyB.mass * nx;
                        bodyB.velocity.y += impulse / bodyB.mass * ny;
                        bodyB.velocity.z += impulse / bodyB.mass * nz;
                    }
                }
            }
        }
    }

    /**
     * Calculate the gravitational acceleration at a specific point
     * Useful for player physics
     */
    getGravityAt(position) {
        let ax = 0, ay = 0, az = 0;

        for (const body of this.bodies) {
            const dx = body.position.x - position.x;
            const dy = body.position.y - position.y;
            const dz = body.position.z - position.z;

            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);

            const forceMag = PHYSICS.G * body.mass / distSq;
            ax += forceMag * dx / dist;
            ay += forceMag * dy / dist;
            az += forceMag * dz / dist;
        }

        return { x: ax, y: ay, z: az };
    }

    /**
     * Find the nearest celestial body to a position
     */
    getNearestBody(position) {
        let nearest = null;
        let minDist = Infinity;

        for (const body of this.bodies) {
            const dx = body.position.x - position.x;
            const dy = body.position.y - position.y;
            const dz = body.position.z - position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < minDist) {
                minDist = dist;
                nearest = body;
            }
        }

        return { body: nearest, distance: minDist };
    }

    /**
     * Get the surface normal at a position relative to a body
     */
    getSurfaceNormal(body, position) {
        const dx = position.x - body.position.x;
        const dy = position.y - body.position.y;
        const dz = position.z - body.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return {
            x: dx / dist,
            y: dy / dist,
            z: dz / dist,
        };
    }

    /**
     * Get altitude above a body's surface
     */
    getAltitude(body, position) {
        const dx = position.x - body.position.x;
        const dy = position.y - body.position.y;
        const dz = position.z - body.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return dist - (body.radius || 0);
    }

    /**
     * Calculate orbital parameters for a body
     */
    getOrbitalParameters(body, centralBody) {
        const dx = body.position.x - centralBody.position.x;
        const dy = body.position.y - centralBody.position.y;
        const dz = body.position.z - centralBody.position.z;
        const r = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const vx = body.velocity.x - centralBody.velocity.x;
        const vy = body.velocity.y - centralBody.velocity.y;
        const vz = body.velocity.z - centralBody.velocity.z;
        const v = Math.sqrt(vx * vx + vy * vy + vz * vz);

        const mu = PHYSICS.G * centralBody.mass;

        // Specific orbital energy
        const energy = (v * v) / 2 - mu / r;

        // Semi-major axis
        const a = -mu / (2 * energy);

        // Angular momentum vector (h = r × v)
        const hx = dy * vz - dz * vy;
        const hy = dz * vx - dx * vz;
        const hz = dx * vy - dy * vx;
        const h = Math.sqrt(hx * hx + hy * hy + hz * hz);

        // Eccentricity
        const e = Math.sqrt(1 + (2 * energy * h * h) / (mu * mu));

        // Orbital period
        const T = 2 * Math.PI * Math.sqrt((a * a * a) / mu);

        return {
            semiMajorAxis: a,
            eccentricity: e,
            period: T,
            specificEnergy: energy,
            angularMomentum: h,
            distance: r,
            velocity: v,
        };
    }

    /**
     * Pause/resume physics
     */
    setPaused(paused) {
        this.isPaused = paused;
        logger.info(`Physics ${paused ? 'paused' : 'resumed'}`);
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(PHYSICS.minTimeScale, Math.min(PHYSICS.maxTimeScale, scale));
        configManager.set('PHYSICS.timeScale', this.timeScale);
    }

    /**
     * Format simulation time for display
     */
    formatTime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        
        if (days > 365) {
            const years = (days / 365).toFixed(2);
            return `${years} years`;
        } else if (days > 0) {
            return `${days}d ${hours}h`;
        } else if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m ${Math.floor(seconds % 60)}s`;
        }
    }

    /**
     * Get physics metrics for debug display
     */
    getMetrics() {
        return {
            ...this.metrics,
            timeScale: this.timeScale,
            simulatedTime: this.totalSimulatedTime,
            formattedTime: this.formatTime(this.totalSimulatedTime),
            isPaused: this.isPaused,
        };
    }

    /**
     * Calculate total system energy (for validation)
     */
    getTotalEnergy() {
        let kineticEnergy = 0;
        let potentialEnergy = 0;

        for (const body of this.bodies) {
            // Kinetic energy: 0.5 * m * v²
            const v2 = body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2;
            kineticEnergy += 0.5 * body.mass * v2;
        }

        // Potential energy between all pairs
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const dx = this.bodies[j].position.x - this.bodies[i].position.x;
                const dy = this.bodies[j].position.y - this.bodies[i].position.y;
                const dz = this.bodies[j].position.z - this.bodies[i].position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // U = -G * m1 * m2 / r
                potentialEnergy -= PHYSICS.G * this.bodies[i].mass * this.bodies[j].mass / dist;
            }
        }

        return {
            kinetic: kineticEnergy,
            potential: potentialEnergy,
            total: kineticEnergy + potentialEnergy,
        };
    }
}
