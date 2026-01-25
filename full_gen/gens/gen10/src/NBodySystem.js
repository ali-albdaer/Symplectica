import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Config } from './Config.js';

// Stable N-body integrator (velocity Verlet / kick-drift-kick)
// Intended for celestial bodies (Sun, planets, moons) to keep long-term orbits stable.

export class NBodySystem {
  constructor() {
    /** @type {Array<{ id:string, mass:number, position:THREE.Vector3, velocity:THREE.Vector3, acceleration:THREE.Vector3 }>} */
    this.bodies = [];
    this._tmp = new THREE.Vector3();
  }

  addBody({ id, mass, position, velocity }) {
    this.bodies.push({
      id,
      mass,
      position: position.clone(),
      velocity: velocity.clone(),
      acceleration: new THREE.Vector3(),
    });
  }

  getBody(id) {
    return this.bodies.find((b) => b.id === id) || null;
  }

  computeAccelerations() {
    const { G, softening } = Config.sim;
    const eps2 = softening * softening;

    // Reset
    for (const b of this.bodies) b.acceleration.set(0, 0, 0);

    // Pairwise
    for (let i = 0; i < this.bodies.length; i++) {
      const bi = this.bodies[i];
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bj = this.bodies[j];

        // r = xj - xi
        const r = this._tmp.copy(bj.position).sub(bi.position);
        const dist2 = r.lengthSq() + eps2;
        const invDist = 1 / Math.sqrt(dist2);
        const invDist3 = invDist * invDist * invDist;

        // a_i += G*m_j * r / |r|^3
        // a_j -= G*m_i * r / |r|^3
        const scale = G * invDist3;

        const aOnI = r.clone().multiplyScalar(scale * bj.mass);
        const aOnJ = r.clone().multiplyScalar(scale * bi.mass);

        bi.acceleration.add(aOnI);
        bj.acceleration.sub(aOnJ);
      }
    }
  }

  step(dt) {
    if (this.bodies.length === 0) return;

    // Kick (v += a*dt/2)
    this.computeAccelerations();
    for (const b of this.bodies) {
      b.velocity.addScaledVector(b.acceleration, dt * 0.5);
    }

    // Drift (x += v*dt)
    for (const b of this.bodies) {
      b.position.addScaledVector(b.velocity, dt);
    }

    // Kick again with new accelerations
    this.computeAccelerations();
    for (const b of this.bodies) {
      b.velocity.addScaledVector(b.acceleration, dt * 0.5);
    }
  }
}
