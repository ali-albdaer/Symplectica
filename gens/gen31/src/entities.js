import * as THREE from "three";
import { Body, computeCircularOrbitVelocity } from "./physics.js";

export function seedSystem(systemConfig, G) {
  const bodies = [];
  const lookup = new Map();

  // First pass: instantiate bodies with positions.
  for (const def of systemConfig.bodies) {
    const body = new Body({
      name: def.name,
      type: def.type,
      mass: def.mass,
      radius: def.radius,
      color: def.color,
      emission: def.emission,
      luminosity: def.luminosity || 0,
      position: new THREE.Vector3(def.position.x, def.position.y, def.position.z),
      velocity: new THREE.Vector3(def.velocity?.x || 0, def.velocity?.y || 0, def.velocity?.z || 0),
      static: !!def.static,
      canGrab: !!def.canGrab
    });
    bodies.push(body);
    lookup.set(def.name, body);
  }

  // Second pass: assign velocities for circular orbits.
  for (const def of systemConfig.bodies) {
    if (!def.orbiting) continue;
    const body = lookup.get(def.name);
    const primary = lookup.get(def.orbiting);
    if (!primary) continue;
    const radial = new THREE.Vector3().subVectors(body.position, primary.position);
    const distance = radial.length();
    if (distance < 1e-5) continue;
    const speed = computeCircularOrbitVelocity(G, primary.mass + body.mass, distance);
    const up = new THREE.Vector3(0, 1, 0);
    let tangential = new THREE.Vector3().crossVectors(up, radial);
    if (tangential.lengthSq() < 1e-8) tangential = new THREE.Vector3().crossVectors(radial, new THREE.Vector3(1, 0, 0));
    tangential.normalize().multiplyScalar(speed);
    body.velocity.copy(primary.velocity).add(tangential);
  }

  return bodies;
}

export function createCelestialMeshes(bodies, fidelity, enableLod) {
  const meshes = [];
  for (const b of bodies) {
    const baseDetail = Math.max(16, Math.min(96, Math.floor(b.radius * 3)));
    const highDetail = new THREE.SphereGeometry(b.radius, baseDetail, baseDetail);
    const lowDetail = new THREE.SphereGeometry(b.radius, Math.max(8, Math.floor(baseDetail * 0.5)), Math.max(8, Math.floor(baseDetail * 0.5)));
    const mat = new THREE.MeshStandardMaterial({
      color: b.color,
      emissive: new THREE.Color(b.color).multiplyScalar(b.emission || 0),
      roughness: 0.7,
      metalness: 0.05
    });
    let mesh;
    if (enableLod) {
      mesh = new THREE.LOD();
      mesh.addLevel(new THREE.Mesh(highDetail, mat), b.radius * 1.5);
      mesh.addLevel(new THREE.Mesh(lowDetail, mat), b.radius * 4.0);
    } else {
      mesh = new THREE.Mesh(highDetail, mat);
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(b.position);
    b.mesh = mesh;
    meshes.push(mesh);
  }
  return meshes;
}

export function createInteractableBodies(config, playerSpawn) {
  const list = [];
  for (const def of config.interactables) {
    const body = new Body({
      name: def.name,
      type: "prop",
      mass: def.mass,
      radius: def.radius,
      color: def.color,
      emission: def.emission,
      position: new THREE.Vector3(
        playerSpawn.x + def.offset.x,
        playerSpawn.y + def.offset.y,
        playerSpawn.z + def.offset.z
      ),
      velocity: new THREE.Vector3(0, 0, 0),
      static: false,
      canGrab: !!def.canGrab,
      isInteractable: true
    });
    list.push(body);
  }
  return list;
}
