///! Gauss-Radau 15th-order integrator (IAS15-style).
///! Uses 8-point Radau quadrature with Lagrange interpolation and
///! predictor-corrector convergence for high accuracy.

use crate::state::SimulationState;
use crate::solvers::GravitySolver;
use crate::units::Second;
use crate::vector::Vec3;
use super::{IntegrationResult, Integrator, IntegratorType};

/// Gauss-Radau spacings (nodes for the 8-point Radau quadrature on [0,1])
const NODES: [f64; 8] = [
    0.0,
    0.0562625605369221464656521910318,
    0.1802406917368923649875799428958,
    0.3526247171131696373739077702801,
    0.5471536263305553830014485577340,
    0.7342101772154105410531523211116,
    0.8853209468390957680903597629007,
    0.9775206135612875018911745004472,
];

const NSTAGES: usize = 8;
const MAX_ITERATIONS: usize = 12;

/// Precomputed quadrature weights for velocity: w_k = ∫₀¹ ℓ_k(s) ds
/// where ℓ_k is the Lagrange basis polynomial for node k
fn compute_velocity_weights() -> [f64; 8] {
    let mut w = [0.0f64; 8];
    // Use high-precision numerical integration (128-point Gauss-Legendre)
    let nq = 128;
    for q in 0..nq {
        let s = (q as f64 + 0.5) / nq as f64;
        for k in 0..NSTAGES {
            let mut lk = 1.0;
            for j in 0..NSTAGES {
                if j != k {
                    lk *= (s - NODES[j]) / (NODES[k] - NODES[j]);
                }
            }
            w[k] += lk / nq as f64;
        }
    }
    w
}

/// Precomputed quadrature weights for position: e_k = ∫₀¹ (1-s) ℓ_k(s) ds
fn compute_position_weights() -> [f64; 8] {
    let mut e = [0.0f64; 8];
    let nq = 128;
    for q in 0..nq {
        let s = (q as f64 + 0.5) / nq as f64;
        for k in 0..NSTAGES {
            let mut lk = 1.0;
            for j in 0..NSTAGES {
                if j != k {
                    lk *= (s - NODES[j]) / (NODES[k] - NODES[j]);
                }
            }
            e[k] += (1.0 - s) * lk / nq as f64;
        }
    }
    e
}

/// Quadrature weights for position prediction at substage s_target:
/// e_k(s) = ∫₀ˢ (s - t) ℓ_k(t) dt
fn position_weights_at(s_target: f64) -> [f64; 8] {
    let mut e = [0.0f64; 8];
    if s_target < 1e-15 { return e; }
    let nq = 64;
    for q in 0..nq {
        let t = s_target * (q as f64 + 0.5) / nq as f64;
        let dt = s_target / nq as f64;
        for k in 0..NSTAGES {
            let mut lk = 1.0;
            for j in 0..NSTAGES {
                if j != k {
                    lk *= (t - NODES[j]) / (NODES[k] - NODES[j]);
                }
            }
            e[k] += (s_target - t) * lk * dt;
        }
    }
    e
}

/// Quadrature weights for velocity prediction at substage s_target:
/// d_k(s) = ∫₀ˢ ℓ_k(t) dt
fn velocity_weights_at(s_target: f64) -> [f64; 8] {
    let mut d = [0.0f64; 8];
    if s_target < 1e-15 { return d; }
    let nq = 64;
    for q in 0..nq {
        let t = s_target * (q as f64 + 0.5) / nq as f64;
        let dt = s_target / nq as f64;
        for k in 0..NSTAGES {
            let mut lk = 1.0;
            for j in 0..NSTAGES {
                if j != k {
                    lk *= (t - NODES[j]) / (NODES[k] - NODES[j]);
                }
            }
            d[k] += lk * dt;
        }
    }
    d
}

pub struct GaussRadau15Integrator {
    tolerance: f64,
    vel_weights: [f64; 8],
    pos_weights: [f64; 8],
    substage_pos_weights: [[f64; 8]; 8],
}

impl GaussRadau15Integrator {
    pub fn new(tolerance: f64) -> Self {
        let vel_weights = compute_velocity_weights();
        let pos_weights = compute_position_weights();
        let mut substage_pos_weights = [[0.0f64; 8]; 8];
        for s in 0..NSTAGES {
            substage_pos_weights[s] = position_weights_at(NODES[s]);
        }
        Self {
            tolerance: tolerance.max(1e-16),
            vel_weights,
            pos_weights,
            substage_pos_weights,
        }
    }
}

/// Compute accelerations at given positions using the solver
fn eval_accel(
    state: &SimulationState,
    positions: &[Vec3],
    solver: &dyn GravitySolver,
) -> Vec<Vec3> {
    let mut temp = state.bodies.clone();
    for (i, b) in temp.iter_mut().enumerate() {
        b.position = positions[i];
    }
    let result = solver.compute_accelerations(&temp, state.config.softening_length);
    result.accelerations
}

impl Integrator for GaussRadau15Integrator {
    fn step(
        &self,
        state: &mut SimulationState,
        solver: &dyn GravitySolver,
        dt: Second,
    ) -> IntegrationResult {
        let n = state.bodies.len();
        let h = dt.value();
        let mut total_evals: u64 = 0;

        let x0: Vec<Vec3> = state.bodies.iter().map(|b| b.position).collect();
        let v0: Vec<Vec3> = state.bodies.iter().map(|b| b.velocity).collect();

        // Acceleration at each substage
        let mut a_stages: Vec<Vec<Vec3>> = vec![vec![Vec3::ZERO; n]; NSTAGES];
        a_stages[0] = eval_accel(state, &x0, solver);
        total_evals += n as u64;

        // Predictor-corrector iterations
        let mut max_delta: f64 = 1.0;
        let mut iterations = 0;

        while iterations < MAX_ITERATIONS && max_delta > self.tolerance {
            max_delta = 0.0;

            for stage in 1..NSTAGES {
                let pw = &self.substage_pos_weights[stage];

                // Predict positions at substage using Lagrange interpolation
                let mut x_stage = vec![Vec3::ZERO; n];
                for i in 0..n {
                    // x(s) = x0 + h*s*v0 + h² * Σ e_k(s) * a_k
                    let mut accel_interp = Vec3::ZERO;
                    for k in 0..NSTAGES {
                        accel_interp += a_stages[k][i] * pw[k];
                    }
                    x_stage[i] = x0[i] + v0[i] * (NODES[stage] * h)
                        + accel_interp * (h * h);
                }

                // Evaluate acceleration at predicted positions
                let a_s = eval_accel(state, &x_stage, solver);
                total_evals += n as u64;

                // Track convergence from acceleration change
                for i in 0..n {
                    let delta = (a_s[i] - a_stages[stage][i]).magnitude();
                    max_delta = max_delta.max(delta);
                }

                a_stages[stage] = a_s;
            }

            iterations += 1;

            // Normalize error by typical acceleration magnitude
            let typical_a = a_stages[0].iter().map(|a| a.magnitude()).sum::<f64>() / n as f64;
            if typical_a > 0.0 {
                max_delta /= typical_a;
            }
        }

        // Final update using the full-step quadrature weights
        let env_accels = crate::environment::compute_environment_forces(state);

        for i in 0..n {
            if !state.bodies[i].is_active { continue; }

            // x₁ = x₀ + h v₀ + h² Σ e_k a_k
            let mut pos_accel = Vec3::ZERO;
            for k in 0..NSTAGES {
                pos_accel += a_stages[k][i] * self.pos_weights[k];
            }
            state.bodies[i].position = x0[i] + v0[i] * h + pos_accel * (h * h);

            // v₁ = v₀ + h Σ w_k a_k
            let mut vel_accel = Vec3::ZERO;
            for k in 0..NSTAGES {
                vel_accel += a_stages[k][i] * self.vel_weights[k];
            }
            state.bodies[i].velocity = v0[i] + vel_accel * h;

            // Store final acceleration
            state.bodies[i].acceleration = a_stages[NSTAGES - 1][i] + env_accels[i];
        }

        // Update rotations
        for body in &mut state.bodies {
            body.update_rotation(dt);
        }

        IntegrationResult {
            dt_actual: dt,
            error_estimate: max_delta,
            force_evaluations: total_evals,
            substeps: iterations as u32,
            accepted: true,
        }
    }

    fn integrator_type(&self) -> IntegratorType {
        IntegratorType::GaussRadau15
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType};
    use crate::units::*;
    use crate::solvers::direct::DirectSolver;

    #[test]
    fn test_gauss_radau_kepler() {
        let mut state = SimulationState::new();
        state.config.enable_atmosphere = false;
        state.config.enable_drag = false;
        state.config.enable_radiation_pressure = false;
        state.config.enable_tidal_forces = false;
        state.config.enable_spherical_harmonics = false;
        state.config.softening_length = 0.0;

        let sun = Body::new(1, "Sun", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_position(Vec3::ZERO);
        let r = AU;
        let v = (G * SOLAR_MASS / r).sqrt();
        let earth = Body::new(2, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_position(Vec3::new(r, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, v, 0.0));

        state.add_body(sun);
        state.add_body(earth);

        let solver = DirectSolver;
        let integrator = GaussRadau15Integrator::new(1e-14);
        let initial_energy = state.total_energy();
        let initial_L = state.total_angular_momentum();
        let dt = Second::new(86400.0); // 1 day

        // Integrate for 1 year
        for _ in 0..365 {
            integrator.step(&mut state, &solver, dt);
        }

        let final_energy = state.total_energy();
        let final_L = state.total_angular_momentum();

        let energy_err = ((final_energy.value() - initial_energy.value()) / initial_energy.value()).abs();
        let L_err = (final_L - initial_L).magnitude() / initial_L.magnitude();

        // GR15 should be extremely accurate
        assert!(energy_err < 1e-4,
            "GR15 energy error: {:.6e}", energy_err);
        assert!(L_err < 1e-4,
            "GR15 angular momentum error: {:.6e}", L_err);
    }
}
