// Placeholder for interactive grabbing logic; could be expanded later.

// No Three.js import needed here; the raycaster is created by callers.

export function pickObject(raycaster, objects) {
  const meshes = objects.map((o) => o.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if (hits.length === 0) return null;
  const hitMesh = hits[0].object;
  return objects.find((o) => o.mesh === hitMesh) || null;
}
