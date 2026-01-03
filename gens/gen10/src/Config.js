// Centralized simulation configuration (mutable at runtime via the Dev Console)

export const Config = {
  sim: {
    // Use scaled units; keep dt fixed for stability.
    fixedTimeStep: 1 / 120,
    maxSubSteps: 5,
    timeScale: 1.0,

    // Gravitational constant for N-body (scaled units)
    G: 1.0,

    // Softening avoids singularities and helps numeric stability
    softening: 0.25,

    fidelity: 'Medium', // 'Low' | 'Medium' | 'Ultra'
  },

  render: {
    shadows: true,
    shadowMapType: 'PCFSoft', // 'Basic' | 'PCF' | 'PCFSoft'
    exposure: 1.0,
    backgroundStars: true,
  },

  bodies: {
    sun: {
      name: 'Sun',
      mass: 1000,
      radius: 10,
      luminosity: 10,
      density: 1,
      rotationSpeed: 0.15,
      color: 0xffcc66,
      initialPosition: { x: 0, y: 0, z: 0 },
      initialVelocity: { x: 0, y: 0, z: 0 },
    },

    planetA: {
      name: 'Planet A',
      mass: 2.0,
      radius: 5,
      density: 1,
      rotationSpeed: 0.45,
      color: 0x66aaff,

      // Balanced circular orbit around the Sun (approx)
      initialPosition: { x: 50, y: 0, z: 0 },
      // v = sqrt(G * M_sun / r)
      initialVelocity: { x: 0, y: 0, z: 4.47213595 },
    },

    planetB: {
      name: 'Planet B',
      mass: 3.0,
      radius: 6,
      density: 1,
      rotationSpeed: 0.25,
      color: 0xaaff66,
      initialPosition: { x: 80, y: 0, z: 0 },
      initialVelocity: { x: 0, y: 0, z: 3.53553391 },
    },

    moon: {
      name: 'Moon',
      mass: 0.25,
      radius: 2,
      density: 1,
      rotationSpeed: 0.55,
      color: 0xdddddd,

      // Starts relative to Planet A; velocity will be combined in code
      initialRelativeTo: 'planetA',
      initialOffset: { x: 0, y: 0, z: 8 },
      // v = sqrt(G * M_planetA / r)
      initialRelativeVelocity: { x: 0.35355339, y: 0, z: 0 },
    },
  },

  player: {
    mass: 80,
    radius: 0.5,
    height: 1.8,
    spawnAbovePlanet: 'planetA',
    spawnAltitude: 2.0,

    walk: {
      speed: 9.0,
      airControl: 0.25,
      jumpSpeed: 6.5,
      groundDamping: 0.92,
      airDamping: 0.995,
    },

    flight: {
      enabled: false,
      speed: 18.0,
      boost: 2.5,
      damping: 0.985,
    },

    grab: {
      maxDistance: 4.0,
      holdDistance: 2.5,
      stiffness: 60,
      damping: 10,
    },
  },

  micro: {
    enabled: true,
    count: 12,
    spawnRadius: 3.0,
    objectMass: 2.0,
  },

  ui: {
    telemetryEnabled: true,
    telemetryKey: 'KeyT',
    devConsoleKey: 'Slash',
  },
};
