// Server-local protocol types.
// Canonical source of truth: src/shared/protocol.ts (used by client via Vite).
// Server maintains its own copy due to NodeNext + rootDir constraints.
// Keep in sync with src/shared/protocol.ts.

// ── Admin State ──────────────────────────────────────────────

export interface AdminStatePayload {
    dt: number;
    substeps: number;
    forceMethod: 'direct' | 'barnes-hut';
    theta: number;
    timeScale: number;
    paused: boolean;
    simMode: 'tick' | 'accumulator';
    closeEncounterIntegrator: 'none' | 'rk45' | 'gauss-radau';
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

// ── Message Payloads ─────────────────────────────────────────

export interface StatePayload {
    tick: number;
    time: number;
    positions: number[];
    velocities: number[];
    energy: number;
}

export interface ChatPayload {
    sender: string;
    text: string;
}

// ── Wire Messages ────────────────────────────────────────────

export interface ClientMessage {
    type: 'join' | 'ping' | 'request_snapshot' | 'chat' | 'admin_settings' | 'set_time_scale' | 'apply_snapshot' | 'reset_simulation' | 'set_pause';
    payload?: unknown;
    clientTick?: number;
}

export interface ServerMessage {
    type: 'welcome' | 'state' | 'snapshot' | 'pong' | 'error' | 'chat' | 'admin_state';
    payload: unknown;
    serverTick?: number;
    timestamp?: number;
}

// ── Binary State Encoding ────────────────────────────────────
//
// Layout (little-endian):
//   bytes  0–3   : tick        (Uint32)
//   bytes  4–7   : bodyCount   (Uint32)
//   bytes  8–15  : time        (Float64)
//   bytes 16–23  : energy      (Float64)
//   bytes 24+    : positions   (Float64 × bodyCount × 3)
//   remaining    : velocities  (Float64 × bodyCount × 3)

const BINARY_STATE_HEADER_BYTES = 24;

export function encodeBinaryState(
    tick: number,
    time: number,
    energy: number,
    positions: Float64Array,
    velocities: Float64Array,
): ArrayBuffer {
    const bodyCount = Math.floor(positions.length / 3);
    const totalBytes = BINARY_STATE_HEADER_BYTES + (bodyCount * 3 * 8) * 2;
    const buffer = new ArrayBuffer(totalBytes);
    const view = new DataView(buffer);

    view.setUint32(0, tick, true);
    view.setUint32(4, bodyCount, true);
    view.setFloat64(8, time, true);
    view.setFloat64(16, energy, true);

    const posOffset = BINARY_STATE_HEADER_BYTES;
    const posView = new Float64Array(buffer, posOffset, bodyCount * 3);
    posView.set(positions.subarray(0, bodyCount * 3));

    const velOffset = posOffset + bodyCount * 3 * 8;
    const velView = new Float64Array(buffer, velOffset, bodyCount * 3);
    velView.set(velocities.subarray(0, bodyCount * 3));

    return buffer;
}
