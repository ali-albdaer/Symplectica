/**
 * Solar System Simulation - Physics Engine
 * =========================================
 * N-body gravitational physics simulation using Velocity Verlet integration.
 * Handles celestial bodies and interactive objects with the same physics rules.
 */

class PhysicsEngine {
    constructor() {
        this.bodies = [];           // Celestial bodies (sun, planets, moons)
        this.objects = [];          // Interactive objects
        this.player = null;         // Player reference
        this.G = Config.physics.G;
        this.softening = Config.physics.softening;
        this.minDistance = Config.physics.minDistance;
        this.paused = false;
        this.accumulator = 0;
        this.simulationTime = 0;
        
        // Performance tracking
        this.lastUpdateTime = 0;
        this.physicsTime = 0;
        
        // Scale factors for simulation
        this.distanceScale = Config.scale.distance;
        this.timeScale = Config.scale.timeScale;
        
        Logger.info('Physics engine initialized');
    }
    
    /**
     * Register a celestial body
     */
    addBody(body) {
        this.bodies.push(body);
        Logger.debug(`Added celestial body: ${body.name}`);
    }
    
    /**
     * Register an interactive object
     */
    addObject(obj) {
        this.objects.push(obj);
    }
    
    /**
     * Remove an object
     */
    removeObject(obj) {
        const index = this.objects.indexOf(obj);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
    
    /**
     * Set player reference
     */
    setPlayer(player) {
        this.player = player;
    }
    
    /**
     * Main physics update - uses fixed timestep with accumulator
     */
    update(deltaTime) {
        if (this.paused || Config.debug.physicsPaused) return;
        
        const startTime = performance.now();
        
        // Apply time scale
        const scaledDelta = deltaTime * this.timeScale;
        const fixedDt = Config.physics.fixedDeltaTime;
        const maxSubsteps = Config.physics.maxSubsteps;
        
        this.accumulator += scaledDelta;
        
        let steps = 0;
        while (this.accumulator >= fixedDt && steps < maxSubsteps) {
            this.fixedUpdate(fixedDt);
            this.accumulator -= fixedDt;
            this.simulationTime += fixedDt;
            steps++;
        }
        
        // Interpolation factor for rendering
        const alpha = this.accumulator / fixedDt;
        
        this.physicsTime = performance.now() - startTime;
        
        return alpha;
    }
    
    /**
     * Fixed timestep physics update
     */
    fixedUpdate(dt) {
        // Update celestial bodies (N-body)
        this.updateCelestialBodies(dt);
        
        // Update interactive objects
        if (Config.physics.microPhysicsEnabled) {
            this.updateInteractiveObjects(dt);
        }
        
        // Update player physics
        if (this.player) {
            this.updatePlayerPhysics(dt);
        }
    }
    
    /**
     * N-body gravitational simulation for celestial bodies
     * Uses Velocity Verlet integration for stability
     */
    updateCelestialBodies(dt) {
        const bodies = this.bodies;
        const n = bodies.length;
        
        // Skip sun (index 0) as it's stationary at center
        // In a more advanced simulation, sun would also move
        
        // Store accelerations
        for (let i = 0; i < n; i++) {
            bodies[i].prevAcceleration = bodies[i].acceleration.clone();
        }
        
        // Calculate new accelerations from gravitational forces
        this.calculateGravitationalAccelerations();
        
        // Velocity Verlet integration
        for (let i = 1; i < n; i++) { // Skip sun (index 0)
            const body = bodies[i];
            
            // Update velocity using average of old and new acceleration
            // v(t+dt) = v(t) + 0.5 * (a(t) + a(t+dt)) * dt
            body.velocity.x += 0.5 * (body.prevAcceleration.x + body.acceleration.x) * dt;
            body.velocity.y += 0.5 * (body.prevAcceleration.y + body.acceleration.y) * dt;
            body.velocity.z += 0.5 * (body.prevAcceleration.z + body.acceleration.z) * dt;
            
            // Update position
            // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
            body.position.x += body.velocity.x * dt + 0.5 * body.acceleration.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * body.acceleration.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * body.acceleration.z * dt * dt;
            
            // Update rotation
            if (body.rotationPeriod > 0) {
                body.rotation += (MathUtils.TWO_PI / body.rotationPeriod) * dt;
            }
            
            // Update mesh position (scaled for rendering)
            body.updateMeshPosition();
        }
        
        // Update sun rotation
        if (bodies[0] && bodies[0].rotationPeriod > 0) {
            bodies[0].rotation += (MathUtils.TWO_PI / bodies[0].rotationPeriod) * dt;
            bodies[0].updateMeshPosition();
        }
    }
    
    /**
     * Calculate gravitational accelerations for all bodies
     */
    calculateGravitationalAccelerations() {
        const bodies = this.bodies;
        const n = bodies.length;
        const G = this.G;
        const softening = this.softening;
        
        // Reset accelerations
        for (let i = 0; i < n; i++) {
            bodies[i].acceleration.set(0, 0, 0);
        }
        
        // Calculate pairwise gravitational forces
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const bodyA = bodies[i];
                const bodyB = bodies[j];
                
                // Vector from A to B
                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;
                
                // Distance with softening to prevent singularities
                const distSq = dx * dx + dy * dy + dz * dz + softening * softening;
                const dist = Math.sqrt(distSq);
                
                // Gravitational force magnitude: F = G * m1 * m2 / r²
                // Acceleration: a = F / m = G * m_other / r²
                const forceMag = G / distSq;
                
                // Unit vector from A to B
                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;
                
                // Apply acceleration to A (towards B)
                const accelA = forceMag * bodyB.mass;
                bodyA.acceleration.x += nx * accelA;
                bodyA.acceleration.y += ny * accelA;
                bodyA.acceleration.z += nz * accelA;
                
                // Apply acceleration to B (towards A) - Newton's third law
                const accelB = forceMag * bodyA.mass;
                bodyB.acceleration.x -= nx * accelB;
                bodyB.acceleration.y -= ny * accelB;
                bodyB.acceleration.z -= nz * accelB;
            }
        }
        
        if (Config.debug.logPhysics) {
            this.logPhysicsState();
        }
    }
    
    /**
     * Update interactive objects with simplified physics
     */
    updateInteractiveObjects(dt) {
        for (const obj of this.objects) {
            if (obj.isHeld) continue; // Skip held objects
            
            // Find nearest celestial body for gravity
            const nearestBody = this.findNearestBody(obj.position);
            
            if (nearestBody) {
                // Calculate gravity from nearest body
                const gravity = this.calculateLocalGravity(obj.position, nearestBody);
                
                // Apply gravity to velocity
                obj.velocity.x += gravity.x * dt;
                obj.velocity.y += gravity.y * dt;
                obj.velocity.z += gravity.z * dt;
            }
            
            // Update position
            obj.position.x += obj.velocity.x * dt;
            obj.position.y += obj.velocity.y * dt;
            obj.position.z += obj.velocity.z * dt;
            
            // Check collision with celestial bodies
            this.checkObjectCollisions(obj, nearestBody);
            
            // Update mesh
            obj.updateMesh();
        }
    }
    
    /**
     * Update player physics
     */
    updatePlayerPhysics(dt) {
        if (!this.player || this.player.isFlying) return;
        
        const nearestBody = this.findNearestBody(this.player.position);
        if (!nearestBody) return;
        
        // Calculate gravity
        const gravity = this.calculateLocalGravity(this.player.position, nearestBody);
        gravity.x *= Config.physics.localGravityMultiplier;
        gravity.y *= Config.physics.localGravityMultiplier;
        gravity.z *= Config.physics.localGravityMultiplier;
        
        // Apply gravity
        this.player.velocity.x += gravity.x * dt;
        this.player.velocity.y += gravity.y * dt;
        this.player.velocity.z += gravity.z * dt;
        
        // Check ground collision
        const distToCenter = MathUtils.distanceVec3(this.player.position, nearestBody.position);
        const surfaceRadius = nearestBody.visualRadius + this.player.height * 0.5;
        
        if (distToCenter <= surfaceRadius) {
            // On surface
            const normal = {
                x: (this.player.position.x - nearestBody.position.x) / distToCenter,
                y: (this.player.position.y - nearestBody.position.y) / distToCenter,
                z: (this.player.position.z - nearestBody.position.z) / distToCenter
            };
            
            // Push out of surface
            this.player.position.x = nearestBody.position.x + normal.x * surfaceRadius;
            this.player.position.y = nearestBody.position.y + normal.y * surfaceRadius;
            this.player.position.z = nearestBody.position.z + normal.z * surfaceRadius;
            
            // Remove velocity component into surface
            const vDotN = this.player.velocity.x * normal.x + 
                          this.player.velocity.y * normal.y + 
                          this.player.velocity.z * normal.z;
            
            if (vDotN < 0) {
                this.player.velocity.x -= vDotN * normal.x;
                this.player.velocity.y -= vDotN * normal.y;
                this.player.velocity.z -= vDotN * normal.z;
            }
            
            this.player.isGrounded = true;
            this.player.groundNormal = normal;
            this.player.currentPlanet = nearestBody;
        } else {
            this.player.isGrounded = false;
        }
    }
    
    /**
     * Find nearest celestial body to a position
     */
    findNearestBody(position) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const body of this.bodies) {
            const dist = MathUtils.distanceVec3(position, body.position);
            if (dist < minDist) {
                minDist = dist;
                nearest = body;
            }
        }
        
        return nearest;
    }
    
    /**
     * Calculate local gravity at a position from a body
     */
    calculateLocalGravity(position, body) {
        const dx = body.position.x - position.x;
        const dy = body.position.y - position.y;
        const dz = body.position.z - position.z;
        
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);
        
        if (dist < this.minDistance) {
            return { x: 0, y: 0, z: 0 };
        }
        
        // g = G * M / r²
        // For local physics, use surface gravity scaled by distance
        const surfaceGravity = MathUtils.surfaceGravity(this.G, body.mass, body.radius);
        const scaledGravity = surfaceGravity * Math.pow(body.radius / (dist / Config.scale.distance), 2);
        
        // Normalize and apply magnitude
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;
        
        return {
            x: nx * scaledGravity,
            y: ny * scaledGravity,
            z: nz * scaledGravity
        };
    }
    
    /**
     * Check object collisions with celestial body
     */
    checkObjectCollisions(obj, body) {
        if (!body) return;
        
        const dist = MathUtils.distanceVec3(obj.position, body.position);
        const surfaceRadius = body.visualRadius + obj.radius;
        
        if (dist <= surfaceRadius) {
            // Calculate surface normal
            const normal = {
                x: (obj.position.x - body.position.x) / dist,
                y: (obj.position.y - body.position.y) / dist,
                z: (obj.position.z - body.position.z) / dist
            };
            
            // Push out
            obj.position.x = body.position.x + normal.x * surfaceRadius;
            obj.position.y = body.position.y + normal.y * surfaceRadius;
            obj.position.z = body.position.z + normal.z * surfaceRadius;
            
            // Bounce with energy loss
            const vDotN = obj.velocity.x * normal.x + 
                          obj.velocity.y * normal.y + 
                          obj.velocity.z * normal.z;
            
            if (vDotN < 0) {
                const restitution = 0.5; // Bounciness
                obj.velocity.x -= (1 + restitution) * vDotN * normal.x;
                obj.velocity.y -= (1 + restitution) * vDotN * normal.y;
                obj.velocity.z -= (1 + restitution) * vDotN * normal.z;
                
                // Friction
                const friction = 0.8;
                obj.velocity.x *= friction;
                obj.velocity.y *= friction;
                obj.velocity.z *= friction;
            }
        }
    }
    
    /**
     * Get scaled position for rendering
     */
    getScaledPosition(position) {
        return {
            x: position.x * this.distanceScale,
            y: position.y * this.distanceScale,
            z: position.z * this.distanceScale
        };
    }
    
    /**
     * Apply force to an object
     */
    applyForce(obj, force) {
        const accel = {
            x: force.x / obj.mass,
            y: force.y / obj.mass,
            z: force.z / obj.mass
        };
        
        obj.velocity.x += accel.x;
        obj.velocity.y += accel.y;
        obj.velocity.z += accel.z;
    }
    
    /**
     * Apply impulse to an object
     */
    applyImpulse(obj, impulse) {
        obj.velocity.x += impulse.x / obj.mass;
        obj.velocity.y += impulse.y / obj.mass;
        obj.velocity.z += impulse.z / obj.mass;
    }
    
    /**
     * Log physics state for debugging
     */
    logPhysicsState() {
        Logger.debug('=== Physics State ===');
        for (const body of this.bodies) {
            const speed = MathUtils.magnitude(body.velocity.x, body.velocity.y, body.velocity.z);
            Logger.debug(`${body.name}: pos=(${body.position.x.toExponential(2)}, ${body.position.y.toExponential(2)}, ${body.position.z.toExponential(2)}) vel=${speed.toFixed(2)} m/s`);
        }
    }
    
    /**
     * Get total kinetic energy (for stability checking)
     */
    getTotalKineticEnergy() {
        let total = 0;
        for (const body of this.bodies) {
            const speedSq = body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2;
            total += 0.5 * body.mass * speedSq;
        }
        return total;
    }
    
    /**
     * Get total potential energy
     */
    getTotalPotentialEnergy() {
        let total = 0;
        const n = this.bodies.length;
        
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const dist = MathUtils.distanceVec3(
                    this.bodies[i].position,
                    this.bodies[j].position
                );
                total -= this.G * this.bodies[i].mass * this.bodies[j].mass / dist;
            }
        }
        
        return total;
    }
    
    /**
     * Pause/resume physics
     */
    setPaused(paused) {
        this.paused = paused;
        Logger.info(`Physics ${paused ? 'paused' : 'resumed'}`);
    }
    
    /**
     * Reset simulation
     */
    reset() {
        this.bodies = [];
        this.objects = [];
        this.player = null;
        this.simulationTime = 0;
        this.accumulator = 0;
        Logger.info('Physics engine reset');
    }
    
    /**
     * Get stats for telemetry
     */
    getStats() {
        return {
            bodyCount: this.bodies.length,
            objectCount: this.objects.length,
            simulationTime: this.simulationTime,
            physicsTime: this.physicsTime.toFixed(2),
            kineticEnergy: this.getTotalKineticEnergy(),
            paused: this.paused
        };
    }
}

// Create global physics instance
const Physics = new PhysicsEngine();
