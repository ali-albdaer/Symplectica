/**
 * Orbital Mechanics Calculations
 * ==============================
 * All calculations use SI units (m, kg, s).
 * These are used for initial conditions and analysis.
 */
import { G } from '../constants.js';
import { Vector3 } from './Vector3.js';
/**
 * Calculate orbital period using Kepler's Third Law
 * T = 2π√(a³/μ)
 * @param semiMajorAxis Semi-major axis in meters
 * @param centralMass Mass of central body in kg
 * @returns Period in seconds
 */
export function orbitalPeriod(semiMajorAxis, centralMass) {
    if (semiMajorAxis <= 0) {
        throw new Error(`orbitalPeriod: Semi-major axis must be positive, got ${semiMajorAxis}`);
    }
    if (centralMass <= 0) {
        throw new Error(`orbitalPeriod: Central mass must be positive, got ${centralMass}`);
    }
    const mu = G * centralMass;
    return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
}
/**
 * Calculate circular orbital velocity
 * v = √(μ/r)
 * @param radius Orbital radius in meters
 * @param centralMass Mass of central body in kg
 * @returns Velocity in m/s
 */
export function circularOrbitalVelocity(radius, centralMass) {
    if (radius <= 0) {
        throw new Error(`circularOrbitalVelocity: Radius must be positive, got ${radius}`);
    }
    if (centralMass <= 0) {
        throw new Error(`circularOrbitalVelocity: Central mass must be positive, got ${centralMass}`);
    }
    const mu = G * centralMass;
    return Math.sqrt(mu / radius);
}
/**
 * Calculate escape velocity
 * v_esc = √(2μ/r)
 * @param radius Distance from center of mass in meters
 * @param mass Mass of body in kg
 * @returns Escape velocity in m/s
 */
export function escapeVelocity(radius, mass) {
    if (radius <= 0) {
        throw new Error(`escapeVelocity: Radius must be positive, got ${radius}`);
    }
    if (mass <= 0) {
        throw new Error(`escapeVelocity: Mass must be positive, got ${mass}`);
    }
    return Math.sqrt(2 * G * mass / radius);
}
/**
 * Calculate sphere of influence radius (Hill sphere approximation)
 * r_SOI ≈ a × (m/M)^(2/5)
 * @param semiMajorAxis Semi-major axis of orbit in meters
 * @param bodyMass Mass of the body in kg
 * @param parentMass Mass of the parent body in kg
 * @returns SOI radius in meters
 */
export function sphereOfInfluence(semiMajorAxis, bodyMass, parentMass) {
    if (semiMajorAxis <= 0 || bodyMass <= 0 || parentMass <= 0) {
        throw new Error('sphereOfInfluence: All parameters must be positive');
    }
    return semiMajorAxis * Math.pow(bodyMass / parentMass, 2 / 5);
}
/**
 * Calculate Hill sphere radius
 * r_Hill ≈ a × (m/(3M))^(1/3)
 * @param semiMajorAxis Semi-major axis of orbit in meters
 * @param bodyMass Mass of the body in kg
 * @param parentMass Mass of the parent body in kg
 * @returns Hill radius in meters
 */
export function hillRadius(semiMajorAxis, bodyMass, parentMass) {
    if (semiMajorAxis <= 0 || bodyMass <= 0 || parentMass <= 0) {
        throw new Error('hillRadius: All parameters must be positive');
    }
    return semiMajorAxis * Math.pow(bodyMass / (3 * parentMass), 1 / 3);
}
/**
 * Calculate gravitational acceleration at a distance
 * a = GM/r²
 * @param distance Distance from center of mass in meters
 * @param mass Mass of body in kg
 * @returns Acceleration magnitude in m/s²
 */
export function gravitationalAcceleration(distance, mass) {
    if (distance <= 0) {
        throw new Error(`gravitationalAcceleration: Distance must be positive, got ${distance}`);
    }
    if (mass < 0) {
        throw new Error(`gravitationalAcceleration: Mass cannot be negative, got ${mass}`);
    }
    return G * mass / (distance * distance);
}
/**
 * Calculate specific orbital energy
 * ε = v²/2 - μ/r
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Specific orbital energy (J/kg)
 */
export function specificOrbitalEnergy(position, velocity, centralMass) {
    const r = position.length();
    const v = velocity.length();
    const mu = G * centralMass;
    return (v * v) / 2 - mu / r;
}
/**
 * Calculate specific angular momentum vector
 * h = r × v
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @returns Specific angular momentum vector (m²/s)
 */
export function specificAngularMomentum(position, velocity) {
    return Vector3.cross(position, velocity);
}
/**
 * Calculate eccentricity vector
 * e = (v × h)/μ - r/|r|
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Eccentricity vector
 */
export function eccentricityVector(position, velocity, centralMass) {
    const mu = G * centralMass;
    const h = specificAngularMomentum(position, velocity);
    const r = position.length();
    const vCrossH = Vector3.cross(velocity, h);
    const rNorm = position.clone().divideScalar(r);
    return vCrossH.divideScalar(mu).sub(rNorm);
}
/**
 * Convert orbital elements to state vectors
 * @param elements Orbital elements
 * @param centralMass Mass of central body in kg
 * @returns Position and velocity vectors in the orbital plane
 */
export function elementsToStateVectors(elements, centralMass) {
    const { a, e, i, omega, w, nu } = elements;
    const mu = G * centralMass;
    // Handle edge cases
    if (e >= 1) {
        throw new Error(`elementsToStateVectors: Only elliptical orbits supported (e < 1), got e = ${e}`);
    }
    // Semi-latus rectum
    const p = a * (1 - e * e);
    // Distance from focus
    const r = p / (1 + e * Math.cos(nu));
    // Position in orbital plane
    const x = r * Math.cos(nu);
    const y = r * Math.sin(nu);
    // Velocity in orbital plane
    const h = Math.sqrt(mu * p);
    const vx = -mu / h * Math.sin(nu);
    const vy = mu / h * (e + Math.cos(nu));
    // Rotation matrices
    const cosO = Math.cos(omega);
    const sinO = Math.sin(omega);
    const cosw = Math.cos(w);
    const sinw = Math.sin(w);
    const cosi = Math.cos(i);
    const sini = Math.sin(i);
    // Combined rotation matrix elements
    const r11 = cosO * cosw - sinO * sinw * cosi;
    const r12 = -cosO * sinw - sinO * cosw * cosi;
    const r21 = sinO * cosw + cosO * sinw * cosi;
    const r22 = -sinO * sinw + cosO * cosw * cosi;
    const r31 = sinw * sini;
    const r32 = cosw * sini;
    // Transform to 3D
    const position = new Vector3(r11 * x + r12 * y, r21 * x + r22 * y, r31 * x + r32 * y);
    const velocity = new Vector3(r11 * vx + r12 * vy, r21 * vx + r22 * vy, r31 * vx + r32 * vy);
    return { position, velocity };
}
/**
 * Convert state vectors to orbital elements
 * @param position Position vector (m)
 * @param velocity Velocity vector (m/s)
 * @param centralMass Mass of central body (kg)
 * @returns Orbital elements
 */
export function stateVectorsToElements(position, velocity, centralMass) {
    const mu = G * centralMass;
    const r = position.length();
    const v = velocity.length();
    // Specific angular momentum
    const h = specificAngularMomentum(position, velocity);
    const hMag = h.length();
    // Node vector (points to ascending node)
    const n = new Vector3(-h.y, h.x, 0);
    const nMag = n.length();
    // Eccentricity vector
    const eVec = eccentricityVector(position, velocity, centralMass);
    const e = eVec.length();
    // Specific orbital energy
    const energy = (v * v) / 2 - mu / r;
    // Semi-major axis
    let a;
    if (Math.abs(e - 1) < 1e-10) {
        // Parabolic
        a = Infinity;
    }
    else {
        a = -mu / (2 * energy);
    }
    // Inclination
    const i = Math.acos(Math.max(-1, Math.min(1, h.z / hMag)));
    // Longitude of ascending node
    let omega;
    if (nMag < 1e-10) {
        // Equatorial orbit
        omega = 0;
    }
    else {
        omega = Math.acos(Math.max(-1, Math.min(1, n.x / nMag)));
        if (n.y < 0) {
            omega = 2 * Math.PI - omega;
        }
    }
    // Argument of periapsis
    let w;
    if (e < 1e-10) {
        // Circular orbit
        w = 0;
    }
    else if (nMag < 1e-10) {
        // Equatorial orbit
        w = Math.atan2(eVec.y, eVec.x);
        if (h.z < 0) {
            w = -w;
        }
    }
    else {
        const cosW = n.dot(eVec) / (nMag * e);
        w = Math.acos(Math.max(-1, Math.min(1, cosW)));
        if (eVec.z < 0) {
            w = 2 * Math.PI - w;
        }
    }
    // True anomaly
    let nu;
    if (e < 1e-10) {
        // Circular orbit - use argument of latitude
        if (nMag < 1e-10) {
            // Circular equatorial
            nu = Math.atan2(position.y, position.x);
        }
        else {
            const cosNu = n.dot(position) / (nMag * r);
            nu = Math.acos(Math.max(-1, Math.min(1, cosNu)));
            if (position.z < 0) {
                nu = 2 * Math.PI - nu;
            }
        }
    }
    else {
        const cosNu = eVec.dot(position) / (e * r);
        nu = Math.acos(Math.max(-1, Math.min(1, cosNu)));
        if (position.dot(velocity) < 0) {
            nu = 2 * Math.PI - nu;
        }
    }
    return { a, e, i, omega, w, nu };
}
/**
 * Calculate vis-viva velocity
 * v = √(μ(2/r - 1/a))
 * @param radius Current distance from focus (m)
 * @param semiMajorAxis Semi-major axis (m)
 * @param centralMass Mass of central body (kg)
 * @returns Orbital velocity (m/s)
 */
export function visVivaVelocity(radius, semiMajorAxis, centralMass) {
    const mu = G * centralMass;
    return Math.sqrt(mu * (2 / radius - 1 / semiMajorAxis));
}
/**
 * Calculate time since periapsis (Kepler's equation)
 * @param trueAnomaly True anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @param period Orbital period in seconds
 * @returns Time since periapsis in seconds
 */
export function timeSincePeriapsis(trueAnomaly, eccentricity, period) {
    // Eccentric anomaly
    const cosNu = Math.cos(trueAnomaly);
    const cosE = (eccentricity + cosNu) / (1 + eccentricity * cosNu);
    let E = Math.acos(Math.max(-1, Math.min(1, cosE)));
    if (trueAnomaly > Math.PI) {
        E = 2 * Math.PI - E;
    }
    // Mean anomaly (Kepler's equation)
    const M = E - eccentricity * Math.sin(E);
    // Time since periapsis
    return (M / (2 * Math.PI)) * period;
}
/**
 * Solve Kepler's equation for eccentric anomaly
 * M = E - e*sin(E)
 * @param meanAnomaly Mean anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @param tolerance Convergence tolerance
 * @returns Eccentric anomaly in radians
 */
export function solveKeplersEquation(meanAnomaly, eccentricity, tolerance = 1e-10) {
    if (eccentricity < 0 || eccentricity >= 1) {
        throw new Error(`solveKeplersEquation: Eccentricity must be in [0, 1), got ${eccentricity}`);
    }
    // Initial guess
    let E = meanAnomaly;
    if (eccentricity > 0.8) {
        E = Math.PI;
    }
    // Newton-Raphson iteration
    for (let iter = 0; iter < 100; iter++) {
        const f = E - eccentricity * Math.sin(E) - meanAnomaly;
        const fPrime = 1 - eccentricity * Math.cos(E);
        const delta = f / fPrime;
        E -= delta;
        if (Math.abs(delta) < tolerance) {
            return E;
        }
    }
    throw new Error(`solveKeplersEquation: Failed to converge for M=${meanAnomaly}, e=${eccentricity}`);
}
/**
 * Convert eccentric anomaly to true anomaly
 * @param eccentricAnomaly Eccentric anomaly in radians
 * @param eccentricity Orbital eccentricity
 * @returns True anomaly in radians
 */
export function eccentricToTrueAnomaly(eccentricAnomaly, eccentricity) {
    const cosE = Math.cos(eccentricAnomaly);
    const cosNu = (cosE - eccentricity) / (1 - eccentricity * cosE);
    let nu = Math.acos(Math.max(-1, Math.min(1, cosNu)));
    if (eccentricAnomaly > Math.PI) {
        nu = 2 * Math.PI - nu;
    }
    return nu;
}
/**
 * Calculate Hohmann transfer velocities
 * @param r1 Initial orbit radius (m)
 * @param r2 Final orbit radius (m)
 * @param centralMass Mass of central body (kg)
 * @returns Delta-v requirements for both burns (m/s)
 */
export function hohmannTransfer(r1, r2, centralMass) {
    const mu = G * centralMass;
    // Transfer ellipse semi-major axis
    const aTransfer = (r1 + r2) / 2;
    // Velocities at each point
    const v1Circular = Math.sqrt(mu / r1);
    const v2Circular = Math.sqrt(mu / r2);
    const v1Transfer = Math.sqrt(mu * (2 / r1 - 1 / aTransfer));
    const v2Transfer = Math.sqrt(mu * (2 / r2 - 1 / aTransfer));
    // Delta-v for each burn
    const deltaV1 = Math.abs(v1Transfer - v1Circular);
    const deltaV2 = Math.abs(v2Circular - v2Transfer);
    // Transfer time (half the transfer orbit period)
    const transferTime = Math.PI * Math.sqrt(Math.pow(aTransfer, 3) / mu);
    return { deltaV1, deltaV2, transferTime };
}
/**
 * Calculate surface gravity
 * g = GM/r²
 * @param mass Body mass (kg)
 * @param radius Body radius (m)
 * @returns Surface gravity (m/s²)
 */
export function surfaceGravity(mass, radius) {
    if (radius <= 0) {
        throw new Error(`surfaceGravity: Radius must be positive, got ${radius}`);
    }
    return G * mass / (radius * radius);
}
/**
 * Calculate Schwarzschild radius (event horizon of non-rotating black hole)
 * r_s = 2GM/c²
 * @param mass Mass in kg
 * @returns Schwarzschild radius in meters
 */
export function schwarzschildRadius(mass) {
    const c = 299792458; // Speed of light
    return (2 * G * mass) / (c * c);
}
// Convenient aliases for common operations
export const calculateOrbitalPeriod = orbitalPeriod;
export const calculateOrbitalVelocity = circularOrbitalVelocity;
export const calculateEscapeVelocity = escapeVelocity;
//# sourceMappingURL=orbital.js.map