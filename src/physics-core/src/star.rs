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

    // ── Limb-darkening coefficients (Claret 4-param non-linear, per-channel) ──
    if body.limb_darkening_coeffs == [0.0; 12] && body.effective_temperature > 0.0 {
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

/// Claret 4-parameter non-linear limb-darkening coefficients per channel (RGB).
/// Returns `[R_c1..R_c4, G_c1..G_c4, B_c1..B_c4]` (12 values).
///
/// Law per channel:
///   I_λ(μ)/I_λ(1) = 1 − c1*(1−μ^0.5) − c2*(1−μ) − c3*(1−μ^1.5) − c4*(1−μ²)
///
/// Interpolation control points derived from Claret & Bloemen (2011, A&A 529, A75)
/// bolometric/broadband passband tables, mapped to approximate R, G, B channels
/// (Cousins R ≈ red, Johnson V ≈ green, Johnson B ≈ blue).
fn limb_darkening_from_teff(t_eff: f64) -> [f64; 12] {
    // Each row: (T_eff, [c1,c2,c3,c4]_R, [c1,c2,c3,c4]_G, [c1,c2,c3,c4]_B)
    // 12 control points spanning M through O spectral types.
    const TABLE: &[(f64, [f64; 4], [f64; 4], [f64; 4])] = &[
        // Cool M dwarfs — heavy limb darkening, strongly chromatic
        (2800.0,
            [0.85, -0.50,  0.72, -0.28],   // R
            [1.10, -0.75,  0.90, -0.35],   // G
            [1.40, -1.10,  1.20, -0.50]),   // B
        (3500.0,
            [0.70, -0.30,  0.50, -0.18],
            [0.90, -0.50,  0.65, -0.22],
            [1.15, -0.80,  0.90, -0.35]),
        // Late K
        (4000.0,
            [0.58, -0.15,  0.35, -0.10],
            [0.75, -0.30,  0.48, -0.15],
            [0.95, -0.55,  0.68, -0.25]),
        // Early K
        (4500.0,
            [0.50, -0.05,  0.25, -0.05],
            [0.65, -0.18,  0.38, -0.10],
            [0.82, -0.38,  0.52, -0.18]),
        // Late G
        (5200.0,
            [0.42,  0.10,  0.12, -0.02],
            [0.55, -0.02,  0.25, -0.05],
            [0.70, -0.20,  0.40, -0.12]),
        // Solar (G2V) — reference point
        (5778.0,
            [0.38,  0.18,  0.02,  0.00],
            [0.50,  0.08,  0.15, -0.02],
            [0.64, -0.08,  0.30, -0.08]),
        // Late F
        (6200.0,
            [0.34,  0.22, -0.05,  0.02],
            [0.45,  0.14,  0.08,  0.00],
            [0.58,  0.00,  0.22, -0.05]),
        // A
        (7500.0,
            [0.28,  0.30, -0.15,  0.05],
            [0.35,  0.22, -0.05,  0.02],
            [0.45,  0.10,  0.08, -0.02]),
        // Late B
        (10000.0,
            [0.22,  0.32, -0.18,  0.06],
            [0.28,  0.28, -0.12,  0.04],
            [0.35,  0.20, -0.02,  0.00]),
        // Mid B
        (15000.0,
            [0.18,  0.30, -0.16,  0.05],
            [0.22,  0.28, -0.12,  0.04],
            [0.28,  0.22, -0.06,  0.02]),
        // Early B
        (25000.0,
            [0.14,  0.25, -0.12,  0.04],
            [0.18,  0.22, -0.08,  0.03],
            [0.22,  0.18, -0.04,  0.01]),
        // O
        (40000.0,
            [0.10,  0.20, -0.08,  0.02],
            [0.14,  0.18, -0.06,  0.02],
            [0.18,  0.15, -0.02,  0.00]),
    ];

    // Clamp to table range
    let t = t_eff.clamp(TABLE[0].0, TABLE[TABLE.len() - 1].0);

    // Find bracketing interval and linearly interpolate
    for i in 0..TABLE.len() - 1 {
        if t <= TABLE[i + 1].0 {
            let frac = (t - TABLE[i].0) / (TABLE[i + 1].0 - TABLE[i].0);
            let mut result = [0.0f64; 12];
            for k in 0..4 {
                result[k]     = TABLE[i].1[k] + frac * (TABLE[i + 1].1[k] - TABLE[i].1[k]); // R
                result[4 + k] = TABLE[i].2[k] + frac * (TABLE[i + 1].2[k] - TABLE[i].2[k]); // G
                result[8 + k] = TABLE[i].3[k] + frac * (TABLE[i + 1].3[k] - TABLE[i].3[k]); // B
            }
            return result;
        }
    }

    // Fallback (should not reach here)
    let last = &TABLE[TABLE.len() - 1];
    let mut result = [0.0f64; 12];
    for k in 0..4 {
        result[k]     = last.1[k];
        result[4 + k] = last.2[k];
        result[8 + k] = last.3[k];
    }
    result
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

        // Limb darkening coefficients should be reasonable (12 values: 4 per RGB channel)
        // R channel c1 should be positive (primary limb darkening term)
        assert!(sun.limb_darkening_coeffs[0] > 0.0, "LD R_c1 should be > 0, got {}", sun.limb_darkening_coeffs[0]);
        // G channel c1 should be > R (green darkens more than red)
        assert!(sun.limb_darkening_coeffs[4] > sun.limb_darkening_coeffs[0],
            "LD G_c1 ({}) should be > R_c1 ({})", sun.limb_darkening_coeffs[4], sun.limb_darkening_coeffs[0]);
        // B channel c1 should be > G (blue darkens most)
        assert!(sun.limb_darkening_coeffs[8] > sun.limb_darkening_coeffs[4],
            "LD B_c1 ({}) should be > G_c1 ({})", sun.limb_darkening_coeffs[8], sun.limb_darkening_coeffs[4]);

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
        // R channel c1 for a G-type star should be significant
        assert!(star.limb_darkening_coeffs[0] > 0.3, "Alpha Cen A LD R_c1 = {}", star.limb_darkening_coeffs[0]);
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
        // Solar (G2V): R_c1 ≈ 0.38, G_c1 ≈ 0.50, B_c1 ≈ 0.64
        assert!((ld[0] - 0.38).abs() < 0.1, "Sun LD R_c1 = {}", ld[0]);
        assert!((ld[4] - 0.50).abs() < 0.1, "Sun LD G_c1 = {}", ld[4]);
        assert!((ld[8] - 0.64).abs() < 0.1, "Sun LD B_c1 = {}", ld[8]);
        // Chromatic ordering: B_c1 > G_c1 > R_c1
        assert!(ld[8] > ld[4] && ld[4] > ld[0], "Expected B > G > R limb darkening");
    }

    #[test]
    fn test_limb_darkening_chromatic_cool() {
        // Cool M star should have very strong chromatic separation
        let ld = limb_darkening_from_teff(3000.0);
        let diff_br = ld[8] - ld[0]; // B_c1 - R_c1
        assert!(diff_br > 0.3, "Cool star B-R chromatic difference = {}", diff_br);
    }

    #[test]
    fn test_limb_darkening_hot_star() {
        // Hot O star should have weak, nearly achromatic limb darkening
        let ld = limb_darkening_from_teff(35000.0);
        assert!(ld[0] < 0.2, "O star R_c1 = {} (should be small)", ld[0]);
        let diff_br = ld[8] - ld[0];
        assert!(diff_br < 0.15, "Hot star B-R chromatic difference = {} (should be small)", diff_br);
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
