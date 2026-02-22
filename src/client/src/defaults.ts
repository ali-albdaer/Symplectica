import defaults from '../../shared/defaults.json';

export type PresetId =
    | 'sunEarthMoon'
    | 'innerSolarSystem'
    | 'fullSolarSystem'
    | 'fullSolarSystemII'
    | 'playableSolarSystem'
    | 'jupiterSystem'
    | 'saturnSystem'
    | 'alphaCentauri'
    | 'trappist1'
    | 'binaryPulsar'
    | 'asteroidBelt'
    | 'starCluster'
    | 'worldBuilder';

export type ForceMethod = 'direct' | 'barnes-hut';
export type SimMode = 'tick' | 'accumulator';
export type CloseEncounterIntegrator = 'none' | 'rk45' | 'gauss-radau';
export type VisualPresetName = 'Low' | 'High' | 'Ultra';

export interface AdminDefaults {
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
    showOrbitTrails: boolean;
    showLabels: boolean;
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
        freeCamSpeedAuPerSec: number;
        freeCamSensitivity: number;
    };
}

export const APP_DEFAULTS = defaults as AppDefaults;
