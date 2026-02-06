/**
 * Tests for the deterministic xoshiro256** PRNG implementation.
 */
import { describe, it, expect } from 'vitest';
import { DeterministicRng } from '../src/prng.js';

describe('DeterministicRng', () => {
  it('should produce deterministic output for the same seed', () => {
    const rng1 = new DeterministicRng(42);
    const rng2 = new DeterministicRng(42);

    for (let i = 0; i < 100; i++) {
      expect(rng1.nextU64()).toBe(rng2.nextU64());
    }
  });

  it('should produce different output for different seeds', () => {
    const rng1 = new DeterministicRng(42);
    const rng2 = new DeterministicRng(99);

    // Very unlikely but theoretically possible for first value to match
    let anyDifferent = false;
    for (let i = 0; i < 10; i++) {
      if (rng1.nextU64() !== rng2.nextU64()) {
        anyDifferent = true;
        break;
      }
    }
    expect(anyDifferent).toBe(true);
  });

  it('should generate f64 in [0, 1)', () => {
    const rng = new DeterministicRng(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.nextF64();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('should generate f64 in range', () => {
    const rng = new DeterministicRng(456);
    for (let i = 0; i < 1000; i++) {
      const val = rng.nextF64Range(-100, 100);
      expect(val).toBeGreaterThanOrEqual(-100);
      expect(val).toBeLessThan(100);
    }
  });

  it('should save and restore state', () => {
    const rng1 = new DeterministicRng(42);
    // Advance a few steps
    for (let i = 0; i < 50; i++) rng1.nextU64();

    // Save state
    const state = rng1.getState();

    // Generate some values
    const values1: bigint[] = [];
    for (let i = 0; i < 10; i++) {
      values1.push(rng1.nextU64());
    }

    // Restore and generate same values
    const rng2 = DeterministicRng.fromState(state);
    const values2: bigint[] = [];
    for (let i = 0; i < 10; i++) {
      values2.push(rng2.nextU64());
    }

    expect(values1).toEqual(values2);
  });

  it('should generate normal distribution values', () => {
    const rng = new DeterministicRng(789);
    let sum = 0;
    let sumSq = 0;
    const n = 10000;

    for (let i = 0; i < n; i++) {
      const val = rng.nextNormal(0, 1);
      sum += val;
      sumSq += val * val;
      expect(Number.isFinite(val)).toBe(true);
    }

    // Mean should be close to 0
    const mean = sum / n;
    expect(Math.abs(mean)).toBeLessThan(0.1);

    // Variance should be close to 1
    const variance = sumSq / n - mean * mean;
    expect(Math.abs(variance - 1)).toBeLessThan(0.15);
  });
});
