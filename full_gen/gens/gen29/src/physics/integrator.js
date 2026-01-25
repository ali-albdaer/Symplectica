import { THREE } from '../vendor.js';

export class VelocityVerletIntegrator {
  constructor(configStore) {
    this.configStore = configStore;

    this._acc = new Map();
    this._tmp = new THREE.Vector3();
  }

  _getAcc(id) {
    let v = this._acc.get(id);
    if (!v) {
      v = new THREE.Vector3();
      this._acc.set(id, v);
    }
    return v;
  }

  _computeAccelerations(bodies) {
    const G = this.configStore.get('sim.G');
    const soft = this.configStore.get('sim.gravitySoftening');

    // Zero.
    for (const b of bodies) this._getAcc(b.id).set(0, 0, 0);

    // Pairwise Newtonian gravity.
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];

        const r = this._tmp.subVectors(b.position, a.position);
        const d2 = r.lengthSq() + soft * soft;
        const invD = 1 / Math.sqrt(d2);
        const invD3 = invD * invD * invD;

        const sA = G * b.mass * invD3;
        const sB = G * a.mass * invD3;

        this._getAcc(a.id).addScaledVector(r, sA);
        this._getAcc(b.id).addScaledVector(r, -sB);
      }
    }
  }

  step(bodies, dt) {
    if (bodies.length === 0) return;

    this._computeAccelerations(bodies);

    // v(t+dt/2) and x(t+dt)
    for (const b of bodies) {
      const a0 = this._getAcc(b.id);
      b.velocity.addScaledVector(a0, 0.5 * dt);
      b.position.addScaledVector(b.velocity, dt);
    }

    this._computeAccelerations(bodies);

    // v(t+dt)
    for (const b of bodies) {
      const a1 = this._getAcc(b.id);
      b.velocity.addScaledVector(a1, 0.5 * dt);

      const damping = this.configStore.get('sim.velocityDampingPerSecond');
      if (damping !== 1.0) {
        const k = Math.pow(damping, dt);
        b.velocity.multiplyScalar(k);
      }
    }
  }
}
