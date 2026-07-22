//! World Presets
//!
//! Pre-configured solar system simulations with accurate orbital data.
//! All values in SI units (meters, kilograms, seconds).

use crate::body::{Atmosphere, Body, BodyType, PlanetComposition, RingParameters};
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
    
    /// Mercury J2000 orbital elements
    pub const MERCURY: OrbitalElements = OrbitalElements {
        semi_major_axis: 5.7909227e10,       // 0.38709927 AU
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
    
    /// Saturn J2000 orbital elements
    pub const SATURN: OrbitalElements = OrbitalElements {
        semi_major_axis: 1.4335290e12,       // 9.58201720 AU
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

/// Translate all body states by a constant position/velocity offset.
/// Useful for switching between heliocentric and barycentric frames.
fn translate_simulation_frame(sim: &mut Simulation, position_offset: Vec3, velocity_offset: Vec3) {
    let body_count = sim.bodies().len();
    for i in 0..body_count {
        if let Some(body) = sim.get_body_mut(i as u32) {
            body.position = body.position + position_offset;
            body.velocity = body.velocity + velocity_offset;
        }
    }
}

/// Rebuild a simulation with bodies ordered by heliocentric distance.
/// The Sun is always first; all other bodies are sorted by instantaneous
/// distance from the Sun at epoch.
fn reorder_by_heliocentric_distance(sim: &Simulation, seed: u64) -> Simulation {
    let bodies = sim.bodies();
    if bodies.is_empty() {
        return Simulation::new(seed);
    }

    let sun_position = bodies
        .iter()
        .find(|b| b.name == "Sun")
        .map(|b| b.position)
        .unwrap_or(Vec3::ZERO);

    let mut sortable: Vec<(Body, f64, u32, Option<u32>)> = bodies
        .iter()
        .cloned()
        .map(|body| {
            let old_id = body.id;
            let old_parent = body.parent_id;
            let distance = if body.name == "Sun" {
                -1.0
            } else {
                (body.position - sun_position).length()
            };
            (body, distance, old_id, old_parent)
        })
        .collect();

    sortable.sort_by(|a, b| {
        a.1
            .partial_cmp(&b.1)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.0.name.cmp(&b.0.name))
    });

    let mut rebuilt = Simulation::new(seed);
    let mut id_map: std::collections::HashMap<u32, u32> =
        std::collections::HashMap::with_capacity(sortable.len());
    let mut parent_links: Vec<(u32, Option<u32>)> = Vec::with_capacity(sortable.len());

    for (mut body, _, old_id, old_parent) in sortable {
        body.parent_id = None;
        let new_id = rebuilt.add_body(body);
        id_map.insert(old_id, new_id);
        parent_links.push((new_id, old_parent));
    }

    for (new_id, old_parent) in parent_links {
        if let Some(parent_old_id) = old_parent {
            if let Some(&parent_new_id) = id_map.get(&parent_old_id) {
                if let Some(body) = rebuilt.get_body_mut(new_id) {
                    body.parent_id = Some(parent_new_id);
                }
            }
        }
    }

    rebuilt.finalize_derived();
    rebuilt
}

/// Available preset configurations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Preset {
    /// Sun, Earth, and Moon
    SunEarthMoon,
    /// Mercury, Venus, Earth, Mars
    InnerSolarSystem,
    /// Full Solar System II - J2000 orbital elements with inclinations
    /// Uses canonical JPL values with proper Kepler→Cartesian conversion
    FullSolarSystemII,
    /// Full Solar System III (2026) — JPL HORIZONS ephemeris at 2026-01-01
    /// 40 bodies: Sun, 8 planets, Pluto, 26 moons, 3 asteroids, 5 comets
    FullSolarSystemIII,
    /// Full Solar System IV (2026) — strict HORIZONS SSB vectors at 2026-01-01
    /// 40 bodies ordered by heliocentric distance; barycentric by default
    FullSolarSystemIV,
    /// Solar System + Alpha Centauri A/B/C true scale system
    SolarCentauriI,
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
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, false),
            Preset::FullSolarSystemIII => create_full_solar_system_iii(seed, false),
            Preset::FullSolarSystemIV => create_full_solar_system_iv(seed, true),
            Preset::SolarCentauriI => create_solar_centauri_i(seed, false),
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
    /// (center-of-mass at origin, zero total momentum)
    pub fn create_barycentric(&self, seed: u64) -> Simulation {
        match self {
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, true),
            Preset::FullSolarSystemIII => create_full_solar_system_iii(seed, true),
            Preset::FullSolarSystemIV => create_full_solar_system_iv(seed, true),
            Preset::SolarCentauriI => create_solar_centauri_i(seed, true),
            Preset::AsteroidBelt => {
                // AsteroidBelt delegates to FSSII(barycentric=true) internally,
                // but we recenter again to include the asteroids
                let mut sim = create_asteroid_belt(seed, 5000);
                recenter_to_barycenter(&mut sim);
                sim
            },
            Preset::StarCluster => {
                // Star clusters are already recentered internally
                create_star_cluster(seed, 2000)
            },
            Preset::StressTest => {
                // Stress test is already recentered internally
                create_stress_test(seed, 30, 100, 0)
            },
            // All other presets: create normally then recenter to barycentric frame
            _ => {
                let mut sim = self.create(seed);
                recenter_to_barycenter(&mut sim);
                sim
            }
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
    saturn.rings = Some(RingParameters {
        inner_radius_mult: 1.11,
        outer_radius_mult: 7.96,
        texture_preset: "saturn".to_string(),
        base_opacity: 0.9,
    });
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
    mars.composition = PlanetComposition::RockyCO2;
        mars.albedo = 0.25;
        mars.atmosphere = Some(Atmosphere::mars_like());
        mars.compute_derived();
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

    sim.finalize_derived();
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
    jupiter.softening_length = compute_softening(6.9911e7);
    jupiter.compute_derived();
    let jup_id = sim.add_body(jupiter);
    
    // Galilean moons (all tidally locked — rotation rate = orbital period)
    let mut io = Body::new(
        0, "Io", BodyType::Moon,
        8.9319e22, 1.8216e6,
        Vec3::new(4.217e8, 0.0, 0.0),
        Vec3::new(0.0, 17334.0, 0.0),
    );
    io.rotation_rate = 4.1106e-5;             // 1.769 day synchronous
    io.mean_surface_temperature = 130.0;      // ~130 K (volcanic hotspots much higher)
    io.seed = seed.wrapping_add(1);
    io.semi_major_axis = 4.217e8;
    io.eccentricity = 0.0041;
    io.parent_id = Some(jup_id);
    io.color = hex_to_rgb(0xc8b84a);
    io.composition = PlanetComposition::Rocky;
    io.albedo = 0.63;
    io.softening_length = compute_softening(1.8216e6);
    io.compute_derived();
    sim.add_body(io);
    
    let mut europa = Body::new(
        0, "Europa", BodyType::Moon,
        4.7998e22, 1.5608e6,
        Vec3::new(6.709e8, 0.0, 0.0),
        Vec3::new(0.0, 13740.0, 0.0),
    );
    europa.rotation_rate = 2.0478e-5;            // 3.551 day synchronous
    europa.mean_surface_temperature = 102.0;     // ~102 K
    europa.seed = seed.wrapping_add(2);
    europa.semi_major_axis = 6.709e8;
    europa.eccentricity = 0.0094;
    europa.parent_id = Some(jup_id);
    europa.color = hex_to_rgb(0xb8a090);
    europa.composition = PlanetComposition::Rocky;
    europa.albedo = 0.67;
    europa.softening_length = compute_softening(1.5608e6);
    europa.compute_derived();
    sim.add_body(europa);
    
    let mut ganymede = Body::new(
        0, "Ganymede", BodyType::Moon,
        1.4819e23, 2.6341e6,
        Vec3::new(1.0704e9, 0.0, 0.0),
        Vec3::new(0.0, 10880.0, 0.0),
    );
    ganymede.rotation_rate = 1.0164e-5;            // 7.155 day synchronous
    ganymede.mean_surface_temperature = 110.0;     // ~110 K
    ganymede.seed = seed.wrapping_add(3);
    ganymede.semi_major_axis = 1.0704e9;
    ganymede.eccentricity = 0.0013;
    ganymede.parent_id = Some(jup_id);
    ganymede.color = hex_to_rgb(0x9a8a7a);
    ganymede.composition = PlanetComposition::Rocky;
    ganymede.albedo = 0.43;
    ganymede.softening_length = compute_softening(2.6341e6);
    ganymede.compute_derived();
    sim.add_body(ganymede);
    
    let mut callisto = Body::new(
        0, "Callisto", BodyType::Moon,
        1.0759e23, 2.4103e6,
        Vec3::new(1.8827e9, 0.0, 0.0),
        Vec3::new(0.0, 8204.0, 0.0),
    );
    callisto.rotation_rate = 4.3574e-6;            // 16.689 day synchronous
    callisto.mean_surface_temperature = 134.0;     // ~134 K
    callisto.seed = seed.wrapping_add(4);
    callisto.semi_major_axis = 1.8827e9;
    callisto.eccentricity = 0.0074;
    callisto.parent_id = Some(jup_id);
    callisto.color = hex_to_rgb(0x6a5a4a);
    callisto.composition = PlanetComposition::Rocky;
    callisto.albedo = 0.17;
    callisto.softening_length = compute_softening(2.4103e6);
    callisto.compute_derived();
    sim.add_body(callisto);
    
    sim.finalize_derived();
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
    saturn.rings = Some(RingParameters {
        inner_radius_mult: 1.11,
        outer_radius_mult: 7.96,
        texture_preset: "saturn".to_string(),
        base_opacity: 0.9,
    });
    saturn.rotation_rate = 1.6378e-4;
    saturn.axial_tilt = 0.4665;
    saturn.mean_surface_temperature = 134.0;
    saturn.seed = seed.wrapping_add(0);
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.342;
    saturn.softening_length = compute_softening(5.8232e7);
    saturn.compute_derived();
    let sat_id = sim.add_body(saturn);
    
    // Titan — the only moon with a substantial atmosphere
    let mut titan = Body::new(
        0, "Titan", BodyType::Moon,
        1.3452e23, 2.5747e6,
        Vec3::new(1.2218e9, 0.0, 0.0),
        Vec3::new(0.0, 5570.0, 0.0),
    );
    titan.rotation_rate = 4.5608e-6;          // 15.945 day synchronous
    titan.mean_surface_temperature = 94.0;    // 94 K
    titan.seed = seed.wrapping_add(1);
    titan.semi_major_axis = 1.2218e9;
    titan.eccentricity = 0.0288;
    titan.parent_id = Some(sat_id);
    titan.color = hex_to_rgb(0xc8a050);
    titan.composition = PlanetComposition::Rocky;
    titan.albedo = 0.22;
    titan.softening_length = compute_softening(2.5747e6);
    titan.atmosphere = Some(Atmosphere {
        scale_height: 21_000.0,                       // ~21 km (canonical FSSIII)
        rayleigh_coefficients: [2.0e-6, 5.0e-6, 1.2e-5],
        mie_coefficient: 3.0e-5,                      // Dense tholin haze
        mie_direction: 0.76,
        height: 600_000.0,                            // ~600 km effective atmosphere
        mie_color: [0.85, 0.55, 0.2],                 // Tholin haze — deep orange-brown
    });
    titan.compute_derived();
    sim.add_body(titan);
    
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
        let mut moon = Body::new(
            0, name, BodyType::Moon,
            mass, radius,
            Vec3::new(dist, 0.0, 0.0),
            Vec3::new(0.0, vel, 0.0),
        );
        moon.seed = seed.wrapping_add(seed_off);
        moon.semi_major_axis = dist;
        moon.parent_id = Some(sat_id);
        moon.color = hex_to_rgb(col);
        moon.composition = PlanetComposition::Rocky;
        moon.albedo = 0.5; // generic icy moon albedo
        moon.softening_length = compute_softening(radius);
        moon.compute_derived();
        sim.add_body(moon);
    }
    
    sim.finalize_derived();
    sim
}

/// Alpha Centauri binary star system
/// Proper elliptical orbit: a=23.52 AU, e=0.5179, i=79.205°, P≈79.91 yr
pub fn create_alpha_centauri(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Stellar parameters
    let m_a = 1.1055 * M_SUN;
    let m_b = 0.9373 * M_SUN;
    let r_a = 1.2234 * R_SUN;
    let r_b = 0.8632 * R_SUN;
    let total_mass = m_a + m_b;
    let mu = G * total_mass;
    
    // Orbital elements (Pourbaix et al. 2016)
    let elements = OrbitalElements {
        semi_major_axis: 23.52 * AU,             // 23.52 AU
        eccentricity: 0.5179,
        inclination: 79.205 * PI / 180.0,        // 79.205°
        longitude_asc_node: 204.85 * PI / 180.0, // 204.85°
        arg_periapsis: 231.65 * PI / 180.0,      // 231.65°
        mean_anomaly: 0.0,                        // Start at periapsis
    };
    
    // Compute relative orbit state vector
    let (rel_pos, rel_vel) = elements.to_cartesian(mu);
    
    // Distribute around center of mass
    let frac_a = m_b / total_mass; // A orbits at frac_a × relative distance
    let frac_b = m_a / total_mass;
    
    let mut star_a = Body::new(
        0, "Alpha Centauri A", BodyType::Star,
        m_a, r_a,
        rel_pos * (-frac_a),
        rel_vel * (-frac_a),
    );
    star_a.color = hex_to_rgb(0xfff4e6);
    star_a.luminosity = 1.519 * L_SUN;
    star_a.effective_temperature = 5790.0;
    star_a.rotation_rate = OMEGA_SUN * 0.9;
    star_a.seed = seed.wrapping_add(0);
    star_a.metallicity = 0.20;
    star_a.age = 5.3e9 * SECONDS_PER_YEAR;
    star_a.semi_major_axis = elements.semi_major_axis * frac_a;
    star_a.eccentricity = elements.eccentricity;
    star_a.softening_length = compute_softening(r_a);
    star_a.compute_derived();
    sim.add_body(star_a);
    
    // Alpha Centauri B (K1V, cooler orange)
    let mut star_b = Body::new(
        0, "Alpha Centauri B", BodyType::Star,
        m_b, r_b,
        rel_pos * frac_b,
        rel_vel * frac_b,
    );
    star_b.color = hex_to_rgb(0xffd27f);
    star_b.luminosity = 0.5002 * L_SUN;
    star_b.effective_temperature = 5260.0;
    star_b.rotation_rate = OMEGA_SUN * 0.7;
    star_b.seed = seed.wrapping_add(1);
    star_b.metallicity = 0.23;
    star_b.age = 5.3e9 * SECONDS_PER_YEAR;
    star_b.semi_major_axis = elements.semi_major_axis * frac_b;
    star_b.eccentricity = elements.eccentricity;
    star_b.softening_length = compute_softening(r_b);
    star_b.compute_derived();
    sim.add_body(star_b);
    
    sim.finalize_derived();
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
    star.age = 7.6e9 * SECONDS_PER_YEAR; // ~7.6 Gyr
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
/// Proper elliptical orbit: a≈8.8e8 m, e=0.0878, P≈2.45 hr
pub fn create_binary_pulsar(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Two neutron stars in tight orbit
    let m_a = 1.3381 * M_SUN;
    let m_b = 1.2489 * M_SUN;
    let r_neutron = 1.0e4; // ~10 km radius
    let total_mass = m_a + m_b;
    let mu = G * total_mass;
    
    // Orbital elements (Kramer et al. 2021)
    let elements = OrbitalElements {
        semi_major_axis: 8.784e8,                // ~878,400 km
        eccentricity: 0.0878,                    // Small but measurable
        inclination: 0.0,                        // Edge-on relative to us, but arbitrary for sim
        longitude_asc_node: 0.0,
        arg_periapsis: 0.0,
        mean_anomaly: 0.0,                       // Start at periapsis
    };
    
    // Compute relative orbit state vector
    let (rel_pos, rel_vel) = elements.to_cartesian(mu);
    
    // Distribute around center of mass
    let frac_a = m_b / total_mass;
    let frac_b = m_a / total_mass;
    
    let mut pulsar_a = Body::new(
        0, "PSR J0737-3039A", BodyType::Star,
        m_a, r_neutron,
        rel_pos * (-frac_a),
        rel_vel * (-frac_a),
    );
    pulsar_a.color = hex_to_rgb(0xaaaaff);
    pulsar_a.rotation_rate = 276.8;               // 44.07 Hz spin (millisecond pulsar)
    pulsar_a.seed = seed.wrapping_add(0);
    pulsar_a.age = 2.1e8 * SECONDS_PER_YEAR;
    pulsar_a.semi_major_axis = elements.semi_major_axis * frac_a;
    pulsar_a.eccentricity = elements.eccentricity;
    pulsar_a.softening_length = compute_softening(r_neutron);
    pulsar_a.compute_derived();
    sim.add_body(pulsar_a);
    
    let mut pulsar_b = Body::new(
        0, "PSR J0737-3039B", BodyType::Star,
        m_b, r_neutron,
        rel_pos * frac_b,
        rel_vel * frac_b,
    );
    pulsar_b.color = hex_to_rgb(0xffaaff);
    pulsar_b.rotation_rate = 1.76;                // 0.36 Hz spin
    pulsar_b.seed = seed.wrapping_add(1);
    pulsar_b.age = 2.1e8 * SECONDS_PER_YEAR;
    pulsar_b.semi_major_axis = elements.semi_major_axis * frac_b;
    pulsar_b.eccentricity = elements.eccentricity;
    pulsar_b.softening_length = compute_softening(r_neutron);
    pulsar_b.compute_derived();
    sim.add_body(pulsar_b);
    
    sim.finalize_derived();
    sim
}

// ═══════════════════════════════════════════════════════════════════════════
// FULL SOLAR SYSTEM II: J2000 Preset
// ═══════════════════════════════════════════════════════════════════════════

/// Full Solar System II with J2000 orbital elements
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
    
    // ─── Mercury ────────────────────────────────────────────────────────
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
    venus.composition = PlanetComposition::RockyCO2;
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
    
    // ─── Saturn ─────────────────────────────────────────────────────────
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
    saturn.rings = Some(RingParameters {
        inner_radius_mult: 1.11,
        outer_radius_mult: 7.96,
        texture_preset: "saturn".to_string(),
        base_opacity: 0.9,
    });
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
    uranus.rings = Some(RingParameters {
        inner_radius_mult: 1.56,
        outer_radius_mult: 3.90,
        texture_preset: "uranus".to_string(),
        base_opacity: 0.3,
    });
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
    neptune.rings = Some(RingParameters {
        inner_radius_mult: 1.70,
        outer_radius_mult: 2.60,
        texture_preset: "neptune".to_string(),
        base_opacity: 0.15,
    });
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
    let sun_id = sim.add_star("Sun", 1.988409871326422e+30, 6.957e8);
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN;
        sun.effective_temperature = 5772.0;
        sun.rotation_rate = 2.8653290845717256e-6;
        sun.pole_ra = Some(286.13_f64.to_radians());
        sun.pole_dec = Some(63.87_f64.to_radians());
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
        3.3010006367708975e+23, 2439400.0,
        Vec3::new(-32193656906.76167, -61216587982.9846, -2049979952.5798378),
        Vec3::new(33299.122119508844, -20323.193266176917, -4715.026944319222),
    );
    mercury.rotation_rate = 1.24001e-6;
    mercury.axial_tilt = 0.00059;
    mercury.pole_ra = Some(281.01_f64.to_radians());
    mercury.pole_dec = Some(61.45_f64.to_radians());
    mercury.mean_surface_temperature = 440.0;
    mercury.seed = seed.wrapping_add(1);
    mercury.semi_major_axis = 59212300557.43999;
    mercury.eccentricity = 0.1957390377099447;
    mercury.inclination = 6.995740318986847 * deg;
    mercury.longitude_asc_node = 48.593424228867 * deg;
    mercury.arg_periapsis = 29.74575733028552 * deg;
    mercury.mean_anomaly = 156.8214628414177 * deg;
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
        4.867305814842006e+24, 6051840.0,
        Vec3::new(13295847296.279331, -107974115545.99457, -2250558830.319599),
        Vec3::new(34522.7563535162, 4156.129935817115, -1934.8541819271966),
    );
    venus.rotation_rate = -2.9924e-7;
    venus.axial_tilt = 3.0943;
    venus.pole_ra = Some(272.76_f64.to_radians());
    venus.pole_dec = Some(67.16_f64.to_radians());
    venus.mean_surface_temperature = 735.0;
    venus.seed = seed.wrapping_add(2);
    venus.semi_major_axis = 109667353851.7825;
    venus.eccentricity = 0.00144460469378842;
    venus.inclination = 3.392827761961026 * deg;
    venus.longitude_asc_node = 76.64061238860523 * deg;
    venus.arg_periapsis = 256.4097670347575 * deg;
    venus.mean_anomaly = 303.8486165108158 * deg;
    venus.parent_id = Some(sun_id);
    venus.color = hex_to_rgb(0xe6c229);
    venus.composition = PlanetComposition::RockyCO2;
    venus.albedo = 0.77;
    venus.atmosphere = Some(Atmosphere::venus_like());
    venus.softening_length = compute_softening(6.05184e6);
    venus.compute_derived();
    sim.add_body(venus);

    // ─── Earth ──────────────────────────────────────────────────────────
    // Horizons #399
    let mut earth = Body::new(
        0, "Earth", BodyType::Planet,
        5.972168398723462e+24, 6371010.0,
        Vec3::new(-26072138448.161938, 144774673821.01974, -8892861.90574651),
        Vec3::new(-29788.931165648246, -5396.270536820537, 0.4106639513727202),
    );
    earth.atmosphere = Some(Atmosphere::earth_like());
    earth.rotation_rate = 7.292115e-5;
    earth.axial_tilt = AXIAL_TILT_EARTH;
    earth.pole_ra = Some(0.0_f64.to_radians());
    earth.pole_dec = Some(90.0_f64.to_radians());
    earth.mean_surface_temperature = T_SURFACE_EARTH;
    earth.seed = seed.wrapping_add(3);
    earth.semi_major_axis = 147650674422.1825;
    earth.eccentricity = 0.009166999548581222;
    earth.inclination = 0.004242269325986349 * deg;
    earth.longitude_asc_node = 14.76083602234425 * deg;
    earth.arg_periapsis = 66.43751678619198 * deg;
    earth.mean_anomaly = 18.90069218754828 * deg;
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
        7.345789170399893e+22, 1.73753e6,
        Vec3::new(-25927812720.670017, 145104069651.91534, 22860114.43744565),
        Vec3::new(-30793.245303320462, -4975.405328064174, 5.99587524917948),
    );
    moon.rotation_rate = 2.6617e-6;
    moon.axial_tilt = 0.02692;
    moon.pole_ra = Some(269.99_f64.to_radians());
    moon.pole_dec = Some(66.54_f64.to_radians());
    moon.mean_surface_temperature = 250.0;
    moon.seed = seed.wrapping_add(4);
    moon.semi_major_axis = 384_400_000.0;
    moon.eccentricity = 0.07586278949852443;
    moon.inclination = 0.01952857082753733;
    moon.longitude_asc_node = 42.00460263999287 * deg;
    moon.arg_periapsis = 41.38501390659234 * deg;
    moon.mean_anomaly = 14.56870417917833 * deg;
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
        6.41690898850816e+23, 3389920.0,
        Vec3::new(50949994462.28143, -207492548242.01736, -5597537454.939068),
        Vec3::new(24447.152359481024, 7861.165862885534, -434.7434612671703),
    );
    mars.rotation_rate = 7.088218111185524e-5;
    mars.axial_tilt = 0.4396;
    mars.pole_ra = Some(317.68_f64.to_radians());
    mars.pole_dec = Some(52.88_f64.to_radians());
    mars.mean_surface_temperature = 210.0;
    mars.seed = seed.wrapping_add(5);
    mars.semi_major_axis = 229419926126.27258;
    mars.eccentricity = 0.09761065338892279;
    mars.inclination = 1.841533419384498 * deg;
    mars.longitude_asc_node = 49.59249963415456 * deg;
    mars.arg_periapsis = 286.3100390578677 * deg;
    mars.mean_anomaly = 316.1919958872677 * deg;
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
        1.0659e16, 11260.0,
        Vec3::new(50947366239.00896, -207501379431.18384, -5596900585.285694),
        Vec3::new(26276.144888207426, 7238.706660368854, -1422.0976410611206),
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
        1.4762e15, 6200.0,
        Vec3::new(50960858151.2132, -207472045051.07797, -5600953046.942488),
        Vec3::new(23381.403824232595, 8511.628465950784, 82.54899501365614),
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
        1.8981246258034552e+27, 69911000.0,
        Vec3::new(-253419345368.912, 737350305794.7006, 2606925500.009656),
        Vec3::new(-12520.041395089607, -3640.294521136214, 295.1466824685907),
    );
    jupiter.rotation_rate = 1.7585e-4;
    jupiter.axial_tilt = 0.0546;
    jupiter.pole_ra = Some(268.05_f64.to_radians());
    jupiter.pole_dec = Some(64.49_f64.to_radians());
    jupiter.mean_surface_temperature = 165.0;
    jupiter.seed = seed.wrapping_add(10);
    jupiter.semi_major_axis = 777615551082.3237;
    jupiter.eccentricity = 0.0488238339890161;
    jupiter.inclination = 1.303423734788113 * deg;
    jupiter.longitude_asc_node = 100.4974267386808 * deg;
    jupiter.arg_periapsis = 273.5571974333627 * deg;
    jupiter.mean_anomaly = 89.37724066060315 * deg;
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
        8.929648802121572e+22, 1821490.0,
        Vec3::new(-253048162405.43616, 737149012228.3239, 2604956343.127757),
        Vec3::new(-4208.017384166167, 11536.961269366273, 956.6434526118736),
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
        4.7985737830184444e+22, 1560800.0,
        Vec3::new(-253336795224.01056, 736680778547.9159, 2587835180.404633),
        Vec3::new(1026.1045030883959, -1874.756906242933, 634.9773826056384),
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
        1.481478626972117e+23, 2631200.0,
        Vec3::new(-252407469010.23196, 737006450748.6157, 2608449508.89343),
        Vec3::new(-9007.83564280008, 6667.750073499915, 739.7075799751664),
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
        1.075660878294353e+23, 2410300.0,
        Vec3::new(-253408954392.14127, 739229434180.5881, 2665876684.725195),
        Vec3::new(-20733.183615790145, -3532.172885335655, 187.84372964754917),
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
        5.683173701212113e+26, 58232000.0,
        Vec3::new(1422278067199.8396, 38557211581.593666, -57286362617.60134),
        Vec3::new(-802.2902327476618, 9633.913344037814, -135.29821308327544),
    );
    saturn.rotation_rate = 1.63785e-4;
    saturn.axial_tilt = 0.4665;
    saturn.pole_ra = Some(40.589_f64.to_radians());
    saturn.pole_dec = Some(83.537_f64.to_radians());
    saturn.mean_surface_temperature = 134.0;
    saturn.seed = seed.wrapping_add(20);
    saturn.semi_major_axis = 1426282424721.493;
    saturn.eccentricity = 0.05466572968317326;
    saturn.inclination = 2.486560591194277 * deg;
    saturn.longitude_asc_node = 113.5234423447392 * deg;
    saturn.arg_periapsis = 339.0844496578067 * deg;
    saturn.mean_anomaly = 275.1957082168172 * deg;
    saturn.parent_id = Some(sun_id);
    saturn.color = hex_to_rgb(0xead6a7);
    saturn.rings = Some(RingParameters {
        inner_radius_mult: 1.11,
        outer_radius_mult: 7.96,
        texture_preset: "saturn".to_string(),
        base_opacity: 0.9,
    });
    saturn.composition = PlanetComposition::GasGiant;
    saturn.albedo = 0.342;
    saturn.softening_length = compute_softening(5.8232e7);
    saturn.compute_derived();
    let saturn_id = sim.add_body(saturn);

    // ─── Mimas ──────────────────────────────────────────────────────────
    // Horizons #601 — GM=2.503489 km³/s²
    let mut mimas = Body::new(
        0, "Mimas", BodyType::Moon,
        3.750938675216877e+19, 198800.0,
        Vec3::new(1422134256763.3904, 38664149430.222626, -57331424573.86942),
        Vec3::new(-9951.772995864012, 384.7832913716863, 5977.387219023425),
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
        1.0803180857917686e+20, 252300.0,
        Vec3::new(1422042201362.7507, 38545378055.26055, -57257288487.062904),
        Vec3::new(524.7221847633589, -1551.089888497419, 5596.8655571043955),
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
        6.174430277332455e+20, 536300.0,
        Vec3::new(1422114248461.8206, 38780627578.33761, -57386689114.33573),
        Vec3::new(-10202.982214985555, 4295.481160441287, 3329.6821846542794),
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
        1.0954856689090991e+21, 562500.0,
        Vec3::new(1422031948887.4526, 38313212743.14192, -57134848320.52324),
        Vec3::new(6744.393725462879, 3540.700481407787, 2323.905686523044),
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
        2.3064591043255476e+21, 764500.0,
        Vec3::new(1422010481792.4014, 38166441738.334595, -57054752324.74689),
        Vec3::new(6476.917318294454, 5541.627449500242, 1353.0641034652804),
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
        1.3451807680206165e+23, 2575500.0,
        Vec3::new(1423389918556.7085, 38153032569.24747, -57188578592.38257),
        Vec3::new(1120.305624246614, 14354.380171729084, -2760.960541157103),
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
        1.8057324363603674e+21, 734500.0,
        Vec3::new(1420709057046.4487, 41751346031.78877, -57706716572.36903),
        Vec3::new(-3688.8225136085543, 8431.453071930135, 721.6475694914568),
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
        8.680986186266726e+25, 25362000.0,
        Vec3::new(1478073476913.7825, 2513246041395.4673, -9831518091.484814),
        Vec3::new(-5932.790537281172, 3134.649152126628, 88.8076829043664),
    );
    uranus.rotation_rate = -1.01237e-4;
    uranus.axial_tilt = 1.7064;
    uranus.pole_ra = Some(257.311_f64.to_radians());
    uranus.pole_dec = Some(-15.175_f64.to_radians());
    uranus.mean_surface_temperature = 76.0;
    uranus.seed = seed.wrapping_add(30);
    uranus.semi_major_axis = 2870646874755.253;
    uranus.eccentricity = 0.04724370911732833;
    uranus.inclination = 0.774035806823098 * deg;
    uranus.longitude_asc_node = 73.96730874539558 * deg;
    uranus.arg_periapsis = 97.08319609588438 * deg;
    uranus.mean_anomaly = 253.5885560232958 * deg;
    uranus.parent_id = Some(sun_id);
    uranus.color = hex_to_rgb(0x72b4c4);
    uranus.rings = Some(RingParameters {
        inner_radius_mult: 1.56,
        outer_radius_mult: 3.90,
        texture_preset: "uranus".to_string(),
        base_opacity: 0.3,
    });
    uranus.composition = PlanetComposition::IceGiant;
    uranus.albedo = 0.300;
    uranus.softening_length = compute_softening(2.5362e7);
    uranus.compute_derived();
    let uranus_id = sim.add_body(uranus);

    // ─── Miranda ────────────────────────────────────────────────────────
    // Horizons #705 — GM=4.3 km³/s²
    let mut miranda = Body::new(
        0, "Miranda", BodyType::Moon,
        6.442623196440077e+19, 240000.0,
        Vec3::new(1478186683266.1907, 2513222317937.086, -9772397131.568699),
        Vec3::new(-3244.0952585197083, 1347.9121308952272, -5757.145401858095),
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
        1.2500187285558038e+21, 581100.0,
        Vec3::new(1478247017224.4268, 2513218437002.844, -9756912972.674757),
        Vec3::new(-3958.215809508779, 2006.8842336388032, -4929.726385208909),
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
        1.279534932502285e+21, 584700.0,
        Vec3::new(1478020996614.5986, 2513292863609.7295, -9576045217.45029),
        Vec3::new(-1449.193171903463, 2308.678033392129, 1168.5633416517765),
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
        3.338177786434533e+21, 788900.0,
        Vec3::new(1478435784939.8396, 2513136567626.0435, -10047155143.882902),
        Vec3::new(-7811.325028798818, 3109.489400348165, -3040.4361335635836),
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
        3.0765773189697797e+21, 761400.0,
        Vec3::new(1478363146793.2646, 2513254768633.219, -9326066379.535824),
        Vec3::new(-3278.4511966156992, 2341.4784911267006, -1423.3473716951794),
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
        1.024092409690904e+26, 24624000.0,
        Vec3::new(4468805610889.497, 77632244965.34709, -104579004736.9847),
        Vec3::new(-141.8865028292812, 5465.647680419589, -109.82519767862651),
    );
    neptune.rotation_rate = 1.08338e-4;
    neptune.axial_tilt = 0.4943;
    neptune.pole_ra = Some(299.36_f64.to_radians());
    neptune.pole_dec = Some(42.95_f64.to_radians());
    neptune.mean_surface_temperature = 72.0;
    neptune.seed = seed.wrapping_add(40);
    neptune.semi_major_axis = 4497806205857.0625;
    neptune.eccentricity = 0.008592301304124647;
    neptune.inclination = 1.773542114139843 * deg;
    neptune.longitude_asc_node = 131.9065895380446 * deg;
    neptune.arg_periapsis = 273.9127519499114 * deg;
    neptune.mean_anomaly = 315.8698602184478 * deg;
    neptune.parent_id = Some(sun_id);
    neptune.color = hex_to_rgb(0x3d5ef5);
    neptune.rings = Some(RingParameters {
        inner_radius_mult: 1.70,
        outer_radius_mult: 2.60,
        texture_preset: "neptune".to_string(),
        base_opacity: 0.15,
    });
    neptune.composition = PlanetComposition::IceGiant;
    neptune.albedo = 0.290;
    neptune.softening_length = compute_softening(2.4624e7);
    neptune.compute_derived();
    let neptune_id = sim.add_body(neptune);

    // ─── Triton ─────────────────────────────────────────────────────────
    // Horizons #801 — GM=1428.495 km³/s², retrograde orbit
    let mut triton = Body::new(
        0, "Triton", BodyType::Moon,
        2.1402918658136437e+22, 1352600.0,
        Vec3::new(4468521081135.368, 77602227998.22089, -104369247434.20769),
        Vec3::new(1104.116488429909, 9052.164688329602, 2093.6516449940113),
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
        3.1e19, 170000.0,
        Vec3::new(4466721998629.697, 77654770528.77852, -104697186261.00308),
        Vec3::new(1054.9236676297498, 3497.6577065656443, -172.4898135491216),
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
        1.3069999999999998e+22, 1188300.0,
        Vec3::new(2876454611935.3413, -4435932980402.723, -357166891430.12866),
        Vec3::new(4712.183799328487, 1765.843514620449, -1541.3394920701237),
    );
    pluto.rotation_rate = -1.1386e-5;
    pluto.axial_tilt = 2.1387;
    pluto.pole_ra = Some(132.99_f64.to_radians());
    pluto.pole_dec = Some(-6.16_f64.to_radians());
    pluto.mean_surface_temperature = 44.0;
    pluto.seed = seed.wrapping_add(50);
    pluto.semi_major_axis = 5949805524558.921;
    pluto.eccentricity = 0.249374434785719;
    pluto.inclination = 16.9949501178648 * deg;
    pluto.longitude_asc_node = 110.1839145902636 * deg;
    pluto.arg_periapsis = 115.5804042048147 * deg;
    pluto.mean_anomaly = 51.1590531539379 * deg;
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
        1.5896798166099818e+21, 6.06e5,
        Vec3::new(2876464774708.1245, -4435932372040.207, -357183633924.58905),
        Vec3::new(4596.001364099315, 1591.573427088925, -1618.2356369179686),
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
        Vec3::new(381172803951.6316, 192678035325.40125, -64122243315.560104),
        Vec3::new(-8426.224419312673, 14788.662055519993, 2020.5283450946074),
    );
    ceres.mean_surface_temperature = 168.0;
    ceres.seed = seed.wrapping_add(60);
    ceres.semi_major_axis = 411538004554.0657;
    ceres.eccentricity = 0.08216880877958072;
    ceres.inclination = 10.59578890670587 * deg;
    ceres.longitude_asc_node = 80.23712527448001 * deg;
    ceres.arg_periapsis = 75.1642705049938 * deg;
    ceres.mean_anomaly = 238.4666019918075 * deg;
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
        Vec3::new(433537930289.0228, -211324380873.61078, 108960193246.82422),
        Vec3::new(5285.248955952197, 11069.263670969503, -8127.950201700926),
    );
    pallas.mean_surface_temperature = 164.0;
    pallas.seed = seed.wrapping_add(61);
    pallas.semi_major_axis = 414115006264.7682;
    pallas.eccentricity = 0.2316257482873376;
    pallas.inclination = 34.91115445003978 * deg;
    pallas.longitude_asc_node = 172.7942418556915 * deg;
    pallas.arg_periapsis = 310.8776891229305 * deg;
    pallas.mean_anomaly = 220.4222294580799 * deg;
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
        Vec3::new(164667262855.5179, -285020315764.7729, -11589457126.233732),
        Vec3::new(18374.999463791897, 9286.427386359417, -2513.2365854702834),
    );
    vesta.mean_surface_temperature = 210.0;
    vesta.seed = seed.wrapping_add(62);
    vesta.semi_major_axis = 354297814125.40295;
    vesta.eccentricity = 0.08973505414628136;
    vesta.inclination = 7.143023825590094 * deg;
    vesta.longitude_asc_node = 103.6121198235115 * deg;
    vesta.arg_periapsis = 153.2059357997306 * deg;
    vesta.mean_anomaly = 36.47698154656908 * deg;
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
        Vec3::new(-2917189260832.731, 4103229382979.975, -1479132076090.842),
        Vec3::new(883.2366191099449, 300.52541247620394, 195.77705208972458),
    );
    halley.seed = seed.wrapping_add(70);
    halley.semi_major_axis = 2672576131202.004;
    halley.eccentricity = 0.967302714162277;
    halley.inclination = 162.2458132943639 * deg;
    halley.longitude_asc_node = 58.83507143810274 * deg;
    halley.arg_periapsis = 111.7345218123615 * deg;
    halley.mean_anomaly = 190.323016379983 * deg;
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
        Vec3::new(559664540557.528, -92060418247.3137, 32596024140.560757),
        Vec3::new(-4357.4121049484, 6892.325679666754, 860.1878551229648),
    );
    encke.seed = seed.wrapping_add(71);
    encke.semi_major_axis = 331432607855.5415;
    encke.eccentricity = 0.8477770617760961;
    encke.inclination = 11.35782636520889 * deg;
    encke.longitude_asc_node = 333.9240130727996 * deg;
    encke.arg_periapsis = 187.3233167871771 * deg;
    encke.mean_anomaly = 238.9905948279631 * deg;
    encke.parent_id = Some(sun_id);
    encke.color = hex_to_rgb(0x484848);
    encke.albedo = 0.05;
    encke.softening_length = compute_softening(2.4e3);
    encke.compute_derived();
    sim.add_body(encke);

    // ─── 67P/Churyumov-Gerasimenko ──────────────────────────────────────
    // Horizons "DES=67P;CAP" — Rosetta target, mass 9.982e12 kg
    let mut cg67p = Body::new(
        0, "67P/Churyumov-Gerasimenko", BodyType::Comet,
        9.982e12, 2.0e3,
        Vec3::new(-221673785044.72696, -768051446661.5203, -32968734403.866802),
        Vec3::new(8567.957552286614, 1333.205084611422, -270.29373212446376),
    );
    cg67p.seed = seed.wrapping_add(72);
    cg67p.semi_major_axis = 518422354253.69696;
    cg67p.eccentricity = 0.6489001989676814;
    cg67p.inclination = 3.862608688566866 * deg;
    cg67p.longitude_asc_node = 36.31347113311906 * deg;
    cg67p.arg_periapsis = 22.13769776184141 * deg;
    cg67p.mean_anomaly = 233.0329630545787 * deg;
    cg67p.parent_id = Some(sun_id);
    cg67p.color = hex_to_rgb(0x404040);
    cg67p.albedo = 0.06;
    cg67p.softening_length = compute_softening(2.0e3);
    cg67p.compute_derived();
    sim.add_body(cg67p);

    // ─── C/1995 O1 (Hale-Bopp) ─────────────────────────────────────────
    // Horizons "DES=C/1995 O1;CAP" — Great Comet, nucleus ~30 km
    let mut hale_bopp = Body::new(
        0, "C/1995 O1 (Hale-Bopp)", BodyType::Comet,
        1.3e16, 3.0e4,
        Vec3::new(650460388645.627, -3264152766125.0527, -6749038292298.037),
        Vec3::new(618.5915303296364, -3066.96975155981, -4534.169264860202),
    );
    hale_bopp.seed = seed.wrapping_add(73);
    hale_bopp.semi_major_axis = 26822857887030.707;
    hale_bopp.eccentricity = 0.9948750221775609;
    hale_bopp.inclination = 89.36481974476078 * deg;
    hale_bopp.longitude_asc_node = 282.5472614590468 * deg;
    hale_bopp.arg_periapsis = 130.662145362621 * deg;
    hale_bopp.mean_anomaly = 4.31405196719594 * deg;
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
        Vec3::new(-4935050362134.387, 2349412406153.687, -3279921364912.3984),
        Vec3::new(-2235.4819331605972, 1548.6170030349651, -611.0576273988768),
    );
    swift_tuttle.seed = seed.wrapping_add(74);
    swift_tuttle.semi_major_axis = 3910810703533.1787;
    swift_tuttle.eccentricity = 0.9633187058287521;
    swift_tuttle.inclination = 113.3388731739547 * deg;
    swift_tuttle.longitude_asc_node = 139.546578613716 * deg;
    swift_tuttle.arg_periapsis = 153.0722754997699 * deg;
    swift_tuttle.mean_anomaly = 89.08093528130695 * deg;
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

/// Full Solar System IV — strict JPL HORIZONS SSB vectors at 2026-01-01T00:00:00.
///
/// Implementation strategy:
/// - Start from Full Solar System III to preserve all curated physical properties
///   (mass/radius placeholders, albedo, composition, atmospheres, etc.).
/// - Apply a fixed heliocentric→SSB translation (from direct HORIZONS SSB fetch).
/// - Rebuild body order by heliocentric distance (Sun first), so body-cycling
///   order is deterministic and distance-sorted.
pub fn create_full_solar_system_iv(seed: u64, barycentric: bool) -> Simulation {
    // Full Solar System III contains the curated 40-body roster and properties.
    let mut sim = create_full_solar_system_iii(seed, false);

    // Sun state in SSB frame from direct HORIZONS query:
    // center=500@0, epoch=2026-01-01T00:00:00, ecliptic J2000, km/s converted to SI.
    const SUN_SSB_POS_2026: Vec3 = Vec3::new(
        -458_863_967.403_542_1,
        -827_774_246.990_133_5,
        19_699_675.024_181_95,
    );
    const SUN_SSB_VEL_2026: Vec3 = Vec3::new(
        12.425_057_943_606_11,
        0.307_876_248_436_915_1,
        -0.235_280_331_488_380_7,
    );

    if barycentric {
        // Convert absolute states from heliocentric origin to strict SSB frame.
        translate_simulation_frame(&mut sim, SUN_SSB_POS_2026, SUN_SSB_VEL_2026);
    }

    // Always expose IV in heliocentric-distance order for predictable cycling.
    reorder_by_heliocentric_distance(&sim, seed)
}

/// Solar System IV + Alpha Centauri AB + Proxima Centauri system (epoch 2026-01-01)
pub fn create_solar_centauri_i(seed: u64, barycentric: bool) -> Simulation {
    let mut sim = create_full_solar_system_iii(seed, false);

    let ids_to_remove: Vec<u32> = sim
        .bodies()
        .iter()
        .filter(|b| {
            b.is_active
                && (b.body_type == BodyType::Asteroid || b.body_type == BodyType::Comet)
                && b.name != "1P/Halley"
        })
        .map(|b| b.id)
        .collect();
    for id in ids_to_remove {
        sim.remove_body(id);
    }

    let m_a: f64 = 1.133 * M_SUN;
    let m_b: f64 = 0.972 * M_SUN;
    let r_a: f64 = 1.2234 * R_SUN;
    let r_b: f64 = 0.8632 * R_SUN;
    let total_ab = m_a + m_b;
    let mu_ab = G * total_ab;
    let frac_a = m_b / total_ab;
    let frac_b = m_a / total_ab;

    let ab_elements = OrbitalElements::from_degrees(
        23.52 * AU,     // semi-major axis
        0.5240,         // eccentricity
        79.32,          // inclination
        204.75,         // Ω
        232.30,         // ω
        316.89,         // M at 2026-01-01
    );
    let (rel_pos_ab, rel_vel_ab) = ab_elements.to_cartesian(mu_ab);

    let m_proxima: f64 = 0.1221 * M_SUN;
    let r_proxima: f64 = 0.1542 * R_SUN;
    let mu_proxima_orbit = G * (total_ab + m_proxima);

    let proxima_elements = OrbitalElements::from_degrees(
        8700.0 * AU,
        0.50,
        107.6,
        126.0,
        72.3,
        357.9,
    );
    let (prox_pos_in_ab, prox_vel_in_ab) = proxima_elements.to_cartesian(mu_proxima_orbit);

    // Interstellar offsets (ecliptic J2000 coordinates relative to Sun)
    // Sourced from RA=14h39m36.494s, Dec=-60°50'02.37", d=4.37 ly
    let acen_pos = Vec3::new(
        -1.5456654448284618e16,
        -2.621855158423208e16,
        -2.7981341315508704e16,
    );
    let acen_vel = Vec3::new(
        -8668.801826218503,
        29626.8254505799,
        9977.215355440698,
    );

    // AB positions/velocities in heliocentric frame
    let pos_a = acen_pos + rel_pos_ab * (-frac_a);
    let vel_a = acen_vel + rel_vel_ab * (-frac_a);
    let pos_b = acen_pos + rel_pos_ab * frac_b;
    let vel_b = acen_vel + rel_vel_ab * frac_b;

    // Proxima position/velocity in heliocentric frame
    let pos_proxima = acen_pos + prox_pos_in_ab;
    let vel_proxima = acen_vel + prox_vel_in_ab;

    let mut star_a = Body::new(
        0,
        "Alpha Centauri A",
        BodyType::Star,
        m_a,
        r_a,
        pos_a,
        vel_a,
    );
    star_a.color = hex_to_rgb(0xfff4e6);
    star_a.luminosity = 1.519 * L_SUN;
    star_a.effective_temperature = 5804.0;
    star_a.rotation_rate = OMEGA_SUN * 0.9;
    star_a.seed = seed.wrapping_add(80);
    star_a.metallicity = 0.23;
    star_a.age = 5.3e9 * SECONDS_PER_YEAR;
    star_a.semi_major_axis = ab_elements.semi_major_axis * frac_a;
    star_a.eccentricity = ab_elements.eccentricity;
    star_a.softening_length = compute_softening(r_a);
    star_a.compute_derived();

    let mut star_b = Body::new(
        0,
        "Alpha Centauri B",
        BodyType::Star,
        m_b,
        r_b,
        pos_b,
        vel_b,
    );
    star_b.color = hex_to_rgb(0xffd27f);
    star_b.luminosity = 0.5002 * L_SUN;
    star_b.effective_temperature = 5242.0;
    star_b.rotation_rate = OMEGA_SUN * 0.7;
    star_b.seed = seed.wrapping_add(81);
    star_b.metallicity = 0.23;
    star_b.age = 5.3e9 * SECONDS_PER_YEAR;
    star_b.semi_major_axis = ab_elements.semi_major_axis * frac_b;
    star_b.eccentricity = ab_elements.eccentricity;
    star_b.softening_length = compute_softening(r_b);
    star_b.compute_derived();

    let mut star_c = Body::new(
        0,
        "Proxima Centauri",
        BodyType::Star,
        m_proxima,
        r_proxima,
        pos_proxima,
        vel_proxima,
    );
    star_c.color = hex_to_rgb(0xff4444);
    star_c.luminosity = 0.00157 * L_SUN;
    star_c.effective_temperature = 3050.0;
    star_c.rotation_rate = 8.82e-7;
    star_c.seed = seed.wrapping_add(82);
    star_c.metallicity = 0.20;
    star_c.age = 4.85e9 * SECONDS_PER_YEAR;
    star_c.softening_length = compute_softening(r_proxima);
    star_c.compute_derived();

    sim.add_body(star_a);
    sim.add_body(star_b);
    let proxima_id = sim.add_body(star_c);

    let mut rng = Pcg32::new(seed.wrapping_add(83));
    
    let prox_b_elements = OrbitalElements {
        semi_major_axis: 0.04856 * AU,
        eccentricity: 0.06,
        inclination: 0.0,
        longitude_asc_node: 0.0,
        arg_periapsis: 0.0,
        mean_anomaly: rng.next_f64() * 2.0 * PI,
    };
    let (prox_b_rel_pos, prox_b_rel_vel) = prox_b_elements.to_cartesian(G * m_proxima);
    let pos_prox_b = pos_proxima + prox_b_rel_pos;
    let vel_prox_b = vel_proxima + prox_b_rel_vel;

    let mut prox_b = Body::new(
        0,
        "Proxima Centauri b",
        BodyType::Planet,
        1.07 * M_EARTH,
        1.03 * R_EARTH,
        pos_prox_b,
        vel_prox_b,
    );
    prox_b.parent_id = Some(proxima_id);
    prox_b.color = hex_to_rgb(0x7090c0);
    prox_b.composition = PlanetComposition::Rocky;
    prox_b.albedo = 0.3;
    prox_b.mean_surface_temperature = 234.0;
    prox_b.rotation_rate = 2.0 * PI / (11.186 * SECONDS_PER_DAY);
    prox_b.axial_tilt = 0.0;
    prox_b.seed = seed.wrapping_add(84);
    prox_b.semi_major_axis = 0.04856 * AU;
    prox_b.eccentricity = 0.06;
    prox_b.softening_length = compute_softening(1.03 * R_EARTH);
    prox_b.compute_derived();
    sim.add_body(prox_b);

    let prox_c_elements = OrbitalElements {
        semi_major_axis: 1.489 * AU,
        eccentricity: 0.04,
        inclination: 133.0 * PI / 180.0,
        longitude_asc_node: 0.0,
        arg_periapsis: 0.0,
        mean_anomaly: rng.next_f64() * 2.0 * PI,
    };
    let (prox_c_rel_pos, prox_c_rel_vel) = prox_c_elements.to_cartesian(G * m_proxima);
    let pos_prox_c = pos_proxima + prox_c_rel_pos;
    let vel_prox_c = vel_proxima + prox_c_rel_vel;

    let mut prox_c = Body::new(
        0,
        "Proxima Centauri c (candidate)",
        BodyType::Planet,
        7.0 * M_EARTH,
        1.7 * R_EARTH,
        pos_prox_c,
        vel_prox_c,
    );
    prox_c.parent_id = Some(proxima_id);
    prox_c.color = hex_to_rgb(0x4070a0);
    prox_c.composition = PlanetComposition::IceGiant;
    prox_c.albedo = 0.35;
    prox_c.mean_surface_temperature = 39.0;
    prox_c.rotation_rate = 2.0 * PI / (2.0 * SECONDS_PER_DAY);
    prox_c.axial_tilt = 0.5;
    prox_c.seed = seed.wrapping_add(85);
    prox_c.semi_major_axis = 1.489 * AU;
    prox_c.eccentricity = 0.04;
    prox_c.softening_length = compute_softening(1.7 * R_EARTH);
    prox_c.compute_derived();
    sim.add_body(prox_c);

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
            Preset::FullSolarSystemII,
            Preset::FullSolarSystemIII,
            Preset::FullSolarSystemIV,
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
        
        // Verify Mercury semi-major axis
        let mercury = bodies.iter().find(|b| b.name == "Mercury").unwrap();
        // Semi-major axis should be within 0.05% of canonical 5.7909227e10 m
        let merc_a_error = ((mercury.semi_major_axis - 5.7909227e10).abs() / 5.7909227e10) * 100.0;
        assert!(merc_a_error < 0.05, "Mercury semi-major axis error: {:.4}%", merc_a_error);
        // Mercury should have inclination set (7° = ~0.122 rad)
        assert!(mercury.inclination > 0.1, "Mercury inclination not set: {}", mercury.inclination);
        
        // Verify Saturn semi-major axis
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

    #[test]
    fn test_solar_centauri_i_preset() {
        let sim = create_solar_centauri_i(42, true);
        
        assert_eq!(sim.body_count(), 38, "Expected exactly 38 bodies, got {}", sim.body_count());
        
        let bodies = sim.bodies();
        let sun = bodies.iter().find(|b| b.name == "Sun").unwrap();
        let acen_a = bodies.iter().find(|b| b.name == "Alpha Centauri A").unwrap();
        let earth = bodies.iter().find(|b| b.name == "Earth").unwrap();
        let moon = bodies.iter().find(|b| b.name == "Moon").unwrap();
        
        // Verify Alpha Centauri A distance from Sun (approx 4.37 light years)
        let dist_m = (acen_a.position - sun.position).length();
        let dist_ly = dist_m / 9.4607304725808e15;
        assert!((dist_ly - 4.37).abs() < 0.1, "Alpha Centauri A should be ~4.37 ly from Sun, got {} ly", dist_ly);
        
        // Verify Earth distance from Sun (approx 1 AU)
        let earth_dist_m = (earth.position - sun.position).length();
        let earth_dist_au = earth_dist_m / 1.49597870700e11;
        assert!((earth_dist_au - 1.0).abs() < 0.05, "Earth should be ~1 AU from Sun, got {} AU", earth_dist_au);

        // Verify Moon distance from Earth
        let moon_dist_m = (moon.position - earth.position).length();
        assert!((moon_dist_m - 3.844e8).abs() < 3e7, "Moon should be ~384,400 km from Earth, got {} m", moon_dist_m);
        
        // Verify Proxima planets exist and have correct parent
        let proxima = bodies.iter().find(|b| b.name == "Proxima Centauri").unwrap();
        let prox_b = bodies.iter().find(|b| b.name == "Proxima Centauri b").unwrap();
        let prox_c = bodies.iter().find(|b| b.name == "Proxima Centauri c (candidate)").unwrap();
        
        assert_eq!(prox_b.parent_id, Some(proxima.id));
        assert_eq!(prox_c.parent_id, Some(proxima.id));
        
        // Verify energy is positive (unbound interstellar system)
        let energy = sim.total_energy();
        assert!(energy > 0.0, "Sol-Centauri system should have positive energy due to interstellar velocity differences");
        
        println!("✓ Sol-Centauri System preset validated");
        println!("  Total bodies: {}", sim.body_count());
        println!("  Energy: {:.3e} J", energy);
    }
}
