import { VisualPresetRegistry } from './visual-preset-registry';

export function registerVisualPresetFeatures(): void {
    VisualPresetRegistry.registerFeature('starRenderer', {
        Low: { maxTextureSize: 256, granulationEnabled: false, flareQuality: 'Off' },
        High: { maxTextureSize: 1024, granulationEnabled: true, flareQuality: 'Low' },
        Ultra: { maxTextureSize: 4096, granulationEnabled: true, flareQuality: 'High' },
    });

    VisualPresetRegistry.registerFeatureHooks('starRenderer', {
        defaultParams: {
            maxTextureSize: 1024,
            granulationEnabled: true,
            flareQuality: 'Low',
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxTextureSize: Math.min(
                typeof params.maxTextureSize === 'number' ? params.maxTextureSize : preset.maxTextureSize,
                preset.maxTextureSize
            ),
            granulationEnabled: Boolean(params.granulationEnabled),
            flareQuality: params.flareQuality ?? preset.flareQuality,
        }),
        validatePresetMapping: (params) => {
            if ('renderScale' in params) {
                throw new Error('starRenderer presets must not alter renderScale');
            }
        },
    });

    VisualPresetRegistry.registerFeature('planetRenderer', {
        Low: { maxTextureSize: 512, lodBias: 0.5 },
        High: { maxTextureSize: 2048, lodBias: 0.0 },
        Ultra: { maxTextureSize: 4096, lodBias: -0.5 },
    });

    VisualPresetRegistry.registerFeatureHooks('planetRenderer', {
        defaultParams: {
            maxTextureSize: 2048,
            lodBias: 0.0,
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxTextureSize: Math.min(
                typeof params.maxTextureSize === 'number' ? params.maxTextureSize : preset.maxTextureSize,
                preset.maxTextureSize
            ),
            lodBias: typeof params.lodBias === 'number' ? params.lodBias : preset.lodBias,
        }),
        validatePresetMapping: (params) => {
            if ('renderScale' in params) {
                throw new Error('planetRenderer presets must not alter renderScale');
            }
        },
    });
}
