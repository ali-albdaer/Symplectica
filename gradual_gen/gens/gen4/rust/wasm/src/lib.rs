///! WASM bindings for the solar-system simulation physics core.
///! Exposes a safe, JSON-serialized API boundary between Rust and JavaScript.

use wasm_bindgen::prelude::*;
use solar_core::{
    body::Body,
    state::{SimulationState, SimConfig},
    solvers::{SolverType, create_solver},
    integrators::{IntegratorType, create_integrator},
    collision::{self, CollisionMode},
    conserved::{ConservationMonitor, ConservedQuantities},
    reference_frame::ReferenceFrameManager,
    prng::DeterministicRng,
    checkpoint::{CheckpointManager, Checkpoint, InputEvent, InputAction},
    presets::{PresetId, create_preset},
    units::*,
    vector::Vec3,
};

/// Initialize panic hook for better error messages in dev
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// The main simulation engine exposed to JavaScript.
/// Keeps all state in Rust memory and communicates via JSON serialization.
#[wasm_bindgen]
pub struct SimEngine {
    state: SimulationState,
    conservation_monitor: ConservationMonitor,
    frame_manager: ReferenceFrameManager,
    checkpoint_manager: CheckpointManager,
    rng: DeterministicRng,
    collision_mode: CollisionMode,
}

#[wasm_bindgen]
impl SimEngine {
    /// Create a new simulation from default config
    #[wasm_bindgen(constructor)]
    pub fn new() -> SimEngine {
        let config = SimConfig::default();
        let rng = DeterministicRng::new(config.seed);
        SimEngine {
            state: SimulationState::with_config(config),
            conservation_monitor: ConservationMonitor::new(1e-6, 1e-3),
            frame_manager: ReferenceFrameManager::new(),
            checkpoint_manager: CheckpointManager::new(300, 20),
            rng,
            collision_mode: CollisionMode::InelasticMerge,
        }
    }

    /// Create from a preset scenario
    #[wasm_bindgen(js_name = "fromPreset")]
    pub fn from_preset(preset_name: &str, seed: u64) -> Result<SimEngine, JsValue> {
        let preset = match preset_name {
            "empty" => PresetId::EmptySpace,
            "two_body" | "kepler" => PresetId::TwoBodyKepler,
            "sun_earth_moon" => PresetId::SunEarthMoon,
            "solar_system" => PresetId::FullSolarSystem,
            "binary_star" => PresetId::BinaryStarCircumbinary,
            "alpha_centauri" => PresetId::AlphaCentauri,
            "rogue_planet" => PresetId::RoguePlanetFlyby,
            "asteroid_belt" => PresetId::DenseAsteroidBelt,
            "extreme" => PresetId::ExtremeRelativistic,
            _ => return Err(JsValue::from_str(&format!("Unknown preset: {}", preset_name))),
        };

        let state = create_preset(preset, seed);
        let rng = DeterministicRng::new(seed);
        Ok(SimEngine {
            state,
            conservation_monitor: ConservationMonitor::new(1e-6, 1e-3),
            frame_manager: ReferenceFrameManager::new(),
            checkpoint_manager: CheckpointManager::new(300, 20),
            rng,
            collision_mode: CollisionMode::InelasticMerge,
        })
    }

    /// Load state from JSON
    #[wasm_bindgen(js_name = "fromJson")]
    pub fn from_json(json: &str) -> Result<SimEngine, JsValue> {
        let state = SimulationState::from_json(json)
            .map_err(|e| JsValue::from_str(&format!("{}", e)))?;
        let seed = state.config.seed;
        let rng = DeterministicRng::new(seed);
        Ok(SimEngine {
            state,
            conservation_monitor: ConservationMonitor::new(1e-6, 1e-3),
            frame_manager: ReferenceFrameManager::new(),
            checkpoint_manager: CheckpointManager::new(300, 20),
            rng,
            collision_mode: CollisionMode::InelasticMerge,
        })
    }

    /// Step the simulation forward by one tick.
    /// Returns a JSON diagnostics object.
    pub fn step(&mut self) -> String {
        if self.state.config.paused {
            return "{}".to_string();
        }

        let dt_val = self.state.config.dt.value() * self.state.config.time_scale;
        let dt = Second::new(dt_val);

        // Create solver & integrator
        let solver = create_solver(
            self.state.config.solver_type,
            self.state.config.bh_theta,
            self.state.config.fmm_order,
        );
        let integrator = create_integrator(
            self.state.config.integrator_type,
            self.state.config.adaptive_tolerance,
        );

        // Run integration step
        let _result = integrator.step(&mut self.state, solver.as_ref(), dt);

        // Process collisions
        let collisions = collision::process_collisions(
            &mut self.state.bodies,
            self.collision_mode,
        );

        // Update reference frames
        self.frame_manager.update_frames(&self.state.bodies);

        // Update rotation angles
        for body in &mut self.state.bodies {
            body.update_rotation(dt);
        }

        // Advance time
        self.state.config.time += dt;
        self.state.config.tick += 1;
        self.state.ticks_since_integrator_switch += 1;

        // Compute conservation quantities and update monitor
        let q = compute_conserved(&self.state);
        let diag = self.conservation_monitor.update(q);

        // Auto-checkpoint
        self.checkpoint_manager.maybe_checkpoint(&self.state, &self.rng);

        // Return diagnostics JSON
        serde_json::to_string(&StepResult {
            tick: self.state.config.tick,
            time: self.state.config.time.value(),
            dt: dt_val,
            body_count: self.state.body_count(),
            energy_error: diag.energy_relative_error,
            momentum_error: diag.momentum_relative_error,
            collisions: collisions.len(),
            integrator: format!("{:?}", self.state.config.integrator_type),
            solver: format!("{:?}", self.state.config.solver_type),
        }).unwrap_or_default()
    }

    /// Step N ticks (for fast-forward)
    #[wasm_bindgen(js_name = "stepN")]
    pub fn step_n(&mut self, n: u32) -> String {
        let mut last_result = String::new();
        for _ in 0..n {
            last_result = self.step();
        }
        last_result
    }

    /// Get full state as JSON
    #[wasm_bindgen(js_name = "getState")]
    pub fn get_state(&self) -> String {
        self.state.to_json().unwrap_or_default()
    }

    /// Get body positions as a flat Float64Array for efficient rendering
    /// Layout: [x0, y0, z0, x1, y1, z1, ...]
    #[wasm_bindgen(js_name = "getPositions")]
    pub fn get_positions(&self) -> Vec<f64> {
        let mut result = Vec::with_capacity(self.state.body_count() * 3);
        for body in &self.state.bodies {
            result.push(body.position.x);
            result.push(body.position.y);
            result.push(body.position.z);
        }
        result
    }

    /// Get body positions relative to a camera origin for f32 rendering
    /// Returns Float32Array with camera-relative coordinates
    #[wasm_bindgen(js_name = "getPositionsRelative")]
    pub fn get_positions_relative(&self, cam_x: f64, cam_y: f64, cam_z: f64) -> Vec<f32> {
        let cam = Vec3::new(cam_x, cam_y, cam_z);
        let mut result = Vec::with_capacity(self.state.body_count() * 3);
        for body in &self.state.bodies {
            let rel = body.position.camera_relative(cam);
            result.push(rel[0]);
            result.push(rel[1]);
            result.push(rel[2]);
        }
        result
    }

    /// Get velocities as flat Float64Array
    #[wasm_bindgen(js_name = "getVelocities")]
    pub fn get_velocities(&self) -> Vec<f64> {
        let mut result = Vec::with_capacity(self.state.body_count() * 3);
        for body in &self.state.bodies {
            result.push(body.velocity.x);
            result.push(body.velocity.y);
            result.push(body.velocity.z);
        }
        result
    }

    /// Get body radii
    #[wasm_bindgen(js_name = "getRadii")]
    pub fn get_radii(&self) -> Vec<f64> {
        self.state.bodies.iter().map(|b| b.radius.value()).collect()
    }

    /// Get body names
    #[wasm_bindgen(js_name = "getBodyNames")]
    pub fn get_body_names(&self) -> String {
        let names: Vec<&str> = self.state.bodies.iter().map(|b| b.name.as_str()).collect();
        serde_json::to_string(&names).unwrap_or_default()
    }

    /// Get a specific body as JSON
    #[wasm_bindgen(js_name = "getBody")]
    pub fn get_body(&self, id: u64) -> Option<String> {
        self.state.get_body(id)
            .map(|b| serde_json::to_string(b).unwrap_or_default())
    }

    /// Add a body from JSON
    #[wasm_bindgen(js_name = "addBody")]
    pub fn add_body(&mut self, json: &str) -> Result<(), JsValue> {
        let body: Body = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Invalid body JSON: {}", e)))?;

        // Log input for replay
        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::SpawnBody {
                name: body.name.clone(),
                mass: body.mass.value(),
                radius: body.radius.value(),
                position: [body.position.x, body.position.y, body.position.z],
                velocity: [body.velocity.x, body.velocity.y, body.velocity.z],
            },
        });

        self.state.add_body(body);
        Ok(())
    }

    /// Remove a body by ID
    #[wasm_bindgen(js_name = "removeBody")]
    pub fn remove_body(&mut self, id: u64) -> bool {
        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::DeleteBody { body_id: id },
        });
        self.state.remove_body(id).is_some()
    }

    /// Apply a thrust to a body
    #[wasm_bindgen(js_name = "applyThrust")]
    pub fn apply_thrust(&mut self, body_id: u64, fx: f64, fy: f64, fz: f64, duration: f64) {
        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::ApplyThrust {
                body_id,
                force: [fx, fy, fz],
                duration,
            },
        });

        if let Some(body) = self.state.get_body_mut(body_id) {
            // Apply as acceleration: a = F/m
            if body.mass.value() > 0.0 {
                let ax = fx / body.mass.value();
                let ay = fy / body.mass.value();
                let az = fz / body.mass.value();
                body.acceleration += Vec3::new(ax, ay, az);
            }
        }
    }

    /// Set/update the simulation config from JSON
    #[wasm_bindgen(js_name = "setConfig")]
    pub fn set_config(&mut self, json: &str) -> Result<(), JsValue> {
        let config: SimConfig = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Invalid config JSON: {}", e)))?;

        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::SetConfig {
                key: "full_config".to_string(),
                value: json.to_string(),
            },
        });

        self.state.config = config;
        Ok(())
    }

    /// Pause / unpause
    #[wasm_bindgen(js_name = "setPaused")]
    pub fn set_paused(&mut self, paused: bool) {
        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::SetPaused { paused },
        });
        self.state.config.paused = paused;
    }

    /// Set time scale
    #[wasm_bindgen(js_name = "setTimeScale")]
    pub fn set_time_scale(&mut self, scale: f64) {
        self.checkpoint_manager.record_input(InputEvent {
            tick: self.state.config.tick,
            player_id: 0,
            action: InputAction::SetTimeScale { scale },
        });
        self.state.config.time_scale = scale;
    }

    /// Set the active solver
    #[wasm_bindgen(js_name = "setSolver")]
    pub fn set_solver(&mut self, solver_name: &str) -> Result<(), JsValue> {
        self.state.config.solver_type = match solver_name {
            "direct" => SolverType::Direct,
            "barnes_hut" | "barneshut" => SolverType::BarnesHut,
            "fmm" => SolverType::FMM,
            _ => return Err(JsValue::from_str(&format!("Unknown solver: {}", solver_name))),
        };
        Ok(())
    }

    /// Set the active integrator
    #[wasm_bindgen(js_name = "setIntegrator")]
    pub fn set_integrator(&mut self, name: &str) -> Result<(), JsValue> {
        self.state.config.integrator_type = match name {
            "verlet" | "velocity_verlet" => IntegratorType::VelocityVerlet,
            "rk45" | "dormand_prince" => IntegratorType::RK45,
            "gauss_radau" | "ias15" => IntegratorType::GaussRadau15,
            _ => return Err(JsValue::from_str(&format!("Unknown integrator: {}", name))),
        };
        Ok(())
    }

    /// Set the timestep
    #[wasm_bindgen(js_name = "setTimestep")]
    pub fn set_timestep(&mut self, dt: f64) {
        self.state.config.dt = Second::new(dt);
    }

    /// Get current tick
    #[wasm_bindgen(getter)]
    pub fn tick(&self) -> u64 {
        self.state.config.tick
    }

    /// Get current simulation time
    #[wasm_bindgen(getter)]
    pub fn time(&self) -> f64 {
        self.state.config.time.value()
    }

    /// Get body count
    #[wasm_bindgen(js_name = "bodyCount")]
    pub fn body_count(&self) -> usize {
        self.state.body_count()
    }

    /// Get a checkpoint as JSON
    #[wasm_bindgen(js_name = "getCheckpoint")]
    pub fn get_checkpoint(&self) -> String {
        let cp = Checkpoint::create(&self.state, &self.rng);
        serde_json::to_string(&cp).unwrap_or_default()
    }

    /// Restore from a checkpoint JSON
    #[wasm_bindgen(js_name = "restoreCheckpoint")]
    pub fn restore_checkpoint(&mut self, json: &str) -> Result<(), JsValue> {
        let cp: Checkpoint = serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&format!("Invalid checkpoint: {}", e)))?;
        self.state = cp.state;
        self.rng = DeterministicRng::from_state(cp.rng_state);
        Ok(())
    }

    /// Get a random u64 from the deterministic RNG
    #[wasm_bindgen(js_name = "randomU64")]
    pub fn random_u64(&mut self) -> u64 {
        self.rng.next_u64()
    }

    /// Get center of mass as [x, y, z]
    #[wasm_bindgen(js_name = "centerOfMass")]
    pub fn center_of_mass(&self) -> Vec<f64> {
        let com = self.state.center_of_mass();
        vec![com.x, com.y, com.z]
    }

    /// Get total energy
    #[wasm_bindgen(js_name = "totalEnergy")]
    pub fn total_energy(&self) -> f64 {
        self.state.total_energy().value()
    }

    /// Get conservation diagnostics as JSON
    #[wasm_bindgen(js_name = "getConservationDiagnostics")]
    pub fn get_conservation_diagnostics(&self) -> String {
        serde_json::to_string(&self.conservation_monitor.summary()).unwrap_or_default()
    }

    /// Generate a next unique body ID
    #[wasm_bindgen(js_name = "nextBodyId")]
    pub fn next_body_id(&self) -> u64 {
        self.state.next_body_id()
    }
}

/// Compute conservation quantities from current state
fn compute_conserved(state: &SimulationState) -> ConservedQuantities {
    let ke = state.total_kinetic_energy().value();
    let pe = state.total_potential_energy().value();
    let mom = state.total_momentum();
    let ang = state.total_angular_momentum();
    let mass = state.total_mass().value();
    ConservedQuantities {
        tick: state.config.tick,
        total_energy: ke + pe,
        kinetic_energy: ke,
        potential_energy: pe,
        linear_momentum: mom,
        angular_momentum: ang,
        total_mass: mass,
        linear_momentum_magnitude: mom.magnitude(),
        angular_momentum_magnitude: ang.magnitude(),
    }
}

/// Diagnostics returned from each step
#[derive(serde::Serialize)]
struct StepResult {
    tick: u64,
    time: f64,
    dt: f64,
    body_count: usize,
    energy_error: f64,
    momentum_error: f64,
    collisions: usize,
    integrator: String,
    solver: String,
}
