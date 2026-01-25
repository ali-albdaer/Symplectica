import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { Config } from '../core/config.js';
import { State } from '../core/state.js';
import { registerBody } from '../physics/physicsWorld.js';

// Shared vector to avoid allocations
const _tmp = new THREE.Vector3();

export function createSolarSystem() {
  const scene = new THREE.Scene();
  State.scene = scene;

  const { sun, planet1, planet2, moon1 } = Config.bodies;

  const sunMesh = createSphere(sun.radius, 32, 32, sun.color, true);
  sunMesh.position.set(sun.position.x, sun.position.y, sun.position.z);
  scene.add(sunMesh);

  const sunBody = makeBodyFromMesh(sunMesh, sun.mass, false);
  State.celestialBodies.push({ config: sun, mesh: sunMesh, body: sunBody });
  registerBody(sunBody);

  const planet1Data = createOrbitingBody(planet1, sunBody, 0);
  const planet2Data = createOrbitingBody(planet2, sunBody, 1.2);
  const moon1Data = createOrbitingBody(moon1, planet1Data.body, 0.6);

  [planet1Data, planet2Data, moon1Data].forEach((d) => {
    State.celestialBodies.push(d);
    registerBody(d.body);
  });
}

function createSphere(radius, widthSeg, heightSeg, color, emissive = false) {
  const hiGeo = new THREE.SphereGeometry(radius, widthSeg, heightSeg);
  const loGeo = new THREE.SphereGeometry(
    radius,
    Math.max(8, Math.floor(widthSeg * 0.5)),
    Math.max(6, Math.floor(heightSeg * 0.5))
  );
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: emissive ? color : 0x000000,
    emissiveIntensity: emissive ? 2.0 : 0.0,
    roughness: 1.0,
    metalness: 0.0
  });
  const mesh = new THREE.Mesh(hiGeo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.hiGeo = hiGeo;
  mesh.userData.loGeo = loGeo;
  return mesh;
}

function makeBodyFromMesh(mesh, mass, dynamic = true) {
  const body = {
    mass,
    position: mesh.position,
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    dynamic,
    onPostIntegrate: (dt) => {
      // keep mesh in sync implicitly since we store reference to position
    }
  };
  return body;
}

function createOrbitingBody(def, centralBody, phaseOffset) {
  const { orbitRadius, radius, mass, color, inclination } = def;

  const segBase = 22;
  const mesh = createSphere(radius, segBase, segBase, color, false);

  const angle = phaseOffset * Math.PI * 2;
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  const y = Math.sin(inclination || 0) * 0.2 * orbitRadius;
  mesh.position.set(x, y, z).add(centralBody.position);

  const vMag = Math.sqrt((Config.physics.G * centralBody.mass) / orbitRadius);
  _tmp.set(-Math.sin(angle), 0, Math.cos(angle)).multiplyScalar(vMag);

  const body = makeBodyFromMesh(mesh, mass, true);
  body.velocity.copy(_tmp).add(centralBody.velocity || new THREE.Vector3());

  State.scene.add(mesh);
  return { config: def, mesh, body };
}
