export type PresetName = 'Low' | 'High' | 'Ultra';

export type CloudQuality = 'Off' | 'Low' | 'High' | 'Volumetric';
export type ShadowQuality = 'Off' | 'Low' | 'Medium' | 'High';
export type ReflectionMode = 'Off' | 'Cubemap' | 'SSR' | 'SSR+Fallback';
export type FlareQuality = 'Off' | 'Low' | 'High' | 'Ultra';

export interface VisualPresetParams {
    renderScale: number;
    maxTextureSize: number;
    atmosphereLUTResolution: number;
    cloudQuality: CloudQuality;
    shadowQuality: ShadowQuality;
    reflectionMode: ReflectionMode;
    granulationEnabled: boolean;
    flareQuality: FlareQuality;
    lodBias: number;
    maxShaderSamples: number;
    performanceBudgetMs: number;
}

export type FeatureParams = Record<string, unknown>;

export type PresetDescriptor = {
    Low?: Partial<FeatureParams>;
    High?: Partial<FeatureParams>;
    Ultra?: Partial<FeatureParams>;
};

export type FeatureHooks = {
    defaultParams?: Partial<FeatureParams>;
    applyPreset?: (featureParams: FeatureParams, presetParams: VisualPresetParams) => FeatureParams;
    validatePresetMapping?: (featureParams: FeatureParams) => void;
};

export type VisualPresetsFile = {
    version: string;
    presets: Record<PresetName, VisualPresetParams>;
};

type Subscriber = (presetName: PresetName) => void;

export class VisualPresetRegistry {
    private static presets: Record<PresetName, VisualPresetParams> | null = null;
    private static defaultPreset: PresetName = 'Low';
    private static featureDescriptors = new Map<string, PresetDescriptor>();
    private static featureHooks = new Map<string, FeatureHooks>();
    private static playerPresets = new Map<string, PresetName>();
    private static subscribers = new Map<string, Set<Subscriber>>();

    static loadPresets(file: VisualPresetsFile): void {
        this.presets = file.presets;
    }

    static setDefaultPreset(presetName: PresetName): void {
        this.defaultPreset = presetName;
    }

    static registerFeature(featureId: string, descriptor: PresetDescriptor): void {
        this.featureDescriptors.set(featureId, descriptor);
    }

    static registerFeatureHooks(featureId: string, hooks: FeatureHooks): void {
        this.featureHooks.set(featureId, hooks);
    }

    static getPresetForPlayer(playerId: string): VisualPresetParams {
        const name = this.playerPresets.get(playerId) ?? this.defaultPreset;
        return this.getPresetByName(name);
    }

    static getPresetNameForPlayer(playerId: string): PresetName {
        return this.playerPresets.get(playerId) ?? this.defaultPreset;
    }

    static updatePreset(presetName: PresetName, patch: Partial<VisualPresetParams>): void {
        if (!this.presets) {
            throw new Error('Visual presets not loaded');
        }
        const current = this.presets[presetName];
        if (!current) {
            throw new Error(`Unknown visual preset: ${presetName}`);
        }
        const updated = { ...current, ...patch };
        if (!Number.isFinite(updated.renderScale) || updated.renderScale <= 0) {
            throw new Error('renderScale must be > 0');
        }
        if (!Number.isFinite(updated.maxTextureSize) || updated.maxTextureSize <= 0) {
            throw new Error('maxTextureSize must be > 0');
        }
        if (!Number.isFinite(updated.atmosphereLUTResolution) || updated.atmosphereLUTResolution <= 0) {
            throw new Error('atmosphereLUTResolution must be > 0');
        }
        if (!Number.isFinite(updated.maxShaderSamples) || updated.maxShaderSamples <= 0) {
            throw new Error('maxShaderSamples must be > 0');
        }
        if (!Number.isFinite(updated.performanceBudgetMs) || updated.performanceBudgetMs <= 0) {
            throw new Error('performanceBudgetMs must be > 0');
        }
        this.presets[presetName] = updated;

        for (const [playerId, subs] of this.subscribers.entries()) {
            if (subs.size === 0) continue;
            const name = this.getPresetNameForPlayer(playerId);
            for (const cb of subs) {
                cb(name);
            }
        }
    }

    static setPlayerPreset(playerId: string, presetName: PresetName): void {
        this.playerPresets.set(playerId, presetName);
        const subs = this.subscribers.get(playerId);
        if (!subs) return;
        for (const cb of subs) {
            cb(presetName);
        }
    }

    static hasPlayerPreset(playerId: string): boolean {
        return this.playerPresets.has(playerId);
    }

    static resolveFeatureParams(playerId: string, featureId: string): FeatureParams {
        // TODO(determinism): Preserve the selected preset in client-only metadata alongside snapshots for reproducible renders.
        // TODO(determinism): Ensure procedural noise uses the physics snapshot seed; presets must not alter seeds.
        // TODO(perf): Implement performanceBudgetMs downgrade pipeline and emit a visual-degrade event when applied.
        const presetName = this.playerPresets.get(playerId) ?? this.defaultPreset;
        const presetParams = this.getPresetByName(presetName);
        const descriptor = this.featureDescriptors.get(featureId) ?? {};
        const hooks = this.featureHooks.get(featureId);
        const defaults = hooks?.defaultParams ?? {};
        const mapped = descriptor[presetName] ?? {};
        const merged = { ...defaults, ...mapped } as FeatureParams;
        if (hooks?.validatePresetMapping) {
            hooks.validatePresetMapping(merged);
        }
        if (hooks?.applyPreset) {
            return hooks.applyPreset(merged, presetParams);
        }
        return merged;
    }

    static subscribe(playerId: string, callback: Subscriber): () => void {
        const subs = this.subscribers.get(playerId) ?? new Set<Subscriber>();
        subs.add(callback);
        this.subscribers.set(playerId, subs);
        return () => {
            const current = this.subscribers.get(playerId);
            if (!current) return;
            current.delete(callback);
            if (current.size === 0) {
                this.subscribers.delete(playerId);
            }
        };
    }

    private static getPresetByName(name: PresetName): VisualPresetParams {
        if (!this.presets) {
            throw new Error('Visual presets not loaded');
        }
        const preset = this.presets[name];
        if (!preset) {
            throw new Error(`Unknown visual preset: ${name}`);
        }
        return preset;
    }
}
