///! Celestial body types and properties.
///! Each body carries its physical state plus metadata for rendering and SOI management.

use crate::vector::Vec3;
use crate::units::*;
use serde::{Deserialize, Serialize};

/// Unique identifier for a body in the simulation
pub type BodyId = u64;

/// Classification of a celestial body
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BodyType {
    Star,
    Planet,
    Moon,
    Asteroid,
    Comet,
    DwarfPlanet,
    ArtificialSatellite,
    TestParticle,    // massless tracer
    NeutronStar,
    WhiteDwarf,
    BlackHole,
}

/// Collision shape for a body
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub enum CollisionShape {
    Sphere { radius: f64 }, // meters
    Point,                  // no collision geometry
}

/// Atmosphere parameters for a body
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AtmosphereParams {
    /// Surface pressure in Pa
    pub surface_pressure: Pascal,
    /// Surface density in kg/m³
    pub surface_density: KgPerCubicMeter,
    /// Scale height in meters
    pub scale_height: Meter,
    /// Mean molecular mass (kg/mol)
    pub molecular_mass: f64,
    /// Surface temperature in Kelvin
    pub surface_temperature: f64,
    /// Rayleigh scattering coefficients (RGB wavelengths in nm)
    pub rayleigh_coefficients: [f64; 3],
    /// Mie scattering coefficient
    pub mie_coefficient: f64,
    /// Mie scattering direction
    pub mie_direction: f64,
}

/// Spherical harmonic gravity coefficients (J2, J3, J4, ...)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GravityHarmonics {
    /// Reference radius for the harmonic expansion
    pub reference_radius: Meter,
    /// Zonal harmonics J_n (index 0 = J2, index 1 = J3, ...)
    pub j_coefficients: Vec<f64>,
    /// Tesseral harmonics C_{n,m} and S_{n,m} (optional, for non-axisymmetric bodies)
    pub tesseral_c: Vec<Vec<f64>>,
    pub tesseral_s: Vec<Vec<f64>>,
}

/// Physical and visual properties of a celestial body
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Body {
    pub id: BodyId,
    pub name: String,
    pub body_type: BodyType,

    // Dynamic state
    pub position: Vec3,     // meters, inertial frame
    pub velocity: Vec3,     // m/s, inertial frame
    pub acceleration: Vec3, // m/s², computed each tick

    // Physical properties
    pub mass: Kilogram,
    pub radius: Meter,
    pub rotation_period: Second,   // sidereal rotation period
    pub axial_tilt: Radian,        // obliquity
    pub rotation_angle: Radian,    // current rotation phase

    // Collision
    pub collision_shape: CollisionShape,
    pub restitution: f64, // coefficient of restitution [0,1]

    // SOI & hierarchy
    pub parent_id: Option<BodyId>,   // gravitational parent
    pub soi_radius: Meter,           // sphere of influence radius

    // Visual properties
    pub color: [f32; 3],            // base RGB color [0,1]
    pub luminosity: Watt,           // for stars
    pub albedo: f64,                // surface reflectivity [0,1]

    // Optional modules
    pub atmosphere: Option<AtmosphereParams>,
    pub gravity_harmonics: Option<GravityHarmonics>,

    // Rendering hints
    pub has_rings: bool,
    pub ring_inner_radius: Meter,
    pub ring_outer_radius: Meter,

    // Per-entity timestep
    pub substep_factor: u32,       // how many substeps per global tick
    pub required_dt: Second,       // adaptive timestep request

    // Flag for active/passive physics
    pub is_active: bool,           // active bodies get full integration
    pub is_massless: bool,         // test particles don't contribute to forces
}

impl Body {
    /// Create a new body with minimal required fields
    pub fn new(id: BodyId, name: &str, body_type: BodyType) -> Self {
        Self {
            id,
            name: name.to_string(),
            body_type,
            position: Vec3::ZERO,
            velocity: Vec3::ZERO,
            acceleration: Vec3::ZERO,
            mass: Kilogram::new(0.0),
            radius: Meter::new(0.0),
            rotation_period: Second::new(86400.0),
            axial_tilt: Radian::new(0.0),
            rotation_angle: Radian::new(0.0),
            collision_shape: CollisionShape::Point,
            restitution: 0.5,
            parent_id: None,
            soi_radius: Meter::new(0.0),
            color: [1.0, 1.0, 1.0],
            luminosity: Watt::new(0.0),
            albedo: 0.3,
            atmosphere: None,
            gravity_harmonics: None,
            has_rings: false,
            ring_inner_radius: Meter::new(0.0),
            ring_outer_radius: Meter::new(0.0),
            substep_factor: 1,
            required_dt: Second::new(1.0),
            is_active: true,
            is_massless: false,
        }
    }

    /// Builder pattern: set mass
    pub fn with_mass(mut self, mass: Kilogram) -> Self {
        self.mass = mass;
        self.collision_shape = CollisionShape::Sphere { radius: self.radius.value() };
        self
    }

    /// Builder: set radius
    pub fn with_radius(mut self, radius: Meter) -> Self {
        self.radius = radius;
        self.collision_shape = CollisionShape::Sphere { radius: radius.value() };
        self
    }

    /// Builder: set position
    pub fn with_position(mut self, pos: Vec3) -> Self {
        self.position = pos;
        self
    }

    /// Builder: set velocity
    pub fn with_velocity(mut self, vel: Vec3) -> Self {
        self.velocity = vel;
        self
    }

    /// Builder: set parent
    pub fn with_parent(mut self, parent_id: BodyId) -> Self {
        self.parent_id = Some(parent_id);
        self
    }

    /// Builder: set color
    pub fn with_color(mut self, r: f32, g: f32, b: f32) -> Self {
        self.color = [r, g, b];
        self
    }

    /// Builder: set luminosity (for stars)
    pub fn with_luminosity(mut self, lum: Watt) -> Self {
        self.luminosity = lum;
        self
    }

    /// Builder: set atmosphere
    pub fn with_atmosphere(mut self, atm: AtmosphereParams) -> Self {
        self.atmosphere = Some(atm);
        self
    }

    /// Builder: set gravity harmonics
    pub fn with_harmonics(mut self, harm: GravityHarmonics) -> Self {
        self.gravity_harmonics = Some(harm);
        self
    }

    /// Builder: mark as massless test particle
    pub fn as_test_particle(mut self) -> Self {
        self.is_massless = true;
        self.mass = Kilogram::new(0.0);
        self
    }

    /// Compute sphere of influence radius: r_SOI ≈ a * (m/M)^(2/5)
    /// where a is semi-major axis approximated by distance to parent
    pub fn compute_soi(&mut self, parent_mass: Kilogram, distance: f64) {
        if parent_mass.value() > 0.0 && self.mass.value() > 0.0 {
            let ratio = (self.mass.value() / parent_mass.value()).powf(0.4);
            self.soi_radius = Meter::new(distance * ratio);
        }
    }

    /// Compute Hill sphere radius: r_H ≈ a * (m / (3M))^(1/3)
    pub fn hill_radius(&self, parent_mass: Kilogram, distance: f64) -> Meter {
        if parent_mass.value() > 0.0 && self.mass.value() > 0.0 {
            let ratio = (self.mass.value() / (3.0 * parent_mass.value())).powf(1.0 / 3.0);
            Meter::new(distance * ratio)
        } else {
            Meter::new(0.0)
        }
    }

    /// Gravitational parameter μ = G * m
    #[inline]
    pub fn mu(&self) -> f64 {
        G * self.mass.value()
    }

    /// Surface gravity g = G * m / r²
    #[inline]
    pub fn surface_gravity(&self) -> MeterPerSecondSq {
        if self.radius.value() > 0.0 {
            MeterPerSecondSq::new(G * self.mass.value() / (self.radius.value() * self.radius.value()))
        } else {
            MeterPerSecondSq::new(0.0)
        }
    }

    /// Escape velocity v_esc = sqrt(2 * G * m / r)
    #[inline]
    pub fn escape_velocity(&self) -> MeterPerSecond {
        if self.radius.value() > 0.0 {
            MeterPerSecond::new((2.0 * G * self.mass.value() / self.radius.value()).sqrt())
        } else {
            MeterPerSecond::new(0.0)
        }
    }

    /// Circular orbital velocity at distance r: v = sqrt(G * m / r)
    #[inline]
    pub fn circular_velocity_at(&self, r: f64) -> MeterPerSecond {
        MeterPerSecond::new((G * self.mass.value() / r).sqrt())
    }

    /// Update rotation angle based on elapsed time
    pub fn update_rotation(&mut self, dt: Second) {
        if self.rotation_period.value() > 0.0 {
            let omega = crate::units::TWO_PI / self.rotation_period.value();
            self.rotation_angle += Radian::new(omega * dt.value());
            // Wrap to [0, 2π)
            while self.rotation_angle.value() >= crate::units::TWO_PI {
                self.rotation_angle -= Radian::new(crate::units::TWO_PI);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_body_creation() {
        let body = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::new(AU, 0.0, 0.0));

        assert_eq!(body.name, "Earth");
        assert!((body.mass.value() - EARTH_MASS).abs() < 1.0);
    }

    #[test]
    fn test_surface_gravity() {
        let earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS));
        let g = earth.surface_gravity();
        // Should be approximately 9.81 m/s²
        assert!((g.value() - 9.81).abs() < 0.1, "Surface gravity = {}", g.value());
    }

    #[test]
    fn test_escape_velocity() {
        let earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS));
        let v_esc = earth.escape_velocity();
        // Should be approximately 11186 m/s
        assert!((v_esc.value() - 11186.0).abs() < 50.0, "v_esc = {}", v_esc.value());
    }

    #[test]
    fn test_soi_computation() {
        let mut earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS));
        earth.compute_soi(Kilogram::new(SOLAR_MASS), AU);
        // Earth SOI ≈ 0.929e9 m
        assert!(earth.soi_radius.value() > 5e8 && earth.soi_radius.value() < 2e9,
                "SOI = {} m", earth.soi_radius.value());
    }
}
