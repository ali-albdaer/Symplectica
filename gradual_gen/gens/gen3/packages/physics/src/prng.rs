//! PCG (Permuted Congruential Generator) random number generator
//!
//! Deterministic PRNG that produces identical sequences across Rust and TypeScript.
//! Implementation follows PCG-XSH-RR variant (32-bit output, 64-bit state).

use serde::{Deserialize, Serialize};

/// PCG-XSH-RR random number generator
///
/// This implementation is designed to be deterministic and reproducible
/// across different platforms (Rust native, WASM, JavaScript port).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pcg32 {
    /// Internal state
    state: u64,
    /// Increment (stream selector), must be odd
    inc: u64,
}

impl Pcg32 {
    /// Default multiplier for PCG
    const MULTIPLIER: u64 = 6364136223846793005;

    /// Create a new PCG with the given seed and stream
    ///
    /// # Arguments
    /// * `seed` - Initial seed value
    /// * `stream` - Stream selector (will be made odd internally)
    pub fn new(seed: u64, stream: u64) -> Self {
        let mut rng = Self {
            state: 0,
            inc: (stream << 1) | 1, // Ensure odd
        };
        // Advance state once
        rng.next_u32();
        // Mix in the seed
        rng.state = rng.state.wrapping_add(seed);
        // Advance again
        rng.next_u32();
        rng
    }

    /// Create a PCG seeded from the current time (non-deterministic)
    #[cfg(not(target_arch = "wasm32"))]
    pub fn from_entropy() -> Self {
        use std::time::{SystemTime, UNIX_EPOCH};
        let seed = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(0x853c49e6748fea9b);
        Self::new(seed, 0xda3e39cb94b95bdb)
    }

    /// Create a PCG seeded from entropy (WASM version)
    #[cfg(target_arch = "wasm32")]
    pub fn from_entropy() -> Self {
        let mut seed_bytes = [0u8; 8];
        getrandom::getrandom(&mut seed_bytes).unwrap_or_default();
        let seed = u64::from_le_bytes(seed_bytes);
        Self::new(seed, 0xda3e39cb94b95bdb)
    }

    /// Create a PCG from serialized state (for snapshot restore)
    pub fn from_state(state: u64, inc: u64) -> Self {
        Self { state, inc }
    }

    /// Get the current state for serialization
    pub fn get_state(&self) -> (u64, u64) {
        (self.state, self.inc)
    }

    /// Generate the next 32-bit unsigned integer
    pub fn next_u32(&mut self) -> u32 {
        let old_state = self.state;

        // Advance internal state
        self.state = old_state
            .wrapping_mul(Self::MULTIPLIER)
            .wrapping_add(self.inc);

        // Calculate output function (XSH-RR)
        let xorshifted = (((old_state >> 18) ^ old_state) >> 27) as u32;
        let rot = (old_state >> 59) as u32;
        xorshifted.rotate_right(rot)
    }

    /// Generate a 64-bit unsigned integer (two 32-bit values combined)
    pub fn next_u64(&mut self) -> u64 {
        let high = self.next_u32() as u64;
        let low = self.next_u32() as u64;
        (high << 32) | low
    }

    /// Generate a floating-point number in [0, 1)
    pub fn next_f64(&mut self) -> f64 {
        // Use 53 bits for full double precision mantissa
        let bits = self.next_u64() >> 11;
        bits as f64 * (1.0 / (1u64 << 53) as f64)
    }

    /// Generate a floating-point number in [min, max)
    pub fn next_f64_range(&mut self, min: f64, max: f64) -> f64 {
        min + (max - min) * self.next_f64()
    }

    /// Generate an integer in [0, bound)
    pub fn next_u32_bounded(&mut self, bound: u32) -> u32 {
        // Lemire's method for unbiased bounded random
        let mut x = self.next_u32();
        let mut m = (x as u64).wrapping_mul(bound as u64);
        let mut l = m as u32;

        if l < bound {
            let threshold = bound.wrapping_neg() % bound;
            while l < threshold {
                x = self.next_u32();
                m = (x as u64).wrapping_mul(bound as u64);
                l = m as u32;
            }
        }

        (m >> 32) as u32
    }

    /// Generate a random boolean
    pub fn next_bool(&mut self) -> bool {
        (self.next_u32() & 1) == 1
    }

    /// Generate a normally distributed random number (Box-Muller transform)
    pub fn next_gaussian(&mut self, mean: f64, std_dev: f64) -> f64 {
        // Box-Muller transform
        let u1 = self.next_f64();
        let u2 = self.next_f64();

        // Avoid log(0)
        let u1 = if u1 < f64::EPSILON { f64::EPSILON } else { u1 };

        let z0 = (-2.0 * u1.ln()).sqrt() * (2.0 * std::f64::consts::PI * u2).cos();
        mean + z0 * std_dev
    }

    /// Generate a random unit vector (uniform on sphere surface)
    pub fn next_unit_vector(&mut self) -> [f64; 3] {
        // Use rejection sampling for uniform distribution on sphere
        loop {
            let x = self.next_f64_range(-1.0, 1.0);
            let y = self.next_f64_range(-1.0, 1.0);
            let z = self.next_f64_range(-1.0, 1.0);

            let len_sq = x * x + y * y + z * z;

            if len_sq > f64::EPSILON && len_sq <= 1.0 {
                let len = len_sq.sqrt();
                return [x / len, y / len, z / len];
            }
        }
    }

    /// Shuffle a slice in place (Fisher-Yates)
    pub fn shuffle<T>(&mut self, slice: &mut [T]) {
        let len = slice.len();
        if len <= 1 {
            return;
        }

        for i in (1..len).rev() {
            let j = self.next_u32_bounded((i + 1) as u32) as usize;
            slice.swap(i, j);
        }
    }
}

impl Default for Pcg32 {
    fn default() -> Self {
        // Default seed for reproducible behavior
        Self::new(0x853c49e6748fea9b, 0xda3e39cb94b95bdb)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_determinism() {
        let mut rng1 = Pcg32::new(12345, 67890);
        let mut rng2 = Pcg32::new(12345, 67890);

        for _ in 0..1000 {
            assert_eq!(rng1.next_u32(), rng2.next_u32());
        }
    }

    #[test]
    fn test_known_sequence() {
        // Known sequence for seed=42, stream=54
        let mut rng = Pcg32::new(42, 54);

        // These values should be consistent across implementations
        let vals: Vec<u32> = (0..5).map(|_| rng.next_u32()).collect();

        // First value should always be deterministic for this seed
        assert_eq!(vals[0], 2707161783);
    }

    #[test]
    fn test_f64_range() {
        let mut rng = Pcg32::new(12345, 0);

        for _ in 0..10000 {
            let val = rng.next_f64();
            assert!(val >= 0.0 && val < 1.0);
        }
    }

    #[test]
    fn test_bounded() {
        let mut rng = Pcg32::new(12345, 0);
        let bound = 100u32;

        for _ in 0..10000 {
            let val = rng.next_u32_bounded(bound);
            assert!(val < bound);
        }
    }

    #[test]
    fn test_state_restore() {
        let mut rng = Pcg32::new(12345, 67890);

        // Generate some values
        for _ in 0..100 {
            rng.next_u32();
        }

        // Save state
        let (state, inc) = rng.get_state();

        // Generate more values
        let expected: Vec<u32> = (0..10).map(|_| rng.next_u32()).collect();

        // Restore state
        let mut rng2 = Pcg32::from_state(state, inc);

        // Should produce same values
        let actual: Vec<u32> = (0..10).map(|_| rng2.next_u32()).collect();

        assert_eq!(expected, actual);
    }

    #[test]
    fn test_unit_vector() {
        let mut rng = Pcg32::new(12345, 0);

        for _ in 0..1000 {
            let v = rng.next_unit_vector();
            let len_sq = v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
            assert!((len_sq - 1.0).abs() < 1e-10);
        }
    }
}
