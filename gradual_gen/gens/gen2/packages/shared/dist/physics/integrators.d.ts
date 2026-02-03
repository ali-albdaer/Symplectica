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
export type AccelerationFunction = (body: CelestialBody, position: Vector3, velocity: Vector3, time: number) => Vector3;
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
    step(body: CelestialBody, dt: number, time: number, getAcceleration: AccelerationFunction): void;
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
export declare class VelocityVerletIntegrator implements Integrator {
    readonly name = "Velocity Verlet";
    readonly order = 2;
    readonly isSymplectic = true;
    private prevAccelerations;
    step(body: CelestialBody, dt: number, time: number, getAcceleration: AccelerationFunction): void;
    /**
     * Clear cached accelerations (call when bodies change)
     */
    clearCache(): void;
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
export declare class RungeKutta4Integrator implements Integrator {
    readonly name = "Runge-Kutta 4";
    readonly order = 4;
    readonly isSymplectic = false;
    step(body: CelestialBody, dt: number, time: number, getAcceleration: AccelerationFunction): void;
}
/**
 * Adaptive RK45 (Dormand-Prince) Integrator
 * ==========================================
 * Fifth-order method with fourth-order error estimate.
 * Automatically adjusts step size for accuracy.
 *
 * Use for close encounters where fixed step may be unstable.
 */
export declare class AdaptiveRK45Integrator implements Integrator {
    readonly name = "Adaptive RK45 (Dormand-Prince)";
    readonly order = 5;
    readonly isSymplectic = false;
    private tolerance;
    private minDt;
    private maxDt;
    private static readonly c;
    private static readonly a;
    private static readonly b5;
    private static readonly b4;
    constructor(tolerance?: number, minDt?: number, maxDt?: number);
    step(body: CelestialBody, dt: number, time: number, getAcceleration: AccelerationFunction): void;
    private adaptiveStep;
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
export declare class GaussRadauIntegrator implements Integrator {
    readonly name = "Gauss-Radau (IAS15)";
    readonly order = 15;
    readonly isSymplectic = false;
    private _tolerance;
    private _minDt;
    private static readonly h;
    constructor(tolerance?: number, minDt?: number);
    /** Get tolerance for adaptive stepping */
    get tolerance(): number;
    /** Get minimum timestep */
    get minDt(): number;
    step(body: CelestialBody, dt: number, time: number, getAcceleration: AccelerationFunction): void;
}
/**
 * Create an integrator by name
 */
export declare function createIntegrator(name: string): Integrator;
//# sourceMappingURL=integrators.d.ts.map