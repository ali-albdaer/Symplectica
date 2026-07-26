use physics_core::prelude::*;
use physics_core::presets::create_full_solar_system_iv;

#[test]
fn test_time_modes_accuracy_1_year() {
    // We simulate 1 year of time at 1yr/s time warp, over exactly 60 server ticks (1 real second).
    // Total time = 31,536,000 seconds
    let total_time = 31_536_000.0;
    let ticks = 60_u64;
    
    // Server base timestep (same as APP_DEFAULTS)
    let base_dt = 3600.0;
    
    // ---------------------------------------------------------
    // 1. Ground Truth (Unclamped Accumulator)
    // ---------------------------------------------------------
    let mut sim_truth = create_full_solar_system_iv(42, true);
    sim_truth.set_dt(base_dt);
    
    let truth_steps = (total_time / base_dt).floor() as u64;
    sim_truth.step_n(truth_steps);
    
    // ---------------------------------------------------------
    // 2. Tick-Scaled Mode
    // Takes 1 massive step per tick.
    // ---------------------------------------------------------
    let mut sim_tick = create_full_solar_system_iv(42, true);
    let tick_dt = total_time / (ticks as f64);
    for _ in 0..ticks {
        sim_tick.set_dt(tick_dt);
        sim_tick.step_n(1);
    }
    
    // ---------------------------------------------------------
    // 3. Hybrid Mode
    // Caps steps per tick at 50, distributing the massive dt.
    // ---------------------------------------------------------
    let mut sim_hybrid = create_full_solar_system_iv(42, true);
    let max_hybrid_steps = 50_u64;
    let time_per_tick = total_time / (ticks as f64);
    
    let mut hybrid_steps = (time_per_tick / base_dt).floor() as u64;
    let mut hybrid_dt = base_dt;
    
    if hybrid_steps > max_hybrid_steps {
        hybrid_dt = time_per_tick / (max_hybrid_steps as f64);
        hybrid_steps = max_hybrid_steps;
    }
    
    for _ in 0..ticks {
        sim_hybrid.set_dt(hybrid_dt);
        sim_hybrid.step_n(hybrid_steps);
    }
    
    // ---------------------------------------------------------
    // 3.5. Hybrid Mode (Budgeted - assuming max 500 steps per tick)
    // Simulates a powerful server achieving 500 steps in 10ms
    // ---------------------------------------------------------
    let mut sim_hybrid_budgeted = create_full_solar_system_iv(42, true);
    let max_budgeted_steps = 500_u64;
    
    let mut budgeted_steps = (time_per_tick / base_dt).floor() as u64;
    let mut budgeted_dt = base_dt;
    
    if budgeted_steps > max_budgeted_steps {
        budgeted_dt = time_per_tick / (max_budgeted_steps as f64);
        budgeted_steps = max_budgeted_steps;
    }
    
    for _ in 0..ticks {
        sim_hybrid_budgeted.set_dt(budgeted_dt);
        sim_hybrid_budgeted.step_n(budgeted_steps);
    }
    
    // ---------------------------------------------------------
    // 4. Accumulator Mode
    // Caps steps per tick at 100, dropping the rest of the time.
    // ---------------------------------------------------------
    let mut sim_acc = create_full_solar_system_iv(42, true);
    let max_acc_steps = 100_u64;
    let acc_time_per_tick = total_time / (ticks as f64);
    
    let mut acc_steps = (acc_time_per_tick / base_dt).floor() as u64;
    if acc_steps > max_acc_steps {
        acc_steps = max_acc_steps;
    }
    
    for _ in 0..ticks {
        sim_acc.set_dt(base_dt);
        sim_acc.step_n(acc_steps);
    }

    // ---------------------------------------------------------
    // Evaluation
    // ---------------------------------------------------------
    let find_body = |sim: &physics_core::simulation::Simulation, name: &str| -> Vec3 {
        sim.bodies().iter().find(|b| b.name == name).unwrap().position
    };

    let earth_truth = find_body(&sim_truth, "Earth");
    let moon_truth = find_body(&sim_truth, "Moon");
    
    let earth_tick = find_body(&sim_tick, "Earth");
    let moon_tick = find_body(&sim_tick, "Moon");
    
    let earth_hybrid = find_body(&sim_hybrid, "Earth");
    let moon_hybrid = find_body(&sim_hybrid, "Moon");
    
    let earth_budgeted = find_body(&sim_hybrid_budgeted, "Earth");
    let moon_budgeted = find_body(&sim_hybrid_budgeted, "Moon");
    
    let earth_acc = find_body(&sim_acc, "Earth");
    let moon_acc = find_body(&sim_acc, "Moon");

    let err_earth_tick = earth_truth.distance(earth_tick);
    let err_moon_tick = moon_truth.distance(moon_tick);
    
    let err_earth_hybrid = earth_truth.distance(earth_hybrid);
    let err_moon_hybrid = moon_truth.distance(moon_hybrid);
    
    let err_earth_budgeted = earth_truth.distance(earth_budgeted);
    let err_moon_budgeted = moon_truth.distance(moon_budgeted);
    
    let err_earth_acc = earth_truth.distance(earth_acc);
    let err_moon_acc = moon_truth.distance(moon_acc);

    println!("--- ACCURACY RESULTS ---");
    println!("Earth Error (Tick-Scaled):   {:.2} meters", err_earth_tick);
    println!("Earth Error (Hybrid 50):     {:.2} meters", err_earth_hybrid);
    println!("Earth Error (Hybrid Budg):   {:.2} meters (Simulated 500 steps/tick)", err_earth_budgeted);
    println!("Earth Error (Accumulator):   {:.2} meters (Maxed out / Missing time)", err_earth_acc);
    println!("------------------------");
    println!("Moon Error (Tick-Scaled):    {:.2} meters", err_moon_tick);
    println!("Moon Error (Hybrid 50):      {:.2} meters", err_moon_hybrid);
    println!("Moon Error (Hybrid Budg):    {:.2} meters (Simulated 500 steps/tick)", err_moon_budgeted);
    println!("Moon Error (Accumulator):    {:.2} meters (Maxed out / Missing time)", err_moon_acc);
    println!("------------------------");

    // Hybrid mode should be significantly more accurate than Tick mode (at least 10x better)
    assert!(
        err_earth_hybrid < err_earth_tick / 10.0,
        "Earth hybrid error ({}) not significantly better than tick error ({})", err_earth_hybrid, err_earth_tick
    );
    assert!(
        err_moon_hybrid < err_moon_tick / 10.0,
        "Moon hybrid error ({}) not significantly better than tick error ({})", err_moon_hybrid, err_moon_tick
    );
    assert!(
        err_earth_budgeted < err_earth_hybrid / 5.0,
        "Earth budgeted error ({}) should be significantly better than fixed hybrid error ({})", err_earth_budgeted, err_earth_hybrid
    );
    assert!(
        err_moon_budgeted < err_moon_hybrid / 5.0,
        "Moon budgeted error ({}) should be significantly better than fixed hybrid error ({})", err_moon_budgeted, err_moon_hybrid
    );
    
    // Accumulator has massive error because it simply simulated way less time (capped)
    assert!(
        err_earth_acc > err_earth_hybrid * 100.0,
        "Accumulator should have massive error compared to hybrid"
    );
}
