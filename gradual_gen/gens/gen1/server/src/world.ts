/**
 * Game World Manager
 * 
 * Manages the simulation state including:
 * - Physics engine
 * - Celestial bodies
 * - Players
 * - Time control
 * 
 * @module world
 */

import { v4 as uuid } from 'uuid';
import {
  Vec3,
  Time,
  J2000_JD,
  UNIVERSE_PRESETS,
  SimulationError,
  type UniverseSize,
  type WorldState,
  type SerializedWorldState,
  type CelestialBody,
  type BodyCore,
  type BodyState,
  type BodyId,
  type Player,
  type PlayerId,
  type SerializedBody,
  type SerializedPlayer,
  type PhysicsConfig
} from '@nbody/shared';

import { PhysicsEngine, createPhysicsEngine } from '@nbody/physics-core';

/**
 * World manager handles all game state
 */
export class WorldManager {
  private engine: PhysicsEngine;
  private players: Map<PlayerId, Player>;
  private timeScale: number;
  private paused: boolean;
  private universeSize: UniverseSize;
  private seed: number;
  private julianDate: number;
  
  constructor(config: Partial<PhysicsConfig> = {}, universeSize: UniverseSize = 'medium') {
    this.engine = createPhysicsEngine(config);
    this.players = new Map();
    this.timeScale = 1.0;
    this.paused = false;
    this.universeSize = universeSize;
    this.seed = Math.floor(Math.random() * 2147483647);
    this.julianDate = J2000_JD;
  }
  
  /**
   * Update the simulation
   * @param dt - Real time delta in seconds
   */
  update(dt: number): void {
    if (this.paused) return;
    
    const scaledDt = dt * this.timeScale;
    this.engine.update(scaledDt);
    
    // Update Julian date
    this.julianDate += scaledDt / 86400; // seconds to days
    
    // Update player world positions
    this.updatePlayerWorldPositions();
  }
  
  /**
   * Add a celestial body
   */
  addBody(core: BodyCore, state: BodyState): CelestialBody {
    const limits = UNIVERSE_PRESETS[this.universeSize];
    const currentMassive = this.engine.getMassiveBodies().length;
    
    if (core.bodyType === 'massive' && currentMassive >= limits.maxMassiveBodies) {
      throw SimulationError.bodyLimitExceeded(currentMassive + 1, limits.maxMassiveBodies, 'massive');
    }
    
    return this.engine.addBody(core, state);
  }
  
  /**
   * Remove a body
   */
  removeBody(id: BodyId): boolean {
    return this.engine.removeBody(id);
  }
  
  /**
   * Get a body by ID
   */
  getBody(id: BodyId): CelestialBody | undefined {
    return this.engine.getBody(id);
  }
  
  /**
   * Get all bodies
   */
  getAllBodies(): CelestialBody[] {
    return this.engine.getAllBodies();
  }
  
  /**
   * Add a player to the world
   */
  addPlayer(id: PlayerId, name: string, spawnBodyId: BodyId): Player {
    const limits = UNIVERSE_PRESETS[this.universeSize];
    
    if (this.players.size >= limits.maxPlayers) {
      throw new Error(`Player limit exceeded: ${this.players.size + 1} > ${limits.maxPlayers}`);
    }
    
    const spawnBody = this.engine.getBody(spawnBodyId);
    if (!spawnBody) {
      throw new Error(`Spawn body ${spawnBodyId} not found`);
    }
    
    // Calculate spawn position (on surface, facing "up")
    // For now, spawn at +X from center, on surface
    const surfaceOffset = Vec3.mutableVec3(spawnBody.core.radius + 2, 0, 0);
    
    // Calculate orbital velocity for the spawn body
    // v = sqrt(GM_parent / r) for circular orbit
    // For player on surface, match the body's velocity
    const player: Player = {
      id,
      name,
      currentBodyId: spawnBodyId,
      localPosition: surfaceOffset,
      localVelocity: Vec3.mutableZero(),
      worldPosition: Vec3.mutableZero(),
      worldVelocity: Vec3.mutableZero(),
      rotation: [0, 0, 0, 1], // Identity quaternion
      inVehicle: false,
      lastUpdate: Date.now(),
      ping: 0
    };
    
    this.updatePlayerWorldPosition(player, spawnBody);
    this.players.set(id, player);
    
    return player;
  }
  
  /**
   * Remove a player
   */
  removePlayer(id: PlayerId): boolean {
    return this.players.delete(id);
  }
  
  /**
   * Get a player by ID
   */
  getPlayer(id: PlayerId): Player | undefined {
    return this.players.get(id);
  }
  
  /**
   * Get all players
   */
  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }
  
  /**
   * Update all player world positions based on their current body
   */
  private updatePlayerWorldPositions(): void {
    for (const player of this.players.values()) {
      const body = this.engine.getBody(player.currentBodyId);
      if (body) {
        this.updatePlayerWorldPosition(player, body);
      }
    }
  }
  
  /**
   * Update a single player's world position
   */
  private updatePlayerWorldPosition(player: Player, body: CelestialBody): void {
    // Transform local position to world position
    // For now, simple addition (no rotation)
    player.worldPosition.x = body.state.position.x + player.localPosition.x;
    player.worldPosition.y = body.state.position.y + player.localPosition.y;
    player.worldPosition.z = body.state.position.z + player.localPosition.z;
    
    // World velocity = body velocity + local velocity (in body frame)
    player.worldVelocity.x = body.state.velocity.x + player.localVelocity.x;
    player.worldVelocity.y = body.state.velocity.y + player.localVelocity.y;
    player.worldVelocity.z = body.state.velocity.z + player.localVelocity.z;
  }
  
  /**
   * Set time scale
   */
  setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale);
  }
  
  /**
   * Get time scale
   */
  getTimeScale(): number {
    return this.timeScale;
  }
  
  /**
   * Pause simulation
   */
  pause(): void {
    this.paused = true;
  }
  
  /**
   * Resume simulation
   */
  resume(): void {
    this.paused = false;
  }
  
  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.paused;
  }
  
  /**
   * Get current simulation time
   */
  getTime(): number {
    return this.engine.getState().time;
  }
  
  /**
   * Get current tick
   */
  getTick(): number {
    return this.engine.getState().tick;
  }
  
  /**
   * Get Julian Date
   */
  getJulianDate(): number {
    return this.julianDate;
  }
  
  /**
   * Serialize world state for network transmission or saving
   */
  serialize(): SerializedWorldState {
    const bodies: SerializedBody[] = this.engine.getAllBodies().map(b => ({
      id: b.core.id,
      name: b.core.name,
      bodyType: b.core.bodyType,
      celestialType: b.core.celestialType,
      mass: b.core.mass,
      mu: b.core.mu,
      radius: b.core.radius,
      softening: b.core.softening,
      position: [b.state.position.x, b.state.position.y, b.state.position.z],
      velocity: [b.state.velocity.x, b.state.velocity.y, b.state.velocity.z],
      rotation: b.state.rotation,
      parentId: b.core.parentId,
      rotationPeriod: b.core.rotationPeriod,
      axialTilt: b.core.axialTilt
    }));
    
    const players: SerializedPlayer[] = this.getAllPlayers().map(p => ({
      id: p.id,
      name: p.name,
      currentBodyId: p.currentBodyId,
      localPosition: [p.localPosition.x, p.localPosition.y, p.localPosition.z],
      localVelocity: [p.localVelocity.x, p.localVelocity.y, p.localVelocity.z],
      worldPosition: [p.worldPosition.x, p.worldPosition.y, p.worldPosition.z],
      worldVelocity: [p.worldVelocity.x, p.worldVelocity.y, p.worldVelocity.z],
      rotation: p.rotation,
      inVehicle: p.inVehicle,
      vehicleId: p.vehicleId
    }));
    
    return {
      tick: this.getTick(),
      time: this.getTime(),
      julianDate: this.julianDate,
      timeScale: this.timeScale,
      bodies,
      players,
      physicsConfig: this.engine.getConfig(),
      universeSize: this.universeSize,
      seed: this.seed,
      paused: this.paused,
      version: '0.1.0',
      savedAt: new Date().toISOString()
    };
  }
  
  /**
   * Load world state from serialized data
   */
  static deserialize(data: SerializedWorldState): WorldManager {
    const world = new WorldManager(data.physicsConfig, data.universeSize);
    world.seed = data.seed;
    world.timeScale = data.timeScale;
    world.paused = data.paused;
    world.julianDate = data.julianDate;
    
    // Add bodies
    for (const b of data.bodies) {
      const core: BodyCore = {
        id: b.id,
        name: b.name,
        bodyType: b.bodyType,
        celestialType: b.celestialType,
        mass: b.mass,
        mu: b.mu,
        radius: b.radius,
        softening: b.softening,
        parentId: b.parentId,
        rotationPeriod: b.rotationPeriod,
        axialTilt: b.axialTilt
      };
      
      const state: BodyState = {
        position: Vec3.mutableVec3(b.position[0], b.position[1], b.position[2]),
        velocity: Vec3.mutableVec3(b.velocity[0], b.velocity[1], b.velocity[2]),
        rotation: b.rotation,
        acceleration: Vec3.mutableZero()
      };
      
      world.addBody(core, state);
    }
    
    // Add players
    for (const p of data.players) {
      const player: Player = {
        id: p.id,
        name: p.name,
        currentBodyId: p.currentBodyId,
        localPosition: Vec3.mutableVec3(p.localPosition[0], p.localPosition[1], p.localPosition[2]),
        localVelocity: Vec3.mutableVec3(p.localVelocity[0], p.localVelocity[1], p.localVelocity[2]),
        worldPosition: Vec3.mutableVec3(p.worldPosition[0], p.worldPosition[1], p.worldPosition[2]),
        worldVelocity: Vec3.mutableVec3(p.worldVelocity[0], p.worldVelocity[1], p.worldVelocity[2]),
        rotation: p.rotation,
        inVehicle: p.inVehicle,
        vehicleId: p.vehicleId,
        lastUpdate: Date.now(),
        ping: 0
      };
      world.players.set(p.id, player);
    }
    
    return world;
  }
  
  /**
   * Get simulation statistics
   */
  getStats() {
    const engineStats = this.engine.getStats();
    return {
      ...engineStats,
      playerCount: this.players.size,
      timeScale: this.timeScale,
      paused: this.paused,
      julianDate: this.julianDate,
      isoDate: Time.julianToISO(this.julianDate)
    };
  }
}
