import { Config } from './config.js';
import { Logger } from './utils.js';
import * as THREE from 'three';

export class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.G = Config.physics.G;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    update(dt) {
        const substeps = Config.physics.substeps;
        const subDt = dt / substeps;

        for (let s = 0; s < substeps; s++) {
            this.step(subDt);
        }
    }

    step(dt) {
        // Reset forces
        for (const body of this.bodies) {
            body.force.set(0, 0, 0);
        }

        // N-Body Gravity
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                if (bodyA.isStatic && bodyB.isStatic) continue; // Optimization for static bodies if any

                const diff = new THREE.Vector3().subVectors(bodyB.position, bodyA.position);
                const distSq = diff.lengthSq();
                const dist = Math.sqrt(distSq);

                if (dist < 0.0001) continue; // Avoid singularity

                const f = (this.G * bodyA.mass * bodyB.mass) / distSq;
                
                const force = diff.normalize().multiplyScalar(f);

                if (!bodyA.isStatic) bodyA.force.add(force);
                if (!bodyB.isStatic) bodyB.force.sub(force); // Newton's 3rd law
            }
        }

        // Integration (Semi-implicit Euler)
        for (const body of this.bodies) {
            if (body.isStatic) continue;

            // F = ma => a = F/m
            const acceleration = body.force.clone().divideScalar(body.mass);
            
            // Update velocity
            body.velocity.add(acceleration.multiplyScalar(dt));

            // Update position
            body.position.add(body.velocity.clone().multiplyScalar(dt));

            // Collision detection (Simple sphere-sphere)
            // This is a basic implementation. For player, we might need more specific handling in the Player class
            // or handle it here if we treat player as a sphere.
            // For now, let's handle ground collision for non-star bodies
            if (body.type !== 'star') {
                this.handleCollisions(body);
            }
        }
    }

    handleCollisions(body) {
        for (const other of this.bodies) {
            if (body === other) continue;

            const dist = body.position.distanceTo(other.position);
            const minDist = body.radius + other.radius;

            if (dist < minDist) {
                // Collision response: Push out
                const normal = new THREE.Vector3().subVectors(body.position, other.position).normalize();
                const overlap = minDist - dist;
                
                // Simple position correction
                // If other is massive (like a planet), move body entirely
                if (other.mass > body.mass * 1000) {
                    body.position.add(normal.multiplyScalar(overlap));
                    
                    // Kill velocity towards the planet (simple inelastic collision)
                    const velDotNormal = body.velocity.dot(normal);
                    if (velDotNormal < 0) {
                        const removeVel = normal.multiplyScalar(velDotNormal);
                        body.velocity.sub(removeVel);
                    }
                    
                    // Friction could be added here
                    body.isGrounded = true;
                    body.groundBody = other;
                } else {
                    // Push both apart based on mass ratio (simplified)
                    const totalMass = body.mass + other.mass;
                    const m1 = other.mass / totalMass;
                    const m2 = body.mass / totalMass;
                    
                    body.position.add(normal.clone().multiplyScalar(overlap * m1));
                    other.position.sub(normal.clone().multiplyScalar(overlap * m2));
                    
                    // Elastic bounce? Or inelastic? Let's go with inelastic for stability
                    // Calculate relative velocity
                    const relVel = new THREE.Vector3().subVectors(body.velocity, other.velocity);
                    const velAlongNormal = relVel.dot(normal);
                    
                    if (velAlongNormal < 0) {
                        const j = -(1 + 0.5) * velAlongNormal; // 0.5 restitution
                        const impulse = j / (1/body.mass + 1/other.mass);
                        
                        body.velocity.add(normal.clone().multiplyScalar(impulse / body.mass));
                        other.velocity.sub(normal.clone().multiplyScalar(impulse / other.mass));
                    }
                }
            }
        }
    }
    
    // Get gravity vector at a specific position (useful for player orientation)
    getGravityAt(position, ignoreBody = null) {
        const gravity = new THREE.Vector3(0, 0, 0);
        
        for (const body of this.bodies) {
            if (body === ignoreBody) continue;
            
            const diff = new THREE.Vector3().subVectors(body.position, position);
            const distSq = diff.lengthSq();
            const dist = Math.sqrt(distSq);
            
            if (dist < 0.001) continue;
            
            // F = G*M*m / r^2. Acceleration g = G*M / r^2
            const g = (this.G * body.mass) / distSq;
            gravity.add(diff.normalize().multiplyScalar(g));
        }
        
        return gravity;
    }
}
