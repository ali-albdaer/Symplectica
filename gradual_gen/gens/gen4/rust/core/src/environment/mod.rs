pub mod atmosphere;
pub mod drag;
pub mod radiation;
pub mod tidal;
pub mod spherical_harmonics;

use crate::state::SimulationState;
use crate::vector::Vec3;

/// Compute all enabled environment forces for all bodies.
/// Returns acceleration contributions per body.
pub fn compute_environment_forces(state: &SimulationState) -> Vec<Vec3> {
    let n = state.bodies.len();
    let mut accels = vec![Vec3::ZERO; n];

    if state.config.enable_atmosphere && state.config.enable_drag {
        let drag_accels = drag::compute_drag_forces(&state.bodies);
        for i in 0..n {
            accels[i] += drag_accels[i];
        }
    }

    if state.config.enable_radiation_pressure {
        let rad_accels = radiation::compute_radiation_pressure(&state.bodies);
        for i in 0..n {
            accels[i] += rad_accels[i];
        }
    }

    if state.config.enable_tidal_forces {
        let tidal_accels = tidal::compute_tidal_forces(&state.bodies);
        for i in 0..n {
            accels[i] += tidal_accels[i];
        }
    }

    if state.config.enable_spherical_harmonics {
        let harm_accels = spherical_harmonics::compute_harmonic_gravity(&state.bodies);
        for i in 0..n {
            accels[i] += harm_accels[i];
        }
    }

    accels
}
