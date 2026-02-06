///! Direct O(N²) gravitational force solver.
///! Exact pairwise computation — canonical reference implementation.

use crate::body::Body;
use crate::units::G;
use crate::vector::Vec3;
use super::{ForceResult, GravitySolver, SolverType};

pub struct DirectSolver;

impl GravitySolver for DirectSolver {
    fn compute_accelerations(
        &self,
        bodies: &[Body],
        softening_length: f64,
    ) -> ForceResult {
        let n = bodies.len();
        let mut accelerations = vec![Vec3::ZERO; n];
        let mut force_evaluations: u64 = 0;
        let eps2 = softening_length * softening_length;

        for i in 0..n {
            if !bodies[i].is_active { continue; }

            for j in 0..n {
                if i == j { continue; }
                if bodies[j].is_massless { continue; }

                let rij = bodies[j].position - bodies[i].position;
                let r2 = rij.magnitude_squared() + eps2;
                let r = r2.sqrt();
                let r3 = r2 * r;

                // a_i += G * m_j * r_ij / |r_ij + eps|³
                if r3 > 0.0 {
                    accelerations[i] += rij * (G * bodies[j].mass.value() / r3);
                }

                force_evaluations += 1;
            }
        }

        ForceResult {
            accelerations,
            force_evaluations,
            max_error_estimate: 0.0, // Exact solver, no error
        }
    }

    fn solver_type(&self) -> SolverType {
        SolverType::Direct
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::units::*;

    #[test]
    fn test_two_body_force() {
        let bodies = vec![
            Body::new(1, "A", BodyType::Star)
                .with_mass(Kilogram::new(1e30))
                .with_position(Vec3::ZERO),
            Body::new(2, "B", BodyType::Star)
                .with_mass(Kilogram::new(1e30))
                .with_position(Vec3::new(1e11, 0.0, 0.0)),
        ];

        let solver = DirectSolver;
        let result = solver.compute_accelerations(&bodies, 0.0);

        // Body A should accelerate toward body B (+x)
        assert!(result.accelerations[0].x > 0.0);
        // Body B should accelerate toward body A (-x)
        assert!(result.accelerations[1].x < 0.0);
        // By Newton's third law, |a1| * m1 = |a2| * m2
        let f1 = result.accelerations[0].magnitude() * bodies[0].mass.value();
        let f2 = result.accelerations[1].magnitude() * bodies[1].mass.value();
        assert!((f1 - f2).abs() / f1 < 1e-10);
    }

    #[test]
    fn test_massless_particle() {
        let bodies = vec![
            Body::new(1, "Star", BodyType::Star)
                .with_mass(Kilogram::new(SOLAR_MASS))
                .with_position(Vec3::ZERO),
            Body::new(2, "Particle", BodyType::TestParticle)
                .with_position(Vec3::new(AU, 0.0, 0.0))
                .as_test_particle(),
        ];

        let solver = DirectSolver;
        let result = solver.compute_accelerations(&bodies, 0.0);

        // Star should feel no force from massless particle
        assert!(result.accelerations[0].magnitude() < 1e-30);
        // Particle should feel force from star
        assert!(result.accelerations[1].magnitude() > 0.0);
    }

    #[test]
    fn test_softening() {
        // Two bodies very close — softening should prevent singularity
        let bodies = vec![
            Body::new(1, "A", BodyType::Star)
                .with_mass(Kilogram::new(1e30))
                .with_position(Vec3::ZERO),
            Body::new(2, "B", BodyType::Star)
                .with_mass(Kilogram::new(1e30))
                .with_position(Vec3::new(1.0, 0.0, 0.0)), // 1 meter apart
        ];

        let result_no_soft = DirectSolver.compute_accelerations(&bodies, 0.0);
        let result_soft = DirectSolver.compute_accelerations(&bodies, 1e6);

        // Softened force should be much weaker
        assert!(result_soft.accelerations[0].magnitude() < result_no_soft.accelerations[0].magnitude());
    }
}
