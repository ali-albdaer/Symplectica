/**
 * gravity.js - Gravitational Force Calculations
 * 
 * This module contains all gravity-related physics calculations.
 * Supports multiple physics modes:
 * 1. Newtonian gravity (default)
 * 2. Pseudo-Newtonian (Paczyński-Wiita potential) for compact objects
 * 3. Post-Newtonian (1PN) corrections for relativistic effects
 * 
 * EXTENSIBILITY NOTE:
 * The pairwise O(n²) force calculation in computeAllAccelerations() can be
 * replaced with Barnes-Hut octree (O(n log n)) for large N simulations.
 * The interface is designed to make this substitution straightforward:
 * - Input: array of bodies with positions and masses
 * - Output: accelerations written to each body's acceleration property
 */

import { Vec3 } from './vector3.js';
import { G, C, C_SQUARED, SCHWARZSCHILD_COEFF } from './constants.js';
import { isCompactObject } from './body.js';

/**
 * Physics mode enumeration
 */
export const PhysicsMode = {
    /** Standard Newtonian gravity: F = GMm/r² */
    NEWTONIAN: 'newtonian',
    
    /** 
     * Paczyński-Wiita pseudo-Newtonian potential for compact objects
     * Φ = -GM/(r - r_s) where r_s is Schwarzschild radius
     * Reproduces key GR features: ISCO at 3r_s, marginally bound orbit at 2r_s
     */
    PSEUDO_NEWTONIAN: 'pseudo-newtonian',
    
    /**
     * First Post-Newtonian (1PN) corrections
     * Includes velocity-dependent terms and perihelion precession
     */
    POST_NEWTONIAN_1PN: '1pn',
};

/**
 * Current physics mode (global setting)
 */
let currentPhysicsMode = PhysicsMode.NEWTONIAN;

/**
 * Set the physics mode
 * @param {string} mode - Physics mode from PhysicsMode enum
 */
export function setPhysicsMode(mode) {
    if (Object.values(PhysicsMode).includes(mode)) {
        currentPhysicsMode = mode;
    } else {
        console.warn(`Unknown physics mode: ${mode}, defaulting to Newtonian`);
        currentPhysicsMode = PhysicsMode.NEWTONIAN;
    }
}

/**
 * Get the current physics mode
 * @returns {string} Current physics mode
 */
export function getPhysicsMode() {
    return currentPhysicsMode;
}

/**
 * Compute Newtonian gravitational acceleration from body B on body A
 * 
 * a = G * M_B / r² * r_hat
 * 
 * @param {Vec3} posA - Position of body A (target)
 * @param {Vec3} posB - Position of body B (source)
 * @param {number} massB - Mass of body B in kg
 * @param {number} softening - Softening parameter in meters
 * @returns {Vec3} Acceleration vector on body A
 */
export function newtonianAcceleration(posA, posB, massB, softening = 0) {
    const r = posB.sub(posA);
    const distSq = r.magnitudeSquared();
    const softenedDistSq = distSq + softening * softening;
    const dist = Math.sqrt(softenedDistSq);
    
    if (dist === 0) {
        return Vec3.zero();
    }
    
    // a = G * M / r²
    const accelMag = (G * massB) / softenedDistSq;
    
    // Direction: unit vector from A to B
    return r.mul(accelMag / dist);
}

/**
 * Compute Paczyński-Wiita pseudo-Newtonian acceleration
 * 
 * For the potential Φ = -GM/(r - r_s), the acceleration is:
 * a = GM / (r - r_s)² * r_hat
 * 
 * This reproduces key GR features near black holes:
 * - ISCO (innermost stable circular orbit) at r = 3r_s
 * - Marginally bound orbit at r = 2r_s
 * - Infinite redshift surface at r = r_s
 * 
 * @param {Vec3} posA - Position of body A (target)
 * @param {Vec3} posB - Position of body B (source, compact object)
 * @param {number} massB - Mass of body B in kg
 * @param {number} schwarzschildRadius - Schwarzschild radius of body B
 * @param {number} softening - Softening parameter in meters
 * @returns {Vec3} Acceleration vector on body A
 */
export function paczynnskiWittaAcceleration(posA, posB, massB, schwarzschildRadius, softening = 0) {
    const r = posB.sub(posA);
    const dist = Math.sqrt(r.magnitudeSquared() + softening * softening);
    
    // Prevent singularity at r = r_s
    // In reality, nothing should be inside the event horizon
    if (dist <= schwarzschildRadius * 1.001) {
        // Return very large acceleration pointing inward (effectively captures the object)
        // This is a numerical safeguard, not physical
        const maxAccel = G * massB / (schwarzschildRadius * schwarzschildRadius);
        return r.normalize().mul(maxAccel);
    }
    
    // Effective radius in P-W potential: r_eff = r - r_s
    const rEff = dist - schwarzschildRadius;
    
    // a = GM / (r - r_s)²
    const accelMag = (G * massB) / (rEff * rEff);
    
    // Direction: unit vector from A to B
    return r.mul(accelMag / dist);
}

/**
 * Compute 1PN (first Post-Newtonian) acceleration
 * 
 * Includes relativistic corrections at order (v/c)²:
 * - Perihelion precession
 * - Velocity-dependent gravitational effects
 * 
 * The 1PN acceleration in the center-of-mass frame is:
 * a = a_Newton * [1 + (terms of order v²/c² and GM/rc²)]
 * 
 * Simplified form for a test particle around mass M:
 * a ≈ a_N * {1 + (1/c²) * [4GM/r - v² + 4(v·r_hat)²]}
 * 
 * @param {Vec3} posA - Position of body A (target)
 * @param {Vec3} posB - Position of body B (source)
 * @param {Vec3} velA - Velocity of body A
 * @param {Vec3} velB - Velocity of body B
 * @param {number} massB - Mass of body B in kg
 * @param {number} softening - Softening parameter
 * @returns {Vec3} Acceleration vector on body A with 1PN correction
 */
export function postNewtonian1PNAcceleration(posA, posB, velA, velB, massB, softening = 0) {
    const r = posB.sub(posA);
    const distSq = r.magnitudeSquared() + softening * softening;
    const dist = Math.sqrt(distSq);
    
    if (dist === 0) {
        return Vec3.zero();
    }
    
    const rHat = r.div(dist);  // Unit vector from A to B
    
    // Relative velocity
    const vRel = velA.sub(velB);
    const vSq = vRel.magnitudeSquared();
    
    // Radial component of velocity
    const vRadial = vRel.dot(rHat);
    
    // Newtonian acceleration magnitude
    const aN = (G * massB) / distSq;
    
    // 1PN correction factor
    // From Will, "Theory and Experiment in Gravitational Physics"
    // Simplified for test particle limit
    const GM_over_r = G * massB / dist;
    const c2 = C_SQUARED;
    
    // Correction: 1 + (1/c²)[4GM/r - v² + 4(v·r_hat)²]
    // This gives perihelion precession and other 1PN effects
    const correction = 1 + (1/c2) * (4 * GM_over_r - vSq + 4 * vRadial * vRadial);
    
    // Also add the velocity-dependent term that gives frame-dragging-like effects
    // a_1PN = a_N * correction - (1/c²) * 4 * (v·r_hat) * a_N * v_tangential
    const vTangent = vRel.sub(rHat.mul(vRadial));
    
    // Main term
    let accel = rHat.mul(aN * correction);
    
    // Additional velocity-dependent correction (cross term)
    const crossCorrection = (4 / c2) * vRadial * aN;
    accel = accel.sub(vTangent.mul(crossCorrection / dist));
    
    return accel;
}

/**
 * Compute gravitational acceleration on body A due to body B
 * Uses the currently selected physics mode
 * 
 * @param {Body} bodyA - Target body (receives acceleration)
 * @param {Body} bodyB - Source body (causes acceleration)
 * @param {number} globalSoftening - Global softening parameter
 * @returns {Vec3} Acceleration vector on body A
 */
export function computeAcceleration(bodyA, bodyB, globalSoftening = 0) {
    // Combined softening: max of global and per-body values
    const softening = Math.max(globalSoftening, bodyA.softening, bodyB.softening);
    
    // Check if source body is a compact object (may need special treatment)
    const sourceIsCompact = isCompactObject(bodyB.type);
    
    switch (currentPhysicsMode) {
        case PhysicsMode.NEWTONIAN:
            return newtonianAcceleration(
                bodyA.position, 
                bodyB.position, 
                bodyB.mass, 
                softening
            );
            
        case PhysicsMode.PSEUDO_NEWTONIAN:
            if (sourceIsCompact && bodyB.schwarzschildRadius) {
                return paczynnskiWittaAcceleration(
                    bodyA.position,
                    bodyB.position,
                    bodyB.mass,
                    bodyB.schwarzschildRadius,
                    softening
                );
            }
            // Fall back to Newtonian for non-compact objects
            return newtonianAcceleration(
                bodyA.position,
                bodyB.position,
                bodyB.mass,
                softening
            );
            
        case PhysicsMode.POST_NEWTONIAN_1PN:
            return postNewtonian1PNAcceleration(
                bodyA.position,
                bodyB.position,
                bodyA.velocity,
                bodyB.velocity,
                bodyB.mass,
                softening
            );
            
        default:
            return newtonianAcceleration(
                bodyA.position,
                bodyB.position,
                bodyB.mass,
                softening
            );
    }
}

/**
 * Compute accelerations for all bodies due to gravitational interactions
 * 
 * This is the main O(n²) pairwise gravity calculation.
 * 
 * EXTENSIBILITY NOTE:
 * To optimize for large N, replace the inner loops with:
 * - Barnes-Hut octree: O(n log n), accuracy parameter θ
 * - Fast Multipole Method: O(n), more complex
 * - GPU compute shaders: Parallel O(n²) but much faster
 * 
 * The interface remains the same: bodies in, accelerations written to bodies.
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @param {number} globalSoftening - Global softening parameter
 */
export function computeAllAccelerations(bodies, globalSoftening = 0) {
    const n = bodies.length;
    
    // Reset all accelerations
    for (let i = 0; i < n; i++) {
        bodies[i].acceleration.set(0, 0, 0);
    }
    
    // Pairwise force calculation
    // Using Newton's third law: F_ij = -F_ji to avoid redundant calculations
    for (let i = 0; i < n; i++) {
        const bodyI = bodies[i];
        
        // Skip if this body doesn't respond to gravity
        if (!bodyI.isGravityTarget || bodyI.isFixed) {
            continue;
        }
        
        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            
            const bodyJ = bodies[j];
            
            // Skip if source body doesn't exert gravity
            if (!bodyJ.isGravitySource) {
                continue;
            }
            
            // Compute acceleration on body i due to body j
            const accel = computeAcceleration(bodyI, bodyJ, globalSoftening);
            
            // Accumulate acceleration
            bodyI.acceleration.addSelf(accel);
        }
    }
}

/**
 * Compute gravitational potential energy between two bodies
 * 
 * U = -G * m1 * m2 / r
 * 
 * @param {Body} bodyA - First body
 * @param {Body} bodyB - Second body
 * @param {number} softening - Softening parameter
 * @returns {number} Potential energy in Joules (negative)
 */
export function gravitationalPotentialEnergy(bodyA, bodyB, softening = 0) {
    const distSq = bodyA.position.distanceSquared(bodyB.position);
    const dist = Math.sqrt(distSq + softening * softening);
    
    if (dist === 0) {
        return 0;
    }
    
    return -G * bodyA.mass * bodyB.mass / dist;
}

/**
 * Compute total gravitational potential energy of the system
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @param {number} softening - Softening parameter
 * @returns {number} Total potential energy in Joules
 */
export function totalPotentialEnergy(bodies, softening = 0) {
    let U = 0;
    const n = bodies.length;
    
    // Sum over all unique pairs (i < j)
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            U += gravitationalPotentialEnergy(bodies[i], bodies[j], softening);
        }
    }
    
    return U;
}

/**
 * Compute total kinetic energy of the system
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @returns {number} Total kinetic energy in Joules
 */
export function totalKineticEnergy(bodies) {
    let KE = 0;
    for (const body of bodies) {
        KE += body.kineticEnergy();
    }
    return KE;
}

/**
 * Compute total mechanical energy of the system
 * 
 * E = KE + PE
 * 
 * For a bound system, E < 0
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @param {number} softening - Softening parameter
 * @returns {number} Total energy in Joules
 */
export function totalEnergy(bodies, softening = 0) {
    return totalKineticEnergy(bodies) + totalPotentialEnergy(bodies, softening);
}

/**
 * Compute total angular momentum of the system about origin
 * 
 * L = Σ r_i × p_i
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @returns {Vec3} Total angular momentum vector
 */
export function totalAngularMomentum(bodies) {
    let L = Vec3.zero();
    for (const body of bodies) {
        L = L.add(body.angularMomentum());
    }
    return L;
}

/**
 * Compute total linear momentum of the system
 * 
 * P = Σ m_i * v_i
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @returns {Vec3} Total momentum vector
 */
export function totalMomentum(bodies) {
    let P = Vec3.zero();
    for (const body of bodies) {
        P = P.add(body.momentum());
    }
    return P;
}

/**
 * Compute center of mass position
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @returns {{position: Vec3, mass: number}} Center of mass
 */
export function centerOfMass(bodies) {
    let totalMass = 0;
    let com = Vec3.zero();
    
    for (const body of bodies) {
        totalMass += body.mass;
        com = com.add(body.position.mul(body.mass));
    }
    
    if (totalMass === 0) {
        return { position: Vec3.zero(), mass: 0 };
    }
    
    return {
        position: com.div(totalMass),
        mass: totalMass
    };
}

/**
 * Check for collisions or close encounters
 * 
 * @param {Body[]} bodies - Array of all bodies
 * @param {number} threshold - Distance threshold multiplier (1.0 = touching)
 * @returns {Array<{bodyA: Body, bodyB: Body, distance: number}>} Collision pairs
 */
export function detectCollisions(bodies, threshold = 1.0) {
    const collisions = [];
    const n = bodies.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const dist = bodies[i].position.distance(bodies[j].position);
            const minDist = (bodies[i].radius + bodies[j].radius) * threshold;
            
            if (dist < minDist) {
                collisions.push({
                    bodyA: bodies[i],
                    bodyB: bodies[j],
                    distance: dist,
                    minDistance: minDist
                });
            }
        }
    }
    
    return collisions;
}

export default {
    PhysicsMode,
    setPhysicsMode,
    getPhysicsMode,
    computeAcceleration,
    computeAllAccelerations,
    totalEnergy,
    totalKineticEnergy,
    totalPotentialEnergy,
    totalAngularMomentum,
    totalMomentum,
    centerOfMass,
    detectCollisions,
};
