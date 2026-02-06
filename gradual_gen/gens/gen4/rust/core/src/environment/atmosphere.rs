///! Atmosphere model: exponential pressure/density profiles.
///! Provides atmospheric properties at a given altitude above a body's surface.

use crate::body::Body;
use crate::units::*;

/// Get atmospheric density at altitude h above a body's surface
/// Uses exponential atmosphere model: ρ(h) = ρ₀ * exp(-h / H)
pub fn density_at_altitude(body: &Body, altitude: f64) -> f64 {
    if let Some(ref atm) = body.atmosphere {
        if altitude < 0.0 {
            return atm.surface_density.value();
        }
        let h = atm.scale_height.value();
        if h <= 0.0 { return 0.0; }
        atm.surface_density.value() * (-altitude / h).exp()
    } else {
        0.0
    }
}

/// Get atmospheric pressure at altitude h
/// P(h) = P₀ * exp(-h / H)
pub fn pressure_at_altitude(body: &Body, altitude: f64) -> f64 {
    if let Some(ref atm) = body.atmosphere {
        if altitude < 0.0 {
            return atm.surface_pressure.value();
        }
        let h = atm.scale_height.value();
        if h <= 0.0 { return 0.0; }
        atm.surface_pressure.value() * (-altitude / h).exp()
    } else {
        0.0
    }
}

/// Get temperature at altitude (simple linear lapse rate model)
/// T(h) = T₀ - λ * h where λ = g * M / (c_p * R)
/// Simplified to T₀ * (1 - h/H * M*g/(R*T₀))
pub fn temperature_at_altitude(body: &Body, altitude: f64) -> f64 {
    if let Some(ref atm) = body.atmosphere {
        let g = body.surface_gravity().value();
        let lapse_rate = g * atm.molecular_mass / (7.0 * GAS_CONSTANT); // For diatomic gas, c_p ≈ 7/2 R/M
        let temp = atm.surface_temperature - lapse_rate * altitude;
        temp.max(2.7) // Minimum = CMB temperature
    } else {
        2.7 // Cosmic microwave background
    }
}

/// Get the effective atmosphere height (where density drops to 1e-6 of surface)
pub fn effective_atmosphere_height(body: &Body) -> f64 {
    if let Some(ref atm) = body.atmosphere {
        // ρ/ρ₀ = exp(-h/H) = 1e-6 → h = H * ln(1e6) ≈ 13.8 * H
        atm.scale_height.value() * 13.8
    } else {
        0.0
    }
}

/// Speed of sound at altitude: c = sqrt(γ * R * T / M)
pub fn speed_of_sound(body: &Body, altitude: f64) -> f64 {
    if let Some(ref atm) = body.atmosphere {
        let temp = temperature_at_altitude(body, altitude);
        let gamma = 1.4; // For diatomic gas (N₂, O₂)
        (gamma * GAS_CONSTANT * temp / atm.molecular_mass).sqrt()
    } else {
        0.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType, AtmosphereParams};

    fn earth_with_atmosphere() -> Body {
        Body::new(1, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_atmosphere(AtmosphereParams {
                surface_pressure: Pascal::new(101325.0),
                surface_density: KgPerCubicMeter::new(1.225),
                scale_height: Meter::new(8500.0),
                molecular_mass: 0.029, // kg/mol for air
                surface_temperature: 288.15,
                rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
                mie_coefficient: 21e-6,
                mie_direction: 0.758,
            })
    }

    #[test]
    fn test_surface_density() {
        let earth = earth_with_atmosphere();
        let rho = density_at_altitude(&earth, 0.0);
        assert!((rho - 1.225).abs() < 0.01);
    }

    #[test]
    fn test_density_decrease() {
        let earth = earth_with_atmosphere();
        let rho_0 = density_at_altitude(&earth, 0.0);
        let rho_H = density_at_altitude(&earth, 8500.0);
        // At one scale height, density should be 1/e
        assert!((rho_H / rho_0 - 1.0 / std::f64::consts::E).abs() < 0.01);
    }

    #[test]
    fn test_speed_of_sound() {
        let earth = earth_with_atmosphere();
        let c = speed_of_sound(&earth, 0.0);
        // Speed of sound at sea level ≈ 343 m/s
        assert!((c - 343.0).abs() < 20.0, "Speed of sound = {}", c);
    }
}
