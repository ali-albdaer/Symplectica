import { Config } from '../core/config.js';
import { State } from '../core/state.js';

// Simple N-body physics world using semi-implicit Euler integration.

export async function initPhysicsWorld() {
  State.physicsWorld = {
    bodies: []
  };
}

export function registerBody(body) {
  if (!State.physicsWorld) return;
  State.physicsWorld.bodies.push(body);
}

export function stepPhysics(dt) {
  const world = State.physicsWorld;
  if (!world) return;

  const bodies = world.bodies;
  const n = bodies.length;
  const G = Config.physics.G;
  const softening = Config.physics.softening;

  // Reset accelerations on dynamic bodies only (static bodies do not move).
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.dynamic) b.acceleration.set(0, 0, 0);
  }

  // Compute pairwise gravitational forces. All massive bodies act as sources,
  // but only dynamic bodies are integrated.
  for (let i = 0; i < n; i++) {
    const bi = bodies[i];
    if (!bi.dynamic) continue; // no need to accumulate forces on static origins

    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const bj = bodies[j];
      if (!bj.mass || bj === bi) continue;

      const rij = new THREE.Vector3().subVectors(bj.position, bi.position);
      const distSq = rij.lengthSq() + softening * softening;
      const dist = Math.sqrt(distSq);
      if (dist === 0) continue;

      const forceMag = (G * bi.mass * bj.mass) / distSq;
      const dir = rij.multiplyScalar(1 / dist);

      const ai = dir.multiplyScalar(forceMag / bi.mass);
      bi.acceleration.add(ai);
    }
  }

  // Integrate motion of dynamic bodies.
  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (!b.dynamic) continue;
    b.velocity.addScaledVector(b.acceleration, dt);
    b.position.addScaledVector(b.velocity, dt);
    if (b.onPostIntegrate) b.onPostIntegrate(dt);
  }
}
