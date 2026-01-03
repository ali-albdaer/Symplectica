/**
 * Utility Functions
 * Math, vector operations, and helper functions
 */

window.Utils = {
    // Vector operations
    vec3: {
        create: (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z),
        
        clone: (v) => new THREE.Vector3(v.x, v.y, v.z),
        
        add: (a, b) => new THREE.Vector3(a.x + b.x, a.y + b.y, a.z + b.z),
        
        subtract: (a, b) => new THREE.Vector3(a.x - b.x, a.y - b.y, a.z - b.z),
        
        multiply: (v, scalar) => new THREE.Vector3(v.x * scalar, v.y * scalar, v.z * scalar),
        
        dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
        
        cross: (a, b) => new THREE.Vector3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        ),
        
        length: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
        
        lengthSquared: (v) => v.x * v.x + v.y * v.y + v.z * v.z,
        
        normalize: (v) => {
            const len = Utils.vec3.length(v);
            if (len === 0) return Utils.vec3.create(0, 0, 0);
            return new THREE.Vector3(v.x / len, v.y / len, v.z / len);
        },
        
        distance: (a, b) => Utils.vec3.length(Utils.vec3.subtract(a, b)),
        
        distanceSquared: (a, b) => Utils.vec3.lengthSquared(Utils.vec3.subtract(a, b)),
        
        lerp: (a, b, t) => new THREE.Vector3(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t,
            a.z + (b.z - a.z) * t
        ),
    },

    // Quaternion operations
    quat: {
        create: (x = 0, y = 0, z = 0, w = 1) => new THREE.Quaternion(x, y, z, w),
        
        fromAxisAngle: (axis, angle) => {
            const q = new THREE.Quaternion();
            q.setFromAxisAngle(axis, angle);
            return q;
        },
        
        multiply: (a, b) => {
            const result = new THREE.Quaternion();
            result.multiplyQuaternions(a, b);
            return result;
        },
        
        conjugate: (q) => new THREE.Quaternion(-q.x, -q.y, -q.z, q.w),
        
        rotateVector: (q, v) => {
            const v3 = new THREE.Vector3(v.x, v.y, v.z);
            v3.applyQuaternion(q);
            return v3;
        },
    },

    // Rotation matrices
    matrix: {
        rotationX: (angle) => {
            const m = new THREE.Matrix4();
            m.makeRotationX(angle);
            return m;
        },
        
        rotationY: (angle) => {
            const m = new THREE.Matrix4();
            m.makeRotationY(angle);
            return m;
        },
        
        rotationZ: (angle) => {
            const m = new THREE.Matrix4();
            m.makeRotationZ(angle);
            return m;
        },
        
        fromQuaternion: (q) => {
            const m = new THREE.Matrix4();
            m.makeRotationFromQuaternion(q);
            return m;
        },
    },

    // Physics helper functions
    physics: {
        // Calculate orbital velocity for circular orbit
        orbitalVelocity: (G, parentMass, distance) => {
            return Math.sqrt((G * parentMass) / distance);
        },

        // Calculate escape velocity
        escapeVelocity: (G, mass, radius) => {
            return Math.sqrt((2 * G * mass) / radius);
        },

        // Calculate gravitational force magnitude
        gravitationalForce: (G, mass1, mass2, distance) => {
            return (G * mass1 * mass2) / (distance * distance);
        },

        // Calculate gravitational acceleration
        gravitationalAcceleration: (G, mass, distance) => {
            if (distance === 0) return 0;
            return (G * mass) / (distance * distance);
        },

        // Clamp value
        clamp: (value, min, max) => Math.max(min, Math.min(max, value)),

        // Lerp acceleration for smooth transitions
        lerpAcceleration: (current, target, factor) => {
            return current + (target - current) * factor;
        },
    },

    // Angle conversions
    angle: {
        toRadians: (degrees) => degrees * Math.PI / 180,
        toDegrees: (radians) => radians * 180 / Math.PI,
    },

    // Array utilities
    array: {
        average: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length || 0,
        
        sum: (arr) => arr.reduce((a, b) => a + b, 0),
        
        max: (arr) => Math.max(...arr),
        
        min: (arr) => Math.min(...arr),
        
        clamp: (arr, min, max) => arr.map(v => Math.max(min, Math.min(max, v))),
    },

    // String utilities
    string: {
        formatNumber: (num, decimals = 2) => {
            return num.toFixed(decimals);
        },

        formatLargeNumber: (num) => {
            if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
            if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
            if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
            return num.toFixed(2);
        },

        formatVelocity: (v) => {
            const speed = Utils.vec3.length(v);
            return `${Utils.string.formatNumber(speed, 2)} m/s`;
        },

        formatPosition: (v) => {
            return `[${Utils.string.formatNumber(v.x, 1)}, ${Utils.string.formatNumber(v.y, 1)}, ${Utils.string.formatNumber(v.z, 1)}]`;
        },
    },

    // Object path getter (for nested config access)
    getObjectPath: (obj, path) => {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    },

    setObjectPath: (obj, path, value) => {
        const props = path.split('.');
        let current = obj;
        for (let i = 0; i < props.length - 1; i++) {
            current = current[props[i]];
        }
        current[props[props.length - 1]] = value;
    },

    // Color utilities
    color: {
        toThreeColor: (c) => new THREE.Color(c.r, c.g, c.b),
        
        hexToRgb: (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255,
            } : { r: 1, g: 1, b: 1 };
        },

        rgbToHex: (r, g, b) => {
            return '#' + [r, g, b].map(x => {
                const hex = (x * 255).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        },
    },

    // Random utilities
    random: {
        range: (min, max) => Math.random() * (max - min) + min,
        
        integer: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
        
        vector: (minLen, maxLen) => {
            const len = Utils.random.range(minLen, maxLen);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            return new THREE.Vector3(
                len * Math.sin(phi) * Math.cos(theta),
                len * Math.sin(phi) * Math.sin(theta),
                len * Math.cos(phi)
            );
        },
    },

    // Time utilities
    time: {
        now: () => performance.now() / 1000,
        
        deltaTime: (lastTime) => Utils.time.now() - lastTime,
    },

    // Testing utilities
    test: {
        isVectorFinite: (v) => isFinite(v.x) && isFinite(v.y) && isFinite(v.z),
        
        isVectorNaN: (v) => isNaN(v.x) || isNaN(v.y) || isNaN(v.z),
    },
};

DebugSystem.info('Utility functions loaded');
