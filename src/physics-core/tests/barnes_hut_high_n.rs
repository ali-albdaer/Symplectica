use physics_core::prelude::*;
use physics_core::force::{compute_accelerations_direct};
use physics_core::octree::compute_accelerations_barnes_hut;
use physics_core::force::ForceConfig;

#[test]
fn test_barnes_hut_high_n_accuracy() {
    let mut sim = Simulation::new(42);
    let mut rng = Pcg32::new(12345);
    
    sim.add_star("SMBH", 1e36, 1e9);
    
    for i in 0..1000 {
        let name = format!("Body_{}", i);
        let mass = 1e24 + rng.next_f64() * 1e24;
        let r = 1e11 + rng.next_f64() * 1e12;
        let theta = rng.next_f64() * 2.0 * std::f64::consts::PI;
        let phi = rng.next_f64() * std::f64::consts::PI;
        
        let x = r * phi.sin() * theta.cos();
        let y = r * phi.sin() * theta.sin();
        let z = r * phi.cos();
        
        let id = sim.add_planet(&name, mass, 1e5, 0.0, 0.0);
        if let Some(body) = sim.get_body_mut(id) {
            body.position = Vec3::new(x, y, z);
        }
    }
    
    let mut bodies_direct = sim.bodies().to_vec();
    let mut bodies_bh = sim.bodies().to_vec();
    
    let config = ForceConfig {
        softening: DEFAULT_SOFTENING,
        barnes_hut_theta: 0.5,
    };
    
    compute_accelerations_direct(&mut bodies_direct, &config);
    compute_accelerations_barnes_hut(&mut bodies_bh, &config);
    
    let mut max_err = 0.0;
    let mut mean_err = 0.0;
    
    for i in 0..bodies_direct.len() {
        let mag_direct = bodies_direct[i].acceleration.length();
        if mag_direct > 0.0 {
            let err = (bodies_direct[i].acceleration - bodies_bh[i].acceleration).length() / mag_direct;
            mean_err += err;
            if err > max_err {
                max_err = err;
            }
        }
    }
    mean_err /= bodies_direct.len() as f64;
    
    assert!(mean_err < 0.05, "Mean error too high: {}", mean_err);
}

#[test]
fn test_octree_degenerate_same_position() {
    let mut sim = Simulation::new(42);
    
    for i in 0..10 {
        let name = format!("Degenerate_{}", i);
        let id = sim.add_planet(&name, 1e20, 1e4, 0.0, 0.0);
        if let Some(body) = sim.get_body_mut(id) {
            body.position = Vec3::new(1e10, 1e10, 1e10);
        }
    }
    
    let mut bodies = sim.bodies().to_vec();
    let config = ForceConfig {
        softening: DEFAULT_SOFTENING,
        barnes_hut_theta: 0.5,
    };
    
    // Should not infinite loop or panic
    compute_accelerations_barnes_hut(&mut bodies, &config);
    
    for body in bodies {
        assert!(body.acceleration.x.is_finite());
        assert!(body.acceleration.y.is_finite());
        assert!(body.acceleration.z.is_finite());
    }
}
