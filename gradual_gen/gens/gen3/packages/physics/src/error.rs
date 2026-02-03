//! Error types for the physics simulation
//!
//! Provides explicit error codes and recovery suggestions for debugging

use serde::{Deserialize, Serialize};
use std::fmt;

/// Error codes for physics simulation issues
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ErrorCode {
    /// Numerical overflow detected
    NumericalOverflow = 1000,
    /// NaN detected in simulation state
    NaNDetected = 1001,
    /// Infinite value detected
    InfiniteValue = 1002,
    /// Energy conservation violation
    EnergyDrift = 1003,
    /// Momentum conservation violation
    MomentumDrift = 1004,
    /// Maximum body count exceeded
    MaxBodiesExceeded = 2000,
    /// Body not found
    BodyNotFound = 2001,
    /// Invalid body parameters
    InvalidBodyParams = 2002,
    /// Duplicate body ID
    DuplicateBodyId = 2003,
    /// Checkpoint not found
    CheckpointNotFound = 3000,
    /// Checkpoint corrupted
    CheckpointCorrupted = 3001,
    /// Serialization error
    SerializationError = 3002,
    /// Deserialization error
    DeserializationError = 3003,
    /// Invalid configuration
    InvalidConfig = 4000,
    /// Timestep too large
    TimestepTooLarge = 4001,
    /// Softening too small
    SofteningTooSmall = 4002,
    /// Close encounter detected
    CloseEncounter = 5000,
    /// Collision detected
    CollisionDetected = 5001,
    /// SOI transition
    SoiTransition = 5002,
    /// Generic internal error
    InternalError = 9999,
}

impl ErrorCode {
    /// Get a human-readable description of the error
    pub fn description(self) -> &'static str {
        match self {
            ErrorCode::NumericalOverflow => "Numerical overflow in physics calculation",
            ErrorCode::NaNDetected => "NaN (Not a Number) detected in simulation state",
            ErrorCode::InfiniteValue => "Infinite value detected in simulation state",
            ErrorCode::EnergyDrift => "Total energy has drifted beyond acceptable tolerance",
            ErrorCode::MomentumDrift => "Total momentum has drifted beyond acceptable tolerance",
            ErrorCode::MaxBodiesExceeded => "Maximum number of bodies exceeded",
            ErrorCode::BodyNotFound => "Requested body was not found in simulation",
            ErrorCode::InvalidBodyParams => "Invalid body parameters provided",
            ErrorCode::DuplicateBodyId => "Body with this ID already exists",
            ErrorCode::CheckpointNotFound => "Requested checkpoint was not found",
            ErrorCode::CheckpointCorrupted => "Checkpoint data is corrupted",
            ErrorCode::SerializationError => "Failed to serialize data",
            ErrorCode::DeserializationError => "Failed to deserialize data",
            ErrorCode::InvalidConfig => "Invalid simulation configuration",
            ErrorCode::TimestepTooLarge => "Timestep is too large for stable integration",
            ErrorCode::SofteningTooSmall => "Softening length is too small",
            ErrorCode::CloseEncounter => "Close encounter between bodies detected",
            ErrorCode::CollisionDetected => "Collision between bodies detected",
            ErrorCode::SoiTransition => "Body crossed sphere of influence boundary",
            ErrorCode::InternalError => "Internal error occurred",
        }
    }

    /// Get recovery suggestions for this error
    pub fn recovery_suggestions(self) -> &'static [&'static str] {
        match self {
            ErrorCode::NumericalOverflow | ErrorCode::InfiniteValue => &[
                "Reduce the timestep (dt)",
                "Increase softening length",
                "Check for bodies with extreme masses or velocities",
                "Restore from last valid checkpoint",
            ],
            ErrorCode::NaNDetected => &[
                "Check for division by zero scenarios",
                "Verify all body masses are positive",
                "Restore from last valid checkpoint",
            ],
            ErrorCode::EnergyDrift => &[
                "Reduce the timestep for better accuracy",
                "Use more substeps per tick",
                "Consider switching to higher-order integrator (Phase II)",
            ],
            ErrorCode::MomentumDrift => &[
                "Check for external forces or asymmetric calculations",
                "Verify collision handling conserves momentum",
            ],
            ErrorCode::MaxBodiesExceeded => &[
                "Remove some bodies before adding new ones",
                "Increase max_massive_bodies_N in configuration",
            ],
            ErrorCode::BodyNotFound => &["Verify body ID is correct", "Check if body was removed"],
            ErrorCode::InvalidBodyParams => &[
                "Ensure mass is positive",
                "Ensure radius is non-negative",
                "Check position and velocity are finite",
            ],
            ErrorCode::DuplicateBodyId => &[
                "Use a unique ID for the new body",
                "Remove existing body first if replacing",
            ],
            ErrorCode::CheckpointNotFound => &[
                "Verify checkpoint ID/tick number",
                "Create a new checkpoint",
            ],
            ErrorCode::CheckpointCorrupted => &[
                "Restore from an earlier checkpoint",
                "Restart simulation from known good state",
            ],
            ErrorCode::SerializationError | ErrorCode::DeserializationError => {
                &["Check data format", "Verify version compatibility"]
            }
            ErrorCode::InvalidConfig => &[
                "Review configuration parameters",
                "Use default configuration as starting point",
            ],
            ErrorCode::TimestepTooLarge => &[
                "Reduce dt value",
                "Increase max_integrator_substeps_per_tick",
            ],
            ErrorCode::SofteningTooSmall => &[
                "Increase softening length",
                "Use adaptive softening based on body radii",
            ],
            ErrorCode::CloseEncounter => &[
                "System will use smaller substeps automatically",
                "Consider switching to adaptive integrator",
            ],
            ErrorCode::CollisionDetected => &[
                "Bodies will be merged if collision merging is enabled",
                "Check collision handling configuration",
            ],
            ErrorCode::SoiTransition => &[
                "SOI transition is informational",
                "Reference frame may be updated",
            ],
            ErrorCode::InternalError => &[
                "Report this issue with full context",
                "Restore from checkpoint",
            ],
        }
    }
}

/// Physics simulation error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhysicsError {
    /// Error code
    pub code: ErrorCode,
    /// Detailed error message
    pub message: String,
    /// Optional context (body IDs, tick number, etc.)
    pub context: Option<String>,
}

impl PhysicsError {
    /// Create a new physics error
    pub fn new(code: ErrorCode, message: impl Into<String>) -> Self {
        Self {
            code,
            message: message.into(),
            context: None,
        }
    }

    /// Add context to the error
    pub fn with_context(mut self, context: impl Into<String>) -> Self {
        self.context = Some(context.into());
        self
    }

    /// Create error for NaN detection
    pub fn nan_detected(location: &str) -> Self {
        Self::new(
            ErrorCode::NaNDetected,
            format!("NaN detected in {}", location),
        )
    }

    /// Create error for body not found
    pub fn body_not_found(id: &str) -> Self {
        Self::new(ErrorCode::BodyNotFound, format!("Body '{}' not found", id))
    }

    /// Create error for max bodies exceeded
    pub fn max_bodies_exceeded(current: usize, max: usize) -> Self {
        Self::new(
            ErrorCode::MaxBodiesExceeded,
            format!("Cannot add body: {} bodies exist, max is {}", current, max),
        )
    }

    /// Create error for energy drift
    pub fn energy_drift(initial: f64, current: f64, percent: f64) -> Self {
        Self::new(
            ErrorCode::EnergyDrift,
            format!(
                "Energy drift: {:.6}% (initial: {:.6e} J, current: {:.6e} J)",
                percent, initial, current
            ),
        )
    }
}

impl fmt::Display for PhysicsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "[E{:04}] {}: {}",
            self.code as u32,
            self.code.description(),
            self.message
        )?;
        if let Some(ref ctx) = self.context {
            write!(f, " (context: {})", ctx)?;
        }
        Ok(())
    }
}

impl std::error::Error for PhysicsError {}

/// Result type for physics operations
pub type PhysicsResult<T> = Result<T, PhysicsError>;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = PhysicsError::nan_detected("position calculation");
        let display = format!("{}", err);
        assert!(display.contains("NaN"));
        assert!(display.contains("1001"));
    }

    #[test]
    fn test_error_with_context() {
        let err = PhysicsError::body_not_found("earth").with_context("tick 12345");
        assert!(err.context.is_some());
        assert!(err.context.unwrap().contains("12345"));
    }
}
