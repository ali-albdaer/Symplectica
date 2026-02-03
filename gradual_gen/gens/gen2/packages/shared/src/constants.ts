/**
 * Physical Constants in SI Units
 * ===============================
 * All values are in standard SI units:
 * - Mass: kilograms (kg)
 * - Distance: meters (m)
 * - Time: seconds (s)
 * - Velocity: meters per second (m/s)
 * - Acceleration: meters per second squared (m/s²)
 * 
 * Reference: CODATA 2018, IAU 2015 Resolution B3
 */

/** Gravitational constant G in m³/(kg·s²) */
export const G = 6.67430e-11;

/** Speed of light in vacuum in m/s */
export const SPEED_OF_LIGHT = 299792458;

/** Astronomical Unit in meters (IAU 2012) */
export const AU = 1.495978707e11;

/** Parsec in meters */
export const PARSEC = 3.0856775814913673e16;

/** Light year in meters */
export const LIGHT_YEAR = 9.4607304725808e15;

/** Solar mass in kg (IAU 2015) */
export const SOLAR_MASS = 1.98892e30;

/** Earth mass in kg */
export const EARTH_MASS = 5.9722e24;

/** Lunar mass in kg */
export const LUNAR_MASS = 7.342e22;

/** Jupiter mass in kg */
export const JUPITER_MASS = 1.898e27;

/** Solar radius in meters */
export const SOLAR_RADIUS = 6.96340e8;

/** Earth radius (equatorial) in meters */
export const EARTH_RADIUS = 6.371e6;

/** Lunar radius in meters */
export const LUNAR_RADIUS = 1.7374e6;

/** Jupiter radius (equatorial) in meters */
export const JUPITER_RADIUS = 6.9911e7;

/** Stefan-Boltzmann constant in W/(m²·K⁴) */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/** Solar luminosity in watts */
export const SOLAR_LUMINOSITY = 3.828e26;

/** Planck constant in J·s */
export const PLANCK_CONSTANT = 6.62607015e-34;

/** Boltzmann constant in J/K */
export const BOLTZMANN_CONSTANT = 1.380649e-23;

/** Standard gravity (Earth surface) in m/s² */
export const STANDARD_GRAVITY = 9.80665;

/** Seconds per minute */
export const SECONDS_PER_MINUTE = 60;

/** Seconds per hour */
export const SECONDS_PER_HOUR = 3600;

/** Seconds per day (mean solar day) */
export const SECONDS_PER_DAY = 86400;

/** Seconds per Julian year (365.25 days) */
export const SECONDS_PER_YEAR = 31557600;

/** Earth orbital period in seconds (sidereal year) */
export const EARTH_ORBITAL_PERIOD = 31558149.504;

/** Schwarzschild radius coefficient: 2G/c² */
export const SCHWARZSCHILD_COEFFICIENT = (2 * G) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);

/**
 * Physics simulation constants
 */

/** Physics tick rate in Hz */
export const PHYSICS_TICK_RATE = 60;

/** Physics timestep in seconds */
export const PHYSICS_TIMESTEP = 1 / PHYSICS_TICK_RATE;

/** Alias for physics timestep (commonly used) */
export const PHYSICS_DT = PHYSICS_TIMESTEP;

/** Default gravitational softening factor (prevents singularity) in meters */
export const DEFAULT_SOFTENING = 1000;

/** Barnes-Hut opening angle theta (lower = more accurate, higher = faster) */
export const BARNES_HUT_THETA = 0.5;

/** SOI transition threshold multiplier (switch integrator when < 5 × radius) */
export const SOI_CLOSE_ENCOUNTER_THRESHOLD = 5;

/** Maximum substeps for adaptive integrators */
export const MAX_SUBSTEPS = 1000;

/** Adaptive integrator error tolerance */
export const INTEGRATOR_TOLERANCE = 1e-12;

/**
 * Rendering/Coordinate constants
 */

/** Distance threshold to trigger floating origin recenter (in meters) */
export const RECENTER_THRESHOLD = 1e8; // 100,000 km

/** Maximum render distance (in meters) */
export const MAX_RENDER_DISTANCE = 1e16; // ~1 light year

/** Minimum render distance for logarithmic depth (in meters) */
export const MIN_RENDER_DISTANCE = 0.1;

/**
 * Networking constants
 */

/** Network tick rate in Hz */
export const NETWORK_TICK_RATE = 20;

/** Network timestep in seconds */
export const NETWORK_TIMESTEP = 1 / NETWORK_TICK_RATE;

/** Maximum client-side prediction time in seconds */
export const MAX_PREDICTION_TIME = 0.5;

/** Interpolation buffer time in seconds */
export const INTERPOLATION_BUFFER_TIME = 0.1;

/**
 * Formatting utilities
 */

/**
 * Format a distance value with appropriate units
 */
export function formatDistance(meters: number): string {
  const abs = Math.abs(meters);
  
  if (abs >= PARSEC) {
    return `${(meters / PARSEC).toFixed(2)} pc`;
  }
  if (abs >= LIGHT_YEAR) {
    return `${(meters / LIGHT_YEAR).toFixed(2)} ly`;
  }
  if (abs >= AU * 0.01) {
    return `${(meters / AU).toFixed(4)} AU`;
  }
  if (abs >= 1e9) {
    return `${(meters / 1e9).toFixed(2)} Gm`;
  }
  if (abs >= 1e6) {
    return `${(meters / 1e6).toFixed(2)} Mm`;
  }
  if (abs >= 1e3) {
    return `${(meters / 1e3).toFixed(2)} km`;
  }
  if (abs >= 1) {
    return `${meters.toFixed(2)} m`;
  }
  if (abs >= 1e-3) {
    return `${(meters * 1e3).toFixed(2)} mm`;
  }
  return `${meters.toExponential(2)} m`;
}

/**
 * Format a mass value with appropriate units
 */
export function formatMass(kg: number): string {
  const abs = Math.abs(kg);
  
  if (abs >= SOLAR_MASS * 0.01) {
    return `${(kg / SOLAR_MASS).toFixed(4)} M☉`;
  }
  if (abs >= JUPITER_MASS * 0.01) {
    return `${(kg / JUPITER_MASS).toFixed(4)} MJ`;
  }
  if (abs >= EARTH_MASS * 0.01) {
    return `${(kg / EARTH_MASS).toFixed(4)} M⊕`;
  }
  if (abs >= LUNAR_MASS * 0.01) {
    return `${(kg / LUNAR_MASS).toFixed(4)} ML`;
  }
  if (abs >= 1e12) {
    return `${(kg / 1e12).toFixed(2)} Tt`;
  }
  if (abs >= 1e9) {
    return `${(kg / 1e9).toFixed(2)} Gt`;
  }
  if (abs >= 1e6) {
    return `${(kg / 1e6).toFixed(2)} Mt`;
  }
  if (abs >= 1e3) {
    return `${(kg / 1e3).toFixed(2)} t`;
  }
  return `${kg.toFixed(2)} kg`;
}

/**
 * Format a time duration with appropriate units
 */
export function formatTime(seconds: number): string {
  const abs = Math.abs(seconds);
  
  if (abs >= SECONDS_PER_YEAR * 1000) {
    return `${(seconds / SECONDS_PER_YEAR / 1000).toFixed(2)} ky`;
  }
  if (abs >= SECONDS_PER_YEAR) {
    return `${(seconds / SECONDS_PER_YEAR).toFixed(2)} y`;
  }
  if (abs >= SECONDS_PER_DAY) {
    return `${(seconds / SECONDS_PER_DAY).toFixed(2)} d`;
  }
  if (abs >= SECONDS_PER_HOUR) {
    return `${(seconds / SECONDS_PER_HOUR).toFixed(2)} h`;
  }
  if (abs >= SECONDS_PER_MINUTE) {
    return `${(seconds / SECONDS_PER_MINUTE).toFixed(2)} min`;
  }
  if (abs >= 1) {
    return `${seconds.toFixed(2)} s`;
  }
  if (abs >= 1e-3) {
    return `${(seconds * 1e3).toFixed(2)} ms`;
  }
  return `${(seconds * 1e6).toFixed(2)} μs`;
}
