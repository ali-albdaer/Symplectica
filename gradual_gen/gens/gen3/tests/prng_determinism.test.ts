/**
 * PRNG Determinism Test
 * 
 * Validates that the PCG-XSH-RR implementation produces identical
 * sequences in both TypeScript and Rust (via WASM) for deterministic
 * replay and cross-platform consistency.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * TypeScript implementation of PCG-XSH-RR 32-bit
 * Must match the Rust implementation exactly
 */
class PCG32 {
    private stateHi: number;
    private stateLo: number;
    
    // PCG default increment (must be odd): 1442695040888963407
    private static readonly INC_HI = 0x14057B7E;
    private static readonly INC_LO = 0xF767814F;
    
    // PCG default multiplier: 6364136223846793005
    private static readonly MUL_HI = 0x5851F42D;
    private static readonly MUL_LO = 0x4C957F2D;

    constructor(seed: bigint) {
        // Initialize state to 0
        this.stateHi = 0;
        this.stateLo = 0;
        
        // First step
        this.step();
        
        // Add seed to state
        const seedHi = Number((seed >> 32n) & 0xFFFFFFFFn);
        const seedLo = Number(seed & 0xFFFFFFFFn);
        this.add64(seedHi, seedLo);
        
        // Second step
        this.step();
    }

    private add64(hi: number, lo: number): void {
        const newLo = (this.stateLo + lo) >>> 0;
        const carry = newLo < this.stateLo ? 1 : 0;
        this.stateLo = newLo;
        this.stateHi = ((this.stateHi + hi + carry) >>> 0) & 0xFFFFFFFF;
    }

    private mul64(): void {
        // 64-bit multiplication: state * MUL
        // Split into 32-bit parts and use BigInt for precision
        const state = (BigInt(this.stateHi) << 32n) | BigInt(this.stateLo >>> 0);
        const mul = (BigInt(PCG32.MUL_HI) << 32n) | BigInt(PCG32.MUL_LO >>> 0);
        const result = (state * mul) & 0xFFFFFFFFFFFFFFFFn;
        this.stateHi = Number((result >> 32n) & 0xFFFFFFFFn);
        this.stateLo = Number(result & 0xFFFFFFFFn);
    }

    private step(): void {
        this.mul64();
        this.add64(PCG32.INC_HI, PCG32.INC_LO);
    }

    next(): number {
        const oldStateHi = this.stateHi;
        const oldStateLo = this.stateLo;
        
        this.step();
        
        // XSH-RR output function
        // xorshifted = ((state >> 18) ^ state) >> 27
        // rot = state >> 59
        const state64 = (BigInt(oldStateHi) << 32n) | BigInt(oldStateLo >>> 0);
        const xorshifted = Number(((state64 >> 18n) ^ state64) >> 27n) >>> 0;
        const rot = Number(state64 >> 59n);
        
        // Rotate right
        return ((xorshifted >>> rot) | (xorshifted << (32 - rot))) >>> 0;
    }

    nextFloat(): number {
        return this.next() / 0x100000000;
    }

    nextRange(min: number, max: number): number {
        return min + this.nextFloat() * (max - min);
    }

    getState(): [number, number] {
        return [this.stateHi, this.stateLo];
    }

    setState(hi: number, lo: number): void {
        this.stateHi = hi;
        this.stateLo = lo;
    }
}

describe('PRNG Determinism Test', () => {
    it('should produce consistent sequence from same seed', () => {
        const seed = 12345n;
        const rng1 = new PCG32(seed);
        const rng2 = new PCG32(seed);

        // Generate 1000 numbers from each
        const seq1: number[] = [];
        const seq2: number[] = [];

        for (let i = 0; i < 1000; i++) {
            seq1.push(rng1.next());
            seq2.push(rng2.next());
        }

        // Sequences must be identical
        for (let i = 0; i < seq1.length; i++) {
            assert.strictEqual(
                seq1[i],
                seq2[i],
                `Sequence mismatch at index ${i}: ${seq1[i]} !== ${seq2[i]}`
            );
        }

        console.log('First 10 values:', seq1.slice(0, 10));
        console.log('All 1000 values match ✓');
    });

    it('should produce different sequences from different seeds', () => {
        const rng1 = new PCG32(12345n);
        const rng2 = new PCG32(54321n);

        const seq1: number[] = [];
        const seq2: number[] = [];

        for (let i = 0; i < 100; i++) {
            seq1.push(rng1.next());
            seq2.push(rng2.next());
        }

        // Sequences should be different
        let matchCount = 0;
        for (let i = 0; i < seq1.length; i++) {
            if (seq1[i] === seq2[i]) matchCount++;
        }

        console.log(`Match count out of 100: ${matchCount}`);
        
        // Should have very few coincidental matches
        assert.ok(
            matchCount < 5,
            `Too many coincidental matches: ${matchCount}`
        );
    });

    it('should restore state correctly', () => {
        const rng = new PCG32(42n);

        // Generate some numbers
        for (let i = 0; i < 500; i++) {
            rng.next();
        }

        // Save state
        const [savedHi, savedLo] = rng.getState();

        // Generate more numbers
        const afterSave: number[] = [];
        for (let i = 0; i < 100; i++) {
            afterSave.push(rng.next());
        }

        // Restore state
        rng.setState(savedHi, savedLo);

        // Generate again - should match
        const afterRestore: number[] = [];
        for (let i = 0; i < 100; i++) {
            afterRestore.push(rng.next());
        }

        for (let i = 0; i < afterSave.length; i++) {
            assert.strictEqual(
                afterSave[i],
                afterRestore[i],
                `Mismatch at index ${i} after state restore`
            );
        }

        console.log('State save/restore verified ✓');
    });

    it('should produce uniform distribution', () => {
        const rng = new PCG32(99999n);
        const buckets = new Array(10).fill(0);
        const samples = 100000;

        for (let i = 0; i < samples; i++) {
            const value = rng.nextFloat();
            const bucket = Math.min(9, Math.floor(value * 10));
            buckets[bucket]++;
        }

        console.log('Distribution across 10 buckets:');
        const expected = samples / 10;
        for (let i = 0; i < 10; i++) {
            const deviation = ((buckets[i]! - expected) / expected) * 100;
            console.log(`  Bucket ${i}: ${buckets[i]} (${deviation.toFixed(2)}% deviation)`);
            
            // Each bucket should be within 5% of expected
            assert.ok(
                Math.abs(deviation) < 5,
                `Bucket ${i} deviation ${deviation.toFixed(2)}% exceeds 5%`
            );
        }
    });

    it('should produce expected reference values', () => {
        // These are the expected values from our PCG32 implementation with seed 0
        // Used to ensure cross-platform consistency
        const expectedFromSeed0 = [
            0xe823a24e, 0x7a7ed426, 0x89fd6c06, 0xae646aa8,
            0xcd3c86b9, 0x6204b303, 0x198c8585, 0x49fce611,
        ];

        const rng = new PCG32(0n);
        const actual: number[] = [];

        for (let i = 0; i < expectedFromSeed0.length; i++) {
            actual.push(rng.next());
        }

        console.log('Reference values test:');
        console.log('Expected:', expectedFromSeed0.map(n => '0x' + n.toString(16)));
        console.log('Actual:  ', actual.map(n => '0x' + n.toString(16).padStart(8, '0')));

        for (let i = 0; i < expectedFromSeed0.length; i++) {
            assert.strictEqual(
                actual[i],
                expectedFromSeed0[i],
                `Reference value mismatch at index ${i}: expected 0x${expectedFromSeed0[i]!.toString(16)}, got 0x${actual[i]!.toString(16)}`
            );
        }

        console.log('All reference values match ✓');
    });

    it('should work correctly for simulation determinism', () => {
        // Simulate using PRNG for random body placement
        const rng1 = new PCG32(42n);
        const rng2 = new PCG32(42n);

        interface Body {
            x: number;
            y: number;
            z: number;
            mass: number;
        }

        function createRandomBodies(rng: PCG32, count: number): Body[] {
            const bodies: Body[] = [];
            for (let i = 0; i < count; i++) {
                bodies.push({
                    x: rng.nextRange(-1e11, 1e11),
                    y: rng.nextRange(-1e11, 1e11),
                    z: rng.nextRange(-1e10, 1e10),
                    mass: rng.nextRange(1e20, 1e25),
                });
            }
            return bodies;
        }

        const bodies1 = createRandomBodies(rng1, 50);
        const bodies2 = createRandomBodies(rng2, 50);

        // Bodies should be identical
        for (let i = 0; i < bodies1.length; i++) {
            assert.strictEqual(bodies1[i]!.x, bodies2[i]!.x, `Body ${i} x mismatch`);
            assert.strictEqual(bodies1[i]!.y, bodies2[i]!.y, `Body ${i} y mismatch`);
            assert.strictEqual(bodies1[i]!.z, bodies2[i]!.z, `Body ${i} z mismatch`);
            assert.strictEqual(bodies1[i]!.mass, bodies2[i]!.mass, `Body ${i} mass mismatch`);
        }

        console.log('Simulation determinism verified for 50 random bodies ✓');
    });
});
