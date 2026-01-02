/**
 * Physics Engine
 * N-body gravitational simulation with proper orbital mechanics
 */

window.PhysicsEngine = {
    // List of all bodies in the system
    bodies: [],
    
    // Spatial partitioning for optimization (optional)
    useOctree: false,
    
    // Performance metrics
    metrics: {
        lastFrameTime: 0,
        forceCalculations: 0,
        bodiesSimulated: 0,
    },

    init() {
        DebugSystem.info('Physics engine initializing');
        this.bodies = [];
    },

    /**
     * Create a physics body
     */
    createBody(config) {
        const body = {
            // Identity
            id: Math.random().toString(36).substr(2, 9),
            name: config.name || 'Body',
            
            // Physics state
            position: new THREE.Vector3(...(config.position || [0, 0, 0])),
            velocity: new THREE.Vector3(...(config.velocity || [0, 0, 0])),
            acceleration: new THREE.Vector3(0, 0, 0),
            
            // Properties
            mass: config.mass || 1e24,
            radius: config.radius || 1,
            density: config.density || 5500,
            
            // Rotation
            rotation: new THREE.Quaternion(),
            angularVelocity: new THREE.Vector3(0, 0, 0),
            rotationAxis: new THREE.Vector3(...(config.rotationAxis || [0, 1, 0])),
            rotationPeriod: config.rotationPeriod || 86400,
            
            // Rendering
            color: config.color || { r: 0.5, g: 0.5, b: 0.5 },
            emissive: config.emissive || false,
            isLightSource: config.isLightSource || false,
            luminosity: config.luminosity || 0,
            temperature: config.temperature || 5778,
            hasAtmosphere: config.hasAtmosphere || false,
            atmosphereColor: config.atmosphereColor,
            
            // Orbital properties
            parent: config.parent || null,
            semiMajorAxis: config.semiMajorAxis,
            eccentricity: config.eccentricity || 0,
            inclination: config.inclination || 0,
            
            // Flags
            isKinematic: config.isKinematic || false,
            useGravity: config.useGravity !== false,
            affectsGravity: config.affectsGravity !== false,
            
            // Storage for forces
            forces: new THREE.Vector3(0, 0, 0),
            
            // Trail (optional, for visualization)
            trailPositions: [],
            maxTrailLength: 1000,
        };

        // Calculate proper rotation angular velocity
        if (body.rotationPeriod && body.rotationPeriod > 0) {
            const angularSpeed = (2 * Math.PI) / body.rotationPeriod;
            body.angularVelocity = Utils.vec3.multiply(
                Utils.vec3.normalize(body.rotationAxis),
                angularSpeed
            );
        }

        this.bodies.push(body);
        DebugSystem.info(`Physics body created: ${body.name}`, {
            mass: body.mass,
            radius: body.radius,
            position: Utils.string.formatPosition(body.position),
        });

        return body;
    },

    /**
     * Update physics for all bodies (main simulation step)
     */
    update(deltaTime) {
        const startTime = performance.now();
        const steps = Math.max(1, Math.floor(deltaTime / (Config.physics.dt / Config.physics.substeps)));
        const dt = deltaTime / steps;

        // Reset force accumulators
        for (let body of this.bodies) {
            body.forces.set(0, 0, 0);
            body.acceleration.set(0, 0, 0);
        }

        // Calculate forces
        this.calculateGravitationalForces();

        // Integrate physics
        for (let i = 0; i < steps; i++) {
            this.integrateStep(dt);
        }

        // Update rotation
        this.updateRotations(deltaTime);

        // Store metrics
        this.metrics.lastFrameTime = performance.now() - startTime;
        this.metrics.bodiesSimulated = this.bodies.length;

        return this.metrics.lastFrameTime;
    },

    /**
     * Calculate gravitational forces between all bodies
     */
    calculateGravitationalForces() {
        this.metrics.forceCalculations = 0;

        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            
            if (!bodyA.useGravity || bodyA.isKinematic) continue;

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];
                
                if (!bodyB.affectsGravity) continue;

                // Calculate force between bodies
                const direction = Utils.vec3.subtract(bodyB.position, bodyA.position);
                const distanceSq = Utils.vec3.lengthSquared(direction);
                
                // Prevent singularity and tunneling
                const minDistanceSq = (bodyA.radius + bodyB.radius) ** 2;
                if (distanceSq < minDistanceSq) continue;

                const distance = Math.sqrt(distanceSq);
                const normalizedDir = Utils.vec3.multiply(direction, 1 / distance);
                
                // Calculate force magnitude (F = G * m1 * m2 / r^2)
                const forceMagnitude = (Config.physics.G * bodyA.mass * bodyB.mass) / distanceSq;
                
                // Apply force to both bodies (Newton's 3rd law)
                const force = Utils.vec3.multiply(normalizedDir, forceMagnitude);
                
                bodyA.forces.add(force);
                bodyB.forces.sub(force);

                this.metrics.forceCalculations++;
            }
        }
    },

    /**
     * Integrate velocities and positions (Velocity Verlet)
     */
    integrateStep(dt) {
        for (let body of this.bodies) {
            if (body.isKinematic) continue;

            // F = ma -> a = F/m
            body.acceleration.copy(body.forces).divideScalar(body.mass);

            // Velocity Verlet integration
            // v(t+dt) = v(t) + a(t) * dt
            body.velocity.addScaledVector(body.acceleration, dt);

            // Apply damping/friction
            body.velocity.multiplyScalar(Config.player.damping);

            // x(t+dt) = x(t) + v(t+dt) * dt
            body.position.addScaledVector(body.velocity, dt);

            // Clamp large values to prevent numerical instability
            if (!Utils.test.isVectorFinite(body.position)) {
                DebugSystem.warn(`Body ${body.name} has invalid position, resetting`, {
                    position: body.position,
                });
                body.position.set(0, 0, 0);
                body.velocity.set(0, 0, 0);
            }
        }
    },

    /**
     * Update body rotations
     */
    updateRotations(deltaTime) {
        for (let body of this.bodies) {
            if (Utils.vec3.length(body.angularVelocity) === 0) continue;

            // Create rotation for this frame
            const angle = Utils.vec3.length(body.angularVelocity) * deltaTime;
            const axis = Utils.vec3.normalize(body.angularVelocity);
            
            const deltaRotation = Utils.quat.fromAxisAngle(axis, angle);
            
            // Apply to body rotation
            body.rotation.multiplyQuaternions(deltaRotation, body.rotation);
            body.rotation.normalize();
        }
    },

    /**
     * Apply velocity to a body (for initial orbits or player actions)
     */
    applyVelocity(body, velocity) {
        body.velocity.add(velocity);
    },

    /**
     * Apply impulse to a body
     */
    applyImpulse(body, impulse) {
        const deltaV = Utils.vec3.multiply(impulse, 1 / body.mass);
        body.velocity.add(deltaV);
    },

    /**
     * Get body by name
     */
    getBody(name) {
        return this.bodies.find(b => b.name === name);
    },

    /**
     * Get distance between two bodies
     */
    getDistance(body1, body2) {
        return Utils.vec3.distance(body1.position, body2.position);
    },

    /**
     * Get all bodies except one (useful for queries)
     */
    getOtherBodies(body) {
        return this.bodies.filter(b => b !== body);
    },

    /**
     * Find closest body to a position
     */
    getClosestBody(position, excludeBody = null) {
        let closest = null;
        let minDistance = Infinity;

        for (let body of this.bodies) {
            if (excludeBody && body === excludeBody) continue;
            
            const distance = Utils.vec3.distance(body.position, position);
            if (distance < minDistance) {
                minDistance = distance;
                closest = body;
            }
        }

        return closest;
    },

    /**
     * Find all bodies within a radius
     */
    getBodiesInRadius(position, radius) {
        return this.bodies.filter(body => {
            const distance = Utils.vec3.distance(body.position, position);
            return distance <= radius;
        });
    },

    /**
     * Calculate surface gravity of a body
     */
    getSurfaceGravity(body) {
        return (Config.physics.G * body.mass) / (body.radius * body.radius);
    },

    /**
     * Get dominant gravity source for a position
     */
    getDominantGravity(position) {
        let dominant = null;
        let maxAccel = 0;

        for (let body of this.bodies) {
            if (!body.affectsGravity) continue;
            
            const dist = Utils.vec3.distance(position, body.position);
            if (dist === 0) continue;
            
            const accel = Config.physics.G * body.mass / (dist * dist);
            if (accel > maxAccel) {
                maxAccel = accel;
                dominant = body;
            }
        }

        return dominant;
    },

    /**
     * Debug: Print physics state
     */
    debugPrint() {
        for (let body of this.bodies) {
            const speed = Utils.vec3.length(body.velocity);
            DebugSystem.info(`${body.name}:`, {
                pos: Utils.string.formatPosition(body.position),
                vel: `${Utils.string.formatNumber(speed, 2)} m/s`,
                mass: body.mass.toExponential(2),
                radius: body.radius,
            });
        }
    },
};

DebugSystem.info('Physics engine loaded');
