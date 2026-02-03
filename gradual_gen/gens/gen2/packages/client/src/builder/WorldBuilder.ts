/**
 * World Builder
 * =============
 * Interactive tool for creating and editing celestial bodies.
 * Provides orbital mechanics calculations and validation.
 */

import {
  CelestialBodyDefinition,
  BodyType,
  BodyClass,
  Vector3,
  SOLAR_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
} from '@space-sim/shared';

export interface OrbitalElements {
  semiMajorAxis: number;      // a in meters
  eccentricity: number;       // e (0 = circular, <1 = ellipse)
  inclination: number;        // i in radians
  longitudeOfAscendingNode: number;  // Ω in radians
  argumentOfPeriapsis: number;       // ω in radians
  trueAnomaly: number;        // ν in radians
}

export interface BodyTemplate {
  type: BodyType;
  class: BodyClass;
  name: string;
  mass: number;
  radius: number;
  color: number;
  description?: string;
}

// Pre-defined templates for common body types
export const BODY_TEMPLATES: BodyTemplate[] = [
  {
    type: BodyType.STAR,
    class: BodyClass.G,
    name: 'Sun-like Star',
    mass: SOLAR_MASS,
    radius: 6.96340e8,
    color: 0xffff00,
    description: 'G-type main sequence star similar to the Sun',
  },
  {
    type: BodyType.STAR,
    class: BodyClass.M,
    name: 'Red Dwarf',
    mass: SOLAR_MASS * 0.1,
    radius: 6.96340e8 * 0.3,
    color: 0xff4400,
    description: 'Small, cool red dwarf star',
  },
  {
    type: BodyType.PLANET,
    class: BodyClass.TERRESTRIAL,
    name: 'Earth-like Planet',
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    color: 0x4488ff,
    description: 'Rocky planet with potential for life',
  },
  {
    type: BodyType.PLANET,
    class: BodyClass.GAS_GIANT,
    name: 'Gas Giant',
    mass: EARTH_MASS * 318,
    radius: EARTH_RADIUS * 11.2,
    color: 0xffaa66,
    description: 'Jupiter-like gas giant',
  },
  {
    type: BodyType.PLANET,
    class: BodyClass.ICE_GIANT,
    name: 'Ice Giant',
    mass: EARTH_MASS * 14.5,
    radius: EARTH_RADIUS * 4,
    color: 0x66ccff,
    description: 'Neptune-like ice giant',
  },
  {
    type: BodyType.MOON,
    class: BodyClass.TERRESTRIAL,
    name: 'Moon',
    mass: EARTH_MASS * 0.0123,
    radius: EARTH_RADIUS * 0.273,
    color: 0xaaaaaa,
    description: 'Rocky natural satellite',
  },
  {
    type: BodyType.ASTEROID,
    class: BodyClass.ASTEROID,
    name: 'Asteroid',
    mass: 1e15,
    radius: 5000,
    color: 0x666666,
    description: 'Small rocky body',
  },
  {
    type: BodyType.BLACK_HOLE,
    class: BodyClass.BLACK_HOLE,
    name: 'Stellar Black Hole',
    mass: SOLAR_MASS * 10,
    radius: 30000, // Schwarzschild radius for 10 solar masses
    color: 0x000000,
    description: 'Collapsed stellar remnant',
  },
];

export class WorldBuilder {
  private bodies: CelestialBodyDefinition[] = [];
  private selectedBody: string | null = null;
  private nextId: number = 1;

  /**
   * Create a new body from template with orbital parameters
   */
  createBody(
    template: BodyTemplate,
    parent: CelestialBodyDefinition | null,
    orbitalElements: OrbitalElements
  ): CelestialBodyDefinition {
    const id = `custom_body_${this.nextId++}`;

    // Calculate position and velocity from orbital elements
    const { position, velocity } = this.orbitalElementsToStateVectors(
      orbitalElements,
      parent
    );

    const body: CelestialBodyDefinition = {
      id,
      name: template.name,
      type: template.type,
      class: template.class,
      mass: template.mass,
      radius: template.radius,
      position,
      velocity,
      color: template.color,
      parentId: parent?.id,
    };

    this.bodies.push(body);
    return body;
  }

  /**
   * Convert orbital elements to position/velocity state vectors
   * 
   * Mathematical basis:
   * 1. Calculate distance: r = a(1-e²)/(1+e·cos(ν))
   * 2. Position in orbital plane: (r·cos(ν), r·sin(ν), 0)
   * 3. Rotate by argument of periapsis, inclination, and ascending node
   * 4. Velocity from vis-viva equation: v² = GM(2/r - 1/a)
   */
  orbitalElementsToStateVectors(
    elements: OrbitalElements,
    parent: CelestialBodyDefinition | null
  ): { position: Vector3; velocity: Vector3 } {
    const { semiMajorAxis: a, eccentricity: e, inclination: i,
      longitudeOfAscendingNode: Omega, argumentOfPeriapsis: omega,
      trueAnomaly: nu } = elements;

    // Distance from focus (parent body)
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));

    // Position in orbital plane (perifocal coordinates)
    const xOrbital = r * Math.cos(nu);
    const yOrbital = r * Math.sin(nu);

    // Velocity in orbital plane
    // v_r = sqrt(μ/p) * e * sin(ν)
    // v_θ = sqrt(μ/p) * (1 + e * cos(ν))
    // where p = a(1-e²) is the semi-latus rectum
    const mu = parent ? 6.67430e-11 * parent.mass : 6.67430e-11 * SOLAR_MASS;
    const p = a * (1 - e * e);
    const sqrtMuOverP = Math.sqrt(mu / p);

    const vr = sqrtMuOverP * e * Math.sin(nu);
    const vtheta = sqrtMuOverP * (1 + e * Math.cos(nu));

    // Convert to Cartesian in orbital plane
    const vxOrbital = vr * Math.cos(nu) - vtheta * Math.sin(nu);
    const vyOrbital = vr * Math.sin(nu) + vtheta * Math.cos(nu);

    // Rotation matrices (3-1-3: Ω, i, ω)
    const cosOmega = Math.cos(Omega);
    const sinOmega = Math.sin(Omega);
    const cosI = Math.cos(i);
    const sinI = Math.sin(i);
    const cosOmegaSmall = Math.cos(omega);
    const sinOmegaSmall = Math.sin(omega);

    // Combined rotation matrix elements
    const R11 = cosOmega * cosOmegaSmall - sinOmega * sinOmegaSmall * cosI;
    const R12 = -cosOmega * sinOmegaSmall - sinOmega * cosOmegaSmall * cosI;
    const R21 = sinOmega * cosOmegaSmall + cosOmega * sinOmegaSmall * cosI;
    const R22 = -sinOmega * sinOmegaSmall + cosOmega * cosOmegaSmall * cosI;
    const R31 = sinOmegaSmall * sinI;
    const R32 = cosOmegaSmall * sinI;

    // Transform position to ecliptic coordinates
    const x = R11 * xOrbital + R12 * yOrbital;
    const y = R21 * xOrbital + R22 * yOrbital;
    const z = R31 * xOrbital + R32 * yOrbital;

    // Transform velocity
    const vx = R11 * vxOrbital + R12 * vyOrbital;
    const vy = R21 * vxOrbital + R22 * vyOrbital;
    const vz = R31 * vxOrbital + R32 * vyOrbital;

    // Add parent position/velocity if exists
    const parentPos = parent?.position || { x: 0, y: 0, z: 0 };
    const parentVel = parent?.velocity || { x: 0, y: 0, z: 0 };

    return {
      position: new Vector3(
        x + parentPos.x,
        y + parentPos.y,
        z + parentPos.z
      ),
      velocity: new Vector3(
        vx + parentVel.x,
        vy + parentVel.y,
        vz + parentVel.z
      ),
    };
  }

  /**
   * Create a circular orbit at specified distance
   */
  createCircularOrbit(distance: number): OrbitalElements {
    return {
      semiMajorAxis: distance,
      eccentricity: 0,
      inclination: 0,
      longitudeOfAscendingNode: 0,
      argumentOfPeriapsis: 0,
      trueAnomaly: 0,
    };
  }

  /**
   * Calculate Roche limit for a satellite
   * R_L ≈ 2.44 × R_primary × (ρ_primary/ρ_satellite)^(1/3)
   */
  calculateRocheLimit(
    primaryRadius: number,
    primaryDensity: number,
    satelliteDensity: number
  ): number {
    return 2.44 * primaryRadius * Math.pow(primaryDensity / satelliteDensity, 1 / 3);
  }

  /**
   * Calculate Hill sphere radius
   * R_H ≈ a × (m / (3M))^(1/3)
   */
  calculateHillSphere(
    semiMajorAxis: number,
    bodyMass: number,
    parentMass: number
  ): number {
    return semiMajorAxis * Math.pow(bodyMass / (3 * parentMass), 1 / 3);
  }

  /**
   * Validate orbital stability
   */
  validateOrbit(
    elements: OrbitalElements,
    bodyMass: number,
    parent: CelestialBodyDefinition | null
  ): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (elements.eccentricity >= 1) {
      return { valid: false, warnings: ['Eccentricity must be < 1 for a bound orbit'] };
    }

    if (elements.eccentricity < 0) {
      return { valid: false, warnings: ['Eccentricity cannot be negative'] };
    }

    if (parent) {
      // Check periapsis is above parent surface
      const periapsis = elements.semiMajorAxis * (1 - elements.eccentricity);
      if (periapsis < parent.radius) {
        warnings.push('Orbit intersects parent body (periapsis < radius)');
      }

      // Check if inside Roche limit
      const bodyDensity = bodyMass / ((4 / 3) * Math.PI * Math.pow(1000, 3)); // Assuming 1km radius
      const parentDensity = parent.mass / ((4 / 3) * Math.PI * Math.pow(parent.radius, 3));
      const rocheLimit = this.calculateRocheLimit(parent.radius, parentDensity, bodyDensity);
      if (periapsis < rocheLimit) {
        warnings.push(`Orbit inside Roche limit (${(rocheLimit / 1000).toFixed(0)} km)`);
      }
    }

    return { valid: true, warnings };
  }

  /**
   * Get all bodies
   */
  getBodies(): CelestialBodyDefinition[] {
    return [...this.bodies];
  }

  /**
   * Remove a body
   */
  removeBody(id: string): boolean {
    const index = this.bodies.findIndex((b) => b.id === id);
    if (index >= 0) {
      this.bodies.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all bodies
   */
  clear(): void {
    this.bodies = [];
    this.selectedBody = null;
  }

  /**
   * Select a body for editing
   */
  selectBody(id: string | null): void {
    this.selectedBody = id;
  }

  /**
   * Get selected body
   */
  getSelectedBody(): CelestialBodyDefinition | null {
    if (!this.selectedBody) return null;
    return this.bodies.find((b) => b.id === this.selectedBody) || null;
  }

  /**
   * Export system to JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      version: '1.0',
      name: 'Custom System',
      bodies: this.bodies,
    }, null, 2);
  }

  /**
   * Import system from JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.bodies && Array.isArray(data.bodies)) {
        this.bodies = data.bodies;
        // Update nextId to avoid collisions
        for (const body of this.bodies) {
          const match = body.id.match(/custom_body_(\d+)/);
          if (match) {
            this.nextId = Math.max(this.nextId, parseInt(match[1], 10) + 1);
          }
        }
      }
    } catch (e) {
      throw new Error(`Failed to import system: ${e}`);
    }
  }
}
