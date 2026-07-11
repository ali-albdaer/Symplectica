use physics_core::prelude::*;
use physics_core::constants::*;
use physics_core::force::{compute_total_energy, compute_total_momentum};
use physics_core::presets::create_full_solar_system_iv;

#[test]
fn test_full_solar_system_iv_body_count() {
    let sim = create_full_solar_system_iv(42, true);
    assert_eq!(sim.body_count(), 40);
}

#[test]
fn test_full_solar_system_iv_body_names() {
    let sim = create_full_solar_system_iv(42, true);
    let names: Vec<_> = sim.bodies().iter().map(|b| b.name.as_str()).collect();
    assert!(names.contains(&"Sun"));
    assert!(names.contains(&"Earth"));
    assert!(names.contains(&"Mars"));
    assert!(names.contains(&"Jupiter"));
    assert!(names.contains(&"Saturn"));
}

#[test]
fn test_full_solar_system_iv_determinism() {
    let sim1 = create_full_solar_system_iv(12345, true);
    let sim2 = create_full_solar_system_iv(12345, true);
    
    assert_eq!(sim1.bodies()[0].position, sim2.bodies()[0].position);
    assert_eq!(sim1.bodies()[0].velocity, sim2.bodies()[0].velocity);
}

#[test]
fn test_full_solar_system_iv_all_bodies_finite() {
    let sim = create_full_solar_system_iv(42, true);
    for body in sim.bodies() {
        assert!(body.position.x.is_finite());
        assert!(body.position.y.is_finite());
        assert!(body.position.z.is_finite());
        assert!(body.velocity.x.is_finite());
        assert!(body.velocity.y.is_finite());
        assert!(body.velocity.z.is_finite());
    }
}

#[test]
fn test_full_solar_system_iv_all_bodies_have_mass_and_radius() {
    let sim = create_full_solar_system_iv(42, true);
    for body in sim.bodies() {
        assert!(body.mass > 0.0);
        assert!(body.radius > 0.0);
    }
}

#[test]
fn test_full_solar_system_iv_sun_body() {
    let sim = create_full_solar_system_iv(42, true);
    let sun = &sim.bodies()[0];
    assert_eq!(sun.name, "Sun");
    let mass_diff = (sun.mass - M_SUN).abs() / M_SUN;
    assert!(mass_diff < 0.01, "Sun mass differs by {}", mass_diff);
}

#[test]
fn test_full_solar_system_iv_barycentric_momentum() {
    let sim = create_full_solar_system_iv(42, true);
    let momentum = compute_total_momentum(sim.bodies());
    let momentum_mag = momentum.length();
    // In barycentric frame, total momentum should be very close to zero
    assert!(momentum_mag < 1e26, "Total momentum too high: {}", momentum_mag);
}

#[test]
fn test_full_solar_system_iv_energy_conservation() {
    let mut sim = create_full_solar_system_iv(42, true);
    sim.set_dt(3600.0);
    
    let initial_energy = sim.total_energy();
    
    for _ in 0..50 {
        sim.step();
    }
    
    let final_energy = sim.total_energy();
    let error = (final_energy - initial_energy).abs() / initial_energy.abs();
    
    assert!(error < 2e-10, "Energy not conserved: error = {}", error);
}

#[test]
fn test_full_solar_system_iv_comet_body_types() {
    let sim = create_full_solar_system_iv(42, true);
    for body in sim.bodies() {
        if body.name.contains("P/") || body.name.contains("C/") {
            assert_eq!(body.body_type, BodyType::Comet, "{} is not a comet", body.name);
        }
    }
}

#[test]
fn test_full_solar_system_iv_asteroid_body_types() {
    let sim = create_full_solar_system_iv(42, true);
    for body in sim.bodies() {
        if body.name == "Ceres" || body.name == "Pallas" || body.name == "Vesta" {
            assert_eq!(body.body_type, BodyType::Asteroid, "{} is not an asteroid", body.name);
        }
    }
}
