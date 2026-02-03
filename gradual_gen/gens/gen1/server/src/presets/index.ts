/**
 * World Presets
 * 
 * Pre-configured stable orbital systems for quick world setup.
 * All presets use real NASA/JPL data where applicable.
 * 
 * @module presets
 */

import { Vec3, G, type BodyCore, type BodyState, type CelestialType } from '@nbody/shared';
import type { WorldManager } from '../world.js';
import {
  SUN,
  EARTH,
  MOON,
  MERCURY,
  VENUS,
  MARS,
  JUPITER,
  SATURN,
  URANUS,
  NEPTUNE,
  PLUTO,
  SOLAR_SYSTEM_BODIES,
  type SolarSystemBody
} from './solar-system-data.js';

/**
 * Available preset names
 */
export type PresetName = 
  | 'empty'
  | 'sun-earth-moon'
  | 'inner-solar-system'
  | 'full-solar-system'
  | 'alpha-centauri'
  | 'psr-b1620-26';

/**
 * Convert solar system body data to engine format
 */
function bodyToCore(data: SolarSystemBody, index: number): BodyCore {
  const celestialType: CelestialType = data.type === 'star' ? 'star' :
    data.type === 'gas-giant' ? 'gas-giant' :
    data.type === 'dwarf-planet' ? 'dwarf-planet' :
    data.type === 'moon' ? 'moon' : 'planet';
  
  return {
    id: `body-${data.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
    name: data.name,
    bodyType: 'massive',
    celestialType,
    mass: data.mass,
    mu: data.mu,
    radius: data.radius,
    radiusEquatorial: data.radiusEquatorial,
    radiusPolar: data.radiusPolar,
    softening: data.softening ?? 1000,
    rotationPeriod: data.rotationPeriod,
    axialTilt: data.axialTilt,
    parentId: data.parent ? `body-${data.parent.toLowerCase().replace(/\s+/g, '-')}-0` : undefined
  };
}

function bodyToState(data: SolarSystemBody): BodyState {
  return {
    position: Vec3.mutableVec3(data.position[0], data.position[1], data.position[2]),
    velocity: Vec3.mutableVec3(data.velocity[0], data.velocity[1], data.velocity[2]),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  };
}

/**
 * Load a preset into the world
 */
export function loadPreset(world: WorldManager, preset: PresetName): void {
  console.log(`[Presets] Loading preset: ${preset}`);
  
  switch (preset) {
    case 'empty':
      loadEmpty(world);
      break;
    case 'sun-earth-moon':
      loadSunEarthMoon(world);
      break;
    case 'inner-solar-system':
      loadInnerSolarSystem(world);
      break;
    case 'full-solar-system':
      loadFullSolarSystem(world);
      break;
    case 'alpha-centauri':
      loadAlphaCentauri(world);
      break;
    case 'psr-b1620-26':
      loadPSRB1620(world);
      break;
    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/**
 * Empty world - just the Sun
 */
function loadEmpty(world: WorldManager): void {
  const sunCore = bodyToCore(SUN, 0);
  const sunState = bodyToState(SUN);
  world.addBody(sunCore, sunState);
  
  console.log('[Presets] Loaded: Empty (Sun only)');
}

/**
 * Sun-Earth-Moon system
 * The most basic useful preset for testing orbital mechanics
 */
function loadSunEarthMoon(world: WorldManager): void {
  // Add Sun
  world.addBody(bodyToCore(SUN, 0), bodyToState(SUN));
  
  // Add Earth
  world.addBody(bodyToCore(EARTH, 1), bodyToState(EARTH));
  
  // Add Moon
  world.addBody(bodyToCore(MOON, 2), bodyToState(MOON));
  
  console.log('[Presets] Loaded: Sun-Earth-Moon');
  console.log('[Presets] Verification: Earth orbital period should be 365.256 days ±0.1%');
  console.log('[Presets] Verification: Moon orbital period should be 27.322 days ±0.5%');
}

/**
 * Inner solar system (Sun + Mercury through Mars + Moon)
 */
function loadInnerSolarSystem(world: WorldManager): void {
  const innerBodies = [SUN, MERCURY, VENUS, EARTH, MOON, MARS];
  
  innerBodies.forEach((body, index) => {
    world.addBody(bodyToCore(body, index), bodyToState(body));
  });
  
  console.log('[Presets] Loaded: Inner Solar System (6 bodies)');
}

/**
 * Full solar system with all major bodies
 */
function loadFullSolarSystem(world: WorldManager): void {
  SOLAR_SYSTEM_BODIES.forEach((body, index) => {
    world.addBody(bodyToCore(body, index), bodyToState(body));
  });
  
  console.log(`[Presets] Loaded: Full Solar System (${SOLAR_SYSTEM_BODIES.length} bodies)`);
}

/**
 * Alpha Centauri AB binary star system
 * 
 * Data from:
 * - Masses: Pourbaix & Boffin 2016
 * - Orbital elements: Kervella et al. 2016
 */
function loadAlphaCentauri(world: WorldManager): void {
  // System parameters
  const massA = 1.1055 * 1.988409870698051e30;  // 1.1055 solar masses
  const massB = 0.9373 * 1.988409870698051e30;  // 0.9373 solar masses
  const muA = G * massA;
  const muB = G * massB;
  
  const semiMajorAxis = 23.52 * 1.495978707e11;  // 23.52 AU in meters
  const eccentricity = 0.5179;
  const period = 79.91 * 365.25 * 86400;  // 79.91 years in seconds
  
  // Initial positions at periastron
  const perihelion = semiMajorAxis * (1 - eccentricity);
  
  // Reduced mass calculation for velocities
  const totalMass = massA + massB;
  const mu_total = G * totalMass;
  
  // Velocity at periastron (vis-viva equation)
  const aphelion = semiMajorAxis * (1 + eccentricity);
  const v_peri = Math.sqrt(mu_total * (2/perihelion - 1/semiMajorAxis));
  
  // Position ratios based on mass
  const rA = perihelion * massB / totalMass;
  const rB = perihelion * massA / totalMass;
  const vA = v_peri * massB / totalMass;
  const vB = v_peri * massA / totalMass;
  
  // Alpha Centauri A
  world.addBody({
    id: 'alpha-centauri-a',
    name: 'Alpha Centauri A',
    bodyType: 'massive',
    celestialType: 'star',
    mass: massA,
    mu: muA,
    radius: 1.2234 * 6.957e8,  // 1.2234 solar radii
    softening: 1e6,
    rotationPeriod: 22 * 86400  // ~22 days
  }, {
    position: Vec3.mutableVec3(rA, 0, 0),
    velocity: Vec3.mutableVec3(0, vA, 0),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  });
  
  // Alpha Centauri B
  world.addBody({
    id: 'alpha-centauri-b',
    name: 'Alpha Centauri B',
    bodyType: 'massive',
    celestialType: 'star',
    mass: massB,
    mu: muB,
    radius: 0.8632 * 6.957e8,  // 0.8632 solar radii
    softening: 1e6,
    rotationPeriod: 41 * 86400  // ~41 days
  }, {
    position: Vec3.mutableVec3(-rB, 0, 0),
    velocity: Vec3.mutableVec3(0, -vB, 0),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  });
  
  console.log('[Presets] Loaded: Alpha Centauri AB Binary');
  console.log(`[Presets] Verification: Orbital period should be 79.91 years`);
  console.log(`[Presets] Verification: Semi-major axis = 23.52 AU, e = 0.5179`);
}

/**
 * PSR B1620-26 - Extreme circumbinary system
 * 
 * A pulsar + white dwarf binary with a planet in the globular cluster M4
 * This is the oldest known exoplanet (~12.7 billion years)
 * 
 * Data from:
 * - Sigurdsson et al. 2003
 * - Thorsett et al. 1999
 */
function loadPSRB1620(world: WorldManager): void {
  // Pulsar parameters
  const massPulsar = 1.35 * 1.988409870698051e30;  // 1.35 solar masses
  const massWD = 0.34 * 1.988409870698051e30;      // 0.34 solar masses (white dwarf)
  const massTotal = massPulsar + massWD;
  
  // Binary orbital parameters
  const binarySMA = 0.13 * 1.495978707e11;  // 0.13 AU
  const binaryPeriod = 191.44 * 86400;       // 191.44 days
  
  // Calculate velocities for circular orbit approximation
  const mu_binary = G * massTotal;
  const v_orb = Math.sqrt(mu_binary / binarySMA);
  
  const rPulsar = binarySMA * massWD / massTotal;
  const rWD = binarySMA * massPulsar / massTotal;
  const vPulsar = v_orb * massWD / massTotal;
  const vWD = v_orb * massPulsar / massTotal;
  
  // Pulsar
  world.addBody({
    id: 'psr-b1620-26',
    name: 'PSR B1620-26',
    bodyType: 'massive',
    celestialType: 'pulsar',
    mass: massPulsar,
    mu: G * massPulsar,
    radius: 10000,  // ~10 km typical neutron star
    softening: 100,
    rotationPeriod: 0.01107  // 11.07 ms spin period
  }, {
    position: Vec3.mutableVec3(rPulsar, 0, 0),
    velocity: Vec3.mutableVec3(0, vPulsar, 0),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  });
  
  // White Dwarf companion
  world.addBody({
    id: 'psr-b1620-26-b',
    name: 'PSR B1620-26 B (WD)',
    bodyType: 'massive',
    celestialType: 'star',  // White dwarf
    mass: massWD,
    mu: G * massWD,
    radius: 0.01 * 6.957e8,  // ~0.01 solar radii
    softening: 1000
  }, {
    position: Vec3.mutableVec3(-rWD, 0, 0),
    velocity: Vec3.mutableVec3(0, -vWD, 0),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  });
  
  // Circumbinary planet (PSR B1620-26 c, nicknamed "Methuselah")
  const massPlanet = 2.5 * 1.8982e27;  // 2.5 Jupiter masses
  const planetSMA = 23 * 1.495978707e11;  // 23 AU
  const v_planet = Math.sqrt(mu_binary / planetSMA);
  
  world.addBody({
    id: 'methuselah',
    name: 'Methuselah (PSR B1620-26 c)',
    bodyType: 'massive',
    celestialType: 'gas-giant',
    mass: massPlanet,
    mu: G * massPlanet,
    radius: 1.2 * 7.1492e7,  // ~1.2 Jupiter radii (estimate)
    softening: 1e5
  }, {
    position: Vec3.mutableVec3(planetSMA, 0, 0),
    velocity: Vec3.mutableVec3(0, v_planet, 0),
    rotation: 0,
    acceleration: Vec3.mutableZero()
  });
  
  console.log('[Presets] Loaded: PSR B1620-26 System');
  console.log('[Presets] WARNING: This is an extreme system - pulsar spin is 11ms!');
  console.log('[Presets] Binary period: 191.44 days');
  console.log('[Presets] Planet period: ~100 years');
}

/**
 * Get list of available presets
 */
export function getAvailablePresets(): { name: PresetName; description: string }[] {
  return [
    { name: 'empty', description: 'Empty universe with just the Sun' },
    { name: 'sun-earth-moon', description: 'Basic Sun-Earth-Moon system for testing' },
    { name: 'inner-solar-system', description: 'Sun through Mars with Moon' },
    { name: 'full-solar-system', description: 'Complete solar system from NASA/JPL data' },
    { name: 'alpha-centauri', description: 'Alpha Centauri AB binary star system' },
    { name: 'psr-b1620-26', description: 'Extreme pulsar/white dwarf binary with ancient planet' }
  ];
}
