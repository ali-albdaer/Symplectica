//! WebAssembly bindings for the physics core
//!
//! Exposes the Rust physics simulation to JavaScript via wasm-bindgen.

#![cfg(feature = "wasm")]

use wasm_bindgen::prelude::*;

use crate::{
    body::{Body, BodyState, BodyType},
    checkpoint::{Checkpoint, NetworkSnapshot},
    config::{CollisionMode, SimConfig},
    prng::Pcg32,
    simulation::Simulation,
    vec3::Vec3,
    G,
};

/// Initialize panic hook for better error messages in WASM
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// WASM-exposed simulation wrapper
#[wasm_bindgen]
pub struct WasmSimulation {
    sim: Simulation,
}

#[wasm_bindgen]
impl WasmSimulation {
    /// Create a new simulation
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmSimulation {
        WasmSimulation {
            sim: Simulation::new(),
        }
    }

    /// Create with custom config JSON
    #[wasm_bindgen]
    pub fn with_config(config_json: &str) -> Result<WasmSimulation, JsValue> {
        let config: SimConfig = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid config: {}", e)))?;

        Ok(WasmSimulation {
            sim: Simulation::with_config(config),
        })
    }

    /// Set PRNG seed for deterministic simulation
    #[wasm_bindgen]
    pub fn set_seed(&mut self, seed: u64, stream: u64) {
        self.sim.set_seed(seed, stream);
    }

    /// Get current tick
    #[wasm_bindgen]
    pub fn tick(&self) -> u64 {
        self.sim.tick()
    }

    /// Get current simulation time in seconds
    #[wasm_bindgen]
    pub fn sim_time(&self) -> f64 {
        self.sim.sim_time()
    }

    /// Get current sequence number
    #[wasm_bindgen]
    pub fn sequence(&self) -> u64 {
        self.sim.sequence()
    }

    /// Get configuration as JSON
    #[wasm_bindgen]
    pub fn config_json(&self) -> String {
        serde_json::to_string(self.sim.config()).unwrap_or_default()
    }

    /// Set configuration from JSON
    #[wasm_bindgen]
    pub fn set_config(&mut self, config_json: &str) -> Result<(), JsValue> {
        let config: SimConfig = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid config: {}", e)))?;
        
        *self.sim.config_mut() = config;
        Ok(())
    }

    /// Add a body from JSON
    #[wasm_bindgen]
    pub fn add_body_json(&mut self, body_json: &str) -> Result<(), JsValue> {
        let body: Body = serde_json::from_str(body_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid body JSON: {}", e)))?;
        
        self.sim
            .add_body(body)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Add a body with explicit parameters
    #[wasm_bindgen]
    pub fn add_body(
        &mut self,
        id: &str,
        name: &str,
        mass: f64,
        radius: f64,
        px: f64,
        py: f64,
        pz: f64,
        vx: f64,
        vy: f64,
        vz: f64,
    ) -> Result<(), JsValue> {
        let body = Body::new(id, name, mass, radius)
            .at_position(px, py, pz)
            .with_velocity_xyz(vx, vy, vz);

        self.sim
            .add_body(body)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Add a star
    #[wasm_bindgen]
    pub fn add_star(
        &mut self,
        id: &str,
        name: &str,
        mass: f64,
        radius: f64,
        px: f64,
        py: f64,
        pz: f64,
    ) -> Result<(), JsValue> {
        let body = Body::star(id, name, mass, radius).at_position(px, py, pz);

        self.sim
            .add_body(body)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Add a planet
    #[wasm_bindgen]
    pub fn add_planet(
        &mut self,
        id: &str,
        name: &str,
        mass: f64,
        radius: f64,
        px: f64,
        py: f64,
        pz: f64,
        vx: f64,
        vy: f64,
        vz: f64,
    ) -> Result<(), JsValue> {
        let body = Body::planet(id, name, mass, radius)
            .at_position(px, py, pz)
            .with_velocity_xyz(vx, vy, vz);

        self.sim
            .add_body(body)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Remove a body by ID
    #[wasm_bindgen]
    pub fn remove_body(&mut self, id: &str) -> Result<(), JsValue> {
        self.sim
            .remove_body(id)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        Ok(())
    }

    /// Get number of bodies
    #[wasm_bindgen]
    pub fn body_count(&self) -> usize {
        self.sim.bodies().len()
    }

    /// Get number of active bodies
    #[wasm_bindgen]
    pub fn active_body_count(&self) -> usize {
        self.sim.active_body_count()
    }

    /// Get body IDs as JSON array
    #[wasm_bindgen]
    pub fn body_ids(&self) -> String {
        let ids: Vec<&str> = self.sim.bodies().iter().map(|b| b.id.as_str()).collect();
        serde_json::to_string(&ids).unwrap_or_default()
    }

    /// Get a single body as JSON
    #[wasm_bindgen]
    pub fn get_body(&self, id: &str) -> Option<String> {
        self.sim
            .get_body(id)
            .and_then(|b| serde_json::to_string(b).ok())
    }

    /// Get all bodies as JSON
    #[wasm_bindgen]
    pub fn bodies_json(&self) -> String {
        serde_json::to_string(self.sim.bodies()).unwrap_or_default()
    }

    /// Initialize the simulation (call before first step)
    #[wasm_bindgen]
    pub fn initialize(&mut self) {
        self.sim.initialize();
    }

    /// Perform one simulation step
    #[wasm_bindgen]
    pub fn step(&mut self) -> Result<String, JsValue> {
        let result = self
            .sim
            .step()
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

        // Return result as JSON
        let result_json = serde_json::json!({
            "tick": result.tick,
            "simTime": result.sim_time,
            "substeps": result.substeps,
            "recentered": result.recentered,
            "energyDriftPercent": result.energy_drift_percent,
            "collisionCount": result.collision_events.len(),
        });

        Ok(serde_json::to_string(&result_json).unwrap_or_default())
    }

    /// Step multiple times
    #[wasm_bindgen]
    pub fn step_n(&mut self, n: u64) -> Result<(), JsValue> {
        self.sim
            .step_n(n)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Reset the simulation
    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.sim.reset();
    }

    /// Create a checkpoint as JSON
    #[wasm_bindgen]
    pub fn checkpoint_json(&self) -> Result<String, JsValue> {
        self.sim
            .create_checkpoint()
            .to_json()
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Create a network snapshot as JSON
    #[wasm_bindgen]
    pub fn snapshot_json(&self) -> Result<String, JsValue> {
        self.sim
            .create_snapshot()
            .to_json()
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Restore from checkpoint JSON
    #[wasm_bindgen]
    pub fn restore_checkpoint(&mut self, json: &str) -> Result<(), JsValue> {
        self.sim
            .restore_from_json(json)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))
    }

    /// Get body positions as Float64Array (x1, y1, z1, x2, y2, z2, ...)
    #[wasm_bindgen]
    pub fn get_positions(&self) -> Box<[f64]> {
        let bodies = self.sim.bodies();
        let mut positions = Vec::with_capacity(bodies.len() * 3);

        for body in bodies {
            if body.active {
                positions.push(body.position.x);
                positions.push(body.position.y);
                positions.push(body.position.z);
            } else {
                positions.push(f64::NAN);
                positions.push(f64::NAN);
                positions.push(f64::NAN);
            }
        }

        positions.into_boxed_slice()
    }

    /// Get body velocities as Float64Array
    #[wasm_bindgen]
    pub fn get_velocities(&self) -> Box<[f64]> {
        let bodies = self.sim.bodies();
        let mut velocities = Vec::with_capacity(bodies.len() * 3);

        for body in bodies {
            if body.active {
                velocities.push(body.velocity.x);
                velocities.push(body.velocity.y);
                velocities.push(body.velocity.z);
            } else {
                velocities.push(f64::NAN);
                velocities.push(f64::NAN);
                velocities.push(f64::NAN);
            }
        }

        velocities.into_boxed_slice()
    }

    /// Get body radii as Float64Array
    #[wasm_bindgen]
    pub fn get_radii(&self) -> Box<[f64]> {
        self.sim
            .bodies()
            .iter()
            .map(|b| if b.active { b.radius } else { 0.0 })
            .collect::<Vec<_>>()
            .into_boxed_slice()
    }

    /// Get body masses as Float64Array
    #[wasm_bindgen]
    pub fn get_masses(&self) -> Box<[f64]> {
        self.sim
            .bodies()
            .iter()
            .map(|b| if b.active { b.mass } else { 0.0 })
            .collect::<Vec<_>>()
            .into_boxed_slice()
    }

    /// Get origin offset
    #[wasm_bindgen]
    pub fn origin_offset(&self) -> Box<[f64]> {
        let offset = self.sim.origin_offset();
        Box::new([offset.x, offset.y, offset.z])
    }

    /// Get energy metrics as JSON
    #[wasm_bindgen]
    pub fn energy_metrics(&self) -> Option<String> {
        self.sim.energy_metrics().map(|m| {
            serde_json::json!({
                "initialEnergy": m.initial_energy,
                "currentEnergy": m.current_energy,
                "drift": m.drift,
                "driftPercent": m.drift_percent,
                "kinetic": m.kinetic,
                "potential": m.potential,
            })
            .to_string()
        })
    }

    /// Get momentum metrics as JSON
    #[wasm_bindgen]
    pub fn momentum_metrics(&self) -> Option<String> {
        self.sim.momentum_metrics().map(|m| {
            serde_json::json!({
                "initialMomentum": m.initial_momentum.to_array(),
                "currentMomentum": m.current_momentum.to_array(),
                "drift": m.drift,
            })
            .to_string()
        })
    }

    /// Apply body states from JSON (for client-side reconciliation)
    #[wasm_bindgen]
    pub fn apply_body_states(&mut self, states_json: &str) -> Result<(), JsValue> {
        let states: Vec<BodyState> = serde_json::from_str(states_json)
            .map_err(|e| JsValue::from_str(&format!("Invalid states JSON: {}", e)))?;

        self.sim.apply_body_states(&states);
        Ok(())
    }

    /// Get recent collision events as JSON
    #[wasm_bindgen]
    pub fn collision_events(&self) -> String {
        serde_json::to_string(self.sim.collision_events()).unwrap_or_default()
    }

    /// Get total collision count
    #[wasm_bindgen]
    pub fn collision_count(&self) -> u64 {
        self.sim.collision_count()
    }
}

impl Default for WasmSimulation {
    fn default() -> Self {
        Self::new()
    }
}

/// Calculate circular orbit velocity for a given central mass and orbital radius
#[wasm_bindgen]
pub fn circular_velocity(central_mass: f64, orbital_radius: f64) -> f64 {
    if orbital_radius > 0.0 {
        (G * central_mass / orbital_radius).sqrt()
    } else {
        0.0
    }
}

/// Calculate escape velocity at a given radius from a central mass
#[wasm_bindgen]
pub fn escape_velocity(central_mass: f64, radius: f64) -> f64 {
    if radius > 0.0 {
        (2.0 * G * central_mass / radius).sqrt()
    } else {
        0.0
    }
}

/// Calculate orbital period for a circular orbit
#[wasm_bindgen]
pub fn orbital_period(central_mass: f64, semi_major_axis: f64) -> f64 {
    if central_mass > 0.0 && semi_major_axis > 0.0 {
        2.0 * std::f64::consts::PI * (semi_major_axis.powi(3) / (G * central_mass)).sqrt()
    } else {
        0.0
    }
}

/// Calculate sphere of influence radius
#[wasm_bindgen]
pub fn soi_radius(semi_major_axis: f64, body_mass: f64, primary_mass: f64) -> f64 {
    crate::soi::laplace_soi(semi_major_axis, body_mass, primary_mass)
}

/// Calculate Hill radius
#[wasm_bindgen]
pub fn hill_radius(semi_major_axis: f64, body_mass: f64, primary_mass: f64) -> f64 {
    crate::soi::hill_radius(semi_major_axis, body_mass, primary_mass)
}

/// Get gravitational constant
#[wasm_bindgen]
pub fn gravitational_constant() -> f64 {
    G
}

/// PCG random number generator exposed to WASM
#[wasm_bindgen]
pub struct WasmPcg {
    rng: Pcg32,
}

#[wasm_bindgen]
impl WasmPcg {
    /// Create a new PCG with seed and stream
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64, stream: u64) -> WasmPcg {
        WasmPcg {
            rng: Pcg32::new(seed, stream),
        }
    }

    /// Get next u32
    #[wasm_bindgen]
    pub fn next_u32(&mut self) -> u32 {
        self.rng.next_u32()
    }

    /// Get next f64 in [0, 1)
    #[wasm_bindgen]
    pub fn next_f64(&mut self) -> f64 {
        self.rng.next_f64()
    }

    /// Get next f64 in [min, max)
    #[wasm_bindgen]
    pub fn next_f64_range(&mut self, min: f64, max: f64) -> f64 {
        self.rng.next_f64_range(min, max)
    }

    /// Get state for serialization
    #[wasm_bindgen]
    pub fn get_state(&self) -> Box<[u64]> {
        let (state, inc) = self.rng.get_state();
        Box::new([state, inc])
    }

    /// Restore from state
    #[wasm_bindgen]
    pub fn from_state(state: u64, inc: u64) -> WasmPcg {
        WasmPcg {
            rng: Pcg32::from_state(state, inc),
        }
    }
}

/// Log to browser console (for debugging)
#[wasm_bindgen]
pub fn log(message: &str) {
    web_sys::console::log_1(&JsValue::from_str(message));
}

/// Log error to browser console
#[wasm_bindgen]
pub fn log_error(message: &str) {
    web_sys::console::error_1(&JsValue::from_str(message));
}
