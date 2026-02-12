//! Snapshot serialization for state persistence and network sync
//!
//! Provides versioned JSON serialization of simulation state with
//! support for checkpointing and network synchronization.

use crate::body::Body;
use crate::force::ForceConfig;
use crate::integrator::IntegratorConfig;
use crate::prng::Pcg32;
use serde::{Deserialize, Serialize};

/// Current snapshot format version
pub const SNAPSHOT_VERSION: u32 = 1;

/// Simulation snapshot for serialization
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Snapshot {
    /// Format version for backward compatibility
    pub version: u32,
    
    /// Snapshot sequence number (for network sync)
    pub sequence: u64,
    
    /// Simulation time in seconds
    pub time: f64,
    
    /// Simulation tick count
    pub tick: u64,
    
    /// PRNG state for determinism
    pub rng_state: (u64, u64),
    
    /// All bodies in the simulation
    pub bodies: Vec<Body>,
    
    /// Force calculation configuration
    pub force_config: SerializableForceConfig,
    
    /// Integrator configuration  
    pub integrator_config: SerializableIntegratorConfig,
    
    /// Optional metadata
    pub metadata: Option<SnapshotMetadata>,
}

/// Serializable force configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializableForceConfig {
    pub softening: f64,
    pub barnes_hut_theta: f64,
}

impl From<&ForceConfig> for SerializableForceConfig {
    fn from(config: &ForceConfig) -> Self {
        Self {
            softening: config.softening,
            barnes_hut_theta: config.barnes_hut_theta,
        }
    }
}

impl From<&SerializableForceConfig> for ForceConfig {
    fn from(config: &SerializableForceConfig) -> Self {
        Self {
            softening: config.softening,
            barnes_hut_theta: config.barnes_hut_theta,
        }
    }
}

/// Serializable integrator configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerializableIntegratorConfig {
    pub dt: f64,
    pub substeps: u32,
    pub method: String,
}

impl From<&IntegratorConfig> for SerializableIntegratorConfig {
    fn from(config: &IntegratorConfig) -> Self {
        Self {
            dt: config.dt,
            substeps: config.substeps,
            method: format!("{:?}", config.method),
        }
    }
}

/// Optional metadata about the snapshot
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SnapshotMetadata {
    /// Human-readable name
    pub name: Option<String>,
    
    /// Description
    pub description: Option<String>,
    
    /// Creation timestamp (Unix milliseconds)
    pub created_at: Option<u64>,
    
    /// Creator/author
    pub author: Option<String>,
    
    /// Original preset name if from a preset
    pub preset: Option<String>,
}

impl Snapshot {
    /// Create a new snapshot from simulation state
    pub fn new(
        sequence: u64,
        time: f64,
        tick: u64,
        rng: &Pcg32,
        bodies: Vec<Body>,
        force_config: &ForceConfig,
        integrator_config: &IntegratorConfig,
    ) -> Self {
        Self {
            version: SNAPSHOT_VERSION,
            sequence,
            time,
            tick,
            rng_state: rng.state(),
            bodies,
            force_config: force_config.into(),
            integrator_config: integrator_config.into(),
            metadata: None,
        }
    }

    /// Serialize to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Serialize to pretty JSON string
    pub fn to_json_pretty(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Deserialize from JSON string
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    /// Add metadata to the snapshot
    pub fn with_metadata(mut self, metadata: SnapshotMetadata) -> Self {
        self.metadata = Some(metadata);
        self
    }

    /// Validate snapshot integrity
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.version != SNAPSHOT_VERSION {
            return Err("Incompatible snapshot version");
        }

        // Check all bodies are valid
        for body in &self.bodies {
            if !body.is_valid() {
                return Err("Invalid body in snapshot");
            }
        }

        // Check for duplicate IDs
        let mut ids: Vec<_> = self.bodies.iter().map(|b| b.id).collect();
        ids.sort_unstable();
        let len_before = ids.len();
        ids.dedup();
        if ids.len() != len_before {
            return Err("Duplicate body IDs in snapshot");
        }

        Ok(())
    }

    /// Get the number of active bodies
    pub fn active_body_count(&self) -> usize {
        self.bodies.iter().filter(|b| b.is_active).count()
    }

    /// Get the number of massive (gravitating) bodies
    pub fn massive_body_count(&self) -> usize {
        self.bodies.iter().filter(|b| b.is_active && b.contributes_gravity).count()
    }
}

/// Delta snapshot for efficient network updates
/// Only contains changed or added bodies since last sync
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeltaSnapshot {
    /// Base sequence this delta applies to
    pub base_sequence: u64,
    
    /// New sequence after applying delta
    pub sequence: u64,
    
    /// Current simulation time
    pub time: f64,
    
    /// Bodies that changed (subset of full state)
    pub changed_bodies: Vec<Body>,
    
    /// IDs of bodies that were removed/deactivated
    pub removed_body_ids: Vec<u32>,
}

impl DeltaSnapshot {
    /// Create a delta between two snapshots
    pub fn from_diff(old: &Snapshot, new: &Snapshot) -> Self {
        let mut changed_bodies = Vec::new();
        let mut removed_body_ids = Vec::new();

        // Find changed/new bodies
        for new_body in &new.bodies {
            let old_body = old.bodies.iter().find(|b| b.id == new_body.id);
            
            match old_body {
                Some(old) if body_changed(old, new_body) => {
                    changed_bodies.push(new_body.clone());
                }
                None => {
                    // New body
                    changed_bodies.push(new_body.clone());
                }
                _ => {} // Unchanged
            }
        }

        // Find removed bodies
        for old_body in &old.bodies {
            if old_body.is_active {
                let still_exists = new.bodies.iter()
                    .any(|b| b.id == old_body.id && b.is_active);
                if !still_exists {
                    removed_body_ids.push(old_body.id);
                }
            }
        }

        Self {
            base_sequence: old.sequence,
            sequence: new.sequence,
            time: new.time,
            changed_bodies,
            removed_body_ids,
        }
    }

    /// Serialize to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

/// Check if two bodies have changed significantly
fn body_changed(old: &Body, new: &Body) -> bool {
    // Position threshold: 1 meter
    const POS_THRESHOLD: f64 = 1.0;
    // Velocity threshold: 0.01 m/s
    const VEL_THRESHOLD: f64 = 0.01;

    old.is_active != new.is_active
        || (old.position - new.position).length() > POS_THRESHOLD
        || (old.velocity - new.velocity).length() > VEL_THRESHOLD
        || (old.mass - new.mass).abs() > 1.0
        || (old.radius - new.radius).abs() > 0.1
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::constants::*;
    use crate::vector::Vec3;

    fn create_test_snapshot() -> Snapshot {
        let rng = Pcg32::new(42);
        let bodies = vec![
            Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO),
            Body::new(
                1, "Earth", BodyType::Planet, M_EARTH, R_EARTH,
                Vec3::new(AU, 0.0, 0.0),
                Vec3::new(0.0, 29784.0, 0.0),
            ),
        ];

        Snapshot::new(
            1,
            0.0,
            0,
            &rng,
            bodies,
            &ForceConfig::default(),
            &IntegratorConfig::default(),
        )
    }

    #[test]
    fn test_serialize_deserialize() {
        let snapshot = create_test_snapshot();
        
        let json = snapshot.to_json().expect("Serialization failed");
        let restored = Snapshot::from_json(&json).expect("Deserialization failed");

        assert_eq!(snapshot.version, restored.version);
        assert_eq!(snapshot.sequence, restored.sequence);
        assert_eq!(snapshot.bodies.len(), restored.bodies.len());
        assert_eq!(snapshot.bodies[0].name, restored.bodies[0].name);
    }

    #[test]
    fn test_validate() {
        let snapshot = create_test_snapshot();
        assert!(snapshot.validate().is_ok());
    }

    #[test]
    fn test_delta_snapshot() {
        let mut old = create_test_snapshot();
        let mut new = old.clone();
        
        // Modify Earth's position
        new.sequence = 2;
        new.bodies[1].position = Vec3::new(AU + 1000.0, 0.0, 0.0);

        let delta = DeltaSnapshot::from_diff(&old, &new);

        assert_eq!(delta.base_sequence, 1);
        assert_eq!(delta.sequence, 2);
        assert_eq!(delta.changed_bodies.len(), 1);
        assert_eq!(delta.changed_bodies[0].id, 1); // Earth changed
        assert!(delta.removed_body_ids.is_empty());
    }

    #[test]
    fn test_pretty_json() {
        let snapshot = create_test_snapshot();
        let json = snapshot.to_json_pretty().expect("Serialization failed");
        
        // Should contain formatted output
        assert!(json.contains('\n'));
    }
}
