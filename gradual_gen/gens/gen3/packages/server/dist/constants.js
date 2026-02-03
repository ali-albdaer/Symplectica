/**
 * Constants for server-side physics
 */
/** Gravitational constant (m³ kg⁻¹ s⁻²) */
export const G = 6.67430e-11;
/** Speed of light (m/s) */
export const C = 299_792_458;
/** Astronomical Unit in meters */
export const AU = 1.495978707e11;
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
/**
 * Calculate circular orbit velocity
 */
export function circularVelocity(centralMass, orbitalRadius) {
    if (orbitalRadius <= 0)
        return 0;
    return Math.sqrt(G * centralMass / orbitalRadius);
}
/**
 * Calculate orbital period
 */
export function orbitalPeriod(centralMass, semiMajorAxis) {
    if (centralMass <= 0 || semiMajorAxis <= 0)
        return 0;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralMass));
}
//# sourceMappingURL=constants.js.map