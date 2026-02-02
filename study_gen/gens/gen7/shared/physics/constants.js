/**
 * Physical and Mathematical Constants (SI Units)
 * All values are authoritative - no "game units" allowed.
 * @module shared/physics/constants
 */

/** Gravitational constant in m³/(kg·s²) */
export const G = 6.67430e-11;

/** Speed of light in m/s */
export const C = 299792458;

/** Astronomical Unit in meters */
export const AU = 1.495978707e11;

/** Physics simulation rate in Hz */
export const PHYSICS_HZ = 60;

/** Physics timestep in seconds */
export const DT = 1 / PHYSICS_HZ;

/** Minimum distance for gravitational calculations (prevents singularities) */
export const SOFTENING_LENGTH = 1000; // 1 km softening

/** Scale factor for rendering (meters per render unit) */
export const RENDER_SCALE = 1e6; // 1 render unit = 1000 km

/**
 * Body type classifications
 * @enum {string}
 */
export const BodyType = {
  /** Star - primary light source */
  STAR: 'star',
  /** Planet - massive body orbiting a star */
  PLANET: 'planet',
  /** Moon - natural satellite of a planet */
  MOON: 'moon',
  /** Ship - player-controlled vessel (passive, O(1)) */
  SHIP: 'ship',
  /** Asteroid - small passive body */
  ASTEROID: 'asteroid'
};

/**
 * Determine if a body type participates in N-body calculations
 * @param {string} type - Body type from BodyType enum
 * @returns {boolean} True if body is "massive" (affects gravity)
 */
export function isMassive(type) {
  return type === BodyType.STAR || 
         type === BodyType.PLANET || 
         type === BodyType.MOON;
}

/**
 * Solar System Reference Data (SI Units)
 * Used for validation and preset generation
 */
export const SolarSystemData = {
  Sun: {
    mass: 1.989e30,
    radius: 6.957e8,
    type: BodyType.STAR
  },
  Mercury: {
    mass: 3.285e23,
    radius: 2.4397e6,
    semiMajorAxis: 5.791e10,
    orbitalPeriod: 7.6e6,
    type: BodyType.PLANET
  },
  Venus: {
    mass: 4.867e24,
    radius: 6.0518e6,
    semiMajorAxis: 1.082e11,
    orbitalPeriod: 1.941e7,
    type: BodyType.PLANET
  },
  Earth: {
    mass: 5.972e24,
    radius: 6.371e6,
    semiMajorAxis: 1.496e11,
    orbitalPeriod: 3.156e7,
    type: BodyType.PLANET
  },
  Moon: {
    mass: 7.342e22,
    radius: 1.7374e6,
    semiMajorAxis: 3.844e8, // From Earth
    orbitalPeriod: 2.36e6,
    type: BodyType.MOON,
    parent: 'Earth'
  },
  Mars: {
    mass: 6.39e23,
    radius: 3.3895e6,
    semiMajorAxis: 2.279e11,
    orbitalPeriod: 5.94e7,
    type: BodyType.PLANET
  },
  Phobos: {
    mass: 1.0659e16,
    radius: 1.1267e4,
    semiMajorAxis: 9.376e6,
    orbitalPeriod: 2.755e4,
    type: BodyType.MOON,
    parent: 'Mars'
  },
  Deimos: {
    mass: 1.4762e15,
    radius: 6.2e3,
    semiMajorAxis: 2.346e7,
    orbitalPeriod: 1.091e5,
    type: BodyType.MOON,
    parent: 'Mars'
  }
};

export default {
  G,
  C,
  AU,
  PHYSICS_HZ,
  DT,
  SOFTENING_LENGTH,
  RENDER_SCALE,
  BodyType,
  isMassive,
  SolarSystemData
};
