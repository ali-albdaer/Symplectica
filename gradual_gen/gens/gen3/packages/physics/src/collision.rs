//! Collision detection and handling
//!
//! Phase I implements inelastic merging with mass and momentum conservation

use serde::{Deserialize, Serialize};

use crate::{
    body::{Body, BodyType},
    config::CollisionMode,
    vec3::Vec3,
};

/// Collision event information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollisionEvent {
    /// ID of first body involved
    pub body1_id: String,
    /// ID of second body involved
    pub body2_id: String,
    /// Position where collision occurred (center of mass)
    pub position: Vec3,
    /// Relative velocity at collision
    pub relative_velocity: f64,
    /// Combined mass after merge
    pub merged_mass: f64,
    /// Simulation tick when collision occurred
    pub tick: u64,
    /// Whether bodies were merged
    pub merged: bool,
}

/// Collision detection result
#[derive(Debug, Clone)]
pub struct CollisionPair {
    /// Index of first body
    pub idx1: usize,
    /// Index of second body
    pub idx2: usize,
    /// Distance between bodies
    pub distance: f64,
    /// Sum of radii
    pub sum_radii: f64,
    /// Overlap distance (negative means no collision)
    pub overlap: f64,
}

/// Detect all collisions between bodies
///
/// Returns pairs of body indices that are colliding, sorted by overlap (deepest first)
pub fn detect_collisions(bodies: &[Body]) -> Vec<CollisionPair> {
    let mut collisions = Vec::new();

    for i in 0..bodies.len() {
        if !bodies[i].active {
            continue;
        }

        for j in (i + 1)..bodies.len() {
            if !bodies[j].active {
                continue;
            }

            let distance = bodies[i].position.distance(bodies[j].position);
            let sum_radii = bodies[i].radius + bodies[j].radius;
            let overlap = sum_radii - distance;

            if overlap > 0.0 {
                collisions.push(CollisionPair {
                    idx1: i,
                    idx2: j,
                    distance,
                    sum_radii,
                    overlap,
                });
            }
        }
    }

    // Sort by overlap (deepest collisions first)
    collisions.sort_by(|a, b| b.overlap.partial_cmp(&a.overlap).unwrap());

    collisions
}

/// Detect close encounters (bodies approaching collision threshold)
///
/// Returns pairs within the threshold multiplier of collision distance
pub fn detect_close_encounters(bodies: &[Body], threshold_multiplier: f64) -> Vec<CollisionPair> {
    let mut encounters = Vec::new();

    for i in 0..bodies.len() {
        if !bodies[i].active || bodies[i].radius <= 0.0 {
            continue;
        }

        for j in (i + 1)..bodies.len() {
            if !bodies[j].active || bodies[j].radius <= 0.0 {
                continue;
            }

            let distance = bodies[i].position.distance(bodies[j].position);
            let sum_radii = bodies[i].radius + bodies[j].radius;
            let threshold = sum_radii * threshold_multiplier;

            if distance < threshold {
                encounters.push(CollisionPair {
                    idx1: i,
                    idx2: j,
                    distance,
                    sum_radii,
                    overlap: threshold - distance,
                });
            }
        }
    }

    encounters
}

/// Perform inelastic merge of two bodies
///
/// Conserves mass and linear momentum.
/// The merged body replaces the more massive one; the other is deactivated.
///
/// Returns the collision event and the index of the surviving body.
pub fn inelastic_merge(
    bodies: &mut [Body],
    idx1: usize,
    idx2: usize,
    tick: u64,
) -> Option<(CollisionEvent, usize)> {
    if idx1 >= bodies.len() || idx2 >= bodies.len() {
        return None;
    }

    if !bodies[idx1].active || !bodies[idx2].active {
        return None;
    }

    let body1 = &bodies[idx1];
    let body2 = &bodies[idx2];

    // Calculate relative velocity
    let relative_velocity = (body1.velocity - body2.velocity).magnitude();

    // Calculate merged properties
    let m1 = body1.mass;
    let m2 = body2.mass;
    let total_mass = m1 + m2;

    if total_mass <= 0.0 {
        return None;
    }

    // Center of mass position
    let merged_position = (body1.position * m1 + body2.position * m2) / total_mass;

    // Conserve momentum: m1*v1 + m2*v2 = (m1+m2)*v_new
    let merged_velocity = (body1.momentum() + body2.momentum()) / total_mass;

    // Calculate new radius based on volume conservation
    // V = V1 + V2, so r³ = r1³ + r2³
    let merged_radius = (body1.radius.powi(3) + body2.radius.powi(3)).powf(1.0 / 3.0);

    // Determine which body survives (the more massive one)
    let (survivor_idx, absorbed_idx) = if m1 >= m2 { (idx1, idx2) } else { (idx2, idx1) };

    // Create collision event
    let event = CollisionEvent {
        body1_id: body1.id.clone(),
        body2_id: body2.id.clone(),
        position: merged_position,
        relative_velocity,
        merged_mass: total_mass,
        tick,
        merged: true,
    };

    // Determine merged body type (prefer the more significant type)
    let merged_type = merge_body_types(bodies[survivor_idx].body_type, bodies[absorbed_idx].body_type);

    // Update survivor
    bodies[survivor_idx].position = merged_position;
    bodies[survivor_idx].velocity = merged_velocity;
    bodies[survivor_idx].mass = total_mass;
    bodies[survivor_idx].radius = merged_radius;
    bodies[survivor_idx].body_type = merged_type;

    // Update density
    let volume = bodies[survivor_idx].volume();
    if volume > 0.0 {
        bodies[survivor_idx].properties.density = total_mass / volume;
    }

    // Deactivate absorbed body
    bodies[absorbed_idx].active = false;

    Some((event, survivor_idx))
}

/// Determine the body type for a merged body
fn merge_body_types(type1: BodyType, type2: BodyType) -> BodyType {
    // Priority: Star > Planet > Moon > Asteroid > Comet > Spacecraft > TestParticle
    let priority = |t: BodyType| -> u8 {
        match t {
            BodyType::Star => 6,
            BodyType::Planet => 5,
            BodyType::Moon => 4,
            BodyType::Asteroid => 3,
            BodyType::Comet => 2,
            BodyType::Spacecraft => 1,
            BodyType::TestParticle => 0,
        }
    };

    if priority(type1) >= priority(type2) {
        type1
    } else {
        type2
    }
}

/// Handle all collisions for the current tick
///
/// Returns a list of collision events that occurred
pub fn handle_collisions(
    bodies: &mut [Body],
    mode: CollisionMode,
    tick: u64,
) -> Vec<CollisionEvent> {
    if mode == CollisionMode::None {
        return Vec::new();
    }

    let mut events = Vec::new();
    let mut processed = std::collections::HashSet::new();

    loop {
        // Detect current collisions
        let collisions = detect_collisions(bodies);

        if collisions.is_empty() {
            break;
        }

        let mut any_handled = false;

        for collision in collisions {
            // Skip if either body was already processed this tick
            if processed.contains(&collision.idx1) || processed.contains(&collision.idx2) {
                continue;
            }

            match mode {
                CollisionMode::InelasticMerge => {
                    if let Some((event, _survivor)) =
                        inelastic_merge(bodies, collision.idx1, collision.idx2, tick)
                    {
                        events.push(event);
                        processed.insert(collision.idx1);
                        processed.insert(collision.idx2);
                        any_handled = true;
                    }
                }
                CollisionMode::Elastic => {
                    // Phase II: implement elastic collisions
                    // For now, treat as inelastic
                    if let Some((mut event, _survivor)) =
                        inelastic_merge(bodies, collision.idx1, collision.idx2, tick)
                    {
                        event.merged = true;
                        events.push(event);
                        processed.insert(collision.idx1);
                        processed.insert(collision.idx2);
                        any_handled = true;
                    }
                }
                CollisionMode::None => {}
            }
        }

        if !any_handled {
            break;
        }
    }

    events
}

/// Calculate impact energy for a collision
pub fn impact_energy(body1: &Body, body2: &Body) -> f64 {
    let relative_velocity = (body1.velocity - body2.velocity).magnitude();
    let reduced_mass = (body1.mass * body2.mass) / (body1.mass + body2.mass);
    0.5 * reduced_mass * relative_velocity * relative_velocity
}

/// Predict time to collision for two bodies moving linearly
///
/// Returns None if bodies are moving apart or will not collide
pub fn time_to_collision(body1: &Body, body2: &Body) -> Option<f64> {
    let r = body2.position - body1.position;
    let v = body2.velocity - body1.velocity;

    let min_dist = body1.radius + body2.radius;

    // Solve |r + v*t| = min_dist
    // |r|² + 2(r·v)t + |v|²t² = min_dist²

    let a = v.magnitude_squared();
    let b = 2.0 * r.dot(v);
    let c = r.magnitude_squared() - min_dist * min_dist;

    if a.abs() < f64::EPSILON {
        // Bodies have same velocity, check if already colliding
        if c <= 0.0 {
            return Some(0.0);
        }
        return None;
    }

    let discriminant = b * b - 4.0 * a * c;

    if discriminant < 0.0 {
        // No real solution, bodies will not collide
        return None;
    }

    let sqrt_disc = discriminant.sqrt();
    let t1 = (-b - sqrt_disc) / (2.0 * a);
    let t2 = (-b + sqrt_disc) / (2.0 * a);

    // Return the first positive collision time
    if t1 > 0.0 {
        Some(t1)
    } else if t2 > 0.0 {
        Some(t2)
    } else {
        None // Collision was in the past
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collision_detection() {
        let body1 = Body::new("a", "A", 1e10, 1000.0).at_position(0.0, 0.0, 0.0);
        let body2 = Body::new("b", "B", 1e10, 1000.0).at_position(1500.0, 0.0, 0.0);
        let body3 = Body::new("c", "C", 1e10, 1000.0).at_position(10000.0, 0.0, 0.0);

        let bodies = vec![body1, body2, body3];
        let collisions = detect_collisions(&bodies);

        assert_eq!(collisions.len(), 1);
        assert_eq!(collisions[0].idx1, 0);
        assert_eq!(collisions[0].idx2, 1);
    }

    #[test]
    fn test_inelastic_merge_momentum() {
        let mut body1 = Body::new("a", "A", 1000.0, 100.0)
            .at_position(0.0, 0.0, 0.0)
            .with_velocity_xyz(10.0, 0.0, 0.0);

        let mut body2 = Body::new("b", "B", 1000.0, 100.0)
            .at_position(150.0, 0.0, 0.0)
            .with_velocity_xyz(-10.0, 0.0, 0.0);

        let initial_momentum = body1.momentum() + body2.momentum();

        let mut bodies = vec![body1, body2];
        let result = inelastic_merge(&mut bodies, 0, 1, 0);

        assert!(result.is_some());

        let (event, survivor_idx) = result.unwrap();
        let survivor = &bodies[survivor_idx];

        // Check momentum conservation
        let final_momentum = survivor.momentum();
        assert!((initial_momentum.x - final_momentum.x).abs() < 1e-10);
        assert!((initial_momentum.y - final_momentum.y).abs() < 1e-10);
        assert!((initial_momentum.z - final_momentum.z).abs() < 1e-10);

        // Check mass conservation
        assert!((survivor.mass - 2000.0).abs() < 1e-10);

        // Check merged velocity (should be 0 since momenta cancel)
        assert!(survivor.velocity.magnitude() < 1e-10);
    }

    #[test]
    fn test_time_to_collision() {
        let body1 = Body::new("a", "A", 1e10, 100.0)
            .at_position(0.0, 0.0, 0.0)
            .with_velocity_xyz(0.0, 0.0, 0.0);

        let body2 = Body::new("b", "B", 1e10, 100.0)
            .at_position(1000.0, 0.0, 0.0)
            .with_velocity_xyz(-100.0, 0.0, 0.0);

        let t = time_to_collision(&body1, &body2);
        assert!(t.is_some());

        // Bodies are 1000m apart, approaching at 100 m/s, radii sum to 200m
        // Time to collision = (1000 - 200) / 100 = 8 seconds
        assert!((t.unwrap() - 8.0).abs() < 0.01);
    }
}
