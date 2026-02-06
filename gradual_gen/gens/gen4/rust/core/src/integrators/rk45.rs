///! Dormand-Prince RK4(5) adaptive integrator.
///! Embedded Runge-Kutta method with error estimation and step size control.
///! Suitable for general adaptive stepping.

use crate::state::SimulationState;
use crate::solvers::GravitySolver;
use crate::units::Second;
use crate::vector::Vec3;
use super::{IntegrationResult, Integrator, IntegratorType};

/// Dormand-Prince RK45 coefficients
/// Butcher tableau nodes
const C: [f64; 7] = [0.0, 1.0/5.0, 3.0/10.0, 4.0/5.0, 8.0/9.0, 1.0, 1.0];

/// Butcher tableau matrix (row major, lower triangular)
const A: [[f64; 6]; 6] = [
    [1.0/5.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    [3.0/40.0, 9.0/40.0, 0.0, 0.0, 0.0, 0.0],
    [44.0/45.0, -56.0/15.0, 32.0/9.0, 0.0, 0.0, 0.0],
    [19372.0/6561.0, -25360.0/2187.0, 64448.0/6561.0, -212.0/729.0, 0.0, 0.0],
    [9017.0/3168.0, -355.0/33.0, 46732.0/5247.0, 49.0/176.0, -5103.0/18656.0, 0.0],
    [35.0/384.0, 0.0, 500.0/1113.0, 125.0/192.0, -2187.0/6784.0, 11.0/84.0],
];

/// 5th order weights
const B5: [f64; 7] = [
    35.0/384.0, 0.0, 500.0/1113.0, 125.0/192.0, -2187.0/6784.0, 11.0/84.0, 0.0
];

/// 4th order weights (for error estimation)
const B4: [f64; 7] = [
    5179.0/57600.0, 0.0, 7571.0/16695.0, 393.0/640.0,
    -92097.0/339200.0, 187.0/2100.0, 1.0/40.0
];

pub struct RK45Integrator {
    tolerance: f64,
    safety_factor: f64,
    min_scale: f64,
    max_scale: f64,
}

impl RK45Integrator {
    pub fn new(tolerance: f64) -> Self {
        Self {
            tolerance: tolerance.max(1e-15),
            safety_factor: 0.9,
            min_scale: 0.2,
            max_scale: 5.0,
        }
    }
}

/// Compute acceleration for a given set of positions
fn compute_accel_at_positions(
    state: &SimulationState,
    positions: &[Vec3],
    solver: &dyn GravitySolver,
) -> Vec<Vec3> {
    // Create temporary bodies with modified positions
    let mut temp_bodies = state.bodies.clone();
    for (i, body) in temp_bodies.iter_mut().enumerate() {
        body.position = positions[i];
    }
    let result = solver.compute_accelerations(&temp_bodies, state.config.softening_length);
    result.accelerations
}

impl Integrator for RK45Integrator {
    fn step(
        &self,
        state: &mut SimulationState,
        solver: &dyn GravitySolver,
        dt: Second,
    ) -> IntegrationResult {
        let n = state.bodies.len();
        let mut h = dt.value();
        let mut total_evals: u64 = 0;
        let mut substeps: u32 = 0;
        let mut time_remaining = h;

        while time_remaining > 1e-15 {
            h = h.min(time_remaining);

            // Save initial state
            let x0: Vec<Vec3> = state.bodies.iter().map(|b| b.position).collect();
            let v0: Vec<Vec3> = state.bodies.iter().map(|b| b.velocity).collect();

            // Stage 1: k1 = f(t, y)
            let k1_a = compute_accel_at_positions(state, &x0, solver);
            total_evals += n as u64;

            // Stages 2-6
            let mut k_pos = vec![vec![Vec3::ZERO; n]; 6]; // position derivatives (velocity)
            let mut k_vel = vec![vec![Vec3::ZERO; n]; 6]; // velocity derivatives (acceleration)

            // Store stage 1
            for i in 0..n {
                k_pos[0][i] = v0[i];
                k_vel[0][i] = k1_a[i];
            }

            let mut accepted = true;
            let mut max_error: f64 = 0.0;

            // Compute stages 2-7
            for s in 1..=6 {
                let idx = if s <= 5 { s } else { 5 }; // A only has 6 rows

                let mut positions_s = vec![Vec3::ZERO; n];
                let mut velocities_s = vec![Vec3::ZERO; n];

                for i in 0..n {
                    let mut dp = Vec3::ZERO;
                    let mut dv = Vec3::ZERO;
                    for j in 0..s {
                        if s <= 5 {
                            dp += k_pos[j][i] * (A[s-1][j] * h);
                            dv += k_vel[j][i] * (A[s-1][j] * h);
                        }
                    }
                    positions_s[i] = x0[i] + dp;
                    velocities_s[i] = v0[i] + dv;
                }

                if s <= 5 {
                    let accel_s = compute_accel_at_positions(state, &positions_s, solver);
                    total_evals += n as u64;
                    for i in 0..n {
                        k_pos[s][i] = velocities_s[i];
                        k_vel[s][i] = accel_s[i];
                    }
                } else {
                    // Stage 7: compute error estimate
                    let env_accels = crate::environment::compute_environment_forces(state);

                    for i in 0..n {
                        // 5th order solution
                        let mut x5 = x0[i];
                        let mut v5 = v0[i];
                        // 4th order solution
                        let mut x4 = x0[i];
                        let mut v4 = v0[i];

                        for j in 0..6 {
                            x5 += k_pos[j][i] * (B5[j] * h);
                            v5 += k_vel[j][i] * (B5[j] * h);
                            x4 += k_pos[j][i] * (B4[j] * h);
                            v4 += k_vel[j][i] * (B4[j] * h);
                        }

                        // Error = |y5 - y4|
                        let pos_err = (x5 - x4).magnitude();
                        let vel_err = (v5 - v4).magnitude();

                        let pos_scale = x0[i].magnitude().max(1.0);
                        let vel_scale = v0[i].magnitude().max(1.0);

                        let err = (pos_err / pos_scale).max(vel_err / vel_scale);
                        max_error = max_error.max(err);

                        if !state.bodies[i].is_active { continue; }
                        state.bodies[i].position = x5;
                        state.bodies[i].velocity = v5;
                        state.bodies[i].acceleration = k_vel[5][i] + env_accels[i];
                    }
                }
            }

            // Step size control
            if max_error > 0.0 {
                let err_ratio = self.tolerance / max_error;
                let scale = self.safety_factor * err_ratio.powf(0.2);
                let scale = scale.max(self.min_scale).min(self.max_scale);

                if max_error > self.tolerance * 10.0 && time_remaining > h * 0.5 {
                    // Reject step, reduce h
                    h *= scale;
                    for i in 0..n {
                        state.bodies[i].position = x0[i];
                        state.bodies[i].velocity = v0[i];
                    }
                    accepted = false;
                    continue;
                }
                h *= scale;
            }

            // Update rotations
            for body in &mut state.bodies {
                body.update_rotation(Second::new(h));
            }

            time_remaining -= h.min(time_remaining);
            substeps += 1;

            if substeps >= state.config.max_substeps {
                break;
            }
        }

        IntegrationResult {
            dt_actual: dt,
            error_estimate: 0.0,
            force_evaluations: total_evals,
            substeps,
            accepted: true,
        }
    }

    fn integrator_type(&self) -> IntegratorType {
        IntegratorType::RK45
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType};
    use crate::units::*;

    #[test]
    fn test_rk45_two_body() {
        use crate::solvers::direct::DirectSolver;

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
        let integrator = RK45Integrator::new(1e-10);
        let initial_energy = state.total_energy();
        let dt = Second::new(86400.0); // 1 day

        for _ in 0..365 {
            integrator.step(&mut state, &solver, dt);
        }

        let final_energy = state.total_energy();
        let rel_error = ((final_energy.value() - initial_energy.value()) / initial_energy.value()).abs();
        assert!(rel_error < 1e-3,
            "RK45 energy conservation: rel error = {:.6e}", rel_error);
    }
}
