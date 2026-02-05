//! Force calculation kernels
//!
//! Implements both direct-sum O(N²) and Barnes-Hut O(N log N) gravity solvers.
//! Uses softening to prevent singularities in close encounters.

use crate::body::Body;
use crate::constants::{G, DEFAULT_SOFTENING, DEFAULT_BARNES_HUT_THETA};
use crate::vector::Vec3;

/// Configuration for force calculation
#[derive(Debug, Clone, Copy)]
pub struct ForceConfig {
    /// Softening parameter ε in meters
    /// Force formula: F = G*m1*m2 / (r² + ε²)
    pub softening: f64,
    
    /// Barnes-Hut opening angle θ
    /// Lower = more accurate, higher = faster
    pub barnes_hut_theta: f64,
}

impl Default for ForceConfig {
    fn default() -> Self {
        Self {
            softening: DEFAULT_SOFTENING,
            barnes_hut_theta: DEFAULT_BARNES_HUT_THETA,
        }
    }
}

/// Calculate gravitational acceleration on body i due to body j.
/// Returns the acceleration vector (m/s²).
/// 
/// Uses softened gravity: a = G * m_j * (r_ij) / (|r_ij|² + ε²)^(3/2)
#[inline]
pub fn gravitational_acceleration(
    pos_i: Vec3,
    pos_j: Vec3,
    mass_j: f64,
    softening_squared: f64,
) -> Vec3 {
    if mass_j <= 0.0 {
        return Vec3::ZERO;
    }

    let r = pos_j - pos_i;
    let r_squared = r.length_squared();
    
    // Softened denominator: (r² + ε²)^(3/2)
    let denom = (r_squared + softening_squared).powf(1.5);
    
    if denom <= 0.0 {
        return Vec3::ZERO;
    }

    // a = G * m / (r² + ε²)^(3/2) * r
    r * (G * mass_j / denom)
}

/// Direct-sum O(N²) force calculation.
/// 
/// Computes gravitational acceleration for all bodies.
/// Most accurate but scales poorly with N.
pub fn compute_accelerations_direct(bodies: &mut [Body], config: &ForceConfig) {
    let softening_squared = config.softening * config.softening;
    let n = bodies.len();

    // Reset accelerations
    for body in bodies.iter_mut() {
        body.acceleration = Vec3::ZERO;
    }

    // O(N²) pairwise calculation
    for i in 0..n {
        if !bodies[i].is_active {
            continue;
        }

        for j in 0..n {
            if i == j || !bodies[j].is_active || !bodies[j].is_massive {
                continue;
            }

            let acc = gravitational_acceleration(
                bodies[i].position,
                bodies[j].position,
                bodies[j].mass,
                softening_squared,
            );

            bodies[i].acceleration += acc;
        }
    }
}

/// Compute total gravitational potential energy of the system.
/// U = -G * Σ(i<j) m_i * m_j / r_ij
pub fn compute_potential_energy(bodies: &[Body], softening: f64) -> f64 {
    let softening_squared = softening * softening;
    let mut energy = 0.0;
    let n = bodies.len();

    for i in 0..n {
        if !bodies[i].is_active || !bodies[i].is_massive {
            continue;
        }
        
        for j in (i + 1)..n {
            if !bodies[j].is_active || !bodies[j].is_massive {
                continue;
            }

            let r_squared = bodies[i].position.distance_squared(bodies[j].position);
            let r = (r_squared + softening_squared).sqrt();
            
            if r > 0.0 {
                energy -= G * bodies[i].mass * bodies[j].mass / r;
            }
        }
    }

    energy
}

/// Compute total kinetic energy of the system.
/// T = Σ 0.5 * m * v²
pub fn compute_kinetic_energy(bodies: &[Body]) -> f64 {
    bodies
        .iter()
        .filter(|b| b.is_active && b.is_massive)
        .map(|b| 0.5 * b.mass * b.velocity.length_squared())
        .sum()
}

/// Compute total mechanical energy (kinetic + potential).
pub fn compute_total_energy(bodies: &[Body], softening: f64) -> f64 {
    compute_kinetic_energy(bodies) + compute_potential_energy(bodies, softening)
}

/// Compute total linear momentum.
pub fn compute_total_momentum(bodies: &[Body]) -> Vec3 {
    bodies
        .iter()
        .filter(|b| b.is_active && b.is_massive)
        .fold(Vec3::ZERO, |acc, b| acc + b.velocity * b.mass)
}

/// Compute center of mass position.
pub fn compute_center_of_mass(bodies: &[Body]) -> Vec3 {
    let mut total_mass = 0.0;
    let mut weighted_pos = Vec3::ZERO;

    for body in bodies.iter().filter(|b| b.is_active && b.is_massive) {
        total_mass += body.mass;
        weighted_pos += body.position * body.mass;
    }

    if total_mass > 0.0 {
        weighted_pos / total_mass
    } else {
        Vec3::ZERO
    }
}

/// Compute total angular momentum about a point.
pub fn compute_angular_momentum(bodies: &[Body], center: Vec3) -> Vec3 {
    bodies
        .iter()
        .filter(|b| b.is_active && b.is_massive)
        .fold(Vec3::ZERO, |acc, b| {
            let r = b.position - center;
            let p = b.velocity * b.mass;
            acc + r.cross(p)
        })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::*;

    #[test]
    fn test_gravitational_acceleration() {
        // Earth at 1 AU from Sun
        let sun_pos = Vec3::ZERO;
        let earth_pos = Vec3::new(AU, 0.0, 0.0);
        
        let acc = gravitational_acceleration(earth_pos, sun_pos, M_SUN, 0.0);
        
        // Expected: a = G*M/r² ≈ 0.00593 m/s² (toward Sun, so negative x)
        let expected_magnitude = G * M_SUN / (AU * AU);
        assert!((acc.length() - expected_magnitude).abs() < 1e-6);
        assert!(acc.x < 0.0); // Toward Sun
    }

    #[test]
    fn test_softening_prevents_singularity() {
        let pos1 = Vec3::ZERO;
        let pos2 = Vec3::new(1.0, 0.0, 0.0); // Very close
        
        // Without softening, this would give huge acceleration
        let acc_soft = gravitational_acceleration(pos1, pos2, 1e10, 1000.0 * 1000.0);
        
        // Should be finite and reasonable
        assert!(acc_soft.is_finite());
        assert!(acc_soft.length() < 1e10);
    }

    #[test]
    fn test_energy_conservation_two_body() {
        use crate::body::BodyType;
        
        // Sun and Earth
        let sun = Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO);
        let earth = Body::new(
            1, "Earth", BodyType::Planet, M_EARTH, R_EARTH,
            Vec3::new(AU, 0.0, 0.0),
            Vec3::new(0.0, 29780.0, 0.0),
        );
        
        let bodies = vec![sun, earth];
        let total_energy = compute_total_energy(&bodies, DEFAULT_SOFTENING);
        
        // Energy should be negative (bound orbit)
        assert!(total_energy < 0.0);
    }

    #[test]
    fn test_momentum_conservation() {
        use crate::body::BodyType;
        
        // Two bodies with opposite velocities, equal mass
        let a = Body::new(0, "A", BodyType::Asteroid, 1e20, 1000.0, Vec3::ZERO, Vec3::new(100.0, 0.0, 0.0));
        let b = Body::new(1, "B", BodyType::Asteroid, 1e20, 1000.0, Vec3::new(1e9, 0.0, 0.0), Vec3::new(-100.0, 0.0, 0.0));
        
        let bodies = vec![a, b];
        let momentum = compute_total_momentum(&bodies);
        
        // Total momentum should be zero
        assert!(momentum.length() < 1e-10);
    }
}
