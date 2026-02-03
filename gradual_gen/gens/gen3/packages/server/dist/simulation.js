/**
 * Server-side Simulation Wrapper
 *
 * This provides a JavaScript-native simulation for the server.
 * In production, this would load the native Rust binary or WASM.
 * For Phase I, we implement a pure TypeScript version.
 */
import { G } from './constants.js';
function vec3(x = 0, y = 0, z = 0) {
    return { x, y, z };
}
function vec3Add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function vec3Sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function vec3Scale(v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}
function vec3Magnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function vec3MagnitudeSq(v) {
    return v.x * v.x + v.y * v.y + v.z * v.z;
}
export class Simulation {
    bodies = [];
    config;
    _tick = 0n;
    _simTime = 0;
    _sequence = 0n;
    initialized = false;
    constructor(options = {}) {
        const tickRate = options.tickRate || 60;
        this.config = {
            tickRate,
            dt: 1 / tickRate,
            softening: 1e6,
            maxSubsteps: 4,
            collisionMode: 'InelasticMerge',
        };
    }
    async initialize() {
        this.initializeAccelerations();
        this.initialized = true;
    }
    get tick() {
        return this._tick;
    }
    get simTime() {
        return this._simTime;
    }
    get bodyCount() {
        return this.bodies.length;
    }
    getConfig() {
        return { ...this.config };
    }
    // ========== Body Management ==========
    addBody(bodyData) {
        const body = {
            id: bodyData.id,
            name: bodyData.name,
            bodyType: bodyData.bodyType || 'Planet',
            mass: bodyData.mass,
            radius: bodyData.radius,
            position: bodyData.position || vec3(),
            velocity: bodyData.velocity || vec3(),
            acceleration: vec3(),
            prevAcceleration: vec3(),
            fixed: bodyData.fixed || false,
            active: true,
            ownerId: bodyData.ownerId,
        };
        // Check for duplicate
        if (this.bodies.find(b => b.id === body.id)) {
            throw new Error(`Body with ID '${body.id}' already exists`);
        }
        this.bodies.push(body);
        this.initialized = false;
    }
    removeBody(id) {
        const idx = this.bodies.findIndex(b => b.id === id);
        if (idx === -1) {
            throw new Error(`Body '${id}' not found`);
        }
        this.bodies.splice(idx, 1);
    }
    getBody(id) {
        return this.bodies.find(b => b.id === id);
    }
    getBodies() {
        return this.bodies.map(b => ({ ...b }));
    }
    getBodyIds() {
        return this.bodies.map(b => b.id);
    }
    applyThrust(bodyId, thrust) {
        const body = this.getBody(bodyId);
        if (!body)
            return;
        // F = m*a, so a = F/m. Thrust is force, so apply directly.
        // For simplicity, we'll treat thrust as acceleration directly.
        body.acceleration = vec3Add(body.acceleration, thrust);
    }
    // ========== Physics ==========
    initializeAccelerations() {
        this.computeAllAccelerations();
        for (const body of this.bodies) {
            body.prevAcceleration = { ...body.acceleration };
        }
    }
    computeAllAccelerations() {
        const softSq = this.config.softening * this.config.softening;
        for (const body of this.bodies) {
            if (!body.active || body.fixed) {
                body.acceleration = vec3();
                continue;
            }
            let ax = 0, ay = 0, az = 0;
            for (const other of this.bodies) {
                if (other.id === body.id || !other.active || other.mass <= 0)
                    continue;
                const dx = other.position.x - body.position.x;
                const dy = other.position.y - body.position.y;
                const dz = other.position.z - body.position.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                const distSqSoft = distSq + softSq;
                const dist = Math.sqrt(distSqSoft);
                const aMag = G * other.mass / (dist * distSqSoft);
                ax += dx * aMag;
                ay += dy * aMag;
                az += dz * aMag;
            }
            body.acceleration = { x: ax, y: ay, z: az };
        }
    }
    velocityVerletStep(dt) {
        const halfDt = 0.5 * dt;
        const halfDtSq = 0.5 * dt * dt;
        // Update positions
        for (const body of this.bodies) {
            if (!body.active || body.fixed)
                continue;
            body.prevAcceleration = { ...body.acceleration };
            body.position.x += body.velocity.x * dt + body.acceleration.x * halfDtSq;
            body.position.y += body.velocity.y * dt + body.acceleration.y * halfDtSq;
            body.position.z += body.velocity.z * dt + body.acceleration.z * halfDtSq;
        }
        // Compute new accelerations
        this.computeAllAccelerations();
        // Update velocities
        for (const body of this.bodies) {
            if (!body.active || body.fixed)
                continue;
            body.velocity.x += (body.prevAcceleration.x + body.acceleration.x) * halfDt;
            body.velocity.y += (body.prevAcceleration.y + body.acceleration.y) * halfDt;
            body.velocity.z += (body.prevAcceleration.z + body.acceleration.z) * halfDt;
        }
    }
    handleCollisions() {
        if (this.config.collisionMode === 'None')
            return;
        const processed = new Set();
        for (let i = 0; i < this.bodies.length; i++) {
            const body1 = this.bodies[i];
            if (!body1.active || processed.has(body1.id))
                continue;
            for (let j = i + 1; j < this.bodies.length; j++) {
                const body2 = this.bodies[j];
                if (!body2.active || processed.has(body2.id))
                    continue;
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                const minDist = body1.radius + body2.radius;
                if (distSq <= minDist * minDist) {
                    // Collision! Perform inelastic merge
                    this.mergeBody(body1, body2);
                    processed.add(body2.id);
                }
            }
        }
        // Remove merged bodies
        this.bodies = this.bodies.filter(b => b.active);
    }
    mergeBody(survivor, absorbed) {
        const totalMass = survivor.mass + absorbed.mass;
        // Center of mass
        survivor.position.x = (survivor.position.x * survivor.mass + absorbed.position.x * absorbed.mass) / totalMass;
        survivor.position.y = (survivor.position.y * survivor.mass + absorbed.position.y * absorbed.mass) / totalMass;
        survivor.position.z = (survivor.position.z * survivor.mass + absorbed.position.z * absorbed.mass) / totalMass;
        // Conserve momentum
        survivor.velocity.x = (survivor.velocity.x * survivor.mass + absorbed.velocity.x * absorbed.mass) / totalMass;
        survivor.velocity.y = (survivor.velocity.y * survivor.mass + absorbed.velocity.y * absorbed.mass) / totalMass;
        survivor.velocity.z = (survivor.velocity.z * survivor.mass + absorbed.velocity.z * absorbed.mass) / totalMass;
        // Volume conservation for radius
        survivor.radius = Math.pow(Math.pow(survivor.radius, 3) + Math.pow(absorbed.radius, 3), 1 / 3);
        survivor.mass = totalMass;
        absorbed.active = false;
    }
    step() {
        if (!this.initialized) {
            this.initialize();
        }
        const substepDt = this.config.dt / this.config.maxSubsteps;
        for (let i = 0; i < this.config.maxSubsteps; i++) {
            this.velocityVerletStep(substepDt);
        }
        this.handleCollisions();
        this._tick++;
        this._simTime += this.config.dt;
        this._sequence++;
    }
    reset() {
        this.bodies = [];
        this._tick = 0n;
        this._simTime = 0;
        this._sequence = 0n;
        this.initialized = false;
    }
    // ========== Checkpoints ==========
    createCheckpoint() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            sequence: Number(this._sequence),
            tick: Number(this._tick),
            simTime: this._simTime,
            bodies: this.bodies.map(b => ({
                id: b.id,
                name: b.name,
                bodyType: b.bodyType,
                mass: b.mass,
                radius: b.radius,
                position: [b.position.x, b.position.y, b.position.z],
                velocity: [b.velocity.x, b.velocity.y, b.velocity.z],
                fixed: b.fixed,
                active: b.active,
                ownerId: b.ownerId,
            })),
            config: this.config,
            metrics: this.computeMetrics(),
        };
    }
    createSnapshot() {
        return {
            seq: Number(this._sequence),
            tick: Number(this._tick),
            time: this._simTime,
            timestamp: Date.now(),
            bodies: this.bodies.map(b => ({
                id: b.id,
                position: [b.position.x, b.position.y, b.position.z],
                velocity: [b.velocity.x, b.velocity.y, b.velocity.z],
                mass: b.mass,
                radius: b.radius,
                active: b.active,
            })),
            origin: [0, 0, 0],
        };
    }
    restoreCheckpoint(checkpoint) {
        this.reset();
        for (const b of checkpoint.bodies) {
            this.addBody({
                id: b.id,
                name: b.name,
                bodyType: b.bodyType,
                mass: b.mass,
                radius: b.radius,
                position: { x: b.position[0], y: b.position[1], z: b.position[2] },
                velocity: { x: b.velocity[0], y: b.velocity[1], z: b.velocity[2] },
                fixed: b.fixed,
                ownerId: b.ownerId,
            });
        }
        this._tick = BigInt(checkpoint.tick);
        this._simTime = checkpoint.simTime;
        this._sequence = BigInt(checkpoint.sequence);
        this.initialize();
    }
    computeMetrics() {
        let kinetic = 0;
        let potential = 0;
        for (const body of this.bodies) {
            if (!body.active)
                continue;
            // Kinetic energy
            const vSq = vec3MagnitudeSq(body.velocity);
            kinetic += 0.5 * body.mass * vSq;
            // Potential energy (pairwise)
            for (const other of this.bodies) {
                if (other.id === body.id || !other.active)
                    continue;
                const dx = other.position.x - body.position.x;
                const dy = other.position.y - body.position.y;
                const dz = other.position.z - body.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist > 0) {
                    potential -= 0.5 * G * body.mass * other.mass / dist;
                }
            }
        }
        return {
            kineticEnergy: kinetic,
            potentialEnergy: potential,
            totalEnergy: kinetic + potential,
        };
    }
}
//# sourceMappingURL=simulation.js.map