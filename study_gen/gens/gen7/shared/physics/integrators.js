/**
 * Numerical Integrators for N-Body Simulation
 * Implements Symplectic Velocity Verlet (default) and Adaptive RK45.
 * @module shared/physics/integrators
 */

import { Vector3D } from '../math/Vector3D.js';
import { G, SOFTENING_LENGTH } from './constants.js';

/**
 * Calculate gravitational acceleration on body i from all other massive bodies
 * @param {Object} body - Target body
 * @param {Object[]} massiveBodies - Array of massive bodies
 * @param {Vector3D} [output] - Optional output vector to avoid allocation
 * @returns {Vector3D} Acceleration vector (m/s²)
 */
export function calculateAcceleration(body, massiveBodies, output = new Vector3D()) {
  output.set(0, 0, 0);
  
  for (const other of massiveBodies) {
    if (other.id === body.id) continue;
    
    // Direction from body to other
    const dx = other.position.x - body.position.x;
    const dy = other.position.y - body.position.y;
    const dz = other.position.z - body.position.z;
    
    // Distance with softening to prevent singularities
    const distSq = dx * dx + dy * dy + dz * dz;
    const softDistSq = distSq + SOFTENING_LENGTH * SOFTENING_LENGTH;
    const dist = Math.sqrt(softDistSq);
    
    // Gravitational acceleration: a = GM/r² * (direction)
    const accelMag = (G * other.mass) / softDistSq;
    
    // Add to total acceleration (normalized direction * magnitude)
    output.x += (dx / dist) * accelMag;
    output.y += (dy / dist) * accelMag;
    output.z += (dz / dist) * accelMag;
  }
  
  // Validate result
  if (!output.isFinite()) {
    throw new Error(`[Integrator] NaN/Infinity in acceleration for body ${body.id}`);
  }
  
  return output;
}

/**
 * Symplectic Velocity Verlet Integrator
 * Second-order, time-reversible, energy-conserving.
 * Best for long-term orbital stability.
 */
export class VelocityVerlet {
  constructor() {
    /** @type {Map<string, Vector3D>} Cached accelerations from previous step */
    this.accelerationCache = new Map();
    /** @type {Vector3D} Temp vector for calculations */
    this._tempAccel = new Vector3D();
  }

  /**
   * Perform one integration step for all bodies
   * @param {Object[]} bodies - All bodies (massive + passive)
   * @param {Object[]} massiveBodies - Only massive bodies (for gravity source)
   * @param {number} dt - Timestep in seconds
   */
  step(bodies, massiveBodies, dt) {
    const dtHalf = dt * 0.5;
    const dtSq = dt * dt;
    
    // For each body, compute or retrieve cached acceleration
    for (const body of bodies) {
      if (!this.accelerationCache.has(body.id)) {
        const accel = calculateAcceleration(body, massiveBodies);
        this.accelerationCache.set(body.id, accel);
      }
    }
    
    // First half: Update positions using current velocity and acceleration
    for (const body of bodies) {
      const accel = this.accelerationCache.get(body.id);
      
      // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
      body.position.x += body.velocity.x * dt + 0.5 * accel.x * dtSq;
      body.position.y += body.velocity.y * dt + 0.5 * accel.y * dtSq;
      body.position.z += body.velocity.z * dt + 0.5 * accel.z * dtSq;
      
      // Half velocity update: v(t+dt/2) = v(t) + 0.5*a(t)*dt
      body.velocity.x += accel.x * dtHalf;
      body.velocity.y += accel.y * dtHalf;
      body.velocity.z += accel.z * dtHalf;
    }
    
    // Calculate new accelerations at updated positions
    for (const body of bodies) {
      const newAccel = calculateAcceleration(body, massiveBodies, this._tempAccel);
      
      // Complete velocity update: v(t+dt) = v(t+dt/2) + 0.5*a(t+dt)*dt
      body.velocity.x += newAccel.x * dtHalf;
      body.velocity.y += newAccel.y * dtHalf;
      body.velocity.z += newAccel.z * dtHalf;
      
      // Cache for next step
      let cached = this.accelerationCache.get(body.id);
      if (!cached) {
        cached = new Vector3D();
        this.accelerationCache.set(body.id, cached);
      }
      cached.copy(newAccel);
      
      // Validate final state
      body.position.validate(`${body.id}.position`);
      body.velocity.validate(`${body.id}.velocity`);
    }
  }

  /**
   * Clear cached accelerations (call when bodies are added/removed)
   */
  reset() {
    this.accelerationCache.clear();
  }
}

/**
 * Adaptive Runge-Kutta-Fehlberg (RK45) Integrator
 * Higher accuracy for close encounters and high-gradient situations.
 * Automatically adjusts timestep for accuracy.
 */
export class AdaptiveRK45 {
  /**
   * @param {number} tolerance - Error tolerance for adaptive stepping
   * @param {number} minDt - Minimum timestep (seconds)
   * @param {number} maxDt - Maximum timestep (seconds)
   */
  constructor(tolerance = 1e-9, minDt = 1e-4, maxDt = 3600) {
    this.tolerance = tolerance;
    this.minDt = minDt;
    this.maxDt = maxDt;
    
    // RK45 coefficients (Cash-Karp)
    this.a = [0, 1/5, 3/10, 3/5, 1, 7/8];
    this.b = [
      [],
      [1/5],
      [3/40, 9/40],
      [3/10, -9/10, 6/5],
      [-11/54, 5/2, -70/27, 35/27],
      [1631/55296, 175/512, 575/13824, 44275/110592, 253/4096]
    ];
    this.c = [37/378, 0, 250/621, 125/594, 0, 512/1771];
    this.cStar = [2825/27648, 0, 18575/48384, 13525/55296, 277/14336, 1/4];
    
    // Temp storage for k vectors
    this._k = [
      new Vector3D(), new Vector3D(), new Vector3D(),
      new Vector3D(), new Vector3D(), new Vector3D()
    ];
    this._tempPos = new Vector3D();
    this._tempVel = new Vector3D();
  }

  /**
   * Calculate acceleration at a given position
   * @private
   */
  _accelAt(position, bodyId, massiveBodies) {
    const tempBody = { id: bodyId, position };
    return calculateAcceleration(tempBody, massiveBodies);
  }

  /**
   * Perform adaptive RK45 step for a single body
   * @param {Object} body 
   * @param {Object[]} massiveBodies 
   * @param {number} dt - Target timestep
   * @returns {number} Actual timestep used
   */
  stepBody(body, massiveBodies, dt) {
    let currentDt = Math.min(dt, this.maxDt);
    let timeRemaining = dt;
    
    while (timeRemaining > 0) {
      currentDt = Math.min(currentDt, timeRemaining);
      
      // Calculate k values
      const pos0 = body.position.clone();
      const vel0 = body.velocity.clone();
      
      this._k[0].copy(this._accelAt(pos0, body.id, massiveBodies));
      
      for (let i = 1; i < 6; i++) {
        this._tempPos.copy(pos0);
        this._tempVel.copy(vel0);
        
        for (let j = 0; j < i; j++) {
          const bij = this.b[i][j] || 0;
          this._tempPos.x += vel0.x * this.a[i] * currentDt + 0.5 * this._k[j].x * bij * currentDt * currentDt;
          this._tempPos.y += vel0.y * this.a[i] * currentDt + 0.5 * this._k[j].y * bij * currentDt * currentDt;
          this._tempPos.z += vel0.z * this.a[i] * currentDt + 0.5 * this._k[j].z * bij * currentDt * currentDt;
        }
        
        this._k[i].copy(this._accelAt(this._tempPos, body.id, massiveBodies));
      }
      
      // Calculate 5th order solution
      let newX = pos0.x + vel0.x * currentDt;
      let newY = pos0.y + vel0.y * currentDt;
      let newZ = pos0.z + vel0.z * currentDt;
      let newVx = vel0.x;
      let newVy = vel0.y;
      let newVz = vel0.z;
      
      for (let i = 0; i < 6; i++) {
        newX += 0.5 * this.c[i] * this._k[i].x * currentDt * currentDt;
        newY += 0.5 * this.c[i] * this._k[i].y * currentDt * currentDt;
        newZ += 0.5 * this.c[i] * this._k[i].z * currentDt * currentDt;
        newVx += this.c[i] * this._k[i].x * currentDt;
        newVy += this.c[i] * this._k[i].y * currentDt;
        newVz += this.c[i] * this._k[i].z * currentDt;
      }
      
      // Calculate 4th order solution for error estimation
      let newX4 = pos0.x + vel0.x * currentDt;
      let newY4 = pos0.y + vel0.y * currentDt;
      let newZ4 = pos0.z + vel0.z * currentDt;
      
      for (let i = 0; i < 6; i++) {
        newX4 += 0.5 * this.cStar[i] * this._k[i].x * currentDt * currentDt;
        newY4 += 0.5 * this.cStar[i] * this._k[i].y * currentDt * currentDt;
        newZ4 += 0.5 * this.cStar[i] * this._k[i].z * currentDt * currentDt;
      }
      
      // Error estimation
      const errorX = Math.abs(newX - newX4);
      const errorY = Math.abs(newY - newY4);
      const errorZ = Math.abs(newZ - newZ4);
      const error = Math.max(errorX, errorY, errorZ);
      
      if (error < this.tolerance || currentDt <= this.minDt) {
        // Accept step
        body.position.set(newX, newY, newZ);
        body.velocity.set(newVx, newVy, newVz);
        timeRemaining -= currentDt;
        
        // Adjust timestep for next iteration
        if (error > 0) {
          currentDt *= 0.9 * Math.pow(this.tolerance / error, 0.2);
        } else {
          currentDt *= 2;
        }
        currentDt = Math.max(this.minDt, Math.min(this.maxDt, currentDt));
      } else {
        // Reject step, reduce timestep
        currentDt *= 0.9 * Math.pow(this.tolerance / error, 0.25);
        currentDt = Math.max(this.minDt, currentDt);
      }
    }
    
    // Validate
    body.position.validate(`${body.id}.position`);
    body.velocity.validate(`${body.id}.velocity`);
    
    return dt;
  }

  /**
   * Perform one integration step for all bodies
   * @param {Object[]} bodies 
   * @param {Object[]} massiveBodies 
   * @param {number} dt 
   */
  step(bodies, massiveBodies, dt) {
    for (const body of bodies) {
      this.stepBody(body, massiveBodies, dt);
    }
  }

  reset() {
    // No state to reset
  }
}

/**
 * Available integrator types
 */
export const IntegratorType = {
  VELOCITY_VERLET: 'velocity-verlet',
  RK45: 'rk45'
};

/**
 * Create an integrator by type
 * @param {string} type - Integrator type from IntegratorType
 * @param {Object} options - Options for the integrator
 * @returns {VelocityVerlet|AdaptiveRK45}
 */
export function createIntegrator(type, options = {}) {
  switch (type) {
    case IntegratorType.RK45:
      return new AdaptiveRK45(options.tolerance, options.minDt, options.maxDt);
    case IntegratorType.VELOCITY_VERLET:
    default:
      return new VelocityVerlet();
  }
}

export default {
  calculateAcceleration,
  VelocityVerlet,
  AdaptiveRK45,
  IntegratorType,
  createIntegrator
};
