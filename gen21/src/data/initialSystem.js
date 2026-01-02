// Initial solar system setup: 1 sun, 2 planets, 1 moon, player, micro-objects

import * as THREE from "https://unpkg.com/three@0.165.0/build/three.module.js";

import { Config } from "../core/config.js";
import { Body } from "../physics/world.js";

export function createInitialSystem(physics) {
  const bodies = [];

  const sun = physics.addBody(
    new Body({
      id: "sun",
      mass: Config.celestial.sun.mass,
      radius: Config.celestial.sun.radius,
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      dynamic: false, // treat sun as fixed for stability
      isCelestial: true,
    })
  );
  bodies.push(sun);

  // Helper for circular orbit velocity magnitude around massive central body
  function circularOrbitVelocity(G, M, r) {
    return Math.sqrt((G * M) / r);
  }

  const G = Config.gravityConstant;

  // Planet 1 around sun
  const r1 = Config.celestial.planet1.orbitRadius;
  const v1 = circularOrbitVelocity(G, sun.mass, r1);
  const planet1 = physics.addBody(
    new Body({
      id: "planet1",
      mass: Config.celestial.planet1.mass,
      radius: Config.celestial.planet1.radius,
      position: new THREE.Vector3(r1, 0, 0),
      velocity: new THREE.Vector3(0, 0, v1), // tangent in +Z
      isCelestial: true,
    })
  );
  bodies.push(planet1);

  // Planet 2 around sun
  const r2 = Config.celestial.planet2.orbitRadius;
  const v2 = circularOrbitVelocity(G, sun.mass, r2);
  const planet2 = physics.addBody(
    new Body({
      id: "planet2",
      mass: Config.celestial.planet2.mass,
      radius: Config.celestial.planet2.radius,
      position: new THREE.Vector3(-r2, 0, 0),
      velocity: new THREE.Vector3(0, 0, -v2),
      isCelestial: true,
    })
  );
  bodies.push(planet2);

  // Moon around planet1
  const rm = Config.celestial.moon1.orbitRadius;
  const vm = circularOrbitVelocity(G, planet1.mass, rm);
  const moon = physics.addBody(
    new Body({
      id: "moon1",
      mass: Config.celestial.moon1.mass,
      radius: Config.celestial.moon1.radius,
      position: planet1.position.clone().add(new THREE.Vector3(0, 0, rm)),
      velocity: planet1.velocity.clone().add(new THREE.Vector3(vm, 0, 0)),
      isCelestial: true,
    })
  );
  bodies.push(moon);

  // Player spawn on planet1 surface
  const upFromPlanet1 = new THREE.Vector3().subVectors(planet1.position, sun.position).normalize();
  const playerPosition = planet1.position
    .clone()
    .addScaledVector(upFromPlanet1, planet1.radius + Config.player.radius + 0.1);

  const playerBody = physics.addBody(
    new Body({
      id: "player",
      mass: Config.player.mass,
      radius: Config.player.radius,
      position: playerPosition,
      velocity: planet1.velocity.clone(),
      isCelestial: false,
      canCollide: true,
    })
  );

  // Micro-objects near player
  const microObjects = [];
  const basisRight = new THREE.Vector3().crossVectors(upFromPlanet1, new THREE.Vector3(0, 1, 0));
  if (basisRight.lengthSq() < 1e-3) basisRight.set(1, 0, 0);
  basisRight.normalize();
  const basisForward = new THREE.Vector3().crossVectors(upFromPlanet1, basisRight).normalize();

  for (let i = 0; i < Config.microObjects.count; i++) {
    const offset = basisRight
      .clone()
      .multiplyScalar((i - (Config.microObjects.count - 1) / 2) * 0.8)
      .addScaledVector(basisForward, 1.2)
      .addScaledVector(upFromPlanet1, 0.3 + 0.2 * i);

    const body = physics.addBody(
      new Body({
        id: `micro_${i}`,
        mass: Config.microObjects.baseMass * (1 + 0.2 * i),
        radius: 0.15,
        position: playerPosition.clone().add(offset),
        velocity: planet1.velocity.clone(),
        isCelestial: false,
        canCollide: true,
      })
    );
    microObjects.push(body);
  }

  return {
    celestialBodies: bodies,
    playerBody,
    microObjects,
  };
}
