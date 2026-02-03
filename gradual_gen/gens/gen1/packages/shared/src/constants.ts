/**
 * SI Physical Constants
 * 
 * All values are in SI base units (meters, kilograms, seconds)
 * Source: CODATA 2018, IAU 2015 Resolution B3
 * 
 * @module constants
 */

// ============================================================================
// FUNDAMENTAL PHYSICAL CONSTANTS
// ============================================================================

/**
 * Gravitational constant (CODATA 2018)
 * Units: m³ kg⁻¹ s⁻²
 * Uncertainty: ±1.5 × 10⁻¹⁵
 */
export const G = 6.67430e-11;

/**
 * Speed of light in vacuum (exact, SI definition)
 * Units: m s⁻¹
 */
export const C = 299_792_458;

/**
 * Stefan-Boltzmann constant
 * Units: W m⁻² K⁻⁴
 */
export const STEFAN_BOLTZMANN = 5.670374419e-8;

/**
 * Planck constant
 * Units: J s
 */
export const PLANCK = 6.62607015e-34;

/**
 * Boltzmann constant
 * Units: J K⁻¹
 */
export const BOLTZMANN = 1.380649e-23;

// ============================================================================
// ASTRONOMICAL CONSTANTS (IAU 2015 Resolution B3)
// ============================================================================

/**
 * Astronomical Unit (exact IAU 2012 definition)
 * Units: m
 */
export const AU = 149_597_870_700;

/**
 * Parsec (derived from AU)
 * Units: m
 * 1 pc = 648000/π AU
 */
export const PARSEC = (648_000 / Math.PI) * AU;

/**
 * Light year (derived from c and Julian year)
 * Units: m
 */
export const LIGHT_YEAR = C * 365.25 * 24 * 3600;

/**
 * Julian year (exactly 365.25 days)
 * Units: s
 */
export const JULIAN_YEAR = 365.25 * 24 * 3600;

/**
 * Sidereal year (Earth's orbital period)
 * Units: s
 * Value: 365.256363004 days
 */
export const SIDEREAL_YEAR = 365.256363004 * 24 * 3600;

/**
 * Tropical year (mean solar year)
 * Units: s
 * Value: 365.24219 days
 */
export const TROPICAL_YEAR = 365.24219 * 24 * 3600;

// ============================================================================
// SOLAR SYSTEM REFERENCE MASSES (IAU 2015 Nominal Values)
// ============================================================================

/**
 * Solar mass parameter GM☉ (TDB-compatible)
 * Units: m³ s⁻²
 * This is known more precisely than M☉ alone
 */
export const GM_SUN = 1.3271244e20;

/**
 * Solar mass (derived from GM☉/G)
 * Units: kg
 */
export const M_SUN = GM_SUN / G;

/**
 * Nominal solar radius (IAU 2015)
 * Units: m
 */
export const R_SUN = 6.957e8;

/**
 * Solar luminosity (IAU 2015 nominal)
 * Units: W
 */
export const L_SUN = 3.828e26;

/**
 * Earth mass parameter GM⊕
 * Units: m³ s⁻²
 */
export const GM_EARTH = 3.986004418e14;

/**
 * Earth mass (derived)
 * Units: kg
 */
export const M_EARTH = GM_EARTH / G;

/**
 * Nominal Earth equatorial radius (IAU 2015)
 * Units: m
 */
export const R_EARTH = 6.3781e6;

/**
 * Earth polar radius
 * Units: m
 */
export const R_EARTH_POLAR = 6.3568e6;

/**
 * Jupiter mass parameter GM♃
 * Units: m³ s⁻²
 */
export const GM_JUPITER = 1.26686534e17;

/**
 * Jupiter mass (derived)
 * Units: kg
 */
export const M_JUPITER = GM_JUPITER / G;

/**
 * Nominal Jupiter equatorial radius (IAU 2015)
 * Units: m
 */
export const R_JUPITER = 7.1492e7;

/**
 * Lunar mass parameter GM☽
 * Units: m³ s⁻²
 */
export const GM_MOON = 4.9028695e12;

/**
 * Lunar mass (derived)
 * Units: kg
 */
export const M_MOON = GM_MOON / G;

/**
 * Mean lunar radius
 * Units: m
 */
export const R_MOON = 1.7374e6;

// ============================================================================
// TIME CONSTANTS
// ============================================================================

/**
 * Seconds per day
 */
export const SECONDS_PER_DAY = 86400;

/**
 * Seconds per hour
 */
export const SECONDS_PER_HOUR = 3600;

/**
 * Seconds per minute
 */
export const SECONDS_PER_MINUTE = 60;

/**
 * J2000.0 epoch as Julian Date
 * 2000 January 1, 12:00 TT
 */
export const J2000_JD = 2451545.0;

/**
 * J2000.0 epoch as Unix timestamp (ms)
 * Note: Approximation since Unix time is UTC, J2000 is TT
 */
export const J2000_UNIX_MS = 946728000000;

// ============================================================================
// SIMULATION CONSTANTS
// ============================================================================

/**
 * Physics simulation tick rate
 * Units: Hz
 */
export const PHYSICS_TICK_RATE = 60;

/**
 * Physics timestep (derived)
 * Units: s
 */
export const PHYSICS_DT = 1 / PHYSICS_TICK_RATE;

/**
 * Gravitational softening factor
 * Prevents singularities at r → 0
 * Applied as: a = GM / (r² + ε²)
 * Units: m (should be scaled per body)
 */
export const DEFAULT_SOFTENING = 1000; // 1 km default

/**
 * Barnes-Hut opening angle theta
 * θ < 0.5 is accurate, θ > 1.0 is fast
 */
export const BARNES_HUT_THETA = 0.5;

/**
 * SOI multiplier for integrator switching
 * Switch to high-order integrator when r < SOI_SWITCH_FACTOR * radius
 */
export const SOI_SWITCH_FACTOR = 5;

/**
 * Floating origin recenter threshold
 * Units: m
 * Recenter when camera exceeds this distance from origin
 */
export const FLOATING_ORIGIN_THRESHOLD = 1e7; // 10,000 km

// ============================================================================
// UNIVERSE SIZE PRESETS
// ============================================================================

/**
 * Universe size configurations
 * These define limits for different server capacities
 */
export const UNIVERSE_PRESETS = {
  /**
   * Small Universe - For low-end servers / local testing
   * - Good for: Development, demos, small groups
   * - Hardware: Single-core, 2GB RAM
   */
  small: {
    maxMassiveBodies: 50,      // Stars, planets, moons
    maxPassiveBodies: 500,     // Asteroids, debris
    maxPlayers: 8,
    maxTickRate: 60,           // Hz
    barnesHutTheta: 0.7,       // Faster, less accurate
    octreeMaxDepth: 8,
    description: 'Small universe for development and small groups'
  },

  /**
   * Medium Universe - Standard production
   * - Good for: Most multiplayer scenarios
   * - Hardware: Quad-core, 8GB RAM
   */
  medium: {
    maxMassiveBodies: 200,
    maxPassiveBodies: 5000,
    maxPlayers: 32,
    maxTickRate: 60,
    barnesHutTheta: 0.5,
    octreeMaxDepth: 12,
    description: 'Standard universe for multiplayer sessions'
  },

  /**
   * Large Universe - High-performance servers
   * - Good for: Full solar system + extras, many players
   * - Hardware: 8+ cores, 32GB RAM, dedicated
   */
  large: {
    maxMassiveBodies: 1000,
    maxPassiveBodies: 50000,
    maxPlayers: 128,
    maxTickRate: 60,
    barnesHutTheta: 0.4,       // More accurate
    octreeMaxDepth: 16,
    description: 'Large universe for full solar system simulation'
  }
} as const;

export type UniverseSize = keyof typeof UNIVERSE_PRESETS;

// ============================================================================
// NUMERICAL PRECISION CONSTANTS
// ============================================================================

/**
 * Maximum safe Float64 integer
 * Beyond this, integer precision is lost
 */
export const MAX_SAFE_POSITION = Number.MAX_SAFE_INTEGER;

/**
 * Float32 epsilon (machine epsilon)
 * Smallest value where 1.0 + ε ≠ 1.0
 */
export const FLOAT32_EPSILON = 1.1920928955078125e-7;

/**
 * Float64 epsilon (machine epsilon)
 */
export const FLOAT64_EPSILON = 2.220446049250313e-16;

/**
 * Minimum distance for force calculation
 * Prevents division by zero
 * Units: m
 */
export const MIN_FORCE_DISTANCE = 1;
