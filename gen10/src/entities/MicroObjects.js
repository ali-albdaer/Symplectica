import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Entity } from './Entity.js';

export class MicroObjects extends Entity {
  constructor({ scene, physics }) {
    super();
    this.scene = scene;
    this.physics = physics;

    this.meshes = new Map(); // CANNON.Body -> THREE.Object3D
  }

  init() {
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
    });

    for (const rec of this.physics.microObjects) {
      let mesh;

      if (rec.kind === 'box') {
        const he = rec.halfExtents;
        mesh = new THREE.Mesh(new THREE.BoxGeometry(he.x * 2, he.y * 2, he.z * 2), mat);
      } else {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(rec.radius, 16, 16), mat);
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.meshes.set(rec.body, mesh);
    }
  }

  update() {
    for (const rec of this.physics.microObjects) {
      const mesh = this.meshes.get(rec.body);
      if (!mesh) continue;

      mesh.position.set(rec.body.position.x, rec.body.position.y, rec.body.position.z);
      mesh.quaternion.set(rec.body.quaternion.x, rec.body.quaternion.y, rec.body.quaternion.z, rec.body.quaternion.w);
    }
  }

  dispose() {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
    }
    this.meshes.clear();
  }
}
