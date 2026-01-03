import * as THREE from 'three';
import { Config } from '../config.js';

export class PhysicsWorld {
    constructor() {
        this.bodies = [];
        this.G = Config.physics.G;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    step(dt) {
        // Calculate forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                const diff = new THREE.Vector3().subVectors(bodyB.position, bodyA.position);
                const distSq = diff.lengthSq();
                const dist = Math.sqrt(distSq);

                if (dist < 0.1) continue; // Avoid singularity

                // F = G * m1 * m2 / r^2
                const forceMagnitude = (this.G * bodyA.mass * bodyB.mass) / distSq;
                
                const force = diff.normalize().multiplyScalar(forceMagnitude);

                // Apply forces (Newton's 3rd Law)
                bodyA.applyForce(force);
                bodyB.applyForce(force.clone().negate());
            }
        }

        // Integrate
        for (const body of this.bodies) {
            body.update(dt);
        }
    }
}
