import { Vec3 } from '../utils/MathUtils.js';

// 4th Order Symplectic Integator Coefficients (Yoshida, 1990)
const w1 = 1.0 / (2.0 - Math.pow(2.0, 1.0/3.0));
const w0 = -Math.pow(2.0, 1.0/3.0) / (2.0 - Math.pow(2.0, 1.0/3.0));
const c1 = w1 / 2.0;
const c2 = (w0 + w1) / 2.0;
const c3 = c2;
const c4 = c1;
const d1 = w1;
const d2 = w0;
const d3 = w1;

export class Integrator {
    constructor(engine) {
        this.engine = engine; // Access to computeForces
        this.type = 'p_sym'; // default
    }

    setMethod(method) {
        this.type = method;
    }

    step(bodies, dt) {
        if (this.type === 'p_sym') {
            this.stepSymplectic4(bodies, dt);
        } else if (this.type === 'rk4') {
            this.stepRK4(bodies, dt);
        } else {
            this.stepEuler(bodies, dt);
        }
    }

    // Symplectic 4th Order (Energy preserving for Hamiltonian systems)
    stepSymplectic4(bodies, dt) {
        // x1 = x0 + c1 * v0 * dt
        // v1 = v0 + d1 * a(x1) * dt
        // x2 = x1 + c2 * v1 * dt
        // v2 = v1 + d2 * a(x2) * dt
        // ...
        
        // Stage 1 Position
        for (const b of bodies) {
            b.pos.x += c1 * b.vel.x * dt;
            b.pos.y += c1 * b.vel.y * dt;
            b.pos.z += c1 * b.vel.z * dt;
        }

        // Stage 1 Velocity
        this.engine.computeForces(bodies);
        for (const b of bodies) {
            b.vel.x += d1 * b.acc.x * dt;
            b.vel.y += d1 * b.acc.y * dt;
            b.vel.z += d1 * b.acc.z * dt;
        }

        // Stage 2 Position
        for (const b of bodies) {
            b.pos.x += c2 * b.vel.x * dt;
            b.pos.y += c2 * b.vel.y * dt;
            b.pos.z += c2 * b.vel.z * dt;
        }

        // Stage 2 Velocity
        this.engine.computeForces(bodies);
        for (const b of bodies) {
            b.vel.x += d2 * b.acc.x * dt;
            b.vel.y += d2 * b.acc.y * dt;
            b.vel.z += d2 * b.acc.z * dt;
        }

        // Stage 3 Position
        for (const b of bodies) {
            b.pos.x += c3 * b.vel.x * dt;
            b.pos.y += c3 * b.vel.y * dt;
            b.pos.z += c3 * b.vel.z * dt;
        }

        // Stage 3 Velocity
        this.engine.computeForces(bodies);
        for (const b of bodies) {
            b.vel.x += d3 * b.acc.x * dt;
            b.vel.y += d3 * b.acc.y * dt;
            b.vel.z += d3 * b.acc.z * dt;
        }

        // Stage 4 Position
        for (const b of bodies) {
            b.pos.x += c4 * b.vel.x * dt;
            b.pos.y += c4 * b.vel.y * dt;
            b.pos.z += c4 * b.vel.z * dt;
        }
    }

    stepEuler(bodies, dt) {
        this.engine.computeForces(bodies);
        for (const b of bodies) {
            b.vel.x += b.acc.x * dt;
            b.vel.y += b.acc.y * dt;
            b.vel.z += b.acc.z * dt;
            
            b.pos.x += b.vel.x * dt;
            b.pos.y += b.vel.y * dt;
            b.pos.z += b.vel.z * dt;
        }
    }

    stepRK4(bodies, dt) {
        // Store initial state
        const state0 = bodies.map(b => ({
            pos: b.pos.clone(),
            vel: b.vel.clone()
        }));

        const n = bodies.length;

        // k1
        this.engine.computeForces(bodies);
        const a1 = bodies.map(b => b.acc.clone());
        const v1 = bodies.map(b => b.vel.clone());

        // k2
        for (let i = 0; i < n; i++) {
            bodies[i].pos.set(
                state0[i].pos.x + v1[i].x * 0.5 * dt,
                state0[i].pos.y + v1[i].y * 0.5 * dt,
                state0[i].pos.z + v1[i].z * 0.5 * dt
            );
        }
        this.engine.computeForces(bodies);
        const a2 = bodies.map(b => b.acc.clone());
        const v2 = bodies.map((b, i) => {
            return new Vec3(state0[i].vel.x + a1[i].x * 0.5 * dt, state0[i].vel.y + a1[i].y * 0.5 * dt, state0[i].vel.z + a1[i].z * 0.5 * dt);
        });

        // k3
        for (let i = 0; i < n; i++) {
            bodies[i].pos.set(
                state0[i].pos.x + v2[i].x * 0.5 * dt,
                state0[i].pos.y + v2[i].y * 0.5 * dt,
                state0[i].pos.z + v2[i].z * 0.5 * dt
            );
        }
        this.engine.computeForces(bodies);
        const a3 = bodies.map(b => b.acc.clone());
        const v3 = bodies.map((b, i) => {
            return new Vec3(state0[i].vel.x + a2[i].x * 0.5 * dt, state0[i].vel.y + a2[i].y * 0.5 * dt, state0[i].vel.z + a2[i].z * 0.5 * dt);
        });

        // k4
        for (let i = 0; i < n; i++) {
            bodies[i].pos.set(
                state0[i].pos.x + v3[i].x * dt,
                state0[i].pos.y + v3[i].y * dt,
                state0[i].pos.z + v3[i].z * dt
            );
        }
        this.engine.computeForces(bodies);
        const a4 = bodies.map(b => b.acc.clone());
        const v4 = bodies.map((b, i) => {
            return new Vec3(state0[i].vel.x + a3[i].x * dt, state0[i].vel.y + a3[i].y * dt, state0[i].vel.z + a3[i].z * dt);
        });

        // Final Combine
        for (let i = 0; i < n; i++) {
            bodies[i].pos.set(
                state0[i].pos.x + (dt/6.0)*(v1[i].x + 2*v2[i].x + 2*v3[i].x + v4[i].x),
                state0[i].pos.y + (dt/6.0)*(v1[i].y + 2*v2[i].y + 2*v3[i].y + v4[i].y),
                state0[i].pos.z + (dt/6.0)*(v1[i].z + 2*v2[i].z + 2*v3[i].z + v4[i].z)
            );
            bodies[i].vel.set(
                state0[i].vel.x + (dt/6.0)*(a1[i].x + 2*a2[i].x + 2*a3[i].x + a4[i].x),
                state0[i].vel.y + (dt/6.0)*(a1[i].y + 2*a2[i].y + 2*a3[i].y + a4[i].y),
                state0[i].vel.z + (dt/6.0)*(a1[i].z + 2*a2[i].z + 2*a3[i].z + a4[i].z)
            );
        }
    }
}