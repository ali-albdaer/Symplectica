export * from './physics_constants';

/** Speed levels for time warp UI */
export interface SpeedLevel {
    /** Simulation seconds per real second */
    sim: number;
    /** Human-readable label for display */
    label: string;
}

export const SPEED_LEVELS: readonly SpeedLevel[] = [
    { sim: 1, label: '1s/s' },
    { sim: 60, label: '1min/s' },
    { sim: 3600, label: '1hr/s' },
    { sim: 86400, label: '1day/s' },
    { sim: 604800, label: '1wk/s' },
    { sim: 2592000, label: '1mo/s' },
    { sim: 31536000, label: '1yr/s' },
];

/** Performance Monitor and general HUD update interval (ms) */
export const UI_UPDATE_INTERVAL_MS = 200;

/** Simulation Tab update interval (ms) */
export const SIM_TAB_UPDATE_INTERVAL_MS = 1000;
