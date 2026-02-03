/**
 * Integrator Type Definitions
 * 
 * @module integrators/types
 */

import type { MutableVector3D, Vector3D } from '@nbody/shared';

/**
 * State for a single body during integration
 */
export interface IntegrationState {
  /** Position in meters (mutated during integration) */
  position: MutableVector3D;
  
  /** Velocity in m/s (mutated during integration) */
  velocity: MutableVector3D;
  
  /** Current acceleration in m/s² (mutated during integration) */
  accel: MutableVector3D;
  
  /** Body mass in kg (constant, used for gravitational calculations) */
  mass: number;
  
  /** Gravitational parameter GM in m³/s² */
  mu: number;
  
  /** Body ID for reference */
  id: string;
}

/**
 * Function that computes acceleration at a given position
 */
export type AccelerationFunction = (position: Vector3D) => MutableVector3D;

/**
 * Function that computes accelerations for all bodies
 */
export type BatchAccelerationFunction = (positions: MutableVector3D[]) => MutableVector3D[];

/**
 * Integration result with optional error estimate
 */
export interface IntegrationResult {
  /** Whether integration succeeded */
  success: boolean;
  
  /** Number of function evaluations */
  evaluations: number;
  
  /** Estimated local truncation error (for adaptive methods) */
  error?: number;
  
  /** Suggested next timestep (for adaptive methods) */
  suggestedDt?: number;
}

/**
 * Base interface for all integrators
 */
export interface Integrator {
  /** Integrator name */
  readonly name: string;
  
  /** Order of accuracy */
  readonly order: number;
  
  /** Whether the integrator is symplectic */
  readonly isSymplectic: boolean;
  
  /**
   * Perform one integration step for a single body
   */
  step(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): void;
  
  /**
   * Perform integration step for multiple bodies
   * Optional batch operation for efficiency
   */
  stepBatch?(
    states: IntegrationState[],
    dt: number,
    accelerationBatch: BatchAccelerationFunction
  ): void;
}

/**
 * Interface for adaptive integrators with error control
 */
export interface AdaptiveIntegrator extends Integrator {
  /** Tolerance for error control */
  tolerance: number;
  
  /** Minimum allowed timestep */
  minDt: number;
  
  /** Maximum allowed timestep */
  maxDt: number;
  
  /**
   * Perform one adaptive step with error control
   * Returns the actual timestep used
   */
  adaptiveStep(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): IntegrationResult;
}
