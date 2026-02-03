/**
 * CelestialBody Runtime Class
 * ============================
 * Runtime representation with physics state and methods.
 */
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { CelestialBodyDefinition, BodyType, BodyClass, BodyNetworkState, BodyStateSnapshot, AtmosphereProperties, RingProperties, StarProperties, BlackHoleProperties, TerrainProperties } from './types.js';
/**
 * Active celestial body in the simulation
 */
export declare class CelestialBody {
    readonly id: string;
    name: string;
    type: BodyType;
    bodyClass: BodyClass;
    mass: number;
    radius: number;
    oblateness: number;
    rotationPeriod: number;
    axialTilt: number;
    softening: number;
    position: Vector3;
    velocity: Vector3;
    orientation: Quaternion;
    angularVelocity: number;
    acceleration: Vector3;
    parentId: string | null;
    childIds: string[];
    soiRadius: number;
    color: [number, number, number];
    albedo: number;
    emissive: boolean;
    emissiveColor: [number, number, number] | undefined;
    emissiveIntensity: number | undefined;
    atmosphere: AtmosphereProperties | undefined;
    rings: RingProperties | undefined;
    starProperties: StarProperties | undefined;
    blackHoleProperties: BlackHoleProperties | undefined;
    terrain: TerrainProperties | undefined;
    description: string | undefined;
    tags: string[];
    userData: Record<string, unknown>;
    private stateHistory;
    private readonly maxHistoryLength;
    constructor(definition: CelestialBodyDefinition);
    /**
     * Calculate gravitational parameter μ = GM
     */
    get mu(): number;
    /**
     * Get surface gravity
     */
    get surfaceGravity(): number;
    /**
     * Get escape velocity from surface
     */
    get escapeVelocity(): number;
    /**
     * Calculate orbital velocity for a circular orbit at given altitude
     */
    getOrbitalVelocityAt(altitude: number): number;
    /**
     * Get gravitational acceleration at a distance
     * Uses softening to prevent singularity
     * a = GM / (r² + ε²)
     */
    getGravitationalAcceleration(distance: number): number;
    /**
     * Calculate gravitational force on another body
     * Returns acceleration vector pointing towards this body
     */
    getGravitationalForceOn(other: CelestialBody): Vector3;
    /**
     * Update SOI radius based on parent mass
     */
    updateSOI(parentMass: number, orbitRadius: number): void;
    /**
     * Check if a position is within this body's SOI
     */
    isInSOI(position: Vector3): boolean;
    /**
     * Check if a position is on or below the surface
     */
    isColliding(position: Vector3): boolean;
    /**
     * Get altitude above surface (negative if below)
     */
    getAltitude(position: Vector3): number;
    /**
     * Get local up vector at a position (normalized)
     */
    getLocalUp(position: Vector3): Vector3;
    /**
     * Get surface position given a direction from center
     */
    getSurfacePosition(direction: Vector3): Vector3;
    /**
     * Get velocity at surface point (due to rotation)
     */
    getSurfaceVelocity(surfacePosition: Vector3): Vector3;
    /**
     * Update rotation based on elapsed time
     */
    updateRotation(dt: number): void;
    /**
     * Serialize to network state
     */
    toNetworkState(timestamp: number): BodyNetworkState;
    /**
     * Apply network state
     */
    applyNetworkState(state: BodyNetworkState): void;
    /**
     * Add state snapshot for interpolation
     */
    addStateSnapshot(timestamp: number): void;
    /**
     * Interpolate state at a given timestamp
     */
    getInterpolatedState(timestamp: number): BodyStateSnapshot | null;
    /**
     * Clone this body
     */
    clone(): CelestialBody;
    /**
     * Convert to definition (for saving/serialization)
     */
    toDefinition(): CelestialBodyDefinition;
    /**
     * String representation
     */
    toString(): string;
}
//# sourceMappingURL=CelestialBody.d.ts.map