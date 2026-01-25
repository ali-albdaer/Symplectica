import { Config } from '../config.js';
import * as THREE from 'three';

export class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.interactables = [];
        this.player = null;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    setPlayer(player) {
        this.player = player;
    }

    addInteractable(obj) {
        this.interactables.push(obj);
    }

    update(dt) {
        const steps = Config.physics.physicsSubsteps;
        const subDt = dt / steps;

        for (let s = 0; s < steps; s++) {
            this.step(subDt);
        }
    }

    step(dt) {
        // 1. Calculate forces and update positions (Verlet integration part 1)
        for (const body of this.bodies) {
            // Save current acceleration for the second part of Verlet
            body.prevAcceleration = body.acceleration.clone();
            
            // r(t+dt) = r(t) + v(t)dt + 0.5 * a(t) * dt^2
            const vDt = body.velocity.clone().multiplyScalar(dt);
            const aDt2 = body.acceleration.clone().multiplyScalar(0.5 * dt * dt);
            body.position.add(vDt).add(aDt2);
            
            // Reset acceleration for next calculation
            body.acceleration.set(0, 0, 0);
        }

        // 2. Calculate new forces (Gravity)
        this.calculateGravity();

        // 3. Update velocities (Verlet integration part 2)
        for (const body of this.bodies) {
            // v(t+dt) = v(t) + 0.5 * (a(t) + a(t+dt)) * dt
            const avgA = body.prevAcceleration.add(body.acceleration).multiplyScalar(0.5);
            body.velocity.add(avgA.multiplyScalar(dt));
        }

        // 4. Player Physics
        if (this.player) {
            this.updatePlayerPhysics(dt);
        }

        // 5. Interactables Physics
        this.updateInteractables(dt);
    }

    calculateGravity() {
        const G = Config.physics.G;
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                const diff = new THREE.Vector3().subVectors(bodyB.position, bodyA.position);
                const distSq = diff.lengthSq();
                const dist = Math.sqrt(distSq);

                if (dist === 0) continue;

                const f = (G * bodyA.mass * bodyB.mass) / distSq;
                const force = diff.normalize().multiplyScalar(f);

                // F = ma => a = F/m
                bodyA.acceleration.add(force.clone().multiplyScalar(1 / bodyA.mass));
                bodyB.acceleration.sub(force.clone().multiplyScalar(1 / bodyB.mass));
            }
        }
    }

    updatePlayerPhysics(dt) {
        // Find dominant gravity source
        let maxGravity = 0;
        let gravityDir = new THREE.Vector3(0, -1, 0);
        let dominantBody = null;

        for (const body of this.bodies) {
            const diff = new THREE.Vector3().subVectors(body.position, this.player.position);
            const distSq = diff.lengthSq();
            const dist = Math.sqrt(distSq);
            
            // Gravity force on player (F = GmM/r^2) -> a = GM/r^2
            const g = (Config.physics.G * body.mass) / distSq;
            
            if (g > maxGravity) {
                maxGravity = g;
                gravityDir = diff.normalize();
                dominantBody = body;
            }
        }

        this.player.applyGravity(gravityDir, maxGravity, dt);
        
        // Simple ground collision with dominant body
        if (dominantBody) {
            const distToCenter = this.player.position.distanceTo(dominantBody.position);
            if (distToCenter < dominantBody.radius + this.player.height / 2) {
                // Push out
                const pushDir = new THREE.Vector3().subVectors(this.player.position, dominantBody.position).normalize();
                this.player.position.copy(dominantBody.position).add(pushDir.multiplyScalar(dominantBody.radius + this.player.height / 2));
                
                // Cancel velocity towards planet
                const velProjected = this.player.velocity.dot(pushDir);
                if (velProjected < 0) {
                    this.player.velocity.sub(pushDir.multiplyScalar(velProjected));
                    this.player.isGrounded = true;
                }
            } else {
                this.player.isGrounded = false;
            }
        }
    }

    updateInteractables(dt) {
        // Similar to player but for small objects
        for (const obj of this.interactables) {
             // Find dominant gravity source
            let maxGravity = 0;
            let gravityDir = new THREE.Vector3(0, -1, 0);
            let dominantBody = null;

            for (const body of this.bodies) {
                const diff = new THREE.Vector3().subVectors(body.position, obj.position);
                const distSq = diff.lengthSq();
                
                const g = (Config.physics.G * body.mass) / distSq;
                
                if (g > maxGravity) {
                    maxGravity = g;
                    gravityDir = diff.normalize();
                    dominantBody = body;
                }
            }

            // Apply gravity
            obj.velocity.add(gravityDir.multiplyScalar(maxGravity * dt));
            obj.position.add(obj.velocity.clone().multiplyScalar(dt));

            // Collision with dominant body
            if (dominantBody) {
                const distToCenter = obj.position.distanceTo(dominantBody.position);
                if (distToCenter < dominantBody.radius + 0.5) { // 0.5 is approx radius of object
                    const pushDir = new THREE.Vector3().subVectors(obj.position, dominantBody.position).normalize();
                    obj.position.copy(dominantBody.position).add(pushDir.multiplyScalar(dominantBody.radius + 0.5));
                    
                    const velProjected = obj.velocity.dot(pushDir);
                    if (velProjected < 0) {
                        obj.velocity.sub(pushDir.multiplyScalar(velProjected));
                        // Friction
                        obj.velocity.multiplyScalar(0.9);
                    }
                }
            }
        }
    }
}
