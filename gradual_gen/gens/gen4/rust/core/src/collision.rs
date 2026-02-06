///! Collision detection and response models.
///! Supports inelastic merge, elastic rebound, and contact resolution.

use crate::body::{Body, BodyId, BodyType, CollisionShape};
use crate::vector::Vec3;
use crate::units::*;
use serde::{Deserialize, Serialize};

/// Collision detection result
#[derive(Debug, Clone)]
pub struct CollisionEvent {
    pub body_a: BodyId,
    pub body_b: BodyId,
    pub contact_point: Vec3,
    pub normal: Vec3,   // from A to B
    pub penetration: f64, // meters of overlap
    pub relative_velocity: f64, // approach speed
}

/// Collision resolution strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollisionMode {
    InelasticMerge,   // Bodies merge, conserving momentum
    ElasticRebound,   // Elastic bounce with restitution coefficient
    PenaltyContact,   // Soft penalty force for sustained contact
    Disabled,         // No collision response
}

/// Detect all collisions between bodies
pub fn detect_collisions(bodies: &[Body]) -> Vec<CollisionEvent> {
    let n = bodies.len();
    let mut events = Vec::new();

    for i in 0..n {
        let ri = match bodies[i].collision_shape {
            CollisionShape::Sphere { radius } => radius,
            CollisionShape::Point => continue,
        };

        for j in (i + 1)..n {
            let rj = match bodies[j].collision_shape {
                CollisionShape::Sphere { radius } => radius,
                CollisionShape::Point => continue,
            };

            let diff = bodies[j].position - bodies[i].position;
            let dist = diff.magnitude();
            let min_dist = ri + rj;

            if dist < min_dist && dist > 0.0 {
                let normal = diff / dist;
                let contact_point = bodies[i].position + normal * ri;
                let rel_vel = (bodies[j].velocity - bodies[i].velocity).dot(normal);

                events.push(CollisionEvent {
                    body_a: bodies[i].id,
                    body_b: bodies[j].id,
                    contact_point,
                    normal,
                    penetration: min_dist - dist,
                    relative_velocity: rel_vel,
                });
            }
        }
    }

    events
}

/// Resolve a collision via inelastic merge: bodies combine into one
pub fn resolve_inelastic_merge(a: &Body, b: &Body) -> Body {
    let total_mass = a.mass.value() + b.mass.value();
    if total_mass == 0.0 {
        return a.clone();
    }

    let fa = a.mass.value() / total_mass;
    let fb = b.mass.value() / total_mass;

    let merged_pos = a.position * fa + b.position * fb;
    let merged_vel = (a.velocity * a.mass.value() + b.velocity * b.mass.value()) / total_mass;

    // Volume-preserving radius: V_total = V_a + V_b
    let v_a = (4.0 / 3.0) * PI * a.radius.value().powi(3);
    let v_b = (4.0 / 3.0) * PI * b.radius.value().powi(3);
    let merged_radius = ((v_a + v_b) * 3.0 / (4.0 * PI)).powf(1.0 / 3.0);

    let merged_type = if a.mass.value() >= b.mass.value() { a.body_type } else { b.body_type };
    let merged_name = format!("{}+{}", a.name, b.name);

    let mut merged = Body::new(a.id, &merged_name, merged_type)
        .with_mass(Kilogram::new(total_mass))
        .with_radius(Meter::new(merged_radius))
        .with_position(merged_pos)
        .with_velocity(merged_vel);

    // Merge luminosity
    merged.luminosity = Watt::new(a.luminosity.value() + b.luminosity.value());
    merged.albedo = fa * a.albedo + fb * b.albedo;
    merged.color = [
        a.color[0] * fa as f32 + b.color[0] * fb as f32,
        a.color[1] * fa as f32 + b.color[1] * fb as f32,
        a.color[2] * fa as f32 + b.color[2] * fb as f32,
    ];

    merged
}

/// Resolve elastic rebound with coefficient of restitution
pub fn resolve_elastic_rebound(
    a: &mut Body,
    b: &mut Body,
    event: &CollisionEvent,
) {
    let e = (a.restitution + b.restitution) * 0.5; // Average restitution
    let ma = a.mass.value();
    let mb = b.mass.value();
    let total = ma + mb;

    if total == 0.0 { return; }

    let n = event.normal;
    let v_rel = a.velocity - b.velocity;
    let v_n = v_rel.dot(n);

    if v_n >= 0.0 { return; } // Already separating

    // Impulse magnitude: j = -(1+e) * v_n / (1/ma + 1/mb)
    let inv_mass_sum = if ma > 0.0 { 1.0 / ma } else { 0.0 }
        + if mb > 0.0 { 1.0 / mb } else { 0.0 };

    if inv_mass_sum == 0.0 { return; }

    let j = -(1.0 + e) * v_n / inv_mass_sum;
    let impulse = n * j;

    if ma > 0.0 {
        a.velocity += impulse / ma;
    }
    if mb > 0.0 {
        b.velocity -= impulse / mb;
    }

    // Separate bodies to eliminate penetration
    let sep = event.penetration * 0.5 + 0.01; // Small extra separation
    if ma > 0.0 && mb > 0.0 {
        let ratio_a = mb / total;
        let ratio_b = ma / total;
        a.position -= n * (sep * ratio_a);
        b.position += n * (sep * ratio_b);
    } else if ma > 0.0 {
        a.position -= n * sep;
    } else {
        b.position += n * sep;
    }
}

/// Compute penalty contact force for sustained contact
pub fn compute_penalty_force(
    event: &CollisionEvent,
    stiffness: f64,      // N/m
    damping: f64,         // N·s/m
) -> (Vec3, Vec3) {
    if event.penetration <= 0.0 {
        return (Vec3::ZERO, Vec3::ZERO);
    }

    let n = event.normal;
    // Spring force proportional to penetration
    let f_spring = stiffness * event.penetration;
    // Damping force proportional to approach velocity
    let f_damp = damping * event.relative_velocity.min(0.0);

    let force_mag = (f_spring + f_damp).max(0.0);
    let force = n * force_mag;

    (-force, force) // Forces on A and B respectively
}

/// Process all collisions in the simulation
pub fn process_collisions(
    bodies: &mut Vec<Body>,
    mode: CollisionMode,
) -> Vec<CollisionEvent> {
    if mode == CollisionMode::Disabled {
        return Vec::new();
    }

    let events = detect_collisions(bodies);
    if events.is_empty() {
        return events;
    }

    match mode {
        CollisionMode::InelasticMerge => {
            let mut to_remove: Vec<BodyId> = Vec::new();
            let mut to_add: Vec<Body> = Vec::new();

            for event in &events {
                if to_remove.contains(&event.body_a) || to_remove.contains(&event.body_b) {
                    continue;
                }
                let a = bodies.iter().find(|b| b.id == event.body_a).unwrap();
                let b = bodies.iter().find(|b| b.id == event.body_b).unwrap();
                let merged = resolve_inelastic_merge(a, b);
                to_remove.push(event.body_b);
                to_add.push(merged);
            }

            bodies.retain(|b| !to_remove.contains(&b.id));
            // Update merged bodies in-place
            for merged in to_add {
                if let Some(existing) = bodies.iter_mut().find(|b| b.id == merged.id) {
                    *existing = merged;
                }
            }

            events
        }
        CollisionMode::ElasticRebound => {
            for event in &events {
                let (a_idx, b_idx) = {
                    let a_idx = bodies.iter().position(|b| b.id == event.body_a);
                    let b_idx = bodies.iter().position(|b| b.id == event.body_b);
                    match (a_idx, b_idx) {
                        (Some(a), Some(b)) => (a, b),
                        _ => continue,
                    }
                };
                // Safe split borrow
                if a_idx < b_idx {
                    let (left, right) = bodies.split_at_mut(b_idx);
                    resolve_elastic_rebound(&mut left[a_idx], &mut right[0], event);
                } else {
                    let (left, right) = bodies.split_at_mut(a_idx);
                    resolve_elastic_rebound(&mut right[0], &mut left[b_idx], event);
                }
            }
            events
        }
        CollisionMode::PenaltyContact => {
            for event in &events {
                let (f_a, f_b) = compute_penalty_force(event, 1e6, 1e3);
                if let Some(a) = bodies.iter_mut().find(|b| b.id == event.body_a) {
                    if a.mass.value() > 0.0 {
                        a.acceleration += f_a / a.mass.value();
                    }
                }
                if let Some(b) = bodies.iter_mut().find(|b| b.id == event.body_b) {
                    if b.mass.value() > 0.0 {
                        b.acceleration += f_b / b.mass.value();
                    }
                }
            }
            events
        }
        CollisionMode::Disabled => events,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_collision_detection() {
        let bodies = vec![
            Body::new(1, "A", BodyType::Planet)
                .with_mass(Kilogram::new(1e24))
                .with_radius(Meter::new(1e6))
                .with_position(Vec3::ZERO),
            Body::new(2, "B", BodyType::Planet)
                .with_mass(Kilogram::new(1e24))
                .with_radius(Meter::new(1e6))
                .with_position(Vec3::new(1.5e6, 0.0, 0.0)), // Overlapping
        ];

        let events = detect_collisions(&bodies);
        assert_eq!(events.len(), 1);
        assert!(events[0].penetration > 0.0);
    }

    #[test]
    fn test_inelastic_merge_momentum_conservation() {
        let a = Body::new(1, "A", BodyType::Planet)
            .with_mass(Kilogram::new(1e24))
            .with_radius(Meter::new(1e6))
            .with_position(Vec3::ZERO)
            .with_velocity(Vec3::new(100.0, 0.0, 0.0));
        let b = Body::new(2, "B", BodyType::Planet)
            .with_mass(Kilogram::new(2e24))
            .with_radius(Meter::new(1e6))
            .with_position(Vec3::new(1e6, 0.0, 0.0))
            .with_velocity(Vec3::new(-50.0, 0.0, 0.0));

        let p_before = a.velocity * a.mass.value() + b.velocity * b.mass.value();
        let merged = resolve_inelastic_merge(&a, &b);
        let p_after = merged.velocity * merged.mass.value();

        assert!((p_before - p_after).magnitude() < 1.0,
            "Momentum not conserved in merge");
    }

    #[test]
    fn test_elastic_rebound_energy() {
        let mut a = Body::new(1, "A", BodyType::Planet)
            .with_mass(Kilogram::new(1e24))
            .with_radius(Meter::new(1e6))
            .with_position(Vec3::ZERO)
            .with_velocity(Vec3::new(100.0, 0.0, 0.0));
        a.restitution = 1.0;

        let mut b = Body::new(2, "B", BodyType::Planet)
            .with_mass(Kilogram::new(1e24))
            .with_radius(Meter::new(1e6))
            .with_position(Vec3::new(1.5e6, 0.0, 0.0))
            .with_velocity(Vec3::new(-100.0, 0.0, 0.0));
        b.restitution = 1.0;

        let ke_before = 0.5 * a.mass.value() * a.velocity.magnitude_squared()
            + 0.5 * b.mass.value() * b.velocity.magnitude_squared();

        let event = CollisionEvent {
            body_a: 1, body_b: 2,
            contact_point: Vec3::new(0.75e6, 0.0, 0.0),
            normal: Vec3::new(1.0, 0.0, 0.0),
            penetration: 0.5e6,
            relative_velocity: -200.0,
        };

        resolve_elastic_rebound(&mut a, &mut b, &event);

        let ke_after = 0.5 * a.mass.value() * a.velocity.magnitude_squared()
            + 0.5 * b.mass.value() * b.velocity.magnitude_squared();

        assert!((ke_before - ke_after).abs() / ke_before < 1e-10,
            "KE not conserved in elastic collision: before={}, after={}", ke_before, ke_after);
    }
}
