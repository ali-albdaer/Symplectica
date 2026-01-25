// Global configuration and live-tunable parameters

export const FidelityLevel = {
  LOW: "low",
  MEDIUM: "medium",
  ULTRA: "ultra",
};

// Core physical and rendering config. All values are live-editable.
export const Config = {
  // Integration and timing
  timeScale: 1.0, // global time multiplier
  fixedTimeStep: 1 / 120, // simulation step in seconds
  maxSubSteps: 5,

  // Physics constants (scaled, not real-world SI)
  gravityConstant: 1.0, // G in simulation units

  // Celestial body defaults
  celestial: {
    sun: {
      mass: 1000,
      radius: 4,
      luminosity: 2.0,
    },
    planet1: {
      mass: 1.0,
      radius: 1.2,
      orbitRadius: 20,
      axialTiltDeg: 10,
      rotationPeriod: 30, // seconds per day (spin)
    },
    planet2: {
      mass: 1.5,
      radius: 1.4,
      orbitRadius: 35,
      axialTiltDeg: 5,
      rotationPeriod: 40,
    },
    moon1: {
      mass: 0.02,
      radius: 0.4,
      orbitRadius: 3,
      rotationPeriod: 10,
    },
  },

  // Player & objects
  player: {
    mass: 0.1,
    radius: 0.4,
    moveSpeedWalk: 6,
    moveSpeedSprint: 9,
    moveSpeedFly: 12,
    jumpSpeed: 5,
  },

  microObjects: {
    count: 5,
    baseMass: 0.05,
  },

  // Rendering
  rendering: {
    fidelity: FidelityLevel.MEDIUM,
    enableShadows: true,
    enablePostFX: false,
    lodEnabled: false, // off by default
    shadowMapSizes: {
      low: 1024,
      medium: 2048,
      ultra: 4096,
    },
    stars: {
      countLow: 1000,
      countMedium: 4000,
      countUltra: 10000,
      radius: 200,
    },
  },

  // UI flags (runtime)
  ui: {
    telemetryVisible: false,
    devConsoleVisible: false,
    debugOverlayVisible: false,
  },
};

// Metadata for Dev Console: ranges, steps, etc.
export const ConfigSchema = {
  timeScale: { label: "Time Scale", min: 0.1, max: 20, step: 0.1, path: ["timeScale"] },
  gravityConstant: { label: "Gravity Constant", min: 0.1, max: 5, step: 0.05, path: ["gravityConstant"] },

  sunMass: { label: "Sun Mass", min: 100, max: 5000, step: 10, path: ["celestial", "sun", "mass"] },
  sunRadius: { label: "Sun Radius", min: 1, max: 10, step: 0.1, path: ["celestial", "sun", "radius"] },
  sunLuminosity: { label: "Sun Luminosity", min: 0.2, max: 5, step: 0.1, path: ["celestial", "sun", "luminosity"] },

  planet1Mass: { label: "Planet1 Mass", min: 0.1, max: 10, step: 0.1, path: ["celestial", "planet1", "mass"] },
  planet1Radius: { label: "Planet1 Radius", min: 0.3, max: 4, step: 0.1, path: ["celestial", "planet1", "radius"] },
  planet1OrbitRadius: { label: "Planet1 Orbit Radius", min: 5, max: 60, step: 0.5, path: ["celestial", "planet1", "orbitRadius"] },

  planet2Mass: { label: "Planet2 Mass", min: 0.1, max: 20, step: 0.1, path: ["celestial", "planet2", "mass"] },
  planet2Radius: { label: "Planet2 Radius", min: 0.3, max: 5, step: 0.1, path: ["celestial", "planet2", "radius"] },
  planet2OrbitRadius: { label: "Planet2 Orbit Radius", min: 10, max: 100, step: 0.5, path: ["celestial", "planet2", "orbitRadius"] },

  moon1Mass: { label: "Moon Mass", min: 0.001, max: 1, step: 0.001, path: ["celestial", "moon1", "mass"] },
  moon1Radius: { label: "Moon Radius", min: 0.1, max: 1.5, step: 0.05, path: ["celestial", "moon1", "radius"] },
  moon1OrbitRadius: { label: "Moon Orbit Radius", min: 1, max: 10, step: 0.1, path: ["celestial", "moon1", "orbitRadius"] },

  playerMass: { label: "Player Mass", min: 0.01, max: 10, step: 0.01, path: ["player", "mass"] },
  playerMoveSpeedWalk: { label: "Walk Speed", min: 1, max: 20, step: 0.5, path: ["player", "moveSpeedWalk"] },
  playerMoveSpeedFly: { label: "Fly Speed", min: 2, max: 50, step: 0.5, path: ["player", "moveSpeedFly"] },
};

export function getConfigValue(path) {
  let ref = Config;
  for (const key of path) {
    ref = ref[key];
  }
  return ref;
}

export function setConfigValue(path, value) {
  let ref = Config;
  for (let i = 0; i < path.length - 1; i++) {
    ref = ref[path[i]];
  }
  ref[path[path.length - 1]] = value;
}
