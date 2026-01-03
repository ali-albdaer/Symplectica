/**
 * Physics Engine
 * Handles gravitational interactions, collisions, and rigid body dynamics
 * Uses Verlet integration for stable orbital mechanics
 */

import { Config, PHYSICS } from './config.js';
import { Vector3, Quaternion, Matrix4 } from './Math3D.js';

export class PhysicsEngine {
    constructor() {
        this.bodies = [];           // All physics bodies
        this.celestialBodies = [];  // Celestial bodies (planets, moons, stars)
        this.dynamicBodies = [];    // Player, objects
        this.constraints = [];
        this.collisionPairs = [];
        
        this.accumulator = 0;
        this.fixedDeltaTime = 1 / 60;  // Fixed physics step
        
        // Spatial partitioning for collision detection
        this.octree = null;
        
        // Performance metrics
        this.lastUpdateTime = 0;
        this.physicsTime = 0;
    }
    
    /**
     * Add a physics body to the simulation
     */
    addBody(body) {
        this.bodies.push(body);
        
        if (body.type === 'celestial') {
            this.celestialBodies.push(body);
        } else {
            this.dynamicBodies.push(body);
        }
        
        return body;
    }
    
    /**
     * Remove a physics body
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
        
        const celestialIndex = this.celestialBodies.indexOf(body);
        if (celestialIndex > -1) {
            this.celestialBodies.splice(celestialIndex, 1);
        }
        
        const dynamicIndex = this.dynamicBodies.indexOf(body);
        if (dynamicIndex > -1) {
            this.dynamicBodies.splice(dynamicIndex, 1);
        }
    }
    
    /**
     * Main physics update - called every frame
     */
    update(deltaTime) {
        const startTime = performance.now();
        
        if (Config.debug.pausePhysics) {
            return;
        }
        
        // Apply time scale
        const scaledDelta = deltaTime * Config.physics.TIME_SCALE;
        
        // Fixed timestep accumulator for stability
        this.accumulator += scaledDelta;
        
        const steps = Config.physics.PHYSICS_STEPS;
        const subStep = this.fixedDeltaTime / steps;
        
        while (this.accumulator >= this.fixedDeltaTime) {
            for (let i = 0; i < steps; i++) {
                this.step(subStep);
            }
            this.accumulator -= this.fixedDeltaTime;
        }
        
        // Interpolate for smooth rendering
        const alpha = this.accumulator / this.fixedDeltaTime;
        this.interpolate(alpha);
        
        this.physicsTime = performance.now() - startTime;
    }
    
    /**
     * Single physics step
     */
    step(dt) {
        // Calculate all gravitational forces
        this.calculateGravitationalForces();
        
        // Update celestial body positions (N-body simulation)
        this.integrateCelestialBodies(dt);
        
        // Update dynamic bodies
        this.integrateDynamicBodies(dt);
        
        // Detect and resolve collisions
        this.detectCollisions();
        this.resolveCollisions();
        
        // Handle constraints
        this.solveConstraints();
    }
    
    /**
     * Calculate gravitational forces between all celestial bodies
     * Uses Barnes-Hut approximation for optimization when many bodies
     */
    calculateGravitationalForces() {
        const G = Config.physics.G;
        const scale = Config.physics.SCALE;
        const minDist = Config.physics.MIN_DISTANCE;
        
        // Reset accelerations
        for (const body of this.celestialBodies) {
            body.acceleration.set(0, 0, 0);
        }
        
        // O(n²) direct calculation - acceptable for small number of bodies
        for (let i = 0; i < this.celestialBodies.length; i++) {
            const bodyA = this.celestialBodies[i];
            
            for (let j = i + 1; j < this.celestialBodies.length; j++) {
                const bodyB = this.celestialBodies[j];
                
                // Calculate distance vector
                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;
                
                let distSq = dx * dx + dy * dy + dz * dz;
                distSq = Math.max(distSq, minDist * minDist);
                const dist = Math.sqrt(distSq);
                
                // Gravitational force magnitude: F = G * m1 * m2 / r²
                // Scaled for world units
                const forceMag = G * bodyA.mass * bodyB.mass / (distSq * scale * scale);
                
                // Force direction (normalized)
                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;
                
                // Apply acceleration (F = ma, so a = F/m)
                const accA = forceMag / bodyA.mass;
                const accB = forceMag / bodyB.mass;
                
                bodyA.acceleration.x += nx * accA;
                bodyA.acceleration.y += ny * accA;
                bodyA.acceleration.z += nz * accA;
                
                bodyB.acceleration.x -= nx * accB;
                bodyB.acceleration.y -= ny * accB;
                bodyB.acceleration.z -= nz * accB;
            }
        }
    }
    
    /**
     * Integrate celestial bodies using Velocity Verlet
     * More stable for orbital mechanics than Euler
     */
    integrateCelestialBodies(dt) {
        for (const body of this.celestialBodies) {
            // Store previous position for interpolation
            body.previousPosition.copy(body.position);
            
            // Velocity Verlet integration
            // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
            body.position.x += body.velocity.x * dt + 0.5 * body.acceleration.x * dt * dt;
            body.position.y += body.velocity.y * dt + 0.5 * body.acceleration.y * dt * dt;
            body.position.z += body.velocity.z * dt + 0.5 * body.acceleration.z * dt * dt;
            
            // Store old acceleration
            const oldAcc = body.acceleration.clone();
            
            // Recalculate acceleration at new position
            // (In practice, we'll use the acceleration from next frame)
            
            // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
            body.velocity.x += 0.5 * (oldAcc.x + body.acceleration.x) * dt;
            body.velocity.y += 0.5 * (oldAcc.y + body.acceleration.y) * dt;
            body.velocity.z += 0.5 * (oldAcc.z + body.acceleration.z) * dt;
            
            // Update rotation
            body.rotation += body.angularVelocity * dt;
        }
    }
    
    /**
     * Integrate dynamic bodies (player, objects)
     * Includes collision with celestial body surfaces
     */
    integrateDynamicBodies(dt) {
        for (const body of this.dynamicBodies) {
            if (body.isStatic) continue;
            
            // Store previous position
            body.previousPosition.copy(body.position);
            
            // Find nearest celestial body for local gravity
            const gravity = this.calculateLocalGravity(body);
            
            // Apply gravity
            body.acceleration.x += gravity.x;
            body.acceleration.y += gravity.y;
            body.acceleration.z += gravity.z;
            
            // Apply drag/air resistance
            if (body.inAtmosphere) {
                const speed = body.velocity.length();
                if (speed > 0) {
                    const dragMag = Config.physics.AIR_RESISTANCE * speed * speed;
                    body.velocity.x -= (body.velocity.x / speed) * dragMag * dt;
                    body.velocity.y -= (body.velocity.y / speed) * dragMag * dt;
                    body.velocity.z -= (body.velocity.z / speed) * dragMag * dt;
                }
            }
            
            // Semi-implicit Euler (good for game physics)
            body.velocity.x += body.acceleration.x * dt;
            body.velocity.y += body.acceleration.y * dt;
            body.velocity.z += body.acceleration.z * dt;
            
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
            
            // Reset acceleration for next frame
            body.acceleration.set(0, 0, 0);
            
            // Check for surface collision
            this.checkSurfaceCollision(body);
        }
    }
    
    /**
     * Calculate local gravity at a body's position
     */
    calculateLocalGravity(body) {
        const gravity = new Vector3(0, 0, 0);
        const G = Config.physics.G;
        const scale = Config.physics.SCALE;
        
        for (const celestial of this.celestialBodies) {
            const dx = celestial.position.x - body.position.x;
            const dy = celestial.position.y - body.position.y;
            const dz = celestial.position.z - body.position.z;
            
            const distSq = dx * dx + dy * dy + dz * dz;
            const dist = Math.sqrt(distSq);
            
            if (dist < 0.0001) continue;
            
            // g = GM/r²
            const gMag = G * celestial.mass / (distSq * scale * scale);
            
            gravity.x += (dx / dist) * gMag;
            gravity.y += (dy / dist) * gMag;
            gravity.z += (dz / dist) * gMag;
        }
        
        return gravity;
    }
    
    /**
     * Get the dominant gravity source for a position
     */
    getDominantGravitySource(position) {
        let maxGravity = 0;
        let dominantBody = null;
        const G = Config.physics.G;
        const scale = Config.physics.SCALE;
        
        for (const celestial of this.celestialBodies) {
            const dx = celestial.position.x - position.x;
            const dy = celestial.position.y - position.y;
            const dz = celestial.position.z - position.z;
            
            const distSq = dx * dx + dy * dy + dz * dz;
            const gMag = G * celestial.mass / (distSq * scale * scale);
            
            if (gMag > maxGravity) {
                maxGravity = gMag;
                dominantBody = celestial;
            }
        }
        
        return { body: dominantBody, magnitude: maxGravity };
    }
    
    /**
     * Check if a dynamic body is colliding with a celestial body surface
     */
    checkSurfaceCollision(body) {
        for (const celestial of this.celestialBodies) {
            const dx = body.position.x - celestial.position.x;
            const dy = body.position.y - celestial.position.y;
            const dz = body.position.z - celestial.position.z;
            
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const surfaceRadius = celestial.scaledRadius + body.radius;
            
            if (dist < surfaceRadius) {
                // Collision with surface
                const penetration = surfaceRadius - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                const nz = dz / dist;
                
                // Push body out
                body.position.x += nx * penetration;
                body.position.y += ny * penetration;
                body.position.z += nz * penetration;
                
                // Calculate relative velocity in normal direction
                const velDotN = body.velocity.x * nx + body.velocity.y * ny + body.velocity.z * nz;
                
                // Only resolve if moving towards surface
                if (velDotN < 0) {
                    const restitution = Config.physics.COLLISION_ELASTICITY;
                    
                    // Remove normal component and apply restitution
                    body.velocity.x -= (1 + restitution) * velDotN * nx;
                    body.velocity.y -= (1 + restitution) * velDotN * ny;
                    body.velocity.z -= (1 + restitution) * velDotN * nz;
                    
                    // Apply friction to tangential component
                    const friction = Config.physics.FRICTION_COEFFICIENT;
                    const tangentX = body.velocity.x - velDotN * nx;
                    const tangentY = body.velocity.y - velDotN * ny;
                    const tangentZ = body.velocity.z - velDotN * nz;
                    
                    body.velocity.x -= tangentX * friction;
                    body.velocity.y -= tangentY * friction;
                    body.velocity.z -= tangentZ * friction;
                    
                    // Mark as grounded
                    body.isGrounded = true;
                    body.groundNormal = new Vector3(nx, ny, nz);
                    body.currentPlanet = celestial;
                }
            } else {
                if (body.currentPlanet === celestial) {
                    body.isGrounded = false;
                    body.groundNormal = null;
                }
            }
            
            // Check atmosphere
            if (celestial.atmosphereRadius && dist < celestial.atmosphereRadius) {
                body.inAtmosphere = true;
                body.atmosphereDensity = this.getAtmosphereDensity(celestial, dist);
            }
        }
    }
    
    /**
     * Get atmosphere density at altitude
     */
    getAtmosphereDensity(celestial, altitude) {
        if (!celestial.atmosphereHeight) return 0;
        
        const surfaceAlt = altitude - celestial.scaledRadius;
        if (surfaceAlt < 0) return celestial.atmosphereDensity || 1;
        if (surfaceAlt > celestial.atmosphereHeight) return 0;
        
        // Exponential falloff
        const scaleHeight = celestial.atmosphereHeight / 5;
        return (celestial.atmosphereDensity || 1) * Math.exp(-surfaceAlt / scaleHeight);
    }
    
    /**
     * Broad phase collision detection
     */
    detectCollisions() {
        this.collisionPairs = [];
        
        // Simple O(n²) for now - can optimize with spatial partitioning
        for (let i = 0; i < this.dynamicBodies.length; i++) {
            const bodyA = this.dynamicBodies[i];
            
            for (let j = i + 1; j < this.dynamicBodies.length; j++) {
                const bodyB = this.dynamicBodies[j];
                
                // AABB check first
                if (this.aabbIntersect(bodyA, bodyB)) {
                    // Detailed collision check
                    const collision = this.checkCollision(bodyA, bodyB);
                    if (collision) {
                        this.collisionPairs.push(collision);
                    }
                }
            }
        }
    }
    
    /**
     * AABB intersection test
     */
    aabbIntersect(a, b) {
        const ar = a.boundingRadius || a.radius || 1;
        const br = b.boundingRadius || b.radius || 1;
        
        const dx = Math.abs(a.position.x - b.position.x);
        const dy = Math.abs(a.position.y - b.position.y);
        const dz = Math.abs(a.position.z - b.position.z);
        
        return dx < ar + br && dy < ar + br && dz < ar + br;
    }
    
    /**
     * Detailed collision check between two bodies
     */
    checkCollision(a, b) {
        // Sphere-sphere collision for simplicity
        const dx = b.position.x - a.position.x;
        const dy = b.position.y - a.position.y;
        const dz = b.position.z - a.position.z;
        
        const distSq = dx * dx + dy * dy + dz * dz;
        const radSum = (a.radius || 0.5) + (b.radius || 0.5);
        
        if (distSq < radSum * radSum) {
            const dist = Math.sqrt(distSq);
            return {
                bodyA: a,
                bodyB: b,
                normal: new Vector3(dx / dist, dy / dist, dz / dist),
                penetration: radSum - dist,
                point: new Vector3(
                    a.position.x + dx * 0.5,
                    a.position.y + dy * 0.5,
                    a.position.z + dz * 0.5
                )
            };
        }
        
        return null;
    }
    
    /**
     * Resolve collision pairs
     */
    resolveCollisions() {
        for (const collision of this.collisionPairs) {
            const { bodyA, bodyB, normal, penetration } = collision;
            
            // Skip if both static
            if (bodyA.isStatic && bodyB.isStatic) continue;
            
            // Separate bodies
            const totalMass = (bodyA.isStatic ? 0 : bodyA.mass) + (bodyB.isStatic ? 0 : bodyB.mass);
            
            if (!bodyA.isStatic) {
                const ratio = bodyB.isStatic ? 1 : bodyB.mass / totalMass;
                bodyA.position.x -= normal.x * penetration * ratio;
                bodyA.position.y -= normal.y * penetration * ratio;
                bodyA.position.z -= normal.z * penetration * ratio;
            }
            
            if (!bodyB.isStatic) {
                const ratio = bodyA.isStatic ? 1 : bodyA.mass / totalMass;
                bodyB.position.x += normal.x * penetration * ratio;
                bodyB.position.y += normal.y * penetration * ratio;
                bodyB.position.z += normal.z * penetration * ratio;
            }
            
            // Calculate relative velocity
            const relVelX = bodyB.velocity.x - bodyA.velocity.x;
            const relVelY = bodyB.velocity.y - bodyA.velocity.y;
            const relVelZ = bodyB.velocity.z - bodyA.velocity.z;
            
            const velAlongNormal = relVelX * normal.x + relVelY * normal.y + relVelZ * normal.z;
            
            // Don't resolve if moving apart
            if (velAlongNormal > 0) continue;
            
            // Restitution
            const restitution = Math.min(
                bodyA.restitution || Config.physics.COLLISION_ELASTICITY,
                bodyB.restitution || Config.physics.COLLISION_ELASTICITY
            );
            
            // Impulse magnitude
            const invMassA = bodyA.isStatic ? 0 : 1 / bodyA.mass;
            const invMassB = bodyB.isStatic ? 0 : 1 / bodyB.mass;
            
            const j = -(1 + restitution) * velAlongNormal / (invMassA + invMassB);
            
            // Apply impulse
            if (!bodyA.isStatic) {
                bodyA.velocity.x -= j * invMassA * normal.x;
                bodyA.velocity.y -= j * invMassA * normal.y;
                bodyA.velocity.z -= j * invMassA * normal.z;
            }
            
            if (!bodyB.isStatic) {
                bodyB.velocity.x += j * invMassB * normal.x;
                bodyB.velocity.y += j * invMassB * normal.y;
                bodyB.velocity.z += j * invMassB * normal.z;
            }
        }
    }
    
    /**
     * Solve position constraints
     */
    solveConstraints() {
        for (const constraint of this.constraints) {
            constraint.solve();
        }
    }
    
    /**
     * Interpolate positions for smooth rendering
     */
    interpolate(alpha) {
        for (const body of this.bodies) {
            if (body.previousPosition) {
                body.renderPosition = new Vector3(
                    body.previousPosition.x + (body.position.x - body.previousPosition.x) * alpha,
                    body.previousPosition.y + (body.position.y - body.previousPosition.y) * alpha,
                    body.previousPosition.z + (body.position.z - body.previousPosition.z) * alpha
                );
            } else {
                body.renderPosition = body.position.clone();
            }
        }
    }
    
    /**
     * Raycast against all bodies
     */
    raycast(origin, direction, maxDistance = Infinity) {
        let closest = null;
        let closestDist = maxDistance;
        
        for (const body of this.bodies) {
            const result = this.raycastBody(origin, direction, body);
            if (result && result.distance < closestDist) {
                closest = result;
                closestDist = result.distance;
            }
        }
        
        return closest;
    }
    
    /**
     * Raycast against a single body
     */
    raycastBody(origin, direction, body) {
        // Sphere intersection
        const radius = body.radius || body.scaledRadius || 0.5;
        
        const ox = origin.x - body.position.x;
        const oy = origin.y - body.position.y;
        const oz = origin.z - body.position.z;
        
        const a = direction.x * direction.x + direction.y * direction.y + direction.z * direction.z;
        const b = 2 * (ox * direction.x + oy * direction.y + oz * direction.z);
        const c = ox * ox + oy * oy + oz * oz - radius * radius;
        
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) return null;
        
        const t = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        if (t < 0) return null;
        
        const hitPoint = new Vector3(
            origin.x + direction.x * t,
            origin.y + direction.y * t,
            origin.z + direction.z * t
        );
        
        const normal = new Vector3(
            (hitPoint.x - body.position.x) / radius,
            (hitPoint.y - body.position.y) / radius,
            (hitPoint.z - body.position.z) / radius
        );
        
        return {
            body,
            distance: t,
            point: hitPoint,
            normal
        };
    }
    
    /**
     * Get physics metrics
     */
    getMetrics() {
        return {
            bodyCount: this.bodies.length,
            celestialCount: this.celestialBodies.length,
            dynamicCount: this.dynamicBodies.length,
            collisionPairs: this.collisionPairs.length,
            physicsTime: this.physicsTime.toFixed(2)
        };
    }
}

// Physics body class
export class PhysicsBody {
    constructor(options = {}) {
        this.id = options.id || Math.random().toString(36).substr(2, 9);
        this.type = options.type || 'dynamic';  // celestial, dynamic, static
        
        this.position = options.position ? new Vector3(options.position.x, options.position.y, options.position.z) : new Vector3();
        this.velocity = options.velocity ? new Vector3(options.velocity.x, options.velocity.y, options.velocity.z) : new Vector3();
        this.acceleration = new Vector3();
        
        this.previousPosition = this.position.clone();
        this.renderPosition = this.position.clone();
        
        this.rotation = options.rotation || 0;
        this.angularVelocity = options.angularVelocity || 0;
        
        this.mass = options.mass || 1;
        this.radius = options.radius || 1;
        this.scaledRadius = options.scaledRadius || options.radius || 1;
        this.boundingRadius = options.boundingRadius || this.radius;
        
        this.restitution = options.restitution || 0.5;
        this.friction = options.friction || 0.5;
        
        this.isStatic = options.isStatic || false;
        this.isGrounded = false;
        this.groundNormal = null;
        this.currentPlanet = null;
        
        this.inAtmosphere = false;
        this.atmosphereDensity = 0;
        
        // For celestial bodies
        this.atmosphereHeight = options.atmosphereHeight || 0;
        this.atmosphereRadius = options.atmosphereRadius || 0;
        
        // Reference to mesh for rendering
        this.mesh = null;
        this.data = options.data || {};
    }
}

export default PhysicsEngine;
