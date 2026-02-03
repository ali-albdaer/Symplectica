/**
 * Network Protocol Types
 * =======================
 * Message types for client-server communication.
 * Uses binary ArrayBuffer for physics state (efficient)
 * Uses JSON for control messages (readable)
 */
import type { Vector3 } from '../math/Vector3.js';
import type { Quaternion } from '../math/Quaternion.js';
import type { BodyNetworkState, CelestialBodyDefinition } from '../bodies/types.js';
import type { PhysicsConfig, GravityMethod } from '../physics/PhysicsEngine.js';
export type { Vector3, Quaternion, BodyNetworkState, CelestialBodyDefinition, PhysicsConfig, GravityMethod };
/**
 * Message type identifiers
 */
export declare enum MessageType {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    PING = "ping",
    PONG = "pong",
    JOIN = "join",
    JOINED = "joined",
    PLAYER_JOINED = "player_joined",
    PLAYER_LEFT = "player_left",
    WORLD_STATE = "world_state",
    WORLD_DELTA = "world_delta",
    BODY_UPDATE = "body_update",
    BODY_ADD = "body_add",
    BODY_REMOVE = "body_remove",
    PLAYER_INPUT = "player_input",
    PLAYER_STATE = "player_state",
    CHAT_MESSAGE = "chat_message",
    SYSTEM_MESSAGE = "system_message",
    WORLD_BUILDER_ACTION = "world_builder_action",
    CONFIG_UPDATE = "config_update",
    CONFIG_REQUEST = "config_request",
    TIME_SCALE = "time_scale",
    PAUSE = "pause",
    RESUME = "resume",
    ERROR = "error"
}
/**
 * Base message interface
 */
export interface BaseMessage {
    type: MessageType;
    timestamp: number;
}
/**
 * Connection messages
 */
export interface ConnectMessage extends BaseMessage {
    type: MessageType.CONNECT;
    clientVersion: string;
}
export interface DisconnectMessage extends BaseMessage {
    type: MessageType.DISCONNECT;
    reason: string;
}
export interface PingMessage extends BaseMessage {
    type: MessageType.PING;
    clientTime: number;
}
export interface PongMessage extends BaseMessage {
    type: MessageType.PONG;
    clientTime: number;
    serverTime: number;
}
/**
 * Authentication messages
 */
export interface JoinMessage extends BaseMessage {
    type: MessageType.JOIN;
    playerName: string;
}
export interface JoinedMessage extends BaseMessage {
    type: MessageType.JOINED;
    playerId: string;
    playerName: string;
    spawnBodyId: string;
    spawnPosition: [number, number, number];
    serverConfig: Partial<PhysicsConfig>;
}
export interface PlayerJoinedMessage extends BaseMessage {
    type: MessageType.PLAYER_JOINED;
    playerId: string;
    playerName: string;
}
export interface PlayerLeftMessage extends BaseMessage {
    type: MessageType.PLAYER_LEFT;
    playerId: string;
    reason: string;
}
/**
 * World state messages
 */
export interface WorldStateMessage extends BaseMessage {
    type: MessageType.WORLD_STATE;
    worldName: string;
    worldDescription: string;
    seed: number;
    bodies: CelestialBodyDefinition[];
    simulationTime: number;
    tick: number;
}
export interface WorldDeltaMessage extends BaseMessage {
    type: MessageType.WORLD_DELTA;
    bodyStates: BodyNetworkState[];
    simulationTime: number;
    tick: number;
}
export interface BodyUpdateMessage extends BaseMessage {
    type: MessageType.BODY_UPDATE;
    body: Partial<CelestialBodyDefinition> & {
        id: string;
    };
}
export interface BodyAddMessage extends BaseMessage {
    type: MessageType.BODY_ADD;
    body: CelestialBodyDefinition;
}
export interface BodyRemoveMessage extends BaseMessage {
    type: MessageType.BODY_REMOVE;
    bodyId: string;
}
/**
 * Player input types
 */
export interface PlayerInputState {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    sprint: boolean;
    pitchUp: boolean;
    pitchDown: boolean;
    yawLeft: boolean;
    yawRight: boolean;
    rollLeft: boolean;
    rollRight: boolean;
    thrustX: number;
    thrustY: number;
    thrustZ: number;
    primaryAction: boolean;
    secondaryAction: boolean;
    cameraYaw: number;
    cameraYitch: number;
    sequence: number;
}
export interface PlayerInputMessage extends BaseMessage {
    type: MessageType.PLAYER_INPUT;
    playerId: string;
    input: PlayerInputState;
}
/**
 * Player state (sent from server)
 */
export interface PlayerState {
    playerId: string;
    position: [number, number, number];
    velocity: [number, number, number];
    orientation: [number, number, number, number];
    currentBodyId: string | null;
    mode: 'surface' | 'space' | 'world_builder';
    health: number;
    lastProcessedInput: number;
}
export interface PlayerStateMessage extends BaseMessage {
    type: MessageType.PLAYER_STATE;
    players: PlayerState[];
}
/**
 * Chat messages
 */
export interface ChatMessageMessage extends BaseMessage {
    type: MessageType.CHAT_MESSAGE;
    playerId: string;
    playerName: string;
    message: string;
}
export interface SystemMessageMessage extends BaseMessage {
    type: MessageType.SYSTEM_MESSAGE;
    message: string;
    level: 'info' | 'warning' | 'error' | 'success';
}
/**
 * World builder actions
 */
export declare enum WorldBuilderActionType {
    SELECT = "select",
    DESELECT = "deselect",
    CREATE = "create",
    DELETE = "delete",
    MODIFY = "modify",
    MOVE = "move",
    COPY = "copy",
    FOLLOW = "follow",
    TELEPORT = "teleport"
}
export interface WorldBuilderActionMessage extends BaseMessage {
    type: MessageType.WORLD_BUILDER_ACTION;
    playerId: string;
    action: WorldBuilderActionType;
    bodyId?: string;
    bodyDefinition?: Partial<CelestialBodyDefinition>;
    position?: [number, number, number];
    velocity?: [number, number, number];
}
/**
 * Configuration messages
 */
export interface ConfigUpdateMessage extends BaseMessage {
    type: MessageType.CONFIG_UPDATE;
    config: Partial<PhysicsConfig>;
}
export interface ConfigRequestMessage extends BaseMessage {
    type: MessageType.CONFIG_REQUEST;
}
/**
 * Simulation control
 */
export interface TimeScaleMessage extends BaseMessage {
    type: MessageType.TIME_SCALE;
    scale: number;
}
export interface PauseMessage extends BaseMessage {
    type: MessageType.PAUSE;
}
export interface ResumeMessage extends BaseMessage {
    type: MessageType.RESUME;
}
/**
 * Error message
 */
export interface ErrorMessage extends BaseMessage {
    type: MessageType.ERROR;
    code: string;
    message: string;
}
/**
 * Union of all message types
 */
export type NetworkMessage = ConnectMessage | DisconnectMessage | PingMessage | PongMessage | JoinMessage | JoinedMessage | PlayerJoinedMessage | PlayerLeftMessage | WorldStateMessage | WorldDeltaMessage | BodyUpdateMessage | BodyAddMessage | BodyRemoveMessage | PlayerInputMessage | PlayerStateMessage | ChatMessageMessage | SystemMessageMessage | WorldBuilderActionMessage | ConfigUpdateMessage | ConfigRequestMessage | TimeScaleMessage | PauseMessage | ResumeMessage | ErrorMessage;
/**
 * Create a message with timestamp
 */
export declare function createMessage<T extends NetworkMessage>(type: T['type'], data: Omit<T, 'type' | 'timestamp'>): T;
/**
 * Encode body states to binary
 */
export declare function encodeBodyStates(bodies: BodyNetworkState[], tick: number): ArrayBuffer;
/**
 * Decode body states from binary
 */
export declare function decodeBodyStates(buffer: ArrayBuffer, idMap: Map<number, string>): {
    tick: number;
    states: BodyNetworkState[];
};
/**
 * Build ID hash map for decoding
 */
export declare function buildIdHashMap(ids: string[]): Map<number, string>;
//# sourceMappingURL=protocol.d.ts.map