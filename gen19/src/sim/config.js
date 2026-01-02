// Centralized config for physical constants + rendering/input tuning.
// Units:
// - Distance: meters (m)
// - Mass: kilograms (kg)
// - Time: seconds (s)

import { deepClone } from '../util/clone.js';

const DEFAULTS = {
  sim: {
    // Gravitational constant (m^3 kg^-1 s^-2)
    G: 6.67430e-11,

    // Softening reduces numerical instability on close approaches.
    // Use small relative to body radii to avoid “infinite” accelerations.
    softeningMeters: 50.0,

    // Physics stepping
    maxSubsteps: 8,

    // When below this altitude above a body's surface, we treat the player as "grounded".
    playerGroundEpsilonMeters: 1.5
  },

  render: {
    fidelity: 'ULTRA', // LOW | MEDIUM | ULTRA

    camera: {
      fovDeg: 72,
      near: 0.05,
      far: 2.0e9
    },

    shadows: {
      enabled: true,
      size: 2048,
      pcfSoft: true
    },

    lod: {
      enabled: false,
      // Distance thresholds are in meters.
      planetLodDistances: [1.5e7, 6.0e7]
    },

    stars: {
      enabled: true,
      count: 12000,
      radiusMeters: 8.0e9,
      seed: 1337
    }
  },

  ui: {
    telemetry: {
      enabled: false
    }
  },

  input: {
    mouseSensitivity: 0.0022,
    invertY: false
  },

  player: {
    // Player physics representation is a sphere.
    radiusMeters: 0.7,
    massKg: 90,

    walk: {
      maxSpeed: 7.5,
      acceleration: 40,
      airAcceleration: 16,
      jumpSpeed: 6.2,
      friction: 10
    },

    flight: {
      maxSpeed: 220,
      acceleration: 80,
      damping: 2.0
    }
  },

  grab: {
    holdDistanceMeters: 2.8,
    spring: 80,
    damping: 12
  },

  // Initial system: 1 Sun, 2 planets, 1 moon (orbiting planet1)
  // Note: Orbits are NOT hardcoded; we only set initial positions and velocities.
  bodies: {
    sun: {
      name: 'Sun',
      massKg: 1.989e30,
      radiusMeters: 6.9634e8,
      luminosityWatts: 3.828e26,
      color: 0xfff2d2,
      emissive: true,
      castsShadow: false
    },

    planet1: {
      name: 'Planet 1',
      massKg: 5.972e24,
      radiusMeters: 6.371e6,
      color: 0x5bb0ff,
      albedo: 0.35,
      castsShadow: true
    },

    planet2: {
      name: 'Planet 2',
      massKg: 6.39e23,
      radiusMeters: 3.3895e6,
      color: 0xd4805a,
      albedo: 0.25,
      castsShadow: true
    },

    moon1: {
      name: 'Moon',
      massKg: 7.342e22,
      radiusMeters: 1.7374e6,
      color: 0xd9d3c7,
      albedo: 0.12,
      castsShadow: true
    }
  },

  // Initial orbital placement. Chosen for stability with leapfrog and the mass ratios.
  // Distances roughly solar-scale; moon at realistic fraction of planet radius.
  initial: {
    // Sun at origin.
    sunPos: [0, 0, 0],

    // Place planets on +X axis, give +Z tangential velocity for near-circular orbit.
    planet1: {
      distanceFromSunMeters: 1.50e11,
      phaseRad: 0.0
    },

    planet2: {
      distanceFromSunMeters: 2.28e11,
      phaseRad: 1.2
    },

    moon1: {
      // Around planet1
      distanceFromPlanetMeters: 3.84e8,
      phaseRad: 0.8
    },

    // Spawn player slightly above planet1 surface at equator-ish.
    playerSpawn: {
      altitudeMeters: 2.0,
      localDir: [0, 1, 0]
    },

    // Interactive objects spawn relative to player in local tangent space.
    objects: {
      count: 8,
      spreadMeters: 3.5,
      minRadiusMeters: 0.08,
      maxRadiusMeters: 0.22,
      densityKgPerM3: 1800,
      luminousFraction: 0.25
    }
  }
};

export const Config = deepClone(DEFAULTS);

export function resetConfigToDefaults() {
  const fresh = deepClone(DEFAULTS);
  for (const k of Object.keys(Config)) delete Config[k];
  Object.assign(Config, fresh);
}

export function getDefaults() {
  return deepClone(DEFAULTS);
}
