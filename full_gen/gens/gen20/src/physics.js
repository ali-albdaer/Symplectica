import { Vector3 } from "https://unpkg.com/three@0.164.0/build/three.module.js";
import { Config } from "./config.js";

export class SimBody {
  constructor(def) {
    this.id = def.id;
    this.name = def.name;
    this.mass = def.mass;
    this.radius = def.radius;
    this.color = def.color;
    this.albedo = def.albedo;
    this.emissive = def.emissive;
    this.luminosity = def.luminosity;
    this.isStar = !!def.isStar;
    this.parent = def.parent || null;
    this.position = new Vector3(...(def.position || [0, 0, 0]));
    this.velocity = new Vector3(...(def.velocity || [0, 0, 0]));
    this.acc = new Vector3();
  }
}

export class PhysicsWorld {
  constructor() {
    this.G = Config.constants.G;
    this.softening = Config.sim.softening;
    this.bodies = [];
  }

  addBody(body) {
    this.bodies.push(body);
  }

  computePairwiseAccelerations() {
    const n = this.bodies.length;
    for (let i = 0; i < n; i++) this.bodies[i].acc.set(0, 0, 0);
    for (let i = 0; i < n; i++) {
      const bi = this.bodies[i];
      for (let j = i + 1; j < n; j++) {
        const bj = this.bodies[j];
        const r = bj.position.clone().sub(bi.position);
        const distSq = r.lengthSq() + this.softening * this.softening;
        const invDist = 1 / Math.sqrt(distSq);
        const invDist3 = invDist * invDist * invDist;
        const f = this.G * invDist3;
        const acc_i = r.clone().multiplyScalar(f * bj.mass);
        const acc_j = r.clone().multiplyScalar(-f * bi.mass);
        bi.acc.add(acc_i);
        bj.acc.add(acc_j);
      }
    }
  }

  // Symplectic leapfrog for stability with astrophysical magnitudes.
  step(dt) {
    // initial accelerations assumed computed previously
    const halfDt = dt * 0.5;
    for (const b of this.bodies) {
      b.velocity.addScaledVector(b.acc, halfDt);
      b.position.addScaledVector(b.velocity, dt);
    }
    this.computePairwiseAccelerations();
    for (const b of this.bodies) {
      b.velocity.addScaledVector(b.acc, halfDt);
    }
  }

  gravityAt(position) {
    const g = new Vector3();
    for (const b of this.bodies) {
      const r = b.position.clone().sub(position);
      const distSq = r.lengthSq() + this.softening * this.softening;
      const invDist = 1 / Math.sqrt(distSq);
      const invDist3 = invDist * invDist * invDist;
      g.add(r.multiplyScalar(this.G * b.mass * invDist3));
    }
    return g;
  }
}

// Helper to create initial circular-orbit velocities based on parent mass.
export function initializeBodiesFromConfig() {
  const bodies = Config.bodies.map((def) => new SimBody(def));
  const lookup = new Map();
  bodies.forEach((b) => lookup.set(b.id, b));

  const star = lookup.get("sun");
  for (const b of bodies) {
    if (b === star) continue;
    const parent = b.parent ? lookup.get(b.parent) : star;
    if (!parent) continue;
    const axis = new Vector3(0, 1, 0);
    const distance = b.semiMajorAxis || parent.radius * 20;
    const inclination = b.inclination || 0;
    const phase = b.phase || 0;

    const radial = new Vector3(Math.cos(phase), 0, Math.sin(phase)).applyAxisAngle(new Vector3(1, 0, 0), inclination).normalize();
    b.position.copy(parent.position).add(radial.clone().multiplyScalar(distance));

    const speed = Math.sqrt((Config.constants.G * parent.mass) / distance);
    const tangential = new Vector3(0, 1, 0).cross(radial).normalize();
    b.velocity.copy(parent.velocity).add(tangential.multiplyScalar(speed));
  }

  return bodies;
}
