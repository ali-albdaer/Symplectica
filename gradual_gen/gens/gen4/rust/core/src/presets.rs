///! Built-in universe presets (scenarios).
///! Each preset creates a fully configured SimulationState.

use crate::body::{Body, BodyType, AtmosphereParams, GravityHarmonics};
use crate::state::{SimulationState, SimConfig};
use crate::units::*;
use crate::vector::Vec3;
use crate::prng::DeterministicRng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PresetId {
    EmptySpace,
    TwoBodyKepler,
    SunEarthMoon,
    FullSolarSystem,
    BinaryStarCircumbinary,
    AlphaCentauri,
    RoguePlanetFlyby,
    DenseAsteroidBelt,
    ExtremeRelativistic,
}

/// Create a simulation state from a preset
pub fn create_preset(preset: PresetId, seed: u64) -> SimulationState {
    match preset {
        PresetId::EmptySpace => empty_space(seed),
        PresetId::TwoBodyKepler => two_body_kepler(seed),
        PresetId::SunEarthMoon => sun_earth_moon(seed),
        PresetId::FullSolarSystem => full_solar_system(seed),
        PresetId::BinaryStarCircumbinary => binary_star_circumbinary(seed),
        PresetId::AlphaCentauri => alpha_centauri(seed),
        PresetId::RoguePlanetFlyby => rogue_planet_flyby(seed),
        PresetId::DenseAsteroidBelt => dense_asteroid_belt(seed),
        PresetId::ExtremeRelativistic => extreme_relativistic(seed),
    }
}

fn empty_space(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    SimulationState::with_config(config)
}

fn two_body_kepler(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(3600.0);
    let mut state = SimulationState::with_config(config);

    let star = Body::new(1, "Star", BodyType::Star)
        .with_mass(Kilogram::new(SOLAR_MASS))
        .with_radius(Meter::new(6.957e8))
        .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.8)
        .with_position(Vec3::ZERO);

    let r = AU;
    let v = (G * SOLAR_MASS / r).sqrt();
    let planet = Body::new(2, "Planet", BodyType::Planet)
        .with_mass(Kilogram::new(EARTH_MASS))
        .with_radius(Meter::new(EARTH_RADIUS))
        .with_color(0.2, 0.4, 0.8)
        .with_position(Vec3::new(r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, v, 0.0))
        .with_parent(1);

    state.add_body(star);
    state.add_body(planet);
    state
}

fn sun_earth_moon(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(300.0); // 5 min for Moon accuracy
    let mut state = SimulationState::with_config(config);

    let sun = Body::new(1, "Sun", BodyType::Star)
        .with_mass(Kilogram::new(SOLAR_MASS))
        .with_radius(Meter::new(6.957e8))
        .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.8)
        .with_position(Vec3::ZERO);

    let earth_r = AU;
    let earth_v = (G * SOLAR_MASS / earth_r).sqrt();
    let mut earth = Body::new(2, "Earth", BodyType::Planet)
        .with_mass(Kilogram::new(EARTH_MASS))
        .with_radius(Meter::new(EARTH_RADIUS))
        .with_color(0.2, 0.4, 0.8)
        .with_position(Vec3::new(earth_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, earth_v, 0.0))
        .with_parent(1)
        .with_atmosphere(AtmosphereParams {
            surface_pressure: Pascal::new(101325.0),
            surface_density: KgPerCubicMeter::new(1.225),
            scale_height: Meter::new(8500.0),
            molecular_mass: 0.029,
            surface_temperature: 288.15,
            rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
            mie_coefficient: 21e-6,
            mie_direction: 0.758,
        })
        .with_harmonics(GravityHarmonics {
            reference_radius: Meter::new(EARTH_RADIUS),
            j_coefficients: vec![1.08263e-3, -2.54e-6, -1.62e-6],
            tesseral_c: vec![],
            tesseral_s: vec![],
        });
    earth.rotation_period = Second::new(86164.1); // Sidereal day
    earth.axial_tilt = Radian::new(0.4091); // 23.44°
    earth.compute_soi(Kilogram::new(SOLAR_MASS), earth_r);

    let moon_r = 3.844e8; // meters from Earth
    let moon_v = (G * EARTH_MASS / moon_r).sqrt();
    let mut moon = Body::new(3, "Moon", BodyType::Moon)
        .with_mass(Kilogram::new(7.342e22))
        .with_radius(Meter::new(1.737e6))
        .with_color(0.7, 0.7, 0.7)
        .with_position(Vec3::new(earth_r + moon_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, earth_v + moon_v, 0.0))
        .with_parent(2);
    moon.rotation_period = Second::new(27.322 * 86400.0); // Tidally locked
    moon.albedo = 0.12;

    state.add_body(sun);
    state.add_body(earth);
    state.add_body(moon);
    state
}

fn full_solar_system(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(3600.0);
    let mut state = SimulationState::with_config(config);

    // Sun
    let sun = Body::new(1, "Sun", BodyType::Star)
        .with_mass(Kilogram::new(SOLAR_MASS))
        .with_radius(Meter::new(6.957e8))
        .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.8)
        .with_position(Vec3::ZERO);
    state.add_body(sun);

    // Planetary data: (id, name, mass_kg, radius_m, distance_m, color)
    let planets: Vec<(u64, &str, f64, f64, f64, [f32; 3])> = vec![
        (2, "Mercury", 3.301e23, 2.440e6, 5.791e10, [0.7, 0.6, 0.5]),
        (3, "Venus",   4.867e24, 6.052e6, 1.082e11, [0.9, 0.7, 0.3]),
        (4, "Earth",   EARTH_MASS, EARTH_RADIUS, AU, [0.2, 0.4, 0.8]),
        (5, "Mars",    6.417e23, 3.390e6, 2.279e11, [0.8, 0.3, 0.1]),
        (6, "Jupiter", 1.898e27, 6.991e7, 7.786e11, [0.8, 0.7, 0.5]),
        (7, "Saturn",  5.683e26, 5.823e7, 1.434e12, [0.9, 0.8, 0.5]),
        (8, "Uranus",  8.681e25, 2.536e7, 2.871e12, [0.5, 0.7, 0.9]),
        (9, "Neptune", 1.024e26, 2.462e7, 4.495e12, [0.2, 0.3, 0.9]),
    ];

    for (id, name, mass, radius, distance, color) in planets {
        let v = (G * SOLAR_MASS / distance).sqrt();
        let mut body = Body::new(id, name, BodyType::Planet)
            .with_mass(Kilogram::new(mass))
            .with_radius(Meter::new(radius))
            .with_color(color[0], color[1], color[2])
            .with_position(Vec3::new(distance, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, v, 0.0))
            .with_parent(1);
        body.compute_soi(Kilogram::new(SOLAR_MASS), distance);

        // Add rings to Saturn
        if id == 7 {
            body.has_rings = true;
            body.ring_inner_radius = Meter::new(6.63e7);
            body.ring_outer_radius = Meter::new(1.40e8);
        }

        // Add atmosphere to Earth
        if id == 4 {
            body = body.with_atmosphere(AtmosphereParams {
                surface_pressure: Pascal::new(101325.0),
                surface_density: KgPerCubicMeter::new(1.225),
                scale_height: Meter::new(8500.0),
                molecular_mass: 0.029,
                surface_temperature: 288.15,
                rayleigh_coefficients: [5.5e-6, 13.0e-6, 22.4e-6],
                mie_coefficient: 21e-6,
                mie_direction: 0.758,
            });
        }

        state.add_body(body);
    }

    state
}

fn binary_star_circumbinary(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(1800.0);
    let mut state = SimulationState::with_config(config);

    let m1 = 1.1 * SOLAR_MASS;
    let m2 = 0.9 * SOLAR_MASS;
    let sep = 0.2 * AU; // Binary separation

    // Binary center of mass at origin
    let x1 = -sep * m2 / (m1 + m2);
    let x2 = sep * m1 / (m1 + m2);

    let v_orb = (G * (m1 + m2) / sep).sqrt();
    let v1 = v_orb * m2 / (m1 + m2);
    let v2 = v_orb * m1 / (m1 + m2);

    let star_a = Body::new(1, "Star A", BodyType::Star)
        .with_mass(Kilogram::new(m1))
        .with_radius(Meter::new(7.5e8))
        .with_luminosity(Watt::new(1.3 * SOLAR_LUMINOSITY))
        .with_color(1.0, 0.9, 0.7)
        .with_position(Vec3::new(x1, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, -v1, 0.0));

    let star_b = Body::new(2, "Star B", BodyType::Star)
        .with_mass(Kilogram::new(m2))
        .with_radius(Meter::new(6.2e8))
        .with_luminosity(Watt::new(0.7 * SOLAR_LUMINOSITY))
        .with_color(1.0, 0.8, 0.5)
        .with_position(Vec3::new(x2, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, v2, 0.0));

    // Circumbinary planet at ~3x binary separation
    let planet_r = 3.5 * sep;
    let planet_v = (G * (m1 + m2) / planet_r).sqrt();
    let planet = Body::new(3, "Circumbinary Planet", BodyType::Planet)
        .with_mass(Kilogram::new(2.0 * EARTH_MASS))
        .with_radius(Meter::new(1.2 * EARTH_RADIUS))
        .with_color(0.3, 0.5, 0.7)
        .with_position(Vec3::new(planet_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, planet_v, 0.0));

    state.add_body(star_a);
    state.add_body(star_b);
    state.add_body(planet);
    state
}

fn alpha_centauri(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(86400.0); // 1 day
    let mut state = SimulationState::with_config(config);

    // Alpha Centauri A
    let m_a = 1.1 * SOLAR_MASS;
    // Alpha Centauri B
    let m_b = 0.907 * SOLAR_MASS;
    // Proxima Centauri
    let m_p = 0.1221 * SOLAR_MASS;

    // A-B binary: semi-major axis ~23.4 AU, e ~0.52
    let a_ab = 23.4 * AU;
    // Start at periapsis for simplicity
    let r_peri = a_ab * (1.0 - 0.52);
    let x_a = -r_peri * m_b / (m_a + m_b);
    let x_b = r_peri * m_a / (m_a + m_b);
    let v_peri = (G * (m_a + m_b) * (2.0 / r_peri - 1.0 / a_ab)).sqrt();
    let v_a = v_peri * m_b / (m_a + m_b);
    let v_b = v_peri * m_a / (m_a + m_b);

    let star_a = Body::new(1, "Alpha Centauri A", BodyType::Star)
        .with_mass(Kilogram::new(m_a))
        .with_radius(Meter::new(1.2234 * 6.957e8))
        .with_luminosity(Watt::new(1.519 * SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.85)
        .with_position(Vec3::new(x_a, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, -v_a, 0.0));

    let star_b = Body::new(2, "Alpha Centauri B", BodyType::Star)
        .with_mass(Kilogram::new(m_b))
        .with_radius(Meter::new(0.8632 * 6.957e8))
        .with_luminosity(Watt::new(0.5002 * SOLAR_LUMINOSITY))
        .with_color(1.0, 0.85, 0.6)
        .with_position(Vec3::new(x_b, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, v_b, 0.0));

    // Proxima at ~12,950 AU
    let r_proxima = 12950.0 * AU;
    let v_proxima = (G * (m_a + m_b) / r_proxima).sqrt() * 0.5; // bound orbit
    let proxima = Body::new(3, "Proxima Centauri", BodyType::Star)
        .with_mass(Kilogram::new(m_p))
        .with_radius(Meter::new(0.1542 * 6.957e8))
        .with_luminosity(Watt::new(0.0017 * SOLAR_LUMINOSITY))
        .with_color(1.0, 0.4, 0.2)
        .with_position(Vec3::new(r_proxima, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, v_proxima, 0.0));

    state.add_body(star_a);
    state.add_body(star_b);
    state.add_body(proxima);
    state
}

fn rogue_planet_flyby(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(3600.0);
    let mut state = SimulationState::with_config(config);

    // Star system
    let sun = Body::new(1, "Star", BodyType::Star)
        .with_mass(Kilogram::new(SOLAR_MASS))
        .with_radius(Meter::new(6.957e8))
        .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.8)
        .with_position(Vec3::ZERO);

    let r = AU;
    let v = (G * SOLAR_MASS / r).sqrt();
    let planet = Body::new(2, "Planet", BodyType::Planet)
        .with_mass(Kilogram::new(EARTH_MASS))
        .with_radius(Meter::new(EARTH_RADIUS))
        .with_color(0.2, 0.4, 0.8)
        .with_position(Vec3::new(r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, v, 0.0))
        .with_parent(1);

    // Rogue planet approaching on a hyperbolic trajectory
    let rogue_mass = 5.0 * EARTH_MASS;
    let rogue_start = Vec3::new(-5.0 * AU, 2.0 * AU, 0.5 * AU);
    let rogue_vel = Vec3::new(15000.0, -5000.0, -1000.0); // ~16 km/s approach

    let rogue = Body::new(3, "Rogue Planet", BodyType::Planet)
        .with_mass(Kilogram::new(rogue_mass))
        .with_radius(Meter::new(1.5 * EARTH_RADIUS))
        .with_color(0.4, 0.2, 0.1)
        .with_position(rogue_start)
        .with_velocity(rogue_vel);

    state.add_body(sun);
    state.add_body(planet);
    state.add_body(rogue);
    state
}

fn dense_asteroid_belt(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(3600.0);
    config.solver_type = crate::solvers::SolverType::BarnesHut;
    config.softening_length = 1e6;
    let mut state = SimulationState::with_config(config);

    let sun = Body::new(1, "Sun", BodyType::Star)
        .with_mass(Kilogram::new(SOLAR_MASS))
        .with_radius(Meter::new(6.957e8))
        .with_luminosity(Watt::new(SOLAR_LUMINOSITY))
        .with_color(1.0, 0.95, 0.8)
        .with_position(Vec3::ZERO);
    state.add_body(sun);

    // Jupiter as perturber
    let jup_r = 7.786e11;
    let jup_v = (G * SOLAR_MASS / jup_r).sqrt();
    let jupiter = Body::new(2, "Jupiter", BodyType::Planet)
        .with_mass(Kilogram::new(1.898e27))
        .with_radius(Meter::new(6.991e7))
        .with_color(0.8, 0.7, 0.5)
        .with_position(Vec3::new(jup_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, jup_v, 0.0))
        .with_parent(1);
    state.add_body(jupiter);

    // Generate asteroids using deterministic PRNG
    let mut rng = DeterministicRng::new(seed);
    let belt_inner = 2.1 * AU;
    let belt_outer = 3.3 * AU;
    let n_asteroids = 2000;

    for i in 0..n_asteroids {
        let r = belt_inner + rng.next_f64() * (belt_outer - belt_inner);
        let theta = rng.next_f64() * TWO_PI;
        let incl = rng.next_normal(0.0, 0.05); // Small inclination spread
        let mass = 1e15 + rng.next_f64() * 1e17; // 10¹⁵ to 10¹⁷ kg
        let radius = (mass / 2500.0 * 3.0 / (4.0 * PI)).powf(1.0 / 3.0); // Assuming ρ ≈ 2500

        let v = (G * SOLAR_MASS / r).sqrt();
        let v_perturb = rng.next_normal(0.0, 100.0); // Small velocity perturbation

        let pos = Vec3::new(
            r * theta.cos() * incl.cos(),
            r * theta.sin() * incl.cos(),
            r * incl.sin(),
        );
        let vel = Vec3::new(
            -(v + v_perturb) * theta.sin(),
            (v + v_perturb) * theta.cos(),
            0.0,
        );

        let asteroid = Body::new(
            (i + 3) as u64,
            &format!("Asteroid-{}", i),
            BodyType::Asteroid,
        )
        .with_mass(Kilogram::new(mass))
        .with_radius(Meter::new(radius))
        .with_color(0.6, 0.5, 0.4)
        .with_position(pos)
        .with_velocity(vel)
        .with_parent(1);

        state.add_body(asteroid);
    }

    state
}

fn extreme_relativistic(seed: u64) -> SimulationState {
    let mut config = SimConfig::default();
    config.seed = seed;
    config.dt = Second::new(1.0); // Small timestep for fast dynamics
    config.integrator_type = crate::integrators::IntegratorType::GaussRadau15;
    let mut state = SimulationState::with_config(config);

    // Neutron star: 1.4 solar masses, ~10 km radius
    let ns_mass = 1.4 * SOLAR_MASS;
    let ns = Body::new(1, "Neutron Star", BodyType::NeutronStar)
        .with_mass(Kilogram::new(ns_mass))
        .with_radius(Meter::new(1e4))
        .with_color(0.9, 0.9, 1.0)
        .with_position(Vec3::ZERO);

    // White dwarf: 0.6 solar masses, ~Earth radius
    let wd_mass = 0.6 * SOLAR_MASS;
    let wd_r = 5e9; // 5 billion meters separation
    let wd_v = (G * ns_mass / wd_r).sqrt();
    let wd = Body::new(2, "White Dwarf", BodyType::WhiteDwarf)
        .with_mass(Kilogram::new(wd_mass))
        .with_radius(Meter::new(EARTH_RADIUS * 0.8))
        .with_color(1.0, 1.0, 0.95)
        .with_position(Vec3::new(wd_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, wd_v, 0.0))
        .with_parent(1);

    // Distant planet
    let planet_r = 10.0 * AU;
    let planet_v = (G * (ns_mass + wd_mass) / planet_r).sqrt();
    let planet = Body::new(3, "Orbiting Planet", BodyType::Planet)
        .with_mass(Kilogram::new(2.0 * EARTH_MASS))
        .with_radius(Meter::new(1.3 * EARTH_RADIUS))
        .with_color(0.4, 0.6, 0.3)
        .with_position(Vec3::new(planet_r, 0.0, 0.0))
        .with_velocity(Vec3::new(0.0, planet_v, 0.0));

    state.add_body(ns);
    state.add_body(wd);
    state.add_body(planet);
    state
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_all_presets_create() {
        let presets = [
            PresetId::EmptySpace,
            PresetId::TwoBodyKepler,
            PresetId::SunEarthMoon,
            PresetId::FullSolarSystem,
            PresetId::BinaryStarCircumbinary,
            PresetId::AlphaCentauri,
            PresetId::RoguePlanetFlyby,
            PresetId::DenseAsteroidBelt,
            PresetId::ExtremeRelativistic,
        ];

        for preset in &presets {
            let state = create_preset(*preset, 42);
            assert!(state.body_count() > 0 || *preset == PresetId::EmptySpace,
                "Preset {:?} should have bodies", preset);
        }
    }

    #[test]
    fn test_solar_system_has_planets() {
        let state = create_preset(PresetId::FullSolarSystem, 42);
        assert_eq!(state.body_count(), 9); // Sun + 8 planets
    }

    #[test]
    fn test_asteroid_belt_count() {
        let state = create_preset(PresetId::DenseAsteroidBelt, 42);
        assert!(state.body_count() >= 2002); // Sun + Jupiter + 2000 asteroids
    }

    #[test]
    fn test_preset_determinism() {
        let s1 = create_preset(PresetId::DenseAsteroidBelt, 42);
        let s2 = create_preset(PresetId::DenseAsteroidBelt, 42);

        assert_eq!(s1.body_count(), s2.body_count());
        for i in 0..s1.body_count() {
            assert_eq!(s1.bodies[i].position, s2.bodies[i].position);
            assert_eq!(s1.bodies[i].velocity, s2.bodies[i].velocity);
        }
    }
}
