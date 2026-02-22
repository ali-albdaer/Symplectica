//! N-Body Physics Core
//!
//! A high-precision gravitational N-body simulation engine compiled to WebAssembly.
//! Uses SI units (meters, kilograms, seconds) throughout for scientific accuracy.
//!
//! # Features
//! - Direct O(N²) and Barnes-Hut O(N log N) gravity solvers
//! - Symplectic Velocity-Verlet integrator for energy conservation  
//! - Deterministic PRNG for reproducible simulations
//! - Snapshot serialization for save/load and networking
//!
//! # Example
//! ```rust
//! use physics_core::prelude::*;
//!
//! // Create a simple Sun-Earth system
//! let mut sim = Simulation::new(42);
//! sim.add_star("Sun", M_SUN, R_SUN);
//! sim.add_planet("Earth", M_EARTH, R_EARTH, AU, 29784.0);
//!
//! // Simulate for 100 steps
//! sim.step_n(100);
//! assert!(sim.time() > 0.0);
//! ```

use wasm_bindgen::prelude::*;

pub mod body;
pub mod constants;
pub mod force;
pub mod integrator;
pub mod octree;
pub mod planet;
pub mod presets;
pub mod prng;
pub mod simulation;
pub mod snapshot;
pub mod star;
pub mod vector;

// Re-exports for convenience
pub mod prelude {
    pub use crate::body::{Atmosphere, Body, BodyId, BodyType, PlanetComposition};
    pub use crate::constants::*;
    pub use crate::force::ForceConfig;
    pub use crate::integrator::{CloseEncounterConfig, CloseEncounterIntegrator, IntegratorConfig, IntegratorType};
    pub use crate::presets::Preset;
    pub use crate::prng::Pcg32;
    pub use crate::simulation::{ForceMethod, Simulation, SimulationConfig};
    pub use crate::snapshot::Snapshot;
    pub use crate::vector::Vec3;
}

// WASM Bindings

/// Initialize panic hook for better error messages in WASM
#[wasm_bindgen(start)]
pub fn init() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// WASM-exposed simulation wrapper
#[wasm_bindgen]
pub struct WasmSimulation {
    inner: simulation::Simulation,
}

#[wasm_bindgen]
impl WasmSimulation {
    /// Create a new simulation with the given seed
    #[wasm_bindgen(constructor)]
    pub fn new(seed: u64) -> Self {
        Self {
            inner: simulation::Simulation::new(seed),
        }
    }

    /// Add a star at the origin
    #[wasm_bindgen(js_name = addStar)]
    pub fn add_star(&mut self, name: &str, mass: f64, radius: f64) -> u32 {
        self.inner.add_star(name, mass, radius)
    }

    /// Add a planet with given orbital parameters
    #[wasm_bindgen(js_name = addPlanet)]
    pub fn add_planet(
        &mut self,
        name: &str,
        mass: f64,
        radius: f64,
        orbital_distance: f64,
        orbital_velocity: f64,
    ) -> u32 {
        self.inner.add_planet(name, mass, radius, orbital_distance, orbital_velocity)
    }

    /// Add a body with full parameters.
    /// `body_type`: 0=Star, 1=Planet, 2=Moon, 3=Asteroid, 4=Comet, 5=Spacecraft, 6=TestParticle, 7=Player
    #[wasm_bindgen(js_name = addBody)]
    pub fn add_body(
        &mut self,
        name: &str,
        body_type: u8,
        mass: f64,
        radius: f64,
        px: f64, py: f64, pz: f64,
        vx: f64, vy: f64, vz: f64,
    ) -> u32 {
        let bt = match body_type {
            0 => body::BodyType::Star,
            1 => body::BodyType::Planet,
            2 => body::BodyType::Moon,
            3 => body::BodyType::Asteroid,
            4 => body::BodyType::Comet,
            5 => body::BodyType::Spacecraft,
            6 => body::BodyType::TestParticle,
            7 => body::BodyType::Player,
            _ => body::BodyType::Asteroid,
        };
        let mut b = body::Body::new(
            0,
            name,
            bt,
            mass,
            radius,
            vector::Vec3::new(px, py, pz),
            vector::Vec3::new(vx, vy, vz),
        );
        b.compute_derived();
        self.inner.add_body(b)
    }

    /// Add a body from a JSON string with all properties.
    /// Accepts the full Body JSON structure from PROPERTIES.md.
    #[wasm_bindgen(js_name = addBodyFromJson)]
    pub fn add_body_from_json(&mut self, json: &str) -> u32 {
        match serde_json::from_str::<body::Body>(json) {
            Ok(mut b) => {
                b.compute_derived();
                self.inner.add_body(b)
            }
            Err(_) => u32::MAX, // Error sentinel
        }
    }

    /// Remove a body by ID
    #[wasm_bindgen(js_name = removeBody)]
    pub fn remove_body(&mut self, id: u32) -> bool {
        self.inner.remove_body(id)
    }

    /// Advance simulation by one tick
    pub fn step(&mut self) {
        self.inner.step();
    }

    /// Advance simulation by n ticks
    #[wasm_bindgen(js_name = stepN)]
    pub fn step_n(&mut self, n: u64) {
        self.inner.step_n(n);
    }

    /// Get current simulation time in seconds
    pub fn time(&self) -> f64 {
        self.inner.time()
    }

    /// Get current tick count
    pub fn tick(&self) -> u64 {
        self.inner.tick()
    }

    /// Get number of active bodies
    #[wasm_bindgen(js_name = bodyCount)]
    pub fn body_count(&self) -> usize {
        self.inner.body_count()
    }

    /// Get all positions as Float64Array [x0, y0, z0, x1, y1, z1, ...]
    #[wasm_bindgen(js_name = getPositions)]
    pub fn get_positions(&self) -> Vec<f64> {
        self.inner.positions_flat()
    }

    /// Get all velocities as Float64Array
    #[wasm_bindgen(js_name = getVelocities)]
    pub fn get_velocities(&self) -> Vec<f64> {
        self.inner.velocities_flat()
    }

    /// Get body data as JSON (only active bodies)
    #[wasm_bindgen(js_name = getBodiesJson)]
    pub fn get_bodies_json(&self) -> String {
        let active_bodies: Vec<_> = self.inner.bodies().iter().filter(|b| b.is_active).collect();
        serde_json::to_string(&active_bodies).unwrap_or_default()
    }

    /// Export full state as JSON snapshot
    #[wasm_bindgen(js_name = toJson)]
    pub fn to_json(&self) -> String {
        self.inner.to_json().unwrap_or_default()
    }

    /// Import state from JSON snapshot
    #[wasm_bindgen(js_name = fromJson)]
    pub fn from_json(&mut self, json: &str) -> bool {
        match snapshot::Snapshot::from_json(json) {
            Ok(snapshot) => self.inner.restore(snapshot).is_ok(),
            Err(_) => false,
        }
    }

    /// Get total energy of the system
    #[wasm_bindgen(js_name = totalEnergy)]
    pub fn total_energy(&self) -> f64 {
        self.inner.total_energy()
    }

    /// Set timestep in seconds
    #[wasm_bindgen(js_name = setDt)]
    pub fn set_dt(&mut self, dt: f64) {
        self.inner.set_dt(dt);
    }

    /// Set number of substeps per tick
    #[wasm_bindgen(js_name = setSubsteps)]
    pub fn set_substeps(&mut self, substeps: u32) {
        self.inner.set_substeps(substeps);
    }

    /// Set Barnes-Hut theta parameter
    #[wasm_bindgen(js_name = setTheta)]
    pub fn set_theta(&mut self, theta: f64) {
        self.inner.set_theta(theta);
    }

    /// Use direct O(N²) force calculation
    #[wasm_bindgen(js_name = useDirectForce)]
    pub fn use_direct_force(&mut self) {
        self.inner.set_force_method(simulation::ForceMethod::Direct);
    }

    /// Use Barnes-Hut O(N log N) force calculation
    #[wasm_bindgen(js_name = useBarnesHut)]
    pub fn use_barnes_hut(&mut self) {
        self.inner.set_force_method(simulation::ForceMethod::BarnesHut);
    }

    /// Set close-encounter integrator ("none", "rk45", "gauss-radau")
    #[wasm_bindgen(js_name = setCloseEncounterIntegrator)]
    pub fn set_close_encounter_integrator(&mut self, name: &str) {
        let integrator = match name {
            "rk45" => integrator::CloseEncounterIntegrator::Rk45,
            "gauss-radau" => integrator::CloseEncounterIntegrator::GaussRadau5,
            "none" => integrator::CloseEncounterIntegrator::None,
            _ => integrator::CloseEncounterIntegrator::GaussRadau5,
        };
        self.inner.set_close_encounter_integrator(integrator);
    }

    /// Set close-encounter thresholds (hill_factor, tidal_ratio, jerk_norm)
    #[wasm_bindgen(js_name = setCloseEncounterThresholds)]
    pub fn set_close_encounter_thresholds(&mut self, hill_factor: f64, tidal_ratio: f64, jerk_norm: f64) {
        self.inner.set_close_encounter_thresholds(hill_factor, tidal_ratio, jerk_norm);
    }

    /// Set close-encounter limits (max_subset_size, max_trial_substeps)
    #[wasm_bindgen(js_name = setCloseEncounterLimits)]
    pub fn set_close_encounter_limits(&mut self, max_subset_size: u32, max_trial_substeps: u32) {
        self.inner.set_close_encounter_limits(max_subset_size as usize, max_trial_substeps as usize);
    }

    /// Set close-encounter RK45 tolerances (abs_tol, rel_tol)
    #[wasm_bindgen(js_name = setCloseEncounterRk45Tolerances)]
    pub fn set_close_encounter_rk45_tolerances(&mut self, abs_tol: f64, rel_tol: f64) {
        self.inner.set_close_encounter_rk45_tolerances(abs_tol, rel_tol);
    }

    /// Set close-encounter Gauss-Radau parameters (max_iters, tol)
    #[wasm_bindgen(js_name = setCloseEncounterGaussRadau)]
    pub fn set_close_encounter_gauss_radau(&mut self, max_iters: u32, tol: f64) {
        self.inner.set_close_encounter_gauss_radau(max_iters as usize, tol);
    }

    /// Drain close-encounter events as JSON
    #[wasm_bindgen(js_name = takeCloseEncounterEvents)]
    pub fn take_close_encounter_events(&mut self) -> String {
        let events = self.inner.take_close_encounter_events();
        serde_json::to_string(&events).unwrap_or_default()
    }

    /// Get a random number from the deterministic PRNG
    pub fn random(&mut self) -> f64 {
        self.inner.random()
    }
}

/// Create a Sun-Earth-Moon preset
#[wasm_bindgen(js_name = createSunEarthMoon)]
pub fn create_sun_earth_moon(seed: u64) -> WasmSimulation {
    let mut sim = simulation::Simulation::new(seed);
    
    // Sun at origin
    sim.add_star("Sun", constants::M_SUN, constants::R_SUN);
    
    // Earth at 1 AU
    let earth_id = sim.add_planet(
        "Earth",
        constants::M_EARTH,
        constants::R_EARTH,
        constants::AU,
        29784.0,
    );
    
    // Moon
    sim.add_moon(
        "Moon",
        constants::M_MOON,
        constants::R_MOON,
        earth_id,
        3.844e8,
        1022.0,
    );

    // Set Earth's atmosphere
    if let Some(earth) = sim.get_body_mut(earth_id) {
        earth.atmosphere = Some(body::Atmosphere::earth_like());
    }

    WasmSimulation { inner: sim }
}

/// Get gravitational constant G
#[wasm_bindgen(js_name = getG)]
pub fn get_g() -> f64 {
    constants::G
}

/// Get astronomical unit in meters
#[wasm_bindgen(js_name = getAU)]
pub fn get_au() -> f64 {
    constants::AU
}

/// Get solar mass in kg
#[wasm_bindgen(js_name = getSolarMass)]
pub fn get_solar_mass() -> f64 {
    constants::M_SUN
}

/// Get Earth mass in kg
#[wasm_bindgen(js_name = getEarthMass)]
pub fn get_earth_mass() -> f64 {
    constants::M_EARTH
}

/// Calculate circular orbital velocity for given primary mass and distance
#[wasm_bindgen(js_name = circularVelocity)]
pub fn circular_velocity(mass: f64, distance: f64) -> f64 {
    (constants::G * mass / distance).sqrt()
}

/// Create Inner Solar System preset (Sun, Mercury, Venus, Earth+Moon, Mars)
#[wasm_bindgen(js_name = createInnerSolarSystem)]
pub fn create_inner_solar_system(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_inner_solar_system(seed) }
}

/// Create Full Solar System preset (all 8 planets + Pluto)
#[wasm_bindgen(js_name = createFullSolarSystem)]
pub fn create_full_solar_system(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_full_solar_system(seed) }
}

/// Create Full Solar System II preset (J2000 corrected orbital elements)
/// Uses canonical JPL values with proper inclinations and Kepler→Cartesian conversion
#[wasm_bindgen(js_name = createFullSolarSystemII)]
pub fn create_full_solar_system_ii(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_full_solar_system_ii(seed, false) }
}

/// Create Full Solar System II in barycentric frame (center-of-mass at origin)
#[wasm_bindgen(js_name = createFullSolarSystemIIBarycentric)]
pub fn create_full_solar_system_ii_barycentric(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_full_solar_system_ii(seed, true) }
}

/// Create Playable Solar System preset (scaled distances/masses/radii)
#[wasm_bindgen(js_name = createPlayableSolarSystem)]
pub fn create_playable_solar_system(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_playable_solar_system(seed) }
}

/// Create Jupiter system preset (Jupiter + Galilean moons)
#[wasm_bindgen(js_name = createJupiterSystem)]
pub fn create_jupiter_system(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_jupiter_system(seed) }
}

/// Create Saturn system preset (Saturn + major moons)
#[wasm_bindgen(js_name = createSaturnSystem)]
pub fn create_saturn_system(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_saturn_system(seed) }
}

/// Create Alpha Centauri binary star system
#[wasm_bindgen(js_name = createAlphaCentauri)]
pub fn create_alpha_centauri(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_alpha_centauri(seed) }
}

/// Create TRAPPIST-1 exoplanet system (7 Earth-like planets)
#[wasm_bindgen(js_name = createTrappist1)]
pub fn create_trappist1(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_trappist1(seed) }
}

/// Create Binary Pulsar system (PSR J0737-3039)
#[wasm_bindgen(js_name = createBinaryPulsar)]
pub fn create_binary_pulsar(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_binary_pulsar(seed) }
}

/// Create Asteroid Belt preset (Full solar system + 2000-10000 asteroids)
/// Power-law mass spectrum, Rayleigh orbital elements
#[wasm_bindgen(js_name = createAsteroidBelt)]
pub fn create_asteroid_belt(seed: u64, asteroid_count: u32) -> WasmSimulation {
    WasmSimulation { inner: presets::create_asteroid_belt(seed, asteroid_count as usize) }
}

/// Create Dense Star Cluster preset (1000-5000 equal-mass stars)
/// Plummer sphere distribution, virialized velocities
#[wasm_bindgen(js_name = createStarCluster)]
pub fn create_star_cluster(seed: u64, star_count: u32) -> WasmSimulation {
    WasmSimulation { inner: presets::create_star_cluster(seed, star_count as usize) }
}

/// Integrator Test 1: Two-body circular orbit
#[wasm_bindgen(js_name = createIntegratorTest1)]
pub fn create_integrator_test1(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_integrator_test1(seed) }
}

/// Integrator Test 2: Jupiter-Saturn near-resonant interaction
#[wasm_bindgen(js_name = createIntegratorTest2)]
pub fn create_integrator_test2(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_integrator_test2(seed) }
}

/// Integrator Test 3: Strong close encounter
#[wasm_bindgen(js_name = createIntegratorTest3)]
pub fn create_integrator_test3(seed: u64) -> WasmSimulation {
    WasmSimulation { inner: presets::create_integrator_test3(seed) }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wasm_simulation() {
        let mut sim = WasmSimulation::new(42);
        
        sim.add_star("Sun", constants::M_SUN, constants::R_SUN);
        sim.add_planet("Earth", constants::M_EARTH, constants::R_EARTH, constants::AU, 29784.0);
        
        assert_eq!(sim.body_count(), 2);
        
        sim.step_n(100);
        assert_eq!(sim.tick(), 100);
    }

    #[test]
    fn test_sun_earth_moon_preset() {
        let mut sim = create_sun_earth_moon(42);
        
        assert_eq!(sim.body_count(), 3);
        
        sim.step_n(1000);
        
        let json = sim.to_json();
        assert!(!json.is_empty());
    }
}
