/**
 * High-Precision 3D Vector Mathematics
 * Uses Float64 for all calculations to maintain SI-unit precision.
 * @module shared/math/Vector3D
 */

/**
 * Validate that a value is a finite number
 * @param {number} value - Value to check
 * @param {string} context - Context for error message
 * @throws {Error} If value is NaN or Infinity
 */
function validateFinite(value, context) {
  if (!Number.isFinite(value)) {
    throw new Error(`[Vector3D] Invalid value in ${context}: ${value} (NaN/Infinity not allowed)`);
  }
}

/**
 * High-precision 3D vector using Float64Array internally
 */
export class Vector3D {
  /**
   * @param {number} x - X component (meters)
   * @param {number} y - Y component (meters)
   * @param {number} z - Z component (meters)
   */
  constructor(x = 0, y = 0, z = 0) {
    /** @type {Float64Array} Internal storage */
    this._data = new Float64Array(3);
    this._data[0] = x;
    this._data[1] = y;
    this._data[2] = z;
  }

  get x() { return this._data[0]; }
  set x(v) { this._data[0] = v; }

  get y() { return this._data[1]; }
  set y(v) { this._data[1] = v; }

  get z() { return this._data[2]; }
  set z(v) { this._data[2] = v; }

  /**
   * Set all components
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @returns {Vector3D} this
   */
  set(x, y, z) {
    this._data[0] = x;
    this._data[1] = y;
    this._data[2] = z;
    return this;
  }

  /**
   * Copy from another vector
   * @param {Vector3D} v 
   * @returns {Vector3D} this
   */
  copy(v) {
    this._data[0] = v.x;
    this._data[1] = v.y;
    this._data[2] = v.z;
    return this;
  }

  /**
   * Clone this vector
   * @returns {Vector3D} New vector with same values
   */
  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }

  /**
   * Add another vector
   * @param {Vector3D} v 
   * @returns {Vector3D} this
   */
  add(v) {
    this._data[0] += v.x;
    this._data[1] += v.y;
    this._data[2] += v.z;
    return this;
  }

  /**
   * Subtract another vector
   * @param {Vector3D} v 
   * @returns {Vector3D} this
   */
  sub(v) {
    this._data[0] -= v.x;
    this._data[1] -= v.y;
    this._data[2] -= v.z;
    return this;
  }

  /**
   * Multiply by scalar
   * @param {number} s 
   * @returns {Vector3D} this
   */
  multiplyScalar(s) {
    this._data[0] *= s;
    this._data[1] *= s;
    this._data[2] *= s;
    return this;
  }

  /**
   * Divide by scalar
   * @param {number} s 
   * @returns {Vector3D} this
   */
  divideScalar(s) {
    if (s === 0) {
      throw new Error('[Vector3D] Division by zero');
    }
    return this.multiplyScalar(1 / s);
  }

  /**
   * Calculate squared magnitude (faster than magnitude)
   * @returns {number}
   */
  lengthSquared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Calculate magnitude
   * @returns {number}
   */
  length() {
    return Math.sqrt(this.lengthSquared());
  }

  /**
   * Normalize to unit vector
   * @returns {Vector3D} this
   */
  normalize() {
    const len = this.length();
    if (len === 0) {
      return this.set(0, 0, 0);
    }
    return this.divideScalar(len);
  }

  /**
   * Dot product
   * @param {Vector3D} v 
   * @returns {number}
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Cross product (modifies this vector)
   * @param {Vector3D} v 
   * @returns {Vector3D} this
   */
  cross(v) {
    const ax = this.x, ay = this.y, az = this.z;
    const bx = v.x, by = v.y, bz = v.z;
    this._data[0] = ay * bz - az * by;
    this._data[1] = az * bx - ax * bz;
    this._data[2] = ax * by - ay * bx;
    return this;
  }

  /**
   * Distance to another vector
   * @param {Vector3D} v 
   * @returns {number}
   */
  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Squared distance to another vector
   * @param {Vector3D} v 
   * @returns {number}
   */
  distanceToSquared(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Linear interpolation toward another vector
   * @param {Vector3D} v Target vector
   * @param {number} alpha Interpolation factor (0-1)
   * @returns {Vector3D} this
   */
  lerp(v, alpha) {
    this._data[0] += (v.x - this.x) * alpha;
    this._data[1] += (v.y - this.y) * alpha;
    this._data[2] += (v.z - this.z) * alpha;
    return this;
  }

  /**
   * Validate all components are finite
   * @param {string} context - Context for error message
   * @throws {Error} If any component is NaN or Infinity
   */
  validate(context = 'Vector3D') {
    validateFinite(this.x, `${context}.x`);
    validateFinite(this.y, `${context}.y`);
    validateFinite(this.z, `${context}.z`);
    return this;
  }

  /**
   * Check if all components are finite
   * @returns {boolean}
   */
  isFinite() {
    return Number.isFinite(this.x) && 
           Number.isFinite(this.y) && 
           Number.isFinite(this.z);
  }

  /**
   * Convert to plain object for serialization
   * @returns {{x: number, y: number, z: number}}
   */
  toJSON() {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Create from plain object
   * @param {{x: number, y: number, z: number}} obj 
   * @returns {Vector3D}
   */
  static fromJSON(obj) {
    return new Vector3D(obj.x, obj.y, obj.z);
  }

  /**
   * Create from array
   * @param {number[]} arr 
   * @returns {Vector3D}
   */
  static fromArray(arr) {
    return new Vector3D(arr[0] || 0, arr[1] || 0, arr[2] || 0);
  }

  /**
   * Convert to array
   * @returns {number[]}
   */
  toArray() {
    return [this.x, this.y, this.z];
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `Vector3D(${this.x.toExponential(4)}, ${this.y.toExponential(4)}, ${this.z.toExponential(4)})`;
  }

  // Static factory methods

  /**
   * Create zero vector
   * @returns {Vector3D}
   */
  static zero() {
    return new Vector3D(0, 0, 0);
  }

  /**
   * Create unit X vector
   * @returns {Vector3D}
   */
  static unitX() {
    return new Vector3D(1, 0, 0);
  }

  /**
   * Create unit Y vector
   * @returns {Vector3D}
   */
  static unitY() {
    return new Vector3D(0, 1, 0);
  }

  /**
   * Create unit Z vector
   * @returns {Vector3D}
   */
  static unitZ() {
    return new Vector3D(0, 0, 1);
  }

  /**
   * Subtract two vectors and return new vector (a - b)
   * @param {Vector3D} a 
   * @param {Vector3D} b 
   * @returns {Vector3D}
   */
  static sub(a, b) {
    return new Vector3D(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  /**
   * Add two vectors and return new vector
   * @param {Vector3D} a 
   * @param {Vector3D} b 
   * @returns {Vector3D}
   */
  static add(a, b) {
    return new Vector3D(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  /**
   * Multiply vector by scalar and return new vector
   * @param {Vector3D} v 
   * @param {number} s 
   * @returns {Vector3D}
   */
  static multiplyScalar(v, s) {
    return new Vector3D(v.x * s, v.y * s, v.z * s);
  }
}

export default Vector3D;
