/**
 * Main game server: manages simulation loop, player connections, state sync.
 * Uses Rust WASM physics engine when available, TypeScript Velocity Verlet as fallback.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import {
  type Body,
  type BodyId,
  type InputAction,
  type SimConfig,
  type SimulationState,
  type Player,
  type StepResult,
  type Vec3,
  BodyType,
  SolverType,
  IntegratorType,
  PresetId,
  PRESETS,
  vec3,
  G,
  SOLAR_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
  AU,
  SOLAR_LUMINOSITY,
} from '@solar-sim/shared';
import {
  type ClientMessage,
  type ServerMessage,
  ClientMessageType,
  ServerMessageType,
  SimEventType,
  PROTOCOL_VERSION,
  encodePositions,
} from '@solar-sim/shared';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServerOptions {
  port: number;
  tickRate: number;
  preset: string;
  seed: number;
}

interface ConnectedPlayer {
  ws: WebSocket;
  player: Player;
  lastPing: number;
  latency: number;
  inputSeq: number;
}

// ── WASM Engine Wrapper (with TS fallback) ────────────────────────────────────

let WasmSimEngine: any = null;

/** Try to load the Node.js WASM module at startup */
async function tryLoadWasm(): Promise<boolean> {
  // Attempt 1: ESM dynamic import
  try {
    const wasmPkg = await import('./wasm/pkg/solar_sim_wasm.js');
    WasmSimEngine = wasmPkg.SimEngine;
    console.log('[Server] WASM physics engine loaded (ESM)');
    return true;
  } catch (_esmErr) {
    // ESM import failed, try CommonJS require fallback
  }

  // Attempt 2: CJS require via createRequire
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const wasmPkg = require('./wasm/pkg/solar_sim_wasm.js');
    WasmSimEngine = wasmPkg.SimEngine;
    console.log('[Server] WASM physics engine loaded (CJS fallback)');
    return true;
  } catch (_cjsErr) {
    // Neither worked
  }

  console.warn('[Server] WASM not available, using TS physics fallback');
  return false;
}

class PhysicsEngine {
  state: SimulationState;
  private wasmEngine: any = null;
  private useWasm: boolean;

  constructor(preset: string, seed: number, useWasm: boolean) {
    this.useWasm = useWasm;

    if (this.useWasm && WasmSimEngine) {
      try {
        const presetMap: Record<string, string> = {
          'solar_system': 'solar_system',
          'two_body': 'two_body',
          'kepler': 'two_body',
          'sun_earth_moon': 'sun_earth_moon',
          'binary_star': 'binary_star',
          'alpha_centauri': 'alpha_centauri',
          'rogue_planet': 'rogue_planet',
          'asteroid_belt': 'asteroid_belt',
          'extreme': 'extreme',
          'empty': 'empty',
        };
        const wasmPreset = presetMap[preset] || 'solar_system';
        this.wasmEngine = WasmSimEngine.fromPreset(wasmPreset, BigInt(seed));
        // Sync state from WASM
        this.state = JSON.parse(this.wasmEngine.getState());
        console.log(`[Physics] WASM engine initialized with preset '${preset}' (${this.state.bodies.length} bodies)`);
        return;
      } catch (err) {
        console.warn('[Physics] WASM init failed, falling back to TS:', (err as Error).message);
        this.useWasm = false;
      }
    }

    // TS fallback
    this.state = this.createFromPreset(preset, seed);
  }

  private createFromPreset(presetName: string, seed: number): SimulationState {
    const config: SimConfig = {
      dt: 3600,
      time: 0,
      tick: 0,
      solver_type: SolverType.Direct,
      integrator_type: IntegratorType.VelocityVerlet,
      bh_theta: 0.5,
      fmm_order: 6,
      softening_length: 1e3,
      enable_atmosphere: true,
      enable_drag: true,
      enable_radiation_pressure: true,
      enable_tidal_forces: true,
      enable_spherical_harmonics: true,
      adaptive_tolerance: 1e-12,
      max_substeps: 64,
      conservation_warn_threshold: 1e-6,
      conservation_error_threshold: 1e-3,
      time_scale: 1.0,
      paused: false,
      seed,
    };

    const bodies = this.buildPresetBodies(presetName);

    return {
      config,
      bodies,
      conserved: {
        tick: 0,
        total_energy: 0,
        kinetic_energy: 0,
        potential_energy: 0,
        linear_momentum: vec3(),
        angular_momentum: vec3(),
        total_mass: 0,
        linear_momentum_magnitude: 0,
        angular_momentum_magnitude: 0,
      },
      integrator_switches: [],
      ticks_since_integrator_switch: 0,
      integrator_switch_cooldown: 100,
    };
  }

  private buildPresetBodies(preset: string): Body[] {
    const makeBody = (
      id: number,
      name: string,
      type: BodyType,
      mass: number,
      radius: number,
      pos: Vec3,
      vel: Vec3,
      color: [number, number, number],
      parentId: number | null = null,
      luminosity = 0,
    ): Body => ({
      id,
      name,
      body_type: type,
      position: pos,
      velocity: vel,
      acceleration: vec3(),
      mass,
      radius,
      rotation_period: 86400,
      axial_tilt: 0,
      rotation_angle: 0,
      collision_shape: { Sphere: { radius } },
      restitution: 0.5,
      parent_id: parentId,
      soi_radius: 0,
      color,
      luminosity,
      albedo: 0.3,
      atmosphere: null,
      gravity_harmonics: null,
      has_rings: false,
      ring_inner_radius: 0,
      ring_outer_radius: 0,
      substep_factor: 1,
      required_dt: 1,
      is_active: true,
      is_massless: false,
    });

    switch (preset) {
      case 'two_body':
      case 'kepler': {
        const v = Math.sqrt(G * SOLAR_MASS / AU);
        return [
          makeBody(1, 'Star', BodyType.Star, SOLAR_MASS, 6.957e8, vec3(), vec3(), [1, 0.95, 0.8], null, SOLAR_LUMINOSITY),
          makeBody(2, 'Planet', BodyType.Planet, EARTH_MASS, EARTH_RADIUS, vec3(AU, 0, 0), vec3(0, v, 0), [0.2, 0.4, 0.8], 1),
        ];
      }
      case 'solar_system':
      default: {
        const planets: Array<{ id: number; name: string; mass: number; radius: number; dist: number; color: [number, number, number] }> = [
          { id: 2, name: 'Mercury', mass: 3.301e23, radius: 2.44e6, dist: 5.791e10, color: [0.7, 0.6, 0.5] },
          { id: 3, name: 'Venus', mass: 4.867e24, radius: 6.052e6, dist: 1.082e11, color: [0.9, 0.7, 0.3] },
          { id: 4, name: 'Earth', mass: EARTH_MASS, radius: EARTH_RADIUS, dist: AU, color: [0.2, 0.4, 0.8] },
          { id: 5, name: 'Mars', mass: 6.417e23, radius: 3.39e6, dist: 2.279e11, color: [0.8, 0.3, 0.1] },
          { id: 6, name: 'Jupiter', mass: 1.898e27, radius: 6.991e7, dist: 7.786e11, color: [0.8, 0.7, 0.5] },
          { id: 7, name: 'Saturn', mass: 5.683e26, radius: 5.823e7, dist: 1.434e12, color: [0.9, 0.8, 0.5] },
          { id: 8, name: 'Uranus', mass: 8.681e25, radius: 2.536e7, dist: 2.871e12, color: [0.5, 0.7, 0.9] },
          { id: 9, name: 'Neptune', mass: 1.024e26, radius: 2.462e7, dist: 4.495e12, color: [0.2, 0.3, 0.9] },
        ];

        const bodies: Body[] = [
          makeBody(1, 'Sun', BodyType.Star, SOLAR_MASS, 6.957e8, vec3(), vec3(), [1, 0.95, 0.8], null, SOLAR_LUMINOSITY),
        ];

        for (const p of planets) {
          const v = Math.sqrt(G * SOLAR_MASS / p.dist);
          bodies.push(makeBody(p.id, p.name, BodyType.Planet, p.mass, p.radius, vec3(p.dist, 0, 0), vec3(0, v, 0), p.color, 1));
        }
        return bodies;
      }
    }
  }

  /** Step physics — WASM if available, TS Velocity Verlet fallback */
  step(): StepResult {
    if (this.state.config.paused) {
      return this.emptyResult();
    }

    if (this.wasmEngine) {
      // WASM path
      const resultJson = this.wasmEngine.step();
      if (!resultJson || resultJson === '{}') return this.emptyResult();
      const result: StepResult = JSON.parse(resultJson);

      // Sync positions and velocities from WASM -> local state
      const positions: Float64Array = this.wasmEngine.getPositions();
      let velocities: Float64Array | null = null;
      try { velocities = this.wasmEngine.getVelocities(); } catch { /* optional API */ }

      for (let i = 0; i < this.state.bodies.length && i * 3 + 2 < positions.length; i++) {
        this.state.bodies[i].position.x = positions[i * 3];
        this.state.bodies[i].position.y = positions[i * 3 + 1];
        this.state.bodies[i].position.z = positions[i * 3 + 2];
        if (velocities && i * 3 + 2 < velocities.length) {
          this.state.bodies[i].velocity.x = velocities[i * 3];
          this.state.bodies[i].velocity.y = velocities[i * 3 + 1];
          this.state.bodies[i].velocity.z = velocities[i * 3 + 2];
        }
      }
      this.state.config.tick = Number(this.wasmEngine.tick);
      this.state.config.time = this.wasmEngine.time;

      return result;
    }

    // TS fallback: Velocity Verlet integration step (O(N²) direct gravity)

    const dt = this.state.config.dt * this.state.config.time_scale;
    const bodies = this.state.bodies;
    const n = bodies.length;

    // Half-kick
    for (const b of bodies) {
      b.velocity.x += 0.5 * b.acceleration.x * dt;
      b.velocity.y += 0.5 * b.acceleration.y * dt;
      b.velocity.z += 0.5 * b.acceleration.z * dt;
    }

    // Drift
    for (const b of bodies) {
      b.position.x += b.velocity.x * dt;
      b.position.y += b.velocity.y * dt;
      b.position.z += b.velocity.z * dt;
    }

    // Compute accelerations (O(N²) direct)
    for (const b of bodies) {
      b.acceleration = vec3();
    }

    const softening2 = this.state.config.softening_length ** 2;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const bi = bodies[i];
        const bj = bodies[j];
        const dx = bj.position.x - bi.position.x;
        const dy = bj.position.y - bi.position.y;
        const dz = bj.position.z - bi.position.z;
        const r2 = dx * dx + dy * dy + dz * dz + softening2;
        const r = Math.sqrt(r2);
        const r3 = r * r2;

        if (r3 > 0) {
          const fi = G * bj.mass / r3;
          const fj = G * bi.mass / r3;
          bi.acceleration.x += fi * dx;
          bi.acceleration.y += fi * dy;
          bi.acceleration.z += fi * dz;
          bj.acceleration.x -= fj * dx;
          bj.acceleration.y -= fj * dy;
          bj.acceleration.z -= fj * dz;
        }
      }
    }

    // Second half-kick
    for (const b of bodies) {
      b.velocity.x += 0.5 * b.acceleration.x * dt;
      b.velocity.y += 0.5 * b.acceleration.y * dt;
      b.velocity.z += 0.5 * b.acceleration.z * dt;
    }

    // Advance
    this.state.config.time += dt;
    this.state.config.tick += 1;

    return {
      tick: this.state.config.tick,
      time: this.state.config.time,
      dt,
      body_count: n,
      energy_error: 0,
      momentum_error: 0,
      collisions: 0,
      integrator: 'VelocityVerlet',
      solver: 'Direct',
    };
  }

  getPositions(): Float64Array {
    if (this.wasmEngine) {
      return this.wasmEngine.getPositions();
    }
    const result = new Float64Array(this.state.bodies.length * 3);
    for (let i = 0; i < this.state.bodies.length; i++) {
      result[i * 3 + 0] = this.state.bodies[i].position.x;
      result[i * 3 + 1] = this.state.bodies[i].position.y;
      result[i * 3 + 2] = this.state.bodies[i].position.z;
    }
    return result;
  }

  addBody(body: Body): void {
    if (this.wasmEngine) {
      this.wasmEngine.addBody(JSON.stringify(body));
    }
    this.state.bodies.push(body);
  }

  removeBody(id: BodyId): boolean {
    if (this.wasmEngine) {
      this.wasmEngine.removeBody(BigInt(id));
    }
    const idx = this.state.bodies.findIndex((b) => b.id === id);
    if (idx >= 0) {
      this.state.bodies.splice(idx, 1);
      return true;
    }
    return false;
  }

  nextBodyId(): number {
    if (this.wasmEngine) {
      return Number(this.wasmEngine.nextBodyId());
    }
    return Math.max(0, ...this.state.bodies.map((b) => b.id)) + 1;
  }

  /** Reload preset (e.g. from admin command) */
  loadPreset(preset: string, seed: number): void {
    if (this.wasmEngine) {
      try {
        this.wasmEngine.free();
        this.wasmEngine = WasmSimEngine.fromPreset(preset, BigInt(seed));
        this.state = JSON.parse(this.wasmEngine.getState());
        return;
      } catch {
        // fall through to TS
      }
    }
    this.state = this.createFromPreset(preset, seed);
  }

  private emptyResult(): StepResult {
    return {
      tick: this.state.config.tick,
      time: this.state.config.time,
      dt: 0,
      body_count: this.state.bodies.length,
      energy_error: 0,
      momentum_error: 0,
      collisions: 0,
      integrator: 'VelocityVerlet',
      solver: 'Direct',
    };
  }
}

// ── Game Server ───────────────────────────────────────────────────────────────

export class GameServer {
  private options: ServerOptions;
  private wss: WebSocketServer | null = null;
  private physics!: PhysicsEngine;
  private players: Map<number, ConnectedPlayer> = new Map();
  private nextPlayerId = 1;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private staleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private tickCount = 0;
  private lastTickTime = 0;
  private avgTickDuration = 0;

  // Delta compression: track previous state for change detection
  private previousPositions: Float64Array | null = null;
  private previousBodyCount = 0;
  // Threshold for position change detection (in meters)
  private readonly DELTA_THRESHOLD = 1.0;

  constructor(options: ServerOptions) {
    this.options = options;
    // PhysicsEngine initialized in start() after WASM probe
  }

  async start(): Promise<void> {
    // Try loading WASM before creating physics
    const wasmAvailable = await tryLoadWasm();
    this.physics = new PhysicsEngine(this.options.preset, this.options.seed, wasmAvailable);

    this.wss = new WebSocketServer({ port: this.options.port });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    // Start tick loop
    const tickMs = 1000 / this.options.tickRate;
    this.lastTickTime = performance.now();

    this.tickInterval = setInterval(() => {
      this.tick();
    }, tickMs);

    // Stale connection cleanup every 30 seconds
    this.staleCheckInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, player] of this.players) {
        if (now - player.lastPing > 60_000) {
          console.warn(`Player ${player.player.name} (#${id}) timed out`);
          player.ws.close(4002, 'Ping timeout');
          this.players.delete(id);
          this.broadcastJson({
            type: ServerMessageType.PlayerLeft,
            playerId: id,
          });
        }
      }
    }, 30_000);

    console.log(`Server listening on ws://localhost:${this.options.port}`);
    console.log(`Simulation started with ${this.physics.state.bodies.length} bodies`);
  }

  stop(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.staleCheckInterval) {
      clearInterval(this.staleCheckInterval);
      this.staleCheckInterval = null;
    }
    for (const [, player] of this.players) {
      player.ws.close(1001, 'Server shutting down');
    }
    this.wss?.close();
    console.log('Server stopped.');
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const ip = req.socket.remoteAddress || 'unknown';
    console.log(`New connection from ${ip}`);

    ws.on('message', (data) => {
      try {
        // Reject oversized messages (>1MB)
        const raw = data.toString();
        if (raw.length > 1_000_000) {
          console.warn('Oversized message rejected');
          return;
        }
        const msg = JSON.parse(raw) as ClientMessage;
        if (!msg || typeof msg.type !== 'string') {
          throw new Error('Missing message type');
        }
        this.handleMessage(ws, msg);
      } catch (err) {
        console.error('Invalid message:', (err as Error).message);
        this.sendJson(ws, {
          type: ServerMessageType.Error,
          code: 'INVALID_MESSAGE',
          message: 'Failed to parse message',
        });
      }
    });

    ws.on('close', () => {
      // Find and remove player
      for (const [id, player] of this.players) {
        if (player.ws === ws) {
          console.log(`Player ${player.player.name} (${id}) disconnected`);
          this.players.delete(id);
          this.broadcastJson({
            type: ServerMessageType.PlayerLeft,
            playerId: id,
          });
          break;
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
    });
  }

  private handleMessage(ws: WebSocket, msg: ClientMessage): void {
    switch (msg.type) {
      case ClientMessageType.Join:
        this.handleJoin(ws, msg.playerName, (msg as any).protocolVersion);
        break;

      case ClientMessageType.Input:
        this.handleInput(ws, msg.seq, msg.action);
        break;

      case ClientMessageType.RequestSnapshot:
        this.sendSnapshot(ws);
        break;

      case ClientMessageType.Ping:
        // Update last ping time for stale detection
        for (const [, player] of this.players) {
          if (player.ws === ws) {
            player.lastPing = Date.now();
            break;
          }
        }
        this.sendJson(ws, {
          type: ServerMessageType.Pong,
          clientTimestamp: msg.timestamp,
          serverTimestamp: Date.now(),
        });
        break;

      case ClientMessageType.CameraUpdate:
        // Store camera for interest management (future)
        for (const [, player] of this.players) {
          if (player.ws === ws) {
            player.player.camera = msg.camera;
            break;
          }
        }
        break;

      case ClientMessageType.AdminCommand:
        this.handleAdminCommand(ws, msg.command, msg.args);
        break;

      default:
        break;
    }
  }

  private handleJoin(ws: WebSocket, playerName: string, protocolVersion?: number): void {
    // Validate protocol version
    if (protocolVersion !== undefined && protocolVersion !== PROTOCOL_VERSION) {
      this.sendJson(ws, {
        type: ServerMessageType.Error,
        code: 'PROTOCOL_MISMATCH',
        message: `Server uses protocol v${PROTOCOL_VERSION}, client sent v${protocolVersion}`,
      });
      ws.close(4001, 'Protocol version mismatch');
      return;
    }

    // Sanitize player name
    const safeName = (playerName || 'Anonymous').slice(0, 32).replace(/[<>&"]/g, '');

    const playerId = this.nextPlayerId++;
    const player: ConnectedPlayer = {
      ws,
      player: {
        id: playerId,
        name: safeName,
        color: [Math.random(), Math.random(), Math.random()],
        controlledBodyId: null,
        camera: {
          mode: 'orbit' as any,
          targetBodyId: 1,
          position: vec3(0, 0, AU * 3),
          lookAt: vec3(),
          up: vec3(0, 1, 0),
          fov: 60,
          near: 1e3,
          far: 1e15,
          distance: AU * 3,
          phi: 0,
          theta: Math.PI / 4,
        },
        isAdmin: this.players.size === 0, // First player is admin
      },
      lastPing: Date.now(),
      latency: 0,
      inputSeq: 0,
    };

    this.players.set(playerId, player);
    console.log(`Player ${safeName} joined as #${playerId}${player.player.isAdmin ? ' (admin)' : ''}`);

    // Send snapshot
    this.sendSnapshot(ws, playerId);

    // Notify others
    this.broadcastJson({
      type: ServerMessageType.PlayerJoined,
      playerId,
      playerName: safeName,
    }, ws);
  }

  private handleInput(ws: WebSocket, seq: number, action: InputAction): void {
    // Find the player for this connection
    let playerId = 0;
    for (const [id, p] of this.players) {
      if (p.ws === ws) {
        playerId = id;
        p.inputSeq = seq;
        break;
      }
    }

    if (playerId === 0) {
      this.sendJson(ws, {
        type: ServerMessageType.Error,
        code: 'NOT_JOINED',
        message: 'Must join before sending input',
      });
      return;
    }

    // Apply the action on the server (authoritative)
    if ('SpawnBody' in action) {
      const d = action.SpawnBody;

      // Validate spawn inputs
      if (!d.name || typeof d.mass !== 'number' || !isFinite(d.mass) || d.mass < 0 ||
          typeof d.radius !== 'number' || !isFinite(d.radius) || d.radius <= 0 ||
          !Array.isArray(d.position) || d.position.length !== 3 ||
          !Array.isArray(d.velocity) || d.velocity.length !== 3 ||
          d.position.some((v: number) => !isFinite(v)) ||
          d.velocity.some((v: number) => !isFinite(v))) {
        this.sendJson(ws, {
          type: ServerMessageType.Error,
          code: 'INVALID_INPUT',
          message: 'Invalid SpawnBody parameters',
        });
        return;
      }

      // Limit body count
      if (this.physics.state.bodies.length >= 10000) {
        this.sendJson(ws, {
          type: ServerMessageType.Error,
          code: 'LIMIT_REACHED',
          message: 'Maximum body count (10000) reached',
        });
        return;
      }

      const safeName = (d.name || 'Body').slice(0, 64);
      const id = this.physics.nextBodyId();
      const body: Body = {
        id,
        name: safeName,
        body_type: BodyType.Asteroid,
        position: vec3(d.position[0], d.position[1], d.position[2]),
        velocity: vec3(d.velocity[0], d.velocity[1], d.velocity[2]),
        acceleration: vec3(),
        mass: d.mass,
        radius: d.radius,
        rotation_period: 86400,
        axial_tilt: 0,
        rotation_angle: 0,
        collision_shape: { Sphere: { radius: d.radius } },
        restitution: 0.5,
        parent_id: null,
        soi_radius: 0,
        color: [0.5, 0.5, 0.5],
        luminosity: 0,
        albedo: 0.3,
        atmosphere: null,
        gravity_harmonics: null,
        has_rings: false,
        ring_inner_radius: 0,
        ring_outer_radius: 0,
        substep_factor: 1,
        required_dt: 1,
        is_active: true,
        is_massless: false,
      };
      this.physics.addBody(body);
      this.broadcastJson({
        type: ServerMessageType.Event,
        event: {
          type: SimEventType.BodyAdded,
          tick: this.physics.state.config.tick,
          data: { body },
        },
      });
    } else if ('DeleteBody' in action) {
      const bodyId = action.DeleteBody.body_id;
      const existed = this.physics.removeBody(bodyId);
      if (existed) {
        this.broadcastJson({
          type: ServerMessageType.Event,
          event: {
            type: SimEventType.BodyRemoved,
            tick: this.physics.state.config.tick,
            data: { body_id: bodyId },
          },
        });
      }
    } else if ('ApplyThrust' in action) {
      const d = action.ApplyThrust;
      if (!Array.isArray(d.force) || d.force.length !== 3 ||
          d.force.some((v: number) => !isFinite(v)) ||
          typeof d.duration !== 'number' || d.duration <= 0) {
        // Skip invalid thrust
      } else {
        const body = this.physics.state.bodies.find((b) => b.id === d.body_id);
        if (body && body.mass > 0) {
          body.acceleration.x += d.force[0] / body.mass;
          body.acceleration.y += d.force[1] / body.mass;
          body.acceleration.z += d.force[2] / body.mass;
        }
      }
    } else if ('SetPaused' in action) {
      this.physics.state.config.paused = action.SetPaused.paused;
    } else if ('SetTimeScale' in action) {
      const scale = action.SetTimeScale.scale;
      if (typeof scale === 'number' && isFinite(scale) && scale >= 0 && scale <= 1e6) {
        this.physics.state.config.time_scale = scale;
      }
    } else if ('SetConfig' in action) {
      const cfg = this.physics.state.config as any;
      const key = action.SetConfig.key;
      const value = action.SetConfig.value;
      // Apply known config keys with type coercion
      if (key in cfg) {
        if (typeof cfg[key] === 'boolean') {
          cfg[key] = value === 'true';
        } else if (typeof cfg[key] === 'number') {
          const num = parseFloat(value);
          if (!isNaN(num)) cfg[key] = num;
        } else {
          cfg[key] = value;
        }
      }
    }

    // ACK the input back to the sender
    this.sendJson(ws, {
      type: ServerMessageType.InputAck,
      seq,
      tick: this.physics.state.config.tick,
      playerId,
    });
  }

  private handleAdminCommand(ws: WebSocket, command: string, args: Record<string, unknown>): void {
    // Find the player
    let isAdmin = false;
    for (const [, player] of this.players) {
      if (player.ws === ws) {
        isAdmin = player.player.isAdmin;
        break;
      }
    }

    if (!isAdmin) {
      this.sendJson(ws, {
        type: ServerMessageType.Error,
        code: 'NOT_ADMIN',
        message: 'Admin privileges required',
      });
      return;
    }

    let success = true;
    let data: unknown = null;

    switch (command) {
      case 'pause':
        this.physics.state.config.paused = true;
        break;
      case 'unpause':
        this.physics.state.config.paused = false;
        break;
      case 'set_timescale':
        this.physics.state.config.time_scale = (args.scale as number) || 1;
        break;
      case 'set_solver':
        this.physics.state.config.solver_type = (args.solver as SolverType) || SolverType.Direct;
        break;
      case 'set_integrator':
        this.physics.state.config.integrator_type = (args.integrator as IntegratorType) || IntegratorType.VelocityVerlet;
        break;
      case 'status':
        data = {
          tick: this.physics.state.config.tick,
          time: this.physics.state.config.time,
          bodies: this.physics.state.bodies.length,
          players: this.players.size,
          avgTickMs: this.avgTickDuration.toFixed(2),
          wasmEnabled: !!(this.physics as any).wasmEngine,
        };
        break;
      case 'load_preset': {
        const preset = (args.preset as string) || 'solar_system';
        this.physics.loadPreset(preset, this.options.seed);
        // Send fresh snapshot to all players
        for (const [, player] of this.players) {
          this.sendSnapshot(player.ws, player.player.id);
        }
        data = { preset, bodies: this.physics.state.bodies.length };
        break;
      }
      default:
        success = false;
        data = `Unknown command: ${command}`;
    }

    this.sendJson(ws, {
      type: ServerMessageType.AdminResponse,
      success,
      data,
    });
  }

  private tick(): void {
    const start = performance.now();

    // Step physics
    const result = this.physics.step();
    this.tickCount++;

    const currentPositions = this.physics.getPositions();
    const bodyCount = this.physics.state.bodies.length;
    const currentTick = this.physics.state.config.tick;

    // Determine if we should send a full binary update or delta
    const bodiesChanged = bodyCount !== this.previousBodyCount;

    if (bodiesChanged || !this.previousPositions || this.tickCount % 300 === 0) {
      // Full position update (binary) — when body count changes or periodic snapshot
      const buffer = encodePositions(currentTick, currentPositions);
      for (const [, player] of this.players) {
        if (player.ws.readyState === WebSocket.OPEN) {
          player.ws.send(buffer);
        }
      }

      // Full snapshot every 300 ticks
      if (this.tickCount % 300 === 0) {
        for (const [, player] of this.players) {
          this.sendSnapshot(player.ws, player.player.id);
        }
      }
    } else {
      // Delta compression: find bodies whose positions changed significantly
      const deltas: Array<{ bodyId: number; position: Vec3; velocity?: Vec3 }> = [];
      const bodies = this.physics.state.bodies;

      for (let i = 0; i < bodyCount; i++) {
        const idx = i * 3;
        if (idx + 2 >= currentPositions.length || idx + 2 >= this.previousPositions.length) break;

        const dx = currentPositions[idx] - this.previousPositions[idx];
        const dy = currentPositions[idx + 1] - this.previousPositions[idx + 1];
        const dz = currentPositions[idx + 2] - this.previousPositions[idx + 2];
        const dist2 = dx * dx + dy * dy + dz * dz;

        if (dist2 > this.DELTA_THRESHOLD * this.DELTA_THRESHOLD) {
          deltas.push({
            bodyId: bodies[i].id,
            position: bodies[i].position,
            velocity: bodies[i].velocity,
          });
        }
      }

      if (deltas.length > 0) {
        // Send as DeltaMessage (JSON) if fewer bodies changed than total
        if (deltas.length < bodyCount * 0.7) {
          this.broadcastJson({
            type: ServerMessageType.Delta,
            tick: currentTick,
            time: this.physics.state.config.time,
            deltas: deltas.map((d) => ({
              bodyId: d.bodyId,
              position: d.position,
              velocity: d.velocity,
            })),
          });
        } else {
          // Most bodies changed — send full binary update
          const buffer = encodePositions(currentTick, currentPositions);
          for (const [, player] of this.players) {
            if (player.ws.readyState === WebSocket.OPEN) {
              player.ws.send(buffer);
            }
          }
        }
      }
    }

    // Update previous state for next comparison
    this.previousPositions = new Float64Array(currentPositions);
    this.previousBodyCount = bodyCount;

    // Send step diagnostics every 60 ticks
    if (this.tickCount % 60 === 0) {
      this.broadcastJson({
        type: ServerMessageType.StepResult,
        result,
      });
    }

    const duration = performance.now() - start;
    this.avgTickDuration = this.avgTickDuration * 0.95 + duration * 0.05;

    // Warn if tick taking too long
    const budgetMs = 1000 / this.options.tickRate;
    if (duration > budgetMs * 0.8 && this.tickCount % 600 === 0) {
      console.warn(`Tick ${this.tickCount}: ${duration.toFixed(1)}ms (budget: ${budgetMs.toFixed(1)}ms)`);
    }
  }

  private sendSnapshot(ws: WebSocket, playerId?: number): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    this.sendJson(ws, {
      type: ServerMessageType.Snapshot,
      state: this.physics.state,
      yourPlayerId: playerId || 0,
      serverTick: this.physics.state.config.tick,
    });
  }

  private sendJson(ws: WebSocket, msg: ServerMessage | any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  private broadcastJson(msg: ServerMessage | any, exclude?: WebSocket): void {
    const json = JSON.stringify(msg);
    for (const [, player] of this.players) {
      if (player.ws !== exclude && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(json);
      }
    }
  }
}
