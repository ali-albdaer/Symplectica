//! World Presets
//!
//! Pre-configured solar system simulations with accurate orbital data.
//! All values in SI units (meters, kilograms, seconds).

use crate::body::{Atmosphere, Body, BodyType, PlanetComposition};
use crate::simulation::Simulation;
use crate::vector::Vec3;
use crate::constants::*;
use crate::prng::Pcg32;

/// Convert hex color to RGB array
fn hex_to_rgb(hex: u32) -> [f64; 3] {
    [
        ((hex >> 16) & 0xFF) as f64 / 255.0,
        ((hex >> 8) & 0xFF) as f64 / 255.0,
        (hex & 0xFF) as f64 / 255.0,
    ]
}

// ═══════════════════════════════════════════════════════════════════════════
// ORBITAL MECHANICS: Kepler → Cartesian Conversion (J2000)
// ═══════════════════════════════════════════════════════════════════════════

use std::f64::consts::PI;

// ═══════════════════════════════════════════════════════════════════════════
// STATISTICAL DISTRIBUTIONS FOR PROCEDURAL GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/// Sample from Rayleigh distribution with scale parameter sigma
/// Used for eccentricity and inclination distributions
fn sample_rayleigh(rng: &mut Pcg32, sigma: f64) -> f64 {
    // Inverse CDF method: X = σ * sqrt(-2 * ln(1 - U))
    let u = rng.next_f64();
    // Clamp u to avoid ln(0)
    let u_clamped = u.max(1e-10).min(1.0 - 1e-10);
    sigma * (-2.0 * (1.0 - u_clamped).ln()).sqrt()
}

/// Sample from power-law distribution P(m) ∝ m^(-α) in range [m_min, m_max]
/// Used for asteroid mass spectrum (α ≈ 2.0-2.5 for main belt)
fn sample_power_law(rng: &mut Pcg32, m_min: f64, m_max: f64, alpha: f64) -> f64 {
    let u = rng.next_f64();
    if (alpha - 1.0).abs() < 1e-10 {
        // Special case: α ≈ 1 → log-uniform
        m_min * (m_max / m_min).powf(u)
    } else {
        // General case: inverse CDF of truncated power-law
        let a = 1.0 - alpha;
        let term = u * (m_max.powf(a) - m_min.powf(a)) + m_min.powf(a);
        term.powf(1.0 / a)
    }
}

/// Sample from standard normal distribution using Box-Muller transform
fn sample_gaussian(rng: &mut Pcg32, mean: f64, std_dev: f64) -> f64 {
    let u1 = rng.next_f64().max(1e-10);
    let u2 = rng.next_f64();
    let z = (-2.0 * u1.ln()).sqrt() * (2.0 * PI * u2).cos();
    mean + std_dev * z
}

/// Sample uniformly on unit sphere surface, return (x, y, z)
fn sample_unit_sphere(rng: &mut Pcg32) -> (f64, f64, f64) {
    let theta = rng.next_f64() * 2.0 * PI;      // azimuthal angle
    let phi = (1.0 - 2.0 * rng.next_f64()).acos(); // polar angle (uniform in cos)
    let x = phi.sin() * theta.cos();
    let y = phi.sin() * theta.sin();
    let z = phi.cos();
    (x, y, z)
}

/// Sample radius from Plummer sphere density profile
/// ρ(r) ∝ (1 + (r/a)²)^(-5/2)
fn sample_plummer_radius(rng: &mut Pcg32, scale_radius: f64) -> f64 {
    // Inverse CDF: r = a / sqrt(U^(-2/3) - 1)
    let u = rng.next_f64().max(1e-10);
    scale_radius / (u.powf(-2.0 / 3.0) - 1.0).sqrt()
}

/// Orbital elements for a body at J2000 epoch
/// All angles in radians, distances in meters
#[derive(Debug, Clone, Copy)]
pub struct OrbitalElements {
    /// Semi-major axis (meters)
    pub semi_major_axis: f64,
    /// Eccentricity (dimensionless, 0 ≤ e < 1 for ellipses)
    pub eccentricity: f64,
    /// Inclination (radians)
    pub inclination: f64,
    /// Longitude of ascending node (radians)
    pub longitude_asc_node: f64,
    /// Argument of periapsis (radians)
    pub arg_periapsis: f64,
    /// Mean anomaly at epoch (radians)
    pub mean_anomaly: f64,
}

impl OrbitalElements {
    /// Convert degrees to radians
    pub fn deg_to_rad(deg: f64) -> f64 {
        deg * PI / 180.0
    }

    /// Create from parameters with angles in degrees (convenience)
    pub fn from_degrees(
        semi_major_axis_m: f64,
        eccentricity: f64,
        inclination_deg: f64,
        longitude_asc_node_deg: f64,
        arg_periapsis_deg: f64,
        mean_anomaly_deg: f64,
    ) -> Self {
        Self {
            semi_major_axis: semi_major_axis_m,
            eccentricity,
            inclination: Self::deg_to_rad(inclination_deg),
            longitude_asc_node: Self::deg_to_rad(longitude_asc_node_deg),
            arg_periapsis: Self::deg_to_rad(arg_periapsis_deg),
            mean_anomaly: Self::deg_to_rad(mean_anomaly_deg),
        }
    }

    /// Solve Kepler's equation: M = E - e*sin(E)
    /// Returns eccentric anomaly E given mean anomaly M and eccentricity e
    fn solve_kepler(&self) -> f64 {
        let m = self.mean_anomaly;
        let e = self.eccentricity;
        
        // Newton-Raphson iteration
        let mut eccentric_anomaly = m; // Initial guess
        let mut converged = false;
        for _ in 0..50 {
            let f = eccentric_anomaly - e * eccentric_anomaly.sin() - m;
            let f_prime = 1.0 - e * eccentric_anomaly.cos();
            let delta = f / f_prime;
            eccentric_anomaly -= delta;
            if delta.abs() < 1e-12 {
                converged = true;
                break;
            }
        }
        if !converged {
            let residual = (eccentric_anomaly - e * eccentric_anomaly.sin() - m).abs();
            eprintln!(
                "WARNING: Kepler solver did not converge after 50 iterations (e={:.6}, M={:.6}, residual={:.2e})",
                e, m, residual
            );
        }
        eccentric_anomaly
    }

    /// Convert orbital elements to Cartesian state vectors (position, velocity)
    /// relative to the central body with gravitational parameter mu = G * M_central
    pub fn to_cartesian(&self, mu: f64) -> (Vec3, Vec3) {
        let a = self.semi_major_axis;
        let e = self.eccentricity;
        let i = self.inclination;
        let omega = self.longitude_asc_node; // Ω
        let w = self.arg_periapsis;          // ω
        
        // Solve Kepler's equation for eccentric anomaly E
        let eccentric_anomaly = self.solve_kepler();
        
        // True anomaly ν from eccentric anomaly E
        let true_anomaly = 2.0 * ((1.0 + e).sqrt() * (eccentric_anomaly / 2.0).tan())
            .atan2((1.0 - e).sqrt());
        
        // Distance from primary
        let r = a * (1.0 - e * eccentric_anomaly.cos());
        
        // Position in orbital plane (perifocal coordinates)
        let x_orb = r * true_anomaly.cos();
        let y_orb = r * true_anomaly.sin();
        
        // Velocity magnitude components in orbital plane
        let p = a * (1.0 - e * e); // Semi-latus rectum
        let h = (mu * p).sqrt();   // Specific angular momentum
        let vx_orb = -mu / h * true_anomaly.sin();
        let vy_orb = mu / h * (e + true_anomaly.cos());
        
        // Rotation matrices to convert from orbital plane to reference frame
        // R = Rz(-Ω) * Rx(-i) * Rz(-ω)
        let cos_omega = omega.cos();
        let sin_omega = omega.sin();
        let cos_w = w.cos();
        let sin_w = w.sin();
        let cos_i = i.cos();
        let sin_i = i.sin();
        
        // Combined rotation matrix elements (transposed for column-major)
        let r11 = cos_omega * cos_w - sin_omega * sin_w * cos_i;
        let r12 = -cos_omega * sin_w - sin_omega * cos_w * cos_i;
        let r21 = sin_omega * cos_w + cos_omega * sin_w * cos_i;
        let r22 = -sin_omega * sin_w + cos_omega * cos_w * cos_i;
        let r31 = sin_w * sin_i;
        let r32 = cos_w * sin_i;
        
        // Transform position
        let x = r11 * x_orb + r12 * y_orb;
        let y = r21 * x_orb + r22 * y_orb;
        let z = r31 * x_orb + r32 * y_orb;
        
        // Transform velocity
        let vx = r11 * vx_orb + r12 * vy_orb;
        let vy = r21 * vx_orb + r22 * vy_orb;
        let vz = r31 * vx_orb + r32 * vy_orb;
        
        (Vec3::new(x, y, z), Vec3::new(vx, vy, vz))
    }

    /// Compute orbital period from semi-major axis and central mass
    pub fn orbital_period(&self, mu: f64) -> f64 {
        2.0 * PI * (self.semi_major_axis.powi(3) / mu).sqrt()
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// J2000 CANONICAL ORBITAL DATA (JPL Horizons)
// ═══════════════════════════════════════════════════════════════════════════

/// J2000 epoch orbital elements for solar system bodies
/// Source: JPL Horizons (heliocentric ecliptic J2000)
pub mod j2000 {
    use super::*;
    
    /// Mercury J2000 orbital elements (corrected)
    pub const MERCURY: OrbitalElements = OrbitalElements {
        semi_major_axis: 5.7909227e10,       // 0.38709927 AU (corrected from audit)
        eccentricity: 0.20563593,
        inclination: 0.12225804,             // 7.00487° in radians
        longitude_asc_node: 0.84354677,      // 48.33167° in radians
        arg_periapsis: 0.50831468,           // 29.12478° in radians (ω = ϖ - Ω)
        mean_anomaly: 3.05077,               // ~174.8° at J2000
    };
    
    /// Venus J2000 orbital elements
    pub const VENUS: OrbitalElements = OrbitalElements {
        semi_major_axis: 1.0820948e11,       // 0.72333566 AU
        eccentricity: 0.00677672,
        inclination: 0.05924886,             // 3.39471° in radians
        longitude_asc_node: 1.33831658,      // 76.68069° in radians
        arg_periapsis: 0.9576267,            // 54.85229° in radians
        mean_anomaly: 0.8746,                // ~50.1° at J2000
    };
    
    /// Earth J2000 orbital elements
    pub const EARTH: OrbitalElements = OrbitalElements {
        semi_major_axis: 1.49597870700e11,   // 1.00000261 AU (exact AU definition)
        eccentricity: 0.01671123,
        inclination: 0.0000087266,           // 0.00005° in radians (reference plane)
        longitude_asc_node: -0.19653305,     // -11.26064° in radians
        arg_periapsis: 1.79675713,           // 102.94719° in radians
        mean_anomaly: 6.24006,               // ~357.5° at J2000
    };
    
    /// Mars J2000 orbital elements
    pub const MARS: OrbitalElements = OrbitalElements {
        semi_major_axis: 2.2793664e11,       // 1.52371034 AU
        eccentricity: 0.09339410,
        inclination: 0.03229924,             // 1.85061° in radians
        longitude_asc_node: 0.86495187,      // 49.55954° in radians
        arg_periapsis: -1.29251336,          // -74.04754° in radians
        mean_anomaly: 0.33826,               // ~19.4° at J2000
    };
    
    /// Jupiter J2000 orbital elements
    pub const JUPITER: OrbitalElements = OrbitalElements {
        semi_major_axis: 7.7857e11,          // 5.20288700 AU
        eccentricity: 0.04838624,
        inclination: 0.02274568,             // 1.30300° in radians
        longitude_asc_node: 1.75343693,      // 100.47390° in radians
        arg_periapsis: -1.50710927,          // -86.35463° in radians
        mean_anomaly: 0.34854,               // ~20.0° at J2000
    };
    
    /// Saturn J2000 orbital elements (corrected)
    pub const SATURN: OrbitalElements = OrbitalElements {
        semi_major_axis: 1.4335290e12,       // 9.58201720 AU (corrected from audit)
        eccentricity: 0.05386179,
        inclination: 0.04338282,             // 2.48524° in radians
        longitude_asc_node: 1.98376063,      // 113.66242° in radians
        arg_periapsis: -0.36652587,          // -21.00133° in radians
        mean_anomaly: 5.5349,                // ~317.2° at J2000
    };
    
    /// Uranus J2000 orbital elements
    pub const URANUS: OrbitalElements = OrbitalElements {
        semi_major_axis: 2.87248e12,         // 19.19126393 AU
        eccentricity: 0.04725744,
        inclination: 0.01348736,             // 0.77256° in radians
        longitude_asc_node: 1.29155005,      // 74.00051° in radians
        arg_periapsis: 1.68610695,           // 96.59707° in radians
        mean_anomaly: 2.48343,               // ~142.3° at J2000
    };
    
    /// Neptune J2000 orbital elements
    pub const NEPTUNE: OrbitalElements = OrbitalElements {
        semi_major_axis: 4.49825e12,         // 30.06896348 AU
        eccentricity: 0.00859048,
        inclination: 0.03086784,             // 1.76917° in radians
        longitude_asc_node: 2.30000318,      // 131.78169° in radians
        arg_periapsis: -1.50227235,          // -86.09291° in radians
        mean_anomaly: 4.47125,               // ~256.2° at J2000
    };
    
    /// Pluto J2000 orbital elements
    pub const PLUTO: OrbitalElements = OrbitalElements {
        semi_major_axis: 5.9064e12,          // 39.48211675 AU
        eccentricity: 0.24880766,
        inclination: 0.29952937,             // 17.16° in radians
        longitude_asc_node: 1.92516825,      // 110.30393° in radians
        arg_periapsis: 1.98483753,           // 113.72814° in radians
        mean_anomaly: 0.24891,               // ~14.3° at J2000
    };
    
    /// Moon J2000 orbital elements (relative to Earth)
    pub const MOON: OrbitalElements = OrbitalElements {
        semi_major_axis: 3.84400e8,          // 384,400 km
        eccentricity: 0.0549,
        inclination: 0.08979719,             // 5.145° in radians
        longitude_asc_node: 2.18276,         // 125.08° at J2000
        arg_periapsis: 5.5527,               // 318.15° at J2000
        mean_anomaly: 2.3555,                // ~135° at J2000
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// PHYSICAL DATA: Masses, Radii, Rotation
// ═══════════════════════════════════════════════════════════════════════════

/// Physical properties for a planet
#[derive(Debug, Clone, Copy)]
pub struct PlanetPhysics {
    /// Mass in kg
    pub mass: f64,
    /// Mean radius in meters
    pub radius: f64,
    /// Sidereal rotation rate in rad/s (negative for retrograde)
    pub rotation_rate: f64,
    /// Axial tilt in radians
    pub axial_tilt: f64,
    /// Mean surface temperature in K
    pub mean_temp: f64,
    /// Bond albedo (0-1)
    pub albedo: f64,
    /// Surface color (hex)
    pub color_hex: u32,
    /// Composition class
    pub composition: PlanetComposition,
}

/// Default per-body softening: max(radius * 1e-3, 1.0 m)
fn compute_softening(radius: f64) -> f64 {
    (radius * 1e-3).max(1.0)
}

/// Recenter simulation to barycentric frame
fn recenter_to_barycenter(sim: &mut Simulation) {
    let bodies = sim.bodies();
    if bodies.is_empty() {
        return;
    }
    
    // Compute center of mass position and velocity
    let mut total_mass = 0.0;
    let mut com_pos = Vec3::ZERO;
    let mut com_vel = Vec3::ZERO;
    
    for body in bodies {
        if body.is_active {
            total_mass += body.mass;
            com_pos = com_pos + body.position * body.mass;
            com_vel = com_vel + body.velocity * body.mass;
        }
    }
    
    if total_mass > 0.0 {
        com_pos = com_pos / total_mass;
        com_vel = com_vel / total_mass;
    }
    
    // Shift all bodies to barycentric frame
    // We need to iterate with indices because we need mutable access
    let body_count = bodies.len();
    for i in 0..body_count {
        if let Some(body) = sim.get_body_mut(i as u32) {
            body.position = body.position - com_pos;
            body.velocity = body.velocity - com_vel;
        }
    }
}

/// Available preset configurations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Preset {
    /// Sun, Earth, and Moon
    SunEarthMoon,
    /// Mercury, Venus, Earth, Mars
    InnerSolarSystem,
    /// Full 8 planets + Pluto
    FullSolarSystem,
    /// Full Solar System II - Corrected J2000 orbital elements with inclinations
    /// Uses canonical JPL values with proper Kepler→Cartesian conversion
    FullSolarSystemII,
    /// Full Solar System III (2026) — JPL HORIZONS ephemeris at 2026-01-01
    /// 40 bodies: Sun, 8 planets, Pluto, 26 moons, 3 asteroids, 5 comets
    FullSolarSystemIII,
    /// Playable scaled solar system (all planets + Moon)
    PlayableSolarSystem,
    /// Jupiter and its 4 Galilean moons
    JupiterSystem,
    /// Saturn with rings (modeled as moons)
    SaturnSystem,
    /// Alpha Centauri A and B binary
    AlphaCentauri,
    /// TRAPPIST-1 exoplanet system
    Trappist1,
    /// Binary pulsar system
    BinaryPulsar,
    /// Asteroid Belt: Full solar system + 2000-10000 asteroids
    /// Power-law mass spectrum, Rayleigh orbital elements
    AsteroidBelt,
    /// Dense Star Cluster: 1000-5000 equal-mass stars
    /// Plummer sphere distribution, virialized velocities
    StarCluster,
    /// Stress Test: Configurable mix of stars, planets, and asteroids
    /// Deterministic (fixed seed), designed for benchmarking and replicability
    StressTest,
    /// Integrator Test 1: Two-body circular orbit
    IntegratorTest1,
    /// Integrator Test 2: Jupiter-Saturn near-resonant interaction
    IntegratorTest2,
    /// Integrator Test 3: Strong close encounter
    IntegratorTest3,
}

impl Preset {
    /// Create a simulation from this preset
    pub fn create(&self, seed: u64) -> Simulation {
        match self {
            Preset::SunEarthMoon => create_sun_earth_moon(seed),
            Preset::InnerSolarSystem => create_inner_solar_system(seed),
            Preset::FullSolarSystem => create_full_solar_system(seed),
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, false),
            Preset::FullSolarSystemIII => create_full_solar_system_iii(seed, false),
            Preset::PlayableSolarSystem => create_playable_solar_system(seed),
            Preset::JupiterSystem => create_jupiter_system(seed),
            Preset::SaturnSystem => create_saturn_system(seed),
            Preset::AlphaCentauri => create_alpha_centauri(seed),
            Preset::Trappist1 => create_trappist1(seed),
            Preset::BinaryPulsar => create_binary_pulsar(seed),
            Preset::AsteroidBelt => create_asteroid_belt(seed, 5000),
            Preset::StarCluster => create_star_cluster(seed, 2000),
            Preset::StressTest => create_stress_test(seed, 30, 100, 0),
            Preset::IntegratorTest1 => create_integrator_test1(seed),
            Preset::IntegratorTest2 => create_integrator_test2(seed),
            Preset::IntegratorTest3 => create_integrator_test3(seed),
        }
    }

    /// Create a simulation from this preset with barycentric initialization
    pub fn create_barycentric(&self, seed: u64) -> Simulation {
        match self {
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, true),
            Preset::FullSolarSystemIII => create_full_solar_system_iii(seed, true),
            Preset::AsteroidBelt => {
                let mut sim = create_asteroid_belt(seed, 5000);
                recenter_to_barycenter(&mut sim);
                sim
            },
            Preset::StarCluster => {
                // Star clusters are already centered
                create_star_cluster(seed, 2000)
            },
            Preset::StressTest => {
                // Stress test is already barycentric
                create_stress_test(seed, 30, 100, 0)
            },
            Preset::IntegratorTest1 => create_integrator_test1(seed),
            Preset::IntegratorTest2 => create_integrator_test2(seed),
            Preset::IntegratorTest3 => create_integrator_test3(seed),
            // Other presets don't support barycentric mode; fall back to default
            _ => self.create(seed),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATOR TEST PRESETS
// ═══════════════════════════════════════════════════════════════════════════

/// Test 1: Two-body circular orbit (Sun + Earth)
pub fn create_integrator_test1(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);

    let sun_id = sim.add_star("Test Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = OMEGA_SUN;
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.softening_length = compute_softening(R_SUN);
        sun.compute_derived();
    }

    let mut planet = Body::new(
        0,
        "Test Earth",
        BodyType::Planet,
        M_EARTH,
        R_EARTH,
        Vec3::new(AU, 0.0, 0.0),
        Vec3::new(0.0, 29_784.7, 0.0),
    );
    planet.parent_id = Some(sun_id);
    planet.semi_major_axis = AU;
    planet.eccentricity = 0.0;
    planet.color = hex_to_rgb(0x4488ff);
    planet.composition = PlanetComposition::Rocky;
    planet.albedo = 0.306;
    planet.softening_length = compute_softening(R_EARTH);
    planet.compute_derived();
    sim.add_body(planet);

    sim.finalize_derived();
    sim
}

/// Test 2: Jupiter-Saturn near-resonant interaction (Sun + Jupiter + Saturn)
pub fn create_integrator_test2(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);

    let sun_id = sim.add_star("Test Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = OMEGA_SUN;
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.softening_length = compute_softening(R_SUN);
        sun.compute_derived();
    }

    let mut jupiter = Body::new(
        0,
        "Test Jupiter",
        BodyType::Planet,
        1.898e27,
        6.9911e7,
        Vec3::new(5.2044 * AU, 0.0, 0.0),
        Vec3::new(0.0, 13_070.0, 0.0),
    );
    jupiter.parent_id = Some(sun_id);
    jupiter.semi_major_axis = 5.2044 * AU;
    jupiter.eccentricity = 0.0;
    jupiter.color = hex_to_rgb(0xd4a574);
    jupiter.composition = PlanetComposition::GasGiant;
    jupiter.albedo = 0.503;
    jupiter.softening_length = compute_softening(6.9911e7);
    jupiter.compute_derived();
    sim.add_body(jupiter);

    let mut saturn = Body::new(
        0,
        "Test Saturn",
        BodyType::Planet,
        5.683e26,
        5.8232e7,
        Vec3::new(-9.5826 * AU, 0.0, 0.0),
        Vec3::new(0.0, -9_680.0, 0.0),
    );
    saturn.parent_id = Some(sun_id);
    saturn.semi_major_axis = 9.5826 * AU;
    saturn.eccentricity = 0.0;
    saturn.color = hex_to_rgb(0xead6a7);
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.47;
    saturn.softening_length = compute_softening(5.8232e7);
    saturn.compute_derived();
    sim.add_body(saturn);

    sim.finalize_derived();
    sim
}

/// Test 3: Strong close encounter (Sun + two Jupiter-mass planets)
pub fn create_integrator_test3(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);

    let sun_id = sim.add_star("Test Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = OMEGA_SUN;
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.softening_length = compute_softening(R_SUN);
        sun.compute_derived();
    }

    let mut planet_a = Body::new(
        0,
        "Test Jupiter A",
        BodyType::Planet,
        1.898e27,
        6.9911e7,
        Vec3::new(5.2 * AU, 0.0, 0.0),
        Vec3::new(0.0, 13_070.0, 0.0),
    );
    planet_a.parent_id = Some(sun_id);
    planet_a.semi_major_axis = 5.2 * AU;
    planet_a.eccentricity = 0.0;
    planet_a.color = hex_to_rgb(0xd4a574);
    planet_a.composition = PlanetComposition::GasGiant;
    planet_a.albedo = 0.503;
    planet_a.softening_length = compute_softening(6.9911e7);
    planet_a.compute_derived();
    sim.add_body(planet_a);

    let mut planet_b = Body::new(
        0,
        "Test Jupiter B",
        BodyType::Planet,
        1.898e27,
        6.9911e7,
        Vec3::new(5.2 * AU, -0.05 * AU, 0.0),
        Vec3::new(0.0, 13_500.0, 0.0),
    );
    planet_b.parent_id = Some(sun_id);
    planet_b.semi_major_axis = 5.2 * AU;
    planet_b.eccentricity = 0.0;
    planet_b.color = hex_to_rgb(0xd4a574);
    planet_b.composition = PlanetComposition::GasGiant;
    planet_b.albedo = 0.503;
    planet_b.softening_length = compute_softening(6.9911e7);
    planet_b.compute_derived();
    sim.add_body(planet_b);

    sim.finalize_derived();
    sim
}

/// Sun-Earth-Moon system
pub fn create_sun_earth_moon(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    let sun_id = sim.add_star("Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = 2.865e-6; // ~25.05 day sidereal period
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.metallicity = 0.0; // solar
        sun.age = AGE_SUN;
        sun.compute_derived();
    }
    
    let earth_id = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.atmosphere = Some(Atmosphere::earth_like());
        earth.rotation_rate = OMEGA_EARTH;
        earth.axial_tilt = AXIAL_TILT_EARTH;
        earth.mean_surface_temperature = T_SURFACE_EARTH;
        earth.seed = seed.wrapping_add(1);
        earth.semi_major_axis = AU;
        earth.eccentricity = 0.0167;
        earth.parent_id = Some(sun_id);
        earth.color = hex_to_rgb(0x6b93d6);
        earth.composition = PlanetComposition::Rocky;
        earth.albedo = 0.306;
        earth.compute_derived();
    }
    
    sim.add_moon("Moon", M_MOON, R_MOON, earth_id, 3.844e8, 1022.0);
    // Moon is bodies[2] (0=Sun, 1=Earth, 2=Moon)
    if let Some(moon) = sim.get_body_mut(2) {
        moon.rotation_rate = 2.6617e-6; // Synchronous (27.32 day period)
        moon.axial_tilt = 0.02692; // 1.54°
        moon.mean_surface_temperature = 250.0; // Mean ~250 K
        moon.seed = seed.wrapping_add(2);
        moon.semi_major_axis = 3.844e8;
        moon.eccentricity = 0.0549;
        moon.color = hex_to_rgb(0xb0b0b0);
        moon.composition = PlanetComposition::Rocky;
        moon.albedo = 0.12;
        moon.compute_derived();
    }
    
    sim.finalize_derived();
    sim
}

/// Inner Solar System: Sun, Mercury, Venus, Earth, Mars
pub fn create_inner_solar_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Sun
    let sun_id = sim.add_star("Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = 2.865e-6;
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.metallicity = 0.0;
        sun.age = AGE_SUN;
        sun.compute_derived();
    }
    
    // Mercury — tidally locked (3:2 resonance)
    let merc_id = sim.add_planet("Mercury", 3.3011e23, 2.4397e6, 5.791e10, 47362.0);
    if let Some(merc) = sim.get_body_mut(merc_id) {
        merc.rotation_rate = 1.24e-6;
        merc.axial_tilt = 0.00059;
        merc.mean_surface_temperature = 440.0;
        merc.seed = seed.wrapping_add(1);
        merc.semi_major_axis = 5.791e10;
        merc.eccentricity = 0.2056;
        merc.inclination = 0.1223;
        merc.parent_id = Some(sun_id);
        merc.color = hex_to_rgb(0x8c7853);
        merc.composition = PlanetComposition::Rocky;
        merc.albedo = 0.088;
        merc.compute_derived();
    }
    
    // Venus — retrograde rotation
    let ven_id = sim.add_planet("Venus", 4.8675e24, 6.0518e6, 1.0821e11, 35020.0);
    if let Some(ven) = sim.get_body_mut(ven_id) {
        ven.rotation_rate = -2.99e-7;              // -243.025 day retrograde
        ven.axial_tilt = 3.0943;                   // 177.36° (nearly inverted)
        ven.mean_surface_temperature = 737.0;      // 737 K (greenhouse)
        ven.seed = seed.wrapping_add(2);
        ven.semi_major_axis = 1.0821e11;
        ven.eccentricity = 0.0068;
        ven.inclination = 0.0593;                  // 3.39°
        ven.parent_id = Some(sun_id);
        ven.color = hex_to_rgb(0xe6c229);
        ven.composition = PlanetComposition::Rocky;
        ven.albedo = 0.77;
        ven.atmosphere = Some(Atmosphere::venus_like());
        ven.compute_derived();
    }
    let earth_id = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.atmosphere = Some(Atmosphere::earth_like());
        earth.rotation_rate = OMEGA_EARTH;
        earth.axial_tilt = AXIAL_TILT_EARTH;
        earth.mean_surface_temperature = T_SURFACE_EARTH;
        earth.seed = seed.wrapping_add(3);
        earth.semi_major_axis = AU;
        earth.eccentricity = 0.0167;
        earth.parent_id = Some(sun_id);
        earth.color = hex_to_rgb(0x6b93d6);
        earth.composition = PlanetComposition::Rocky;
        earth.albedo = 0.306;
        earth.compute_derived();
    }
    
    // Moon
    sim.add_moon("Moon", M_MOON, R_MOON, earth_id, 3.844e8, 1022.0);
    if let Some(moon) = sim.get_body_mut(earth_id + 1) {
        moon.rotation_rate = 2.6617e-6;
        moon.axial_tilt = 0.02692;
        moon.mean_surface_temperature = 250.0;
        moon.seed = seed.wrapping_add(4);
        moon.semi_major_axis = 3.844e8;
        moon.eccentricity = 0.0549;
        moon.color = hex_to_rgb(0xb0b0b0);
        moon.composition = PlanetComposition::Rocky;
        moon.albedo = 0.12;
        moon.compute_derived();
    }
    let mars_id = sim.add_planet("Mars", 6.4171e23, 3.3895e6, 2.279e11, 24077.0);
    if let Some(mars) = sim.get_body_mut(mars_id) {
        mars.rotation_rate = 7.088e-5;
        mars.axial_tilt = 0.4396;
        mars.mean_surface_temperature = 210.0;
        mars.seed = seed.wrapping_add(5);
        mars.semi_major_axis = 2.279e11;
        mars.eccentricity = 0.0934;
        mars.inclination = 0.0323;
        mars.parent_id = Some(sun_id);
        mars.color = hex_to_rgb(0xc1440e);
        mars.composition = PlanetComposition::Rocky;
        mars.albedo = 0.25;
        mars.atmosphere = Some(Atmosphere::mars_like());
        mars.compute_derived();
    }
    
    sim.finalize_derived();
    sim
}

/// Full Solar System with all 8 planets
pub fn create_full_solar_system(seed: u64) -> Simulation {
    let mut sim = create_inner_solar_system(seed);
    let sun_id = 0; // Sun is always id 0 in inner solar system
    
    // Jupiter
    let jup_id = sim.add_planet("Jupiter", 1.8982e27, 6.9911e7, 7.7857e11, 13070.0);
    if let Some(jup) = sim.get_body_mut(jup_id) {
        jup.rotation_rate = 1.7585e-4;            // 9.925 hr sidereal
        jup.axial_tilt = 0.0546;                  // 3.13°
        jup.mean_surface_temperature = 165.0;     // 1-bar level ~165 K
        jup.seed = seed.wrapping_add(10);
        jup.semi_major_axis = 7.7857e11;
        jup.eccentricity = 0.0489;
        jup.inclination = 0.0228;                 // 1.31°
        jup.parent_id = Some(sun_id);
        jup.color = hex_to_rgb(0xd4a574);
        jup.composition = PlanetComposition::GasGiant;
        jup.albedo = 0.503;
        jup.compute_derived();
    }
    
    // Saturn
    let sat_id = sim.add_planet("Saturn", 5.6834e26, 5.8232e7, 1.4335e12, 9680.0);
    if let Some(sat) = sim.get_body_mut(sat_id) {
        sat.rotation_rate = 1.6378e-4;            // 10.656 hr sidereal
        sat.axial_tilt = 0.4665;                  // 26.73°
        sat.mean_surface_temperature = 134.0;     // ~134 K
        sat.seed = seed.wrapping_add(11);
        sat.semi_major_axis = 1.4335e12;
        sat.eccentricity = 0.0565;
        sat.inclination = 0.0435;                 // 2.49°
        sat.parent_id = Some(sun_id);
        sat.color = hex_to_rgb(0xead6a7);
        sat.composition = PlanetComposition::GasGiant;
        sat.albedo = 0.342;
        sat.compute_derived();
    }
    
    // Uranus — extreme axial tilt (sideways)
    let ura_id = sim.add_planet("Uranus", 8.6810e25, 2.5362e7, 2.8725e12, 6810.0);
    if let Some(ura) = sim.get_body_mut(ura_id) {
        ura.rotation_rate = -1.0124e-4;           // -17.24 hr retrograde
        ura.axial_tilt = 1.7064;                  // 97.77° (sideways)
        ura.mean_surface_temperature = 76.0;      // ~76 K
        ura.seed = seed.wrapping_add(12);
        ura.semi_major_axis = 2.8725e12;
        ura.eccentricity = 0.0457;
        ura.inclination = 0.01344;                // 0.77°
        ura.parent_id = Some(sun_id);
        ura.color = hex_to_rgb(0x72b4c4);
        ura.composition = PlanetComposition::IceGiant;
        ura.albedo = 0.300;
        ura.compute_derived();
    }
    
    // Neptune
    let nep_id = sim.add_planet("Neptune", 1.02413e26, 2.4622e7, 4.4951e12, 5430.0);
    if let Some(nep) = sim.get_body_mut(nep_id) {
        nep.rotation_rate = 1.0834e-4;            // 16.11 hr sidereal
        nep.axial_tilt = 0.4943;                  // 28.32°
        nep.mean_surface_temperature = 72.0;      // ~72 K
        nep.seed = seed.wrapping_add(13);
        nep.semi_major_axis = 4.4951e12;
        nep.eccentricity = 0.0113;
        nep.inclination = 0.0309;                 // 1.77°
        nep.parent_id = Some(sun_id);
        nep.color = hex_to_rgb(0x3d5ef5);
        nep.composition = PlanetComposition::IceGiant;
        nep.albedo = 0.290;
        nep.compute_derived();
    }
    
    // Pluto (dwarf planet)
    let plu_id = sim.add_planet("Pluto", 1.303e22, 1.1883e6, 5.9064e12, 4748.0);
    if let Some(plu) = sim.get_body_mut(plu_id) {
        plu.rotation_rate = -1.1386e-5;           // -6.387 day retrograde
        plu.axial_tilt = 2.1387;                  // 122.53°
        plu.mean_surface_temperature = 44.0;      // ~44 K
        plu.seed = seed.wrapping_add(14);
        plu.semi_major_axis = 5.9064e12;
        plu.eccentricity = 0.2488;
        plu.inclination = 0.2992;                 // 17.14°
        plu.parent_id = Some(sun_id);
        plu.color = hex_to_rgb(0xdbd3c9);
        plu.composition = PlanetComposition::Dwarf;
        plu.albedo = 0.49;
        plu.compute_derived();
    }
    
    sim.finalize_derived();
    sim
}

/// Playable Solar System with scaled distances/masses/radii (all planets + Moon)
pub fn create_playable_solar_system(seed: u64) -> Simulation {
    const SCALE: f64 = 0.01;

    let mut sim = Simulation::new(seed);

    sim.add_star("Sun", M_SUN * SCALE, R_SUN * SCALE);

    // Mercury
    sim.add_planet("Mercury", 3.3011e23 * SCALE, 2.4397e6 * SCALE, 5.791e10 * SCALE, 47362.0);

    // Venus
    sim.add_planet("Venus", 4.8675e24 * SCALE, 6.0518e6 * SCALE, 1.0821e11 * SCALE, 35020.0);

    // Earth + Moon
    let earth_id = sim.add_planet("Earth", M_EARTH * SCALE, R_EARTH * SCALE, AU * SCALE, 29784.0);
    sim.add_moon("Moon", M_MOON * SCALE, R_MOON * SCALE, earth_id, 3.844e8 * SCALE, 1022.0);

    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.atmosphere = Some(Atmosphere::earth_like());
    }

    // Mars
    sim.add_planet("Mars", 6.4171e23 * SCALE, 3.3895e6 * SCALE, 2.279e11 * SCALE, 24077.0);

    // Jupiter
    sim.add_planet("Jupiter", 1.8982e27 * SCALE, 6.9911e7 * SCALE, 7.7857e11 * SCALE, 13070.0);

    // Saturn
    sim.add_planet("Saturn", 5.6834e26 * SCALE, 5.8232e7 * SCALE, 1.4335e12 * SCALE, 9680.0);

    // Uranus
    sim.add_planet("Uranus", 8.6810e25 * SCALE, 2.5362e7 * SCALE, 2.8725e12 * SCALE, 6810.0);

    // Neptune
    sim.add_planet("Neptune", 1.02413e26 * SCALE, 2.4622e7 * SCALE, 4.4951e12 * SCALE, 5430.0);

    // Pluto (dwarf planet)
    sim.add_planet("Pluto", 1.303e22 * SCALE, 1.1883e6 * SCALE, 5.9064e12 * SCALE, 4748.0);

    sim
}

/// Jupiter system with Galilean moons
pub fn create_jupiter_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Jupiter at center
    let mut jupiter = Body::new(
        0, "Jupiter", BodyType::Planet,
        1.8982e27, 6.9911e7,
        Vec3::ZERO, Vec3::ZERO,
    );
    jupiter.color = hex_to_rgb(0xd4a574);
    jupiter.rotation_rate = 1.7585e-4;
    jupiter.axial_tilt = 0.0546;
    jupiter.mean_surface_temperature = 165.0;
    jupiter.seed = seed.wrapping_add(0);
    jupiter.composition = PlanetComposition::GasGiant;
    jupiter.albedo = 0.503;
    let jup_id = sim.add_body(jupiter);
    
    // Galilean moons (all tidally locked — rotation rate = orbital period)
    let io_id = sim.add_planet("Io", 8.9319e22, 1.8216e6, 4.217e8, 17334.0);
    if let Some(io) = sim.get_body_mut(io_id) {
        io.rotation_rate = 4.1106e-5;             // 1.769 day synchronous
        io.mean_surface_temperature = 130.0;      // ~130 K (volcanic hotspots much higher)
        io.seed = seed.wrapping_add(1);
        io.semi_major_axis = 4.217e8;
        io.eccentricity = 0.0041;
        io.parent_id = Some(jup_id);
        io.color = hex_to_rgb(0xc8b84a);
        io.composition = PlanetComposition::Rocky;
        io.albedo = 0.63;
        io.compute_derived();
    }
    
    let eur_id = sim.add_planet("Europa", 4.7998e22, 1.5608e6, 6.709e8, 13740.0);
    if let Some(eur) = sim.get_body_mut(eur_id) {
        eur.rotation_rate = 2.0478e-5;            // 3.551 day synchronous
        eur.mean_surface_temperature = 102.0;     // ~102 K
        eur.seed = seed.wrapping_add(2);
        eur.semi_major_axis = 6.709e8;
        eur.eccentricity = 0.0094;
        eur.parent_id = Some(jup_id);
        eur.color = hex_to_rgb(0xb8a090);
        eur.composition = PlanetComposition::Rocky;
        eur.albedo = 0.67;
        eur.compute_derived();
    }
    
    let gan_id = sim.add_planet("Ganymede", 1.4819e23, 2.6341e6, 1.0704e9, 10880.0);
    if let Some(gan) = sim.get_body_mut(gan_id) {
        gan.rotation_rate = 1.0164e-5;            // 7.155 day synchronous
        gan.mean_surface_temperature = 110.0;     // ~110 K
        gan.seed = seed.wrapping_add(3);
        gan.semi_major_axis = 1.0704e9;
        gan.eccentricity = 0.0013;
        gan.parent_id = Some(jup_id);
        gan.color = hex_to_rgb(0x9a8a7a);
        gan.composition = PlanetComposition::Rocky;
        gan.albedo = 0.43;
        gan.compute_derived();
    }
    
    let cal_id = sim.add_planet("Callisto", 1.0759e23, 2.4103e6, 1.8827e9, 8204.0);
    if let Some(cal) = sim.get_body_mut(cal_id) {
        cal.rotation_rate = 4.3574e-6;            // 16.689 day synchronous
        cal.mean_surface_temperature = 134.0;     // ~134 K
        cal.seed = seed.wrapping_add(4);
        cal.semi_major_axis = 1.8827e9;
        cal.eccentricity = 0.0074;
        cal.parent_id = Some(jup_id);
        cal.color = hex_to_rgb(0x6a5a4a);
        cal.composition = PlanetComposition::Rocky;
        cal.albedo = 0.17;
        cal.compute_derived();
    }
    
    sim
}

/// Saturn system
pub fn create_saturn_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Saturn at center
    let mut saturn = Body::new(
        0, "Saturn", BodyType::Planet,
        5.6834e26, 5.8232e7,
        Vec3::ZERO, Vec3::ZERO,
    );
    saturn.color = hex_to_rgb(0xead6a7);
    saturn.rotation_rate = 1.6378e-4;
    saturn.axial_tilt = 0.4665;
    saturn.mean_surface_temperature = 134.0;
    saturn.seed = seed.wrapping_add(0);
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.342;
    let sat_id = sim.add_body(saturn);
    
    // Titan — the only moon with a substantial atmosphere
    let titan_id = sim.add_planet("Titan", 1.3452e23, 2.5747e6, 1.2218e9, 5570.0);
    if let Some(titan) = sim.get_body_mut(titan_id) {
        titan.rotation_rate = 4.5608e-6;          // 15.945 day synchronous
        titan.mean_surface_temperature = 94.0;    // 94 K
        titan.seed = seed.wrapping_add(1);
        titan.semi_major_axis = 1.2218e9;
        titan.eccentricity = 0.0288;
        titan.parent_id = Some(sat_id);
        titan.color = hex_to_rgb(0xc8a050);
        titan.composition = PlanetComposition::Rocky;
        titan.albedo = 0.22;
        titan.atmosphere = Some(Atmosphere {
            scale_height: 40_000.0,                   // ~40 km (thick N₂ atmosphere)
            rayleigh_coefficients: [3.5e-6, 8.5e-6, 2.1e-5], // N₂ Rayleigh (blue-shifted)
            mie_coefficient: 2.1e-5,                  // Dense tholin haze
            mie_direction: 0.75,
            height: 600_000.0,                        // ~600 km effective atmosphere
            mie_color: [0.85, 0.55, 0.2],             // Tholin haze — deep orange-brown
        });
        titan.compute_derived();
    }
    
    // Other major moons (sorted by orbital distance)
    let moons: &[(&str, f64, f64, f64, f64, u64, u32)] = &[
        // (name, mass, radius, orbital_dist, orbital_vel, seed_offset, color_hex)
        ("Mimas",     3.7493e19, 1.983e5, 1.8554e8, 14320.0, 2, 0xc0c0c0),
        ("Enceladus", 1.0802e20, 2.521e5, 2.3802e8, 12635.0, 3, 0xf0f0f0),
        ("Tethys",    6.1745e20, 5.311e5, 2.9466e8, 11350.0, 4, 0xd0d0d0),
        ("Dione",     1.0955e21, 5.613e5, 3.7742e8, 10028.0, 5, 0xc8c8c8),
        ("Rhea",      2.3065e21, 7.638e5, 5.2704e8,  8480.0, 6, 0xb0b0b0),
        ("Iapetus",   1.8056e21, 7.346e5, 3.5613e9,  3260.0, 7, 0x908070),
    ];
    for &(name, mass, radius, dist, vel, seed_off, col) in moons {
        let mid = sim.add_planet(name, mass, radius, dist, vel);
        if let Some(m) = sim.get_body_mut(mid) {
            m.seed = seed.wrapping_add(seed_off);
            m.semi_major_axis = dist;
            m.parent_id = Some(sat_id);
            m.color = hex_to_rgb(col);
            m.composition = PlanetComposition::Rocky;
            m.albedo = 0.5; // generic icy moon albedo
            m.compute_derived();
        }
    }
    
    sim
}

/// Alpha Centauri binary star system
pub fn create_alpha_centauri(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Alpha Centauri A (G2V, slightly larger than Sun)
    let m_a = 1.1 * M_SUN;
    let m_b = 0.907 * M_SUN;
    let semi_major = 23.4 * AU;
    
    let total_mass = m_a + m_b;
    let v_orbital = (G * total_mass / semi_major).sqrt();
    
    let r_a = semi_major * m_b / total_mass;
    let r_b = semi_major * m_a / total_mass;
    
    let mut star_a = Body::new(
        0, "Alpha Centauri A", BodyType::Star,
        m_a, 1.2234 * R_SUN,
        Vec3::new(-r_a, 0.0, 0.0),
        Vec3::new(0.0, -v_orbital * m_b / total_mass, 0.0),
    );
    star_a.color = hex_to_rgb(0xfff4e6);
    star_a.luminosity = 1.519 * L_SUN;
    star_a.effective_temperature = 5790.0;
    star_a.seed = seed.wrapping_add(0);
    star_a.metallicity = 0.20; // slightly metal-rich
    star_a.age = 5.3e9 * 365.25 * 86400.0; // ~5.3 Gyr
    sim.add_body(star_a);
    
    // Alpha Centauri B (K1V, cooler orange)
    let mut star_b = Body::new(
        0, "Alpha Centauri B", BodyType::Star,
        m_b, 0.8632 * R_SUN,
        Vec3::new(r_b, 0.0, 0.0),
        Vec3::new(0.0, v_orbital * m_a / total_mass, 0.0),
    );
    star_b.color = hex_to_rgb(0xffd27f);
    star_b.luminosity = 0.5002 * L_SUN;
    star_b.effective_temperature = 5260.0;
    star_b.seed = seed.wrapping_add(1);
    star_b.metallicity = 0.23;
    star_b.age = 5.3e9 * 365.25 * 86400.0;
    sim.add_body(star_b);
    
    sim
}

/// TRAPPIST-1 system with 7 Earth-like exoplanets
pub fn create_trappist1(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // TRAPPIST-1 is an ultra-cool M8V red dwarf
    let m_star = 0.0898 * M_SUN;
    let r_star = 0.121 * R_SUN;
    
    let mut star = Body::new(
        0, "TRAPPIST-1", BodyType::Star,
        m_star, r_star,
        Vec3::ZERO, Vec3::ZERO,
    );
    star.color = hex_to_rgb(0xff4444);
    star.luminosity = 0.000522 * L_SUN;
    star.effective_temperature = 2566.0;
    star.seed = seed.wrapping_add(0);
    star.metallicity = 0.04; // near-solar
    star.age = 7.6e9 * 365.25 * 86400.0; // ~7.6 Gyr
    let star_id = sim.add_body(star);
    
    // Orbital data: (name, period_days, a_AU, mass, radius, eq_temp_K, seed_offset, color)
    let planets: &[(&str, f64, f64, f64, f64, f64, u64, u32)] = &[
        ("TRAPPIST-1b", 1.51,  0.01154, 1.017 * M_EARTH, 1.121 * R_EARTH, 400.0, 1, 0xc86440),
        ("TRAPPIST-1c", 2.42,  0.01580, 1.156 * M_EARTH, 1.095 * R_EARTH, 342.0, 2, 0xb8704a),
        ("TRAPPIST-1d", 4.05,  0.02227, 0.297 * M_EARTH, 0.784 * R_EARTH, 288.0, 3, 0x7090c0),
        ("TRAPPIST-1e", 6.10,  0.02925, 0.772 * M_EARTH, 0.910 * R_EARTH, 251.0, 4, 0x5080b0),
        ("TRAPPIST-1f", 9.21,  0.03849, 0.934 * M_EARTH, 1.046 * R_EARTH, 219.0, 5, 0x4070a0),
        ("TRAPPIST-1g", 12.35, 0.04683, 1.148 * M_EARTH, 1.148 * R_EARTH, 199.0, 6, 0x306090),
        ("TRAPPIST-1h", 18.77, 0.06189, 0.331 * M_EARTH, 0.773 * R_EARTH, 173.0, 7, 0x607090),
    ];
    
    for &(name, _period, a_au, mass, radius, eq_temp, seed_off, col) in planets {
        let distance = a_au * AU;
        let velocity = (G * m_star / distance).sqrt();
        let pid = sim.add_planet(name, mass, radius, distance, velocity);
        if let Some(p) = sim.get_body_mut(pid) {
            p.mean_surface_temperature = eq_temp;
            p.seed = seed.wrapping_add(seed_off);
            p.semi_major_axis = distance;
            p.parent_id = Some(star_id);
            p.color = hex_to_rgb(col);
            p.composition = PlanetComposition::Rocky;
            p.albedo = 0.3; // Earth-like estimate
            p.compute_derived();
        }
    }
    
    sim.finalize_derived();
    sim
}

/// Binary pulsar system (PSR J0737-3039)
pub fn create_binary_pulsar(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Two neutron stars in tight orbit
    let m_a = 1.338 * M_SUN;
    let m_b = 1.249 * M_SUN;
    let semi_major = 8.8e8; // ~0.9 million km separation
    
    let total_mass = m_a + m_b;
    let v_orbital = (G * total_mass / semi_major).sqrt();
    
    let r_a = semi_major * m_b / total_mass;
    let r_b = semi_major * m_a / total_mass;
    
    // Neutron stars are tiny (~10 km radius)
    let r_neutron = 1.0e4;
    
    let mut pulsar_a = Body::new(
        0, "PSR J0737-3039A", BodyType::Star,
        m_a, r_neutron,
        Vec3::new(-r_a, 0.0, 0.0),
        Vec3::new(0.0, -v_orbital * m_b / total_mass, 0.0),
    );
    pulsar_a.color = hex_to_rgb(0xaaaaff);
    pulsar_a.rotation_rate = 276.8;               // 44.07 Hz spin (millisecond pulsar)
    pulsar_a.seed = seed.wrapping_add(0);
    pulsar_a.age = 2.1e8 * 365.25 * 86400.0; // ~210 Myr estimate
    sim.add_body(pulsar_a);
    
    let mut pulsar_b = Body::new(
        0, "PSR J0737-3039B", BodyType::Star,
        m_b, r_neutron,
        Vec3::new(r_b, 0.0, 0.0),
        Vec3::new(0.0, v_orbital * m_a / total_mass, 0.0),
    );
    pulsar_b.color = hex_to_rgb(0xffaaff);
    pulsar_b.rotation_rate = 1.76;                // 0.36 Hz spin
    pulsar_b.seed = seed.wrapping_add(1);
    pulsar_b.age = 2.1e8 * 365.25 * 86400.0;
    sim.add_body(pulsar_b);
    
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SOLAR SYSTEM II: Corrected J2000 Preset
// ═══════════════════════════════════════════════════════════════════════════

/// Full Solar System II with corrected J2000 orbital elements
/// 
/// Improvements over FullSolarSystem:
/// - Uses canonical JPL J2000 orbital elements
/// - Proper Kepler→Cartesian state vector conversion
/// - Includes orbital inclinations for all planets
/// - Moon initialized relative to Earth with proper orbital elements
/// - Per-body softening set explicitly
/// - Optional barycentric initialization
/// 
/// # Arguments
/// * `seed` - Deterministic seed for PRNG
/// * `barycentric` - If true, shift all bodies to center-of-mass frame
pub fn create_full_solar_system_ii(seed: u64, barycentric: bool) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    let mu_sun = G * M_SUN; // Gravitational parameter of Sun
    let mu_earth = G * M_EARTH; // For Moon
    
    // ─── Sun ────────────────────────────────────────────────────────────
    let sun_id = sim.add_star("Sun", M_SUN, R_SUN);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = T_SUN;
        sun.rotation_rate = OMEGA_SUN;
        sun.mean_surface_temperature = T_SUN;
        sun.seed = seed.wrapping_add(0);
        sun.metallicity = METALLICITY_SUN;
        sun.age = AGE_SUN;
        sun.softening_length = compute_softening(R_SUN);
        sun.compute_derived();
    }
    
    // ─── Mercury (CORRECTED) ────────────────────────────────────────────
    let (merc_pos, merc_vel) = j2000::MERCURY.to_cartesian(mu_sun);
    let mut mercury = Body::new(
        0, "Mercury", BodyType::Planet,
        3.3011e23, 2.4397e6,
        merc_pos, merc_vel,
    );
    mercury.rotation_rate = 1.24e-6;           // 58.65 day sidereal (3:2 resonance)
    mercury.axial_tilt = 0.00059;              // 0.034°
    mercury.mean_surface_temperature = 440.0;
    mercury.seed = seed.wrapping_add(1);
    mercury.semi_major_axis = j2000::MERCURY.semi_major_axis;
    mercury.eccentricity = j2000::MERCURY.eccentricity;
    mercury.inclination = j2000::MERCURY.inclination;
    mercury.longitude_asc_node = j2000::MERCURY.longitude_asc_node;
    mercury.arg_periapsis = j2000::MERCURY.arg_periapsis;
    mercury.mean_anomaly = j2000::MERCURY.mean_anomaly;
    mercury.parent_id = Some(sun_id);
    mercury.color = hex_to_rgb(0x8c7853);
    mercury.composition = PlanetComposition::Rocky;
    mercury.albedo = 0.088;
    mercury.softening_length = compute_softening(2.4397e6);
    mercury.compute_derived();
    sim.add_body(mercury);
    
    // ─── Venus ──────────────────────────────────────────────────────────
    let (ven_pos, ven_vel) = j2000::VENUS.to_cartesian(mu_sun);
    let mut venus = Body::new(
        0, "Venus", BodyType::Planet,
        4.8675e24, 6.0518e6,
        ven_pos, ven_vel,
    );
    venus.rotation_rate = -2.99e-7;            // -243.025 day retrograde
    venus.axial_tilt = 3.0943;                 // 177.36° (nearly inverted)
    venus.mean_surface_temperature = 737.0;    // 737 K (greenhouse)
    venus.seed = seed.wrapping_add(2);
    venus.semi_major_axis = j2000::VENUS.semi_major_axis;
    venus.eccentricity = j2000::VENUS.eccentricity;
    venus.inclination = j2000::VENUS.inclination;
    venus.longitude_asc_node = j2000::VENUS.longitude_asc_node;
    venus.arg_periapsis = j2000::VENUS.arg_periapsis;
    venus.mean_anomaly = j2000::VENUS.mean_anomaly;
    venus.parent_id = Some(sun_id);
    venus.color = hex_to_rgb(0xe6c229);
    venus.composition = PlanetComposition::Rocky;
    venus.albedo = 0.77;
    venus.atmosphere = Some(Atmosphere::venus_like());
    venus.softening_length = compute_softening(6.0518e6);
    venus.compute_derived();
    sim.add_body(venus);
    
    // ─── Earth ──────────────────────────────────────────────────────────
    let (earth_pos, earth_vel) = j2000::EARTH.to_cartesian(mu_sun);
    let mut earth = Body::new(
        0, "Earth", BodyType::Planet,
        M_EARTH, R_EARTH,
        earth_pos, earth_vel,
    );
    earth.atmosphere = Some(Atmosphere::earth_like());
    earth.rotation_rate = OMEGA_EARTH;
    earth.axial_tilt = AXIAL_TILT_EARTH;
    earth.mean_surface_temperature = T_SURFACE_EARTH;
    earth.seed = seed.wrapping_add(3);
    earth.semi_major_axis = j2000::EARTH.semi_major_axis;
    earth.eccentricity = j2000::EARTH.eccentricity;
    earth.inclination = j2000::EARTH.inclination;
    earth.longitude_asc_node = j2000::EARTH.longitude_asc_node;
    earth.arg_periapsis = j2000::EARTH.arg_periapsis;
    earth.mean_anomaly = j2000::EARTH.mean_anomaly;
    earth.parent_id = Some(sun_id);
    earth.color = hex_to_rgb(0x6b93d6);
    earth.composition = PlanetComposition::Rocky;
    earth.albedo = 0.306;
    earth.softening_length = compute_softening(R_EARTH);
    earth.compute_derived();
    let earth_id = sim.add_body(earth);
    
    // ─── Moon (Earth-relative) ──────────────────────────────────────────
    // Moon orbit is computed relative to Earth, then transformed to heliocentric
    let (moon_rel_pos, moon_rel_vel) = j2000::MOON.to_cartesian(mu_earth);
    let moon_pos = earth_pos + moon_rel_pos;
    let moon_vel = earth_vel + moon_rel_vel;
    
    let mut moon = Body::new(
        0, "Moon", BodyType::Moon,
        M_MOON, R_MOON,
        moon_pos, moon_vel,
    );
    moon.rotation_rate = 2.6617e-6;            // 27.32 day synchronous
    moon.axial_tilt = 0.02692;                 // 1.54°
    moon.mean_surface_temperature = 250.0;     // Mean ~250 K
    moon.seed = seed.wrapping_add(4);
    moon.semi_major_axis = j2000::MOON.semi_major_axis;
    moon.eccentricity = j2000::MOON.eccentricity;
    moon.inclination = j2000::MOON.inclination;
    moon.longitude_asc_node = j2000::MOON.longitude_asc_node;
    moon.arg_periapsis = j2000::MOON.arg_periapsis;
    moon.mean_anomaly = j2000::MOON.mean_anomaly;
    moon.parent_id = Some(earth_id);
    moon.color = hex_to_rgb(0xb0b0b0);
    moon.composition = PlanetComposition::Rocky;
    moon.albedo = 0.12;
    moon.softening_length = compute_softening(R_MOON);
    moon.compute_derived();
    sim.add_body(moon);
    
    // ─── Mars ───────────────────────────────────────────────────────────
    let (mars_pos, mars_vel) = j2000::MARS.to_cartesian(mu_sun);
    let mut mars = Body::new(
        0, "Mars", BodyType::Planet,
        6.4171e23, 3.3895e6,
        mars_pos, mars_vel,
    );
    mars.rotation_rate = 7.088e-5;
    mars.axial_tilt = 0.4396;                  // 25.19°
    mars.mean_surface_temperature = 210.0;
    mars.seed = seed.wrapping_add(5);
    mars.semi_major_axis = j2000::MARS.semi_major_axis;
    mars.eccentricity = j2000::MARS.eccentricity;
    mars.inclination = j2000::MARS.inclination;
    mars.longitude_asc_node = j2000::MARS.longitude_asc_node;
    mars.arg_periapsis = j2000::MARS.arg_periapsis;
    mars.mean_anomaly = j2000::MARS.mean_anomaly;
    mars.parent_id = Some(sun_id);
    mars.color = hex_to_rgb(0xc1440e);
    mars.composition = PlanetComposition::Rocky;
    mars.albedo = 0.25;
    mars.atmosphere = Some(Atmosphere::mars_like());
    mars.softening_length = compute_softening(3.3895e6);
    mars.compute_derived();
    sim.add_body(mars);
    
    // ─── Jupiter ────────────────────────────────────────────────────────
    let (jup_pos, jup_vel) = j2000::JUPITER.to_cartesian(mu_sun);
    let mut jupiter = Body::new(
        0, "Jupiter", BodyType::Planet,
        1.8982e27, 6.9911e7,
        jup_pos, jup_vel,
    );
    jupiter.rotation_rate = 1.7585e-4;         // 9.925 hr sidereal
    jupiter.axial_tilt = 0.0546;               // 3.13°
    jupiter.mean_surface_temperature = 165.0;  // 1-bar level ~165 K
    jupiter.seed = seed.wrapping_add(10);
    jupiter.semi_major_axis = j2000::JUPITER.semi_major_axis;
    jupiter.eccentricity = j2000::JUPITER.eccentricity;
    jupiter.inclination = j2000::JUPITER.inclination;
    jupiter.longitude_asc_node = j2000::JUPITER.longitude_asc_node;
    jupiter.arg_periapsis = j2000::JUPITER.arg_periapsis;
    jupiter.mean_anomaly = j2000::JUPITER.mean_anomaly;
    jupiter.parent_id = Some(sun_id);
    jupiter.color = hex_to_rgb(0xd4a574);
    jupiter.composition = PlanetComposition::GasGiant;
    jupiter.albedo = 0.503;
    jupiter.softening_length = compute_softening(6.9911e7);
    jupiter.compute_derived();
    sim.add_body(jupiter);
    
    // ─── Saturn (CORRECTED) ─────────────────────────────────────────────
    let (sat_pos, sat_vel) = j2000::SATURN.to_cartesian(mu_sun);
    let mut saturn = Body::new(
        0, "Saturn", BodyType::Planet,
        5.6834e26, 5.8232e7,
        sat_pos, sat_vel,
    );
    saturn.rotation_rate = 1.6378e-4;          // 10.656 hr sidereal
    saturn.axial_tilt = 0.4665;                // 26.73°
    saturn.mean_surface_temperature = 134.0;   // ~134 K
    saturn.seed = seed.wrapping_add(11);
    saturn.semi_major_axis = j2000::SATURN.semi_major_axis;
    saturn.eccentricity = j2000::SATURN.eccentricity;
    saturn.inclination = j2000::SATURN.inclination;
    saturn.longitude_asc_node = j2000::SATURN.longitude_asc_node;
    saturn.arg_periapsis = j2000::SATURN.arg_periapsis;
    saturn.mean_anomaly = j2000::SATURN.mean_anomaly;
    saturn.parent_id = Some(sun_id);
    saturn.color = hex_to_rgb(0xead6a7);
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.342;
    saturn.softening_length = compute_softening(5.8232e7);
    saturn.compute_derived();
    sim.add_body(saturn);
    
    // ─── Uranus ─────────────────────────────────────────────────────────
    let (ura_pos, ura_vel) = j2000::URANUS.to_cartesian(mu_sun);
    let mut uranus = Body::new(
        0, "Uranus", BodyType::Planet,
        8.6810e25, 2.5362e7,
        ura_pos, ura_vel,
    );
    uranus.rotation_rate = -1.0124e-4;         // -17.24 hr retrograde
    uranus.axial_tilt = 1.7064;                // 97.77° (sideways)
    uranus.mean_surface_temperature = 76.0;    // ~76 K
    uranus.seed = seed.wrapping_add(12);
    uranus.semi_major_axis = j2000::URANUS.semi_major_axis;
    uranus.eccentricity = j2000::URANUS.eccentricity;
    uranus.inclination = j2000::URANUS.inclination;
    uranus.longitude_asc_node = j2000::URANUS.longitude_asc_node;
    uranus.arg_periapsis = j2000::URANUS.arg_periapsis;
    uranus.mean_anomaly = j2000::URANUS.mean_anomaly;
    uranus.parent_id = Some(sun_id);
    uranus.color = hex_to_rgb(0x72b4c4);
    uranus.composition = PlanetComposition::IceGiant;
    uranus.albedo = 0.300;
    uranus.softening_length = compute_softening(2.5362e7);
    uranus.compute_derived();
    sim.add_body(uranus);
    
    // ─── Neptune ────────────────────────────────────────────────────────
    let (nep_pos, nep_vel) = j2000::NEPTUNE.to_cartesian(mu_sun);
    let mut neptune = Body::new(
        0, "Neptune", BodyType::Planet,
        1.02413e26, 2.4622e7,
        nep_pos, nep_vel,
    );
    neptune.rotation_rate = 1.0834e-4;         // 16.11 hr sidereal
    neptune.axial_tilt = 0.4943;               // 28.32°
    neptune.mean_surface_temperature = 72.0;   // ~72 K
    neptune.seed = seed.wrapping_add(13);
    neptune.semi_major_axis = j2000::NEPTUNE.semi_major_axis;
    neptune.eccentricity = j2000::NEPTUNE.eccentricity;
    neptune.inclination = j2000::NEPTUNE.inclination;
    neptune.longitude_asc_node = j2000::NEPTUNE.longitude_asc_node;
    neptune.arg_periapsis = j2000::NEPTUNE.arg_periapsis;
    neptune.mean_anomaly = j2000::NEPTUNE.mean_anomaly;
    neptune.parent_id = Some(sun_id);
    neptune.color = hex_to_rgb(0x3d5ef5);
    neptune.composition = PlanetComposition::IceGiant;
    neptune.albedo = 0.290;
    neptune.softening_length = compute_softening(2.4622e7);
    neptune.compute_derived();
    sim.add_body(neptune);
    
    // ─── Pluto (Dwarf Planet) ───────────────────────────────────────────
    let (plu_pos, plu_vel) = j2000::PLUTO.to_cartesian(mu_sun);
    let mut pluto = Body::new(
        0, "Pluto", BodyType::Planet,
        1.303e22, 1.1883e6,
        plu_pos, plu_vel,
    );
    pluto.rotation_rate = -1.1386e-5;          // -6.387 day retrograde
    pluto.axial_tilt = 2.1387;                 // 122.53°
    pluto.mean_surface_temperature = 44.0;     // ~44 K
    pluto.seed = seed.wrapping_add(14);
    pluto.semi_major_axis = j2000::PLUTO.semi_major_axis;
    pluto.eccentricity = j2000::PLUTO.eccentricity;
    pluto.inclination = j2000::PLUTO.inclination;
    pluto.longitude_asc_node = j2000::PLUTO.longitude_asc_node;
    pluto.arg_periapsis = j2000::PLUTO.arg_periapsis;
    pluto.mean_anomaly = j2000::PLUTO.mean_anomaly;
    pluto.parent_id = Some(sun_id);
    pluto.color = hex_to_rgb(0xdbd3c9);
    pluto.composition = PlanetComposition::Dwarf;
    pluto.albedo = 0.49;
    pluto.softening_length = compute_softening(1.1883e6);
    pluto.compute_derived();
    sim.add_body(pluto);
    
    // Optionally shift to barycentric frame
    if barycentric {
        recenter_to_barycenter(&mut sim);
    }
    
    sim.finalize_derived();
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SOLAR SYSTEM III (2026) — JPL HORIZONS EPHEMERIS
// ═══════════════════════════════════════════════════════════════════════════

/// Full Solar System III — 40 bodies with JPL HORIZONS ephemeris at 2026-01-01T00:00:00
/// Heliocentric ecliptic J2000 state vectors, converted to SI (meters, m/s).
/// Includes: Sun, 8 planets, Pluto, 26 moons, 3 asteroids (Ceres/Pallas/Vesta), 5 comets.
pub fn create_full_solar_system_iii(seed: u64, barycentric: bool) -> Simulation {
    let mut sim = Simulation::new(seed);
    let deg = PI / 180.0;

    // ─── Sun ────────────────────────────────────────────────────────────
    // Horizons #10 — at origin of heliocentric frame
    let sun_id = sim.add_star("Sun", 1.98841e30, 6.957e8);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = 5772.0;
        sun.rotation_rate = 2.8653290845717256e-6;
        sun.mean_surface_temperature = 5772.0;
        sun.seed = seed.wrapping_add(0);
        sun.metallicity = METALLICITY_SUN;
        sun.age = AGE_SUN;
        sun.softening_length = compute_softening(6.957e8);
        sun.compute_derived();
    }

    // ─── Mercury ────────────────────────────────────────────────────────
    // Horizons #199 — epoch 2026-01-01
    let mut mercury = Body::new(
        0, "Mercury", BodyType::Planet,
        3.302e23, 2.4394e6,
        Vec3::new(-32193656.90676167e3, -61216587.9829846e3, -2049979.952579837e3),
        Vec3::new(33.29912211950884e3, -20.32319326617692e3, -4.715026944319221e3),
    );
    mercury.rotation_rate = 1.24001e-6;
    mercury.axial_tilt = 0.00059;
    mercury.mean_surface_temperature = 440.0;
    mercury.seed = seed.wrapping_add(1);
    mercury.semi_major_axis = 57909051.27942418e3;
    mercury.eccentricity = 0.2056426160956197;
    mercury.inclination = 7.003422810415504 * deg;
    mercury.longitude_asc_node = 48.29881667444637 * deg;
    mercury.arg_periapsis = 29.19881272328852 * deg;
    mercury.mean_anomaly = 157.6511583424542 * deg;
    mercury.parent_id = Some(sun_id);
    mercury.color = hex_to_rgb(0x8c7853);
    mercury.composition = PlanetComposition::Rocky;
    mercury.albedo = 0.088;
    mercury.softening_length = compute_softening(2.4394e6);
    mercury.compute_derived();
    sim.add_body(mercury);

    // ─── Venus ──────────────────────────────────────────────────────────
    // Horizons #299
    let mut venus = Body::new(
        0, "Venus", BodyType::Planet,
        4.8685e24, 6.05184e6,
        Vec3::new(13295847.29627933e3, -107974115.5459946e3, -2250558.830319598e3),
        Vec3::new(34.52275635351619e3, 4.156129935817114e3, -1.934854181927197e3),
    );
    venus.rotation_rate = -2.9924e-7;
    venus.axial_tilt = 3.0943;
    venus.mean_surface_temperature = 735.0;
    venus.seed = seed.wrapping_add(2);
    venus.semi_major_axis = 108209293.6140176e3;
    venus.eccentricity = 0.006780942266658413;
    venus.inclination = 3.394392156342094 * deg;
    venus.longitude_asc_node = 76.60714242821713 * deg;
    venus.arg_periapsis = 54.87317496286026 * deg;
    venus.mean_anomaly = 145.1314515634737 * deg;
    venus.parent_id = Some(sun_id);
    venus.color = hex_to_rgb(0xe6c229);
    venus.composition = PlanetComposition::Rocky;
    venus.albedo = 0.77;
    venus.atmosphere = Some(Atmosphere::venus_like());
    venus.softening_length = compute_softening(6.05184e6);
    venus.compute_derived();
    sim.add_body(venus);

    // ─── Earth ──────────────────────────────────────────────────────────
    // Horizons #399
    let mut earth = Body::new(
        0, "Earth", BodyType::Planet,
        5.97219e24, 6.37101e6,
        Vec3::new(-26072138.44816194e3, 144774673.8210197e3, -8892.861905746162e3),
        Vec3::new(-29.78893116564825e3, -5.396270536820538e3, 0.0004106639513727917e3),
    );
    earth.atmosphere = Some(Atmosphere::earth_like());
    earth.rotation_rate = 7.292115e-5;
    earth.axial_tilt = AXIAL_TILT_EARTH;
    earth.mean_surface_temperature = T_SURFACE_EARTH;
    earth.seed = seed.wrapping_add(3);
    earth.semi_major_axis = 149477430.1325314e3;
    earth.eccentricity = 0.01591429536350342;
    earth.inclination = 0.003549055731418342 * deg;
    earth.longitude_asc_node = 177.6179030721728 * deg;
    earth.arg_periapsis = 286.3568704502947 * deg;
    earth.mean_anomaly = 356.3524337712979 * deg;
    earth.parent_id = Some(sun_id);
    earth.color = hex_to_rgb(0x6b93d6);
    earth.composition = PlanetComposition::Rocky;
    earth.albedo = 0.306;
    earth.softening_length = compute_softening(6.37101e6);
    earth.compute_derived();
    let earth_id = sim.add_body(earth);

    // ─── Moon ───────────────────────────────────────────────────────────
    // Horizons #301 — heliocentric state vector (already absolute)
    let mut moon = Body::new(
        0, "Moon", BodyType::Moon,
        7.349e22, 1.73753e6,
        Vec3::new(-25927812.72067001e3, 145104069.6519153e3, 22860.11443745345e3),
        Vec3::new(-30.79324530332047e3, -4.975405328064174e3, 0.00599587524917955e3),
    );
    moon.rotation_rate = 2.6617e-6;
    moon.axial_tilt = 0.02692;
    moon.mean_surface_temperature = 250.0;
    moon.seed = seed.wrapping_add(4);
    moon.semi_major_axis = 160337924.3759978e3;
    moon.eccentricity = 0.08236183062471594;
    moon.inclination = 0.01403758402742693 * deg;
    moon.longitude_asc_node = 60.85906168069921 * deg;
    moon.arg_periapsis = 26.67216696617628 * deg;
    moon.mean_anomaly = 10.65892596627429 * deg;
    moon.parent_id = Some(earth_id);
    moon.color = hex_to_rgb(0xb0b0b0);
    moon.composition = PlanetComposition::Rocky;
    moon.albedo = 0.12;
    moon.softening_length = compute_softening(1.73753e6);
    moon.compute_derived();
    sim.add_body(moon);

    // ─── Mars ───────────────────────────────────────────────────────────
    // Horizons #499
    let mut mars = Body::new(
        0, "Mars", BodyType::Planet,
        6.4171e23, 3.38992e6,
        Vec3::new(50949994.46228143e3, -207492548.2420174e3, -5597537.454939082e3),
        Vec3::new(24.44715235948102e3, 7.861165862885534e3, -0.4347434612671703e3),
    );
    mars.rotation_rate = 7.088218111185524e-5;
    mars.axial_tilt = 0.4396;
    mars.mean_surface_temperature = 210.0;
    mars.seed = seed.wrapping_add(5);
    mars.semi_major_axis = 227941421.6480371e3;
    mars.eccentricity = 0.09348461380205672;
    mars.inclination = 1.847490422989131 * deg;
    mars.longitude_asc_node = 49.48317173608726 * deg;
    mars.arg_periapsis = 286.6231771776422 * deg;
    mars.mean_anomaly = 315.8219093418334 * deg;
    mars.parent_id = Some(sun_id);
    mars.color = hex_to_rgb(0xc1440e);
    mars.composition = PlanetComposition::Rocky;
    mars.albedo = 0.25;
    mars.atmosphere = Some(Atmosphere::mars_like());
    mars.softening_length = compute_softening(3.38992e6);
    mars.compute_derived();
    let mars_id = sim.add_body(mars);

    // ─── Phobos ─────────────────────────────────────────────────────────
    // Horizons #401 — mass from NASA fact sheet (GM=7.09e-4 km³/s²)
    let mut phobos = Body::new(
        0, "Phobos", BodyType::Moon,
        1.0659e16, 1.31e4,
        Vec3::new(50947366.23900896e3, -207501379.4311839e3, -5596900.585285708e3),
        Vec3::new(26.27614488820742e3, 7.238706660368853e3, -1.422097641061121e3),
    );
    phobos.rotation_rate = 2.28e-4;
    phobos.mean_surface_temperature = 233.0;
    phobos.seed = seed.wrapping_add(6);
    phobos.parent_id = Some(mars_id);
    phobos.color = hex_to_rgb(0x6b5f4f);
    phobos.composition = PlanetComposition::Rocky;
    phobos.albedo = 0.071;
    phobos.softening_length = compute_softening(1.31e4);
    phobos.compute_derived();
    sim.add_body(phobos);

    // ─── Deimos ─────────────────────────────────────────────────────────
    // Horizons #402 — mass from NASA fact sheet
    let mut deimos = Body::new(
        0, "Deimos", BodyType::Moon,
        1.4762e15, 7.8e3,
        Vec3::new(50960858.1512132e3, -207472045.051078e3, -5600953.046942502e3),
        Vec3::new(23.38140382423259e3, 8.511628465950784e3, 0.08254899501365598e3),
    );
    deimos.rotation_rate = 5.82e-5;
    deimos.mean_surface_temperature = 233.0;
    deimos.seed = seed.wrapping_add(7);
    deimos.parent_id = Some(mars_id);
    deimos.color = hex_to_rgb(0x6b5f4f);
    deimos.composition = PlanetComposition::Rocky;
    deimos.albedo = 0.068;
    deimos.softening_length = compute_softening(7.8e3);
    deimos.compute_derived();
    sim.add_body(deimos);

    // ─── Jupiter ────────────────────────────────────────────────────────
    // Horizons #599
    let mut jupiter = Body::new(
        0, "Jupiter", BodyType::Planet,
        1.89819e27, 6.9911e7,
        Vec3::new(-253419345.368912e3, 737350305.7947004e3, 2606925.500009716e3),
        Vec3::new(-12.52004139508961e3, -3.640294521136214e3, 0.2951466824685909e3),
    );
    jupiter.rotation_rate = 1.7585e-4;
    jupiter.axial_tilt = 0.0546;
    jupiter.mean_surface_temperature = 165.0;
    jupiter.seed = seed.wrapping_add(10);
    jupiter.semi_major_axis = 778388856.4707986e3;
    jupiter.eccentricity = 0.04815922780877058;
    jupiter.inclination = 1.303188609732257 * deg;
    jupiter.longitude_asc_node = 100.5154900059337 * deg;
    jupiter.arg_periapsis = 273.711224859534 * deg;
    jupiter.mean_anomaly = 89.22864130180537 * deg;
    jupiter.parent_id = Some(sun_id);
    jupiter.color = hex_to_rgb(0xd4a574);
    jupiter.composition = PlanetComposition::GasGiant;
    jupiter.albedo = 0.503;
    jupiter.softening_length = compute_softening(6.9911e7);
    jupiter.compute_derived();
    let jupiter_id = sim.add_body(jupiter);

    // ─── Io ─────────────────────────────────────────────────────────────
    // Horizons #501 — GM=5959.9155 km³/s²
    let mut io = Body::new(
        0, "Io", BodyType::Moon,
        8.9296e22, 1.82149e6,
        Vec3::new(-253048162.4054362e3, 737149012.2283239e3, 2604956.343127787e3),
        Vec3::new(-4.208017384166167e3, 11.53696126936628e3, 0.956643452611873e3),
    );
    io.rotation_rate = 4.11e-5;
    io.mean_surface_temperature = 130.0;
    io.seed = seed.wrapping_add(11);
    io.parent_id = Some(jupiter_id);
    io.color = hex_to_rgb(0xc2b250);
    io.composition = PlanetComposition::Rocky;
    io.albedo = 0.63;
    io.softening_length = compute_softening(1.82149e6);
    io.compute_derived();
    sim.add_body(io);

    // ─── Europa ─────────────────────────────────────────────────────────
    // Horizons #502 — GM=3202.7121 km³/s²
    let mut europa = Body::new(
        0, "Europa", BodyType::Moon,
        4.7986e22, 1.5608e6,
        Vec3::new(-253336795.2240106e3, 736680778.5479159e3, 2587835.180404663e3),
        Vec3::new(1.026104503088396e3, -1.874756906242933e3, 0.6349773826056384e3),
    );
    europa.rotation_rate = 2.048e-5;
    europa.mean_surface_temperature = 102.0;
    europa.seed = seed.wrapping_add(12);
    europa.parent_id = Some(jupiter_id);
    europa.color = hex_to_rgb(0xc8c0a8);
    europa.composition = PlanetComposition::Rocky;
    europa.albedo = 0.67;
    europa.softening_length = compute_softening(1.5608e6);
    europa.compute_derived();
    sim.add_body(europa);

    // ─── Ganymede ───────────────────────────────────────────────────────
    // Horizons #503 — GM=9887.8328 km³/s²
    let mut ganymede = Body::new(
        0, "Ganymede", BodyType::Moon,
        1.4815e23, 2.6312e6,
        Vec3::new(-252407469.010232e3, 737006450.7486157e3, 2608449.50889349e3),
        Vec3::new(-9.00783564280008e3, 6.667750073499915e3, 0.7397075799751662e3),
    );
    ganymede.rotation_rate = 1.016e-5;
    ganymede.mean_surface_temperature = 110.0;
    ganymede.seed = seed.wrapping_add(13);
    ganymede.parent_id = Some(jupiter_id);
    ganymede.color = hex_to_rgb(0x9a8a6a);
    ganymede.composition = PlanetComposition::Rocky;
    ganymede.albedo = 0.43;
    ganymede.softening_length = compute_softening(2.6312e6);
    ganymede.compute_derived();
    sim.add_body(ganymede);

    // ─── Callisto ───────────────────────────────────────────────────────
    // Horizons #504 — GM=7179.2834 km³/s²
    let mut callisto = Body::new(
        0, "Callisto", BodyType::Moon,
        1.0757e23, 2.4103e6,
        Vec3::new(-253408954.3921413e3, 739229434.180588e3, 2665876.684725225e3),
        Vec3::new(-20.73318361579015e3, -3.532172885335655e3, 0.187843729647549e3),
    );
    callisto.rotation_rate = 4.358e-6;
    callisto.mean_surface_temperature = 134.0;
    callisto.seed = seed.wrapping_add(14);
    callisto.parent_id = Some(jupiter_id);
    callisto.color = hex_to_rgb(0x5a4d3a);
    callisto.composition = PlanetComposition::Rocky;
    callisto.albedo = 0.22;
    callisto.softening_length = compute_softening(2.4103e6);
    callisto.compute_derived();
    sim.add_body(callisto);

    // ─── Saturn ─────────────────────────────────────────────────────────
    // Horizons #699
    let mut saturn = Body::new(
        0, "Saturn", BodyType::Planet,
        5.6834e26, 5.8232e7,
        Vec3::new(1422278067.19984e3, 38557211.58159366e3, -57286362.61760134e3),
        Vec3::new(-0.8022902327476618e3, 9.633913344037813e3, -0.1352982130832756e3),
    );
    saturn.rotation_rate = 1.63785e-4;
    saturn.axial_tilt = 0.4665;
    saturn.mean_surface_temperature = 134.0;
    saturn.seed = seed.wrapping_add(20);
    saturn.semi_major_axis = 1427745884.220034e3;
    saturn.eccentricity = 0.05540366888330445;
    saturn.inclination = 2.48665565615377 * deg;
    saturn.longitude_asc_node = 113.5608662919897 * deg;
    saturn.arg_periapsis = 338.4393086264126 * deg;
    saturn.mean_anomaly = 275.9187884790698 * deg;
    saturn.parent_id = Some(sun_id);
    saturn.color = hex_to_rgb(0xead6a7);
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.342;
    saturn.softening_length = compute_softening(5.8232e7);
    saturn.compute_derived();
    let saturn_id = sim.add_body(saturn);

    // ─── Mimas ──────────────────────────────────────────────────────────
    // Horizons #601 — GM=2.503489 km³/s²
    let mut mimas = Body::new(
        0, "Mimas", BodyType::Moon,
        3.7509e19, 1.988e5,
        Vec3::new(1422134256.763391e3, 38664149.43022263e3, -57331424.57386944e3),
        Vec3::new(-9.951772995864012e3, 0.3847832913716864e3, 5.977387219023425e3),
    );
    mimas.rotation_rate = 7.72e-5;
    mimas.mean_surface_temperature = 64.0;
    mimas.seed = seed.wrapping_add(21);
    mimas.parent_id = Some(saturn_id);
    mimas.color = hex_to_rgb(0xc8c8c8);
    mimas.composition = PlanetComposition::Rocky;
    mimas.albedo = 0.962;
    mimas.softening_length = compute_softening(1.988e5);
    mimas.compute_derived();
    sim.add_body(mimas);

    // ─── Enceladus ──────────────────────────────────────────────────────
    // Horizons #602 — GM=7.210367 km³/s²
    let mut enceladus = Body::new(
        0, "Enceladus", BodyType::Moon,
        1.0803e20, 2.523e5,
        Vec3::new(1422042201.36275e3, 38545378.05526055e3, -57257288.4870629e3),
        Vec3::new(0.5247221847633589e3, -1.551089888497419e3, 5.596865557104396e3),
    );
    enceladus.rotation_rate = 5.31e-5;
    enceladus.mean_surface_temperature = 75.0;
    enceladus.seed = seed.wrapping_add(22);
    enceladus.parent_id = Some(saturn_id);
    enceladus.color = hex_to_rgb(0xf0f0f0);
    enceladus.composition = PlanetComposition::Rocky;
    enceladus.albedo = 0.99;
    enceladus.softening_length = compute_softening(2.523e5);
    enceladus.compute_derived();
    sim.add_body(enceladus);

    // ─── Tethys ─────────────────────────────────────────────────────────
    // Horizons #603 — GM=41.21 km³/s²
    let mut tethys = Body::new(
        0, "Tethys", BodyType::Moon,
        6.1744e20, 5.363e5,
        Vec3::new(1422114248.461821e3, 38780627.57833759e3, -57386689.11433573e3),
        Vec3::new(-10.20298221498555e3, 4.295481160441287e3, 3.329682184654279e3),
    );
    tethys.rotation_rate = 3.85e-5;
    tethys.mean_surface_temperature = 86.0;
    tethys.seed = seed.wrapping_add(23);
    tethys.parent_id = Some(saturn_id);
    tethys.color = hex_to_rgb(0xd8d8d8);
    tethys.composition = PlanetComposition::Rocky;
    tethys.albedo = 0.80;
    tethys.softening_length = compute_softening(5.363e5);
    tethys.compute_derived();
    sim.add_body(tethys);

    // ─── Dione ──────────────────────────────────────────────────────────
    // Horizons #604 — GM=73.116 km³/s²
    let mut dione = Body::new(
        0, "Dione", BodyType::Moon,
        1.0955e21, 5.625e5,
        Vec3::new(1422031948.887452e3, 38313212.74314193e3, -57134848.32052323e3),
        Vec3::new(6.74439372546288e3, 3.540700481407788e3, 2.323905686523045e3),
    );
    dione.rotation_rate = 2.66e-5;
    dione.mean_surface_temperature = 87.0;
    dione.seed = seed.wrapping_add(24);
    dione.parent_id = Some(saturn_id);
    dione.color = hex_to_rgb(0xd0d0d0);
    dione.composition = PlanetComposition::Rocky;
    dione.albedo = 0.998;
    dione.softening_length = compute_softening(5.625e5);
    dione.compute_derived();
    sim.add_body(dione);

    // ─── Rhea ───────────────────────────────────────────────────────────
    // Horizons #605 — GM=153.94 km³/s²
    let mut rhea = Body::new(
        0, "Rhea", BodyType::Moon,
        2.3065e21, 7.645e5,
        Vec3::new(1422010481.792402e3, 38166441.7383346e3, -57054752.32474688e3),
        Vec3::new(6.476917318294454e3, 5.541627449500241e3, 1.353064103465281e3),
    );
    rhea.rotation_rate = 1.652e-5;
    rhea.mean_surface_temperature = 76.0;
    rhea.seed = seed.wrapping_add(25);
    rhea.parent_id = Some(saturn_id);
    rhea.color = hex_to_rgb(0xc0c0c0);
    rhea.composition = PlanetComposition::Rocky;
    rhea.albedo = 0.949;
    rhea.softening_length = compute_softening(7.645e5);
    rhea.compute_derived();
    sim.add_body(rhea);

    // ─── Titan ──────────────────────────────────────────────────────────
    // Horizons #606 — GM=8978.14 km³/s², thick N₂/CH₄ atmosphere
    let mut titan = Body::new(
        0, "Titan", BodyType::Moon,
        1.3452e23, 2.5755e6,
        Vec3::new(1423389918.556709e3, 38153032.56924746e3, -57188578.59238257e3),
        Vec3::new(1.120305624246614e3, 14.35438017172909e3, -2.760960541157103e3),
    );
    titan.rotation_rate = 4.561e-6;
    titan.axial_tilt = 0.0052;
    titan.mean_surface_temperature = 94.0;
    titan.seed = seed.wrapping_add(26);
    titan.parent_id = Some(saturn_id);
    titan.color = hex_to_rgb(0xc8a040);
    titan.composition = PlanetComposition::Rocky;
    titan.albedo = 0.22;
    // Titan: thick nitrogen atmosphere, 1.5× Earth surface pressure
    titan.atmosphere = Some(Atmosphere {
        scale_height: 21000.0,
        rayleigh_coefficients: [2.0e-5, 5.0e-5, 8.5e-5],
        mie_coefficient: 5.0e-4,
        mie_direction: 0.76,
        height: 600_000.0,
        mie_color: [0.9, 0.7, 0.3],
    });
    titan.softening_length = compute_softening(2.5755e6);
    titan.compute_derived();
    sim.add_body(titan);

    // ─── Iapetus ────────────────────────────────────────────────────────
    // Horizons #608 — GM=120.52 km³/s²
    let mut iapetus = Body::new(
        0, "Iapetus", BodyType::Moon,
        1.8057e21, 7.345e5,
        Vec3::new(1420709057.046448e3, 41751346.03178877e3, -57706716.57236903e3),
        Vec3::new(-3.688822513608554e3, 8.431453071930134e3, 0.7216475694914566e3),
    );
    iapetus.rotation_rate = 9.17e-7;
    iapetus.mean_surface_temperature = 90.0;
    iapetus.seed = seed.wrapping_add(27);
    iapetus.parent_id = Some(saturn_id);
    iapetus.color = hex_to_rgb(0x6b5a4a);
    iapetus.composition = PlanetComposition::Rocky;
    iapetus.albedo = 0.20;
    iapetus.softening_length = compute_softening(7.345e5);
    iapetus.compute_derived();
    sim.add_body(iapetus);

    // ─── Uranus ─────────────────────────────────────────────────────────
    // Horizons #799
    let mut uranus = Body::new(
        0, "Uranus", BodyType::Planet,
        8.6813e25, 2.5362e7,
        Vec3::new(1478073476.913783e3, 2513246041.395467e3, -9831518.091484904e3),
        Vec3::new(-5.932790537281171e3, 3.134649152126629e3, 0.08880768290436647e3),
    );
    uranus.rotation_rate = -1.01237e-4;
    uranus.axial_tilt = 1.7064;
    uranus.mean_surface_temperature = 76.0;
    uranus.seed = seed.wrapping_add(30);
    uranus.semi_major_axis = 2884827997.531245e3;
    uranus.eccentricity = 0.04681618294428753;
    uranus.inclination = 0.7747251262000414 * deg;
    uranus.longitude_asc_node = 73.97944638615273 * deg;
    uranus.arg_periapsis = 91.36357043520249 * deg;
    uranus.mean_anomaly = 259.4053127263502 * deg;
    uranus.parent_id = Some(sun_id);
    uranus.color = hex_to_rgb(0x72b4c4);
    uranus.composition = PlanetComposition::IceGiant;
    uranus.albedo = 0.300;
    uranus.softening_length = compute_softening(2.5362e7);
    uranus.compute_derived();
    let uranus_id = sim.add_body(uranus);

    // ─── Miranda ────────────────────────────────────────────────────────
    // Horizons #705 — GM=4.3 km³/s²
    let mut miranda = Body::new(
        0, "Miranda", BodyType::Moon,
        6.4426e19, 2.40e5,
        Vec3::new(1478186683.266191e3, 2513222317.937086e3, -9772397.13156879e3),
        Vec3::new(-3.244095258519708e3, 1.347912130895228e3, -5.757145401858096e3),
    );
    miranda.rotation_rate = 5.01e-5;
    miranda.mean_surface_temperature = 60.0;
    miranda.seed = seed.wrapping_add(31);
    miranda.parent_id = Some(uranus_id);
    miranda.color = hex_to_rgb(0xa0a0a0);
    miranda.composition = PlanetComposition::Rocky;
    miranda.albedo = 0.32;
    miranda.softening_length = compute_softening(2.40e5);
    miranda.compute_derived();
    sim.add_body(miranda);

    // ─── Ariel ──────────────────────────────────────────────────────────
    // Horizons #701 — GM=83.43 km³/s²
    let mut ariel = Body::new(
        0, "Ariel", BodyType::Moon,
        1.2500e21, 5.811e5,
        Vec3::new(1478247017.224427e3, 2513218437.002844e3, -9756912.972674847e3),
        Vec3::new(-3.958215809508779e3, 2.006884233638803e3, -4.929726385208909e3),
    );
    ariel.rotation_rate = 2.87e-5;
    ariel.mean_surface_temperature = 58.0;
    ariel.seed = seed.wrapping_add(32);
    ariel.parent_id = Some(uranus_id);
    ariel.color = hex_to_rgb(0xc0c0c0);
    ariel.composition = PlanetComposition::Rocky;
    ariel.albedo = 0.53;
    ariel.softening_length = compute_softening(5.811e5);
    ariel.compute_derived();
    sim.add_body(ariel);

    // ─── Umbriel ────────────────────────────────────────────────────────
    // Horizons #702 — GM=85.4 km³/s²
    let mut umbriel = Body::new(
        0, "Umbriel", BodyType::Moon,
        1.2795e21, 5.847e5,
        Vec3::new(1478020996.614599e3, 2513292863.609729e3, -9576045.21745038e3),
        Vec3::new(-1.449193171903463e3, 2.30867803339213e3, 1.168563341651776e3),
    );
    umbriel.rotation_rate = 1.73e-5;
    umbriel.mean_surface_temperature = 61.0;
    umbriel.seed = seed.wrapping_add(33);
    umbriel.parent_id = Some(uranus_id);
    umbriel.color = hex_to_rgb(0x606060);
    umbriel.composition = PlanetComposition::Rocky;
    umbriel.albedo = 0.26;
    umbriel.softening_length = compute_softening(5.847e5);
    umbriel.compute_derived();
    sim.add_body(umbriel);

    // ─── Titania ────────────────────────────────────────────────────────
    // Horizons #703 — GM=222.8 km³/s²
    let mut titania = Body::new(
        0, "Titania", BodyType::Moon,
        3.3382e21, 7.889e5,
        Vec3::new(1478435784.939839e3, 2513136567.626043e3, -10047155.14388299e3),
        Vec3::new(-7.811325028798818e3, 3.109489400348165e3, -3.040436133563583e3),
    );
    titania.rotation_rate = 9.42e-6;
    titania.mean_surface_temperature = 60.0;
    titania.seed = seed.wrapping_add(34);
    titania.parent_id = Some(uranus_id);
    titania.color = hex_to_rgb(0x909090);
    titania.composition = PlanetComposition::Rocky;
    titania.albedo = 0.35;
    titania.softening_length = compute_softening(7.889e5);
    titania.compute_derived();
    sim.add_body(titania);

    // ─── Oberon ─────────────────────────────────────────────────────────
    // Horizons #704 — GM=205.34 km³/s²
    let mut oberon = Body::new(
        0, "Oberon", BodyType::Moon,
        3.0766e21, 7.614e5,
        Vec3::new(1478363146.793264e3, 2513254768.633219e3, -9326066.379535913e3),
        Vec3::new(-3.278451196615699e3, 2.341478491126701e3, -1.423347371695179e3),
    );
    oberon.rotation_rate = 6.97e-6;
    oberon.mean_surface_temperature = 61.0;
    oberon.seed = seed.wrapping_add(35);
    oberon.parent_id = Some(uranus_id);
    oberon.color = hex_to_rgb(0x707070);
    oberon.composition = PlanetComposition::Rocky;
    oberon.albedo = 0.31;
    oberon.softening_length = compute_softening(7.614e5);
    oberon.compute_derived();
    sim.add_body(oberon);

    // ─── Neptune ────────────────────────────────────────────────────────
    // Horizons #899
    let mut neptune = Body::new(
        0, "Neptune", BodyType::Planet,
        1.02409e26, 2.4624e7,
        Vec3::new(4468805610.889497e3, 77632244.96534711e3, -104579004.7369847e3),
        Vec3::new(-0.1418865028292812e3, 5.465647680419589e3, -0.1098251976786266e3),
    );
    neptune.rotation_rate = 1.08338e-4;
    neptune.axial_tilt = 0.4943;
    neptune.mean_surface_temperature = 72.0;
    neptune.seed = seed.wrapping_add(40);
    neptune.semi_major_axis = 4503937575.533338e3;
    neptune.eccentricity = 0.01096408504193659;
    neptune.inclination = 1.773857918729585 * deg;
    neptune.longitude_asc_node = 131.9234181489527 * deg;
    neptune.arg_periapsis = 277.2518326663131 * deg;
    neptune.mean_anomaly = 312.7645852053252 * deg;
    neptune.parent_id = Some(sun_id);
    neptune.color = hex_to_rgb(0x3d5ef5);
    neptune.composition = PlanetComposition::IceGiant;
    neptune.albedo = 0.290;
    neptune.softening_length = compute_softening(2.4624e7);
    neptune.compute_derived();
    let neptune_id = sim.add_body(neptune);

    // ─── Triton ─────────────────────────────────────────────────────────
    // Horizons #801 — GM=1428.495 km³/s², retrograde orbit
    let mut triton = Body::new(
        0, "Triton", BodyType::Moon,
        2.1403e22, 1.3526e6,
        Vec3::new(4468521081.135368e3, 77602227.99822089e3, -104369247.4342077e3),
        Vec3::new(1.104116488429909e3, 9.0521646883296e3, 2.093651644994011e3),
    );
    triton.rotation_rate = -1.237e-5;
    triton.mean_surface_temperature = 38.0;
    triton.seed = seed.wrapping_add(41);
    triton.parent_id = Some(neptune_id);
    triton.color = hex_to_rgb(0xc8a0a0);
    triton.composition = PlanetComposition::Rocky;
    triton.albedo = 0.76;
    triton.softening_length = compute_softening(1.3526e6);
    triton.compute_derived();
    sim.add_body(triton);

    // ─── Nereid ─────────────────────────────────────────────────────────
    // Horizons #802 — no GM; mass ~3.1e19 kg (estimated)
    let mut nereid = Body::new(
        0, "Nereid", BodyType::Moon,
        3.1e19, 1.70e5,
        Vec3::new(4466721998.629698e3, 77654770.52877851e3, -104697186.261003e3),
        Vec3::new(1.05492366762975e3, 3.497657706565644e3, -0.1724898135491217e3),
    );
    nereid.mean_surface_temperature = 50.0;
    nereid.seed = seed.wrapping_add(42);
    nereid.parent_id = Some(neptune_id);
    nereid.color = hex_to_rgb(0x808080);
    nereid.composition = PlanetComposition::Rocky;
    nereid.albedo = 0.155;
    nereid.softening_length = compute_softening(1.70e5);
    nereid.compute_derived();
    sim.add_body(nereid);

    // ─── Pluto (Dwarf Planet) ───────────────────────────────────────────
    // Horizons #999
    let mut pluto = Body::new(
        0, "Pluto", BodyType::Planet,
        1.307e22, 1.1883e6,
        Vec3::new(2876454611.935341e3, -4435932980.402722e3, -357166891.4301288e3),
        Vec3::new(4.712183799328487e3, 1.765843514620449e3, -1.541339492070124e3),
    );
    pluto.rotation_rate = -1.1386e-5;
    pluto.axial_tilt = 2.1387;
    pluto.mean_surface_temperature = 44.0;
    pluto.seed = seed.wrapping_add(50);
    pluto.semi_major_axis = 5926960866.430534e3;
    pluto.eccentricity = 0.2474542943747517;
    pluto.inclination = 17.02988887116384 * deg;
    pluto.longitude_asc_node = 110.2194291724405 * deg;
    pluto.arg_periapsis = 114.9681379392435 * deg;
    pluto.mean_anomaly = 51.83516638073647 * deg;
    pluto.parent_id = Some(sun_id);
    pluto.color = hex_to_rgb(0xdbd3c9);
    pluto.composition = PlanetComposition::Dwarf;
    pluto.albedo = 0.49;
    pluto.softening_length = compute_softening(1.1883e6);
    pluto.compute_derived();
    let pluto_id = sim.add_body(pluto);

    // ─── Charon ─────────────────────────────────────────────────────────
    // Horizons #901 — GM=106.1 km³/s²
    let mut charon = Body::new(
        0, "Charon", BodyType::Moon,
        1.5897e21, 6.06e5,
        Vec3::new(2876464774.708125e3, -4435932372.040207e3, -357183633.9245892e3),
        Vec3::new(4.596001364099314e3, 1.591573427088925e3, -1.618235636917969e3),
    );
    charon.rotation_rate = -1.139e-5;
    charon.mean_surface_temperature = 53.0;
    charon.seed = seed.wrapping_add(51);
    charon.parent_id = Some(pluto_id);
    charon.color = hex_to_rgb(0xa0a0a0);
    charon.composition = PlanetComposition::Dwarf;
    charon.albedo = 0.35;
    charon.softening_length = compute_softening(6.06e5);
    charon.compute_derived();
    sim.add_body(charon);

    // ─── Ceres (Dwarf Planet) ───────────────────────────────────────────
    // Horizons "Ceres;" — mass from Dawn mission: GM=62.6284 km³/s²
    let mut ceres = Body::new(
        0, "Ceres", BodyType::Asteroid,
        9.393e20, 4.73e5,
        Vec3::new(381172803.9516315e3, 192678035.3254012e3, -64122243.31556011e3),
        Vec3::new(-8.426224419312673e3, 14.78866205551999e3, 2.020528345094608e3),
    );
    ceres.mean_surface_temperature = 168.0;
    ceres.seed = seed.wrapping_add(60);
    ceres.semi_major_axis = 413721487.1842388e3;
    ceres.eccentricity = 0.07960223186188;
    ceres.inclination = 10.58794645426135 * deg;
    ceres.longitude_asc_node = 80.249108694232 * deg;
    ceres.arg_periapsis = 73.30682825990756 * deg;
    ceres.mean_anomaly = 240.3212260946607 * deg;
    ceres.parent_id = Some(sun_id);
    ceres.color = hex_to_rgb(0x8a8a7a);
    ceres.composition = PlanetComposition::Dwarf;
    ceres.albedo = 0.09;
    ceres.softening_length = compute_softening(4.73e5);
    ceres.compute_derived();
    sim.add_body(ceres);

    // ─── Pallas ─────────────────────────────────────────────────────────
    // Horizons "Pallas;" — mass ~2.108e20 kg (estimated)
    let mut pallas = Body::new(
        0, "Pallas", BodyType::Asteroid,
        2.108e20, 2.56e5,
        Vec3::new(433537930.2825843e3, -211324380.8912392e3, 108960193.254541e3),
        Vec3::new(5.285248956501269e3, 11.06926367069772e3, -8.12795020152019e3),
    );
    pallas.mean_surface_temperature = 164.0;
    pallas.seed = seed.wrapping_add(61);
    pallas.semi_major_axis = 414367434.3765528e3;
    pallas.eccentricity = 0.2306536252077891;
    pallas.inclination = 34.92925945224728 * deg;
    pallas.longitude_asc_node = 172.8878106903665 * deg;
    pallas.arg_periapsis = 310.9394914426276 * deg;
    pallas.mean_anomaly = 220.2881595791486 * deg;
    pallas.parent_id = Some(sun_id);
    pallas.color = hex_to_rgb(0x909080);
    pallas.composition = PlanetComposition::Dwarf;
    pallas.albedo = 0.16;
    pallas.softening_length = compute_softening(2.56e5);
    pallas.compute_derived();
    sim.add_body(pallas);

    // ─── Vesta ──────────────────────────────────────────────────────────
    // Horizons "Vesta;" — mass from Dawn mission: GM=17.28 km³/s²
    let mut vesta = Body::new(
        0, "Vesta", BodyType::Asteroid,
        2.5908e20, 2.627e5,
        Vec3::new(164667262.8555179e3, -285020315.7647729e3, -11589457.12623374e3),
        Vec3::new(18.37499946379189e3, 9.286427386359417e3, -2.513236585470284e3),
    );
    vesta.mean_surface_temperature = 210.0;
    vesta.seed = seed.wrapping_add(62);
    vesta.semi_major_axis = 353282201.3859497e3;
    vesta.eccentricity = 0.09017810677937681;
    vesta.inclination = 7.144045850814265 * deg;
    vesta.longitude_asc_node = 103.7022720857349 * deg;
    vesta.arg_periapsis = 151.5286411503499 * deg;
    vesta.mean_anomaly = 37.95145292974541 * deg;
    vesta.parent_id = Some(sun_id);
    vesta.color = hex_to_rgb(0xb0a890);
    vesta.composition = PlanetComposition::Dwarf;
    vesta.albedo = 0.42;
    vesta.softening_length = compute_softening(2.627e5);
    vesta.compute_derived();
    sim.add_body(vesta);

    // ─── 1P/Halley ──────────────────────────────────────────────────────
    // Horizons "DES=1P;CAP" — nucleus ~11 km, mass ~2.2e14 kg
    let mut halley = Body::new(
        0, "1P/Halley", BodyType::Comet,
        2.2e14, 5.5e3,
        Vec3::new(-2917189260.832731e3, 4103229382.979976e3, -1479132076.090842e3),
        Vec3::new(0.8832366191099449e3, 0.300525412476204e3, 0.1957770520897246e3),
    );
    halley.seed = seed.wrapping_add(70);
    halley.semi_major_axis = 2671655325.504932e3;
    halley.eccentricity = 0.9679618548754312;
    halley.inclination = 162.1617653942714 * deg;
    halley.longitude_asc_node = 59.49066226944706 * deg;
    halley.arg_periapsis = 112.3892314916453 * deg;
    halley.mean_anomaly = 190.1093625015996 * deg;
    halley.parent_id = Some(sun_id);
    halley.color = hex_to_rgb(0x505050);
    halley.albedo = 0.04;
    halley.softening_length = compute_softening(5.5e3);
    halley.compute_derived();
    sim.add_body(halley);

    // ─── 2P/Encke ───────────────────────────────────────────────────────
    // Horizons "DES=2P;CAP" — nucleus ~4.8 km, mass ~7e13 kg
    let mut encke = Body::new(
        0, "2P/Encke", BodyType::Comet,
        7.0e13, 2.4e3,
        Vec3::new(559664540.5575279e3, -92060418.24731372e3, 32596024.14056076e3),
        Vec3::new(-4.3574121049484e3, 6.892325679666753e3, 0.8601878551229647e3),
    );
    encke.seed = seed.wrapping_add(71);
    encke.semi_major_axis = 331809068.2956051e3;
    encke.eccentricity = 0.8472319060114437;
    encke.inclination = 11.34666622132782 * deg;
    encke.longitude_asc_node = 334.0167568429482 * deg;
    encke.arg_periapsis = 187.2807694345101 * deg;
    encke.mean_anomaly = 239.0876786799605 * deg;
    encke.parent_id = Some(sun_id);
    encke.color = hex_to_rgb(0x484848);
    encke.albedo = 0.05;
    encke.softening_length = compute_softening(2.4e3);
    encke.compute_derived();
    sim.add_body(encke);

    // ─── 67P/Churyumov-Gerasimenko ──────────────────────────────────────
    // Horizons "DES=67P;CAP" — Rosetta target, mass 9.982e12 kg
    let mut cg67p = Body::new(
        0, "67P/C-G", BodyType::Comet,
        9.982e12, 2.0e3,
        Vec3::new(-221673785.044727e3, -768051446.6615202e3, -32968734.40386677e3),
        Vec3::new(8.567957552286614e3, 1.333205084611423e3, -0.2702937321244637e3),
    );
    cg67p.seed = seed.wrapping_add(72);
    cg67p.semi_major_axis = 517423212.7933555e3;
    cg67p.eccentricity = 0.6496988109433209;
    cg67p.inclination = 3.867254418089749 * deg;
    cg67p.longitude_asc_node = 36.30454632096252 * deg;
    cg67p.arg_periapsis = 22.22566744980207 * deg;
    cg67p.mean_anomaly = 232.9237661694769 * deg;
    cg67p.parent_id = Some(sun_id);
    cg67p.color = hex_to_rgb(0x404040);
    cg67p.albedo = 0.06;
    cg67p.softening_length = compute_softening(2.0e3);
    cg67p.compute_derived();
    sim.add_body(cg67p);

    // ─── C/1995 O1 (Hale-Bopp) ─────────────────────────────────────────
    // Horizons "DES=C/1995 O1;CAP" — Great Comet, nucleus ~30 km
    let mut hale_bopp = Body::new(
        0, "Hale-Bopp", BodyType::Comet,
        1.3e16, 3.0e4,
        Vec3::new(650460388.6456269e3, -3264152766.125053e3, -6749038292.298038e3),
        Vec3::new(0.6185915303296363e3, -3.06696975155981e3, -4.534169264860202e3),
    );
    hale_bopp.seed = seed.wrapping_add(73);
    hale_bopp.semi_major_axis = 26950876213.25732e3;
    hale_bopp.eccentricity = 0.9949126551461109;
    hale_bopp.inclination = 89.76952938034762 * deg;
    hale_bopp.longitude_asc_node = 281.7372689030623 * deg;
    hale_bopp.arg_periapsis = 130.6503045023052 * deg;
    hale_bopp.mean_anomaly = 4.281807099917236 * deg;
    hale_bopp.parent_id = Some(sun_id);
    hale_bopp.color = hex_to_rgb(0x585858);
    hale_bopp.albedo = 0.04;
    hale_bopp.softening_length = compute_softening(3.0e4);
    hale_bopp.compute_derived();
    sim.add_body(hale_bopp);

    // ─── 109P/Swift-Tuttle ──────────────────────────────────────────────
    // Horizons "DES=109P;CAP" — Perseid parent, nucleus ~26 km
    let mut swift_tuttle = Body::new(
        0, "109P/Swift-Tuttle", BodyType::Comet,
        5.0e15, 1.3e4,
        Vec3::new(-4935050362.134387e3, 2349412406.153687e3, -3279921364.912398e3),
        Vec3::new(-2.235481933160598e3, 1.548617003034965e3, -0.6110576273988768e3),
    );
    swift_tuttle.seed = seed.wrapping_add(74);
    swift_tuttle.semi_major_axis = 3918227229.670524e3;
    swift_tuttle.eccentricity = 0.9631437947859451;
    swift_tuttle.inclination = 112.9366346623207 * deg;
    swift_tuttle.longitude_asc_node = 139.8317494517476 * deg;
    swift_tuttle.arg_periapsis = 153.2438145838594 * deg;
    swift_tuttle.mean_anomaly = 88.70750514362541 * deg;
    swift_tuttle.parent_id = Some(sun_id);
    swift_tuttle.color = hex_to_rgb(0x505050);
    swift_tuttle.albedo = 0.04;
    swift_tuttle.softening_length = compute_softening(1.3e4);
    swift_tuttle.compute_derived();
    sim.add_body(swift_tuttle);

    // Shift to barycentric frame
    if barycentric {
        recenter_to_barycenter(&mut sim);
    }

    sim.finalize_derived();
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// ASTEROID BELT PRESET
// ═══════════════════════════════════════════════════════════════════════════

/// Asteroid belt orbital element data for major dwarf planets
mod asteroid_data {
    use super::*;
    
    /// Ceres - largest object in asteroid belt
    pub const CERES: OrbitalElements = OrbitalElements {
        semi_major_axis: 2.7691 * AU,        // 2.77 AU
        eccentricity: 0.0758,
        inclination: 0.1850,                  // 10.59°
        longitude_asc_node: 1.4016,           // 80.3°
        arg_periapsis: 1.2778,                // 73.2°
        mean_anomaly: 1.5708,                 // ~90°
    };
    
    /// Vesta - second most massive asteroid
    pub const VESTA: OrbitalElements = OrbitalElements {
        semi_major_axis: 2.3615 * AU,        // 2.36 AU
        eccentricity: 0.0887,
        inclination: 0.1248,                  // 7.14°
        longitude_asc_node: 1.8326,           // 105°
        arg_periapsis: 2.5656,                // 147°
        mean_anomaly: 0.5236,                 // ~30°
    };
    
    /// Pallas - third most massive asteroid
    pub const PALLAS: OrbitalElements = OrbitalElements {
        semi_major_axis: 2.7720 * AU,        // 2.77 AU
        eccentricity: 0.2313,
        inclination: 0.6050,                  // 34.8° (high inclination!)
        longitude_asc_node: 2.8972,           // 166°
        arg_periapsis: 5.4978,                // 315°
        mean_anomaly: 2.0944,                 // ~120°
    };
    
    /// Hygiea - fourth largest asteroid
    pub const HYGIEA: OrbitalElements = OrbitalElements {
        semi_major_axis: 3.1395 * AU,        // 3.14 AU
        eccentricity: 0.1146,
        inclination: 0.0646,                  // 3.7°
        longitude_asc_node: 5.1836,           // 297°
        arg_periapsis: 5.6199,                // 322°
        mean_anomaly: 3.6652,                 // ~210°
    };
}

/// Create asteroid belt simulation
/// 
/// Contains:
/// - Sun + 8 planets (from Full Solar System II)
/// - Major moons (Earth Moon, Mars moons, Galilean moons, etc.)
/// - 4 dwarf planets (Ceres, Vesta, Pallas, Hygiea)
/// - `asteroid_count` procedurally generated asteroids (2.1-3.3 AU)
/// 
/// Asteroid properties:
/// - Mass: Power-law distribution (α ≈ 2.3, many small, few large)
/// - Semi-major axis: Uniform in 2.1-3.3 AU (avoiding Kirkwood gaps)
/// - Eccentricity: Rayleigh distribution (σ ≈ 0.1)
/// - Inclination: Rayleigh distribution (σ ≈ 10°)
pub fn create_asteroid_belt(seed: u64, asteroid_count: usize) -> Simulation {
    // Start with the full solar system II as base
    let mut sim = create_full_solar_system_ii(seed, true);
    
    let mu_sun = G * M_SUN;
    let sun_id = 0; // Sun is always first body
    
    // Add major dwarf planets
    let dwarf_planets = [
        ("Ceres",  asteroid_data::CERES,  9.393e20, 4.73e5, 0xa0a0a0_u32),  // ~940 km diameter
        ("Vesta",  asteroid_data::VESTA,  2.59e20,  2.63e5, 0xc0c0c0),      // ~525 km
        ("Pallas", asteroid_data::PALLAS, 2.04e20,  2.56e5, 0xb0b0b0),      // ~512 km
        ("Hygiea", asteroid_data::HYGIEA, 8.67e19,  2.15e5, 0x909090),      // ~430 km
    ];
    
    for (name, elements, mass, radius, color_hex) in dwarf_planets.iter() {
        let (pos, vel) = elements.to_cartesian(mu_sun);
        let mut asteroid = Body::new(
            0, *name, BodyType::Asteroid,
            *mass, *radius,
            pos, vel,
        );
        asteroid.semi_major_axis = elements.semi_major_axis;
        asteroid.eccentricity = elements.eccentricity;
        asteroid.inclination = elements.inclination;
        asteroid.longitude_asc_node = elements.longitude_asc_node;
        asteroid.arg_periapsis = elements.arg_periapsis;
        asteroid.mean_anomaly = elements.mean_anomaly;
        asteroid.parent_id = Some(sun_id);
        asteroid.color = hex_to_rgb(*color_hex);
        asteroid.composition = PlanetComposition::Rocky;
        asteroid.albedo = 0.1;
        asteroid.softening_length = compute_softening(*radius);
        asteroid.compute_derived();
        sim.add_body(asteroid);
    }
    
    // Procedurally generate asteroid belt
    let mut rng = Pcg32::new(seed.wrapping_add(1000));
    
    // Asteroid belt parameters
    let a_min = 2.1 * AU;  // Inner edge (Mars crossers excluded)
    let a_max = 3.3 * AU;  // Outer edge (before Jupiter trojans)
    
    // Mass range: 10^12 kg (1 km) to 10^18 kg (100 km) - most are small
    let m_min = 1e12;
    let m_max = 1e18;
    let alpha = 2.3; // Power-law exponent (steeper = more small bodies)
    
    // Rayleigh distribution parameters
    let ecc_sigma = 0.1;       // σ for eccentricity (~0.15 typical)
    let inc_sigma = 10.0 * PI / 180.0;  // σ for inclination in radians (~10°)
    
    // Kirkwood gaps (resonances with Jupiter to avoid)
    let kirkwood_gaps = [
        (2.06 * AU, 0.03 * AU), // 4:1 resonance
        (2.50 * AU, 0.04 * AU), // 3:1 resonance
        (2.82 * AU, 0.03 * AU), // 5:2 resonance
        (2.95 * AU, 0.03 * AU), // 7:3 resonance
        (3.27 * AU, 0.03 * AU), // 2:1 resonance
    ];
    
    for i in 0..asteroid_count {
        // Sample semi-major axis, avoiding Kirkwood gaps
        let mut semi_major_axis;
        loop {
            semi_major_axis = rng.next_f64_range(a_min, a_max);
            let in_gap = kirkwood_gaps.iter().any(|&(center, width)| {
                (semi_major_axis - center).abs() < width
            });
            if !in_gap {
                break;
            }
        }
        
        // Sample orbital elements
        let eccentricity = sample_rayleigh(&mut rng, ecc_sigma).min(0.4); // Cap at 0.4
        let inclination = sample_rayleigh(&mut rng, inc_sigma);
        let longitude_asc_node = rng.next_f64() * 2.0 * PI;
        let arg_periapsis = rng.next_f64() * 2.0 * PI;
        let mean_anomaly = rng.next_f64() * 2.0 * PI;
        
        let elements = OrbitalElements {
            semi_major_axis,
            eccentricity,
            inclination,
            longitude_asc_node,
            arg_periapsis,
            mean_anomaly,
        };
        
        // Sample mass from power-law
        let mass = sample_power_law(&mut rng, m_min, m_max, alpha);
        
        // Estimate radius from mass (assuming density ~2500 kg/m³ for rocky)
        let density = 2500.0;
        let volume = mass / density;
        let radius = (3.0 * volume / (4.0 * PI)).powf(1.0 / 3.0);
        
        // Convert to cartesian
        let (pos, vel) = elements.to_cartesian(mu_sun);
        
        // Create asteroid body
        let name = format!("Asteroid_{}", i + 1);
        let mut asteroid = Body::new(
            0, &name, BodyType::Asteroid,
            mass, radius,
            pos, vel,
        );
        
        asteroid.semi_major_axis = semi_major_axis;
        asteroid.eccentricity = eccentricity;
        asteroid.inclination = inclination;
        asteroid.longitude_asc_node = longitude_asc_node;
        asteroid.arg_periapsis = arg_periapsis;
        asteroid.mean_anomaly = mean_anomaly;
        asteroid.parent_id = Some(sun_id);
        
        // Random gray color for asteroids
        let gray = 0x60 + (rng.next_bounded(0x40) as u32);
        asteroid.color = hex_to_rgb((gray << 16) | (gray << 8) | gray);
        asteroid.composition = PlanetComposition::Rocky;
        asteroid.albedo = 0.05 + rng.next_f64() * 0.15; // Low albedo (0.05-0.2)
        asteroid.softening_length = compute_softening(radius);
        asteroid.compute_derived();
        
        sim.add_body(asteroid);
    }
    
    sim.finalize_derived();
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// DENSE STAR CLUSTER PRESET
// ═══════════════════════════════════════════════════════════════════════════

/// Create a dense star cluster simulation
/// 
/// Configuration:
/// - `star_count` equal-mass stars (solar mass)
/// - Plummer sphere spatial distribution
/// - Virialized velocities (virial ratio Q ≈ 0.5)
/// 
/// The cluster is self-gravitating with no external potential.
/// Total mass = star_count × M_SUN
/// Scale radius chosen to give ~1 pc core radius
pub fn create_star_cluster(seed: u64, star_count: usize) -> Simulation {
    let mut sim = Simulation::new(seed);
    let mut rng = Pcg32::new(seed);
    
    // Cluster parameters
    let star_mass = M_SUN;                    // Each star is 1 solar mass
    let total_mass = star_mass * star_count as f64;
    let scale_radius = 3.086e16;              // ~1 parsec Plummer scale radius
    
    // For virial equilibrium: 2K + U = 0
    // K = 0.5 × M × σᵥ²
    // U = -3πGM²/(64a) for Plummer sphere
    // σᵥ² = (3π/64) × G × M / a
    let velocity_dispersion = ((3.0 * PI / 64.0) * G * total_mass / scale_radius).sqrt();
    
    // OBAFGKM spectral type table: (weight, T_min, T_max, mass/M☉, radius/R☉, luminosity/L☉)
    // Weights approximate a Salpeter-like IMF (more low-mass stars)
    let spectral_types: [(f64, f64, f64, f64, f64, f64); 7] = [
        (0.01, 30000.0, 50000.0, 20.0,  8.0, 100000.0), // O
        (0.05, 10000.0, 30000.0,  5.0,  3.5,    500.0),  // B
        (0.08,  7500.0, 10000.0,  2.0,  1.7,     10.0),  // A
        (0.12,  6000.0,  7500.0,  1.3,  1.3,      3.0),  // F
        (0.20,  5200.0,  6000.0,  1.0,  1.0,      1.0),  // G
        (0.25,  3700.0,  5200.0,  0.7,  0.8,      0.3),  // K
        (0.29,  2400.0,  3700.0,  0.3,  0.4,      0.04), // M
    ];
    let total_weight: f64 = spectral_types.iter().map(|s| s.0).sum();
    
    for i in 0..star_count {
        // Sample position from Plummer sphere
        let r = sample_plummer_radius(&mut rng, scale_radius);
        let (nx, ny, nz) = sample_unit_sphere(&mut rng);
        let position = Vec3::new(r * nx, r * ny, r * nz);
        
        // Sample velocity from isotropic Gaussian (Maxwell-Boltzmann)
        // For virialized system, σ = velocity_dispersion / sqrt(3) per component
        let sigma_1d = velocity_dispersion / 3.0_f64.sqrt();
        let vx = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let vy = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let vz = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let velocity = Vec3::new(vx, vy, vz);
        
        let name = format!("Star_{}", i + 1);
        
        // Sample spectral type from weighted distribution
        let mut roll = rng.next_f64() * total_weight;
        let mut spec = &spectral_types[6]; // default to M
        for s in &spectral_types {
            roll -= s.0;
            if roll <= 0.0 {
                spec = s;
                break;
            }
        }
        let (_, t_min, t_max, mass_frac, radius_frac, lum_frac) = *spec;
        
        let this_mass = star_mass * mass_frac;
        let this_radius = R_SUN * radius_frac;
        let star_id = sim.add_star(&name, this_mass, this_radius);
        if let Some(star) = sim.get_body_mut(star_id) {
            star.position = position;
            star.velocity = velocity;
            star.luminosity = L_SUN * lum_frac * (0.8 + rng.next_f64() * 0.4);
            star.effective_temperature = t_min + rng.next_f64() * (t_max - t_min);
            star.rotation_rate = OMEGA_SUN * (0.5 + rng.next_f64()); // 0.5-1.5 × solar
            star.seed = seed.wrapping_add(i as u64);
            star.metallicity = sample_gaussian(&mut rng, 0.0, 0.3); // Solar ± 0.3 dex
            star.age = AGE_SUN * (0.1 + rng.next_f64() * 1.8); // 0.5-9 Gyr
            star.softening_length = R_SUN * 100.0; // Larger softening for cluster dynamics
            star.compute_derived();
        }
    }
    
    // Recenter to center of mass (should already be close to zero)
    recenter_to_barycenter(&mut sim);
    
    // Set appropriate timestep for cluster dynamics
    // Crossing time ~ R / σ ~ 1 pc / 10 km/s ~ 10^5 years
    sim.set_dt(SECONDS_PER_YEAR * 100.0); // 100 year timestep
    sim.set_substeps(4);
    
    sim.finalize_derived();
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// STRESS TEST PRESET
// ═══════════════════════════════════════════════════════════════════════════

/// Create a configurable stress test simulation for benchmarking.
///
/// Uses a fixed, deterministic seed internally so that results are always
/// reproducible regardless of the `seed` parameter — the outer seed is
/// only used for the Simulation PRNG, the body generation always uses
/// seed `0xBENCH` for exact replicability.
///
/// Configuration:
/// - `star_count`     stars in a Plummer-sphere cluster (IMF-weighted)
/// - `planet_count`   planets placed in circular orbits around nearest star
/// - `asteroid_count` asteroids in a belt-like toroidal distribution
///
/// The system is always recentered to the barycentric frame.
/// Default timestep: 1 s, substeps: 4 (suitable for 1 s/s real-time).
pub fn create_stress_test(
    seed: u64,
    star_count: usize,
    planet_count: usize,
    asteroid_count: usize,
) -> Simulation {
    let mut sim = Simulation::new(seed);

    // Deterministic RNG for body generation — always the same bodies
    let bench_seed: u64 = 0xBE9C4;
    let mut rng = Pcg32::new(bench_seed);

    // ── Stars ────────────────────────────────────────────────────────────
    // Plummer sphere with IMF-weighted spectral types (same table as star cluster)
    let scale_radius = 80.0 * AU; // Compact cluster (~80 AU scale radius)

    // OBAFGKM spectral types: (weight, T_min, T_max, mass/M☉, radius/R☉, luminosity/L☉)
    let spectral_types: [(f64, f64, f64, f64, f64, f64); 7] = [
        (0.01, 30000.0, 50000.0, 20.0,  8.0, 100000.0), // O
        (0.05, 10000.0, 30000.0,  5.0,  3.5,    500.0),  // B
        (0.08,  7500.0, 10000.0,  2.0,  1.7,     10.0),  // A
        (0.12,  6000.0,  7500.0,  1.3,  1.3,      3.0),  // F
        (0.20,  5200.0,  6000.0,  1.0,  1.0,      1.0),  // G
        (0.25,  3700.0,  5200.0,  0.7,  0.8,      0.3),  // K
        (0.29,  2400.0,  3700.0,  0.3,  0.4,      0.04), // M
    ];
    let total_weight: f64 = spectral_types.iter().map(|s| s.0).sum();

    // Store star positions/masses for planet placement
    let mut star_positions: Vec<Vec3> = Vec::with_capacity(star_count);
    let mut star_masses: Vec<f64> = Vec::with_capacity(star_count);

    for i in 0..star_count {
        let r = sample_plummer_radius(&mut rng, scale_radius);
        let (nx, ny, nz) = sample_unit_sphere(&mut rng);
        let position = Vec3::new(r * nx, r * ny, r * nz);

        // Velocity dispersion for virial equilibrium
        let total_star_mass = M_SUN * star_count as f64; // Approximate
        let v_disp = ((3.0 * PI / 64.0) * G * total_star_mass / scale_radius).sqrt();
        let sigma_1d = v_disp / 3.0_f64.sqrt();
        let vx = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let vy = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let vz = sample_gaussian(&mut rng, 0.0, sigma_1d);
        let velocity = Vec3::new(vx, vy, vz);

        // Sample spectral type
        let mut roll = rng.next_f64() * total_weight;
        let mut spec = &spectral_types[6]; // default M
        for s in &spectral_types {
            roll -= s.0;
            if roll <= 0.0 {
                spec = s;
                break;
            }
        }
        let (_, t_min, t_max, mass_frac, radius_frac, lum_frac) = *spec;
        let this_mass = M_SUN * mass_frac;
        let this_radius = R_SUN * radius_frac;

        let name = format!("Star_{}", i + 1);
        let star_id = sim.add_star(&name, this_mass, this_radius);
        if let Some(star) = sim.get_body_mut(star_id) {
            star.position = position;
            star.velocity = velocity;
            star.luminosity = L_SUN * lum_frac * (0.8 + rng.next_f64() * 0.4);
            star.effective_temperature = t_min + rng.next_f64() * (t_max - t_min);
            star.rotation_rate = OMEGA_SUN * (0.5 + rng.next_f64());
            star.seed = bench_seed.wrapping_add(i as u64);
            star.metallicity = sample_gaussian(&mut rng, 0.0, 0.3);
            star.age = AGE_SUN * (0.1 + rng.next_f64() * 1.8);
            star.softening_length = R_SUN * 50.0;
            star.compute_derived();
        }

        star_positions.push(position);
        star_masses.push(this_mass);
    }

    // ── Planets ──────────────────────────────────────────────────────────
    // Each planet orbits the nearest star in a random circular orbit
    for i in 0..planet_count {
        // Pick a host star (round-robin with jitter for variety)
        let host_idx = if star_count > 0 { i % star_count } else { 0 };
        let host_pos = if star_count > 0 { star_positions[host_idx] } else { Vec3::ZERO };
        let host_mass = if star_count > 0 { star_masses[host_idx] } else { M_SUN };
        let mu = G * host_mass;

        // Semi-major axis: log-uniform between 0.3 AU and 30 AU
        let log_a_min = (0.3 * AU).ln();
        let log_a_max = (30.0 * AU).ln();
        let semi_major = (log_a_min + rng.next_f64() * (log_a_max - log_a_min)).exp();

        // Circular velocity
        let v_circ = (mu / semi_major).sqrt();

        // Random orbital orientation (inclination up to 15°, random Ω and ω)
        let inc = sample_rayleigh(&mut rng, 5.0 * PI / 180.0).min(15.0 * PI / 180.0);
        let omega = rng.next_f64() * 2.0 * PI; // longitude of ascending node
        let theta = rng.next_f64() * 2.0 * PI; // true anomaly (position in orbit)

        // Position in orbital plane then rotate
        let x_orb = semi_major * theta.cos();
        let y_orb = semi_major * theta.sin();

        // Rotate by inclination about x, then by Ω about z
        let x1 = x_orb;
        let y1 = y_orb * inc.cos();
        let z1 = y_orb * inc.sin();
        let x_rot = x1 * omega.cos() - y1 * omega.sin();
        let y_rot = x1 * omega.sin() + y1 * omega.cos();
        let z_rot = z1;

        let pos = host_pos + Vec3::new(x_rot, y_rot, z_rot);

        // Velocity perpendicular to position in orbital plane
        let vx_orb = -v_circ * theta.sin();
        let vy_orb = v_circ * theta.cos();
        let vx1 = vx_orb;
        let vy1 = vy_orb * inc.cos();
        let vz1 = vy_orb * inc.sin();
        let vx_rot = vx1 * omega.cos() - vy1 * omega.sin();
        let vy_rot = vx1 * omega.sin() + vy1 * omega.cos();
        let vz_rot = vz1;

        // Add host star's velocity for proper frame
        let host_vel = if star_count > 0 {
            if let Some(host) = sim.get_body(host_idx as u32) {
                host.velocity
            } else {
                Vec3::ZERO
            }
        } else {
            Vec3::ZERO
        };
        let vel = host_vel + Vec3::new(vx_rot, vy_rot, vz_rot);

        // Planet mass: log-uniform from super-Earth to super-Jupiter
        let log_m_min = (0.5 * M_EARTH).ln();
        let log_m_max = (5.0 * M_JUPITER).ln();
        let mass = (log_m_min + rng.next_f64() * (log_m_max - log_m_min)).exp();

        // Radius from mass (rough scaling)
        let radius = if mass < 10.0 * M_EARTH {
            // Rocky: R ∝ M^0.27
            R_EARTH * (mass / M_EARTH).powf(0.27)
        } else {
            // Gas giant: R ∝ M^0.06 (nearly constant around Jupiter radius)
            R_JUPITER * (mass / M_JUPITER).powf(0.06)
        };

        let name = format!("Planet_{}", i + 1);
        let mut planet = Body::new(0, &name, BodyType::Planet, mass, radius, pos, vel);
        planet.semi_major_axis = semi_major;
        planet.eccentricity = 0.0; // Circular
        planet.inclination = inc;
        planet.parent_id = Some(host_idx as u32);
        planet.composition = if mass < 10.0 * M_EARTH {
            PlanetComposition::Rocky
        } else {
            PlanetComposition::GasGiant
        };
        planet.albedo = 0.1 + rng.next_f64() * 0.5;
        planet.axial_tilt = rng.next_f64() * 30.0 * PI / 180.0;
        planet.rotation_rate = 2.0 * PI / (SECONDS_PER_DAY * (0.4 + rng.next_f64() * 2.0));
        planet.seed = bench_seed.wrapping_add(1000 + i as u64);
        let gray = 0x60 + (rng.next_bounded(0x80) as u32);
        let r_col = (gray + rng.next_bounded(0x30) as u32).min(0xFF);
        let g_col = gray;
        let b_col = (gray.saturating_sub(rng.next_bounded(0x30) as u32)).max(0x30);
        planet.color = hex_to_rgb((r_col << 16) | (g_col << 8) | b_col);
        planet.softening_length = compute_softening(radius);
        planet.compute_derived();
        sim.add_body(planet);
    }

    // ── Asteroids ────────────────────────────────────────────────────────
    // Toroidal belt around the system barycenter
    if asteroid_count > 0 {
        let belt_inner = 35.0 * AU;
        let belt_outer = 50.0 * AU;
        let total_central_mass: f64 = star_masses.iter().sum::<f64>() + M_SUN; // fallback

        for i in 0..asteroid_count {
            let semi_major = rng.next_f64_range(belt_inner, belt_outer);
            let ecc = sample_rayleigh(&mut rng, 0.08).min(0.3);
            let inc = sample_rayleigh(&mut rng, 8.0 * PI / 180.0);
            let lon_asc = rng.next_f64() * 2.0 * PI;
            let arg_peri = rng.next_f64() * 2.0 * PI;
            let mean_anom = rng.next_f64() * 2.0 * PI;

            let elements = OrbitalElements {
                semi_major_axis: semi_major,
                eccentricity: ecc,
                inclination: inc,
                longitude_asc_node: lon_asc,
                arg_periapsis: arg_peri,
                mean_anomaly: mean_anom,
            };

            let mu_central = G * total_central_mass;
            let (pos, vel) = elements.to_cartesian(mu_central);

            let mass = sample_power_law(&mut rng, 1e12, 1e18, 2.3);
            let density = 2500.0;
            let volume = mass / density;
            let radius = (3.0 * volume / (4.0 * PI)).powf(1.0 / 3.0);

            let name = format!("Asteroid_{}", i + 1);
            let mut asteroid = Body::new(0, &name, BodyType::Asteroid, mass, radius, pos, vel);
            asteroid.semi_major_axis = semi_major;
            asteroid.eccentricity = ecc;
            asteroid.inclination = inc;
            let g = 0x60 + (rng.next_bounded(0x40) as u32);
            asteroid.color = hex_to_rgb((g << 16) | (g << 8) | g);
            asteroid.composition = PlanetComposition::Rocky;
            asteroid.albedo = 0.05 + rng.next_f64() * 0.15;
            asteroid.softening_length = compute_softening(radius);
            asteroid.compute_derived();
            sim.add_body(asteroid);
        }
    }

    // Recenter to barycentric frame
    recenter_to_barycenter(&mut sim);

    // 1 s timestep — suitable for 1 s/s real-time benchmarking
    sim.set_dt(1.0);
    sim.set_substeps(4);

    sim.finalize_derived();
    sim
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_presets() {
        let presets = [
            Preset::SunEarthMoon,
            Preset::InnerSolarSystem,
            Preset::FullSolarSystem,
            Preset::FullSolarSystemII,
            Preset::JupiterSystem,
            Preset::SaturnSystem,
            Preset::AlphaCentauri,
            Preset::Trappist1,
            Preset::BinaryPulsar,
            Preset::IntegratorTest1,
            Preset::IntegratorTest2,
            Preset::IntegratorTest3,
            // Note: AsteroidBelt, StarCluster, and StressTest are tested separately due to body count
        ];
        
        for preset in presets {
            let sim = preset.create(42);
            assert!(sim.body_count() >= 2, "Preset {:?} has fewer than 2 bodies", preset);
            
            // Verify energy is negative (gravitationally bound system)
            let energy = sim.total_energy();
            assert!(energy < 0.0, "Preset {:?} has positive energy", preset);
        }
    }
    
    #[test]
    fn test_full_solar_system_ii_orbital_elements() {
        let sim = create_full_solar_system_ii(42, false);
        let bodies = sim.bodies();
        
        // Verify all 11 bodies present (Sun + 8 planets + Pluto + Moon)
        assert_eq!(bodies.len(), 11, "Expected 11 bodies");
        
        // Verify Mercury uses corrected semi-major axis
        let mercury = bodies.iter().find(|b| b.name == "Mercury").unwrap();
        // Semi-major axis should be within 0.05% of canonical 5.7909227e10 m
        let merc_a_error = ((mercury.semi_major_axis - 5.7909227e10).abs() / 5.7909227e10) * 100.0;
        assert!(merc_a_error < 0.05, "Mercury semi-major axis error: {:.4}%", merc_a_error);
        // Mercury should have inclination set (7° = ~0.122 rad)
        assert!(mercury.inclination > 0.1, "Mercury inclination not set: {}", mercury.inclination);
        
        // Verify Saturn uses corrected semi-major axis
        let saturn = bodies.iter().find(|b| b.name == "Saturn").unwrap();
        let sat_a_error = ((saturn.semi_major_axis - 1.4335290e12).abs() / 1.4335290e12) * 100.0;
        assert!(sat_a_error < 0.05, "Saturn semi-major axis error: {:.4}%", sat_a_error);
        // Saturn should have inclination set (2.485° = ~0.043 rad)
        assert!(saturn.inclination > 0.04, "Saturn inclination not set: {}", saturn.inclination);
        
        // Verify Moon is properly positioned relative to Earth
        let earth = bodies.iter().find(|b| b.name == "Earth").unwrap();
        let moon = bodies.iter().find(|b| b.name == "Moon").unwrap();
        let moon_earth_dist = (moon.position - earth.position).length();
        // Moon should be ~384,400 km from Earth (within 10%)
        let expected_moon_dist = 3.844e8;
        let moon_dist_error = ((moon_earth_dist - expected_moon_dist).abs() / expected_moon_dist) * 100.0;
        assert!(moon_dist_error < 10.0, "Moon distance from Earth error: {:.2}%", moon_dist_error);
        
        // Verify per-body softening is set (non-zero)
        for body in bodies {
            assert!(body.softening_length > 0.0, 
                "Body {} should have explicit softening, got {}", body.name, body.softening_length);
        }
        
        println!("✓ Full Solar System II orbital elements validated");
    }
    
    #[test]
    fn test_full_solar_system_ii_barycentric() {
        let sim_helio = create_full_solar_system_ii(42, false);
        let sim_bary = create_full_solar_system_ii(42, true);
        
        // In barycentric frame, system momentum should be closer to zero
        use crate::force::compute_total_momentum;
        
        let mom_helio = compute_total_momentum(sim_helio.bodies());
        let mom_bary = compute_total_momentum(sim_bary.bodies());
        
        // Barycentric momentum magnitude should be much smaller
        assert!(mom_bary.length() < mom_helio.length() * 0.01,
            "Barycentric momentum {} should be << heliocentric {}",
            mom_bary.length(), mom_helio.length());
        
        println!("✓ Barycentric initialization validated");
        println!("  Heliocentric momentum: {:.3e} kg·m/s", mom_helio.length());
        println!("  Barycentric momentum:  {:.3e} kg·m/s", mom_bary.length());
    }
    
    #[test]
    fn test_kepler_to_cartesian() {
        // Test Earth's orbital elements conversion
        let mu_sun = G * M_SUN;
        let (pos, vel) = j2000::EARTH.to_cartesian(mu_sun);
        
        // Earth should be approximately 1 AU from origin
        let r = pos.length();
        let r_au = r / AU;
        assert!((r_au - 1.0).abs() < 0.02, "Earth should be ~1 AU, got {} AU", r_au);
        
        // Earth's orbital velocity should be ~29.78 km/s
        let v = vel.length();
        let expected_v = 29784.0;
        let v_error = ((v - expected_v).abs() / expected_v) * 100.0;
        assert!(v_error < 5.0, "Earth velocity error: {:.2}% (got {} m/s)", v_error, v);
        
        // Verify orbital period (should be ~365.25 days)
        let period_s = j2000::EARTH.orbital_period(mu_sun);
        let period_days = period_s / SECONDS_PER_DAY;
        let period_error = ((period_days - 365.25636).abs() / 365.25636) * 100.0;
        assert!(period_error < 0.01, "Earth period error: {:.4}% (got {} days)", period_error, period_days);
        
        println!("✓ Kepler→Cartesian conversion validated");
        println!("  Earth distance: {:.6} AU", r_au);
        println!("  Earth velocity: {:.2} m/s", v);
        println!("  Earth period: {:.4} days", period_days);
    }
    
    #[test]
    fn test_sun_earth_moon_positions() {
        let sim = create_sun_earth_moon(42);
        let bodies = sim.bodies();
        
        // Sun should be at origin
        let sun = &bodies[0];
        assert_eq!(sun.name, "Sun");
        assert!(sun.position.x.abs() < 1.0, "Sun X not at origin: {}", sun.position.x);
        
        // Earth should be at ~1 AU
        let earth = &bodies[1];
        assert_eq!(earth.name, "Earth");
        let earth_dist = earth.position.length();
        println!("Earth position: {:?}, distance: {} AU", earth.position, earth_dist / AU);
        assert!((earth_dist - AU).abs() < 1e6, "Earth not at 1 AU: {}", earth_dist / AU);
        
        // Moon should be ~384,400 km from Earth
        let moon = &bodies[2];
        assert_eq!(moon.name, "Moon");
        let moon_to_earth = (moon.position - earth.position).length();
        println!("Moon position: {:?}", moon.position);
        println!("Moon distance from Earth: {} km", moon_to_earth / 1000.0);
        assert!((moon_to_earth - 3.844e8).abs() < 1e6, "Moon not at correct distance: {} km", moon_to_earth / 1000.0);
    }
    
    #[test]
    fn test_asteroid_belt_preset() {
        // Test with a small number for speed
        let sim = create_asteroid_belt(42, 100);
        
        // Full Solar System II has 11 bodies, + 4 dwarf planets + 100 asteroids = 115
        let expected_min = 11 + 4 + 100;
        assert!(
            sim.body_count() >= expected_min,
            "Asteroid belt should have at least {} bodies, got {}",
            expected_min,
            sim.body_count()
        );
        
        // Verify some asteroids are in the correct orbital range
        let bodies = sim.bodies();
        let mut asteroid_count = 0;
        for body in bodies {
            if body.name.starts_with("Asteroid_") {
                asteroid_count += 1;
                // Check semi-major axis is in asteroid belt range (2.1-3.3 AU)
                let a = body.semi_major_axis;
                assert!(
                    a >= 2.0 * AU && a <= 3.5 * AU,
                    "Asteroid {} has a={:.2} AU, outside belt range",
                    body.name,
                    a / AU
                );
            }
        }
        assert_eq!(asteroid_count, 100, "Should have exactly 100 generated asteroids");
        
        // Verify energy is negative (gravitationally bound)
        let energy = sim.total_energy();
        assert!(energy < 0.0, "Asteroid belt should be gravitationally bound");
        
        println!("✓ Asteroid belt preset validated");
        println!("  Total bodies: {}", sim.body_count());
        println!("  Energy: {:.3e} J", energy);
    }
    
    #[test]
    fn test_star_cluster_preset() {
        // Test with a small number for speed
        let sim = create_star_cluster(42, 50);
        
        assert_eq!(
            sim.body_count(),
            50,
            "Star cluster should have exactly 50 stars, got {}",
            sim.body_count()
        );
        
        // Verify all bodies are stars
        let bodies = sim.bodies();
        for body in bodies {
            assert_eq!(
                body.body_type,
                BodyType::Star,
                "All cluster members should be stars"
            );
        }
        
        // Verify center of mass is near origin (barycentric)
        let mut com = Vec3::ZERO;
        let mut total_mass = 0.0;
        for body in sim.bodies() {
            com = com + body.position * body.mass;
            total_mass += body.mass;
        }
        com = com / total_mass;
        let com_offset = com.length();
        assert!(
            com_offset < 1e10, // Should be very close to zero
            "Cluster center of mass should be at origin, offset: {:.3e} m",
            com_offset
        );
        
        // Verify energy is negative (gravitationally bound)
        let energy = sim.total_energy();
        assert!(energy < 0.0, "Star cluster should be gravitationally bound");
        
        println!("✓ Star cluster preset validated");
        println!("  Total stars: {}", sim.body_count());
        println!("  COM offset: {:.3e} m", com_offset);
        println!("  Energy: {:.3e} J", energy);
    }
}
