/**
 * integrators.js - Numerical Integration Methods
 * 
 * This module provides various numerical integrators for solving
 * the equations of motion in the n-body problem.
 * 
 * Integrators implemented:
 * 1. Velocity Verlet (Leapfrog) - Symplectic, 2nd order, excellent for orbits
 * 2. RK4 - Classic 4th order, good accuracy but not symplectic
 * 3. RK45 (Dormand-Prince) - Adaptive timestep, 5th order with 4th order error estimate
 * 
 * Key properties:
 * - Symplectic integrators (Verlet) preserve phase space volume and are ideal for long-term orbital stability
 * - Higher-order methods (RK4/RK45) are more accurate per step but may drift energy over time
 * - Adaptive methods adjust timestep based on error estimates
 */

import { Vec3 } from './vector3.js';
import { computeAllAccelerations } from './gravity.js';

/**
 * Integrator type enumeration
 */
export const IntegratorType = {
    /** Velocity Verlet (symplectic, 2nd order) */
    VELOCITY_VERLET: 'verlet',
    
    /** Classical 4th order Runge-Kutta */
    RK4: 'rk4',
    
    /** Dormand-Prince adaptive RK45 */
    RK45: 'rk45',
};

/**
 * Current integrator type
 */
let currentIntegrator = IntegratorType.VELOCITY_VERLET;

/**
 * Set the integrator type
 * @param {string} type - Integrator type from IntegratorType enum
 */
export function setIntegrator(type) {
    if (Object.values(IntegratorType).includes(type)) {
        currentIntegrator = type;
    } else {
        console.warn(`Unknown integrator: ${type}, defaulting to Velocity Verlet`);
        currentIntegrator = IntegratorType.VELOCITY_VERLET;
    }
}

/**
 * Get the current integrator type
 * @returns {string} Current integrator type
 */
export function getIntegrator() {
    return currentIntegrator;
}

/**
 * Velocity Verlet (Leapfrog) integrator step
 * 
 * This is a symplectic integrator that preserves phase space volume,
 * making it excellent for long-term orbital simulations.
 * 
 * Algorithm:
 * 1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
 * 2. Compute a(t+dt) from new positions
 * 3. v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
 * 
 * Properties:
 * - 2nd order accurate
 * - Time-reversible
 * - Symplectic (preserves Hamiltonian structure)
 * - Energy oscillates but doesn't drift secularly
 * 
 * @param {Body[]} bodies - Array of bodies to integrate
 * @param {number} dt - Timestep in seconds
 * @param {number} softening - Softening parameter
 */
export function velocityVerletStep(bodies, dt, softening = 0) {
    const n = bodies.length;
    const halfDt = dt * 0.5;
    const halfDtSq = 0.5 * dt * dt;
    
    // Step 1: Update positions using current velocities and accelerations
    // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
    for (let i = 0; i < n; i++) {
        const body = bodies[i];
        if (body.isFixed) continue;
        
        // Store current acceleration for later
        body.prevAcceleration.copy(body.acceleration);
        
        // Update position
        body.position.addScaledSelf(body.velocity, dt);
        body.position.addScaledSelf(body.acceleration, halfDtSq);
    }
    
    // Step 2: Compute new accelerations at updated positions
    computeAllAccelerations(bodies, softening);
    
    // Step 3: Update velocities using average of old and new accelerations
    // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
    for (let i = 0; i < n; i++) {
        const body = bodies[i];
        if (body.isFixed) continue;
        
        body.velocity.addScaledSelf(body.prevAcceleration, halfDt);
        body.velocity.addScaledSelf(body.acceleration, halfDt);
    }
}

/**
 * Classical 4th order Runge-Kutta (RK4) integrator step
 * 
 * Higher accuracy per step than Verlet, but not symplectic.
 * Energy may drift over very long integrations.
 * 
 * For the ODE system:
 *   dx/dt = v
 *   dv/dt = a(x)
 * 
 * @param {Body[]} bodies - Array of bodies to integrate
 * @param {number} dt - Timestep in seconds
 * @param {number} softening - Softening parameter
 */
export function rk4Step(bodies, dt, softening = 0) {
    const n = bodies.length;
    
    // Store initial state
    const x0 = [];
    const v0 = [];
    for (let i = 0; i < n; i++) {
        x0.push(bodies[i].position.clone());
        v0.push(bodies[i].velocity.clone());
    }
    
    // k1: derivatives at initial state
    computeAllAccelerations(bodies, softening);
    const k1x = [], k1v = [];
    for (let i = 0; i < n; i++) {
        k1x.push(bodies[i].velocity.clone());
        k1v.push(bodies[i].acceleration.clone());
    }
    
    // k2: derivatives at midpoint using k1
    for (let i = 0; i < n; i++) {
        if (bodies[i].isFixed) continue;
        bodies[i].position = x0[i].add(k1x[i].mul(dt * 0.5));
        bodies[i].velocity = v0[i].add(k1v[i].mul(dt * 0.5));
    }
    computeAllAccelerations(bodies, softening);
    const k2x = [], k2v = [];
    for (let i = 0; i < n; i++) {
        k2x.push(bodies[i].velocity.clone());
        k2v.push(bodies[i].acceleration.clone());
    }
    
    // k3: derivatives at midpoint using k2
    for (let i = 0; i < n; i++) {
        if (bodies[i].isFixed) continue;
        bodies[i].position = x0[i].add(k2x[i].mul(dt * 0.5));
        bodies[i].velocity = v0[i].add(k2v[i].mul(dt * 0.5));
    }
    computeAllAccelerations(bodies, softening);
    const k3x = [], k3v = [];
    for (let i = 0; i < n; i++) {
        k3x.push(bodies[i].velocity.clone());
        k3v.push(bodies[i].acceleration.clone());
    }
    
    // k4: derivatives at endpoint using k3
    for (let i = 0; i < n; i++) {
        if (bodies[i].isFixed) continue;
        bodies[i].position = x0[i].add(k3x[i].mul(dt));
        bodies[i].velocity = v0[i].add(k3v[i].mul(dt));
    }
    computeAllAccelerations(bodies, softening);
    const k4x = [], k4v = [];
    for (let i = 0; i < n; i++) {
        k4x.push(bodies[i].velocity.clone());
        k4v.push(bodies[i].acceleration.clone());
    }
    
    // Combine: x_new = x0 + (dt/6)*(k1 + 2*k2 + 2*k3 + k4)
    const dt6 = dt / 6;
    for (let i = 0; i < n; i++) {
        if (bodies[i].isFixed) {
            bodies[i].position = x0[i];
            bodies[i].velocity = v0[i];
            continue;
        }
        
        const dx = k1x[i].add(k2x[i].mul(2)).add(k3x[i].mul(2)).add(k4x[i]);
        const dv = k1v[i].add(k2v[i].mul(2)).add(k3v[i].mul(2)).add(k4v[i]);
        
        bodies[i].position = x0[i].add(dx.mul(dt6));
        bodies[i].velocity = v0[i].add(dv.mul(dt6));
    }
    
    // Final acceleration update
    computeAllAccelerations(bodies, softening);
}

/**
 * Dormand-Prince RK45 coefficients
 * Used for adaptive timestep integration
 */
const DP_A = [
    [],
    [1/5],
    [3/40, 9/40],
    [44/45, -56/15, 32/9],
    [19372/6561, -25360/2187, 64448/6561, -212/729],
    [9017/3168, -355/33, 46732/5247, 49/176, -5103/18656],
    [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84]
];

const DP_B5 = [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84, 0];
const DP_B4 = [5179/57600, 0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40];
const DP_C = [0, 1/5, 3/10, 4/5, 8/9, 1, 1];

/**
 * RK45 Dormand-Prince adaptive integrator step
 * 
 * Provides 5th order accuracy with embedded 4th order error estimate
 * for automatic timestep control.
 * 
 * @param {Body[]} bodies - Array of bodies to integrate
 * @param {number} dt - Initial timestep suggestion
 * @param {number} softening - Softening parameter
 * @param {Object} options - Adaptive step options
 * @returns {Object} Result with actual dt used and error estimate
 */
export function rk45Step(bodies, dt, softening = 0, options = {}) {
    const {
        tolerance = 1e-8,
        minDt = 1,
        maxDt = 86400 * 365,
        safetyFactor = 0.9
    } = options;
    
    const n = bodies.length;
    
    // Store initial state
    const x0 = [];
    const v0 = [];
    for (let i = 0; i < n; i++) {
        x0.push(bodies[i].position.clone());
        v0.push(bodies[i].velocity.clone());
    }
    
    // Compute k values
    const kx = [[], [], [], [], [], [], []];
    const kv = [[], [], [], [], [], [], []];
    
    // k1
    computeAllAccelerations(bodies, softening);
    for (let i = 0; i < n; i++) {
        kx[0].push(bodies[i].velocity.clone());
        kv[0].push(bodies[i].acceleration.clone());
    }
    
    // k2 to k7
    for (let s = 1; s < 7; s++) {
        for (let i = 0; i < n; i++) {
            if (bodies[i].isFixed) continue;
            
            let newX = x0[i].clone();
            let newV = v0[i].clone();
            
            for (let j = 0; j < s; j++) {
                newX.addScaledSelf(kx[j][i], dt * DP_A[s][j]);
                newV.addScaledSelf(kv[j][i], dt * DP_A[s][j]);
            }
            
            bodies[i].position = newX;
            bodies[i].velocity = newV;
        }
        
        computeAllAccelerations(bodies, softening);
        
        for (let i = 0; i < n; i++) {
            kx[s].push(bodies[i].velocity.clone());
            kv[s].push(bodies[i].acceleration.clone());
        }
    }
    
    // Compute 5th order solution and error estimate
    let maxError = 0;
    
    for (let i = 0; i < n; i++) {
        if (bodies[i].isFixed) {
            bodies[i].position = x0[i];
            bodies[i].velocity = v0[i];
            continue;
        }
        
        // 5th order solution
        let x5 = x0[i].clone();
        let v5 = v0[i].clone();
        
        // 4th order solution (for error estimate)
        let x4 = x0[i].clone();
        let v4 = v0[i].clone();
        
        for (let s = 0; s < 7; s++) {
            x5.addScaledSelf(kx[s][i], dt * DP_B5[s]);
            v5.addScaledSelf(kv[s][i], dt * DP_B5[s]);
            x4.addScaledSelf(kx[s][i], dt * DP_B4[s]);
            v4.addScaledSelf(kv[s][i], dt * DP_B4[s]);
        }
        
        // Error = difference between 4th and 5th order
        const errX = x5.sub(x4).magnitude();
        const errV = v5.sub(v4).magnitude();
        
        // Normalize error by scale (use velocity for scaling)
        const scale = Math.max(v0[i].magnitude(), 1);
        const normalizedErr = Math.max(errX / scale, errV / scale);
        maxError = Math.max(maxError, normalizedErr);
        
        // Use 5th order result
        bodies[i].position = x5;
        bodies[i].velocity = v5;
    }
    
    // Compute optimal timestep for next iteration
    let optimalDt;
    if (maxError > 0) {
        // Optimal step: dt_new = safety * dt * (tol/err)^(1/5)
        optimalDt = safetyFactor * dt * Math.pow(tolerance / maxError, 0.2);
    } else {
        optimalDt = dt * 2; // Double if error is zero
    }
    
    // Clamp to bounds
    optimalDt = Math.max(minDt, Math.min(maxDt, optimalDt));
    
    // If error is too large, reject step and retry with smaller dt
    if (maxError > tolerance && dt > minDt) {
        // Restore initial state
        for (let i = 0; i < n; i++) {
            bodies[i].position = x0[i];
            bodies[i].velocity = v0[i];
        }
        
        // Retry with smaller timestep
        return rk45Step(bodies, optimalDt, softening, options);
    }
    
    // Final acceleration update
    computeAllAccelerations(bodies, softening);
    
    return {
        dt: dt,
        error: maxError,
        nextDt: optimalDt,
        accepted: true
    };
}

/**
 * Perform a single integration step using the current integrator
 * 
 * @param {Body[]} bodies - Array of bodies to integrate
 * @param {number} dt - Timestep in seconds
 * @param {number} softening - Softening parameter
 * @param {Object} options - Additional options (for adaptive integrators)
 * @returns {Object} Step result (includes actual dt for adaptive methods)
 */
export function step(bodies, dt, softening = 0, options = {}) {
    switch (currentIntegrator) {
        case IntegratorType.VELOCITY_VERLET:
            velocityVerletStep(bodies, dt, softening);
            return { dt: dt, error: 0 };
            
        case IntegratorType.RK4:
            rk4Step(bodies, dt, softening);
            return { dt: dt, error: 0 };
            
        case IntegratorType.RK45:
            return rk45Step(bodies, dt, softening, options);
            
        default:
            velocityVerletStep(bodies, dt, softening);
            return { dt: dt, error: 0 };
    }
}

/**
 * Initialize accelerations for all bodies
 * Should be called before starting integration
 * 
 * @param {Body[]} bodies - Array of bodies
 * @param {number} softening - Softening parameter
 */
export function initializeAccelerations(bodies, softening = 0) {
    computeAllAccelerations(bodies, softening);
    
    // Copy to prevAcceleration for Verlet
    for (const body of bodies) {
        body.prevAcceleration.copy(body.acceleration);
    }
}

export default {
    IntegratorType,
    setIntegrator,
    getIntegrator,
    step,
    velocityVerletStep,
    rk4Step,
    rk45Step,
    initializeAccelerations,
};
