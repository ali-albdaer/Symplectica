import { Vector3 } from 'three';
import { degToRad } from '../../utils/math.js';
import { Units } from '../../utils/units.js';

// Builds the initial system:
//  - 1 sun
//  - 2 planets
//  - 1 moon orbiting planet 1
//
// Default setup aims to be stable (circular orbits).

export function createDefaultSystem({ Globals, nbody, scene, makeBodyMesh }) {
  const { bodies, sim } = Globals;

  // Helper: compute circular orbit speed for a body orbiting central mass M at radius r.
  // v = sqrt(G*M/r)
  function circularSpeed(M, rAU) {
    return Math.sqrt(sim.G * M / rAU);
  }

  const sun = {
    id: 'sun',
    name: bodies.sun.name,
    mass: bodies.sun.massMsun,
    radiusAU: Units.kmToAU(bodies.sun.radiusKm)
  };

  const p1 = {
    id: 'planet1',
    name: bodies.planet1.name,
    mass: bodies.planet1.massMsun,
    radiusAU: Units.kmToAU(bodies.planet1.radiusKm)
  };

  const p2 = {
    id: 'planet2',
    name: bodies.planet2.name,
    mass: bodies.planet2.massMsun,
    radiusAU: Units.kmToAU(bodies.planet2.radiusKm)
  };

  const moon = {
    id: 'moon1',
    name: bodies.moon1.name,
    mass: bodies.moon1.massMsun,
    radiusAU: Units.kmToAU(bodies.moon1.radiusKm)
  };

  // We'll make the system barycentric:
  // - choose planet/moon positions relative to sun initially
  // - then set sun position/velocity so COM is at origin and total momentum is ~0
  const sunPos = new Vector3(0, 0, 0);
  const sunVel = new Vector3(0, 0, 0);

  // Planet 1 in xz plane.
  const r1 = bodies.planet1.semiMajorAxisAU;
  const ph1 = degToRad(bodies.planet1.orbitalPhaseDeg);
  const p1Pos = new Vector3(Math.cos(ph1) * r1, 0, Math.sin(ph1) * r1);
  const v1 = circularSpeed(sun.mass, r1);
  const p1Vel = new Vector3(-Math.sin(ph1) * v1, 0, Math.cos(ph1) * v1);

  // Moon around planet1 (add relative circular orbit about p1)
  const rm = bodies.moon1.orbitRadiusAU;
  const phm = degToRad(bodies.moon1.orbitalPhaseDeg);
  const moonPos = p1Pos.clone().add(new Vector3(Math.cos(phm) * rm, 0, Math.sin(phm) * rm));
  const vm = circularSpeed(p1.mass, rm);
  const moonVel = p1Vel.clone().add(new Vector3(-Math.sin(phm) * vm, 0, Math.cos(phm) * vm));

  // Planet 2
  const r2 = bodies.planet2.semiMajorAxisAU;
  const ph2 = degToRad(bodies.planet2.orbitalPhaseDeg);
  const p2Pos = new Vector3(Math.cos(ph2) * r2, 0, Math.sin(ph2) * r2);
  const v2 = circularSpeed(sun.mass, r2);
  const p2Vel = new Vector3(-Math.sin(ph2) * v2, 0, Math.cos(ph2) * v2);

  // Barycentric correction (ignore sun initially, then solve for sun).
  // Momentum: m_sun * v_sun + Σ m_i v_i = 0
  // COM: m_sun * r_sun + Σ m_i r_i = 0
  {
    const bodiesNoSun = [
      { mass: p1.mass, pos: p1Pos, vel: p1Vel },
      { mass: moon.mass, pos: moonPos, vel: moonVel },
      { mass: p2.mass, pos: p2Pos, vel: p2Vel }
    ];

    const sumMr = new Vector3(0, 0, 0);
    const sumMv = new Vector3(0, 0, 0);
    for (const b of bodiesNoSun) {
      sumMr.addScaledVector(b.pos, b.mass);
      sumMv.addScaledVector(b.vel, b.mass);
    }

    sunPos.copy(sumMr).multiplyScalar(-1 / sun.mass);
    sunVel.copy(sumMv).multiplyScalar(-1 / sun.mass);

    // Shift everything so COM is at origin (sun already chosen to do that).
    // Also ensures mesh positions reflect barycentric frame.
    p1Pos.add(sunPos);
    moonPos.add(sunPos);
    p2Pos.add(sunPos);
  }

  // Add to nbody and scene.
  for (const [body, pos, vel] of [
    [sun, sunPos, sunVel],
    [p1, p1Pos, p1Vel],
    [moon, moonPos, moonVel],
    [p2, p2Pos, p2Vel]
  ]) {
    const mesh = makeBodyMesh(body);
    body.mesh = mesh;
    scene.add(mesh);
    mesh.position.copy(pos);

    nbody.addBody(body, pos, vel);
  }
}
