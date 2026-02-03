/**
 * @nbody/physics-core
 * 
 * Isomorphic N-Body physics engine for space simulation
 * 
 * Features:
 * - Symplectic Velocity Verlet integrator for energy conservation
 * - Barnes-Hut octree for O(N log N) gravity calculations
 * - Adaptive RK45 integrator for close encounters
 * - Floating origin for numerical precision at astronomical scales
 * - Fixed timestep with accumulator pattern for determinism
 * 
 * @packageDocumentation
 */

// Engine
export * from './engine.js';

// Integrators
export * from './integrators/index.js';

// Gravity
export * from './gravity/index.js';

// Re-export shared types for convenience
export type {
  PhysicsConfig,
  CelestialBody,
  BodyCore,
  BodyState,
  BodyId,
  BodyType,
  CelestialType,
  IntegratorType,
  GravityAlgorithm,
  Vector3D,
  MutableVector3D
} from '@nbody/shared';
