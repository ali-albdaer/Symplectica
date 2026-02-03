/**
 * Orbital Mechanics Calculations
 * ==============================
 * All calculations use SI units (m, kg, s).
 * These are used for initial conditions and analysis.
 */
import { Vector3 } from './Vector3.js';
/**
 * Orbital elements (Keplerian)
 */
export interface OrbitalElements {
    /** Semi-major axis in meters */
    a: number;
    /** Eccentricity (0 = circular, <1 = elliptical, 1 = parabolic, >1 = hyperbolic) */
    e: number;
    /** Inclination in radians */
    i: number;
    /** Longitude of ascending node in radians */
    omega: number;
    /** Argument of periapsis in radians */
    w: number;
    /** True anomaly in radians */
    nu: number;
}
/**
 * State vectors (position and velocity)
 */
export interface StateVectors {
    position: Vector3;
    velocity: Vector3;
}
/**
 * Calculate orbital period using Kepler's Third Law
 * T = 2π√(a³/μ)
 * @param semiMajorAxis Semi-major axis in meters
 * @param centralMass Mass of central body in kg
 * @returns Period in seconds
 */
export declare function orbitalPeriod(semiMajorAxis: number, centralMass: number): number;
/**
 * Calculate circular orbital velocity
 * v = √(μ/r)
 * @param radius Orbital radius in meters
 * @param centralMass Mass of central body in kg
 * @returns Velocity in m/s
 */
export declare function circularOrbitalVelocity(radius: number, centralMass: number): number;
/**
 * Calculate escape velocity
 * v_esc = √(2μ/r)
 * @param radius Distance from center of mass in meters
 * @param mass Mass of body in kg
 * @returns Escape velocity in m/s
 */
export declare function escapeVelocity(radius: number, mass: number): number;
/**
 * Calculate sphere of influence radius (Hill sphere approximation)
 * r_SOI ≈ a × (m/M)^(2/5)
 * @param semiMajorAxis Semi-major axis of orbit in meters
 * @param bodyMass Mass of the body in kg
 * @param parentMass Mass of the parent body in kg
 * @returns SOI radius in meters
 */
export declare function sphereOfInfluence(semiMajorAxis: number, bodyMass: number, parentMass: number): number;
/**
 * Calculate Hill sphere radius
 * r_Hill ≈ a × (m/(3M))^(1/3)
 * @param semiMajorAxis Semi-major axis of orbit in meters
 * @param bodyMass Mass of the body in kg
 * @param parentMass Mass of the parent body in kg
 * @returns Hill radius in meters
 */
export declare function hillRadius(semiMajorAxis: number, bodyMass: number, parentMass: number): number;
/**
 * Calculate gravitational acceleration at a distance
 * a = GM/r²
 * @param distance Distance from center of mass in meters
 * @param mass Mass of body in kg
 * @returns Acceleration magnitude in m/s²
 */
export declare function gravitationalAcceleration(distance: number, mass: number): number;
/**
 * Calculate specific orbital energy
 * ε = v²/2 - μ/r
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Specific orbital energy (J/kg)
 */
export declare function specificOrbitalEnergy(position: Vector3, velocity: Vector3, centralMass: number): number;
/**
 * Calculate specific angular momentum vector
 * h = r × v
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @returns Specific angular momentum vector (m²/s)
 */
export declare function specificAngularMomentum(position: Vector3, velocity: Vector3): Vector3;
/**
 * Calculate eccentricity vector
 * e = (v × h)/μ - r/|r|
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Eccentricity vector
 */
export declare function eccentricityVector(position: Vector3, velocity: Vector3, centralMass: number): Vector3;
/**
 * Convert orbital elements to state vectors
 * @param elements Orbital elements
 * @param centralMass Mass of central body in kg
 * @returns Position and velocity vectors in the orbital plane
 */
export declare function elementsToStateVectors(elements: OrbitalElements, centralMass: number): StateVectors;
/**
 * Convert state vectors to orbital elements
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Orbital elements
 */
export declare function stateVectorsToElements(position: Vector3, velocity: Vector3, centralMass: number): OrbitalElements;
/**
 * Calculate vis-viva velocity
 * v = √(μ(2/r - 1/a))
 * @param radius Current distance from focus (m)
 * @param semiMajorAxis Semi-major axis (m)
 * @param centralMass Mass of central body (kg)
 * @returns Orbital velocity (m/s)
 */
export declare function visVivaVelocity(radius: number, semiMajorAxis: number, centralMass: number): number;
/**
 * Calculate time since periapsis (Kepler's equation)
 * @param trueAnomaly True anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @param period Orbital period in seconds
 * @returns Time since periapsis in seconds
 */
export declare function timeSincePeriapsis(trueAnomaly: number, eccentricity: number, period: number): number;
/**
 * Solve Kepler's equation for eccentric anomaly
 * M = E - e*sin(E)
 * @param meanAnomaly Mean anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @param tolerance Convergence tolerance
 * @returns Eccentric anomaly in radians
 */
export declare function solveKeplersEquation(meanAnomaly: number, eccentricity: number, tolerance?: number): number;
/**
 * Convert eccentric anomaly to true anomaly
 * @param eccentricAnomaly Eccentric anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @returns True anomaly in radians
 */
export declare function eccentricToTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number;
/**
 * Calculate Hohmann transfer velocities
 * @param r1 Initial orbit radius (m)
 * @param r2 Final orbit radius (m)
 * @param centralMass Mass of central body (kg)
 * @returns Delta-v requirements for both burns (m/s)
 */
export declare function hohmannTransfer(r1: number, r2: number, centralMass: number): {
    deltaV1: number;
    deltaV2: number;
    transferTime: number;
};
/**
 * Calculate surface gravity
 * g = GM/r²
 * @param mass Body mass (kg)
 * @param radius Body radius (m)
 * @returns Surface gravity (m/s²)
 */
export declare function surfaceGravity(mass: number, radius: number): number;
/**
 * Calculate Schwarzschild radius (event horizon of non-rotating black hole)
 * r_s = 2GM/c²
 * @param mass Mass in kg
 * @returns Schwarzschild radius in meters
 */
export declare function schwarzschildRadius(mass: number): number;
export declare const calculateOrbitalPeriod: typeof orbitalPeriod;
export declare const calculateOrbitalVelocity: typeof circularOrbitalVelocity;
export declare const calculateEscapeVelocity: typeof escapeVelocity;
//# sourceMappingURL=orbital.d.ts.map