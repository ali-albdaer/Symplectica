//! Checkpoint system for saving and restoring simulation state
//!
//! Checkpoints allow:
//! - Saving complete simulation state to JSON
//! - Restoring from checkpoint for deterministic replay
//! - Snapshot versioning for compatibility

use serde::{Deserialize, Serialize};

use crate::{
    body::{Body, BodyState},
    config::SimConfig,
    error::{ErrorCode, PhysicsError, PhysicsResult},
    integrator::{EnergyMonitor, MomentumMonitor},
    prng::Pcg32,
    vec3::Vec3,
};

/// Checkpoint format version
pub const CHECKPOINT_VERSION: &str = "1.0.0";

/// PRNG state for serialization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrngState {
    pub state: u64,
    pub inc: u64,
}

impl From<&Pcg32> for PrngState {
    fn from(rng: &Pcg32) -> Self {
        let (state, inc) = rng.get_state();
        Self { state, inc }
    }
}

impl PrngState {
    pub fn to_pcg(&self) -> Pcg32 {
        Pcg32::from_state(self.state, self.inc)
    }
}

/// Simulation metrics at checkpoint time
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckpointMetrics {
    /// Total kinetic energy (J)
    pub kinetic_energy: f64,
    /// Total potential energy (J)
    pub potential_energy: f64,
    /// Total energy (J)
    pub total_energy: f64,
    /// Energy drift from start (%)
    pub energy_drift_percent: f64,
    /// Total momentum magnitude (kg·m/s)
    pub total_momentum: f64,
    /// Center of mass position (m)
    pub center_of_mass: [f64; 3],
    /// Number of active bodies
    pub active_body_count: usize,
    /// Number of collisions since start
    pub collision_count: u64,
}

/// Full simulation checkpoint
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    /// Format version for compatibility
    pub version: String,

    /// Unix timestamp when checkpoint was created (ms)
    pub timestamp: u64,

    /// Snapshot sequence number (monotonically increasing)
    pub sequence: u64,

    /// Simulation tick number
    pub tick: u64,

    /// Simulation time in seconds
    pub sim_time: f64,

    /// PRNG state for deterministic replay
    pub prng_state: PrngState,

    /// All bodies in the simulation
    pub bodies: Vec<Body>,

    /// Simulation configuration
    pub config: SimConfig,

    /// Origin offset for floating origin system
    pub origin_offset: [f64; 3],

    /// Current metrics
    pub metrics: Option<CheckpointMetrics>,

    /// Custom metadata (world name, description, etc.)
    pub metadata: Option<serde_json::Value>,
}

impl Checkpoint {
    /// Create a new checkpoint from current simulation state
    pub fn new(
        tick: u64,
        sim_time: f64,
        sequence: u64,
        bodies: &[Body],
        config: &SimConfig,
        rng: &Pcg32,
        origin_offset: Vec3,
    ) -> Self {
        Self {
            version: CHECKPOINT_VERSION.to_string(),
            timestamp: current_timestamp_ms(),
            sequence,
            tick,
            sim_time,
            prng_state: PrngState::from(rng),
            bodies: bodies.to_vec(),
            config: config.clone(),
            origin_offset: origin_offset.to_array(),
            metrics: None,
            metadata: None,
        }
    }

    /// Add metrics to the checkpoint
    pub fn with_metrics(
        mut self,
        energy_monitor: &EnergyMonitor,
        momentum_monitor: &MomentumMonitor,
        collision_count: u64,
    ) -> Self {
        let active_count = self.bodies.iter().filter(|b| b.active).count();

        self.metrics = Some(CheckpointMetrics {
            kinetic_energy: energy_monitor.kinetic,
            potential_energy: energy_monitor.potential,
            total_energy: energy_monitor.current_energy,
            energy_drift_percent: energy_monitor.drift_percent,
            total_momentum: momentum_monitor.current_momentum.magnitude(),
            center_of_mass: crate::integrator::center_of_mass(&self.bodies).to_array(),
            active_body_count: active_count,
            collision_count,
        });

        self
    }

    /// Add custom metadata
    pub fn with_metadata(mut self, metadata: serde_json::Value) -> Self {
        self.metadata = Some(metadata);
        self
    }

    /// Serialize to JSON string
    pub fn to_json(&self) -> PhysicsResult<String> {
        serde_json::to_string_pretty(self).map_err(|e| {
            PhysicsError::new(
                ErrorCode::SerializationError,
                format!("Failed to serialize checkpoint: {}", e),
            )
        })
    }

    /// Deserialize from JSON string
    pub fn from_json(json: &str) -> PhysicsResult<Self> {
        let checkpoint: Self = serde_json::from_str(json).map_err(|e| {
            PhysicsError::new(
                ErrorCode::DeserializationError,
                format!("Failed to deserialize checkpoint: {}", e),
            )
        })?;

        // Validate version
        if !checkpoint.version.starts_with("1.") {
            return Err(PhysicsError::new(
                ErrorCode::DeserializationError,
                format!(
                    "Unsupported checkpoint version: {} (expected 1.x)",
                    checkpoint.version
                ),
            ));
        }

        Ok(checkpoint)
    }

    /// Validate checkpoint integrity
    pub fn validate(&self) -> PhysicsResult<()> {
        // Check version
        if self.version.is_empty() {
            return Err(PhysicsError::new(
                ErrorCode::CheckpointCorrupted,
                "Missing version",
            ));
        }

        // Check bodies
        for body in &self.bodies {
            body.validate()?;
        }

        // Validate config
        self.config
            .validate()
            .map_err(|e| PhysicsError::new(ErrorCode::InvalidConfig, e))?;

        Ok(())
    }

    /// Get compact body states for network transmission
    pub fn body_states(&self) -> Vec<BodyState> {
        self.bodies.iter().map(BodyState::from).collect()
    }
}

/// Compact snapshot for network transmission
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkSnapshot {
    /// Sequence number
    pub seq: u64,
    /// Simulation tick
    pub tick: u64,
    /// Simulation time
    pub time: f64,
    /// Server timestamp
    pub timestamp: u64,
    /// Compact body states
    pub bodies: Vec<BodyState>,
    /// Origin offset
    pub origin: [f64; 3],
}

impl NetworkSnapshot {
    /// Create from a full checkpoint
    pub fn from_checkpoint(checkpoint: &Checkpoint) -> Self {
        Self {
            seq: checkpoint.sequence,
            tick: checkpoint.tick,
            time: checkpoint.sim_time,
            timestamp: checkpoint.timestamp,
            bodies: checkpoint.body_states(),
            origin: checkpoint.origin_offset,
        }
    }

    /// Serialize to JSON
    pub fn to_json(&self) -> PhysicsResult<String> {
        serde_json::to_string(self).map_err(|e| {
            PhysicsError::new(
                ErrorCode::SerializationError,
                format!("Failed to serialize snapshot: {}", e),
            )
        })
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> PhysicsResult<Self> {
        serde_json::from_str(json).map_err(|e| {
            PhysicsError::new(
                ErrorCode::DeserializationError,
                format!("Failed to deserialize snapshot: {}", e),
            )
        })
    }
}

/// Checkpoint manager for handling multiple checkpoints
#[derive(Debug, Default)]
pub struct CheckpointManager {
    /// Stored checkpoints (tick -> checkpoint)
    checkpoints: std::collections::BTreeMap<u64, Checkpoint>,
    /// Maximum number of checkpoints to retain
    max_checkpoints: usize,
    /// Checkpoint interval (in ticks)
    checkpoint_interval: u64,
}

impl CheckpointManager {
    /// Create a new checkpoint manager
    pub fn new(max_checkpoints: usize, checkpoint_interval: u64) -> Self {
        Self {
            checkpoints: std::collections::BTreeMap::new(),
            max_checkpoints,
            checkpoint_interval,
        }
    }

    /// Store a checkpoint
    pub fn store(&mut self, checkpoint: Checkpoint) {
        let tick = checkpoint.tick;
        self.checkpoints.insert(tick, checkpoint);

        // Remove oldest checkpoints if over limit
        while self.checkpoints.len() > self.max_checkpoints {
            if let Some(oldest_tick) = self.checkpoints.keys().next().copied() {
                self.checkpoints.remove(&oldest_tick);
            }
        }
    }

    /// Get a checkpoint by tick
    pub fn get(&self, tick: u64) -> Option<&Checkpoint> {
        self.checkpoints.get(&tick)
    }

    /// Get the most recent checkpoint
    pub fn latest(&self) -> Option<&Checkpoint> {
        self.checkpoints.values().last()
    }

    /// Get the most recent checkpoint before a given tick
    pub fn before(&self, tick: u64) -> Option<&Checkpoint> {
        self.checkpoints
            .range(..tick)
            .last()
            .map(|(_, cp)| cp)
    }

    /// Check if a checkpoint should be created at this tick
    pub fn should_checkpoint(&self, tick: u64) -> bool {
        tick % self.checkpoint_interval == 0
    }

    /// Clear all checkpoints
    pub fn clear(&mut self) {
        self.checkpoints.clear();
    }

    /// Get number of stored checkpoints
    pub fn len(&self) -> usize {
        self.checkpoints.len()
    }

    /// Check if empty
    pub fn is_empty(&self) -> bool {
        self.checkpoints.is_empty()
    }

    /// List all checkpoint ticks
    pub fn ticks(&self) -> Vec<u64> {
        self.checkpoints.keys().copied().collect()
    }
}

/// Get current timestamp in milliseconds
fn current_timestamp_ms() -> u64 {
    #[cfg(target_arch = "wasm32")]
    {
        js_sys::Date::now() as u64
    }

    #[cfg(not(target_arch = "wasm32"))]
    {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as u64)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_checkpoint_serialization() {
        let bodies = vec![
            Body::star("sun", "Sun", 1.989e30, 6.96e8),
            Body::planet("earth", "Earth", 5.972e24, 6.371e6)
                .at_position(1.496e11, 0.0, 0.0),
        ];

        let config = SimConfig::default();
        let rng = Pcg32::new(12345, 67890);

        let checkpoint = Checkpoint::new(100, 1.6667, 1, &bodies, &config, &rng, Vec3::zero());

        // Serialize
        let json = checkpoint.to_json().unwrap();
        assert!(json.contains("\"version\""));
        assert!(json.contains("\"sun\""));
        assert!(json.contains("\"earth\""));

        // Deserialize
        let restored = Checkpoint::from_json(&json).unwrap();
        assert_eq!(restored.tick, 100);
        assert_eq!(restored.bodies.len(), 2);
        assert_eq!(restored.bodies[0].id, "sun");
    }

    #[test]
    fn test_prng_state_restoration() {
        let mut rng = Pcg32::new(12345, 67890);

        // Generate some values
        let val1 = rng.next_u32();
        let val2 = rng.next_u32();

        // Save state
        let state = PrngState::from(&rng);

        // Generate more values
        let val3 = rng.next_u32();
        let val4 = rng.next_u32();

        // Restore state
        let mut restored = state.to_pcg();

        // Should produce same values as after the save point
        assert_eq!(restored.next_u32(), val3);
        assert_eq!(restored.next_u32(), val4);
    }

    #[test]
    fn test_checkpoint_manager() {
        let mut manager = CheckpointManager::new(5, 10);

        let config = SimConfig::default();
        let rng = Pcg32::default();

        // Add 10 checkpoints
        for i in 0..10 {
            let tick = i * 10;
            let checkpoint = Checkpoint::new(
                tick,
                tick as f64 / 60.0,
                i as u64,
                &[],
                &config,
                &rng,
                Vec3::zero(),
            );
            manager.store(checkpoint);
        }

        // Should only have 5 (max)
        assert_eq!(manager.len(), 5);

        // Should have the latest ones
        assert!(manager.get(50).is_some());
        assert!(manager.get(90).is_some());
        assert!(manager.get(0).is_none()); // Old one removed
    }

    #[test]
    fn test_network_snapshot() {
        let bodies = vec![
            Body::star("sun", "Sun", 1.989e30, 6.96e8),
        ];

        let config = SimConfig::default();
        let rng = Pcg32::default();
        let checkpoint = Checkpoint::new(100, 1.6667, 1, &bodies, &config, &rng, Vec3::zero());

        let snapshot = NetworkSnapshot::from_checkpoint(&checkpoint);

        let json = snapshot.to_json().unwrap();
        let restored = NetworkSnapshot::from_json(&json).unwrap();

        assert_eq!(restored.tick, 100);
        assert_eq!(restored.bodies.len(), 1);
    }
}
