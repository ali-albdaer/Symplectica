/**
 * Physics Engine - N-Body Gravitational Simulation
 * Handles gravitational interactions between all bodies
 * Uses Velocity Verlet integration for stability
 */

class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.timeScale = CONFIG.PHYSICS.TIME_SCALE;
        this.G = CONFIG.PHYSICS.GRAVITATIONAL_CONSTANT;
        this.substeps = CONFIG.PHYSICS.INTEGRATION_SUBSTEPS;
        this.minDistanceSqr = CONFIG.PHYSICS.MIN_DISTANCE_SQR;
        
        // Cache for forces to avoid allocations
        this.forceCache = new Map();
    }

    /**
     * Register a body in the physics simulation
     */
    addBody(body) {
        if (!body.mass || !body.position || !body.velocity) {
            console.error('Invalid body added to physics:', body);
            return;
        }
        
        this.bodies.push(body);
        this.forceCache.set(body.id, new THREE.Vector3());
        
        console.log(`Physics: Added body "${body.name}" (mass: ${body.mass.toExponential(2)} kg)`);
    }

    /**
     * Remove a body from simulation
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
            this.forceCache.delete(body.id);
        }
    }

    /**
     * Calculate gravitational force between two bodies
     * F = G * m1 * m2 / r^2
     */
    calculateGravitationalForce(body1, body2, resultVector) {
        // Vector from body1 to body2
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        
        // Distance squared
        let distSqr = dx * dx + dy * dy + dz * dz;
        
        // Prevent singularities
        if (distSqr < this.minDistanceSqr) {
            distSqr = this.minDistanceSqr;
        }
        
        const dist = Math.sqrt(distSqr);
        
        // Force magnitude: F = G * m1 * m2 / r^2
        const forceMagnitude = (this.G * body1.mass * body2.mass) / distSqr;
        
        // Force direction (normalized)
        const forceX = (dx / dist) * forceMagnitude;
        const forceY = (dy / dist) * forceMagnitude;
        const forceZ = (dz / dist) * forceMagnitude;
        
        resultVector.set(forceX, forceY, forceZ);
        
        return forceMagnitude;
    }

    /**
     * Calculate net force on a body from all other bodies
     */
    calculateNetForce(body, resultVector) {
        resultVector.set(0, 0, 0);
        const tempForce = new THREE.Vector3();
        
        for (const otherBody of this.bodies) {
            if (otherBody === body) continue;
            
            this.calculateGravitationalForce(body, otherBody, tempForce);
            resultVector.add(tempForce);
        }
        
        return resultVector;
    }

    /**
     * Update physics simulation
     * Uses Velocity Verlet integration for better stability
     * dt is in real seconds, scaled by TIME_SCALE
     */
    update(dt) {
        if (this.bodies.length === 0) return;
        
        const scaledDt = dt * this.timeScale;
        const substepDt = scaledDt / this.substeps;
        
        // Perform multiple substeps for stability
        for (let substep = 0; substep < this.substeps; substep++) {
            this.integrateStep(substepDt);
        }
    }

    /**
     * Single integration step using Velocity Verlet
     */
    integrateStep(dt) {
        const halfDt = dt * 0.5;
        const tempForce = new THREE.Vector3();
        
        // Calculate current accelerations
        const accelerations = new Map();
        
        for (const body of this.bodies) {
            if (body.fixed) {
                // Fixed bodies (like player when on ground) don't move
                accelerations.set(body.id, new THREE.Vector3(0, 0, 0));
                continue;
            }
            
            const netForce = this.forceCache.get(body.id);
            this.calculateNetForce(body, netForce);
            
            // a = F / m
            const acceleration = new THREE.Vector3(
                netForce.x / body.mass,
                netForce.y / body.mass,
                netForce.z / body.mass
            );
            
            accelerations.set(body.id, acceleration);
        }
        
        // Update positions and velocities (Velocity Verlet)
        for (const body of this.bodies) {
            if (body.fixed) continue;
            
            const acc = accelerations.get(body.id);
            
            // x(t + dt) = x(t) + v(t) * dt + 0.5 * a(t) * dt^2
            body.position.x += body.velocity.x * dt + 0.5 * acc.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * acc.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * acc.z * dt * dt;
            
            // v(t + dt) = v(t) + a(t) * dt
            // (We'll do a second half-step after recalculating forces for better accuracy)
            body.velocity.x += acc.x * halfDt;
            body.velocity.y += acc.y * halfDt;
            body.velocity.z += acc.z * halfDt;
        }
        
        // Recalculate forces for second half of Verlet
        for (const body of this.bodies) {
            if (body.fixed) continue;
            
            const netForce = this.forceCache.get(body.id);
            this.calculateNetForce(body, netForce);
            
            const acc = new THREE.Vector3(
                netForce.x / body.mass,
                netForce.y / body.mass,
                netForce.z / body.mass
            );
            
            // Complete velocity update
            body.velocity.x += acc.x * halfDt;
            body.velocity.y += acc.y * halfDt;
            body.velocity.z += acc.z * halfDt;
        }
    }

    /**
     * Apply an impulse force to a body
     */
    applyImpulse(body, impulseVector) {
        // Impulse changes velocity directly: Δv = J / m
        body.velocity.x += impulseVector.x / body.mass;
        body.velocity.y += impulseVector.y / body.mass;
        body.velocity.z += impulseVector.z / body.mass;
    }

    /**
     * Check collision between sphere bodies
     */
    checkSphereCollision(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        const distSqr = dx * dx + dy * dy + dz * dz;
        
        const minDist = body1.radius + body2.radius;
        const minDistSqr = minDist * minDist;
        
        return distSqr < minDistSqr;
    }

    /**
     * Resolve collision between two bodies
     */
    resolveCollision(body1, body2) {
        // Calculate collision normal
        const normal = new THREE.Vector3(
            body2.position.x - body1.position.x,
            body2.position.y - body1.position.y,
            body2.position.z - body1.position.z
        ).normalize();
        
        // Relative velocity
        const relVel = new THREE.Vector3(
            body1.velocity.x - body2.velocity.x,
            body1.velocity.y - body2.velocity.y,
            body1.velocity.z - body2.velocity.z
        );
        
        // Velocity along collision normal
        const velAlongNormal = relVel.dot(normal);
        
        // Don't resolve if velocities are separating
        if (velAlongNormal > 0) return;
        
        // Calculate impulse scalar
        const e = CONFIG.PHYSICS.COLLISION_ELASTICITY;
        const j = -(1 + e) * velAlongNormal / (1 / body1.mass + 1 / body2.mass);
        
        // Apply impulse
        const impulse = normal.multiplyScalar(j);
        
        body1.velocity.x += impulse.x / body1.mass;
        body1.velocity.y += impulse.y / body1.mass;
        body1.velocity.z += impulse.z / body1.mass;
        
        body2.velocity.x -= impulse.x / body2.mass;
        body2.velocity.y -= impulse.y / body2.mass;
        body2.velocity.z -= impulse.z / body2.mass;
        
        // Separate bodies to prevent overlap
        const overlap = (body1.radius + body2.radius) - Math.sqrt(
            Math.pow(body2.position.x - body1.position.x, 2) +
            Math.pow(body2.position.y - body1.position.y, 2) +
            Math.pow(body2.position.z - body1.position.z, 2)
        );
        
        if (overlap > 0) {
            const separation = normal.clone().multiplyScalar(overlap * 0.5);
            
            body1.position.x -= separation.x;
            body1.position.y -= separation.y;
            body1.position.z -= separation.z;
            
            body2.position.x += separation.x;
            body2.position.y += separation.y;
            body2.position.z += separation.z;
        }
    }

    /**
     * Get the nearest celestial body to a position
     */
    getNearestCelestialBody(position) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const body of this.bodies) {
            if (!body.isCelestial) continue;
            
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
     * Check if a position is on the surface of a celestial body
     */
    isOnSurface(position, body, tolerance = 1.0) {
        const dx = position.x - body.position.x;
        const dy = position.y - body.position.y;
        const dz = position.z - body.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return Math.abs(dist - body.radius) < tolerance;
    }

    /**
     * Get surface normal at a position on a spherical body
     */
    getSurfaceNormal(position, body) {
        const normal = new THREE.Vector3(
            position.x - body.position.x,
            position.y - body.position.y,
            position.z - body.position.z
        );
        return normal.normalize();
    }
}
