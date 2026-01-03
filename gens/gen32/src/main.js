import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { config, createInitialBodies, updateFidelity } from './config.js';
import { PhysicsSystem } from './physics.js';
import { createCelestialMeshes, syncBodyMeshes, createInteractiveProps, createStarField } from './entities.js';
import { setupRenderer, setupScene, createCameras, setupSunLight, resize } from './render.js';
import { InputController } from './input.js';
import { UIOverlay, createDevConsole } from './ui.js';
import { buildOrientation } from './utils/math.js';

let renderer, scene, cameras, physics, overlay, input, devConsole;
let celestialBodies = [];
let props = [];
let starField;
let sunLight;
let player;
let grabbed = null;
let lastCameraPos = new THREE.Vector3();
let lastCameraQuat = new THREE.Quaternion();
let onGround = false;

init().catch(err => {
  console.error(err);
  if (overlay) overlay.log(`Startup failure: ${err.message}`);
});

function init() {
  renderer = setupRenderer();
  scene = setupScene();
  cameras = createCameras();
  overlay = new UIOverlay();
  physics = new PhysicsSystem(config);

  starField = createStarField(scene, config.starCount[config.fidelity]);

  buildSystem();

  input = new InputController(renderer.domElement, player);
  input.onToggleMenu = () => toggleDevConsole();

  devConsole = createDevConsole({
    onReinit: () => rebuildOrbits(),
    onFidelityChange: level => applyFidelity(level),
    onToggleFreeze: () => { config.debug.freezePhysics = !config.debug.freezePhysics; overlay.log(`Freeze physics: ${config.debug.freezePhysics}`); }
  });

  window.addEventListener('resize', () => resize(renderer, cameras));

  lastCameraPos.copy(player.mesh.position);
  lastCameraQuat.copy(cameras.fpCamera.quaternion);

  animate();
}

function buildSystem() {
  if (celestialBodies.length) {
    for (const b of celestialBodies) {
      if (b.mesh) scene.remove(b.mesh);
    }
  }
  celestialBodies = createInitialBodies(THREE);
  createCelestialMeshes(scene, celestialBodies);
  sunLight = setupSunLight(scene, celestialBodies[0]);

  player = createPlayer(celestialBodies);
  props = createInteractiveProps(scene, player.mesh.position, config.interactiveObjects.count, config.interactiveObjects.luminous);

  physics.registerBodies(celestialBodies);
  physics.registerProps([player, ...props]);
}

function rebuildOrbits() {
  overlay.log('Reinitializing system with updated config');
  buildSystem();
}

function applyFidelity(level) {
  renderer.setPixelRatio(config.pixelRatio[level]);
  sunLight.shadow.mapSize.set(config.shadowSize[level], config.shadowSize[level]);
  if (starField) scene.remove(starField);
  starField = createStarField(scene, config.starCount[level]);
  overlay.log(`Fidelity set to ${level}`);
}

function createPlayer(bodies) {
  const home = bodies.find(b => b.id === 'planetA') || bodies[1];
  const up = new THREE.Vector3(0, 1, 0);
  const spawn = home.position.clone().add(up.clone().set(0, 0, 0));
  const dir = new THREE.Vector3().subVectors(spawn, home.position).normalize();
  spawn.copy(home.position).add(dir.multiplyScalar(home.radius + 4));

  const geom = new THREE.CapsuleGeometry(0.8, 1.2, 6, 12);
  const mat = new THREE.MeshStandardMaterial({ color: 0xc0ffee, roughness: 0.5, metalness: 0.1 });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.copy(spawn);
  scene.add(mesh);

  return {
    id: 'player',
    type: 'player',
    mass: config.player.mass,
    position: mesh.position.clone(),
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    externalAcceleration: new THREE.Vector3(),
    mesh,
    static: false,
  };
}

function animate() {
  const clock = new THREE.Clock();
  let fpsSmoothing = 0;

  const loop = () => {
    const dt = clock.getDelta();
    const start = performance.now();
    try {
      tick(dt);
      const frameMs = performance.now() - start;
      fpsSmoothing = fpsSmoothing * 0.9 + (1 / dt) * 0.1;
      overlay.update({
        fps: fpsSmoothing,
        frameTimeMs: frameMs,
        position: player.position,
        velocity: player.velocity,
        fidelity: config.fidelity,
      });
    } catch (err) {
      overlay.log(`Runtime error: ${err.message}`);
      console.error(err);
    }
    requestAnimationFrame(loop);
  };
  loop();
}

function tick(dt) {
  const groundBody = getDominantBody(player.position, celestialBodies);
  const up = groundBody ? new THREE.Vector3().subVectors(player.position, groundBody.position).normalize() : new THREE.Vector3(0, 1, 0);

  const movement = input.computeMovement(up);
  handleGrabbing(movement);
  applyPlayerForces(movement, groundBody, dt);

  physics.step(dt, () => {
    // placeholder for per-step hooks
  });

  syncBodyMeshes(celestialBodies);
  syncProps();

  updatePlayerMesh();
  updateCameras(movement);
  renderer.render(scene, input.thirdPerson ? cameras.tpCamera : cameras.fpCamera);
}

function applyPlayerForces(movement, groundBody, dt) {
  player.externalAcceleration.set(0, 0, 0);
  const accel = new THREE.Vector3();
  const speed = movement.wishDir.length() > 0 ? (input.isFreeFlight ? (movement.descend ? config.player.flySpeed : config.player.flyBoost) : config.player.walkSpeed) : 0;
  accel.add(movement.wishDir.clone().multiplyScalar(speed));

  if (input.isFreeFlight) {
    if (movement.ascend) accel.add(movement.up.clone().multiplyScalar(config.player.flySpeed));
    if (movement.descend) accel.add(movement.up.clone().multiplyScalar(-config.player.flySpeed));
  } else if (groundBody) {
    const distToSurface = player.position.distanceTo(groundBody.position) - groundBody.radius;
    onGround = distToSurface < 3;
    if (onGround && movement.ascend) {
      player.velocity.add(movement.up.clone().multiplyScalar(config.player.jumpImpulse));
    }
  }

  player.externalAcceleration.copy(accel);
}

function syncProps() {
  for (const prop of props) {
    if (!prop.mesh) continue;
    prop.mesh.position.copy(prop.position);
  }
  player.mesh.position.copy(player.position);
}

function updatePlayerMesh() {
  player.mesh.position.copy(player.position);
}

function updateCameras(movement) {
  const targetCam = input.thirdPerson ? cameras.tpCamera : cameras.fpCamera;
  const up = movement.up;
  const camHeight = config.player.cameraHeight;
  const camBoom = config.player.cameraBoom;
  const forward = movement.forward;

  const desiredPos = input.thirdPerson
    ? player.position.clone().add(up.clone().multiplyScalar(camHeight)).add(forward.clone().multiplyScalar(-camBoom))
    : player.position.clone().add(up.clone().multiplyScalar(camHeight));

  const lerpFactor = input.thirdPerson ? 0.08 : 0.25;
  lastCameraPos.lerp(desiredPos, lerpFactor);
  targetCam.position.copy(lastCameraPos);

  const targetQuat = movement.orientation;
  lastCameraQuat.slerp(targetQuat, 0.15);
  targetCam.quaternion.copy(lastCameraQuat);
  targetCam.up.copy(up);
}

function getDominantBody(pos, bodies) {
  let best = null;
  let bestAccel = -Infinity;
  for (const b of bodies) {
    const r = pos.distanceTo(b.position);
    const accel = (config.gravityConstant * b.mass) / (r * r + config.softeningLength * config.softeningLength);
    if (accel > bestAccel) {
      bestAccel = accel;
      best = b;
    }
  }
  return best;
}

function handleGrabbing(movement) {
  if (movement.grabbing && !grabbed) {
    let closest = null;
    let closestDist = Infinity;
    for (const p of props) {
      const dist = p.position.distanceTo(player.position);
      if (dist < 2.5 && dist < closestDist) {
        closest = p;
        closestDist = dist;
      }
    }
    if (closest) {
      grabbed = closest;
      overlay.log(`Grabbed ${closest.id}`);
    }
  }

  if (!movement.grabbing && grabbed) {
    overlay.log(`Released ${grabbed.id}`);
    grabbed = null;
  }

  if (grabbed) {
    const holdOffset = movement.forward.clone().multiplyScalar(1.5).add(movement.up.clone().multiplyScalar(0.8));
    grabbed.position.copy(player.position).add(holdOffset);
    grabbed.velocity.copy(player.velocity);
  }
}

function toggleDevConsole() {
  const container = document.querySelector('.lil-gui');
  if (!container) return;
  const visible = container.style.display !== 'none';
  container.style.display = visible ? 'none' : 'block';
  input.setPointerLock(!visible);
}
