import * as THREE from 'three';
import { CONFIG, metersToUnits } from '../config.js';
import { Body } from '../physics/body.js';
import { Vec3d } from '../physics/vec3d.js';
import { NBodySolver } from '../physics/nbody.js';
import { createInitialState } from './initialSystem.js';
import { createStarfield } from './stars.js';
import { PlayerController } from '../world/playerController.js';
import { createDevMenu } from '../ui/devMenu.js';
import { GrabSystem } from './grabSystem.js';

export async function createWorld({ scene, camera, renderer, input, debugLog, telemetry, devMenuEl, setFidelity }) {
  // Fidelity parameters that other modules can use.
  const fidelityState = {
    level: CONFIG.render.fidelity,
    shadowSize: 1024,
  };

  function applyFidelity(level) {
    fidelityState.level = level;
    CONFIG.render.fidelity = level;
    const { shadowSize } = setFidelity(level);
    fidelityState.shadowSize = shadowSize;

    // Update star count conservatively.
    CONFIG.render.stars.count = level === 2 ? 6000 : level === 1 ? 2500 : 1200;
  }

  applyFidelity(CONFIG.render.fidelity);

  // --- Lighting (Sun is the sole *light* source) ---
  const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(fidelityState.shadowSize, fidelityState.shadowSize);
  sunLight.shadow.bias = -0.00015;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // --- Stars ---
  const stars = createStarfield(CONFIG.render.stars);
  scene.add(stars);

  // --- Create bodies ---
  const initial = createInitialState(CONFIG);
  const bodies = [];

  const sun = new Body({
    id: 'sun',
    name: CONFIG.system.bodies.sun.name,
    massKg: CONFIG.system.bodies.sun.massKg,
    radiusM: CONFIG.system.bodies.sun.radiusM,
    position: initial.sun.pos.clone(),
    velocity: initial.sun.vel.clone(),
    kind: 'celestial',
  });

  const planet1 = new Body({
    id: 'planet1',
    name: CONFIG.system.bodies.planet1.name,
    massKg: CONFIG.system.bodies.planet1.massKg,
    radiusM: CONFIG.system.bodies.planet1.radiusM,
    position: initial.planet1.pos.clone(),
    velocity: initial.planet1.vel.clone(),
    kind: 'celestial',
  });

  const moon1 = new Body({
    id: 'moon1',
    name: CONFIG.system.bodies.moon1.name,
    massKg: CONFIG.system.bodies.moon1.massKg,
    radiusM: CONFIG.system.bodies.moon1.radiusM,
    position: initial.moon1.pos.clone(),
    velocity: initial.moon1.vel.clone(),
    kind: 'celestial',
  });

  const planet2 = new Body({
    id: 'planet2',
    name: CONFIG.system.bodies.planet2.name,
    massKg: CONFIG.system.bodies.planet2.massKg,
    radiusM: CONFIG.system.bodies.planet2.radiusM,
    position: initial.planet2.pos.clone(),
    velocity: initial.planet2.vel.clone(),
    kind: 'celestial',
  });

  bodies.push(sun, planet1, moon1, planet2);

  // --- Render meshes ---
  const meshes = createCelestialMeshes({ scene, bodies, fidelityState });

  // Update directional light to originate from sun position.
  function updateSunLight() {
    const s = sun.position;
    sunLight.position.set(metersToUnits(s.x), metersToUnits(s.y), metersToUnits(s.z));

    // Aim at player (cinematic and keeps shadow camera useful near gameplay).
    const p = player.body.position;
    sunLight.target.position.set(metersToUnits(p.x), metersToUnits(p.y), metersToUnits(p.z));
  }

  // --- Physics solver ---
  const solver = new NBodySolver({
    G: CONFIG.sim.G,
    softeningMeters: CONFIG.sim.softeningMeters,
    maxAccel: CONFIG.sim.maxAccel,
  });

  // --- Player ---
  const player = new PlayerController({
    input,
    camera,
    debugLog,
    getGravityBodies: () => bodies,
    getWalkReferenceBody: () => planet1,
  });

  // Spawn player on Planet 1 surface.
  {
    const up = Vec3d.sub(new Vec3d(0, 1, 0), new Vec3d(0, 0, 0)).normalize();
    const spawn = planet1.position.clone().addScaled(up, planet1.radiusM + player.body.radiusM + 2.0);
    player.body.position.copy(spawn);
    player.body.velocity.copy(planet1.velocity);
  }

  bodies.push(player.body);

  // --- Micro objects near player ---
  const objects = spawnObjectsNearPlayer({ scene, player, count: CONFIG.objects.count, massKg: CONFIG.objects.massKg, radiusM: CONFIG.objects.radiusM });
  for (const o of objects) bodies.push(o);

  // --- Grab system ---
  const grab = new GrabSystem({ camera, input, debugLog, objects });

  // --- Dev menu ---
  const devMenu = createDevMenu({
    el: devMenuEl,
    debugLog,
    getConfig: () => CONFIG,
    onToggle: async (open) => {
      // Cursor logic: dev menu requires cursor, so release pointer lock.
      if (open) await input.unlockPointer();
    },
    actions: {
      resetOrbits: () => {
        const init = createInitialState(CONFIG);
        sun.position.copy(init.sun.pos); sun.velocity.copy(init.sun.vel);
        planet1.position.copy(init.planet1.pos); planet1.velocity.copy(init.planet1.vel);
        planet2.position.copy(init.planet2.pos); planet2.velocity.copy(init.planet2.vel);
        moon1.position.copy(init.moon1.pos); moon1.velocity.copy(init.moon1.vel);

        // Move player back to Planet 1 surface, preserve relative orientation.
        const up = Vec3d.sub(player.body.position, planet1.position).normalize();
        player.body.position.copy(planet1.position.clone().addScaled(up, planet1.radiusM + player.body.radiusM + 2.0));
        player.body.velocity.copy(planet1.velocity);
      },
      setFidelity: (level) => {
        applyFidelity(level);
        // Update shadow map size.
        sunLight.shadow.mapSize.set(fidelityState.shadowSize, fidelityState.shadowSize);
        sunLight.shadow.needsUpdate = true;
      },
      toggleDebugLog: () => debugLog.toggle(),
    },
  });

  if (CONFIG.ui.showDebugLogByDefault) debugLog.show(true);

  // Click to lock pointer if no UI is open.
  renderer.domElement.addEventListener('click', async () => {
    if (devMenu.isOpen()) return;
    await input.lockPointer();
  });

  // Keyboard toggles
  window.addEventListener('keydown', async (e) => {
    if (e.code === 'Slash') {
      e.preventDefault();
      devMenu.toggle();
      return;
    }
    if (e.code === 'KeyT') telemetry.toggle();
    if (e.code === 'KeyL') debugLog.toggle();

    if (e.code === 'Escape') {
      // Make sure escape always releases.
      await input.unlockPointer();
    }
  });

  // Physics time accumulator
  let acc = 0;

  function update(dtRender, t) {
    const dt = dtRender * CONFIG.sim.timeScale;

    // Update input-driven systems first.
    player.updateControls(dtRender);
    grab.update(dtRender, bodies);

    // Fixed-step physics for determinism/stability.
    acc += dt;
    const fixed = CONFIG.sim.fixedDt;

    // Avoid spiral of death.
    const maxSubSteps = 8;
    let steps = 0;
    while (acc >= fixed && steps < maxSubSteps) {
      // Gravity integration
      solver.step(bodies, fixed);

      // Collisions: player/objects vs Planet 1 (walking surface).
      player.resolvePlanetCollision(planet1, fixed);
      resolveSimplePlanetCollisions(objects, planet1);

      // Grab constraints after gravity.
      grab.solveConstraints(fixed);

      acc -= fixed;
      steps++;
    }

    // Sync meshes from physics
    syncMeshes(bodies);

    // Update sunlight + cameras
    updateSunLight();
    player.updateCamera(dtRender);

    // Telemetry
    telemetry.update({
      dt: dtRender,
      playerPos: toThreeVec(player.body.position),
      cameraPos: camera.position,
    });
  }

  return { update };
}

function toThreeVec(v) {
  return new THREE.Vector3(metersToUnits(v.x), metersToUnits(v.y), metersToUnits(v.z));
}

function createCelestialMeshes({ scene, bodies, fidelityState }) {
  const geomCache = new Map();

  function sphereGeom(seg) {
    const key = `unit:${seg}`;
    if (geomCache.has(key)) return geomCache.get(key);
    const g = new THREE.SphereGeometry(1, seg, seg);
    geomCache.set(key, g);
    return g;
  }

  for (const b of bodies) {
    const color = getBodyColor(b.id);
    const radiusUnits = metersToUnits(b.radiusM);

    const seg = fidelityState.level === 2 ? 64 : fidelityState.level === 1 ? 40 : 24;

    let mat;
    if (b.id === 'sun') {
      mat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity: 2.25,
        metalness: 0.0,
        roughness: 0.5,
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.0,
        roughness: 0.95,
      });
    }

    const mesh = new THREE.Mesh(sphereGeom(seg), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    mesh.scale.set(radiusUnits, radiusUnits, radiusUnits);

    // The sun doesn't need to receive shadows.
    if (b.id === 'sun') mesh.receiveShadow = false;

    scene.add(mesh);
    b.renderObject3D = mesh;
  }

  return true;
}

function getBodyColor(id) {
  if (id === 'sun') return CONFIG.system.bodies.sun.color;
  if (id === 'planet1') return CONFIG.system.bodies.planet1.color;
  if (id === 'planet2') return CONFIG.system.bodies.planet2.color;
  if (id === 'moon1') return CONFIG.system.bodies.moon1.color;
  return 0xffffff;
}

function syncMeshes(bodies) {
  for (const b of bodies) {
    const o = b.renderObject3D;
    if (!o) continue;
    o.position.set(metersToUnits(b.position.x), metersToUnits(b.position.y), metersToUnits(b.position.z));

    // If radius changed live, scale accordingly.
    const ru = metersToUnits(b.radiusM);
    o.scale.set(ru, ru, ru);
  }
}

function spawnObjectsNearPlayer({ scene, player, count, massKg, radiusM }) {
  const objects = [];

  const base = player.body.position.clone();
  const spacing = 1.2;

  for (let i = 0; i < count; i++) {
    const p = base.clone().add(new Vec3d((i - (count - 1) / 2) * spacing, 0.0, -2.0));
    p.y += radiusM + 0.25;

    const b = new Body({
      id: `obj_${i}`,
      name: `Object ${i}`,
      kind: 'object',
      massKg,
      radiusM,
      position: p,
      velocity: player.body.velocity.clone(),
    });

    // Render
    const color = i % CONFIG.objects.luminousEvery === 0 ? 0xaad8ff : 0xd9d1c7;
    const emissiveIntensity = i % CONFIG.objects.luminousEvery === 0 ? 1.2 : 0.0;

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 20),
      new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity,
        metalness: 0.0,
        roughness: 0.7,
      }),
    );
    const ru = metersToUnits(radiusM);
    mesh.scale.set(ru, ru, ru);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    b.renderObject3D = mesh;

    objects.push(b);
  }

  return objects;
}

function resolveSimplePlanetCollisions(objects, planet) {
  for (const o of objects) {
    const rel = Vec3d.sub(o.position, planet.position);
    const dist = rel.len();
    const minDist = planet.radiusM + o.radiusM;
    if (dist < minDist && dist > 0) {
      const n = rel.mul(1 / dist);
      const penetration = minDist - dist;
      o.position.addScaled(n, penetration + 0.01);

      // Remove inward radial velocity component.
      const vIn = o.velocity.dot(n);
      if (vIn < 0) o.velocity.addScaled(n, -vIn);
    }
  }
}
