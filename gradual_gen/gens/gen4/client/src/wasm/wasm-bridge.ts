/**
 * WASM bridge — wraps the Rust SimEngine for use by the client.
 * Handles dynamic loading, initialization, and provides a clean async API.
 */

import type { SimulationState, StepResult, Body, Vec3 } from '@solar-sim/shared';

// Lazy import of the generated WASM bindings
let wasmModule: typeof import('./pkg/solar_sim_wasm.js') | null = null;
let SimEngine: any = null;

/** Load and initialize the WASM module. Call once at startup. */
export async function initWasm(): Promise<boolean> {
  try {
    wasmModule = await import('./pkg/solar_sim_wasm.js');
    const init = wasmModule.default;
    await init();
    SimEngine = wasmModule.SimEngine;
    console.log('[WASM] Solar simulation engine loaded');
    return true;
  } catch (err) {
    console.warn('[WASM] Failed to load WASM module, falling back to TS physics:', err);
    return false;
  }
}

/** Check if WASM is available */
export function isWasmReady(): boolean {
  return SimEngine !== null;
}

/**
 * WasmSimulation wraps the Rust SimEngine with a TypeScript-friendly API.
 * All state lives in Rust WASM memory; we only cross the boundary for
 * positions (Float64Array) and JSON snapshots.
 */
export class WasmSimulation {
  private engine: any;
  private _disposed = false;

  private constructor(engine: any) {
    this.engine = engine;
  }

  /** Create a new simulation from a preset */
  static fromPreset(presetName: string, seed = 42): WasmSimulation | null {
    if (!SimEngine) return null;
    try {
      const engine = SimEngine.fromPreset(presetName, BigInt(seed));
      return new WasmSimulation(engine);
    } catch (err) {
      console.error('[WASM] Failed to create preset:', err);
      return null;
    }
  }

  /** Create a new empty simulation */
  static create(): WasmSimulation | null {
    if (!SimEngine) return null;
    try {
      const engine = new SimEngine();
      return new WasmSimulation(engine);
    } catch (err) {
      console.error('[WASM] Failed to create simulation:', err);
      return null;
    }
  }

  /** Create from a JSON state snapshot */
  static fromJson(json: string): WasmSimulation | null {
    if (!SimEngine) return null;
    try {
      const engine = SimEngine.fromJson(json);
      return new WasmSimulation(engine);
    } catch (err) {
      console.error('[WASM] Failed to restore from JSON:', err);
      return null;
    }
  }

  /** Step the simulation by one tick. Returns diagnostics. */
  step(): StepResult | null {
    if (this._disposed) return null;
    try {
      const json = this.engine.step();
      if (!json || json === '{}') return null;
      return JSON.parse(json) as StepResult;
    } catch (err) {
      console.error('[WASM] Step error:', err);
      return null;
    }
  }

  /** Step N ticks at once */
  stepN(n: number): StepResult | null {
    if (this._disposed) return null;
    try {
      const json = this.engine.stepN(n);
      if (!json || json === '{}') return null;
      return JSON.parse(json) as StepResult;
    } catch (err) {
      console.error('[WASM] StepN error:', err);
      return null;
    }
  }

  /** Get body positions as Float64Array [x0,y0,z0, x1,y1,z1, ...] */
  getPositions(): Float64Array {
    return this.engine.getPositions();
  }

  /** Get camera-relative positions as Float32Array */
  getPositionsRelative(camX: number, camY: number, camZ: number): Float32Array {
    return this.engine.getPositionsRelative(camX, camY, camZ);
  }

  /** Get velocities as Float64Array */
  getVelocities(): Float64Array {
    return this.engine.getVelocities();
  }

  /** Get body radii */
  getRadii(): Float64Array {
    return this.engine.getRadii();
  }

  /** Get body names */
  getBodyNames(): string[] {
    return JSON.parse(this.engine.getBodyNames());
  }

  /** Get full simulation state as JSON */
  getState(): SimulationState {
    return JSON.parse(this.engine.getState());
  }

  /** Get a specific body */
  getBody(id: number): Body | null {
    const json = this.engine.getBody(BigInt(id));
    return json ? JSON.parse(json) : null;
  }

  /** Add a body */
  addBody(body: Body): void {
    this.engine.addBody(JSON.stringify(body));
  }

  /** Remove a body by ID */
  removeBody(id: number): boolean {
    return this.engine.removeBody(BigInt(id));
  }

  /** Apply thrust to a body */
  applyThrust(bodyId: number, fx: number, fy: number, fz: number, duration: number): void {
    this.engine.applyThrust(BigInt(bodyId), fx, fy, fz, duration);
  }

  /** Set/update config from JSON */
  setConfig(config: any): void {
    this.engine.setConfig(JSON.stringify(config));
  }

  /** Pause / unpause */
  setPaused(paused: boolean): void {
    this.engine.setPaused(paused);
  }

  /** Set time scale */
  setTimeScale(scale: number): void {
    this.engine.setTimeScale(scale);
  }

  /** Set solver */
  setSolver(name: string): void {
    this.engine.setSolver(name);
  }

  /** Set integrator */
  setIntegrator(name: string): void {
    this.engine.setIntegrator(name);
  }

  /** Set timestep */
  setTimestep(dt: number): void {
    this.engine.setTimestep(dt);
  }

  /** Get current tick */
  get tick(): number {
    return Number(this.engine.tick);
  }

  /** Get current simulation time */
  get time(): number {
    return this.engine.time;
  }

  /** Get body count */
  get bodyCount(): number {
    return this.engine.bodyCount();
  }

  /** Get total energy */
  get totalEnergy(): number {
    return this.engine.totalEnergy();
  }

  /** Get center of mass */
  getCenterOfMass(): Float64Array {
    return this.engine.centerOfMass();
  }

  /** Get conservation diagnostics */
  getConservationDiagnostics(): any {
    return JSON.parse(this.engine.getConservationDiagnostics());
  }

  /** Get checkpoint JSON */
  getCheckpoint(): string {
    return this.engine.getCheckpoint();
  }

  /** Restore from checkpoint */
  restoreCheckpoint(json: string): void {
    this.engine.restoreCheckpoint(json);
  }

  /** Get next body ID */
  nextBodyId(): number {
    return Number(this.engine.nextBodyId());
  }

  /** Free WASM memory */
  dispose(): void {
    if (!this._disposed) {
      this._disposed = true;
      this.engine.free();
    }
  }
}
