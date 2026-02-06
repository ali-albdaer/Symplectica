///! Tidal force computation.
///! Computes differential gravitational forces (tidal acceleration) on extended bodies.
///! F_tidal ≈ -G*M * 2*R/r³ * r̂ (simplified radial component)

use crate::body::Body;
use crate::units::G;
use crate::vector::Vec3;

/// Compute tidal accelerations for all bodies.
/// Tidal forces arise from the gradient of the gravitational field across an extended body.
/// The tidal acceleration at an offset δr from center is:
/// a_tidal = -G*M * (δr/r³ - 3*(δr·r̂)*r̂/r³)
/// For the whole body, this manifests as a torque and deformation.
/// Here we compute the tidal heating contribution as a body-averaged effect.
pub fn compute_tidal_forces(bodies: &[Body]) -> Vec<Vec3> {
    let n = bodies.len();
    let mut accels = vec![Vec3::ZERO; n];

    for i in 0..n {
        if !bodies[i].is_active { continue; }
        if bodies[i].radius.value() <= 0.0 { continue; }

        for j in 0..n {
            if i == j { continue; }
            if bodies[j].mass.value() <= 0.0 { continue; }

            let r_vec = bodies[j].position - bodies[i].position;
            let r = r_vec.magnitude();
            if r < 1.0 { continue; }

            let r_hat = r_vec / r;
            let r3 = r * r * r;

            // Tidal parameter: ratio of body radius to distance
            let ratio = bodies[i].radius.value() / r;

            // First-order tidal correction to acceleration
            // This is the J2-like quadrupolar correction
            // a_tidal ~ G * M_j * R_i² / r⁴ (order of magnitude)
            let tidal_accel = G * bodies[j].mass.value() * ratio * ratio / r;

            // Direction: the tidal bulge creates a small acceleration
            // toward or away from the perturber depending on alignment
            // For a simple model, add a small radial perturbation
            accels[i] += r_hat * tidal_accel * 0.5;
        }
    }

    accels
}

/// Compute the Roche limit for a satellite orbiting a primary
/// R_Roche ≈ 2.46 * R_primary * (ρ_primary / ρ_satellite)^(1/3)
pub fn roche_limit(primary: &Body, satellite: &Body) -> f64 {
    if primary.radius.value() <= 0.0 || satellite.radius.value() <= 0.0 {
        return 0.0;
    }

    let vol_p = (4.0 / 3.0) * std::f64::consts::PI * primary.radius.value().powi(3);
    let vol_s = (4.0 / 3.0) * std::f64::consts::PI * satellite.radius.value().powi(3);

    let rho_p = if vol_p > 0.0 { primary.mass.value() / vol_p } else { 0.0 };
    let rho_s = if vol_s > 0.0 { satellite.mass.value() / vol_s } else { 0.0 };

    if rho_s <= 0.0 { return 0.0; }

    2.46 * primary.radius.value() * (rho_p / rho_s).powf(1.0 / 3.0)
}

/// Compute tidal Love number k₂ estimate based on body type
pub fn estimate_love_number(body: &Body) -> f64 {
    use crate::body::BodyType;
    match body.body_type {
        BodyType::Star => 0.01,
        BodyType::Planet => 0.3,     // Gas giant ~0.5, rocky ~0.3
        BodyType::Moon => 0.03,
        BodyType::Asteroid => 0.001,
        BodyType::NeutronStar => 0.05,
        _ => 0.1,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::units::*;

    #[test]
    fn test_roche_limit() {
        let earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS));
        let moon = Body::new(2, "Moon", BodyType::Moon)
            .with_mass(Kilogram::new(7.342e22))
            .with_radius(Meter::new(1.737e6));

        let roche = roche_limit(&earth, &moon);
        // Earth-Moon Roche limit ≈ 9,500 km = 9.5e6 m
        assert!(roche > 5e6 && roche < 2e7,
            "Roche limit = {} m", roche);
    }

    #[test]
    fn test_tidal_forces_decrease_with_distance() {
        let star = Body::new(1, "Star", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_radius(Meter::new(6.957e8))
            .with_position(Vec3::ZERO);

        let p1 = Body::new(2, "P1", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::new(AU, 0.0, 0.0));

        let p2 = Body::new(3, "P2", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::new(2.0 * AU, 0.0, 0.0));

        let a1 = compute_tidal_forces(&vec![star.clone(), p1])[1].magnitude();
        let a2 = compute_tidal_forces(&vec![star, p2])[1].magnitude();

        // Tidal force scales as 1/r³ * R²/r = R²/r⁴
        // At 2 AU vs 1 AU: ratio should be 2⁴ = 16
        assert!(a1 > a2, "Tidal force should decrease with distance");
    }
}
