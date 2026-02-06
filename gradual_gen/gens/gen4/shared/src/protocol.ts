/**
 * Network protocol messages for client-server communication.
 * Uses WebSocket with binary (ArrayBuffer) for positions, JSON for commands.
 */

import type {
  Body,
  BodyId,
  CameraState,
  InputAction,
  PresetId,
  SimConfig,
  SimulationState,
  StepResult,
  Vec3,
} from './types.js';

// ── Message IDs ───────────────────────────────────────────────────────────────

export enum ClientMessageType {
  /** Join the simulation */
  Join = 'join',
  /** Leave the simulation */
  Leave = 'leave',
  /** Player input (spawn, delete, thrust, etc.) */
  Input = 'input',
  /** Request full state snapshot */
  RequestSnapshot = 'request_snapshot',
  /** Camera update (for interest management) */
  CameraUpdate = 'camera_update',
  /** Admin command */
  AdminCommand = 'admin_command',
  /** Ping for latency measurement */
  Ping = 'ping',
  /** Acknowledge a server message */
  Ack = 'ack',
}

export enum ServerMessageType {
  /** Full state snapshot */
  Snapshot = 'snapshot',
  /** Incremental delta update */
  Delta = 'delta',
  /** Step diagnostics (every tick) */
  StepResult = 'step_result',
  /** Player joined notification */
  PlayerJoined = 'player_joined',
  /** Player left notification */
  PlayerLeft = 'player_left',
  /** Server event (collision, SOI transition, etc.) */
  Event = 'event',
  /** Pong response */
  Pong = 'pong',
  /** Error message */
  Error = 'error',
  /** Admin response */
  AdminResponse = 'admin_response',
  /** Input acknowledgement (for client prediction reconciliation) */
  InputAck = 'input_ack',
  /** Binary body positions update (high-frequency) */
  PositionUpdate = 'position_update',
}

// ── Client Messages ──────────────────────────────────────────────────────────

export interface JoinMessage {
  type: ClientMessageType.Join;
  playerName: string;
  protocolVersion: number;
}

export interface LeaveMessage {
  type: ClientMessageType.Leave;
}

export interface InputMessage {
  type: ClientMessageType.Input;
  seq: number; // Client sequence number for reconciliation
  tick: number; // Client's predicted tick
  action: InputAction;
}

export interface RequestSnapshotMessage {
  type: ClientMessageType.RequestSnapshot;
}

export interface CameraUpdateMessage {
  type: ClientMessageType.CameraUpdate;
  camera: CameraState;
}

export interface AdminCommandMessage {
  type: ClientMessageType.AdminCommand;
  command: string;
  args: Record<string, unknown>;
}

export interface PingMessage {
  type: ClientMessageType.Ping;
  timestamp: number;
}

export interface AckMessage {
  type: ClientMessageType.Ack;
  messageId: number;
}

export type ClientMessage =
  | JoinMessage
  | LeaveMessage
  | InputMessage
  | RequestSnapshotMessage
  | CameraUpdateMessage
  | AdminCommandMessage
  | PingMessage
  | AckMessage;

// ── Server Messages ──────────────────────────────────────────────────────────

export interface SnapshotMessage {
  type: ServerMessageType.Snapshot;
  state: SimulationState;
  yourPlayerId: number;
  serverTick: number;
}

export interface DeltaUpdate {
  bodyId: BodyId;
  position?: Vec3;
  velocity?: Vec3;
  acceleration?: Vec3;
  removed?: boolean;
}

export interface DeltaMessage {
  type: ServerMessageType.Delta;
  tick: number;
  time: number;
  deltas: DeltaUpdate[];
  newBodies?: Body[];
  removedBodies?: BodyId[];
  configChanges?: Partial<SimConfig>;
}

export interface StepResultMessage {
  type: ServerMessageType.StepResult;
  result: StepResult;
}

export interface PlayerJoinedMessage {
  type: ServerMessageType.PlayerJoined;
  playerId: number;
  playerName: string;
}

export interface PlayerLeftMessage {
  type: ServerMessageType.PlayerLeft;
  playerId: number;
}

export enum SimEventType {
  Collision = 'collision',
  SOITransition = 'soi_transition',
  IntegratorSwitch = 'integrator_switch',
  ConservationWarning = 'conservation_warning',
  BodyAdded = 'body_added',
  BodyRemoved = 'body_removed',
}

export interface SimEvent {
  type: SimEventType;
  tick: number;
  data: Record<string, unknown>;
}

export interface EventMessage {
  type: ServerMessageType.Event;
  event: SimEvent;
}

export interface PongMessage {
  type: ServerMessageType.Pong;
  clientTimestamp: number;
  serverTimestamp: number;
}

export interface ErrorMessage {
  type: ServerMessageType.Error;
  code: string;
  message: string;
}

export interface AdminResponseMessage {
  type: ServerMessageType.AdminResponse;
  success: boolean;
  data: unknown;
}

export interface InputAckMessage {
  type: ServerMessageType.InputAck;
  seq: number;
  tick: number;
  playerId: number;
}

/** High-frequency binary position update.
 *  Sent as ArrayBuffer: [tick(u32)][bodyCount(u32)][x0,y0,z0,x1,...](f64 each)
 */
export interface PositionUpdateMessage {
  type: ServerMessageType.PositionUpdate;
  tick: number;
  positions: Float64Array;
}

export type ServerMessage =
  | SnapshotMessage
  | DeltaMessage
  | StepResultMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | EventMessage
  | PongMessage
  | ErrorMessage
  | AdminResponseMessage
  | InputAckMessage
  | PositionUpdateMessage;

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
export function encodePositions(tick: number, positions: Float64Array): ArrayBuffer {
  const bodyCount = positions.length / 3;
  const buffer = new ArrayBuffer(8 + positions.byteLength);
  const view = new DataView(buffer);
  view.setUint32(0, tick, true);
  view.setUint32(4, bodyCount, true);
  new Float64Array(buffer, 8).set(positions);
  return buffer;
}

/** Decode a binary position update. */
export function decodePositions(buffer: ArrayBuffer): { tick: number; positions: Float64Array } {
  const view = new DataView(buffer);
  const tick = view.getUint32(0, true);
  const bodyCount = view.getUint32(4, true);
  const positions = new Float64Array(buffer, 8, bodyCount * 3);
  return { tick, positions };
}

/** Create a JSON message string. */
export function encodeMessage(msg: ClientMessage | Exclude<ServerMessage, PositionUpdateMessage>): string {
  return JSON.stringify(msg);
}

/** Parse a JSON message. */
export function decodeMessage<T = ClientMessage | ServerMessage>(data: string): T {
  return JSON.parse(data) as T;
}
