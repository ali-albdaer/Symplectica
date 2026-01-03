import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { Config } from '../core/config.js';
import { State } from '../core/state.js';
import { registerBody } from '../physics/physicsWorld.js';

export function spawnMicroObjectsAroundPlayer() {
  const { nearPlayerCount, baseRadius, baseMass, luminousRatio, spawnRadius } = Config.microObjects;
  if (!State.player || !State.player.body) return;

  const center = State.player.body.position;

  for (let i = 0; i < nearPlayerCount; i++) {
    const angle = (i / nearPlayerCount) * Math.PI * 2;
    const offset = new THREE.Vector3(
      Math.cos(angle) * spawnRadius,
      1.5,
      Math.sin(angle) * spawnRadius
    );
    const pos = center.clone().add(offset);

    const radius = baseRadius * (0.7 + Math.random() * 0.6);
    const luminous = Math.random() < luminousRatio;

    const geo = new THREE.SphereGeometry(radius, luminous ? 18 : 12, luminous ? 18 : 12);
    const mat = new THREE.MeshStandardMaterial({
      color: luminous ? 0xffddaa : 0x9999ff,
      emissive: luminous ? 0xffcc88 : 0x000000,
      emissiveIntensity: luminous ? 1.2 : 0.0,
      roughness: 0.5,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(pos);
    State.scene.add(mesh);

    const body = {
      mass: baseMass,
      position: mesh.position,
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      dynamic: true,
      onPostIntegrate: null
    };
    registerBody(body);

    State.rigidBodies.push({ mesh, body, luminous });
  }
}
