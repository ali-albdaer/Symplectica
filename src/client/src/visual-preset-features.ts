import { VisualPresetRegistry } from './visual-preset-registry';

export function registerVisualPresetFeatures(): void {
    VisualPresetRegistry.registerFeature('starRenderer', {
        Low: { maxTextureSize: 256, granulationEnabled: false, flareQuality: 'Off', starCount: 4000, starSize: 0.8e12, starOpacity: 0.6 },
        High: { maxTextureSize: 1024, granulationEnabled: true, flareQuality: 'Low', starCount: 10000, starSize: 1.0e12, starOpacity: 0.8 },
        Ultra: { maxTextureSize: 4096, granulationEnabled: true, flareQuality: 'High', starCount: 20000, starSize: 1.2e12, starOpacity: 0.9 },
    });

    VisualPresetRegistry.registerFeatureHooks('starRenderer', {
        defaultParams: {
            maxTextureSize: 1024,
            granulationEnabled: true,
            flareQuality: 'Low',
            starCount: 10000,
            starSize: 1.0e12,
            starOpacity: 0.8,
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxTextureSize: Math.min(
                typeof params.maxTextureSize === 'number' ? params.maxTextureSize : preset.maxTextureSize,
                preset.maxTextureSize
            ),
            granulationEnabled: Boolean(params.granulationEnabled),
            flareQuality: params.flareQuality ?? preset.flareQuality,
            starCount: typeof params.starCount === 'number' ? params.starCount : 10000,
            starSize: typeof params.starSize === 'number' ? params.starSize : 1.0e12,
            starOpacity: typeof params.starOpacity === 'number' ? params.starOpacity : 0.8,
        }),
        validatePresetMapping: (params) => {
            if ('renderScale' in params) {
                throw new Error('starRenderer presets must not alter renderScale');
            }
            if (typeof params.starCount === 'number' && params.starCount <= 0) {
                throw new Error('starRenderer starCount must be > 0');
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
