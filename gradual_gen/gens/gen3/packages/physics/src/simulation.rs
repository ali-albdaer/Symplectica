//! Main simulation state and API
//!
//! This module provides the high-level simulation interface that coordinates
//! all physics subsystems.

use crate::{
    body::{Body, BodyState},
    checkpoint::{Checkpoint, CheckpointManager, NetworkSnapshot},
    collision::{handle_collisions, CollisionEvent},
    config::{CollisionMode, SimConfig},
    error::{ErrorCode, PhysicsError, PhysicsResult},
    integrator::{
        center_of_mass, initialize_accelerations, integrate_tick, EnergyMonitor, MomentumMonitor,
    },
    prng::Pcg32,
    soi::calculate_soi_radii,
    vec3::Vec3,
    RECENTER_THRESHOLD,
};

/// Main simulation state
#[derive(Debug)]
pub struct Simulation {
    /// All bodies in the simulation
    bodies: Vec<Body>,

    /// Simulation configuration
    config: SimConfig,

    /// Random number generator (deterministic)
    rng: Pcg32,

    /// Current simulation tick
    tick: u64,

    /// Current simulation time in seconds
    sim_time: f64,

    /// Snapshot sequence counter
    sequence: u64,

    /// Floating origin offset
    origin_offset: Vec3,

    /// Energy monitoring
    energy_monitor: Option<EnergyMonitor>,

    /// Momentum monitoring
    momentum_monitor: Option<MomentumMonitor>,

    /// Checkpoint manager
    checkpoint_manager: CheckpointManager,

    /// Collision event log
    collision_events: Vec<CollisionEvent>,

    /// Total collision count
    collision_count: u64,

    /// Whether accelerations have been initialized
    initialized: bool,
}

impl Simulation {
    /// Create a new simulation with default configuration
    pub fn new() -> Self {
        Self::with_config(SimConfig::default())
    }

    /// Create a new simulation with custom configuration
    pub fn with_config(config: SimConfig) -> Self {
        Self {
            bodies: Vec::new(),
            config,
            rng: Pcg32::default(),
            tick: 0,
            sim_time: 0.0,
            sequence: 0,
            origin_offset: Vec3::zero(),
            energy_monitor: None,
            momentum_monitor: None,
            checkpoint_manager: CheckpointManager::new(100, 60), // Keep 100 checkpoints, every second
            collision_events: Vec::new(),
            collision_count: 0,
            initialized: false,
        }
    }

    /// Set the PRNG seed for deterministic simulation
    pub fn set_seed(&mut self, seed: u64, stream: u64) {
        self.rng = Pcg32::new(seed, stream);
    }

    /// Get a reference to the PRNG
    pub fn rng(&mut self) -> &mut Pcg32 {
        &mut self.rng
    }

    /// Get current tick
    pub fn tick(&self) -> u64 {
        self.tick
    }

    /// Get current simulation time
    pub fn sim_time(&self) -> f64 {
        self.sim_time
    }

    /// Get current sequence number
    pub fn sequence(&self) -> u64 {
        self.sequence
    }

    /// Get the configuration
    pub fn config(&self) -> &SimConfig {
        &self.config
    }

    /// Get mutable configuration
    pub fn config_mut(&mut self) -> &mut SimConfig {
        &mut self.config
    }

    /// Get origin offset
    pub fn origin_offset(&self) -> Vec3 {
        self.origin_offset
    }

    // ========== Body Management ==========

    /// Add a body to the simulation
    pub fn add_body(&mut self, body: Body) -> PhysicsResult<()> {
        // Validate body
        body.validate()?;

        // Check limits
        let massive_count = self.bodies.iter().filter(|b| b.has_mass()).count();
        if body.has_mass() && massive_count >= self.config.max_massive_bodies {
            return Err(PhysicsError::max_bodies_exceeded(
                massive_count,
                self.config.max_massive_bodies,
            ));
        }

        if self.bodies.len() >= self.config.max_total_objects {
            return Err(PhysicsError::max_bodies_exceeded(
                self.bodies.len(),
                self.config.max_total_objects,
            ));
        }

        // Check for duplicate ID
        if self.bodies.iter().any(|b| b.id == body.id) {
            return Err(PhysicsError::new(
                ErrorCode::DuplicateBodyId,
                format!("Body with ID '{}' already exists", body.id),
            ));
        }

        self.bodies.push(body);
        self.initialized = false; // Need to reinitialize accelerations

        Ok(())
    }

    /// Remove a body by ID
    pub fn remove_body(&mut self, id: &str) -> PhysicsResult<Body> {
        let idx = self
            .bodies
            .iter()
            .position(|b| b.id == id)
            .ok_or_else(|| PhysicsError::body_not_found(id))?;

        Ok(self.bodies.remove(idx))
    }

    /// Get a body by ID
    pub fn get_body(&self, id: &str) -> Option<&Body> {
        self.bodies.iter().find(|b| b.id == id)
    }

    /// Get a mutable body by ID
    pub fn get_body_mut(&mut self, id: &str) -> Option<&mut Body> {
        self.bodies.iter_mut().find(|b| b.id == id)
    }

    /// Get all bodies
    pub fn bodies(&self) -> &[Body] {
        &self.bodies
    }

    /// Get mutable access to all bodies
    pub fn bodies_mut(&mut self) -> &mut [Body] {
        &mut self.bodies
    }

    /// Get body states for network transmission
    pub fn body_states(&self) -> Vec<BodyState> {
        self.bodies.iter().map(BodyState::from).collect()
    }

    /// Get the number of active bodies
    pub fn active_body_count(&self) -> usize {
        self.bodies.iter().filter(|b| b.active).count()
    }

    /// Get the number of massive bodies
    pub fn massive_body_count(&self) -> usize {
        self.bodies.iter().filter(|b| b.active && b.has_mass()).count()
    }

    // ========== Simulation Control ==========

    /// Initialize the simulation (must be called before step)
    pub fn initialize(&mut self) {
        if self.bodies.is_empty() {
            return;
        }

        // Initialize accelerations
        initialize_accelerations(&mut self.bodies, self.config.softening);

        // Calculate SOI radii
        calculate_soi_radii(&mut self.bodies);

        // Initialize monitors
        if self.config.monitor_energy {
            self.energy_monitor = Some(EnergyMonitor::new(&self.bodies));
        }

        if self.config.monitor_momentum {
            self.momentum_monitor = Some(MomentumMonitor::new(&self.bodies));
        }

        self.initialized = true;
    }

    /// Perform one simulation step
    pub fn step(&mut self) -> PhysicsResult<StepResult> {
        if !self.initialized {
            self.initialize();
        }

        // Handle collisions from previous step
        let collision_events = if self.config.collision_mode != CollisionMode::None {
            let events = handle_collisions(&mut self.bodies, self.config.collision_mode, self.tick);
            self.collision_count += events.len() as u64;
            events
        } else {
            Vec::new()
        };

        // Integrate physics
        let substeps = integrate_tick(&mut self.bodies, &self.config);

        // Update simulation state
        self.tick += 1;
        self.sim_time += self.config.dt;
        self.sequence += 1;

        // Check for floating origin recenter
        let recentered = self.check_recenter();

        // Update SOI radii periodically (every 60 ticks = 1 second)
        if self.tick % 60 == 0 {
            calculate_soi_radii(&mut self.bodies);
        }

        // Update monitors
        if let Some(ref mut monitor) = self.energy_monitor {
            monitor.update(&self.bodies);
        }

        if let Some(ref mut monitor) = self.momentum_monitor {
            monitor.update(&self.bodies);
        }

        // Validate state
        self.validate_state()?;

        // Store checkpoint if needed
        if self.checkpoint_manager.should_checkpoint(self.tick) {
            let checkpoint = self.create_checkpoint();
            self.checkpoint_manager.store(checkpoint);
        }

        // Store collision events
        self.collision_events = collision_events.clone();

        Ok(StepResult {
            tick: self.tick,
            sim_time: self.sim_time,
            substeps,
            collision_events,
            recentered,
            energy_drift_percent: self.energy_monitor.as_ref().map(|m| m.drift_percent),
        })
    }

    /// Step multiple times
    pub fn step_n(&mut self, n: u64) -> PhysicsResult<()> {
        for _ in 0..n {
            self.step()?;
        }
        Ok(())
    }

    /// Reset the simulation
    pub fn reset(&mut self) {
        self.bodies.clear();
        self.tick = 0;
        self.sim_time = 0.0;
        self.sequence = 0;
        self.origin_offset = Vec3::zero();
        self.energy_monitor = None;
        self.momentum_monitor = None;
        self.checkpoint_manager.clear();
        self.collision_events.clear();
        self.collision_count = 0;
        self.initialized = false;
        self.rng = Pcg32::default();
    }

    // ========== Floating Origin ==========

    /// Check if recentering is needed and perform it
    fn check_recenter(&mut self) -> bool {
        // Find camera focus or use center of mass
        let focus = self.find_focus_position();

        // Check if focus exceeds threshold
        if focus.magnitude() > self.config.recenter_threshold {
            self.recenter(focus);
            return true;
        }

        false
    }

    /// Find the focus position (for now, use center of mass)
    fn find_focus_position(&self) -> Vec3 {
        center_of_mass(&self.bodies)
    }

    /// Recenter all positions around a new origin
    pub fn recenter(&mut self, new_origin: Vec3) {
        for body in &mut self.bodies {
            body.position -= new_origin;
        }
        self.origin_offset += new_origin;
    }

    /// Get world position from local position
    pub fn to_world_position(&self, local: Vec3) -> Vec3 {
        local + self.origin_offset
    }

    /// Get local position from world position
    pub fn to_local_position(&self, world: Vec3) -> Vec3 {
        world - self.origin_offset
    }

    // ========== Checkpoints ==========

    /// Create a checkpoint of current state
    pub fn create_checkpoint(&self) -> Checkpoint {
        let mut checkpoint = Checkpoint::new(
            self.tick,
            self.sim_time,
            self.sequence,
            &self.bodies,
            &self.config,
            &self.rng,
            self.origin_offset,
        );

        // Add metrics if available
        if let (Some(energy), Some(momentum)) =
            (&self.energy_monitor, &self.momentum_monitor)
        {
            checkpoint = checkpoint.with_metrics(energy, momentum, self.collision_count);
        }

        checkpoint
    }

    /// Create a network snapshot
    pub fn create_snapshot(&self) -> NetworkSnapshot {
        NetworkSnapshot::from_checkpoint(&self.create_checkpoint())
    }

    /// Restore from a checkpoint
    pub fn restore_checkpoint(&mut self, checkpoint: Checkpoint) -> PhysicsResult<()> {
        checkpoint.validate()?;

        self.bodies = checkpoint.bodies;
        self.config = checkpoint.config;
        self.tick = checkpoint.tick;
        self.sim_time = checkpoint.sim_time;
        self.sequence = checkpoint.sequence;
        self.origin_offset = Vec3::from_array(checkpoint.origin_offset);
        self.rng = checkpoint.prng_state.to_pcg();

        // Reinitialize
        self.initialized = false;
        self.initialize();

        Ok(())
    }

    /// Restore from JSON checkpoint
    pub fn restore_from_json(&mut self, json: &str) -> PhysicsResult<()> {
        let checkpoint = Checkpoint::from_json(json)?;
        self.restore_checkpoint(checkpoint)
    }

    /// Get a stored checkpoint by tick
    pub fn get_checkpoint(&self, tick: u64) -> Option<&Checkpoint> {
        self.checkpoint_manager.get(tick)
    }

    /// Get the most recent checkpoint
    pub fn latest_checkpoint(&self) -> Option<&Checkpoint> {
        self.checkpoint_manager.latest()
    }

    // ========== Validation ==========

    /// Validate current simulation state
    fn validate_state(&self) -> PhysicsResult<()> {
        for body in &self.bodies {
            if !body.active {
                continue;
            }

            // Check for NaN
            if body.position.is_nan() {
                return Err(PhysicsError::nan_detected(&format!(
                    "position of body '{}'",
                    body.id
                )));
            }

            if body.velocity.is_nan() {
                return Err(PhysicsError::nan_detected(&format!(
                    "velocity of body '{}'",
                    body.id
                )));
            }

            if body.acceleration.is_nan() {
                return Err(PhysicsError::nan_detected(&format!(
                    "acceleration of body '{}'",
                    body.id
                )));
            }

            // Check for infinity
            if body.position.is_infinite() || body.velocity.is_infinite() {
                return Err(PhysicsError::new(
                    ErrorCode::InfiniteValue,
                    format!("Infinite value in body '{}'", body.id),
                ));
            }
        }

        Ok(())
    }

    // ========== Monitoring ==========

    /// Get current energy metrics
    pub fn energy_metrics(&self) -> Option<&EnergyMonitor> {
        self.energy_monitor.as_ref()
    }

    /// Get current momentum metrics
    pub fn momentum_metrics(&self) -> Option<&MomentumMonitor> {
        self.momentum_monitor.as_ref()
    }

    /// Get recent collision events
    pub fn collision_events(&self) -> &[CollisionEvent] {
        &self.collision_events
    }

    /// Get total collision count
    pub fn collision_count(&self) -> u64 {
        self.collision_count
    }

    // ========== Utility ==========

    /// Apply state updates from network (client-side)
    pub fn apply_body_states(&mut self, states: &[BodyState]) {
        for state in states {
            if let Some(body) = self.get_body_mut(&state.id) {
                state.apply_to(body);
            }
        }
    }

    /// Load a world preset from JSON
    pub fn load_preset(&mut self, json: &str) -> PhysicsResult<()> {
        self.restore_from_json(json)
    }
}

impl Default for Simulation {
    fn default() -> Self {
        Self::new()
    }
}

/// Result of a simulation step
#[derive(Debug, Clone)]
pub struct StepResult {
    /// Current tick after step
    pub tick: u64,
    /// Current simulation time after step
    pub sim_time: f64,
    /// Number of substeps performed
    pub substeps: u32,
    /// Collision events that occurred
    pub collision_events: Vec<CollisionEvent>,
    /// Whether floating origin was recentered
    pub recentered: bool,
    /// Energy drift percentage (if monitoring enabled)
    pub energy_drift_percent: Option<f64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_earth_sun_system() -> Simulation {
        let mut sim = Simulation::new();

        let sun = Body::star("sun", "Sun", 1.989e30, 6.96e8);
        
        // Earth at 1 AU with circular velocity
        let au = 1.496e11;
        let v_circ = (crate::G * 1.989e30 / au).sqrt();
        let earth = Body::planet("earth", "Earth", 5.972e24, 6.371e6)
            .at_position(au, 0.0, 0.0)
            .with_velocity_xyz(0.0, v_circ, 0.0);

        sim.add_body(sun).unwrap();
        sim.add_body(earth).unwrap();

        sim
    }

    #[test]
    fn test_simulation_creation() {
        let sim = Simulation::new();
        assert_eq!(sim.tick(), 0);
        assert_eq!(sim.bodies().len(), 0);
    }

    #[test]
    fn test_add_body() {
        let mut sim = Simulation::new();
        
        let body = Body::new("test", "Test", 1e10, 1000.0);
        sim.add_body(body).unwrap();

        assert_eq!(sim.bodies().len(), 1);
        assert!(sim.get_body("test").is_some());
    }

    #[test]
    fn test_simulation_step() {
        let mut sim = create_earth_sun_system();

        let result = sim.step().unwrap();

        assert_eq!(result.tick, 1);
        assert!(result.sim_time > 0.0);
    }

    #[test]
    fn test_energy_conservation() {
        let mut sim = create_earth_sun_system();
        sim.config_mut().monitor_energy = true;

        // Run for 1000 steps
        for _ in 0..1000 {
            sim.step().unwrap();
        }

        let energy = sim.energy_metrics().unwrap();
        
        // Energy should be conserved within tolerance
        assert!(
            energy.drift_percent < 0.1,
            "Energy drift: {}%",
            energy.drift_percent
        );
    }

    #[test]
    fn test_checkpoint_restore() {
        let mut sim = create_earth_sun_system();

        // Run for 100 steps
        for _ in 0..100 {
            sim.step().unwrap();
        }

        // Create checkpoint
        let checkpoint = sim.create_checkpoint();
        let json = checkpoint.to_json().unwrap();

        // Run more steps
        for _ in 0..100 {
            sim.step().unwrap();
        }

        let tick_after_more = sim.tick();

        // Restore checkpoint
        sim.restore_from_json(&json).unwrap();

        assert_eq!(sim.tick(), 100);
        assert_ne!(sim.tick(), tick_after_more);
    }

    #[test]
    fn test_determinism() {
        let mut sim1 = create_earth_sun_system();
        let mut sim2 = create_earth_sun_system();

        sim1.set_seed(12345, 67890);
        sim2.set_seed(12345, 67890);

        // Run both for same number of steps
        for _ in 0..100 {
            sim1.step().unwrap();
            sim2.step().unwrap();
        }

        // Positions should be identical
        let bodies1 = sim1.bodies();
        let bodies2 = sim2.bodies();

        for i in 0..bodies1.len() {
            assert_eq!(bodies1[i].position.x, bodies2[i].position.x);
            assert_eq!(bodies1[i].position.y, bodies2[i].position.y);
            assert_eq!(bodies1[i].position.z, bodies2[i].position.z);
        }
    }
}
