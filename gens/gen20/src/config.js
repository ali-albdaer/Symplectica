// Centralized configuration and defaults for the solar system simulation.
// All values are in SI units where applicable unless stated otherwise.

export const Config = {
  sim: {
    timeScale: 1500, // multiplier applied to real seconds
    fixedTimeStep: 1 / 120, // physics step in seconds (simulation time before timeScale)
    softening: 2e8, // gravitational softening to reduce singularities
    maxSubSteps: 6,
  },
  quality: {
    level: "medium", // low | medium | ultra
    options: {
      low: { shadowMapSize: 1024, starCount: 600, enableLOD: false },
      medium: { shadowMapSize: 2048, starCount: 1200, enableLOD: false },
      ultra: { shadowMapSize: 4096, starCount: 2000, enableLOD: true },
    },
  },
  player: {
    spawnBody: "planet1",
    eyeHeight: 1.7,
    moveSpeed: 12,
    runMultiplier: 1.6,
    jumpImpulse: 9,
    flySpeed: 50,
    flyBoost: 2.5,
    gravityAlignBlend: 0.15,
    thirdPersonDistance: 5,
    thirdPersonLag: 0.12,
  },
  interactive: {
    spawnCount: 6,
    baseMass: 15,
    radius: 0.35,
    randomSpread: 8,
    luminousEvery: 3, // every Nth item emits light
  },
  ui: {
    telemetryVisible: true,
    debugLogVisible: false,
    devConsoleVisible: false,
  },
  constants: {
    G: 6.67430e-11,
    AU: 1.496e11,
  },
  bodies: [
    {
      id: "sun",
      name: "Sun",
      mass: 1.989e30,
      radius: 6.9634e8,
      albedo: 1.0,
      emissive: 1.0,
      luminosity: 3.828e26,
      position: [0, 0, 0],
      velocity: [0, 0, 0],
      isStar: true,
      color: 0xffd27f,
    },
    {
      id: "planet1",
      name: "Planet One",
      mass: 5.972e24,
      radius: 6.371e6,
      albedo: 0.35,
      emissive: 0.0,
      luminosity: 0,
      semiMajorAxis: 1.25 * 1.496e11,
      inclination: 0.0,
      phase: 0,
      isStar: false,
      color: 0x5fa8ff,
    },
    {
      id: "planet2",
      name: "Planet Two",
      mass: 4.867e24,
      radius: 6.0518e6,
      albedo: 0.28,
      emissive: 0.0,
      luminosity: 0,
      semiMajorAxis: 1.9 * 1.496e11,
      inclination: 0.05,
      phase: Math.PI * 0.33,
      isStar: false,
      color: 0xff845e,
    },
    {
      id: "moon1",
      name: "Luna",
      mass: 7.34767309e22,
      radius: 1.7371e6,
      albedo: 0.12,
      emissive: 0.0,
      luminosity: 0,
      parent: "planet1",
      semiMajorAxis: 3.84e8,
      inclination: 0.04,
      phase: Math.PI * 0.6,
      isStar: false,
      color: 0xb5b5b5,
    },
  ],
};

const subscribers = new Set();

export function subscribeConfig(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function updateConfig(path, value) {
  const segments = path.split(".");
  let target = Config;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    if (!(key in target)) return;
    target = target[key];
  }
  const finalKey = segments[segments.length - 1];
  if (finalKey in target) {
    target[finalKey] = value;
    for (const fn of subscribers) fn(path, value);
  }
}

export function qualitySettings() {
  return Config.quality.options[Config.quality.level] || Config.quality.options.medium;
}
