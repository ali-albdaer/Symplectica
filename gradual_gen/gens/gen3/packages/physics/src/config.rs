//! Simulation configuration
//!
//! All configuration parameters for the physics simulation

use serde::{Deserialize, Serialize};

use crate::{DEFAULT_DT, DEFAULT_SOFTENING, DEFAULT_TICK_RATE, MAX_MASSIVE_BODIES, MAX_TOTAL_OBJECTS, RECENTER_THRESHOLD};

/// Accuracy tolerance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccuracyTolerances {
    /// Maximum allowed error in Earth's orbital period (percentage)
    pub earth_orbital_period_pct: f64,
    /// Maximum positional error after 1 orbit (meters)
    pub positional_error_meters_after_1_orbit: f64,
    /// Maximum energy drift after 100 orbits (percentage)
    pub energy_drift_percent_after_100_orbits: f64,
}

impl Default for AccuracyTolerances {
    fn default() -> Self {
        Self {
            earth_orbital_period_pct: 0.1,
            positional_error_meters_after_1_orbit: 1000.0,
            energy_drift_percent_after_100_orbits: 0.01,
        }
    }
}

/// Collision handling mode
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CollisionMode {
    /// No collision handling
    None,
    /// Inelastic merge (conserve mass and momentum)
    InelasticMerge,
    /// Elastic bounce (future, Phase II+)
    Elastic,
}

impl Default for CollisionMode {
    fn default() -> Self {
        Self::InelasticMerge
    }
}

/// Integrator type
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum IntegratorType {
    /// Velocity Verlet (symplectic, Phase I default)
    VelocityVerlet,
    /// RK4 (classical, non-symplectic)
    RK4,
    /// RK45 Adaptive (Phase II)
    RK45Adaptive,
    /// Gauss-Radau IAS15 (Phase II+)
    GaussRadau,
}

impl Default for IntegratorType {
    fn default() -> Self {
        Self::VelocityVerlet
    }
}

/// Solver type for force calculation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SolverType {
    /// Direct sum O(N²) - Phase I default
    DirectSum,
    /// Barnes-Hut octree O(N log N) - Phase II
    BarnesHut,
    /// Fast Multipole Method O(N) - Phase III
    FMM,
}

impl Default for SolverType {
    fn default() -> Self {
        Self::DirectSum
    }
}

/// Main simulation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimConfig {
    /// Timestep in seconds
    pub dt: f64,

    /// Maximum substeps per tick
    pub max_substeps: u32,

    /// Network tick rate in Hz
    pub tick_rate: u32,

    /// Softening length in meters (prevents singularities)
    pub softening: f64,

    /// Maximum number of massive bodies
    pub max_massive_bodies: usize,

    /// Maximum total objects (including test particles)
    pub max_total_objects: usize,

    /// Floating origin recenter threshold in meters
    pub recenter_threshold: f64,

    /// Collision handling mode
    pub collision_mode: CollisionMode,

    /// Integrator type
    pub integrator: IntegratorType,

    /// Solver type
    pub solver: SolverType,

    /// Accuracy tolerances
    pub tolerances: AccuracyTolerances,

    /// Enable energy monitoring
    pub monitor_energy: bool,

    /// Enable momentum monitoring
    pub monitor_momentum: bool,

    /// Barnes-Hut theta parameter (Phase II)
    pub barnes_hut_theta: f64,

    /// Close encounter threshold multiplier (relative to body radii)
    pub close_encounter_threshold: f64,

    /// Integrator switch trigger distance (relative to body radii)
    pub integrator_switch_threshold: f64,
}

impl Default for SimConfig {
    fn default() -> Self {
        Self {
            dt: DEFAULT_DT,
            max_substeps: 4,
            tick_rate: DEFAULT_TICK_RATE,
            softening: DEFAULT_SOFTENING,
            max_massive_bodies: MAX_MASSIVE_BODIES,
            max_total_objects: MAX_TOTAL_OBJECTS,
            recenter_threshold: RECENTER_THRESHOLD,
            collision_mode: CollisionMode::default(),
            integrator: IntegratorType::default(),
            solver: SolverType::default(),
            tolerances: AccuracyTolerances::default(),
            monitor_energy: true,
            monitor_momentum: true,
            barnes_hut_theta: 0.5,
            close_encounter_threshold: 5.0,
            integrator_switch_threshold: 5.0,
        }
    }
}

impl SimConfig {
    /// Create a new configuration with custom timestep
    pub fn with_dt(mut self, dt: f64) -> Self {
        self.dt = dt;
        self
    }

    /// Create a new configuration with custom tick rate
    pub fn with_tick_rate(mut self, tick_rate: u32) -> Self {
        self.tick_rate = tick_rate;
        self.dt = 1.0 / tick_rate as f64;
        self
    }

    /// Create a new configuration with custom softening
    pub fn with_softening(mut self, softening: f64) -> Self {
        self.softening = softening;
        self
    }

    /// Create a new configuration with custom collision mode
    pub fn with_collision_mode(mut self, mode: CollisionMode) -> Self {
        self.collision_mode = mode;
        self
    }

    /// Validate the configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.dt <= 0.0 {
            return Err("Timestep must be positive".to_string());
        }
        if self.dt > 1.0 {
            return Err("Timestep too large (max 1 second)".to_string());
        }
        if self.softening <= 0.0 {
            return Err("Softening must be positive".to_string());
        }
        if self.max_massive_bodies == 0 {
            return Err("Max massive bodies must be at least 1".to_string());
        }
        if self.max_total_objects < self.max_massive_bodies {
            return Err("Max total objects must be >= max massive bodies".to_string());
        }
        if self.barnes_hut_theta < 0.0 || self.barnes_hut_theta > 1.0 {
            return Err("Barnes-Hut theta must be in [0, 1]".to_string());
        }
        Ok(())
    }

    /// Get the effective timestep for a substep
    pub fn substep_dt(&self, num_substeps: u32) -> f64 {
        self.dt / num_substeps as f64
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = SimConfig::default();
        assert!(config.validate().is_ok());
    }

    #[test]
    fn test_invalid_dt() {
        let mut config = SimConfig::default();
        config.dt = -1.0;
        assert!(config.validate().is_err());
    }

    #[test]
    fn test_builder_pattern() {
        let config = SimConfig::default()
            .with_dt(0.01)
            .with_softening(1e5)
            .with_collision_mode(CollisionMode::None);

        assert_eq!(config.dt, 0.01);
        assert_eq!(config.softening, 1e5);
        assert_eq!(config.collision_mode, CollisionMode::None);
    }
}
