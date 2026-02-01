/**
 * body.js - Celestial Body Data Structure and Factory
 * 
 * Defines the Body class representing celestial objects in the simulation.
 * Designed for:
 * - Complete serialization (for save/load and future networking)
 * - Data-oriented access (physics state separate from visual state)
 * - Type-specific properties (black holes, pulsars, etc.)
 */

import { Vec3 } from './vector3.js';
import { 
    G, C, SCHWARZSCHILD_COEFF, SOLAR_MASS, EARTH_MASS, SOLAR_RADIUS, 
    EARTH_RADIUS, NEUTRON_STAR_MASS, NEUTRON_STAR_RADIUS, Units 
} from './constants.js';

// Unique ID counter for bodies
let nextBodyId = 1;

/**
 * Generate a unique body ID
 * @returns {number} Unique ID
 */
export function generateBodyId() {
    return nextBodyId++;
}

/**
 * Reset body ID counter (for testing or scene reset)
 * @param {number} startId - Starting ID value
 */
export function resetBodyIdCounter(startId = 1) {
    nextBodyId = startId;
}

/**
 * Body types enumeration
 */
export const BodyType = {
    STAR: 'star',
    PLANET: 'planet',
    MOON: 'moon',
    COMET: 'comet',
    SPACESHIP: 'spaceship',
    BLACK_HOLE: 'blackhole',
    NEUTRON_STAR: 'neutronstar',
    PULSAR: 'pulsar',
    MAGNETAR: 'magnetar',
};

/**
 * Check if a body type is a compact object (requires special physics)
 * @param {string} type - Body type
 * @returns {boolean} True if compact object
 */
export function isCompactObject(type) {
    return [
        BodyType.BLACK_HOLE,
        BodyType.NEUTRON_STAR,
        BodyType.PULSAR,
        BodyType.MAGNETAR
    ].includes(type);
}

/**
 * Check if a body type is luminous
 * @param {string} type - Body type
 * @returns {boolean} True if luminous
 */
export function isLuminous(type) {
    return [
        BodyType.STAR,
        BodyType.PULSAR,
        BodyType.MAGNETAR
    ].includes(type);
}

/**
 * Celestial Body class
 * 
 * Contains all physical and metadata for a single celestial object.
 * Physics state (position, velocity) uses Vec3 for calculations.
 */
export class Body {
    /**
     * Create a new Body
     * @param {Object} params - Body parameters
     */
    constructor(params = {}) {
        // ========== Identity ==========
        /** @type {number} Unique identifier */
        this.id = params.id ?? generateBodyId();
        
        /** @type {string} Display name */
        this.name = params.name ?? `Body ${this.id}`;
        
        /** @type {string} Body type (from BodyType enum) */
        this.type = params.type ?? BodyType.PLANET;

        // ========== Physical State (SI Units) ==========
        /** @type {Vec3} Position in meters */
        this.position = params.position instanceof Vec3 
            ? params.position.clone() 
            : new Vec3(params.x ?? 0, params.y ?? 0, params.z ?? 0);
        
        /** @type {Vec3} Velocity in m/s */
        this.velocity = params.velocity instanceof Vec3
            ? params.velocity.clone()
            : new Vec3(params.vx ?? 0, params.vy ?? 0, params.vz ?? 0);
        
        /** @type {number} Mass in kg */
        this.mass = params.mass ?? EARTH_MASS;
        
        /** @type {number} Physical radius in meters */
        this.radius = params.radius ?? this._defaultRadius();

        // ========== Dynamics (computed during simulation) ==========
        /** @type {Vec3} Current acceleration (computed each step) */
        this.acceleration = new Vec3(0, 0, 0);
        
        /** @type {Vec3} Previous acceleration (for some integrators) */
        this.prevAcceleration = new Vec3(0, 0, 0);

        // ========== Softening ==========
        /** 
         * @type {number} Per-body softening parameter in meters
         * Used to prevent singularities in close encounters
         */
        this.softening = params.softening ?? 0;

        // ========== Type-Specific Properties ==========
        
        // Luminosity (for stars and some compact objects)
        /** @type {number} Luminosity in Watts (solar luminosity = 3.828e26 W) */
        this.luminosity = params.luminosity ?? (isLuminous(this.type) ? 3.828e26 : 0);
        
        // Black hole specific
        if (this.type === BodyType.BLACK_HOLE) {
            /** @type {number} Schwarzschild radius in meters */
            this.schwarzschildRadius = params.schwarzschildRadius ?? 
                SCHWARZSCHILD_COEFF * this.mass;
            /** @type {number} Event horizon radius (= Schwarzschild for non-rotating) */
            this.eventHorizonRadius = this.schwarzschildRadius;
            // Override physical radius to event horizon
            this.radius = this.eventHorizonRadius;
        }

        // Pulsar specific
        if (this.type === BodyType.PULSAR || this.type === BodyType.MAGNETAR) {
            /** @type {number} Rotation period in seconds */
            this.rotationPeriod = params.rotationPeriod ?? 0.033; // ~30ms, typical pulsar
            /** @type {number} Pulse frequency in Hz */
            this.pulseFrequency = params.pulseFrequency ?? (1 / this.rotationPeriod);
            /** @type {number} Beam angle in radians */
            this.beamAngle = params.beamAngle ?? 0.1;
            /** @type {number} Current rotation phase (0 to 2π) */
            this.rotationPhase = params.rotationPhase ?? 0;
        }

        // Magnetar specific
        if (this.type === BodyType.MAGNETAR) {
            /** 
             * @type {number} Magnetic field strength proxy (in Tesla)
             * Typical magnetar: 10^10 to 10^11 T
             * (Note: This is for visualization, not physics simulation)
             */
            this.magneticFieldStrength = params.magneticFieldStrength ?? 1e10;
        }

        // Comet specific
        if (this.type === BodyType.COMET) {
            /** @type {number} Tail length multiplier (visual) */
            this.tailLength = params.tailLength ?? 1.0;
        }

        // ========== Visual Properties ==========
        /** @type {string|null} Texture path or ID */
        this.textureId = params.textureId ?? null;
        
        /** @type {number} Color as hex number (fallback if no texture) */
        this.color = params.color ?? this._defaultColor();
        
        /** @type {number} Emissive intensity (0-1) */
        this.emissive = params.emissive ?? (isLuminous(this.type) ? 1.0 : 0);
        
        /** @type {boolean} Whether to render atmosphere */
        this.hasAtmosphere = params.hasAtmosphere ?? (this.type === BodyType.PLANET);

        // ========== Roche Limit (computed if needed) ==========
        /** @type {number|null} Roche limit for this body in meters (if applicable) */
        this.rocheLimit = params.rocheLimit ?? null;

        // ========== Simulation State ==========
        /** @type {boolean} Whether body is fixed (immovable) */
        this.isFixed = params.isFixed ?? false;
        
        /** @type {boolean} Whether body participates in gravity calculations */
        this.isGravitySource = params.isGravitySource ?? true;
        
        /** @type {boolean} Whether body is affected by gravity from others */
        this.isGravityTarget = params.isGravityTarget ?? true;

        // ========== Trail (for visualization) ==========
        /** @type {Vec3[]} Position history for trail rendering */
        this.trail = [];
        
        /** @type {number} Maximum trail points to keep */
        this.maxTrailPoints = params.maxTrailPoints ?? 200;

        // ========== Selection State (UI) ==========
        /** @type {boolean} Whether body is currently selected */
        this.isSelected = false;

        // ========== Metadata ==========
        /** @type {number} Simulation time when body was created (seconds) */
        this.createdAt = params.createdAt ?? 0;
        
        /** @type {Object} Additional custom data */
        this.userData = params.userData ?? {};
    }

    /**
     * Get default radius based on body type
     * @returns {number} Default radius in meters
     * @private
     */
    _defaultRadius() {
        switch (this.type) {
            case BodyType.STAR:
                return SOLAR_RADIUS;
            case BodyType.PLANET:
                return EARTH_RADIUS;
            case BodyType.MOON:
                return EARTH_RADIUS * 0.27;
            case BodyType.COMET:
                return 5000; // 5 km
            case BodyType.SPACESHIP:
                return 100; // 100 m
            case BodyType.BLACK_HOLE:
                return SCHWARZSCHILD_COEFF * this.mass;
            case BodyType.NEUTRON_STAR:
            case BodyType.PULSAR:
            case BodyType.MAGNETAR:
                return NEUTRON_STAR_RADIUS;
            default:
                return EARTH_RADIUS;
        }
    }

    /**
     * Get default color based on body type
     * @returns {number} Color as hex
     * @private
     */
    _defaultColor() {
        switch (this.type) {
            case BodyType.STAR:
                return 0xffdd44;
            case BodyType.PLANET:
                return 0x4488ff;
            case BodyType.MOON:
                return 0xaabbcc;
            case BodyType.COMET:
                return 0x88ffff;
            case BodyType.SPACESHIP:
                return 0xff88ff;
            case BodyType.BLACK_HOLE:
                return 0x000000;
            case BodyType.NEUTRON_STAR:
                return 0x44ffff;
            case BodyType.PULSAR:
                return 0xffff44;
            case BodyType.MAGNETAR:
                return 0xff44ff;
            default:
                return 0xffffff;
        }
    }

    /**
     * Update the trail with current position
     * Called each simulation step for visualization
     */
    updateTrail() {
        this.trail.push(this.position.clone());
        while (this.trail.length > this.maxTrailPoints) {
            this.trail.shift();
        }
    }

    /**
     * Clear the trail history
     */
    clearTrail() {
        this.trail = [];
    }

    /**
     * Compute kinetic energy
     * @returns {number} Kinetic energy in Joules
     */
    kineticEnergy() {
        return 0.5 * this.mass * this.velocity.magnitudeSquared();
    }

    /**
     * Compute momentum
     * @returns {Vec3} Momentum vector in kg·m/s
     */
    momentum() {
        return this.velocity.mul(this.mass);
    }

    /**
     * Compute angular momentum about origin
     * @returns {Vec3} Angular momentum vector in kg·m²/s
     */
    angularMomentum() {
        return this.position.cross(this.momentum());
    }

    /**
     * Compute Roche limit for a satellite orbiting this body
     * @param {number} satelliteDensity - Density of satellite in kg/m³
     * @returns {number} Roche limit in meters
     */
    computeRocheLimit(satelliteDensity) {
        // Roche limit ≈ 2.44 * R_primary * (ρ_primary / ρ_satellite)^(1/3)
        const primaryDensity = this.mass / ((4/3) * Math.PI * Math.pow(this.radius, 3));
        const densityRatio = primaryDensity / satelliteDensity;
        return 2.44 * this.radius * Math.pow(densityRatio, 1/3);
    }

    /**
     * Compute escape velocity at surface
     * @returns {number} Escape velocity in m/s
     */
    escapeVelocity() {
        return Math.sqrt(2 * G * this.mass / this.radius);
    }

    /**
     * Compute orbital velocity for a circular orbit at given distance
     * @param {number} orbitRadius - Orbital radius in meters
     * @returns {number} Orbital velocity in m/s
     */
    orbitalVelocity(orbitRadius) {
        return Math.sqrt(G * this.mass / orbitRadius);
    }

    /**
     * Compute Hill sphere radius (sphere of gravitational influence)
     * @param {number} semiMajorAxis - Semi-major axis of orbit in meters
     * @param {number} primaryMass - Mass of the primary body in kg
     * @returns {number} Hill sphere radius in meters
     */
    hillSphereRadius(semiMajorAxis, primaryMass) {
        return semiMajorAxis * Math.pow(this.mass / (3 * primaryMass), 1/3);
    }

    /**
     * Serialize body to plain object for JSON export
     * @returns {Object} Serializable object
     */
    serialize() {
        const data = {
            id: this.id,
            name: this.name,
            type: this.type,
            mass: this.mass,
            radius: this.radius,
            position: this.position.toObject(),
            velocity: this.velocity.toObject(),
            softening: this.softening,
            isFixed: this.isFixed,
            isGravitySource: this.isGravitySource,
            isGravityTarget: this.isGravityTarget,
            color: this.color,
            textureId: this.textureId,
            emissive: this.emissive,
            hasAtmosphere: this.hasAtmosphere,
            createdAt: this.createdAt,
        };

        // Add type-specific properties
        if (isLuminous(this.type)) {
            data.luminosity = this.luminosity;
        }

        if (this.type === BodyType.BLACK_HOLE) {
            data.schwarzschildRadius = this.schwarzschildRadius;
        }

        if (this.type === BodyType.PULSAR || this.type === BodyType.MAGNETAR) {
            data.rotationPeriod = this.rotationPeriod;
            data.pulseFrequency = this.pulseFrequency;
            data.beamAngle = this.beamAngle;
        }

        if (this.type === BodyType.MAGNETAR) {
            data.magneticFieldStrength = this.magneticFieldStrength;
        }

        if (this.type === BodyType.COMET) {
            data.tailLength = this.tailLength;
        }

        if (Object.keys(this.userData).length > 0) {
            data.userData = this.userData;
        }

        return data;
    }

    /**
     * Create a Body from serialized data
     * @param {Object} data - Serialized body data
     * @returns {Body} New Body instance
     */
    static deserialize(data) {
        return new Body({
            id: data.id,
            name: data.name,
            type: data.type,
            mass: data.mass,
            radius: data.radius,
            x: data.position.x,
            y: data.position.y,
            z: data.position.z,
            vx: data.velocity.x,
            vy: data.velocity.y,
            vz: data.velocity.z,
            softening: data.softening,
            isFixed: data.isFixed,
            isGravitySource: data.isGravitySource,
            isGravityTarget: data.isGravityTarget,
            color: data.color,
            textureId: data.textureId,
            emissive: data.emissive,
            hasAtmosphere: data.hasAtmosphere,
            luminosity: data.luminosity,
            schwarzschildRadius: data.schwarzschildRadius,
            rotationPeriod: data.rotationPeriod,
            pulseFrequency: data.pulseFrequency,
            beamAngle: data.beamAngle,
            magneticFieldStrength: data.magneticFieldStrength,
            tailLength: data.tailLength,
            createdAt: data.createdAt,
            userData: data.userData,
        });
    }

    /**
     * Clone this body
     * @returns {Body} New Body with same properties
     */
    clone() {
        return Body.deserialize(this.serialize());
    }
}

// ========== Body Factory Functions ==========

/**
 * Create a star body
 * @param {Object} params - Star parameters
 * @returns {Body} New star body
 */
export function createStar(params = {}) {
    return new Body({
        type: BodyType.STAR,
        name: params.name ?? 'Star',
        mass: params.mass ?? SOLAR_MASS,
        radius: params.radius ?? SOLAR_RADIUS,
        luminosity: params.luminosity ?? 3.828e26,
        color: params.color ?? 0xffdd44,
        emissive: 1.0,
        ...params
    });
}

/**
 * Create a planet body
 * @param {Object} params - Planet parameters
 * @returns {Body} New planet body
 */
export function createPlanet(params = {}) {
    return new Body({
        type: BodyType.PLANET,
        name: params.name ?? 'Planet',
        mass: params.mass ?? EARTH_MASS,
        radius: params.radius ?? EARTH_RADIUS,
        hasAtmosphere: params.hasAtmosphere ?? true,
        color: params.color ?? 0x4488ff,
        ...params
    });
}

/**
 * Create a black hole body
 * @param {Object} params - Black hole parameters
 * @returns {Body} New black hole body
 */
export function createBlackHole(params = {}) {
    const mass = params.mass ?? (10 * SOLAR_MASS);
    const rs = SCHWARZSCHILD_COEFF * mass;
    
    return new Body({
        type: BodyType.BLACK_HOLE,
        name: params.name ?? 'Black Hole',
        mass: mass,
        radius: rs,
        schwarzschildRadius: rs,
        color: 0x000000,
        emissive: 0,
        softening: params.softening ?? rs * 0.1,
        ...params
    });
}

/**
 * Create a neutron star body
 * @param {Object} params - Neutron star parameters
 * @returns {Body} New neutron star body
 */
export function createNeutronStar(params = {}) {
    return new Body({
        type: BodyType.NEUTRON_STAR,
        name: params.name ?? 'Neutron Star',
        mass: params.mass ?? NEUTRON_STAR_MASS,
        radius: params.radius ?? NEUTRON_STAR_RADIUS,
        color: params.color ?? 0x44ffff,
        emissive: 0.8,
        ...params
    });
}

/**
 * Create a pulsar body
 * @param {Object} params - Pulsar parameters
 * @returns {Body} New pulsar body
 */
export function createPulsar(params = {}) {
    return new Body({
        type: BodyType.PULSAR,
        name: params.name ?? 'Pulsar',
        mass: params.mass ?? NEUTRON_STAR_MASS,
        radius: params.radius ?? NEUTRON_STAR_RADIUS,
        rotationPeriod: params.rotationPeriod ?? 0.033,
        color: params.color ?? 0xffff44,
        emissive: 1.0,
        ...params
    });
}

/**
 * Create a magnetar body
 * @param {Object} params - Magnetar parameters
 * @returns {Body} New magnetar body
 */
export function createMagnetar(params = {}) {
    return new Body({
        type: BodyType.MAGNETAR,
        name: params.name ?? 'Magnetar',
        mass: params.mass ?? NEUTRON_STAR_MASS,
        radius: params.radius ?? NEUTRON_STAR_RADIUS,
        rotationPeriod: params.rotationPeriod ?? 2.0, // Magnetars rotate slower
        magneticFieldStrength: params.magneticFieldStrength ?? 1e11,
        color: params.color ?? 0xff44ff,
        emissive: 1.0,
        ...params
    });
}

export default Body;
