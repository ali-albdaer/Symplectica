/**
 * Utils.js - Utility Functions and Helpers
 */

export class Utils {
    /**
     * Clamp a value between min and max
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Linear interpolation
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * Smooth step interpolation
     */
    static smoothstep(edge0, edge1, x) {
        const t = Utils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    /**
     * Convert degrees to radians
     */
    static degToRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     */
    static radToDeg(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Calculate orbital velocity for circular orbit
     * v = sqrt(G * M / r)
     */
    static calculateOrbitalVelocity(G, centralMass, orbitalRadius) {
        return Math.sqrt(G * centralMass / orbitalRadius);
    }

    /**
     * Calculate gravitational force between two bodies
     * F = G * m1 * m2 / r^2
     */
    static calculateGravitationalForce(G, mass1, mass2, distance) {
        if (distance < 0.001) return 0;
        return G * mass1 * mass2 / (distance * distance);
    }

    /**
     * Calculate Schwarzschild radius for black hole
     * r_s = 2GM / c^2
     */
    static calculateSchwarzschildRadius(mass, G = 6.674e-11, c = 299792458) {
        return (2 * G * mass) / (c * c);
    }

    /**
     * Format number with SI suffix
     */
    static formatNumber(num, decimals = 2) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const tier = Math.log10(Math.abs(num)) / 3 | 0;
        
        if (tier === 0) return num.toFixed(decimals);
        
        const suffix = suffixes[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = num / scale;
        
        return scaled.toFixed(decimals) + suffix;
    }

    /**
     * Format distance in appropriate units
     */
    static formatDistance(meters) {
        if (meters < 1000) {
            return meters.toFixed(1) + ' m';
        } else if (meters < 1000000) {
            return (meters / 1000).toFixed(2) + ' km';
        } else {
            return (meters / 1000000).toFixed(2) + ' Mm';
        }
    }

    /**
     * Generate UUID
     */
    static generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Deep clone an object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Check if WebGL2 is available
     */
    static isWebGL2Available() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Get performance tier based on device capabilities
     */
    static getPerformanceTier() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) return 'low';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            // Check for integrated graphics
            if (renderer.includes('Intel') || renderer.includes('HD Graphics')) {
                return 'medium';
            }
            // High-end discrete GPUs
            if (renderer.includes('RTX') || renderer.includes('GTX') || 
                renderer.includes('Radeon') || renderer.includes('NVIDIA')) {
                return 'ultra';
            }
        }
        
        return 'medium';
    }

    /**
     * Throttle function execution
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Debounce function execution
     */
    static debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    /**
     * Create a promise that resolves after specified milliseconds
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Map a value from one range to another
     */
    static mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    /**
     * Calculate sphere surface point from lat/lon
     */
    static latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        
        return {
            x: -radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
        };
    }

    /**
     * Calculate distance between two 3D points
     */
    static distance3D(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Normalize a 3D vector
     */
    static normalize3D(v) {
        const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: v.x / length,
            y: v.y / length,
            z: v.z / length
        };
    }

    /**
     * Cross product of two 3D vectors
     */
    static cross3D(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    /**
     * Dot product of two 3D vectors
     */
    static dot3D(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
}

/**
 * Debug Logger with categories
 */
export class DebugLogger {
    constructor() {
        this.logs = [];
        this.maxLogs = 100;
        this.listeners = [];
        this.categories = {
            physics: true,
            render: true,
            input: true,
            player: true,
            system: true,
            error: true
        };
    }

    log(category, message, data = null) {
        if (!this.categories[category] && category !== 'error') return;
        
        const entry = {
            timestamp: Date.now(),
            category,
            message,
            data
        };
        
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Notify listeners
        this.listeners.forEach(listener => listener(entry));
        
        // Also log to console
        const prefix = `[${category.toUpperCase()}]`;
        if (category === 'error') {
            console.error(prefix, message, data || '');
        } else {
            console.log(prefix, message, data || '');
        }
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    physics(message, data = null) {
        this.log('physics', message, data);
    }

    render(message, data = null) {
        this.log('render', message, data);
    }

    input(message, data = null) {
        this.log('input', message, data);
    }

    player(message, data = null) {
        this.log('player', message, data);
    }

    system(message, data = null) {
        this.log('system', message, data);
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    clear() {
        this.logs = [];
    }

    getLogs(category = null) {
        if (category) {
            return this.logs.filter(log => log.category === category);
        }
        return this.logs;
    }

    toggleCategory(category, enabled) {
        this.categories[category] = enabled;
    }
}

// Global logger instance
export const Logger = new DebugLogger();

/**
 * Event Emitter for decoupled communication
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                Logger.error(`Error in event handler for ${event}:`, error);
            }
        });
    }

    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}

// Global event bus
export const EventBus = new EventEmitter();

export default Utils;
