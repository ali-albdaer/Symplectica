//! Collision detection and handling
//!
//! Implements inelastic collision merging that conserves mass and momentum.

use crate::body::{Body, BodyId};
use crate::vector::Vec3;

/// Result of collision detection
#[derive(Debug, Clone)]
pub struct CollisionEvent {
    /// ID of first body
    pub body_a: BodyId,
    /// ID of second body
    pub body_b: BodyId,
    /// Collision point (midpoint between surfaces)
    pub contact_point: Vec3,
    /// Relative velocity at impact
    pub relative_velocity: Vec3,
}

/// Detect collisions between bodies.
/// Returns a list of collision events (pairs of colliding bodies).
pub fn detect_collisions(bodies: &[Body]) -> Vec<CollisionEvent> {
    let mut collisions = Vec::new();
    let n = bodies.len();

    // O(N²) pairwise collision check
    // Could be optimized with spatial partitioning for large N
    for i in 0..n {
        if !bodies[i].is_active {
            continue;
        }

        for j in (i + 1)..n {
            if !bodies[j].is_active {
                continue;
            }

            let distance = bodies[i].position.distance(bodies[j].position);
            let combined_radius = bodies[i].collision_radius + bodies[j].collision_radius;

            if distance < combined_radius {
                let direction = (bodies[j].position - bodies[i].position).normalize();
                let contact_point = bodies[i].position + direction * bodies[i].collision_radius;
                let relative_velocity = bodies[j].velocity - bodies[i].velocity;

                collisions.push(CollisionEvent {
                    body_a: bodies[i].id,
                    body_b: bodies[j].id,
                    contact_point,
                    relative_velocity,
                });
            }
        }
    }

    collisions
}

/// Perform inelastic collision merging.
/// 
/// Merges body B into body A, conserving:
/// - Total mass (m_a + m_b)
/// - Linear momentum (m_a * v_a + m_b * v_b = m_total * v_new)
/// 
/// The merged body takes the position of the center of mass.
/// Body B is marked as inactive.
pub fn merge_bodies(bodies: &mut [Body], id_a: BodyId, id_b: BodyId) -> Result<(), &'static str> {
    // Find indices
    let idx_a = bodies.iter().position(|b| b.id == id_a)
        .ok_or("Body A not found")?;
    let idx_b = bodies.iter().position(|b| b.id == id_b)
        .ok_or("Body B not found")?;

    if idx_a == idx_b {
        return Err("Cannot merge body with itself");
    }

    // Determine which body is more massive (absorber)
    let (absorber_idx, absorbed_idx) = if bodies[idx_a].mass >= bodies[idx_b].mass {
        (idx_a, idx_b)
    } else {
        (idx_b, idx_a)
    };

    // Get values from absorbed body before modifying
    let absorbed_mass = bodies[absorbed_idx].mass;
    let absorbed_position = bodies[absorbed_idx].position;
    let absorbed_velocity = bodies[absorbed_idx].velocity;

    // Calculate new properties
    let total_mass = bodies[absorber_idx].mass + absorbed_mass;
    
    // Conservation of momentum: p = m*v
    let new_velocity = (bodies[absorber_idx].velocity * bodies[absorber_idx].mass 
        + absorbed_velocity * absorbed_mass) / total_mass;
    
    // Center of mass position
    let new_position = (bodies[absorber_idx].position * bodies[absorber_idx].mass 
        + absorbed_position * absorbed_mass) / total_mass;
    
    // New radius (assuming constant mean density)
    // V ∝ m, so r³ ∝ m, thus r_new = r_old * (m_new/m_old)^(1/3)
    let volume_ratio = total_mass / bodies[absorber_idx].mass;
    let new_radius = bodies[absorber_idx].radius * volume_ratio.powf(1.0 / 3.0);
    let new_collision_radius = bodies[absorber_idx].collision_radius * volume_ratio.powf(1.0 / 3.0);

    // Apply changes to absorber
    bodies[absorber_idx].mass = total_mass;
    bodies[absorber_idx].velocity = new_velocity;
    bodies[absorber_idx].position = new_position;
    bodies[absorber_idx].radius = new_radius;
    bodies[absorber_idx].collision_radius = new_collision_radius;

    // Mark absorbed body as inactive
    bodies[absorbed_idx].is_active = false;
    bodies[absorbed_idx].mass = 0.0;

    Ok(())
}

/// Process all detected collisions, merging bodies as needed.
/// Returns the number of merges performed.
pub fn process_collisions(bodies: &mut [Body]) -> usize {
    let mut merge_count = 0;
    
    loop {
        let collisions = detect_collisions(bodies);
        
        if collisions.is_empty() {
            break;
        }

        // Process first collision (may create new collisions)
        if let Some(collision) = collisions.first() {
            if merge_bodies(bodies, collision.body_a, collision.body_b).is_ok() {
                merge_count += 1;
            }
        }

        // Safety limit to prevent infinite loops
        if merge_count > 1000 {
            break;
        }
    }

    merge_count
}

/// Check if a body is inside another body's Roche limit
/// r_Roche ≈ 2.44 * R_primary * (ρ_primary / ρ_secondary)^(1/3)
/// 
/// For spherical bodies with uniform density: ρ = 3m / (4πr³)
/// Uses collision_radius for physical radius.
pub fn is_inside_roche_limit(primary: &Body, secondary: &Body) -> bool {
    if primary.collision_radius <= 0.0 || secondary.collision_radius <= 0.0 {
        return false;
    }

    // Calculate densities (ρ = 3m / 4πr³) using collision_radius as physical radius
    let rho_primary = 3.0 * primary.mass / (4.0 * std::f64::consts::PI * primary.collision_radius.powi(3));
    let rho_secondary = 3.0 * secondary.mass / (4.0 * std::f64::consts::PI * secondary.collision_radius.powi(3));

    if rho_secondary <= 0.0 {
        return false;
    }

    // Roche limit
    let roche_limit = 2.44 * primary.collision_radius * (rho_primary / rho_secondary).powf(1.0 / 3.0);

    let distance = primary.position.distance(secondary.position);
    distance < roche_limit
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::constants::*;

    #[test]
    fn test_collision_detection() {
        let bodies = vec![
            Body::new(0, "A", BodyType::Asteroid, 1e10, 1000.0, 
                Vec3::new(0.0, 0.0, 0.0), Vec3::new(10.0, 0.0, 0.0)),
            Body::new(1, "B", BodyType::Asteroid, 1e10, 1000.0, 
                Vec3::new(1500.0, 0.0, 0.0), Vec3::new(-10.0, 0.0, 0.0)),
        ];

        let collisions = detect_collisions(&bodies);
        assert_eq!(collisions.len(), 1);
        assert_eq!(collisions[0].body_a, 0);
        assert_eq!(collisions[0].body_b, 1);
    }

    #[test]
    fn test_no_collision() {
        let bodies = vec![
            Body::new(0, "A", BodyType::Asteroid, 1e10, 1000.0, 
                Vec3::new(0.0, 0.0, 0.0), Vec3::new(10.0, 0.0, 0.0)),
            Body::new(1, "B", BodyType::Asteroid, 1e10, 1000.0, 
                Vec3::new(10000.0, 0.0, 0.0), Vec3::new(-10.0, 0.0, 0.0)),
        ];

        let collisions = detect_collisions(&bodies);
        assert!(collisions.is_empty());
    }

    #[test]
    fn test_merge_momentum_conservation() {
        let mut bodies = vec![
            Body::new(0, "A", BodyType::Asteroid, 100.0, 10.0, 
                Vec3::new(0.0, 0.0, 0.0), Vec3::new(10.0, 0.0, 0.0)),
            Body::new(1, "B", BodyType::Asteroid, 50.0, 8.0, 
                Vec3::new(15.0, 0.0, 0.0), Vec3::new(-5.0, 0.0, 0.0)),
        ];

        // Total momentum before: 100*10 + 50*(-5) = 1000 - 250 = 750
        let momentum_before = bodies[0].mass * bodies[0].velocity + 
                             bodies[1].mass * bodies[1].velocity;

        merge_bodies(&mut bodies, 0, 1).unwrap();

        // Total momentum after
        let momentum_after = bodies[0].mass * bodies[0].velocity;

        assert!((momentum_before.x - momentum_after.x).abs() < 1e-10);
        assert_eq!(bodies[0].mass, 150.0);
        assert!(!bodies[1].is_active);
    }

    #[test]
    fn test_merge_mass_conservation() {
        let mut bodies = vec![
            Body::new(0, "A", BodyType::Asteroid, 100.0, 10.0, 
                Vec3::ZERO, Vec3::ZERO),
            Body::new(1, "B", BodyType::Asteroid, 50.0, 8.0, 
                Vec3::new(15.0, 0.0, 0.0), Vec3::ZERO),
        ];

        let mass_before: f64 = bodies.iter().map(|b| b.mass).sum();
        
        merge_bodies(&mut bodies, 0, 1).unwrap();

        let mass_after: f64 = bodies.iter().filter(|b| b.is_active).map(|b| b.mass).sum();

        assert!((mass_before - mass_after).abs() < 1e-10);
    }

    #[test]
    fn test_roche_limit() {
        // Earth-Moon system
        let earth = Body::new(0, "Earth", BodyType::Planet, M_EARTH, R_EARTH, 
            Vec3::ZERO, Vec3::ZERO);
        
        // Moon at current distance (~384,400 km)
        let moon_far = Body::new(1, "Moon", BodyType::Moon, M_MOON, R_MOON, 
            Vec3::new(3.844e8, 0.0, 0.0), Vec3::ZERO);

        // Moon very close (inside Roche limit)
        let moon_close = Body::new(2, "Moon", BodyType::Moon, M_MOON, R_MOON, 
            Vec3::new(1.0e7, 0.0, 0.0), Vec3::ZERO);

        assert!(!is_inside_roche_limit(&earth, &moon_far));
        assert!(is_inside_roche_limit(&earth, &moon_close));
    }
}
