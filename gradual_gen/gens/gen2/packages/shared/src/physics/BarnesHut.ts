/**
 * Barnes-Hut Octree for N-Body Gravity
 * =====================================
 * Hierarchical tree structure for O(N log N) gravity calculation.
 * 
 * Algorithm:
 * 1. Build octree by inserting all bodies
 * 2. For each body, walk the tree
 * 3. If a node is "far enough" (theta criterion), treat it as single mass
 * 4. Otherwise, recurse into children
 * 
 * Theta parameter: Controls accuracy vs speed tradeoff
 * - theta = 0: Exact O(N²) calculation
 * - theta ≈ 0.5: Good balance
 * - theta > 1: Fast but less accurate
 */

import { Vector3 } from '../math/Vector3.js';
import { CelestialBody } from '../bodies/CelestialBody.js';
import { G, BARNES_HUT_THETA } from '../constants.js';

/**
 * Axis-aligned bounding box
 */
export interface BoundingBox {
  min: Vector3;
  max: Vector3;
}

/**
 * Octree node representing a region of space
 */
export class OctreeNode {
  // Bounds of this node
  public readonly center: Vector3;
  public readonly halfSize: number;

  // Mass properties (for multipole approximation)
  public totalMass: number = 0;
  public centerOfMass: Vector3 = Vector3.zero();

  // Softening (maximum of contained bodies)
  public softening: number = 0;

  // Children (null if leaf)
  public children: (OctreeNode | null)[] | null = null;

  // Body in this node (only for leaves with single body)
  public body: CelestialBody | null = null;

  // Number of bodies in subtree
  public bodyCount: number = 0;

  constructor(center: Vector3, halfSize: number) {
    this.center = center;
    this.halfSize = halfSize;
  }

  /**
   * Check if this node is a leaf (no children)
   */
  get isLeaf(): boolean {
    return this.children === null;
  }

  /**
   * Check if this node is empty
   */
  get isEmpty(): boolean {
    return this.bodyCount === 0;
  }

  /**
   * Check if this node is external (leaf with one body)
   */
  get isExternal(): boolean {
    return this.isLeaf && this.body !== null;
  }

  /**
   * Get octant index for a position (0-7)
   */
  getOctant(position: Vector3): number {
    let index = 0;
    if (position.x >= this.center.x) index |= 1;
    if (position.y >= this.center.y) index |= 2;
    if (position.z >= this.center.z) index |= 4;
    return index;
  }

  /**
   * Get center of a child octant
   */
  getChildCenter(octant: number): Vector3 {
    const offset = this.halfSize / 2;
    return new Vector3(
      this.center.x + ((octant & 1) ? offset : -offset),
      this.center.y + ((octant & 2) ? offset : -offset),
      this.center.z + ((octant & 4) ? offset : -offset)
    );
  }

  /**
   * Create children array
   */
  private createChildren(): void {
    this.children = new Array(8).fill(null);
  }

  /**
   * Get or create child at octant
   */
  private getOrCreateChild(octant: number): OctreeNode {
    if (!this.children) {
      this.createChildren();
    }

    let child = this.children![octant];
    if (!child) {
      child = new OctreeNode(
        this.getChildCenter(octant),
        this.halfSize / 2
      );
      this.children![octant] = child;
    }
    return child;
  }

  /**
   * Insert a body into this node
   */
  insert(body: CelestialBody): void {
    if (this.isEmpty) {
      // Empty node - just store the body
      this.body = body;
      this.bodyCount = 1;
      this.totalMass = body.mass;
      this.centerOfMass = body.position.clone();
      this.softening = body.softening;
      return;
    }

    if (this.isExternal) {
      // Node has one body - need to subdivide
      const existingBody = this.body!;
      this.body = null;

      // Re-insert existing body into appropriate child
      const existingOctant = this.getOctant(existingBody.position);
      this.getOrCreateChild(existingOctant).insert(existingBody);
    }

    // Insert new body into appropriate child
    const octant = this.getOctant(body.position);
    this.getOrCreateChild(octant).insert(body);

    // Update mass properties
    this.updateMassProperties(body);
  }

  /**
   * Update center of mass and total mass after insertion
   */
  private updateMassProperties(newBody: CelestialBody): void {
    const oldMass = this.totalMass;
    const newMass = oldMass + newBody.mass;

    if (newMass > 0) {
      // Weighted average for center of mass
      this.centerOfMass = new Vector3(
        (this.centerOfMass.x * oldMass + newBody.position.x * newBody.mass) / newMass,
        (this.centerOfMass.y * oldMass + newBody.position.y * newBody.mass) / newMass,
        (this.centerOfMass.z * oldMass + newBody.position.z * newBody.mass) / newMass
      );
    }

    this.totalMass = newMass;
    this.bodyCount++;
    this.softening = Math.max(this.softening, newBody.softening);
  }

  /**
   * Calculate gravitational acceleration on a body using Barnes-Hut
   * @param body Target body
   * @param theta Opening angle parameter
   * @returns Acceleration vector
   */
  calculateAcceleration(body: CelestialBody, theta: number): Vector3 {
    if (this.isEmpty) {
      return Vector3.zero();
    }

    // Don't compute self-gravity
    if (this.isExternal && this.body === body) {
      return Vector3.zero();
    }

    // Vector from body to center of mass
    const direction = Vector3.sub(this.centerOfMass, body.position);
    const distSq = direction.lengthSquared();
    const distance = Math.sqrt(distSq);

    // Check if we can use multipole approximation
    const size = this.halfSize * 2;
    const ratio = size / distance;

    if (this.isExternal || ratio < theta) {
      // Use multipole approximation - treat as point mass
      if (distance < 1e-10) {
        throw new Error(
          `Barnes-Hut: Body ${body.id} is at same position as node center of mass (singularity)`
        );
      }

      // Softened gravity: a = GM / (r² + ε²)
      const softenedDistSq = distSq + this.softening * this.softening;
      const accelerationMag = G * this.totalMass / softenedDistSq;

      return direction.multiplyScalar(accelerationMag / distance);
    } else {
      // Need to recurse into children
      const acceleration = Vector3.zero();

      if (this.children) {
        for (const child of this.children) {
          if (child && !child.isEmpty) {
            acceleration.add(child.calculateAcceleration(body, theta));
          }
        }
      }

      return acceleration;
    }
  }

  /**
   * Find all bodies within a distance of a point
   */
  findBodiesWithin(
    point: Vector3,
    radius: number,
    results: CelestialBody[] = []
  ): CelestialBody[] {
    if (this.isEmpty) {
      return results;
    }

    // Quick rejection: check if node can possibly contain bodies within radius
    const distToCenter = point.distanceTo(this.center);
    if (distToCenter - this.halfSize * Math.sqrt(3) > radius) {
      return results;
    }

    if (this.isExternal && this.body) {
      const dist = point.distanceTo(this.body.position);
      if (dist <= radius) {
        results.push(this.body);
      }
      return results;
    }

    if (this.children) {
      for (const child of this.children) {
        if (child) {
          child.findBodiesWithin(point, radius, results);
        }
      }
    }

    return results;
  }

  /**
   * Clear the tree
   */
  clear(): void {
    this.totalMass = 0;
    this.centerOfMass = Vector3.zero();
    this.softening = 0;
    this.children = null;
    this.body = null;
    this.bodyCount = 0;
  }

  /**
   * Get tree statistics
   */
  getStats(): { nodes: number; leaves: number; maxDepth: number } {
    let nodes = 1;
    let leaves = 0;
    let maxDepth = 0;

    const traverse = (node: OctreeNode, depth: number) => {
      maxDepth = Math.max(maxDepth, depth);

      if (node.isLeaf) {
        leaves++;
        return;
      }

      if (node.children) {
        for (const child of node.children) {
          if (child) {
            nodes++;
            traverse(child, depth + 1);
          }
        }
      }
    };

    traverse(this, 0);
    return { nodes, leaves, maxDepth };
  }
}

/**
 * Barnes-Hut Tree Manager
 * Handles construction and querying of the octree
 */
export class BarnesHutTree {
  private root: OctreeNode | null = null;
  private theta: number;

  constructor(theta: number = BARNES_HUT_THETA) {
    this.theta = theta;
  }

  /**
   * Set the opening angle parameter
   */
  setTheta(theta: number): void {
    if (theta < 0) {
      throw new Error(`BarnesHutTree: theta must be non-negative, got ${theta}`);
    }
    this.theta = theta;
  }

  /**
   * Build the tree from a set of bodies
   */
  build(bodies: CelestialBody[]): void {
    if (bodies.length === 0) {
      this.root = null;
      return;
    }

    // Calculate bounding box
    const bounds = this.calculateBounds(bodies);
    
    // Create root node
    const center = new Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      (bounds.min.y + bounds.max.y) / 2,
      (bounds.min.z + bounds.max.z) / 2
    );
    
    const size = Math.max(
      bounds.max.x - bounds.min.x,
      bounds.max.y - bounds.min.y,
      bounds.max.z - bounds.min.z
    );
    
    // Add some padding
    const halfSize = size * 0.6;

    this.root = new OctreeNode(center, halfSize);

    // Insert all bodies
    for (const body of bodies) {
      this.root.insert(body);
    }
  }

  /**
   * Calculate gravitational acceleration on a body
   */
  calculateAcceleration(body: CelestialBody): Vector3 {
    if (!this.root) {
      return Vector3.zero();
    }
    return this.root.calculateAcceleration(body, this.theta);
  }

  /**
   * Calculate bounding box for a set of bodies
   */
  private calculateBounds(bodies: CelestialBody[]): BoundingBox {
    if (bodies.length === 0) {
      return {
        min: Vector3.zero(),
        max: Vector3.zero()
      };
    }

    const first = bodies[0]!;
    const min = first.position.clone();
    const max = first.position.clone();

    for (let i = 1; i < bodies.length; i++) {
      const pos = bodies[i]!.position;
      min.x = Math.min(min.x, pos.x);
      min.y = Math.min(min.y, pos.y);
      min.z = Math.min(min.z, pos.z);
      max.x = Math.max(max.x, pos.x);
      max.y = Math.max(max.y, pos.y);
      max.z = Math.max(max.z, pos.z);
    }

    return { min, max };
  }

  /**
   * Find bodies near a point
   */
  findBodiesWithin(point: Vector3, radius: number): CelestialBody[] {
    if (!this.root) {
      return [];
    }
    return this.root.findBodiesWithin(point, radius);
  }

  /**
   * Clear the tree
   */
  clear(): void {
    if (this.root) {
      this.root.clear();
    }
    this.root = null;
  }

  /**
   * Get tree statistics
   */
  getStats(): { nodes: number; leaves: number; maxDepth: number } | null {
    return this.root?.getStats() ?? null;
  }
}
