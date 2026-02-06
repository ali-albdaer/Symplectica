///! Spherical harmonic gravity for aspherical bodies.
///! Computes gravitational acceleration including J2, J3, J4... zonal harmonics.
///! a = -∇Φ where Φ = -(GM/r) * Σ (R/r)^n * Jn * Pn(cos θ)

use crate::body::Body;
use crate::units::G;
use crate::vector::Vec3;

/// Compute spherical harmonic gravity corrections for all bodies
pub fn compute_harmonic_gravity(bodies: &[Body]) -> Vec<Vec3> {
    let n = bodies.len();
    let mut accels = vec![Vec3::ZERO; n];

    for i in 0..n {
        if !bodies[i].is_active { continue; }

        for j in 0..n {
            if i == j { continue; }
            if bodies[j].gravity_harmonics.is_none() { continue; }
            if bodies[j].mass.value() <= 0.0 { continue; }

            let harmonics = bodies[j].gravity_harmonics.as_ref().unwrap();
            if harmonics.j_coefficients.is_empty() { continue; }

            let r_vec = bodies[i].position - bodies[j].position;
            let r = r_vec.magnitude();
            if r < 1.0 { continue; }

            let r_ref = harmonics.reference_radius.value();
            if r_ref <= 0.0 { continue; }

            let mu = G * bodies[j].mass.value();
            let r2 = r * r;
            let r_inv = 1.0 / r;

            // Compute cos(θ) where θ is measured from the body's pole (z-axis)
            // TODO: Account for axial tilt rotation
            let cos_theta = r_vec.z * r_inv;
            let sin_theta = (1.0 - cos_theta * cos_theta).sqrt();

            // Unit vectors in spherical coordinates
            let r_hat = r_vec * r_inv;
            // theta_hat = d(r_hat)/dθ / |d(r_hat)/dθ|
            let theta_hat = if sin_theta > 1e-10 {
                Vec3::new(
                    cos_theta * r_vec.x / r - r_vec.z * (r_vec.x / (r2 * sin_theta)),
                    cos_theta * r_vec.y / r - r_vec.z * (r_vec.y / (r2 * sin_theta)),
                    cos_theta * r_vec.z / r - (r2 - r_vec.z * r_vec.z) / (r2 * sin_theta),
                ).normalized()
            } else {
                Vec3::new(1.0, 0.0, 0.0)
            };

            let mut a_r = 0.0;
            let mut a_theta = 0.0;

            for (k, &jn) in harmonics.j_coefficients.iter().enumerate() {
                let n_order = (k + 2) as i32; // J2 is index 0, J3 is index 1, etc.
                let ratio_n = (r_ref * r_inv).powi(n_order);

                // Legendre polynomial P_n(cos θ) and derivative
                let (pn, dpn) = legendre_and_derivative(n_order as usize, cos_theta);

                // Radial component: -(n+1) * μ/r² * (R/r)^n * Jn * Pn
                a_r += -(n_order + 1) as f64 * mu * r_inv * r_inv * ratio_n * jn * pn;

                // Theta component: μ/r² * (R/r)^n * Jn * dPn/dθ
                // dPn/dθ = -sin(θ) * dPn/d(cosθ)
                a_theta += mu * r_inv * r_inv * ratio_n * jn * (-sin_theta * dpn);
            }

            accels[i] += r_hat * a_r + theta_hat * a_theta;
        }
    }

    accels
}

/// Compute Legendre polynomial P_n(x) and its derivative dP_n/dx
/// using recurrence relations.
fn legendre_and_derivative(n: usize, x: f64) -> (f64, f64) {
    if n == 0 {
        return (1.0, 0.0);
    }
    if n == 1 {
        return (x, 1.0);
    }

    let mut p_prev = 1.0;  // P_0
    let mut p_curr = x;     // P_1
    let mut dp_prev = 0.0;  // dP_0/dx
    let mut dp_curr = 1.0;  // dP_1/dx

    for k in 2..=n {
        let kf = k as f64;
        // P_k = ((2k-1)*x*P_{k-1} - (k-1)*P_{k-2}) / k
        let p_next = ((2.0 * kf - 1.0) * x * p_curr - (kf - 1.0) * p_prev) / kf;
        // dP_k/dx = ((2k-1)*(P_{k-1} + x*dP_{k-1}) - (k-1)*dP_{k-2}) / k
        let dp_next = ((2.0 * kf - 1.0) * (p_curr + x * dp_curr) - (kf - 1.0) * dp_prev) / kf;

        p_prev = p_curr;
        dp_prev = dp_curr;
        p_curr = p_next;
        dp_curr = dp_next;
    }

    (p_curr, dp_curr)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType, GravityHarmonics};
    use crate::units::*;

    #[test]
    fn test_legendre_polynomials() {
        // P_0(x) = 1
        assert_eq!(legendre_and_derivative(0, 0.5), (1.0, 0.0));

        // P_1(x) = x
        assert_eq!(legendre_and_derivative(1, 0.5), (0.5, 1.0));

        // P_2(x) = (3x² - 1) / 2
        let (p2, dp2) = legendre_and_derivative(2, 0.5);
        assert!((p2 - (3.0 * 0.25 - 1.0) / 2.0).abs() < 1e-10);
        // dP_2/dx = 3x
        assert!((dp2 - 1.5).abs() < 1e-10);
    }

    #[test]
    fn test_j2_correction() {
        let mut earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::ZERO);

        earth.gravity_harmonics = Some(GravityHarmonics {
            reference_radius: Meter::new(EARTH_RADIUS),
            j_coefficients: vec![1.08263e-3], // Earth J2
            tesseral_c: vec![],
            tesseral_s: vec![],
        });

        // Satellite above the equator
        let sat = Body::new(2, "Sat", BodyType::ArtificialSatellite)
            .with_mass(Kilogram::new(100.0))
            .with_radius(Meter::new(1.0))
            .with_position(Vec3::new(EARTH_RADIUS + 400e3, 0.0, 0.0));

        let bodies = vec![earth, sat];
        let accels = compute_harmonic_gravity(&bodies);

        // J2 correction should be small compared to main gravity
        let main_gravity = G * EARTH_MASS / (EARTH_RADIUS + 400e3).powi(2);
        let j2_correction = accels[1].magnitude();
        let ratio = j2_correction / main_gravity;

        // J2 correction at LEO should be ~0.1% of main gravity
        assert!(ratio > 1e-4 && ratio < 1e-2,
            "J2/g ratio = {:.4e}", ratio);
    }
}
