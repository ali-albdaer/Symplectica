/**
 * Solar System Data from NASA/JPL
 * 
 * All values are from:
 * - JPL Horizons System (https://ssd.jpl.nasa.gov/horizons/)
 * - NASA Planetary Fact Sheets
 * - IAU 2015 Nominal Values
 * 
 * Positions and velocities are for J2000.0 epoch (2000-01-01 12:00:00 TT)
 * Reference frame: ICRF/J2000.0 ecliptic
 * 
 * Units:
 * - Position: meters (m)
 * - Velocity: meters per second (m/s)
 * - Mass: kilograms (kg)
 * - Radius: meters (m)
 * - GM: m³/s² (more precise than G*M)
 * 
 * @module presets/solar-system-data
 */

import { AU, SECONDS_PER_DAY } from '@nbody/shared';

/**
 * Body data structure
 */
export interface SolarSystemBody {
  name: string;
  /** Gravitational parameter GM in m³/s² */
  mu: number;
  /** Mass in kg (derived from mu/G) */
  mass: number;
  /** Mean radius in m */
  radius: number;
  /** Equatorial radius in m */
  radiusEquatorial?: number;
  /** Polar radius in m */
  radiusPolar?: number;
  /** Sidereal rotation period in seconds (positive = prograde) */
  rotationPeriod: number;
  /** Axial tilt in radians */
  axialTilt: number;
  /** Parent body name (null for Sun) */
  parent: string | null;
  /** Position at J2000.0 [x, y, z] in meters */
  position: [number, number, number];
  /** Velocity at J2000.0 [vx, vy, vz] in m/s */
  velocity: [number, number, number];
  /** Body type */
  type: 'star' | 'planet' | 'dwarf-planet' | 'gas-giant' | 'moon';
  /** Softening factor for gravity calculation */
  softening?: number;
}

/**
 * Sun - The star at the center of our solar system
 * 
 * GM from DE440 ephemeris
 */
export const SUN: SolarSystemBody = {
  name: 'Sun',
  mu: 1.32712440041279419e20,  // DE440 value
  mass: 1.988409870698051e30,  // Derived from mu/G
  radius: 6.957e8,
  rotationPeriod: 25.38 * SECONDS_PER_DAY, // Equatorial
  axialTilt: 0.1265364, // 7.25 degrees in radians
  parent: null,
  // Sun is at the barycenter origin for simplicity
  position: [0, 0, 0],
  velocity: [0, 0, 0],
  type: 'star',
  softening: 1e6
};

/**
 * Mercury - Innermost planet
 * 
 * State vector from JPL Horizons at J2000.0
 */
export const MERCURY: SolarSystemBody = {
  name: 'Mercury',
  mu: 2.2031868551400003e13,
  mass: 3.302e23,
  radius: 2.4397e6,
  rotationPeriod: 58.6462 * SECONDS_PER_DAY,
  axialTilt: 0.0005934119, // 0.034 degrees
  parent: 'Sun',
  // J2000.0 state vector from JPL Horizons (ICRF ecliptic)
  position: [
    -2.212062175862221e10,  // x: -0.1478 AU
    -6.682431829610253e10,  // y: -0.4467 AU
    -3.461601353176080e9    // z: -0.0231 AU
  ],
  velocity: [
    3.666229236478603e4,    // vx: 36.66 km/s
    -1.230266986781422e4,   // vy: -12.30 km/s
    -4.368336051784789e3    // vz: -4.37 km/s
  ],
  type: 'planet',
  softening: 1e4
};

/**
 * Venus - Second planet
 */
export const VENUS: SolarSystemBody = {
  name: 'Venus',
  mu: 3.24858592000e14,
  mass: 4.8685e24,
  radius: 6.0518e6,
  rotationPeriod: -243.0226 * SECONDS_PER_DAY, // Retrograde
  axialTilt: 3.0946880, // 177.36 degrees (upside down)
  parent: 'Sun',
  position: [
    -1.085735509178141e11,
    -3.784200933160055e9,
    6.190064472977990e9
  ],
  velocity: [
    8.984651054838754e2,
    -3.517203950794635e4,
    -5.320225582712421e2
  ],
  type: 'planet',
  softening: 1e4
};

/**
 * Earth - Our home planet
 * 
 * Highly precise values from DE440
 */
export const EARTH: SolarSystemBody = {
  name: 'Earth',
  mu: 3.986004418e14,         // EGM2008
  mass: 5.972168e24,
  radius: 6.371e6,            // Mean radius
  radiusEquatorial: 6.3781e6,
  radiusPolar: 6.3568e6,
  rotationPeriod: 86164.0905, // Sidereal day in seconds
  axialTilt: 0.4090928,       // 23.439 degrees
  parent: 'Sun',
  // J2000.0 state (Earth-Moon barycenter, adjusted for Earth)
  position: [
    -2.627892928682480e10,
    1.445102393586391e11,
    3.022818135935813e7
  ],
  velocity: [
    -2.983052803283506e4,
    -5.220465685407924e3,
    -2.304965202502030e-1
  ],
  type: 'planet',
  softening: 1e4
};

/**
 * Moon (Luna) - Earth's natural satellite
 */
export const MOON: SolarSystemBody = {
  name: 'Moon',
  mu: 4.9028695e12,
  mass: 7.342e22,
  radius: 1.7374e6,
  rotationPeriod: 27.321661 * SECONDS_PER_DAY, // Synchronous
  axialTilt: 0.02692, // 1.5424 degrees to ecliptic
  parent: 'Earth',
  // Position relative to Earth at J2000.0, converted to heliocentric
  position: [
    -2.627892928682480e10 - 2.917471892280657e8,  // Earth + offset
    1.445102393586391e11 + 2.667025020615505e8,
    3.022818135935813e7 - 7.611904398498498e7
  ],
  velocity: [
    -2.983052803283506e4 - 6.435313756297557e2,
    -5.220465685407924e3 - 7.554877027732620e2,
    -2.304965202502030e-1 + 3.355272935277805e2
  ],
  type: 'moon',
  softening: 1e3
};

/**
 * Mars - The Red Planet
 */
export const MARS: SolarSystemBody = {
  name: 'Mars',
  mu: 4.282837362069909e13,
  mass: 6.4171e23,
  radius: 3.3895e6,
  radiusEquatorial: 3.3962e6,
  radiusPolar: 3.3762e6,
  rotationPeriod: 88642.6848, // 24h 37m 22.7s
  axialTilt: 0.4396484, // 25.19 degrees
  parent: 'Sun',
  position: [
    2.069270543147017e11,
    -3.560689745239088e9,
    -5.147936537447235e9
  ],
  velocity: [
    1.304308833322233e3,
    2.628158890420931e4,
    5.188465740839767e2
  ],
  type: 'planet',
  softening: 1e4
};

/**
 * Jupiter - King of planets
 */
export const JUPITER: SolarSystemBody = {
  name: 'Jupiter',
  mu: 1.26686534e17,
  mass: 1.8982e27,
  radius: 6.9911e7,
  radiusEquatorial: 7.1492e7,
  radiusPolar: 6.6854e7,
  rotationPeriod: 35730, // 9h 55m 30s
  axialTilt: 0.0546288, // 3.13 degrees
  parent: 'Sun',
  position: [
    5.978411588543636e11,
    4.387049129308410e11,
    -1.520170148446532e10
  ],
  velocity: [
    -7.892632993751268e3,
    1.115034520921672e4,
    1.305097532924498e2
  ],
  type: 'gas-giant',
  softening: 1e5
};

/**
 * Saturn - The Ringed Planet
 */
export const SATURN: SolarSystemBody = {
  name: 'Saturn',
  mu: 3.7931206234e16,
  mass: 5.6834e26,
  radius: 5.8232e7,
  radiusEquatorial: 6.0268e7,
  radiusPolar: 5.4364e7,
  rotationPeriod: 38018, // 10h 33m 38s
  axialTilt: 0.4665047, // 26.73 degrees
  parent: 'Sun',
  position: [
    9.576383363062742e11,
    9.821475305205819e11,
    -5.518981167145294e10
  ],
  velocity: [
    -7.419580380567905e3,
    6.725982472166837e3,
    1.775012422376069e2
  ],
  type: 'gas-giant',
  softening: 1e5
};

/**
 * Uranus - The Tilted Giant
 */
export const URANUS: SolarSystemBody = {
  name: 'Uranus',
  mu: 5.793951256e15,
  mass: 8.6810e25,
  radius: 2.5362e7,
  radiusEquatorial: 2.5559e7,
  radiusPolar: 2.4973e7,
  rotationPeriod: -62064, // 17h 14m 24s, retrograde
  axialTilt: 1.7064327, // 97.77 degrees
  parent: 'Sun',
  position: [
    2.157706702828831e12,
    -2.055242911807622e12,
    -3.559264256520975e10
  ],
  velocity: [
    4.646953712646498e3,
    4.614359350069211e3,
    -4.301778207708113e1
  ],
  type: 'gas-giant',
  softening: 1e5
};

/**
 * Neptune - The Distant Giant
 */
export const NEPTUNE: SolarSystemBody = {
  name: 'Neptune',
  mu: 6.8365271005804e15,
  mass: 1.02413e26,
  radius: 2.4622e7,
  radiusEquatorial: 2.4764e7,
  radiusPolar: 2.4341e7,
  rotationPeriod: 57996, // 16h 6m 36s
  axialTilt: 0.4943281, // 28.32 degrees
  parent: 'Sun',
  position: [
    2.513785419503642e12,
    -3.739265092576916e12,
    1.907027081678773e10
  ],
  velocity: [
    4.475107021618772e3,
    3.062850028498400e3,
    -1.667213424430648e2
  ],
  type: 'gas-giant',
  softening: 1e5
};

/**
 * Pluto - Dwarf planet in the Kuiper Belt
 */
export const PLUTO: SolarSystemBody = {
  name: 'Pluto',
  mu: 8.71e11,
  mass: 1.303e22,
  radius: 1.1883e6,
  rotationPeriod: -551856.672, // 6.387 days, retrograde
  axialTilt: 2.1386731, // 122.53 degrees
  parent: 'Sun',
  position: [
    -1.478626316458634e12,
    -4.182878121623956e12,
    8.753002785702810e11
  ],
  velocity: [
    5.271230873274819e3,
    -2.663667975219665e3,
    -1.241025715979975e3
  ],
  type: 'dwarf-planet',
  softening: 1e3
};

/**
 * All solar system bodies for easy iteration
 */
export const SOLAR_SYSTEM_BODIES: SolarSystemBody[] = [
  SUN,
  MERCURY,
  VENUS,
  EARTH,
  MOON,
  MARS,
  JUPITER,
  SATURN,
  URANUS,
  NEPTUNE,
  PLUTO
];

/**
 * Orbital period verification data
 * Used for testing: simulated period should match within tolerance
 * 
 * Periods in Earth days
 */
export const ORBITAL_PERIODS = {
  Mercury: 87.969,
  Venus: 224.701,
  Earth: 365.256,
  Moon: 27.322,     // Around Earth
  Mars: 686.980,
  Jupiter: 4332.59,
  Saturn: 10759.22,
  Uranus: 30688.5,
  Neptune: 60182,
  Pluto: 90560
};

/**
 * Calculate expected orbital velocity for circular orbit
 * v = sqrt(GM / r)
 * 
 * @param mu - Gravitational parameter of central body
 * @param r - Orbital radius in meters
 * @returns Orbital velocity in m/s
 */
export function circularOrbitVelocity(mu: number, r: number): number {
  return Math.sqrt(mu / r);
}

/**
 * Calculate orbital period from semi-major axis
 * T = 2π * sqrt(a³ / GM)
 * 
 * @param mu - Gravitational parameter of central body
 * @param a - Semi-major axis in meters
 * @returns Period in seconds
 */
export function orbitalPeriod(mu: number, a: number): number {
  return 2 * Math.PI * Math.sqrt(a * a * a / mu);
}

/**
 * Calculate semi-major axis from position and velocity (vis-viva)
 * a = 1 / (2/r - v²/GM)
 * 
 * @param mu - Gravitational parameter
 * @param r - Distance from central body in meters
 * @param v - Velocity magnitude in m/s
 * @returns Semi-major axis in meters
 */
export function semiMajorAxis(mu: number, r: number, v: number): number {
  return 1 / (2/r - v*v/mu);
}
