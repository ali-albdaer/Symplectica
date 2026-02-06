pub mod verlet;
pub mod rk45;
pub mod gauss_radau;

use crate::state::SimulationState;
use crate::solvers::GravitySolver;
use crate::units::Second;
use serde::{Deserialize, Serialize};

/// Available integration schemes
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IntegratorType {
    VelocityVerlet,  // Symplectic, long-term stability
    RK45,            // Adaptive Dormand-Prince
    GaussRadau15,    // High-order for close encounters
}

/// Result of a single integration step
pub struct IntegrationResult {
    /// Actual timestep taken (may differ from requested for adaptive)
    pub dt_actual: Second,
    /// Estimated local truncation error
    pub error_estimate: f64,
    /// Number of force evaluations
    pub force_evaluations: u64,
    /// Number of substeps taken
    pub substeps: u32,
    /// Whether the step was accepted (for adaptive)
    pub accepted: bool,
}

/// Trait for integration schemes
pub trait Integrator {
    /// Advance the simulation state by one timestep
    fn step(
        &self,
        state: &mut SimulationState,
        solver: &dyn GravitySolver,
        dt: Second,
    ) -> IntegrationResult;

    fn integrator_type(&self) -> IntegratorType;
}

/// Create an integrator of the specified type
pub fn create_integrator(int_type: IntegratorType, tolerance: f64) -> Box<dyn Integrator> {
    match int_type {
        IntegratorType::VelocityVerlet => Box::new(verlet::VelocityVerletIntegrator),
        IntegratorType::RK45 => Box::new(rk45::RK45Integrator::new(tolerance)),
        IntegratorType::GaussRadau15 => Box::new(gauss_radau::GaussRadau15Integrator::new(tolerance)),
    }
}
