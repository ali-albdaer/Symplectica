// Centralized, live-editable simulation config.
// All global variables live here and are surfaced in the dev menu.

export const CONFIG = {
  sim: {
    // Fixed-step simulation for determinism + stability.
    fixedDt: 1 / 120,

    // Multiplies the simulated time vs real time.
    // Increase to speed up orbits; keep moderate for stability.
    timeScale: 50,

    // Softening to avoid singularities when bodies get very close.
    // This is physically "non-real" but improves stability for game-scale scenes.
    gravitySoftening: 0.02,

    // Gravitational constant in "game units".
    // See docs in `src/physics/units.js`.
    G: 1.0,

    // Velocity damping for tiny numerical noise (keep 1.0 for pure integration).
    // If you see drift from edits, a tiny value like 0.999999 can help.
    velocityDampingPerSecond: 1.0,
  },

  graphics: {
    fidelity: 'Medium', // 'Low' | 'Medium' | 'Ultra'
    enableShadows: true,
    enableLOD: false,
    // Cap pixel ratio for perf.
    pixelRatioCap: 2.0,
    starCount: 6000,
  },

  debug: {
    showTelemetry: false,
    showDebugLog: false,
    showAxes: false,
  },

  player: {
    height: 0.18,
    radius: 0.06,
    mass: 0.002,

    walk: {
      speed: 0.8,
      jumpSpeed: 0.9,
      groundSnap: 0.03,
      friction: 6.0,
    },

    flight: {
      accel: 2.2,
      maxSpeed: 6.0,
      damping: 2.0,
    },

    camera: {
      fov: 75,
      near: 0.005,
      far: 5000,

      thirdPersonDistance: 0.7,
      thirdPersonHeight: 0.25,
      thirdPersonSmooth: 10.0,
    },
  },

  // Initial bodies: 1 sun, 2 planets, 1 moon (orbiting planet 1).
  // Positions/velocities are generated (not hardcoded orbits) in `src/entities/solarSystemFactory.js`.
  bodies: {
    sun: {
      name: 'Sun',
      mass: 1200,
      radius: 4.5,
      density: 1.0,
      luminosity: 1.0,
      emissiveStrength: 2.5,
    },

    planet1: {
      name: 'Planet 1',
      mass: 1.2,
      radius: 1.15,
      density: 1.0,
      albedo: 0.28,
      daySeconds: 12,
      orbitRadius: 45,
    },

    planet2: {
      name: 'Planet 2',
      mass: 0.65,
      radius: 0.95,
      density: 1.0,
      albedo: 0.22,
      daySeconds: 18,
      orbitRadius: 74,
    },

    moon1: {
      name: 'Moon',
      mass: 0.03,
      radius: 0.35,
      density: 1.0,
      albedo: 0.12,
      daySeconds: 8,
      orbitRadiusAroundPlanet1: 4.2,
    },
  },

  // A handful of objects near player spawn, simulated by same gravity system.
  // "luminous" here means emissive, not a separate light source.
  props: {
    spawnCount: 6,
    spawnRadius: 0.9,
    minMass: 0.00015,
    maxMass: 0.001,
    minRadius: 0.04,
    maxRadius: 0.09,
    emissiveChance: 0.35,
    emissiveStrength: 1.5,
  },
};
