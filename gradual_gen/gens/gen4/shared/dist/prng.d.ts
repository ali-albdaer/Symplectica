/**
 * Deterministic xoshiro256** PRNG — matches the Rust implementation exactly.
 * Uses BigInt for 64-bit integer arithmetic.
 */
export declare class DeterministicRng {
    private s;
    constructor(seed: number | bigint);
    /** Restore from saved state */
    static fromState(state: [bigint, bigint, bigint, bigint]): DeterministicRng;
    /** Get the current internal state for checkpointing */
    getState(): [bigint, bigint, bigint, bigint];
    /** Generate the next u64 value (xoshiro256** algorithm) */
    nextU64(): bigint;
    /** Generate a float64 in [0, 1) */
    nextF64(): number;
    /** Generate a float64 in [min, max) */
    nextF64Range(min: number, max: number): number;
    /** Generate a normally distributed value (Box-Muller) */
    nextNormal(mean?: number, stddev?: number): number;
    /** Generate a random unit vector on the sphere */
    nextUnitVector(): [number, number, number];
    /** Shuffle an array in place (Fisher-Yates) */
    shuffle<T>(array: T[]): T[];
}
//# sourceMappingURL=prng.d.ts.map