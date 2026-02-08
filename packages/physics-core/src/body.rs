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
    /// Spacecraft - artificial object (player or NPC)
    Spacecraft = 5,
    /// TestParticle - massless particle for visualization
    TestParticle = 6,
}

impl Default for BodyType {
    fn default() -> Self {
        Self::Asteroid
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
}

impl Atmosphere {
    /// Earth-like atmosphere parameters
    pub fn earth_like() -> Self {
        Self {
            scale_height: 8500.0,
            // Rayleigh coefficients for RGB wavelengths (680nm, 550nm, 440nm)
            rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
            mie_coefficient: 21.0e-6,
            mie_direction: 0.758,
            height: 100_000.0, // 100 km
        }
    }

    /// Mars-like thin atmosphere
    pub fn mars_like() -> Self {
        Self {
            scale_height: 11100.0,
            rayleigh_coefficients: [19.918e-6, 13.57e-6, 5.75e-6], // Reddish
            mie_coefficient: 4.0e-6,
            mie_direction: 0.9,
            height: 200_000.0,
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Body {
    /// Unique identifier
    pub id: BodyId,
    
    /// Human-readable name
    pub name: String,
    
    /// Type of body
    pub body_type: BodyType,
    
    /// Mass in kilograms
    pub mass: f64,
    
    /// Radius in meters
    pub radius: f64,
    
    /// Position in meters (world coordinates)
    pub position: Vec3,
    
    /// Velocity in meters per second
    pub velocity: Vec3,
    
    /// Acceleration in meters per second² (computed each step)
    pub acceleration: Vec3,
    
    /// Previous acceleration (for Velocity Verlet)
    pub prev_acceleration: Vec3,
    
    /// Optional atmosphere parameters
    pub atmosphere: Option<Atmosphere>,
    
    /// Albedo (reflectivity, 0-1)
    pub albedo: f64,
    
    /// Surface color RGB (0-1 each)
    pub color: [f64; 3],
    
    /// Is this body affected by gravity? (false = test particle)
    pub is_massive: bool,
    
    /// Is this body active in the simulation?
    pub is_active: bool,
    
    /// Parent body ID for hierarchical systems (e.g., moon orbiting planet)
    pub parent_id: Option<BodyId>,
}

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
            atmosphere: None,
            albedo: 0.3,
            color: [1.0, 1.0, 1.0],
            is_massive: mass > 0.0,
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

    /// Check if this body collides with another.
    pub fn collides_with(&self, other: &Body) -> bool {
        let distance = self.position.distance(other.position);
        distance < self.radius + other.radius
    }

    /// Merge another body into this one (inelastic collision).
    /// Conserves mass and linear momentum.
    pub fn merge(&mut self, other: &Body) {
        let total_mass = self.mass + other.mass;
        if total_mass <= 0.0 {
            return;
        }

        // Conserve momentum: m1*v1 + m2*v2 = (m1+m2)*v_new
        self.velocity = (self.velocity * self.mass + other.velocity * other.mass) / total_mass;

        // Position at center of mass
        self.position = (self.position * self.mass + other.position * other.mass) / total_mass;

        // Update mass
        self.mass = total_mass;

        // Update radius assuming constant density (r ∝ m^(1/3))
        let volume_ratio = total_mass / self.mass;
        self.radius *= volume_ratio.powf(1.0 / 3.0);

        // Mark as still active
        self.is_active = true;
    }

    /// Validate that the body has physical values.
    pub fn is_valid(&self) -> bool {
        self.mass >= 0.0
            && self.radius > 0.0
            && self.position.is_finite()
            && self.velocity.is_finite()
            && self.acceleration.is_finite()
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
            atmosphere: None,
            albedo: 0.3,
            color: [1.0, 1.0, 1.0],
            is_massive: true,
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
    fn test_merge_momentum() {
        let mut a = Body::new(0, "A", BodyType::Asteroid, 100.0, 10.0, Vec3::ZERO, Vec3::new(10.0, 0.0, 0.0));
        let b = Body::new(1, "B", BodyType::Asteroid, 100.0, 10.0, Vec3::new(25.0, 0.0, 0.0), Vec3::new(-10.0, 0.0, 0.0));
        
        // Total momentum before: 100*10 + 100*(-10) = 0
        let momentum_before = a.mass * a.velocity.x + b.mass * b.velocity.x;
        
        a.merge(&b);
        
        // Total momentum after should still be 0
        let momentum_after = a.mass * a.velocity.x;
        
        assert!((momentum_before - momentum_after).abs() < 1e-10);
        assert_eq!(a.mass, 200.0);
    }
}
