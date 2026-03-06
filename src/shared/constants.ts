// Canonical physical constants (SI units)
// Single source of truth — import from here, never redeclare.

/** Astronomical Unit (meters) */
export const AU = 1.495978707e11;

/** Gravitational constant (m³ kg⁻¹ s⁻²) */
export const G = 6.6743e-11;

/** Solar mass (kg) */
export const M_SUN = 1.98892e30;

/** Earth mass (kg) */
export const M_EARTH = 5.9722e24;

/** Lunar mass (kg) */
export const M_MOON = 7.342e22;

/** Solar radius (meters) */
export const R_SUN = 6.9634e8;

/** Earth radius (meters) */
export const R_EARTH = 6.371e6;

/** Lunar radius (meters) */
export const R_MOON = 1.7374e6;

/** Solar luminosity (watts) */
export const L_SUN = 3.828e26;

/** Speed levels for time warp UI (shared between client and server) */
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
