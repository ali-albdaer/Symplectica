import { Vec3d } from './vec3d.js';

export class NBodySolver {
  /**
   * @param {object} args
   * @param {number} args.G
   * @param {number} args.softeningMeters
   * @param {number} args.maxAccel
   */
  constructor({ G, softeningMeters, maxAccel }) {
    this.G = G;
    this.soft2 = softeningMeters * softeningMeters;
    this.maxAccel = maxAccel;
  }

  /**
   * Leapfrog (kick-drift-kick), symplectic and stable for orbital mechanics.
   * @param {import('./body.js').Body[]} bodies
   * @param {number} dt
   */
  step(bodies, dt) {
    // Kick half-step
    const acc0 = this._computeAccelerations(bodies);
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (b.fixed || b.invMass === 0) continue;
      b.velocity.addScaled(acc0[i], 0.5 * dt);
    }

    // Drift
    for (const b of bodies) {
      if (b.fixed || b.invMass === 0) continue;
      b.position.addScaled(b.velocity, dt);
    }

    // Kick half-step with new acc
    const acc1 = this._computeAccelerations(bodies);
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (b.fixed || b.invMass === 0) continue;
      b.velocity.addScaled(acc1[i], 0.5 * dt);
    }
  }

  /**
   * Computes acceleration for each body due to every other body.
   * @param {import('./body.js').Body[]} bodies
   * @returns {Vec3d[]}
   */
  _computeAccelerations(bodies) {
    const acc = bodies.map(() => new Vec3d(0, 0, 0));

    for (let i = 0; i < bodies.length; i++) {
      const bi = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const bj = bodies[j];

        const dx = bj.position.x - bi.position.x;
        const dy = bj.position.y - bi.position.y;
        const dz = bj.position.z - bi.position.z;
        const r2 = dx * dx + dy * dy + dz * dz + this.soft2;
        const invR = 1 / Math.sqrt(r2);
        const invR3 = invR * invR * invR;

        const s = this.G * invR3;

        // a_i += G*m_j * r_vec / r^3
        // a_j -= G*m_i * r_vec / r^3
        const ax = s * dx;
        const ay = s * dy;
        const az = s * dz;

        acc[i].x += ax * bj.massKg;
        acc[i].y += ay * bj.massKg;
        acc[i].z += az * bj.massKg;

        acc[j].x -= ax * bi.massKg;
        acc[j].y -= ay * bi.massKg;
        acc[j].z -= az * bi.massKg;
      }
    }

    if (Number.isFinite(this.maxAccel) && this.maxAccel > 0) {
      for (const a of acc) {
        const l2 = a.x * a.x + a.y * a.y + a.z * a.z;
        const max2 = this.maxAccel * this.maxAccel;
        if (l2 > max2) {
          const s = this.maxAccel / Math.sqrt(l2);
          a.x *= s; a.y *= s; a.z *= s;
        }
      }
    }

    return acc;
  }
}
