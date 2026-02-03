/**
 * High-Precision 3D Vector Class using Float64
 * =============================================
 * Maintains full double-precision for physics calculations.
 * Provides conversion to Float32 for rendering.
 *
 * All operations use SI units (meters, m/s, etc.)
 */
export declare class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    /**
     * Create a Vector3 from a Float64Array
     */
    static fromFloat64Array(arr: Float64Array, offset?: number): Vector3;
    /**
     * Create a Vector3 from a Float32Array
     */
    static fromFloat32Array(arr: Float32Array, offset?: number): Vector3;
    /**
     * Clone this vector
     */
    clone(): Vector3;
    /**
     * Copy values from another vector
     */
    copy(v: Vector3): this;
    /**
     * Set vector components
     */
    set(x: number, y: number, z: number): this;
    /**
     * Add another vector
     */
    add(v: Vector3): this;
    /**
     * Static add: returns new vector
     */
    static add(a: Vector3, b: Vector3): Vector3;
    /**
     * Subtract another vector
     */
    sub(v: Vector3): this;
    /**
     * Static subtract: returns new vector
     */
    static sub(a: Vector3, b: Vector3): Vector3;
    /**
     * Multiply by scalar
     */
    multiplyScalar(s: number): this;
    /**
     * Static multiply by scalar
     */
    static multiplyScalar(v: Vector3, s: number): Vector3;
    /**
     * Divide by scalar
     * @throws Error if scalar is zero
     */
    divideScalar(s: number): this;
    /**
     * Dot product
     */
    dot(v: Vector3): number;
    /**
     * Static dot product
     */
    static dot(a: Vector3, b: Vector3): number;
    /**
     * Cross product (modifies this vector)
     */
    cross(v: Vector3): this;
    /**
     * Static cross product: returns new vector
     */
    static cross(a: Vector3, b: Vector3): Vector3;
    /**
     * Squared magnitude (avoids sqrt for performance)
     */
    lengthSquared(): number;
    /**
     * Magnitude of the vector
     */
    length(): number;
    /**
     * Distance to another vector
     */
    distanceTo(v: Vector3): number;
    /**
     * Squared distance to another vector
     */
    distanceToSquared(v: Vector3): number;
    /**
     * Normalize to unit vector
     * @throws Error if vector has zero length
     */
    normalize(): this;
    /**
     * Safe normalize: returns zero vector if length is zero
     */
    safeNormalize(): this;
    /**
     * Linear interpolation towards another vector
     */
    lerp(v: Vector3, alpha: number): this;
    /**
     * Static lerp
     */
    static lerp(a: Vector3, b: Vector3, alpha: number): Vector3;
    /**
     * Negate the vector
     */
    negate(): this;
    /**
     * Check if vectors are equal within epsilon
     */
    equals(v: Vector3, epsilon?: number): boolean;
    /**
     * Check if vector is zero
     */
    isZero(epsilon?: number): boolean;
    /**
     * Convert to Float64Array (for physics/networking)
     */
    toFloat64Array(target?: Float64Array, offset?: number): Float64Array;
    /**
     * Convert to Float32Array (for rendering/Three.js)
     * Note: This loses precision beyond ~7 significant digits
     */
    toFloat32Array(target?: Float32Array, offset?: number): Float32Array;
    /**
     * Get relative position to origin (for floating origin rendering)
     * Returns Float32Array suitable for Three.js
     */
    toRenderPosition(origin: Vector3): Float32Array;
    /**
     * Convert to array
     */
    toArray(): [number, number, number];
    /**
     * Create from array
     */
    static fromArray(arr: readonly number[]): Vector3;
    /**
     * String representation
     */
    toString(precision?: number): string;
    /**
     * Apply a function to each component
     */
    applyFunc(fn: (n: number) => number): this;
    /**
     * Component-wise minimum
     */
    min(v: Vector3): this;
    /**
     * Component-wise maximum
     */
    max(v: Vector3): this;
    /**
     * Clamp each component between min and max
     */
    clamp(min: number, max: number): this;
    /**
     * Clamp length to a maximum
     */
    clampLength(maxLength: number): this;
    /**
     * Project this vector onto another vector
     */
    projectOnto(v: Vector3): this;
    /**
     * Reflect this vector about a normal
     */
    reflect(normal: Vector3): this;
    /**
     * Angle to another vector in radians
     */
    angleTo(v: Vector3): number;
    /**
     * Create zero vector
     */
    static zero(): Vector3;
    /**
     * Create unit X vector
     */
    static unitX(): Vector3;
    /**
     * Create unit Y vector
     */
    static unitY(): Vector3;
    /**
     * Create unit Z vector
     */
    static unitZ(): Vector3;
}
//# sourceMappingURL=Vector3.d.ts.map