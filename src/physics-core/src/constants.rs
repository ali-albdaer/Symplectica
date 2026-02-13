//! Physical constants in SI units (m, kg, s)
//!
//! All values are sourced from CODATA 2018 and IAU 2015 Resolution B3.

/// Gravitational constant G in m³/(kg·s²)
/// CODATA 2018: 6.67430(15) × 10⁻¹¹
pub const G: f64 = 6.67430e-11;

/// Speed of light in vacuum in m/s (exact by definition)
pub const C: f64 = 299_792_458.0;

/// Astronomical Unit in meters (IAU 2012 exact definition)
pub const AU: f64 = 149_597_870_700.0;

/// Solar mass in kg (IAU 2015 nominal)
pub const M_SUN: f64 = 1.988_409_870e30;

/// Earth mass in kg (IAU 2015 nominal)
pub const M_EARTH: f64 = 5.972_167_867e24;

/// Moon mass in kg
pub const M_MOON: f64 = 7.342e22;

/// Solar radius in meters (IAU 2015 nominal)
pub const R_SUN: f64 = 6.957e8;

/// Earth radius (equatorial) in meters (IAU 2015 nominal)
pub const R_EARTH: f64 = 6.3781e6;

/// Moon radius in meters
pub const R_MOON: f64 = 1.7374e6;

/// Seconds per day
pub const SECONDS_PER_DAY: f64 = 86_400.0;

/// Seconds per year (Julian year)
pub const SECONDS_PER_YEAR: f64 = 365.25 * SECONDS_PER_DAY;

/// Default softening parameter for force calculations (meters)
/// Prevents division by zero in close encounters
/// Set to ~10km as default, can be adjusted per simulation
pub const DEFAULT_SOFTENING: f64 = 10_000.0;

/// Default Barnes-Hut theta parameter
/// θ < 0.5 is accurate, θ > 1.0 is fast but inaccurate
pub const DEFAULT_BARNES_HUT_THETA: f64 = 0.5;

/// Maximum number of massive bodies
pub const MAX_MASSIVE_BODIES: usize = 100;

/// Maximum total objects (including test particles)
pub const MAX_TOTAL_OBJECTS: usize = 500;

/// Default integrator substeps per tick
pub const DEFAULT_SUBSTEPS: u32 = 4;

/// Floating origin recenter threshold in meters (10^7 m = 10,000 km)
pub const FLOATING_ORIGIN_THRESHOLD: f64 = 1.0e7;

/// Stefan-Boltzmann constant σ in W·m⁻²·K⁻⁴ (CODATA 2018)
pub const STEFAN_BOLTZMANN: f64 = 5.670_374_419e-8;

/// Solar luminosity in Watts (IAU 2015 nominal)
pub const L_SUN: f64 = 3.828e26;

/// Solar effective temperature in Kelvin
pub const T_SUN: f64 = 5778.0;

/// Earth bulk density in kg/m³
pub const RHO_EARTH: f64 = 5514.0;

/// Earth surface gravity in m/s²
pub const G_SURFACE_EARTH: f64 = 9.80665;

/// Earth mean surface temperature in K
pub const T_SURFACE_EARTH: f64 = 288.0;

/// Earth rotation rate in rad/s (sidereal)
pub const OMEGA_EARTH: f64 = 7.2921159e-5;

/// Earth axial tilt in radians (~23.44°)
pub const AXIAL_TILT_EARTH: f64 = 0.4091;

// ─── Thermodynamic & molecular constants ────────────────────────

/// Boltzmann constant k_B in J/K (CODATA 2018, exact by redefinition)
pub const K_BOLTZMANN: f64 = 1.380_649e-23;

/// Avogadro constant (CODATA 2018, exact)
pub const N_AVOGADRO: f64 = 6.022_140_76e23;

/// Universal gas constant R = k_B × N_A in J/(mol·K)
pub const R_GAS: f64 = K_BOLTZMANN * N_AVOGADRO;

// ─── Mean molecular weights (kg/mol) by composition class ───────

/// Rocky / terrestrial atmosphere (N₂/O₂ dominated)
pub const MU_ROCKY: f64 = 0.029;

/// Gas giant atmosphere (H₂/He dominated)
pub const MU_GAS_GIANT: f64 = 0.002;

/// Ice giant atmosphere (H₂/He + CH₄/H₂O enriched)
pub const MU_ICE_GIANT: f64 = 0.004;

/// Dwarf planet / thin atmosphere
pub const MU_DWARF: f64 = 0.028;

// ─── Star reference constants ───────────────────────────────────

/// Solar age in seconds (~4.6 Gyr)
pub const AGE_SUN: f64 = 4.6e9 * SECONDS_PER_YEAR;

/// Solar rotation rate in rad/s (sidereal, ~25.05 day period)
pub const OMEGA_SUN: f64 = 2.865e-6;

/// Solar metallicity [Fe/H] in dex
pub const METALLICITY_SUN: f64 = 0.0;

// ─── Planet reference constants ─────────────────────────────────

/// Jupiter mass in kg
pub const M_JUPITER: f64 = 1.898_2e27;

/// Jupiter equatorial radius in meters
pub const R_JUPITER: f64 = 7.149_2e7;

/// Jupiter rotation rate in rad/s (sidereal, ~9.925 hr)
pub const OMEGA_JUPITER: f64 = 1.7585e-4;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_earth_orbital_velocity() {
        // Earth's orbital velocity: v = sqrt(G * M_sun / r)
        let v = (G * M_SUN / AU).sqrt();
        // Should be approximately 29.78 km/s
        let expected = 29_780.0; // m/s
        assert!((v - expected).abs() < 100.0, "Earth orbital velocity: {} m/s", v);
    }

    #[test]
    fn test_earth_orbital_period() {
        // T = 2π * sqrt(a³ / (G * M))
        let period = 2.0 * std::f64::consts::PI * (AU.powi(3) / (G * M_SUN)).sqrt();
        let expected_days = 365.25;
        let actual_days = period / SECONDS_PER_DAY;
        assert!(
            (actual_days - expected_days).abs() < 0.5,
            "Earth orbital period: {} days",
            actual_days
        );
    }
}
