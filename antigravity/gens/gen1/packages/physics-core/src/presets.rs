//! World Presets
//!
//! Pre-configured solar system simulations with accurate orbital data.
//! All values in SI units (meters, kilograms, seconds).

use crate::body::{Atmosphere, Body, BodyType};
use crate::simulation::Simulation;
use crate::vector::Vec3;
use crate::constants::*;

/// Convert hex color to RGB array
fn hex_to_rgb(hex: u32) -> [f64; 3] {
    [
        ((hex >> 16) & 0xFF) as f64 / 255.0,
        ((hex >> 8) & 0xFF) as f64 / 255.0,
        (hex & 0xFF) as f64 / 255.0,
    ]
}

/// Available preset configurations
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Preset {
    /// Sun, Earth, and Moon
    SunEarthMoon,
    /// Mercury, Venus, Earth, Mars
    InnerSolarSystem,
    /// Full 8 planets + Pluto
    FullSolarSystem,
    /// Jupiter and its 4 Galilean moons
    JupiterSystem,
    /// Saturn with rings (modeled as moons)
    SaturnSystem,
    /// Alpha Centauri A and B binary
    AlphaCentauri,
    /// TRAPPIST-1 exoplanet system
    Trappist1,
    /// Binary pulsar system
    BinaryPulsar,
}

impl Preset {
    /// Create a simulation from this preset
    pub fn create(&self, seed: u64) -> Simulation {
        match self {
            Preset::SunEarthMoon => create_sun_earth_moon(seed),
            Preset::InnerSolarSystem => create_inner_solar_system(seed),
            Preset::FullSolarSystem => create_full_solar_system(seed),
            Preset::JupiterSystem => create_jupiter_system(seed),
            Preset::SaturnSystem => create_saturn_system(seed),
            Preset::AlphaCentauri => create_alpha_centauri(seed),
            Preset::Trappist1 => create_trappist1(seed),
            Preset::BinaryPulsar => create_binary_pulsar(seed),
        }
    }
}

/// Sun-Earth-Moon system
pub fn create_sun_earth_moon(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    sim.add_star("Sun", M_SUN, R_SUN);
    
    let earth_id = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    
    sim.add_moon("Moon", M_MOON, R_MOON, earth_id, 3.844e8, 1022.0);
    
    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.atmosphere = Some(Atmosphere::earth_like());
    }
    
    sim
}

/// Inner Solar System: Sun, Mercury, Venus, Earth, Mars
pub fn create_inner_solar_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    sim.add_star("Sun", M_SUN, R_SUN);
    
    // Mercury
    sim.add_planet("Mercury", 3.3011e23, 2.4397e6, 5.791e10, 47362.0);
    
    // Venus
    sim.add_planet("Venus", 4.8675e24, 6.0518e6, 1.0821e11, 35020.0);
    
    // Earth with Moon
    let earth_id = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    sim.add_moon("Moon", M_MOON, R_MOON, earth_id, 3.844e8, 1022.0);
    
    // Mars
    sim.add_planet("Mars", 6.4171e23, 3.3895e6, 2.279e11, 24077.0);
    
    // Note: Mars moons not added as they orbit Mars, not Sun
    
    sim
}

/// Full Solar System with all 8 planets
pub fn create_full_solar_system(seed: u64) -> Simulation {
    let mut sim = create_inner_solar_system(seed);
    
    // Jupiter
    sim.add_planet("Jupiter", 1.8982e27, 6.9911e7, 7.7857e11, 13070.0);
    
    // Saturn
    sim.add_planet("Saturn", 5.6834e26, 5.8232e7, 1.4335e12, 9680.0);
    
    // Uranus
    sim.add_planet("Uranus", 8.6810e25, 2.5362e7, 2.8725e12, 6810.0);
    
    // Neptune
    sim.add_planet("Neptune", 1.02413e26, 2.4622e7, 4.4951e12, 5430.0);
    
    // Pluto (dwarf planet)
    sim.add_planet("Pluto", 1.303e22, 1.1883e6, 5.9064e12, 4748.0);
    
    sim
}

/// Jupiter system with Galilean moons
pub fn create_jupiter_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Jupiter at center
    let mut jupiter = Body::new(
        0, "Jupiter", BodyType::Planet,
        1.8982e27, 6.9911e7,
        Vec3::ZERO, Vec3::ZERO,
    );
    jupiter.color = hex_to_rgb(0xd4a574);
    sim.add_body(jupiter);
    
    // Galilean moons
    sim.add_planet("Io", 8.9319e22, 1.8216e6, 4.217e8, 17334.0);
    sim.add_planet("Europa", 4.7998e22, 1.5608e6, 6.709e8, 13740.0);
    sim.add_planet("Ganymede", 1.4819e23, 2.6341e6, 1.0704e9, 10880.0);
    sim.add_planet("Callisto", 1.0759e23, 2.4103e6, 1.8827e9, 8204.0);
    
    sim
}

/// Saturn system
pub fn create_saturn_system(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Saturn at center
    let mut saturn = Body::new(
        0, "Saturn", BodyType::Planet,
        5.6834e26, 5.8232e7,
        Vec3::ZERO, Vec3::ZERO,
    );
    saturn.color = hex_to_rgb(0xead6a7);
    sim.add_body(saturn);
    
    // Major moons
    sim.add_planet("Mimas", 3.7493e19, 1.983e5, 1.8554e8, 14320.0);
    sim.add_planet("Enceladus", 1.0802e20, 2.521e5, 2.3802e8, 12635.0);
    sim.add_planet("Tethys", 6.1745e20, 5.311e5, 2.9466e8, 11350.0);
    sim.add_planet("Dione", 1.0955e21, 5.613e5, 3.7742e8, 10028.0);
    sim.add_planet("Rhea", 2.3065e21, 7.638e5, 5.2704e8, 8480.0);
    sim.add_planet("Titan", 1.3452e23, 2.5747e6, 1.2218e9, 5570.0);
    sim.add_planet("Iapetus", 1.8056e21, 7.346e5, 3.5613e9, 3260.0);
    
    sim
}

/// Alpha Centauri binary star system
pub fn create_alpha_centauri(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Alpha Centauri A (slightly larger than Sun)
    let m_a = 1.1 * M_SUN;
    let m_b = 0.907 * M_SUN;
    let semi_major = 23.4 * AU; // ~23 AU separation
    
    // Calculate orbital velocities for binary
    let total_mass = m_a + m_b;
    let v_orbital = (G * total_mass / semi_major).sqrt();
    
    let r_a = semi_major * m_b / total_mass;
    let r_b = semi_major * m_a / total_mass;
    
    let mut star_a = Body::new(
        0, "Alpha Centauri A", BodyType::Star,
        m_a, 1.2234 * R_SUN,
        Vec3::new(-r_a, 0.0, 0.0),
        Vec3::new(0.0, -v_orbital * m_b / total_mass, 0.0),
    );
    star_a.color = hex_to_rgb(0xfff4e6);
    sim.add_body(star_a);
    
    let mut star_b = Body::new(
        0, "Alpha Centauri B", BodyType::Star,
        m_b, 0.8632 * R_SUN,
        Vec3::new(r_b, 0.0, 0.0),
        Vec3::new(0.0, v_orbital * m_a / total_mass, 0.0),
    );
    star_b.color = hex_to_rgb(0xffd27f);
    sim.add_body(star_b);
    
    sim
}

/// TRAPPIST-1 system with 7 Earth-like exoplanets
pub fn create_trappist1(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // TRAPPIST-1 is a red dwarf
    let m_star = 0.0898 * M_SUN;
    let r_star = 0.121 * R_SUN;
    
    let mut star = Body::new(
        0, "TRAPPIST-1", BodyType::Star,
        m_star, r_star,
        Vec3::ZERO, Vec3::ZERO,
    );
    star.color = hex_to_rgb(0xff4444); // Red dwarf
    sim.add_body(star);
    
    // Orbital periods in days and semi-major axes in AU
    let planets = [
        ("TRAPPIST-1b", 1.51, 0.01154, 1.017 * M_EARTH, 1.121 * R_EARTH),
        ("TRAPPIST-1c", 2.42, 0.01580, 1.156 * M_EARTH, 1.095 * R_EARTH),
        ("TRAPPIST-1d", 4.05, 0.02227, 0.297 * M_EARTH, 0.784 * R_EARTH),
        ("TRAPPIST-1e", 6.10, 0.02925, 0.772 * M_EARTH, 0.910 * R_EARTH),
        ("TRAPPIST-1f", 9.21, 0.03849, 0.934 * M_EARTH, 1.046 * R_EARTH),
        ("TRAPPIST-1g", 12.35, 0.04683, 1.148 * M_EARTH, 1.148 * R_EARTH),
        ("TRAPPIST-1h", 18.77, 0.06189, 0.331 * M_EARTH, 0.773 * R_EARTH),
    ];
    
    for (name, _period, a_au, mass, radius) in planets {
        let distance = a_au * AU;
        let velocity = (G * m_star / distance).sqrt();
        sim.add_planet(name, mass, radius, distance, velocity);
    }
    
    sim
}

/// Binary pulsar system (PSR J0737-3039)
pub fn create_binary_pulsar(seed: u64) -> Simulation {
    let mut sim = Simulation::new(seed);
    
    // Two neutron stars in tight orbit
    let m_a = 1.338 * M_SUN;
    let m_b = 1.249 * M_SUN;
    let semi_major = 8.8e8; // ~0.9 million km separation
    
    let total_mass = m_a + m_b;
    let v_orbital = (G * total_mass / semi_major).sqrt();
    
    let r_a = semi_major * m_b / total_mass;
    let r_b = semi_major * m_a / total_mass;
    
    // Neutron stars are tiny (~10 km radius)
    let r_neutron = 1.0e4;
    
    let mut pulsar_a = Body::new(
        0, "PSR J0737-3039A", BodyType::Star,
        m_a, r_neutron,
        Vec3::new(-r_a, 0.0, 0.0),
        Vec3::new(0.0, -v_orbital * m_b / total_mass, 0.0),
    );
    pulsar_a.color = hex_to_rgb(0xaaaaff);
    sim.add_body(pulsar_a);
    
    let mut pulsar_b = Body::new(
        0, "PSR J0737-3039B", BodyType::Star,
        m_b, r_neutron,
        Vec3::new(r_b, 0.0, 0.0),
        Vec3::new(0.0, v_orbital * m_a / total_mass, 0.0),
    );
    pulsar_b.color = hex_to_rgb(0xffaaff);
    sim.add_body(pulsar_b);
    
    sim
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_presets() {
        let presets = [
            Preset::SunEarthMoon,
            Preset::InnerSolarSystem,
            Preset::FullSolarSystem,
            Preset::JupiterSystem,
            Preset::SaturnSystem,
            Preset::AlphaCentauri,
            Preset::Trappist1,
            Preset::BinaryPulsar,
        ];
        
        for preset in presets {
            let sim = preset.create(42);
            assert!(sim.body_count() >= 2, "Preset {:?} has fewer than 2 bodies", preset);
            
            // Verify energy is negative (gravitationally bound system)
            let energy = sim.total_energy();
            assert!(energy < 0.0, "Preset {:?} has positive energy", preset);
        }
    }
    
    #[test]
    fn test_sun_earth_moon_positions() {
        let sim = create_sun_earth_moon(42);
        let bodies = sim.bodies();
        
        // Sun should be at origin
        let sun = &bodies[0];
        assert_eq!(sun.name, "Sun");
        assert!(sun.position.x.abs() < 1.0, "Sun X not at origin: {}", sun.position.x);
        
        // Earth should be at ~1 AU
        let earth = &bodies[1];
        assert_eq!(earth.name, "Earth");
        let earth_dist = earth.position.length();
        println!("Earth position: {:?}, distance: {} AU", earth.position, earth_dist / AU);
        assert!((earth_dist - AU).abs() < 1e6, "Earth not at 1 AU: {}", earth_dist / AU);
        
        // Moon should be ~384,400 km from Earth
        let moon = &bodies[2];
        assert_eq!(moon.name, "Moon");
        let moon_to_earth = (moon.position - earth.position).length();
        println!("Moon position: {:?}", moon.position);
        println!("Moon distance from Earth: {} km", moon_to_earth / 1000.0);
        assert!((moon_to_earth - 3.844e8).abs() < 1e6, "Moon not at correct distance: {} km", moon_to_earth / 1000.0);
    }
}
