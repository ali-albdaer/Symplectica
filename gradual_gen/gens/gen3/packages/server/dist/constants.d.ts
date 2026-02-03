/**
 * Constants for server-side physics
 */
/** Gravitational constant (m³ kg⁻¹ s⁻²) */
export declare const G = 6.6743e-11;
/** Speed of light (m/s) */
export declare const C = 299792458;
/** Astronomical Unit in meters */
export declare const AU = 149597870700;
/** Solar mass (kg) */
export declare const SOLAR_MASS = 1.98892e+30;
/** Solar radius (m) */
export declare const SOLAR_RADIUS = 696000000;
/** Earth mass (kg) */
export declare const EARTH_MASS = 5.9722e+24;
/** Earth radius (m) */
export declare const EARTH_RADIUS = 6371000;
/** Moon mass (kg) */
export declare const MOON_MASS = 7.342e+22;
/** Moon radius (m) */
export declare const MOON_RADIUS = 1737400;
/**
 * Calculate circular orbit velocity
 */
export declare function circularVelocity(centralMass: number, orbitalRadius: number): number;
/**
 * Calculate orbital period
 */
export declare function orbitalPeriod(centralMass: number, semiMajorAxis: number): number;
//# sourceMappingURL=constants.d.ts.map