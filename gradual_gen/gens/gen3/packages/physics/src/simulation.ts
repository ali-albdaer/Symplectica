/**
 * TypeScript wrapper for the WASM Simulation
 * 
 * Provides a friendly API with proper types.
 */

import { getWasmModule, loadWasmModule, WasmSimulationInstance } from './loader';
import {
    Body,
    BodyState,
    Checkpoint,
    CollisionEvent,
    EnergyMetrics,
    MomentumMetrics,
    NetworkSnapshot,
    SimConfig,
    StepResult,
    Vec3,
    vec3,
} from './types';
import { AU, circularVelocity, EARTH_MASS, EARTH_RADIUS, SOLAR_MASS, SOLAR_RADIUS } from './constants';

/**
 * High-level TypeScript interface to the physics simulation
 */
export class PhysicsSimulation {
    private wasm: WasmSimulationInstance;
    private _isInitialized = false;

    private constructor(wasm: WasmSimulationInstance) {
        this.wasm = wasm;
    }

    /**
     * Create a new simulation (loads WASM if needed)
     */
    static async create(config?: Partial<SimConfig>): Promise<PhysicsSimulation> {
        await loadWasmModule();
        const module = getWasmModule();

        let wasmSim: WasmSimulationInstance;
        if (config) {
            wasmSim = module.WasmSimulation.with_config(JSON.stringify(config));
        } else {
            wasmSim = new module.WasmSimulation();
        }

        return new PhysicsSimulation(wasmSim);
    }

    /**
     * Create a simulation with a preset world
     */
    static async createWithPreset(preset: 'solar_system' | 'earth_moon' | 'two_body'): Promise<PhysicsSimulation> {
        const sim = await PhysicsSimulation.create();

        switch (preset) {
            case 'solar_system':
                await sim.loadSolarSystem();
                break;
            case 'earth_moon':
                await sim.loadEarthMoon();
                break;
            case 'two_body':
                await sim.loadTwoBody();
                break;
        }

        sim.initialize();
        return sim;
    }

    /**
     * Dispose of the WASM resources
     */
    dispose(): void {
        this.wasm.free();
    }

    // ========== Configuration ==========

    /**
     * Set the PRNG seed for deterministic simulation
     */
    setSeed(seed: bigint, stream: bigint = 0n): void {
        this.wasm.set_seed(seed, stream);
    }

    /**
     * Get current configuration
     */
    getConfig(): SimConfig {
        return JSON.parse(this.wasm.config_json());
    }

    /**
     * Update configuration
     */
    setConfig(config: Partial<SimConfig>): void {
        const current = this.getConfig();
        const merged = { ...current, ...config };
        this.wasm.set_config(JSON.stringify(merged));
    }

    // ========== State ==========

    /**
     * Get current tick number
     */
    get tick(): bigint {
        return this.wasm.tick();
    }

    /**
     * Get current simulation time in seconds
     */
    get simTime(): number {
        return this.wasm.sim_time();
    }

    /**
     * Get current sequence number
     */
    get sequence(): bigint {
        return this.wasm.sequence();
    }

    /**
     * Check if simulation is initialized
     */
    get isInitialized(): boolean {
        return this._isInitialized;
    }

    // ========== Body Management ==========

    /**
     * Add a body to the simulation
     */
    addBody(body: Partial<Body> & { id: string; name: string; mass: number; radius: number }): void {
        const pos = body.position || vec3(0, 0, 0);
        const vel = body.velocity || vec3(0, 0, 0);

        this.wasm.add_body(
            body.id,
            body.name,
            body.mass,
            body.radius,
            pos.x,
            pos.y,
            pos.z,
            vel.x,
            vel.y,
            vel.z
        );
        this._isInitialized = false;
    }

    /**
     * Add a star
     */
    addStar(id: string, name: string, mass: number, radius: number, position: Vec3 = vec3(0, 0, 0)): void {
        this.wasm.add_star(id, name, mass, radius, position.x, position.y, position.z);
        this._isInitialized = false;
    }

    /**
     * Add a planet
     */
    addPlanet(
        id: string,
        name: string,
        mass: number,
        radius: number,
        position: Vec3,
        velocity: Vec3
    ): void {
        this.wasm.add_planet(
            id,
            name,
            mass,
            radius,
            position.x,
            position.y,
            position.z,
            velocity.x,
            velocity.y,
            velocity.z
        );
        this._isInitialized = false;
    }

    /**
     * Add a planet in circular orbit around a central body
     */
    addPlanetInOrbit(
        id: string,
        name: string,
        mass: number,
        radius: number,
        centralMass: number,
        orbitalRadius: number,
        inclination: number = 0
    ): void {
        const v = circularVelocity(centralMass, orbitalRadius);
        const cosI = Math.cos(inclination);
        const sinI = Math.sin(inclination);

        this.addPlanet(
            id,
            name,
            mass,
            radius,
            vec3(orbitalRadius, 0, 0),
            vec3(0, v * cosI, v * sinI)
        );
    }

    /**
     * Remove a body
     */
    removeBody(id: string): void {
        this.wasm.remove_body(id);
    }

    /**
     * Get number of bodies
     */
    get bodyCount(): number {
        return this.wasm.body_count();
    }

    /**
     * Get number of active bodies
     */
    get activeBodyCount(): number {
        return this.wasm.active_body_count();
    }

    /**
     * Get body IDs
     */
    getBodyIds(): string[] {
        return JSON.parse(this.wasm.body_ids());
    }

    /**
     * Get a body by ID
     */
    getBody(id: string): Body | undefined {
        const json = this.wasm.get_body(id);
        return json ? JSON.parse(json) : undefined;
    }

    /**
     * Get all bodies
     */
    getBodies(): Body[] {
        return JSON.parse(this.wasm.bodies_json());
    }

    /**
     * Get compact body states for rendering
     */
    getBodyStates(): BodyState[] {
        const positions = this.wasm.get_positions();
        const velocities = this.wasm.get_velocities();
        const radii = this.wasm.get_radii();
        const masses = this.wasm.get_masses();
        const ids = this.getBodyIds();

        const states: BodyState[] = [];
        for (let i = 0; i < ids.length; i++) {
            const pi = i * 3;
            states.push({
                id: ids[i],
                position: [positions[pi], positions[pi + 1], positions[pi + 2]],
                velocity: [velocities[pi], velocities[pi + 1], velocities[pi + 2]],
                mass: masses[i],
                radius: radii[i],
                active: !isNaN(positions[pi])
            });
        }

        return states;
    }

    /**
     * Get positions as Float64Array (for efficient Three.js updates)
     */
    getPositions(): Float64Array {
        return this.wasm.get_positions();
    }

    /**
     * Get velocities as Float64Array
     */
    getVelocities(): Float64Array {
        return this.wasm.get_velocities();
    }

    /**
     * Get radii as Float64Array
     */
    getRadii(): Float64Array {
        return this.wasm.get_radii();
    }

    /**
     * Get origin offset
     */
    getOriginOffset(): Vec3 {
        const arr = this.wasm.origin_offset();
        return vec3(arr[0], arr[1], arr[2]);
    }

    // ========== Simulation Control ==========

    /**
     * Initialize the simulation (must be called before step)
     */
    initialize(): void {
        this.wasm.initialize();
        this._isInitialized = true;
    }

    /**
     * Perform one simulation step
     */
    step(): StepResult {
        if (!this._isInitialized) {
            this.initialize();
        }
        return JSON.parse(this.wasm.step());
    }

    /**
     * Step multiple times
     */
    stepN(n: number): void {
        if (!this._isInitialized) {
            this.initialize();
        }
        this.wasm.step_n(BigInt(n));
    }

    /**
     * Reset the simulation
     */
    reset(): void {
        this.wasm.reset();
        this._isInitialized = false;
    }

    // ========== Checkpoints ==========

    /**
     * Create a full checkpoint
     */
    createCheckpoint(): Checkpoint {
        return JSON.parse(this.wasm.checkpoint_json());
    }

    /**
     * Create a network snapshot (compact)
     */
    createSnapshot(): NetworkSnapshot {
        return JSON.parse(this.wasm.snapshot_json());
    }

    /**
     * Restore from a checkpoint
     */
    restoreCheckpoint(checkpoint: Checkpoint): void {
        this.wasm.restore_checkpoint(JSON.stringify(checkpoint));
        this._isInitialized = true;
    }

    /**
     * Restore from JSON
     */
    restoreFromJson(json: string): void {
        this.wasm.restore_checkpoint(json);
        this._isInitialized = true;
    }

    /**
     * Apply body states from network
     */
    applyBodyStates(states: BodyState[]): void {
        this.wasm.apply_body_states(JSON.stringify(states));
    }

    // ========== Monitoring ==========

    /**
     * Get energy metrics
     */
    getEnergyMetrics(): EnergyMetrics | undefined {
        const json = this.wasm.energy_metrics();
        return json ? JSON.parse(json) : undefined;
    }

    /**
     * Get momentum metrics
     */
    getMomentumMetrics(): MomentumMetrics | undefined {
        const json = this.wasm.momentum_metrics();
        return json ? JSON.parse(json) : undefined;
    }

    /**
     * Get recent collision events
     */
    getCollisionEvents(): CollisionEvent[] {
        return JSON.parse(this.wasm.collision_events());
    }

    /**
     * Get total collision count
     */
    get collisionCount(): bigint {
        return this.wasm.collision_count();
    }

    // ========== Presets ==========

    /**
     * Load a basic two-body test system (Sun + Earth)
     */
    private async loadTwoBody(): Promise<void> {
        this.addStar('sun', 'Sun', SOLAR_MASS, SOLAR_RADIUS);
        this.addPlanetInOrbit('earth', 'Earth', EARTH_MASS, EARTH_RADIUS, SOLAR_MASS, AU);
    }

    /**
     * Load Earth-Moon system
     */
    private async loadEarthMoon(): Promise<void> {
        const moonDistance = 3.844e8;
        const moonMass = 7.342e22;
        const moonRadius = 1.7374e6;

        this.addPlanet('earth', 'Earth', EARTH_MASS, EARTH_RADIUS, vec3(0, 0, 0), vec3(0, 0, 0));
        this.addPlanetInOrbit('moon', 'Moon', moonMass, moonRadius, EARTH_MASS, moonDistance);
    }

    /**
     * Load solar system preset
     */
    private async loadSolarSystem(): Promise<void> {
        // Sun at origin
        this.addStar('sun', 'Sun', SOLAR_MASS, SOLAR_RADIUS);

        // Planets with their orbital parameters
        const planets = [
            { id: 'mercury', name: 'Mercury', mass: 3.3011e23, radius: 2.4397e6, a: 5.791e10 },
            { id: 'venus', name: 'Venus', mass: 4.8675e24, radius: 6.0518e6, a: 1.0821e11 },
            { id: 'earth', name: 'Earth', mass: EARTH_MASS, radius: EARTH_RADIUS, a: AU },
            { id: 'mars', name: 'Mars', mass: 6.4171e23, radius: 3.3895e6, a: 2.279e11 },
            { id: 'jupiter', name: 'Jupiter', mass: 1.8982e27, radius: 6.9911e7, a: 7.785e11 },
            { id: 'saturn', name: 'Saturn', mass: 5.6834e26, radius: 5.8232e7, a: 1.4335e12 },
            { id: 'uranus', name: 'Uranus', mass: 8.6810e25, radius: 2.5362e7, a: 2.8725e12 },
            { id: 'neptune', name: 'Neptune', mass: 1.02413e26, radius: 2.4622e7, a: 4.4951e12 },
        ];

        for (const p of planets) {
            this.addPlanetInOrbit(p.id, p.name, p.mass, p.radius, SOLAR_MASS, p.a);
        }
    }
}
