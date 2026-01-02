import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function projectOnPlane(vec, normal) {
  const n = normal.clone().normalize();
  return vec.clone().sub(n.multiplyScalar(vec.dot(n)));
}

export function buildOrientation(up, yaw, pitch) {
  const baseUp = new THREE.Vector3(0, 1, 0);
  const baseForward = new THREE.Vector3(0, 0, -1);
  const baseRight = new THREE.Vector3(1, 0, 0);
  const align = new THREE.Quaternion().setFromUnitVectors(baseUp, up.clone().normalize());
  const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, yaw);
  const right = baseRight.clone().applyQuaternion(align).applyQuaternion(yawQuat);
  const pitchQuat = new THREE.Quaternion().setFromAxisAngle(right, pitch);
  const orientation = align.clone().multiply(yawQuat).multiply(pitchQuat);
  const forward = baseForward.clone().applyQuaternion(orientation).normalize();
  const finalRight = baseRight.clone().applyQuaternion(orientation).normalize();
  return { orientation, forward, right: finalRight, up: up.clone().normalize() };
}
