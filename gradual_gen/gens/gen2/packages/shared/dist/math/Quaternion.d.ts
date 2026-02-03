/**
 * Quaternion Class for Rotations
 * ===============================
 * Used for orientation and rotation interpolation.
 * Avoids gimbal lock issues present in Euler angles.
 */
import { Vector3 } from './Vector3.js';
export declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    /**
     * Create identity quaternion (no rotation)
     */
    static identity(): Quaternion;
    /**
     * Clone this quaternion
     */
    clone(): Quaternion;
    /**
     * Copy from another quaternion
     */
    copy(q: Quaternion): this;
    /**
     * Set components
     */
    set(x: number, y: number, z: number, w: number): this;
    /**
     * Set from axis-angle representation
     * @param axis Normalized axis vector
     * @param angle Angle in radians
     */
    setFromAxisAngle(axis: Vector3, angle: number): this;
    /**
     * Set from Euler angles (XYZ order)
     * @param x Pitch in radians
     * @param y Yaw in radians
     * @param z Roll in radians
     */
    setFromEuler(x: number, y: number, z: number): this;
    /**
     * Convert to Euler angles (XYZ order)
     */
    toEuler(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Squared length
     */
    lengthSquared(): number;
    /**
     * Length
     */
    length(): number;
    /**
     * Normalize the quaternion
     */
    normalize(): this;
    /**
     * Conjugate (inverse for unit quaternions)
     */
    conjugate(): this;
    /**
     * Multiply by another quaternion
     */
    multiply(q: Quaternion): this;
    /**
     * Static multiply
     */
    static multiply(a: Quaternion, b: Quaternion): Quaternion;
    /**
     * Pre-multiply by another quaternion
     */
    premultiply(q: Quaternion): this;
    /**
     * Rotate a vector by this quaternion
     */
    rotateVector(v: Vector3): Vector3;
    /**
     * Spherical linear interpolation
     */
    slerp(q: Quaternion, t: number): this;
    /**
     * Static slerp
     */
    static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion;
    /**
     * Create quaternion that rotates from vector a to vector b
     */
    static fromVectors(a: Vector3, b: Vector3): Quaternion;
    /**
     * Dot product
     */
    dot(q: Quaternion): number;
    /**
     * Check equality
     */
    equals(q: Quaternion, epsilon?: number): boolean;
    /**
     * Convert to array
     */
    toArray(): [number, number, number, number];
    /**
     * Create from array
     */
    static fromArray(arr: readonly number[]): Quaternion;
    /**
     * String representation
     */
    toString(): string;
    /**
     * Get the axis of rotation
     */
    getAxis(): Vector3;
    /**
     * Get the angle of rotation in radians
     */
    getAngle(): number;
}
//# sourceMappingURL=Quaternion.d.ts.map