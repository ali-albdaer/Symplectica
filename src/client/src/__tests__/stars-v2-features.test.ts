/**
 * Stars V2 feature tests — validates preset params, feature registrations,
 * and data consistency for all features added in the Stars V2 spec.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import visualPresets from '../visualPresets.json';
import {
    VisualPresetRegistry,
    VisualPresetsFile,
    type VisualPresetParams,
} from '../visual-preset-registry';

const presets = visualPresets as VisualPresetsFile;

import { registerVisualPresetFeatures } from '../visual-preset-features';

describe('Stars V2 — Preset Params', () => {
    beforeEach(() => {
        VisualPresetRegistry.loadPresets(presets);
        registerVisualPresetFeatures();
    });

    it('all presets have bloom params', () => {
        for (const [name, p] of Object.entries(presets.presets)) {
            const preset = p as VisualPresetParams;
            expect(preset.bloomStrength, `${name}.bloomStrength`).toBeTypeOf('number');
            expect(preset.bloomRadius, `${name}.bloomRadius`).toBeTypeOf('number');
            expect(preset.bloomThreshold, `${name}.bloomThreshold`).toBeTypeOf('number');
            expect(preset.bloomStrength).toBeGreaterThan(0);
            expect(preset.bloomRadius).toBeGreaterThan(0);
            expect(preset.bloomThreshold).toBeGreaterThan(0);
        }
    });

    it('bloom params match spec values', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(low.bloomStrength).toBe(0.3);
        expect(low.bloomRadius).toBe(0.5);
        expect(low.bloomThreshold).toBe(1.0);

        expect(high.bloomStrength).toBe(0.6);
        expect(high.bloomRadius).toBe(1.0);
        expect(high.bloomThreshold).toBe(0.9);

        expect(ultra.bloomStrength).toBe(0.8);
        expect(ultra.bloomRadius).toBe(1.0);
        expect(ultra.bloomThreshold).toBe(0.8);
    });

    it('all presets have glare and auto-exposure flags', () => {
        for (const [name, p] of Object.entries(presets.presets)) {
            const preset = p as VisualPresetParams;
            expect(preset.glareEnabled, `${name}.glareEnabled`).toBeTypeOf('boolean');
            expect(preset.autoExposureEnabled, `${name}.autoExposureEnabled`).toBeTypeOf('boolean');
        }
    });

    it('glare is only enabled on Ultra', () => {
        expect((presets.presets.Low as VisualPresetParams).glareEnabled).toBe(false);
        expect((presets.presets.High as VisualPresetParams).glareEnabled).toBe(false);
        expect((presets.presets.Ultra as VisualPresetParams).glareEnabled).toBe(true);
    });

    it('auto-exposure is only enabled on Ultra', () => {
        expect((presets.presets.Low as VisualPresetParams).autoExposureEnabled).toBe(false);
        expect((presets.presets.High as VisualPresetParams).autoExposureEnabled).toBe(false);
        expect((presets.presets.Ultra as VisualPresetParams).autoExposureEnabled).toBe(true);
    });

    it('all presets have atmosphere ray march step counts', () => {
        for (const [name, p] of Object.entries(presets.presets)) {
            const preset = p as VisualPresetParams;
            expect(preset.atmoViewSteps, `${name}.atmoViewSteps`).toBeTypeOf('number');
            expect(preset.atmoSunSteps, `${name}.atmoSunSteps`).toBeTypeOf('number');
            expect(preset.atmoViewSteps).toBeGreaterThanOrEqual(2);
            expect(preset.atmoSunSteps).toBeGreaterThanOrEqual(1);
        }
    });

    it('atmosphere steps match spec values', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(low.atmoViewSteps).toBe(4);
        expect(low.atmoSunSteps).toBe(2);
        expect(high.atmoViewSteps).toBe(8);
        expect(high.atmoSunSteps).toBe(4);
        expect(ultra.atmoViewSteps).toBe(16);
        expect(ultra.atmoSunSteps).toBe(6);
    });

    it('granulation size increases with quality', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(low.granulationSize).toBe(256);
        expect(high.granulationSize).toBe(256);
        expect(ultra.granulationSize).toBe(512);
    });

    it('granulation is disabled on Low preset', () => {
        expect((presets.presets.Low as VisualPresetParams).granulationEnabled).toBe(false);
        expect((presets.presets.High as VisualPresetParams).granulationEnabled).toBe(true);
        expect((presets.presets.Ultra as VisualPresetParams).granulationEnabled).toBe(true);
    });

    it('atmosphere steps increase monotonically across presets', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(high.atmoViewSteps).toBeGreaterThan(low.atmoViewSteps);
        expect(ultra.atmoViewSteps).toBeGreaterThan(high.atmoViewSteps);
        expect(high.atmoSunSteps).toBeGreaterThan(low.atmoSunSteps);
        expect(ultra.atmoSunSteps).toBeGreaterThan(high.atmoSunSteps);
    });

    it('bloom strength increases monotonically across presets', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(high.bloomStrength).toBeGreaterThan(low.bloomStrength);
        expect(ultra.bloomStrength).toBeGreaterThan(high.bloomStrength);
    });

    it('bloom threshold decreases monotonically across presets', () => {
        const low = presets.presets.Low as VisualPresetParams;
        const high = presets.presets.High as VisualPresetParams;
        const ultra = presets.presets.Ultra as VisualPresetParams;

        expect(high.bloomThreshold).toBeLessThan(low.bloomThreshold);
        expect(ultra.bloomThreshold).toBeLessThan(high.bloomThreshold);
    });

    it('bright star count increases across presets', () => {
        const low = presets.presets.Low as Record<string, unknown>;
        const high = presets.presets.High as Record<string, unknown>;
        const ultra = presets.presets.Ultra as Record<string, unknown>;

        expect(low.brightStarCount).toBe(50);
        expect(high.brightStarCount).toBe(200);
        expect(ultra.brightStarCount).toBe(500);
    });
});

describe('Stars V2 — Feature Resolution', () => {
    beforeEach(() => {
        VisualPresetRegistry.loadPresets(presets);
        registerVisualPresetFeatures();
    });

    it('postProcessRenderer feature resolves glare and autoExposure', () => {
        VisualPresetRegistry.setPlayerPreset('test-pp', 'Ultra');
        const params = VisualPresetRegistry.resolveFeatureParams('test-pp', 'postProcessRenderer') as {
            glareEnabled?: boolean;
            autoExposureEnabled?: boolean;
            bloomStrength?: number;
        };
        expect(params.glareEnabled).toBe(true);
        expect(params.autoExposureEnabled).toBe(true);
        expect(params.bloomStrength).toBe(0.8);
    });

    it('postProcessRenderer on Low preset has no glare or auto-exposure', () => {
        VisualPresetRegistry.setPlayerPreset('test-pp-low', 'Low');
        const params = VisualPresetRegistry.resolveFeatureParams('test-pp-low', 'postProcessRenderer') as {
            glareEnabled?: boolean;
            autoExposureEnabled?: boolean;
        };
        expect(params.glareEnabled).toBe(false);
        expect(params.autoExposureEnabled).toBe(false);
    });

    it('atmosphereRenderer feature resolves ray march steps', () => {
        VisualPresetRegistry.setPlayerPreset('test-atmo', 'High');
        const params = VisualPresetRegistry.resolveFeatureParams('test-atmo', 'atmosphereRenderer') as {
            atmoViewSteps?: number;
            atmoSunSteps?: number;
        };
        expect(params.atmoViewSteps).toBe(8);
        expect(params.atmoSunSteps).toBe(4);
    });

    it('starRenderer feature resolves granulation size', () => {
        VisualPresetRegistry.setPlayerPreset('test-star', 'Ultra');
        const params = VisualPresetRegistry.resolveFeatureParams('test-star', 'starRenderer') as {
            granulationSize?: number;
        };
        expect(params.granulationSize).toBe(512);
    });
});

describe('Stars V2 — Blackbody LUT', () => {
    it('createBlackbodyLUT returns a valid DataTexture', async () => {
        const { createBlackbodyLUT } = await import('../blackbody');
        const lut = createBlackbodyLUT();

        expect(lut).toBeDefined();
        expect(lut.image.width).toBe(512);
        expect(lut.image.height).toBe(1);
        // Should have 512 * 1 * 4 = 2048 float values
        expect(lut.image.data.length).toBe(2048);
    });

    it('LUT has non-zero values at Sun temperature (5778K)', async () => {
        const { createBlackbodyLUT } = await import('../blackbody');
        const lut = createBlackbodyLUT();
        const data = lut.image.data as Float32Array;

        // Sun at 5778K: tNorm = (5778 - 1000) / 39000 ≈ 0.1225
        const idx = Math.round(0.1225 * 511);
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];

        expect(r).toBeGreaterThan(0);
        expect(g).toBeGreaterThan(0);
        expect(b).toBeGreaterThan(0);
        // Sun should be warmish (R > G > B)
        expect(r).toBeGreaterThan(g);
        expect(g).toBeGreaterThan(b);
    });

    it('LUT has cooler (redder) values at low temperatures', async () => {
        const { createBlackbodyLUT } = await import('../blackbody');
        const lut = createBlackbodyLUT();
        const data = lut.image.data as Float32Array;

        // 2000K: tNorm = (2000 - 1000) / 39000 ≈ 0.0256
        const idx = Math.round(0.0256 * 511);
        const r = data[idx * 4];
        const g = data[idx * 4 + 1];
        const b = data[idx * 4 + 2];

        // Very red at low temperatures
        expect(r).toBeGreaterThan(g * 1.5);
        expect(g).toBeGreaterThan(b);
    });

    it('LUT has hotter (bluer) values at high temperatures', async () => {
        const { createBlackbodyLUT } = await import('../blackbody');
        const lut = createBlackbodyLUT();
        const data = lut.image.data as Float32Array;

        // 30000K: tNorm = (30000 - 1000) / 39000 ≈ 0.7436
        const idx = Math.round(0.7436 * 511);
        const r = data[idx * 4];
        const b = data[idx * 4 + 2];

        // Hot stars are blue-white: B should be comparable to or greater than R
        expect(b).toBeGreaterThan(r * 0.5);
    });
});
