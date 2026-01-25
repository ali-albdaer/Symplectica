import * as THREE from 'three';
import { Units } from '../../utils/units.js';

// Visual scaling:
// Real radii are tiny compared to orbital distances. We scale radii up for visibility
// while keeping physics in real-ish units.

export function createBodyMeshFactory({ Globals }) {
  const materialCache = new Map();

  function getMaterial(id) {
    if (materialCache.has(id)) return materialCache.get(id);

    const mat = new THREE.MeshStandardMaterial({
      color: id === 'sun' ? 0xfff1cc : 0xb0c4de,
      emissive: id === 'sun' ? 0xffddaa : 0x000000,
      emissiveIntensity: id === 'sun' ? 1.25 : 0,
      roughness: 0.85,
      metalness: 0.0
    });

    materialCache.set(id, mat);
    return mat;
  }

  return function makeBodyMesh(body) {
    // Visual radius: scale up small bodies but cap so they don't become absurd.
    const realRadiusAU = body.radiusAU;
    const visRadiusAU = Math.max(realRadiusAU * 600, Units.kmToAU(5000));

    const geom = new THREE.SphereGeometry(visRadiusAU, 32, 24);
    const mesh = new THREE.Mesh(geom, getMaterial(body.id));
    mesh.castShadow = body.id !== 'sun';
    mesh.receiveShadow = body.id !== 'sun';
    mesh.userData.bodyId = body.id;

    return mesh;
  };
}
