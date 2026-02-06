///! Conservation quantity monitors.
///! Continuously tracks total energy, momentum, angular momentum, and mass.
///! Provides diagnostics, warnings, and corrective actions when thresholds are exceeded.

use crate::vector::Vec3;
use crate::units::*;
use serde::{Deserialize, Serialize};

/// Conserved quantities at a given tick
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConservedQuantities {
    pub tick: u64,
    pub total_energy: f64,
    pub kinetic_energy: f64,
    pub potential_energy: f64,
    pub linear_momentum: Vec3,
    pub angular_momentum: Vec3,
    pub total_mass: f64,
    pub linear_momentum_magnitude: f64,
    pub angular_momentum_magnitude: f64,
}

impl Default for ConservedQuantities {
    fn default() -> Self {
        Self {
            tick: 0,
            total_energy: 0.0,
            kinetic_energy: 0.0,
            potential_energy: 0.0,
            linear_momentum: Vec3::ZERO,
            angular_momentum: Vec3::ZERO,
            total_mass: 0.0,
            linear_momentum_magnitude: 0.0,
            angular_momentum_magnitude: 0.0,
        }
    }
}

/// Result of a conservation check
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConservationDiagnostics {
    pub energy_relative_error: f64,
    pub momentum_relative_error: f64,
    pub angular_momentum_relative_error: f64,
    pub mass_relative_error: f64,
    pub energy_drift_rate: f64, // per tick
    pub warnings: Vec<String>,
    pub needs_correction: bool,
    pub needs_integrator_change: bool,
}

/// Conservation monitor that tracks quantities over time
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConservationMonitor {
    /// Initial (reference) conserved quantities
    pub initial: ConservedQuantities,
    /// Previous tick's quantities
    pub previous: ConservedQuantities,
    /// Current quantities
    pub current: ConservedQuantities,
    /// Running count of ticks
    pub tick_count: u64,
    /// Cumulative energy drift
    pub cumulative_energy_drift: f64,
    /// Warning threshold for relative errors
    pub warn_threshold: f64,
    /// Error threshold for corrective action
    pub error_threshold: f64,
    /// Whether initial reference has been set
    pub initialized: bool,
    /// History of energy error for drift rate estimation
    pub energy_error_history: Vec<f64>,
    /// Maximum history length
    pub max_history: usize,
}

impl ConservationMonitor {
    pub fn new(warn_threshold: f64, error_threshold: f64) -> Self {
        Self {
            initial: ConservedQuantities::default(),
            previous: ConservedQuantities::default(),
            current: ConservedQuantities::default(),
            tick_count: 0,
            cumulative_energy_drift: 0.0,
            warn_threshold,
            error_threshold,
            initialized: false,
            energy_error_history: Vec::new(),
            max_history: 1000,
        }
    }

    /// Set the initial reference state
    pub fn set_reference(&mut self, q: ConservedQuantities) {
        self.initial = q.clone();
        self.previous = q.clone();
        self.current = q;
        self.initialized = true;
        self.tick_count = 0;
        self.cumulative_energy_drift = 0.0;
        self.energy_error_history.clear();
    }

    /// Update with new quantities and check for violations
    pub fn update(&mut self, q: ConservedQuantities) -> ConservationDiagnostics {
        self.previous = self.current.clone();
        self.current = q;
        self.tick_count += 1;

        if !self.initialized {
            return ConservationDiagnostics {
                energy_relative_error: 0.0,
                momentum_relative_error: 0.0,
                angular_momentum_relative_error: 0.0,
                mass_relative_error: 0.0,
                energy_drift_rate: 0.0,
                warnings: vec!["Conservation monitor not initialized".to_string()],
                needs_correction: false,
                needs_integrator_change: false,
            };
        }

        let mut warnings = Vec::new();
        let mut needs_correction = false;
        let mut needs_integrator_change = false;

        // Energy error
        let energy_err = if self.initial.total_energy.abs() > 1e-100 {
            ((self.current.total_energy - self.initial.total_energy) / self.initial.total_energy).abs()
        } else {
            (self.current.total_energy - self.initial.total_energy).abs()
        };

        // Momentum error
        let p_err = if self.initial.linear_momentum_magnitude > 1e-100 {
            (self.current.linear_momentum - self.initial.linear_momentum).magnitude()
                / self.initial.linear_momentum_magnitude
        } else {
            (self.current.linear_momentum - self.initial.linear_momentum).magnitude()
        };

        // Angular momentum error
        let l_err = if self.initial.angular_momentum_magnitude > 1e-100 {
            (self.current.angular_momentum - self.initial.angular_momentum).magnitude()
                / self.initial.angular_momentum_magnitude
        } else {
            (self.current.angular_momentum - self.initial.angular_momentum).magnitude()
        };

        // Mass error
        let m_err = if self.initial.total_mass > 0.0 {
            ((self.current.total_mass - self.initial.total_mass) / self.initial.total_mass).abs()
        } else {
            0.0
        };

        // Track energy error history
        self.energy_error_history.push(energy_err);
        if self.energy_error_history.len() > self.max_history {
            self.energy_error_history.remove(0);
        }

        // Compute drift rate
        let drift_rate = if self.tick_count > 1 {
            let prev_err = if self.initial.total_energy.abs() > 1e-100 {
                ((self.previous.total_energy - self.initial.total_energy) / self.initial.total_energy).abs()
            } else { 0.0 };
            energy_err - prev_err
        } else { 0.0 };

        self.cumulative_energy_drift += drift_rate.abs();

        // Check thresholds
        if energy_err > self.warn_threshold {
            warnings.push(format!("Energy drift: {:.6e} (threshold: {:.6e})", energy_err, self.warn_threshold));
        }
        if energy_err > self.error_threshold {
            warnings.push(format!("CRITICAL energy drift: {:.6e}", energy_err));
            needs_correction = true;
            needs_integrator_change = true;
        }

        if p_err > self.warn_threshold {
            warnings.push(format!("Momentum drift: {:.6e}", p_err));
        }
        if l_err > self.warn_threshold {
            warnings.push(format!("Angular momentum drift: {:.6e}", l_err));
        }
        if m_err > 1e-15 {
            warnings.push(format!("Mass not conserved: {:.6e}", m_err));
        }

        ConservationDiagnostics {
            energy_relative_error: energy_err,
            momentum_relative_error: p_err,
            angular_momentum_relative_error: l_err,
            mass_relative_error: m_err,
            energy_drift_rate: drift_rate,
            warnings,
            needs_correction,
            needs_integrator_change,
        }
    }

    /// Get a summary string for display
    pub fn summary(&self) -> String {
        if !self.initialized {
            return "Conservation monitor: not initialized".to_string();
        }
        let e_err = if self.initial.total_energy.abs() > 1e-100 {
            ((self.current.total_energy - self.initial.total_energy) / self.initial.total_energy).abs()
        } else { 0.0 };

        format!(
            "E_err={:.3e} | KE={:.3e} PE={:.3e} | p={:.3e} L={:.3e} M={:.3e}",
            e_err,
            self.current.kinetic_energy,
            self.current.potential_energy,
            self.current.linear_momentum_magnitude,
            self.current.angular_momentum_magnitude,
            self.current.total_mass,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_conservation_monitor() {
        let mut monitor = ConservationMonitor::new(1e-6, 1e-3);

        let initial = ConservedQuantities {
            tick: 0,
            total_energy: -1e30,
            kinetic_energy: 5e29,
            potential_energy: -1.5e30,
            linear_momentum: Vec3::new(1e20, 0.0, 0.0),
            angular_momentum: Vec3::new(0.0, 0.0, 1e35),
            total_mass: 2e30,
            linear_momentum_magnitude: 1e20,
            angular_momentum_magnitude: 1e35,
        };
        monitor.set_reference(initial);

        // Slight drift
        let q1 = ConservedQuantities {
            tick: 1,
            total_energy: -1e30 * (1.0 + 1e-8),
            kinetic_energy: 5e29,
            potential_energy: -1.5e30,
            linear_momentum: Vec3::new(1e20, 0.0, 0.0),
            angular_momentum: Vec3::new(0.0, 0.0, 1e35),
            total_mass: 2e30,
            linear_momentum_magnitude: 1e20,
            angular_momentum_magnitude: 1e35,
        };
        let diag = monitor.update(q1);
        assert!(diag.energy_relative_error < 1e-6);
        assert!(!diag.needs_correction);
    }
}
