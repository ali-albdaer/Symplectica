import { describe, expect, it } from 'vitest';
import visualPresets from '../visualPresets.json';
import {
    VisualPresetRegistry,
    VisualPresetsFile,
} from '../visual-preset-registry';

describe('VisualPresetRegistry', () => {
    it('loads presets and returns the active preset', () => {
        VisualPresetRegistry.loadPresets(visualPresets as VisualPresetsFile);
        VisualPresetRegistry.setDefaultPreset('Low');
        const preset = VisualPresetRegistry.getPresetForPlayer('local');
        expect(preset.maxTextureSize).toBe(512);
    });

    it('resolves feature params with preset mapping', () => {
        VisualPresetRegistry.loadPresets(visualPresets as VisualPresetsFile);
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
        VisualPresetRegistry.loadPresets(visualPresets as VisualPresetsFile);
        let last: string | null = null;
        VisualPresetRegistry.subscribe('p2', (preset) => {
            last = preset;
        });
        VisualPresetRegistry.setPlayerPreset('p2', 'High');
        expect(last).toBe('High');
    });

    it('updates renderer config on preset change', () => {
        const customPresets: VisualPresetsFile = {
            version: '1.0',
            presets: {
                Low: { ...visualPresets.presets.Low, renderScale: 0.8 },
                High: { ...visualPresets.presets.High, renderScale: 1.0 },
                Ultra: { ...visualPresets.presets.Ultra, renderScale: 1.2 },
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
        const file = visualPresets as VisualPresetsFile;
        expect(file.presets.Low.performanceBudgetMs).toBeGreaterThan(0);
        expect(file.presets.High.performanceBudgetMs).toBeGreaterThan(0);
        expect(file.presets.Ultra.performanceBudgetMs).toBeGreaterThan(0);
    });
});
