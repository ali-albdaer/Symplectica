/**
 * Physics.js - N-Body Gravitational Physics Engine
 * 
 * Implements accurate gravitational physics with multiple integration methods.
 * All celestial bodies exert gravitational forces on each other.
 */

import Config from './Config.js';
import Utils from './Utils.js';
import Debug from './Debug.js';

class Physics {
    constructor() {
        this.bodies = [];
        this.interactiveObjects = [];
        this.isRunning = false;
        this.lastTime = 0;
        this.accumulator = 0;
        this.fixedDeltaTime = 1 / 60; // 60 Hz physics update
        
        // Performance metrics
        this.physicsTime = 0;
        this.bodyCount = 0;
    }
    
    /**
     * Initialize physics engine
     */
    init() {
        Debug.info('Physics engine initialized');
        this.isRunning = true;
    }
    
    /**
     * Register a celestial body for physics simulation
     */
    addBody(body) {
        this.bodies.push(body);
        this.bodyCount = this.bodies.length;
        Debug.info(`Physics: Added body "${body.name}" (total: ${this.bodyCount})`);
    }
    
    /**
     * Remove a body from simulation
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
            this.bodyCount = this.bodies.length;
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
     * Main physics update - called each frame
     */
    update(deltaTime) {
        if (!this.isRunning) return;
        
        const startTime = performance.now();
        
        // Apply time scale
        const scaledDelta = deltaTime * Config.physics.timeScale;
        
        // Fixed timestep with accumulator for stability
        this.accumulator += scaledDelta;
        
        const substeps = Config.physics.substeps;
        const stepDelta = this.fixedDeltaTime / substeps;
        
        while (this.accumulator >= this.fixedDeltaTime) {
            for (let i = 0; i < substeps; i++) {
                this.physicsStep(stepDelta);
            }
            this.accumulator -= this.fixedDeltaTime;
        }
        
        // Update interactive objects
        this.updateInteractiveObjects(deltaTime);
        
        this.physicsTime = performance.now() - startTime;
    }
    
    /**
     * Single physics step
     */
    physicsStep(dt) {
        const method = Config.physics.integrationMethod;
        
        switch (method) {
            case 'euler':
                this.integrateEuler(dt);
                break;
            case 'verlet':
                this.integrateVerlet(dt);
                break;
            case 'rk4':
                this.integrateRK4(dt);
                break;
            default:
                this.integrateVerlet(dt);
        }
        
        // Handle collisions if enabled
        if (Config.physics.collisionEnabled) {
            this.handleCollisions();
        }
    }
    
    /**
     * Calculate gravitational force between two bodies
     */
    calculateGravitationalForce(body1, body2) {
        const G = Config.physics.G;
        const minDist = Config.physics.minDistance;
        
        // Direction vector from body1 to body2
        const dx = body2.position.x - body1.position.x;
        const dy = body2.position.y - body1.position.y;
        const dz = body2.position.z - body1.position.z;
        
        // Distance
        let distSq = dx * dx + dy * dy + dz * dz;
        let dist = Math.sqrt(distSq);
        
        // Prevent division by zero and extreme forces
        if (dist < minDist) {
            dist = minDist;
            distSq = minDist * minDist;
        }
        
        // Gravitational force magnitude: F = G * m1 * m2 / r²
        const forceMag = (G * body1.mass * body2.mass) / distSq;
        
        // Normalize direction and scale by force
        const forceX = (dx / dist) * forceMag;
        const forceY = (dy / dist) * forceMag;
        const forceZ = (dz / dist) * forceMag;
        
        return { x: forceX, y: forceY, z: forceZ };
    }
    
    /**
     * Calculate net acceleration for a body due to all other bodies
     */
    calculateAcceleration(body, bodies) {
        let ax = 0, ay = 0, az = 0;
        const G = Config.physics.G;
        const minDist = Config.physics.minDistance;
        
        for (const other of bodies) {
            if (other === body) continue;
            
            const dx = other.position.x - body.position.x;
            const dy = other.position.y - body.position.y;
            const dz = other.position.z - body.position.z;
            
            let distSq = dx * dx + dy * dy + dz * dz;
            let dist = Math.sqrt(distSq);
            
            if (dist < minDist) {
                dist = minDist;
                distSq = minDist * minDist;
            }
            
            // a = G * M / r² (acceleration due to other body)
            const accelMag = (G * other.mass) / distSq;
            
            ax += (dx / dist) * accelMag;
            ay += (dy / dist) * accelMag;
            az += (dz / dist) * accelMag;
        }
        
        return { x: ax, y: ay, z: az };
    }
    
    /**
     * Euler integration (simple but less accurate)
     */
    integrateEuler(dt) {
        const maxVel = Config.physics.maxVelocity;
        
        // Calculate accelerations for all bodies
        const accelerations = this.bodies.map(body => 
            this.calculateAcceleration(body, this.bodies)
        );
        
        // Update velocities and positions
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            
            const accel = accelerations[i];
            
            // Update velocity: v = v + a * dt
            body.velocity.x += accel.x * dt;
            body.velocity.y += accel.y * dt;
            body.velocity.z += accel.z * dt;
            
            // Clamp velocity
            const speed = Utils.magnitude3D(body.velocity);
            if (speed > maxVel) {
                const scale = maxVel / speed;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }
            
            // Update position: x = x + v * dt
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
        });
    }
    
    /**
     * Velocity Verlet integration (more accurate, energy-conserving)
     */
    integrateVerlet(dt) {
        const maxVel = Config.physics.maxVelocity;
        
        // Calculate current accelerations
        const accelerations = this.bodies.map(body => 
            this.calculateAcceleration(body, this.bodies)
        );
        
        // Update positions using current velocity and acceleration
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            
            const accel = accelerations[i];
            
            // x = x + v*dt + 0.5*a*dt²
            body.position.x += body.velocity.x * dt + 0.5 * accel.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * accel.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * accel.z * dt * dt;
        });
        
        // Calculate new accelerations
        const newAccelerations = this.bodies.map(body => 
            this.calculateAcceleration(body, this.bodies)
        );
        
        // Update velocities using average acceleration
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            
            const accel = accelerations[i];
            const newAccel = newAccelerations[i];
            
            // v = v + 0.5*(a + a')*dt
            body.velocity.x += 0.5 * (accel.x + newAccel.x) * dt;
            body.velocity.y += 0.5 * (accel.y + newAccel.y) * dt;
            body.velocity.z += 0.5 * (accel.z + newAccel.z) * dt;
            
            // Clamp velocity
            const speed = Utils.magnitude3D(body.velocity);
            if (speed > maxVel) {
                const scale = maxVel / speed;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }
        });
    }
    
    /**
     * 4th-order Runge-Kutta integration (most accurate, more expensive)
     */
    integrateRK4(dt) {
        const maxVel = Config.physics.maxVelocity;
        
        // Store original state
        const originalStates = this.bodies.map(body => ({
            pos: { ...body.position },
            vel: { ...body.velocity }
        }));
        
        // k1
        const k1 = this.bodies.map((body, i) => {
            const accel = this.calculateAcceleration(body, this.bodies);
            return {
                dx: body.velocity.x,
                dy: body.velocity.y,
                dz: body.velocity.z,
                dvx: accel.x,
                dvy: accel.y,
                dvz: accel.z
            };
        });
        
        // Apply k1 * dt/2
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            body.position.x = originalStates[i].pos.x + k1[i].dx * dt * 0.5;
            body.position.y = originalStates[i].pos.y + k1[i].dy * dt * 0.5;
            body.position.z = originalStates[i].pos.z + k1[i].dz * dt * 0.5;
            body.velocity.x = originalStates[i].vel.x + k1[i].dvx * dt * 0.5;
            body.velocity.y = originalStates[i].vel.y + k1[i].dvy * dt * 0.5;
            body.velocity.z = originalStates[i].vel.z + k1[i].dvz * dt * 0.5;
        });
        
        // k2
        const k2 = this.bodies.map((body, i) => {
            const accel = this.calculateAcceleration(body, this.bodies);
            return {
                dx: body.velocity.x,
                dy: body.velocity.y,
                dz: body.velocity.z,
                dvx: accel.x,
                dvy: accel.y,
                dvz: accel.z
            };
        });
        
        // Apply k2 * dt/2
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            body.position.x = originalStates[i].pos.x + k2[i].dx * dt * 0.5;
            body.position.y = originalStates[i].pos.y + k2[i].dy * dt * 0.5;
            body.position.z = originalStates[i].pos.z + k2[i].dz * dt * 0.5;
            body.velocity.x = originalStates[i].vel.x + k2[i].dvx * dt * 0.5;
            body.velocity.y = originalStates[i].vel.y + k2[i].dvy * dt * 0.5;
            body.velocity.z = originalStates[i].vel.z + k2[i].dvz * dt * 0.5;
        });
        
        // k3
        const k3 = this.bodies.map((body, i) => {
            const accel = this.calculateAcceleration(body, this.bodies);
            return {
                dx: body.velocity.x,
                dy: body.velocity.y,
                dz: body.velocity.z,
                dvx: accel.x,
                dvy: accel.y,
                dvz: accel.z
            };
        });
        
        // Apply k3 * dt
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            body.position.x = originalStates[i].pos.x + k3[i].dx * dt;
            body.position.y = originalStates[i].pos.y + k3[i].dy * dt;
            body.position.z = originalStates[i].pos.z + k3[i].dz * dt;
            body.velocity.x = originalStates[i].vel.x + k3[i].dvx * dt;
            body.velocity.y = originalStates[i].vel.y + k3[i].dvy * dt;
            body.velocity.z = originalStates[i].vel.z + k3[i].dvz * dt;
        });
        
        // k4
        const k4 = this.bodies.map((body, i) => {
            const accel = this.calculateAcceleration(body, this.bodies);
            return {
                dx: body.velocity.x,
                dy: body.velocity.y,
                dz: body.velocity.z,
                dvx: accel.x,
                dvy: accel.y,
                dvz: accel.z
            };
        });
        
        // Final integration: y = y0 + (k1 + 2*k2 + 2*k3 + k4) * dt / 6
        this.bodies.forEach((body, i) => {
            if (body.isStatic) return;
            
            const orig = originalStates[i];
            
            body.position.x = orig.pos.x + (k1[i].dx + 2*k2[i].dx + 2*k3[i].dx + k4[i].dx) * dt / 6;
            body.position.y = orig.pos.y + (k1[i].dy + 2*k2[i].dy + 2*k3[i].dy + k4[i].dy) * dt / 6;
            body.position.z = orig.pos.z + (k1[i].dz + 2*k2[i].dz + 2*k3[i].dz + k4[i].dz) * dt / 6;
            
            body.velocity.x = orig.vel.x + (k1[i].dvx + 2*k2[i].dvx + 2*k3[i].dvx + k4[i].dvx) * dt / 6;
            body.velocity.y = orig.vel.y + (k1[i].dvy + 2*k2[i].dvy + 2*k3[i].dvy + k4[i].dvy) * dt / 6;
            body.velocity.z = orig.vel.z + (k1[i].dvz + 2*k2[i].dvz + 2*k3[i].dvz + k4[i].dvz) * dt / 6;
            
            // Clamp velocity
            const speed = Utils.magnitude3D(body.velocity);
            if (speed > maxVel) {
                const scale = maxVel / speed;
                body.velocity.x *= scale;
                body.velocity.y *= scale;
                body.velocity.z *= scale;
            }
        });
    }
    
    /**
     * Handle collisions between bodies
     */
    handleCollisions() {
        const elasticity = Config.physics.collisionElasticity;
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body1 = this.bodies[i];
                const body2 = this.bodies[j];
                
                const dist = Utils.distance3D(body1.position, body2.position);
                const minDist = body1.radius + body2.radius;
                
                if (dist < minDist) {
                    // Collision detected - elastic collision response
                    this.resolveCollision(body1, body2, dist, minDist, elasticity);
                }
            }
        }
    }
    
    /**
     * Resolve collision between two bodies
     */
    resolveCollision(body1, body2, dist, minDist, elasticity) {
        // Normal vector
        const nx = (body2.position.x - body1.position.x) / dist;
        const ny = (body2.position.y - body1.position.y) / dist;
        const nz = (body2.position.z - body1.position.z) / dist;
        
        // Relative velocity
        const dvx = body1.velocity.x - body2.velocity.x;
        const dvy = body1.velocity.y - body2.velocity.y;
        const dvz = body1.velocity.z - body2.velocity.z;
        
        // Relative velocity along normal
        const dvn = dvx * nx + dvy * ny + dvz * nz;
        
        // Don't resolve if moving apart
        if (dvn > 0) return;
        
        // Calculate impulse
        const totalMass = body1.mass + body2.mass;
        const impulse = -(1 + elasticity) * dvn / totalMass;
        
        // Apply impulse
        if (!body1.isStatic) {
            body1.velocity.x += impulse * body2.mass * nx;
            body1.velocity.y += impulse * body2.mass * ny;
            body1.velocity.z += impulse * body2.mass * nz;
        }
        
        if (!body2.isStatic) {
            body2.velocity.x -= impulse * body1.mass * nx;
            body2.velocity.y -= impulse * body1.mass * ny;
            body2.velocity.z -= impulse * body1.mass * nz;
        }
        
        // Separate bodies
        const overlap = minDist - dist;
        const separationRatio1 = body1.isStatic ? 0 : body2.mass / totalMass;
        const separationRatio2 = body2.isStatic ? 0 : body1.mass / totalMass;
        
        body1.position.x -= nx * overlap * separationRatio1;
        body1.position.y -= ny * overlap * separationRatio1;
        body1.position.z -= nz * overlap * separationRatio1;
        
        body2.position.x += nx * overlap * separationRatio2;
        body2.position.y += ny * overlap * separationRatio2;
        body2.position.z += nz * overlap * separationRatio2;
    }
    
    /**
     * Update interactive objects with gravitational influence
     */
    updateInteractiveObjects(dt) {
        const G = Config.physics.G;
        const drag = Config.interactiveObjects.dragCoefficient;
        
        for (const obj of this.interactiveObjects) {
            if (obj.isHeld) continue;
            
            // Calculate gravitational acceleration from all celestial bodies
            let ax = 0, ay = 0, az = 0;
            
            for (const body of this.bodies) {
                const dx = body.position.x - obj.position.x;
                const dy = body.position.y - obj.position.y;
                const dz = body.position.z - obj.position.z;
                
                let distSq = dx * dx + dy * dy + dz * dz;
                let dist = Math.sqrt(distSq);
                
                if (dist < Config.physics.minDistance) {
                    dist = Config.physics.minDistance;
                    distSq = dist * dist;
                }
                
                const accelMag = (G * body.mass) / distSq;
                
                ax += (dx / dist) * accelMag;
                ay += (dy / dist) * accelMag;
                az += (dz / dist) * accelMag;
            }
            
            // Update velocity
            obj.velocity.x += ax * dt;
            obj.velocity.y += ay * dt;
            obj.velocity.z += az * dt;
            
            // Apply drag (space drag for gameplay feel)
            obj.velocity.x *= drag;
            obj.velocity.y *= drag;
            obj.velocity.z *= drag;
            
            // Update position
            obj.position.x += obj.velocity.x * dt;
            obj.position.y += obj.velocity.y * dt;
            obj.position.z += obj.velocity.z * dt;
        }
    }
    
    /**
     * Calculate orbital velocity for a circular orbit
     */
    getOrbitalVelocity(centralMass, distance) {
        return Math.sqrt(Config.physics.G * centralMass / distance);
    }
    
    /**
     * Calculate escape velocity at a given distance from a mass
     */
    getEscapeVelocity(mass, distance) {
        return Math.sqrt(2 * Config.physics.G * mass / distance);
    }
    
    /**
     * Get total kinetic energy of the system
     */
    getTotalKineticEnergy() {
        let ke = 0;
        for (const body of this.bodies) {
            const speedSq = body.velocity.x ** 2 + body.velocity.y ** 2 + body.velocity.z ** 2;
            ke += 0.5 * body.mass * speedSq;
        }
        return ke;
    }
    
    /**
     * Get total potential energy of the system
     */
    getTotalPotentialEnergy() {
        let pe = 0;
        const G = Config.physics.G;
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const dist = Utils.distance3D(
                    this.bodies[i].position,
                    this.bodies[j].position
                );
                pe -= G * this.bodies[i].mass * this.bodies[j].mass / dist;
            }
        }
        return pe;
    }
    
    /**
     * Pause physics simulation
     */
    pause() {
        this.isRunning = false;
    }
    
    /**
     * Resume physics simulation
     */
    resume() {
        this.isRunning = true;
    }
    
    /**
     * Toggle physics simulation
     */
    toggle() {
        this.isRunning = !this.isRunning;
    }
}

// Export singleton instance
const physics = new Physics();
export default physics;
