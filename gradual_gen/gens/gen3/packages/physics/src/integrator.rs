//! Numerical integrators for the N-body simulation
//!
//! Phase I implements Velocity Verlet (symplectic integrator)
//! Phase II will add RK45 and Gauss-Radau/IAS15

use crate::{body::Body, config::SimConfig, vec3::Vec3, G};

/// Calculate gravitational acceleration on a body from all other bodies
///
/// Uses direct sum O(N²) with softening to prevent singularities
pub fn compute_acceleration(body_idx: usize, bodies: &[Body], softening: f64) -> Vec3 {
    let body = &bodies[body_idx];

    if body.fixed || !body.active {
        return Vec3::zero();
    }

    let mut acceleration = Vec3::zero();
    let softening_sq = softening * softening;

    for (i, other) in bodies.iter().enumerate() {
        if i == body_idx || !other.active || !other.has_mass() {
            continue;
        }

        // Vector from body to other
        let r = other.position - body.position;
        let dist_sq = r.magnitude_squared();

        // Add softening to prevent singularity
        let dist_sq_softened = dist_sq + softening_sq;
        let dist = dist_sq_softened.sqrt();

        // Gravitational acceleration: a = G * M / r² * r_hat
        // = G * M / r³ * r
        let a_mag = G * other.mass / (dist * dist_sq_softened);
        acceleration += r * a_mag;
    }

    acceleration
}

/// Compute accelerations for all bodies
pub fn compute_all_accelerations(bodies: &[Body], softening: f64) -> Vec<Vec3> {
    let n = bodies.len();
    let mut accelerations = vec![Vec3::zero(); n];

    // O(N²) direct sum
    for i in 0..n {
        if !bodies[i].active || bodies[i].fixed {
            continue;
        }

        accelerations[i] = compute_acceleration(i, bodies, softening);
    }

    accelerations
}

/// Velocity Verlet integration step
///
/// This is a symplectic integrator that conserves energy well over long timescales.
///
/// Algorithm:
/// 1. x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
/// 2. Compute a(t+dt) using new positions
/// 3. v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
pub fn velocity_verlet_step(bodies: &mut [Body], dt: f64, softening: f64) {
    let n = bodies.len();
    let half_dt = 0.5 * dt;
    let half_dt_sq = 0.5 * dt * dt;

    // Store current accelerations and update positions
    for body in bodies.iter_mut() {
        if !body.active || body.fixed {
            continue;
        }

        // Store current acceleration for later
        body.prev_acceleration = body.acceleration;

        // Update position: x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt²
        body.position += body.velocity * dt + body.acceleration * half_dt_sq;
    }

    // Compute new accelerations with updated positions
    let new_accelerations = compute_all_accelerations(bodies, softening);

    // Update velocities and store new accelerations
    for (i, body) in bodies.iter_mut().enumerate() {
        if !body.active || body.fixed {
            continue;
        }

        // v(t+dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
        body.velocity += (body.prev_acceleration + new_accelerations[i]) * half_dt;
        body.acceleration = new_accelerations[i];
    }
}

/// Perform a full integration tick with substeps
///
/// Returns the number of substeps actually performed
pub fn integrate_tick(bodies: &mut [Body], config: &SimConfig) -> u32 {
    let substeps = config.max_substeps.min(4).max(1);
    let substep_dt = config.dt / substeps as f64;

    for _ in 0..substeps {
        velocity_verlet_step(bodies, substep_dt, config.softening);
    }

    substeps
}

/// Initialize accelerations for all bodies (call before first integration step)
pub fn initialize_accelerations(bodies: &mut [Body], softening: f64) {
    let accelerations = compute_all_accelerations(bodies, softening);
    for (i, body) in bodies.iter_mut().enumerate() {
        body.acceleration = accelerations[i];
        body.prev_acceleration = accelerations[i];
    }
}

/// Calculate total kinetic energy of the system
pub fn total_kinetic_energy(bodies: &[Body]) -> f64 {
    bodies
        .iter()
        .filter(|b| b.active)
        .map(|b| b.kinetic_energy())
        .sum()
}

/// Calculate total potential energy of the system
pub fn total_potential_energy(bodies: &[Body]) -> f64 {
    let mut pe = 0.0;

    for i in 0..bodies.len() {
        if !bodies[i].active || !bodies[i].has_mass() {
            continue;
        }

        for j in (i + 1)..bodies.len() {
            if !bodies[j].active || !bodies[j].has_mass() {
                continue;
            }

            let r = bodies[i].position.distance(bodies[j].position);
            if r > f64::EPSILON {
                pe -= G * bodies[i].mass * bodies[j].mass / r;
            }
        }
    }

    pe
}

/// Calculate total mechanical energy (kinetic + potential)
pub fn total_energy(bodies: &[Body]) -> f64 {
    total_kinetic_energy(bodies) + total_potential_energy(bodies)
}

/// Calculate total momentum of the system
pub fn total_momentum(bodies: &[Body]) -> Vec3 {
    bodies
        .iter()
        .filter(|b| b.active)
        .fold(Vec3::zero(), |acc, b| acc + b.momentum())
}

/// Calculate total angular momentum about the origin
pub fn total_angular_momentum(bodies: &[Body]) -> Vec3 {
    bodies
        .iter()
        .filter(|b| b.active)
        .fold(Vec3::zero(), |acc, b| acc + b.angular_momentum())
}

/// Calculate center of mass of the system
pub fn center_of_mass(bodies: &[Body]) -> Vec3 {
    let total_mass: f64 = bodies.iter().filter(|b| b.active).map(|b| b.mass).sum();

    if total_mass <= 0.0 {
        return Vec3::zero();
    }

    let weighted_sum: Vec3 = bodies
        .iter()
        .filter(|b| b.active)
        .fold(Vec3::zero(), |acc, b| acc + b.position * b.mass);

    weighted_sum / total_mass
}

/// Calculate center of mass velocity
pub fn center_of_mass_velocity(bodies: &[Body]) -> Vec3 {
    let total_mass: f64 = bodies.iter().filter(|b| b.active).map(|b| b.mass).sum();

    if total_mass <= 0.0 {
        return Vec3::zero();
    }

    total_momentum(bodies) / total_mass
}

/// Energy monitoring result
#[derive(Debug, Clone)]
pub struct EnergyMonitor {
    /// Initial total energy
    pub initial_energy: f64,
    /// Current total energy
    pub current_energy: f64,
    /// Energy drift (absolute)
    pub drift: f64,
    /// Energy drift (percentage)
    pub drift_percent: f64,
    /// Current kinetic energy
    pub kinetic: f64,
    /// Current potential energy
    pub potential: f64,
}

impl EnergyMonitor {
    /// Create a new energy monitor from initial state
    pub fn new(bodies: &[Body]) -> Self {
        let kinetic = total_kinetic_energy(bodies);
        let potential = total_potential_energy(bodies);
        let total = kinetic + potential;

        Self {
            initial_energy: total,
            current_energy: total,
            drift: 0.0,
            drift_percent: 0.0,
            kinetic,
            potential,
        }
    }

    /// Update the monitor with current state
    pub fn update(&mut self, bodies: &[Body]) {
        self.kinetic = total_kinetic_energy(bodies);
        self.potential = total_potential_energy(bodies);
        self.current_energy = self.kinetic + self.potential;
        self.drift = (self.current_energy - self.initial_energy).abs();

        if self.initial_energy.abs() > f64::EPSILON {
            self.drift_percent = 100.0 * self.drift / self.initial_energy.abs();
        } else {
            self.drift_percent = 0.0;
        }
    }

    /// Check if energy drift exceeds tolerance
    pub fn exceeds_tolerance(&self, tolerance_percent: f64) -> bool {
        self.drift_percent > tolerance_percent
    }
}

/// Momentum monitoring result
#[derive(Debug, Clone)]
pub struct MomentumMonitor {
    /// Initial total momentum
    pub initial_momentum: Vec3,
    /// Current total momentum
    pub current_momentum: Vec3,
    /// Momentum drift magnitude
    pub drift: f64,
}

impl MomentumMonitor {
    /// Create a new momentum monitor from initial state
    pub fn new(bodies: &[Body]) -> Self {
        let momentum = total_momentum(bodies);
        Self {
            initial_momentum: momentum,
            current_momentum: momentum,
            drift: 0.0,
        }
    }

    /// Update the monitor with current state
    pub fn update(&mut self, bodies: &[Body]) {
        self.current_momentum = total_momentum(bodies);
        self.drift = (self.current_momentum - self.initial_momentum).magnitude();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_two_body_circular_orbit() {
        // Set up Earth orbiting the Sun in a circular orbit
        let sun_mass = 1.989e30;
        let earth_mass = 5.972e24;
        let au = 1.496e11;

        // Circular velocity
        let v_circ = (G * sun_mass / au).sqrt();

        let sun = Body::star("sun", "Sun", sun_mass, 6.96e8)
            .at_position(0.0, 0.0, 0.0)
            .with_velocity_xyz(0.0, 0.0, 0.0);

        let earth = Body::planet("earth", "Earth", earth_mass, 6.371e6)
            .at_position(au, 0.0, 0.0)
            .with_velocity_xyz(0.0, v_circ, 0.0);

        let mut bodies = vec![sun, earth];

        // Initialize accelerations
        initialize_accelerations(&mut bodies, 1e6);

        // Record initial energy
        let initial_energy = total_energy(&bodies);

        // Simulate for a few hundred steps
        let config = SimConfig::default().with_dt(3600.0); // 1 hour steps

        for _ in 0..1000 {
            integrate_tick(&mut bodies, &config);
        }

        // Check energy conservation
        let final_energy = total_energy(&bodies);
        let drift_percent = 100.0 * (final_energy - initial_energy).abs() / initial_energy.abs();

        // Energy should be conserved within reasonable tolerance
        assert!(drift_percent < 0.1, "Energy drift too large: {}%", drift_percent);
    }

    #[test]
    fn test_acceleration_computation() {
        let sun = Body::star("sun", "Sun", 1.989e30, 6.96e8).at_position(0.0, 0.0, 0.0);

        let earth = Body::planet("earth", "Earth", 5.972e24, 6.371e6)
            .at_position(1.496e11, 0.0, 0.0);

        let bodies = vec![sun, earth];

        let accel = compute_acceleration(1, &bodies, 1e6);

        // Acceleration should point toward the sun (negative x)
        assert!(accel.x < 0.0);
        assert!(accel.y.abs() < 1e-20);
        assert!(accel.z.abs() < 1e-20);

        // Magnitude should be approximately g = GM/r² ≈ 5.93e-3 m/s²
        let expected_accel = G * 1.989e30 / (1.496e11 * 1.496e11);
        assert!((accel.magnitude() - expected_accel).abs() / expected_accel < 0.01);
    }

    #[test]
    fn test_momentum_conservation() {
        // Two bodies in isolated system
        let body1 = Body::new("a", "A", 1e10, 100.0)
            .at_position(0.0, 0.0, 0.0)
            .with_velocity_xyz(100.0, 0.0, 0.0);

        let body2 = Body::new("b", "B", 1e10, 100.0)
            .at_position(1e6, 0.0, 0.0)
            .with_velocity_xyz(-100.0, 0.0, 0.0);

        let mut bodies = vec![body1, body2];
        initialize_accelerations(&mut bodies, 1.0);

        let initial_momentum = total_momentum(&bodies);

        let config = SimConfig::default().with_dt(0.1);

        for _ in 0..1000 {
            integrate_tick(&mut bodies, &config);
        }

        let final_momentum = total_momentum(&bodies);

        // Momentum should be exactly conserved (within floating point error)
        let drift = (final_momentum - initial_momentum).magnitude();
        assert!(drift < 1e-6, "Momentum drift: {}", drift);
    }
}
