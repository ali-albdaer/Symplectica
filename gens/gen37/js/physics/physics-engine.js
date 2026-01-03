/**
 * Physics Engine - Core physics simulation
 * Handles integration, collision detection, and force application
 */

const PhysicsEngine = (function() {
    'use strict';
    
    // Physics bodies registry
    const bodies = [];
    const celestialBodies = [];
    
    // Accumulator for fixed timestep
    let accumulator = 0;
    let lastTime = 0;
    
    /**
     * Physics body class
     */
    class PhysicsBody {
        constructor(options = {}) {
            this.id = options.id || Math.random().toString(36).substr(2, 9);
            this.name = options.name || 'Unnamed';
            
            // Transform
            this.position = new THREE.Vector3(
                options.x || 0,
                options.y || 0,
                options.z || 0
            );
            
            this.velocity = new THREE.Vector3(
                options.vx || 0,
                options.vy || 0,
                options.vz || 0
            );
            
            this.acceleration = new THREE.Vector3(0, 0, 0);
            this.previousPosition = this.position.clone();
            
            // Physical properties
            this.mass = options.mass || 1;
            this.radius = options.radius || 1;
            this.inverseMass = this.mass > 0 ? 1 / this.mass : 0;
            
            // State
            this.isStatic = options.isStatic || false;
            this.isCelestial = options.isCelestial || false;
            this.affectedByGravity = options.affectedByGravity !== false;
            this.isGrounded = false;
            this.parentBody = null;
            
            // Collision
            this.collisionEnabled = options.collisionEnabled !== false;
            this.collisionGroup = options.collisionGroup || 'default';
            
            // Reference to Three.js mesh
            this.mesh = null;
            
            // Force accumulator
            this.forces = new THREE.Vector3(0, 0, 0);
        }
        
        /**
         * Apply a force to this body
         */
        applyForce(force) {
            this.forces.add(force);
        }
        
        /**
         * Apply an impulse (instant velocity change)
         */
        applyImpulse(impulse) {
            if (this.isStatic) return;
            this.velocity.addScaledVector(impulse, this.inverseMass);
        }
        
        /**
         * Set velocity directly
         */
        setVelocity(vx, vy, vz) {
            this.velocity.set(vx, vy, vz);
        }
        
        /**
         * Get kinetic energy
         */
        getKineticEnergy() {
            const speed = this.velocity.length();
            return 0.5 * this.mass * speed * speed;
        }
        
        /**
         * Get momentum
         */
        getMomentum() {
            return this.velocity.clone().multiplyScalar(this.mass);
        }
    }
    
    /**
     * Euler integration (simple but less stable)
     */
    function integrateEuler(body, dt) {
        if (body.isStatic) return;
        
        // a = F / m
        body.acceleration.copy(body.forces).multiplyScalar(body.inverseMass);
        
        // v += a * dt
        body.velocity.addScaledVector(body.acceleration, dt);
        
        // Clamp velocity
        const maxV = Config.PHYSICS.maxVelocity;
        if (body.velocity.length() > maxV) {
            body.velocity.normalize().multiplyScalar(maxV);
        }
        
        // p += v * dt
        body.previousPosition.copy(body.position);
        body.position.addScaledVector(body.velocity, dt);
    }
    
    /**
     * Velocity Verlet integration (more stable for orbital mechanics)
     */
    function integrateVerlet(body, dt) {
        if (body.isStatic) return;
        
        // Store previous acceleration
        const prevAccel = body.acceleration.clone();
        
        // p += v * dt + 0.5 * a * dt²
        body.previousPosition.copy(body.position);
        body.position.addScaledVector(body.velocity, dt);
        body.position.addScaledVector(prevAccel, 0.5 * dt * dt);
        
        // Calculate new acceleration
        body.acceleration.copy(body.forces).multiplyScalar(body.inverseMass);
        
        // v += 0.5 * (a_old + a_new) * dt
        const avgAccel = prevAccel.add(body.acceleration).multiplyScalar(0.5);
        body.velocity.addScaledVector(avgAccel, dt);
        
        // Clamp velocity
        const maxV = Config.PHYSICS.maxVelocity;
        if (body.velocity.length() > maxV) {
            body.velocity.normalize().multiplyScalar(maxV);
        }
    }
    
    /**
     * RK4 integration (most accurate)
     */
    function integrateRK4(body, dt) {
        if (body.isStatic) return;
        
        // This is a simplified RK4 for position/velocity
        // Full RK4 would require force recalculation at intermediate steps
        
        const k1v = body.forces.clone().multiplyScalar(body.inverseMass);
        const k1p = body.velocity.clone();
        
        const k2v = k1v.clone();
        const k2p = body.velocity.clone().addScaledVector(k1v, dt * 0.5);
        
        const k3v = k1v.clone();
        const k3p = body.velocity.clone().addScaledVector(k2v, dt * 0.5);
        
        const k4v = k1v.clone();
        const k4p = body.velocity.clone().addScaledVector(k3v, dt);
        
        // Update velocity
        body.velocity.addScaledVector(k1v, dt / 6);
        body.velocity.addScaledVector(k2v, dt / 3);
        body.velocity.addScaledVector(k3v, dt / 3);
        body.velocity.addScaledVector(k4v, dt / 6);
        
        // Update position
        body.previousPosition.copy(body.position);
        body.position.addScaledVector(k1p, dt / 6);
        body.position.addScaledVector(k2p, dt / 3);
        body.position.addScaledVector(k3p, dt / 3);
        body.position.addScaledVector(k4p, dt / 6);
        
        // Clamp velocity
        const maxV = Config.PHYSICS.maxVelocity;
        if (body.velocity.length() > maxV) {
            body.velocity.normalize().multiplyScalar(maxV);
        }
        
        body.acceleration.copy(body.forces).multiplyScalar(body.inverseMass);
    }
    
    /**
     * Choose integration method based on config
     */
    function integrate(body, dt) {
        switch (Config.PHYSICS.integrationMethod) {
            case 'euler':
                integrateEuler(body, dt);
                break;
            case 'rk4':
                integrateRK4(body, dt);
                break;
            case 'verlet':
            default:
                integrateVerlet(body, dt);
                break;
        }
    }
    
    /**
     * Sphere-sphere collision detection
     */
    function checkSphereCollision(body1, body2) {
        const distance = body1.position.distanceTo(body2.position);
        const minDist = body1.radius + body2.radius;
        
        if (distance < minDist) {
            return {
                colliding: true,
                penetration: minDist - distance,
                normal: body2.position.clone().sub(body1.position).normalize()
            };
        }
        
        return { colliding: false };
    }
    
    /**
     * Resolve collision between two bodies
     */
    function resolveCollision(body1, body2, collision) {
        if (!collision.colliding) return;
        
        // Separate bodies
        const halfPen = collision.penetration * 0.5;
        
        if (!body1.isStatic) {
            body1.position.addScaledVector(collision.normal, -halfPen);
        }
        if (!body2.isStatic) {
            body2.position.addScaledVector(collision.normal, halfPen);
        }
        
        // Calculate relative velocity
        const relVel = body1.velocity.clone().sub(body2.velocity);
        const velAlongNormal = relVel.dot(collision.normal);
        
        // Don't resolve if velocities are separating
        if (velAlongNormal > 0) return;
        
        // Coefficient of restitution (bounciness)
        const restitution = 0.3;
        
        // Calculate impulse scalar
        let j = -(1 + restitution) * velAlongNormal;
        j /= body1.inverseMass + body2.inverseMass;
        
        // Apply impulse
        const impulse = collision.normal.clone().multiplyScalar(j);
        
        if (!body1.isStatic) {
            body1.velocity.addScaledVector(impulse, body1.inverseMass);
        }
        if (!body2.isStatic) {
            body2.velocity.addScaledVector(impulse, -body2.inverseMass);
        }
    }
    
    /**
     * Check if a point is on the surface of a body
     */
    function getDistanceFromSurface(point, body) {
        const distance = point.distanceTo(body.position);
        return distance - body.radius;
    }
    
    /**
     * Get the closest celestial body to a point
     */
    function getClosestCelestialBody(point) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const body of celestialBodies) {
            const dist = point.distanceTo(body.position) - body.radius;
            if (dist < minDistance) {
                minDistance = dist;
                closest = body;
            }
        }
        
        return { body: closest, distance: minDistance };
    }
    
    /**
     * Get surface normal at a point on a celestial body
     */
    function getSurfaceNormal(point, body) {
        return point.clone().sub(body.position).normalize();
    }
    
    // Public API
    return {
        PhysicsBody: PhysicsBody,
        
        /**
         * Initialize physics engine
         */
        init: function() {
            Logger.info('Physics', 'Initializing physics engine');
            bodies.length = 0;
            celestialBodies.length = 0;
            accumulator = 0;
            lastTime = performance.now();
            Logger.info('Physics', `Integration method: ${Config.PHYSICS.integrationMethod}`);
        },
        
        /**
         * Create and register a physics body
         */
        createBody: function(options) {
            const body = new PhysicsBody(options);
            bodies.push(body);
            
            if (body.isCelestial) {
                celestialBodies.push(body);
            }
            
            Logger.debug('Physics', `Created body: ${body.name} (mass: ${MathUtils.formatSI(body.mass)}kg)`);
            return body;
        },
        
        /**
         * Remove a physics body
         */
        removeBody: function(body) {
            const idx = bodies.indexOf(body);
            if (idx !== -1) {
                bodies.splice(idx, 1);
            }
            
            const celestialIdx = celestialBodies.indexOf(body);
            if (celestialIdx !== -1) {
                celestialBodies.splice(celestialIdx, 1);
            }
        },
        
        /**
         * Get all bodies
         */
        getBodies: function() {
            return bodies;
        },
        
        /**
         * Get celestial bodies only
         */
        getCelestialBodies: function() {
            return celestialBodies;
        },
        
        /**
         * Main physics update
         */
        update: function(deltaTime) {
            if (Config.DEBUG.pausePhysics) return;
            
            // Apply time scale
            const scaledDelta = deltaTime * Config.PHYSICS.timeScale;
            
            // Fixed timestep with accumulator
            const fixedDt = 1 / Config.PHYSICS.physicsRate;
            accumulator += scaledDelta;
            
            // Prevent spiral of death
            if (accumulator > fixedDt * 10) {
                accumulator = fixedDt * 10;
            }
            
            while (accumulator >= fixedDt) {
                this.fixedUpdate(fixedDt);
                accumulator -= fixedDt;
            }
            
            // Interpolation factor for rendering
            return accumulator / fixedDt;
        },
        
        /**
         * Fixed timestep physics update
         */
        fixedUpdate: function(dt) {
            // Clear forces
            for (const body of bodies) {
                body.forces.set(0, 0, 0);
            }
            
            // Apply gravity from celestial bodies to all bodies
            GravitySolver.calculateGravity(bodies, celestialBodies, dt);
            
            // Integrate
            for (const body of bodies) {
                integrate(body, dt);
            }
            
            // Collision detection for non-celestial bodies
            for (let i = 0; i < bodies.length; i++) {
                const body1 = bodies[i];
                if (!body1.collisionEnabled) continue;
                
                // Check against celestial bodies (planet surface)
                for (const celestial of celestialBodies) {
                    if (body1 === celestial) continue;
                    
                    const collision = checkSphereCollision(body1, celestial);
                    if (collision.colliding) {
                        // For celestial collision, treat celestial as static
                        const savedStatic = celestial.isStatic;
                        celestial.isStatic = true;
                        resolveCollision(body1, celestial, collision);
                        celestial.isStatic = savedStatic;
                        
                        body1.isGrounded = true;
                    }
                }
                
                // Check against other non-celestial bodies
                for (let j = i + 1; j < bodies.length; j++) {
                    const body2 = bodies[j];
                    if (!body2.collisionEnabled || body2.isCelestial) continue;
                    
                    const collision = checkSphereCollision(body1, body2);
                    resolveCollision(body1, body2, collision);
                }
            }
            
            // Update meshes
            for (const body of bodies) {
                if (body.mesh) {
                    body.mesh.position.copy(body.position);
                }
            }
        },
        
        // Utility functions
        getClosestCelestialBody: getClosestCelestialBody,
        getSurfaceNormal: getSurfaceNormal,
        getDistanceFromSurface: getDistanceFromSurface,
        
        /**
         * Get total system energy (for debugging stability)
         */
        getTotalEnergy: function() {
            let kinetic = 0;
            let potential = 0;
            
            for (const body of bodies) {
                kinetic += body.getKineticEnergy();
            }
            
            // Gravitational potential energy between celestial bodies
            const G = Config.PHYSICS.G;
            for (let i = 0; i < celestialBodies.length; i++) {
                for (let j = i + 1; j < celestialBodies.length; j++) {
                    const r = celestialBodies[i].position.distanceTo(celestialBodies[j].position);
                    potential -= G * celestialBodies[i].mass * celestialBodies[j].mass / r;
                }
            }
            
            return { kinetic, potential, total: kinetic + potential };
        },
        
        /**
         * Debug: Log system state
         */
        logSystemState: function() {
            const energy = this.getTotalEnergy();
            Logger.debug('Physics', `System energy - K: ${MathUtils.formatSI(energy.kinetic)}J, ` +
                `U: ${MathUtils.formatSI(energy.potential)}J, Total: ${MathUtils.formatSI(energy.total)}J`);
        }
    };
})();
