import { ConfigManager } from "../core/ConfigManager.js";

const CANNON_REF = () => window.CANNON;

export class PhysicsSystem {
    constructor(configManager, logger) {
        if (!(configManager instanceof ConfigManager)) {
            throw new Error("PhysicsSystem requires a ConfigManager instance");
        }
        this.config = configManager;
        this.logger = logger;
        const CANNON = CANNON_REF();
        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 15;
        this.world.solver.tolerance = 0.001;
        this.world.gravity.set(0, 0, 0);
        this.bodies = new Map();

        const defaultMaterial = new CANNON.Material("default");
        const contact = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
            friction: 0.2,
            restitution: 0.05
        });
        this.world.addContactMaterial(contact);
        this.world.defaultContactMaterial = contact;
    }

    addBody(id, body, options = {}) {
        if (this.bodies.has(id)) {
            throw new Error(`Body with id ${id} already exists in physics world`);
        }
        const record = {
            body,
            affectsGravity: options.affectsGravity !== false,
            receivesGravity: options.receivesGravity !== false,
            userData: options.userData || null
        };
        this.bodies.set(id, record);
        this.world.addBody(body);
        return record;
    }

    removeBody(id) {
        const record = this.bodies.get(id);
        if (!record) {
            return;
        }
        this.world.removeBody(record.body);
        this.bodies.delete(id);
    }

    getBody(id) {
        return this.bodies.get(id)?.body || null;
    }

    forEachBody(callback) {
        for (const [id, record] of this.bodies.entries()) {
            callback(id, record);
        }
    }

    applyNBodyGravity() {
        const entries = Array.from(this.bodies.values()).filter((item) => item.affectsGravity || item.receivesGravity);
        if (entries.length < 2) {
            return;
        }
        const G = this.config.get("simulation.gravitationalConstant");
        for (let i = 0; i < entries.length - 1; i += 1) {
            const a = entries[i];
            const bodyA = a.body;
            if (!a.receivesGravity && !a.affectsGravity) {
                continue;
            }
            for (let j = i + 1; j < entries.length; j += 1) {
                const b = entries[j];
                const bodyB = b.body;
                if (!b.receivesGravity && !b.affectsGravity) {
                    continue;
                }
                const delta = bodyB.position.vsub(bodyA.position);
                const distanceSq = delta.lengthSquared();
                if (distanceSq < 1e-4) {
                    continue;
                }
                const forceMagnitude = (G * bodyA.mass * bodyB.mass) / distanceSq;
                const direction = delta.unit();
                const forceVec = direction.scale(forceMagnitude);
                if (a.receivesGravity && b.affectsGravity && bodyA.mass > 0) {
                    bodyA.force.vsub(forceVec, bodyA.force);
                }
                if (b.receivesGravity && a.affectsGravity && bodyB.mass > 0) {
                    bodyB.force.vadd(forceVec, bodyB.force);
                }
            }
        }
    }

    step(delta) {
        const fixedStep = this.config.get("simulation.fixedTimeStep");
        const maxSubSteps = this.config.get("simulation.maxSubSteps");
        this.applyNBodyGravity();
        this.world.step(fixedStep, delta, maxSubSteps);
    }
}
