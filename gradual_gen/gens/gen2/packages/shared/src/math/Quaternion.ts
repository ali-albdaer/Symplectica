/**
 * Quaternion Class for Rotations
 * ===============================
 * Used for orientation and rotation interpolation.
 * Avoids gimbal lock issues present in Euler angles.
 */

import { Vector3 } from './Vector3.js';

export class Quaternion {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Create identity quaternion (no rotation)
   */
  static identity(): Quaternion {
    return new Quaternion(0, 0, 0, 1);
  }

  /**
   * Clone this quaternion
   */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Copy from another quaternion
   */
  copy(q: Quaternion): this {
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
    return this;
  }

  /**
   * Set components
   */
  set(x: number, y: number, z: number, w: number): this {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  /**
   * Set from axis-angle representation
   * @param axis Normalized axis vector
   * @param angle Angle in radians
   */
  setFromAxisAngle(axis: Vector3, angle: number): this {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    this.x = axis.x * s;
    this.y = axis.y * s;
    this.z = axis.z * s;
    this.w = Math.cos(halfAngle);
    return this;
  }

  /**
   * Set from Euler angles (XYZ order)
   * @param x Pitch in radians
   * @param y Yaw in radians
   * @param z Roll in radians
   */
  setFromEuler(x: number, y: number, z: number): this {
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);
    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    this.x = s1 * c2 * c3 + c1 * s2 * s3;
    this.y = c1 * s2 * c3 - s1 * c2 * s3;
    this.z = c1 * c2 * s3 + s1 * s2 * c3;
    this.w = c1 * c2 * c3 - s1 * s2 * s3;

    return this;
  }

  /**
   * Convert to Euler angles (XYZ order)
   */
  toEuler(): { x: number; y: number; z: number } {
    const sinr_cosp = 2 * (this.w * this.x + this.y * this.z);
    const cosr_cosp = 1 - 2 * (this.x * this.x + this.y * this.y);
    const x = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (this.w * this.y - this.z * this.x);
    let y: number;
    if (Math.abs(sinp) >= 1) {
      y = Math.sign(sinp) * Math.PI / 2;
    } else {
      y = Math.asin(sinp);
    }

    const siny_cosp = 2 * (this.w * this.z + this.x * this.y);
    const cosy_cosp = 1 - 2 * (this.y * this.y + this.z * this.z);
    const z = Math.atan2(siny_cosp, cosy_cosp);

    return { x, y, z };
  }

  /**
   * Squared length
   */
  lengthSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /**
   * Length
   */
  length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  /**
   * Normalize the quaternion
   */
  normalize(): this {
    const len = this.length();
    if (len === 0) {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    } else {
      const inv = 1 / len;
      this.x *= inv;
      this.y *= inv;
      this.z *= inv;
      this.w *= inv;
    }
    return this;
  }

  /**
   * Conjugate (inverse for unit quaternions)
   */
  conjugate(): this {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }

  /**
   * Multiply by another quaternion
   */
  multiply(q: Quaternion): this {
    const ax = this.x, ay = this.y, az = this.z, aw = this.w;
    const bx = q.x, by = q.y, bz = q.z, bw = q.w;

    this.x = ax * bw + aw * bx + ay * bz - az * by;
    this.y = ay * bw + aw * by + az * bx - ax * bz;
    this.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;

    return this;
  }

  /**
   * Static multiply
   */
  static multiply(a: Quaternion, b: Quaternion): Quaternion {
    return a.clone().multiply(b);
  }

  /**
   * Pre-multiply by another quaternion
   */
  premultiply(q: Quaternion): this {
    const ax = q.x, ay = q.y, az = q.z, aw = q.w;
    const bx = this.x, by = this.y, bz = this.z, bw = this.w;

    this.x = ax * bw + aw * bx + ay * bz - az * by;
    this.y = ay * bw + aw * by + az * bx - ax * bz;
    this.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;

    return this;
  }

  /**
   * Rotate a vector by this quaternion
   */
  rotateVector(v: Vector3): Vector3 {
    const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
    const vx = v.x, vy = v.y, vz = v.z;

    // Calculate quat * vec
    const ix = qw * vx + qy * vz - qz * vy;
    const iy = qw * vy + qz * vx - qx * vz;
    const iz = qw * vz + qx * vy - qy * vx;
    const iw = -qx * vx - qy * vy - qz * vz;

    // Calculate result * inverse quat
    return new Vector3(
      ix * qw + iw * -qx + iy * -qz - iz * -qy,
      iy * qw + iw * -qy + iz * -qx - ix * -qz,
      iz * qw + iw * -qz + ix * -qy - iy * -qx
    );
  }

  /**
   * Spherical linear interpolation
   */
  slerp(q: Quaternion, t: number): this {
    if (t === 0) return this;
    if (t === 1) return this.copy(q);

    let cosHalfTheta = this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;

    // Ensure we take the shortest path
    let qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    if (cosHalfTheta < 0) {
      qx = -qx;
      qy = -qy;
      qz = -qz;
      qw = -qw;
      cosHalfTheta = -cosHalfTheta;
    }

    if (cosHalfTheta >= 1.0) {
      return this;
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this.x = s * this.x + t * qx;
      this.y = s * this.y + t * qy;
      this.z = s * this.z + t * qz;
      this.w = s * this.w + t * qw;
      return this.normalize();
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.x = this.x * ratioA + qx * ratioB;
    this.y = this.y * ratioA + qy * ratioB;
    this.z = this.z * ratioA + qz * ratioB;
    this.w = this.w * ratioA + qw * ratioB;

    return this;
  }

  /**
   * Static slerp
   */
  static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    return a.clone().slerp(b, t);
  }

  /**
   * Create quaternion that rotates from vector a to vector b
   */
  static fromVectors(a: Vector3, b: Vector3): Quaternion {
    const q = new Quaternion();
    const dot = a.dot(b);

    if (dot < -0.999999) {
      // Vectors are opposite; find an orthogonal vector
      let orthogonal = Vector3.cross(Vector3.unitX(), a);
      if (orthogonal.lengthSquared() < 0.000001) {
        orthogonal = Vector3.cross(Vector3.unitY(), a);
      }
      orthogonal.normalize();
      q.setFromAxisAngle(orthogonal, Math.PI);
    } else if (dot > 0.999999) {
      // Vectors are the same
      q.set(0, 0, 0, 1);
    } else {
      const cross = Vector3.cross(a, b);
      q.x = cross.x;
      q.y = cross.y;
      q.z = cross.z;
      q.w = 1 + dot;
      q.normalize();
    }

    return q;
  }

  /**
   * Dot product
   */
  dot(q: Quaternion): number {
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
  }

  /**
   * Check equality
   */
  equals(q: Quaternion, epsilon: number = 1e-10): boolean {
    return (
      Math.abs(this.x - q.x) < epsilon &&
      Math.abs(this.y - q.y) < epsilon &&
      Math.abs(this.z - q.z) < epsilon &&
      Math.abs(this.w - q.w) < epsilon
    );
  }

  /**
   * Convert to array
   */
  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }

  /**
   * Create from array
   */
  static fromArray(arr: readonly number[]): Quaternion {
    return new Quaternion(arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 0, arr[3] ?? 1);
  }

  /**
   * String representation
   */
  toString(): string {
    return `Quaternion(${this.x.toFixed(6)}, ${this.y.toFixed(6)}, ${this.z.toFixed(6)}, ${this.w.toFixed(6)})`;
  }

  /**
   * Get the axis of rotation
   */
  getAxis(): Vector3 {
    const sinHalfAngle = Math.sqrt(1 - this.w * this.w);
    if (sinHalfAngle < 0.0001) {
      return new Vector3(1, 0, 0);
    }
    return new Vector3(
      this.x / sinHalfAngle,
      this.y / sinHalfAngle,
      this.z / sinHalfAngle
    );
  }

  /**
   * Get the angle of rotation in radians
   */
  getAngle(): number {
    return 2 * Math.acos(Math.max(-1, Math.min(1, this.w)));
  }
}
