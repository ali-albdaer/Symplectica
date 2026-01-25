/**
 * Utils.js - Utility Functions Module
 * 
 * Common helper functions used across the application.
 */

const Utils = {
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
     * Random float between min and max
     */
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Random color from array
     */
    randomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    
    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    /**
     * Calculate distance between two 3D points
     */
    distance3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    /**
     * Calculate squared distance (faster, for comparisons)
     */
    distanceSquared3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return dx * dx + dy * dy + dz * dz;
    },
    
    /**
     * Normalize a 3D vector
     */
    normalize3D(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: v.x / length,
            y: v.y / length,
            z: v.z / length
        };
    },
    
    /**
     * Vector magnitude
     */
    magnitude3D(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    },
    
    /**
     * Vector addition
     */
    add3D(v1, v2) {
        return {
            x: v1.x + v2.x,
            y: v1.y + v2.y,
            z: v1.z + v2.z
        };
    },
    
    /**
     * Vector subtraction
     */
    subtract3D(v1, v2) {
        return {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
            z: v1.z - v2.z
        };
    },
    
    /**
     * Vector scalar multiplication
     */
    scale3D(v, scalar) {
        return {
            x: v.x * scalar,
            y: v.y * scalar,
            z: v.z * scalar
        };
    },
    
    /**
     * Dot product
     */
    dot3D(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    },
    
    /**
     * Cross product
     */
    cross3D(v1, v2) {
        return {
            x: v1.y * v2.z - v1.z * v2.y,
            y: v1.z * v2.x - v1.x * v2.z,
            z: v1.x * v2.y - v1.y * v2.x
        };
    },
    
    /**
     * Format number with specified decimal places
     */
    formatNumber(num, decimals = 2) {
        return Number(num).toFixed(decimals);
    },
    
    /**
     * Format large numbers with K, M, B suffixes
     */
    formatLargeNumber(num) {
        if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    },
    
    /**
     * Deep clone an object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Throttle function execution
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Check if value is a number
     */
    isNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    },
    
    /**
     * Spherical to Cartesian coordinates
     */
    sphericalToCartesian(radius, theta, phi) {
        return {
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    },
    
    /**
     * Cartesian to Spherical coordinates
     */
    cartesianToSpherical(x, y, z) {
        const radius = Math.sqrt(x * x + y * y + z * z);
        return {
            radius,
            theta: Math.atan2(z, x),
            phi: Math.acos(y / radius)
        };
    },
    
    /**
     * HSL to RGB conversion (for color generation)
     */
    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    },
    
    /**
     * RGB to Hex color
     */
    rgbToHex(r, g, b) {
        return (r << 16) | (g << 8) | b;
    }
};

export default Utils;
