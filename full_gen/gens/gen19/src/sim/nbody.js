import * as THREE from 'three';
import { computeBarycentricCircularSpeeds } from './orbits.js';

export function createNBodySystem({ getConfig, logger }) {
  const cfg = getConfig();

  const bodies = new Map();
  const dynamicBodies = []; // player + objects

  function addBody(body) {
    bodies.set(body.id, body);
  }

  function getBodyById(id) {
    return bodies.get(id);
  }

  function getAllBodies() {
    return Array.from(bodies.values());
  }

  function registerDynamicBody(physBody) {
    dynamicBodies.push(physBody);
  }

  function getDynamicBodies() {
    return dynamicBodies;
  }

  function initDefaults() {
    // Celestial bodies
    const sun = createBodyFromConfig('sun', cfg.bodies.sun);
    const planet1 = createBodyFromConfig('planet1', cfg.bodies.planet1);
    const planet2 = createBodyFromConfig('planet2', cfg.bodies.planet2);
    const moon1 = createBodyFromConfig('moon1', cfg.bodies.moon1);

    sun.pos.set(...cfg.initial.sunPos);
    sun.vel.set(0, 0, 0);

    // Place planets in orbital plane (XZ). Use computed barycentric circular velocities.
    placeOrbitingBody({
      central: sun,
      satellite: planet1,
      distance: cfg.initial.planet1.distanceFromSunMeters,
      phase: cfg.initial.planet1.phaseRad,
      dir: 1
    });

    placeOrbitingBody({
      central: sun,
      satellite: planet2,
      distance: cfg.initial.planet2.distanceFromSunMeters,
      phase: cfg.initial.planet2.phaseRad,
      dir: 1
    });

    // Moon around planet1
    placeOrbitingBody({
      central: planet1,
      satellite: moon1,
      distance: cfg.initial.moon1.distanceFromPlanetMeters,
      phase: cfg.initial.moon1.phaseRad,
      dir: 1
    });

    // Add bodies
    addBody(sun);
    addBody(planet1);
    addBody(planet2);
    addBody(moon1);

    // Momentum fix: put the barycenter at rest (helps stability).
    zeroTotalMomentum();

    logger?.info('N-body system initialized');
  }

  function placeOrbitingBody({ central, satellite, distance, phase, dir }) {
    const x = Math.cos(phase) * distance;
    const z = Math.sin(phase) * distance;

    satellite.pos.copy(central.pos).add(new THREE.Vector3(x, 0, z));

    const rHat = new THREE.Vector3(x, 0, z).normalize();
    const tHat = new THREE.Vector3(-rHat.z, 0, rHat.x).multiplyScalar(dir);

    const { vSatellite, vCentral } = computeBarycentricCircularSpeeds(
      getConfig().sim.G,
      central.massKg,
      satellite.massKg,
      distance
    );

    // Barycentric velocities, preserving any existing central motion.
    satellite.vel.copy(central.vel).addScaledVector(tHat, vSatellite);
    central.vel.addScaledVector(tHat, -vCentral);
  }

  function zeroTotalMomentum() {
    const all = getAllBodies();
    let totalMass = 0;
    const p = new THREE.Vector3();

    for (const b of all) {
      totalMass += b.massKg;
      p.addScaledVector(b.vel, b.massKg);
    }

    if (totalMass <= 0) return;
    const vCom = p.multiplyScalar(1 / totalMass);

    for (const b of all) {
      b.vel.sub(vCom);
    }
  }

  // Leapfrog (kick-drift-kick) integrator.
  function step(dt) {
    const G = getConfig().sim.G;
    const eps = getConfig().sim.softeningMeters;

    const celestials = getAllBodies();
    const all = celestials.concat(dynamicBodies);

    // First kick
    const acc = computeAccelerationsAll({ G, eps, bodies: all });
    for (let i = 0; i < all.length; i++) {
      all[i].vel.addScaledVector(acc[i], dt * 0.5);
    }

    // Drift
    for (const b of all) {
      b.pos.addScaledVector(b.vel, dt);
    }

    // Second kick
    const acc2 = computeAccelerationsAll({ G, eps, bodies: all });
    for (let i = 0; i < all.length; i++) {
      all[i].vel.addScaledVector(acc2[i], dt * 0.5);
    }
  }

  function getGravityAt(pos) {
    // Acceleration at position due to celestial bodies.
    const G = getConfig().sim.G;
    const eps = getConfig().sim.softeningMeters;

    const a = new THREE.Vector3();
    for (const b of bodies.values()) {
      const r = new THREE.Vector3().subVectors(b.pos, pos);
      const d2 = r.lengthSq() + eps * eps;
      const inv = 1 / Math.sqrt(d2);
      const inv3 = inv * inv * inv;
      a.addScaledVector(r, G * b.massKg * inv3);
    }
    return a;
  }

  initDefaults();

  return {
    step,
    getBodyById,
    getAllBodies,
    registerDynamicBody,
    getDynamicBodies,
    getGravityAt
  };
}

function createBodyFromConfig(id, cfg) {
  return {
    id,
    name: cfg.name,
    massKg: cfg.massKg,
    radiusMeters: cfg.radiusMeters,
    luminosityWatts: cfg.luminosityWatts ?? 0,
    emissive: !!cfg.emissive,
    castsShadow: !!cfg.castsShadow,
    color: cfg.color,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3()
  };
}

function computeAccelerationsAll({ G, eps, bodies }) {
  const acc = bodies.map(() => new THREE.Vector3());

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bi = bodies[i];
      const bj = bodies[j];
      const mi = bi.massKg ?? 0;
      const mj = bj.massKg ?? 0;
      if (mi <= 0 && mj <= 0) continue;

      const r = new THREE.Vector3().subVectors(bj.pos, bi.pos);
      const d2 = r.lengthSq() + eps * eps;
      const inv = 1 / Math.sqrt(d2);
      const inv3 = inv * inv * inv;

      acc[i].addScaledVector(r, G * mj * inv3);
      acc[j].addScaledVector(r, -G * mi * inv3);
    }
  }

  return acc;
}
