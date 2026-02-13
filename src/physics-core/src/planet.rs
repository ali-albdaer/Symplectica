//! Planet-specific physics derivations
//!
//! Computes planetary properties that depend on both the body itself
//! and (optionally) a parent star. All functions operate on `&mut Body`
//! and only overwrite fields at their default (zero) value, preserving
//! manually-set values from presets.

use crate::body::{Body, BodyType};
use crate::constants::*;

/// Derive all planet/moon-specific properties for a body.
/// `parent` should be the parent star (for equilibrium temperature, Roche limit)
/// or `None` if unavailable.
pub fn derive_planet_properties(body: &mut Body, parent: Option<&Body>) {
    match body.body_type {
        BodyType::Planet | BodyType::Moon => {}
        _ => return,
    }
    if body.mass <= 0.0 || body.radius <= 0.0 {
        return;
    }

    // ── Bulk density ──
    if body.bulk_density == 0.0 {
        let volume = (4.0 / 3.0) * std::f64::consts::PI * body.radius.powi(3);
        body.bulk_density = body.mass / volume;
    }

    // ── Surface gravity ──
    if body.surface_gravity == 0.0 {
        body.surface_gravity = G * body.mass / (body.radius * body.radius);
    }

    // ── Escape velocity ──
    if body.escape_velocity_surface == 0.0 {
        body.escape_velocity_surface = (2.0 * G * body.mass / body.radius).sqrt();
    }

    // ── Collision radius ──
    if body.collision_radius == 0.0 {
        body.collision_radius = body.radius;
    }

    // ── Equilibrium temperature (requires parent star) ──
    if body.equilibrium_temperature == 0.0 {
        if let Some(star) = parent {
            if star.effective_temperature > 0.0 && star.radius > 0.0 && body.semi_major_axis > 0.0
            {
                // T_eq = T_star × sqrt(R_star / (2 × a)) × (1 − A)^0.25
                body.equilibrium_temperature = star.effective_temperature
                    * (star.radius / (2.0 * body.semi_major_axis)).sqrt()
                    * (1.0 - body.albedo).max(0.0).powf(0.25);
            }
        }
    }

    // ── Scale height (requires temperature) ──
    if body.scale_height == 0.0 && body.surface_gravity > 0.0 {
        // Use equilibrium temperature, or mean_surface_temperature, whichever is set
        let t = if body.equilibrium_temperature > 0.0 {
            body.equilibrium_temperature
        } else if body.mean_surface_temperature > 0.0 {
            body.mean_surface_temperature
        } else {
            0.0
        };

        if t > 0.0 {
            let mu = body.composition.mean_molecular_weight();
            // H = k_B × T / (μ × g)
            // Note: μ is in kg/mol, so we use R_gas / μ_mol = k_B / μ_kg
            // μ_kg = μ_mol / N_A, so k_B / μ_kg = k_B × N_A / μ_mol = R / μ_mol
            // Simpler: H = (R_gas / μ) × T / g = k_B × T / (μ_per_particle × g)
            // where μ_per_particle = μ_mol / N_A
            let mu_per_particle = mu / N_AVOGADRO;
            body.scale_height = K_BOLTZMANN * t / (mu_per_particle * body.surface_gravity);
        }
    }

    // ── Oblateness (Maclaurin approximation) ──
    if body.oblateness == 0.0 && body.rotation_rate.abs() > 0.0 {
        let omega_sq = body.rotation_rate * body.rotation_rate;
        let r_cubed = body.radius.powi(3);
        let gm = G * body.mass;
        if gm > 0.0 {
            body.oblateness = (omega_sq * r_cubed / (3.0 * gm)).min(0.5);
        }
    }

    // ── Atmosphere scale height (sync back to Atmosphere struct if present) ──
    if let Some(ref mut atm) = body.atmosphere {
        if atm.scale_height == 0.0 && body.scale_height > 0.0 {
            atm.scale_height = body.scale_height;
        }
    }
}

/// Compute the Roche limit for `body` orbiting `primary`.
/// Returns the critical orbital distance in meters below which
/// `body` would be tidally disrupted.
///
/// Rigid-body approximation: r_roche ≈ 2.456 × R_primary × (ρ_primary / ρ_body)^(1/3)
pub fn roche_limit(primary: &Body, body: &Body) -> f64 {
    if primary.bulk_density <= 0.0 || body.bulk_density <= 0.0 {
        return 0.0;
    }
    2.456 * primary.radius * (primary.bulk_density / body.bulk_density).powf(1.0 / 3.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, PlanetComposition};

    fn make_sun() -> Body {
        let mut sun = Body::star(0, "Sun", M_SUN, R_SUN);
        sun.effective_temperature = T_SUN;
        sun.luminosity = L_SUN;
        sun.compute_derived();
        sun
    }

    #[test]
    fn test_earth_derived() {
        let sun = make_sun();
        let mut earth = Body::planet(1, "Earth", M_EARTH, R_EARTH, AU, 29784.0);
        earth.semi_major_axis = AU;
        earth.composition = PlanetComposition::Rocky;
        earth.albedo = 0.3;
        earth.rotation_rate = OMEGA_EARTH;

        derive_planet_properties(&mut earth, Some(&sun));

        // Bulk density ≈ 5514 kg/m³
        assert!(
            (earth.bulk_density - RHO_EARTH).abs() < 100.0,
            "Earth ρ = {} kg/m³",
            earth.bulk_density
        );

        // Surface gravity ≈ 9.81 m/s²
        assert!(
            (earth.surface_gravity - G_SURFACE_EARTH).abs() < 0.1,
            "Earth g = {} m/s²",
            earth.surface_gravity
        );

        // Equilibrium temperature ≈ 255 K (without greenhouse)
        assert!(
            (earth.equilibrium_temperature - 255.0).abs() < 20.0,
            "Earth T_eq = {} K",
            earth.equilibrium_temperature
        );

        // Scale height ≈ 8500 m
        assert!(
            (earth.scale_height - 8500.0).abs() < 2000.0,
            "Earth H = {} m",
            earth.scale_height
        );

        // Oblateness ≈ 0.003 (from rotation)
        assert!(
            earth.oblateness > 0.001 && earth.oblateness < 0.01,
            "Earth f = {}",
            earth.oblateness
        );
    }

    #[test]
    fn test_jupiter_oblateness() {
        let mut jup = Body::planet(2, "Jupiter", M_JUPITER, R_JUPITER, 7.7857e11, 13070.0);
        jup.rotation_rate = OMEGA_JUPITER;
        jup.composition = PlanetComposition::GasGiant;

        derive_planet_properties(&mut jup, None);

        // Jupiter oblateness: Maclaurin approx gives ~0.030 (real ~0.065 due
        // to non-uniform density distribution). Accept 0.01–0.10.
        assert!(
            jup.oblateness > 0.01 && jup.oblateness < 0.10,
            "Jupiter f = {}",
            jup.oblateness
        );

        // Jupiter scale height — need temperature
        // Without parent star, T_eq won't be computed.
        // Use mean_surface_temperature as fallback.
        jup.scale_height = 0.0; // reset for re-derive
        jup.mean_surface_temperature = 165.0;
        derive_planet_properties(&mut jup, None);

        assert!(
            (jup.scale_height - 27_000.0).abs() < 10_000.0,
            "Jupiter H = {} m",
            jup.scale_height
        );
    }

    #[test]
    fn test_roche_limit_earth() {
        let mut sun = make_sun();
        sun.bulk_density = M_SUN / ((4.0 / 3.0) * std::f64::consts::PI * R_SUN.powi(3));

        let mut earth = Body::planet(1, "Earth", M_EARTH, R_EARTH, AU, 29784.0);
        earth.bulk_density = RHO_EARTH;

        let r_roche = roche_limit(&sun, &earth);

        // Roche limit of Earth around Sun should be well inside Earth's orbit
        assert!(
            r_roche < AU,
            "Roche limit {} m should be < 1 AU",
            r_roche
        );
        // Roughly 5.56e8 m (inside the Sun!)
        assert!(
            r_roche > 1e8 && r_roche < 2e9,
            "Roche limit = {} m",
            r_roche
        );
    }

    #[test]
    fn test_mars_scale_height() {
        let sun = make_sun();
        let mut mars = Body::planet(3, "Mars", 6.4171e23, 3.3895e6, 2.279e11, 24077.0);
        mars.semi_major_axis = 2.279e11;
        mars.composition = PlanetComposition::Rocky;
        mars.albedo = 0.25;
        mars.mean_surface_temperature = 210.0;

        derive_planet_properties(&mut mars, Some(&sun));

        // Mars scale height: using Rocky μ=0.029 gives ~16 km.
        // (Real Mars CO₂ atmosphere μ=0.044 gives ~11 km.)
        assert!(
            (mars.scale_height - 16000.0).abs() < 5000.0,
            "Mars H = {} m",
            mars.scale_height
        );
    }

    #[test]
    fn test_preserves_preset_values() {
        let mut planet = Body::planet(1, "Test", M_EARTH, R_EARTH, AU, 29784.0);
        planet.bulk_density = 9999.0; // manually set
        planet.oblateness = 0.123; // manually set

        derive_planet_properties(&mut planet, None);

        assert_eq!(planet.bulk_density, 9999.0);
        assert_eq!(planet.oblateness, 0.123);
    }
}
