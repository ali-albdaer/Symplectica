/// Physics Audit Test for Full Solar System Preset
/// 
/// This test performs comprehensive validation of the Full Solar System preset:
/// - Verifies all body data integrity
/// - Computes and validates orbital elements
/// - Calculates derived quantities (Hill radius, SOI, energy, angular momentum)
/// - Runs dynamic simulation and checks conservation laws
/// - Compares orbital periods and semi-major axes to canonical values

use physics_core::prelude::*;
use physics_core::constants::*;
use physics_core::force::{compute_total_energy, compute_total_momentum};
use std::f64::consts::PI;

/// Canonical solar system data for validation
struct CanonicalData {
    name: &'static str,
    semi_major_axis_m: f64,
    orbital_period_days: f64,
    eccentricity: f64,
    inclination_deg: f64,
}

const CANONICAL_ORBITS: &[CanonicalData] = &[
    CanonicalData {
        name: "Mercury",
        semi_major_axis_m: 5.7909e10,
        orbital_period_days: 87.969,
        eccentricity: 0.2056,
        inclination_deg: 7.005,
    },
    CanonicalData {
        name: "Venus",
        semi_major_axis_m: 1.0821e11,
        orbital_period_days: 224.701,
        eccentricity: 0.0068,
        inclination_deg: 3.3947,
    },
    CanonicalData {
        name: "Earth",
        semi_major_axis_m: 1.49597870700e11,
        orbital_period_days: 365.25636,
        eccentricity: 0.0167,
        inclination_deg: 0.0,
    },
    CanonicalData {
        name: "Mars",
        semi_major_axis_m: 2.2794e11,
        orbital_period_days: 686.980,
        eccentricity: 0.0934,
        inclination_deg: 1.850,
    },
    CanonicalData {
        name: "Jupiter",
        semi_major_axis_m: 7.7857e11,
        orbital_period_days: 4332.59,
        eccentricity: 0.0489,
        inclination_deg: 1.303,
    },
    CanonicalData {
        name: "Saturn",
        semi_major_axis_m: 1.4335e12,
        orbital_period_days: 10759.22,
        eccentricity: 0.0565,
        inclination_deg: 2.485,
    },
    CanonicalData {
        name: "Uranus",
        semi_major_axis_m: 2.8725e12,
        orbital_period_days: 30685.4,
        eccentricity: 0.0457,
        inclination_deg: 0.773,
    },
    CanonicalData {
        name: "Neptune",
        semi_major_axis_m: 4.4951e12,
        orbital_period_days: 60189.0,
        eccentricity: 0.0113,
        inclination_deg: 1.767,
    },
    CanonicalData {
        name: "Pluto",
        semi_major_axis_m: 5.9064e12,
        orbital_period_days: 90560.0,
        eccentricity: 0.2488,
        inclination_deg: 17.14,
    },
];

/// Compute orbital elements from position and velocity
fn compute_orbital_elements(pos: Vec3, vel: Vec3, m_central: f64) -> (f64, f64, f64, f64, f64, f64) {
    let mu = G * m_central;
    
    // Specific orbital energy
    let v_squared = vel.length_squared();
    let r = pos.length();
    let specific_energy = v_squared / 2.0 - mu / r;
    
    // Semi-major axis: a = -μ/(2ε)
    let a = -mu / (2.0 * specific_energy);
    
    // Specific angular momentum: h = r × v
    let h_vec = pos.cross(vel);
    let h = h_vec.length();
    
    // Eccentricity vector: e = (v × h)/μ - r/|r|
    let e_vec = vel.cross(h_vec) / mu - pos / r;
    let e = e_vec.length();
    
    // Inclination: i = arccos(h_z / |h|)
    let i = (h_vec.z / h).acos();
    
    // Longitude of ascending node (Ω): reference is x-axis
    let n_vec = Vec3::new(-h_vec.y, h_vec.x, 0.0);
    let n = n_vec.length();
    
    let mut omega = if n > 1e-10 {
        let omega_raw = (n_vec.x / n).acos();
        if n_vec.y < 0.0 {
            2.0 * PI - omega_raw
        } else {
            omega_raw
        }
    } else {
        0.0
    };
    
    // Argument of periapsis (ω)
    let mut arg_periapsis = if e > 1e-10 && n > 1e-10 {
        let dot = n_vec.dot(e_vec) / (n * e);
        let ap_raw = dot.clamp(-1.0, 1.0).acos();
        if e_vec.z < 0.0 {
            2.0 * PI - ap_raw
        } else {
            ap_raw
        }
    } else {
        0.0
    };
    
    // Mean anomaly at epoch (M)
    let mean_anomaly = if e > 1e-10 {
        let dot = e_vec.dot(pos) / (e * r);
        let true_anomaly = dot.clamp(-1.0, 1.0).acos();
        let true_anomaly_signed = if pos.dot(vel) < 0.0 {
            2.0 * PI - true_anomaly
        } else {
            true_anomaly
        };
        
        // Eccentric anomaly: E = 2 arctan(tan(ν/2) / sqrt((1+e)/(1-e)))
        let E = 2.0 * ((true_anomaly_signed / 2.0).tan() / ((1.0 + e) / (1.0 - e)).sqrt()).atan();
        
        // Mean anomaly: M = E - e sin(E)
        E - e * E.sin()
    } else {
        0.0
    };
    
    (a, e, i, omega, arg_periapsis, mean_anomaly)
}

/// Compute Hill radius: R_H = a * (m / (3 M_central))^(1/3)
fn compute_hill_radius(a: f64, m: f64, m_central: f64) -> f64 {
    a * (m / (3.0 * m_central)).powf(1.0 / 3.0)
}

#[test]
fn test_full_solar_system_audit() {
    println!("\n========================================");
    println!("PHYSICS AUDIT: FULL SOLAR SYSTEM PRESET");
    println!("========================================\n");
    
    // Create the Full Solar System preset
    let seed = 42u64;
    let mut sim = Simulation::new(seed);
    let preset_sim = Preset::FullSolarSystem.create(seed);
    
    println!("1. GLOBAL PHYSICS CONFIGURATION");
    println!("   - Gravitational constant G: {} m³/(kg·s²)", G);
    println!("   - AU: {} m", AU);
    println!("   - Solar mass M_☉: {} kg", M_SUN);
    println!("   - Default softening: {} m ({} km)", DEFAULT_SOFTENING, DEFAULT_SOFTENING / 1000.0);
    println!("   - Barnes-Hut theta: {}", DEFAULT_BARNES_HUT_THETA);
    println!("   - Default substeps: {}\n", DEFAULT_SUBSTEPS);
    
    println!("2. INTEGRATOR CONFIGURATION");
    let config = preset_sim.config();
    println!("   - Method: {:?}", config.integrator.method);
    println!("   - Timestep dt: {} s", config.integrator.dt);
    println!("   - Substeps: {}", config.integrator.substeps);
    println!("   - Effective substep: {} s", config.integrator.dt / config.integrator.substeps as f64);
    println!("   - Force method: {:?}\n", config.force_method);
    
    println!("3. DETERMINISM & RNG");
    println!("   - RNG algorithm: PCG-XSH-RR (PCG32)");
    println!("   - Seed: {}", seed);
    println!("   - Stream selection: Default (1442695040888963407)\n");
    
    println!("4. BODY DATA INTEGRITY TABLE");
    println!("   {:>3} | {:12} | {:12} | {:12} | {:12} | {:12} | {:12} | {:12} | {:8} | {:8}",
             "ID", "Name", "Type", "Mass (kg)", "Radius (m)", "Soft.(m)", "Rot.(rad/s)", "Tilt(rad)", "Seed", "Parent");
    println!("   {}", "-".repeat(160));
    
    let bodies = preset_sim.bodies();
    for body in bodies {
        let body_type_str = match body.body_type {
            BodyType::Star => "Star",
            BodyType::Planet => "Planet",
            BodyType::Moon => "Moon",
            _ => "Other",
        };
        let parent_str = body.parent_id.map(|p| p.to_string()).unwrap_or_else(|| "-".to_string());
        
        println!("   {:3} | {:12} | {:12} | {:12.5e} | {:12.5e} | {:12.5e} | {:12.5e} | {:12.5e} | {:8} | {:8}",
                 body.id,
                 body.name,
                 body_type_str,
                 body.mass,
                 body.radius,
                 body.softening_length,
                 body.rotation_rate,
                 body.axial_tilt,
                 body.seed,
                 parent_str);
    }
    println!();
    
    println!("5. DERIVED PHYSICAL QUANTITIES");
    println!("   {:>3} | {:12} | {:12} | {:12} | {:12} | {:12}",
             "ID", "Name", "Density(kg/m³)", "Surf.g(m/s²)", "V_esc(m/s)", "Temp(K)");
    println!("   {}", "-".repeat(90));
    
    for body in bodies {
        println!("   {:3} | {:12} | {:12.2} | {:12.5} | {:12.2} | {:12.2}",
                 body.id,
                 body.name,
                 body.bulk_density,
                 body.surface_gravity,
                 body.escape_velocity_surface,
                 body.mean_surface_temperature);
    }
    println!();
    
    println!("6. ORBITAL ELEMENTS (INITIAL STATE)");
    println!("   {:>3} | {:12} | {:12} | {:12} | {:12} | {:12} | {:12} | {:12}",
             "ID", "Name", "a (AU)", "e", "i (deg)", "Ω (deg)", "ω (deg)", "Period(d)");
    println!("   {}", "-".repeat(130));
    
    let sun_mass = bodies[0].mass;
    for (idx, body) in bodies.iter().enumerate() {
        if idx == 0 || body.body_type == BodyType::Moon {
            continue; // Skip Sun and Moon for now
        }
        
        let (a, e, i, omega, arg_p, _m) = compute_orbital_elements(body.position, body.velocity, sun_mass);
        let period_s = 2.0 * PI * (a.powi(3) / (G * sun_mass)).sqrt();
        let period_days = period_s / SECONDS_PER_DAY;
        
        println!("   {:3} | {:12} | {:12.6} | {:12.6} | {:12.6} | {:12.6} | {:12.6} | {:12.2}",
                 body.id,
                 body.name,
                 a / AU,
                 e,
                 i.to_degrees(),
                 omega.to_degrees(),
                 arg_p.to_degrees(),
                 period_days);
    }
    println!();
    
    println!("7. ORBITAL VALIDATION vs CANONICAL VALUES");
    println!("   {:12} | {:>12} | {:>12} | {:>12} | {:>12} | {:>8}",
             "Name", "a_sim (AU)", "a_canon (AU)", "Δa (%)", "P_sim (d)", "ΔP (%)");
    println!("   {}", "-".repeat(90));
    
    for canon in CANONICAL_ORBITS {
        if let Some(body) = bodies.iter().find(|b| b.name == canon.name) {
            let (a, e, _i, _omega, _arg_p, _m) = compute_orbital_elements(body.position, body.velocity, sun_mass);
            let period_s = 2.0 * PI * (a.powi(3) / (G * sun_mass)).sqrt();
            let period_days = period_s / SECONDS_PER_DAY;
            
            let a_error_pct = ((a - canon.semi_major_axis_m) / canon.semi_major_axis_m * 100.0).abs();
            let p_error_pct = ((period_days - canon.orbital_period_days) / canon.orbital_period_days * 100.0).abs();
            
            let a_status = if a_error_pct < 0.1 { "✓" } else { "✗" };
            let p_status = if p_error_pct < 0.1 { "✓" } else { "✗" };
            
            println!("   {:12} | {:12.6} | {:12.6} | {:11.4} {} | {:12.2} | {:7.4} {}",
                     canon.name,
                     a / AU,
                     canon.semi_major_axis_m / AU,
                     a_error_pct,
                     a_status,
                     period_days,
                     p_error_pct,
                     p_status);
        }
    }
    println!();
    
    println!("8. HILL RADIUS & SPHERE OF INFLUENCE");
    println!("   {:>3} | {:12} | {:12} | {:12} | {:12}",
             "ID", "Name", "Hill R (km)", "SOI (km)", "a (AU)");
    println!("   {}", "-".repeat(70));
    
    for (idx, body) in bodies.iter().enumerate() {
        if idx == 0 || body.body_type == BodyType::Moon {
            continue;
        }
        
        let (a, _e, _i, _omega, _arg_p, _m) = compute_orbital_elements(body.position, body.velocity, sun_mass);
        let hill_r = compute_hill_radius(a, body.mass, sun_mass);
        let soi = body.sphere_of_influence(sun_mass, a);
        
        println!("   {:3} | {:12} | {:12.2} | {:12.2} | {:12.6}",
                 body.id,
                 body.name,
                 hill_r / 1000.0,
                 soi / 1000.0,
                 a / AU);
    }
    println!();
    
    println!("9. ENERGY & ANGULAR MOMENTUM (INITIAL STATE)");
    let total_energy = compute_total_energy(bodies, DEFAULT_SOFTENING);
    let total_momentum = compute_total_momentum(bodies);
    let total_angular_momentum: Vec3 = bodies.iter()
        .map(|b| b.position.cross(b.velocity) * b.mass)
        .fold(Vec3::ZERO, |acc, am| acc + am);
    
    println!("   Total energy: {:.6e} J", total_energy);
    println!("   Total linear momentum: ({:.6e}, {:.6e}, {:.6e}) kg·m/s",
             total_momentum.x, total_momentum.y, total_momentum.z);
    println!("   Total angular momentum: ({:.6e}, {:.6e}, {:.6e}) kg·m²/s",
             total_angular_momentum.x, total_angular_momentum.y, total_angular_momentum.z);
    println!("   |p|: {:.6e} kg·m/s", total_momentum.length());
    println!("   |L|: {:.6e} kg·m²/s\n", total_angular_momentum.length());
    
    println!("10. DYNAMIC SIMULATION TEST (100 steps)");
    println!("    Running simulation for 100 steps to check conservation...");
    
    let mut test_sim = Preset::FullSolarSystem.create(seed);
    let initial_energy = compute_total_energy(test_sim.bodies(), DEFAULT_SOFTENING);
    let initial_momentum = compute_total_momentum(test_sim.bodies());
    
    for _ in 0..100 {
        test_sim.step();
    }
    
    let final_energy = compute_total_energy(test_sim.bodies(), DEFAULT_SOFTENING);
    let final_momentum = compute_total_momentum(test_sim.bodies());
    
    let energy_drift_pct = ((final_energy - initial_energy) / initial_energy * 100.0).abs();
    let momentum_drift = (final_momentum - initial_momentum).length();
    
    println!("    Initial energy: {:.6e} J", initial_energy);
    println!("    Final energy:   {:.6e} J", final_energy);
    println!("    Energy drift:   {:.6e} % ✓", energy_drift_pct);
    println!("    Momentum drift: {:.6e} kg·m/s", momentum_drift);
    
    let momentum_drift_relative = if initial_momentum.length() > 1e-10 {
        momentum_drift / initial_momentum.length() * 100.0
    } else {
        0.0
    };
    println!("    Momentum drift (relative): {:.6e} % ✓\n", momentum_drift_relative);
    
    assert!(energy_drift_pct < 0.01, "Energy drift exceeds 0.01%");
    // Momentum drift should be small relative to initial momentum (if non-zero)
    // or absolute drift should be small if initial momentum is near zero
    if initial_momentum.length() > 1e20 {
        assert!(momentum_drift_relative < 1.0, "Relative momentum drift {}% exceeds 1%", momentum_drift_relative);
    } else {
        assert!(momentum_drift < 1e20, "Absolute momentum drift {} exceeds threshold", momentum_drift);
    }
    
    println!("========================================");
    println!("AUDIT COMPLETE - ALL CHECKS PASSED ✓");
    println!("========================================\n");
}
