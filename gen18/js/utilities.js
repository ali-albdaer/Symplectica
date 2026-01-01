/**
 * Utilities Module
 * Mathematical helpers, vector operations, and common functions
 */
const Utilities = {
    // Vector3 operations
    vec3: {
        create: (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
        
        copy: (v) => new THREE.Vector3(v.x, v.y, v.z),
        
        add: (a, b) => {
            const result = a.clone();
            result.add(b);
            return result;
        },
        
        subtract: (a, b) => {
            const result = a.clone();
            result.sub(b);
            return result;
        },
        
        scale: (v, scalar) => {
            const result = v.clone();
            result.multiplyScalar(scalar);
            return result;
        },
        
        distance: (a, b) => a.distanceTo(b),
        
        normalize: (v) => {
            const result = v.clone();
            result.normalize();
            return result;
        },
        
        magnitude: (v) => v.length(),
        
        dot: (a, b) => a.dot(b),
        
        cross: (a, b) => {
            const result = a.clone();
            result.cross(b);
            return result;
        },
        
        lerp: (a, b, t) => {
            const result = a.clone();
            result.lerp(b, t);
            return result;
        }
    },

    // Quaternion operations
    quat: {
        create: (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w),
        
        copy: (q) => new THREE.Quaternion(q.x, q.y, q.z, q.w),
        
        slerp: (a, b, t) => {
            const result = a.clone();
            result.slerp(b, t);
            return result;
        },
        
        fromAxisAngle: (axis, angle) => {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(axis, angle);
            return q;
        }
    },

    // Math utilities
    math: {
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
        
        lerp: (a, b, t) => a + (b - a) * t,
        
        inverseLerp: (a, b, value) => (value - a) / (b - a),
        
        smoothstep: (edge0, edge1, x) => {
            const t = Utilities.math.clamp((x - edge0) / (edge1 - edge0), 0, 1);
            return t * t * (3 - 2 * t);
        },
        
        map: (value, inMin, inMax, outMin, outMax) => {
            return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
        },
        
        random: (min, max) => Math.random() * (max - min) + min,
        
        randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        randomBool: (probability = 0.5) => Math.random() < probability,
        
        sign: (x) => x > 0 ? 1 : x < 0 ? -1 : 0,
        
        degToRad: (deg) => deg * (Math.PI / 180),
        
        radToDeg: (rad) => rad * (180 / Math.PI),
        
        isPowerOfTwo: (n) => n > 0 && (n & (n - 1)) === 0,
        
        gcd: (a, b) => b === 0 ? a : Utilities.math.gcd(b, a % b),
        
        lcm: (a, b) => Math.abs(a * b) / Utilities.math.gcd(a, b),

        // Physics helpers
        calculateOrbitalVelocity: (centralMass, distance, G = Config.physics.universalG) => {
            // v = sqrt(G*M/r)
            return Math.sqrt((G * centralMass) / distance);
        },

        calculateEscapeVelocity: (mass, radius, G = Config.physics.universalG) => {
            // v = sqrt(2*G*M/r)
            return Math.sqrt((2 * G * mass) / radius);
        },

        calculateGravitationalForce: (mass1, mass2, distance, G = Config.physics.universalG) => {
            // F = G * (M1*M2) / r^2
            if (distance < 0.1) return 0; // Prevent singularity
            return (G * mass1 * mass2) / (distance * distance);
        },

        calculateOrbitalPeriod: (semiMajorAxis, centralMass, G = Config.physics.universalG) => {
            // T = 2*pi*sqrt(a^3/GM)
            return 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / (G * centralMass));
        }
    },

    // Color utilities
    color: {
        hexToRgb: (hex) => {
            const r = (hex >> 16) & 255;
            const g = (hex >> 8) & 255;
            const b = hex & 255;
            return { r: r / 255, g: g / 255, b: b / 255 };
        },

        rgbToHex: (r, g, b) => {
            return ((Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255));
        },

        lerp: (colorA, colorB, t) => {
            const c1 = Utilities.color.hexToRgb(colorA);
            const c2 = Utilities.color.hexToRgb(colorB);
            return Utilities.color.rgbToHex(
                Utilities.math.lerp(c1.r, c2.r, t),
                Utilities.math.lerp(c1.g, c2.g, t),
                Utilities.math.lerp(c1.b, c2.b, t)
            );
        }
    },

    // String utilities
    string: {
        format: (template, ...args) => {
            return template.replace(/{(\d+)}/g, (match, index) => args[index] ?? match);
        },

        padStart: (str, length, padChar = ' ') => {
            return String(str).padStart(length, padChar);
        },

        padEnd: (str, length, padChar = ' ') => {
            return String(str).padEnd(length, padChar);
        },

        truncate: (str, length, suffix = '...') => {
            if (str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        }
    },

    // Array utilities
    array: {
        shuffle: (arr) => {
            const result = [...arr];
            for (let i = result.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [result[i], result[j]] = [result[j], result[i]];
            }
            return result;
        },

        unique: (arr) => [...new Set(arr)],

        flatten: (arr) => arr.reduce((acc, val) => acc.concat(val), []),

        chunk: (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        },

        find: (arr, predicate) => arr.find(predicate),

        findIndex: (arr, predicate) => arr.findIndex(predicate),

        remove: (arr, predicate) => {
            const index = arr.findIndex(predicate);
            if (index > -1) {
                arr.splice(index, 1);
                return true;
            }
            return false;
        }
    },

    // Performance utilities
    performance: {
        now: () => performance.now(),

        measureTime: (fn) => {
            const start = performance.now();
            fn();
            return performance.now() - start;
        },

        measureAsync: async (fn) => {
            const start = performance.now();
            await fn();
            return performance.now() - start;
        }
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utilities;
}
