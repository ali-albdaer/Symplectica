import { Vector3, Quaternion } from "https://unpkg.com/three@0.164.0/build/three.module.js";
import { Config, subscribeConfig } from "./config.js";
import { PhysicsWorld, initializeBodiesFromConfig, SimBody } from "./physics.js";
import { RenderPipeline } from "./renderer.js";
import { Input } from "./input.js";
import { Player } from "./entities.js";
import { initUI } from "./ui.js";
import { logInfo, logError } from "./logger.js";

const canvas = document.getElementById("scene");
const crosshair = document.getElementById("crosshair");
crosshair.style.display = "none";
const physics = new PhysicsWorld();
const renderer = new RenderPipeline(canvas);
const ui = initUI();
const input = new Input(canvas, { onPointerLockChange: handlePointerLock });
const player = new Player();
let cameraMode = "first"; // first | third
let accumulator = 0;
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let holdingId = null;

const bodies = initializeBodiesFromConfig();
for (const b of bodies) physics.addBody(b);
physics.computePairwiseAccelerations();
bodies.forEach((b) => renderer.addBody(b));

const primaryPlanet = bodies.find((b) => b.id === Config.player.spawnBody) || bodies[1];
placePlayerOnSurface(primaryPlanet);
const interactives = spawnInteractives(primaryPlanet);

subscribeConfig((path, value) => {
  if (path === "quality.level") renderer.setQuality(value);
});

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "v") toggleCameraMode();
  if (key === "f") toggleFlight();
  if (key === "l") ui.toggleTelemetry();
  if (key === "b") {
    ui.toggleDebugLog();
    handleMenuState();
  }
  if (key === "/") {
    ui.toggleDevConsole();
    handleMenuState();
  }
});

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  toggleGrab();
});

function handlePointerLock(locked) {
  crosshair.style.display = locked ? "block" : "none";
}

function handleMenuState() {
  if (Config.ui.devConsoleVisible || Config.ui.debugLogVisible) {
    document.exitPointerLock?.();
  } else if (!input.pointerLocked) {
    canvas.requestPointerLock?.();
  }
}

function toggleCameraMode() {
  cameraMode = cameraMode === "first" ? "third" : "first";
}

function toggleFlight() {
  player.isFlying = !player.isFlying;
}

function toggleGrab() {
  if (holdingId) {
    holdingId = null;
    return;
  }
  const target = interactives
    .map((obj) => ({ obj, d: obj.position.distanceTo(renderer.camera.position) }))
    .sort((a, b) => a.d - b.d)[0];
  if (target && target.d < 4) holdingId = target.obj.id;
}

function placePlayerOnSurface(body) {
  const up = new Vector3(0, 1, 0);
  player.position.copy(body.position).add(up.multiplyScalar(body.radius + Config.player.eyeHeight + 0.2));
  player.yaw = 0;
  player.pitch = 0;
}

function spawnInteractives(anchorBody) {
  const list = [];
  for (let i = 0; i < Config.interactive.spawnCount; i++) {
    const def = new SimBody({
      id: `item-${i}`,
      name: `Item ${i}`,
      mass: Config.interactive.baseMass,
      radius: Config.interactive.radius,
      color: 0x7ce7ff,
      emissive: i % Config.interactive.luminousEvery === 0 ? 0x55aaff : 0,
      position: [0, 0, 0],
      velocity: [0, 0, 0],
    });
    const angle = (i / Config.interactive.spawnCount) * Math.PI * 2;
    const offset = new Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(Config.interactive.randomSpread);
    def.position.copy(anchorBody.position).add(new Vector3(0, anchorBody.radius + Config.player.eyeHeight + 0.5, 0)).add(offset);
    list.push(def);
    physics.addBody(def);
    renderer.addInteractive(def);
  }
  physics.computePairwiseAccelerations();
  return list;
}

function update(dtReal) {
  const dtSim = dtReal * Config.sim.timeScale;
  accumulator += dtSim;
  const step = Config.sim.fixedTimeStep;
  let subSteps = 0;
  while (accumulator >= step && subSteps < Config.sim.maxSubSteps) {
    physics.step(step);
    accumulator -= step;
    subSteps++;
  }

  updatePlayer(dtSim);
  renderer.updateBodyTransforms();
  renderer.render();
}

function updatePlayer(dt) {
  const g = physics.gravityAt(player.position);
  const closest = closestBody(player.position);
  const up = closest ? player.position.clone().sub(closest.position).normalize() : new Vector3(0, 1, 0);

  const mouse = input.consumeMouseDelta();
  const lookSpeed = 0.0025;
  player.yaw -= mouse.x * lookSpeed;
  player.pitch -= mouse.y * lookSpeed;
  player.pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, player.pitch));

  const rot = new Quaternion().setFromEuler({ x: player.pitch, y: player.yaw, z: 0, order: "YXZ" });
  const forward = new Vector3(0, 0, -1).applyQuaternion(rot);
  const right = new Vector3(1, 0, 0).applyQuaternion(rot);

  const accel = new Vector3();
  const moveDir = new Vector3();

  if (player.isFlying) {
    if (input.isDown("w")) moveDir.add(forward);
    if (input.isDown("s")) moveDir.sub(forward);
    if (input.isDown("a")) moveDir.sub(right);
    if (input.isDown("d")) moveDir.add(right);
    if (input.isDown(" ")) moveDir.add(up);
    if (input.isDown("shift")) moveDir.sub(up);
    moveDir.normalize();
    const speed = Config.player.flySpeed * (input.isDown("control") ? Config.player.flyBoost : 1);
    accel.copy(moveDir).multiplyScalar(speed);
    player.velocity.copy(accel);
  } else {
    // Grounded or falling
    const groundHeight = closest ? closest.radius + Config.player.eyeHeight : 0;
    const surfacePos = closest ? closest.position : new Vector3();
    const radialDist = player.position.clone().sub(surfacePos).length();
    const grounded = radialDist <= groundHeight + 0.05 && g.length() > 1e-4;

    const tangentForward = forward.clone().sub(up.clone().multiplyScalar(forward.dot(up))).normalize();
    const tangentRight = right.clone().sub(up.clone().multiplyScalar(right.dot(up))).normalize();

    if (input.isDown("w")) moveDir.add(tangentForward);
    if (input.isDown("s")) moveDir.sub(tangentForward);
    if (input.isDown("a")) moveDir.sub(tangentRight);
    if (input.isDown("d")) moveDir.add(tangentRight);
    moveDir.normalize();
    const speed = Config.player.moveSpeed * (input.isDown("shift") ? Config.player.runMultiplier : 1);
    accel.copy(moveDir).multiplyScalar(speed);

    // simple friction
    player.velocity.multiplyScalar(0.90);
    player.velocity.addScaledVector(accel, dt);
    player.velocity.addScaledVector(g, dt);

    if (grounded && input.isDown(" ")) {
      const jump = up.clone().multiplyScalar(Config.player.jumpImpulse);
      player.velocity.add(jump);
    }

    // prevent sinking into planet
    if (grounded) {
      const desiredPos = surfacePos.clone().add(up.clone().multiplyScalar(groundHeight));
      player.position.copy(desiredPos);
      // slide along surface
      const vUp = player.velocity.dot(up);
      player.velocity.addScaledVector(up, -vUp);
    }
  }

  // integrate position for player when not grounded in fly mode
  if (player.isFlying) {
    player.position.addScaledVector(player.velocity, dt);
  } else {
    player.position.addScaledVector(player.velocity, dt);
  }

  applyHolding(dt, forward, up);
  alignCamera(up, forward);
}

function applyHolding(dt, forward, up) {
  if (!holdingId) return;
  const target = interactives.find((o) => o.id === holdingId);
  if (!target) return;
  const desiredPos = player.position.clone().add(forward.clone().multiplyScalar(2.2)).add(up.clone().multiplyScalar(-0.3));
  const toTarget = desiredPos.clone().sub(target.position);
  target.velocity.addScaledVector(toTarget, 2.5 * dt);
  target.position.addScaledVector(target.velocity, dt);
}

function alignCamera(up, forward) {
  const cam = renderer.camera;
  if (cameraMode === "first") {
    cam.position.copy(player.position);
    const lookAt = player.position.clone().add(forward);
    cam.up.copy(up);
    cam.lookAt(lookAt);
  } else {
    const desired = player.position.clone().add(up.clone().multiplyScalar(0.5)).sub(forward.clone().multiplyScalar(Config.player.thirdPersonDistance));
    cam.position.lerp(desired, Config.player.thirdPersonLag);
    cam.up.copy(up);
    cam.lookAt(player.position.clone().add(forward.clone().multiplyScalar(1.5)));
  }
}

function closestBody(pos) {
  let best = null;
  let bestDist = Infinity;
  for (const b of bodies) {
    const d = pos.distanceTo(b.position) - b.radius;
    if (d < bestDist) {
      bestDist = d;
      best = b;
    }
  }
  return best;
}

function loop(now) {
  try {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    frameCount++;
    fps = fps * 0.9 + (1 / Math.max(dt, 1e-4)) * 0.1;
    update(dt);
    const g = physics.gravityAt(player.position);
    ui.setTelemetry({ fps, frameTime: dt, position: player.position, velocity: player.velocity, gravity: g });
    requestAnimationFrame(loop);
  } catch (err) {
    logError(err.stack || err.message);
    ui.toggleDebugLog();
    document.exitPointerLock?.();
  }
}

logInfo("Booting simulation...");
requestAnimationFrame(loop);
