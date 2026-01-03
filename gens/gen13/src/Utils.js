import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';

export function vec3FromArray(arr) {
  return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatVector(v) {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

export function buildLOD(meshFactory) {
  const lod = new THREE.LOD();
  const levels = meshFactory();
  levels.forEach((entry) => {
    lod.addLevel(entry.mesh, entry.distance);
  });
  return lod;
}
