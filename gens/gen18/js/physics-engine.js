/**
 * Physics Engine Wrapper
 * Abstraction layer for Cannon-es physics engine with gravitational N-body support
 */
class PhysicsEngine {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0); // No global gravity - use local N-body
        this.world.defaultContactMaterial.friction = 0.3;
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        this.bodies = new Map(); // entityId -> Body
        this.constraints = new Map();
        this.forceAccumulators = new Map(); // For custom forces
        this.timeStep = 1 / 60;
        this.substeps = Config.physics.substeps;
        this.enabled = true;

        DebugLog.info('PhysicsEngine: Initialized');
    }

    /**
     * Create a rigid body and add to world
     */
    addBody(entityId, bodyConfig) {
        try {
            const { mass, shape, position, velocity, linearDamping, angularDamping } = bodyConfig;

            const body = new CANNON.Body({
                mass: mass > 0 ? mass : 0, // 0 = static
                shape,
                linearDamping: linearDamping !== undefined ? linearDamping : Config.physics.damping,
                angularDamping: angularDamping !== undefined ? angularDamping : Config.physics.angularDamping
            });

            body.position.copy(position);
            body.velocity.copy(velocity);

            this.world.addBody(body);
            this.bodies.set(entityId, body);
            this.forceAccumulators.set(entityId, new CANNON.Vec3(0, 0, 0));

            return body;
        } catch (error) {
            DebugLog.error(`PhysicsEngine.addBody: ${error.message}`);
            throw error;
        }
    }

    /**
     * Remove a body from the world
     */
    removeBody(entityId) {
        const body = this.bodies.get(entityId);
        if (body) {
            this.world.removeBody(body);
            this.bodies.delete(entityId);
            this.forceAccumulators.delete(entityId);
        }
    }

    /**
     * Get body for entity
     */
    getBody(entityId) {
        return this.bodies.get(entityId);
    }

    /**
     * Apply force to a body
     */
    applyForce(entityId, force, worldPoint = null) {
        const body = this.bodies.get(entityId);
        if (body && body.mass > 0) {
            if (worldPoint) {
                body.applyForce(force, worldPoint);
            } else {
                body.velocity.x += force.x / body.mass;
                body.velocity.y += force.y / body.mass;
                body.velocity.z += force.z / body.mass;
            }
        }
    }

    /**
     * Apply impulse to a body
     */
    applyImpulse(entityId, impulse, relativePoint = null) {
        const body = this.bodies.get(entityId);
        if (body && body.mass > 0) {
            if (relativePoint) {
                body.applyImpulse(impulse, relativePoint);
            } else {
                body.velocity.x += impulse.x / body.mass;
                body.velocity.y += impulse.y / body.mass;
                body.velocity.z += impulse.z / body.mass;
            }
        }
    }

    /**
     * Set body velocity
     */
    setVelocity(entityId, velocity) {
        const body = this.bodies.get(entityId);
        if (body) {
            body.velocity.copy(velocity);
        }
    }

    /**
     * Get body velocity
     */
    getVelocity(entityId) {
        const body = this.bodies.get(entityId);
        if (body) {
            return new CANNON.Vec3(body.velocity.x, body.velocity.y, body.velocity.z);
        }
        return null;
    }

    /**
     * Set body position
     */
    setPosition(entityId, position) {
        const body = this.bodies.get(entityId);
        if (body) {
            body.position.copy(position);
        }
    }

    /**
     * Get body position
     */
    getPosition(entityId) {
        const body = this.bodies.get(entityId);
        if (body) {
            return new CANNON.Vec3(body.position.x, body.position.y, body.position.z);
        }
        return null;
    }

    /**
     * Set body quaternion (rotation)
     */
    setRotation(entityId, quaternion) {
        const body = this.bodies.get(entityId);
        if (body) {
            body.quaternion.copy(quaternion);
        }
    }

    /**
     * Calculate gravitational force between two bodies (N-body)
     */
    calculateGravitationalForce(body1Pos, body1Mass, body2Pos, body2Mass) {
        const direction = new CANNON.Vec3(
            body2Pos.x - body1Pos.x,
            body2Pos.y - body1Pos.y,
            body2Pos.z - body1Pos.z
        );
        
        const distanceSq = direction.lengthSquared();
        if (distanceSq < 1e-6) return new CANNON.Vec3(0, 0, 0); // Prevent singularity
        
        const distance = Math.sqrt(distanceSq);
        const forceMagnitude = Utilities.math.calculateGravitationalForce(body1Mass, body2Mass, distance, Config.physics.universalG);
        
        direction.normalize();
        direction.scale(forceMagnitude, direction);
        
        return direction;
    }

    /**
     * Apply N-body gravitational forces
     */
    applyGravitationalForces(entities) {
        if (!this.enabled || entities.length < 2) return;

        // Reset accumulators
        for (const [id, acc] of this.forceAccumulators) {
            acc.set(0, 0, 0);
        }

        // Calculate forces between all pairs
        for (let i = 0; i < entities.length; i++) {
            const entity1 = entities[i];
            const body1 = this.bodies.get(entity1.id);
            if (!body1 || body1.mass === 0) continue;

            for (let j = i + 1; j < entities.length; j++) {
                const entity2 = entities[j];
                const body2 = this.bodies.get(entity2.id);
                if (!body2) continue;

                // Calculate force on entity1 due to entity2
                const force = this.calculateGravitationalForce(
                    body1.position,
                    body1.mass,
                    body2.position,
                    body2.mass
                );

                // Accumulate forces
                const acc1 = this.forceAccumulators.get(entity1.id);
                acc1.x += force.x;
                acc1.y += force.y;
                acc1.z += force.z;

                // Newton's third law - opposite force on entity2
                if (body2.mass > 0) {
                    const acc2 = this.forceAccumulators.get(entity2.id);
                    acc2.x -= force.x;
                    acc2.y -= force.y;
                    acc2.z -= force.z;
                }
            }
        }

        // Apply accumulated forces
        for (const [id, acc] of this.forceAccumulators) {
            const body = this.bodies.get(id);
            if (body && body.mass > 0 && (Math.abs(acc.x) > 1e-10 || Math.abs(acc.y) > 1e-10 || Math.abs(acc.z) > 1e-10)) {
                body.velocity.x += acc.x / body.mass * this.timeStep;
                body.velocity.y += acc.y / body.mass * this.timeStep;
                body.velocity.z += acc.z / body.mass * this.timeStep;
            }
        }
    }

    /**
     * Raycast for object interaction
     */
    raycast(origin, direction, maxDistance = 1000) {
        const ray = new CANNON.Ray(origin, direction);
        ray.maxDistance = maxDistance;
        
        const result = {
            hit: false,
            body: null,
            point: null,
            distance: Infinity,
            normal: null
        };

        ray.intersectBodies(Array.from(this.bodies.values()), result);
        
        return {
            hit: result.hasHit,
            body: result.body,
            point: result.hitPointWorld ? new THREE.Vector3(result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z) : null,
            distance: result.distance || Infinity,
            normal: result.hitNormalWorld ? new THREE.Vector3(result.hitNormalWorld.x, result.hitNormalWorld.y, result.hitNormalWorld.z) : null
        };
    }

    /**
     * Update physics simulation
     */
    update(deltaTime) {
        if (!this.enabled) return;

        const scaledDelta = deltaTime * Config.physics.timeScale;
        const substepDelta = scaledDelta / this.substeps;

        for (let i = 0; i < this.substeps; i++) {
            this.world.step(substepDelta);
        }
    }

    /**
     * Get all bodies
     */
    getAllBodies() {
        return Array.from(this.bodies.values());
    }

    /**
     * Get body count
     */
    getBodyCount() {
        return this.bodies.size;
    }

    /**
     * Clear all bodies
     */
    clear() {
        this.bodies.forEach((body) => {
            this.world.removeBody(body);
        });
        this.bodies.clear();
        this.forceAccumulators.clear();
    }

    /**
     * Enable/disable physics
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Set time scale
     */
    setTimeScale(scale) {
        Config.physics.timeScale = Math.max(0, scale);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsEngine;
}
