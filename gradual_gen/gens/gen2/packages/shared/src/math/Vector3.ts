/**
 * High-Precision 3D Vector Class using Float64
 * =============================================
 * Maintains full double-precision for physics calculations.
 * Provides conversion to Float32 for rendering.
 * 
 * All operations use SI units (meters, m/s, etc.)
 */

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Create a Vector3 from a Float64Array
   */
  static fromFloat64Array(arr: Float64Array, offset: number = 0): Vector3 {
    return new Vector3(
      arr[offset] ?? 0,
      arr[offset + 1] ?? 0,
      arr[offset + 2] ?? 0
    );
  }

  /**
   * Create a Vector3 from a Float32Array
   */
  static fromFloat32Array(arr: Float32Array, offset: number = 0): Vector3 {
    return new Vector3(
      arr[offset] ?? 0,
      arr[offset + 1] ?? 0,
      arr[offset + 2] ?? 0
    );
  }

  /**
   * Clone this vector
   */
  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Copy values from another vector
   */
  copy(v: Vector3): this {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Set vector components
   */
  set(x: number, y: number, z: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Add another vector
   */
  add(v: Vector3): this {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Static add: returns new vector
   */
  static add(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  /**
   * Subtract another vector
   */
  sub(v: Vector3): this {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Static subtract: returns new vector
   */
  static sub(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  /**
   * Multiply by scalar
   */
  multiplyScalar(s: number): this {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /**
   * Static multiply by scalar
   */
  static multiplyScalar(v: Vector3, s: number): Vector3 {
    return new Vector3(v.x * s, v.y * s, v.z * s);
  }

  /**
   * Divide by scalar
   * @throws Error if scalar is zero
   */
  divideScalar(s: number): this {
    if (s === 0) {
      throw new Error('Vector3.divideScalar: Cannot divide by zero');
    }
    return this.multiplyScalar(1 / s);
  }

  /**
   * Dot product
   */
  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Static dot product
   */
  static dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Cross product (modifies this vector)
   */
  cross(v: Vector3): this {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Static cross product: returns new vector
   */
  static cross(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  /**
   * Squared magnitude (avoids sqrt for performance)
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Magnitude of the vector
   */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /**
   * Distance to another vector
   */
  distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  /**
   * Squared distance to another vector
   */
  distanceToSquared(v: Vector3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Normalize to unit vector
   * @throws Error if vector has zero length
   */
  normalize(): this {
    const len = this.length();
    if (len === 0) {
      throw new Error('Vector3.normalize: Cannot normalize zero-length vector');
    }
    return this.divideScalar(len);
  }

  /**
   * Safe normalize: returns zero vector if length is zero
   */
  safeNormalize(): this {
    const len = this.length();
    if (len === 0) {
      return this.set(0, 0, 0);
    }
    return this.divideScalar(len);
  }

  /**
   * Linear interpolation towards another vector
   */
  lerp(v: Vector3, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    return this;
  }

  /**
   * Static lerp
   */
  static lerp(a: Vector3, b: Vector3, alpha: number): Vector3 {
    return new Vector3(
      a.x + (b.x - a.x) * alpha,
      a.y + (b.y - a.y) * alpha,
      a.z + (b.z - a.z) * alpha
    );
  }

  /**
   * Negate the vector
   */
  negate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Check if vectors are equal within epsilon
   */
  equals(v: Vector3, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - v.x) < epsilon &&
      Math.abs(this.y - v.y) < epsilon &&
      Math.abs(this.z - v.z) < epsilon
    );
  }

  /**
   * Check if vector is zero
   */
  isZero(epsilon: number = 1e-10): boolean {
    return this.lengthSquared() < epsilon * epsilon;
  }

  /**
   * Convert to Float64Array (for physics/networking)
   */
  toFloat64Array(target?: Float64Array, offset: number = 0): Float64Array {
    const arr = target ?? new Float64Array(3);
    arr[offset] = this.x;
    arr[offset + 1] = this.y;
    arr[offset + 2] = this.z;
    return arr;
  }

  /**
   * Convert to Float32Array (for rendering/Three.js)
   * Note: This loses precision beyond ~7 significant digits
   */
  toFloat32Array(target?: Float32Array, offset: number = 0): Float32Array {
    const arr = target ?? new Float32Array(3);
    arr[offset] = this.x;
    arr[offset + 1] = this.y;
    arr[offset + 2] = this.z;
    return arr;
  }

  /**
   * Get relative position to origin (for floating origin rendering)
   * Returns Float32Array suitable for Three.js
   */
  toRenderPosition(origin: Vector3): Float32Array {
    return new Float32Array([
      this.x - origin.x,
      this.y - origin.y,
      this.z - origin.z
    ]);
  }

  /**
   * Convert to array
   */
  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }

  /**
   * Create from array
   */
  static fromArray(arr: readonly number[]): Vector3 {
    return new Vector3(arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 0);
  }

  /**
   * String representation
   */
  toString(precision: number = 6): string {
    return `Vector3(${this.x.toExponential(precision)}, ${this.y.toExponential(precision)}, ${this.z.toExponential(precision)})`;
  }

  /**
   * Apply a function to each component
   */
  applyFunc(fn: (n: number) => number): this {
    this.x = fn(this.x);
    this.y = fn(this.y);
    this.z = fn(this.z);
    return this;
  }

  /**
   * Component-wise minimum
   */
  min(v: Vector3): this {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  /**
   * Component-wise maximum
   */
  max(v: Vector3): this {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  /**
   * Clamp each component between min and max
   */
  clamp(min: number, max: number): this {
    this.x = Math.max(min, Math.min(max, this.x));
    this.y = Math.max(min, Math.min(max, this.y));
    this.z = Math.max(min, Math.min(max, this.z));
    return this;
  }

  /**
   * Clamp length to a maximum
   */
  clampLength(maxLength: number): this {
    const len = this.length();
    if (len > maxLength && len > 0) {
      this.multiplyScalar(maxLength / len);
    }
    return this;
  }

  /**
   * Project this vector onto another vector
   */
  projectOnto(v: Vector3): this {
    const denominator = v.lengthSquared();
    if (denominator === 0) {
      throw new Error('Vector3.projectOnto: Cannot project onto zero-length vector');
    }
    const scalar = this.dot(v) / denominator;
    return this.copy(v).multiplyScalar(scalar);
  }

  /**
   * Reflect this vector about a normal
   */
  reflect(normal: Vector3): this {
    // r = v - 2(v·n)n
    const scalar = 2 * this.dot(normal);
    this.x -= scalar * normal.x;
    this.y -= scalar * normal.y;
    this.z -= scalar * normal.z;
    return this;
  }

  /**
   * Angle to another vector in radians
   */
  angleTo(v: Vector3): number {
    const denominator = Math.sqrt(this.lengthSquared() * v.lengthSquared());
    if (denominator === 0) {
      throw new Error('Vector3.angleTo: Cannot compute angle with zero-length vector');
    }
    const theta = this.dot(v) / denominator;
    // Clamp to [-1, 1] to handle numerical errors
    return Math.acos(Math.max(-1, Math.min(1, theta)));
  }

  /**
   * Create zero vector
   */
  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /**
   * Create unit X vector
   */
  static unitX(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  /**
   * Create unit Y vector
   */
  static unitY(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  /**
   * Create unit Z vector
   */
  static unitZ(): Vector3 {
    return new Vector3(0, 0, 1);
  }
}
