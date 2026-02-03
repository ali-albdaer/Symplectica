/**
 * PCG Random Number Generator (TypeScript implementation)
 * 
 * This implementation matches the Rust PCG-XSH-RR exactly for determinism.
 * Uses BigInt for 64-bit arithmetic.
 */

const PCG_MULTIPLIER = 6364136223846793005n;

/**
 * PCG-XSH-RR random number generator
 * 
 * Produces identical sequences to the Rust implementation.
 */
export class Pcg32 {
    private state: bigint;
    private inc: bigint;

    /**
     * Create a new PCG with seed and stream
     */
    constructor(seed: bigint = 0n, stream: bigint = 0n) {
        this.state = 0n;
        this.inc = (stream << 1n) | 1n; // Ensure odd

        // Advance state once
        this.nextU32();

        // Mix in the seed
        this.state = (this.state + seed) & 0xFFFFFFFFFFFFFFFFn;

        // Advance again
        this.nextU32();
    }

    /**
     * Create from saved state
     */
    static fromState(state: bigint, inc: bigint): Pcg32 {
        const rng = new Pcg32(0n, 0n);
        rng.state = state;
        rng.inc = inc;
        return rng;
    }

    /**
     * Get current state for serialization
     */
    getState(): [bigint, bigint] {
        return [this.state, this.inc];
    }

    /**
     * Generate next 32-bit unsigned integer
     */
    nextU32(): number {
        const oldState = this.state;

        // Advance internal state
        this.state = ((oldState * PCG_MULTIPLIER) + this.inc) & 0xFFFFFFFFFFFFFFFFn;

        // Calculate output function (XSH-RR)
        const xorshifted = Number(((oldState >> 18n) ^ oldState) >> 27n) >>> 0;
        const rot = Number(oldState >> 59n);

        // Rotate right
        return ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31))) >>> 0;
    }

    /**
     * Generate a 64-bit unsigned integer
     */
    nextU64(): bigint {
        const high = BigInt(this.nextU32());
        const low = BigInt(this.nextU32());
        return (high << 32n) | low;
    }

    /**
     * Generate a float in [0, 1)
     */
    nextF64(): number {
        // Use 53 bits for full double precision mantissa
        const bits = this.nextU64() >> 11n;
        return Number(bits) / (1 << 53);
    }

    /**
     * Generate a float in [min, max)
     */
    nextF64Range(min: number, max: number): number {
        return min + (max - min) * this.nextF64();
    }

    /**
     * Generate an integer in [0, bound)
     */
    nextU32Bounded(bound: number): number {
        if (bound <= 0) return 0;

        // Lemire's method for unbiased bounded random
        let x = this.nextU32();
        let m = BigInt(x) * BigInt(bound);
        let l = Number(m & 0xFFFFFFFFn);

        if (l < bound) {
            const threshold = ((-bound) >>> 0) % bound;
            while (l < threshold) {
                x = this.nextU32();
                m = BigInt(x) * BigInt(bound);
                l = Number(m & 0xFFFFFFFFn);
            }
        }

        return Number(m >> 32n);
    }

    /**
     * Generate a random boolean
     */
    nextBool(): boolean {
        return (this.nextU32() & 1) === 1;
    }

    /**
     * Generate a normally distributed random number (Box-Muller transform)
     */
    nextGaussian(mean: number = 0, stdDev: number = 1): number {
        let u1 = this.nextF64();
        const u2 = this.nextF64();

        // Avoid log(0)
        if (u1 < Number.EPSILON) u1 = Number.EPSILON;

        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z0 * stdDev;
    }

    /**
     * Generate a random unit vector (uniform on sphere surface)
     */
    nextUnitVector(): [number, number, number] {
        while (true) {
            const x = this.nextF64Range(-1, 1);
            const y = this.nextF64Range(-1, 1);
            const z = this.nextF64Range(-1, 1);

            const lenSq = x * x + y * y + z * z;

            if (lenSq > Number.EPSILON && lenSq <= 1) {
                const len = Math.sqrt(lenSq);
                return [x / len, y / len, z / len];
            }
        }
    }

    /**
     * Shuffle an array in place (Fisher-Yates)
     */
    shuffle<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextU32Bounded(i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Choose a random element from an array
     */
    choose<T>(array: T[]): T | undefined {
        if (array.length === 0) return undefined;
        return array[this.nextU32Bounded(array.length)];
    }
}

// Test determinism
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    const rng1 = new Pcg32(42n, 54n);
    const rng2 = new Pcg32(42n, 54n);

    for (let i = 0; i < 1000; i++) {
        const v1 = rng1.nextU32();
        const v2 = rng2.nextU32();
        if (v1 !== v2) {
            throw new Error(`PRNG determinism failed at iteration ${i}`);
        }
    }
}
