//! Barnes-Hut Octree for O(N log N) gravitational force calculation
//!
//! The Barnes-Hut algorithm approximates distant clusters of bodies as single
//! point masses, reducing the O(N²) pairwise calculation to O(N log N).
//!
//! Reference: Universe Sandbox uses this approach for galaxy simulations.
//! Paper: "A hierarchical O(N log N) force-calculation algorithm" by Barnes & Hut (1986)

use crate::body::Body;
use crate::constants::G;
use crate::force::ForceConfig;
use crate::vector::Vec3;

/// Maximum octree depth to prevent infinite recursion
const MAX_DEPTH: usize = 32;

/// A node in the octree
#[derive(Debug)]
pub struct OctreeNode {
    /// Center of this cell
    pub center: Vec3,
    
    /// Half-size of this cell (distance from center to edge)
    pub half_size: f64,
    
    /// Total mass in this cell
    pub total_mass: f64,
    
    /// Center of mass of all bodies in this cell
    pub center_of_mass: Vec3,
    
    /// Children nodes (8 octants, None if leaf or empty)
    pub children: [Option<Box<OctreeNode>>; 8],
    
    /// Body index if this is a leaf with exactly one body
    pub body_index: Option<usize>,
    
    /// Number of bodies in this subtree
    pub body_count: usize,
}

impl OctreeNode {
    /// Create a new empty octree node
    pub fn new(center: Vec3, half_size: f64) -> Self {
        Self {
            center,
            half_size,
            total_mass: 0.0,
            center_of_mass: Vec3::ZERO,
            children: Default::default(),
            body_index: None,
            body_count: 0,
        }
    }

    /// Determine which octant a position falls into
    /// Returns an index 0-7 based on position relative to center
    fn octant_index(&self, pos: Vec3) -> usize {
        let mut index = 0;
        if pos.x >= self.center.x { index |= 1; }
        if pos.y >= self.center.y { index |= 2; }
        if pos.z >= self.center.z { index |= 4; }
        index
    }

    /// Get the center of a child octant
    fn child_center(&self, octant: usize) -> Vec3 {
        let offset = self.half_size * 0.5;
        Vec3::new(
            self.center.x + if octant & 1 != 0 { offset } else { -offset },
            self.center.y + if octant & 2 != 0 { offset } else { -offset },
            self.center.z + if octant & 4 != 0 { offset } else { -offset },
        )
    }

    /// Insert a body into the octree
    pub fn insert(&mut self, bodies: &[Body], body_idx: usize, depth: usize) {
        let body = &bodies[body_idx];
        
        if !body.is_active || body.mass <= 0.0 {
            return;
        }

        // Update mass and center of mass
        let new_total_mass = self.total_mass + body.mass;
        self.center_of_mass = (self.center_of_mass * self.total_mass + body.position * body.mass) 
            / new_total_mass;
        self.total_mass = new_total_mass;
        self.body_count += 1;

        // Prevent infinite recursion
        if depth >= MAX_DEPTH {
            return;
        }

        match self.body_index {
            None if self.body_count == 1 => {
                // First body in this node, make it a leaf
                self.body_index = Some(body_idx);
            }
            None => {
                // Internal node with children, insert into appropriate child
                let octant = self.octant_index(body.position);
                self.ensure_child(octant);
                if let Some(ref mut child) = self.children[octant] {
                    child.insert(bodies, body_idx, depth + 1);
                }
            }
            Some(existing_idx) => {
                // This is a leaf with one body, need to split
                self.body_index = None;
                
                // Re-insert the existing body into a child
                let existing_octant = self.octant_index(bodies[existing_idx].position);
                self.ensure_child(existing_octant);
                if let Some(ref mut child) = self.children[existing_octant] {
                    child.insert(bodies, existing_idx, depth + 1);
                }
                
                // Insert the new body into a child
                let new_octant = self.octant_index(body.position);
                self.ensure_child(new_octant);
                if let Some(ref mut child) = self.children[new_octant] {
                    child.insert(bodies, body_idx, depth + 1);
                }
            }
        }
    }

    /// Ensure a child node exists for the given octant
    fn ensure_child(&mut self, octant: usize) {
        if self.children[octant].is_none() {
            let child_center = self.child_center(octant);
            let child_half_size = self.half_size * 0.5;
            self.children[octant] = Some(Box::new(OctreeNode::new(child_center, child_half_size)));
        }
    }

    /// Calculate acceleration on a body using Barnes-Hut approximation
    /// 
    /// If the cell is far enough (s/d < theta), treat it as a single mass.
    /// Otherwise, recursively traverse children.
    pub fn calculate_acceleration(
        &self,
        pos: Vec3,
        theta: f64,
        softening_squared: f64,
    ) -> Vec3 {
        if self.body_count == 0 || self.total_mass <= 0.0 {
            return Vec3::ZERO;
        }

        let r = self.center_of_mass - pos;
        let r_squared = r.length_squared();
        
        // Avoid self-interaction
        if r_squared < softening_squared * 0.01 {
            return Vec3::ZERO;
        }

        let distance = r_squared.sqrt();
        
        // Barnes-Hut criterion: s/d < θ where s is cell size, d is distance
        let cell_size = self.half_size * 2.0;
        
        if cell_size / distance < theta || self.body_index.is_some() {
            // Far enough to approximate as point mass, or this is a single-body leaf
            let denom = (r_squared + softening_squared).powf(1.5);
            if denom > 0.0 {
                return r * (G * self.total_mass / denom);
            }
            return Vec3::ZERO;
        }

        // Too close, need to traverse children
        let mut acceleration = Vec3::ZERO;
        for child in &self.children {
            if let Some(ref node) = child {
                acceleration += node.calculate_acceleration(pos, theta, softening_squared);
            }
        }
        acceleration
    }
}

/// Barnes-Hut Octree for N-body simulation
#[derive(Debug)]
pub struct Octree {
    root: Option<OctreeNode>,
    /// Bounding box center
    pub center: Vec3,
    /// Bounding box half-size
    pub half_size: f64,
}

impl Octree {
    /// Create a new empty octree
    pub fn new() -> Self {
        Self {
            root: None,
            center: Vec3::ZERO,
            half_size: 1.0,
        }
    }

    /// Build the octree from a list of bodies
    pub fn build(&mut self, bodies: &[Body]) {
        // First, compute bounding box
        let (min, max) = self.compute_bounds(bodies);
        
        self.center = (min + max) * 0.5;
        self.half_size = ((max - min) * 0.5).abs().x
            .max(((max - min) * 0.5).abs().y)
            .max(((max - min) * 0.5).abs().z);
        
        // Add some margin
        self.half_size *= 1.1;
        
        // Ensure minimum size
        if self.half_size < 1e6 {
            self.half_size = 1e12; // 1 trillion meters as minimum
        }

        // Create root and insert all bodies
        self.root = Some(OctreeNode::new(self.center, self.half_size));
        
        for (idx, body) in bodies.iter().enumerate() {
            if body.is_active && body.is_massive {
                if let Some(ref mut root) = self.root {
                    root.insert(bodies, idx, 0);
                }
            }
        }
    }

    /// Compute bounds of all active bodies
    fn compute_bounds(&self, bodies: &[Body]) -> (Vec3, Vec3) {
        let mut min = Vec3::new(f64::MAX, f64::MAX, f64::MAX);
        let mut max = Vec3::new(f64::MIN, f64::MIN, f64::MIN);
        
        for body in bodies.iter().filter(|b| b.is_active && b.is_massive) {
            min = min.min(body.position);
            max = max.max(body.position);
        }
        
        if min.x == f64::MAX {
            // No bodies, return default bounds
            return (Vec3::ZERO, Vec3::ZERO);
        }
        
        (min, max)
    }

    /// Calculate acceleration on a body using Barnes-Hut
    pub fn calculate_acceleration(&self, pos: Vec3, theta: f64, softening_squared: f64) -> Vec3 {
        match &self.root {
            Some(root) => root.calculate_acceleration(pos, theta, softening_squared),
            None => Vec3::ZERO,
        }
    }

    /// Get statistics about the tree
    pub fn stats(&self) -> OctreeStats {
        let mut stats = OctreeStats::default();
        if let Some(ref root) = self.root {
            self.collect_stats(root, 0, &mut stats);
        }
        stats
    }

    fn collect_stats(&self, node: &OctreeNode, depth: usize, stats: &mut OctreeStats) {
        stats.node_count += 1;
        stats.max_depth = stats.max_depth.max(depth);
        
        if node.body_index.is_some() {
            stats.leaf_count += 1;
        }
        
        for child in &node.children {
            if let Some(ref c) = child {
                self.collect_stats(c, depth + 1, stats);
            }
        }
    }
}

impl Default for Octree {
    fn default() -> Self {
        Self::new()
    }
}

/// Statistics about an octree
#[derive(Debug, Default)]
pub struct OctreeStats {
    pub node_count: usize,
    pub leaf_count: usize,
    pub max_depth: usize,
}

/// Compute accelerations using Barnes-Hut algorithm
pub fn compute_accelerations_barnes_hut(bodies: &mut [Body], config: &ForceConfig) {
    let softening_squared = config.softening * config.softening;
    
    // Build octree
    let mut octree = Octree::new();
    octree.build(bodies);
    
    // Calculate accelerations
    for body in bodies.iter_mut() {
        if !body.is_active {
            continue;
        }
        
        body.acceleration = octree.calculate_acceleration(
            body.position,
            config.barnes_hut_theta,
            softening_squared,
        );
    }
}

/// Compare Barnes-Hut accuracy against direct sum
/// Returns (max_relative_error, mean_relative_error)
pub fn compare_accuracy(bodies: &[Body], theta: f64, softening: f64) -> (f64, f64) {
    use crate::force::compute_accelerations_direct;
    
    let mut direct_bodies = bodies.to_vec();
    let mut bh_bodies = bodies.to_vec();
    
    let config = ForceConfig {
        softening,
        barnes_hut_theta: theta,
    };
    
    compute_accelerations_direct(&mut direct_bodies, &config);
    compute_accelerations_barnes_hut(&mut bh_bodies, &config);
    
    let mut max_error = 0.0f64;
    let mut total_error = 0.0;
    let mut count = 0;
    
    for (direct, bh) in direct_bodies.iter().zip(bh_bodies.iter()) {
        if !direct.is_active || !direct.is_massive {
            continue;
        }
        
        let direct_mag = direct.acceleration.length();
        if direct_mag > 0.0 {
            let error_mag = (direct.acceleration - bh.acceleration).length();
            let relative_error = error_mag / direct_mag;
            max_error = max_error.max(relative_error);
            total_error += relative_error;
            count += 1;
        }
    }
    
    let mean_error = if count > 0 { total_error / count as f64 } else { 0.0 };
    (max_error, mean_error)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::body::BodyType;
    use crate::constants::*;

    fn create_solar_system() -> Vec<Body> {
        vec![
            Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO),
            Body::new(
                1, "Earth", BodyType::Planet, M_EARTH, R_EARTH,
                Vec3::new(AU, 0.0, 0.0),
                Vec3::new(0.0, 29784.0, 0.0),
            ),
            Body::new(
                2, "Mars", BodyType::Planet, 6.39e23, 3.3895e6,
                Vec3::new(1.524 * AU, 0.0, 0.0),
                Vec3::new(0.0, 24077.0, 0.0),
            ),
            Body::new(
                3, "Jupiter", BodyType::Planet, 1.898e27, 6.9911e7,
                Vec3::new(5.2 * AU, 0.0, 0.0),
                Vec3::new(0.0, 13070.0, 0.0),
            ),
        ]
    }

    #[test]
    fn test_octree_build() {
        let bodies = create_solar_system();
        let mut octree = Octree::new();
        octree.build(&bodies);
        
        let stats = octree.stats();
        assert!(stats.node_count > 0);
        assert!(stats.leaf_count > 0);
        println!("Octree stats: {:?}", stats);
    }

    #[test]
    fn test_barnes_hut_accuracy() {
        let bodies = create_solar_system();
        
        // Test with different theta values
        for theta in [0.3, 0.5, 0.7, 1.0] {
            let (max_error, mean_error) = compare_accuracy(&bodies, theta, DEFAULT_SOFTENING);
            println!("Theta={}: max_error={:.2}%, mean_error={:.2}%", 
                theta, max_error * 100.0, mean_error * 100.0);
            
            // With theta <= 0.5, error should be < 1%
            if theta <= 0.5 {
                assert!(max_error < 0.01, "Error too high for theta={}: {}", theta, max_error);
            }
        }
    }

    #[test]
    fn test_single_body() {
        let bodies = vec![
            Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO),
        ];
        
        let mut octree = Octree::new();
        octree.build(&bodies);
        
        let acc = octree.calculate_acceleration(
            Vec3::new(AU, 0.0, 0.0),
            0.5,
            DEFAULT_SOFTENING * DEFAULT_SOFTENING,
        );
        
        // Acceleration toward sun
        assert!(acc.x < 0.0);
        assert!(acc.y.abs() < 1e-20);
    }

    #[test]
    fn test_many_bodies() {
        use crate::prng::Pcg32;
        
        let mut rng = Pcg32::new(42);
        let mut bodies = vec![
            Body::new(0, "Sun", BodyType::Star, M_SUN, R_SUN, Vec3::ZERO, Vec3::ZERO),
        ];
        
        // Add 50 random asteroids
        for i in 1..51 {
            let distance = rng.next_f64_range(0.5 * AU, 4.0 * AU);
            let angle = rng.next_f64() * 2.0 * std::f64::consts::PI;
            let pos = Vec3::new(distance * angle.cos(), distance * angle.sin(), 0.0);
            let v = (G * M_SUN / distance).sqrt();
            let vel = Vec3::new(-v * angle.sin(), v * angle.cos(), 0.0);
            
            bodies.push(Body::new(
                i as u32,
                format!("Asteroid{}", i),
                BodyType::Asteroid,
                1e15, // 1 quadrillion kg
                1000.0,
                pos,
                vel,
            ));
        }
        
        let (max_error, mean_error) = compare_accuracy(&bodies, 0.5, DEFAULT_SOFTENING);
        println!("50 bodies: max_error={:.2}%, mean_error={:.2}%", 
            max_error * 100.0, mean_error * 100.0);
        
        // Should still be accurate with theta=0.5
        assert!(mean_error < 0.05, "Mean error too high: {}", mean_error);
    }
}
