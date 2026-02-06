///! Checkpointing and replay system for deterministic simulation.
///! Supports periodic snapshots + input log for exact replay.

use crate::state::SimulationState;
use crate::prng::DeterministicRng;
use serde::{Deserialize, Serialize};

/// Schema version for checkpoint format
pub const CHECKPOINT_VERSION: u32 = 1;

/// A timestamped player input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputEvent {
    pub tick: u64,
    pub player_id: u32,
    pub action: InputAction,
}

/// Possible player actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InputAction {
    /// Spawn a body with given parameters
    SpawnBody {
        name: String,
        mass: f64,
        radius: f64,
        position: [f64; 3],
        velocity: [f64; 3],
    },
    /// Delete a body
    DeleteBody { body_id: u64 },
    /// Apply thrust to a body
    ApplyThrust {
        body_id: u64,
        force: [f64; 3],
        duration: f64,
    },
    /// Change simulation parameters
    SetConfig { key: String, value: String },
    /// Pause/unpause
    SetPaused { paused: bool },
    /// Set time scale
    SetTimeScale { scale: f64 },
}

/// A checkpoint = snapshot + metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
    pub version: u32,
    pub tick: u64,
    pub time: f64,
    pub state: SimulationState,
    pub rng_state: [u64; 4],
    pub checksum: u64,
}

impl Checkpoint {
    /// Create a checkpoint from current simulation state
    pub fn create(state: &SimulationState, rng: &DeterministicRng) -> Self {
        let checksum = Self::compute_checksum(state);
        Self {
            version: CHECKPOINT_VERSION,
            tick: state.config.tick,
            time: state.config.time.value(),
            state: state.clone(),
            rng_state: rng.get_state(),
            checksum,
        }
    }

    /// Compute a simple checksum for validation
    fn compute_checksum(state: &SimulationState) -> u64 {
        let mut hash: u64 = 0xcbf29ce484222325; // FNV offset basis
        let prime: u64 = 0x100000001b3;

        // Hash body positions and velocities
        for body in &state.bodies {
            for v in [body.position.x, body.position.y, body.position.z,
                      body.velocity.x, body.velocity.y, body.velocity.z,
                      body.mass.value()] {
                let bits = v.to_bits();
                hash ^= bits;
                hash = hash.wrapping_mul(prime);
            }
        }

        hash ^= state.config.tick;
        hash = hash.wrapping_mul(prime);

        hash
    }

    /// Validate checkpoint integrity
    pub fn validate(&self) -> bool {
        self.version == CHECKPOINT_VERSION
            && self.checksum == Self::compute_checksum(&self.state)
    }

    /// Serialize to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        let mut cp: Self = serde_json::from_str(json)?;
        cp.state.rebuild_id_map();
        Ok(cp)
    }
}

/// Input recording for deterministic replay
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputLog {
    pub start_tick: u64,
    pub events: Vec<InputEvent>,
}

impl InputLog {
    pub fn new(start_tick: u64) -> Self {
        Self {
            start_tick,
            events: Vec::new(),
        }
    }

    /// Record an input event
    pub fn record(&mut self, event: InputEvent) {
        self.events.push(event);
    }

    /// Get all events for a given tick
    pub fn events_at_tick(&self, tick: u64) -> Vec<&InputEvent> {
        self.events.iter().filter(|e| e.tick == tick).collect()
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

/// Replay engine: replays inputs from a checkpoint to reproduce exact simulation state
pub struct ReplayEngine {
    pub state: SimulationState,
    pub rng: DeterministicRng,
    pub input_log: InputLog,
    pub current_tick: u64,
    pub target_tick: u64,
}

impl ReplayEngine {
    /// Initialize replay from checkpoint + input log
    pub fn new(checkpoint: Checkpoint, input_log: InputLog, target_tick: u64) -> Self {
        Self {
            state: checkpoint.state,
            rng: DeterministicRng::from_state(checkpoint.rng_state),
            input_log,
            current_tick: checkpoint.tick,
            target_tick,
        }
    }

    /// Advance one tick, applying inputs and stepping physics
    pub fn step(&mut self, solver: &dyn crate::solvers::GravitySolver) -> bool {
        if self.current_tick >= self.target_tick {
            return false;
        }

        // Apply inputs for this tick
        let events: Vec<InputEvent> = self.input_log
            .events_at_tick(self.current_tick)
            .iter()
            .map(|e| (*e).clone())
            .collect();

        for event in events {
            self.apply_input(event);
        }

        // Step physics
        let dt = self.state.config.dt;
        let integrator = crate::integrators::create_integrator(
            self.state.config.integrator_type,
            self.state.config.adaptive_tolerance,
        );
        integrator.step(&mut self.state, solver, dt);

        self.state.config.time += dt;
        self.state.config.tick += 1;
        self.current_tick += 1;

        true
    }

    /// Apply a single input event
    fn apply_input(&mut self, event: InputEvent) {
        match event.action {
            InputAction::SpawnBody { name, mass, radius, position, velocity: vel } => {
                use crate::body::{Body, BodyType};
                use crate::units::{Kilogram, Meter};
                use crate::vector::Vec3;
                let id = self.state.next_body_id();
                let body = Body::new(id, &name, BodyType::Asteroid)
                    .with_mass(Kilogram::new(mass))
                    .with_radius(Meter::new(radius))
                    .with_position(Vec3::new(position[0], position[1], position[2]))
                    .with_velocity(Vec3::new(vel[0], vel[1], vel[2]));
                self.state.add_body(body);
            }
            InputAction::DeleteBody { body_id } => {
                self.state.remove_body(body_id);
            }
            InputAction::ApplyThrust { body_id, force, duration: _ } => {
                if let Some(body) = self.state.get_body_mut(body_id) {
                    if body.mass.value() > 0.0 {
                        let acc = crate::vector::Vec3::new(
                            force[0] / body.mass.value(),
                            force[1] / body.mass.value(),
                            force[2] / body.mass.value(),
                        );
                        body.acceleration += acc;
                    }
                }
            }
            InputAction::SetPaused { paused } => {
                self.state.config.paused = paused;
            }
            InputAction::SetTimeScale { scale } => {
                self.state.config.time_scale = scale;
            }
            InputAction::SetConfig { key, value } => {
                match key.as_str() {
                    "solver" => {
                        if let Ok(st) = serde_json::from_str(&format!("\"{}\"", value)) {
                            self.state.config.solver_type = st;
                        }
                    }
                    "integrator" => {
                        if let Ok(it) = serde_json::from_str(&format!("\"{}\"", value)) {
                            self.state.config.integrator_type = it;
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    /// Get progress as fraction [0,1]
    pub fn progress(&self) -> f64 {
        if self.target_tick == 0 { return 1.0; }
        self.current_tick as f64 / self.target_tick as f64
    }
}

/// Checkpoint manager: handles periodic checkpointing
pub struct CheckpointManager {
    pub interval: u64,             // ticks between checkpoints
    pub max_checkpoints: usize,    // maximum stored checkpoints
    pub checkpoints: Vec<Checkpoint>,
    pub input_log: InputLog,
}

impl CheckpointManager {
    pub fn new(interval: u64, max_checkpoints: usize) -> Self {
        Self {
            interval,
            max_checkpoints,
            checkpoints: Vec::new(),
            input_log: InputLog::new(0),
        }
    }

    /// Record an input event
    pub fn record_input(&mut self, event: InputEvent) {
        self.input_log.record(event);
    }

    /// Check if a checkpoint should be taken, and if so, create it
    pub fn maybe_checkpoint(
        &mut self,
        state: &SimulationState,
        rng: &DeterministicRng,
    ) -> Option<&Checkpoint> {
        if state.config.tick > 0 && state.config.tick % self.interval == 0 {
            let cp = Checkpoint::create(state, rng);
            self.checkpoints.push(cp);

            // Trim old checkpoints
            while self.checkpoints.len() > self.max_checkpoints {
                self.checkpoints.remove(0);
            }

            self.checkpoints.last()
        } else {
            None
        }
    }

    /// Get the most recent checkpoint before a given tick
    pub fn checkpoint_before(&self, tick: u64) -> Option<&Checkpoint> {
        self.checkpoints.iter()
            .rev()
            .find(|cp| cp.tick <= tick)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::SimulationState;
    use crate::prng::DeterministicRng;

    #[test]
    fn test_checkpoint_roundtrip() {
        let state = SimulationState::new();
        let rng = DeterministicRng::new(42);
        let cp = Checkpoint::create(&state, &rng);

        assert!(cp.validate());

        let json = cp.to_json().unwrap();
        let restored = Checkpoint::from_json(&json).unwrap();
        assert!(restored.validate());
        assert_eq!(cp.checksum, restored.checksum);
    }

    #[test]
    fn test_input_log() {
        let mut log = InputLog::new(0);
        log.record(InputEvent {
            tick: 5,
            player_id: 1,
            action: InputAction::SetPaused { paused: true },
        });
        log.record(InputEvent {
            tick: 10,
            player_id: 1,
            action: InputAction::SetTimeScale { scale: 2.0 },
        });

        assert_eq!(log.events_at_tick(5).len(), 1);
        assert_eq!(log.events_at_tick(10).len(), 1);
        assert_eq!(log.events_at_tick(7).len(), 0);
    }
}
