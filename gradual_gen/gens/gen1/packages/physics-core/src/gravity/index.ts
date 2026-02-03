/**
 * Gravity Calculation Module
 * 
 * Provides different algorithms for computing gravitational interactions:
 * - Direct: O(N²) exact calculation
 * - Barnes-Hut: O(N log N) approximate using octree
 * 
 * @module gravity
 */

export * from './barnes-hut.js';

import type { GravityAlgorithm, BodyId } from '@nbody/shared';
import type { MutableVector3D, Vector3D } from '@nbody/shared';
import { BarnesHutTree, calculateDirectGravity, type OctreeBody } from './barnes-hut.js';

/**
 * Gravity calculator interface
 */
export interface GravityCalculator {
  /**
   * Prepare the calculator for a new frame
   * @param bodies - Current body states
   */
  prepare(bodies: OctreeBody[]): void;
  
  /**
   * Calculate acceleration at a position
   * @param position - Position to calculate at
   * @param excludeId - Body to exclude (self)
   */
  calculateAcceleration(position: Vector3D, excludeId?: BodyId): MutableVector3D;
  
  /**
   * Calculate accelerations for all bodies at once
   * More efficient for batch operations
   */
  calculateAllAccelerations(bodies: OctreeBody[]): Map<BodyId, MutableVector3D>;
}

/**
 * Barnes-Hut based gravity calculator
 */
export class BarnesHutGravityCalculator implements GravityCalculator {
  private readonly tree: BarnesHutTree;
  private bodies: OctreeBody[] = [];
  
  constructor(theta = 0.5, softening = 1000, maxDepth = 32) {
    this.tree = new BarnesHutTree(theta, softening, maxDepth);
  }
  
  prepare(bodies: OctreeBody[]): void {
    this.bodies = bodies;
    this.tree.build(bodies);
  }
  
  calculateAcceleration(position: Vector3D, excludeId?: BodyId): MutableVector3D {
    return this.tree.calculateAcceleration(position, excludeId);
  }
  
  calculateAllAccelerations(bodies: OctreeBody[]): Map<BodyId, MutableVector3D> {
    this.prepare(bodies);
    const result = new Map<BodyId, MutableVector3D>();
    
    for (const body of bodies) {
      result.set(body.id, this.calculateAcceleration(body.position, body.id));
    }
    
    return result;
  }
  
  getStats() {
    return this.tree.getStats();
  }
}

/**
 * Direct O(N²) gravity calculator
 */
export class DirectGravityCalculator implements GravityCalculator {
  private bodies: OctreeBody[] = [];
  private readonly softening: number;
  
  constructor(softening = 1000) {
    this.softening = softening;
  }
  
  prepare(bodies: OctreeBody[]): void {
    this.bodies = bodies;
  }
  
  calculateAcceleration(position: Vector3D, excludeId?: BodyId): MutableVector3D {
    return calculateDirectGravity(position, this.bodies, excludeId, this.softening);
  }
  
  calculateAllAccelerations(bodies: OctreeBody[]): Map<BodyId, MutableVector3D> {
    this.prepare(bodies);
    const result = new Map<BodyId, MutableVector3D>();
    
    for (const body of bodies) {
      result.set(body.id, this.calculateAcceleration(body.position, body.id));
    }
    
    return result;
  }
}

/**
 * Factory to create gravity calculator by algorithm type
 */
export function createGravityCalculator(
  algorithm: GravityAlgorithm,
  theta = 0.5,
  softening = 1000
): GravityCalculator {
  switch (algorithm) {
    case 'direct':
      return new DirectGravityCalculator(softening);
    case 'barnes-hut':
      return new BarnesHutGravityCalculator(theta, softening);
    case 'fmm':
      // FMM not implemented yet, fall back to Barnes-Hut
      console.warn('FMM not implemented, falling back to Barnes-Hut');
      return new BarnesHutGravityCalculator(theta * 0.7, softening);
    default:
      throw new Error(`Unknown gravity algorithm: ${algorithm}`);
  }
}
