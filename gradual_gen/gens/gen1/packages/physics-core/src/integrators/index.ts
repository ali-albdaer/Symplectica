/**
 * Integrators Module
 * 
 * Provides various numerical integration methods for N-body simulations:
 * - Velocity Verlet: Symplectic, energy-conserving, efficient
 * - RK45: Adaptive, high-accuracy for close encounters
 * 
 * @module integrators
 */

export * from './types.js';
export * from './verlet.js';
export * from './rk45.js';

import type { IntegratorType } from '@nbody/shared';
import type { Integrator, AdaptiveIntegrator } from './types.js';
import { createVerletIntegrator } from './verlet.js';
import { createRK45Integrator } from './rk45.js';

/**
 * Factory function to create an integrator by type
 */
export function createIntegrator(type: IntegratorType): Integrator | AdaptiveIntegrator {
  switch (type) {
    case 'velocity-verlet':
      return createVerletIntegrator();
    case 'rk4':
    case 'rk45':
      return createRK45Integrator();
    case 'gauss-radau':
      // Gauss-Radau is complex; use RK45 as fallback for now
      console.warn('Gauss-Radau not yet implemented, falling back to RK45');
      return createRK45Integrator(1e-12, 1e-9, 60);
    default:
      throw new Error(`Unknown integrator type: ${type}`);
  }
}
