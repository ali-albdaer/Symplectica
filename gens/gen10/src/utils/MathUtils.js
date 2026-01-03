import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function safeNormalize(v3, fallback = new THREE.Vector3(0, 1, 0)) {
  const len = v3.length();
  if (len > 1e-8) return v3.multiplyScalar(1 / len);
  return v3.copy(fallback);
}

export function projectOnPlane(vec, planeNormal) {
  // vec - n*(vec·n)
  const n = planeNormal;
  return vec.clone().sub(n.clone().multiplyScalar(vec.dot(n)));
}

export function exponentialDamp(current, target, lambda, dt) {
  // Smooth damp that is framerate-independent
  const t = 1 - Math.exp(-lambda * dt);
  return current + (target - current) * t;
}
