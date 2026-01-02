import { Vec3d } from '../physics/vec3d.js';

/**
 * Builds initial positions/velocities for a stable circular-orbit system.
 * Orbits are emergent from gravity (we only set initial conditions).
 */
export function createInitialState(CONFIG) {
  const { G } = CONFIG.sim;
  const { bodies, orbits } = CONFIG.system;

  // Place sun at origin.
  const sunPos = new Vec3d(0, 0, 0);
  const sunVel = new Vec3d(0, 0, 0);

  const p1r = orbits.planet1RadiusM;
  const p2r = orbits.planet2RadiusM;
  const mr = orbits.moonRadiusM;

  const p1Phase = orbits.phasePlanet1;
  const p2Phase = orbits.phasePlanet2;
  const mPhase = orbits.phaseMoon;

  // Planets in XY plane.
  const p1Pos = new Vec3d(Math.cos(p1Phase) * p1r, Math.sin(p1Phase) * p1r, 0);
  const p2Pos = new Vec3d(Math.cos(p2Phase) * p2r, Math.sin(p2Phase) * p2r, 0);

  // Circular orbit speeds around the sun.
  const v1 = Math.sqrt((G * bodies.sun.massKg) / p1r);
  const v2 = Math.sqrt((G * bodies.sun.massKg) / p2r);

  // Tangential directions.
  const p1Tan = new Vec3d(-Math.sin(p1Phase), Math.cos(p1Phase), 0);
  const p2Tan = new Vec3d(-Math.sin(p2Phase), Math.cos(p2Phase), 0);

  const p1Vel = p1Tan.mul(v1);
  const p2Vel = p2Tan.mul(v2);

  // Moon around planet 1.
  const mPosRel = new Vec3d(Math.cos(mPhase) * mr, Math.sin(mPhase) * mr, 0);
  const moonPos = Vec3d.add(p1Pos, mPosRel);

  const vMoon = Math.sqrt((G * bodies.planet1.massKg) / mr);
  const mTan = new Vec3d(-Math.sin(mPhase), Math.cos(mPhase), 0);
  const moonVel = Vec3d.add(p1Vel.clone(), mTan.mul(vMoon));

  // Momentum balance: set sun velocity to keep barycenter roughly stationary.
  // (This helps long-term stability and reduces drift.)
  const totalMomentum = new Vec3d(0, 0, 0)
    .addScaled(p1Vel, bodies.planet1.massKg)
    .addScaled(p2Vel, bodies.planet2.massKg)
    .addScaled(moonVel, bodies.moon1.massKg);

  sunVel.addScaled(totalMomentum, -1 / bodies.sun.massKg);

  return {
    sun: { pos: sunPos, vel: sunVel },
    planet1: { pos: p1Pos, vel: p1Vel },
    planet2: { pos: p2Pos, vel: p2Vel },
    moon1: { pos: moonPos, vel: moonVel },
  };
}
