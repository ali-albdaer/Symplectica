//! Celestial body representation with SI units
//!
//! All values use SI units:
//! - Mass: kilograms (kg)
//! - Distance: meters (m)  
//! - Time: seconds (s)
//! - Velocity: meters/second (m/s)
//! - Acceleration: meters/second² (m/s²)

use crate::vector::Vec3;
use serde::{Deserialize, Serialize};

/// Unique identifier for a body
pub type BodyId = u32;

/// Type of celestial body for rendering and physics hints
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum BodyType {
    /// Star - emits light, typically the primary mass
    Star = 0,
    /// Planet - orbits a star, may have atmosphere
    Planet = 1,
    /// Moon - orbits a planet
    Moon = 2,
    /// Asteroid - small rocky body
    Asteroid = 3,
    /// Comet - small icy body with potential tail
    Comet = 4,
    /// Spacecraft - artificial object (NPC)
    Spacecraft = 5,
    /// TestParticle - massless particle for visualization
    TestParticle = 6,
    /// Player - human-controlled entity; test mass by default
    Player = 7,
}

impl Default for BodyType {
    fn default() -> Self {
        Self::Asteroid
    }
}

/// Planetary composition class — drives mean molecular weight for
/// scale-height computation and visual appearance hints.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[repr(u8)]
pub enum PlanetComposition {
    /// Rocky / terrestrial (N₂/O₂ atmosphere)
    Rocky = 0,
    /// Gas giant (H₂/He dominated)
    GasGiant = 1,
    /// Ice giant (H₂/He + CH₄/H₂O enriched)
    IceGiant = 2,
    /// Dwarf planet / minor body
    Dwarf = 3,
}

impl Default for PlanetComposition {
    fn default() -> Self {
        Self::Rocky
    }
}

impl PlanetComposition {
    /// Mean molecular weight μ in kg/mol for scale-height computation.
    pub fn mean_molecular_weight(&self) -> f64 {
        match self {
            Self::Rocky => crate::constants::MU_ROCKY,
            Self::GasGiant => crate::constants::MU_GAS_GIANT,
            Self::IceGiant => crate::constants::MU_ICE_GIANT,
            Self::Dwarf => crate::constants::MU_DWARF,
        }
    }
}

/// Atmospheric properties for rendering
#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize)]
pub struct Atmosphere {
    /// Scale height in meters (e.g., Earth ~8500m)
    pub scale_height: f64,
    /// Rayleigh scattering coefficients (RGB wavelengths)
    pub rayleigh_coefficients: [f64; 3],
    /// Mie scattering coefficient
    pub mie_coefficient: f64,
    /// Mie scattering direction (g parameter, -1 to 1)
    pub mie_direction: f64,
    /// Atmosphere height in meters (where density becomes negligible)
    pub height: f64,
    /// Mie scattering color (RGB 0-1) — color of the scattering medium
    /// (dust, cloud droplets, haze). White for clean, salmon for iron-oxide dust, etc.
    #[serde(default = "Atmosphere::default_mie_color")]
    pub mie_color: [f64; 3],
}

impl Atmosphere {
    /// Default Mie color: neutral white (clean atmosphere, water droplets)
    fn default_mie_color() -> [f64; 3] {
        [1.0, 1.0, 1.0]
    }

    /// Earth-like atmosphere parameters
    pub fn earth_like() -> Self {
        Self {
            scale_height: 8500.0,
            // Rayleigh coefficients for RGB wavelengths (680nm, 550nm, 440nm)
            rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
            mie_coefficient: 21.0e-6,
            mie_direction: 0.758,
            height: 100_000.0, // 100 km
            mie_color: [1.0, 1.0, 1.0], // White (water droplets / clean air)
        }
    }

    /// Mars-like thin CO₂ atmosphere with iron-oxide dust
    pub fn mars_like() -> Self {
        Self {
            scale_height: 11100.0,
            // Rayleigh for thin CO₂ (~1/100th of Earth pressure, ~1.5× refractivity)
            rayleigh_coefficients: [8.0e-8, 2.0e-7, 3.4e-7],
            mie_coefficient: 4.0e-6,   // Dust dominates the visual
            mie_direction: 0.9,        // Strong forward scattering
            height: 200_000.0,
            mie_color: [0.85, 0.55, 0.35], // Iron-oxide dust — salmon/butterscotch
        }
    }

    /// Dense CO₂ Venus atmosphere (thick, yellowish scattering)
    pub fn venus_like() -> Self {
        Self {
            scale_height: 15900.0,
            // Rayleigh for dense CO₂ (higher than Earth due to ~90× pressure)
            rayleigh_coefficients: [4.5e-4, 1.1e-3, 1.9e-3],
            mie_coefficient: 1.0e-2,   // Very dense sulphuric-acid cloud deck
            mie_direction: 0.85,
            height: 250_000.0,         // ~250 km
            mie_color: [0.95, 0.88, 0.55], // Pale yellow (H₂SO₄ droplets)
        }
    }

    /// Check if atmosphere exists
    pub fn is_present(&self) -> bool {
        self.height > 0.0 && self.scale_height > 0.0
    }
}

/// A celestial body in the simulation.
/// 
/// All physical quantities are in SI units for consistency and accuracy.
/// Fields are grouped by function. Fields marked `#[serde(default)]` were
/// added after snapshot v1 and will silently default when loading old data.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Body {
    // ─── identity ───────────────────────────────────────────────
    /// Unique identifier
    pub id: BodyId,
    
    /// Human-readable name
    pub name: String,
    
    /// Type of body
    pub body_type: BodyType,

    // ─── dynamics (updated every tick) ──────────────────────────
    /// Mass in kilograms
    pub mass: f64,
    
    /// Mean / volumetric radius in meters (used for rendering)
    pub radius: f64,
    
    /// Position in meters (world coordinates)
    pub position: Vec3,
    
    /// Velocity in meters per second
    pub velocity: Vec3,
    
    /// Acceleration in meters per second² (computed each step)
    pub acceleration: Vec3,
    
    /// Previous acceleration (for Velocity Verlet)
    pub prev_acceleration: Vec3,

    // ─── gravity participation ──────────────────────────────────
    /// Does this body contribute to the gravitational field?
    /// true for stars, planets, moons, large asteroids.
    /// false for players, ships, debris, test particles.
    #[serde(default = "default_true")]
    pub contributes_gravity: bool,

    /// Does this body respond to (feel) gravitational forces?
    /// true for almost everything; false only for fixed/anchored bodies.
    #[serde(default = "default_true")]
    pub feels_gravity: bool,

    // ─── physical properties (PROPERTIES.md CRITICAL) ──────────
    /// Gravitational softening ε in meters.
    /// 0 means "use the global default from ForceConfig".
    /// Rule of thumb: ε = max(physical_radius * 0.001, 1 m) for particles.
    // TODO(softening): When close-encounter integrator switching is added,
    //   softening should be reduced to near-zero for bodies that switch to
    //   adaptive RK45 / Gauss-Radau, relying on the adaptive step instead.
    #[serde(default)]
    pub softening_length: f64,

    /// Sidereal angular velocity (rad/s)
    // TODO(rotation): Use this in the renderer to spin body meshes.
    //   Requires storing a rotation quaternion that accumulates each frame:
    //   `quat = Quat::from_axis_angle(spin_axis, rotation_rate * dt) * quat`
    #[serde(default)]
    pub rotation_rate: f64,

    /// Obliquity — angle between spin axis and orbit normal (rad)
    #[serde(default)]
    pub axial_tilt: f64,

    /// Average density (kg/m³). Computed by `compute_derived()` if zero.
    #[serde(default)]
    pub bulk_density: f64,

    /// Surface gravity g = G*M/R² (m/s²). Computed if zero.
    #[serde(default)]
    pub surface_gravity: f64,

    /// Surface escape velocity sqrt(2GM/R) (m/s). Computed if zero.
    #[serde(default)]
    pub escape_velocity_surface: f64,

    /// Equilibrium or measured mean surface temperature (K)
    #[serde(default)]
    pub mean_surface_temperature: f64,

    /// Deterministic seed for procedural visuals (terrain, starfield, etc.)
    #[serde(default)]
    pub seed: u64,

    // ─── star-specific ─────────────────────────────────────────
    /// Bolometric luminosity in Watts (0 for non-stars)
    #[serde(default)]
    pub luminosity: f64,

    /// Effective photospheric temperature in Kelvin (0 for non-stars)
    #[serde(default)]
    pub effective_temperature: f64,

    // ─── star-specific (CRITICAL from PROPERTIES.md) ───────────
    /// Metallicity [Fe/H] in dex (0 = solar)
    #[serde(default)]
    pub metallicity: f64,

    /// Stellar age in seconds
    #[serde(default)]
    pub age: f64,

    /// Spectral type label (e.g. "G2", "M8") — derived
    #[serde(default)]
    pub spectral_type: String,

    /// Stellar wind mass-loss rate in kg/s (0 for most MS stars)
    #[serde(default)]
    pub mass_loss_rate: f64,

    /// Quadratic limb-darkening coefficients [a, b]
    /// I(μ)/I(1) = 1 − a(1−μ) − b(1−μ)²
    #[serde(default)]
    pub limb_darkening_coeffs: [f64; 2],

    /// Flare rate in events/second (activity parameter)
    #[serde(default)]
    pub flare_rate: f64,

    /// Fraction of stellar surface covered by spots, 0–1
    #[serde(default)]
    pub spot_fraction: f64,

    /// Main-sequence lifetime estimate in seconds (derived)
    #[serde(default)]
    pub stellar_lifetime: f64,

    // ─── planet-specific (CRITICAL from PROPERTIES.md) ─────────
    /// Composition class (Rocky/GasGiant/IceGiant/Dwarf)
    #[serde(default)]
    pub composition: PlanetComposition,

    /// Equilibrium temperature in K (derived from parent star)
    #[serde(default)]
    pub equilibrium_temperature: f64,

    /// Atmospheric scale height in meters (derived from T_eq, μ, g)
    #[serde(default)]
    pub scale_height: f64,

    /// Oblateness f = (R_eq − R_pol) / R_eq (derived from rotation)
    #[serde(default)]
    pub oblateness: f64,

    /// Normalized polar moment of inertia factor C/(MR²)
    #[serde(default)]
    pub moment_of_inertia_factor: f64,

    // ─── orbital elements (optional, for presets / orbit viz) ───
    /// Semi-major axis a (m). 0 if unset / free-flying.
    #[serde(default)]
    pub semi_major_axis: f64,
    /// Eccentricity e (unitless)
    #[serde(default)]
    pub eccentricity: f64,
    /// Inclination i (rad)
    #[serde(default)]
    pub inclination: f64,
    /// Longitude of ascending node Ω (rad)
    #[serde(default)]
    pub longitude_asc_node: f64,
    /// Argument of periapsis ω (rad)
    #[serde(default)]
    pub arg_periapsis: f64,
    /// Mean anomaly M at epoch (rad)
    #[serde(default)]
    pub mean_anomaly: f64,

    // ─── appearance ────────────────────────────────────────────
    /// Optional atmosphere parameters
    pub atmosphere: Option<Atmosphere>,
    
    /// Albedo (reflectivity, 0-1)
    pub albedo: f64,
    
    /// Surface color RGB (0-1 each)
    pub color: [f64; 3],

    // ─── state flags ───────────────────────────────────────────
    /// Is this body active in the simulation?
    pub is_active: bool,
    
    /// Parent body ID for hierarchical systems (e.g., moon orbiting planet)
    pub parent_id: Option<BodyId>,
}

fn default_true() -> bool { true }

impl Body {
    /// Create a new body with the given properties.
    pub fn new(
        id: BodyId,
        name: impl Into<String>,
        body_type: BodyType,
        mass: f64,
        radius: f64,
        position: Vec3,
        velocity: Vec3,
    ) -> Self {
        let contributes = match body_type {
            BodyType::Star | BodyType::Planet | BodyType::Moon | BodyType::Asteroid | BodyType::Comet => mass > 0.0,
            BodyType::Spacecraft | BodyType::TestParticle | BodyType::Player => false,
        };

        Self {
            id,
            name: name.into(),
            body_type,
            mass,
            radius,
            position,
            velocity,
            acceleration: Vec3::ZERO,
            prev_acceleration: Vec3::ZERO,
            contributes_gravity: contributes,
            feels_gravity: true,
            softening_length: 0.0,
            rotation_rate: 0.0,
            axial_tilt: 0.0,
            bulk_density: 0.0,
            surface_gravity: 0.0,
            escape_velocity_surface: 0.0,
            mean_surface_temperature: 0.0,
            seed: 0,
            luminosity: 0.0,
            effective_temperature: 0.0,
            metallicity: 0.0,
            age: 0.0,
            spectral_type: String::new(),
            mass_loss_rate: 0.0,
            limb_darkening_coeffs: [0.0, 0.0],
            flare_rate: 0.0,
            spot_fraction: 0.0,
            stellar_lifetime: 0.0,
            composition: PlanetComposition::Rocky,
            equilibrium_temperature: 0.0,
            scale_height: 0.0,
            oblateness: 0.0,
            moment_of_inertia_factor: 0.0,
            semi_major_axis: 0.0,
            eccentricity: 0.0,
            inclination: 0.0,
            longitude_asc_node: 0.0,
            arg_periapsis: 0.0,
            mean_anomaly: 0.0,
            atmosphere: None,
            albedo: 0.3,
            color: [1.0, 1.0, 1.0],
            is_active: true,
            parent_id: None,
        }
    }

    /// Create a star.
    pub fn star(id: BodyId, name: impl Into<String>, mass: f64, radius: f64) -> Self {
        let mut body = Self::new(id, name, BodyType::Star, mass, radius, Vec3::ZERO, Vec3::ZERO);
        body.color = [1.0, 0.95, 0.8]; // Yellowish white
        body.albedo = 1.0; // Stars emit light
        body
    }

    /// Create a planet at the given orbital distance from a parent.
    pub fn planet(
        id: BodyId,
        name: impl Into<String>,
        mass: f64,
        radius: f64,
        orbital_distance: f64,
        orbital_velocity: f64,
    ) -> Self {
        let mut body = Self::new(
            id,
            name,
            BodyType::Planet,
            mass,
            radius,
            Vec3::new(orbital_distance, 0.0, 0.0),
            Vec3::new(0.0, orbital_velocity, 0.0),
        );
        body.color = [0.5, 0.5, 0.8]; // Bluish default
        body
    }

    /// Create a moon orbiting a parent body.
    pub fn moon(
        id: BodyId,
        name: impl Into<String>,
        mass: f64,
        radius: f64,
        parent: &Body,
        orbital_distance: f64,
        orbital_velocity: f64,
    ) -> Self {
        let mut body = Self::new(
            id,
            name,
            BodyType::Moon,
            mass,
            radius,
            parent.position + Vec3::new(orbital_distance, 0.0, 0.0),
            parent.velocity + Vec3::new(0.0, orbital_velocity, 0.0),
        );
        body.parent_id = Some(parent.id);
        body.color = [0.7, 0.7, 0.7]; // Grayish
        body
    }

    /// Compute derived physical quantities from mass and radius.
    /// Fills bulk_density, surface_gravity, escape_velocity_surface if they
    /// are currently zero. Also dispatches to type-specific derive functions
    /// for stars and planets/moons. Safe to call multiple times.
    pub fn compute_derived(&mut self) {
        self.compute_derived_with_parent(None);
    }

    /// Compute derived quantities with optional parent body context.
    /// For planets/moons, the parent star is used to compute equilibrium
    /// temperature and scale height from stellar irradiance.
    pub fn compute_derived_with_parent(&mut self, parent: Option<&Body>) {
        if self.mass <= 0.0 || self.radius <= 0.0 {
            return;
        }
        let g = crate::constants::G;

        if self.bulk_density == 0.0 {
            let volume = (4.0 / 3.0) * std::f64::consts::PI * self.radius.powi(3);
            self.bulk_density = self.mass / volume;
        }
        if self.surface_gravity == 0.0 {
            self.surface_gravity = g * self.mass / (self.radius * self.radius);
        }
        if self.escape_velocity_surface == 0.0 {
            self.escape_velocity_surface = (2.0 * g * self.mass / self.radius).sqrt();
        }

        // Type-specific derives
        match self.body_type {
            BodyType::Star => {
                crate::star::derive_star_properties(self);
            }
            BodyType::Planet | BodyType::Moon => {
                crate::planet::derive_planet_properties(self, parent);
            }
            _ => {}
        }
    }

    /// Return the effective softening for this body.
    /// Uses the per-body value if set, otherwise falls back to the global.
    #[inline]
    pub fn effective_softening(&self, global_softening: f64) -> f64 {
        if self.softening_length > 0.0 {
            self.softening_length
        } else {
            global_softening
        }
    }

    /// Calculate the gravitational parameter μ = G * M
    pub fn gravitational_parameter(&self) -> f64 {
        crate::constants::G * self.mass
    }

    /// Calculate circular orbital velocity at given distance
    pub fn circular_orbital_velocity(&self, distance: f64) -> f64 {
        (self.gravitational_parameter() / distance).sqrt()
    }

    /// Calculate escape velocity at given distance
    pub fn escape_velocity(&self, distance: f64) -> f64 {
        (2.0 * self.gravitational_parameter() / distance).sqrt()
    }

    /// Calculate Sphere of Influence radius relative to a parent body.
    /// Uses the Laplace SOI approximation: r_SOI ≈ a * (m / M)^(2/5)
    pub fn sphere_of_influence(&self, parent_mass: f64, semi_major_axis: f64) -> f64 {
        if parent_mass <= 0.0 || self.mass <= 0.0 {
            return 0.0;
        }
        semi_major_axis * (self.mass / parent_mass).powf(0.4)
    }

    /// Calculate Hill radius relative to a parent body.
    /// r_H ≈ a * (m / (3*M))^(1/3)
    pub fn hill_radius(&self, parent_mass: f64, semi_major_axis: f64) -> f64 {
        if parent_mass <= 0.0 || self.mass <= 0.0 {
            return 0.0;
        }
        semi_major_axis * (self.mass / (3.0 * parent_mass)).powf(1.0 / 3.0)
    }


    /// Validate that the body has physical values.
    pub fn is_valid(&self) -> bool {
        self.mass >= 0.0
            && self.radius > 0.0
            && self.position.is_finite()
            && self.velocity.is_finite()
            && self.acceleration.is_finite()
    }

    /// Legacy compat: returns `contributes_gravity` — equivalent to old `is_massive`.
    #[inline]
    pub fn is_massive(&self) -> bool {
        self.contributes_gravity
    }
}

impl Default for Body {
    fn default() -> Self {
        Self {
            id: 0,
            name: String::new(),
            body_type: BodyType::Asteroid,
            mass: 1.0,
            radius: 1.0,
            position: Vec3::ZERO,
            velocity: Vec3::ZERO,
            acceleration: Vec3::ZERO,
            prev_acceleration: Vec3::ZERO,
            contributes_gravity: true,
            feels_gravity: true,
            softening_length: 0.0,
            rotation_rate: 0.0,
            axial_tilt: 0.0,
            bulk_density: 0.0,
            surface_gravity: 0.0,
            escape_velocity_surface: 0.0,
            mean_surface_temperature: 0.0,
            seed: 0,
            luminosity: 0.0,
            effective_temperature: 0.0,
            metallicity: 0.0,
            age: 0.0,
            spectral_type: String::new(),
            mass_loss_rate: 0.0,
            limb_darkening_coeffs: [0.0, 0.0],
            flare_rate: 0.0,
            spot_fraction: 0.0,
            stellar_lifetime: 0.0,
            composition: PlanetComposition::Rocky,
            equilibrium_temperature: 0.0,
            scale_height: 0.0,
            oblateness: 0.0,
            moment_of_inertia_factor: 0.0,
            semi_major_axis: 0.0,
            eccentricity: 0.0,
            inclination: 0.0,
            longitude_asc_node: 0.0,
            arg_periapsis: 0.0,
            mean_anomaly: 0.0,
            atmosphere: None,
            albedo: 0.3,
            color: [1.0, 1.0, 1.0],
            is_active: true,
            parent_id: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::*;

    #[test]
    fn test_circular_velocity() {
        let sun = Body::star(0, "Sun", M_SUN, R_SUN);
        let v = sun.circular_orbital_velocity(AU);
        // Earth's orbital velocity is ~29.78 km/s
        assert!((v - 29780.0).abs() < 100.0);
    }

    #[test]
    fn test_escape_velocity() {
        let earth = Body::planet(1, "Earth", M_EARTH, R_EARTH, AU, 29780.0);
        let v_escape = earth.escape_velocity(R_EARTH);
        // Earth's surface escape velocity is ~11.2 km/s
        assert!((v_escape - 11200.0).abs() < 100.0);
    }

    #[test]
    fn test_soi() {
        // Earth's SOI around the Sun
        // Actual value is about 929,000 km = 9.29e8 m
        let earth = Body::planet(1, "Earth", M_EARTH, R_EARTH, AU, 29780.0);
        let soi = earth.sphere_of_influence(M_SUN, AU);
        assert!((soi - 9.29e8).abs() < 1e8);
    }


    #[test]
    fn test_compute_derived() {
        let mut earth = Body::planet(1, "Earth", M_EARTH, R_EARTH, AU, 29784.0);
        earth.compute_derived();

        // surface_gravity ≈ 9.81 m/s²
        assert!(
            (earth.surface_gravity - 9.81).abs() < 0.1,
            "Surface gravity {} m/s²",
            earth.surface_gravity
        );
        // escape_velocity ≈ 11186 m/s
        assert!(
            (earth.escape_velocity_surface - 11186.0).abs() < 100.0,
            "Escape velocity {} m/s",
            earth.escape_velocity_surface
        );
        // bulk_density ≈ 5514 kg/m³
        assert!(
            (earth.bulk_density - 5514.0).abs() < 50.0,
            "Bulk density {} kg/m³",
            earth.bulk_density
        );
    }

    #[test]
    fn test_player_is_test_mass() {
        let player = Body::new(99, "Player1", BodyType::Player, 80.0, 1.0, Vec3::ZERO, Vec3::ZERO);
        assert!(!player.contributes_gravity, "Players should not contribute gravity");
        assert!(player.feels_gravity, "Players should feel gravity");
    }

    #[test]
    fn test_effective_softening() {
        let mut body = Body::default();

        // Per-body unset → falls back to global
        assert_eq!(body.effective_softening(10_000.0), 10_000.0);

        // Per-body set → uses per-body
        body.softening_length = 500.0;
        assert_eq!(body.effective_softening(10_000.0), 500.0);
    }
}
