/**
 * Shared types for the solar system simulation.
 * These mirror the Rust types for cross-boundary communication.
 */

// ── Vector Types ──────────────────────────────────────────────────────────────

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const vec3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

export const vec3Add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});

export const vec3Sub = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
});

export const vec3Scale = (v: Vec3, s: number): Vec3 => ({
  x: v.x * s,
  y: v.y * s,
  z: v.z * s,
});

export const vec3Mag = (v: Vec3): number =>
  Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);

export const vec3Normalize = (v: Vec3): Vec3 => {
  const m = vec3Mag(v);
  return m > 0 ? vec3Scale(v, 1 / m) : vec3(0, 0, 0);
};

export const vec3Dot = (a: Vec3, b: Vec3): number =>
  a.x * b.x + a.y * b.y + a.z * b.z;

export const vec3Cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});

export const vec3Lerp = (a: Vec3, b: Vec3, t: number): Vec3 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});

export const vec3Distance = (a: Vec3, b: Vec3): number => vec3Mag(vec3Sub(a, b));

// ── Body Types ────────────────────────────────────────────────────────────────

export type BodyId = number;

export enum BodyType {
  Star = 'Star',
  Planet = 'Planet',
  Moon = 'Moon',
  Asteroid = 'Asteroid',
  Comet = 'Comet',
  DwarfPlanet = 'DwarfPlanet',
  ArtificialSatellite = 'ArtificialSatellite',
  TestParticle = 'TestParticle',
  NeutronStar = 'NeutronStar',
  WhiteDwarf = 'WhiteDwarf',
  BlackHole = 'BlackHole',
}

export interface AtmosphereParams {
  surface_pressure: number;
  surface_density: number;
  scale_height: number;
  molecular_mass: number;
  surface_temperature: number;
  rayleigh_coefficients: [number, number, number];
  mie_coefficient: number;
  mie_direction: number;
}

export interface GravityHarmonics {
  reference_radius: number;
  j_coefficients: number[];
  tesseral_c: number[][];
  tesseral_s: number[][];
}

export interface Body {
  id: BodyId;
  name: string;
  body_type: BodyType;
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  mass: number;
  radius: number;
  rotation_period: number;
  axial_tilt: number;
  rotation_angle: number;
  collision_shape: CollisionShape;
  restitution: number;
  parent_id: BodyId | null;
  soi_radius: number;
  color: [number, number, number];
  luminosity: number;
  albedo: number;
  atmosphere: AtmosphereParams | null;
  gravity_harmonics: GravityHarmonics | null;
  has_rings: boolean;
  ring_inner_radius: number;
  ring_outer_radius: number;
  substep_factor: number;
  required_dt: number;
  is_active: boolean;
  is_massless: boolean;
}

export type CollisionShape =
  | { Sphere: { radius: number } }
  | 'Point';

// ── Simulation Config ─────────────────────────────────────────────────────────

export enum SolverType {
  Direct = 'Direct',
  BarnesHut = 'BarnesHut',
  FMM = 'FMM',
}

export enum IntegratorType {
  VelocityVerlet = 'VelocityVerlet',
  RK45 = 'RK45',
  GaussRadau15 = 'GaussRadau15',
}

export interface SimConfig {
  dt: number;
  time: number;
  tick: number;
  solver_type: SolverType;
  integrator_type: IntegratorType;
  bh_theta: number;
  fmm_order: number;
  softening_length: number;
  enable_atmosphere: boolean;
  enable_drag: boolean;
  enable_radiation_pressure: boolean;
  enable_tidal_forces: boolean;
  enable_spherical_harmonics: boolean;
  adaptive_tolerance: number;
  max_substeps: number;
  conservation_warn_threshold: number;
  conservation_error_threshold: number;
  time_scale: number;
  paused: boolean;
  seed: number;
}

export interface SimulationState {
  config: SimConfig;
  bodies: Body[];
  conserved: ConservedQuantities;
  integrator_switches: IntegratorSwitchEvent[];
  ticks_since_integrator_switch: number;
  integrator_switch_cooldown: number;
}

export interface ConservedQuantities {
  tick: number;
  total_energy: number;
  kinetic_energy: number;
  potential_energy: number;
  linear_momentum: Vec3;
  angular_momentum: Vec3;
  total_mass: number;
  linear_momentum_magnitude: number;
  angular_momentum_magnitude: number;
}

export interface IntegratorSwitchEvent {
  tick: number;
  from: IntegratorType;
  to: IntegratorType;
  reason: string;
}

// ── Step Result ───────────────────────────────────────────────────────────────

export interface StepResult {
  tick: number;
  time: number;
  dt: number;
  body_count: number;
  energy_error: number;
  momentum_error: number;
  collisions: number;
  integrator: string;
  solver: string;
}

// ── Checkpoint ────────────────────────────────────────────────────────────────

export interface Checkpoint {
  version: number;
  tick: number;
  time: number;
  state: SimulationState;
  rng_state: [number, number, number, number];
  checksum: number;
}

// ── Input Actions ─────────────────────────────────────────────────────────────

export type InputAction =
  | { SpawnBody: { name: string; mass: number; radius: number; position: [number, number, number]; velocity: [number, number, number] } }
  | { DeleteBody: { body_id: BodyId } }
  | { ApplyThrust: { body_id: BodyId; force: [number, number, number]; duration: number } }
  | { SetConfig: { key: string; value: string } }
  | { SetPaused: { paused: boolean } }
  | { SetTimeScale: { scale: number } };

export interface InputEvent {
  tick: number;
  player_id: number;
  action: InputAction;
}

// ── Presets ───────────────────────────────────────────────────────────────────

export enum PresetId {
  EmptySpace = 'empty',
  TwoBodyKepler = 'two_body',
  SunEarthMoon = 'sun_earth_moon',
  FullSolarSystem = 'solar_system',
  BinaryStarCircumbinary = 'binary_star',
  AlphaCentauri = 'alpha_centauri',
  RoguePlanetFlyby = 'rogue_planet',
  DenseAsteroidBelt = 'asteroid_belt',
  ExtremeRelativistic = 'extreme',
}

export interface PresetInfo {
  id: PresetId;
  name: string;
  description: string;
  bodyCount: number;
  recommendedSolver: SolverType;
  recommendedIntegrator: IntegratorType;
  recommendedTimestep: number;
}

export const PRESETS: PresetInfo[] = [
  {
    id: PresetId.EmptySpace,
    name: 'Empty Space',
    description: 'Blank canvas for the world builder',
    bodyCount: 0,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.VelocityVerlet,
    recommendedTimestep: 60,
  },
  {
    id: PresetId.TwoBodyKepler,
    name: 'Two-Body Kepler',
    description: 'A star and planet in circular orbit',
    bodyCount: 2,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.VelocityVerlet,
    recommendedTimestep: 3600,
  },
  {
    id: PresetId.SunEarthMoon,
    name: 'Sun-Earth-Moon',
    description: 'Three-body system with atmosphere and tidal effects',
    bodyCount: 3,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.RK45,
    recommendedTimestep: 300,
  },
  {
    id: PresetId.FullSolarSystem,
    name: 'Full Solar System',
    description: 'Sun and all eight planets',
    bodyCount: 9,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.VelocityVerlet,
    recommendedTimestep: 3600,
  },
  {
    id: PresetId.BinaryStarCircumbinary,
    name: 'Binary Star + Circumbinary',
    description: 'Two stars with a circumbinary planet',
    bodyCount: 3,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.RK45,
    recommendedTimestep: 1800,
  },
  {
    id: PresetId.AlphaCentauri,
    name: 'Alpha Centauri',
    description: 'Triple star system with wide orbit',
    bodyCount: 3,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.VelocityVerlet,
    recommendedTimestep: 86400,
  },
  {
    id: PresetId.RoguePlanetFlyby,
    name: 'Rogue Planet Flyby',
    description: 'Hyperbolic flyby perturbing a bound system',
    bodyCount: 3,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.GaussRadau15,
    recommendedTimestep: 3600,
  },
  {
    id: PresetId.DenseAsteroidBelt,
    name: 'Dense Asteroid Belt',
    description: '2000+ asteroids between Mars and Jupiter',
    bodyCount: 2002,
    recommendedSolver: SolverType.BarnesHut,
    recommendedIntegrator: IntegratorType.VelocityVerlet,
    recommendedTimestep: 3600,
  },
  {
    id: PresetId.ExtremeRelativistic,
    name: 'Extreme Relativistic',
    description: 'Neutron star – white dwarf binary with tight orbit',
    bodyCount: 3,
    recommendedSolver: SolverType.Direct,
    recommendedIntegrator: IntegratorType.GaussRadau15,
    recommendedTimestep: 1,
  },
];

// ── Camera ────────────────────────────────────────────────────────────────────

export enum CameraMode {
  Orbit = 'orbit',
  HorizonCentric = 'horizon',
  Chase = 'chase',
  FreeFly = 'freefly',
}

export interface CameraState {
  mode: CameraMode;
  targetBodyId: BodyId | null;
  position: Vec3;
  lookAt: Vec3;
  up: Vec3;
  fov: number;
  near: number;
  far: number;
  distance: number;
  phi: number;       // azimuthal angle
  theta: number;     // polar angle
}

// ── Player ────────────────────────────────────────────────────────────────────

export interface Player {
  id: number;
  name: string;
  color: [number, number, number];
  controlledBodyId: BodyId | null;
  camera: CameraState;
  isAdmin: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const G = 6.67430e-11;
export const C = 2.99792458e8;
export const SOLAR_MASS = 1.98892e30;
export const EARTH_MASS = 5.9722e24;
export const EARTH_RADIUS = 6.371e6;
export const AU = 1.495978707e11;
export const SOLAR_LUMINOSITY = 3.828e26;
export const PI = Math.PI;
export const TWO_PI = 2 * Math.PI;
