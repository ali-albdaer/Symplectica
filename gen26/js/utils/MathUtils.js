/**
 * ============================================
 * Math Utilities
 * ============================================
 */

const MathUtils = {
    // Constants
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
    TWO_PI: Math.PI * 2,
    
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
     * Smooth interpolation (ease in-out)
     */
    smoothstep(a, b, t) {
        t = this.clamp((t - a) / (b - a), 0, 1);
        return t * t * (3 - 2 * t);
    },
    
    /**
     * Vector3 operations
     */
    vec3: {
        create(x = 0, y = 0, z = 0) {
            return { x, y, z };
        },
        
        add(a, b) {
            return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
        },
        
        subtract(a, b) {
            return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
        },
        
        multiply(v, scalar) {
            return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
        },
        
        divide(v, scalar) {
            if (scalar === 0) return { x: 0, y: 0, z: 0 };
            return { x: v.x / scalar, y: v.y / scalar, z: v.z / scalar };
        },
        
        dot(a, b) {
            return a.x * b.x + a.y * b.y + a.z * b.z;
        },
        
        cross(a, b) {
            return {
                x: a.y * b.z - a.z * b.y,
                y: a.z * b.x - a.x * b.z,
                z: a.x * b.y - a.y * b.x
            };
        },
        
        length(v) {
            return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        },
        
        lengthSquared(v) {
            return v.x * v.x + v.y * v.y + v.z * v.z;
        },
        
        distance(a, b) {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },
        
        distanceSquared(a, b) {
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            return dx * dx + dy * dy + dz * dz;
        },
        
        normalize(v) {
            const len = this.length(v);
            if (len === 0) return { x: 0, y: 0, z: 0 };
            return { x: v.x / len, y: v.y / len, z: v.z / len };
        },
        
        lerp(a, b, t) {
            return {
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
                z: a.z + (b.z - a.z) * t
            };
        },
        
        clone(v) {
            return { x: v.x, y: v.y, z: v.z };
        },
        
        toArray(v) {
            return [v.x, v.y, v.z];
        },
        
        fromArray(arr) {
            return { x: arr[0] || 0, y: arr[1] || 0, z: arr[2] || 0 };
        },
        
        toThreeVector(v) {
            return new THREE.Vector3(v.x, v.y, v.z);
        },
        
        fromThreeVector(v) {
            return { x: v.x, y: v.y, z: v.z };
        }
    },
    
    /**
     * Calculate orbital velocity for a circular orbit
     * @param {number} G - Gravitational constant
     * @param {number} M - Mass of central body (kg)
     * @param {number} r - Orbital radius (same units as used in G)
     * @returns {number} Orbital velocity
     */
    orbitalVelocity(G, M, r) {
        return Math.sqrt(G * M / r);
    },
    
    /**
     * Calculate orbital period
     * @param {number} G - Gravitational constant
     * @param {number} M - Mass of central body (kg)
     * @param {number} r - Orbital radius
     * @returns {number} Orbital period
     */
    orbitalPeriod(G, M, r) {
        return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * M));
    },
    
    /**
     * Convert spherical coordinates to Cartesian
     * @param {number} radius 
     * @param {number} theta - Polar angle (0 to PI)
     * @param {number} phi - Azimuthal angle (0 to 2PI)
     */
    sphericalToCartesian(radius, theta, phi) {
        return {
            x: radius * Math.sin(theta) * Math.cos(phi),
            y: radius * Math.cos(theta),
            z: radius * Math.sin(theta) * Math.sin(phi)
        };
    },
    
    /**
     * Convert Cartesian to spherical coordinates
     */
    cartesianToSpherical(x, y, z) {
        const radius = Math.sqrt(x * x + y * y + z * z);
        if (radius === 0) return { radius: 0, theta: 0, phi: 0 };
        return {
            radius,
            theta: Math.acos(y / radius),
            phi: Math.atan2(z, x)
        };
    },
    
    /**
     * Convert latitude/longitude to position on sphere
     * @param {number} lat - Latitude in degrees (-90 to 90)
     * @param {number} lon - Longitude in degrees (-180 to 180)
     * @param {number} radius - Sphere radius
     */
    latLonToPosition(lat, lon, radius) {
        const latRad = lat * this.DEG2RAD;
        const lonRad = lon * this.DEG2RAD;
        return {
            x: radius * Math.cos(latRad) * Math.cos(lonRad),
            y: radius * Math.sin(latRad),
            z: radius * Math.cos(latRad) * Math.sin(lonRad)
        };
    },
    
    /**
     * Random number in range
     */
    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },
    
    /**
     * Random integer in range (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Random point on sphere surface
     */
    randomOnSphere(radius = 1) {
        const theta = Math.random() * this.TWO_PI;
        const phi = Math.acos(2 * Math.random() - 1);
        return this.sphericalToCartesian(radius, phi, theta);
    },
    
    /**
     * Format number with SI prefix
     */
    formatSI(num, decimals = 2) {
        const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
        const absNum = Math.abs(num);
        if (absNum < 1000) return num.toFixed(decimals);
        
        const exp = Math.min(Math.floor(Math.log10(absNum) / 3), prefixes.length - 1);
        const scaled = num / Math.pow(1000, exp);
        return scaled.toFixed(decimals) + prefixes[exp];
    },
    
    /**
     * Format number in scientific notation
     */
    formatScientific(num, decimals = 2) {
        if (num === 0) return '0';
        const exp = Math.floor(Math.log10(Math.abs(num)));
        const mantissa = num / Math.pow(10, exp);
        return `${mantissa.toFixed(decimals)}×10^${exp}`;
    }
};

// Freeze to prevent modifications
Object.freeze(MathUtils);
Object.freeze(MathUtils.vec3);
