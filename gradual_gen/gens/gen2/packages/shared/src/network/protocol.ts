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

// Re-export types used by protocol consumers
export type { Vector3, Quaternion, BodyNetworkState, CelestialBodyDefinition, PhysicsConfig, GravityMethod };

/**
 * Message type identifiers
 */
export enum MessageType {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',

  // Authentication
  JOIN = 'join',
  JOINED = 'joined',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',

  // World state
  WORLD_STATE = 'world_state',
  WORLD_DELTA = 'world_delta',
  BODY_UPDATE = 'body_update',
  BODY_ADD = 'body_add',
  BODY_REMOVE = 'body_remove',

  // Player input
  PLAYER_INPUT = 'player_input',
  PLAYER_STATE = 'player_state',

  // Chat
  CHAT_MESSAGE = 'chat_message',
  SYSTEM_MESSAGE = 'system_message',

  // World builder
  WORLD_BUILDER_ACTION = 'world_builder_action',

  // Configuration
  CONFIG_UPDATE = 'config_update',
  CONFIG_REQUEST = 'config_request',

  // Simulation control
  TIME_SCALE = 'time_scale',
  PAUSE = 'pause',
  RESUME = 'resume',

  // Error
  ERROR = 'error'
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
  body: Partial<CelestialBodyDefinition> & { id: string };
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
  // Movement
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  sprint: boolean;

  // Rotation (for spacecraft)
  pitchUp: boolean;
  pitchDown: boolean;
  yawLeft: boolean;
  yawRight: boolean;
  rollLeft: boolean;
  rollRight: boolean;

  // Thrust (for spacecraft)
  thrustX: number;
  thrustY: number;
  thrustZ: number;

  // Actions
  primaryAction: boolean;
  secondaryAction: boolean;

  // Camera
  cameraYaw: number;
  cameraYitch: number;

  // Sequence number for reconciliation
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
export enum WorldBuilderActionType {
  SELECT = 'select',
  DESELECT = 'deselect',
  CREATE = 'create',
  DELETE = 'delete',
  MODIFY = 'modify',
  MOVE = 'move',
  COPY = 'copy',
  FOLLOW = 'follow',
  TELEPORT = 'teleport'
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
export type NetworkMessage =
  | ConnectMessage
  | DisconnectMessage
  | PingMessage
  | PongMessage
  | JoinMessage
  | JoinedMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | WorldStateMessage
  | WorldDeltaMessage
  | BodyUpdateMessage
  | BodyAddMessage
  | BodyRemoveMessage
  | PlayerInputMessage
  | PlayerStateMessage
  | ChatMessageMessage
  | SystemMessageMessage
  | WorldBuilderActionMessage
  | ConfigUpdateMessage
  | ConfigRequestMessage
  | TimeScaleMessage
  | PauseMessage
  | ResumeMessage
  | ErrorMessage;

/**
 * Create a message with timestamp
 */
export function createMessage<T extends NetworkMessage>(
  type: T['type'],
  data: Omit<T, 'type' | 'timestamp'>
): T {
  return {
    type,
    timestamp: Date.now(),
    ...data
  } as T;
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
export function encodeBodyStates(
  bodies: BodyNetworkState[],
  tick: number
): ArrayBuffer {
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
export function decodeBodyStates(
  buffer: ArrayBuffer,
  idMap: Map<number, string>
): { tick: number; states: BodyNetworkState[] } {
  const view = new DataView(buffer);
  
  const tick = view.getUint32(0, true);
  const count = view.getUint32(4, true);

  const states: BodyNetworkState[] = [];
  let offset = 8;

  for (let i = 0; i < count; i++) {
    const idHash = view.getUint32(offset, true);
    const id = idMap.get(idHash) ?? `unknown_${idHash}`;
    offset += 4;

    const p: [number, number, number] = [
      view.getFloat64(offset, true),
      view.getFloat64(offset + 8, true),
      view.getFloat64(offset + 16, true)
    ];
    offset += 24;

    const v: [number, number, number] = [
      view.getFloat64(offset, true),
      view.getFloat64(offset + 8, true),
      view.getFloat64(offset + 16, true)
    ];
    offset += 24;

    const o: [number, number, number, number] = [
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
function hashString(str: string): number {
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
export function buildIdHashMap(ids: string[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const id of ids) {
    map.set(hashString(id), id);
  }
  return map;
}
