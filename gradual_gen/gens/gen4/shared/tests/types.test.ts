/**
 * Tests for shared types: Vec3 operations and body/config types.
 */
import { describe, it, expect } from 'vitest';
import {
  vec3,
  vec3Add,
  vec3Sub,
  vec3Scale,
  vec3Mag,
  vec3Normalize,
  vec3Dot,
  vec3Cross,
  vec3Lerp,
  vec3Distance,
  BodyType,
  SolverType,
  IntegratorType,
  G,
  AU,
  SOLAR_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
} from '../src/types.js';

describe('Vec3 Operations', () => {
  it('should create a zero vector', () => {
    const v = vec3();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
    expect(v.z).toBe(0);
  });

  it('should create a vector with values', () => {
    const v = vec3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it('should add vectors correctly', () => {
    const result = vec3Add(vec3(1, 2, 3), vec3(4, 5, 6));
    expect(result).toEqual(vec3(5, 7, 9));
  });

  it('should subtract vectors correctly', () => {
    const result = vec3Sub(vec3(5, 7, 9), vec3(4, 5, 6));
    expect(result).toEqual(vec3(1, 2, 3));
  });

  it('should scale vectors', () => {
    const result = vec3Scale(vec3(1, 2, 3), 2);
    expect(result).toEqual(vec3(2, 4, 6));
  });

  it('should compute magnitude', () => {
    expect(vec3Mag(vec3(3, 4, 0))).toBe(5);
    expect(vec3Mag(vec3(0, 0, 0))).toBe(0);
    expect(vec3Mag(vec3(1, 0, 0))).toBe(1);
  });

  it('should normalize vectors', () => {
    const n = vec3Normalize(vec3(3, 0, 0));
    expect(n.x).toBeCloseTo(1);
    expect(n.y).toBeCloseTo(0);
    expect(n.z).toBeCloseTo(0);

    // Zero vector should return zero
    const z = vec3Normalize(vec3(0, 0, 0));
    expect(z).toEqual(vec3(0, 0, 0));
  });

  it('should compute dot product', () => {
    expect(vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0))).toBe(0); // perpendicular
    expect(vec3Dot(vec3(1, 2, 3), vec3(4, 5, 6))).toBe(32); // 1*4 + 2*5 + 3*6
  });

  it('should compute cross product', () => {
    // i × j = k
    const result = vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0));
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(1);
  });

  it('should lerp correctly', () => {
    const a = vec3(0, 0, 0);
    const b = vec3(10, 20, 30);

    const mid = vec3Lerp(a, b, 0.5);
    expect(mid).toEqual(vec3(5, 10, 15));

    const start = vec3Lerp(a, b, 0);
    expect(start).toEqual(a);

    const end = vec3Lerp(a, b, 1);
    expect(end).toEqual(b);
  });

  it('should compute distance between vectors', () => {
    expect(vec3Distance(vec3(0, 0, 0), vec3(3, 4, 0))).toBe(5);
    expect(vec3Distance(vec3(1, 1, 1), vec3(1, 1, 1))).toBe(0);
  });
});

describe('Physical Constants', () => {
  it('should have correct gravitational constant', () => {
    expect(G).toBeCloseTo(6.674e-11, 14);
  });

  it('should have correct AU', () => {
    // 1 AU ≈ 1.496e11 m, verify to 0.01% relative error
    expect(Math.abs(AU - 1.496e11) / 1.496e11).toBeLessThan(0.0002);
  });

  it('should have correct solar mass', () => {
    expect(Math.abs(SOLAR_MASS - 1.989e30) / 1.989e30).toBeLessThan(0.001);
  });

  it('should have correct Earth mass', () => {
    expect(Math.abs(EARTH_MASS - 5.972e24) / 5.972e24).toBeLessThan(0.001);
  });

  it('should have correct Earth radius', () => {
    expect(EARTH_RADIUS).toBeCloseTo(6.371e6, 3);
  });
});

describe('Kepler Orbit Validation', () => {
  it('should compute correct circular orbit velocity', () => {
    // v = sqrt(G * M / r) for Earth around Sun
    const v = Math.sqrt(G * SOLAR_MASS / AU);
    expect(v).toBeGreaterThan(29000); // ~29.78 km/s
    expect(v).toBeLessThan(30000);
  });
});

describe('Enum Values', () => {
  it('should have expected body types', () => {
    expect(BodyType.Star).toBe('Star');
    expect(BodyType.Planet).toBe('Planet');
    expect(BodyType.Moon).toBe('Moon');
    expect(BodyType.Asteroid).toBe('Asteroid');
  });

  it('should have expected solver types', () => {
    expect(SolverType.Direct).toBe('Direct');
    expect(SolverType.BarnesHut).toBe('BarnesHut');
    expect(SolverType.FMM).toBe('FMM');
  });

  it('should have expected integrator types', () => {
    expect(IntegratorType.VelocityVerlet).toBe('VelocityVerlet');
    expect(IntegratorType.RK45).toBe('RK45');
    expect(IntegratorType.GaussRadau15).toBe('GaussRadau15');
  });
});
