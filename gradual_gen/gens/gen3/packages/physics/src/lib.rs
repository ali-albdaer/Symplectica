//! High-Fidelity N-Body Physics Core
//!
//! This crate provides a deterministic, SI-unit-based gravitational N-body simulation
//! with the following features:
//! - Direct-sum O(N²) force calculation with softening
//! - Velocity-Verlet symplectic integrator
//! - Inelastic collision merging
//! - PCG PRNG for deterministic randomness
//! - Checkpoint/restore API
//!
//! All units are SI: meters (m), kilograms (kg), seconds (s)

#![allow(clippy::too_many_arguments)]

pub mod body;
pub mod checkpoint;
pub mod collision;
pub mod config;
pub mod error;
pub mod integrator;
pub mod prng;
pub mod simulation;
pub mod soi;
pub mod vec3;

#[cfg(feature = "wasm")]
pub mod wasm_bindings;

pub use body::Body;
pub use checkpoint::Checkpoint;
pub use config::SimConfig;
pub use error::{PhysicsError, PhysicsResult};
pub use prng::Pcg32;
pub use simulation::Simulation;
pub use vec3::Vec3;

/// Gravitational constant in SI units (m³ kg⁻¹ s⁻²)
pub const G: f64 = 6.67430e-11;

/// Speed of light in m/s (for future relativistic effects)
pub const C: f64 = 299_792_458.0;

/// Default softening length in meters (prevents singularities)
pub const DEFAULT_SOFTENING: f64 = 1.0e6;

/// Floating origin recenter threshold in meters
pub const RECENTER_THRESHOLD: f64 = 1.0e7;

/// Maximum supported massive bodies
pub const MAX_MASSIVE_BODIES: usize = 100;

/// Maximum total objects (including test particles)
pub const MAX_TOTAL_OBJECTS: usize = 500;

/// Default network tick rate in Hz
pub const DEFAULT_TICK_RATE: u32 = 60;

/// Default timestep in seconds (1/60)
pub const DEFAULT_DT: f64 = 1.0 / 60.0;
