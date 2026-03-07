/// Conservation law tests for the N-body simulation.
///
/// Verifies that energy, linear momentum, and angular momentum are conserved
/// to the expected precision for different integrator types.

use physics_core::constants::*;
use physics_core::force::{
    compute_angular_momentum, compute_center_of_mass,
};
use physics_core::prelude::{Simulation, Vec3};

/// Build a Sun-Earth two-body system at 1 AU.
fn two_body_system() -> Simulation {
    let mut sim = Simulation::new(42);
    sim.add_star("Sun", M_SUN, R_SUN);
    sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
    sim
}

/// Build a three-body system: Sun-Jupiter-Saturn.
fn three_body_system() -> Simulation {
    let mut sim = Simulation::new(42);
    sim.add_star("Sun", M_SUN, R_SUN);
    sim.add_planet("Jupiter", M_JUPITER, R_JUPITER, 5.2 * AU, 13070.0);
    sim.add_planet("Saturn", 5.683e26, 5.8232e7, 9.55 * AU, 9680.0);
    sim
}

// ─── Energy conservation ───────────────────────────────────────────────

#[test]
fn energy_conservation_two_body_10k_steps() {
    let mut sim = two_body_system();
    let e0 = sim.total_energy();

    sim.step_n(10_000);

    let e1 = sim.total_energy();
    let drift = ((e1 - e0) / e0).abs();

    assert!(
        drift < 1e-6,
        "Two-body energy drift {drift:.2e} exceeds 1e-6 after 10k steps"
    );
}

#[test]
fn energy_conservation_three_body_10k_steps() {
    let mut sim = three_body_system();
    let e0 = sim.total_energy();

    sim.step_n(10_000);

    let e1 = sim.total_energy();
    let drift = ((e1 - e0) / e0).abs();

    assert!(
        drift < 1e-5,
        "Three-body energy drift {drift:.2e} exceeds 1e-5 after 10k steps"
    );
}

// ─── Linear momentum conservation ─────────────────────────────────────

fn momentum_magnitude(sim: &Simulation) -> f64 {
    let p = sim.total_momentum();
    (p.x * p.x + p.y * p.y + p.z * p.z).sqrt()
}

#[test]
fn linear_momentum_conservation_two_body() {
    let mut sim = two_body_system();
    let p0 = momentum_magnitude(&sim);

    sim.step_n(10_000);

    let p1 = momentum_magnitude(&sim);
    // For an isolated system momentum should be conserved to machine precision.
    // The initial |p| may be near zero for a well-setup 2-body (heliocentric), so
    // check absolute change relative to characteristic momentum scale (Earth momentum).
    let scale = M_EARTH * 29784.0; // ~1.78e29
    let drift = (p1 - p0).abs() / scale;

    assert!(
        drift < 1e-10,
        "Linear momentum drift {drift:.2e} exceeds 1e-10"
    );
}

#[test]
fn linear_momentum_conservation_three_body() {
    let mut sim = three_body_system();
    let p0 = momentum_magnitude(&sim);

    sim.step_n(10_000);

    let p1 = momentum_magnitude(&sim);
    let scale = M_JUPITER * 13070.0;
    let drift = (p1 - p0).abs() / scale;

    assert!(
        drift < 1e-10,
        "Three-body linear momentum drift {drift:.2e} exceeds 1e-10"
    );
}

// ─── Angular momentum conservation ────────────────────────────────────

fn angular_momentum_magnitude(sim: &Simulation) -> f64 {
    let l = sim.angular_momentum();
    (l.x * l.x + l.y * l.y + l.z * l.z).sqrt()
}

#[test]
fn angular_momentum_conservation_two_body() {
    let mut sim = two_body_system();
    let l0 = angular_momentum_magnitude(&sim);

    sim.step_n(10_000);

    let l1 = angular_momentum_magnitude(&sim);
    let drift = ((l1 - l0) / l0).abs();

    assert!(
        drift < 1e-6,
        "Two-body angular momentum drift {drift:.2e} exceeds 1e-6"
    );
}

#[test]
fn angular_momentum_conservation_three_body() {
    let mut sim = three_body_system();
    let l0 = angular_momentum_magnitude(&sim);

    sim.step_n(10_000);

    let l1 = angular_momentum_magnitude(&sim);
    let drift = ((l1 - l0) / l0).abs();

    assert!(
        drift < 1e-5,
        "Three-body angular momentum drift {drift:.2e} exceeds 1e-5"
    );
}

// ─── Center of mass stability ──────────────────────────────────────────

#[test]
fn center_of_mass_stability() {
    let mut sim = two_body_system();
    let com0 = sim.center_of_mass();

    sim.step_n(10_000);

    let com1 = sim.center_of_mass();
    // CoM velocity is total_momentum / total_mass, so CoM drifts linearly.
    // For a heliocentric system the Sun has v=0 so CoM velocity = M_earth * v / M_total ≈ tiny.
    // Check that CoM hasn't moved by more than a small fraction of AU.
    let dx = com1.x - com0.x;
    let dy = com1.y - com0.y;
    let dz = com1.z - com0.z;
    let dist = (dx * dx + dy * dy + dz * dz).sqrt();

    assert!(
        dist < 0.01 * AU,
        "Center of mass moved by {:.2e} m (> 0.01 AU) after 10k steps",
        dist
    );
}

// ─── Kinetic + Potential = Total ───────────────────────────────────────

#[test]
fn energy_decomposition_consistency() {
    let mut sim = two_body_system();

    sim.step_n(100);

    let ke = sim.kinetic_energy();
    let pe = sim.potential_energy();
    let total = sim.total_energy();

    let diff = ((ke + pe) - total).abs();
    assert!(
        diff < 1e-10 * total.abs(),
        "KE + PE != Total: diff = {diff:.2e}"
    );
}

// ─── Angular momentum reference: about CoM vs about origin ────────────

#[test]
fn angular_momentum_about_com_is_invariant() {
    // In a barycentric frame, angular momentum about CoM should be the same
    // as about origin (since CoM = origin). For a heliocentric frame, they differ.
    let sim = two_body_system();
    let bodies = sim.bodies();
    let com = compute_center_of_mass(bodies);
    let l_com = compute_angular_momentum(bodies, com);
    let l_origin = compute_angular_momentum(bodies, Vec3::ZERO);

    // They should differ because Sun is at origin, not at CoM
    // (CoM is offset by M_earth/M_total * AU ≈ 449 km from origin)
    let mag_com = (l_com.x * l_com.x + l_com.y * l_com.y + l_com.z * l_com.z).sqrt();
    let mag_origin = (l_origin.x * l_origin.x + l_origin.y * l_origin.y + l_origin.z * l_origin.z).sqrt();

    // Both should be large and positive
    assert!(mag_com > 0.0, "L about CoM should be non-zero");
    assert!(mag_origin > 0.0, "L about origin should be non-zero");

    // The difference should be small (CoM is close to origin for Sun-Earth)
    let rel_diff = ((mag_com - mag_origin) / mag_com).abs();
    assert!(
        rel_diff < 1e-3,
        "L(CoM) vs L(origin) differ by {rel_diff:.2e} — expected small for Sun-Earth"
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Full Solar System J2000 verification
// ═══════════════════════════════════════════════════════════════════════════

/// Build the full solar system II preset (11 bodies, barycentric, J2000).
fn full_solar_system_barycentric() -> Simulation {
    use physics_core::presets::Preset;
    Preset::FullSolarSystemII.create_barycentric(42)
}

/// Verify initial total mass matches the expected sum of solar system bodies.
/// Expected: M_sun + M_mercury + M_venus + M_earth + M_moon + M_mars
///         + M_jupiter + M_saturn + M_uranus + M_neptune + M_pluto
#[test]
fn full_solar_system_initial_mass() {
    let sim = full_solar_system_barycentric();
    let bodies = sim.bodies();
    let total_mass: f64 = bodies.iter()
        .filter(|b| b.is_active && b.contributes_gravity)
        .map(|b| b.mass)
        .sum();

    // Real solar system total mass ≈ 1.0014 M_sun ≈ 1.991e30 kg
    // (Sun dominates; Jupiter is ~1/1000 of Sun)
    assert_eq!(bodies.len(), 11, "Expected 11 bodies");
    let expected_mass = M_SUN + 3.3011e23 + 4.8675e24 + M_EARTH + M_MOON
        + 6.4171e23 + 1.8982e27 + 5.6834e26 + 8.6810e25 + 1.02413e26 + 1.303e22;

    let rel_err = ((total_mass - expected_mass) / expected_mass).abs();
    assert!(
        rel_err < 1e-10,
        "Total mass {total_mass:.6e} != expected {expected_mass:.6e} (rel err {rel_err:.2e})"
    );

    // Cross-check: total mass should be close to 1.991e30 kg
    assert!(
        total_mass > 1.98e30 && total_mass < 2.00e30,
        "Total mass {total_mass:.4e} out of range [1.98e30, 2.00e30]"
    );
}

/// Verify initial kinetic energy is in the correct ballpark.
/// For the solar system, KE is dominated by the Sun's barycentric velocity
/// and the planets' orbital velocities.
/// Earth KE alone ≈ 0.5 * M_earth * v_earth^2 ≈ 0.5 * 5.97e24 * (29784)^2 ≈ 2.65e33 J
/// Jupiter KE ≈ 0.5 * 1.90e27 * (13070)^2 ≈ 1.62e34 J
/// Total system KE is typically ~1.8e35 J (Sun moves in barycentric frame too).
#[test]
fn full_solar_system_kinetic_energy_order_of_magnitude() {
    let sim = full_solar_system_barycentric();
    let ke = sim.kinetic_energy();

    // KE should be positive and in range [1e34, 1e36] for the solar system
    assert!(ke > 0.0, "Kinetic energy should be positive, got {ke:.4e}");
    assert!(
        ke > 1e34 && ke < 1e36,
        "KE {ke:.4e} J outside expected range [1e34, 1e36]"
    );
}

/// Verify initial potential energy is negative and in the correct range.
/// PE dominated by Sun-Jupiter: -G*M_sun*M_jup / r_jup ≈ -3.5e35 J (rough)
/// Total PE ≈ -3.8e35 J for the full solar system.
#[test]
fn full_solar_system_potential_energy_order_of_magnitude() {
    let sim = full_solar_system_barycentric();
    let pe = sim.potential_energy();

    // PE should be negative
    assert!(pe < 0.0, "PE should be negative, got {pe:.4e}");
    // Order of magnitude: [-1e36, -1e34]
    assert!(
        pe > -1e36 && pe < -1e34,
        "PE {pe:.4e} J outside expected range [-1e36, -1e34]"
    );
}

/// Verify total energy = KE + PE and the virial ratio makes sense.
/// For a bound system in near-virial equilibrium, KE ≈ -0.5 * PE,
/// so Total E ≈ 0.5 * PE < 0.
#[test]
fn full_solar_system_total_energy_consistency() {
    let sim = full_solar_system_barycentric();
    let ke = sim.kinetic_energy();
    let pe = sim.potential_energy();
    let total = sim.total_energy();

    // KE + PE = Total to machine precision
    let diff = ((ke + pe) - total).abs();
    assert!(
        diff < 1e-10 * total.abs(),
        "KE + PE != Total: diff = {diff:.2e}, total = {total:.2e}"
    );

    // Total energy should be negative (bound system)
    assert!(total < 0.0, "Total energy should be negative for bound system, got {total:.4e}");

    // Virial ratio: KE / |PE| should be roughly 0.5 for a virialized system
    // The solar system isn't perfectly virialized, but it should be
    // in the range 0.3 to 0.7.
    let virial_ratio = ke / pe.abs();
    assert!(
        virial_ratio > 0.3 && virial_ratio < 0.7,
        "Virial ratio {virial_ratio:.4} outside [0.3, 0.7] — KE={ke:.4e}, PE={pe:.4e}"
    );
}

/// Verify linear momentum is near zero in barycentric frame.
#[test]
fn full_solar_system_barycentric_momentum_near_zero() {
    let sim = full_solar_system_barycentric();
    let p = sim.total_momentum();
    let p_mag = (p.x * p.x + p.y * p.y + p.z * p.z).sqrt();

    // In a perfect barycentric frame, |p| = 0.
    // Numerically, it may be ~1e15 kg·m/s due to floating point roundoff.
    // Earth momentum alone is ~1.78e29 kg·m/s, so |p|/|p_earth| ≈ 2e-14
    // is machine-precision zero.
    let earth_p = M_EARTH * 29784.0; // ~1.78e29
    let rel_p = p_mag / earth_p;
    assert!(
        rel_p < 1e-10,
        "Barycentric |p| / |p_earth| = {rel_p:.4e} is too large (should be ~1e-14)"
    );
}

/// Verify angular momentum magnitude is in expected range.
/// Earth's L ≈ M_earth * v_earth * r_earth ≈ 5.97e24 * 29784 * 1.496e11 ≈ 2.66e40 kg·m²/s
/// Jupiter's L ≈ 1.90e27 * 13070 * 7.78e11 ≈ 1.93e43 kg·m²/s (dominates)
/// Total |L| ≈ 3.1e43 kg·m²/s for the solar system.
#[test]
fn full_solar_system_angular_momentum_magnitude() {
    let sim = full_solar_system_barycentric();
    let l = sim.angular_momentum();
    let l_mag = (l.x * l.x + l.y * l.y + l.z * l.z).sqrt();

    // Should be in the range [1e42, 1e44]
    assert!(
        l_mag > 1e42 && l_mag < 1e44,
        "|L| = {l_mag:.4e} kg·m²/s outside expected range [1e42, 1e44]"
    );
}

/// Run the full solar system at a large timestep (similar to 1yr/s at 60Hz)
/// and verify conservation drift matches what the monitor reports.
///
/// At 1yr/s warp with 60Hz tick rate and 4 substeps:
///   dt per tick = 31536000 / 60 = 525600 s (~6 days)
///   substep dt = 525600 / 4 = 131400 s (~1.52 days)
///
/// After ~90 years (13000 steps), energy drift of ~3e-6 is expected
/// for velocity-Verlet at such a coarse timestep.
#[test]
fn full_solar_system_large_timestep_conservation() {
    let mut sim = full_solar_system_barycentric();

    // Configure timestep to match 1yr/s warp at 60Hz with 4 substeps
    sim.set_dt(525_600.0);    // 6.08 days per tick
    sim.set_substeps(4);      // 4 substeps → ~1.52 days each

    let e0 = sim.total_energy();
    let ke0 = sim.kinetic_energy();
    let pe0 = sim.potential_energy();
    let p0 = sim.total_momentum();
    let l0_v = sim.angular_momentum();
    let com0 = sim.center_of_mass();

    let p0_mag = (p0.x * p0.x + p0.y * p0.y + p0.z * p0.z).sqrt();
    let l0_mag = (l0_v.x * l0_v.x + l0_v.y * l0_v.y + l0_v.z * l0_v.z).sqrt();

    // Print initial values for comparison with the screenshot
    eprintln!("=== INITIAL STATE ===");
    eprintln!("Bodies:       11");
    eprintln!("Total mass:   {:.4e} kg", sim.bodies().iter().map(|b| b.mass).sum::<f64>());
    eprintln!("KE:           {:.4e} J", ke0);
    eprintln!("PE:           {:.4e} J", pe0);
    eprintln!("Total E:      {:.4e} J", e0);
    eprintln!("|p|:          {:.4e} kg·m/s", p0_mag);
    eprintln!("|L| (CoM):    {:.4e} kg·m²/s", l0_mag);
    eprintln!();

    // Run ~90 simulated years: warp = 31536000 s/s real, 90s real → 90 years
    // ticks = 90s * 60Hz = 5400 ticks. But screenshot shows 13062 steps,
    // which is ticks = 13062 (with 4 substeps each = 52248 substeps total).
    sim.step_n(13_000);

    let e1 = sim.total_energy();
    let ke1 = sim.kinetic_energy();
    let pe1 = sim.potential_energy();
    let p1 = sim.total_momentum();
    let l1_v = sim.angular_momentum();
    let com1 = sim.center_of_mass();

    let p1_mag = (p1.x * p1.x + p1.y * p1.y + p1.z * p1.z).sqrt();
    let l1_mag = (l1_v.x * l1_v.x + l1_v.y * l1_v.y + l1_v.z * l1_v.z).sqrt();

    // Compute drifts (same formulas as drift-monitor.ts)
    let energy_drift = (e1 - e0) / e0.abs();
    let char_momentum = (2.0 * sim.bodies().iter().map(|b| b.mass).sum::<f64>() * ke1.abs()).sqrt();
    let momentum_drift = (p1_mag - p0_mag).abs() / char_momentum;
    let angular_drift = (l1_mag - l0_mag).abs() / l0_mag;
    let com_shift = {
        let dx = com1.x - com0.x;
        let dy = com1.y - com0.y;
        let dz = com1.z - com0.z;
        (dx * dx + dy * dy + dz * dz).sqrt()
    };

    eprintln!("=== AFTER 13000 TICKS (~90 years at 1yr/s) ===");
    eprintln!("KE:            {:.4e} J", ke1);
    eprintln!("PE:            {:.4e} J", pe1);
    eprintln!("Total E:       {:.4e} J", e1);
    eprintln!("|p|:           {:.4e} kg·m/s", p1_mag);
    eprintln!("|L| (CoM):     {:.4e} kg·m²/s", l1_mag);
    eprintln!();
    eprintln!("=== DRIFT VALUES (compare with monitor) ===");
    eprintln!("ΔE / |E₀|:    {:.2e}", energy_drift);
    eprintln!("Δp / p_char:  {:.2e}", momentum_drift);
    eprintln!("ΔL / |L₀|:    {:.2e}", angular_drift);
    eprintln!("CoM shift:     {:.2e} km", com_shift / 1e3);
    eprintln!("Steps:         13000");

    // Energy drift: with ~1.5 day substeps over 90 years, expect < 1e-4
    // The screenshot showed 3.31e-6 which is excellent for velocity-Verlet.
    assert!(
        energy_drift.abs() < 1e-4,
        "Energy drift {energy_drift:.2e} exceeds 1e-4"
    );

    // Momentum drift should be near machine precision for a symplectic integrator
    assert!(
        momentum_drift < 1e-8,
        "Momentum drift {momentum_drift:.2e} exceeds 1e-8"
    );

    // Angular momentum drift should be small
    assert!(
        angular_drift < 1e-6,
        "Angular momentum drift {angular_drift:.2e} exceeds 1e-6"
    );
}
