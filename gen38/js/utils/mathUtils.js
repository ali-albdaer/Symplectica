/**
 * Solar System Simulation - Math Utilities
 * =========================================
 * Mathematical helper functions for physics and rendering.
 */

const MathUtils = {
    // Constants
    TWO_PI: Math.PI * 2,
    HALF_PI: Math.PI / 2,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    
    /**
     * Clamp a value between min and max
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Linear interpolation
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * Smooth step interpolation
     */
    smoothstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    },
    
    /**
     * Smoother step interpolation (Ken Perlin's version)
     */
    smootherstep(edge0, edge1, x) {
        const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * t * (t * (t * 6 - 15) + 10);
    },
    
    /**
     * Map a value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    
    /**
     * Calculate 3D distance
     */
    distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    /**
     * Calculate distance between two Vector3-like objects
     */
    distanceVec3(v1, v2) {
        return this.distance3D(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
    },
    
    /**
     * Calculate magnitude of a vector
     */
    magnitude(x, y, z) {
        return Math.sqrt(x * x + y * y + z * z);
    },
    
    /**
     * Normalize a vector
     */
    normalize(x, y, z) {
        const mag = this.magnitude(x, y, z);
        if (mag === 0) return { x: 0, y: 0, z: 0 };
        return { x: x / mag, y: y / mag, z: z / mag };
    },
    
    /**
     * Dot product of two vectors
     */
    dot(x1, y1, z1, x2, y2, z2) {
        return x1 * x2 + y1 * y2 + z1 * z2;
    },
    
    /**
     * Cross product of two vectors
     */
    cross(x1, y1, z1, x2, y2, z2) {
        return {
            x: y1 * z2 - z1 * y2,
            y: z1 * x2 - x1 * z2,
            z: x1 * y2 - y1 * x2
        };
    },
    
    /**
     * Calculate orbital velocity for circular orbit
     * v = sqrt(G * M / r)
     */
    orbitalVelocity(G, parentMass, radius) {
        return Math.sqrt(G * parentMass / radius);
    },
    
    /**
     * Calculate gravitational force between two masses
     * F = G * m1 * m2 / r²
     */
    gravitationalForce(G, m1, m2, distance) {
        if (distance === 0) return 0;
        return G * m1 * m2 / (distance * distance);
    },
    
    /**
     * Calculate escape velocity
     * v = sqrt(2 * G * M / r)
     */
    escapeVelocity(G, mass, radius) {
        return Math.sqrt(2 * G * mass / radius);
    },
    
    /**
     * Calculate orbital period (Kepler's third law)
     * T = 2π * sqrt(a³ / (G * M))
     */
    orbitalPeriod(G, parentMass, semiMajorAxis) {
        return this.TWO_PI * Math.sqrt(
            Math.pow(semiMajorAxis, 3) / (G * parentMass)
        );
    },
    
    /**
     * Convert spherical coordinates to cartesian
     */
    sphericalToCartesian(radius, theta, phi) {
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    },
    
    /**
     * Convert cartesian to spherical coordinates
     */
    cartesianToSpherical(x, y, z) {
        const radius = this.magnitude(x, y, z);
        return {
            radius: radius,
            theta: Math.atan2(z, x),
            phi: radius === 0 ? 0 : Math.acos(y / radius)
        };
    },
    
    /**
     * Rotate a point around an axis
     */
    rotateAroundAxis(point, axis, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const oneMinusCos = 1 - cos;
        
        // Normalize axis
        const mag = this.magnitude(axis.x, axis.y, axis.z);
        const ax = axis.x / mag;
        const ay = axis.y / mag;
        const az = axis.z / mag;
        
        // Rotation matrix
        const x = point.x * (cos + ax * ax * oneMinusCos) +
                  point.y * (ax * ay * oneMinusCos - az * sin) +
                  point.z * (ax * az * oneMinusCos + ay * sin);
                  
        const y = point.x * (ay * ax * oneMinusCos + az * sin) +
                  point.y * (cos + ay * ay * oneMinusCos) +
                  point.z * (ay * az * oneMinusCos - ax * sin);
                  
        const z = point.x * (az * ax * oneMinusCos - ay * sin) +
                  point.y * (az * ay * oneMinusCos + ax * sin) +
                  point.z * (cos + az * az * oneMinusCos);
        
        return { x, y, z };
    },
    
    /**
     * Generate random number in range
     */
    random(min, max) {
        return min + Math.random() * (max - min);
    },
    
    /**
     * Generate random integer in range (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(this.random(min, max + 1));
    },
    
    /**
     * Generate random point on sphere surface
     */
    randomOnSphere(radius) {
        const theta = this.random(0, this.TWO_PI);
        const phi = Math.acos(this.random(-1, 1));
        return this.sphericalToCartesian(radius, theta, phi);
    },
    
    /**
     * Generate random point inside sphere
     */
    randomInSphere(radius) {
        const r = radius * Math.cbrt(Math.random());
        return this.randomOnSphere(r);
    },
    
    /**
     * Exponential decay
     */
    exponentialDecay(value, target, decay, deltaTime) {
        return target + (value - target) * Math.exp(-decay * deltaTime);
    },
    
    /**
     * Spring physics helper
     */
    spring(current, target, velocity, stiffness, damping, deltaTime) {
        const displacement = current - target;
        const springForce = -stiffness * displacement;
        const dampingForce = -damping * velocity;
        const acceleration = springForce + dampingForce;
        
        const newVelocity = velocity + acceleration * deltaTime;
        const newPosition = current + newVelocity * deltaTime;
        
        return { position: newPosition, velocity: newVelocity };
    },
    
    /**
     * Format large numbers with SI prefixes
     */
    formatSI(number) {
        const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
        const magnitude = Math.floor(Math.log10(Math.abs(number)) / 3);
        const index = this.clamp(magnitude, 0, prefixes.length - 1);
        const scaled = number / Math.pow(10, index * 3);
        return scaled.toFixed(2) + prefixes[index];
    },
    
    /**
     * Format distance in appropriate units
     */
    formatDistance(meters) {
        if (meters < 1000) {
            return meters.toFixed(1) + ' m';
        } else if (meters < 1e6) {
            return (meters / 1000).toFixed(2) + ' km';
        } else if (meters < 1e9) {
            return (meters / 1e6).toFixed(2) + ' Mm';
        } else if (meters < 1.496e11) {
            return (meters / 1e9).toFixed(3) + ' Gm';
        } else {
            return (meters / 1.496e11).toFixed(4) + ' AU';
        }
    },
    
    /**
     * Check if two spheres intersect
     */
    sphereIntersection(pos1, r1, pos2, r2) {
        const dist = this.distanceVec3(pos1, pos2);
        return dist <= (r1 + r2);
    },
    
    /**
     * Calculate surface gravity
     * g = G * M / r²
     */
    surfaceGravity(G, mass, radius) {
        return G * mass / (radius * radius);
    },
    
    /**
     * Angle between two vectors (radians)
     */
    angleBetween(v1, v2) {
        const dot = this.dot(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
        const mag1 = this.magnitude(v1.x, v1.y, v1.z);
        const mag2 = this.magnitude(v2.x, v2.y, v2.z);
        return Math.acos(this.clamp(dot / (mag1 * mag2), -1, 1));
    },
    
    /**
     * Project vector onto plane
     */
    projectOnPlane(vector, normal) {
        const dot = this.dot(vector.x, vector.y, vector.z, normal.x, normal.y, normal.z);
        return {
            x: vector.x - dot * normal.x,
            y: vector.y - dot * normal.y,
            z: vector.z - dot * normal.z
        };
    },
    
    /**
     * Reflect vector over normal
     */
    reflect(vector, normal) {
        const dot = 2 * this.dot(vector.x, vector.y, vector.z, normal.x, normal.y, normal.z);
        return {
            x: vector.x - dot * normal.x,
            y: vector.y - dot * normal.y,
            z: vector.z - dot * normal.z
        };
    }
};

// Freeze to prevent modifications
Object.freeze(MathUtils);
