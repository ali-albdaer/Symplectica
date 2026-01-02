// Centralized, live-editable configuration.
// Physics units are SI (m, kg, s). Rendering uses meters->worldUnits scaling.

export const CONFIG = {
  sim: {
    // Global timescale multiplier (1 = real seconds).
    timeScale: 1200,

    // Fixed physics step for stability (seconds). Render can be variable.
    fixedDt: 1 / 120,

    // Newtonian gravity constant.
    G: 6.67430e-11,

    // Softening length to avoid singularities at tiny distances.
    // Keep small relative to planet radii.
    softeningMeters: 5.0,

    // Clamp to avoid exploding impulses if bodies get too close.
    maxAccel: 5e4,
  },

  render: {
    // Scale: how many meters correspond to 1 world unit (Three.js units).
    // Smaller makes the scene "bigger" in render space.
    metersPerUnit: 50_000,

    fidelity: 1, // 0=Low, 1=Medium, 2=Ultra

    // Stars
    stars: {
      radiusUnits: 4_000_000,
      count: 2500,
      seed: 1337,
    },

    // Off by default.
    useLOD: false,
  },

  player: {
    massKg: 90,
    radiusM: 0.6,
    eyeHeightM: 1.55,

    walk: {
      accel: 18, // m/s^2 tangential
      maxSpeed: 9.5,
      jumpSpeed: 7.0,
      dampingGround: 4.5,
      dampingAir: 0.25,
    },

    flight: {
      accel: 35,
      maxSpeed: 120,
      damping: 0.35,
    },

    look: {
      sensitivity: 0.0021,
      maxPitchRad: 1.45,
    },
  },

  // Initial solar system: 1 sun, 2 planets, 1 moon (orbiting planet 1).
  system: {
    bodies: {
      sun: {
        name: 'Sun',
        massKg: 1.98847e30,
        radiusM: 6.9634e8,
        luminosity: 1.0,
        color: 0xffddaa,
      },
      planet1: {
        name: 'Planet 1',
        massKg: 5.972e24,
        radiusM: 6.371e6,
        color: 0x2e6cff,
      },
      moon1: {
        name: 'Moon',
        massKg: 7.342e22,
        radiusM: 1.737e6,
        color: 0xbababa,
      },
      planet2: {
        name: 'Planet 2',
        massKg: 6.39e23,
        radiusM: 3.389e6,
        color: 0xff7744,
      },
    },

    // Orbital distances (center-to-center)
    orbits: {
      planet1RadiusM: 1.8e10,
      planet2RadiusM: 3.1e10,
      moonRadiusM: 4.2e8,

      // Orbit planes & phases (radians)
      phasePlanet1: 0,
      phasePlanet2: 1.2,
      phaseMoon: 0.3,

      // If true, recompute stable circular velocities on reset.
      circularByDefault: true,
    },
  },

  objects: {
    // Spawned near player. These participate in gravity too.
    count: 6,
    radiusM: 0.18,
    massKg: 3.0,
    luminousEvery: 3,
  },

  ui: {
    showDebugLogByDefault: false,
  },
};

export function metersToUnits(m) {
  return m / CONFIG.render.metersPerUnit;
}

export function unitsToMeters(u) {
  return u * CONFIG.render.metersPerUnit;
}
