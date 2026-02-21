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
        for _ in 0..50 {
            let f = eccentric_anomaly - e * eccentric_anomaly.sin() - m;
            let f_prime = 1.0 - e * eccentric_anomaly.cos();
            let delta = f / f_prime;
            eccentric_anomaly -= delta;
            if delta.abs() < 1e-12 {
                break;
            }
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
}

impl Preset {
    /// Create a simulation from this preset
    pub fn create(&self, seed: u64) -> Simulation {
        match self {
            Preset::SunEarthMoon => create_sun_earth_moon(seed),
            Preset::InnerSolarSystem => create_inner_solar_system(seed),
            Preset::FullSolarSystem => create_full_solar_system(seed),
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, false),
            Preset::PlayableSolarSystem => create_playable_solar_system(seed),
            Preset::JupiterSystem => create_jupiter_system(seed),
            Preset::SaturnSystem => create_saturn_system(seed),
            Preset::AlphaCentauri => create_alpha_centauri(seed),
            Preset::Trappist1 => create_trappist1(seed),
            Preset::BinaryPulsar => create_binary_pulsar(seed),
            Preset::AsteroidBelt => create_asteroid_belt(seed, 5000),
            Preset::StarCluster => create_star_cluster(seed, 2000),
        }
    }

    /// Create a simulation from this preset with barycentric initialization
    pub fn create_barycentric(&self, seed: u64) -> Simulation {
        match self {
            Preset::FullSolarSystemII => create_full_solar_system_ii(seed, true),
            Preset::AsteroidBelt => {
                let mut sim = create_asteroid_belt(seed, 5000);
                recenter_to_barycenter(&mut sim);
                sim
            },
            Preset::StarCluster => {
                // Star clusters are already centered
                create_star_cluster(seed, 2000)
            },
            // Other presets don't support barycentric mode; fall back to default
            _ => self.create(seed),
        }
    }
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
    
    // Spectral type colors for variety (all roughly solar-type)
    let star_colors = [
        0xFFF4E8_u32, // G2V (Sun-like)
        0xFFE4C4_u32, // G8V
        0xFFFAF0_u32, // F8V
        0xFFEBCD_u32, // G5V
        0xFFE4B5_u32, // K0V
    ];
    
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
        let color_idx = rng.next_bounded(star_colors.len() as u32) as usize;
        
        let star_id = sim.add_star(&name, star_mass, R_SUN);
        if let Some(star) = sim.get_body_mut(star_id) {
            star.position = position;
            star.velocity = velocity;
            star.luminosity = L_SUN * (0.8 + rng.next_f64() * 0.4); // 0.8-1.2 L_SUN
            star.effective_temperature = 5500.0 + rng.next_f64() * 1000.0; // 5500-6500 K
            star.rotation_rate = OMEGA_SUN * (0.5 + rng.next_f64()); // 0.5-1.5 × solar
            star.seed = seed.wrapping_add(i as u64);
            star.metallicity = sample_gaussian(&mut rng, 0.0, 0.3); // Solar ± 0.3 dex
            star.age = AGE_SUN * (0.1 + rng.next_f64() * 1.8); // 0.5-9 Gyr
            star.color = hex_to_rgb(star_colors[color_idx]);
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
            // Note: AsteroidBelt and StarCluster are tested separately due to body count
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
