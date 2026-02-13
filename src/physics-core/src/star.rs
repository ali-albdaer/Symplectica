//! Star-specific physics derivations
//!
//! Computes stellar properties from base parameters using empirical
//! main-sequence relations. All functions operate on `&mut Body` and
//! only overwrite fields that are still at their default (zero) value,
//! preserving manually-set values from presets.

use crate::body::{Body, BodyType};
use crate::constants::*;

/// Derive all star-specific properties for a body.
/// Only runs on bodies with `body_type == Star`.
/// Preserves non-zero values already set by presets.
pub fn derive_star_properties(body: &mut Body) {
    if body.body_type != BodyType::Star {
        return;
    }
    if body.mass <= 0.0 {
        return;
    }

    let m_ratio = body.mass / M_SUN;

    // ── Luminosity from piecewise mass–luminosity (main-sequence) ──
    if body.luminosity == 0.0 {
        body.luminosity = mass_luminosity(m_ratio) * L_SUN;
    }

    // ── Radius from mass–radius (main-sequence) ──
    // Only derive if radius looks like a placeholder (exact R_SUN or 0).
    // Preset-assigned radii are preserved.
    if body.radius <= 0.0 {
        body.radius = mass_radius(m_ratio) * R_SUN;
    }

    let l_ratio = body.luminosity / L_SUN;
    let _r_ratio = body.radius / R_SUN;

    // ── Effective temperature (Stefan–Boltzmann) ──
    if body.effective_temperature == 0.0 && body.radius > 0.0 {
        let r_m = body.radius;
        body.effective_temperature =
            (body.luminosity / (4.0 * std::f64::consts::PI * STEFAN_BOLTZMANN * r_m * r_m))
                .powf(0.25);
    }

    // ── Surface gravity ──
    if body.surface_gravity == 0.0 && body.radius > 0.0 {
        body.surface_gravity = G * body.mass / (body.radius * body.radius);
    }

    // ── Main-sequence lifetime ──
    if body.stellar_lifetime == 0.0 && l_ratio > 0.0 {
        // τ ≈ 10^10 yr × (M/M☉) / (L/L☉)
        body.stellar_lifetime = 1.0e10 * SECONDS_PER_YEAR * m_ratio / l_ratio;
    }

    // ── Spectral type from T_eff ──
    if body.spectral_type.is_empty() && body.effective_temperature > 0.0 {
        body.spectral_type = spectral_type_from_teff(body.effective_temperature);
    }

    // ── Limb-darkening coefficients (quadratic law) ──
    if body.limb_darkening_coeffs == [0.0, 0.0] && body.effective_temperature > 0.0 {
        body.limb_darkening_coeffs = limb_darkening_from_teff(body.effective_temperature);
    }

    // ── Activity parameters (flare rate, spot fraction) ──
    if body.flare_rate == 0.0 && body.rotation_rate > 0.0 {
        let omega_ratio = body.rotation_rate.abs() / OMEGA_SUN;
        // Age factor: younger → more active (Skumanich-like)
        let age_factor = if body.age > 0.0 {
            (AGE_SUN / body.age).sqrt().min(10.0)
        } else {
            1.0
        };
        // Flare rate ∝ rotation × age_factor, scaled so Sun ≈ 1e-5 /s
        body.flare_rate = 1.0e-5 * omega_ratio * age_factor;
    }

    if body.spot_fraction == 0.0 && body.rotation_rate > 0.0 {
        let omega_ratio = body.rotation_rate.abs() / OMEGA_SUN;
        // Spot fraction ∝ ω^1.5, clamped to 0–0.3
        body.spot_fraction = (0.01 * omega_ratio.powf(1.5)).min(0.3);
    }

    // ── Bulk density (if not set) ──
    if body.bulk_density == 0.0 && body.radius > 0.0 {
        let volume = (4.0 / 3.0) * std::f64::consts::PI * body.radius.powi(3);
        body.bulk_density = body.mass / volume;
    }

    // ── Escape velocity ──
    if body.escape_velocity_surface == 0.0 && body.radius > 0.0 {
        body.escape_velocity_surface = (2.0 * G * body.mass / body.radius).sqrt();
    }

    // ── Collision radius ──
    if body.collision_radius == 0.0 {
        body.collision_radius = body.radius;
    }
}

// ─── Mass–Luminosity relation (piecewise main-sequence) ─────────

/// Compute L/L☉ from M/M☉ using piecewise power-law.
/// Reference: Duric (2004), Salaris & Cassisi (2005)
fn mass_luminosity(m_ratio: f64) -> f64 {
    if m_ratio <= 0.0 {
        0.0
    } else if m_ratio < 0.43 {
        // Very low mass (M-dwarfs)
        0.23 * m_ratio.powf(2.3)
    } else if m_ratio < 2.0 {
        // Solar-type
        m_ratio.powf(4.0)
    } else if m_ratio < 55.0 {
        // Intermediate/massive
        1.4 * m_ratio.powf(3.5)
    } else {
        // Very massive (Eddington limit)
        32_000.0 * m_ratio
    }
}

// ─── Mass–Radius relation (main-sequence) ───────────────────────

/// Compute R/R☉ from M/M☉ using piecewise power-law.
fn mass_radius(m_ratio: f64) -> f64 {
    if m_ratio <= 0.0 {
        0.1
    } else if m_ratio < 1.0 {
        m_ratio.powf(0.8)
    } else {
        m_ratio.powf(0.57)
    }
}

// ─── Spectral classification ────────────────────────────────────

/// Map effective temperature to spectral type string.
fn spectral_type_from_teff(t_eff: f64) -> String {
    if t_eff >= 30_000.0 {
        "O".to_string()
    } else if t_eff >= 10_000.0 {
        "B".to_string()
    } else if t_eff >= 7_500.0 {
        "A".to_string()
    } else if t_eff >= 6_000.0 {
        "F".to_string()
    } else if t_eff >= 5_200.0 {
        "G".to_string()
    } else if t_eff >= 3_700.0 {
        "K".to_string()
    } else {
        "M".to_string()
    }
}

// ─── Limb-darkening coefficients ────────────────────────────────

/// Approximate quadratic limb-darkening coefficients [a, b] from T_eff.
/// Uses a simple interpolation across 6 control points spanning OBAFGKM.
/// More accurate tables exist (Claret 2000) but this is sufficient for
/// visual rendering.
///
/// Quadratic law: I(μ)/I(1) = 1 − a(1−μ) − b(1−μ)²
fn limb_darkening_from_teff(t_eff: f64) -> [f64; 2] {
    // Control points: (T_eff, a, b)
    // Derived from Claret (2000) V-band bolometric approximations.
    const TABLE: &[(f64, f64, f64)] = &[
        (3000.0, 0.85, -0.15),  // Cool M
        (4000.0, 0.70, 0.00),   // Late K
        (5000.0, 0.55, 0.15),   // Early K
        (5800.0, 0.45, 0.25),   // G (Sun-like)
        (7500.0, 0.35, 0.20),   // A
        (10000.0, 0.25, 0.10),  // B
        (30000.0, 0.15, 0.05),  // O
    ];

    // Clamp to table range
    let t = t_eff.clamp(TABLE[0].0, TABLE[TABLE.len() - 1].0);

    // Find bracketing interval
    for i in 0..TABLE.len() - 1 {
        if t <= TABLE[i + 1].0 {
            let frac = (t - TABLE[i].0) / (TABLE[i + 1].0 - TABLE[i].0);
            let a = TABLE[i].1 + frac * (TABLE[i + 1].1 - TABLE[i].1);
            let b = TABLE[i].2 + frac * (TABLE[i + 1].2 - TABLE[i].2);
            return [a, b];
        }
    }

    // Fallback (should not reach here)
    let last = TABLE[TABLE.len() - 1];
    [last.1, last.2]
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::Body;

    #[test]
    fn test_sun_luminosity() {
        let l = mass_luminosity(1.0);
        assert!(
            (l - 1.0).abs() < 0.05,
            "Sun L/L☉ should be ~1.0, got {}",
            l
        );
    }

    #[test]
    fn test_sun_radius() {
        let r = mass_radius(1.0);
        assert!(
            (r - 1.0).abs() < 0.05,
            "Sun R/R☉ should be ~1.0, got {}",
            r
        );
    }

    #[test]
    fn test_sun_derive() {
        let mut sun = Body::star(0, "Sun", M_SUN, R_SUN);
        sun.rotation_rate = OMEGA_SUN;
        sun.age = AGE_SUN;
        derive_star_properties(&mut sun);

        // T_eff should be close to 5778K
        assert!(
            (sun.effective_temperature - T_SUN).abs() < 100.0,
            "Sun T_eff = {} K (expected ~5778)",
            sun.effective_temperature
        );

        // Spectral type should be G
        assert_eq!(sun.spectral_type, "G", "Sun spectral type = {}", sun.spectral_type);

        // Luminosity should match L_SUN (it's set from preset radius)
        // Since we use preset R_SUN directly, luminosity is derived:
        // L = 4πσR²T⁴ ... but we set L first then derive T, so L = L_SUN
        assert!(
            (sun.luminosity - L_SUN).abs() / L_SUN < 0.05,
            "Sun L = {} W (expected ~{})",
            sun.luminosity,
            L_SUN
        );

        // Limb darkening coefficients should be reasonable
        assert!(sun.limb_darkening_coeffs[0] > 0.0, "LD coeff a should be > 0");
        assert!(sun.limb_darkening_coeffs[1] > 0.0, "LD coeff b should be > 0");

        // Lifetime should be ~10 Gyr
        let lifetime_gyr = sun.stellar_lifetime / (1.0e9 * SECONDS_PER_YEAR);
        assert!(
            (lifetime_gyr - 10.0).abs() < 2.0,
            "Sun lifetime = {} Gyr",
            lifetime_gyr
        );
    }

    #[test]
    fn test_trappist1_derive() {
        let m = 0.0898 * M_SUN;
        let r = 0.121 * R_SUN;
        let mut star = Body::star(0, "TRAPPIST-1", m, r);
        star.luminosity = 0.000522 * L_SUN; // preset override
        star.effective_temperature = 2566.0;  // preset override
        derive_star_properties(&mut star);

        assert_eq!(star.spectral_type, "M");
        // Lifetime should be very long (>100 Gyr)
        let lifetime_gyr = star.stellar_lifetime / (1.0e9 * SECONDS_PER_YEAR);
        assert!(lifetime_gyr > 50.0, "TRAPPIST-1 lifetime = {} Gyr", lifetime_gyr);
    }

    #[test]
    fn test_alpha_centauri_a_derive() {
        let m = 1.1 * M_SUN;
        let r = 1.2234 * R_SUN;
        let mut star = Body::star(0, "Alpha Cen A", m, r);
        star.luminosity = 1.519 * L_SUN;
        star.effective_temperature = 5790.0;
        derive_star_properties(&mut star);

        assert_eq!(star.spectral_type, "G");
        assert!(star.limb_darkening_coeffs[0] > 0.3);
    }

    #[test]
    fn test_spectral_types() {
        assert_eq!(spectral_type_from_teff(35000.0), "O");
        assert_eq!(spectral_type_from_teff(15000.0), "B");
        assert_eq!(spectral_type_from_teff(8000.0), "A");
        assert_eq!(spectral_type_from_teff(6500.0), "F");
        assert_eq!(spectral_type_from_teff(5500.0), "G");
        assert_eq!(spectral_type_from_teff(4500.0), "K");
        assert_eq!(spectral_type_from_teff(3000.0), "M");
    }

    #[test]
    fn test_limb_darkening_sun() {
        let ld = limb_darkening_from_teff(5778.0);
        // Sun-like: a ≈ 0.45, b ≈ 0.25
        assert!((ld[0] - 0.45).abs() < 0.1, "Sun LD a = {}", ld[0]);
        assert!((ld[1] - 0.25).abs() < 0.1, "Sun LD b = {}", ld[1]);
    }

    #[test]
    fn test_mass_luminosity_range() {
        // Very low mass → very low luminosity
        let l_01 = mass_luminosity(0.1);
        assert!(l_01 < 0.01, "0.1 M☉ L/L☉ = {}", l_01);

        // 10 M☉ → very high luminosity
        let l_10 = mass_luminosity(10.0);
        assert!(l_10 > 1000.0, "10 M☉ L/L☉ = {}", l_10);
    }

    #[test]
    fn test_preserves_preset_values() {
        let mut star = Body::star(0, "Test", M_SUN, R_SUN);
        star.luminosity = 42.0; // manually set
        star.effective_temperature = 9999.0; // manually set
        derive_star_properties(&mut star);

        // Should preserve preset values
        assert_eq!(star.luminosity, 42.0);
        assert_eq!(star.effective_temperature, 9999.0);
    }
}
