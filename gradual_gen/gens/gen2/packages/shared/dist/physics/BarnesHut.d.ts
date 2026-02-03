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
export declare class OctreeNode {
    readonly center: Vector3;
    readonly halfSize: number;
    totalMass: number;
    centerOfMass: Vector3;
    softening: number;
    children: (OctreeNode | null)[] | null;
    body: CelestialBody | null;
    bodyCount: number;
    constructor(center: Vector3, halfSize: number);
    /**
     * Check if this node is a leaf (no children)
     */
    get isLeaf(): boolean;
    /**
     * Check if this node is empty
     */
    get isEmpty(): boolean;
    /**
     * Check if this node is external (leaf with one body)
     */
    get isExternal(): boolean;
    /**
     * Get octant index for a position (0-7)
     */
    getOctant(position: Vector3): number;
    /**
     * Get center of a child octant
     */
    getChildCenter(octant: number): Vector3;
    /**
     * Create children array
     */
    private createChildren;
    /**
     * Get or create child at octant
     */
    private getOrCreateChild;
    /**
     * Insert a body into this node
     */
    insert(body: CelestialBody): void;
    /**
     * Update center of mass and total mass after insertion
     */
    private updateMassProperties;
    /**
     * Calculate gravitational acceleration on a body using Barnes-Hut
     * @param body Target body
     * @param theta Opening angle parameter
     * @returns Acceleration vector
     */
    calculateAcceleration(body: CelestialBody, theta: number): Vector3;
    /**
     * Find all bodies within a distance of a point
     */
    findBodiesWithin(point: Vector3, radius: number, results?: CelestialBody[]): CelestialBody[];
    /**
     * Clear the tree
     */
    clear(): void;
    /**
     * Get tree statistics
     */
    getStats(): {
        nodes: number;
        leaves: number;
        maxDepth: number;
    };
}
/**
 * Barnes-Hut Tree Manager
 * Handles construction and querying of the octree
 */
export declare class BarnesHutTree {
    private root;
    private theta;
    constructor(theta?: number);
    /**
     * Set the opening angle parameter
     */
    setTheta(theta: number): void;
    /**
     * Build the tree from a set of bodies
     */
    build(bodies: CelestialBody[]): void;
    /**
     * Calculate gravitational acceleration on a body
     */
    calculateAcceleration(body: CelestialBody): Vector3;
    /**
     * Calculate bounding box for a set of bodies
     */
    private calculateBounds;
    /**
     * Find bodies near a point
     */
    findBodiesWithin(point: Vector3, radius: number): CelestialBody[];
    /**
     * Clear the tree
     */
    clear(): void;
    /**
     * Get tree statistics
     */
    getStats(): {
        nodes: number;
        leaves: number;
        maxDepth: number;
    } | null;
}
//# sourceMappingURL=BarnesHut.d.ts.map