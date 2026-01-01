import * as CANNON from 'cannon-es';
import { Config } from './config.js';

export class Physics {
    constructor() {
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;
        this.world.solver.iterations = 10;

        this.celestialBodies = []; // { mesh, body, mass, velocity }
        this.dynamicBodies = []; // { body, mesh }
    }

    addCelestialBody(mesh, mass, radius, position, velocity) {
        // Cannon body for collision (Kinematic so it pushes things but isn't pushed by them)
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: 0, // Kinematic
            type: CANNON.Body.KINEMATIC,
            position: new CANNON.Vec3(position.x, position.y, position.z)
        });
        body.addShape(shape);
        this.world.addBody(body);

        this.celestialBodies.push({
            mesh: mesh,
            body: body,
            mass: mass,
            velocity: new CANNON.Vec3(velocity.x, velocity.y, velocity.z),
            force: new CANNON.Vec3(0, 0, 0)
        });
    }

    addDynamicBody(body, mesh) {
        this.world.addBody(body);
        this.dynamicBodies.push({ body, mesh });
    }

    update(dt) {
        // 1. N-Body Simulation for Celestial Bodies
        const G = Config.physics.G;
        
        // Reset forces
        for (const body of this.celestialBodies) {
            body.force.set(0, 0, 0);
        }

        // Calculate forces
        for (let i = 0; i < this.celestialBodies.length; i++) {
            for (let j = i + 1; j < this.celestialBodies.length; j++) {
                const bodyA = this.celestialBodies[i];
                const bodyB = this.celestialBodies[j];

                const distVec = bodyB.body.position.vsub(bodyA.body.position);
                const distSq = distVec.lengthSquared();
                const dist = Math.sqrt(distSq);

                if (dist > 0) {
                    const forceMagnitude = (G * bodyA.mass * bodyB.mass) / distSq;
                    const forceVec = distVec.scale(forceMagnitude / dist);

                    bodyA.force.vadd(forceVec, bodyA.force);
                    bodyB.force.vsub(forceVec, bodyB.force);
                }
            }
        }

        // Update Celestial Velocities and Positions
        for (const body of this.celestialBodies) {
            const acceleration = body.force.scale(1 / body.mass);
            body.velocity.vadd(acceleration.scale(dt), body.velocity);
            body.body.position.vadd(body.velocity.scale(dt), body.body.position);
            
            // Sync mesh
            body.mesh.position.copy(body.body.position);
        }

        // 2. Apply Gravity to Dynamic Bodies (Player, etc)
        for (const dyn of this.dynamicBodies) {
            const totalForce = new CANNON.Vec3(0, 0, 0);
            
            for (const cel of this.celestialBodies) {
                const distVec = cel.body.position.vsub(dyn.body.position);
                const distSq = distVec.lengthSquared();
                const dist = Math.sqrt(distSq);

                if (dist > 0) {
                    const forceMagnitude = (G * cel.mass * dyn.body.mass) / distSq;
                    const forceVec = distVec.scale(forceMagnitude / dist);
                    totalForce.vadd(forceVec, totalForce);
                }
            }
            
            dyn.body.applyForce(totalForce, dyn.body.position);
            
            // Sync mesh if it exists
            if (dyn.mesh) {
                dyn.mesh.position.copy(dyn.body.position);
                dyn.mesh.quaternion.copy(dyn.body.quaternion);
            }
        }

        // 3. Step Physics World
        this.world.step(Config.physics.dt, dt, Config.physics.substeps);
    }
}