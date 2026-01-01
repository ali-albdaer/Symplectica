import { Vector3 } from 'three';

// Simple N-body gravity with a symplectic (kick-drift-kick) integrator.
// State is stored in arrays for performance and debuggability.

export class NBodySystem {
  /**
   * @param {{G:number, softeningAU:number}} params
   */
  constructor(params) {
    this.G = params.G;
    this.softeningAU = params.softeningAU;

    /** @type {Array<{id:string,name:string,mass:number,radiusAU:number,mesh:any}>} */
    this.bodies = [];

    /** @type {Vector3[]} */
    this.pos = [];
    /** @type {Vector3[]} */
    this.vel = [];
    /** @type {Vector3[]} */
    this.acc = [];

    // temp vectors to reduce allocations
    this._r = new Vector3();
    this._a = new Vector3();
  }

  addBody(body, positionAU, velocityAUPerDay) {
    this.bodies.push(body);
    this.pos.push(positionAU.clone());
    this.vel.push(velocityAUPerDay.clone());
    this.acc.push(new Vector3());
  }

  setParams({ G, softeningAU }) {
    if (typeof G === 'number') this.G = G;
    if (typeof softeningAU === 'number') this.softeningAU = softeningAU;
  }

  computeAccelerations() {
    const n = this.bodies.length;
    const eps2 = this.softeningAU * this.softeningAU;

    for (let i = 0; i < n; i++) {
      this.acc[i].set(0, 0, 0);
    }

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const mi = this.bodies[i].mass;
        const mj = this.bodies[j].mass;

        // r = pj - pi
        this._r.copy(this.pos[j]).sub(this.pos[i]);
        const r2 = this._r.lengthSq() + eps2;
        const invR = 1 / Math.sqrt(r2);
        const invR3 = invR * invR * invR;

        // a_i += G*mj * r / |r|^3
        this._a.copy(this._r).multiplyScalar(this.G * mj * invR3);
        this.acc[i].add(this._a);

        // a_j -= G*mi * r / |r|^3
        this._a.copy(this._r).multiplyScalar(this.G * mi * invR3);
        this.acc[j].sub(this._a);
      }
    }
  }

  // One symplectic step.
  step(dtDays) {
    const n = this.bodies.length;

    // Kick (half)
    this.computeAccelerations();
    for (let i = 0; i < n; i++) {
      this.vel[i].addScaledVector(this.acc[i], 0.5 * dtDays);
    }

    // Drift
    for (let i = 0; i < n; i++) {
      this.pos[i].addScaledVector(this.vel[i], dtDays);
    }

    // Kick (half)
    this.computeAccelerations();
    for (let i = 0; i < n; i++) {
      this.vel[i].addScaledVector(this.acc[i], 0.5 * dtDays);
    }
  }

  getBodyIndexById(id) {
    return this.bodies.findIndex(b => b.id === id);
  }
}
