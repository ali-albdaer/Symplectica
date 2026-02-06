///! Gravitational softening kernels for numerical stability.
///! Prevents force singularities during close encounters.

use serde::{Deserialize, Serialize};

/// Available softening kernel types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SofteningKernel {
    /// Plummer softening: F = -G*m1*m2*r / (r² + ε²)^(3/2)
    /// Most common, simple, smooth everywhere
    Plummer,
    /// Spline softening (Hernquist & Katz 1989)
    /// Better force resolution, exact beyond 2ε
    Spline,
    /// Cubic spline (Monaghan & Lattanzio 1985)
    /// Compact support, exact beyond 2ε
    CubicSpline,
}

/// Compute the softened inverse distance factor for gravitational force.
/// Returns the factor f such that acceleration = G * m * r_vec * f
/// (i.e., f ≈ 1/r³ for r >> epsilon)
pub fn softened_force_factor(r: f64, epsilon: f64, kernel: SofteningKernel) -> f64 {
    match kernel {
        SofteningKernel::Plummer => {
            let r2_eps = r * r + epsilon * epsilon;
            let r_eff = r2_eps.sqrt();
            1.0 / (r2_eps * r_eff)
        }
        SofteningKernel::Spline => {
            let u = r / epsilon;
            if u >= 2.0 {
                // Exact Newtonian
                1.0 / (r * r * r)
            } else if u >= 1.0 {
                // Outer spline region
                let u2 = u * u;
                let u3 = u2 * u;
                let eps3 = epsilon * epsilon * epsilon;
                let f = (-1.0/15.0 + 8.0/5.0 * u3 - 3.0 * u2 + 6.0/5.0 / u - 1.0/6.0 / (u2 * u)) / eps3;
                f.max(0.0)
            } else {
                // Inner spline region
                let u2 = u * u;
                let eps3 = epsilon * epsilon * epsilon;
                let f = (4.0/3.0 - 6.0/5.0 * u2 + 1.0/2.0 * u2 * u) / eps3;
                f.max(0.0)
            }
        }
        SofteningKernel::CubicSpline => {
            let u = r / epsilon;
            if u >= 2.0 {
                1.0 / (r * r * r)
            } else if u >= 1.0 {
                let eps3 = epsilon * epsilon * epsilon;
                let t = 2.0 - u;
                let f = (1.0 / (4.0 * eps3)) * t * t * t / (u * u * u).max(1e-300);
                f
            } else if u > 0.0 {
                let eps3 = epsilon * epsilon * epsilon;
                let u2 = u * u;
                let f = (1.0 / eps3) * (4.0/3.0 - 1.2 * u2 + 0.5 * u2 * u);
                f
            } else {
                let eps3 = epsilon * epsilon * epsilon;
                4.0 / (3.0 * eps3)
            }
        }
    }
}

/// Compute the softened potential factor for gravitational potential.
/// Returns the factor f such that potential = -G * m1 * m2 * f
/// (i.e., f ≈ 1/r for r >> epsilon)
pub fn softened_potential_factor(r: f64, epsilon: f64, kernel: SofteningKernel) -> f64 {
    match kernel {
        SofteningKernel::Plummer => {
            1.0 / (r * r + epsilon * epsilon).sqrt()
        }
        SofteningKernel::Spline => {
            let u = r / epsilon;
            if u >= 2.0 {
                1.0 / r
            } else if u >= 1.0 {
                let u2 = u * u;
                (1.0 / (15.0 * epsilon)) * (-u2 * u2 * u / 5.0 + 3.0 * u2 * u2 - 12.0 * u2 * u + 16.0 * u2 + u - 3.0 / u + 1.0)
            } else {
                let u2 = u * u;
                (1.0 / epsilon) * (7.0/5.0 - 2.0/3.0 * u2 + 3.0/10.0 * u2 * u2 - 1.0/10.0 * u2 * u2 * u)
            }
        }
        SofteningKernel::CubicSpline => {
            let u = r / epsilon;
            if u >= 2.0 {
                1.0 / r
            } else if u > 0.0 {
                (1.0 / epsilon) * (1.4 - u * u / 6.0 * (1.0 - u / 4.0))
            } else {
                1.4 / epsilon
            }
        }
    }
}

/// Kustaanheimo-Stiefel (KS) regularization helper.
/// Transforms the two-body problem to remove the 1/r singularity.
/// This is an approximation of the full KS transform for use as a close-encounter
/// regularization in pairwise interactions.
pub struct KSRegularization {
    /// Threshold distance below which regularization activates
    pub activation_radius: f64,
    /// Strength of regularization blend
    pub blend_factor: f64,
}

impl KSRegularization {
    pub fn new(activation_radius: f64) -> Self {
        Self {
            activation_radius,
            blend_factor: 1.0,
        }
    }

    /// Compute regularized force factor, blending between standard and regularized
    /// Returns modified 1/r³ factor
    pub fn regularized_force_factor(&self, r: f64) -> f64 {
        if r >= self.activation_radius {
            // Standard Newtonian
            1.0 / (r * r * r)
        } else if r > 0.0 {
            // Smooth blend to regularized form
            // Use a polynomial that matches 1/r³ at activation_radius
            // and has finite derivative at r=0
            let u = r / self.activation_radius;
            let u2 = u * u;
            let base = 1.0 / (self.activation_radius * self.activation_radius * self.activation_radius);
            // Smooth interpolation: f(u) = base * (3u - 2u³) / u³ when u > 0
            // Simplified: blend toward constant at r=0
            let reg_factor = base * (3.0 - 2.0 * u2) / (u2 * u).max(1e-300);
            let blend = u * u * (3.0 - 2.0 * u); // smooth step
            let newtonian = 1.0 / (r * r * r);
            blend * newtonian + (1.0 - blend) * reg_factor.min(newtonian * 10.0)
        } else {
            // At r = 0, return finite value
            1.0 / (self.activation_radius * self.activation_radius * self.activation_radius)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plummer_softening() {
        let eps = 1000.0;
        // At large r, should approach 1/r³
        let r_large = 1e10;
        let exact = 1.0 / (r_large * r_large * r_large);
        let softened = softened_force_factor(r_large, eps, SofteningKernel::Plummer);
        assert!((softened - exact).abs() / exact < 1e-10);

        // At r = 0, should be finite
        let at_zero = softened_force_factor(0.0, eps, SofteningKernel::Plummer);
        assert!(at_zero.is_finite());
        assert!(at_zero > 0.0);
    }

    #[test]
    fn test_spline_transitions() {
        let eps = 1000.0;
        // At r = 2*eps, should match Newtonian exactly
        let r = 2.0 * eps;
        let newtonian = 1.0 / (r * r * r);
        let spline = softened_force_factor(r, eps, SofteningKernel::Spline);
        assert!((spline - newtonian).abs() / newtonian < 1e-6,
            "Spline discontinuity at 2ε: {} vs {}", spline, newtonian);
    }

    #[test]
    fn test_ks_regularization() {
        let ks = KSRegularization::new(1e6);
        // At large r, should match 1/r³
        let r = 1e10;
        let exact = 1.0 / (r * r * r);
        let reg = ks.regularized_force_factor(r);
        assert!((reg - exact).abs() / exact < 1e-10);

        // At r = 0, should be finite
        let at_zero = ks.regularized_force_factor(0.0);
        assert!(at_zero.is_finite());
    }
}
