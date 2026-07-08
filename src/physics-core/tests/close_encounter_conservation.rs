use physics_core::prelude::*;
use physics_core::force::{compute_total_energy};

fn setup_eccentric_encounter(sim: &mut Simulation) {
    let m1 = M_SUN;
    let m2 = M_JUPITER;
    let r1 = R_SUN;
    let r2 = R_JUPITER;
    
    sim.add_star("S1", m1, r1);
    sim.get_body_mut(0).unwrap().position = Vec3::ZERO;
    
    // Semi-major axis 1 AU, eccentricity 0.9 -> periapsis 0.1 AU
    let a = AU;
    let e = 0.9;
    let r_p = a * (1.0 - e);
    let v_p = (G * m1 * (1.0 + e) / (a * (1.0 - e))).sqrt();
    
    sim.add_planet("P1", m2, r2, 0.0, 0.0);
    let p = sim.get_body_mut(1).unwrap();
    p.position = Vec3::new(r_p, 0.0, 0.0);
    p.velocity = Vec3::new(0.0, v_p, 0.0);
}

#[test]
fn test_close_encounter_conservation_rk45() {
    let mut sim = Simulation::new(42);
    setup_eccentric_encounter(&mut sim);
    
    sim.set_dt(86400.0 / 24.0); // 1 hour steps
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::Rk45);
    
    let mut cfg = sim.config().clone();
    cfg.integrator.close_encounter.hill_factor = 5.0; // trigger CE near periapsis
    sim.set_config(cfg);
    
    let initial_energy = compute_total_energy(sim.bodies(), DEFAULT_SOFTENING);
    
    for _ in 0..100 { // 100 hours
        sim.step();
    }
    
    let final_energy = compute_total_energy(sim.bodies(), DEFAULT_SOFTENING);
    let error = (final_energy - initial_energy).abs() / initial_energy.abs();
    
    assert!(error < 1e-3, "RK45 energy conservation failed: error = {}", error);
}

#[test]
fn test_close_encounter_conservation_gauss_radau() {
    let mut sim = Simulation::new(42);
    setup_eccentric_encounter(&mut sim);
    
    sim.set_dt(86400.0 / 24.0); // 1 hour steps
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::GaussRadau5);
    
    let mut cfg = sim.config().clone();
    cfg.integrator.close_encounter.hill_factor = 5.0;
    sim.set_config(cfg);
    
    let initial_energy = compute_total_energy(sim.bodies(), DEFAULT_SOFTENING);
    
    for _ in 0..100 {
        sim.step();
    }
    
    let final_energy = compute_total_energy(sim.bodies(), DEFAULT_SOFTENING);
    let error = (final_energy - initial_energy).abs() / initial_energy.abs();
    
    assert!(error < 1e-3, "Gauss-Radau energy conservation failed: error = {}", error);
}

#[test]
fn test_close_encounter_does_not_produce_nan() {
    let mut sim = Simulation::new(42);
    setup_eccentric_encounter(&mut sim);
    
    sim.set_dt(3600.0);
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::GaussRadau5);
    
    for _ in 0..100 {
        sim.step();
        let pos = sim.bodies()[1].position;
        assert!(pos.x.is_finite());
        assert!(pos.y.is_finite());
        assert!(pos.z.is_finite());
    }
}

#[test]
fn test_close_encounter_hill_radius_scaling() {
    let mut sim = Simulation::new(42);
    sim.set_close_encounter_thresholds(2.5, 0.0, 0.0);
    assert_eq!(sim.config().integrator.close_encounter.hill_factor, 2.5);
}
