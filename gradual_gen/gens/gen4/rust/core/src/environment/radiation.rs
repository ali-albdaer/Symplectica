///! Solar radiation pressure model.
///! F_rad = (L / (4π r² c)) * A * (1 + albedo) * r̂
///! where L = stellar luminosity, r = distance to star, c = speed of light

use crate::body::{Body, BodyType};
use crate::units::*;
use crate::vector::Vec3;

/// Compute radiation pressure accelerations for all bodies
pub fn compute_radiation_pressure(bodies: &[Body]) -> Vec<Vec3> {
    let n = bodies.len();
    let mut accels = vec![Vec3::ZERO; n];

    // Find all luminous bodies (stars)
    let stars: Vec<usize> = (0..n)
        .filter(|&i| bodies[i].luminosity.value() > 0.0 &&
                (bodies[i].body_type == BodyType::Star ||
                 bodies[i].body_type == BodyType::NeutronStar ||
                 bodies[i].body_type == BodyType::WhiteDwarf))
        .collect();

    for i in 0..n {
        if !bodies[i].is_active { continue; }
        let cross_section = PI * bodies[i].radius.value() * bodies[i].radius.value();
        if cross_section <= 0.0 || bodies[i].mass.value() <= 0.0 { continue; }

        for &s in &stars {
            if s == i { continue; }

            let r_vec = bodies[i].position - bodies[s].position;
            let r2 = r_vec.magnitude_squared();
            let r = r2.sqrt();
            if r < 1.0 { continue; }

            let r_hat = r_vec / r;

            // Radiation flux at distance r: F = L / (4π r²)
            let flux = bodies[s].luminosity.value() / (4.0 * PI * r2);

            // Radiation force: F = (flux / c) * A * (1 + albedo)
            let force = (flux / C) * cross_section * (1.0 + bodies[i].albedo);

            // Acceleration = F / m
            accels[i] += r_hat * (force / bodies[i].mass.value());
        }
    }

    accels
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_radiation_pressure_1au() {
        let sun = Body::new(1, "Sun", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_radius(Meter::new(6.957e8))
            .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
            .with_position(Vec3::ZERO);

        // A 1 m² reflective sheet at 1 AU
        let mut sheet = Body::new(2, "Sheet", BodyType::ArtificialSatellite)
            .with_mass(Kilogram::new(1.0))
            .with_radius(Meter::new(0.564)) // π r² ≈ 1 m²
            .with_position(Vec3::new(AU, 0.0, 0.0));
        sheet.albedo = 1.0; // Perfect reflector

        let bodies = vec![sun, sheet];
        let accels = compute_radiation_pressure(&bodies);

        // Solar radiation pressure at 1 AU ≈ 4.56e-6 Pa
        // Force on 1 m² reflector = 4.56e-6 * 2 = 9.12e-6 N
        // Accel = F/m = 9.12e-6 m/s²
        let expected = 9.12e-6;
        let actual = accels[1].magnitude();
        assert!((actual - expected).abs() / expected < 0.1,
            "Radiation pressure accel: got {:.3e}, expected {:.3e}", actual, expected);
    }

    #[test]
    fn test_inverse_square_falloff() {
        let sun = Body::new(1, "Sun", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
            .with_position(Vec3::ZERO);

        let p1 = Body::new(2, "P1", BodyType::TestParticle)
            .with_mass(Kilogram::new(1.0))
            .with_radius(Meter::new(1.0))
            .with_position(Vec3::new(AU, 0.0, 0.0));

        let p2 = Body::new(3, "P2", BodyType::TestParticle)
            .with_mass(Kilogram::new(1.0))
            .with_radius(Meter::new(1.0))
            .with_position(Vec3::new(2.0 * AU, 0.0, 0.0));

        let bodies1 = vec![sun.clone(), p1];
        let bodies2 = vec![sun, p2];

        let a1 = compute_radiation_pressure(&bodies1)[1].magnitude();
        let a2 = compute_radiation_pressure(&bodies2)[1].magnitude();

        // At 2 AU, pressure should be 1/4 of 1 AU
        let ratio = a1 / a2;
        assert!((ratio - 4.0).abs() < 0.01, "Inverse square: ratio = {}", ratio);
    }
}
