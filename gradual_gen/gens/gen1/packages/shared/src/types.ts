/**
 * Core Type Definitions
 * 
 * All types use SI units exclusively.
 * Position: meters (m)
 * Velocity: meters per second (m/s)
 * Mass: kilograms (kg)
 * Time: seconds (s)
 * 
 * @module types
 */

import type { UniverseSize } from './constants.js';

// ============================================================================
// VECTOR TYPES
// ============================================================================

/**
 * 3D Vector with Float64 precision
 * Used for physics calculations and absolute positions
 */
export interface Vector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/**
 * Mutable 3D vector for performance-critical code
 */
export interface MutableVector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D Vector stored as Float64Array for WebWorker transfer
 * Layout: [x, y, z]
 */
export type Vector3DArray = Float64Array;

/**
 * State vector (position + velocity)
 * Layout: [px, py, pz, vx, vy, vz]
 */
export type StateVector = Float64Array;

// ============================================================================
// CELESTIAL BODY TYPES
// ============================================================================

/**
 * Body classification for physics optimization
 * - Massive: Affects gravitational field (stars, planets, moons)
 * - Passive: Only affected by gravity, doesn't influence others (ships, asteroids)
 */
export type BodyType = 'massive' | 'passive';

/**
 * Celestial body classification for rendering/behavior
 */
export type CelestialType = 
  | 'star'
  | 'planet'
  | 'dwarf-planet'
  | 'gas-giant'
  | 'moon'
  | 'asteroid'
  | 'comet'
  | 'black-hole'
  | 'pulsar'
  | 'neutron-star';

/**
 * Unique identifier for bodies
 */
export type BodyId = string;

/**
 * Core properties shared by all bodies
 */
export interface BodyCore {
  /** Unique identifier */
  readonly id: BodyId;
  
  /** Human-readable name */
  readonly name: string;
  
  /** Physics classification */
  readonly bodyType: BodyType;
  
  /** Celestial classification */
  readonly celestialType: CelestialType;
  
  /** Mass in kg */
  readonly mass: number;
  
  /** GM (gravitational parameter) in m³/s² - more precise than G*M */
  readonly mu: number;
  
  /** Mean radius in m */
  readonly radius: number;
  
  /** Equatorial radius in m (for oblate bodies) */
  readonly radiusEquatorial?: number;
  
  /** Polar radius in m (for oblate bodies) */
  readonly radiusPolar?: number;
  
  /** Gravitational softening factor in m */
  readonly softening: number;
  
  /** Rotation period in s (positive = prograde) */
  readonly rotationPeriod?: number;
  
  /** Axial tilt in radians */
  readonly axialTilt?: number;
  
  /** Parent body ID for hierarchical systems */
  readonly parentId?: BodyId;
  
  /** Sphere of Influence radius in m */
  readonly soiRadius?: number;
}

/**
 * Dynamic state of a body (changes each tick)
 */
export interface BodyState {
  /** Position in m (absolute, Float64) */
  position: MutableVector3D;
  
  /** Velocity in m/s (absolute, Float64) */
  velocity: MutableVector3D;
  
  /** Current rotation angle in radians */
  rotation: number;
  
  /** Accumulated acceleration for Verlet integration */
  acceleration: MutableVector3D;
}

/**
 * Complete body definition
 */
export interface CelestialBody {
  readonly core: BodyCore;
  state: BodyState;
}

/**
 * Serialized body for network transfer
 * Uses arrays for compact representation
 */
export interface SerializedBody {
  id: BodyId;
  name: string;
  bodyType: BodyType;
  celestialType: CelestialType;
  mass: number;
  mu: number;
  radius: number;
  softening: number;
  /** [x, y, z] position in m */
  position: [number, number, number];
  /** [vx, vy, vz] velocity in m/s */
  velocity: [number, number, number];
  rotation: number;
  parentId?: BodyId;
  rotationPeriod?: number;
  axialTilt?: number;
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

/**
 * Unique player identifier
 */
export type PlayerId = string;

/**
 * Player state
 */
export interface Player {
  readonly id: PlayerId;
  name: string;
  
  /** Current body the player is on/in */
  currentBodyId: BodyId;
  
  /** Position relative to current body surface in m */
  localPosition: MutableVector3D;
  
  /** Velocity relative to current body in m/s */
  localVelocity: MutableVector3D;
  
  /** Absolute world position (computed) in m */
  worldPosition: MutableVector3D;
  
  /** Absolute world velocity (computed) in m/s */
  worldVelocity: MutableVector3D;
  
  /** Rotation as quaternion [x, y, z, w] */
  rotation: [number, number, number, number];
  
  /** Is player in a vehicle/ship */
  inVehicle: boolean;
  
  /** Vehicle ID if in one */
  vehicleId?: BodyId;
  
  /** Last server update timestamp */
  lastUpdate: number;
  
  /** Network latency in ms */
  ping: number;
}

/**
 * Serialized player for network transfer
 */
export interface SerializedPlayer {
  id: PlayerId;
  name: string;
  currentBodyId: BodyId;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number, number];
  inVehicle: boolean;
  vehicleId?: BodyId;
}

// ============================================================================
// PHYSICS CONFIGURATION
// ============================================================================

/**
 * Available integrator types
 */
export type IntegratorType = 
  | 'velocity-verlet'    // Default, symplectic, O(dt²)
  | 'rk4'                // Classic 4th order Runge-Kutta
  | 'rk45'               // Adaptive Runge-Kutta-Fehlberg
  | 'gauss-radau';       // High-order for close encounters

/**
 * Gravitational algorithm types
 */
export type GravityAlgorithm =
  | 'direct'             // O(N²) - exact
  | 'barnes-hut'         // O(N log N) - approximate
  | 'fmm';               // O(N) - Fast Multipole Method

/**
 * Physics engine configuration
 */
export interface PhysicsConfig {
  /** Time step in seconds */
  dt: number;
  
  /** Ticks per second */
  tickRate: number;
  
  /** Primary integrator */
  integrator: IntegratorType;
  
  /** Close-encounter integrator */
  closeEncounterIntegrator: IntegratorType;
  
  /** Gravity calculation algorithm */
  gravityAlgorithm: GravityAlgorithm;
  
  /** Barnes-Hut opening angle (0.0-1.0) */
  barnesHutTheta: number;
  
  /** Maximum octree depth */
  octreeMaxDepth: number;
  
  /** Enable sub-stepping for stability */
  enableSubStepping: boolean;
  
  /** Maximum sub-steps per tick */
  maxSubSteps: number;
  
  /** Gravitational constant (can override for testing) */
  G: number;
  
  /** Speed of light (for future relativistic effects) */
  c: number;
}

// ============================================================================
// WORLD / SIMULATION STATE
// ============================================================================

/**
 * Complete simulation state
 */
export interface WorldState {
  /** Simulation tick number */
  tick: number;
  
  /** Simulation time in seconds since epoch */
  time: number;
  
  /** Julian Date for ephemeris calculations */
  julianDate: number;
  
  /** Time scale (1.0 = real-time) */
  timeScale: number;
  
  /** All celestial bodies */
  bodies: Map<BodyId, CelestialBody>;
  
  /** All connected players */
  players: Map<PlayerId, Player>;
  
  /** Physics configuration */
  physicsConfig: PhysicsConfig;
  
  /** Universe size preset */
  universeSize: UniverseSize;
  
  /** World seed for deterministic procedural generation */
  seed: number;
  
  /** Is simulation paused */
  paused: boolean;
}

/**
 * Serialized world state for save/load and network sync
 */
export interface SerializedWorldState {
  tick: number;
  time: number;
  julianDate: number;
  timeScale: number;
  bodies: SerializedBody[];
  players: SerializedPlayer[];
  physicsConfig: PhysicsConfig;
  universeSize: UniverseSize;
  seed: number;
  paused: boolean;
  version: string;
  savedAt: string;
}

// ============================================================================
// NETWORK MESSAGES
// ============================================================================

/**
 * Message types for client-server communication
 */
export type MessageType =
  // Connection
  | 'connect'
  | 'disconnect'
  | 'ping'
  | 'pong'
  | 'identify'
  | 'identified'
  // State sync
  | 'world-state'
  | 'state-delta'
  | 'body-update'
  | 'player-update'
  // Player actions
  | 'player-join'
  | 'player-joined'
  | 'player-leave'
  | 'player-left'
  | 'player-input'
  | 'player-spawn'
  | 'player-spawned'
  | 'player-teleport'
  | 'spawn'
  | 'input'
  // Chat
  | 'chat'
  | 'chat-message'
  | 'system-message'
  // World builder
  | 'create-body'
  | 'delete-body'
  | 'modify-body'
  // Admin
  | 'set-time-scale'
  | 'pause'
  | 'resume'
  | 'load-preset';

/**
 * Base message structure
 */
export interface NetworkMessage {
  type: MessageType;
  timestamp: number;
  senderId?: string;
}

/**
 * Player input message
 */
export interface PlayerInputMessage extends NetworkMessage {
  type: 'player-input';
  input: PlayerInput;
  sequence: number;
}

/**
 * Player input state
 */
export interface PlayerInput {
  /** Movement direction (normalized) */
  moveDirection: [number, number, number];
  /** Look direction (euler angles) */
  lookDirection: [number, number];
  /** Action flags */
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  interact: boolean;
  /** Input timestamp for reconciliation */
  timestamp: number;
}

/**
 * World state delta for efficient updates
 */
export interface StateDelta {
  tick: number;
  time: number;
  /** Only changed bodies (position/velocity) */
  bodyUpdates: Array<{
    id: BodyId;
    position: [number, number, number];
    velocity: [number, number, number];
    rotation: number;
  }>;
  /** Only changed players */
  playerUpdates: SerializedPlayer[];
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Physics error types for debugging
 */
export type PhysicsErrorType =
  | 'singularity'        // Bodies too close
  | 'numerical-overflow' // Values exceeded Float64
  | 'energy-divergence'  // Energy conservation violated
  | 'nan-detected'       // NaN in calculations
  | 'body-limit-exceeded'// Too many bodies
  | 'invalid-state';     // Corrupted state

/**
 * Structured physics error
 */
export interface PhysicsError {
  type: PhysicsErrorType;
  message: string;
  details: {
    bodyIds?: BodyId[];
    values?: number[];
    tick?: number;
    time?: number;
  };
  timestamp: number;
  recoverable: boolean;
}

// ============================================================================
// RENDERING HINTS
// ============================================================================

/**
 * Visual properties for rendering (not used in physics)
 */
export interface BodyVisuals {
  /** Albedo color [r, g, b] 0-1 */
  color?: [number, number, number];
  
  /** Emissive color for stars [r, g, b] 0-1 */
  emissive?: [number, number, number];
  
  /** Luminosity in watts (for stars) */
  luminosity?: number;
  
  /** Temperature in Kelvin (for blackbody) */
  temperature?: number;
  
  /** Has atmosphere */
  hasAtmosphere?: boolean;
  
  /** Atmosphere height in m */
  atmosphereHeight?: number;
  
  /** Atmosphere density */
  atmosphereDensity?: number;
  
  /** Has rings */
  hasRings?: boolean;
  
  /** Ring inner radius in m */
  ringInnerRadius?: number;
  
  /** Ring outer radius in m */
  ringOuterRadius?: number;
  
  /** Texture ID/path */
  textureId?: string;
  
  /** Normal map ID/path */
  normalMapId?: string;
}
