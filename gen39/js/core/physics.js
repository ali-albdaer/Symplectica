import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

class Body {
  constructor(params) {
    this.id = params.id;
    this.mass = params.mass;
    this.position = params.position.clone();
    this.velocity = params.velocity.clone();
    this.force = new THREE.Vector3();
    this.mesh = params.mesh || null;
    this.isDynamic = params.isDynamic !== false;
    this.isCelestial = !!params.isCelestial;
  }
}

export class PhysicsWorld {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.bodies = [];
  }

  createBody(params) {
    const body = new Body(params);
    this.bodies.push(body);
    return body;
  }

  step(dt) {
    const G = this.config.physics.G;

    for (const b of this.bodies) {
      b.force.set(0, 0, 0);
    }

    const n = this.bodies.length;
    for (let i = 0; i < n; i++) {
      const a = this.bodies[i];
      for (let j = i + 1; j < n; j++) {
        const b = this.bodies[j];
        const dir = new THREE.Vector3().subVectors(b.position, a.position);
        const distSq = Math.max(dir.lengthSq(), 1);
        const invDist = 1 / Math.sqrt(distSq);
        const invDist3 = invDist * invDist * invDist;
        const forceMag = G * a.mass * b.mass * invDist3;
        dir.multiplyScalar(forceMag);
        a.force.add(dir);
        b.force.sub(dir);
      }
    }

    for (const b of this.bodies) {
      if (!b.isDynamic || b.mass <= 0) continue;
      const acc = b.force.clone().multiplyScalar(1 / b.mass);
      const halfDt = 0.5 * dt;
      b.velocity.addScaledVector(acc, halfDt);
      b.position.addScaledVector(b.velocity, dt);
      b.velocity.addScaledVector(acc, halfDt);
      b.velocity.multiplyScalar(this.config.physics.damping);
      if (b.mesh) {
        b.mesh.position.copy(b.position);
      }
    }
  }

  getBodies() {
    return this.bodies;
  }
}
