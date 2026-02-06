///! Barnes-Hut octree gravitational solver.
///! O(N log N) approximate solver with tunable opening angle θ.

use crate::body::Body;
use crate::units::G;
use crate::vector::Vec3;
use super::{ForceResult, GravitySolver, SolverType};

/// Maximum depth of the octree
const MAX_DEPTH: usize = 40;

/// Octree node for Barnes-Hut
#[derive(Debug)]
struct OctreeNode {
    /// Center of mass of contained bodies
    center_of_mass: Vec3,
    /// Total mass
    total_mass: f64,
    /// Geometric center of the cell
    center: Vec3,
    /// Half-width of the cell
    half_width: f64,
    /// Children: 8 octants (None if leaf or empty)
    children: [Option<Box<OctreeNode>>; 8],
    /// If leaf, body index (None if internal node or empty)
    body_index: Option<usize>,
    /// Number of bodies in this subtree
    count: usize,
}

impl OctreeNode {
    fn new(center: Vec3, half_width: f64) -> Self {
        Self {
            center_of_mass: Vec3::ZERO,
            total_mass: 0.0,
            center,
            half_width,
            children: [None, None, None, None, None, None, None, None],
            body_index: None,
            count: 0,
        }
    }

    /// Determine which octant a position falls into
    fn octant(&self, pos: Vec3) -> usize {
        let mut idx = 0;
        if pos.x > self.center.x { idx |= 1; }
        if pos.y > self.center.y { idx |= 2; }
        if pos.z > self.center.z { idx |= 4; }
        idx
    }

    /// Get center of child octant
    fn child_center(&self, octant: usize) -> Vec3 {
        let q = self.half_width * 0.5;
        Vec3::new(
            self.center.x + if octant & 1 != 0 { q } else { -q },
            self.center.y + if octant & 2 != 0 { q } else { -q },
            self.center.z + if octant & 4 != 0 { q } else { -q },
        )
    }

    /// Insert a body into the octree
    fn insert(&mut self, idx: usize, pos: Vec3, mass: f64, depth: usize) {
        if depth >= MAX_DEPTH {
            // Merge into this node at max depth
            let total = self.total_mass + mass;
            if total > 0.0 {
                self.center_of_mass = (self.center_of_mass * self.total_mass + pos * mass) / total;
            }
            self.total_mass = total;
            self.count += 1;
            return;
        }

        if self.count == 0 {
            // Empty node — become a leaf
            self.body_index = Some(idx);
            self.center_of_mass = pos;
            self.total_mass = mass;
            self.count = 1;
            return;
        }

        if self.count == 1 {
            // Currently a leaf — split
            let old_idx = self.body_index.take().unwrap();
            let old_pos = self.center_of_mass;
            let old_mass = self.total_mass;

            let octant = self.octant(old_pos);
            let child_center = self.child_center(octant);
            let child_hw = self.half_width * 0.5;
            let child = self.children[octant]
                .get_or_insert_with(|| Box::new(OctreeNode::new(child_center, child_hw)));
            child.insert(old_idx, old_pos, old_mass, depth + 1);
        }

        // Insert the new body
        let octant = self.octant(pos);
        let child_center = self.child_center(octant);
        let child_hw = self.half_width * 0.5;
        let child = self.children[octant]
            .get_or_insert_with(|| Box::new(OctreeNode::new(child_center, child_hw)));
        child.insert(idx, pos, mass, depth + 1);

        // Update total mass and center of mass
        let total = self.total_mass + mass;
        if total > 0.0 {
            self.center_of_mass = (self.center_of_mass * self.total_mass + pos * mass) / total;
        }
        self.total_mass = total;
        self.count += 1;
    }

    /// Compute acceleration on a body using the Barnes-Hut criterion
    fn compute_accel(
        &self,
        pos: Vec3,
        body_idx: usize,
        theta: f64,
        eps2: f64,
        evals: &mut u64,
    ) -> Vec3 {
        if self.count == 0 || self.total_mass == 0.0 {
            return Vec3::ZERO;
        }

        let diff = self.center_of_mass - pos;
        let r2 = diff.magnitude_squared();

        // If this is a leaf with a single body
        if self.count == 1 {
            if let Some(idx) = self.body_index {
                if idx == body_idx {
                    return Vec3::ZERO; // Skip self
                }
            }
            let r2_soft = r2 + eps2;
            let r = r2_soft.sqrt();
            let r3 = r2_soft * r;
            *evals += 1;
            if r3 > 0.0 {
                return diff * (G * self.total_mass / r3);
            }
            return Vec3::ZERO;
        }

        // Barnes-Hut opening criterion: s/d < theta
        let s = self.half_width * 2.0;
        let d = r2.sqrt();
        if d > 0.0 && s / d < theta {
            // Use multipole approximation (monopole)
            let r2_soft = r2 + eps2;
            let r = r2_soft.sqrt();
            let r3 = r2_soft * r;
            *evals += 1;
            if r3 > 0.0 {
                return diff * (G * self.total_mass / r3);
            }
            return Vec3::ZERO;
        }

        // Otherwise, recurse into children
        let mut accel = Vec3::ZERO;
        for child in &self.children {
            if let Some(c) = child {
                accel += c.compute_accel(pos, body_idx, theta, eps2, evals);
            }
        }
        accel
    }
}

impl Default for OctreeNode {
    fn default() -> Self {
        Self::new(Vec3::ZERO, 1.0)
    }
}



pub struct BarnesHutSolver {
    theta: f64,
}

impl BarnesHutSolver {
    pub fn new(theta: f64) -> Self {
        Self { theta: theta.max(0.1) } // Minimum theta to avoid degeneracy
    }
}

impl GravitySolver for BarnesHutSolver {
    fn compute_accelerations(
        &self,
        bodies: &[Body],
        softening_length: f64,
    ) -> ForceResult {
        let n = bodies.len();
        if n == 0 {
            return ForceResult {
                accelerations: vec![],
                force_evaluations: 0,
                max_error_estimate: 0.0,
            };
        }

        // Find bounding box
        let mut min_pos = bodies[0].position;
        let mut max_pos = bodies[0].position;
        for body in bodies.iter() {
            min_pos = min_pos.min(body.position);
            max_pos = max_pos.max(body.position);
        }

        let center = (min_pos + max_pos) * 0.5;
        let extent = max_pos - min_pos;
        let half_width = extent.x.max(extent.y).max(extent.z) * 0.55 + 1.0; // Slight padding

        // Build octree
        let mut root = OctreeNode::new(center, half_width);
        for (i, body) in bodies.iter().enumerate() {
            if !body.is_massless && body.mass.value() > 0.0 {
                root.insert(i, body.position, body.mass.value(), 0);
            }
        }

        // Compute accelerations
        let eps2 = softening_length * softening_length;
        let mut accelerations = vec![Vec3::ZERO; n];
        let mut total_evals: u64 = 0;

        for i in 0..n {
            if !bodies[i].is_active { continue; }
            let mut evals: u64 = 0;
            accelerations[i] = root.compute_accel(
                bodies[i].position,
                i,
                self.theta,
                eps2,
                &mut evals,
            );
            total_evals += evals;
        }

        ForceResult {
            accelerations,
            force_evaluations: total_evals,
            // Error estimate based on theta
            max_error_estimate: self.theta * self.theta,
        }
    }

    fn solver_type(&self) -> SolverType {
        SolverType::BarnesHut
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::units::*;
    use crate::solvers::direct::DirectSolver;

    #[test]
    fn test_barnes_hut_vs_direct() {
        // Compare Barnes-Hut to direct solver for a small system
        let bodies = vec![
            Body::new(1, "Sun", BodyType::Star)
                .with_mass(Kilogram::new(SOLAR_MASS))
                .with_position(Vec3::ZERO),
            Body::new(2, "Earth", BodyType::Planet)
                .with_mass(Kilogram::new(EARTH_MASS))
                .with_position(Vec3::new(AU, 0.0, 0.0)),
            Body::new(3, "Mars", BodyType::Planet)
                .with_mass(Kilogram::new(6.39e23))
                .with_position(Vec3::new(0.0, 2.28e11, 0.0)),
        ];

        let direct = DirectSolver;
        let bh = BarnesHutSolver::new(0.3);

        let direct_result = direct.compute_accelerations(&bodies, 0.0);
        let bh_result = bh.compute_accelerations(&bodies, 0.0);

        // For this small system with low theta, results should be very close
        for i in 0..bodies.len() {
            let err = (direct_result.accelerations[i] - bh_result.accelerations[i]).magnitude();
            let mag = direct_result.accelerations[i].magnitude();
            if mag > 0.0 {
                let rel_err = err / mag;
                assert!(rel_err < 0.01,
                    "Body {} relative error too high: {:.6e}", i, rel_err);
            }
        }
    }
}
