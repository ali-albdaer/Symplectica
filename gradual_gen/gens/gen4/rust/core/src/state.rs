///! Simulation state: contains all bodies and global simulation parameters.
///! This is the authoritative state that gets checkpointed and replicated.

use crate::body::{Body, BodyId};
use crate::units::*;
use crate::vector::Vec3;
use crate::conserved::ConservedQuantities;
use crate::solvers::SolverType;
use crate::integrators::IntegratorType;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Global simulation configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimConfig {
    /// Default timestep in seconds
    pub dt: Second,
    /// Current simulation time
    pub time: Second,
    /// Global tick counter (monotonic)
    pub tick: u64,
    /// Active gravitational solver
    pub solver_type: SolverType,
    /// Active integrator
    pub integrator_type: IntegratorType,
    /// Barnes-Hut opening angle (theta)
    pub bh_theta: f64,
    /// FMM expansion order
    pub fmm_order: u32,
    /// Gravitational softening length (meters)
    pub softening_length: f64,
    /// Enable/disable environment modules
    pub enable_atmosphere: bool,
    pub enable_drag: bool,
    pub enable_radiation_pressure: bool,
    pub enable_tidal_forces: bool,
    pub enable_spherical_harmonics: bool,
    /// Adaptive integrator tolerance
    pub adaptive_tolerance: f64,
    /// Maximum substeps per tick
    pub max_substeps: u32,
    /// Conservation violation threshold for warnings
    pub conservation_warn_threshold: f64,
    /// Conservation violation threshold for corrective action
    pub conservation_error_threshold: f64,
    /// Time acceleration factor
    pub time_scale: f64,
    /// Whether simulation is paused
    pub paused: bool,
    /// PRNG seed
    pub seed: u64,
}

impl Default for SimConfig {
    fn default() -> Self {
        Self {
            dt: Second::new(60.0),          // 1 minute default timestep
            time: Second::new(0.0),
            tick: 0,
            solver_type: SolverType::Direct,
            integrator_type: IntegratorType::VelocityVerlet,
            bh_theta: 0.5,
            fmm_order: 6,
            softening_length: 1e3,          // 1 km softening
            enable_atmosphere: true,
            enable_drag: true,
            enable_radiation_pressure: true,
            enable_tidal_forces: true,
            enable_spherical_harmonics: true,
            adaptive_tolerance: 1e-12,
            max_substeps: 64,
            conservation_warn_threshold: 1e-6,
            conservation_error_threshold: 1e-3,
            time_scale: 1.0,
            paused: false,
            seed: 42,
        }
    }
}

/// Integrator switch event for logging
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntegratorSwitchEvent {
    pub tick: u64,
    pub from: IntegratorType,
    pub to: IntegratorType,
    pub reason: String,
}

/// The complete simulation state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationState {
    pub config: SimConfig,
    pub bodies: Vec<Body>,
    /// Map from body ID to index for O(1) lookup
    #[serde(skip)]
    pub id_map: HashMap<BodyId, usize>,
    /// Conservation quantities from last tick
    pub conserved: ConservedQuantities,
    /// History of integrator switches
    pub integrator_switches: Vec<IntegratorSwitchEvent>,
    /// Tick counter since last integrator type change (for hysteresis)
    pub ticks_since_integrator_switch: u64,
    /// Minimum ticks before allowing another integrator switch (hysteresis)
    pub integrator_switch_cooldown: u64,
}

impl SimulationState {
    pub fn new() -> Self {
        let mut state = Self {
            config: SimConfig::default(),
            bodies: Vec::new(),
            id_map: HashMap::new(),
            conserved: ConservedQuantities::default(),
            integrator_switches: Vec::new(),
            ticks_since_integrator_switch: 0,
            integrator_switch_cooldown: 100,
        };
        state.rebuild_id_map();
        state
    }

    pub fn with_config(config: SimConfig) -> Self {
        let mut state = Self::new();
        state.config = config;
        state
    }

    /// Add a body to the simulation
    pub fn add_body(&mut self, body: Body) {
        let idx = self.bodies.len();
        self.id_map.insert(body.id, idx);
        self.bodies.push(body);
    }

    /// Remove a body by ID
    pub fn remove_body(&mut self, id: BodyId) -> Option<Body> {
        if let Some(&idx) = self.id_map.get(&id) {
            let body = self.bodies.remove(idx);
            self.rebuild_id_map();
            Some(body)
        } else {
            None
        }
    }

    /// Get a body by ID
    pub fn get_body(&self, id: BodyId) -> Option<&Body> {
        self.id_map.get(&id).map(|&idx| &self.bodies[idx])
    }

    /// Get a mutable body by ID
    pub fn get_body_mut(&mut self, id: BodyId) -> Option<&mut Body> {
        if let Some(&idx) = self.id_map.get(&id) {
            Some(&mut self.bodies[idx])
        } else {
            None
        }
    }

    /// Rebuild the id_map from the bodies vector
    pub fn rebuild_id_map(&mut self) {
        self.id_map.clear();
        for (idx, body) in self.bodies.iter().enumerate() {
            self.id_map.insert(body.id, idx);
        }
    }

    /// Number of bodies
    pub fn body_count(&self) -> usize {
        self.bodies.len()
    }

    /// Get all massive (non-test-particle) bodies
    pub fn massive_bodies(&self) -> Vec<&Body> {
        self.bodies.iter().filter(|b| !b.is_massless && b.mass.value() > 0.0).collect()
    }

    /// Get center of mass position
    pub fn center_of_mass(&self) -> Vec3 {
        let mut total_mass = 0.0;
        let mut com = Vec3::ZERO;
        for body in &self.bodies {
            if !body.is_massless {
                total_mass += body.mass.value();
                com += body.position * body.mass.value();
            }
        }
        if total_mass > 0.0 { com / total_mass } else { Vec3::ZERO }
    }

    /// Get total momentum
    pub fn total_momentum(&self) -> Vec3 {
        let mut p = Vec3::ZERO;
        for body in &self.bodies {
            if !body.is_massless {
                p += body.velocity * body.mass.value();
            }
        }
        p
    }

    /// Get total angular momentum about origin
    pub fn total_angular_momentum(&self) -> Vec3 {
        let mut l = Vec3::ZERO;
        for body in &self.bodies {
            if !body.is_massless {
                l += body.position.cross(body.velocity) * body.mass.value();
            }
        }
        l
    }

    /// Get total kinetic energy
    pub fn total_kinetic_energy(&self) -> Joule {
        let mut ke = 0.0;
        for body in &self.bodies {
            if !body.is_massless {
                ke += 0.5 * body.mass.value() * body.velocity.magnitude_squared();
            }
        }
        Joule::new(ke)
    }

    /// Get total gravitational potential energy
    pub fn total_potential_energy(&self) -> Joule {
        let mut pe = 0.0;
        let n = self.bodies.len();
        for i in 0..n {
            if self.bodies[i].is_massless { continue; }
            for j in (i + 1)..n {
                if self.bodies[j].is_massless { continue; }
                let r = self.bodies[i].position.distance_to(self.bodies[j].position);
                if r > 0.0 {
                    pe -= G * self.bodies[i].mass.value() * self.bodies[j].mass.value() / r;
                }
            }
        }
        Joule::new(pe)
    }

    /// Get total energy
    pub fn total_energy(&self) -> Joule {
        Joule::new(self.total_kinetic_energy().value() + self.total_potential_energy().value())
    }

    /// Get total mass
    pub fn total_mass(&self) -> Kilogram {
        Kilogram::new(self.bodies.iter().filter(|b| !b.is_massless).map(|b| b.mass.value()).sum())
    }

    /// Generate a next unique body ID
    pub fn next_body_id(&self) -> BodyId {
        self.bodies.iter().map(|b| b.id).max().unwrap_or(0) + 1
    }

    /// Check if integrator switch conditions are met and execute if needed
    pub fn check_integrator_switch(&mut self) {
        self.ticks_since_integrator_switch += 1;

        if self.ticks_since_integrator_switch < self.integrator_switch_cooldown {
            return; // Hysteresis: don't switch too frequently
        }

        let n = self.body_count();
        let has_close_encounters = self.detect_close_encounters();
        let current = self.config.integrator_type;

        let desired = if has_close_encounters {
            IntegratorType::GaussRadau15
        } else if n > 100 {
            IntegratorType::VelocityVerlet
        } else {
            match current {
                IntegratorType::GaussRadau15 if !has_close_encounters => IntegratorType::VelocityVerlet,
                _ => current,
            }
        };

        if desired != current {
            self.integrator_switches.push(IntegratorSwitchEvent {
                tick: self.config.tick,
                from: current,
                to: desired,
                reason: if has_close_encounters {
                    "Close encounter detected".to_string()
                } else {
                    "Normal operation".to_string()
                },
            });
            self.config.integrator_type = desired;
            self.ticks_since_integrator_switch = 0;
        }
    }

    /// Detect close encounters between bodies (distance < 10 * max radius)
    fn detect_close_encounters(&self) -> bool {
        let n = self.bodies.len();
        for i in 0..n {
            for j in (i + 1)..n {
                let r = self.bodies[i].position.distance_to(self.bodies[j].position);
                let threshold = 10.0 * self.bodies[i].radius.value().max(self.bodies[j].radius.value());
                if threshold > 0.0 && r < threshold {
                    return true;
                }
            }
        }
        false
    }

    /// Serialize to JSON
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(self)
    }

    /// Deserialize from JSON
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        let mut state: Self = serde_json::from_str(json)?;
        state.rebuild_id_map();
        Ok(state)
    }
}

impl Default for SimulationState {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;

    fn two_body_state() -> SimulationState {
        let mut state = SimulationState::new();
        let sun = Body::new(1, "Sun", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_radius(Meter::new(6.957e8))
            .with_position(Vec3::ZERO);
        let earth = Body::new(2, "Earth", BodyType::Planet)
            .with_mass(Kilogram::new(EARTH_MASS))
            .with_radius(Meter::new(EARTH_RADIUS))
            .with_position(Vec3::new(AU, 0.0, 0.0))
            .with_velocity(Vec3::new(0.0, 29784.0, 0.0))
            .with_parent(1);
        state.add_body(sun);
        state.add_body(earth);
        state
    }

    #[test]
    fn test_state_creation() {
        let state = two_body_state();
        assert_eq!(state.body_count(), 2);
        assert!(state.get_body(1).is_some());
        assert!(state.get_body(2).is_some());
    }

    #[test]
    fn test_energy_conservation_initial() {
        let state = two_body_state();
        let ke = state.total_kinetic_energy();
        let pe = state.total_potential_energy();
        let total = state.total_energy();
        assert!(ke.value() > 0.0);
        assert!(pe.value() < 0.0);
        assert!((total.value() - (ke.value() + pe.value())).abs() < 1.0);
    }

    #[test]
    fn test_serialization_roundtrip() {
        let state = two_body_state();
        let json = state.to_json().unwrap();
        let restored = SimulationState::from_json(&json).unwrap();
        assert_eq!(restored.body_count(), 2);
        assert_eq!(restored.config.tick, 0);
    }
}
