import { describe, it, expect } from 'vitest';
import { SPEED_LEVELS, getSpeedLabel } from './constants.js';

describe('SPEED_LEVELS', () => {
    it('has entries with positive sim values and non-empty labels', () => {
        expect(SPEED_LEVELS.length).toBeGreaterThan(0);
        for (const level of SPEED_LEVELS) {
            expect(level.sim).toBeGreaterThan(0);
            expect(level.label.length).toBeGreaterThan(0);
        }
    });

    it('is sorted in ascending sim order', () => {
        for (let i = 1; i < SPEED_LEVELS.length; i++) {
            expect(SPEED_LEVELS[i].sim).toBeGreaterThan(SPEED_LEVELS[i - 1].sim);
        }
    });
});

describe('getSpeedLabel', () => {
    it('returns exact label for known speed levels', () => {
        expect(getSpeedLabel(1)).toBe('1s/s');
        expect(getSpeedLabel(86400)).toBe('1day/s');
        expect(getSpeedLabel(31536000)).toBe('1yr/s');
    });

    it('formats seconds for values < 60', () => {
        expect(getSpeedLabel(30)).toBe('30.0s/s');
    });

    it('formats minutes for values < 3600', () => {
        expect(getSpeedLabel(120)).toBe('2.0min/s');
    });

    it('formats hours for values < 86400', () => {
        expect(getSpeedLabel(7200)).toBe('2.0hr/s');
    });

    it('formats days for values < 604800', () => {
        expect(getSpeedLabel(172800)).toBe('2.0day/s');
    });

    it('formats weeks for values < 31536000', () => {
        expect(getSpeedLabel(1209600)).toBe('2.0wk/s');
    });

    it('formats years for large values', () => {
        expect(getSpeedLabel(63072000)).toBe('2.0yr/s');
    });
});
