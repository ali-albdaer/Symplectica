/**
 * High-Precision 3D Vector Mathematics
 * 
 * All operations use Float64 precision.
 * Designed for astronomical calculations where precision is critical.
 * 
 * @module vector3
 */

import type { Vector3D, MutableVector3D, Vector3DArray } from './types.js';

/**
 * Create a new immutable vector
 */
export function vec3(x: number, y: number, z: number): Vector3D {
  return Object.freeze({ x, y, z });
}

/**
 * Create a new mutable vector
 */
export function mutableVec3(x: number, y: number, z: number): MutableVector3D {
  return { x, y, z };
}

/**
 * Create a zero vector
 */
export function zero(): Vector3D {
  return Object.freeze({ x: 0, y: 0, z: 0 });
}

/**
 * Create a mutable zero vector
 */
export function mutableZero(): MutableVector3D {
  return { x: 0, y: 0, z: 0 };
}

/**
 * Clone a vector
 */
export function clone(v: Vector3D): Vector3D {
  return Object.freeze({ x: v.x, y: v.y, z: v.z });
}

/**
 * Clone to mutable vector
 */
export function cloneMutable(v: Vector3D): MutableVector3D {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * Copy source into target (mutates target)
 */
export function copy(target: MutableVector3D, source: Vector3D): MutableVector3D {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
  return target;
}

/**
 * Set vector components (mutates v)
 */
export function set(v: MutableVector3D, x: number, y: number, z: number): MutableVector3D {
  v.x = x;
  v.y = y;
  v.z = z;
  return v;
}

// ============================================================================
// ARITHMETIC OPERATIONS
// ============================================================================

/**
 * Add two vectors (immutable)
 */
export function add(a: Vector3D, b: Vector3D): Vector3D {
  return vec3(a.x + b.x, a.y + b.y, a.z + b.z);
}

/**
 * Add vector b to a (mutates a)
 */
export function addMut(a: MutableVector3D, b: Vector3D): MutableVector3D {
  a.x += b.x;
  a.y += b.y;
  a.z += b.z;
  return a;
}

/**
 * Add scaled vector: a + b * scale (mutates a)
 */
export function addScaledMut(a: MutableVector3D, b: Vector3D, scale: number): MutableVector3D {
  a.x += b.x * scale;
  a.y += b.y * scale;
  a.z += b.z * scale;
  return a;
}

/**
 * Subtract two vectors (immutable)
 */
export function sub(a: Vector3D, b: Vector3D): Vector3D {
  return vec3(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Subtract vector b from a (mutates a)
 */
export function subMut(a: MutableVector3D, b: Vector3D): MutableVector3D {
  a.x -= b.x;
  a.y -= b.y;
  a.z -= b.z;
  return a;
}

/**
 * Multiply vector by scalar (immutable)
 */
export function scale(v: Vector3D, s: number): Vector3D {
  return vec3(v.x * s, v.y * s, v.z * s);
}

/**
 * Multiply vector by scalar (mutates v)
 */
export function scaleMut(v: MutableVector3D, s: number): MutableVector3D {
  v.x *= s;
  v.y *= s;
  v.z *= s;
  return v;
}

/**
 * Divide vector by scalar (immutable)
 */
export function divide(v: Vector3D, s: number): Vector3D {
  if (s === 0) {
    throw new Error(`Vector division by zero: cannot divide [${v.x}, ${v.y}, ${v.z}] by 0`);
  }
  const inv = 1 / s;
  return vec3(v.x * inv, v.y * inv, v.z * inv);
}

/**
 * Divide vector by scalar (mutates v)
 */
export function divideMut(v: MutableVector3D, s: number): MutableVector3D {
  if (s === 0) {
    throw new Error(`Vector division by zero: cannot divide [${v.x}, ${v.y}, ${v.z}] by 0`);
  }
  const inv = 1 / s;
  v.x *= inv;
  v.y *= inv;
  v.z *= inv;
  return v;
}

/**
 * Negate vector (immutable)
 */
export function negate(v: Vector3D): Vector3D {
  return vec3(-v.x, -v.y, -v.z);
}

/**
 * Negate vector (mutates v)
 */
export function negateMut(v: MutableVector3D): MutableVector3D {
  v.x = -v.x;
  v.y = -v.y;
  v.z = -v.z;
  return v;
}

// ============================================================================
// VECTOR PRODUCTS
// ============================================================================

/**
 * Dot product
 */
export function dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Cross product (immutable)
 */
export function cross(a: Vector3D, b: Vector3D): Vector3D {
  return vec3(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x
  );
}

/**
 * Cross product (mutates result)
 */
export function crossInto(a: Vector3D, b: Vector3D, result: MutableVector3D): MutableVector3D {
  // Use temp variables in case a or b is the same reference as result
  const rx = a.y * b.z - a.z * b.y;
  const ry = a.z * b.x - a.x * b.z;
  const rz = a.x * b.y - a.y * b.x;
  result.x = rx;
  result.y = ry;
  result.z = rz;
  return result;
}

// ============================================================================
// LENGTH AND DISTANCE
// ============================================================================

/**
 * Squared length (magnitude squared)
 * Use this when possible to avoid sqrt
 */
export function lengthSq(v: Vector3D): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

/**
 * Length (magnitude)
 */
export function length(v: Vector3D): number {
  return Math.sqrt(lengthSq(v));
}

/**
 * Squared distance between two points
 */
export function distanceSq(a: Vector3D, b: Vector3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Distance between two points
 */
export function distance(a: Vector3D, b: Vector3D): number {
  return Math.sqrt(distanceSq(a, b));
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize vector to unit length (immutable)
 * Returns zero vector if input is zero-length
 */
export function normalize(v: Vector3D): Vector3D {
  const len = length(v);
  if (len === 0) {
    return zero();
  }
  return divide(v, len);
}

/**
 * Normalize vector to unit length (mutates v)
 * Returns zero vector if input is zero-length
 */
export function normalizeMut(v: MutableVector3D): MutableVector3D {
  const len = length(v);
  if (len === 0) {
    v.x = 0;
    v.y = 0;
    v.z = 0;
    return v;
  }
  return divideMut(v, len);
}

/**
 * Set vector to specific length (immutable)
 */
export function setLength(v: Vector3D, newLength: number): Vector3D {
  const len = length(v);
  if (len === 0) {
    return zero();
  }
  return scale(v, newLength / len);
}

/**
 * Limit vector length to maximum (immutable)
 */
export function clampLength(v: Vector3D, maxLength: number): Vector3D {
  const lenSq = lengthSq(v);
  if (lenSq > maxLength * maxLength) {
    return setLength(v, maxLength);
  }
  return clone(v);
}

// ============================================================================
// INTERPOLATION
// ============================================================================

/**
 * Linear interpolation between two vectors
 * t=0 returns a, t=1 returns b
 */
export function lerp(a: Vector3D, b: Vector3D, t: number): Vector3D {
  return vec3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

/**
 * Linear interpolation (mutates result)
 */
export function lerpInto(a: Vector3D, b: Vector3D, t: number, result: MutableVector3D): MutableVector3D {
  result.x = a.x + (b.x - a.x) * t;
  result.y = a.y + (b.y - a.y) * t;
  result.z = a.z + (b.z - a.z) * t;
  return result;
}

// ============================================================================
// GEOMETRIC OPERATIONS
// ============================================================================

/**
 * Reflect vector off a plane with given normal
 */
export function reflect(v: Vector3D, normal: Vector3D): Vector3D {
  const d = 2 * dot(v, normal);
  return vec3(
    v.x - d * normal.x,
    v.y - d * normal.y,
    v.z - d * normal.z
  );
}

/**
 * Project vector a onto vector b
 */
export function project(a: Vector3D, b: Vector3D): Vector3D {
  const bLenSq = lengthSq(b);
  if (bLenSq === 0) {
    return zero();
  }
  const scalar = dot(a, b) / bLenSq;
  return scale(b, scalar);
}

/**
 * Angle between two vectors in radians
 */
export function angleBetween(a: Vector3D, b: Vector3D): number {
  const lenA = length(a);
  const lenB = length(b);
  if (lenA === 0 || lenB === 0) {
    return 0;
  }
  const cosAngle = dot(a, b) / (lenA * lenB);
  // Clamp to [-1, 1] to handle floating point errors
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

// ============================================================================
// TYPED ARRAY CONVERSION
// ============================================================================

/**
 * Convert to Float64Array
 */
export function toFloat64Array(v: Vector3D): Vector3DArray {
  const arr = new Float64Array(3);
  arr[0] = v.x;
  arr[1] = v.y;
  arr[2] = v.z;
  return arr;
}

/**
 * Create vector from Float64Array
 */
export function fromFloat64Array(arr: Vector3DArray, offset = 0): Vector3D {
  return vec3(arr[offset]!, arr[offset + 1]!, arr[offset + 2]!);
}

/**
 * Create mutable vector from Float64Array
 */
export function mutableFromFloat64Array(arr: Vector3DArray, offset = 0): MutableVector3D {
  return mutableVec3(arr[offset]!, arr[offset + 1]!, arr[offset + 2]!);
}

/**
 * Write vector to Float64Array at offset
 */
export function writeToFloat64Array(v: Vector3D, arr: Float64Array, offset = 0): void {
  arr[offset] = v.x;
  arr[offset + 1] = v.y;
  arr[offset + 2] = v.z;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if vector contains NaN
 */
export function hasNaN(v: Vector3D): boolean {
  return Number.isNaN(v.x) || Number.isNaN(v.y) || Number.isNaN(v.z);
}

/**
 * Check if vector contains Infinity
 */
export function hasInfinity(v: Vector3D): boolean {
  return !Number.isFinite(v.x) || !Number.isFinite(v.y) || !Number.isFinite(v.z);
}

/**
 * Check if vector is valid (no NaN or Infinity)
 */
export function isValid(v: Vector3D): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

/**
 * Validate vector, throw if invalid
 */
export function validate(v: Vector3D, name = 'vector'): void {
  if (!isValid(v)) {
    throw new Error(
      `Invalid ${name}: [${v.x}, ${v.y}, ${v.z}] contains NaN or Infinity`
    );
  }
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format vector as string with specified precision
 */
export function toString(v: Vector3D, precision = 6): string {
  return `[${v.x.toFixed(precision)}, ${v.y.toFixed(precision)}, ${v.z.toFixed(precision)}]`;
}

/**
 * Format vector in scientific notation
 */
export function toScientific(v: Vector3D, precision = 3): string {
  return `[${v.x.toExponential(precision)}, ${v.y.toExponential(precision)}, ${v.z.toExponential(precision)}]`;
}
