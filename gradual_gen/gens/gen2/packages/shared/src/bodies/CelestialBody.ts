/**
 * CelestialBody Runtime Class
 * ============================
 * Runtime representation with physics state and methods.
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { sphereOfInfluence, surfaceGravity, circularOrbitalVelocity } from '../math/orbital.js';
import { G, DEFAULT_SOFTENING } from '../constants.js';
import {
  CelestialBodyDefinition,
  BodyType,
  BodyClass,
  BodyNetworkState,
  BodyStateSnapshot,
  AtmosphereProperties,
  RingProperties,
  StarProperties,
  BlackHoleProperties,
  TerrainProperties
} from './types.js';

/**
 * Active celestial body in the simulation
 */
export class CelestialBody {
  // Identity
  public readonly id: string;
  public name: string;
  public type: BodyType;
  public bodyClass: BodyClass;

  // Physical properties (mostly immutable during simulation)
  public mass: number;
  public radius: number;
  public oblateness: number;
  public rotationPeriod: number;
  public axialTilt: number;
  public softening: number;

  // State (mutable)
  public position: Vector3;
  public velocity: Vector3;
  public orientation: Quaternion;
  public angularVelocity: number;

  // Acceleration (computed each frame)
  public acceleration: Vector3;

  // Hierarchy
  public parentId: string | null;
  public childIds: string[];
  public soiRadius: number;

  // Visual properties
  public color: [number, number, number];
  public albedo: number;
  public emissive: boolean;
  public emissiveColor: [number, number, number] | undefined;
  public emissiveIntensity: number | undefined;

  // Extended properties
  public atmosphere: AtmosphereProperties | undefined;
  public rings: RingProperties | undefined;
  public starProperties: StarProperties | undefined;
  public blackHoleProperties: BlackHoleProperties | undefined;
  public terrain: TerrainProperties | undefined;

  // Metadata
  public description: string | undefined;
  public tags: string[];
  public userData: Record<string, unknown>;

  // State history for interpolation (client-side)
  private stateHistory: BodyStateSnapshot[] = [];
  private readonly maxHistoryLength = 10;

  constructor(definition: CelestialBodyDefinition) {
    this.id = definition.id;
    this.name = definition.name;
    this.type = definition.type;
    this.bodyClass = definition.bodyClass;

    this.mass = definition.mass;
    this.radius = definition.radius;
    this.oblateness = definition.oblateness;
    this.rotationPeriod = definition.rotationPeriod;
    this.axialTilt = definition.axialTilt;
    this.softening = definition.softening || DEFAULT_SOFTENING;

    this.position = definition.position.clone();
    this.velocity = definition.velocity.clone();
    this.orientation = definition.orientation.clone();
    this.angularVelocity = definition.angularVelocity;
    this.acceleration = Vector3.zero();

    this.parentId = definition.parentId;
    this.childIds = [...definition.childIds];
    this.soiRadius = definition.soiRadius;

    this.color = [...definition.color];
    this.albedo = definition.albedo;
    this.emissive = definition.emissive;
    this.emissiveColor = definition.emissiveColor ? [...definition.emissiveColor] : undefined;
    this.emissiveIntensity = definition.emissiveIntensity;

    this.atmosphere = definition.atmosphere;
    this.rings = definition.rings;
    this.starProperties = definition.starProperties;
    this.blackHoleProperties = definition.blackHoleProperties;
    this.terrain = definition.terrain;

    this.description = definition.description;
    this.tags = [...(definition.tags ?? [])];
    this.userData = { ...definition.userData };
  }

  /**
   * Calculate gravitational parameter μ = GM
   */
  get mu(): number {
    return G * this.mass;
  }

  /**
   * Get surface gravity
   */
  get surfaceGravity(): number {
    return surfaceGravity(this.mass, this.radius);
  }

  /**
   * Get escape velocity from surface
   */
  get escapeVelocity(): number {
    return Math.sqrt(2 * this.mu / this.radius);
  }

  /**
   * Calculate orbital velocity for a circular orbit at given altitude
   */
  getOrbitalVelocityAt(altitude: number): number {
    const r = this.radius + altitude;
    return circularOrbitalVelocity(r, this.mass);
  }

  /**
   * Get gravitational acceleration at a distance
   * Uses softening to prevent singularity
   * a = GM / (r² + ε²)
   */
  getGravitationalAcceleration(distance: number): number {
    const softened = distance * distance + this.softening * this.softening;
    return this.mu / softened;
  }

  /**
   * Calculate gravitational force on another body
   * Returns acceleration vector pointing towards this body
   */
  getGravitationalForceOn(other: CelestialBody): Vector3 {
    const direction = Vector3.sub(this.position, other.position);
    const distSq = direction.lengthSquared();
    const dist = Math.sqrt(distSq);

    if (dist < 1e-10) {
      throw new Error(
        `CelestialBody.getGravitationalForceOn: Bodies ${this.id} and ${other.id} are at the same position (collision/singularity)`
      );
    }

    // Softened gravity: F = GMm / (r² + ε²)
    const softenedDistSq = distSq + this.softening * this.softening;
    const accelerationMag = this.mu / softenedDistSq;

    // Normalize and scale
    return direction.multiplyScalar(accelerationMag / dist);
  }

  /**
   * Update SOI radius based on parent mass
   */
  updateSOI(parentMass: number, orbitRadius: number): void {
    if (parentMass > 0 && orbitRadius > 0) {
      this.soiRadius = sphereOfInfluence(orbitRadius, this.mass, parentMass);
    } else {
      // No parent - SOI is effectively infinite
      this.soiRadius = Infinity;
    }
  }

  /**
   * Check if a position is within this body's SOI
   */
  isInSOI(position: Vector3): boolean {
    return position.distanceTo(this.position) < this.soiRadius;
  }

  /**
   * Check if a position is on or below the surface
   */
  isColliding(position: Vector3): boolean {
    return position.distanceTo(this.position) <= this.radius;
  }

  /**
   * Get altitude above surface (negative if below)
   */
  getAltitude(position: Vector3): number {
    return position.distanceTo(this.position) - this.radius;
  }

  /**
   * Get local up vector at a position (normalized)
   */
  getLocalUp(position: Vector3): Vector3 {
    return Vector3.sub(position, this.position).safeNormalize();
  }

  /**
   * Get surface position given a direction from center
   */
  getSurfacePosition(direction: Vector3): Vector3 {
    const normalized = direction.clone().safeNormalize();
    return Vector3.add(this.position, normalized.multiplyScalar(this.radius));
  }

  /**
   * Get velocity at surface point (due to rotation)
   */
  getSurfaceVelocity(surfacePosition: Vector3): Vector3 {
    if (this.rotationPeriod === 0) {
      return Vector3.zero();
    }

    // Angular velocity vector (around Y axis, adjusted by axial tilt)
    const omega = (2 * Math.PI) / this.rotationPeriod;
    
    // Position relative to body center
    const r = Vector3.sub(surfacePosition, this.position);

    // Rotation axis (tilted)
    const axis = this.orientation.rotateVector(new Vector3(0, 1, 0));

    // v = ω × r
    return Vector3.cross(axis.multiplyScalar(omega), r);
  }

  /**
   * Update rotation based on elapsed time
   */
  updateRotation(dt: number): void {
    if (this.rotationPeriod === 0) return;

    const angularVel = (2 * Math.PI) / this.rotationPeriod;
    const angle = angularVel * dt;

    // Create rotation quaternion around Y axis (local)
    const rotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angle);
    this.orientation.multiply(rotation).normalize();
  }

  /**
   * Serialize to network state
   */
  toNetworkState(timestamp: number): BodyNetworkState {
    return {
      id: this.id,
      p: this.position.toArray(),
      v: this.velocity.toArray(),
      o: this.orientation.toArray(),
      av: this.angularVelocity,
      t: timestamp
    };
  }

  /**
   * Apply network state
   */
  applyNetworkState(state: BodyNetworkState): void {
    this.position.set(state.p[0], state.p[1], state.p[2]);
    this.velocity.set(state.v[0], state.v[1], state.v[2]);
    this.orientation.set(state.o[0], state.o[1], state.o[2], state.o[3]);
    this.angularVelocity = state.av;
  }

  /**
   * Add state snapshot for interpolation
   */
  addStateSnapshot(timestamp: number): void {
    this.stateHistory.push({
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      orientation: this.orientation.clone(),
      angularVelocity: this.angularVelocity,
      timestamp
    });

    // Trim history
    while (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  /**
   * Interpolate state at a given timestamp
   */
  getInterpolatedState(timestamp: number): BodyStateSnapshot | null {
    if (this.stateHistory.length < 2) return null;

    // Find surrounding snapshots
    let before: BodyStateSnapshot | null = null;
    let after: BodyStateSnapshot | null = null;

    for (let i = 0; i < this.stateHistory.length - 1; i++) {
      const current = this.stateHistory[i]!;
      const next = this.stateHistory[i + 1]!;
      if (current.timestamp <= timestamp && next.timestamp >= timestamp) {
        before = current;
        after = next;
        break;
      }
    }

    if (!before || !after) {
      // Return latest if timestamp is beyond our history
      return this.stateHistory[this.stateHistory.length - 1] ?? null;
    }

    // Interpolation factor
    const t = (timestamp - before.timestamp) / (after.timestamp - before.timestamp);

    return {
      position: Vector3.lerp(before.position, after.position, t),
      velocity: Vector3.lerp(before.velocity, after.velocity, t),
      orientation: Quaternion.slerp(before.orientation, after.orientation, t),
      angularVelocity: before.angularVelocity + (after.angularVelocity - before.angularVelocity) * t,
      timestamp
    };
  }

  /**
   * Clone this body
   */
  clone(): CelestialBody {
    return new CelestialBody(this.toDefinition());
  }

  /**
   * Convert to definition (for saving/serialization)
   */
  toDefinition(): CelestialBodyDefinition {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      bodyClass: this.bodyClass,
      mass: this.mass,
      radius: this.radius,
      oblateness: this.oblateness,
      rotationPeriod: this.rotationPeriod,
      axialTilt: this.axialTilt,
      softening: this.softening,
      position: this.position.clone(),
      velocity: this.velocity.clone(),
      orientation: this.orientation.clone(),
      angularVelocity: this.angularVelocity,
      parentId: this.parentId,
      childIds: [...this.childIds],
      soiRadius: this.soiRadius,
      color: [...this.color],
      albedo: this.albedo,
      emissive: this.emissive,
      emissiveColor: this.emissiveColor ? [...this.emissiveColor] : undefined,
      emissiveIntensity: this.emissiveIntensity,
      atmosphere: this.atmosphere,
      rings: this.rings,
      starProperties: this.starProperties,
      blackHoleProperties: this.blackHoleProperties,
      terrain: this.terrain,
      description: this.description,
      tags: [...this.tags],
      userData: { ...this.userData }
    };
  }

  /**
   * String representation
   */
  toString(): string {
    return `CelestialBody(${this.name}, mass=${this.mass.toExponential(2)}kg, r=${(this.radius / 1000).toFixed(0)}km)`;
  }
}
