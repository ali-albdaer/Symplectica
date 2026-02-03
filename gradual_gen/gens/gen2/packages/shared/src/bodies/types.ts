/**
 * Celestial Body Types and Interfaces
 * ====================================
 * All units are SI (meters, kilograms, seconds).
 */

import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

/**
 * Body classification for physics calculations
 */
export enum BodyType {
  /** Massive body that exerts gravity (stars, planets, moons) */
  MASSIVE = 'massive',
  /** Passive object that receives gravity but doesn't exert it (ships, debris) */
  PASSIVE = 'passive'
}

/**
 * Visual classification for rendering
 */
export enum BodyClass {
  STAR = 'star',
  BLACK_HOLE = 'black_hole',
  NEUTRON_STAR = 'neutron_star',
  PULSAR = 'pulsar',
  GAS_GIANT = 'gas_giant',
  ICE_GIANT = 'ice_giant',
  TERRESTRIAL = 'terrestrial',
  DWARF_PLANET = 'dwarf_planet',
  MOON = 'moon',
  ASTEROID = 'asteroid',
  COMET = 'comet',
  SPACECRAFT = 'spacecraft',
  STATION = 'station',
  DEBRIS = 'debris'
}

/**
 * Spectral class for stars
 */
export enum SpectralClass {
  O = 'O',  // Blue, > 30,000 K
  B = 'B',  // Blue-white, 10,000-30,000 K
  A = 'A',  // White, 7,500-10,000 K
  F = 'F',  // Yellow-white, 6,000-7,500 K
  G = 'G',  // Yellow (like Sun), 5,200-6,000 K
  K = 'K',  // Orange, 3,700-5,200 K
  M = 'M',  // Red, 2,400-3,700 K
  L = 'L',  // Dark red, 1,300-2,400 K (brown dwarf)
  T = 'T',  // Magenta, 550-1,300 K (brown dwarf)
  Y = 'Y'   // Infrared, < 550 K (brown dwarf)
}

/**
 * Atmosphere composition element
 */
export interface AtmosphereComponent {
  /** Gas name (e.g., 'N2', 'O2', 'CO2') */
  gas: string;
  /** Fraction of atmosphere (0-1) */
  fraction: number;
  /** Molar mass in kg/mol */
  molarMass: number;
}

/**
 * Atmosphere properties for rendering and physics
 */
export interface AtmosphereProperties {
  /** Whether body has an atmosphere */
  hasAtmosphere: boolean;
  /** Surface pressure in Pascals */
  surfacePressure: number;
  /** Scale height in meters (H = kT/mg) */
  scaleHeight: number;
  /** Atmosphere composition */
  composition: AtmosphereComponent[];
  /** Rayleigh scattering coefficients (RGB) */
  rayleighCoefficients: [number, number, number];
  /** Mie scattering coefficient */
  mieCoefficient: number;
  /** Mie scattering direction (-1 to 1) */
  mieDirectionality: number;
}

/**
 * Ring system properties
 */
export interface RingProperties {
  /** Inner radius in meters */
  innerRadius: number;
  /** Outer radius in meters */
  outerRadius: number;
  /** Texture/pattern seed */
  textureSeed: number;
  /** Opacity (0-1) */
  opacity: number;
  /** Color tint RGB (0-1) */
  color: [number, number, number];
}

/**
 * Star-specific properties
 */
export interface StarProperties {
  /** Spectral classification */
  spectralClass: SpectralClass;
  /** Subclass (0-9) */
  spectralSubclass: number;
  /** Luminosity class (I-V) */
  luminosityClass: string;
  /** Effective surface temperature in Kelvin */
  temperature: number;
  /** Luminosity in Watts */
  luminosity: number;
  /** Is the star a variable? */
  isVariable: boolean;
  /** Variable period in seconds (if applicable) */
  variablePeriod?: number;
  /** Has solar flares */
  hasFlares: boolean;
  /** Flare intensity multiplier */
  flareIntensity: number;
}

/**
 * Pulsar-specific properties
 */
export interface PulsarProperties extends StarProperties {
  /** Rotation period in seconds */
  rotationPeriod: number;
  /** Magnetic field strength in Tesla */
  magneticField: number;
  /** Jet cone angle in radians */
  jetConeAngle: number;
  /** Jet emission color */
  jetColor: [number, number, number];
}

/**
 * Black hole properties
 */
export interface BlackHoleProperties {
  /** Schwarzschild radius in meters */
  schwarzschildRadius: number;
  /** Spin parameter (0-1, 0=Schwarzschild, 1=extremal Kerr) */
  spinParameter: number;
  /** Has accretion disk */
  hasAccretionDisk: boolean;
  /** Accretion disk inner radius (in Schwarzschild radii) */
  accretionDiskInner: number;
  /** Accretion disk outer radius (in Schwarzschild radii) */
  accretionDiskOuter: number;
  /** Accretion disk temperature (for color) */
  accretionDiskTemperature: number;
}

/**
 * Terrain generation properties
 */
export interface TerrainProperties {
  /** Seed for procedural generation */
  seed: number;
  /** Base terrain type */
  terrainType: 'rocky' | 'icy' | 'volcanic' | 'oceanic' | 'desert' | 'gas';
  /** Maximum displacement in meters */
  maxDisplacement: number;
  /** Noise octaves */
  octaves: number;
  /** Base frequency */
  frequency: number;
  /** Lacunarity (frequency multiplier per octave) */
  lacunarity: number;
  /** Persistence (amplitude multiplier per octave) */
  persistence: number;
  /** Has liquid (oceans/lakes) */
  hasLiquid: boolean;
  /** Sea level (0-1, fraction of radius variation) */
  seaLevel: number;
}

/**
 * Complete celestial body definition
 */
export interface CelestialBodyDefinition {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Physics classification */
  type: BodyType;
  /** Visual classification */
  bodyClass: BodyClass;
  
  // Physical properties
  /** Mass in kilograms */
  mass: number;
  /** Mean radius in meters */
  radius: number;
  /** Oblateness (equatorial bulge factor, 0 = perfect sphere) */
  oblateness: number;
  /** Rotation period in seconds (negative = retrograde) */
  rotationPeriod: number;
  /** Axial tilt in radians */
  axialTilt: number;
  /** Softening factor for gravity calculation (prevents singularities) */
  softening: number;
  
  // State (initial conditions)
  /** Position in meters (absolute coordinates) */
  position: Vector3;
  /** Velocity in meters per second */
  velocity: Vector3;
  /** Orientation quaternion */
  orientation: Quaternion;
  /** Angular velocity in rad/s (around rotation axis) */
  angularVelocity: number;
  
  // Hierarchical organization
  /** ID of parent body (null for root objects like stars) */
  parentId: string | null;
  /** IDs of child bodies */
  childIds: string[];
  /** Calculated sphere of influence in meters */
  soiRadius: number;
  
  // Visual properties
  /** Base color RGB (0-1) */
  color: [number, number, number];
  /** Albedo (reflectivity, 0-1) */
  albedo: number;
  /** Emissive (self-illuminating) */
  emissive: boolean;
  /** Emissive color RGB (0-1) if applicable */
  emissiveColor?: [number, number, number] | undefined;
  /** Emissive intensity multiplier */
  emissiveIntensity?: number | undefined;
  
  // Optional extended properties
  atmosphere?: AtmosphereProperties | undefined;
  rings?: RingProperties | undefined;
  starProperties?: StarProperties | undefined;
  pulsarProperties?: PulsarProperties | undefined;
  blackHoleProperties?: BlackHoleProperties | undefined;
  terrain?: TerrainProperties | undefined;
  
  // Metadata
  /** Description for UI */
  description?: string | undefined;
  /** Tags for filtering */
  tags?: string[] | undefined;
  /** Custom data */
  userData?: Record<string, unknown> | undefined;
}

/**
 * Minimal body state for network synchronization
 */
export interface BodyNetworkState {
  id: string;
  /** Position as [x, y, z] */
  p: [number, number, number];
  /** Velocity as [x, y, z] */
  v: [number, number, number];
  /** Orientation as [x, y, z, w] */
  o: [number, number, number, number];
  /** Angular velocity scalar */
  av: number;
  /** Server timestamp */
  t: number;
}

/**
 * Body state snapshot for interpolation
 */
export interface BodyStateSnapshot {
  position: Vector3;
  velocity: Vector3;
  orientation: Quaternion;
  angularVelocity: number;
  timestamp: number;
}

/**
 * Default atmosphere for Earth-like planets
 */
export const DEFAULT_EARTH_ATMOSPHERE: AtmosphereProperties = {
  hasAtmosphere: true,
  surfacePressure: 101325, // Pa
  scaleHeight: 8500, // m
  composition: [
    { gas: 'N2', fraction: 0.78, molarMass: 0.028 },
    { gas: 'O2', fraction: 0.21, molarMass: 0.032 },
    { gas: 'Ar', fraction: 0.009, molarMass: 0.040 },
    { gas: 'CO2', fraction: 0.0004, molarMass: 0.044 }
  ],
  rayleighCoefficients: [5.8e-6, 13.5e-6, 33.1e-6], // Per meter
  mieCoefficient: 21e-6,
  mieDirectionality: 0.758
};

/**
 * Default terrain for rocky planets
 */
export const DEFAULT_ROCKY_TERRAIN: TerrainProperties = {
  seed: 0,
  terrainType: 'rocky',
  maxDisplacement: 10000, // 10 km max mountains
  octaves: 8,
  frequency: 1,
  lacunarity: 2.0,
  persistence: 0.5,
  hasLiquid: false,
  seaLevel: 0.5
};
