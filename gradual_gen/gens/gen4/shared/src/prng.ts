/**
 * Deterministic xoshiro256** PRNG — matches the Rust implementation exactly.
 * Uses BigInt for 64-bit integer arithmetic.
 */

const MASK64 = 0xFFFF_FFFF_FFFF_FFFFn;

function rotl64(x: bigint, k: number): bigint {
  return ((x << BigInt(k)) | (x >> BigInt(64 - k))) & MASK64;
}

/** SplitMix64 used for seeding */
function splitmix64(state: bigint): [bigint, bigint] {
  let z = (state + 0x9E3779B97F4A7C15n) & MASK64;
  const newState = z;
  z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
  z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
  z = (z ^ (z >> 31n)) & MASK64;
  return [newState, z];
}

export class DeterministicRng {
  private s: [bigint, bigint, bigint, bigint];

  constructor(seed: number | bigint) {
    const seedBig = BigInt(seed) & MASK64;
    let state = seedBig;
    const s: bigint[] = [];
    for (let i = 0; i < 4; i++) {
      let val: bigint;
      [state, val] = splitmix64(state);
      s.push(val);
    }
    this.s = [s[0], s[1], s[2], s[3]];
  }

  /** Restore from saved state */
  static fromState(state: [bigint, bigint, bigint, bigint]): DeterministicRng {
    const rng = Object.create(DeterministicRng.prototype) as DeterministicRng;
    rng.s = [...state];
    return rng;
  }

  /** Get the current internal state for checkpointing */
  getState(): [bigint, bigint, bigint, bigint] {
    return [...this.s];
  }

  /** Generate the next u64 value (xoshiro256** algorithm) */
  nextU64(): bigint {
    const result = (rotl64((this.s[1] * 5n) & MASK64, 7) * 9n) & MASK64;

    const t = (this.s[1] << 17n) & MASK64;

    this.s[2] = (this.s[2] ^ this.s[0]) & MASK64;
    this.s[3] = (this.s[3] ^ this.s[1]) & MASK64;
    this.s[1] = (this.s[1] ^ this.s[2]) & MASK64;
    this.s[0] = (this.s[0] ^ this.s[3]) & MASK64;

    this.s[2] = (this.s[2] ^ t) & MASK64;
    this.s[3] = rotl64(this.s[3], 45);

    return result;
  }

  /** Generate a float64 in [0, 1) */
  nextF64(): number {
    const u = this.nextU64();
    // Convert top 53 bits to f64 in [0, 1)
    return Number(u >> 11n) / (2 ** 53);
  }

  /** Generate a float64 in [min, max) */
  nextF64Range(min: number, max: number): number {
    return min + this.nextF64() * (max - min);
  }

  /** Generate a normally distributed value (Box-Muller) */
  nextNormal(mean = 0, stddev = 1): number {
    const u1 = this.nextF64();
    const u2 = this.nextF64();
    const z0 = Math.sqrt(-2.0 * Math.log(u1 || 1e-300)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stddev;
  }

  /** Generate a random unit vector on the sphere */
  nextUnitVector(): [number, number, number] {
    const z = this.nextF64Range(-1, 1);
    const phi = this.nextF64Range(0, 2 * Math.PI);
    const r = Math.sqrt(1 - z * z);
    return [r * Math.cos(phi), r * Math.sin(phi), z];
  }

  /** Shuffle an array in place (Fisher-Yates) */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Number(this.nextU64() % BigInt(i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
