/**
 * PHYSICS ENGINE
 * N-body gravitational simulation with accurate force calculations
 * All bodies interact with each other including player and objects
 */

class PhysicsEngine {
    constructor(config) {
        this.config = config;
        this.G = config.physics.G;
        this.timeScale = config.physics.timeScale;
        this.bodies = [];
        this.minDistance = config.physics.minDistance;
    }

    /**
     * Register a physics body
     */
    registerBody(body) {
        if (!this.bodies.includes(body)) {
            this.bodies.push(body);
            console.log(`[PHYSICS] Registered body: ${body.name || 'Unnamed'} (mass: ${body.mass.toExponential(2)} kg)`);
        }
    }

    /**
     * Unregister a physics body
     */
    unregisterBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    /**
     * Calculate gravitational force between two bodies
     * F = G * m1 * m2 / r²
     */
    calculateGravitationalForce(body1, body2) {
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const distance = Math.sqrt(distanceSquared);
        
        // Prevent singularities at very close distances
        if (distance < this.minDistance) {
            return { x: 0, y: 0, z: 0, distance: 0 };
        }
        
        // F = G * m1 * m2 / r²
        const forceMagnitude = this.G * body1.mass * body2.mass / distanceSquared;
        
        // Normalize direction and scale by force
        const forceX = (dx / distance) * forceMagnitude;
        const forceY = (dy / distance) * forceMagnitude;
        const forceZ = (dz / distance) * forceMagnitude;
        
        return { 
            x: forceX, 
            y: forceY, 
            z: forceZ,
            distance: distance 
        };
    }

    /**
     * Update all bodies using N-body gravitational simulation
     * Uses semi-implicit Euler integration (symplectic)
     */
    update(deltaTime) {
        const dt = deltaTime * this.timeScale;
        const substeps = this.config.physics.integrationSteps;
        const subDt = dt / substeps;

        for (let step = 0; step < substeps; step++) {
            // Calculate forces for all bodies
            const forces = new Map();
            
            for (let i = 0; i < this.bodies.length; i++) {
                forces.set(this.bodies[i], { x: 0, y: 0, z: 0 });
            }

            // N-body interaction - all bodies affect each other
            for (let i = 0; i < this.bodies.length; i++) {
                for (let j = i + 1; j < this.bodies.length; j++) {
                    const body1 = this.bodies[i];
                    const body2 = this.bodies[j];
                    
                    // Skip if either body is fixed in space
                    if (body1.fixed && body2.fixed) continue;
                    
                    const force = this.calculateGravitationalForce(body1, body2);
                    
                    // Apply equal and opposite forces (Newton's 3rd law)
                    if (!body1.fixed) {
                        const f1 = forces.get(body1);
                        f1.x += force.x;
                        f1.y += force.y;
                        f1.z += force.z;
                    }
                    
                    if (!body2.fixed) {
                        const f2 = forces.get(body2);
                        f2.x -= force.x;
                        f2.y -= force.y;
                        f2.z -= force.z;
                    }
                }
            }

            // Update velocities and positions (Semi-implicit Euler)
            for (let i = 0; i < this.bodies.length; i++) {
                const body = this.bodies[i];
                
                if (body.fixed) continue;
                
                const force = forces.get(body);
                
                // a = F / m
                const ax = force.x / body.mass;
                const ay = force.y / body.mass;
                const az = force.z / body.mass;
                
                // Update velocity: v = v + a * dt
                body.velocity.x += ax * subDt;
                body.velocity.y += ay * subDt;
                body.velocity.z += az * subDt;
                
                // Update position: p = p + v * dt
                body.position.x += body.velocity.x * subDt;
                body.position.y += body.velocity.y * subDt;
                body.position.z += body.velocity.z * subDt;
            }
        }
    }

    /**
     * Get gravitational acceleration at a point in space
     * Useful for player movement
     */
    getGravityAtPoint(position, excludeBody = null) {
        let ax = 0, ay = 0, az = 0;
        
        for (const body of this.bodies) {
            if (body === excludeBody) continue;
            
            const dx = body.position.x - position.x;
            const dy = body.position.y - position.y;
            const dz = body.position.z - position.z;
            
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            const distance = Math.sqrt(distanceSquared);
            
            if (distance < this.minDistance) continue;
            
            // a = G * M / r²
            const acceleration = this.G * body.mass / distanceSquared;
            
            ax += (dx / distance) * acceleration;
            ay += (dy / distance) * acceleration;
            az += (dz / distance) * acceleration;
        }
        
        return { x: ax, y: ay, z: az };
    }

    /**
     * Check if a sphere collides with any body
     */
    checkSphereCollision(position, radius) {
        for (const body of this.bodies) {
            if (!body.mesh) continue;
            
            const dx = position.x - body.position.x;
            const dy = position.y - body.position.y;
            const dz = position.z - body.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            const collisionDistance = radius + (body.radius || body.displayRadius || 1);
            
            if (distance < collisionDistance) {
                return {
                    collided: true,
                    body: body,
                    distance: distance,
                    normal: {
                        x: dx / distance,
                        y: dy / distance,
                        z: dz / distance
                    }
                };
            }
        }
        
        return { collided: false };
    }

    /**
     * Get the nearest celestial body to a position
     */
    getNearestBody(position) {
        let nearest = null;
        let minDistance = Infinity;
        
        for (const body of this.bodies) {
            if (!body.isCelestial) continue;
            
            const dx = position.x - body.position.x;
            const dy = position.y - body.position.y;
            const dz = position.z - body.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearest = body;
            }
        }
        
        return { body: nearest, distance: minDistance };
    }

    /**
     * Apply an impulse force to a body
     */
    applyImpulse(body, impulse) {
        if (body.fixed) return;
        
        body.velocity.x += impulse.x / body.mass;
        body.velocity.y += impulse.y / body.mass;
        body.velocity.z += impulse.z / body.mass;
    }

    /**
     * Set time scale for speeding up or slowing down simulation
     */
    setTimeScale(scale) {
        this.timeScale = scale;
        this.config.physics.timeScale = scale;
        console.log(`[PHYSICS] Time scale set to: ${scale}x`);
    }

    /**
     * Get total system energy (for debugging orbital stability)
     */
    getTotalEnergy() {
        let kineticEnergy = 0;
        let potentialEnergy = 0;
        
        // Kinetic energy: KE = 0.5 * m * v²
        for (const body of this.bodies) {
            const vSquared = body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2;
            kineticEnergy += 0.5 * body.mass * vSquared;
        }
        
        // Gravitational potential energy: PE = -G * m1 * m2 / r
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const b1 = this.bodies[i];
                const b2 = this.bodies[j];
                
                const dx = b2.position.x - b1.position.x;
                const dy = b2.position.y - b1.position.y;
                const dz = b2.position.z - b1.position.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > this.minDistance) {
                    potentialEnergy -= this.G * b1.mass * b2.mass / distance;
                }
            }
        }
        
        return {
            kinetic: kineticEnergy,
            potential: potentialEnergy,
            total: kineticEnergy + potentialEnergy
        };
    }

    /**
     * Reset all bodies to their initial state
     */
    reset() {
        console.log('[PHYSICS] Resetting all bodies...');
        this.bodies = [];
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PhysicsEngine };
}
