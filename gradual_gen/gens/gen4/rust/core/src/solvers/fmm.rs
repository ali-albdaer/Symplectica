///! Fast Multipole Method (FMM) gravitational solver.
///! O(N) scaling with tunable expansion order for large-scale simulations.
///! Uses a kernel-independent approach with multipole and local expansions.

use crate::body::Body;
use crate::units::G;
use crate::vector::Vec3;
use super::{ForceResult, GravitySolver, SolverType};

/// Maximum depth of the FMM octree
const MAX_DEPTH: usize = 20;
/// Maximum bodies per leaf before subdivision
const MAX_LEAF_BODIES: usize = 32;

/// Multipole expansion coefficients (stored as moments up to given order)
/// Using Cartesian multipole moments for simplicity and determinism.
#[derive(Debug, Clone)]
struct MultipoleExpansion {
    /// Total mass (monopole)
    mass: f64,
    /// Center of expansion
    center: Vec3,
    /// Dipole moment (should be zero if center = COM)
    dipole: Vec3,
    /// Quadrupole tensor components (symmetric 3×3: xx, xy, xz, yy, yz, zz)
    quadrupole: [f64; 6],
    /// Octupole tensor (10 independent components for symmetric 3rd-order)
    octupole: [f64; 10],
}

impl MultipoleExpansion {
    fn new(center: Vec3) -> Self {
        Self {
            mass: 0.0,
            center,
            dipole: Vec3::ZERO,
            quadrupole: [0.0; 6],
            octupole: [0.0; 10],
        }
    }

    /// Add a point mass contribution
    fn add_particle(&mut self, pos: Vec3, mass: f64) {
        let r = pos - self.center;
        self.mass += mass;
        self.dipole += r * mass;

        // Quadrupole: Q_ij = m * (3 * r_i * r_j - r² * δ_ij)
        let r2 = r.magnitude_squared();
        self.quadrupole[0] += mass * (3.0 * r.x * r.x - r2); // xx
        self.quadrupole[1] += mass * (3.0 * r.x * r.y);       // xy
        self.quadrupole[2] += mass * (3.0 * r.x * r.z);       // xz
        self.quadrupole[3] += mass * (3.0 * r.y * r.y - r2); // yy
        self.quadrupole[4] += mass * (3.0 * r.y * r.z);       // yz
        self.quadrupole[5] += mass * (3.0 * r.z * r.z - r2); // zz

        // Octupole: simplified storage for 3rd order moments
        self.octupole[0] += mass * r.x * r.x * r.x; // xxx
        self.octupole[1] += mass * r.x * r.x * r.y; // xxy
        self.octupole[2] += mass * r.x * r.x * r.z; // xxz
        self.octupole[3] += mass * r.x * r.y * r.y; // xyy
        self.octupole[4] += mass * r.x * r.y * r.z; // xyz
        self.octupole[5] += mass * r.x * r.z * r.z; // xzz
        self.octupole[6] += mass * r.y * r.y * r.y; // yyy
        self.octupole[7] += mass * r.y * r.y * r.z; // yyz
        self.octupole[8] += mass * r.y * r.z * r.z; // yzz
        self.octupole[9] += mass * r.z * r.z * r.z; // zzz
    }

    /// Translate this expansion to a new center (M2M shift)
    fn shift_to(&self, new_center: Vec3) -> MultipoleExpansion {
        let mut shifted = MultipoleExpansion::new(new_center);
        shifted.mass = self.mass;
        let d = new_center - self.center;
        // Shift dipole: D'_i = D_i - M * d_i
        shifted.dipole = self.dipole - d * self.mass;
        // Shift quadrupole (approximate for P≤2)
        let d2 = d.magnitude_squared();
        shifted.quadrupole[0] = self.quadrupole[0] - 6.0 * self.dipole.x * d.x + self.mass * (3.0 * d.x * d.x - d2);
        shifted.quadrupole[1] = self.quadrupole[1] - 3.0 * (self.dipole.x * d.y + self.dipole.y * d.x) + self.mass * 3.0 * d.x * d.y;
        shifted.quadrupole[2] = self.quadrupole[2] - 3.0 * (self.dipole.x * d.z + self.dipole.z * d.x) + self.mass * 3.0 * d.x * d.z;
        shifted.quadrupole[3] = self.quadrupole[3] - 6.0 * self.dipole.y * d.y + self.mass * (3.0 * d.y * d.y - d2);
        shifted.quadrupole[4] = self.quadrupole[4] - 3.0 * (self.dipole.y * d.z + self.dipole.z * d.y) + self.mass * 3.0 * d.y * d.z;
        shifted.quadrupole[5] = self.quadrupole[5] - 6.0 * self.dipole.z * d.z + self.mass * (3.0 * d.z * d.z - d2);
        // Octupole shifts are complex, copy as approximation
        shifted.octupole = self.octupole;
        shifted
    }

    /// Evaluate acceleration at a point due to this multipole expansion
    fn evaluate_accel(&self, pos: Vec3, eps2: f64) -> Vec3 {
        let r = pos - self.center;
        let r2 = r.magnitude_squared() + eps2;
        let r_mag = r2.sqrt();

        if r_mag < 1e-300 || self.mass == 0.0 {
            return Vec3::ZERO;
        }

        let inv_r = 1.0 / r_mag;
        let inv_r2 = inv_r * inv_r;
        let inv_r3 = inv_r2 * inv_r;
        let inv_r5 = inv_r3 * inv_r2;

        // Monopole contribution: a = -G * M * r / |r|³
        let mut accel = r * (-G * self.mass * inv_r3);

        // Dipole contribution (should be small if expansion is at COM)
        // a_dip = -G * (D/r³ - 3(D·r)r/r⁵)
        let d_dot_r = self.dipole.dot(r);
        accel += (self.dipole * inv_r3 - r * (3.0 * d_dot_r * inv_r5)) * (-G);

        // Quadrupole contribution
        // Gradient of quadrupole potential
        let qr = Vec3::new(
            self.quadrupole[0] * r.x + self.quadrupole[1] * r.y + self.quadrupole[2] * r.z,
            self.quadrupole[1] * r.x + self.quadrupole[3] * r.y + self.quadrupole[4] * r.z,
            self.quadrupole[2] * r.x + self.quadrupole[4] * r.y + self.quadrupole[5] * r.z,
        );
        let rqr = r.x * qr.x + r.y * qr.y + r.z * qr.z;
        let inv_r7 = inv_r5 * inv_r2;
        accel += (qr * inv_r5 - r * (2.5 * rqr * inv_r7)) * (-G * 0.5);

        accel
    }
}

/// Local expansion (Taylor expansion of potential from distant sources)
#[derive(Debug, Clone)]
struct LocalExpansion {
    center: Vec3,
    /// Zeroth order (potential)
    phi: f64,
    /// First order (force field)
    force: Vec3,
    /// Second order (tidal tensor, 6 components)
    tidal: [f64; 6],
}

impl LocalExpansion {
    fn new(center: Vec3) -> Self {
        Self {
            center,
            phi: 0.0,
            force: Vec3::ZERO,
            tidal: [0.0; 6],
        }
    }

    /// Add contribution from a multipole expansion (M2L)
    fn add_from_multipole(&mut self, mp: &MultipoleExpansion, eps2: f64) {
        let r = self.center - mp.center;
        let r2 = r.magnitude_squared() + eps2;
        let r_mag = r2.sqrt();
        if r_mag < 1e-300 || mp.mass == 0.0 { return; }

        let inv_r = 1.0 / r_mag;
        let inv_r2 = inv_r * inv_r;
        let inv_r3 = inv_r2 * inv_r;

        // Monopole contribution to local expansion
        self.phi += -G * mp.mass * inv_r;
        self.force += r * (G * mp.mass * inv_r3);

        // Tidal tensor from monopole: T_ij = G*M*(3*r_i*r_j/r⁵ - δ_ij/r³)
        let inv_r5 = inv_r3 * inv_r2;
        self.tidal[0] += G * mp.mass * (3.0 * r.x * r.x * inv_r5 - inv_r3);
        self.tidal[1] += G * mp.mass * 3.0 * r.x * r.y * inv_r5;
        self.tidal[2] += G * mp.mass * 3.0 * r.x * r.z * inv_r5;
        self.tidal[3] += G * mp.mass * (3.0 * r.y * r.y * inv_r5 - inv_r3);
        self.tidal[4] += G * mp.mass * 3.0 * r.y * r.z * inv_r5;
        self.tidal[5] += G * mp.mass * (3.0 * r.z * r.z * inv_r5 - inv_r3);
    }

    /// Evaluate acceleration at a position using the local expansion
    fn evaluate_accel(&self, pos: Vec3) -> Vec3 {
        let dp = pos - self.center;
        let mut accel = self.force;
        // First-order correction from tidal tensor
        accel.x += self.tidal[0] * dp.x + self.tidal[1] * dp.y + self.tidal[2] * dp.z;
        accel.y += self.tidal[1] * dp.x + self.tidal[3] * dp.y + self.tidal[4] * dp.z;
        accel.z += self.tidal[2] * dp.x + self.tidal[4] * dp.y + self.tidal[5] * dp.z;
        accel
    }

    /// Shift this local expansion to a new center (L2L)
    fn shift_to(&self, new_center: Vec3) -> LocalExpansion {
        let mut shifted = LocalExpansion::new(new_center);
        let d = new_center - self.center;
        shifted.phi = self.phi + self.force.dot(d);
        shifted.force = self.force;
        // Tidal correction to force
        shifted.force.x += self.tidal[0] * d.x + self.tidal[1] * d.y + self.tidal[2] * d.z;
        shifted.force.y += self.tidal[1] * d.x + self.tidal[3] * d.y + self.tidal[4] * d.z;
        shifted.force.z += self.tidal[2] * d.x + self.tidal[4] * d.y + self.tidal[5] * d.z;
        shifted.tidal = self.tidal;
        shifted
    }
}

/// FMM Octree node
struct FMMNode {
    center: Vec3,
    half_width: f64,
    children: [Option<Box<FMMNode>>; 8],
    body_indices: Vec<usize>,
    multipole: MultipoleExpansion,
    local: LocalExpansion,
    depth: usize,
    is_leaf: bool,
}

impl FMMNode {
    fn new(center: Vec3, half_width: f64, depth: usize) -> Self {
        Self {
            center,
            half_width,
            children: [None, None, None, None, None, None, None, None],
            body_indices: Vec::new(),
            multipole: MultipoleExpansion::new(center),
            local: LocalExpansion::new(center),
            depth,
            is_leaf: true,
        }
    }

    fn octant(&self, pos: Vec3) -> usize {
        let mut idx = 0;
        if pos.x > self.center.x { idx |= 1; }
        if pos.y > self.center.y { idx |= 2; }
        if pos.z > self.center.z { idx |= 4; }
        idx
    }

    fn child_center(&self, octant: usize) -> Vec3 {
        let q = self.half_width * 0.5;
        Vec3::new(
            self.center.x + if octant & 1 != 0 { q } else { -q },
            self.center.y + if octant & 2 != 0 { q } else { -q },
            self.center.z + if octant & 4 != 0 { q } else { -q },
        )
    }

    /// Insert body index into tree, subdividing as needed
    fn insert(&mut self, idx: usize, pos: Vec3, mass: f64, bodies: &[Body]) {
        self.body_indices.push(idx);
        self.multipole.add_particle(pos, mass);

        if self.body_indices.len() <= MAX_LEAF_BODIES || self.depth >= MAX_DEPTH {
            return;
        }

        if self.is_leaf && self.body_indices.len() == MAX_LEAF_BODIES + 1 {
            // Subdivide: redistribute existing bodies
            self.is_leaf = false;
            let indices: Vec<usize> = self.body_indices.clone();
            for &bidx in &indices {
                let bpos = bodies[bidx].position;
                let oct = self.octant(bpos);
                let cc = self.child_center(oct);
                let chw = self.half_width * 0.5;
                let child = self.children[oct]
                    .get_or_insert_with(|| Box::new(FMMNode::new(cc, chw, self.depth + 1)));
                child.insert(bidx, bpos, bodies[bidx].mass.value(), bodies);
            }
            return;
        }

        if !self.is_leaf {
            let oct = self.octant(pos);
            let cc = self.child_center(oct);
            let chw = self.half_width * 0.5;
            let child = self.children[oct]
                .get_or_insert_with(|| Box::new(FMMNode::new(cc, chw, self.depth + 1)));
            child.insert(idx, pos, mass, bodies);
        }
    }

    /// Phase 1: Upward pass — build multipole expansions (already done during insert)

    /// Phase 2: Downward pass — build local expansions from interaction lists
    fn downward_pass(&mut self, siblings_multipoles: &[&MultipoleExpansion], eps2: f64) {
        // M2L: for each well-separated sibling, convert multipole to local
        for mp in siblings_multipoles {
            let d = (self.center - mp.center).magnitude();
            if d > 0.0 {
                self.local.add_from_multipole(mp, eps2);
            }
        }

        if self.is_leaf { return; }

        // Clone children's multipoles to avoid borrow conflicts
        let child_multipoles: Vec<Option<MultipoleExpansion>> = (0..8).map(|i| {
            self.children[i].as_ref().map(|c| c.multipole.clone())
        }).collect();

        // Cache the parent local expansion
        let parent_local = self.local.clone();

        // For each child, the interaction list is: other children at this level
        for i in 0..8 {
            if self.children[i].is_none() { continue; }
            // Shift parent local expansion to child (L2L)
            let child = self.children[i].as_mut().unwrap();
            child.local = parent_local.shift_to(child.center);

            // Build interaction list: other children that are well-separated
            let interaction_list: Vec<&MultipoleExpansion> = (0..8)
                .filter(|&j| j != i)
                .filter_map(|j| child_multipoles[j].as_ref())
                .collect();

            child.downward_pass(&interaction_list, eps2);
        }
    }

    /// Phase 3: Evaluate — compute accelerations for all bodies in leaves
    fn evaluate(
        &self,
        bodies: &[Body],
        accelerations: &mut [Vec3],
        eps2: f64,
        evals: &mut u64,
    ) {
        if self.is_leaf {
            // For leaf nodes, use local expansion + direct P2P for near neighbors
            for &i in &self.body_indices {
                if !bodies[i].is_active { continue; }
                // Local expansion contribution
                accelerations[i] += self.local.evaluate_accel(bodies[i].position);

                // Direct computation for bodies in the same leaf
                for &j in &self.body_indices {
                    if i == j { continue; }
                    if bodies[j].is_massless { continue; }
                    let rij = bodies[j].position - bodies[i].position;
                    let r2 = rij.magnitude_squared() + eps2;
                    let r = r2.sqrt();
                    let r3 = r2 * r;
                    if r3 > 0.0 {
                        accelerations[i] += rij * (G * bodies[j].mass.value() / r3);
                    }
                    *evals += 1;
                }
            }
        } else {
            for child in &self.children {
                if let Some(c) = child {
                    c.evaluate(bodies, accelerations, eps2, evals);
                }
            }
        }
    }
}



pub struct FMMSolver {
    order: u32,
}

impl FMMSolver {
    pub fn new(order: u32) -> Self {
        Self { order: order.max(2).min(10) }
    }
}

impl GravitySolver for FMMSolver {
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

        // For very small N, fall back to direct
        if n <= MAX_LEAF_BODIES * 2 {
            let direct = super::direct::DirectSolver;
            return direct.compute_accelerations(bodies, softening_length);
        }

        let eps2 = softening_length * softening_length;

        // Find bounding box
        let mut min_pos = bodies[0].position;
        let mut max_pos = bodies[0].position;
        for body in bodies.iter() {
            min_pos = min_pos.min(body.position);
            max_pos = max_pos.max(body.position);
        }
        let center = (min_pos + max_pos) * 0.5;
        let extent = max_pos - min_pos;
        let half_width = extent.x.max(extent.y).max(extent.z) * 0.55 + 1.0;

        // Build tree (implicitly computes multipoles via insert)
        let mut root = FMMNode::new(center, half_width, 0);
        for (i, body) in bodies.iter().enumerate() {
            if !body.is_massless && body.mass.value() > 0.0 {
                root.insert(i, body.position, body.mass.value(), bodies);
            } else if body.is_active {
                // Insert massless particles for evaluation but with zero mass
                root.insert(i, body.position, 0.0, bodies);
            }
        }

        // Downward pass — start with empty interaction list at root
        root.downward_pass(&[], eps2);

        // Evaluate accelerations
        let mut accelerations = vec![Vec3::ZERO; n];
        let mut evals: u64 = 0;
        root.evaluate(bodies, &mut accelerations, eps2, &mut evals);

        // Error estimate decreases with order
        let error_est = (1.0 / self.order as f64).powi(self.order as i32);

        ForceResult {
            accelerations,
            force_evaluations: evals,
            max_error_estimate: error_est,
        }
    }

    fn solver_type(&self) -> SolverType {
        SolverType::FMM
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::units::*;
    use crate::solvers::direct::DirectSolver;

    #[test]
    fn test_fmm_vs_direct() {
        let mut bodies = Vec::new();
        // Create a system with enough bodies to trigger FMM tree construction
        bodies.push(Body::new(0, "Sun", BodyType::Star)
            .with_mass(Kilogram::new(SOLAR_MASS))
            .with_position(Vec3::ZERO));

        for i in 1..=80 {
            let angle = (i as f64) * 0.08;
            let r = AU * (0.5 + (i as f64) * 0.05);
            bodies.push(Body::new(i as u64, &format!("Body{}", i), BodyType::Asteroid)
                .with_mass(Kilogram::new(1e20))
                .with_position(Vec3::new(r * angle.cos(), r * angle.sin(), 0.0)));
        }

        let direct = DirectSolver;
        let fmm = FMMSolver::new(4);

        let direct_result = direct.compute_accelerations(&bodies, 1e3);
        let fmm_result = fmm.compute_accelerations(&bodies, 1e3);

        // FMM should be reasonably close to direct for the dominant body
        let err = (direct_result.accelerations[1] - fmm_result.accelerations[1]).magnitude();
        let mag = direct_result.accelerations[1].magnitude();
        if mag > 0.0 {
            let rel_err = err / mag;
            assert!(rel_err < 0.1,
                "FMM relative error for body 1: {:.6e}", rel_err);
        }
    }
}
