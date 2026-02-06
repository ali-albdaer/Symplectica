///! Aerodynamic drag model.
///! Computes drag force for bodies within an atmosphere.
///! F_drag = -0.5 * ρ * v² * C_d * A * v̂

use crate::body::Body;
use crate::vector::Vec3;
use super::atmosphere;

/// Default drag coefficient for a sphere
const DEFAULT_CD: f64 = 0.47;

/// Compute drag accelerations for all bodies
pub fn compute_drag_forces(bodies: &[Body]) -> Vec<Vec3> {
    let n = bodies.len();
    let mut accels = vec![Vec3::ZERO; n];

    // For each body, check if it's within another body's atmosphere
    for i in 0..n {
        if !bodies[i].is_active { continue; }

        for j in 0..n {
            if i == j { continue; }
            if bodies[j].atmosphere.is_none() { continue; }

            let r_vec = bodies[i].position - bodies[j].position;
            let dist = r_vec.magnitude();
            let altitude = dist - bodies[j].radius.value();

            if altitude < 0.0 || altitude > atmosphere::effective_atmosphere_height(&bodies[j]) {
                continue;
            }

            // Get atmospheric density at this altitude
            let rho = atmosphere::density_at_altitude(&bodies[j], altitude);
            if rho < 1e-20 { continue; }

            // Relative velocity to the atmosphere (assume atmosphere co-rotates)
            let v_rel = bodies[i].velocity - bodies[j].velocity;
            // TODO: account for atmosphere rotation
            let v_mag = v_rel.magnitude();
            if v_mag < 1e-10 { continue; }
            let v_hat = v_rel / v_mag;

            // Cross-sectional area (assume sphere)
            let cross_section = std::f64::consts::PI * bodies[i].radius.value() * bodies[i].radius.value();
            if cross_section <= 0.0 { continue; }

            // Drag force: F = -0.5 * ρ * v² * C_d * A
            let drag_mag = 0.5 * rho * v_mag * v_mag * DEFAULT_CD * cross_section;

            // Acceleration = F / m
            if bodies[i].mass.value() > 0.0 {
                accels[i] -= v_hat * (drag_mag / bodies[i].mass.value());
            }
        }
    }

    accels
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType, AtmosphereParams};
    use crate::units::*;

    #[test]
    fn test_drag_in_atmosphere() {
        let earth = Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::ZERO)
            .with_atmosphere(AtmosphereParams {
                surface_pressure: Pascal::new(101325.0),
                surface_density: KgPerCubicMeter::new(1.225),
                scale_height: Meter::new(8500.0),
                molecular_mass: 0.029,
                surface_temperature: 288.15,
                rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
                mie_coefficient: 21e-6,
                mie_direction: 0.758,
            });

        // Satellite in low orbit (100 km altitude, within effective atmosphere)
        let sat = Body::new(2, "Sat", BodyType::ArtificialSatellite)
            .with_mass(Kilogram::new(1000.0))
            .with_radius(Meter::new(1.0))
            .with_position(Vec3::new(EARTH_RADIUS + 100e3, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, 7800.0, 0.0));

        let bodies = vec![earth, sat];
        let accels = compute_drag_forces(&bodies);

        // Satellite should experience drag (opposite to velocity)
        assert!(accels[1].y < 0.0, "Drag should oppose velocity");
        // At 100 km, drag should be small but nonzero
        assert!(accels[1].magnitude() > 0.0);
        assert!(accels[1].magnitude() < 1.0); // Less than 1 m/s² at 100km
    }

    #[test]
    fn test_no_drag_in_vacuum() {
        let planet = Body::new(1, "Planet", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::ZERO);
        // No atmosphere

        let sat = Body::new(2, "Sat", BodyType::ArtificialSatellite)
            .with_mass(Kilogram::new(1000.0))
            .with_radius(Meter::new(1.0))
            .with_position(Vec3::new(EARTH_RADIUS + 200e3, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, 7800.0, 0.0));

        let bodies = vec![planet, sat];
        let accels = compute_drag_forces(&bodies);
        assert_eq!(accels[1], Vec3::ZERO);
    }
}
