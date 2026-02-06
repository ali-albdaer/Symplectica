///! Deterministic PRNG using xoshiro256** algorithm.
///! Identical output across Rust native and WASM, and matched by TypeScript implementation.
///! All state is serializable for snapshot/replay determinism.

use serde::{Deserialize, Serialize};

/// xoshiro256** deterministic PRNG
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeterministicRng {
    state: [u64; 4],
}

impl DeterministicRng {
    /// Create from a 64-bit seed using SplitMix64 to fill state
    pub fn new(seed: u64) -> Self {
        let mut sm = SplitMix64(seed);
        Self {
            state: [sm.next(), sm.next(), sm.next(), sm.next()],
        }
    }

    /// Create from full 256-bit state (for snapshot restore)
    pub fn from_state(state: [u64; 4]) -> Self {
        Self { state }
    }

    /// Get current state for snapshotting
    pub fn get_state(&self) -> [u64; 4] {
        self.state
    }

    /// Generate next u64
    #[inline]
    pub fn next_u64(&mut self) -> u64 {
        let result = self.state[1].wrapping_mul(5).rotate_left(7).wrapping_mul(9);
        let t = self.state[1] << 17;

        self.state[2] ^= self.state[0];
        self.state[3] ^= self.state[1];
        self.state[1] ^= self.state[2];
        self.state[0] ^= self.state[3];

        self.state[2] ^= t;
        self.state[3] = self.state[3].rotate_left(45);

        result
    }

    /// Generate u32
    #[inline]
    pub fn next_u32(&mut self) -> u32 {
        (self.next_u64() >> 32) as u32
    }

    /// Generate f64 in [0, 1)
    #[inline]
    pub fn next_f64(&mut self) -> f64 {
        let bits = self.next_u64();
        // Use top 53 bits for double precision
        (bits >> 11) as f64 * (1.0 / (1u64 << 53) as f64)
    }

    /// Generate f64 in [min, max)
    #[inline]
    pub fn next_f64_range(&mut self, min: f64, max: f64) -> f64 {
        min + self.next_f64() * (max - min)
    }

    /// Generate f64 with normal distribution (Box-Muller transform)
    pub fn next_normal(&mut self, mean: f64, std_dev: f64) -> f64 {
        let u1 = self.next_f64().max(1e-300); // Avoid log(0)
        let u2 = self.next_f64();
        let z = (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos();
        mean + z * std_dev
    }

    /// Generate a random unit vector on the sphere
    pub fn next_unit_vector(&mut self) -> [f64; 3] {
        let z = self.next_f64_range(-1.0, 1.0);
        let phi = self.next_f64_range(0.0, 2.0 * std::f64::consts::PI);
        let r = (1.0 - z * z).sqrt();
        [r * phi.cos(), r * phi.sin(), z]
    }

    /// Generate a random integer in [0, n)
    pub fn next_usize(&mut self, n: usize) -> usize {
        if n == 0 { return 0; }
        (self.next_u64() % n as u64) as usize
    }

    /// Shuffle a slice deterministically (Fisher-Yates)
    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        let n = slice.len();
        for i in (1..n).rev() {
            let j = self.next_usize(i + 1);
            slice.swap(i, j);
        }
    }
}

/// SplitMix64 used for seeding
struct SplitMix64(u64);

impl SplitMix64 {
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E3779B97F4A7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
        z ^ (z >> 31)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_determinism() {
        let mut rng1 = DeterministicRng::new(12345);
        let mut rng2 = DeterministicRng::new(12345);

        for _ in 0..1000 {
            assert_eq!(rng1.next_u64(), rng2.next_u64());
        }
    }

    #[test]
    fn test_state_restore() {
        let mut rng = DeterministicRng::new(42);
        // Advance some steps
        for _ in 0..100 {
            rng.next_u64();
        }
        let state = rng.get_state();

        // Continue generating
        let expected: Vec<u64> = (0..10).map(|_| rng.next_u64()).collect();

        // Restore and compare
        let mut rng2 = DeterministicRng::from_state(state);
        let actual: Vec<u64> = (0..10).map(|_| rng2.next_u64()).collect();

        assert_eq!(expected, actual);
    }

    #[test]
    fn test_f64_range() {
        let mut rng = DeterministicRng::new(0);
        for _ in 0..10000 {
            let v = rng.next_f64();
            assert!(v >= 0.0 && v < 1.0, "f64 out of range: {}", v);
        }
    }

    #[test]
    fn test_distribution_uniformity() {
        let mut rng = DeterministicRng::new(1);
        let mut buckets = [0u32; 10];
        let n = 100_000;
        for _ in 0..n {
            let v = rng.next_f64();
            let bucket = (v * 10.0) as usize;
            if bucket < 10 { buckets[bucket] += 1; }
        }
        // Each bucket should have roughly n/10 = 10000
        for &count in &buckets {
            assert!((count as f64 - 10000.0).abs() < 500.0,
                "Distribution not uniform: {:?}", buckets);
        }
    }

    #[test]
    fn test_serialization() {
        let rng = DeterministicRng::new(42);
        let json = serde_json::to_string(&rng).unwrap();
        let restored: DeterministicRng = serde_json::from_str(&json).unwrap();
        assert_eq!(rng.state, restored.state);
    }
}
