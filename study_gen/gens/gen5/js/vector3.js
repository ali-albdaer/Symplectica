/**
 * vector3.js - Pure Mathematical 3D Vector Operations
 * 
 * This module provides vector math for physics calculations,
 * independent of Three.js to maintain separation of concerns.
 * 
 * Designed for:
 * - Physics calculations (gravity, momentum)
 * - Deterministic operations (no floating-point variance from library code)
 * - Potential future porting to WebAssembly or GPU compute
 * 
 * Note: For rendering, Three.js Vector3 is used separately.
 */

/**
 * Lightweight 3D vector class for physics calculations
 * Immutable-style operations return new vectors to prevent side effects
 */
export class Vec3 {
    /**
     * Create a new Vec3
     * @param {number} x - X component
     * @param {number} y - Y component  
     * @param {number} z - Z component
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Create a Vec3 from an array [x, y, z]
     * @param {number[]} arr - Array of 3 numbers
     * @returns {Vec3} New vector
     */
    static fromArray(arr) {
        return new Vec3(arr[0] || 0, arr[1] || 0, arr[2] || 0);
    }

    /**
     * Create a Vec3 from an object with x, y, z properties
     * @param {Object} obj - Object with x, y, z
     * @returns {Vec3} New vector
     */
    static fromObject(obj) {
        return new Vec3(obj.x || 0, obj.y || 0, obj.z || 0);
    }

    /**
     * Create a zero vector
     * @returns {Vec3} Zero vector
     */
    static zero() {
        return new Vec3(0, 0, 0);
    }

    /**
     * Create a unit vector along X axis
     * @returns {Vec3} Unit X vector
     */
    static unitX() {
        return new Vec3(1, 0, 0);
    }

    /**
     * Create a unit vector along Y axis
     * @returns {Vec3} Unit Y vector
     */
    static unitY() {
        return new Vec3(0, 1, 0);
    }

    /**
     * Create a unit vector along Z axis
     * @returns {Vec3} Unit Z vector
     */
    static unitZ() {
        return new Vec3(0, 0, 1);
    }

    /**
     * Clone this vector
     * @returns {Vec3} New vector with same components
     */
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }

    /**
     * Copy components from another vector
     * @param {Vec3} v - Source vector
     * @returns {Vec3} This vector (for chaining)
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Set components
     * @param {number} x - X component
     * @param {number} y - Y component
     * @param {number} z - Z component
     * @returns {Vec3} This vector (for chaining)
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Convert to array
     * @returns {number[]} Array [x, y, z]
     */
    toArray() {
        return [this.x, this.y, this.z];
    }

    /**
     * Convert to plain object
     * @returns {Object} Object {x, y, z}
     */
    toObject() {
        return { x: this.x, y: this.y, z: this.z };
    }

    // ========== Arithmetic Operations (return new vectors) ==========

    /**
     * Add another vector
     * @param {Vec3} v - Vector to add
     * @returns {Vec3} New result vector
     */
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Subtract another vector
     * @param {Vec3} v - Vector to subtract
     * @returns {Vec3} New result vector
     */
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    /**
     * Multiply by scalar
     * @param {number} s - Scalar multiplier
     * @returns {Vec3} New result vector
     */
    mul(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    /**
     * Divide by scalar
     * @param {number} s - Scalar divisor
     * @returns {Vec3} New result vector
     */
    div(s) {
        if (s === 0) {
            console.warn('Vec3.div: Division by zero');
            return new Vec3(0, 0, 0);
        }
        return new Vec3(this.x / s, this.y / s, this.z / s);
    }

    /**
     * Negate the vector
     * @returns {Vec3} New negated vector
     */
    negate() {
        return new Vec3(-this.x, -this.y, -this.z);
    }

    // ========== In-place Operations (modify this vector) ==========

    /**
     * Add another vector in-place
     * @param {Vec3} v - Vector to add
     * @returns {Vec3} This vector (for chaining)
     */
    addSelf(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Subtract another vector in-place
     * @param {Vec3} v - Vector to subtract
     * @returns {Vec3} This vector (for chaining)
     */
    subSelf(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Multiply by scalar in-place
     * @param {number} s - Scalar multiplier
     * @returns {Vec3} This vector (for chaining)
     */
    mulSelf(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    /**
     * Divide by scalar in-place
     * @param {number} s - Scalar divisor
     * @returns {Vec3} This vector (for chaining)
     */
    divSelf(s) {
        if (s === 0) {
            console.warn('Vec3.divSelf: Division by zero');
            return this;
        }
        this.x /= s;
        this.y /= s;
        this.z /= s;
        return this;
    }

    /**
     * Add scaled vector in-place: this += v * s
     * Common operation in physics integrators
     * @param {Vec3} v - Vector to add
     * @param {number} s - Scale factor
     * @returns {Vec3} This vector (for chaining)
     */
    addScaledSelf(v, s) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;
        return this;
    }

    // ========== Vector Operations ==========

    /**
     * Dot product with another vector
     * @param {Vec3} v - Other vector
     * @returns {number} Dot product
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Cross product with another vector
     * @param {Vec3} v - Other vector
     * @returns {Vec3} New cross product vector
     */
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    /**
     * Squared magnitude (length squared)
     * Faster than magnitude when comparing distances
     * @returns {number} Squared magnitude
     */
    magnitudeSquared() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Magnitude (length) of the vector
     * @returns {number} Magnitude
     */
    magnitude() {
        return Math.sqrt(this.magnitudeSquared());
    }

    /**
     * Alias for magnitude
     * @returns {number} Length
     */
    length() {
        return this.magnitude();
    }

    /**
     * Squared distance to another vector
     * @param {Vec3} v - Other vector
     * @returns {number} Squared distance
     */
    distanceSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Distance to another vector
     * @param {Vec3} v - Other vector
     * @returns {number} Distance
     */
    distance(v) {
        return Math.sqrt(this.distanceSquared(v));
    }

    /**
     * Normalize to unit length
     * @returns {Vec3} New normalized vector
     */
    normalize() {
        const mag = this.magnitude();
        if (mag === 0) {
            return new Vec3(0, 0, 0);
        }
        return this.div(mag);
    }

    /**
     * Normalize in-place
     * @returns {Vec3} This vector (for chaining)
     */
    normalizeSelf() {
        const mag = this.magnitude();
        if (mag === 0) {
            return this;
        }
        return this.divSelf(mag);
    }

    /**
     * Linear interpolation to another vector
     * @param {Vec3} v - Target vector
     * @param {number} t - Interpolation factor (0-1)
     * @returns {Vec3} New interpolated vector
     */
    lerp(v, t) {
        return new Vec3(
            this.x + (v.x - this.x) * t,
            this.y + (v.y - this.y) * t,
            this.z + (v.z - this.z) * t
        );
    }

    /**
     * Component-wise minimum
     * @param {Vec3} v - Other vector
     * @returns {Vec3} New vector with min components
     */
    min(v) {
        return new Vec3(
            Math.min(this.x, v.x),
            Math.min(this.y, v.y),
            Math.min(this.z, v.z)
        );
    }

    /**
     * Component-wise maximum
     * @param {Vec3} v - Other vector
     * @returns {Vec3} New vector with max components
     */
    max(v) {
        return new Vec3(
            Math.max(this.x, v.x),
            Math.max(this.y, v.y),
            Math.max(this.z, v.z)
        );
    }

    /**
     * Clamp components between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Vec3} New clamped vector
     */
    clamp(min, max) {
        return new Vec3(
            Math.max(min, Math.min(max, this.x)),
            Math.max(min, Math.min(max, this.y)),
            Math.max(min, Math.min(max, this.z))
        );
    }

    /**
     * Project this vector onto another vector
     * @param {Vec3} v - Vector to project onto
     * @returns {Vec3} Projected vector
     */
    projectOnto(v) {
        const vMagSq = v.magnitudeSquared();
        if (vMagSq === 0) {
            return Vec3.zero();
        }
        const scalar = this.dot(v) / vMagSq;
        return v.mul(scalar);
    }

    /**
     * Reflect this vector off a surface with given normal
     * @param {Vec3} normal - Surface normal (should be normalized)
     * @returns {Vec3} Reflected vector
     */
    reflect(normal) {
        const d = 2 * this.dot(normal);
        return this.sub(normal.mul(d));
    }

    /**
     * Check if approximately equal to another vector
     * @param {Vec3} v - Other vector
     * @param {number} epsilon - Tolerance (default 1e-10)
     * @returns {boolean} True if approximately equal
     */
    equals(v, epsilon = 1e-10) {
        return (
            Math.abs(this.x - v.x) < epsilon &&
            Math.abs(this.y - v.y) < epsilon &&
            Math.abs(this.z - v.z) < epsilon
        );
    }

    /**
     * Check if this is a zero vector
     * @param {number} epsilon - Tolerance
     * @returns {boolean} True if zero
     */
    isZero(epsilon = 1e-10) {
        return this.magnitudeSquared() < epsilon * epsilon;
    }

    /**
     * Check if any component is NaN or Infinite
     * @returns {boolean} True if valid (finite)
     */
    isFinite() {
        return (
            Number.isFinite(this.x) &&
            Number.isFinite(this.y) &&
            Number.isFinite(this.z)
        );
    }

    /**
     * String representation
     * @param {number} precision - Decimal places
     * @returns {string} Formatted string
     */
    toString(precision = 4) {
        return `Vec3(${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.z.toFixed(precision)})`;
    }
}

// ========== Static Utility Functions ==========

/**
 * Compute gravitational acceleration vector from body A towards body B
 * @param {Vec3} posA - Position of body A
 * @param {Vec3} posB - Position of body B
 * @param {number} massB - Mass of body B (kg)
 * @param {number} G - Gravitational constant
 * @param {number} softening - Softening parameter to avoid singularities
 * @returns {Vec3} Acceleration vector on body A due to B
 */
export function gravitationalAcceleration(posA, posB, massB, G, softening = 0) {
    const r = posB.sub(posA);
    const distSq = r.magnitudeSquared() + softening * softening;
    const dist = Math.sqrt(distSq);
    
    if (dist === 0) {
        return Vec3.zero();
    }
    
    // a = G * M / r² * r_hat
    const accelMag = (G * massB) / distSq;
    return r.mul(accelMag / dist);
}

/**
 * Compute the center of mass of a system of bodies
 * @param {Array<{position: Vec3, mass: number}>} bodies - Array of bodies
 * @returns {{position: Vec3, mass: number}} Center of mass position and total mass
 */
export function centerOfMass(bodies) {
    let totalMass = 0;
    let com = Vec3.zero();
    
    for (const body of bodies) {
        totalMass += body.mass;
        com = com.add(body.position.mul(body.mass));
    }
    
    if (totalMass === 0) {
        return { position: Vec3.zero(), mass: 0 };
    }
    
    return {
        position: com.div(totalMass),
        mass: totalMass
    };
}

/**
 * Compute total linear momentum of a system
 * @param {Array<{velocity: Vec3, mass: number}>} bodies - Array of bodies
 * @returns {Vec3} Total momentum vector
 */
export function totalMomentum(bodies) {
    let momentum = Vec3.zero();
    for (const body of bodies) {
        momentum = momentum.add(body.velocity.mul(body.mass));
    }
    return momentum;
}

/**
 * Compute total angular momentum of a system about the origin
 * @param {Array<{position: Vec3, velocity: Vec3, mass: number}>} bodies - Array of bodies
 * @returns {Vec3} Total angular momentum vector
 */
export function totalAngularMomentum(bodies) {
    let L = Vec3.zero();
    for (const body of bodies) {
        // L = r × p = r × (m * v)
        const p = body.velocity.mul(body.mass);
        L = L.add(body.position.cross(p));
    }
    return L;
}

export default Vec3;
