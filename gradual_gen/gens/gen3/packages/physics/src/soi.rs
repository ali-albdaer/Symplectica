//! Sphere of Influence (SOI) calculations
//!
//! SOI is used for patched-conic approximations and determining
//! which body is the primary gravitational influence.

use crate::{body::Body, vec3::Vec3};

/// Calculate the Laplace Sphere of Influence radius
///
/// Formula: r_SOI ≈ a * (m / M)^(2/5)
///
/// # Arguments
/// * `semi_major_axis` - Semi-major axis of the smaller body's orbit around primary (m)
/// * `mass_small` - Mass of the smaller body (kg)
/// * `mass_primary` - Mass of the primary body (kg)
///
/// # Returns
/// SOI radius in meters
pub fn laplace_soi(semi_major_axis: f64, mass_small: f64, mass_primary: f64) -> f64 {
    if mass_primary <= 0.0 || mass_small <= 0.0 || semi_major_axis <= 0.0 {
        return 0.0;
    }
    semi_major_axis * (mass_small / mass_primary).powf(0.4)
}

/// Calculate the Hill radius (sphere)
///
/// Formula: r_H ≈ a * (m / (3*M))^(1/3)
///
/// # Arguments
/// * `semi_major_axis` - Semi-major axis of the smaller body's orbit around primary (m)
/// * `mass_small` - Mass of the smaller body (kg)
/// * `mass_primary` - Mass of the primary body (kg)
///
/// # Returns
/// Hill radius in meters
pub fn hill_radius(semi_major_axis: f64, mass_small: f64, mass_primary: f64) -> f64 {
    if mass_primary <= 0.0 || mass_small <= 0.0 || semi_major_axis <= 0.0 {
        return 0.0;
    }
    semi_major_axis * (mass_small / (3.0 * mass_primary)).powf(1.0 / 3.0)
}

/// Calculate the Roche limit (rigid body approximation)
///
/// This is the distance within which a body held together only by
/// gravity will be torn apart by tidal forces.
///
/// Formula: d ≈ R_primary * (2 * ρ_primary / ρ_satellite)^(1/3)
///
/// # Arguments
/// * `primary_radius` - Radius of the primary body (m)
/// * `primary_density` - Density of the primary body (kg/m³)
/// * `satellite_density` - Density of the satellite (kg/m³)
///
/// # Returns
/// Roche limit distance in meters
pub fn roche_limit_rigid(
    primary_radius: f64,
    primary_density: f64,
    satellite_density: f64,
) -> f64 {
    if satellite_density <= 0.0 {
        return f64::INFINITY;
    }
    primary_radius * (2.0 * primary_density / satellite_density).powf(1.0 / 3.0)
}

/// Calculate the Roche limit (fluid body approximation)
///
/// Formula: d ≈ 2.44 * R_primary * (ρ_primary / ρ_satellite)^(1/3)
pub fn roche_limit_fluid(
    primary_radius: f64,
    primary_density: f64,
    satellite_density: f64,
) -> f64 {
    if satellite_density <= 0.0 {
        return f64::INFINITY;
    }
    2.44 * primary_radius * (primary_density / satellite_density).powf(1.0 / 3.0)
}

/// Determine which body is the primary gravitational influence at a given position
///
/// Returns the index of the body with the largest gravitational influence
/// (smallest mu/r² ratio where larger gravity dominates)
pub fn find_primary_body(position: Vec3, bodies: &[Body]) -> Option<usize> {
    if bodies.is_empty() {
        return None;
    }

    let mut best_idx = 0;
    let mut best_influence = 0.0f64;

    for (idx, body) in bodies.iter().enumerate() {
        if !body.active || !body.has_mass() {
            continue;
        }

        let dist_sq = position.distance_squared(body.position);
        if dist_sq < f64::EPSILON {
            return Some(idx); // Inside or at center of body
        }

        // Gravitational influence ∝ M / r²
        let influence = body.mass / dist_sq;

        if influence > best_influence {
            best_influence = influence;
            best_idx = idx;
        }
    }

    if best_influence > 0.0 {
        Some(best_idx)
    } else {
        None
    }
}

/// Check if a position is within a body's SOI
pub fn is_within_soi(position: Vec3, body: &Body) -> bool {
    if body.soi_radius <= 0.0 {
        return false;
    }
    position.distance_squared(body.position) <= body.soi_radius * body.soi_radius
}

/// Calculate SOI radii for all bodies relative to their parent
///
/// Updates the `soi_radius` field of each body
pub fn calculate_soi_radii(bodies: &mut [Body]) {
    // First pass: find the central body (typically the star/sun)
    let central_idx = bodies
        .iter()
        .enumerate()
        .filter(|(_, b)| b.active && b.has_mass())
        .max_by(|(_, a), (_, b)| a.mass.partial_cmp(&b.mass).unwrap())
        .map(|(idx, _)| idx);

    let Some(central_idx) = central_idx else {
        return;
    };

    let central_mass = bodies[central_idx].mass;
    let central_pos = bodies[central_idx].position;

    // Second pass: calculate SOI for each body relative to central
    for (idx, body) in bodies.iter_mut().enumerate() {
        if idx == central_idx {
            // Central body has infinite SOI (or very large)
            body.soi_radius = f64::MAX / 2.0;
            continue;
        }

        if !body.active || !body.has_mass() {
            body.soi_radius = 0.0;
            continue;
        }

        // Use distance to central body as semi-major axis approximation
        let distance = body.position.distance(central_pos);

        if distance > f64::EPSILON {
            body.soi_radius = laplace_soi(distance, body.mass, central_mass);
        } else {
            body.soi_radius = 0.0;
        }
    }

    // Third pass: for moons, calculate SOI relative to their parent planet
    for i in 0..bodies.len() {
        if let Some(ref parent_id) = bodies[i].parent_id.clone() {
            // Find parent
            if let Some(parent_idx) = bodies.iter().position(|b| &b.id == parent_id) {
                let parent_mass = bodies[parent_idx].mass;
                let parent_pos = bodies[parent_idx].position;
                let distance = bodies[i].position.distance(parent_pos);

                if distance > f64::EPSILON && parent_mass > f64::EPSILON {
                    bodies[i].soi_radius = laplace_soi(distance, bodies[i].mass, parent_mass);
                }
            }
        }
    }
}

/// SOI transition event
#[derive(Debug, Clone)]
pub struct SoiTransition {
    /// Body that transitioned
    pub body_id: String,
    /// Previous primary body ID
    pub from_primary: Option<String>,
    /// New primary body ID  
    pub to_primary: Option<String>,
    /// Position at transition
    pub position: Vec3,
    /// Simulation tick when transition occurred
    pub tick: u64,
}

/// Detect SOI transitions for all bodies
pub fn detect_soi_transitions(
    bodies: &[Body],
    previous_primaries: &[Option<usize>],
    tick: u64,
) -> Vec<SoiTransition> {
    let mut transitions = Vec::new();

    for (idx, body) in bodies.iter().enumerate() {
        if !body.active {
            continue;
        }

        let current_primary = find_primary_body(body.position, bodies);

        if current_primary != previous_primaries.get(idx).copied().flatten() {
            transitions.push(SoiTransition {
                body_id: body.id.clone(),
                from_primary: previous_primaries
                    .get(idx)
                    .and_then(|p| p.map(|i| bodies.get(i).map(|b| b.id.clone())))
                    .flatten(),
                to_primary: current_primary.map(|i| bodies[i].id.clone()),
                position: body.position,
                tick,
            });
        }
    }

    transitions
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_earth_soi() {
        // Earth's SOI around the Sun
        let earth_sun_distance = 1.496e11; // 1 AU
        let earth_mass = 5.972e24;
        let sun_mass = 1.989e30;

        let soi = laplace_soi(earth_sun_distance, earth_mass, sun_mass);

        // Earth's SOI is approximately 925,000 km = 9.25e8 m
        assert!((soi - 9.25e8).abs() < 1e8);
    }

    #[test]
    fn test_moon_hill_radius() {
        // Moon's Hill radius around Earth
        let moon_earth_distance = 3.844e8;
        let moon_mass = 7.342e22;
        let earth_mass = 5.972e24;

        let hill = hill_radius(moon_earth_distance, moon_mass, earth_mass);

        // Moon's Hill radius is approximately 61,500 km
        assert!((hill - 6.15e7).abs() < 1e7);
    }

    #[test]
    fn test_find_primary() {
        let sun = Body::star("sun", "Sun", 1.989e30, 6.96e8);

        let earth = Body::planet("earth", "Earth", 5.972e24, 6.371e6)
            .at_position(1.496e11, 0.0, 0.0);

        let bodies = vec![sun, earth];

        // Near Earth, Earth should be primary
        let near_earth = Vec3::new(1.496e11 + 1e6, 0.0, 0.0);
        let primary = find_primary_body(near_earth, &bodies);
        assert_eq!(primary, Some(1)); // Earth

        // Far from both, Sun should be primary
        let far_away = Vec3::new(1e12, 0.0, 0.0);
        let primary = find_primary_body(far_away, &bodies);
        assert_eq!(primary, Some(0)); // Sun
    }
}
