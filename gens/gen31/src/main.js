import * as THREE from "three";
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm";
import { Config, cloneConfig } from "./config.js";
import { Body, stepBodiesLeapfrog, updateMeshesFromBodies, findClosestSurface, clampVectorLength } from "./physics.js";
import { seedSystem, createCelestialMeshes, createInteractableBodies } from "./entities.js";
import { createCamera, createRenderer, createScene, createStarfield, makeSunLight, resizeRenderer } from "./renderer.js";
import { InputManager } from "./input.js";
import { UI, wireGlobalError } from "./ui.js";

const app = document.getElementById("app");
const ui = new UI(Config);
wireGlobalError(ui);

// Mutable runtime state
const runtime = {
  config: cloneConfig(),
  fidelityName: "Medium",
  fidelity: Config.fidelityPresets.Medium,
  scene: null,
  renderer: null,
  camera: null,
  sunLight: null,
  starfield: null,
  bodies: [],
  interactables: [],
  playerBody: null,
  playerState: {
    yaw: 0,
    pitch: 0,
    mode: "walk", // walk | flight
    cameraMode: "first", // first | third
    grounded: false,
    lastSurface: null,
    grabbed: null
  },
  accumulator: 0,
  lastTime: performance.now(),
  paused: false,
  menuOpen: false,
  devConsoleOpen: false,
  telemetry: { fps: 0, frameTime: 0 },
  input: null
};

init();

function init() {
  runtime.scene = createScene();
  runtime.camera = createCamera(app);
  runtime.renderer = createRenderer(app, runtime.fidelity);
  runtime.renderer.domElement.id = "viewport";
  runtime.sunLight = makeSunLight();
  runtime.scene.add(runtime.sunLight);
  runtime.scene.add(runtime.sunLight.target);

  const bodies = seedSystem(runtime.config.systemDefaults, runtime.config.physics.G);
  runtime.bodies = bodies;

  // Player body uses the same integrator to be affected by gravity.
  const spawnOn = bodies.find((b) => b.name === "Aurelia") || bodies[0];
  const upDir = new THREE.Vector3().copy(spawnOn.position).normalize();
  const spawnPoint = new THREE.Vector3().copy(spawnOn.position).add(upDir.multiplyScalar(spawnOn.radius + runtime.config.player.height * 0.6));
  runtime.playerBody = new Body({
    name: "Player",
    type: "player",
    mass: 1.0,
    radius: runtime.config.player.radius,
    color: 0xffffff,
    emission: 0,
    position: spawnPoint,
    velocity: new THREE.Vector3().copy(spawnOn.velocity),
    static: false,
    canGrab: false
  });

  runtime.interactables = createInteractableBodies(runtime.config.systemDefaults, spawnPoint);
  const allBodies = [...runtime.bodies, ...runtime.interactables, runtime.playerBody];

  const celestialMeshes = createCelestialMeshes(runtime.bodies, runtime.fidelity, runtime.config.visuals.enableLodByDefault || runtime.fidelity.lod);
  for (const m of celestialMeshes) runtime.scene.add(m);

  // Small glowing meshes for interactables
  for (const prop of runtime.interactables) {
    const geo = new THREE.SphereGeometry(prop.radius, 18, 18);
    const mat = new THREE.MeshStandardMaterial({
      color: prop.color,
      emissive: new THREE.Color(prop.color).multiplyScalar(prop.emission || 0),
      roughness: 0.6,
      metalness: 0.2
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    prop.mesh = mesh;
    runtime.scene.add(mesh);
  }

  if (runtime.config.enableStarfield) {
    runtime.starfield = createStarfield(runtime.config.visuals);
    runtime.scene.add(runtime.starfield);
  }

  runtime.scene.background = new THREE.Color(0x03060c);

  runtime.input = new InputManager(runtime.renderer.domElement);
  runtime.input.onToggleMenu = () => toggleMenu();
  runtime.input.onToggleConsole = () => toggleDevConsole();
  runtime.input.onToggleCamera = () => toggleCamera();
  runtime.input.onToggleFlight = () => toggleFlightMode();
  runtime.input.onGrab = () => attemptGrab();

  setupDevConsole();
  ui.setupFidelityOptions(Config.fidelityPresets, (name) => setFidelity(name));
  ui.setFidelitySelection(runtime.fidelityName);
  ui.toggleHUD(runtime.config.debug.showHud);
  ui.toggleTelemetry(runtime.config.debug.showTelemetry);
  ui.toggleLog(runtime.config.debug.showLog);
  ui.toggleCrosshair(true);

  window.addEventListener("resize", () => resizeRenderer(runtime.renderer, runtime.camera, app));
  resizeRenderer(runtime.renderer, runtime.camera, app);

  animate();

  ui.log("Simulation initialized. Click to lock pointer and move.");
}

function setFidelity(name) {
  runtime.fidelityName = name;
  runtime.fidelity = Config.fidelityPresets[name] || Config.fidelityPresets.Medium;
  // Recreate renderer for new shadow map size / settings.
  app.removeChild(runtime.renderer.domElement);
  runtime.renderer.dispose();
  runtime.renderer = createRenderer(app, runtime.fidelity);
  runtime.input.domElement = runtime.renderer.domElement;
  resizeRenderer(runtime.renderer, runtime.camera, app);
  ui.setFidelitySelection(name);
  ui.log(`Fidelity set to ${name}`);
}

function toggleMenu() {
  runtime.menuOpen = !runtime.menuOpen;
  runtime.paused = runtime.menuOpen;
  ui.toggleMenu(runtime.menuOpen);
  if (runtime.menuOpen) {
    runtime.input.releasePointer();
    ui.toggleCrosshair(false);
  } else {
    ui.toggleCrosshair(true);
    runtime.input.requestPointerLock();
  }
}

function toggleDevConsole() {
  runtime.devConsoleOpen = !runtime.devConsoleOpen;
  ui.showDevConsole(runtime.devConsoleOpen);
  if (runtime.devConsoleOpen) {
    runtime.input.releasePointer();
    ui.toggleCrosshair(false);
  } else if (!runtime.menuOpen) {
    ui.toggleCrosshair(true);
    runtime.input.requestPointerLock();
  }
}

function toggleCamera() {
  runtime.playerState.cameraMode = runtime.playerState.cameraMode === "first" ? "third" : "first";
  ui.log(`Camera: ${runtime.playerState.cameraMode}`);
}

function toggleFlightMode() {
  runtime.playerState.mode = runtime.playerState.mode === "flight" ? "walk" : "flight";
  ui.log(`Movement: ${runtime.playerState.mode}`);
}

function attemptGrab() {
  const player = runtime.playerBody;
  const camForward = getCameraForward();
  let closest = null;
  let minDist = Infinity;
  for (const prop of runtime.interactables) {
    const dist = prop.position.distanceTo(player.position);
    if (dist < runtime.config.player.grabDistance && dist < minDist) {
      closest = prop;
      minDist = dist;
    }
  }
  if (runtime.playerState.grabbed) {
    runtime.playerState.grabbed = null;
    ui.log("Released object");
    return;
  }
  if (closest) {
    runtime.playerState.grabbed = closest;
    ui.log(`Grabbed ${closest.name}`);
    // Zero relative motion when grabbed.
    closest.velocity.copy(player.velocity);
  }
}

function setupDevConsole() {
  ui.attachDevConsole(() => {
    const gui = new GUI({ width: 320 });
    const simFolder = gui.addFolder("Simulation");
    simFolder.add(runtime.config, "timeScale", 1, 1000, 1).name("Time Scale");
    simFolder.add(runtime.config.integrator, "dt", 1 / 240, 1 / 30, 0.0001).name("Fixed dt");
    simFolder.add(runtime.config.integrator, "drag", 0.99, 1.0, 0.00001).name("Drag");
    simFolder.add(runtime, "fidelityName", Object.keys(Config.fidelityPresets)).name("Fidelity").onChange((val) => setFidelity(val));
    simFolder.add(runtime, "paused").name("Pause").onChange((v) => (runtime.paused = v));

    const playerFolder = gui.addFolder("Player");
    playerFolder.add(runtime.playerBody, "mass", 0.1, 20, 0.1);
    playerFolder.add(runtime.config.player, "walkSpeed", 1, 30, 0.1);
    playerFolder.add(runtime.config.player, "freeFlightSpeed", 1, 120, 1);

    const bodiesFolder = gui.addFolder("Bodies");
    for (const b of runtime.bodies) {
      const f = bodiesFolder.addFolder(b.name);
      f.add(b, "mass", 0.01, b.mass * 5, 0.01);
      f.add(b, "radius", b.radius * 0.25, b.radius * 2, 0.1).onChange(() => {
        if (b.mesh && b.mesh.geometry) {
          b.mesh.geometry.dispose();
          b.mesh.geometry = new THREE.SphereGeometry(b.radius, 32, 32);
        }
      });
      f.add(b, "luminosity", 0, 4, 0.01);
    }

    return gui;
  });
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const realDt = (now - runtime.lastTime) / 1000;
  runtime.lastTime = now;
  runtime.telemetry.frameTime = realDt;
  runtime.telemetry.fps = 1 / Math.max(realDt, 1e-4);

  if (runtime.paused) {
    renderFrame();
    return;
  }

  handleInput(realDt);
  stepSimulation(realDt);
  updateCamera(realDt);
  updateUI(realDt);
  renderFrame();
}

function stepSimulation(realDt) {
  const simDt = realDt * runtime.config.timeScale;
  const fixed = runtime.config.integrator.dt;
  const maxSteps = runtime.config.integrator.maxSubsteps;
  runtime.accumulator += simDt;
  let steps = 0;
  while (runtime.accumulator >= fixed && steps < maxSteps) {
    applyPlayerForces(fixed);
    stepBodiesLeapfrog([...runtime.bodies, ...runtime.interactables, runtime.playerBody], fixed, runtime.config.physics.G, runtime.config.integrator.drag);
    // Keep grabbed item with player.
    if (runtime.playerState.grabbed) {
      const offset = getCameraForward().multiplyScalar(1.6).add(getCameraUp().multiplyScalar(0.4));
      runtime.playerState.grabbed.position.copy(runtime.playerBody.position).add(offset);
      runtime.playerState.grabbed.velocity.copy(runtime.playerBody.velocity);
    }
    resolvePlayerGrounding();
    steps += 1;
    runtime.accumulator -= fixed;
  }
  updateMeshesFromBodies([...runtime.bodies, ...runtime.interactables]);
  updateSunLight();
}

function applyPlayerForces(dt) {
  const input = runtime.input;
  const p = runtime.playerBody;
  const state = runtime.playerState;
  const gravity = p.acceleration.clone(); // From previous compute; approximately current frame.
  const forward = getCameraForward();
  const right = new THREE.Vector3().crossVectors(forward, getCameraUp()).normalize();
  const upVec = getCameraUp();
  let move = new THREE.Vector3();
  if (input.isDown("KeyW")) move.add(forward);
  if (input.isDown("KeyS")) move.sub(forward);
  if (input.isDown("KeyA")) move.sub(right);
  if (input.isDown("KeyD")) move.add(right);
  move.normalize();

  if (state.mode === "flight") {
    const thrust = runtime.config.player.freeFlightSpeed;
    const boost = input.isDown("ShiftLeft") ? runtime.config.player.freeFlightBoost : thrust;
    p.velocity.addScaledVector(move, boost * dt);
    if (input.isDown("Space")) p.velocity.addScaledVector(upVec, boost * dt);
    if (input.isDown("ShiftLeft")) p.velocity.addScaledVector(upVec, -thrust * dt);
    clampVectorLength(p.velocity, 500);
    return;
  }

  const surfaceInfo = findClosestSurface(runtime.bodies, p.position);
  const surface = surfaceInfo.body;
  if (!surface) return;
  const surfaceNormal = new THREE.Vector3().subVectors(p.position, surface.position).normalize();
  const tangentForward = forward.clone().projectOnPlane(surfaceNormal).normalize();
  const tangentRight = right.clone().projectOnPlane(surfaceNormal).normalize();
  let planar = new THREE.Vector3();
  if (input.isDown("KeyW")) planar.add(tangentForward);
  if (input.isDown("KeyS")) planar.sub(tangentForward);
  if (input.isDown("KeyA")) planar.sub(tangentRight);
  if (input.isDown("KeyD")) planar.add(tangentRight);
  planar.normalize();

  const speed = runtime.config.player.walkSpeed;
  p.velocity.addScaledVector(planar, speed * dt);
  // Prevent runaway tangential speed.
  clampVectorLength(p.velocity, 120);

  // Jump
  if (runtime.playerState.grounded && input.isDown("Space")) {
    p.velocity.addScaledVector(surfaceNormal, runtime.config.player.jumpImpulse);
    runtime.playerState.grounded = false;
  }
}

function resolvePlayerGrounding() {
  const p = runtime.playerBody;
  const surfaceInfo = findClosestSurface(runtime.bodies, p.position);
  const surface = surfaceInfo.body;
  if (!surface) return;
  const surfaceNormal = new THREE.Vector3().subVectors(p.position, surface.position).normalize();
  const standHeight = runtime.config.player.height * 0.5 + runtime.config.player.radius;
  const targetDistance = surface.radius + standHeight;
  const currentDistance = surface.position.distanceTo(p.position);
  const penetration = targetDistance - currentDistance;
  if (penetration > 0) {
    // Lift the player to rest on the surface and damp velocity into the tangent plane.
    const correction = surfaceNormal.clone().multiplyScalar(penetration + 0.01);
    p.position.add(correction);
    // Remove normal velocity when grounded to avoid jitter.
    const normalVel = surfaceNormal.clone().multiplyScalar(p.velocity.dot(surfaceNormal));
    p.velocity.sub(normalVel.multiplyScalar(0.9));
    runtime.playerState.grounded = true;
    runtime.playerState.lastSurface = surface;
  } else {
    runtime.playerState.grounded = false;
  }
}

function updateSunLight() {
  const sun = runtime.bodies.find((b) => b.type === "star") || runtime.bodies[0];
  if (!sun) return;
  runtime.sunLight.position.copy(sun.position);
  runtime.sunLight.target.position.set(0, 0, 0);
  runtime.sunLight.intensity = 1.6 * (sun.luminosity || 1);
  runtime.sunLight.castShadow = runtime.fidelity.enableShadows;
  runtime.sunLight.shadow.mapSize.set(runtime.fidelity.shadowMapSize, runtime.fidelity.shadowMapSize);
}

function handleInput(realDt) {
  const delta = runtime.input.consumeMouseDelta();
  runtime.playerState.yaw -= delta.dx * 0.0025;
  runtime.playerState.pitch -= delta.dy * 0.0025;
  runtime.playerState.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, runtime.playerState.pitch));
}

function updateCamera(dt) {
  const p = runtime.playerBody.position;
  const up = getCameraUp();
  const forward = getCameraForward();

  if (runtime.playerState.cameraMode === "first") {
    runtime.camera.position.copy(p).add(up.clone().multiplyScalar(runtime.config.player.height * 0.5));
    runtime.camera.lookAt(p.clone().add(forward));
  } else {
    const target = p.clone().add(up.clone().multiplyScalar(runtime.config.player.thirdPersonHeight));
    const desired = target.clone().sub(forward.clone().multiplyScalar(runtime.config.player.thirdPersonDistance));
    runtime.camera.position.lerp(desired, Math.min(1, dt * 8));
    runtime.camera.lookAt(target);
  }
}

function updateUI(realDt) {
  const playerPos = runtime.playerBody.position;
  ui.updateTelemetry({ fps: runtime.telemetry.fps, frameTime: runtime.telemetry.frameTime, position: playerPos });
  const lines = [
    `Mode: ${runtime.playerState.mode} | Camera: ${runtime.playerState.cameraMode} | Fidelity: ${runtime.fidelityName}`,
    `Pointer: ${runtime.input.pointerLocked ? "locked" : "released"}`,
    `Surface: ${runtime.playerState.lastSurface ? runtime.playerState.lastSurface.name : "space"}`
  ];
  ui.updateHUD(lines.join("<br>"));
}

function renderFrame() {
  runtime.renderer.render(runtime.scene, runtime.camera);
}

function getCameraForward() {
  const forward = new THREE.Vector3();
  forward.x = Math.sin(runtime.playerState.yaw) * Math.cos(runtime.playerState.pitch);
  forward.y = Math.sin(runtime.playerState.pitch);
  forward.z = Math.cos(runtime.playerState.yaw) * Math.cos(runtime.playerState.pitch);
  return forward.normalize();
}

function getCameraUp() {
  // Up direction aligns with the nearest surface when grounded, else world up.
  if (runtime.playerState.lastSurface) {
    return new THREE.Vector3().subVectors(runtime.playerBody.position, runtime.playerState.lastSurface.position).normalize();
  }
  return new THREE.Vector3(0, 1, 0);
}
