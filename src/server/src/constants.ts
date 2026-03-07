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

export function getSpeedLabel(sim: number): string {
    const exact = SPEED_LEVELS.find(l => Math.abs(l.sim - sim) < 0.001);
    if (exact) return exact.label;

    if (sim < 60) return `${sim.toFixed(1)}s/s`;
    if (sim < 3600) return `${(sim / 60).toFixed(1)}min/s`;
    if (sim < 86400) return `${(sim / 3600).toFixed(1)}hr/s`;
    if (sim < 604800) return `${(sim / 86400).toFixed(1)}day/s`;
    if (sim < 31536000) return `${(sim / 604800).toFixed(1)}wk/s`;
    return `${(sim / 31536000).toFixed(1)}yr/s`;
}
