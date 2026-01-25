/**
 * Math Utilities - Extended math functions for physics and 3D calculations
 */

const MathUtils = (function() {
    'use strict';
    
    const DEG_TO_RAD = Math.PI / 180;
    const RAD_TO_DEG = 180 / Math.PI;
    
    return {
        DEG_TO_RAD: DEG_TO_RAD,
        RAD_TO_DEG: RAD_TO_DEG,
        
        /**
         * Clamp a value between min and max
         */
        clamp: function(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },
        
        /**
         * Linear interpolation
         */
        lerp: function(a, b, t) {
            return a + (b - a) * t;
        },
        
        /**
         * Smooth interpolation (ease in-out)
         */
        smoothstep: function(a, b, t) {
            t = this.clamp((t - a) / (b - a), 0, 1);
            return t * t * (3 - 2 * t);
        },
        
        /**
         * Convert degrees to radians
         */
        degToRad: function(degrees) {
            return degrees * DEG_TO_RAD;
        },
        
        /**
         * Convert radians to degrees
         */
        radToDeg: function(radians) {
            return radians * RAD_TO_DEG;
        },
        
        /**
         * Calculate orbital velocity for a circular orbit
         * v = sqrt(G * M / r)
         * @param {number} centralMass - Mass of the central body (kg)
         * @param {number} orbitalRadius - Distance from center (m)
         * @param {number} G - Gravitational constant
         * @returns {number} Orbital velocity (m/s)
         */
        calculateOrbitalVelocity: function(centralMass, orbitalRadius, G) {
            return Math.sqrt(G * centralMass / orbitalRadius);
        },
        
        /**
         * Calculate orbital period
         * T = 2 * PI * sqrt(r^3 / (G * M))
         */
        calculateOrbitalPeriod: function(centralMass, orbitalRadius, G) {
            return 2 * Math.PI * Math.sqrt(Math.pow(orbitalRadius, 3) / (G * centralMass));
        },
        
        /**
         * Calculate gravitational force magnitude
         * F = G * m1 * m2 / r^2
         */
        calculateGravitationalForce: function(m1, m2, distance, G) {
            if (distance === 0) return 0;
            return G * m1 * m2 / (distance * distance);
        },
        
        /**
         * Calculate Schwarzschild radius (for future black hole implementation)
         * rs = 2 * G * M / c^2
         */
        calculateSchwarzschildRadius: function(mass, G, c) {
            return 2 * G * mass / (c * c);
        },
        
        /**
         * Calculate surface gravity
         * g = G * M / r^2
         */
        calculateSurfaceGravity: function(mass, radius, G) {
            if (radius === 0) return 0;
            return G * mass / (radius * radius);
        },
        
        /**
         * Calculate escape velocity
         * v_escape = sqrt(2 * G * M / r)
         */
        calculateEscapeVelocity: function(mass, radius, G) {
            return Math.sqrt(2 * G * mass / radius);
        },
        
        /**
         * Vector3 magnitude
         */
        vectorMagnitude: function(v) {
            return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        },
        
        /**
         * Vector3 distance between two points
         */
        vectorDistance: function(v1, v2) {
            const dx = v2.x - v1.x;
            const dy = v2.y - v1.y;
            const dz = v2.z - v1.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        },
        
        /**
         * Normalize vector (returns new object)
         */
        vectorNormalize: function(v) {
            const mag = this.vectorMagnitude(v);
            if (mag === 0) return { x: 0, y: 0, z: 0 };
            return {
                x: v.x / mag,
                y: v.y / mag,
                z: v.z / mag
            };
        },
        
        /**
         * Scale vector
         */
        vectorScale: function(v, scalar) {
            return {
                x: v.x * scalar,
                y: v.y * scalar,
                z: v.z * scalar
            };
        },
        
        /**
         * Add vectors
         */
        vectorAdd: function(v1, v2) {
            return {
                x: v1.x + v2.x,
                y: v1.y + v2.y,
                z: v1.z + v2.z
            };
        },
        
        /**
         * Subtract vectors (v1 - v2)
         */
        vectorSubtract: function(v1, v2) {
            return {
                x: v1.x - v2.x,
                y: v1.y - v2.y,
                z: v1.z - v2.z
            };
        },
        
        /**
         * Dot product
         */
        vectorDot: function(v1, v2) {
            return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        },
        
        /**
         * Cross product
         */
        vectorCross: function(v1, v2) {
            return {
                x: v1.y * v2.z - v1.z * v2.y,
                y: v1.z * v2.x - v1.x * v2.z,
                z: v1.x * v2.y - v1.y * v2.x
            };
        },
        
        /**
         * Random float between min and max
         */
        randomRange: function(min, max) {
            return min + Math.random() * (max - min);
        },
        
        /**
         * Random integer between min and max (inclusive)
         */
        randomInt: function(min, max) {
            return Math.floor(this.randomRange(min, max + 1));
        },
        
        /**
         * Format large numbers with SI prefixes
         */
        formatSI: function(value, decimals = 2) {
            const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
            let prefixIndex = 0;
            let scaledValue = Math.abs(value);
            
            while (scaledValue >= 1000 && prefixIndex < prefixes.length - 1) {
                scaledValue /= 1000;
                prefixIndex++;
            }
            
            const sign = value < 0 ? '-' : '';
            return sign + scaledValue.toFixed(decimals) + prefixes[prefixIndex];
        },
        
        /**
         * Format distance in appropriate units
         */
        formatDistance: function(meters) {
            if (meters >= 1e12) {
                return (meters / 1.496e11).toFixed(2) + ' AU';
            } else if (meters >= 1e6) {
                return (meters / 1e6).toFixed(2) + ' Mm';
            } else if (meters >= 1e3) {
                return (meters / 1e3).toFixed(2) + ' km';
            } else {
                return meters.toFixed(2) + ' m';
            }
        }
    };
})();
