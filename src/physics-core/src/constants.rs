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
