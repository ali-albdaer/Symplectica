// Simple symplectic N-body integrator with leapfrog updates
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export class PhysicsSystem {
  constructor(cfg) {
    this.cfg = cfg;
    this.bodies = [];
    this.props = [];
    this.lastAccelValid = false;
  }

  registerBodies(bodies) {
    this.bodies = bodies;
    this.lastAccelValid = false;
  }

  registerProps(props) {
    this.props = props;
    this.lastAccelValid = false;
  }

  step(realDt, externalAccelCallback) {
    if (this.cfg.debug.freezePhysics) return;
    const dt = realDt * this.cfg.timeScale;
    if (!isFinite(dt) || dt <= 0) return;

    const maxDt = 120; // clamp to avoid huge jumps when tab is backgrounded
    let remaining = Math.min(dt, maxDt * this.cfg.maxSubsteps);
    const subDt = Math.min(maxDt, dt / Math.max(1, Math.ceil(dt / maxDt)));

    while (remaining > 0) {
      const stepDt = Math.min(subDt, remaining);
      this.singleStep(stepDt, externalAccelCallback);
      remaining -= stepDt;
    }
  }

  singleStep(dt, externalAccelCallback) {
    const all = [...this.bodies, ...this.props];
    if (!this.lastAccelValid) {
      this.computeAccelerations(all);
      this.lastAccelValid = true;
    }

    const halfDt = dt * 0.5;
    for (const body of all) {
      if (body.static) continue;
      if (body.externalAcceleration) body.acceleration.add(body.externalAcceleration);
      body.velocity.addScaledVector(body.acceleration, halfDt);
    }

    for (const body of all) {
      if (body.static) continue;
      body.position.addScaledVector(body.velocity, dt);
    }

    if (externalAccelCallback) externalAccelCallback();

    this.computeAccelerations(all);

    for (const body of all) {
      if (body.static) continue;
      body.velocity.addScaledVector(body.acceleration, halfDt);
    }
  }

  computeAccelerations(list) {
    const G = this.cfg.gravityConstant;
    const eps2 = this.cfg.softeningLength * this.cfg.softeningLength;
    for (const b of list) {
      b.acceleration.set(0, 0, 0);
    }

    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i];
        const b = list[j];
        const dir = new THREE.Vector3().subVectors(b.position, a.position);
        const dist2 = Math.max(dir.lengthSq(), eps2);
        const dist = Math.sqrt(dist2);
        const forceMag = (G * a.mass * b.mass) / dist2;
        const accelA = dir.clone().multiplyScalar(forceMag / (a.mass * dist));
        const accelB = dir.clone().multiplyScalar(-forceMag / (b.mass * dist));
        a.acceleration.add(accelA);
        b.acceleration.add(accelB);
      }
    }
  }
}
