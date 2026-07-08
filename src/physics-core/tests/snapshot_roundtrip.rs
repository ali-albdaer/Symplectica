use physics_core::prelude::*;
use physics_core::snapshot::{Snapshot, DeltaSnapshot, SNAPSHOT_VERSION};

#[test]
fn test_snapshot_roundtrip_all_fields() {
    let mut sim = Simulation::new(42);
    let sun_id = sim.add_star("Sun", M_SUN, R_SUN);
    let earth_id = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    
    if let Some(sun) = sim.get_body_mut(sun_id) {
        sun.luminosity = L_SUN * 1.5;
        sun.rotation_rate = OMEGA_SUN;
    }
    
    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.axial_tilt = 0.409;
        earth.albedo = 0.3;
    }
    
    sim.step_n(10);
    
    let snapshot = sim.snapshot();
    let json = snapshot.to_json().expect("Failed to serialize");
    
    let restored: Snapshot = Snapshot::from_json(&json).expect("Failed to deserialize");
    
    assert_eq!(restored.version, SNAPSHOT_VERSION);
    assert_eq!(restored.bodies.len(), 2);
    
    let b1 = &snapshot.bodies[0];
    let b2 = &restored.bodies[0];
    
    assert_eq!(b1.id, b2.id);
    assert_eq!(b1.name, b2.name);
    assert_eq!(b1.mass, b2.mass);
    assert_eq!(b1.radius, b2.radius);
    
    // FP equality requires tolerance due to json text serialization
    assert!((b1.position - b2.position).length() < 1e-4);
    assert!((b1.velocity - b2.velocity).length() < 1e-4);
    assert!((b1.acceleration - b2.acceleration).length() < 1e-4);
    assert!((b1.luminosity - b2.luminosity).abs() < 1e-4);
    assert!((b1.rotation_rate - b2.rotation_rate).abs() < 1e-4);
    
    let mut sim2 = Simulation::new(123);
    sim2.restore(restored).expect("Failed to restore");
    
    assert_eq!(sim.tick(), sim2.tick());
    assert_eq!(sim.time(), sim2.time());
    
    sim.step();
    sim2.step();
    
    assert!((sim.bodies()[1].position - sim2.bodies()[1].position).length() < 1e-4);
}

#[test]
fn test_delta_snapshot_correctness() {
    let mut sim = Simulation::new(42);
    let _id1 = sim.add_star("Sun", M_SUN, R_SUN);
    let id2 = sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    
    let snap1 = sim.snapshot();
    
    sim.get_body_mut(id2).unwrap().position.x += 1000.0;
    
    let snap2 = sim.snapshot();
    
    let delta = DeltaSnapshot::from_diff(&snap1, &snap2);
    
    assert_eq!(delta.changed_bodies.len(), 1);
    assert_eq!(delta.changed_bodies[0].id, id2);
}
