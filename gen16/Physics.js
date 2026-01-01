/**
 * Physics.js - N-Body Gravitational Physics System
 * Pure JavaScript implementation - no external dependencies
 */

class PhysicsEngine {
    constructor(config) {
        this.config = config;
        
        // Initialize simple physics (no dependencies)
        this.bodies = new Map(); // name -> {pos, vel, acc}
        this.entities = new Map();
        this.forces = new Map();
        
        this.timeStep = 1 / 60; // 60 FPS default
        this.substeps = config.PHYSICS.SUBSTEPS || 3;
        this.gravityConstant = config.PHYSICS.GRAVITY_CONSTANT;
        this.timeScale = config.PHYSICS.TIME_SCALE || 1.0;
        
        Logger.info('Physics Engine initialized (Pure JavaScript N-Body)');
    }

    /**
     * Register a celestial body or interactive object
     */
    addBody(name, mass, radius, position, velocity, isKinematic = false) {
        try {
            this.bodies.set(name, {
                pos: { ...position },
                vel: { ...velocity },
                acc: { x: 0, y: 0, z: 0 },
            });
            
            this.entities.set(name, {
                name,
                mass,
                radius,
                isKinematic,
                isCelestial: mass > 1e10,
            });
            
            this.forces.set(name, { x: 0, y: 0, z: 0 });
            
            Logger.info(`Physics body added: ${name} (mass: ${mass.toExponential(2)})`);
        } catch (error) {
            Logger.error(`Failed to add physics body ${name}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Calculate N-body gravitational forces
     * All bodies exert gravitational pull on all others
     */
    calculateGravitationalForces() {
        const names = Array.from(this.bodies.keys());
        
        // Reset forces
        for (const name of names) {
            const force = this.forces.get(name);
            force.x = 0;
            force.y = 0;
            force.z = 0;
        }

        // Calculate pairwise forces
        for (let i = 0; i < names.length; i++) {
            for (let j = i + 1; j < names.length; j++) {
                const nameA = names[i];
                const nameB = names[j];
                
                const bodyA = this.bodies.get(nameA);
                const bodyB = this.bodies.get(nameB);
                
                const entityA = this.entities.get(nameA);
                const entityB = this.entities.get(nameB);
                
                if (entityA.isKinematic && entityB.isKinematic) continue;

                // Distance vector
                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;
                
                const distSquared = dx*dx + dy*dy + dz*dz;
                const distance = Math.sqrt(distSquared);
                
                // Prevent singularities
                if (distance < 1) continue;
                
                // F = G * m1 * m2 / r^2
                const forceMagnitude = (this.gravityConstant * entityA.mass * entityB.mass) / distSquared;
                
                // Normalize direction
                const dirX = dx / distance;
                const dirY = dy / distance;
                const dirZ = dz / distance;
                
                // Apply forces (Newton's 3rd law)
                if (!entityA.isKinematic) {
                    const forceA = this.forces.get(nameA);
                    forceA.x += forceMagnitude * dirX;
                    forceA.y += forceMagnitude * dirY;
                    forceA.z += forceMagnitude * dirZ;
                }
                
                if (!entityB.isKinematic) {
                    const forceB = this.forces.get(nameB);
                    forceB.x -= forceMagnitude * dirX;
                    forceB.y -= forceMagnitude * dirY;
                    forceB.z -= forceMagnitude * dirZ;
                }
            }
        }
    }

    /**
     * Apply accumulated gravitational forces to bodies
     */
    applyGravitationalForces() {
        // Forces are applied in step() method
    }

    /**
     * Step the physics simulation
     */
    step(deltaTime) {
        const dt = Math.min(deltaTime, 1/30) * this.timeScale;
        
        // Calculate gravitational interactions
        this.calculateGravitationalForces();
        
        // Update velocities and positions
        for (const [name, body] of this.bodies) {
            const entity = this.entities.get(name);
            if (entity.isKinematic) continue;
            
            const force = this.forces.get(name);
            
            // F = ma -> a = F/m
            body.acc.x = force.x / entity.mass;
            body.acc.y = force.y / entity.mass;
            body.acc.z = force.z / entity.mass;
            
            // v = v0 + a*dt
            body.vel.x += body.acc.x * dt;
            body.vel.y += body.acc.y * dt;
            body.vel.z += body.acc.z * dt;
            
            // x = x0 + v*dt
            body.pos.x += body.vel.x * dt;
            body.pos.y += body.vel.y * dt;
            body.pos.z += body.vel.z * dt;
        }
    }

    /**
     * Get body position
     */
    getPosition(name) {
        const body = this.bodies.get(name);
        if (!body) return null;
        return { ...body.pos };
    }

    /**
     * Get body velocity
     */
    getVelocity(name) {
        const body = this.bodies.get(name);
        if (!body) return null;
        return { ...body.vel };
    }

    /**
     * Set body velocity
     */
    setVelocity(name, velocity) {
        const body = this.bodies.get(name);
        if (body) {
            body.vel.x = velocity.x;
            body.vel.y = velocity.y;
            body.vel.z = velocity.z;
        }
    }

    /**
     * Set body position
     */
    setPosition(name, position) {
        const body = this.bodies.get(name);
        if (body) {
            body.pos.x = position.x;
            body.pos.y = position.y;
            body.pos.z = position.z;
        }
    }

    /**
     * Apply impulse to a body
     */
    applyImpulse(name, impulse) {
        const body = this.bodies.get(name);
        if (body && !body.mass === 0) {
            body.velocity.x += impulse.x / body.mass;
            body.velocity.y += impulse.y / body.mass;
            body.velocity.z += impulse.z / body.mass;
        }
    }

    /**
     * Apply force to a body
     */
    applyForce(name, force) {
        const body = this.bodies.get(name);
        const entity = this.entities.get(name);
        if (body && entity) {
            const ax = force.x / entity.mass;
            const ay = force.y / entity.mass;
            const az = force.z / entity.mass;
            const dt = this.timeStep * this.timeScale;
            
            body.velocity.x += ax * dt;
            body.velocity.y += ay * dt;
            body.velocity.z += az * dt;
        }
    }

    /**
     * Get all body positions (for synchronization)
     */
    getAllPositions() {
        const positions = {};
        for (const [name, body] of this.bodies) {
            positions[name] = { ...body.pos };
        }
        return positions;
    }

    /**
     * Get all body velocities
     */
    getAllVelocities() {
        const velocities = {};
        for (const [name, body] of this.bodies) {
            velocities[name] = { ...body.vel };
        }
        return velocities;
    }

    /**
     * Raycasting for interactions
     */
    raycast(origin, direction, maxDistance) {
        const from = new CANNON.Vec3(origin.x, origin.y, origin.z);
        const to = new CANNON.Vec3(
            origin.x + direction.x * maxDistance,
            origin.y + direction.y * maxDistance,
            origin.z + direction.z * maxDistance
        );
        
        const result = new CANNON.RaycastResult();
        this.world.raycastClosest(from, to, {}, result);
        
        if (result.body) {
            // Find the entity name for this body
            for (const [name, body] of this.bodies) {
                if (body === result.body) {
                    return {
                        hit: true,
                        name,
                        point: {
                            x: result.hitPointWorld.x,
                            y: result.hitPointWorld.y,
                            z: result.hitPointWorld.z,
                        },
                        distance: result.hitPointWorld.distanceTo(from),
                    };
                }
            }
        }
        
        return { hit: false };
    }

    /**
     * Check if a body is within interaction distance
     */
    isWithinDistance(bodyName, position, distance) {
        const bodyPos = this.getPosition(bodyName);
        if (!bodyPos) return false;
        
        const dx = bodyPos.x - position.x;
        const dy = bodyPos.y - position.y;
        const dz = bodyPos.z - position.z;
        
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        return dist <= distance;
    }

    /**
     * Get distance between two bodies
     */
    getDistance(bodyNameA, bodyNameB) {
        const posA = this.getPosition(bodyNameA);
        const posB = this.getPosition(bodyNameB);
        
        if (!posA || !posB) return null;
        
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dz = posB.z - posA.z;
        
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    }
}
