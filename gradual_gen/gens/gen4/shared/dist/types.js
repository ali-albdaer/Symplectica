/**
 * Shared types for the solar system simulation.
 * These mirror the Rust types for cross-boundary communication.
 */
export const vec3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const vec3Add = (a, b) => ({
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
});
export const vec3Sub = (a, b) => ({
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
});
export const vec3Scale = (v, s) => ({
    x: v.x * s,
    y: v.y * s,
    z: v.z * s,
});
export const vec3Mag = (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
export const vec3Normalize = (v) => {
    const m = vec3Mag(v);
    return m > 0 ? vec3Scale(v, 1 / m) : vec3(0, 0, 0);
};
export const vec3Dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
export const vec3Cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
export const vec3Lerp = (a, b, t) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
});
export const vec3Distance = (a, b) => vec3Mag(vec3Sub(a, b));
export var BodyType;
(function (BodyType) {
    BodyType["Star"] = "Star";
    BodyType["Planet"] = "Planet";
    BodyType["Moon"] = "Moon";
    BodyType["Asteroid"] = "Asteroid";
    BodyType["Comet"] = "Comet";
    BodyType["DwarfPlanet"] = "DwarfPlanet";
    BodyType["ArtificialSatellite"] = "ArtificialSatellite";
    BodyType["TestParticle"] = "TestParticle";
    BodyType["NeutronStar"] = "NeutronStar";
    BodyType["WhiteDwarf"] = "WhiteDwarf";
    BodyType["BlackHole"] = "BlackHole";
})(BodyType || (BodyType = {}));
// ── Simulation Config ─────────────────────────────────────────────────────────
export var SolverType;
(function (SolverType) {
    SolverType["Direct"] = "Direct";
    SolverType["BarnesHut"] = "BarnesHut";
    SolverType["FMM"] = "FMM";
})(SolverType || (SolverType = {}));
export var IntegratorType;
(function (IntegratorType) {
    IntegratorType["VelocityVerlet"] = "VelocityVerlet";
    IntegratorType["RK45"] = "RK45";
    IntegratorType["GaussRadau15"] = "GaussRadau15";
})(IntegratorType || (IntegratorType = {}));
// ── Presets ───────────────────────────────────────────────────────────────────
export var PresetId;
(function (PresetId) {
    PresetId["EmptySpace"] = "empty";
    PresetId["TwoBodyKepler"] = "two_body";
    PresetId["SunEarthMoon"] = "sun_earth_moon";
    PresetId["FullSolarSystem"] = "solar_system";
    PresetId["BinaryStarCircumbinary"] = "binary_star";
    PresetId["AlphaCentauri"] = "alpha_centauri";
    PresetId["RoguePlanetFlyby"] = "rogue_planet";
    PresetId["DenseAsteroidBelt"] = "asteroid_belt";
    PresetId["ExtremeRelativistic"] = "extreme";
})(PresetId || (PresetId = {}));
export const PRESETS = [
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
export var CameraMode;
(function (CameraMode) {
    CameraMode["Orbit"] = "orbit";
    CameraMode["HorizonCentric"] = "horizon";
    CameraMode["Chase"] = "chase";
    CameraMode["FreeFly"] = "freefly";
})(CameraMode || (CameraMode = {}));
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
//# sourceMappingURL=types.js.map