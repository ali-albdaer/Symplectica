/**
 * PhysicsWorld.js - N-Body Gravitational Physics System
 * Handles all physics simulation including gravity, collisions, and object interactions
 */

import { Config } from './Config.js';
import { Logger, EventBus } from './Utils.js';

export class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.interactiveObjects = [];
        this.player = null;
        
        this.G = Config.physics.G_SCALED;
        this.timeScale = Config.physics.TIME_SCALE;
        this.fixedTimestep = Config.physics.FIXED_TIMESTEP;
        this.velocityDamping = Config.physics.VELOCITY_DAMPING;
        
        this.accumulator = 0;
        this.isPaused = false;
        
        // Spatial partitioning for optimization
        this.spatialGrid = new Map();
        this.gridCellSize = 200;
        
        Logger.physics('PhysicsWorld initialized', { G: this.G, timeScale: this.timeScale });
    }

    /**
     * Register a celestial body with the physics system
     */
    addBody(body) {
        this.bodies.push(body);
        Logger.physics(`Added body: ${body.name}`, { 
            mass: body.mass, 
            position: body.position.clone() 
        });
    }

    /**
     * Remove a body from the physics system
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
            Logger.physics(`Removed body: ${body.name}`);
        }
    }

    /**
     * Register an interactive object
     */
    addInteractiveObject(obj) {
        this.interactiveObjects.push(obj);
    }

    /**
     * Remove an interactive object
     */
    removeInteractiveObject(obj) {
        const index = this.interactiveObjects.indexOf(obj);
        if (index > -1) {
            this.interactiveObjects.splice(index, 1);
        }
    }

    /**
     * Set the player reference for physics calculations
     */
    setPlayer(player) {
        this.player = player;
    }

    /**
     * Main physics update loop using fixed timestep
     */
    update(deltaTime) {
        if (this.isPaused || Config.debug.pausePhysics) return;
        
        const scaledDelta = deltaTime * this.timeScale;
        this.accumulator += scaledDelta;
        
        let steps = 0;
        while (this.accumulator >= this.fixedTimestep && steps < Config.physics.MAX_SUBSTEPS) {
            this.fixedUpdate(this.fixedTimestep);
            this.accumulator -= this.fixedTimestep;
            steps++;
        }
        
        // Interpolate visual positions for smooth rendering
        const alpha = this.accumulator / this.fixedTimestep;
        this.interpolatePositions(alpha);
    }

    /**
     * Fixed timestep physics update
     */
    fixedUpdate(dt) {
        // Calculate N-body gravitational forces
        this.calculateGravitationalForces(dt);
        
        // Update celestial body positions
        this.updateBodies(dt);
        
        // Update interactive objects
        this.updateInteractiveObjects(dt);
        
        // Check collisions
        this.checkCollisions();
    }

    /**
     * Calculate gravitational forces between all bodies (N-body problem)
     * Using Velocity Verlet integration for stability
     */
    calculateGravitationalForces(dt) {
        const bodies = this.bodies.filter(b => !b.isStatic);
        
        // Reset accelerations
        bodies.forEach(body => {
            body.acceleration.set(0, 0, 0);
        });
        
        // Calculate gravitational acceleration for each body pair
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];
                
                // Calculate direction and distance
                const direction = new THREE.Vector3().subVectors(bodyB.position, bodyA.position);
                const distanceSq = direction.lengthSq();
                const distance = Math.sqrt(distanceSq);
                
                // Avoid division by zero and softening for close encounters
                const softening = (bodyA.radius + bodyB.radius) * 0.5;
                const effectiveDistanceSq = distanceSq + softening * softening;
                
                // Calculate gravitational force magnitude: F = G * m1 * m2 / r^2
                const forceMagnitude = this.G * bodyA.mass * bodyB.mass / effectiveDistanceSq;
                
                // Normalize direction and scale by force
                direction.normalize();
                
                // Apply acceleration (F = ma, so a = F/m)
                if (!bodyA.isStatic) {
                    const accelA = direction.clone().multiplyScalar(forceMagnitude / bodyA.mass);
                    bodyA.acceleration.add(accelA);
                }
                
                if (!bodyB.isStatic) {
                    const accelB = direction.clone().multiplyScalar(-forceMagnitude / bodyB.mass);
                    bodyB.acceleration.add(accelB);
                }
            }
        }
    }

    /**
     * Update body positions using Velocity Verlet integration
     */
    updateBodies(dt) {
        this.bodies.forEach(body => {
            if (body.isStatic) return;
            
            // Store previous position for interpolation
            body.previousPosition.copy(body.position);
            
            // Velocity Verlet integration
            // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt^2
            const halfDtSq = 0.5 * dt * dt;
            body.position.add(
                body.velocity.clone().multiplyScalar(dt)
            ).add(
                body.acceleration.clone().multiplyScalar(halfDtSq)
            );
            
            // Store old acceleration for velocity update
            const oldAcceleration = body.acceleration.clone();
            
            // Recalculate acceleration at new position would go here
            // For simplicity, we use the same acceleration
            
            // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
            body.velocity.add(
                oldAcceleration.add(body.acceleration).multiplyScalar(0.5 * dt)
            );
            
            // Apply very slight damping for numerical stability
            body.velocity.multiplyScalar(this.velocityDamping);
            
            // Update mesh position
            if (body.mesh) {
                body.mesh.position.copy(body.position);
            }
            
            // Update rotation
            if (body.rotationSpeed) {
                body.mesh.rotation.x += body.rotationSpeed.x * dt;
                body.mesh.rotation.y += body.rotationSpeed.y * dt;
                body.mesh.rotation.z += body.rotationSpeed.z * dt;
            }
        });
    }

    /**
     * Update interactive objects with local gravity
     */
    updateInteractiveObjects(dt) {
        this.interactiveObjects.forEach(obj => {
            if (obj.isHeld || obj.isStatic) return;
            
            // Find nearest celestial body for gravity
            let nearestBody = null;
            let nearestDistance = Infinity;
            
            this.bodies.forEach(body => {
                const distance = obj.position.distanceTo(body.position);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestBody = body;
                }
            });
            
            if (nearestBody) {
                // Apply gravitational acceleration toward nearest body
                const direction = new THREE.Vector3().subVectors(nearestBody.position, obj.position);
                const distanceSq = direction.lengthSq();
                const distance = Math.sqrt(distanceSq);
                
                // Check if on surface
                const surfaceDistance = distance - nearestBody.radius;
                
                if (surfaceDistance > 0.1) {
                    // In flight - apply gravity
                    const gravityMagnitude = this.G * nearestBody.mass / distanceSq;
                    direction.normalize().multiplyScalar(gravityMagnitude * dt);
                    obj.velocity.add(direction);
                } else {
                    // On surface - apply friction and stop falling
                    obj.velocity.multiplyScalar(0.9);
                    
                    // Prevent sinking
                    const surfaceNormal = obj.position.clone().sub(nearestBody.position).normalize();
                    const targetDistance = nearestBody.radius + obj.radius + 0.1;
                    obj.position.copy(nearestBody.position).add(surfaceNormal.multiplyScalar(targetDistance));
                }
            }
            
            // Update position
            obj.previousPosition.copy(obj.position);
            obj.position.add(obj.velocity.clone().multiplyScalar(dt));
            
            // Update mesh
            if (obj.mesh) {
                obj.mesh.position.copy(obj.position);
            }
        });
    }

    /**
     * Check for collisions between objects
     */
    checkCollisions() {
        // Check player collision with celestial bodies
        if (this.player) {
            this.bodies.forEach(body => {
                const distance = this.player.position.distanceTo(body.position);
                const collisionDistance = body.radius + this.player.radius;
                
                if (distance < collisionDistance) {
                    // Player is colliding with/on the surface
                    EventBus.emit('playerSurfaceContact', { body, distance });
                }
            });
        }
        
        // Check interactive object collisions
        for (let i = 0; i < this.interactiveObjects.length; i++) {
            const objA = this.interactiveObjects[i];
            
            // Check against other interactive objects
            for (let j = i + 1; j < this.interactiveObjects.length; j++) {
                const objB = this.interactiveObjects[j];
                
                const distance = objA.position.distanceTo(objB.position);
                const collisionDistance = objA.radius + objB.radius;
                
                if (distance < collisionDistance) {
                    this.resolveCollision(objA, objB, distance, collisionDistance);
                }
            }
        }
    }

    /**
     * Resolve collision between two objects
     */
    resolveCollision(objA, objB, distance, collisionDistance) {
        // Calculate overlap
        const overlap = collisionDistance - distance;
        
        // Calculate collision normal
        const normal = new THREE.Vector3().subVectors(objB.position, objA.position).normalize();
        
        // Separate objects
        const separation = normal.clone().multiplyScalar(overlap * 0.5);
        if (!objA.isStatic && !objA.isHeld) objA.position.sub(separation);
        if (!objB.isStatic && !objB.isHeld) objB.position.add(separation);
        
        // Calculate relative velocity
        const relativeVelocity = new THREE.Vector3().subVectors(objB.velocity, objA.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);
        
        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;
        
        // Calculate restitution (bounciness)
        const restitution = 0.3;
        
        // Calculate impulse magnitude
        const impulseMagnitude = -(1 + restitution) * velocityAlongNormal;
        const totalMass = objA.mass + objB.mass;
        
        // Apply impulse
        const impulse = normal.clone().multiplyScalar(impulseMagnitude);
        if (!objA.isStatic && !objA.isHeld) {
            objA.velocity.sub(impulse.clone().multiplyScalar(1 / objA.mass));
        }
        if (!objB.isStatic && !objB.isHeld) {
            objB.velocity.add(impulse.clone().multiplyScalar(1 / objB.mass));
        }
    }

    /**
     * Interpolate positions for smooth rendering
     */
    interpolatePositions(alpha) {
        this.bodies.forEach(body => {
            if (body.mesh && body.previousPosition) {
                body.mesh.position.lerpVectors(body.previousPosition, body.position, alpha);
            }
        });
        
        this.interactiveObjects.forEach(obj => {
            if (obj.mesh && obj.previousPosition) {
                obj.mesh.position.lerpVectors(obj.previousPosition, obj.position, alpha);
            }
        });
    }

    /**
     * Get gravity vector at a specific position
     */
    getGravityAt(position) {
        const gravity = new THREE.Vector3(0, 0, 0);
        
        this.bodies.forEach(body => {
            const direction = new THREE.Vector3().subVectors(body.position, position);
            const distanceSq = direction.lengthSq();
            
            if (distanceSq < 0.001) return;
            
            const distance = Math.sqrt(distanceSq);
            const forceMagnitude = this.G * body.mass / distanceSq;
            
            direction.normalize().multiplyScalar(forceMagnitude);
            gravity.add(direction);
        });
        
        return gravity;
    }

    /**
     * Get the nearest celestial body to a position
     */
    getNearestBody(position) {
        let nearest = null;
        let nearestDistance = Infinity;
        
        this.bodies.forEach(body => {
            const distance = position.distanceTo(body.position);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = body;
            }
        });
        
        return { body: nearest, distance: nearestDistance };
    }

    /**
     * Get surface normal at a position relative to nearest body
     */
    getSurfaceNormal(position) {
        const { body } = this.getNearestBody(position);
        if (!body) return new THREE.Vector3(0, 1, 0);
        
        return new THREE.Vector3().subVectors(position, body.position).normalize();
    }

    /**
     * Check if position is on a surface
     */
    isOnSurface(position, radius = 0) {
        const { body, distance } = this.getNearestBody(position);
        if (!body) return false;
        
        const surfaceDistance = distance - body.radius - radius;
        return surfaceDistance < 0.5;
    }

    /**
     * Raycast against celestial bodies
     */
    raycast(origin, direction, maxDistance = 10000) {
        const ray = new THREE.Ray(origin, direction.normalize());
        let closestHit = null;
        let closestDistance = maxDistance;
        
        this.bodies.forEach(body => {
            const sphere = new THREE.Sphere(body.position, body.radius);
            const intersection = new THREE.Vector3();
            
            if (ray.intersectSphere(sphere, intersection)) {
                const distance = origin.distanceTo(intersection);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestHit = {
                        body,
                        point: intersection.clone(),
                        distance,
                        normal: intersection.clone().sub(body.position).normalize()
                    };
                }
            }
        });
        
        return closestHit;
    }

    /**
     * Pause/unpause physics
     */
    setPaused(paused) {
        this.isPaused = paused;
        Logger.physics(`Physics ${paused ? 'paused' : 'resumed'}`);
    }

    /**
     * Reset all bodies to initial state
     */
    reset() {
        this.bodies.forEach(body => {
            if (body.initialState) {
                body.position.copy(body.initialState.position);
                body.velocity.copy(body.initialState.velocity);
                body.acceleration.set(0, 0, 0);
            }
        });
        Logger.physics('Physics world reset');
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            bodyCount: this.bodies.length,
            interactiveCount: this.interactiveObjects.length,
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            bodies: this.bodies.map(b => ({
                name: b.name,
                position: b.position.clone(),
                velocity: b.velocity.clone(),
                speed: b.velocity.length()
            }))
        };
    }
}

export default PhysicsWorld;
