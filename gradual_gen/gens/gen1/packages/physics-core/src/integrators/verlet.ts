/**
 * Velocity Verlet Integrator (Störmer-Verlet)
 * 
 * A symplectic integrator that conserves energy in Hamiltonian systems.
 * Second-order accurate: O(dt²)
 * 
 * Algorithm:
 * 1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
 * 2. Calculate a(t+dt) from new positions
 * 3. v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
 * 
 * Properties:
 * - Time-reversible
 * - Symplectic (preserves phase space volume)
 * - Good long-term energy conservation
 * - Simple and efficient
 * 
 * @module integrators/verlet
 */

import { Vec3 } from '@nbody/shared';
import type { MutableVector3D } from '@nbody/shared';
import type { IntegrationState, Integrator, AccelerationFunction } from './types.js';

/**
 * Velocity Verlet integrator implementation
 */
export class VelocityVerletIntegrator implements Integrator {
  public readonly name = 'velocity-verlet';
  public readonly order = 2;
  public readonly isSymplectic = true;

  /**
   * Perform one integration step
   * 
   * @param state - Current state (will be mutated)
   * @param dt - Time step in seconds
   * @param acceleration - Function to compute acceleration at a position
   */
  step(
    state: IntegrationState,
    dt: number,
    acceleration: AccelerationFunction
  ): void {
    const { position, velocity, accel } = state;
    const halfDt = dt * 0.5;
    const halfDtSq = halfDt * dt;

    // Step 1: Update position using current velocity and acceleration
    // x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
    position.x += velocity.x * dt + accel.x * halfDtSq;
    position.y += velocity.y * dt + accel.y * halfDtSq;
    position.z += velocity.z * dt + accel.z * halfDtSq;

    // Step 2: Update velocity halfway using current acceleration
    // v_half = v(t) + 0.5*a(t)*dt
    velocity.x += accel.x * halfDt;
    velocity.y += accel.y * halfDt;
    velocity.z += accel.z * halfDt;

    // Step 3: Calculate new acceleration at new position
    const newAccel = acceleration(position);
    accel.x = newAccel.x;
    accel.y = newAccel.y;
    accel.z = newAccel.z;

    // Step 4: Complete velocity update with new acceleration
    // v(t+dt) = v_half + 0.5*a(t+dt)*dt
    velocity.x += accel.x * halfDt;
    velocity.y += accel.y * halfDt;
    velocity.z += accel.z * halfDt;
  }

  /**
   * Perform integration step for array of bodies (batch operation)
   * More efficient for N-body simulations
   * 
   * @param states - Array of states to integrate
   * @param dt - Time step in seconds
   * @param accelerationBatch - Function to compute all accelerations
   */
  stepBatch(
    states: IntegrationState[],
    dt: number,
    accelerationBatch: (positions: MutableVector3D[]) => MutableVector3D[]
  ): void {
    const n = states.length;
    const halfDt = dt * 0.5;
    const halfDtSq = halfDt * dt;

    // Step 1: Update all positions
    for (let i = 0; i < n; i++) {
      const state = states[i]!;
      const { position, velocity, accel } = state;
      
      position.x += velocity.x * dt + accel.x * halfDtSq;
      position.y += velocity.y * dt + accel.y * halfDtSq;
      position.z += velocity.z * dt + accel.z * halfDtSq;
      
      // Update velocity halfway
      velocity.x += accel.x * halfDt;
      velocity.y += accel.y * halfDt;
      velocity.z += accel.z * halfDt;
    }

    // Step 2: Calculate all new accelerations
    const positions = states.map(s => s.position);
    const newAccels = accelerationBatch(positions);

    // Step 3: Complete velocity updates
    for (let i = 0; i < n; i++) {
      const state = states[i]!;
      const newAccel = newAccels[i]!;
      const { velocity, accel } = state;
      
      // Store new acceleration
      accel.x = newAccel.x;
      accel.y = newAccel.y;
      accel.z = newAccel.z;
      
      // Complete velocity update
      velocity.x += accel.x * halfDt;
      velocity.y += accel.y * halfDt;
      velocity.z += accel.z * halfDt;
    }
  }
}

/**
 * Create a new Velocity Verlet integrator instance
 */
export function createVerletIntegrator(): Integrator {
  return new VelocityVerletIntegrator();
}
