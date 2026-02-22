use physics_core::integrator::CloseEncounterIntegrator;
use physics_core::prelude::*;

fn build_close_pair() -> Simulation {
    let mut sim = Simulation::new(123);
    let a = Body::new(
        0,
        "A",
        BodyType::Planet,
        1.0e25,
        1.0e6,
        Vec3::ZERO,
        Vec3::ZERO,
    );
    let b = Body::new(
        0,
        "B",
        BodyType::Planet,
        1.0e25,
        1.0e6,
        Vec3::new(1.0e7, 0.0, 0.0),
        Vec3::ZERO,
    );

    sim.add_body(a);
    sim.add_body(b);
    sim.set_dt(1.0);
    sim.set_substeps(1);
    // Very permissive thresholds to guarantee trigger
    sim.set_close_encounter_thresholds(3.0, 1.0e-6, 1.0e-6);
    sim
}

#[test]
fn test_close_encounter_switch_rk45_logs_event() {
    let mut sim = build_close_pair();
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::Rk45);

    sim.step();

    let events = sim.take_close_encounter_events();
    assert!(!events.is_empty(), "Expected at least one close-encounter event");
    assert_eq!(events[0].integrator, "rk45");
}

#[test]
fn test_close_encounter_switch_gauss_radau_logs_event() {
    let mut sim = build_close_pair();
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::GaussRadau5);

    sim.step();

    let events = sim.take_close_encounter_events();
    assert!(!events.is_empty(), "Expected at least one close-encounter event");
    assert_eq!(events[0].integrator, "gauss-radau");
}

#[test]
fn test_close_encounter_continuity_smoke() {
    let mut sim = build_close_pair();
    sim.set_close_encounter_integrator(CloseEncounterIntegrator::GaussRadau5);

    for _ in 0..5 {
        sim.step();
        for body in sim.bodies() {
            assert!(body.position.is_finite(), "Non-finite position for {}", body.name);
            assert!(body.velocity.is_finite(), "Non-finite velocity for {}", body.name);
        }
    }
}
