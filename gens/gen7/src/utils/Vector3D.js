/**
 * 3D Vector Mathematics Utilities
 * Optimized vector operations for physics calculations
 */

export class Vector3D {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Create from object
    static from(obj) {
        return new Vector3D(obj.x, obj.y, obj.z);
    }

    // Clone
    clone() {
        return new Vector3D(this.x, this.y, this.z);
    }

    // Set values
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    // Copy from another vector
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    // Add
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    // Subtract
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    // Multiply by scalar
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    // Divide by scalar
    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        }
        return this;
    }

    // Dot product
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    // Cross product
    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    // Magnitude (length)
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // Squared magnitude (faster, no sqrt)
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    // Distance to another vector
    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    // Squared distance (faster)
    distanceSquaredTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    // Normalize (make unit vector)
    normalize() {
        const mag = this.magnitude();
        if (mag > 0) {
            this.divideScalar(mag);
        }
        return this;
    }

    // Set magnitude
    setMagnitude(length) {
        return this.normalize().multiplyScalar(length);
    }

    // Limit magnitude
    limit(max) {
        const magSq = this.magnitudeSquared();
        if (magSq > max * max) {
            this.normalize().multiplyScalar(max);
        }
        return this;
    }

    // Negate
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    // Linear interpolation
    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    // Check if equal
    equals(v, epsilon = 1e-10) {
        return (
            Math.abs(this.x - v.x) < epsilon &&
            Math.abs(this.y - v.y) < epsilon &&
            Math.abs(this.z - v.z) < epsilon
        );
    }

    // To array
    toArray() {
        return [this.x, this.y, this.z];
    }

    // To string
    toString() {
        return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
    }

    // Static methods for creating new vectors

    static add(v1, v2) {
        return new Vector3D(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
    }

    static sub(v1, v2) {
        return new Vector3D(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
    }

    static multiply(v, s) {
        return new Vector3D(v.x * s, v.y * s, v.z * s);
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    static cross(v1, v2) {
        return new Vector3D(
            v1.y * v2.z - v1.z * v2.y,
            v1.z * v2.x - v1.x * v2.z,
            v1.x * v2.y - v1.y * v2.x
        );
    }

    static distance(v1, v2) {
        return Math.sqrt(
            (v1.x - v2.x) ** 2 +
            (v1.y - v2.y) ** 2 +
            (v1.z - v2.z) ** 2
        );
    }

    static lerp(v1, v2, alpha) {
        return new Vector3D(
            v1.x + (v2.x - v1.x) * alpha,
            v1.y + (v2.y - v1.y) * alpha,
            v1.z + (v2.z - v1.z) * alpha
        );
    }

    static zero() {
        return new Vector3D(0, 0, 0);
    }

    static one() {
        return new Vector3D(1, 1, 1);
    }

    static up() {
        return new Vector3D(0, 1, 0);
    }

    static down() {
        return new Vector3D(0, -1, 0);
    }

    static left() {
        return new Vector3D(-1, 0, 0);
    }

    static right() {
        return new Vector3D(1, 0, 0);
    }

    static forward() {
        return new Vector3D(0, 0, 1);
    }

    static back() {
        return new Vector3D(0, 0, -1);
    }
}

export default Vector3D;
