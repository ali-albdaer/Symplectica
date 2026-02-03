//! Celestial body representation
//!
//! All units are SI: mass in kg, radius in m, position in m, velocity in m/s

use serde::{Deserialize, Serialize};

use crate::{
    error::{ErrorCode, PhysicsError, PhysicsResult},
    vec3::Vec3,
};

/// Type of celestial body
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BodyType {
    /// Star (self-luminous)
    Star,
    /// Planet (massive, in orbit around star)
    Planet,
    /// Moon (in orbit around planet)
    Moon,
    /// Asteroid (small rocky body)
    Asteroid,
    /// Comet (small icy body)
    Comet,
    /// Spacecraft (player or AI controlled)
    Spacecraft,
    /// Test particle (massless, for visualization)
    TestParticle,
}

impl Default for BodyType {
    fn default() -> Self {
        Self::Asteroid
    }
}

/// Physical properties of a body
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyProperties {
    /// Mean density in kg/m³
    pub density: f64,
    /// Albedo (reflectivity, 0-1)
    pub albedo: f64,
    /// Surface temperature in Kelvin (optional)
    pub temperature: Option<f64>,
    /// Rotation period in seconds (optional)
    pub rotation_period: Option<f64>,
    /// Axial tilt in radians (optional)
    pub axial_tilt: Option<f64>,
}

impl Default for BodyProperties {
    fn default() -> Self {
        Self {
            density: 3000.0, // Rocky body default
            albedo: 0.1,
            temperature: None,
            rotation_period: None,
            axial_tilt: None,
        }
    }
}

/// Visual properties for rendering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyVisuals {
    /// Display color (RGB hex)
    pub color: u32,
    /// Texture name/path (optional)
    pub texture: Option<String>,
    /// Emission intensity (for stars)
    pub emission: f64,
    /// Has atmosphere
    pub has_atmosphere: bool,
    /// Atmosphere height in meters
    pub atmosphere_height: f64,
    /// Atmosphere color (RGB hex)
    pub atmosphere_color: u32,
    /// Ring system (inner radius, outer radius) in meters
    pub rings: Option<(f64, f64)>,
}

impl Default for BodyVisuals {
    fn default() -> Self {
        Self {
            color: 0x808080, // Gray
            texture: None,
            emission: 0.0,
            has_atmosphere: false,
            atmosphere_height: 0.0,
            atmosphere_color: 0x87CEEB,
            rings: None,
        }
    }
}

/// A celestial body in the simulation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Body {
    /// Unique identifier
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Type of body
    pub body_type: BodyType,

    /// Mass in kilograms
    pub mass: f64,

    /// Radius in meters
    pub radius: f64,

    /// Position in meters (world frame)
    pub position: Vec3,

    /// Velocity in meters per second (world frame)
    pub velocity: Vec3,

    /// Acceleration in m/s² (computed each step)
    #[serde(skip)]
    pub acceleration: Vec3,

    /// Previous acceleration (for Velocity Verlet)
    #[serde(skip)]
    pub prev_acceleration: Vec3,

    /// Is this body fixed (not affected by gravity)?
    pub fixed: bool,

    /// Is this body active in the simulation?
    pub active: bool,

    /// Physical properties
    pub properties: BodyProperties,

    /// Visual properties
    pub visuals: BodyVisuals,

    /// Parent body ID for hierarchical systems
    pub parent_id: Option<String>,

    /// Calculated sphere of influence radius (meters)
    #[serde(skip)]
    pub soi_radius: f64,

    /// Owner player ID (for spacecraft)
    pub owner_id: Option<String>,
}

impl Body {
    /// Create a new body with minimal parameters
    pub fn new(id: impl Into<String>, name: impl Into<String>, mass: f64, radius: f64) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            body_type: BodyType::default(),
            mass,
            radius,
            position: Vec3::zero(),
            velocity: Vec3::zero(),
            acceleration: Vec3::zero(),
            prev_acceleration: Vec3::zero(),
            fixed: false,
            active: true,
            properties: BodyProperties::default(),
            visuals: BodyVisuals::default(),
            parent_id: None,
            soi_radius: 0.0,
            owner_id: None,
        }
    }

    /// Create a star
    pub fn star(id: impl Into<String>, name: impl Into<String>, mass: f64, radius: f64) -> Self {
        let mut body = Self::new(id, name, mass, radius);
        body.body_type = BodyType::Star;
        body.properties.density = mass / (4.0 / 3.0 * std::f64::consts::PI * radius.powi(3));
        body.visuals.emission = 1.0;
        body.visuals.color = 0xFFFF00; // Yellow
        body
    }

    /// Create a planet
    pub fn planet(id: impl Into<String>, name: impl Into<String>, mass: f64, radius: f64) -> Self {
        let mut body = Self::new(id, name, mass, radius);
        body.body_type = BodyType::Planet;
        body.properties.density = mass / (4.0 / 3.0 * std::f64::consts::PI * radius.powi(3));
        body
    }

    /// Create a moon
    pub fn moon(
        id: impl Into<String>,
        name: impl Into<String>,
        mass: f64,
        radius: f64,
        parent_id: impl Into<String>,
    ) -> Self {
        let mut body = Self::new(id, name, mass, radius);
        body.body_type = BodyType::Moon;
        body.parent_id = Some(parent_id.into());
        body
    }

    /// Create a spacecraft
    pub fn spacecraft(
        id: impl Into<String>,
        name: impl Into<String>,
        mass: f64,
        owner_id: Option<String>,
    ) -> Self {
        let mut body = Self::new(id, name, mass, 10.0); // 10m default spacecraft size
        body.body_type = BodyType::Spacecraft;
        body.owner_id = owner_id;
        body.visuals.color = 0x00FF00; // Green
        body
    }

    /// Create a test particle (massless)
    pub fn test_particle(id: impl Into<String>) -> Self {
        let mut body = Self::new(id, "Test Particle", 0.0, 1.0);
        body.body_type = BodyType::TestParticle;
        body
    }

    /// Set position
    pub fn with_position(mut self, position: Vec3) -> Self {
        self.position = position;
        self
    }

    /// Set velocity
    pub fn with_velocity(mut self, velocity: Vec3) -> Self {
        self.velocity = velocity;
        self
    }

    /// Set position from array
    pub fn at_position(mut self, x: f64, y: f64, z: f64) -> Self {
        self.position = Vec3::new(x, y, z);
        self
    }

    /// Set velocity from array
    pub fn with_velocity_xyz(mut self, vx: f64, vy: f64, vz: f64) -> Self {
        self.velocity = Vec3::new(vx, vy, vz);
        self
    }

    /// Set the body as fixed (unaffected by gravity)
    pub fn fixed(mut self) -> Self {
        self.fixed = true;
        self
    }

    /// Validate the body's parameters
    pub fn validate(&self) -> PhysicsResult<()> {
        if self.mass < 0.0 {
            return Err(PhysicsError::new(
                ErrorCode::InvalidBodyParams,
                format!("Body '{}' has negative mass: {}", self.id, self.mass),
            ));
        }

        if self.radius < 0.0 {
            return Err(PhysicsError::new(
                ErrorCode::InvalidBodyParams,
                format!("Body '{}' has negative radius: {}", self.id, self.radius),
            ));
        }

        if !self.position.is_finite() {
            return Err(PhysicsError::new(
                ErrorCode::InvalidBodyParams,
                format!("Body '{}' has non-finite position", self.id),
            ));
        }

        if !self.velocity.is_finite() {
            return Err(PhysicsError::new(
                ErrorCode::InvalidBodyParams,
                format!("Body '{}' has non-finite velocity", self.id),
            ));
        }

        Ok(())
    }

    /// Check if this body has significant mass
    pub fn has_mass(&self) -> bool {
        self.mass > f64::EPSILON
    }

    /// Calculate gravitational parameter (μ = GM)
    pub fn mu(&self) -> f64 {
        crate::G * self.mass
    }

    /// Calculate kinetic energy
    pub fn kinetic_energy(&self) -> f64 {
        0.5 * self.mass * self.velocity.magnitude_squared()
    }

    /// Calculate momentum
    pub fn momentum(&self) -> Vec3 {
        self.velocity * self.mass
    }

    /// Calculate angular momentum about origin
    pub fn angular_momentum(&self) -> Vec3 {
        self.position.cross(self.momentum())
    }

    /// Calculate escape velocity at surface
    pub fn escape_velocity(&self) -> f64 {
        if self.radius > 0.0 {
            (2.0 * self.mu() / self.radius).sqrt()
        } else {
            0.0
        }
    }

    /// Calculate orbital velocity for circular orbit at given radius
    pub fn circular_velocity(&self, orbital_radius: f64) -> f64 {
        if orbital_radius > 0.0 {
            (self.mu() / orbital_radius).sqrt()
        } else {
            0.0
        }
    }

    /// Check if another body would collide with this one
    pub fn collides_with(&self, other: &Body) -> bool {
        let dist_sq = self.position.distance_squared(other.position);
        let min_dist = self.radius + other.radius;
        dist_sq <= min_dist * min_dist
    }

    /// Get distance to another body
    pub fn distance_to(&self, other: &Body) -> f64 {
        self.position.distance(other.position)
    }

    /// Get the surface gravity in m/s²
    pub fn surface_gravity(&self) -> f64 {
        if self.radius > 0.0 {
            self.mu() / (self.radius * self.radius)
        } else {
            0.0
        }
    }

    /// Calculate volume assuming spherical body
    pub fn volume(&self) -> f64 {
        (4.0 / 3.0) * std::f64::consts::PI * self.radius.powi(3)
    }

    /// Calculate radius from mass and density
    pub fn radius_from_density(mass: f64, density: f64) -> f64 {
        ((3.0 * mass) / (4.0 * std::f64::consts::PI * density)).powf(1.0 / 3.0)
    }

    /// Clone this body with a new ID
    pub fn clone_with_id(&self, new_id: impl Into<String>) -> Self {
        let mut cloned = self.clone();
        cloned.id = new_id.into();
        cloned
    }
}

impl Default for Body {
    fn default() -> Self {
        Self::new("default", "Default Body", 1.0, 1.0)
    }
}

/// Compact body state for network transmission
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BodyState {
    pub id: String,
    pub position: [f64; 3],
    pub velocity: [f64; 3],
    pub mass: f64,
    pub radius: f64,
    pub active: bool,
}

impl From<&Body> for BodyState {
    fn from(body: &Body) -> Self {
        Self {
            id: body.id.clone(),
            position: body.position.to_array(),
            velocity: body.velocity.to_array(),
            mass: body.mass,
            radius: body.radius,
            active: body.active,
        }
    }
}

impl BodyState {
    /// Apply this state to a body
    pub fn apply_to(&self, body: &mut Body) {
        body.position = Vec3::from_array(self.position);
        body.velocity = Vec3::from_array(self.velocity);
        body.mass = self.mass;
        body.radius = self.radius;
        body.active = self.active;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_body_creation() {
        let body = Body::new("earth", "Earth", 5.972e24, 6.371e6);
        assert_eq!(body.id, "earth");
        assert_eq!(body.mass, 5.972e24);
    }

    #[test]
    fn test_body_validation() {
        let valid = Body::new("test", "Test", 1e10, 1000.0);
        assert!(valid.validate().is_ok());

        let mut invalid = valid.clone();
        invalid.mass = -1.0;
        assert!(invalid.validate().is_err());
    }

    #[test]
    fn test_kinetic_energy() {
        let body = Body::new("test", "Test", 1000.0, 1.0).with_velocity_xyz(100.0, 0.0, 0.0);

        // KE = 0.5 * m * v² = 0.5 * 1000 * 100² = 5,000,000 J
        assert!((body.kinetic_energy() - 5_000_000.0).abs() < 1.0);
    }

    #[test]
    fn test_collision_detection() {
        let body1 = Body::new("a", "A", 1e10, 1000.0).at_position(0.0, 0.0, 0.0);

        let body2 = Body::new("b", "B", 1e10, 1000.0).at_position(2500.0, 0.0, 0.0);

        assert!(!body1.collides_with(&body2)); // 2500 > 1000 + 1000

        let body3 = Body::new("c", "C", 1e10, 1000.0).at_position(1500.0, 0.0, 0.0);

        assert!(body1.collides_with(&body3)); // 1500 < 2000
    }

    #[test]
    fn test_circular_velocity() {
        // Earth parameters
        let earth = Body::new("earth", "Earth", 5.972e24, 6.371e6);

        // Circular velocity at 400km altitude (ISS orbit)
        let orbit_radius = 6.371e6 + 400_000.0;
        let v_circ = earth.circular_velocity(orbit_radius);

        // ISS orbits at ~7.66 km/s
        assert!((v_circ - 7660.0).abs() < 100.0);
    }
}
