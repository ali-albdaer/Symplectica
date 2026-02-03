/**
 * Seedable Pseudo-Random Number Generator
 * ========================================
 * Uses xoshiro128** algorithm for high-quality, reproducible random numbers.
 * All procedural generation MUST use this PRNG for deterministic results.
 */

export class SeededRandom {
  private state: Uint32Array;

  constructor(seed: number | string = Date.now()) {
    this.state = new Uint32Array(4);
    this.seed(seed);
  }

  /**
   * Initialize the generator with a seed
   */
  seed(seed: number | string): void {
    // Convert string seed to number using hash
    const numSeed = typeof seed === 'string' ? this.hashString(seed) : seed;
    
    // Use splitmix64 to initialize state
    let s = numSeed >>> 0;
    for (let i = 0; i < 4; i++) {
      s = (s + 0x9e3779b9) >>> 0;
      let z = s;
      z = ((z ^ (z >>> 16)) * 0x85ebca6b) >>> 0;
      z = ((z ^ (z >>> 13)) * 0xc2b2ae35) >>> 0;
      z = (z ^ (z >>> 16)) >>> 0;
      this.state[i] = z;
    }

    // Warm up the generator
    for (let i = 0; i < 20; i++) {
      this.next();
    }
  }

  /**
   * Hash a string to a number
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) >>> 0;
    }
    return hash;
  }

  /**
   * Rotate left helper
   */
  private rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  /**
   * Generate next random 32-bit integer (xoshiro128**)
   */
  next(): number {
    const s = this.state;
    const result = (this.rotl((s[1]! * 5) >>> 0, 7) * 9) >>> 0;
    const t = (s[1]! << 9) >>> 0;

    s[2] = (s[2]! ^ s[0]!) >>> 0;
    s[3] = (s[3]! ^ s[1]!) >>> 0;
    s[1] = (s[1]! ^ s[2]!) >>> 0;
    s[0] = (s[0]! ^ s[3]!) >>> 0;

    s[2] = (s[2]! ^ t) >>> 0;
    s[3] = this.rotl(s[3]!, 11);

    return result;
  }

  /**
   * Generate random float in [0, 1)
   */
  random(): number {
    return this.next() / 0x100000000;
  }

  /**
   * Generate random float in [min, max)
   */
  range(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  /**
   * Generate random integer in [min, max]
   */
  rangeInt(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Generate random gaussian with mean 0 and stddev 1 (Box-Muller)
   */
  gaussian(): number {
    const u1 = this.random();
    const u2 = this.random();
    return Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Generate random gaussian with custom mean and stddev
   */
  gaussianRange(mean: number, stddev: number): number {
    return mean + this.gaussian() * stddev;
  }

  /**
   * Random boolean with given probability
   */
  chance(probability: number = 0.5): boolean {
    return this.random() < probability;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: readonly T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.rangeInt(0, array.length - 1)];
  }

  /**
   * Shuffle array in place (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.rangeInt(0, i);
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
    return array;
  }

  /**
   * Generate random unit vector on sphere
   */
  unitVector3(): { x: number; y: number; z: number } {
    const theta = this.range(0, 2 * Math.PI);
    const phi = Math.acos(this.range(-1, 1));
    const sinPhi = Math.sin(phi);
    return {
      x: sinPhi * Math.cos(theta),
      y: sinPhi * Math.sin(theta),
      z: Math.cos(phi)
    };
  }

  /**
   * Generate random point in unit sphere
   */
  insideSphere(): { x: number; y: number; z: number } {
    const v = this.unitVector3();
    const r = Math.cbrt(this.random()); // cube root for uniform volume distribution
    return {
      x: v.x * r,
      y: v.y * r,
      z: v.z * r
    };
  }

  /**
   * Get current state for serialization
   */
  getState(): number[] {
    return Array.from(this.state);
  }

  /**
   * Restore state from serialization
   */
  setState(state: readonly number[]): void {
    for (let i = 0; i < 4; i++) {
      this.state[i] = state[i] ?? 0;
    }
  }

  /**
   * Create a new generator with derived seed
   */
  derive(key: string | number): SeededRandom {
    const derived = new SeededRandom();
    derived.setState(this.getState());
    // Mix in the key
    const keyNum = typeof key === 'string' ? this.hashString(key) : key;
    derived.state[0] = (derived.state[0]! ^ keyNum) >>> 0;
    for (let i = 0; i < 10; i++) {
      derived.next();
    }
    return derived;
  }
}

/**
 * Global seeded random instance
 * Set the seed at simulation start for reproducibility
 */
export const globalRandom = new SeededRandom(42);
