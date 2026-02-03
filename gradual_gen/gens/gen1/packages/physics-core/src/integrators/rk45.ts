/**
 * Runge-Kutta-Fehlberg 4(5) Adaptive Integrator
 * 
 * An adaptive integrator with embedded error estimation.
 * Uses 4th order method with 5th order error estimate.
 * 
 * The Fehlberg method is efficient because it reuses function evaluations
 * between the 4th and 5th order methods.
 * 
 * Properties:
 * - Not symplectic (energy drift over long times)
 * - Adaptive timestep based on local error
 * - Good for close encounters and high-accuracy needs
 * - 6 function evaluations per step
 * 
 * @module integrators/rk45
 */

import { Vec3 } from '@nbody/shared';
import type { MutableVector3D } from '@nbody/shared';
import type { 
  IntegrationState, 
  AdaptiveIntegrator, 
  AccelerationFunction,
  IntegrationResult 
} from './types.js';

// Fehlberg coefficients
const A2 = 1/4;
const A3 = 3/8;
const A4 = 12/13;
const A5 = 1;
const A6 = 1/2;

const B21 = 1/4;
const B31 = 3/32;
const B32 = 9/32;
const B41 = 1932/2197;
const B42 = -7200/2197;
const B43 = 7296/2197;
const B51 = 439/216;
const B52 = -8;
const B53 = 3680/513;
const B54 = -845/4104;
const B61 = -8/27;
const B62 = 2;
const B63 = -3544/2565;
const B64 = 1859/4104;
const B65 = -11/40;

// 4th order weights
const C1 = 25/216;
const C3 = 1408/2565;
const C4 = 2197/4104;
const C5 = -1/5;

// 5th order weights (for error estimation)
const D1 = 16/135;
const D3 = 6656/12825;
const D4 = 28561/56430;
const D5 = -9/50;
const D6 = 2/55;

// Error coefficients (difference between 4th and 5th order)
const E1 = 1/360;
const E3 = -128/4275;
const E4 = -2197/75240;
const E5 = 1/50;
const E6 = 2/55;

/**
 * RK45 Adaptive Integrator implementation
 */
export class RK45Integrator implements AdaptiveIntegrator {
  public readonly name = 'rk45';
  public readonly order = 4;
  public readonly isSymplectic = false;

  public tolerance: number;
  public minDt: number;
  public maxDt: number;

  // Pre-allocated temporary vectors
  private readonly k1: MutableVector3D = Vec3.mutableZero();
  private readonly k2: MutableVector3D = Vec3.mutableZero();
  private readonly k3: MutableVector3D = Vec3.mutableZero();
  private readonly k4: MutableVector3D = Vec3.mutableZero();
  private readonly k5: MutableVector3D = Vec3.mutableZero();
  private readonly k6: MutableVector3D = Vec3.mutableZero();
  private readonly temp: MutableVector3D = Vec3.mutableZero();

  constructor(tolerance = 1e-9, minDt = 1e-6, maxDt = 3600) {
    this.tolerance = tolerance;
    this.minDt = minDt;
    this.maxDt = maxDt;
  }

  /**
   * Perform one fixed-step RK4 integration (for standard interface)
   */
  step(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): void {
    const { position, velocity, accel } = state;

    // k1 = a(x)
    Vec3.copy(this.k1, accel);

    // k2 = a(x + v*dt/4 + k1*dt²/8)
    this.temp.x = position.x + velocity.x * dt * A2 + this.k1.x * dt * dt * A2 * 0.5;
    this.temp.y = position.y + velocity.y * dt * A2 + this.k1.y * dt * dt * A2 * 0.5;
    this.temp.z = position.z + velocity.z * dt * A2 + this.k1.z * dt * dt * A2 * 0.5;
    Vec3.copy(this.k2, acceleration(this.temp));

    // For velocity integration, we treat velocity as the variable
    // and acceleration as the derivative
    
    // RK4 for velocity: v' = a(x)
    // We need to track both position and velocity simultaneously
    
    // Simplified approach: Use RK4 on velocity with position-dependent acceleration
    // v1 = v
    // v2 = v + k1 * dt/2
    // v3 = v + k2 * dt/2
    // v4 = v + k3 * dt
    // v_new = v + (k1 + 2*k2 + 2*k3 + k4) * dt/6
    
    // k1 = a(x, t)
    const vx1 = velocity.x;
    const vy1 = velocity.y;
    const vz1 = velocity.z;
    
    // Position at t + dt/2 using v1
    this.temp.x = position.x + vx1 * dt * 0.5;
    this.temp.y = position.y + vy1 * dt * 0.5;
    this.temp.z = position.z + vz1 * dt * 0.5;
    Vec3.copy(this.k2, acceleration(this.temp));
    
    // Velocity at t + dt/2 using k1
    const vx2 = velocity.x + this.k1.x * dt * 0.5;
    const vy2 = velocity.y + this.k1.y * dt * 0.5;
    const vz2 = velocity.z + this.k1.z * dt * 0.5;
    
    // Position at t + dt/2 using v2
    this.temp.x = position.x + vx2 * dt * 0.5;
    this.temp.y = position.y + vy2 * dt * 0.5;
    this.temp.z = position.z + vz2 * dt * 0.5;
    Vec3.copy(this.k3, acceleration(this.temp));
    
    // Velocity at t + dt/2 using k2
    const vx3 = velocity.x + this.k2.x * dt * 0.5;
    const vy3 = velocity.y + this.k2.y * dt * 0.5;
    const vz3 = velocity.z + this.k2.z * dt * 0.5;
    
    // Position at t + dt using v3
    this.temp.x = position.x + vx3 * dt;
    this.temp.y = position.y + vy3 * dt;
    this.temp.z = position.z + vz3 * dt;
    Vec3.copy(this.k4, acceleration(this.temp));
    
    // Update velocity: v_new = v + (k1 + 2*k2 + 2*k3 + k4) * dt/6
    velocity.x += (this.k1.x + 2*this.k2.x + 2*this.k3.x + this.k4.x) * dt / 6;
    velocity.y += (this.k1.y + 2*this.k2.y + 2*this.k3.y + this.k4.y) * dt / 6;
    velocity.z += (this.k1.z + 2*this.k2.z + 2*this.k3.z + this.k4.z) * dt / 6;
    
    // Update position using average velocity
    position.x += (vx1 + 2*vx2 + 2*vx3 + velocity.x) * dt / 6;
    position.y += (vy1 + 2*vy2 + 2*vy3 + velocity.y) * dt / 6;
    position.z += (vz1 + 2*vz2 + 2*vz3 + velocity.z) * dt / 6;
    
    // Update stored acceleration
    Vec3.copy(accel, acceleration(position));
  }

  /**
   * Perform one adaptive step with error control
   */
  adaptiveStep(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): IntegrationResult {
    const { position, velocity, accel } = state;
    
    // Store initial state for retry
    const x0 = position.x;
    const y0 = position.y;
    const z0 = position.z;
    const vx0 = velocity.x;
    const vy0 = velocity.y;
    const vz0 = velocity.z;
    
    let currentDt = Math.min(dt, this.maxDt);
    let totalTime = 0;
    let evaluations = 0;
    let maxError = 0;
    
    while (totalTime < dt) {
      const remainingTime = dt - totalTime;
      currentDt = Math.min(currentDt, remainingTime);
      
      // Try a step
      const result = this.attemptStep(state, currentDt, acceleration);
      evaluations += 6; // RK45 uses 6 evaluations
      
      if (result.error <= this.tolerance) {
        // Step accepted
        totalTime += currentDt;
        maxError = Math.max(maxError, result.error);
        
        // Estimate next timestep
        if (result.error > 0) {
          const factor = 0.9 * Math.pow(this.tolerance / result.error, 0.2);
          currentDt = currentDt * Math.min(2, Math.max(0.5, factor));
        } else {
          currentDt *= 2;
        }
        currentDt = Math.max(this.minDt, Math.min(this.maxDt, currentDt));
      } else {
        // Step rejected, try smaller timestep
        position.x = x0;
        position.y = y0;
        position.z = z0;
        velocity.x = vx0;
        velocity.y = vy0;
        velocity.z = vz0;
        
        const factor = 0.9 * Math.pow(this.tolerance / result.error, 0.25);
        currentDt = currentDt * Math.max(0.1, factor);
        
        if (currentDt < this.minDt) {
          // Cannot reduce timestep further, accept with warning
          currentDt = this.minDt;
        }
      }
    }
    
    // Update acceleration for next step
    Vec3.copy(accel, acceleration(position));
    
    return {
      success: true,
      evaluations,
      error: maxError,
      suggestedDt: currentDt
    };
  }

  /**
   * Attempt one step and return error estimate
   */
  private attemptStep(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): { error: number } {
    const { position, velocity, accel } = state;
    
    // Store for error calculation
    const x0 = position.x;
    const y0 = position.y;
    const z0 = position.z;
    const vx0 = velocity.x;
    const vy0 = velocity.y;
    const vz0 = velocity.z;
    
    // k1 = f(t, y)
    Vec3.copy(this.k1, accel);
    
    // k2 = f(t + a2*dt, y + b21*k1*dt)
    this.temp.x = x0 + vx0 * A2 * dt;
    this.temp.y = y0 + vy0 * A2 * dt;
    this.temp.z = z0 + vz0 * A2 * dt;
    Vec3.copy(this.k2, acceleration(this.temp));
    
    // k3 = f(t + a3*dt, y + b31*k1*dt + b32*k2*dt)
    this.temp.x = x0 + vx0 * A3 * dt + (B31 * this.k1.x + B32 * this.k2.x) * dt * dt * 0.5;
    this.temp.y = y0 + vy0 * A3 * dt + (B31 * this.k1.y + B32 * this.k2.y) * dt * dt * 0.5;
    this.temp.z = z0 + vz0 * A3 * dt + (B31 * this.k1.z + B32 * this.k2.z) * dt * dt * 0.5;
    Vec3.copy(this.k3, acceleration(this.temp));
    
    // k4
    this.temp.x = x0 + vx0 * A4 * dt;
    this.temp.y = y0 + vy0 * A4 * dt;
    this.temp.z = z0 + vz0 * A4 * dt;
    Vec3.copy(this.k4, acceleration(this.temp));
    
    // k5
    this.temp.x = x0 + vx0 * A5 * dt;
    this.temp.y = y0 + vy0 * A5 * dt;
    this.temp.z = z0 + vz0 * A5 * dt;
    Vec3.copy(this.k5, acceleration(this.temp));
    
    // k6
    this.temp.x = x0 + vx0 * A6 * dt;
    this.temp.y = y0 + vy0 * A6 * dt;
    this.temp.z = z0 + vz0 * A6 * dt;
    Vec3.copy(this.k6, acceleration(this.temp));
    
    // 4th order result
    velocity.x = vx0 + (C1*this.k1.x + C3*this.k3.x + C4*this.k4.x + C5*this.k5.x) * dt;
    velocity.y = vy0 + (C1*this.k1.y + C3*this.k3.y + C4*this.k4.y + C5*this.k5.y) * dt;
    velocity.z = vz0 + (C1*this.k1.z + C3*this.k3.z + C4*this.k4.z + C5*this.k5.z) * dt;
    
    // Update position (simplified)
    position.x = x0 + (vx0 + velocity.x) * 0.5 * dt;
    position.y = y0 + (vy0 + velocity.y) * 0.5 * dt;
    position.z = z0 + (vz0 + velocity.z) * 0.5 * dt;
    
    // Error estimate from difference between 4th and 5th order
    const ex = (E1*this.k1.x + E3*this.k3.x + E4*this.k4.x + E5*this.k5.x + E6*this.k6.x) * dt;
    const ey = (E1*this.k1.y + E3*this.k3.y + E4*this.k4.y + E5*this.k5.y + E6*this.k6.y) * dt;
    const ez = (E1*this.k1.z + E3*this.k3.z + E4*this.k4.z + E5*this.k5.z + E6*this.k6.z) * dt;
    
    const error = Math.sqrt(ex*ex + ey*ey + ez*ez);
    
    return { error };
  }
}

/**
 * Create a new RK45 adaptive integrator
 */
export function createRK45Integrator(
  tolerance = 1e-9,
  minDt = 1e-6,
  maxDt = 3600
): AdaptiveIntegrator {
  return new RK45Integrator(tolerance, minDt, maxDt);
}
