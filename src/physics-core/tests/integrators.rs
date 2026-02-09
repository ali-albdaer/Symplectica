use physics_core::constants::*;
use physics_core::force::{compute_accelerations_direct, compute_total_energy, ForceConfig};
use physics_core::integrator::{initialize_accelerations_with, step_with_accel, IntegratorConfig, IntegratorType};
use physics_core::octree::compute_accelerations_barnes_hut;
use physics_core::prelude::{Body, BodyType, Pcg32, Simulation, SimulationConfig, ForceMethod, Vec3};

fn build_two_body_system() -> Vec<Body> {
    vec![
        Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO),
        Body::new(
            1,
            "Earth",
            BodyType::Planet,
            M_EARTH,
            R_EARTH,
            Vec3::new(AU, 0.0, 0.0),
            Vec3::new(0.0, 29784.0, 0.0),
        ),
    ]
}

fn simulate_energy_drift(method: IntegratorType, steps: usize) -> f64 {
    let mut bodies = build_two_body_system();
    let mut config = IntegratorConfig::default();
    config.dt = 60.0;
    config.substeps = 1;
    config.method = method;

    initialize_accelerations_with(&mut bodies, &config.force_config, compute_accelerations_direct);
    let initial_energy = compute_total_energy(&bodies, config.force_config.softening);

    for _ in 0..steps {
        step_with_accel(&mut bodies, &config, compute_accelerations_direct);
    }

    let final_energy = compute_total_energy(&bodies, config.force_config.softening);
    ((final_energy - initial_energy) / initial_energy).abs()
}

#[test]
fn test_integrator_energy_drift_ordering() {
    let steps = 2000;
    let verlet_drift = simulate_energy_drift(IntegratorType::VelocityVerlet, steps);
    let leapfrog_drift = simulate_energy_drift(IntegratorType::Leapfrog, steps);
    let euler_drift = simulate_energy_drift(IntegratorType::Euler, steps);

    assert!(euler_drift > verlet_drift * 3.0, "Euler drift should be worse than Verlet");
    assert!(leapfrog_drift <= verlet_drift * 3.0, "Leapfrog drift should be comparable to Verlet");
}

fn build_random_bodies(seed: u64, count: usize) -> Vec<Body> {
    let mut rng = Pcg32::new(seed);
    let mut bodies = vec![Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO)];

    for i in 1..=count {
        let distance = rng.next_f64_range(0.5 * AU, 6.0 * AU);
        let angle = rng.next_f64() * 2.0 * std::f64::consts::PI;
        let pos = Vec3::new(distance * angle.cos(), distance * angle.sin(), 0.0);
        let v = (G * M_SUN / distance).sqrt();
        let vel = Vec3::new(-v * angle.sin(), v * angle.cos(), 0.0);

        bodies.push(Body::new(
            i as u32,
            format!("Asteroid{}", i),
            BodyType::Asteroid,
            1e15,
            1000.0,
            pos,
            vel,
        ));
    }

    bodies
}

fn build_simulation(bodies: &[Body], force_method: ForceMethod, barnes_hut_threshold: usize) -> Simulation {
    let mut integrator = IntegratorConfig::default();
    integrator.dt = 60.0;
    integrator.substeps = 1;
    integrator.method = IntegratorType::VelocityVerlet;
    integrator.force_config = ForceConfig {
        softening: DEFAULT_SOFTENING,
        barnes_hut_theta: 1.0,
    };

    let config = SimulationConfig {
        integrator,
        force_method,
        enable_collisions: false,
        barnes_hut_threshold,
    };

    let mut sim = Simulation::with_config(42, config);
    for body in bodies {
        sim.add_body(body.clone());
    }
    sim
}

#[test]
fn test_barnes_hut_switch_changes_result() {
    let bodies = build_random_bodies(7, 120);
    let mut direct_sim = build_simulation(&bodies, ForceMethod::Direct, usize::MAX);
    let mut bh_sim = build_simulation(&bodies, ForceMethod::BarnesHut, usize::MAX);

    direct_sim.step();
    bh_sim.step();

    let mut max_delta = 0.0;
    for (a, b) in direct_sim.bodies().iter().zip(bh_sim.bodies().iter()) {
        let delta = (a.position - b.position).length();
        if delta > max_delta {
            max_delta = delta;
        }
    }

    assert!(max_delta > 0.0, "Barnes-Hut and direct should diverge when theta is high");
}

#[test]
fn test_barnes_hut_accuracy_low_theta() {
    let bodies = build_random_bodies(11, 200);
    let config = ForceConfig {
        softening: DEFAULT_SOFTENING,
        barnes_hut_theta: 0.5,
    };

    let mut direct_bodies = bodies.clone();
    let mut bh_bodies = bodies.clone();

    compute_accelerations_direct(&mut direct_bodies, &config);
    compute_accelerations_barnes_hut(&mut bh_bodies, &config);

    let min_acc = 1e-7;
    let mut relative_errors: Vec<f64> = Vec::new();

    for (direct, bh) in direct_bodies.iter().zip(bh_bodies.iter()) {
        if !direct.is_active || !direct.is_massive {
            continue;
        }

        let direct_mag = direct.acceleration.length();
        if direct_mag < min_acc {
            continue;
        }

        let error_mag = (direct.acceleration - bh.acceleration).length();
        relative_errors.push(error_mag / direct_mag);
    }

    assert!(!relative_errors.is_empty(), "No bodies met the min_acc threshold");

    relative_errors.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let count = relative_errors.len();
    let mean_error = relative_errors.iter().sum::<f64>() / count as f64;
    let p95_index = ((count - 1) as f64 * 0.95) as usize;
    let p95_error = relative_errors[p95_index];

    assert!(mean_error < 0.05, "Mean error too high: {}", mean_error);
    assert!(p95_error < 0.2, "P95 error too high: {}", p95_error);
}
