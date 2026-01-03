/**
 * PHYSICS ENGINE
 * N-Body gravitational simulation with multiple integration methods.
 * Handles celestial bodies, player, and interactive objects.
 */

class PhysicsEngine {
    constructor(config) {
        this.config = config;
        this.G = config.simulation.gravitationalConstant;
        this.bodies = [];
        this.timeScale = config.simulation.timeScale;
        this.substeps = config.simulation.physicsSubsteps;
        
        // Performance tracking
        this.lastPhysicsTime = 0;
    }

    /**
     * Register a physics body
     */
    addBody(body) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
        }
    }

    /**
     * Remove a physics body
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Main physics update loop
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        // Apply time scale
        const scaledDelta = deltaTime * this.timeScale;
        
        // Use substeps for stability
        const substepDelta = scaledDelta / this.substeps;
        
        for (let i = 0; i < this.substeps; i++) {
            this.updateStep(substepDelta);
        }
        
        this.lastPhysicsTime = performance.now() - startTime;
    }

    /**
     * Single physics step
     */
    updateStep(dt) {
        // Calculate all gravitational forces
        this.calculateGravitationalForces();
        
        // Integrate motion based on method
        switch (this.config.simulation.integrationMethod) {
            case 'verlet':
                this.integrateVerlet(dt);
                break;
            case 'rk4':
                this.integrateRK4(dt);
                break;
            case 'euler':
            default:
                this.integrateEuler(dt);
                break;
        }
    }

    /**
     * Calculate gravitational forces between all bodies (N-body problem)
     */
    calculateGravitationalForces() {
        // Reset forces
        for (let body of this.bodies) {
            if (body.physicsEnabled) {
                body.force.set(0, 0, 0);
            }
        }

        // Calculate pairwise forces
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            if (!bodyA.physicsEnabled) continue;

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];
                if (!bodyB.physicsEnabled) continue;

                // Calculate gravitational force
                const force = this.calculateGravityBetween(bodyA, bodyB);
                
                // Apply equal and opposite forces
                bodyA.force.add(force);
                bodyB.force.sub(force);
            }
        }
    }

    /**
     * Calculate gravitational force between two bodies
     * F = G * m1 * m2 / r^2
     */
    calculateGravityBetween(bodyA, bodyB) {
        const direction = new THREE.Vector3();
        direction.subVectors(bodyB.position, bodyA.position);
        
        const distanceSquared = direction.lengthSq();
        const distance = Math.sqrt(distanceSquared);
        
        // Avoid division by zero and extreme forces at very close distances
        const minDistance = Math.max(bodyA.radius + bodyB.radius, 1);
        const safeDist = Math.max(distance, minDistance);
        const safeDistSq = safeDist * safeDist;
        
        // F = G * m1 * m2 / r^2
        const forceMagnitude = this.G * bodyA.mass * bodyB.mass / safeDistSq;
        
        // Normalize direction and apply magnitude
        direction.normalize();
        direction.multiplyScalar(forceMagnitude);
        
        return direction;
    }

    /**
     * Euler integration (simple but less stable)
     */
    integrateEuler(dt) {
        for (let body of this.bodies) {
            if (!body.physicsEnabled || body.isStatic) continue;

            // a = F / m
            const acceleration = body.force.clone().divideScalar(body.mass);
            
            // v += a * dt
            body.velocity.addScaledVector(acceleration, dt);
            
            // p += v * dt
            body.position.addScaledVector(body.velocity, dt);
            
            // Update mesh position if exists
            if (body.mesh) {
                body.mesh.position.copy(body.position);
            }
        }
    }

    /**
     * Verlet integration (better energy conservation)
     */
    integrateVerlet(dt) {
        for (let body of this.bodies) {
            if (!body.physicsEnabled || body.isStatic) continue;

            // Store previous position
            if (!body.previousPosition) {
                body.previousPosition = body.position.clone();
            }

            // a = F / m
            const acceleration = body.force.clone().divideScalar(body.mass);
            
            // Calculate new position using Verlet
            // x_new = 2*x - x_old + a*dt^2
            const newPosition = new THREE.Vector3();
            newPosition.copy(body.position)
                .multiplyScalar(2)
                .sub(body.previousPosition)
                .addScaledVector(acceleration, dt * dt);
            
            // Calculate velocity from position difference
            body.velocity.subVectors(newPosition, body.previousPosition)
                .divideScalar(2 * dt);
            
            // Update positions
            body.previousPosition.copy(body.position);
            body.position.copy(newPosition);
            
            // Update mesh position if exists
            if (body.mesh) {
                body.mesh.position.copy(body.position);
            }
        }
    }

    /**
     * Runge-Kutta 4th order integration (most accurate but slower)
     */
    integrateRK4(dt) {
        for (let body of this.bodies) {
            if (!body.physicsEnabled || body.isStatic) continue;

            const mass = body.mass;
            const p0 = body.position.clone();
            const v0 = body.velocity.clone();
            
            // k1
            const a1 = body.force.clone().divideScalar(mass);
            const k1v = a1.clone().multiplyScalar(dt);
            const k1p = v0.clone().multiplyScalar(dt);
            
            // k2
            const p2 = p0.clone().addScaledVector(k1p, 0.5);
            const v2 = v0.clone().addScaledVector(k1v, 0.5);
            const a2 = this.calculateAccelerationAt(body, p2).multiplyScalar(dt);
            const k2v = a2;
            const k2p = v2.clone().multiplyScalar(dt);
            
            // k3
            const p3 = p0.clone().addScaledVector(k2p, 0.5);
            const v3 = v0.clone().addScaledVector(k2v, 0.5);
            const a3 = this.calculateAccelerationAt(body, p3).multiplyScalar(dt);
            const k3v = a3;
            const k3p = v3.clone().multiplyScalar(dt);
            
            // k4
            const p4 = p0.clone().add(k3p);
            const v4 = v0.clone().add(k3v);
            const a4 = this.calculateAccelerationAt(body, p4).multiplyScalar(dt);
            const k4v = a4;
            const k4p = v4.clone().multiplyScalar(dt);
            
            // Combine
            body.velocity.add(k1v.add(k2v.multiplyScalar(2)).add(k3v.multiplyScalar(2)).add(k4v).divideScalar(6));
            body.position.add(k1p.add(k2p.multiplyScalar(2)).add(k3p.multiplyScalar(2)).add(k4p).divideScalar(6));
            
            // Update mesh position if exists
            if (body.mesh) {
                body.mesh.position.copy(body.position);
            }
        }
    }

    /**
     * Calculate acceleration at a specific position (for RK4)
     */
    calculateAccelerationAt(targetBody, position) {
        const totalForce = new THREE.Vector3();
        
        for (let body of this.bodies) {
            if (body === targetBody || !body.physicsEnabled) continue;
            
            const direction = new THREE.Vector3();
            direction.subVectors(body.position, position);
            
            const distanceSquared = direction.lengthSq();
            const distance = Math.sqrt(distanceSquared);
            
            const minDistance = Math.max(body.radius + targetBody.radius, 1);
            const safeDist = Math.max(distance, minDistance);
            const safeDistSq = safeDist * safeDist;
            
            const forceMagnitude = this.G * body.mass / safeDistSq;
            
            direction.normalize();
            direction.multiplyScalar(forceMagnitude);
            
            totalForce.add(direction);
        }
        
        return totalForce;
    }

    /**
     * Calculate gravity at a specific point (for player/objects)
     */
    getGravityAtPoint(position, excludeBody = null) {
        const gravity = new THREE.Vector3();
        
        for (let body of this.bodies) {
            if (body === excludeBody || !body.physicsEnabled) continue;
            
            const direction = new THREE.Vector3();
            direction.subVectors(body.position, position);
            
            const distanceSquared = direction.lengthSq();
            const distance = Math.sqrt(distanceSquared);
            
            // Use body radius as minimum safe distance
            const minDistance = body.radius;
            const safeDist = Math.max(distance, minDistance);
            const safeDistSq = safeDist * safeDist;
            
            // g = G * M / r^2
            const gravityMagnitude = this.G * body.mass / safeDistSq;
            
            direction.normalize();
            direction.multiplyScalar(gravityMagnitude);
            
            gravity.add(direction);
        }
        
        return gravity;
    }

    /**
     * Find the nearest celestial body to a point
     */
    getNearestBody(position, type = null) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (let body of this.bodies) {
            if (type && body.type !== type) continue;
            
            const distance = body.position.distanceTo(position);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = body;
            }
        }
        
        return { body: nearest, distance: minDistance };
    }

    /**
     * Check if a point is on the surface of a body
     */
    isOnSurface(position, body, tolerance = 100) {
        const distance = position.distanceTo(body.position);
        return Math.abs(distance - body.radius) < tolerance;
    }

    /**
     * Get surface normal at a point on a body
     */
    getSurfaceNormal(position, body) {
        const normal = new THREE.Vector3();
        normal.subVectors(position, body.position);
        normal.normalize();
        return normal;
    }

    /**
     * Apply impulse to a body
     */
    applyImpulse(body, impulse) {
        if (!body.physicsEnabled || body.isStatic) return;
        
        // Change in velocity = impulse / mass
        const deltaV = impulse.clone().divideScalar(body.mass);
        body.velocity.add(deltaV);
    }

    /**
     * Apply force to a body (accumulates until next physics step)
     */
    applyForce(body, force) {
        if (!body.physicsEnabled || body.isStatic) return;
        
        body.force.add(force);
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            physicsTime: this.lastPhysicsTime,
            bodyCount: this.bodies.length,
            substeps: this.substeps,
            timeScale: this.timeScale,
        };
    }

    /**
     * Debug: Log system state
     */
    logSystemState() {
        console.log('=== PHYSICS SYSTEM STATE ===');
        console.log(`Bodies: ${this.bodies.length}`);
        console.log(`Time Scale: ${this.timeScale}`);
        console.log(`Integration: ${this.config.simulation.integrationMethod}`);
        
        for (let body of this.bodies) {
            if (body.name) {
                console.log(`${body.name}:`);
                console.log(`  Position: ${body.position.toArray().map(v => v.toExponential(2))}`);
                console.log(`  Velocity: ${body.velocity.toArray().map(v => v.toExponential(2))}`);
                console.log(`  Speed: ${body.velocity.length().toExponential(2)} m/s`);
            }
        }
    }
}

/**
 * Physics body base class
 */
class PhysicsBody {
    constructor(config = {}) {
        this.name = config.name || 'PhysicsBody';
        this.type = config.type || 'generic';
        
        // Physical properties
        this.mass = config.mass || 1;
        this.radius = config.radius || 1;
        
        // State
        this.position = config.position ? new THREE.Vector3(...config.position) : new THREE.Vector3();
        this.velocity = config.velocity ? new THREE.Vector3(...config.velocity) : new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.previousPosition = this.position.clone();
        
        // Flags
        this.physicsEnabled = config.physicsEnabled !== false;
        this.isStatic = config.isStatic || false;
        
        // Reference to 3D mesh
        this.mesh = null;
    }

    /**
     * Update rotation based on angular velocity
     */
    updateRotation(dt) {
        if (this.mesh && this.rotationSpeed) {
            this.mesh.rotation.y += this.rotationSpeed * dt;
        }
    }
}
