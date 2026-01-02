// Shared helpers for attaching physics bodies to meshes.
export function bindPhysics(mesh, physicsBody) {
  mesh.userData.physicsBody = physicsBody;
  return mesh;
}
