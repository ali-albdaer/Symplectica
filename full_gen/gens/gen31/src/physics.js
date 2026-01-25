import * as THREE from "three";

// Represents a physical body with mass and integrates via leapfrog.
export class Body {
  constructor(options) {
    this.name = options.name;
    this.type = options.type || "generic";
    this.mass = options.mass;
    this.radius = options.radius;
    this.color = options.color || 0xffffff;
    this.emission = options.emission || 0;
    this.luminosity = options.luminosity || 0;
    this.position = new THREE.Vector3().copy(options.position || new THREE.Vector3());
    this.velocity = new THREE.Vector3().copy(options.velocity || new THREE.Vector3());
    this.acceleration = new THREE.Vector3();
    this.static = !!options.static;
    this.canGrab = !!options.canGrab;
    this.mesh = options.mesh || null;
    this.isInteractable = options.isInteractable || false;
  }
}

export function computeCircularOrbitVelocity(G, primaryMass, radius) {
  // v = sqrt(G*M/r)
  return Math.sqrt((G * primaryMass) / radius);
}

export function computeAccelerations(bodies, G) {
  const n = bodies.length;
  for (let i = 0; i < n; i += 1) {
    bodies[i].acceleration.set(0, 0, 0);
  }
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const bi = bodies[i];
      const bj = bodies[j];
      const delta = new THREE.Vector3().subVectors(bj.position, bi.position);
      const r2 = Math.max(delta.lengthSq(), 1e-6);
      const invR = 1 / Math.sqrt(r2);
      const invR3 = invR * invR * invR;
      const force = G * bi.mass * bj.mass * invR3;
      const fvec = delta.multiplyScalar(force);
      bi.acceleration.add(fvec.clone().multiplyScalar(1 / bi.mass));
      bj.acceleration.add(fvec.clone().multiplyScalar(-1 / bj.mass));
    }
  }
}

export function stepBodiesLeapfrog(bodies, dt, G, drag = 1.0) {
  // Kick-drift-kick scheme for better energy preservation.
  computeAccelerations(bodies, G);
  for (const b of bodies) {
    if (b.static) continue;
    b.velocity.addScaledVector(b.acceleration, 0.5 * dt);
  }
  for (const b of bodies) {
    if (b.static) continue;
    b.position.addScaledVector(b.velocity, dt);
    b.velocity.multiplyScalar(drag);
  }
  computeAccelerations(bodies, G);
  for (const b of bodies) {
    if (b.static) continue;
    b.velocity.addScaledVector(b.acceleration, 0.5 * dt);
  }
}

export function updateMeshesFromBodies(bodies) {
  for (const b of bodies) {
    if (!b.mesh) continue;
    b.mesh.position.copy(b.position);
  }
}

export function clampVectorLength(vec, maxLen) {
  const len = vec.length();
  if (len > maxLen) vec.multiplyScalar(maxLen / len);
  return vec;
}

export function findClosestSurface(bodyList, point) {
  let closest = null;
  let minGap = Infinity;
  for (const b of bodyList) {
    if (!b.radius || b.mass <= 0) continue;
    const dist = b.position.distanceTo(point);
    const gap = dist - b.radius;
    if (gap < minGap) {
      minGap = gap;
      closest = b;
    }
  }
  return { body: closest, gap: minGap };
}
