export class InteractiveObject {
  constructor({ THREE, definition, physicsEntry, scene }) {
    this.THREE = THREE;
    this.definition = definition;
    this.physicsEntry = physicsEntry;
    this.scene = scene;
    this.mesh = this.createMesh();
    this.scene.add(this.mesh);
  }

  createMesh() {
    const geometry = new this.THREE.BoxGeometry(this.definition.size * 2, this.definition.size * 2, this.definition.size * 2);
    const material = new this.THREE.MeshStandardMaterial({ color: this.definition.color, roughness: 0.6, metalness: 0.2 });
    const mesh = new this.THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  update() {
    const body = this.physicsEntry.body;
    this.mesh.position.copy(body.position);
    this.mesh.quaternion.copy(body.quaternion);
  }
}
