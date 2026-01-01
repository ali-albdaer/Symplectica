import { CONFIG } from './config.js';
import * as THREE from 'three';

export class PhysicsWorld {
    constructor() {
        this.bodies = []; // Celestial bodies
        this.rigidBodies = []; // Small objects (crates, player)
        this.G = CONFIG.physics.G;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    addRigidBody(rb) {
        this.rigidBodies.push(rb);
    }

    step(dt) {
        const substeps = CONFIG.physics.physicsSubsteps;
        const subDt = dt / substeps;

        for (let s = 0; s < substeps; s++) {
            this.integrateCelestial(subDt);
            this.integrateRigidBodies(subDt);
        }
    }

    integrateCelestial(dt) {
        // N-body gravity
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            if (bodyA.isStatic) continue; // Sun might be static? No, let it wobble.

            let fx = 0, fy = 0, fz = 0;

            for (let j = 0; j < this.bodies.length; j++) {
                if (i === j) continue;
                const bodyB = this.bodies[j];

                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;
                const distSq = dx*dx + dy*dy + dz*dz;
                const dist = Math.sqrt(distSq);

                if (dist > 0) {
                    const f = (this.G * bodyA.mass * bodyB.mass) / distSq;
                    fx += f * (dx / dist);
                    fy += f * (dy / dist);
                    fz += f * (dz / dist);
                }
            }

            // Update velocity
            bodyA.velocity.x += (fx / bodyA.mass) * dt;
            bodyA.velocity.y += (fy / bodyA.mass) * dt;
            bodyA.velocity.z += (fz / bodyA.mass) * dt;
        }

        // Update position
        for (const body of this.bodies) {
            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
            
            // Update Three.js mesh
            if (body.mesh) {
                body.mesh.position.set(body.position.x, body.position.y, body.position.z);
            }
        }
    }

    integrateRigidBodies(dt) {
        for (const rb of this.rigidBodies) {
            if (rb.isPlayer && rb.isFreeFlight) {
                // Skip physics but update mesh
                if (rb.mesh) {
                    rb.mesh.position.set(rb.position.x, rb.position.y, rb.position.z);
                }
                continue;
            }

            // Calculate gravity from all celestial bodies
            let gx = 0, gy = 0, gz = 0;
            let closestBody = null;
            let minDist = Infinity;

            for (const body of this.bodies) {
                const dx = body.position.x - rb.position.x;
                const dy = body.position.y - rb.position.y;
                const dz = body.position.z - rb.position.z;
                const distSq = dx*dx + dy*dy + dz*dz;
                const dist = Math.sqrt(distSq);

                if (dist < minDist) {
                    minDist = dist;
                    closestBody = body;
                }

                const f = (this.G * body.mass) / distSq; // Force per unit mass (acceleration)
                gx += f * (dx / dist);
                gy += f * (dy / dist);
                gz += f * (dz / dist);
            }

            // Apply gravity
            rb.velocity.x += gx * dt;
            rb.velocity.y += gy * dt;
            rb.velocity.z += gz * dt;

            // Damping removed to prevent de-orbiting in space
            // Only apply friction when grounded (handled in collision)

            // Update position
            rb.position.x += rb.velocity.x * dt;
            rb.position.y += rb.velocity.y * dt;
            rb.position.z += rb.velocity.z * dt;

            // Collision with closest planet
            if (closestBody) {
                const dx = rb.position.x - closestBody.position.x;
                const dy = rb.position.y - closestBody.position.y;
                const dz = rb.position.z - closestBody.position.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                // Simple ground collision
                // We assume the object is a point or small sphere. 
                // rb.radius is the object's collider radius.
                const minDist = closestBody.radius + (rb.radius || 0);

                if (dist < minDist) {
                    // Push out
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const nz = dz / dist;

                    rb.position.x += nx * overlap;
                    rb.position.y += ny * overlap;
                    rb.position.z += nz * overlap;

                    // Cancel velocity along normal (simple inelastic collision)
                    // We need to do this relative to the planet's velocity to stick to it
                    const planetVel = closestBody.velocity;
                    const relVel = new THREE.Vector3().subVectors(rb.velocity, planetVel);
                    
                    const vDotN = relVel.dot(new THREE.Vector3(nx, ny, nz));
                    
                    if (vDotN < 0) {
                        // Remove normal component from relative velocity
                        relVel.x -= vDotN * nx;
                        relVel.y -= vDotN * ny;
                        relVel.z -= vDotN * nz;
                        
                        // Friction (apply to tangential component)
                        relVel.x *= 0.9;
                        relVel.y *= 0.9;
                        relVel.z *= 0.9;
                        
                        // Restore absolute velocity
                        rb.velocity.addVectors(planetVel, relVel);
                    }
                    
                    rb.isGrounded = true;
                    rb.groundNormal = new THREE.Vector3(nx, ny, nz);
                } else {
                    rb.isGrounded = false;
                    rb.groundNormal = null;
                }
            }

            // Update mesh
            if (rb.mesh) {
                rb.mesh.position.set(rb.position.x, rb.position.y, rb.position.z);
                
                // Orient to gravity/up if it's a simple object
                // For player, we handle rotation separately
                if (!rb.isPlayer) {
                    // Simple look at up
                    // This is tricky without quaternions, let's skip for generic objects for now
                    // or just let them rotate naturally if we had angular velocity (not implemented yet)
                }
            }
        }
    }
}
