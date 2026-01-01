// Global simulation/game variables.
// Edit at runtime via the dev menu (press '/').
// Units (by default):
//  - distance: AU
//  - mass: solar masses (M☉)
//  - time: days
// This keeps values near ~1 for numeric stability.

export const Globals = {
  sim: {
    // Gravitational constant in AU^3 / (day^2 * M☉)
    // (approx; good enough for stable, realistic-ish orbits)
    G: 2.9591220828559093e-4,

    // Physics step settings
    // The integrator uses fixed substeps for stability.
    // timeScale controls how fast sim-time passes vs real-time.
    timeScale: 3600, // simulated seconds per real second
    dtDays: 1 / 2880, // 30 seconds per physics step
    maxSubSteps: 16,

    // Softening prevents singularities at tiny separations (AU)
    softeningAU: 1e-6,

    // If true, planets/moon are influenced by all bodies (full N-body).
    // Keep true for accuracy.
    nBody: true
  },

  render: {
    // Fidelity levels: 0=low, 1=med, 2=high
    fidelity: 1,

    // Optional expensive features
    enableShadows: true,
    enablePostFX: false
  },

  hud: {
    showMetrics: true,
    showCoords: true
  },

  player: {
    heightMeters: 1.75,

    // Movement (meters, but we convert to AU internally)
    walkSpeedMps: 4.5,
    jumpSpeedMps: 4.5,

    mouseSensitivity: 0.0025,
    thirdPersonDistanceM: 4.0
  },

  // Body definitions are in AU, days, solar masses.
  // Radii are in km (render helper scales them visually).
  bodies: {
    sun: {
      name: 'Sun',
      massMsun: 1.0,
      radiusKm: 696340,
      luminosity: 1.0
    },
    planet1: {
      name: 'Planet 1',
      massMsun: 3.003e-6, // ~Earth
      radiusKm: 6371,
      semiMajorAxisAU: 1.0,
      // Start circular orbit in x-z plane
      orbitalPhaseDeg: 0
    },
    moon1: {
      name: 'Moon 1',
      // Moon mass relative to Earth in Msun
      massMsun: 3.694e-8,
      radiusKm: 1737,
      // distance from planet1 in AU (~384,400 km)
      orbitRadiusAU: 384400 / 149597870.7,
      orbitalPhaseDeg: 180
    },
    planet2: {
      name: 'Planet 2',
      massMsun: 9.545e-4, // ~Jupiter
      radiusKm: 69911,
      semiMajorAxisAU: 5.2,
      orbitalPhaseDeg: 90
    }
  }
};

// Dev menu uses this to render editable fields.
export const DevSchema = {
  'sim.G': { type: 'number', step: 'any' },
  'sim.timeScale': { type: 'number', step: '1', min: 1, max: 1000000 },
  'sim.dtDays': { type: 'number', step: 'any' },
  'sim.maxSubSteps': { type: 'number', step: '1', min: 1, max: 64 },
  'sim.softeningAU': { type: 'number', step: 'any' },
  'sim.nBody': { type: 'boolean' },

  'render.fidelity': { type: 'enum', options: [0, 1, 2] },
  'render.enableShadows': { type: 'boolean' },
  'render.enablePostFX': { type: 'boolean' },

  'hud.showMetrics': { type: 'boolean' },
  'hud.showCoords': { type: 'boolean' }
};
