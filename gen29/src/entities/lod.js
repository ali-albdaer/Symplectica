// Optional LOD utilities (off by default).

export function createSphereMeshOrLOD({ THREE, radius, material, fidelity, enableLOD, enableShadows }) {
  if (!enableLOD) {
    const seg = fidelity === 'Ultra' ? 64 : fidelity === 'Low' ? 16 : 32;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, seg, seg), material);
    mesh.scale.setScalar(radius);
    mesh.castShadow = enableShadows;
    mesh.receiveShadow = enableShadows;
    return mesh;
  }

  // LOD distances are in world units from camera.
  const lod = new THREE.LOD();
  lod.autoUpdate = true;

  const low = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 12), material);
  const med = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), material);
  const high = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), material);

  for (const m of [low, med, high]) {
    m.scale.setScalar(radius);
    m.castShadow = enableShadows;
    m.receiveShadow = enableShadows;
  }

  // Tune thresholds; these are conservative and can be revisited.
  lod.addLevel(high, 0);
  lod.addLevel(med, 90);
  lod.addLevel(low, 180);

  return lod;
}
