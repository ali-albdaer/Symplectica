/**
 * Player Types and Classes
 * =========================
 * Player entity for the simulation.
 */
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { CelestialBody } from '../bodies/CelestialBody.js';
import { PlayerInputState, PlayerState } from '../network/protocol.js';
/**
 * Player movement mode
 */
export declare enum PlayerMode {
    /** Walking on planet surface */
    SURFACE = "surface",
    /** Flying in space (EVA or spacecraft) */
    SPACE = "space",
    /** World builder mode (orthographic view) */
    WORLD_BUILDER = "world_builder"
}
/**
 * Player movement configuration
 */
export interface PlayerMovementConfig {
    /** Walking speed in m/s */
    walkSpeed: number;
    /** Sprint multiplier */
    sprintMultiplier: number;
    /** Jump velocity in m/s */
    jumpVelocity: number;
    /** EVA thrust in m/s² */
    evaThrust: number;
    /** EVA rotation speed in rad/s */
    evaRotationSpeed: number;
    /** Camera sensitivity */
    cameraSensitivity: number;
}
export declare const DEFAULT_PLAYER_MOVEMENT: PlayerMovementConfig;
/**
 * Input state buffer for client-side prediction
 */
export interface InputBuffer {
    input: PlayerInputState;
    timestamp: number;
    deltaTime: number;
}
/**
 * Player entity
 */
export declare class Player {
    readonly id: string;
    name: string;
    position: Vector3;
    velocity: Vector3;
    orientation: Quaternion;
    mode: PlayerMode;
    currentBody: CelestialBody | null;
    isGrounded: boolean;
    groundNormal: Vector3;
    movementConfig: PlayerMovementConfig;
    currentInput: PlayerInputState;
    private inputBuffer;
    private lastProcessedInput;
    health: number;
    isAlive: boolean;
    constructor(id: string, name: string, position?: Vector3, config?: Partial<PlayerMovementConfig>);
    /**
     * Create empty input state
     */
    createEmptyInput(): PlayerInputState;
    /**
     * Apply input for physics update
     */
    applyInput(input: PlayerInputState, dt: number): void;
    /**
     * Surface movement (walking on planet)
     */
    private applySurfaceMovement;
    /**
     * Space movement (EVA or spacecraft)
     */
    private applySpaceMovement;
    /**
     * Update physics (gravity, collisions, etc.)
     */
    updatePhysics(dt: number, gravityAccel: Vector3): void;
    /**
     * Check and resolve collision with a celestial body
     */
    checkCollision(body: CelestialBody): boolean;
    /**
     * Spawn player on a celestial body surface
     */
    spawnOnBody(body: CelestialBody, latitude?: number, longitude?: number): void;
    /**
     * Transition to space mode
     */
    enterSpaceMode(): void;
    /**
     * Transition to world builder mode
     */
    enterWorldBuilderMode(): void;
    /**
     * Exit world builder mode
     */
    exitWorldBuilderMode(): void;
    /**
     * Buffer input for client-side prediction
     */
    bufferInput(input: PlayerInputState, deltaTime: number): void;
    /**
     * Reconcile with server state
     */
    reconcile(serverState: PlayerState): void;
    /**
     * Convert to network state
     */
    toNetworkState(): PlayerState;
    /**
     * Apply network state
     */
    applyNetworkState(state: PlayerState): void;
    /**
     * Get forward direction
     */
    getForward(): Vector3;
    /**
     * Get right direction
     */
    getRight(): Vector3;
    /**
     * Get up direction
     */
    getUp(): Vector3;
}
//# sourceMappingURL=Player.d.ts.map