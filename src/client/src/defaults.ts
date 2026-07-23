import defaults from '../../shared/defaults.json';
import { SimScale, SCALE_PRESETS } from './camera';

export type PresetId =
    | 'sunEarthMoon'
    | 'innerSolarSystem'
    | 'fullSolarSystem'
    | 'fullSolarSystemII'
    | 'fullSolarSystemIII'
    | 'fullSolarSystemIV'
    | 'playableSolarSystem'
    | 'jupiterSystem'
    | 'saturnSystem'
    | 'alphaCentauri'
    | 'trappist1'
    | 'binaryPulsar'
    | 'integratorTest1'
    | 'integratorTest2'
    | 'integratorTest3'
    | 'asteroidBelt'
    | 'starCluster'
    | 'stressTest'
    | 'solarCentauriI'
    | 'worldBuilder';

export type ForceMethod = 'direct' | 'barnes-hut';
export type SimMode = 'tick' | 'accumulator';
export type CloseEncounterIntegrator = 'none' | 'rk45' | 'gauss-radau';
export type VisualPresetName = 'Low' | 'High' | 'Ultra';

export interface AdminDefaults {
    baseEpoch: string;
    tickRate: number;
    dt: number;
    substeps: number;
    forceMethod: ForceMethod;
    theta: number;
    timeScale: number;
    paused: boolean;
    simMode: SimMode;
    closeEncounterIntegrator: CloseEncounterIntegrator;
    closeEncounterHillFactor: number;
    closeEncounterTidalRatio: number;
    closeEncounterJerkNorm: number;
    closeEncounterMaxSubsetSize: number;
    closeEncounterMaxTrialSubsteps: number;
    closeEncounterRk45AbsTol: number;
    closeEncounterRk45RelTol: number;
    closeEncounterGaussRadauMaxIters: number;
    closeEncounterGaussRadauTol: number;
}

export interface OptionsDefaults {
    showAtmospheres: boolean;
    showOrbitTrails: boolean;
    showStarLabels: boolean;
    showPlanetLabels: boolean;
    showMoonLabels: boolean;
    showAxisLines: boolean;
    showRefPlane: boolean;
    showRefLine: boolean;
    showRefPoint: boolean;
    showGridXY: boolean;
    showGridXZ: boolean;
    showGridYZ: boolean;
    gridSpacing: number;
    gridSize: number;
    orbitTrailLength: number;
}

export interface AppDefaults {
    defaultPreset: {
        id: PresetId;
        barycentric: boolean;
        bodyCount: number | null;
    };
    adminDefaults: AdminDefaults;
    optionsDefaults: OptionsDefaults;
    visualPresetDefault: VisualPresetName;
    cameraDefaults: {
        cameraFov: number;
        freeCamSpeedAuPerSec: number;
        freeCamSensitivity: number;
        freeCamRotationDamping: number;
        surfaceSpeedMps: number;
        surfaceSensitivity: number;
        surfaceRotationDamping: number;
        surfaceEyeHeightM: number;
        orbitalRotationDamping: number;
        orbitalZoomDamping: number;
    };
}

export const APP_DEFAULTS = defaults as AppDefaults;

/**
 * Per-preset rendering environment: camera scale and matching sky-sphere radius.
 * The sky radius is derived from the camera far plane so the two never diverge.
 */
export interface PresetSceneConfig {
    scale: SimScale;
    skyRadius: number;
}

export const DEFAULT_SCENE_CONFIG: PresetSceneConfig = {
    scale: 'solar',
    skyRadius: SCALE_PRESETS.solar.far,
};

export const PRESET_SCENE_CONFIG: Partial<Record<PresetId, PresetSceneConfig>> = {
    starCluster:    { scale: 'galactic',     skyRadius: SCALE_PRESETS.galactic.far     },
    solarCentauriI: { scale: 'interstellar', skyRadius: SCALE_PRESETS.interstellar.far },
};
