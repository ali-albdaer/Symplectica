// Re-export shared constants for server use.
// (Server uses NodeNext resolution which cannot directly import from ../../shared/*.ts)
export interface SpeedLevel {
    sim: number;
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
