/**
 * N-Body Physics Engine
 * 
 * Core physics simulation engine implementing:
 * - Symplectic integration (Velocity Verlet)
 * - Barnes-Hut octree for O(N log N) gravity
 * - Floating origin for numerical precision
 * - Fixed timestep with accumulator pattern
 * 
 * Mathematical basis:
 * - Newton's law of gravitation: F = G * m1 * m2 / r²
 * - Acceleration: a = F/m = G * M / r²
 * - Using GM (gravitational parameter) directly for precision
 * 
 * @module engine
 */

import {
  G,
  PHYSICS_DT,
  PHYSICS_TICK_RATE,
  FLOATING_ORIGIN_THRESHOLD,
  SOI_SWITCH_FACTOR,
  Vec3,
  SimulationError,
  validateNumber,
  type PhysicsConfig,
  type CelestialBody,
  type BodyId,
  type MutableVector3D,
  type Vector3D,
  type BodyCore,
  type BodyState
} from '@nbody/shared';

import { createIntegrator, type Integrator, type IntegrationState } from './integrators/index.js';
import { createGravityCalculator, type GravityCalculator, type OctreeBody } from './gravity/index.js';

/**
 * Default physics configuration
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  dt: PHYSICS_DT,
  tickRate: PHYSICS_TICK_RATE,
  integrator: 'velocity-verlet',
  closeEncounterIntegrator: 'rk45',
  gravityAlgorithm: 'barnes-hut',
  barnesHutTheta: 0.5,
  octreeMaxDepth: 16,
  enableSubStepping: true,
  maxSubSteps: 10,
  G: G,
  c: 299792458
};

/**
 * Physics engine state
 */
interface EngineState {
  /** Current simulation time in seconds */
  time: number;
  
  /** Current tick number */
  tick: number;
  
  /** Time accumulator for fixed timestep */
  accumulator: number;
  
  /** Current floating origin offset */
  originOffset: MutableVector3D;
  
  /** ID of the body used as origin reference */
  originBodyId: BodyId | null;
}

/**
 * Energy tracking for validation
 */
interface EnergyState {
  /** Total kinetic energy in J */
  kinetic: number;
  
  /** Total potential energy in J */
  potential: number;
  
  /** Total mechanical energy in J */
  total: number;
  
  /** Initial total energy (for drift detection) */
  initial: number | null;
  
  /** Maximum observed relative error */
  maxRelativeError: number;
}

/**
 * N-Body Physics Engine
 */
export class PhysicsEngine {
  private config: PhysicsConfig;
  private state: EngineState;
  private bodies: Map<BodyId, CelestialBody>;
  private integrator: Integrator;
  private closeEncounterIntegrator: Integrator;
  private gravityCalculator: GravityCalculator;
  private integrationStates: Map<BodyId, IntegrationState>;
  private energy: EnergyState;
  
  /**
   * Create a new physics engine
   * 
   * @param config - Physics configuration (uses defaults for missing values)
   */
  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = { ...DEFAULT_PHYSICS_CONFIG, ...config };
    
    this.state = {
      time: 0,
      tick: 0,
      accumulator: 0,
      originOffset: Vec3.mutableZero(),
      originBodyId: null
    };
    
    this.bodies = new Map();
    this.integrationStates = new Map();
    
    this.energy = {
      kinetic: 0,
      potential: 0,
      total: 0,
      initial: null,
      maxRelativeError: 0
    };
    
    // Create integrators
    this.integrator = createIntegrator(this.config.integrator);
    this.closeEncounterIntegrator = createIntegrator(this.config.closeEncounterIntegrator);
    
    // Create gravity calculator
    this.gravityCalculator = createGravityCalculator(
      this.config.gravityAlgorithm,
      this.config.barnesHutTheta,
      1000 // default softening
    );
  }
  
  /**
   * Add a celestial body to the simulation
   */
  addBody(core: BodyCore, initialState: BodyState): CelestialBody {
    if (this.bodies.has(core.id)) {
      throw new Error(`Body with ID ${core.id} already exists`);
    }
    
    // Validate initial state
    Vec3.validate(initialState.position, `${core.name} position`);
    Vec3.validate(initialState.velocity, `${core.name} velocity`);
    
    const body: CelestialBody = {
      core,
      state: initialState
    };
    
    this.bodies.set(core.id, body);
    
    // Create integration state for massive bodies
    if (core.bodyType === 'massive') {
      this.integrationStates.set(core.id, {
        id: core.id,
        position: initialState.position,
        velocity: initialState.velocity,
        accel: Vec3.mutableZero(),
        mass: core.mass,
        mu: core.mu
      });
    }
    
    return body;
  }
  
  /**
   * Remove a body from the simulation
   */
  removeBody(id: BodyId): boolean {
    this.integrationStates.delete(id);
    return this.bodies.delete(id);
  }
  
  /**
   * Get a body by ID
   */
  getBody(id: BodyId): CelestialBody | undefined {
    return this.bodies.get(id);
  }
  
  /**
   * Get all bodies
   */
  getAllBodies(): CelestialBody[] {
    return Array.from(this.bodies.values());
  }
  
  /**
   * Get massive bodies only (for gravity calculations)
   */
  getMassiveBodies(): CelestialBody[] {
    return Array.from(this.bodies.values())
      .filter(b => b.core.bodyType === 'massive');
  }
  
  /**
   * Set the origin body for floating origin
   * The universe will be shifted so this body is at (0,0,0)
   */
  setOriginBody(id: BodyId | null): void {
    this.state.originBodyId = id;
    if (id !== null) {
      const body = this.bodies.get(id);
      if (body) {
        Vec3.copy(this.state.originOffset, body.state.position);
      }
    } else {
      Vec3.set(this.state.originOffset, 0, 0, 0);
    }
  }
  
  /**
   * Get position relative to current origin
   */
  getRelativePosition(absolutePosition: Vector3D): Vector3D {
    return Vec3.sub(absolutePosition, this.state.originOffset);
  }
  
  /**
   * Update floating origin if needed
   */
  private updateFloatingOrigin(): void {
    if (this.state.originBodyId === null) {
      // Check if origin needs recentering
      const offsetMagnitude = Vec3.length(this.state.originOffset);
      if (offsetMagnitude > FLOATING_ORIGIN_THRESHOLD) {
        // Recenter on the most massive body
        let maxMass = 0;
        let centerBody: CelestialBody | null = null;
        
        for (const body of this.bodies.values()) {
          if (body.core.mass > maxMass) {
            maxMass = body.core.mass;
            centerBody = body;
          }
        }
        
        if (centerBody) {
          Vec3.copy(this.state.originOffset, centerBody.state.position);
        }
      }
    } else {
      // Track the origin body
      const body = this.bodies.get(this.state.originBodyId);
      if (body) {
        Vec3.copy(this.state.originOffset, body.state.position);
      }
    }
  }
  
  /**
   * Perform one physics tick
   */
  tick(): void {
    const dt = this.config.dt;
    
    // Get massive bodies for gravity calculation
    const massiveBodies = this.getMassiveBodies();
    
    // Convert to octree format
    const octreeBodies: OctreeBody[] = massiveBodies.map(b => ({
      id: b.core.id,
      position: b.state.position,
      mass: b.core.mass,
      mu: b.core.mu
    }));
    
    // Prepare gravity calculator
    this.gravityCalculator.prepare(octreeBodies);
    
    // Calculate initial accelerations if first tick
    if (this.state.tick === 0) {
      for (const body of massiveBodies) {
        const state = this.integrationStates.get(body.core.id);
        if (state) {
          const accel = this.gravityCalculator.calculateAcceleration(
            body.state.position,
            body.core.id
          );
          Vec3.copy(state.accel, accel);
        }
      }
    }
    
    // Integrate all massive bodies
    const integrationStates = Array.from(this.integrationStates.values());
    
    if (this.integrator.stepBatch) {
      // Use batch integration if available
      this.integrator.stepBatch(
        integrationStates,
        dt,
        (positions) => {
          // Recalculate accelerations for all bodies at new positions
          return positions.map((pos, i) => {
            const bodyId = integrationStates[i]!.id;
            return this.gravityCalculator.calculateAcceleration(pos, bodyId);
          });
        }
      );
    } else {
      // Fall back to individual integration
      for (const state of integrationStates) {
        this.integrator.step(
          state,
          dt,
          (pos) => this.gravityCalculator.calculateAcceleration(pos, state.id)
        );
      }
    }
    
    // Validate results
    for (const state of integrationStates) {
      if (Vec3.hasNaN(state.position)) {
        throw SimulationError.nanDetected('position', state.id);
      }
      if (Vec3.hasNaN(state.velocity)) {
        throw SimulationError.nanDetected('velocity', state.id);
      }
    }
    
    // Update body rotations
    for (const body of this.bodies.values()) {
      if (body.core.rotationPeriod && body.core.rotationPeriod !== 0) {
        const angularVelocity = (2 * Math.PI) / body.core.rotationPeriod;
        body.state.rotation += angularVelocity * dt;
        body.state.rotation = body.state.rotation % (2 * Math.PI);
      }
    }
    
    // Update floating origin
    this.updateFloatingOrigin();
    
    // Update time
    this.state.time += dt;
    this.state.tick++;
  }
  
  /**
   * Update with variable delta time (uses accumulator pattern)
   * Call this with your frame time to maintain fixed physics tick
   * 
   * @param frameDt - Frame delta time in seconds
   * @returns Number of ticks performed
   */
  update(frameDt: number): number {
    // Clamp frame time to prevent spiral of death
    const clampedDt = Math.min(frameDt, 0.25); // Max 250ms
    this.state.accumulator += clampedDt;
    
    let ticksPerformed = 0;
    
    while (this.state.accumulator >= this.config.dt) {
      this.tick();
      this.state.accumulator -= this.config.dt;
      ticksPerformed++;
    }
    
    return ticksPerformed;
  }
  
  /**
   * Get interpolation alpha for smooth rendering
   * Use this to interpolate between physics states for smooth visuals
   */
  getInterpolationAlpha(): number {
    return this.state.accumulator / this.config.dt;
  }
  
  /**
   * Calculate total energy of the system
   * Used for validating energy conservation
   */
  calculateTotalEnergy(): EnergyState {
    let kinetic = 0;
    let potential = 0;
    
    const massiveBodies = this.getMassiveBodies();
    
    // Kinetic energy: KE = 0.5 * m * v²
    for (const body of massiveBodies) {
      const v = body.state.velocity;
      const vSq = v.x * v.x + v.y * v.y + v.z * v.z;
      kinetic += 0.5 * body.core.mass * vSq;
    }
    
    // Potential energy: PE = -G * m1 * m2 / r (sum over all pairs)
    for (let i = 0; i < massiveBodies.length; i++) {
      const body1 = massiveBodies[i]!;
      for (let j = i + 1; j < massiveBodies.length; j++) {
        const body2 = massiveBodies[j]!;
        const r = Vec3.distance(body1.state.position, body2.state.position);
        if (r > 0) {
          potential -= this.config.G * body1.core.mass * body2.core.mass / r;
        }
      }
    }
    
    const total = kinetic + potential;
    
    // Track relative error
    if (this.energy.initial === null) {
      this.energy.initial = total;
    }
    
    const relativeError = this.energy.initial !== 0
      ? Math.abs((total - this.energy.initial) / this.energy.initial)
      : 0;
    
    this.energy = {
      kinetic,
      potential,
      total,
      initial: this.energy.initial,
      maxRelativeError: Math.max(this.energy.maxRelativeError, relativeError)
    };
    
    return this.energy;
  }
  
  /**
   * Calculate Sphere of Influence for a body
   * SOI = a * (m / M)^(2/5) where a is semi-major axis
   * 
   * For now, simplified as SOI ≈ r * (m / M)^0.4 where r is current distance to parent
   */
  calculateSOI(bodyId: BodyId, parentId: BodyId): number {
    const body = this.bodies.get(bodyId);
    const parent = this.bodies.get(parentId);
    
    if (!body || !parent) {
      return 0;
    }
    
    const r = Vec3.distance(body.state.position, parent.state.position);
    const massRatio = body.core.mass / parent.core.mass;
    
    return r * Math.pow(massRatio, 0.4);
  }
  
  /**
   * Get current simulation state
   */
  getState(): Readonly<EngineState> {
    return this.state;
  }
  
  /**
   * Get current configuration
   */
  getConfig(): Readonly<PhysicsConfig> {
    return this.config;
  }
  
  /**
   * Update configuration
   * Some changes take effect immediately, others on next tick
   */
  updateConfig(updates: Partial<PhysicsConfig>): void {
    const newConfig = { ...this.config, ...updates };
    
    // Check if integrator changed
    if (updates.integrator && updates.integrator !== this.config.integrator) {
      this.integrator = createIntegrator(updates.integrator);
    }
    
    // Check if gravity algorithm changed
    if (updates.gravityAlgorithm && updates.gravityAlgorithm !== this.config.gravityAlgorithm) {
      this.gravityCalculator = createGravityCalculator(
        updates.gravityAlgorithm,
        updates.barnesHutTheta ?? this.config.barnesHutTheta,
        1000
      );
    }
    
    this.config = newConfig;
  }
  
  /**
   * Reset the simulation
   */
  reset(): void {
    this.bodies.clear();
    this.integrationStates.clear();
    this.state = {
      time: 0,
      tick: 0,
      accumulator: 0,
      originOffset: Vec3.mutableZero(),
      originBodyId: null
    };
    this.energy = {
      kinetic: 0,
      potential: 0,
      total: 0,
      initial: null,
      maxRelativeError: 0
    };
  }
  
  /**
   * Get statistics about the simulation
   */
  getStats(): {
    bodyCount: number;
    massiveBodyCount: number;
    tick: number;
    time: number;
    energy: EnergyState;
  } {
    return {
      bodyCount: this.bodies.size,
      massiveBodyCount: this.getMassiveBodies().length,
      tick: this.state.tick,
      time: this.state.time,
      energy: this.calculateTotalEnergy()
    };
  }
}

/**
 * Create a new physics engine with default configuration
 */
export function createPhysicsEngine(config?: Partial<PhysicsConfig>): PhysicsEngine {
  return new PhysicsEngine(config);
}
