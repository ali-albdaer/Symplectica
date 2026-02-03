/**
 * Physical Constants in SI Units
 * ===============================
 * All values are in standard SI units:
 * - Mass: kilograms (kg)
 * - Distance: meters (m)
 * - Time: seconds (s)
 * - Velocity: meters per second (m/s)
 * - Acceleration: meters per second squared (m/s²)
 *
 * Reference: CODATA 2018, IAU 2015 Resolution B3
 */
/** Gravitational constant G in m³/(kg·s²) */
export declare const G = 6.6743e-11;
/** Speed of light in vacuum in m/s */
export declare const SPEED_OF_LIGHT = 299792458;
/** Astronomical Unit in meters (IAU 2012) */
export declare const AU = 149597870700;
/** Parsec in meters */
export declare const PARSEC = 30856775814913670;
/** Light year in meters */
export declare const LIGHT_YEAR = 9460730472580800;
/** Solar mass in kg (IAU 2015) */
export declare const SOLAR_MASS = 1.98892e+30;
/** Earth mass in kg */
export declare const EARTH_MASS = 5.9722e+24;
/** Lunar mass in kg */
export declare const LUNAR_MASS = 7.342e+22;
/** Jupiter mass in kg */
export declare const JUPITER_MASS = 1.898e+27;
/** Solar radius in meters */
export declare const SOLAR_RADIUS = 696340000;
/** Earth radius (equatorial) in meters */
export declare const EARTH_RADIUS = 6371000;
/** Lunar radius in meters */
export declare const LUNAR_RADIUS = 1737400;
/** Jupiter radius (equatorial) in meters */
export declare const JUPITER_RADIUS = 69911000;
/** Stefan-Boltzmann constant in W/(m²·K⁴) */
export declare const STEFAN_BOLTZMANN = 5.670374419e-8;
/** Solar luminosity in watts */
export declare const SOLAR_LUMINOSITY = 3.828e+26;
/** Planck constant in J·s */
export declare const PLANCK_CONSTANT = 6.62607015e-34;
/** Boltzmann constant in J/K */
export declare const BOLTZMANN_CONSTANT = 1.380649e-23;
/** Standard gravity (Earth surface) in m/s² */
export declare const STANDARD_GRAVITY = 9.80665;
/** Seconds per minute */
export declare const SECONDS_PER_MINUTE = 60;
/** Seconds per hour */
export declare const SECONDS_PER_HOUR = 3600;
/** Seconds per day (mean solar day) */
export declare const SECONDS_PER_DAY = 86400;
/** Seconds per Julian year (365.25 days) */
export declare const SECONDS_PER_YEAR = 31557600;
/** Earth orbital period in seconds (sidereal year) */
export declare const EARTH_ORBITAL_PERIOD = 31558149.504;
/** Schwarzschild radius coefficient: 2G/c² */
export declare const SCHWARZSCHILD_COEFFICIENT: number;
/**
 * Physics simulation constants
 */
/** Physics tick rate in Hz */
export declare const PHYSICS_TICK_RATE = 60;
/** Physics timestep in seconds */
export declare const PHYSICS_TIMESTEP: number;
/** Alias for physics timestep (commonly used) */
export declare const PHYSICS_DT: number;
/** Default gravitational softening factor (prevents singularity) in meters */
export declare const DEFAULT_SOFTENING = 1000;
/** Barnes-Hut opening angle theta (lower = more accurate, higher = faster) */
export declare const BARNES_HUT_THETA = 0.5;
/** SOI transition threshold multiplier (switch integrator when < 5 × radius) */
export declare const SOI_CLOSE_ENCOUNTER_THRESHOLD = 5;
/** Maximum substeps for adaptive integrators */
export declare const MAX_SUBSTEPS = 1000;
/** Adaptive integrator error tolerance */
export declare const INTEGRATOR_TOLERANCE = 1e-12;
/**
 * Rendering/Coordinate constants
 */
/** Distance threshold to trigger floating origin recenter (in meters) */
export declare const RECENTER_THRESHOLD = 100000000;
/** Maximum render distance (in meters) */
export declare const MAX_RENDER_DISTANCE = 10000000000000000;
/** Minimum render distance for logarithmic depth (in meters) */
export declare const MIN_RENDER_DISTANCE = 0.1;
/**
 * Networking constants
 */
/** Network tick rate in Hz */
export declare const NETWORK_TICK_RATE = 20;
/** Network timestep in seconds */
export declare const NETWORK_TIMESTEP: number;
/** Maximum client-side prediction time in seconds */
export declare const MAX_PREDICTION_TIME = 0.5;
/** Interpolation buffer time in seconds */
export declare const INTERPOLATION_BUFFER_TIME = 0.1;
/**
 * Formatting utilities
 */
/**
 * Format a distance value with appropriate units
 */
export declare function formatDistance(meters: number): string;
/**
 * Format a mass value with appropriate units
 */
export declare function formatMass(kg: number): string;
/**
 * Format a time duration with appropriate units
 */
export declare function formatTime(seconds: number): string;
//# sourceMappingURL=constants.d.ts.map