pub mod direct;
pub mod barnes_hut;
pub mod fmm;

use crate::body::Body;
use crate::vector::Vec3;
use serde::{Deserialize, Serialize};

/// Available gravitational force solvers
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SolverType {
    Direct,    // O(N²) exact
    BarnesHut, // O(N log N) with tunable theta
    FMM,       // O(N) with tunable order
}

/// Result of computing gravitational accelerations for all bodies
pub struct ForceResult {
    /// Acceleration vector per body (indexed same as input)
    pub accelerations: Vec<Vec3>,
    /// Number of force evaluations performed
    pub force_evaluations: u64,
    /// Maximum pairwise force error estimate (if available)
    pub max_error_estimate: f64,
}

/// Trait for gravitational force solvers
pub trait GravitySolver {
    /// Compute gravitational accelerations for all bodies.
    /// softening_length: Plummer softening in meters.
    fn compute_accelerations(
        &self,
        bodies: &[Body],
        softening_length: f64,
    ) -> ForceResult;

    fn solver_type(&self) -> SolverType;
}

/// Create a solver of the specified type with given parameters
pub fn create_solver(solver_type: SolverType, theta: f64, fmm_order: u32) -> Box<dyn GravitySolver> {
    match solver_type {
        SolverType::Direct => Box::new(direct::DirectSolver),
        SolverType::BarnesHut => Box::new(barnes_hut::BarnesHutSolver::new(theta)),
        SolverType::FMM => Box::new(fmm::FMMSolver::new(fmm_order)),
    }
}
