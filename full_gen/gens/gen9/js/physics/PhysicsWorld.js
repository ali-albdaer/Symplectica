import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from '../Config.js';

export class PhysicsWorld {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0); // No global gravity, we do N-Body
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;

        this.bodies = []; // Keep track of celestial bodies for N-Body calc
        this.interactiveObjects = [];
    }

    addBody(body) {
        this.world.addBody(body);
        // If it has mass, it participates in N-Body
        if (body.mass > 0) {
            this.bodies.push(body);
        }
    }

    addInteractiveObject(body) {
        this.world.addBody(body);
        this.interactiveObjects.push(body);
    }

    applyNBodyGravity() {
        const G = Config.physics.G;
        
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bi = this.bodies[i];
                const bj = this.bodies[j];

                const distVec = new CANNON.Vec3();
                bj.position.vsub(bi.position, distVec);
                
                const r = distVec.length();
                distVec.normalize();

                // F = G * m1 * m2 / r^2
                const forceMagnitude = (G * bi.mass * bj.mass) / (r * r);
                
                const force = distVec.scale(forceMagnitude);

                // Apply to body i
                bi.applyForce(force, bi.position);

                // Apply opposite to body j
                bj.applyForce(force.scale(-1), bj.position);
            }
        }
    }

    // Helper to get gravity vector at a specific point (for player)
    getGravityAt(position) {
        const G = Config.physics.G;
        const totalForce = new CANNON.Vec3(0, 0, 0);

        for (const body of this.bodies) {
            // Don't attract to self (if player was a massive body, but here player is negligible)
            const distVec = new CANNON.Vec3();
            body.position.vsub(position, distVec);
            const r = distVec.length();
            
            // Ignore if too close (inside center) or too far
            if (r < body.shapes[0].radius) continue; 

            distVec.normalize();
            // F = G * M / r^2 (Force per unit mass = Acceleration)
            const accelMagnitude = (G * body.mass) / (r * r);
            
            totalForce.vadd(distVec.scale(accelMagnitude), totalForce);
        }
        return totalForce;
    }

    step(dt) {
        this.applyNBodyGravity();
        this.world.step(Config.physics.dt, dt, Config.physics.substeps);
    }
}
