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
import { CelestialBodyDefinition } from '../bodies/types.js';
import type { WorldState } from '../bodies/presets.js';
/**
 * Gravity calculation method
 */
export declare enum GravityMethod {
    /** Exact O(N²) - all pairs */
    DIRECT = "direct",
    /** Barnes-Hut O(N log N) */
    BARNES_HUT = "barnes_hut",
    /** Fast Multipole Method O(N) - not yet implemented */
    FMM = "fmm"
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
export declare const DEFAULT_PHYSICS_CONFIG: PhysicsConfig;
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
export declare class PhysicsEngine {
    private config;
    private bodies;
    private massiveBodies;
    private passiveBodies;
    private barnesHutTree;
    private defaultIntegrator;
    private closeEncounterIntegrator;
    private simulationTime;
    private tickCount;
    private accumulator;
    private bodySOI;
    private callbacks;
    constructor(config?: Partial<PhysicsConfig>);
    /**
     * Update configuration
     */
    setConfig(config: Partial<PhysicsConfig>): void;
    /**
     * Set event callbacks
     */
    setCallbacks(callbacks: PhysicsEventCallbacks): void;
    /**
     * Load a world state
     */
    loadWorld(world: WorldState): void;
    /**
     * Add a body to the simulation
     */
    addBody(definition: CelestialBodyDefinition): CelestialBody;
    /**
     * Remove a body from the simulation
     */
    removeBody(id: string): boolean;
    /**
     * Get a body by ID
     */
    getBody(id: string): CelestialBody | undefined;
    /**
     * Get all bodies
     */
    getAllBodies(): CelestialBody[];
    /**
     * Get massive bodies only
     */
    getMassiveBodies(): CelestialBody[];
    /**
     * Clear all bodies
     */
    clear(): void;
    /**
     * Categorize body as massive or passive
     */
    private categorizeBody;
    /**
     * Main update loop - call with deltaTime from game loop
     * Uses accumulator pattern for fixed timestep
     */
    update(deltaTime: number): void;
    /**
     * Perform a single physics step
     */
    step(dt: number): void;
    /**
     * Calculate gravitational acceleration at a position
     */
    private calculateAcceleration;
    /**
     * Direct O(N²) gravity calculation
     */
    private calculateAccelerationDirect;
    /**
     * Barnes-Hut O(N log N) gravity calculation
     */
    private calculateAccelerationBarnesHut;
    /**
     * Select appropriate integrator based on body state
     */
    private selectIntegrator;
    /**
     * Check for collisions between bodies
     */
    private checkCollisions;
    /**
     * Update SOI tracking for all bodies
     */
    private updateSOITracking;
    /**
     * Find the dominant gravitational body for a given body
     */
    private findDominantBody;
    /**
     * Calculate total system energy (for validation)
     * E = KE + PE
     * KE = Σ(½mv²)
     * PE = -Σ(GMm/r) for all pairs
     */
    calculateTotalEnergy(): {
        kinetic: number;
        potential: number;
        total: number;
    };
    /**
     * Calculate total angular momentum (for validation)
     * L = Σ(r × p) = Σ(r × mv)
     */
    calculateAngularMomentum(): Vector3;
    /**
     * Calculate center of mass of the system
     */
    calculateCenterOfMass(): Vector3;
    /**
     * Get current simulation state
     */
    getState(): SimulationState;
    /**
     * Get simulation time
     */
    getTime(): number;
    /**
     * Get tick count
     */
    getTick(): number;
    /**
     * Set time scale (for time acceleration)
     */
    setTimeScale(scale: number): void;
    /**
     * Get time scale
     */
    getTimeScale(): number;
    /**
     * Export current world state
     */
    exportWorld(name: string, description?: string): WorldState;
    /**
     * Get physics configuration
     */
    getConfig(): Readonly<PhysicsConfig>;
}
/**
 * Create a new physics engine with default configuration
 */
export declare function createPhysicsEngine(config?: Partial<PhysicsConfig>): PhysicsEngine;
//# sourceMappingURL=PhysicsEngine.d.ts.map