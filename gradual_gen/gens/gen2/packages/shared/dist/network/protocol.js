/**
 * Network Protocol Types
 * =======================
 * Message types for client-server communication.
 * Uses binary ArrayBuffer for physics state (efficient)
 * Uses JSON for control messages (readable)
 */
/**
 * Message type identifiers
 */
export var MessageType;
(function (MessageType) {
    // Connection
    MessageType["CONNECT"] = "connect";
    MessageType["DISCONNECT"] = "disconnect";
    MessageType["PING"] = "ping";
    MessageType["PONG"] = "pong";
    // Authentication
    MessageType["JOIN"] = "join";
    MessageType["JOINED"] = "joined";
    MessageType["PLAYER_JOINED"] = "player_joined";
    MessageType["PLAYER_LEFT"] = "player_left";
    // World state
    MessageType["WORLD_STATE"] = "world_state";
    MessageType["WORLD_DELTA"] = "world_delta";
    MessageType["BODY_UPDATE"] = "body_update";
    MessageType["BODY_ADD"] = "body_add";
    MessageType["BODY_REMOVE"] = "body_remove";
    // Player input
    MessageType["PLAYER_INPUT"] = "player_input";
    MessageType["PLAYER_STATE"] = "player_state";
    // Chat
    MessageType["CHAT_MESSAGE"] = "chat_message";
    MessageType["SYSTEM_MESSAGE"] = "system_message";
    // World builder
    MessageType["WORLD_BUILDER_ACTION"] = "world_builder_action";
    // Configuration
    MessageType["CONFIG_UPDATE"] = "config_update";
    MessageType["CONFIG_REQUEST"] = "config_request";
    // Simulation control
    MessageType["TIME_SCALE"] = "time_scale";
    MessageType["PAUSE"] = "pause";
    MessageType["RESUME"] = "resume";
    // Error
    MessageType["ERROR"] = "error";
})(MessageType || (MessageType = {}));
/**
 * World builder actions
 */
export var WorldBuilderActionType;
(function (WorldBuilderActionType) {
    WorldBuilderActionType["SELECT"] = "select";
    WorldBuilderActionType["DESELECT"] = "deselect";
    WorldBuilderActionType["CREATE"] = "create";
    WorldBuilderActionType["DELETE"] = "delete";
    WorldBuilderActionType["MODIFY"] = "modify";
    WorldBuilderActionType["MOVE"] = "move";
    WorldBuilderActionType["COPY"] = "copy";
    WorldBuilderActionType["FOLLOW"] = "follow";
    WorldBuilderActionType["TELEPORT"] = "teleport";
})(WorldBuilderActionType || (WorldBuilderActionType = {}));
/**
 * Create a message with timestamp
 */
export function createMessage(type, data) {
    return {
        type,
        timestamp: Date.now(),
        ...data
    };
}
/**
 * Binary protocol for efficient physics state transfer
 * =====================================================
 * Uses Float64 for positions/velocities (precision)
 * Uses Float32 for orientations (sufficient)
 *
 * Format per body (72 bytes):
 * - ID hash: 4 bytes (Uint32)
 * - Position: 24 bytes (3 × Float64)
 * - Velocity: 24 bytes (3 × Float64)
 * - Orientation: 16 bytes (4 × Float32)
 * - Angular velocity: 4 bytes (Float32)
 */
const BODY_STATE_SIZE = 72;
/**
 * Encode body states to binary
 */
export function encodeBodyStates(bodies, tick) {
    // Header: tick (4 bytes) + count (4 bytes)
    const buffer = new ArrayBuffer(8 + bodies.length * BODY_STATE_SIZE);
    const view = new DataView(buffer);
    view.setUint32(0, tick, true);
    view.setUint32(4, bodies.length, true);
    let offset = 8;
    for (const body of bodies) {
        // ID hash
        view.setUint32(offset, hashString(body.id), true);
        offset += 4;
        // Position (Float64)
        view.setFloat64(offset, body.p[0], true);
        view.setFloat64(offset + 8, body.p[1], true);
        view.setFloat64(offset + 16, body.p[2], true);
        offset += 24;
        // Velocity (Float64)
        view.setFloat64(offset, body.v[0], true);
        view.setFloat64(offset + 8, body.v[1], true);
        view.setFloat64(offset + 16, body.v[2], true);
        offset += 24;
        // Orientation (Float32)
        view.setFloat32(offset, body.o[0], true);
        view.setFloat32(offset + 4, body.o[1], true);
        view.setFloat32(offset + 8, body.o[2], true);
        view.setFloat32(offset + 12, body.o[3], true);
        offset += 16;
        // Angular velocity
        view.setFloat32(offset, body.av, true);
        offset += 4;
    }
    return buffer;
}
/**
 * Decode body states from binary
 */
export function decodeBodyStates(buffer, idMap) {
    const view = new DataView(buffer);
    const tick = view.getUint32(0, true);
    const count = view.getUint32(4, true);
    const states = [];
    let offset = 8;
    for (let i = 0; i < count; i++) {
        const idHash = view.getUint32(offset, true);
        const id = idMap.get(idHash) ?? `unknown_${idHash}`;
        offset += 4;
        const p = [
            view.getFloat64(offset, true),
            view.getFloat64(offset + 8, true),
            view.getFloat64(offset + 16, true)
        ];
        offset += 24;
        const v = [
            view.getFloat64(offset, true),
            view.getFloat64(offset + 8, true),
            view.getFloat64(offset + 16, true)
        ];
        offset += 24;
        const o = [
            view.getFloat32(offset, true),
            view.getFloat32(offset + 4, true),
            view.getFloat32(offset + 8, true),
            view.getFloat32(offset + 12, true)
        ];
        offset += 16;
        const av = view.getFloat32(offset, true);
        offset += 4;
        states.push({ id, p, v, o, av, t: Date.now() });
    }
    return { tick, states };
}
/**
 * Simple string hash function
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash + char) >>> 0;
    }
    return hash;
}
/**
 * Build ID hash map for decoding
 */
export function buildIdHashMap(ids) {
    const map = new Map();
    for (const id of ids) {
        map.set(hashString(id), id);
    }
    return map;
}
//# sourceMappingURL=protocol.js.map