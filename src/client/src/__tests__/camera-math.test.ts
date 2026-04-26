import { describe, expect, it } from 'vitest';
import { bodySafeOrbitDistance, smoothingAlphaFromDamping, unwrapAngle } from '../camera-math';

describe('camera math helpers', () => {
    it('keeps azimuth continuous across the wrap boundary', () => {
        const reference = 3.1;
        const wrapped = unwrapAngle(reference, -3.05);

        expect(wrapped).toBeGreaterThan(3.0);
        expect(Math.abs(wrapped - reference)).toBeLessThan(0.2);
    });

    it('keeps orbit distance one meter above the tracked body surface', () => {
        expect(bodySafeOrbitDistance(0)).toBe(1);
        expect(bodySafeOrbitDistance(1000)).toBe(1001);
    });

    it('maps higher damping to slower convergence at the same frame delta', () => {
        const fast = smoothingAlphaFromDamping(0.8, 1 / 60);
        const slow = smoothingAlphaFromDamping(0.95, 1 / 60);
        expect(fast).toBeGreaterThan(slow);
    });

    it('increases convergence for longer frame deltas', () => {
        const shortStep = smoothingAlphaFromDamping(0.9, 1 / 120);
        const longStep = smoothingAlphaFromDamping(0.9, 1 / 30);
        expect(longStep).toBeGreaterThan(shortStep);
    });
});