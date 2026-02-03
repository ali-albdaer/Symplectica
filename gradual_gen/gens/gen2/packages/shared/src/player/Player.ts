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
export enum PlayerMode {
  /** Walking on planet surface */
  SURFACE = 'surface',
  /** Flying in space (EVA or spacecraft) */
  SPACE = 'space',
  /** World builder mode (orthographic view) */
  WORLD_BUILDER = 'world_builder'
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

export const DEFAULT_PLAYER_MOVEMENT: PlayerMovementConfig = {
  walkSpeed: 5,
  sprintMultiplier: 2,
  jumpVelocity: 4,
  evaThrust: 10,
  evaRotationSpeed: 1,
  cameraSensitivity: 0.002
};

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
export class Player {
  // Identity
  public readonly id: string;
  public name: string;

  // State
  public position: Vector3;
  public velocity: Vector3;
  public orientation: Quaternion;
  public mode: PlayerMode;

  // Current reference body (for surface mode)
  public currentBody: CelestialBody | null = null;

  // Grounded state
  public isGrounded: boolean = false;
  public groundNormal: Vector3 = Vector3.unitY();

  // Movement config
  public movementConfig: PlayerMovementConfig;

  // Input
  public currentInput: PlayerInputState;

  // Client-side prediction
  private inputBuffer: InputBuffer[] = [];
  private lastProcessedInput: number = 0;

  // Health/Status
  public health: number = 100;
  public isAlive: boolean = true;

  constructor(
    id: string,
    name: string,
    position: Vector3 = Vector3.zero(),
    config: Partial<PlayerMovementConfig> = {}
  ) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.velocity = Vector3.zero();
    this.orientation = Quaternion.identity();
    this.mode = PlayerMode.SURFACE;
    this.movementConfig = { ...DEFAULT_PLAYER_MOVEMENT, ...config };
    this.currentInput = this.createEmptyInput();
  }

  /**
   * Create empty input state
   */
  createEmptyInput(): PlayerInputState {
    return {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      sprint: false,
      pitchUp: false,
      pitchDown: false,
      yawLeft: false,
      yawRight: false,
      rollLeft: false,
      rollRight: false,
      thrustX: 0,
      thrustY: 0,
      thrustZ: 0,
      primaryAction: false,
      secondaryAction: false,
      cameraYaw: 0,
      cameraYitch: 0,
      sequence: 0
    };
  }

  /**
   * Apply input for physics update
   */
  applyInput(input: PlayerInputState, dt: number): void {
    this.currentInput = input;

    switch (this.mode) {
      case PlayerMode.SURFACE:
        this.applySurfaceMovement(input, dt);
        break;
      case PlayerMode.SPACE:
        this.applySpaceMovement(input, dt);
        break;
      case PlayerMode.WORLD_BUILDER:
        // World builder doesn't affect physics
        break;
    }
  }

  /**
   * Surface movement (walking on planet)
   */
  private applySurfaceMovement(input: PlayerInputState, dt: number): void {
    const config = this.movementConfig;
    let speed = config.walkSpeed;
    
    if (input.sprint) {
      speed *= config.sprintMultiplier;
    }

    // Get local coordinate system
    const up = this.groundNormal.clone();
    const forward = this.orientation.rotateVector(Vector3.unitZ()).negate();
    const right = Vector3.cross(up, forward).safeNormalize();
    forward.copy(Vector3.cross(right, up).safeNormalize());

    // Horizontal movement
    const moveDir = Vector3.zero();
    if (input.forward) moveDir.add(forward);
    if (input.backward) moveDir.sub(forward);
    if (input.right) moveDir.add(right);
    if (input.left) moveDir.sub(right);

    if (!moveDir.isZero()) {
      moveDir.safeNormalize().multiplyScalar(speed);
      // Apply to horizontal velocity
      const horizontalVel = Vector3.sub(this.velocity, Vector3.multiplyScalar(up, this.velocity.dot(up)));
      const targetHorizontalVel = moveDir;
      const blendFactor = Math.min(1, dt * 10); // Smooth acceleration
      this.velocity.sub(horizontalVel).add(Vector3.lerp(horizontalVel, targetHorizontalVel, blendFactor));
    } else if (this.isGrounded) {
      // Friction when not moving
      const horizontalVel = Vector3.sub(this.velocity, Vector3.multiplyScalar(up, this.velocity.dot(up)));
      const friction = Math.min(1, dt * 8);
      this.velocity.sub(Vector3.multiplyScalar(horizontalVel, friction));
    }

    // Jumping
    if (input.jump && this.isGrounded) {
      this.velocity.add(Vector3.multiplyScalar(up, config.jumpVelocity));
      this.isGrounded = false;
    }
  }

  /**
   * Space movement (EVA or spacecraft)
   */
  private applySpaceMovement(input: PlayerInputState, dt: number): void {
    const config = this.movementConfig;
    const thrust = config.evaThrust;

    // Get local coordinate system
    const forward = this.orientation.rotateVector(Vector3.unitZ()).negate();
    const right = this.orientation.rotateVector(Vector3.unitX());
    const up = this.orientation.rotateVector(Vector3.unitY());

    // Translation
    const thrustDir = Vector3.zero();
    if (input.forward) thrustDir.add(forward);
    if (input.backward) thrustDir.sub(forward);
    if (input.right) thrustDir.add(right);
    if (input.left) thrustDir.sub(right);
    if (input.up) thrustDir.add(up);
    if (input.down) thrustDir.sub(up);

    // Apply thrust input directly
    thrustDir.x += input.thrustX;
    thrustDir.y += input.thrustY;
    thrustDir.z += input.thrustZ;

    if (!thrustDir.isZero()) {
      thrustDir.safeNormalize().multiplyScalar(thrust * dt);
      this.velocity.add(thrustDir);
    }

    // Rotation
    const rotSpeed = config.evaRotationSpeed * dt;
    
    if (input.pitchUp) {
      const rotation = new Quaternion().setFromAxisAngle(right, rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
    if (input.pitchDown) {
      const rotation = new Quaternion().setFromAxisAngle(right, -rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
    if (input.yawLeft) {
      const rotation = new Quaternion().setFromAxisAngle(up, rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
    if (input.yawRight) {
      const rotation = new Quaternion().setFromAxisAngle(up, -rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
    if (input.rollLeft) {
      const rotation = new Quaternion().setFromAxisAngle(forward, rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
    if (input.rollRight) {
      const rotation = new Quaternion().setFromAxisAngle(forward, -rotSpeed);
      this.orientation.premultiply(rotation).normalize();
    }
  }

  /**
   * Update physics (gravity, collisions, etc.)
   */
  updatePhysics(dt: number, gravityAccel: Vector3): void {
    if (this.mode === PlayerMode.WORLD_BUILDER) {
      return;
    }

    // Apply gravity
    this.velocity.add(Vector3.multiplyScalar(gravityAccel, dt));

    // Update position
    this.position.add(Vector3.multiplyScalar(this.velocity, dt));
  }

  /**
   * Check and resolve collision with a celestial body
   */
  checkCollision(body: CelestialBody): boolean {
    const toPlayer = Vector3.sub(this.position, body.position);
    const distance = toPlayer.length();
    const playerRadius = 1; // 1 meter player radius

    if (distance < body.radius + playerRadius) {
      // Collision detected
      const normal = toPlayer.clone().divideScalar(distance);
      
      // Push out
      const penetration = body.radius + playerRadius - distance;
      this.position.add(Vector3.multiplyScalar(normal, penetration));

      // Update ground state
      this.isGrounded = true;
      this.groundNormal = normal;
      this.currentBody = body;

      // Adjust velocity (remove component into surface)
      const normalVel = this.velocity.dot(normal);
      if (normalVel < 0) {
        this.velocity.sub(Vector3.multiplyScalar(normal, normalVel));
      }

      return true;
    }

    return false;
  }

  /**
   * Spawn player on a celestial body surface
   */
  spawnOnBody(body: CelestialBody, latitude: number = 0, longitude: number = 0): void {
    // Calculate surface position
    const cosLat = Math.cos(latitude);
    const sinLat = Math.sin(latitude);
    const cosLon = Math.cos(longitude);
    const sinLon = Math.sin(longitude);

    const surfaceDir = new Vector3(
      cosLat * cosLon,
      sinLat,
      cosLat * sinLon
    );

    const playerHeight = 2; // 2 meters above surface
    this.position = Vector3.add(
      body.position,
      Vector3.multiplyScalar(surfaceDir, body.radius + playerHeight)
    );

    // Match body's velocity + surface rotation velocity
    this.velocity = body.velocity.clone();
    const surfaceVel = body.getSurfaceVelocity(this.position);
    this.velocity.add(surfaceVel);

    // Orient to stand on surface
    this.orientation = Quaternion.fromVectors(Vector3.unitY(), surfaceDir);

    // Set state
    this.currentBody = body;
    this.isGrounded = true;
    this.groundNormal = surfaceDir;
    this.mode = PlayerMode.SURFACE;
  }

  /**
   * Transition to space mode
   */
  enterSpaceMode(): void {
    this.mode = PlayerMode.SPACE;
    this.isGrounded = false;
    this.currentBody = null;
  }

  /**
   * Transition to world builder mode
   */
  enterWorldBuilderMode(): void {
    this.mode = PlayerMode.WORLD_BUILDER;
  }

  /**
   * Exit world builder mode
   */
  exitWorldBuilderMode(): void {
    if (this.currentBody) {
      this.mode = PlayerMode.SURFACE;
    } else {
      this.mode = PlayerMode.SPACE;
    }
  }

  /**
   * Buffer input for client-side prediction
   */
  bufferInput(input: PlayerInputState, deltaTime: number): void {
    this.inputBuffer.push({
      input,
      timestamp: Date.now(),
      deltaTime
    });

    // Limit buffer size
    while (this.inputBuffer.length > 60) {
      this.inputBuffer.shift();
    }
  }

  /**
   * Reconcile with server state
   */
  reconcile(serverState: PlayerState): void {
    // Apply server state
    this.position.set(serverState.position[0], serverState.position[1], serverState.position[2]);
    this.velocity.set(serverState.velocity[0], serverState.velocity[1], serverState.velocity[2]);
    this.orientation.set(
      serverState.orientation[0],
      serverState.orientation[1],
      serverState.orientation[2],
      serverState.orientation[3]
    );
    this.health = serverState.health;

    // Replay unprocessed inputs
    const unprocessed = this.inputBuffer.filter(
      b => b.input.sequence > serverState.lastProcessedInput
    );

    for (const buffered of unprocessed) {
      this.applyInput(buffered.input, buffered.deltaTime);
    }

    // Clear old inputs
    this.inputBuffer = unprocessed;
    this.lastProcessedInput = serverState.lastProcessedInput;
  }

  /**
   * Convert to network state
   */
  toNetworkState(): PlayerState {
    return {
      playerId: this.id,
      position: this.position.toArray(),
      velocity: this.velocity.toArray(),
      orientation: this.orientation.toArray(),
      currentBodyId: this.currentBody?.id ?? null,
      mode: this.mode === PlayerMode.WORLD_BUILDER ? 'world_builder' : 
            this.mode === PlayerMode.SPACE ? 'space' : 'surface',
      health: this.health,
      lastProcessedInput: this.lastProcessedInput
    };
  }

  /**
   * Apply network state
   */
  applyNetworkState(state: PlayerState): void {
    this.position.set(state.position[0], state.position[1], state.position[2]);
    this.velocity.set(state.velocity[0], state.velocity[1], state.velocity[2]);
    this.orientation.set(
      state.orientation[0],
      state.orientation[1],
      state.orientation[2],
      state.orientation[3]
    );
    this.health = state.health;
    this.mode = state.mode === 'world_builder' ? PlayerMode.WORLD_BUILDER :
                state.mode === 'space' ? PlayerMode.SPACE : PlayerMode.SURFACE;
  }

  /**
   * Get forward direction
   */
  getForward(): Vector3 {
    return this.orientation.rotateVector(Vector3.unitZ()).negate();
  }

  /**
   * Get right direction
   */
  getRight(): Vector3 {
    return this.orientation.rotateVector(Vector3.unitX());
  }

  /**
   * Get up direction
   */
  getUp(): Vector3 {
    return this.orientation.rotateVector(Vector3.unitY());
  }
}
