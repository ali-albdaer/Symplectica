//! Main simulation engine
//!
//! Combines all physics components into a single simulation that can be
//! advanced by step, checkpointed, and serialized.

use crate::body::{Body, BodyId};
use crate::collision::process_collisions;
use crate::force::{compute_accelerations_direct, compute_total_energy};
use crate::integrator::{step_with_accel, AccelerationFn, IntegratorConfig, initialize_accelerations_with};
use crate::octree::compute_accelerations_barnes_hut;
use crate::prng::Pcg32;
use crate::snapshot::Snapshot;

/// Force calculation method
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForceMethod {
    /// Direct O(N²) calculation - most accurate
    Direct,
    /// Barnes-Hut O(N log N) approximation - faster for large N
    BarnesHut,
}

impl Default for ForceMethod {
    fn default() -> Self {
        // Use direct by default for accuracy; switch to Barnes-Hut for N > 50
        Self::Direct
    }
}

/// Simulation configuration
#[derive(Debug, Clone)]
pub struct SimulationConfig {
    /// Integrator settings
    pub integrator: IntegratorConfig,
    
    /// Force calculation method
    pub force_method: ForceMethod,
    
    /// Enable collision detection and merging
    pub enable_collisions: bool,
    
    /// Threshold for auto-switching to Barnes-Hut
    pub barnes_hut_threshold: usize,
}

impl Default for SimulationConfig {
    fn default() -> Self {
        Self {
            integrator: IntegratorConfig::default(),
            force_method: ForceMethod::Direct,
            enable_collisions: true,
            barnes_hut_threshold: 10000,
        }
    }
}

/// The main simulation state
#[derive(Debug)]
pub struct Simulation {
    /// All bodies in the simulation
    bodies: Vec<Body>,
    
    /// Configuration
    config: SimulationConfig,
    
    /// Deterministic RNG
    rng: Pcg32,
    
    /// Current simulation time in seconds
    time: f64,
    
    /// Current tick count
    tick: u64,
    
    /// Snapshot sequence number
    sequence: u64,
    
    /// Next body ID to assign
    next_id: BodyId,
    
    /// Whether accelerations need initialization
    needs_init: bool,
}

impl Simulation {
    /// Create a new simulation with the given seed.
    pub fn new(seed: u64) -> Self {
        Self {
            bodies: Vec::with_capacity(100),
            config: SimulationConfig::default(),
            rng: Pcg32::new(seed),
            time: 0.0,
            tick: 0,
            sequence: 0,
            next_id: 0,
            needs_init: true,
        }
    }

    /// Create with custom configuration
    pub fn with_config(seed: u64, config: SimulationConfig) -> Self {
        let mut sim = Self::new(seed);
        sim.config = config;
        sim
    }

    /// Add a body to the simulation
    pub fn add_body(&mut self, mut body: Body) -> BodyId {
        body.id = self.next_id;
        self.next_id += 1;
        body.compute_derived();
        let id = body.id;
        self.bodies.push(body);
        self.needs_init = true;
        id
    }

    /// Create and add a star at the origin
    pub fn add_star(&mut self, name: &str, mass: f64, radius: f64) -> BodyId {
        let body = Body::star(0, name, mass, radius);
        self.add_body(body)
    }

    /// Create and add a planet
    pub fn add_planet(
        &mut self,
        name: &str,
        mass: f64,
        radius: f64,
        orbital_distance: f64,
        orbital_velocity: f64,
    ) -> BodyId {
        let body = Body::planet(0, name, mass, radius, orbital_distance, orbital_velocity);
        self.add_body(body)
    }

    /// Create and add a moon relative to a parent body
    pub fn add_moon(
        &mut self,
        name: &str,
        mass: f64,
        radius: f64,
        parent_id: BodyId,
        orbital_distance: f64,
        orbital_velocity: f64,
    ) -> Option<BodyId> {
        let parent = self.get_body(parent_id)?;
        let parent_clone = parent.clone();
        let body = Body::moon(0, name, mass, radius, &parent_clone, orbital_distance, orbital_velocity);
        Some(self.add_body(body))
    }

    /// Get a reference to a body by ID
    pub fn get_body(&self, id: BodyId) -> Option<&Body> {
        self.bodies.iter().find(|b| b.id == id)
    }

    /// Get a mutable reference to a body by ID
    pub fn get_body_mut(&mut self, id: BodyId) -> Option<&mut Body> {
        self.bodies.iter_mut().find(|b| b.id == id)
    }

    /// Remove a body from the simulation
    pub fn remove_body(&mut self, id: BodyId) -> bool {
        if let Some(body) = self.bodies.iter_mut().find(|b| b.id == id) {
            body.is_active = false;
            true
        } else {
            false
        }
    }

    /// Get all bodies
    pub fn bodies(&self) -> &[Body] {
        &self.bodies
    }

    /// Re-derive planet/moon properties with parent star context.
    /// Call after all bodies have been added (e.g. after preset creation)
    /// so planets can compute equilibrium temperature from their parent star.
    pub fn finalize_derived(&mut self) {
        // Find the first star to use as parent for planets
        let parent_star: Option<Body> = self
            .bodies
            .iter()
            .find(|b| b.is_active && b.body_type == crate::body::BodyType::Star)
            .cloned();

        for body in &mut self.bodies {
            match body.body_type {
                crate::body::BodyType::Planet | crate::body::BodyType::Moon => {
                    body.compute_derived_with_parent(parent_star.as_ref());
                }
                _ => {}
            }
        }
    }

    /// Get active bodies
    pub fn active_bodies(&self) -> impl Iterator<Item = &Body> {
        self.bodies.iter().filter(|b| b.is_active)
    }

    /// Get current simulation time
    pub fn time(&self) -> f64 {
        self.time
    }

    /// Get current tick count
    pub fn tick(&self) -> u64 {
        self.tick
    }

    /// Advance simulation by one tick
    pub fn step(&mut self) {
        let accel_fn = self.resolve_accel_fn();

        if self.needs_init {
            initialize_accelerations_with(&mut self.bodies, &self.config.integrator.force_config, accel_fn);
            self.needs_init = false;
        }

        // Advance physics
        step_with_accel(&mut self.bodies, &self.config.integrator, accel_fn);
        
        // Handle collisions
        if self.config.enable_collisions {
            process_collisions(&mut self.bodies);
        }

        self.time += self.config.integrator.dt;
        self.tick += 1;
        self.sequence += 1;
    }

    /// Advance simulation by multiple ticks
    pub fn step_n(&mut self, n: u64) {
        for _ in 0..n {
            self.step();
        }
    }

    fn resolve_force_method(&self) -> ForceMethod {
        if self.bodies.len() > self.config.barnes_hut_threshold {
            ForceMethod::BarnesHut
        } else {
            self.config.force_method
        }
    }

    fn resolve_accel_fn(&self) -> AccelerationFn {
        match self.resolve_force_method() {
            ForceMethod::Direct => compute_accelerations_direct,
            ForceMethod::BarnesHut => compute_accelerations_barnes_hut,
        }
    }

    /// Get total energy of the system
    pub fn total_energy(&self) -> f64 {
        compute_total_energy(&self.bodies, self.config.integrator.force_config.softening)
    }

    /// Create a snapshot of current state
    pub fn snapshot(&self) -> Snapshot {
        Snapshot::new(
            self.sequence,
            self.time,
            self.tick,
            &self.rng,
            self.bodies.clone(),
            &self.config.integrator.force_config,
            &self.config.integrator,
        )
    }

    /// Restore from a snapshot
    pub fn restore(&mut self, snapshot: Snapshot) -> Result<(), &'static str> {
        snapshot.validate()?;

        self.sequence = snapshot.sequence;
        self.time = snapshot.time;
        self.tick = snapshot.tick;
        self.bodies = snapshot.bodies;
        self.rng = Pcg32::from_state(snapshot.rng_state.0, snapshot.rng_state.1);
        self.config.integrator.force_config = (&snapshot.force_config).into();
        self.needs_init = true;

        // Update next_id to avoid collisions
        self.next_id = self.bodies.iter().map(|b| b.id).max().unwrap_or(0) + 1;

        Ok(())
    }

    /// Export to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        self.snapshot().to_json()
    }

    /// Import from JSON
    pub fn from_json(json: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let snapshot = Snapshot::from_json(json)?;
        let mut sim = Self::new(snapshot.rng_state.0);
        sim.restore(snapshot)?;
        Ok(sim)
    }

    /// Get positions as a flat array [x0, y0, z0, x1, y1, z1, ...]
    pub fn positions_flat(&self) -> Vec<f64> {
        let mut result = Vec::with_capacity(self.bodies.len() * 3);
        for body in &self.bodies {
            if body.is_active {
                result.push(body.position.x);
                result.push(body.position.y);
                result.push(body.position.z);
            }
        }
        result
    }

    /// Get velocities as a flat array
    pub fn velocities_flat(&self) -> Vec<f64> {
        let mut result = Vec::with_capacity(self.bodies.len() * 3);
        for body in &self.bodies {
            if body.is_active {
                result.push(body.velocity.x);
                result.push(body.velocity.y);
                result.push(body.velocity.z);
            }
        }
        result
    }

    /// Set configuration
    pub fn set_config(&mut self, config: SimulationConfig) {
        self.config = config;
        self.needs_init = true;
    }

    /// Get configuration
    pub fn config(&self) -> &SimulationConfig {
        &self.config
    }

    /// Set timestep
    pub fn set_dt(&mut self, dt: f64) {
        self.config.integrator.dt = dt;
    }

    /// Set substeps
    pub fn set_substeps(&mut self, substeps: u32) {
        self.config.integrator.substeps = substeps;
    }

    /// Set Barnes-Hut theta
    pub fn set_theta(&mut self, theta: f64) {
        self.config.integrator.force_config.barnes_hut_theta = theta;
    }

    /// Set force method
    pub fn set_force_method(&mut self, method: ForceMethod) {
        self.config.force_method = method;
        self.needs_init = true;
    }

    /// Get a random number from the deterministic RNG
    pub fn random(&mut self) -> f64 {
        self.rng.next_f64()
    }

    /// Get PRNG state for serialization
    pub fn rng_state(&self) -> (u64, u64) {
        self.rng.state()
    }

    /// Number of active bodies
    pub fn body_count(&self) -> usize {
        self.bodies.iter().filter(|b| b.is_active).count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::constants::*;

    fn create_earth_sun_system() -> Simulation {
        let mut sim = Simulation::new(42);
        
        sim.add_star("Sun", M_SUN, R_SUN);
        sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
        
        sim
    }

    #[test]
    fn test_basic_simulation() {
        let mut sim = create_earth_sun_system();
        
        assert_eq!(sim.body_count(), 2);
        
        // Run for 100 steps
        for _ in 0..100 {
            sim.step();
        }
        
        assert!(sim.tick() == 100);
        assert!(sim.time() > 0.0);
    }

    #[test]
    fn test_snapshot_restore() {
        let mut sim = create_earth_sun_system();
        
        // Run for a while
        sim.step_n(100);
        let snapshot = sim.snapshot();
        let json = snapshot.to_json().expect("Serialization failed");
        
        // Run more
        let _energy_before = sim.total_energy();
        sim.step_n(100);
        
        // Restore
        let restored_snapshot = Snapshot::from_json(&json).expect("Deserialization failed");
        sim.restore(restored_snapshot).expect("Restore failed");
        
        assert_eq!(sim.tick(), 100);
    }

    #[test]
    fn test_determinism() {
        // Two simulations with same seed should produce identical results
        let mut sim1 = create_earth_sun_system();
        let mut sim2 = create_earth_sun_system();
        
        for _ in 0..1000 {
            sim1.step();
            sim2.step();
        }
        
        // Positions should be identical
        let pos1 = sim1.bodies()[1].position;
        let pos2 = sim2.bodies()[1].position;
        
        assert!((pos1 - pos2).length() < 1e-10, "Simulations diverged!");
    }

    #[test]
    fn test_add_moon() {
        let mut sim = create_earth_sun_system();
        
        let earth_id = 1; // Second body added
        let moon_id = sim.add_moon("Moon", M_MOON, R_MOON, earth_id, 3.844e8, 1022.0);
        
        assert!(moon_id.is_some());
        assert_eq!(sim.body_count(), 3);
    }
}
