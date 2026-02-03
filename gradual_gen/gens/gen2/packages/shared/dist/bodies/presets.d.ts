/**
 * Preset Solar Systems
 * ====================
 * All values in SI units (m, kg, s).
 * Data from NASA JPL Horizons and IAU.
 *
 * Verification:
 * - Earth orbital period: 365.256363004 days (±0.01%)
 * - Moon orbital period: 27.321661 days (±0.01%)
 * - All positions verified against JPL ephemerides
 */
import { CelestialBodyDefinition } from './types.js';
/**
 * World state containing all bodies
 */
export interface WorldState {
    name: string;
    description: string;
    seed: number;
    bodies: CelestialBodyDefinition[];
    metadata?: Record<string, unknown>;
}
/**
 * Helper to create a body orbiting at given distance
 * Exported for use by world builder and tests.
 */
export declare function createOrbitingBody(id: string, name: string, mass: number, radius: number, parentMass: number, orbitRadius: number, options?: Partial<CelestialBodyDefinition>): CelestialBodyDefinition;
/**
 * Empty World - Just a point in space
 */
export declare function createEmptyWorld(): WorldState;
/**
 * Sun-Earth-Moon System
 * Verification:
 * - Earth orbital period: 365.256 days
 * - Moon orbital period around Earth: 27.322 days
 */
export declare function createSunEarthMoon(): WorldState;
/**
 * Full Solar System
 * All major planets with correct orbital parameters
 */
export declare function createFullSolarSystem(): WorldState;
/**
 * Alpha Centauri AB Binary System
 * Two Sun-like stars in binary orbit
 */
export declare function createAlphaCentauri(): WorldState;
/**
 * PSR B1620-26 Extreme System
 * Pulsar + White Dwarf + Planet system
 * Tests extreme physics conditions
 */
export declare function createPSRB1620(): WorldState;
/**
 * Black Hole Test System
 * For testing gravitational lensing and extreme gravity
 */
export declare function createBlackHoleSystem(): WorldState;
/**
 * Get preset by name
 */
export declare function getPresetWorld(name: string): WorldState | null;
/**
 * List available presets
 */
export declare function listPresetWorlds(): Array<{
    name: string;
    description: string;
}>;
//# sourceMappingURL=presets.d.ts.map