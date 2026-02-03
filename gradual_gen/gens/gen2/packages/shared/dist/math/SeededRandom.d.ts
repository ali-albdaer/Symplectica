/**
 * Seedable Pseudo-Random Number Generator
 * ========================================
 * Uses xoshiro128** algorithm for high-quality, reproducible random numbers.
 * All procedural generation MUST use this PRNG for deterministic results.
 */
export declare class SeededRandom {
    private state;
    constructor(seed?: number | string);
    /**
     * Initialize the generator with a seed
     */
    seed(seed: number | string): void;
    /**
     * Hash a string to a number
     */
    private hashString;
    /**
     * Rotate left helper
     */
    private rotl;
    /**
     * Generate next random 32-bit integer (xoshiro128**)
     */
    next(): number;
    /**
     * Generate random float in [0, 1)
     */
    random(): number;
    /**
     * Generate random float in [min, max)
     */
    range(min: number, max: number): number;
    /**
     * Generate random integer in [min, max]
     */
    rangeInt(min: number, max: number): number;
    /**
     * Generate random gaussian with mean 0 and stddev 1 (Box-Muller)
     */
    gaussian(): number;
    /**
     * Generate random gaussian with custom mean and stddev
     */
    gaussianRange(mean: number, stddev: number): number;
    /**
     * Random boolean with given probability
     */
    chance(probability?: number): boolean;
    /**
     * Pick random element from array
     */
    pick<T>(array: readonly T[]): T | undefined;
    /**
     * Shuffle array in place (Fisher-Yates)
     */
    shuffle<T>(array: T[]): T[];
    /**
     * Generate random unit vector on sphere
     */
    unitVector3(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Generate random point in unit sphere
     */
    insideSphere(): {
        x: number;
        y: number;
        z: number;
    };
    /**
     * Get current state for serialization
     */
    getState(): number[];
    /**
     * Restore state from serialization
     */
    setState(state: readonly number[]): void;
    /**
     * Create a new generator with derived seed
     */
    derive(key: string | number): SeededRandom;
}
/**
 * Global seeded random instance
 * Set the seed at simulation start for reproducibility
 */
export declare const globalRandom: SeededRandom;
//# sourceMappingURL=SeededRandom.d.ts.map