import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

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

export interface AppDefaults {
    defaultPreset: {
        id: PresetId;
        barycentric: boolean;
        bodyCount: number | null;
    };
    adminDefaults: AdminDefaults;
    optionsDefaults: Record<string, unknown>;
    visualPresetDefault: VisualPresetName;
    cameraDefaults: {
        freeCamSpeedAuPerSec: number;
        freeCamSensitivity: number;
    };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const primaryPath = resolve(process.cwd(), 'src/shared/defaults.json');
const fallbackPath = resolve(__dirname, '../../shared/defaults.json');
let raw: string;

try {
    raw = readFileSync(primaryPath, 'utf-8');
} catch {
    raw = readFileSync(fallbackPath, 'utf-8');
}

export const APP_DEFAULTS = JSON.parse(raw) as AppDefaults;
