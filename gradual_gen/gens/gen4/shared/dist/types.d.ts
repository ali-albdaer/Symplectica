/**
 * Shared types for the solar system simulation.
 * These mirror the Rust types for cross-boundary communication.
 */
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}
export declare const vec3: (x?: number, y?: number, z?: number) => Vec3;
export declare const vec3Add: (a: Vec3, b: Vec3) => Vec3;
export declare const vec3Sub: (a: Vec3, b: Vec3) => Vec3;
export declare const vec3Scale: (v: Vec3, s: number) => Vec3;
export declare const vec3Mag: (v: Vec3) => number;
export declare const vec3Normalize: (v: Vec3) => Vec3;
export declare const vec3Dot: (a: Vec3, b: Vec3) => number;
export declare const vec3Cross: (a: Vec3, b: Vec3) => Vec3;
export declare const vec3Lerp: (a: Vec3, b: Vec3, t: number) => Vec3;
export declare const vec3Distance: (a: Vec3, b: Vec3) => number;
export type BodyId = number;
export declare enum BodyType {
    Star = "Star",
    Planet = "Planet",
    Moon = "Moon",
    Asteroid = "Asteroid",
    Comet = "Comet",
    DwarfPlanet = "DwarfPlanet",
    ArtificialSatellite = "ArtificialSatellite",
    TestParticle = "TestParticle",
    NeutronStar = "NeutronStar",
    WhiteDwarf = "WhiteDwarf",
    BlackHole = "BlackHole"
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
export type CollisionShape = {
    Sphere: {
        radius: number;
    };
} | 'Point';
export declare enum SolverType {
    Direct = "Direct",
    BarnesHut = "BarnesHut",
    FMM = "FMM"
}
export declare enum IntegratorType {
    VelocityVerlet = "VelocityVerlet",
    RK45 = "RK45",
    GaussRadau15 = "GaussRadau15"
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
export interface Checkpoint {
    version: number;
    tick: number;
    time: number;
    state: SimulationState;
    rng_state: [number, number, number, number];
    checksum: number;
}
export type InputAction = {
    SpawnBody: {
        name: string;
        mass: number;
        radius: number;
        position: [number, number, number];
        velocity: [number, number, number];
    };
} | {
    DeleteBody: {
        body_id: BodyId;
    };
} | {
    ApplyThrust: {
        body_id: BodyId;
        force: [number, number, number];
        duration: number;
    };
} | {
    SetConfig: {
        key: string;
        value: string;
    };
} | {
    SetPaused: {
        paused: boolean;
    };
} | {
    SetTimeScale: {
        scale: number;
    };
};
export interface InputEvent {
    tick: number;
    player_id: number;
    action: InputAction;
}
export declare enum PresetId {
    EmptySpace = "empty",
    TwoBodyKepler = "two_body",
    SunEarthMoon = "sun_earth_moon",
    FullSolarSystem = "solar_system",
    BinaryStarCircumbinary = "binary_star",
    AlphaCentauri = "alpha_centauri",
    RoguePlanetFlyby = "rogue_planet",
    DenseAsteroidBelt = "asteroid_belt",
    ExtremeRelativistic = "extreme"
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
export declare const PRESETS: PresetInfo[];
export declare enum CameraMode {
    Orbit = "orbit",
    HorizonCentric = "horizon",
    Chase = "chase",
    FreeFly = "freefly"
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
    phi: number;
    theta: number;
}
export interface Player {
    id: number;
    name: string;
    color: [number, number, number];
    controlledBodyId: BodyId | null;
    camera: CameraState;
    isAdmin: boolean;
}
export declare const G = 6.6743e-11;
export declare const C = 299792458;
export declare const SOLAR_MASS = 1.98892e+30;
export declare const EARTH_MASS = 5.9722e+24;
export declare const EARTH_RADIUS = 6371000;
export declare const AU = 149597870700;
export declare const SOLAR_LUMINOSITY = 3.828e+26;
export declare const PI: number;
export declare const TWO_PI: number;
//# sourceMappingURL=types.d.ts.map