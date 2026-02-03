/**
 * Physical and mathematical constants
 * All values in SI units
 */

/** Gravitational constant (m³ kg⁻¹ s⁻²) */
export const G = 6.67430e-11;

/** Speed of light (m/s) */
export const C = 299_792_458;

/** Astronomical Unit in meters */
export const AU = 1.495978707e11;

/** Light year in meters */
export const LIGHT_YEAR = 9.4607304725808e15;

/** Parsec in meters */
export const PARSEC = 3.0856775814913673e16;

/** Solar mass (kg) */
export const SOLAR_MASS = 1.98892e30;

/** Solar radius (m) */
export const SOLAR_RADIUS = 6.96e8;

/** Earth mass (kg) */
export const EARTH_MASS = 5.9722e24;

/** Earth radius (m) */
export const EARTH_RADIUS = 6.371e6;

/** Moon mass (kg) */
export const MOON_MASS = 7.342e22;

/** Moon radius (m) */
export const MOON_RADIUS = 1.7374e6;

/** Jupiter mass (kg) */
export const JUPITER_MASS = 1.898e27;

/** Jupiter radius (m) */
export const JUPITER_RADIUS = 6.9911e7;

/** Default simulation timestep (s) - 60 Hz */
export const DEFAULT_DT = 1 / 60;

/** Default softening length (m) */
export const DEFAULT_SOFTENING = 1e6;

/** Floating origin recenter threshold (m) */
export const RECENTER_THRESHOLD = 1e7;

/** Maximum massive bodies */
export const MAX_MASSIVE_BODIES = 100;

/** Maximum total objects */
export const MAX_TOTAL_OBJECTS = 500;

/** Default network tick rate (Hz) */
export const DEFAULT_TICK_RATE = 60;

/**
 * Calculate circular orbit velocity
 * @param centralMass Mass of central body (kg)
 * @param orbitalRadius Orbital radius (m)
 * @returns Orbital velocity (m/s)
 */
export function circularVelocity(centralMass: number, orbitalRadius: number): number {
    if (orbitalRadius <= 0) return 0;
    return Math.sqrt(G * centralMass / orbitalRadius);
}

/**
 * Calculate escape velocity
 * @param mass Mass of body (kg)
 * @param radius Distance from center (m)
 * @returns Escape velocity (m/s)
 */
export function escapeVelocity(mass: number, radius: number): number {
    if (radius <= 0) return 0;
    return Math.sqrt(2 * G * mass / radius);
}

/**
 * Calculate orbital period (Kepler's 3rd law)
 * @param centralMass Mass of central body (kg)
 * @param semiMajorAxis Semi-major axis (m)
 * @returns Orbital period (s)
 */
export function orbitalPeriod(centralMass: number, semiMajorAxis: number): number {
    if (centralMass <= 0 || semiMajorAxis <= 0) return 0;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}

/**
 * Calculate sphere of influence radius (Laplace)
 * @param semiMajorAxis Semi-major axis of orbit (m)
 * @param bodyMass Mass of body (kg)
 * @param primaryMass Mass of primary (kg)
 * @returns SOI radius (m)
 */
export function soiRadius(semiMajorAxis: number, bodyMass: number, primaryMass: number): number {
    if (primaryMass <= 0 || bodyMass <= 0 || semiMajorAxis <= 0) return 0;
    return semiMajorAxis * Math.pow(bodyMass / primaryMass, 0.4);
}

/**
 * Calculate Hill radius
 * @param semiMajorAxis Semi-major axis of orbit (m)
 * @param bodyMass Mass of body (kg)
 * @param primaryMass Mass of primary (kg)
 * @returns Hill radius (m)
 */
export function hillRadius(semiMajorAxis: number, bodyMass: number, primaryMass: number): number {
    if (primaryMass <= 0 || bodyMass <= 0 || semiMajorAxis <= 0) return 0;
    return semiMajorAxis * Math.pow(bodyMass / (3 * primaryMass), 1/3);
}

/**
 * Calculate gravitational acceleration
 * @param mass Mass of attracting body (kg)
 * @param distance Distance to body (m)
 * @returns Gravitational acceleration (m/s²)
 */
export function gravitationalAcceleration(mass: number, distance: number): number {
    if (distance <= 0) return 0;
    return G * mass / (distance * distance);
}

/**
 * Convert seconds to human-readable time string
 */
export function formatTime(seconds: number): string {
    const years = Math.floor(seconds / (365.25 * 24 * 3600));
    const days = Math.floor((seconds % (365.25 * 24 * 3600)) / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (years > 0) parts.push(`${years}y`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

/**
 * Format distance with appropriate units
 */
export function formatDistance(meters: number): string {
    const abs = Math.abs(meters);
    
    if (abs >= LIGHT_YEAR) {
        return `${(meters / LIGHT_YEAR).toFixed(2)} ly`;
    } else if (abs >= AU * 0.1) {
        return `${(meters / AU).toFixed(3)} AU`;
    } else if (abs >= 1e9) {
        return `${(meters / 1e9).toFixed(2)} Gm`;
    } else if (abs >= 1e6) {
        return `${(meters / 1e6).toFixed(2)} Mm`;
    } else if (abs >= 1e3) {
        return `${(meters / 1e3).toFixed(2)} km`;
    } else {
        return `${meters.toFixed(1)} m`;
    }
}

/**
 * Format velocity with appropriate units
 */
export function formatVelocity(mps: number): string {
    const abs = Math.abs(mps);
    
    if (abs >= C * 0.01) {
        return `${(mps / C * 100).toFixed(2)}% c`;
    } else if (abs >= 1e3) {
        return `${(mps / 1e3).toFixed(2)} km/s`;
    } else {
        return `${mps.toFixed(1)} m/s`;
    }
}

/**
 * Format mass with appropriate units
 */
export function formatMass(kg: number): string {
    if (kg >= SOLAR_MASS * 0.1) {
        return `${(kg / SOLAR_MASS).toFixed(3)} M☉`;
    } else if (kg >= JUPITER_MASS * 0.1) {
        return `${(kg / JUPITER_MASS).toFixed(3)} M♃`;
    } else if (kg >= EARTH_MASS * 0.1) {
        return `${(kg / EARTH_MASS).toFixed(3)} M⊕`;
    } else if (kg >= 1e21) {
        return `${(kg / 1e21).toFixed(2)}×10²¹ kg`;
    } else if (kg >= 1e18) {
        return `${(kg / 1e18).toFixed(2)}×10¹⁸ kg`;
    } else if (kg >= 1e15) {
        return `${(kg / 1e15).toFixed(2)}×10¹⁵ kg`;
    } else if (kg >= 1e12) {
        return `${(kg / 1e12).toFixed(2)} Tt`;
    } else if (kg >= 1e9) {
        return `${(kg / 1e9).toFixed(2)} Mt`;
    } else if (kg >= 1e6) {
        return `${(kg / 1e6).toFixed(2)} kt`;
    } else if (kg >= 1e3) {
        return `${(kg / 1e3).toFixed(2)} t`;
    } else {
        return `${kg.toFixed(1)} kg`;
    }
}
