import * as THREE from 'three';
import { Globals } from './config/globals.js';
import { NBodySystem } from './engine/physics/nbody.js';
import { createDefaultSystem } from './engine/world/createDefaultSystem.js';
import { createBodyMeshFactory } from './engine/render/bodies.js';
import { createDevMenu } from './ui/devMenu.js';
import { createHud } from './ui/hud.js';
import { Player } from './game/player.js';
import { CameraRig } from './game/cameraRig.js';
import { Units } from './utils/units.js';
import { installErrorOverlay } from './utils/errorOverlay.js';
import { RigidObjectSystem } from './engine/physics/rigidObjects.js';
import { spawnInteractables } from './game/spawnInteractables.js';

const app = document.getElementById('app');
if (!app) throw new Error('App element not found');

installErrorOverlay();

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = Globals.render.enableShadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, Units.kmToAU(1), Units.kmToAU(2e9));

const cameraRig = new CameraRig(camera);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.08);
scene.add(ambient);

const sunLight = new THREE.PointLight(0xfff2d2, 4.5, 0, 2);
sunLight.castShadow = Globals.render.enableShadows;
scene.add(sunLight);

// Background stars (cheap)
{
  const starGeom = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 200 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6, sizeAttenuation: true });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);
}

const nbody = new NBodySystem({ G: Globals.sim.G, softeningAU: Globals.sim.softeningAU });
const makeBodyMesh = createBodyMeshFactory({ Globals });

createDefaultSystem({ Globals, nbody, scene, makeBodyMesh });

// Keep light at sun.
const sunIdx = nbody.getBodyIndexById('sun');
if (sunIdx >= 0) sunLight.position.copy(nbody.pos[sunIdx]);

// Player
const player = new Player({ Globals, nbody, cameraRig });
player.setSpawnOnBody('planet1');
player.attachInput(renderer.domElement);

// Interactable objects (affected by gravity and collisions)
const rigid = new RigidObjectSystem({ Globals, nbody, scene });
spawnInteractables({ rigid, player });

const hud = createHud({ Globals });

const devMenu = createDevMenu({
  Globals,
  onGlobalsChanged: (path) => {
    if (path.startsWith('sim.')) {
      nbody.setParams({ G: Globals.sim.G, softeningAU: Globals.sim.softeningAU });
    }
    if (path.startsWith('render.')) {
      renderer.shadowMap.enabled = Globals.render.enableShadows;
    }
  }
});

function applyFidelity() {
  const level = Globals.render.fidelity;
  // Keep simple, but meaningful.
  if (level === 0) {
    renderer.setPixelRatio(1);
    renderer.shadowMap.type = THREE.BasicShadowMap;
    sunLight.shadow.mapSize.set(512, 512);
  } else if (level === 1) {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.shadowMap.type = THREE.PCFShadowMap;
    sunLight.shadow.mapSize.set(1024, 1024);
  } else {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    sunLight.shadow.mapSize.set(2048, 2048);
  }
  sunLight.castShadow = Globals.render.enableShadows;
}

applyFidelity();

// Basic ground visuals for planet 1 (a ring-ish marker)
{
  const idx = nbody.getBodyIndexById('planet1');
  if (idx >= 0) {
    const body = nbody.bodies[idx];
    const ringGeom = new THREE.RingGeometry(body.radiusAU * 1.02, body.radiusAU * 1.10, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x334455, side: THREE.DoubleSide, transparent: true, opacity: 0.55 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.userData.followBodyId = 'planet1';
    scene.add(ring);
  }
}

// Pointer lock on click
renderer.domElement.addEventListener('click', () => {
  if (devMenu.isOpen()) return;
  renderer.domElement.requestPointerLock?.();
});

// Hotkeys
window.addEventListener('keydown', (e) => {
  if (e.code === 'Slash') {
    e.preventDefault();
    devMenu.toggle();
  }
  if (e.code === 'Insert') {
    player.toggleFreeFlight();
  }
  if (e.code === 'KeyV') {
    player.toggleCameraMode();
  }
  if (e.code === 'KeyP') {
    Globals.hud.showMetrics = !Globals.hud.showMetrics;
  }
  if (e.code === 'KeyC') {
    Globals.hud.showCoords = !Globals.hud.showCoords;
  }
  if (e.code === 'Digit1') {
    Globals.render.fidelity = 0; applyFidelity();
  }
  if (e.code === 'Digit2') {
    Globals.render.fidelity = 1; applyFidelity();
  }
  if (e.code === 'Digit3') {
    Globals.render.fidelity = 2; applyFidelity();
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Simulation loop
let last = performance.now();
let accumulatorMs = 0;

function frame(now) {
  const dtMs = Math.min(50, now - last);
  last = now;

  accumulatorMs += dtMs;

  // Advance physics in fixed steps (dtDays).
  const dtDays = Globals.sim.dtDays;
  const stepMs = (dtDays * 86400 * 1000) / Globals.sim.timeScale;

  let substeps = 0;
  while (accumulatorMs >= stepMs && substeps < Globals.sim.maxSubSteps) {
    // N-body step
    nbody.step(dtDays);

    // Sync meshes
    for (let i = 0; i < nbody.bodies.length; i++) {
      const body = nbody.bodies[i];
      body.mesh.position.copy(nbody.pos[i]);
    }

    // Follow markers
    for (const obj of scene.children) {
      if (obj?.userData?.followBodyId) {
        const idx = nbody.getBodyIndexById(obj.userData.followBodyId);
        if (idx >= 0) obj.position.copy(nbody.pos[idx]);
      }
    }

    // Player update
    player.update({ dtDays });

    // Rigid objects
    rigid.step(dtDays, { playerPosAU: player.getPositionAU(), playerRadiusAU: player.getColliderRadiusAU() });

    accumulatorMs -= stepMs;
    substeps++;
  }

  // Light follows sun
  if (sunIdx >= 0) sunLight.position.copy(nbody.pos[sunIdx]);

  // Update camera
  cameraRig.update({
    dt: dtMs / 1000,
    playerWorldPos: player.getPositionAU(),
    up: player.up,
    thirdPersonDistanceAU: Units.metersToAU(Globals.player.thirdPersonDistanceM)
  });

  hud.tick({ dtMs, player, simSteps: substeps });

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
