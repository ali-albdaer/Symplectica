import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";
import { getConfig } from "../config.js";

export class PhysicsEngine {
    constructor() {
        const { simulation } = getConfig();
        this.bodies = [];
        this.dynamicBodies = new Set();
        this.gravityConstant = simulation.gravitationalConstant;
        this.softening = 25;
        this.maxAcceleration = 1e6;
        this.substeps = 2;
    }

    addBody(body, { dynamic = true } = {}) {
        this.bodies.push(body);
        if (dynamic) {
            this.dynamicBodies.add(body);
        }
    }

    clear() {
        this.bodies.length = 0;
        this.dynamicBodies.clear();
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index >= 0) {
            this.bodies.splice(index, 1);
        }
        this.dynamicBodies.delete(body);
    }

    step(deltaTime) {
        if (!this.bodies.length) {
            return;
        }
        const dt = deltaTime / this.substeps;
        for (let step = 0; step < this.substeps; step += 1) {
            this.computeForces();
            this.integrate(dt);
        }
    }

    computeForces() {
        const softeningSquared = this.softening * this.softening;
        for (let i = 0; i < this.bodies.length; i += 1) {
            this.bodies[i].resetForce();
        }
        for (let i = 0; i < this.bodies.length - 1; i += 1) {
            const bodyA = this.bodies[i];
            for (let j = i + 1; j < this.bodies.length; j += 1) {
                const bodyB = this.bodies[j];
                const direction = bodyB.position.clone().sub(bodyA.position);
                const distanceSquared = direction.lengthSq() + softeningSquared;
                const distance = Math.sqrt(distanceSquared);
                if (distance === 0) {
                    continue;
                }
                const forceMagnitude = (this.gravityConstant * bodyA.mass * bodyB.mass) / distanceSquared;
                direction.divideScalar(distance);
                const force = direction.clone().multiplyScalar(forceMagnitude);
                bodyA.applyForce(force);
                bodyB.applyForce(force.clone().multiplyScalar(-1));
            }
        }
        this.limitAccelerations();
    }

    limitAccelerations() {
        for (const body of this.bodies) {
            if (!this.dynamicBodies.has(body)) {
                continue;
            }
            const acceleration = body.forceAccumulator.clone().multiplyScalar(1 / body.mass);
            if (acceleration.length() > this.maxAcceleration) {
                const limited = acceleration.clone().setLength(this.maxAcceleration);
                body.forceAccumulator.copy(limited.multiplyScalar(body.mass));
            }
        }
    }

    integrate(dt) {
        for (const body of this.dynamicBodies) {
            body.integrate(dt);
        }
    }

    setGravityConstant(value) {
        this.gravityConstant = value;
    }
}
