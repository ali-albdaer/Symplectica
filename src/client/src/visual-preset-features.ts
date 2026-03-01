import { VisualPresetRegistry } from './visual-preset-registry';

export function registerVisualPresetFeatures(): void {
    VisualPresetRegistry.registerFeature('starRenderer', {
        Low: { maxTextureSize: 256, granulationEnabled: false, granulationSize: 256, flareQuality: 'Low', starCount: 4000, starSize: 0.8e12, starOpacity: 0.6, brightStarCount: 50 },
        High: { maxTextureSize: 1024, granulationEnabled: true, granulationSize: 256, flareQuality: 'High', starCount: 10000, starSize: 1.0e12, starOpacity: 0.8, brightStarCount: 200 },
        Ultra: { maxTextureSize: 4096, granulationEnabled: true, granulationSize: 512, flareQuality: 'Ultra', starCount: 20000, starSize: 1.2e12, starOpacity: 0.9, brightStarCount: 500 },
    });

    VisualPresetRegistry.registerFeatureHooks('starRenderer', {
        defaultParams: {
            maxTextureSize: 1024,
            granulationEnabled: true,
            granulationSize: 256,
            flareQuality: 'High',
            starCount: 10000,
            starSize: 1.0e12,
            starOpacity: 0.8,
            brightStarCount: 200,
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxTextureSize: Math.min(
                typeof params.maxTextureSize === 'number' ? params.maxTextureSize : preset.maxTextureSize,
                preset.maxTextureSize
            ),
            granulationEnabled: Boolean(params.granulationEnabled),
            granulationSize: typeof params.granulationSize === 'number' ? params.granulationSize : preset.granulationSize,
            flareQuality: params.flareQuality ?? preset.flareQuality,
            starCount: typeof params.starCount === 'number' ? params.starCount : 10000,
            starSize: typeof params.starSize === 'number' ? params.starSize : 1.0e12,
            starOpacity: typeof params.starOpacity === 'number' ? params.starOpacity : 0.8,
            brightStarCount: typeof params.brightStarCount === 'number' ? params.brightStarCount : 200,
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

    VisualPresetRegistry.registerFeature('atmosphereRenderer', {
        Low: { atmosphereLUTResolution: 32, atmoViewSteps: 4, atmoSunSteps: 2 },
        High: { atmosphereLUTResolution: 64, atmoViewSteps: 8, atmoSunSteps: 4 },
        Ultra: { atmosphereLUTResolution: 128, atmoViewSteps: 16, atmoSunSteps: 6 },
    });

    VisualPresetRegistry.registerFeatureHooks('atmosphereRenderer', {
        defaultParams: {
            atmosphereLUTResolution: 64,
            atmoViewSteps: 8,
            atmoSunSteps: 4,
        },
        applyPreset: (params, preset) => ({
            ...params,
            atmosphereLUTResolution:
                typeof params.atmosphereLUTResolution === 'number'
                    ? params.atmosphereLUTResolution
                    : preset.atmosphereLUTResolution,
            atmoViewSteps: typeof params.atmoViewSteps === 'number'
                ? params.atmoViewSteps : preset.atmoViewSteps,
            atmoSunSteps: typeof params.atmoSunSteps === 'number'
                ? params.atmoSunSteps : preset.atmoSunSteps,
        }),
        validatePresetMapping: (params) => {
            if (typeof params.atmosphereLUTResolution === 'number' && params.atmosphereLUTResolution <= 0) {
                throw new Error('atmosphereRenderer LUT resolution must be > 0');
            }
        },
    });

    VisualPresetRegistry.registerFeature('cloudRenderer', {
        Low: { cloudQuality: 'Off' },
        High: { cloudQuality: 'High' },
        Ultra: { cloudQuality: 'Volumetric' },
    });

    VisualPresetRegistry.registerFeatureHooks('cloudRenderer', {
        defaultParams: {
            cloudQuality: 'High',
        },
        applyPreset: (params, preset) => ({
            ...params,
            cloudQuality: params.cloudQuality ?? preset.cloudQuality,
        }),
    });

    VisualPresetRegistry.registerFeature('shadowRenderer', {
        Low: { shadowQuality: 'Low' },
        High: { shadowQuality: 'Medium' },
        Ultra: { shadowQuality: 'High' },
    });

    VisualPresetRegistry.registerFeatureHooks('shadowRenderer', {
        defaultParams: {
            shadowQuality: 'Medium',
        },
        applyPreset: (params, preset) => ({
            ...params,
            shadowQuality: params.shadowQuality ?? preset.shadowQuality,
        }),
    });

    VisualPresetRegistry.registerFeature('reflectionRenderer', {
        Low: { reflectionMode: 'Off' },
        High: { reflectionMode: 'SSR' },
        Ultra: { reflectionMode: 'SSR+Fallback' },
    });

    VisualPresetRegistry.registerFeatureHooks('reflectionRenderer', {
        defaultParams: {
            reflectionMode: 'SSR',
        },
        applyPreset: (params, preset) => ({
            ...params,
            reflectionMode: params.reflectionMode ?? preset.reflectionMode,
        }),
    });

    VisualPresetRegistry.registerFeature('postProcessRenderer', {
        Low: { maxShaderSamples: 16, bloomStrength: 0.3, bloomRadius: 0.5, bloomThreshold: 1.0, glareEnabled: false, autoExposureEnabled: false },
        High: { maxShaderSamples: 48, bloomStrength: 0.6, bloomRadius: 1.0, bloomThreshold: 0.9, glareEnabled: false, autoExposureEnabled: false },
        Ultra: { maxShaderSamples: 96, bloomStrength: 0.8, bloomRadius: 1.0, bloomThreshold: 0.8, glareEnabled: true, autoExposureEnabled: true },
    });

    VisualPresetRegistry.registerFeatureHooks('postProcessRenderer', {
        defaultParams: {
            maxShaderSamples: 48,
            bloomStrength: 0.6,
            bloomRadius: 1.0,
            bloomThreshold: 0.9,
            glareEnabled: false,
            autoExposureEnabled: false,
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxShaderSamples: Math.min(
                typeof params.maxShaderSamples === 'number' ? params.maxShaderSamples : preset.maxShaderSamples,
                preset.maxShaderSamples
            ),
            bloomStrength: typeof params.bloomStrength === 'number' ? params.bloomStrength : preset.bloomStrength,
            bloomRadius: typeof params.bloomRadius === 'number' ? params.bloomRadius : preset.bloomRadius,
            bloomThreshold: typeof params.bloomThreshold === 'number' ? params.bloomThreshold : preset.bloomThreshold,
            glareEnabled: typeof params.glareEnabled === 'boolean' ? params.glareEnabled : preset.glareEnabled,
            autoExposureEnabled: typeof params.autoExposureEnabled === 'boolean' ? params.autoExposureEnabled : preset.autoExposureEnabled,
        }),
        validatePresetMapping: (params) => {
            if (typeof params.maxShaderSamples === 'number' && params.maxShaderSamples <= 0) {
                throw new Error('postProcessRenderer maxShaderSamples must be > 0');
            }
        },
    });

    VisualPresetRegistry.registerFeature('terrainRenderer', {
        Low: { lodBias: 0.5 },
        High: { lodBias: 0.0 },
        Ultra: { lodBias: -0.5 },
    });

    VisualPresetRegistry.registerFeatureHooks('terrainRenderer', {
        defaultParams: {
            lodBias: 0.0,
        },
        applyPreset: (params, preset) => ({
            ...params,
            lodBias: typeof params.lodBias === 'number' ? params.lodBias : preset.lodBias,
        }),
    });

    VisualPresetRegistry.registerFeature('ringRenderer', {
        Low: { maxTextureSize: 512 },
        High: { maxTextureSize: 2048 },
        Ultra: { maxTextureSize: 4096 },
    });

    VisualPresetRegistry.registerFeatureHooks('ringRenderer', {
        defaultParams: {
            maxTextureSize: 2048,
        },
        applyPreset: (params, preset) => ({
            ...params,
            maxTextureSize: Math.min(
                typeof params.maxTextureSize === 'number' ? params.maxTextureSize : preset.maxTextureSize,
                preset.maxTextureSize
            ),
        }),
    });
}
