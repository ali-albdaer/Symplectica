/**
 * Network protocol messages for client-server communication.
 * Uses WebSocket with binary (ArrayBuffer) for positions, JSON for commands.
 */
// ── Message IDs ───────────────────────────────────────────────────────────────
export var ClientMessageType;
(function (ClientMessageType) {
    /** Join the simulation */
    ClientMessageType["Join"] = "join";
    /** Leave the simulation */
    ClientMessageType["Leave"] = "leave";
    /** Player input (spawn, delete, thrust, etc.) */
    ClientMessageType["Input"] = "input";
    /** Request full state snapshot */
    ClientMessageType["RequestSnapshot"] = "request_snapshot";
    /** Camera update (for interest management) */
    ClientMessageType["CameraUpdate"] = "camera_update";
    /** Admin command */
    ClientMessageType["AdminCommand"] = "admin_command";
    /** Ping for latency measurement */
    ClientMessageType["Ping"] = "ping";
    /** Acknowledge a server message */
    ClientMessageType["Ack"] = "ack";
})(ClientMessageType || (ClientMessageType = {}));
export var ServerMessageType;
(function (ServerMessageType) {
    /** Full state snapshot */
    ServerMessageType["Snapshot"] = "snapshot";
    /** Incremental delta update */
    ServerMessageType["Delta"] = "delta";
    /** Step diagnostics (every tick) */
    ServerMessageType["StepResult"] = "step_result";
    /** Player joined notification */
    ServerMessageType["PlayerJoined"] = "player_joined";
    /** Player left notification */
    ServerMessageType["PlayerLeft"] = "player_left";
    /** Server event (collision, SOI transition, etc.) */
    ServerMessageType["Event"] = "event";
    /** Pong response */
    ServerMessageType["Pong"] = "pong";
    /** Error message */
    ServerMessageType["Error"] = "error";
    /** Admin response */
    ServerMessageType["AdminResponse"] = "admin_response";
    /** Binary body positions update (high-frequency) */
    ServerMessageType["PositionUpdate"] = "position_update";
})(ServerMessageType || (ServerMessageType = {}));
export var SimEventType;
(function (SimEventType) {
    SimEventType["Collision"] = "collision";
    SimEventType["SOITransition"] = "soi_transition";
    SimEventType["IntegratorSwitch"] = "integrator_switch";
    SimEventType["ConservationWarning"] = "conservation_warning";
    SimEventType["BodyAdded"] = "body_added";
    SimEventType["BodyRemoved"] = "body_removed";
})(SimEventType || (SimEventType = {}));
// ── Protocol Constants ────────────────────────────────────────────────────────
export const PROTOCOL_VERSION = 1;
export const DEFAULT_PORT = 8080;
export const TICK_RATE = 60;
export const SNAPSHOT_INTERVAL = 300; // ticks between full snapshots
export const POSITION_UPDATE_INTERVAL = 1; // every tick
// ── Binary Encoding Helpers ──────────────────────────────────────────────────
/** Encode body positions to a compact ArrayBuffer for the wire.
 *  Layout: [tick: u32][bodyCount: u32][x0: f64][y0: f64][z0: f64]...
 */
export function encodePositions(tick, positions) {
    const bodyCount = positions.length / 3;
    const buffer = new ArrayBuffer(8 + positions.byteLength);
    const view = new DataView(buffer);
    view.setUint32(0, tick, true);
    view.setUint32(4, bodyCount, true);
    new Float64Array(buffer, 8).set(positions);
    return buffer;
}
/** Decode a binary position update. */
export function decodePositions(buffer) {
    const view = new DataView(buffer);
    const tick = view.getUint32(0, true);
    const bodyCount = view.getUint32(4, true);
    const positions = new Float64Array(buffer, 8, bodyCount * 3);
    return { tick, positions };
}
/** Create a JSON message string. */
export function encodeMessage(msg) {
    return JSON.stringify(msg);
}
/** Parse a JSON message. */
export function decodeMessage(data) {
    return JSON.parse(data);
}
//# sourceMappingURL=protocol.js.map