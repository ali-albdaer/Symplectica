///! Velocity Verlet (leapfrog) symplectic integrator.
///! Preserves phase-space volume and energy oscillation bounds for long-term evolution.
///! Second-order, time-reversible.

use crate::state::SimulationState;
use crate::solvers::GravitySolver;
use crate::units::Second;
use super::{IntegrationResult, Integrator, IntegratorType};

pub struct VelocityVerletIntegrator;

impl Integrator for VelocityVerletIntegrator {
    fn step(
        &self,
        state: &mut SimulationState,
        solver: &dyn GravitySolver,
        dt: Second,
    ) -> IntegrationResult {
        let h = dt.value();
        let n = state.bodies.len();
        let softening = state.config.softening_length;

        // Step 1: Half-kick — v_{n+1/2} = v_n + (h/2) * a_n
        // (accelerations should already be computed from previous step)
        for i in 0..n {
            if !state.bodies[i].is_active { continue; }
            let acc = state.bodies[i].acceleration;
            state.bodies[i].velocity += acc * (h * 0.5);
        }

        // Step 2: Drift — x_{n+1} = x_n + h * v_{n+1/2}
        for i in 0..n {
            if !state.bodies[i].is_active { continue; }
            let vel = state.bodies[i].velocity;
            state.bodies[i].position += vel * h;
        }

        // Step 3: Compute new accelerations a_{n+1}
        let force_result = solver.compute_accelerations(&state.bodies, softening);

        // Apply environment forces if enabled
        let env_accels = crate::environment::compute_environment_forces(state);

        for i in 0..n {
            state.bodies[i].acceleration = force_result.accelerations[i] + env_accels[i];
        }

        // Step 4: Half-kick — v_{n+1} = v_{n+1/2} + (h/2) * a_{n+1}
        for i in 0..n {
            if !state.bodies[i].is_active { continue; }
            let acc = state.bodies[i].acceleration;
            state.bodies[i].velocity += acc * (h * 0.5);
        }

        // Update rotations
        for i in 0..n {
            state.bodies[i].update_rotation(dt);
        }

        IntegrationResult {
            dt_actual: dt,
            error_estimate: 0.0, // Symplectic, no error estimate
            force_evaluations: force_result.force_evaluations,
            substeps: 1,
            accepted: true,
        }
    }

    fn integrator_type(&self) -> IntegratorType {
        IntegratorType::VelocityVerlet
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::{Body, BodyType};
    use crate::units::*;
    use crate::vector::Vec3;
    use crate::solvers::direct::DirectSolver;

    #[test]
    fn test_circular_orbit_energy_conservation() {
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

        // Earth in circular orbit: v = sqrt(GM/r)
        let r = AU;
        let v = (G * SOLAR_MASS / r).sqrt();
        let earth = Body::new(2, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_position(Vec3::new(r, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, v, 0.0));

        state.add_body(sun);
        state.add_body(earth);

        // Initialize accelerations
        let solver = DirectSolver;
        let result = solver.compute_accelerations(&state.bodies, 0.0);
        for i in 0..state.bodies.len() {
            state.bodies[i].acceleration = result.accelerations[i];
        }

        let initial_energy = state.total_energy();
        let integrator = VelocityVerletIntegrator;
        let dt = Second::new(3600.0); // 1 hour

        // Integrate for ~1 year (8760 hours)
        for _ in 0..8760 {
            integrator.step(&mut state, &solver, dt);
            state.config.time += dt;
            state.config.tick += 1;
        }

        let final_energy = state.total_energy();
        let rel_error = ((final_energy.value() - initial_energy.value()) / initial_energy.value()).abs();

        // Verlet should conserve energy to ~1e-6 or better for this setup
        assert!(rel_error < 1e-4,
            "Energy conservation violated: relative error = {:.6e}", rel_error);
    }
}
