const parseNumber = (value: string | undefined, fallback: number): number => {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const parseSeed = (): bigint => {
    const raw = process.env.SEED;
    if (!raw) {
        return BigInt(Date.now());
    }

    try {
        return BigInt(raw);
    } catch {
        return BigInt(Date.now());
    }
};

export const CONFIG = {
    port: parseNumber(process.env.PORT, 8080),
    tickRate: parseNumber(process.env.TICK_RATE, 60),
    snapshotInterval: parseNumber(process.env.SNAPSHOT_INTERVAL, 300),
    stateUpdateInterval: parseNumber(process.env.STATE_UPDATE_INTERVAL, 1),
    seed: parseSeed(),
};
