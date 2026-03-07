//! Full Solar System III (2026) Validation Tests
//!
//! Verifies the HORIZONS-based preset:
//! - Correct number of bodies (40)
//! - Position/velocity data matches HORIZONS epoch 2026-01-01
//! - Barycentric momentum conservation
//! - Deterministic output

use physics_core::presets::create_full_solar_system_iii;
use physics_core::force::compute_total_momentum;
use physics_core::prelude::*;

/// Test: Verify preset has all 40 expected bodies
#[test]
fn test_full_solar_system_iii_body_count() {
    let sim = create_full_solar_system_iii(42, false);
    assert_eq!(sim.body_count(), 40, "Expected 40 bodies");
}

/// Test: Verify body names are present
#[test]
fn test_full_solar_system_iii_body_names() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();
    let names: Vec<&str> = bodies.iter().map(|b| b.name.as_str()).collect();

    let expected = [
        "Sun", "Mercury", "Venus", "Earth", "Moon", "Mars",
        "Phobos", "Deimos", "Jupiter", "Io", "Europa", "Ganymede",
        "Callisto", "Saturn", "Mimas", "Enceladus", "Tethys",
        "Dione", "Rhea", "Titan", "Iapetus", "Uranus", "Miranda",
        "Ariel", "Umbriel", "Titania", "Oberon", "Neptune", "Triton",
        "Nereid", "Pluto", "Charon", "Ceres", "Pallas", "Vesta",
        "1P/Halley", "2P/Encke", "67P/C-G", "Hale-Bopp",
        "109P/Swift-Tuttle",
    ];
    for name in &expected {
        assert!(names.contains(name), "Missing body: {}", name);
    }
}

/// Test: Earth position matches HORIZONS data (epoch 2026-01-01)
/// HORIZONS heliocentric position: [-26072138.448, 144774673.821, -8892.862] km
#[test]
fn test_earth_position_matches_horizons() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();
    let earth = bodies.iter().find(|b| b.name == "Earth").unwrap();

    // Position in meters (km × 1e3)
    let expected_x = -26072138.44816194e3;
    let expected_y = 144774673.8210197e3;
    let expected_z = -8892.861905746162e3;

    let tol = 1.0; // 1 meter tolerance
    assert!((earth.position.x - expected_x).abs() < tol,
        "Earth X: {} vs {}", earth.position.x, expected_x);
    assert!((earth.position.y - expected_y).abs() < tol,
        "Earth Y: {} vs {}", earth.position.y, expected_y);
    assert!((earth.position.z - expected_z).abs() < tol,
        "Earth Z: {} vs {}", earth.position.z, expected_z);
}

/// Test: Jupiter velocity matches HORIZONS data
/// HORIZONS heliocentric velocity: [-12.520, -3.640, 0.295] km/s
#[test]
fn test_jupiter_velocity_matches_horizons() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();
    let jupiter = bodies.iter().find(|b| b.name == "Jupiter").unwrap();

    let expected_vx = -12.52004139508961e3;
    let expected_vy = -3.640294521136214e3;
    let expected_vz = 0.2951466824685909e3;

    let tol = 0.001; // 1 mm/s tolerance
    assert!((jupiter.velocity.x - expected_vx).abs() < tol,
        "Jupiter VX: {} vs {}", jupiter.velocity.x, expected_vx);
    assert!((jupiter.velocity.y - expected_vy).abs() < tol,
        "Jupiter VY: {} vs {}", jupiter.velocity.y, expected_vy);
    assert!((jupiter.velocity.z - expected_vz).abs() < tol,
        "Jupiter VZ: {} vs {}", jupiter.velocity.z, expected_vz);
}

/// Test: Sun is at origin in heliocentric mode
#[test]
fn test_sun_at_origin_heliocentric() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();
    let sun = bodies.iter().find(|b| b.name == "Sun").unwrap();

    assert_eq!(sun.position.x, 0.0);
    assert_eq!(sun.position.y, 0.0);
    assert_eq!(sun.position.z, 0.0);
    assert_eq!(sun.velocity.x, 0.0);
    assert_eq!(sun.velocity.y, 0.0);
    assert_eq!(sun.velocity.z, 0.0);
}

/// Test: Barycentric mode gives near-zero total momentum
#[test]
fn test_barycentric_momentum_iii() {
    let sim = create_full_solar_system_iii(42, true);
    let bodies = sim.bodies();

    let mom = compute_total_momentum(bodies);
    let total_mass: f64 = bodies.iter().map(|b| b.mass).sum();
    let bulk_v = (mom.x * mom.x + mom.y * mom.y + mom.z * mom.z).sqrt() / total_mass;

    // Bulk velocity should be < 0.01 m/s after barycentric recentering
    assert!(bulk_v < 0.01,
        "Barycentric bulk velocity too large: {} m/s", bulk_v);
}

/// Test: Deterministic — same seed gives identical results
#[test]
fn test_determinism_iii() {
    let sim1 = create_full_solar_system_iii(42, true);
    let sim2 = create_full_solar_system_iii(42, true);

    let b1 = sim1.bodies();
    let b2 = sim2.bodies();

    assert_eq!(b1.len(), b2.len());
    for (a, b) in b1.iter().zip(b2.iter()) {
        assert_eq!(a.position.x, b.position.x, "Position mismatch for {}", a.name);
        assert_eq!(a.velocity.x, b.velocity.x, "Velocity mismatch for {}", a.name);
    }
}

/// Test: Moon is within reasonable distance of Earth (~384,400 km)
#[test]
fn test_moon_earth_distance() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();
    let earth = bodies.iter().find(|b| b.name == "Earth").unwrap();
    let moon = bodies.iter().find(|b| b.name == "Moon").unwrap();

    let dx = moon.position.x - earth.position.x;
    let dy = moon.position.y - earth.position.y;
    let dz = moon.position.z - earth.position.z;
    let dist = (dx * dx + dy * dy + dz * dz).sqrt();

    // Moon distance should be between 356,000 km and 407,000 km
    let dist_km = dist / 1e3;
    assert!(dist_km > 356_000.0 && dist_km < 407_000.0,
        "Moon-Earth distance: {} km (expected 356k-407k)", dist_km);
}

/// Test: All bodies have positive mass and radius
#[test]
fn test_all_bodies_have_mass_and_radius() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();

    for body in bodies {
        assert!(body.mass > 0.0, "{} has zero or negative mass", body.name);
        assert!(body.radius > 0.0, "{} has zero or negative radius", body.name);
    }
}

/// Test: Comets have correct body type
#[test]
fn test_comet_body_types() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();

    let comets = ["1P/Halley", "2P/Encke", "67P/C-G", "Hale-Bopp", "109P/Swift-Tuttle"];
    for name in &comets {
        let body = bodies.iter().find(|b| b.name == *name)
            .unwrap_or_else(|| panic!("Missing comet: {}", name));
        assert_eq!(body.body_type, BodyType::Comet,
            "{} should be Comet, got {:?}", name, body.body_type);
    }
}

/// Test: Asteroids have correct body type
#[test]
fn test_asteroid_body_types() {
    let sim = create_full_solar_system_iii(42, false);
    let bodies = sim.bodies();

    let asteroids = ["Ceres", "Pallas", "Vesta"];
    for name in &asteroids {
        let body = bodies.iter().find(|b| b.name == *name)
            .unwrap_or_else(|| panic!("Missing asteroid: {}", name));
        assert_eq!(body.body_type, BodyType::Asteroid,
            "{} should be Asteroid, got {:?}", name, body.body_type);
    }
}
