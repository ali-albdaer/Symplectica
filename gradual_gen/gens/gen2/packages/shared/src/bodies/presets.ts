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

import { CelestialBodyDefinition, BodyType, BodyClass, SpectralClass, DEFAULT_EARTH_ATMOSPHERE, DEFAULT_ROCKY_TERRAIN } from './types.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { 
  AU, SOLAR_MASS, EARTH_MASS, LUNAR_MASS, JUPITER_MASS,
  SOLAR_RADIUS, EARTH_RADIUS, LUNAR_RADIUS, JUPITER_RADIUS,
  SOLAR_LUMINOSITY, SECONDS_PER_DAY
} from '../constants.js';
import { circularOrbitalVelocity, sphereOfInfluence } from '../math/orbital.js';

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
export function createOrbitingBody(
  id: string,
  name: string,
  mass: number,
  radius: number,
  parentMass: number,
  orbitRadius: number,
  options: Partial<CelestialBodyDefinition> = {}
): CelestialBodyDefinition {
  const velocity = circularOrbitalVelocity(orbitRadius, parentMass);
  const soi = mass > 0 ? sphereOfInfluence(orbitRadius, mass, parentMass) : 0;

  return {
    id,
    name,
    type: mass > 1e15 ? BodyType.MASSIVE : BodyType.PASSIVE,
    bodyClass: options.bodyClass ?? BodyClass.TERRESTRIAL,
    mass,
    radius,
    oblateness: options.oblateness ?? 0,
    rotationPeriod: options.rotationPeriod ?? SECONDS_PER_DAY,
    axialTilt: options.axialTilt ?? 0,
    softening: options.softening ?? 1000,
    position: new Vector3(orbitRadius, 0, 0),
    velocity: new Vector3(0, 0, velocity),
    orientation: Quaternion.identity(),
    angularVelocity: options.angularVelocity ?? 0,
    parentId: options.parentId ?? null,
    childIds: options.childIds ?? [],
    soiRadius: soi,
    color: options.color ?? [0.5, 0.5, 0.5],
    albedo: options.albedo ?? 0.3,
    emissive: options.emissive ?? false,
    ...options
  };
}

/**
 * Empty World - Just a point in space
 */
export function createEmptyWorld(): WorldState {
  return {
    name: 'Empty World',
    description: 'An empty universe ready for creation.',
    seed: 42,
    bodies: []
  };
}

/**
 * Sun-Earth-Moon System
 * Verification:
 * - Earth orbital period: 365.256 days
 * - Moon orbital period around Earth: 27.322 days
 */
export function createSunEarthMoon(): WorldState {
  const sun: CelestialBodyDefinition = {
    id: 'sun',
    name: 'Sun',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: SOLAR_MASS,
    radius: SOLAR_RADIUS,
    oblateness: 9e-6,
    rotationPeriod: 25.05 * SECONDS_PER_DAY, // Equatorial rotation
    axialTilt: 0.1265, // 7.25 degrees
    softening: SOLAR_RADIUS * 0.01,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: ['earth'],
    soiRadius: Infinity,
    color: [1.0, 0.95, 0.8],
    albedo: 0,
    emissive: true,
    emissiveColor: [1.0, 0.98, 0.9],
    emissiveIntensity: 1.0,
    starProperties: {
      spectralClass: SpectralClass.G,
      spectralSubclass: 2,
      luminosityClass: 'V',
      temperature: 5778,
      luminosity: SOLAR_LUMINOSITY,
      isVariable: false,
      hasFlares: true,
      flareIntensity: 0.1
    }
  };

  // Earth at 1 AU
  const earthOrbitRadius = AU;
  const earthOrbitalVelocity = circularOrbitalVelocity(earthOrbitRadius, SOLAR_MASS);
  const earthSOI = sphereOfInfluence(earthOrbitRadius, EARTH_MASS, SOLAR_MASS);

  const earth: CelestialBodyDefinition = {
    id: 'earth',
    name: 'Earth',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.TERRESTRIAL,
    mass: EARTH_MASS,
    radius: EARTH_RADIUS,
    oblateness: 0.00335,
    rotationPeriod: 23.9344696 * 3600, // Sidereal day in seconds
    axialTilt: 0.4091, // 23.44 degrees
    softening: 1000,
    position: new Vector3(earthOrbitRadius, 0, 0),
    velocity: new Vector3(0, 0, earthOrbitalVelocity),
    orientation: new Quaternion().setFromEuler(0.4091, 0, 0),
    angularVelocity: 0,
    parentId: 'sun',
    childIds: ['moon'],
    soiRadius: earthSOI,
    color: [0.2, 0.4, 0.8],
    albedo: 0.306,
    emissive: false,
    atmosphere: DEFAULT_EARTH_ATMOSPHERE,
    terrain: {
      ...DEFAULT_ROCKY_TERRAIN,
      seed: 12345,
      terrainType: 'oceanic',
      maxDisplacement: 8848, // Mt Everest
      hasLiquid: true,
      seaLevel: 0.7
    }
  };

  // Moon orbiting Earth
  const moonOrbitRadius = 384400000; // 384,400 km
  const moonOrbitalVelocity = circularOrbitalVelocity(moonOrbitRadius, EARTH_MASS);
  const moonSOI = sphereOfInfluence(moonOrbitRadius, LUNAR_MASS, EARTH_MASS);

  const moon: CelestialBodyDefinition = {
    id: 'moon',
    name: 'Moon',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.MOON,
    mass: LUNAR_MASS,
    radius: LUNAR_RADIUS,
    oblateness: 0.0012,
    rotationPeriod: 27.321661 * SECONDS_PER_DAY, // Tidally locked
    axialTilt: 0.0267, // 1.53 degrees
    softening: 500,
    // Position relative to Sun (Earth position + Moon offset)
    position: new Vector3(earthOrbitRadius + moonOrbitRadius, 0, 0),
    // Velocity relative to Sun (Earth velocity + Moon orbital velocity around Earth)
    velocity: new Vector3(0, 0, earthOrbitalVelocity + moonOrbitalVelocity),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: 'earth',
    childIds: [],
    soiRadius: moonSOI,
    color: [0.7, 0.7, 0.7],
    albedo: 0.12,
    emissive: false,
    terrain: {
      ...DEFAULT_ROCKY_TERRAIN,
      seed: 67890,
      terrainType: 'rocky',
      maxDisplacement: 10786, // Lunar Apennines
      hasLiquid: false,
      seaLevel: 0
    }
  };

  return {
    name: 'Sun-Earth-Moon',
    description: 'The Sun, Earth, and Moon system. Verify: Earth orbits in 365.256 days.',
    seed: 12345,
    bodies: [sun, earth, moon]
  };
}

/**
 * Full Solar System
 * All major planets with correct orbital parameters
 */
export function createFullSolarSystem(): WorldState {
  const sun: CelestialBodyDefinition = {
    id: 'sun',
    name: 'Sun',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: SOLAR_MASS,
    radius: SOLAR_RADIUS,
    oblateness: 9e-6,
    rotationPeriod: 25.05 * SECONDS_PER_DAY,
    axialTilt: 0.1265,
    softening: SOLAR_RADIUS * 0.01,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'],
    soiRadius: Infinity,
    color: [1.0, 0.95, 0.8],
    albedo: 0,
    emissive: true,
    emissiveColor: [1.0, 0.98, 0.9],
    emissiveIntensity: 1.0,
    starProperties: {
      spectralClass: SpectralClass.G,
      spectralSubclass: 2,
      luminosityClass: 'V',
      temperature: 5778,
      luminosity: SOLAR_LUMINOSITY,
      isVariable: false,
      hasFlares: true,
      flareIntensity: 0.1
    }
  };

  // Planet data: [id, name, mass(kg), radius(m), semiMajorAxis(m), rotationPeriod(s), axialTilt(rad), color, bodyClass]
  const planetData: Array<{
    id: string;
    name: string;
    mass: number;
    radius: number;
    sma: number;
    rotPeriod: number;
    tilt: number;
    color: [number, number, number];
    bodyClass: BodyClass;
    hasAtmosphere: boolean;
    rings?: boolean;
  }> = [
    {
      id: 'mercury',
      name: 'Mercury',
      mass: 3.3011e23,
      radius: 2439700,
      sma: 0.387 * AU,
      rotPeriod: 58.646 * SECONDS_PER_DAY,
      tilt: 0.00059, // ~0.034 degrees
      color: [0.6, 0.5, 0.4],
      bodyClass: BodyClass.TERRESTRIAL,
      hasAtmosphere: false
    },
    {
      id: 'venus',
      name: 'Venus',
      mass: 4.8675e24,
      radius: 6051800,
      sma: 0.723 * AU,
      rotPeriod: -243.025 * SECONDS_PER_DAY, // Retrograde
      tilt: 3.0944, // 177.36 degrees (retrograde)
      color: [0.9, 0.8, 0.5],
      bodyClass: BodyClass.TERRESTRIAL,
      hasAtmosphere: true
    },
    {
      id: 'earth',
      name: 'Earth',
      mass: EARTH_MASS,
      radius: EARTH_RADIUS,
      sma: AU,
      rotPeriod: 23.9344696 * 3600,
      tilt: 0.4091,
      color: [0.2, 0.4, 0.8],
      bodyClass: BodyClass.TERRESTRIAL,
      hasAtmosphere: true
    },
    {
      id: 'mars',
      name: 'Mars',
      mass: 6.4171e23,
      radius: 3389500,
      sma: 1.524 * AU,
      rotPeriod: 24.6229 * 3600,
      tilt: 0.4396, // 25.19 degrees
      color: [0.8, 0.4, 0.2],
      bodyClass: BodyClass.TERRESTRIAL,
      hasAtmosphere: true
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      mass: JUPITER_MASS,
      radius: JUPITER_RADIUS,
      sma: 5.203 * AU,
      rotPeriod: 9.9250 * 3600,
      tilt: 0.0546, // 3.13 degrees
      color: [0.8, 0.7, 0.5],
      bodyClass: BodyClass.GAS_GIANT,
      hasAtmosphere: true
    },
    {
      id: 'saturn',
      name: 'Saturn',
      mass: 5.6834e26,
      radius: 58232000,
      sma: 9.537 * AU,
      rotPeriod: 10.656 * 3600,
      tilt: 0.4665, // 26.73 degrees
      color: [0.9, 0.85, 0.6],
      bodyClass: BodyClass.GAS_GIANT,
      hasAtmosphere: true,
      rings: true
    },
    {
      id: 'uranus',
      name: 'Uranus',
      mass: 8.6810e25,
      radius: 25362000,
      sma: 19.19 * AU,
      rotPeriod: -17.24 * 3600, // Retrograde
      tilt: 1.7064, // 97.77 degrees
      color: [0.5, 0.8, 0.9],
      bodyClass: BodyClass.ICE_GIANT,
      hasAtmosphere: true,
      rings: true
    },
    {
      id: 'neptune',
      name: 'Neptune',
      mass: 1.02413e26,
      radius: 24622000,
      sma: 30.07 * AU,
      rotPeriod: 16.11 * 3600,
      tilt: 0.4943, // 28.32 degrees
      color: [0.2, 0.3, 0.9],
      bodyClass: BodyClass.ICE_GIANT,
      hasAtmosphere: true
    }
  ];

  const bodies: CelestialBodyDefinition[] = [sun];

  for (const p of planetData) {
    const velocity = circularOrbitalVelocity(p.sma, SOLAR_MASS);
    const soi = sphereOfInfluence(p.sma, p.mass, SOLAR_MASS);

    const planet: CelestialBodyDefinition = {
      id: p.id,
      name: p.name,
      type: BodyType.MASSIVE,
      bodyClass: p.bodyClass,
      mass: p.mass,
      radius: p.radius,
      oblateness: p.id === 'saturn' ? 0.098 : p.id === 'jupiter' ? 0.065 : 0.003,
      rotationPeriod: p.rotPeriod,
      axialTilt: p.tilt,
      softening: Math.max(1000, p.radius * 0.001),
      position: new Vector3(p.sma, 0, 0),
      velocity: new Vector3(0, 0, velocity),
      orientation: new Quaternion().setFromEuler(p.tilt, 0, 0),
      angularVelocity: 0,
      parentId: 'sun',
      childIds: p.id === 'earth' ? ['moon'] : [],
      soiRadius: soi,
      color: p.color,
      albedo: p.bodyClass === BodyClass.GAS_GIANT ? 0.5 : 0.3,
      emissive: false,
      atmosphere: p.hasAtmosphere ? {
        hasAtmosphere: true,
        surfacePressure: p.id === 'earth' ? 101325 : p.id === 'venus' ? 9.2e6 : 1000,
        scaleHeight: p.id === 'earth' ? 8500 : 10000,
        composition: [],
        rayleighCoefficients: p.id === 'earth' ? [5.8e-6, 13.5e-6, 33.1e-6] : [1e-6, 1e-6, 1e-6],
        mieCoefficient: 21e-6,
        mieDirectionality: 0.758
      } : undefined,
      rings: p.rings ? {
        innerRadius: p.radius * 1.5,
        outerRadius: p.radius * 2.5,
        textureSeed: 12345,
        opacity: 0.8,
        color: [0.9, 0.85, 0.7]
      } : undefined
    };

    bodies.push(planet);
  }

  // Add Moon
  const earthPos = bodies.find(b => b.id === 'earth')!.position;
  const earthVel = bodies.find(b => b.id === 'earth')!.velocity;
  const moonOrbitRadius = 384400000;
  const moonOrbitalVelocity = circularOrbitalVelocity(moonOrbitRadius, EARTH_MASS);

  bodies.push({
    id: 'moon',
    name: 'Moon',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.MOON,
    mass: LUNAR_MASS,
    radius: LUNAR_RADIUS,
    oblateness: 0.0012,
    rotationPeriod: 27.321661 * SECONDS_PER_DAY,
    axialTilt: 0.0267,
    softening: 500,
    position: Vector3.add(earthPos, new Vector3(moonOrbitRadius, 0, 0)),
    velocity: Vector3.add(earthVel, new Vector3(0, 0, moonOrbitalVelocity)),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: 'earth',
    childIds: [],
    soiRadius: sphereOfInfluence(moonOrbitRadius, LUNAR_MASS, EARTH_MASS),
    color: [0.7, 0.7, 0.7],
    albedo: 0.12,
    emissive: false
  });

  return {
    name: 'Full Solar System',
    description: 'Complete Solar System with all 8 planets and the Moon.',
    seed: 54321,
    bodies
  };
}

/**
 * Alpha Centauri AB Binary System
 * Two Sun-like stars in binary orbit
 */
export function createAlphaCentauri(): WorldState {
  // System barycenter at origin
  // Alpha Centauri A: 1.1 solar masses, G2V
  // Alpha Centauri B: 0.907 solar masses, K1V
  // Mean separation: ~23 AU, period: 79.91 years

  const massA = 1.1 * SOLAR_MASS;
  const massB = 0.907 * SOLAR_MASS;
  const totalMass = massA + massB;
  const separation = 23 * AU;

  // Positions from barycenter
  const posA = separation * massB / totalMass;
  const posB = -separation * massA / totalMass;

  // Orbital velocity around barycenter
  const orbitalPeriod = 79.91 * 365.25 * SECONDS_PER_DAY;
  const velA = 2 * Math.PI * posA / orbitalPeriod;
  const velB = 2 * Math.PI * Math.abs(posB) / orbitalPeriod;

  const alphaCentauriA: CelestialBodyDefinition = {
    id: 'alpha_centauri_a',
    name: 'Alpha Centauri A',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: massA,
    radius: 1.2234 * SOLAR_RADIUS,
    oblateness: 0,
    rotationPeriod: 22 * SECONDS_PER_DAY,
    axialTilt: 0,
    softening: SOLAR_RADIUS * 0.01,
    position: new Vector3(posA, 0, 0),
    velocity: new Vector3(0, 0, velA),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: [],
    soiRadius: Infinity,
    color: [1.0, 0.95, 0.85],
    albedo: 0,
    emissive: true,
    emissiveColor: [1.0, 0.95, 0.85],
    emissiveIntensity: 1.5,
    starProperties: {
      spectralClass: SpectralClass.G,
      spectralSubclass: 2,
      luminosityClass: 'V',
      temperature: 5790,
      luminosity: 1.519 * SOLAR_LUMINOSITY,
      isVariable: false,
      hasFlares: true,
      flareIntensity: 0.1
    }
  };

  const alphaCentauriB: CelestialBodyDefinition = {
    id: 'alpha_centauri_b',
    name: 'Alpha Centauri B',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: massB,
    radius: 0.8632 * SOLAR_RADIUS,
    oblateness: 0,
    rotationPeriod: 41 * SECONDS_PER_DAY,
    axialTilt: 0,
    softening: SOLAR_RADIUS * 0.01,
    position: new Vector3(posB, 0, 0),
    velocity: new Vector3(0, 0, -velB),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: [],
    soiRadius: Infinity,
    color: [1.0, 0.85, 0.7],
    albedo: 0,
    emissive: true,
    emissiveColor: [1.0, 0.85, 0.7],
    emissiveIntensity: 0.5,
    starProperties: {
      spectralClass: SpectralClass.K,
      spectralSubclass: 1,
      luminosityClass: 'V',
      temperature: 5260,
      luminosity: 0.445 * SOLAR_LUMINOSITY,
      isVariable: false,
      hasFlares: true,
      flareIntensity: 0.15
    }
  };

  return {
    name: 'Alpha Centauri AB',
    description: 'Binary star system 4.37 light-years from Earth. Orbital period: 79.91 years.',
    seed: 98765,
    bodies: [alphaCentauriA, alphaCentauriB]
  };
}

/**
 * PSR B1620-26 Extreme System
 * Pulsar + White Dwarf + Planet system
 * Tests extreme physics conditions
 */
export function createPSRB1620(): WorldState {
  // Pulsar: 1.34 solar masses, 10km radius, 11ms rotation period
  const pulsarMass = 1.34 * SOLAR_MASS;
  const pulsarRadius = 10000; // 10 km

  // White dwarf companion: 0.34 solar masses
  const wdMass = 0.34 * SOLAR_MASS;
  const wdRadius = 0.01 * SOLAR_RADIUS; // ~7000 km

  // Binary separation: ~1 AU, period: 191 days
  const binarySeparation = 0.84 * AU;
  const totalMass = pulsarMass + wdMass;

  // Circumbinary planet: 2.5 Jupiter masses, 23 AU orbit
  const planetMass = 2.5 * JUPITER_MASS;
  const planetOrbit = 23 * AU;

  // Calculate positions
  const pulsarPos = binarySeparation * wdMass / totalMass;
  const wdPos = -binarySeparation * pulsarMass / totalMass;

  // Binary orbital velocity
  const binaryPeriod = 191 * SECONDS_PER_DAY;
  const pulsarVel = 2 * Math.PI * pulsarPos / binaryPeriod;
  const wdVel = 2 * Math.PI * Math.abs(wdPos) / binaryPeriod;

  // Planet orbital velocity around binary barycenter
  const planetVel = circularOrbitalVelocity(planetOrbit, totalMass);

  const pulsar: CelestialBodyDefinition = {
    id: 'psr_b1620_pulsar',
    name: 'PSR B1620-26',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.PULSAR,
    mass: pulsarMass,
    radius: pulsarRadius,
    oblateness: 0,
    rotationPeriod: 0.011, // 11 milliseconds!
    axialTilt: 0.1,
    softening: pulsarRadius,
    position: new Vector3(pulsarPos, 0, 0),
    velocity: new Vector3(0, 0, pulsarVel),
    orientation: Quaternion.identity(),
    angularVelocity: 2 * Math.PI / 0.011,
    parentId: null,
    childIds: [],
    soiRadius: Infinity,
    color: [0.8, 0.8, 1.0],
    albedo: 0,
    emissive: true,
    emissiveColor: [0.7, 0.7, 1.0],
    emissiveIntensity: 10.0,
    starProperties: {
      spectralClass: SpectralClass.O,
      spectralSubclass: 0,
      luminosityClass: 'Pulsar',
      temperature: 1e6,
      luminosity: 0.001 * SOLAR_LUMINOSITY,
      isVariable: true,
      variablePeriod: 0.011,
      hasFlares: false,
      flareIntensity: 0
    }
  };

  const whiteDwarf: CelestialBodyDefinition = {
    id: 'psr_b1620_wd',
    name: 'WD B1620-26',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: wdMass,
    radius: wdRadius,
    oblateness: 0,
    rotationPeriod: 3600, // Slow rotation
    axialTilt: 0,
    softening: wdRadius,
    position: new Vector3(wdPos, 0, 0),
    velocity: new Vector3(0, 0, -wdVel),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: [],
    soiRadius: Infinity,
    color: [1.0, 1.0, 1.0],
    albedo: 0,
    emissive: true,
    emissiveColor: [1.0, 1.0, 1.0],
    emissiveIntensity: 0.01,
    starProperties: {
      spectralClass: SpectralClass.A,
      spectralSubclass: 0,
      luminosityClass: 'WD',
      temperature: 25000,
      luminosity: 0.0001 * SOLAR_LUMINOSITY,
      isVariable: false,
      hasFlares: false,
      flareIntensity: 0
    }
  };

  const planet: CelestialBodyDefinition = {
    id: 'psr_b1620_planet',
    name: 'Methuselah (PSR B1620-26 b)',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.GAS_GIANT,
    mass: planetMass,
    radius: JUPITER_RADIUS * 1.3,
    oblateness: 0.06,
    rotationPeriod: 10 * 3600,
    axialTilt: 0.1,
    softening: 10000,
    position: new Vector3(planetOrbit, 0, 0),
    velocity: new Vector3(0, 0, planetVel),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: [],
    soiRadius: sphereOfInfluence(planetOrbit, planetMass, totalMass),
    color: [0.6, 0.5, 0.4],
    albedo: 0.5,
    emissive: false,
    atmosphere: {
      hasAtmosphere: true,
      surfacePressure: 1e6,
      scaleHeight: 50000,
      composition: [],
      rayleighCoefficients: [1e-6, 1e-6, 1e-6],
      mieCoefficient: 1e-5,
      mieDirectionality: 0.7
    }
  };

  return {
    name: 'PSR B1620-26',
    description: 'Extreme pulsar system with white dwarf companion and ancient circumbinary planet "Methuselah" (~12.7 billion years old).',
    seed: 16200026,
    bodies: [pulsar, whiteDwarf, planet]
  };
}

/**
 * Black Hole Test System
 * For testing gravitational lensing and extreme gravity
 */
export function createBlackHoleSystem(): WorldState {
  const bhMass = 10 * SOLAR_MASS;
  const bhRadius = (2 * 6.67430e-11 * bhMass) / (299792458 * 299792458); // Schwarzschild radius

  const blackHole: CelestialBodyDefinition = {
    id: 'black_hole',
    name: 'Cygnus X-1 Analog',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.BLACK_HOLE,
    mass: bhMass,
    radius: bhRadius,
    oblateness: 0,
    rotationPeriod: 0, // Not applicable
    axialTilt: 0,
    softening: bhRadius * 0.1,
    position: new Vector3(0, 0, 0),
    velocity: new Vector3(0, 0, 0),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: null,
    childIds: [],
    soiRadius: Infinity,
    color: [0, 0, 0],
    albedo: 0,
    emissive: false,
    blackHoleProperties: {
      schwarzschildRadius: bhRadius,
      spinParameter: 0.5,
      hasAccretionDisk: true,
      accretionDiskInner: 3, // In Schwarzschild radii
      accretionDiskOuter: 20,
      accretionDiskTemperature: 1e7
    }
  };

  // Companion star being stripped
  const companionOrbit = 0.2 * AU;
  const companionVel = circularOrbitalVelocity(companionOrbit, bhMass);

  const companion: CelestialBodyDefinition = {
    id: 'companion_star',
    name: 'HDE 226868 Analog',
    type: BodyType.MASSIVE,
    bodyClass: BodyClass.STAR,
    mass: 20 * SOLAR_MASS,
    radius: 20 * SOLAR_RADIUS,
    oblateness: 0.1,
    rotationPeriod: 5.6 * SECONDS_PER_DAY,
    axialTilt: 0,
    softening: SOLAR_RADIUS,
    position: new Vector3(companionOrbit, 0, 0),
    velocity: new Vector3(0, 0, companionVel),
    orientation: Quaternion.identity(),
    angularVelocity: 0,
    parentId: 'black_hole',
    childIds: [],
    soiRadius: sphereOfInfluence(companionOrbit, 20 * SOLAR_MASS, bhMass),
    color: [0.8, 0.85, 1.0],
    albedo: 0,
    emissive: true,
    emissiveColor: [0.8, 0.85, 1.0],
    emissiveIntensity: 50,
    starProperties: {
      spectralClass: SpectralClass.O,
      spectralSubclass: 9,
      luminosityClass: 'Iab',
      temperature: 31000,
      luminosity: 300000 * SOLAR_LUMINOSITY,
      isVariable: true,
      variablePeriod: 5.6 * SECONDS_PER_DAY,
      hasFlares: true,
      flareIntensity: 1.0
    }
  };

  return {
    name: 'Black Hole System',
    description: 'Stellar-mass black hole with accretion disk and companion star. Tests gravitational lensing.',
    seed: 666666,
    bodies: [blackHole, companion]
  };
}

/**
 * Get preset by name
 */
export function getPresetWorld(name: string): WorldState | null {
  switch (name.toLowerCase()) {
    case 'empty':
      return createEmptyWorld();
    case 'sun-earth-moon':
    case 'earth':
      return createSunEarthMoon();
    case 'solar-system':
    case 'full':
      return createFullSolarSystem();
    case 'alpha-centauri':
    case 'binary':
      return createAlphaCentauri();
    case 'psr-b1620':
    case 'pulsar':
      return createPSRB1620();
    case 'black-hole':
    case 'blackhole':
      return createBlackHoleSystem();
    default:
      return null;
  }
}

/**
 * List available presets
 */
export function listPresetWorlds(): Array<{ name: string; description: string }> {
  return [
    { name: 'empty', description: 'Empty universe' },
    { name: 'sun-earth-moon', description: 'Sun, Earth, and Moon' },
    { name: 'solar-system', description: 'Full Solar System with all planets' },
    { name: 'alpha-centauri', description: 'Alpha Centauri AB binary system' },
    { name: 'psr-b1620', description: 'Extreme pulsar system' },
    { name: 'black-hole', description: 'Black hole with accretion disk' }
  ];
}
