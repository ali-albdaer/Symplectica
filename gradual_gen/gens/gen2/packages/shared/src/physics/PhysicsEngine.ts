/**
 * N-Body Physics Simulation Engine
 * ==================================
 * Core physics simulation with configurable integrators and gravity algorithms.
 * Runs at fixed timestep (60Hz default) independent of frame rate.
 * 
 * Features:
 * - Barnes-Hut O(N log N) for massive bodies
 * - O(1) for passive objects (only affected by gravity, don't exert it)
 * - Automatic integrator switching for close encounters
 * - Energy monitoring for validation
 * - Sub-stepping for time acceleration
 */

import { Vector3 } from '../math/Vector3.js';
import { CelestialBody } from '../bodies/CelestialBody.js';
import { BodyType, CelestialBodyDefinition } from '../bodies/types.js';
import { 
  G, 
  PHYSICS_TIMESTEP, 
  SOI_CLOSE_ENCOUNTER_THRESHOLD,
  MAX_SUBSTEPS 
} from '../constants.js';
import { 
  Integrator, 
  AccelerationFunction,
  createIntegrator
} from './integrators.js';
import { BarnesHutTree } from './BarnesHut.js';

/**
 * Gravity calculation method
 */
export enum GravityMethod {
  /** Exact O(N²) - all pairs */
  DIRECT = 'direct',
  /** Barnes-Hut O(N log N) */
  BARNES_HUT = 'barnes_hut',
  /** Fast Multipole Method O(N) - not yet implemented */
  FMM = 'fmm'
}

/**
 * Physics engine configuration
 */
export interface PhysicsConfig {
  /** Physics timestep in seconds (default: 1/60) */
  timestep: number;
  /** Gravity calculation method */
  gravityMethod: GravityMethod;
  /** Barnes-Hut opening angle (lower = more accurate) */
  barnesHutTheta: number;
  /** Default integrator for normal conditions */
  defaultIntegrator: string;
  /** Integrator for close encounters */
  closeEncounterIntegrator: string;
  /** Time acceleration factor (1 = real-time) */
  timeScale: number;
  /** Maximum substeps per frame */
  maxSubsteps: number;
  /** Enable collision detection */
  enableCollisions: boolean;
  /** Enable SOI transitions */
  enableSOI: boolean;
}

/**
 * Default physics configuration
 */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  timestep: PHYSICS_TIMESTEP,
  gravityMethod: GravityMethod.BARNES_HUT,
  barnesHutTheta: 0.5,
  defaultIntegrator: 'verlet',
  closeEncounterIntegrator: 'rk45',
  timeScale: 1,
  maxSubsteps: MAX_SUBSTEPS,
  enableCollisions: true,
  enableSOI: true
};

/**
 * Collision event
 */
export interface CollisionEvent {
  bodyA: CelestialBody;
  bodyB: CelestialBody;
  point: Vector3;
  relativeVelocity: Vector3;
  timestamp: number;
}

/**
 * SOI transition event
 */
export interface SOITransitionEvent {
  body: CelestialBody;
  from: CelestialBody | null;
  to: CelestialBody | null;
  timestamp: number;
}

/**
 * Physics simulation state
 */
export interface SimulationState {
  time: number;
  tick: number;
  bodyCount: number;
  massiveBodies: number;
  passiveBodies: number;
  totalEnergy: number;
  kineticEnergy: number;
  potentialEnergy: number;
}

/**
 * Event callbacks
 */
export interface PhysicsEventCallbacks {
  onCollision?: (event: CollisionEvent) => void;
  onSOITransition?: (event: SOITransitionEvent) => void;
  onTick?: (state: SimulationState) => void;
}

/**
 * Main Physics Simulation Engine
 */
export class PhysicsEngine {
  // Configuration
  private config: PhysicsConfig;

  // Bodies
  private bodies: Map<string, CelestialBody> = new Map();
  private massiveBodies: CelestialBody[] = [];
  private passiveBodies: CelestialBody[] = [];

  // Gravity calculation
  private barnesHutTree: BarnesHutTree;

  // Integrators
  private defaultIntegrator: Integrator;
  private closeEncounterIntegrator: Integrator;

  // Time tracking
  private simulationTime: number = 0;
  private tickCount: number = 0;
  private accumulator: number = 0;

  // SOI tracking
  private bodySOI: Map<string, string | null> = new Map();

  // Event callbacks
  private callbacks: PhysicsEventCallbacks = {};

  constructor(config: Partial<PhysicsConfig> = {}) {
    this.config = { ...DEFAULT_PHYSICS_CONFIG, ...config };
    
    this.barnesHutTree = new BarnesHutTree(this.config.barnesHutTheta);
    this.defaultIntegrator = createIntegrator(this.config.defaultIntegrator);
    this.closeEncounterIntegrator = createIntegrator(this.config.closeEncounterIntegrator);
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.barnesHutTheta !== undefined) {
      this.barnesHutTree.setTheta(config.barnesHutTheta);
    }
    if (config.defaultIntegrator !== undefined) {
      this.defaultIntegrator = createIntegrator(config.defaultIntegrator);
    }
    if (config.closeEncounterIntegrator !== undefined) {
      this.closeEncounterIntegrator = createIntegrator(config.closeEncounterIntegrator);
    }
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: PhysicsEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Load a world state
   */
  loadWorld(world: WorldState): void {
    this.clear();

    for (const def of world.bodies) {
      this.addBody(def);
    }
  }

  /**
   * Add a body to the simulation
   */
  addBody(definition: CelestialBodyDefinition): CelestialBody {
    const body = new CelestialBody(definition);
    
    if (this.bodies.has(body.id)) {
      throw new Error(`PhysicsEngine: Body with id '${body.id}' already exists`);
    }

    this.bodies.set(body.id, body);
    this.categorizeBody(body);

    return body;
  }

  /**
   * Remove a body from the simulation
   */
  removeBody(id: string): boolean {
    const body = this.bodies.get(id);
    if (!body) return false;

    this.bodies.delete(id);
    this.massiveBodies = this.massiveBodies.filter(b => b.id !== id);
    this.passiveBodies = this.passiveBodies.filter(b => b.id !== id);
    this.bodySOI.delete(id);

    return true;
  }

  /**
   * Get a body by ID
   */
  getBody(id: string): CelestialBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Get all bodies
   */
  getAllBodies(): CelestialBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Get massive bodies only
   */
  getMassiveBodies(): CelestialBody[] {
    return [...this.massiveBodies];
  }

  /**
   * Clear all bodies
   */
  clear(): void {
    this.bodies.clear();
    this.massiveBodies = [];
    this.passiveBodies = [];
    this.bodySOI.clear();
    this.barnesHutTree.clear();
    this.simulationTime = 0;
    this.tickCount = 0;
    this.accumulator = 0;
  }

  /**
   * Categorize body as massive or passive
   */
  private categorizeBody(body: CelestialBody): void {
    if (body.type === BodyType.MASSIVE) {
      this.massiveBodies.push(body);
    } else {
      this.passiveBodies.push(body);
    }
  }

  /**
   * Main update loop - call with deltaTime from game loop
   * Uses accumulator pattern for fixed timestep
   */
  update(deltaTime: number): void {
    // Apply time scale
    const scaledDelta = deltaTime * this.config.timeScale;
    this.accumulator += scaledDelta;

    // Calculate required substeps
    const dt = this.config.timestep;
    let steps = 0;

    while (this.accumulator >= dt && steps < this.config.maxSubsteps) {
      this.step(dt);
      this.accumulator -= dt;
      steps++;
    }

    // Prevent spiral of death
    if (this.accumulator > dt * 10) {
      console.warn(`PhysicsEngine: Accumulator overflow, discarding ${this.accumulator.toFixed(3)}s`);
      this.accumulator = 0;
    }
  }

  /**
   * Perform a single physics step
   */
  step(dt: number): void {
    // Build Barnes-Hut tree for massive bodies
    if (this.config.gravityMethod === GravityMethod.BARNES_HUT) {
      this.barnesHutTree.build(this.massiveBodies);
    }

    // Create acceleration function for this step
    const getAcceleration: AccelerationFunction = (body, position, _velocity, _time) => {
      return this.calculateAcceleration(body, position);
    };

    // Integrate massive bodies
    for (const body of this.massiveBodies) {
      const integrator = this.selectIntegrator(body);
      integrator.step(body, dt, this.simulationTime, getAcceleration);
      body.updateRotation(dt);
    }

    // Integrate passive bodies
    for (const body of this.passiveBodies) {
      const integrator = this.selectIntegrator(body);
      integrator.step(body, dt, this.simulationTime, getAcceleration);
      body.updateRotation(dt);
    }

    // Check collisions
    if (this.config.enableCollisions) {
      this.checkCollisions();
    }

    // Update SOI tracking
    if (this.config.enableSOI) {
      this.updateSOITracking();
    }

    // Update time
    this.simulationTime += dt;
    this.tickCount++;

    // Fire tick event
    if (this.callbacks.onTick) {
      this.callbacks.onTick(this.getState());
    }
  }

  /**
   * Calculate gravitational acceleration at a position
   */
  private calculateAcceleration(body: CelestialBody, position: Vector3): Vector3 {
    switch (this.config.gravityMethod) {
      case GravityMethod.DIRECT:
        return this.calculateAccelerationDirect(body, position);
      case GravityMethod.BARNES_HUT:
        return this.calculateAccelerationBarnesHut(body, position);
      case GravityMethod.FMM:
        throw new Error('PhysicsEngine: FMM not yet implemented');
      default:
        throw new Error(`PhysicsEngine: Unknown gravity method ${this.config.gravityMethod}`);
    }
  }

  /**
   * Direct O(N²) gravity calculation
   */
  private calculateAccelerationDirect(body: CelestialBody, position: Vector3): Vector3 {
    const acceleration = Vector3.zero();

    for (const other of this.massiveBodies) {
      if (other === body) continue;

      const direction = Vector3.sub(other.position, position);
      const distSq = direction.lengthSquared();
      const dist = Math.sqrt(distSq);

      if (dist < 1e-10) {
        throw new Error(
          `PhysicsEngine: Singularity detected - bodies ${body.id} and ${other.id} at same position`
        );
      }

      // Softened gravity
      const softenedDistSq = distSq + other.softening * other.softening;
      const accelMag = G * other.mass / softenedDistSq;

      acceleration.add(direction.multiplyScalar(accelMag / dist));
    }

    return acceleration;
  }

  /**
   * Barnes-Hut O(N log N) gravity calculation
   */
  private calculateAccelerationBarnesHut(body: CelestialBody, _position: Vector3): Vector3 {
    return this.barnesHutTree.calculateAcceleration(body);
  }

  /**
   * Select appropriate integrator based on body state
   */
  private selectIntegrator(body: CelestialBody): Integrator {
    if (!this.config.enableSOI) {
      return this.defaultIntegrator;
    }

    // Check for close encounters
    for (const other of this.massiveBodies) {
      if (other === body) continue;

      const distance = body.position.distanceTo(other.position);
      const threshold = other.radius * SOI_CLOSE_ENCOUNTER_THRESHOLD;

      if (distance < threshold) {
        // Close encounter - use adaptive integrator
        return this.closeEncounterIntegrator;
      }
    }

    return this.defaultIntegrator;
  }

  /**
   * Check for collisions between bodies
   */
  private checkCollisions(): void {
    const allBodies = [...this.massiveBodies, ...this.passiveBodies];

    for (let i = 0; i < allBodies.length; i++) {
      const bodyA = allBodies[i]!;

      for (let j = i + 1; j < allBodies.length; j++) {
        const bodyB = allBodies[j]!;

        const distance = bodyA.position.distanceTo(bodyB.position);
        const minDist = bodyA.radius + bodyB.radius;

        if (distance < minDist) {
          // Collision detected
          const direction = Vector3.sub(bodyB.position, bodyA.position).safeNormalize();
          const point = Vector3.add(
            bodyA.position,
            Vector3.multiplyScalar(direction, bodyA.radius)
          );
          const relativeVelocity = Vector3.sub(bodyB.velocity, bodyA.velocity);

          const event: CollisionEvent = {
            bodyA,
            bodyB,
            point,
            relativeVelocity,
            timestamp: this.simulationTime
          };

          this.callbacks.onCollision?.(event);
        }
      }
    }
  }

  /**
   * Update SOI tracking for all bodies
   */
  private updateSOITracking(): void {
    for (const body of this.passiveBodies) {
      const currentSOI = this.bodySOI.get(body.id) ?? null;
      const newSOI = this.findDominantBody(body);

      if (newSOI !== currentSOI) {
        const event: SOITransitionEvent = {
          body,
          from: currentSOI ? this.bodies.get(currentSOI) ?? null : null,
          to: newSOI ? this.bodies.get(newSOI) ?? null : null,
          timestamp: this.simulationTime
        };

        this.bodySOI.set(body.id, newSOI);
        this.callbacks.onSOITransition?.(event);
      }
    }
  }

  /**
   * Find the dominant gravitational body for a given body
   */
  private findDominantBody(body: CelestialBody): string | null {
    let dominant: CelestialBody | null = null;
    let maxInfluence = 0;

    for (const other of this.massiveBodies) {
      const distance = body.position.distanceTo(other.position);
      
      // Check if within SOI
      if (distance < other.soiRadius) {
        // Gravitational influence
        const influence = other.mass / (distance * distance);
        
        if (influence > maxInfluence) {
          maxInfluence = influence;
          dominant = other;
        }
      }
    }

    return dominant?.id ?? null;
  }

  /**
   * Calculate total system energy (for validation)
   * E = KE + PE
   * KE = Σ(½mv²)
   * PE = -Σ(GMm/r) for all pairs
   */
  calculateTotalEnergy(): { kinetic: number; potential: number; total: number } {
    let kinetic = 0;
    let potential = 0;

    const allBodies = [...this.massiveBodies, ...this.passiveBodies];

    // Kinetic energy
    for (const body of allBodies) {
      const vSq = body.velocity.lengthSquared();
      kinetic += 0.5 * body.mass * vSq;
    }

    // Potential energy (sum over unique pairs)
    for (let i = 0; i < this.massiveBodies.length; i++) {
      const bodyA = this.massiveBodies[i]!;

      for (let j = i + 1; j < this.massiveBodies.length; j++) {
        const bodyB = this.massiveBodies[j]!;
        const r = bodyA.position.distanceTo(bodyB.position);

        if (r > 0) {
          potential -= G * bodyA.mass * bodyB.mass / r;
        }
      }
    }

    return {
      kinetic,
      potential,
      total: kinetic + potential
    };
  }

  /**
   * Calculate total angular momentum (for validation)
   * L = Σ(r × p) = Σ(r × mv)
   */
  calculateAngularMomentum(): Vector3 {
    const L = Vector3.zero();
    
    for (const body of this.getAllBodies()) {
      const p = Vector3.multiplyScalar(body.velocity, body.mass);
      const Li = Vector3.cross(body.position, p);
      L.add(Li);
    }

    return L;
  }

  /**
   * Calculate center of mass of the system
   */
  calculateCenterOfMass(): Vector3 {
    let totalMass = 0;
    const com = Vector3.zero();

    for (const body of this.getAllBodies()) {
      com.add(Vector3.multiplyScalar(body.position, body.mass));
      totalMass += body.mass;
    }

    if (totalMass > 0) {
      com.divideScalar(totalMass);
    }

    return com;
  }

  /**
   * Get current simulation state
   */
  getState(): SimulationState {
    const energy = this.calculateTotalEnergy();

    return {
      time: this.simulationTime,
      tick: this.tickCount,
      bodyCount: this.bodies.size,
      massiveBodies: this.massiveBodies.length,
      passiveBodies: this.passiveBodies.length,
      totalEnergy: energy.total,
      kineticEnergy: energy.kinetic,
      potentialEnergy: energy.potential
    };
  }

  /**
   * Get simulation time
   */
  getTime(): number {
    return this.simulationTime;
  }

  /**
   * Get tick count
   */
  getTick(): number {
    return this.tickCount;
  }

  /**
   * Set time scale (for time acceleration)
   */
  setTimeScale(scale: number): void {
    if (scale < 0) {
      throw new Error(`PhysicsEngine: Time scale must be non-negative, got ${scale}`);
    }
    this.config.timeScale = scale;
  }

  /**
   * Get time scale
   */
  getTimeScale(): number {
    return this.config.timeScale;
  }

  /**
   * Export current world state
   */
  exportWorld(name: string, description: string = ''): WorldState {
    return {
      name,
      description,
      seed: 0,
      bodies: this.getAllBodies().map(b => b.toDefinition()),
      metadata: {
        exportTime: this.simulationTime,
        exportTick: this.tickCount
      }
    };
  }

  /**
   * Get physics configuration
   */
  getConfig(): Readonly<PhysicsConfig> {
    return { ...this.config };
  }
}

/**
 * Create a new physics engine with default configuration
 */
export function createPhysicsEngine(config?: Partial<PhysicsConfig>): PhysicsEngine {
  return new PhysicsEngine(config);
}
