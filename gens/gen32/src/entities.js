import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { config } from './config.js';

export function createCelestialMeshes(scene, bodies) {
  const loader = new THREE.TextureLoader();
  const materials = {};

  for (const body of bodies) {
    const mat = new THREE.MeshStandardMaterial({
      color: body.color || 0xffffff,
      roughness: 0.6,
      metalness: 0.0,
      emissive: body.luminosity > 0 ? new THREE.Color(body.color || 0xffffff) : new THREE.Color(0x000000),
      emissiveIntensity: body.luminosity > 0 ? 1.2 : 0.0,
    });
    materials[body.id] = mat;

    const { lod, mesh } = buildLodGeometry(body.radius, mat);

    if (config.lodEnabled) {
      lod.traverse(level => level.castShadow = true);
      lod.traverse(level => level.receiveShadow = true);
      body.mesh = lod;
      scene.add(lod);
    } else {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      body.mesh = mesh;
      scene.add(mesh);
    }
    body.mesh.material = mat;
  }
}

function buildLodGeometry(radius, material) {
  const lod = new THREE.LOD();
  const geoHigh = new THREE.SphereGeometry(radius, 64, 32);
  const geoMid = new THREE.SphereGeometry(radius, 32, 16);
  const geoLow = new THREE.SphereGeometry(radius, 16, 12);
  lod.addLevel(new THREE.Mesh(geoHigh, material.clone()), 0);
  lod.addLevel(new THREE.Mesh(geoMid, material.clone()), radius * 4);
  lod.addLevel(new THREE.Mesh(geoLow, material.clone()), radius * 8);
  const mesh = new THREE.Mesh(geoHigh, material);
  return { lod, mesh };
}

export function syncBodyMeshes(bodies) {
  for (const body of bodies) {
    if (!body.mesh) continue;
    body.mesh.position.copy(body.position);
    if (body.mesh instanceof THREE.LOD) {
      body.mesh.updateMatrix();
    }
  }
}

export function createInteractiveProps(scene, playerSpawn, count, luminousCount) {
  const props = [];
  for (let i = 0; i < count; i++) {
    const isLuminous = i < luminousCount;
    const geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const mat = new THREE.MeshStandardMaterial({
      color: isLuminous ? 0xffcc66 : 0x88aadd,
      emissive: isLuminous ? 0xffaa44 : 0x000000,
      emissiveIntensity: isLuminous ? 3.0 : 0,
      roughness: 0.3,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 8,
      2 + Math.random() * 2,
      (Math.random() - 0.5) * 8
    );
    mesh.position.copy(playerSpawn.clone().add(offset));
    scene.add(mesh);

    props.push({
      id: `prop-${i}`,
      type: "prop",
      mass: config.interactiveObjects.mass,
      radius: 0.8,
      position: mesh.position.clone(),
      velocity: new THREE.Vector3(),
      acceleration: new THREE.Vector3(),
      mesh,
      externalAcceleration: new THREE.Vector3(),
      static: false,
    });
  }
  return props;
}

export function createStarField(scene, starCount) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 1e6 + Math.random() * 3e6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 50000, sizeAttenuation: true, transparent: true, opacity: 0.9 });
  const stars = new THREE.Points(geometry, material);
  stars.matrixAutoUpdate = false;
  stars.updateMatrix();
  scene.add(stars);
  return stars;
}
