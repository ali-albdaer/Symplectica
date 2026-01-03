// Physics world: N-body gravity + simple rigid bodies and collisions

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";
import { Config } from "../core/config.js";
import { Debug } from "../core/debug.js";

export class Body {
  constructor({ id, mass, radius, position, velocity, dynamic = true, isCelestial = false, canCollide = true }) {
    this.id = id;
    this.mass = mass;
    this.radius = radius;
    this.position = position.clone();
    this.velocity = velocity.clone();
    this.acceleration = new THREE.Vector3();
    this.dynamic = dynamic; // if false, not moved by integrator
    this.isCelestial = isCelestial;
    this.canCollide = canCollide;
  }
}

export class PhysicsWorld {
  constructor() {
    this.bodies = [];
  }

  init() {
    Debug.log("Physics world initialized");
  }

  addBody(body) {
    this.bodies.push(body);
    return body;
  }

  step(dt) {
    if (this.bodies.length === 0) return;

    const G = Config.gravityConstant;

    // Compute accelerations (N-body)
    for (let i = 0; i < this.bodies.length; i++) {
      const bi = this.bodies[i];
      bi.acceleration.set(0, 0, 0);
    }

    for (let i = 0; i < this.bodies.length; i++) {
      const bi = this.bodies[i];
      for (let j = i + 1; j < this.bodies.length; j++) {
        const bj = this.bodies[j];
        const diff = new THREE.Vector3().subVectors(bj.position, bi.position);
        const distSq = Math.max(diff.lengthSq(), 1e-6);
        const invDist = 1 / Math.sqrt(distSq);
        const invDist3 = invDist * invDist * invDist;
        const forceMag = G * bi.mass * bj.mass * invDist3;

        const acc_i = diff.clone().multiplyScalar(forceMag / bi.mass);
        const acc_j = diff.clone().multiplyScalar(-forceMag / bj.mass);

        bi.acceleration.add(acc_i);
        bj.acceleration.add(acc_j);
      }
    }

    // Integrate velocities and positions (semi-implicit Euler for simplicity + small dt)
    for (const b of this.bodies) {
      if (!b.dynamic) continue;
      b.velocity.addScaledVector(b.acceleration, dt);
      b.position.addScaledVector(b.velocity, dt);
    }

    // Simple sphere collision with celestial bodies acting as ground
    for (const b of this.bodies) {
      if (!b.canCollide || b.isCelestial) continue;

      let closestGround = null;
      let closestPenetration = 0;
      for (const c of this.bodies) {
        if (!c.isCelestial) continue;
        const toB = new THREE.Vector3().subVectors(b.position, c.position);
        const dist = toB.length();
        const minDist = c.radius + b.radius;
        if (dist < minDist) {
          const penetration = minDist - dist;
          if (!closestGround || penetration > closestPenetration) {
            closestGround = { c, toB, dist, minDist, penetration };
            closestPenetration = penetration;
          }
        }
      }

      if (closestGround) {
        const { c, toB, dist, minDist } = closestGround;
        const normal = toB.normalize();
        // Project body out to surface
        b.position.copy(c.position).addScaledVector(normal, minDist + 0.001);
        // Remove inward velocity component (simple ground contact)
        const vDotN = b.velocity.dot(normal);
        if (vDotN < 0) {
          b.velocity.addScaledVector(normal, -vDotN);
        }
      }
    }
  }
}
