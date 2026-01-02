import { THREE } from '../vendor.js';
import { VelocityVerletIntegrator } from './integrator.js';

export class World {
  constructor(configStore, debugOverlay) {
    this.configStore = configStore;
    this.debugOverlay = debugOverlay;

    this.integrator = new VelocityVerletIntegrator(configStore);

    /** @type {Array<any>} */
    this.bodies = [];

    // For render interpolation.
    this._prevPos = new Map();
    this._prevQuat = new Map();
  }

  addBody(body) {
    this.bodies.push(body);
    this._prevPos.set(body.id, body.position.clone());
    this._prevQuat.set(body.id, body.rotation.clone());
  }

  removeBody(body) {
    this.bodies = this.bodies.filter((b) => b !== body);
    this._prevPos.delete(body.id);
    this._prevQuat.delete(body.id);
  }

  step(dt) {
    // Save previous transforms for interpolation.
    for (const b of this.bodies) {
      const p = this._prevPos.get(b.id);
      if (p) p.copy(b.position);
      const q = this._prevQuat.get(b.id);
      if (q) q.copy(b.rotation);
    }

    try {
      this.integrator.step(this.bodies, dt);
    } catch (e) {
      this.debugOverlay.log('Physics step failed', e);
    }

    // Spin (self-rotation) is visual only and does not affect gravitational physics.
    for (const b of this.bodies) {
      if (b.spinRadPerSec) {
        const axis = b.spinAxis || new THREE.Vector3(0, 1, 0);
        const angle = b.spinRadPerSec * dt;
        const dq = new THREE.Quaternion().setFromAxisAngle(axis, angle);
        b.rotation.multiply(dq);
      }
    }
  }

  syncVisuals(alpha) {
    for (const b of this.bodies) {
      if (!b.mesh) continue;

      const prevP = this._prevPos.get(b.id);
      const prevQ = this._prevQuat.get(b.id);
      if (prevP) b.mesh.position.lerpVectors(prevP, b.position, alpha);
      else b.mesh.position.copy(b.position);

      if (prevQ) b.mesh.quaternion.slerpQuaternions(prevQ, b.rotation, alpha);
      else b.mesh.quaternion.copy(b.rotation);
    }
  }

  totalEnergy() {
    // For debugging stability: kinetic + potential.
    const G = this.configStore.get('sim.G');
    const soft = this.configStore.get('sim.gravitySoftening');

    let kinetic = 0;
    for (const b of this.bodies) {
      kinetic += 0.5 * b.mass * b.velocity.lengthSq();
    }

    let potential = 0;
    for (let i = 0; i < this.bodies.length; i++) {
      for (let j = i + 1; j < this.bodies.length; j++) {
        const a = this.bodies[i];
        const c = this.bodies[j];
        const r = a.position.distanceTo(c.position);
        potential += (-G * a.mass * c.mass) / Math.sqrt(r * r + soft * soft);
      }
    }

    return { kinetic, potential, total: kinetic + potential };
  }
}
