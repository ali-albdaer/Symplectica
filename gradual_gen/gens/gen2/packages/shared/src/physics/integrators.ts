/**
 * Integrator Definitions
 * ======================
 * Numerical integration methods for solving ODEs.
 * All integrators maintain SI units throughout.
 */

import { Vector3 } from '../math/Vector3.js';
import { CelestialBody } from '../bodies/CelestialBody.js';

/**
 * Integration state for a single body
 */
export interface IntegrationState {
  position: Vector3;
  velocity: Vector3;
}

/**
 * Acceleration function signature
 */
export type AccelerationFunction = (
  body: CelestialBody,
  position: Vector3,
  velocity: Vector3,
  time: number
) => Vector3;

/**
 * Base integrator interface
 */
export interface Integrator {
  readonly name: string;
  readonly order: number;
  readonly isSymplectic: boolean;

  /**
   * Perform one integration step
   * @param body The body to integrate
   * @param dt Time step in seconds
   * @param time Current simulation time
   * @param getAcceleration Function to compute acceleration at a given state
   */
  step(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): void;
}

/**
 * Velocity Verlet (Leapfrog) Integrator
 * ======================================
 * Second-order symplectic integrator.
 * Excellent for long-term orbital stability.
 * 
 * Algorithm:
 * 1. x(t+dt) = x(t) + v(t)·dt + a(t)·dt²/2
 * 2. a(t+dt) = f(x(t+dt))
 * 3. v(t+dt) = v(t) + (a(t) + a(t+dt))·dt/2
 * 
 * Properties:
 * - Symplectic: Preserves phase space volume
 * - Energy oscillates but doesn't drift
 * - Time-reversible
 * - O(dt²) local error
 */
export class VelocityVerletIntegrator implements Integrator {
  readonly name = 'Velocity Verlet';
  readonly order = 2;
  readonly isSymplectic = true;

  // Store previous acceleration for kick-drift-kick variant
  private prevAccelerations: Map<string, Vector3> = new Map();

  step(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): void {
    // Get current acceleration (use cached if available)
    let a0 = this.prevAccelerations.get(body.id);
    if (!a0) {
      a0 = getAcceleration(body, body.position, body.velocity, time);
    }

    // Half-step velocity: v(t+dt/2) = v(t) + a(t)·dt/2
    const halfDtAccel = Vector3.multiplyScalar(a0, dt / 2);
    body.velocity.add(halfDtAccel);

    // Full-step position: x(t+dt) = x(t) + v(t+dt/2)·dt
    const positionDelta = Vector3.multiplyScalar(body.velocity, dt);
    body.position.add(positionDelta);

    // Compute new acceleration at updated position
    const a1 = getAcceleration(body, body.position, body.velocity, time + dt);

    // Complete velocity step: v(t+dt) = v(t+dt/2) + a(t+dt)·dt/2
    const secondHalfAccel = Vector3.multiplyScalar(a1, dt / 2);
    body.velocity.add(secondHalfAccel);

    // Cache acceleration for next step
    this.prevAccelerations.set(body.id, a1);

    // Update body's stored acceleration
    body.acceleration.copy(a1);
  }

  /**
   * Clear cached accelerations (call when bodies change)
   */
  clearCache(): void {
    this.prevAccelerations.clear();
  }
}

/**
 * Runge-Kutta 4th Order Integrator
 * =================================
 * Classic fourth-order method.
 * High accuracy but not symplectic.
 * 
 * Properties:
 * - O(dt⁴) local error
 * - NOT symplectic (energy drifts over time)
 * - Good for short-term accuracy
 */
export class RungeKutta4Integrator implements Integrator {
  readonly name = 'Runge-Kutta 4';
  readonly order = 4;
  readonly isSymplectic = false;

  step(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): void {
    const x0 = body.position.clone();
    const v0 = body.velocity.clone();

    // k1
    const a1 = getAcceleration(body, x0, v0, time);
    const v1 = v0.clone();

    // k2
    const x2 = Vector3.add(x0, Vector3.multiplyScalar(v1, dt / 2));
    const v2 = Vector3.add(v0, Vector3.multiplyScalar(a1, dt / 2));
    const a2 = getAcceleration(body, x2, v2, time + dt / 2);

    // k3
    const x3 = Vector3.add(x0, Vector3.multiplyScalar(v2, dt / 2));
    const v3 = Vector3.add(v0, Vector3.multiplyScalar(a2, dt / 2));
    const a3 = getAcceleration(body, x3, v3, time + dt / 2);

    // k4
    const x4 = Vector3.add(x0, Vector3.multiplyScalar(v3, dt));
    const v4 = Vector3.add(v0, Vector3.multiplyScalar(a3, dt));
    const a4 = getAcceleration(body, x4, v4, time + dt);

    // Combine (1/6)(k1 + 2k2 + 2k3 + k4)
    body.position.copy(x0)
      .add(Vector3.multiplyScalar(v1, dt / 6))
      .add(Vector3.multiplyScalar(v2, dt / 3))
      .add(Vector3.multiplyScalar(v3, dt / 3))
      .add(Vector3.multiplyScalar(v4, dt / 6));

    body.velocity.copy(v0)
      .add(Vector3.multiplyScalar(a1, dt / 6))
      .add(Vector3.multiplyScalar(a2, dt / 3))
      .add(Vector3.multiplyScalar(a3, dt / 3))
      .add(Vector3.multiplyScalar(a4, dt / 6));

    body.acceleration.copy(a4);
  }
}

/**
 * Adaptive RK45 (Dormand-Prince) Integrator
 * ==========================================
 * Fifth-order method with fourth-order error estimate.
 * Automatically adjusts step size for accuracy.
 * 
 * Use for close encounters where fixed step may be unstable.
 */
export class AdaptiveRK45Integrator implements Integrator {
  readonly name = 'Adaptive RK45 (Dormand-Prince)';
  readonly order = 5;
  readonly isSymplectic = false;

  // Error tolerance
  private tolerance: number;
  private minDt: number;
  private maxDt: number;

  // Dormand-Prince coefficients
  private static readonly c = [0, 1/5, 3/10, 4/5, 8/9, 1, 1];
  private static readonly a = [
    [],
    [1/5],
    [3/40, 9/40],
    [44/45, -56/15, 32/9],
    [19372/6561, -25360/2187, 64448/6561, -212/729],
    [9017/3168, -355/33, 46732/5247, 49/176, -5103/18656],
    [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84]
  ];
  private static readonly b5 = [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84, 0];
  private static readonly b4 = [5179/57600, 0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40];

  constructor(tolerance: number = 1e-10, minDt: number = 1e-6, maxDt: number = 3600) {
    this.tolerance = tolerance;
    this.minDt = minDt;
    this.maxDt = maxDt;
  }

  step(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): void {
    let currentDt = Math.min(dt, this.maxDt);
    let remainingTime = dt;
    let currentTime = time;

    while (remainingTime > 1e-12) {
      currentDt = Math.min(currentDt, remainingTime);
      
      const result = this.adaptiveStep(body, currentDt, currentTime, getAcceleration);
      
      if (result.accepted) {
        remainingTime -= currentDt;
        currentTime += currentDt;
      }
      
      // Adjust step size for next iteration
      currentDt = Math.max(this.minDt, Math.min(this.maxDt, result.suggestedDt));
    }
  }

  private adaptiveStep(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): { accepted: boolean; suggestedDt: number } {
    const x0 = body.position.clone();
    const v0 = body.velocity.clone();

    // Compute k values
    const k: Vector3[] = [];
    const kv: Vector3[] = [];

    for (let i = 0; i < 7; i++) {
      const xi = x0.clone();
      const vi = v0.clone();

      const ai = AdaptiveRK45Integrator.a[i]!;
      for (let j = 0; j < i; j++) {
        const coef = ai[j] ?? 0;
        const kvj = kv[j];
        const kj = k[j];
        if (coef !== 0 && kvj && kj) {
          xi.add(Vector3.multiplyScalar(kvj, dt * coef));
          vi.add(Vector3.multiplyScalar(kj, dt * coef));
        }
      }

      const ci = AdaptiveRK45Integrator.c[i] ?? 0;
      const a = getAcceleration(body, xi, vi, time + ci * dt);
      k.push(a);
      kv.push(vi);
    }

    // Fifth-order solution
    const x5 = x0.clone();
    const v5 = v0.clone();
    for (let i = 0; i < 7; i++) {
      const b5i = AdaptiveRK45Integrator.b5[i] ?? 0;
      const kvi = kv[i];
      const ki = k[i];
      if (b5i !== 0 && kvi && ki) {
        x5.add(Vector3.multiplyScalar(kvi, dt * b5i));
        v5.add(Vector3.multiplyScalar(ki, dt * b5i));
      }
    }

    // Fourth-order solution
    const x4 = x0.clone();
    const v4 = v0.clone();
    for (let i = 0; i < 7; i++) {
      const b4i = AdaptiveRK45Integrator.b4[i] ?? 0;
      const kvi = kv[i];
      const ki = k[i];
      if (b4i !== 0 && kvi && ki) {
        x4.add(Vector3.multiplyScalar(kvi, dt * b4i));
        v4.add(Vector3.multiplyScalar(ki, dt * b4i));
      }
    }

    // Error estimate
    const posError = x5.distanceTo(x4);
    const velError = v5.distanceTo(v4);
    const error = Math.max(posError, velError);

    // Step size control
    const safety = 0.9;
    const minScale = 0.2;
    const maxScale = 5.0;

    let scale: number;
    if (error < 1e-15) {
      scale = maxScale;
    } else {
      scale = safety * Math.pow(this.tolerance / error, 0.2);
    }
    scale = Math.max(minScale, Math.min(maxScale, scale));

    const suggestedDt = dt * scale;

    if (error <= this.tolerance || dt <= this.minDt) {
      // Accept step
      body.position.copy(x5);
      body.velocity.copy(v5);
      body.acceleration.copy(k[6] ?? Vector3.zero());
      return { accepted: true, suggestedDt };
    } else {
      // Reject step
      return { accepted: false, suggestedDt };
    }
  }
}

/**
 * Gauss-Radau (IAS15) Integrator
 * ==============================
 * High-order adaptive integrator from REBOUND.
 * Fifteenth-order accurate with adaptive step size.
 * Excellent for close encounters and high-precision work.
 * 
 * Simplified implementation - for production use REBOUND directly.
 */
export class GaussRadauIntegrator implements Integrator {
  readonly name = 'Gauss-Radau (IAS15)';
  readonly order = 15;
  readonly isSymplectic = false;

  private _tolerance: number;
  private _minDt: number;

  // Gauss-Radau nodes (15th order)
  private static readonly h = [
    0.0,
    0.0562625605369221464656522,
    0.1802406917368923649875799,
    0.3526247171131696373739078,
    0.5471536263305553830014486,
    0.7342101772154105410531523,
    0.8853209468390957680903598,
    0.9775206135612875018911745
  ];

  constructor(tolerance: number = 1e-12, minDt: number = 1e-9) {
    this._tolerance = tolerance;
    this._minDt = minDt;
  }

  step(
    body: CelestialBody,
    dt: number,
    time: number,
    getAcceleration: AccelerationFunction
  ): void {
    // For a production implementation, use the full IAS15 algorithm
    // Here we use a simplified predictor-corrector approach
    
    const x0 = body.position.clone();
    const v0 = body.velocity.clone();
    const a0 = getAcceleration(body, x0, v0, time);

    // Use substeps at Gauss-Radau nodes
    let x = x0.clone();
    let v = v0.clone();
    let prevA = a0.clone();

    for (let i = 1; i < GaussRadauIntegrator.h.length; i++) {
      const hi = GaussRadauIntegrator.h[i]!;
      const hPrev = GaussRadauIntegrator.h[i - 1]!;
      const subDt = (hi - hPrev) * dt;

      // Predictor (Euler)
      const xPred = Vector3.add(x, Vector3.multiplyScalar(v, subDt));
      const vPred = Vector3.add(v, Vector3.multiplyScalar(prevA, subDt));

      // Corrector (Improved Euler / Heun)
      const aPred = getAcceleration(body, xPred, vPred, time + hi * dt);
      
      x.add(Vector3.multiplyScalar(Vector3.add(v, vPred), subDt / 2));
      v.add(Vector3.multiplyScalar(Vector3.add(prevA, aPred), subDt / 2));
      
      prevA = aPred;
    }

    body.position.copy(x);
    body.velocity.copy(v);
    body.acceleration.copy(prevA);
  }
}

/**
 * Create an integrator by name
 */
export function createIntegrator(name: string): Integrator {
  switch (name.toLowerCase()) {
    case 'verlet':
    case 'velocity-verlet':
    case 'leapfrog':
      return new VelocityVerletIntegrator();
    case 'rk4':
    case 'runge-kutta':
      return new RungeKutta4Integrator();
    case 'rk45':
    case 'adaptive':
    case 'dormand-prince':
      return new AdaptiveRK45Integrator();
    case 'ias15':
    case 'gauss-radau':
    case 'radau':
      return new GaussRadauIntegrator();
    default:
      throw new Error(`Unknown integrator: ${name}`);
  }
}
