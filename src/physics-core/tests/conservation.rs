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
