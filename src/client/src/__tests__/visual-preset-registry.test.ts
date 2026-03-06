import { describe, expect, it } from 'vitest';
import visualPresets from '../visualPresets.json';
import {
    VisualPresetRegistry,
    VisualPresetsFile,
} from '../visual-preset-registry';

describe('VisualPresetRegistry', () => {
    it('loads presets and returns the active preset', () => {
        const presets = visualPresets as VisualPresetsFile;
        VisualPresetRegistry.loadPresets(presets);
        VisualPresetRegistry.setDefaultPreset('Ultra');
        const preset = VisualPresetRegistry.getPresetForPlayer('local');
        expect(preset.maxTextureSize).toBe(512);
    });

    it('resolves feature params with preset mapping', () => {
        const presets = visualPresets as VisualPresetsFile;
        VisualPresetRegistry.loadPresets(presets);
        VisualPresetRegistry.registerFeature('feature', {
            Low: { detail: 1 },
            High: { detail: 2 },
            Ultra: { detail: 3 },
        });
        VisualPresetRegistry.registerFeatureHooks('feature', {
            defaultParams: { detail: 0, renderScale: 1 },
            applyPreset: (params, preset) => ({
                ...params,
                renderScale: preset.renderScale,
            }),
        });

        VisualPresetRegistry.setPlayerPreset('p1', 'Ultra');
        const params = VisualPresetRegistry.resolveFeatureParams('p1', 'feature') as {
            detail: number;
            renderScale: number;
        };

        expect(params.detail).toBe(3);
        expect(params.renderScale).toBe(1.0);
    });

    it('notifies subscribers on preset change', () => {
        const presets = visualPresets as VisualPresetsFile;
        VisualPresetRegistry.loadPresets(presets);
        let last: string | null = null;
        VisualPresetRegistry.subscribe('p2', (preset) => {
            last = preset;
        });
        VisualPresetRegistry.setPlayerPreset('p2', 'High');
        expect(last).toBe('High');
    });

    it('updates renderer config on preset change', () => {
        const presets = visualPresets as VisualPresetsFile;
        const customPresets: VisualPresetsFile = {
            version: '1.0',
            presets: {
                Low: { ...presets.presets.Low, renderScale: 0.8 },
                High: { ...presets.presets.High, renderScale: 1.0 },
                Ultra: { ...presets.presets.Ultra, renderScale: 1.2 },
            },
        };

        VisualPresetRegistry.loadPresets(customPresets);
        VisualPresetRegistry.registerFeature('bodyRenderer', {});
        VisualPresetRegistry.registerFeatureHooks('bodyRenderer', {
            defaultParams: { renderScale: 1 },
            applyPreset: (params, preset) => ({
                ...params,
                renderScale: preset.renderScale,
            }),
        });

        const renderer = {
            renderScale: 0,
            setRenderScale(scale: number) {
                this.renderScale = scale;
            },
        };

        VisualPresetRegistry.subscribe('p3', () => {
            const params = VisualPresetRegistry.resolveFeatureParams('p3', 'bodyRenderer') as {
                renderScale?: number;
            };
            if (typeof params.renderScale === 'number') {
                renderer.setRenderScale(params.renderScale);
            }
        });

        VisualPresetRegistry.setPlayerPreset('p3', 'Ultra');
        expect(renderer.renderScale).toBe(1.2);
    });

    it('has performance budgets defined for all presets', () => {
        const presets = visualPresets as VisualPresetsFile;
        expect(presets.presets.Low.performanceBudgetMs).toBeGreaterThan(0);
        expect(presets.presets.High.performanceBudgetMs).toBeGreaterThan(0);
        expect(presets.presets.Ultra.performanceBudgetMs).toBeGreaterThan(0);
    });
});
