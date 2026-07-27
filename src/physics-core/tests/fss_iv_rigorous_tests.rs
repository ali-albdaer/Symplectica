use physics_core::prelude::*;
use physics_core::presets::create_full_solar_system_iv;
use physics_core::integrator::{CloseEncounterIntegrator, CloseEncounterConfig, IntegratorConfig, IntegratorType};
use physics_core::simulation::{Simulation, SimulationConfig};
use physics_core::vector::Vec3;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::Instant;

#[derive(Deserialize, Debug)]
struct HorizonsVector {
    x_m: f64,
    y_m: f64,
    z_m: f64,
}

#[derive(Deserialize, Debug)]
struct HorizonsBody {
    label: String,
    state_vector: Option<HorizonsVector>,
}

#[derive(Deserialize, Debug)]
struct HorizonsManifest {
    bodies: HashMap<String, HorizonsBody>,
}

#[derive(Serialize, Debug)]
struct ReportEntry {
    body_name: String,
    error_m: f64,
}

#[derive(Serialize, Debug)]
struct TestReport {
    epoch_label: String,
    time_mode: String,
    integrator: String,
    time_warp: f64,
    entries: Vec<ReportEntry>,
}

fn load_horizons_snapshot(epoch_label: &str) -> HorizonsManifest {
    let path = format!("../../local/FSS_IV/SNAPSHOTS/snapshot_{}.json", epoch_label);
    let data = fs::read_to_string(&path).unwrap_or_else(|_| panic!("Failed to read {}", path));
    serde_json::from_str(&data).unwrap()
}

#[derive(Debug, Clone, Copy)]
enum TimeMode {
    Ticked,
    Hybrid,
    Accumulator,
}

fn simulate_time(sim: &mut Simulation, target_seconds: f64, time_warp: f64, time_mode: TimeMode) {
    let base_dt = 3600.0; // 1 hour base step size
    let ticks = ((target_seconds / time_warp) * 60.0).floor() as u64; 
    if ticks == 0 { return; }

    let time_per_tick = target_seconds / (ticks as f64);
    let start_time = Instant::now();
    
    for i in 0..ticks {
        if start_time.elapsed().as_secs() > 10 {
            println!("  [TIMEOUT] configuration took too long, aborting after {} ticks", i);
            break;
        }
        match time_mode {
            TimeMode::Ticked => {
                sim.set_dt(time_per_tick);
                sim.step_n(1);
            }
            TimeMode::Hybrid => {
                let max_hybrid_steps = 50_u64;
                let mut hybrid_steps = (time_per_tick / base_dt).floor() as u64;
                let mut hybrid_dt = base_dt;
                
                if hybrid_steps > max_hybrid_steps {
                    hybrid_dt = time_per_tick / (max_hybrid_steps as f64);
                    hybrid_steps = max_hybrid_steps;
                }
                
                sim.set_dt(hybrid_dt);
                sim.step_n(hybrid_steps);
            }
            TimeMode::Accumulator => {
                let max_acc_steps = 100_u64;
                let mut acc_steps = (time_per_tick / base_dt).floor() as u64;
                if acc_steps > max_acc_steps {
                    acc_steps = max_acc_steps;
                }
                
                sim.set_dt(base_dt);
                sim.step_n(acc_steps);
            }
        }
    }
}

struct TestTarget {
    epoch_label: &'static str,
    target_seconds: f64,
    time_warp: f64,
}

fn get_targets() -> Vec<TestTarget> {
    vec![
        TestTarget { epoch_label: "2026-01-01_00-01-00", target_seconds: 60.0, time_warp: 1.0 }, // 1s/s
        TestTarget { epoch_label: "2026-01-01_00-10-00", target_seconds: 600.0, time_warp: 10.0 }, // 10s/s
        TestTarget { epoch_label: "2026-01-01_01-00-00", target_seconds: 3600.0, time_warp: 60.0 }, // 1m/s
        TestTarget { epoch_label: "2026-01-01_12-00-00", target_seconds: 43200.0, time_warp: 3600.0 }, // 1h/s
        TestTarget { epoch_label: "2026-01-02_00-00-00", target_seconds: 86400.0, time_warp: 3600.0 }, // 1h/s
        TestTarget { epoch_label: "2026-01-08_00-00-00", target_seconds: 604800.0, time_warp: 86400.0 }, // 1d/s
        TestTarget { epoch_label: "2026-02-01_00-00-00", target_seconds: 2678400.0, time_warp: 86400.0 }, // 1d/s
        TestTarget { epoch_label: "2026-07-01_00-00-00", target_seconds: 15638400.0, time_warp: 604800.0 }, // 1w/s
        TestTarget { epoch_label: "2027-01-01_00-00-00", target_seconds: 31536000.0, time_warp: 604800.0 }, // 1w/s
        TestTarget { epoch_label: "2028-01-01_00-00-00", target_seconds: 63072000.0, time_warp: 2592000.0 }, // 1mo/s
        TestTarget { epoch_label: "2031-01-01_00-00-00", target_seconds: 157766400.0, time_warp: 2592000.0 }, // 1mo/s
        TestTarget { epoch_label: "2036-01-01_00-00-00", target_seconds: 315532800.0, time_warp: 31536000.0 }, // 1y/s
        TestTarget { epoch_label: "2051-01-01_00-00-00", target_seconds: 788918400.0, time_warp: 31536000.0 }, // 1y/s
        TestTarget { epoch_label: "2076-01-01_00-00-00", target_seconds: 1577836800.0, time_warp: 31536000.0 }, // 1y/s
        TestTarget { epoch_label: "2100-01-01_00-00-00", target_seconds: 2335219200.0, time_warp: 31536000.0 }, // 1y/s
    ]
}

#[test]
fn run_fss_iv_rigorous_tests() {
    let reports_dir = "../../local/FSS_IV/REPORTS";
    fs::create_dir_all(reports_dir).unwrap();

    let targets = get_targets();
    let time_modes = [
        (TimeMode::Ticked, "ticked"),
        (TimeMode::Hybrid, "hybrid"),
        (TimeMode::Accumulator, "accumulator"),
    ];

    let integrators = [
        (CloseEncounterIntegrator::None, "verlet_only"),
        (CloseEncounterIntegrator::Rk45, "ce_rk45"),
        (CloseEncounterIntegrator::GaussRadau5, "ce_gauss_radau"),
    ];

    for (ce_integrator, ce_name) in integrators {
        for (time_mode, tm_name) in time_modes {
            for target in &targets {
                println!("Running test: {} / {} / {}", ce_name, tm_name, target.epoch_label);
                let mut sim = create_full_solar_system_iv(42, true);
                
                // Configure close encounters
                sim.set_close_encounter_integrator(ce_integrator);
                if ce_integrator != CloseEncounterIntegrator::None {
                    sim.set_close_encounter_thresholds(3.0, 1e-3, 0.1);
                    sim.set_close_encounter_limits(8, 128);
                }

                // Simulate to target
                simulate_time(&mut sim, target.target_seconds, target.time_warp, time_mode);

                // Load HORIZONS ground truth
                let hz_data = load_horizons_snapshot(target.epoch_label);

                // Compare and generate report
                let sim_sun_pos = sim.bodies().iter().find(|b| b.name == "Sun").unwrap().position;
                
                let mut entries = Vec::new();

                for body in sim.bodies() {
                    if body.name == "Sun" { continue; } // Sun is our origin for comparison

                    if let Some(hz_body) = hz_data.bodies.get(&body.name) {
                        if let Some(sv) = &hz_body.state_vector {
                            let sim_helio_pos = body.position - sim_sun_pos;
                            let hz_pos = Vec3::new(sv.x_m, sv.y_m, sv.z_m);
                            
                            let error_m = sim_helio_pos.distance(hz_pos);
                            entries.push(ReportEntry {
                                body_name: body.name.clone(),
                                error_m,
                            });
                        }
                    }
                }

                // Sort entries for deterministic output
                entries.sort_by(|a, b| a.body_name.cmp(&b.body_name));

                let report = TestReport {
                    epoch_label: target.epoch_label.to_string(),
                    time_mode: tm_name.to_string(),
                    integrator: ce_name.to_string(),
                    time_warp: target.time_warp,
                    entries,
                };

                let report_json = serde_json::to_string_pretty(&report).unwrap();
                let report_path = format!("{}/report_{}_{}_{}.json", reports_dir, tm_name, ce_name, target.epoch_label);
                fs::write(report_path, report_json).unwrap();
            }
        }
    }
}
