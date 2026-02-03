/**
 * Barnes-Hut Octree for O(N log N) Gravity Calculation
 * 
 * The Barnes-Hut algorithm approximates gravitational interactions by:
 * 1. Building an octree that hierarchically subdivides space
 * 2. For each body, traversing the tree and treating distant clusters as point masses
 * 3. Using a threshold θ (theta) to determine when to approximate
 * 
 * When s/d < θ (where s is node size and d is distance), treat node as point mass
 * 
 * Complexity:
 * - Tree construction: O(N log N)
 * - Force calculation per body: O(log N)
 * - Total: O(N log N)
 * 
 * @module gravity/barnes-hut
 */

import { Vec3, BARNES_HUT_THETA, MIN_FORCE_DISTANCE } from '@nbody/shared';
import type { MutableVector3D, Vector3D } from '@nbody/shared';

/**
 * Body data for octree insertion
 */
export interface OctreeBody {
  id: string;
  position: Vector3D;
  mass: number;
  mu: number; // GM for more precise calculations
}

/**
 * Octree node representing a region of space
 */
interface OctreeNode {
  /** Center of this region */
  center: Vector3D;
  
  /** Half-width of this cubic region */
  halfWidth: number;
  
  /** Total mass in this region */
  totalMass: number;
  
  /** Center of mass */
  centerOfMass: MutableVector3D;
  
  /** Total GM (gravitational parameter) */
  totalMu: number;
  
  /** Number of bodies in this node (0 = empty, 1 = leaf with body, >1 = internal) */
  bodyCount: number;
  
  /** Single body if this is a leaf with exactly one body */
  body: OctreeBody | null;
  
  /** Children (8 octants), null if not subdivided */
  children: (OctreeNode | null)[] | null;
}

/**
 * Barnes-Hut Octree implementation
 */
export class BarnesHutTree {
  private root: OctreeNode | null = null;
  private readonly theta: number;
  private readonly softening: number;
  private readonly maxDepth: number;
  
  // Pre-allocated vectors for calculations
  private readonly tempAccel: MutableVector3D = Vec3.mutableZero();
  private readonly tempDiff: MutableVector3D = Vec3.mutableZero();
  
  /**
   * Create a new Barnes-Hut tree
   * 
   * @param theta - Opening angle threshold (0.0-1.0, lower = more accurate)
   * @param softening - Gravitational softening in meters
   * @param maxDepth - Maximum tree depth
   */
  constructor(theta = BARNES_HUT_THETA, softening = 1000, maxDepth = 32) {
    this.theta = theta;
    this.softening = softening;
    this.maxDepth = maxDepth;
  }
  
  /**
   * Build the octree from a set of bodies
   * 
   * @param bodies - Array of bodies to insert
   */
  build(bodies: OctreeBody[]): void {
    if (bodies.length === 0) {
      this.root = null;
      return;
    }
    
    // Find bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (const body of bodies) {
      minX = Math.min(minX, body.position.x);
      minY = Math.min(minY, body.position.y);
      minZ = Math.min(minZ, body.position.z);
      maxX = Math.max(maxX, body.position.x);
      maxY = Math.max(maxY, body.position.y);
      maxZ = Math.max(maxZ, body.position.z);
    }
    
    // Create root node centered on bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    
    // Half-width should contain all bodies (add small margin)
    const halfWidth = Math.max(
      maxX - centerX,
      maxY - centerY,
      maxZ - centerZ,
      centerX - minX,
      centerY - minY,
      centerZ - minZ
    ) * 1.001;
    
    this.root = this.createNode(
      Vec3.vec3(centerX, centerY, centerZ),
      halfWidth
    );
    
    // Insert all bodies
    for (const body of bodies) {
      this.insert(this.root, body, 0);
    }
    
    // Compute centers of mass
    this.computeCenterOfMass(this.root);
  }
  
  /**
   * Create an empty octree node
   */
  private createNode(center: Vector3D, halfWidth: number): OctreeNode {
    return {
      center,
      halfWidth,
      totalMass: 0,
      centerOfMass: Vec3.mutableZero(),
      totalMu: 0,
      bodyCount: 0,
      body: null,
      children: null
    };
  }
  
  /**
   * Get the octant index for a position relative to node center
   * Returns 0-7 based on which octant the position falls in
   */
  private getOctant(center: Vector3D, position: Vector3D): number {
    let octant = 0;
    if (position.x >= center.x) octant |= 1;
    if (position.y >= center.y) octant |= 2;
    if (position.z >= center.z) octant |= 4;
    return octant;
  }
  
  /**
   * Get the center of a child octant
   */
  private getChildCenter(parent: OctreeNode, octant: number): Vector3D {
    const offset = parent.halfWidth / 2;
    return Vec3.vec3(
      parent.center.x + ((octant & 1) ? offset : -offset),
      parent.center.y + ((octant & 2) ? offset : -offset),
      parent.center.z + ((octant & 4) ? offset : -offset)
    );
  }
  
  /**
   * Insert a body into the tree
   */
  private insert(node: OctreeNode, body: OctreeBody, depth: number): void {
    // Update mass
    node.totalMass += body.mass;
    node.totalMu += body.mu;
    node.bodyCount++;
    
    if (node.bodyCount === 1) {
      // First body in this node - store it
      node.body = body;
      return;
    }
    
    // Node has multiple bodies - need to subdivide
    if (node.children === null) {
      // First subdivision - create children
      node.children = new Array(8).fill(null);
      
      // Re-insert the existing body
      if (node.body !== null) {
        const existingBody = node.body;
        node.body = null;
        this.insertIntoChild(node, existingBody, depth);
      }
    }
    
    // Insert the new body
    this.insertIntoChild(node, body, depth);
  }
  
  /**
   * Insert body into appropriate child node
   */
  private insertIntoChild(node: OctreeNode, body: OctreeBody, depth: number): void {
    if (depth >= this.maxDepth) {
      // Max depth reached - store here (approximation)
      return;
    }
    
    const octant = this.getOctant(node.center, body.position);
    
    if (node.children![octant] === null) {
      node.children![octant] = this.createNode(
        this.getChildCenter(node, octant),
        node.halfWidth / 2
      );
    }
    
    this.insert(node.children![octant]!, body, depth + 1);
  }
  
  /**
   * Compute center of mass for all nodes (post-order traversal)
   */
  private computeCenterOfMass(node: OctreeNode): void {
    if (node.bodyCount === 0) {
      return;
    }
    
    if (node.bodyCount === 1 && node.body !== null) {
      // Leaf node with single body
      Vec3.copy(node.centerOfMass, node.body.position);
      return;
    }
    
    // Internal node - compute from children
    if (node.children !== null) {
      node.centerOfMass.x = 0;
      node.centerOfMass.y = 0;
      node.centerOfMass.z = 0;
      
      for (const child of node.children) {
        if (child !== null && child.bodyCount > 0) {
          this.computeCenterOfMass(child);
          
          // Weighted sum for center of mass
          node.centerOfMass.x += child.centerOfMass.x * child.totalMass;
          node.centerOfMass.y += child.centerOfMass.y * child.totalMass;
          node.centerOfMass.z += child.centerOfMass.z * child.totalMass;
        }
      }
      
      // Divide by total mass
      if (node.totalMass > 0) {
        node.centerOfMass.x /= node.totalMass;
        node.centerOfMass.y /= node.totalMass;
        node.centerOfMass.z /= node.totalMass;
      }
    }
  }
  
  /**
   * Calculate gravitational acceleration on a body
   * 
   * @param position - Position to calculate acceleration at
   * @param excludeId - Body ID to exclude (self-interaction)
   * @returns Acceleration vector in m/s²
   */
  calculateAcceleration(position: Vector3D, excludeId?: string): MutableVector3D {
    Vec3.set(this.tempAccel, 0, 0, 0);
    
    if (this.root !== null) {
      this.computeForce(this.root, position, excludeId);
    }
    
    return Vec3.cloneMutable(this.tempAccel);
  }
  
  /**
   * Recursively compute gravitational force from a node
   */
  private computeForce(node: OctreeNode, position: Vector3D, excludeId?: string): void {
    if (node.bodyCount === 0) {
      return;
    }
    
    // Single body - direct calculation
    if (node.bodyCount === 1 && node.body !== null) {
      if (node.body.id !== excludeId) {
        this.addForce(position, node.body.position, node.body.mu);
      }
      return;
    }
    
    // Calculate distance to center of mass
    const dx = node.centerOfMass.x - position.x;
    const dy = node.centerOfMass.y - position.y;
    const dz = node.centerOfMass.z - position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);
    
    // Barnes-Hut criterion: s/d < θ
    const nodeSize = node.halfWidth * 2;
    
    if (nodeSize / dist < this.theta) {
      // Node is far enough - treat as point mass
      this.addForce(position, node.centerOfMass, node.totalMu);
    } else {
      // Node is too close - recurse into children
      if (node.children !== null) {
        for (const child of node.children) {
          if (child !== null) {
            this.computeForce(child, position, excludeId);
          }
        }
      }
    }
  }
  
  /**
   * Add gravitational acceleration from a point mass
   */
  private addForce(position: Vector3D, sourcePosition: Vector3D, mu: number): void {
    const dx = sourcePosition.x - position.x;
    const dy = sourcePosition.y - position.y;
    const dz = sourcePosition.z - position.z;
    
    // Distance with softening to prevent singularity
    const distSq = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
    
    if (distSq < MIN_FORCE_DISTANCE * MIN_FORCE_DISTANCE) {
      return; // Too close, skip to avoid numerical issues
    }
    
    const dist = Math.sqrt(distSq);
    const distCubed = distSq * dist;
    
    // a = GM / r² * r̂ = GM * r / r³
    const factor = mu / distCubed;
    
    this.tempAccel.x += dx * factor;
    this.tempAccel.y += dy * factor;
    this.tempAccel.z += dz * factor;
  }
  
  /**
   * Get statistics about the current tree
   */
  getStats(): { nodeCount: number; maxDepth: number; bodyCount: number } {
    if (this.root === null) {
      return { nodeCount: 0, maxDepth: 0, bodyCount: 0 };
    }
    
    let nodeCount = 0;
    let maxDepth = 0;
    
    const countNodes = (node: OctreeNode, depth: number): void => {
      nodeCount++;
      maxDepth = Math.max(maxDepth, depth);
      
      if (node.children !== null) {
        for (const child of node.children) {
          if (child !== null) {
            countNodes(child, depth + 1);
          }
        }
      }
    };
    
    countNodes(this.root, 0);
    
    return {
      nodeCount,
      maxDepth,
      bodyCount: this.root.bodyCount
    };
  }
  
  /**
   * Clear the tree
   */
  clear(): void {
    this.root = null;
  }
}

/**
 * Direct O(N²) gravity calculation for comparison/small N
 */
export function calculateDirectGravity(
  position: Vector3D,
  bodies: OctreeBody[],
  excludeId?: string,
  softening = 1000
): MutableVector3D {
  const accel = Vec3.mutableZero();
  
  for (const body of bodies) {
    if (body.id === excludeId) continue;
    
    const dx = body.position.x - position.x;
    const dy = body.position.y - position.y;
    const dz = body.position.z - position.z;
    
    const distSq = dx * dx + dy * dy + dz * dz + softening * softening;
    
    if (distSq < MIN_FORCE_DISTANCE * MIN_FORCE_DISTANCE) continue;
    
    const dist = Math.sqrt(distSq);
    const distCubed = distSq * dist;
    const factor = body.mu / distCubed;
    
    accel.x += dx * factor;
    accel.y += dy * factor;
    accel.z += dz * factor;
  }
  
  return accel;
}
