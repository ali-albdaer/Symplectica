/**
 * Server-side Simulation Wrapper
 * 
 * This provides a JavaScript-native simulation for the server.
 * In production, this would load the native Rust binary or WASM.
 * For Phase I, we implement a pure TypeScript version.
 */

import { G, circularVelocity, AU, SOLAR_MASS, SOLAR_RADIUS, EARTH_MASS, EARTH_RADIUS } from './constants.js';

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface Body {
    id: string;
    name: string;
    bodyType: string;
    mass: number;
    radius: number;
    position: Vec3;
    velocity: Vec3;
    acceleration: Vec3;
    prevAcceleration: Vec3;
    fixed: boolean;
    active: boolean;
    ownerId?: string;
}

interface SimConfig {
    tickRate: number;
    dt: number;
    softening: number;
    maxSubsteps: number;
    collisionMode: string;
}

interface CheckpointMetrics {
    kineticEnergy: number;
    potentialEnergy: number;
    totalEnergy: number;
}

function vec3(x = 0, y = 0, z = 0): Vec3 {
    return { x, y, z };
}

function vec3Add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function vec3Sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vec3Scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function vec3Magnitude(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec3MagnitudeSq(v: Vec3): number {
    return v.x * v.x + v.y * v.y + v.z * v.z;
}

export class Simulation {
    private bodies: Body[] = [];
    private config: SimConfig;
    private _tick = 0n;
    private _simTime = 0;
    private _sequence = 0n;
    private initialized = false;

    constructor(options: { tickRate?: number } = {}) {
        const tickRate = options.tickRate || 60;
        this.config = {
            tickRate,
            dt: 1 / tickRate,
            softening: 1e6,
            maxSubsteps: 4,
            collisionMode: 'InelasticMerge',
        };
    }

    async initialize(): Promise<void> {
        this.initializeAccelerations();
        this.initialized = true;
    }

    get tick(): bigint {
        return this._tick;
    }

    get simTime(): number {
        return this._simTime;
    }

    get bodyCount(): number {
        return this.bodies.length;
    }

    getConfig(): SimConfig {
        return { ...this.config };
    }

    // ========== Body Management ==========

    addBody(bodyData: Partial<Body> & { id: string; name: string; mass: number; radius: number }): void {
        const body: Body = {
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

    removeBody(id: string): void {
        const idx = this.bodies.findIndex(b => b.id === id);
        if (idx === -1) {
            throw new Error(`Body '${id}' not found`);
        }
        this.bodies.splice(idx, 1);
    }

    getBody(id: string): Body | undefined {
        return this.bodies.find(b => b.id === id);
    }

    getBodies(): Body[] {
        return this.bodies.map(b => ({ ...b }));
    }

    getBodyIds(): string[] {
        return this.bodies.map(b => b.id);
    }

    applyThrust(bodyId: string, thrust: Vec3): void {
        const body = this.getBody(bodyId);
        if (!body) return;

        // F = m*a, so a = F/m. Thrust is force, so apply directly.
        // For simplicity, we'll treat thrust as acceleration directly.
        body.acceleration = vec3Add(body.acceleration, thrust);
    }

    // ========== Physics ==========

    private initializeAccelerations(): void {
        this.computeAllAccelerations();
        for (const body of this.bodies) {
            body.prevAcceleration = { ...body.acceleration };
        }
    }

    private computeAllAccelerations(): void {
        const softSq = this.config.softening * this.config.softening;

        for (const body of this.bodies) {
            if (!body.active || body.fixed) {
                body.acceleration = vec3();
                continue;
            }

            let ax = 0, ay = 0, az = 0;

            for (const other of this.bodies) {
                if (other.id === body.id || !other.active || other.mass <= 0) continue;

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

    private velocityVerletStep(dt: number): void {
        const halfDt = 0.5 * dt;
        const halfDtSq = 0.5 * dt * dt;

        // Update positions
        for (const body of this.bodies) {
            if (!body.active || body.fixed) continue;

            body.prevAcceleration = { ...body.acceleration };

            body.position.x += body.velocity.x * dt + body.acceleration.x * halfDtSq;
            body.position.y += body.velocity.y * dt + body.acceleration.y * halfDtSq;
            body.position.z += body.velocity.z * dt + body.acceleration.z * halfDtSq;
        }

        // Compute new accelerations
        this.computeAllAccelerations();

        // Update velocities
        for (const body of this.bodies) {
            if (!body.active || body.fixed) continue;

            body.velocity.x += (body.prevAcceleration.x + body.acceleration.x) * halfDt;
            body.velocity.y += (body.prevAcceleration.y + body.acceleration.y) * halfDt;
            body.velocity.z += (body.prevAcceleration.z + body.acceleration.z) * halfDt;
        }
    }

    private handleCollisions(): void {
        if (this.config.collisionMode === 'None') return;

        const processed = new Set<string>();

        for (let i = 0; i < this.bodies.length; i++) {
            const body1 = this.bodies[i];
            if (!body1.active || processed.has(body1.id)) continue;

            for (let j = i + 1; j < this.bodies.length; j++) {
                const body2 = this.bodies[j];
                if (!body2.active || processed.has(body2.id)) continue;

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

    private mergeBody(survivor: Body, absorbed: Body): void {
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
        survivor.radius = Math.pow(Math.pow(survivor.radius, 3) + Math.pow(absorbed.radius, 3), 1/3);
        survivor.mass = totalMass;

        absorbed.active = false;
    }

    step(): void {
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

    reset(): void {
        this.bodies = [];
        this._tick = 0n;
        this._simTime = 0;
        this._sequence = 0n;
        this.initialized = false;
    }

    // ========== Checkpoints ==========

    createCheckpoint(): object {
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

    createSnapshot(): object {
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

    restoreCheckpoint(checkpoint: any): void {
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

    private computeMetrics(): CheckpointMetrics {
        let kinetic = 0;
        let potential = 0;

        for (const body of this.bodies) {
            if (!body.active) continue;

            // Kinetic energy
            const vSq = vec3MagnitudeSq(body.velocity);
            kinetic += 0.5 * body.mass * vSq;

            // Potential energy (pairwise)
            for (const other of this.bodies) {
                if (other.id === body.id || !other.active) continue;

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
