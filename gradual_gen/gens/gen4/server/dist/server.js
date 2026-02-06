/**
 * Main game server: manages simulation loop, player connections, state sync.
 * Uses a simple in-process physics engine (TypeScript fallback) until
 * native Rust FFI bridge is set up. Can also run the WASM module for parity.
 */
import { WebSocketServer, WebSocket } from 'ws';
import { BodyType, SolverType, IntegratorType, vec3, G, SOLAR_MASS, EARTH_MASS, EARTH_RADIUS, AU, SOLAR_LUMINOSITY, } from '@solar-sim/shared';
import { ClientMessageType, ServerMessageType, encodePositions, } from '@solar-sim/shared';
// ── Simple TypeScript Physics (fallback until native Rust bridge) ─────────────
class PhysicsEngine {
    state;
    constructor(preset, seed) {
        this.state = this.createFromPreset(preset, seed);
    }
    createFromPreset(presetName, seed) {
        const config = {
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
    buildPresetBodies(preset) {
        const makeBody = (id, name, type, mass, radius, pos, vel, color, parentId = null, luminosity = 0) => ({
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
                const planets = [
                    { id: 2, name: 'Mercury', mass: 3.301e23, radius: 2.44e6, dist: 5.791e10, color: [0.7, 0.6, 0.5] },
                    { id: 3, name: 'Venus', mass: 4.867e24, radius: 6.052e6, dist: 1.082e11, color: [0.9, 0.7, 0.3] },
                    { id: 4, name: 'Earth', mass: EARTH_MASS, radius: EARTH_RADIUS, dist: AU, color: [0.2, 0.4, 0.8] },
                    { id: 5, name: 'Mars', mass: 6.417e23, radius: 3.39e6, dist: 2.279e11, color: [0.8, 0.3, 0.1] },
                    { id: 6, name: 'Jupiter', mass: 1.898e27, radius: 6.991e7, dist: 7.786e11, color: [0.8, 0.7, 0.5] },
                    { id: 7, name: 'Saturn', mass: 5.683e26, radius: 5.823e7, dist: 1.434e12, color: [0.9, 0.8, 0.5] },
                    { id: 8, name: 'Uranus', mass: 8.681e25, radius: 2.536e7, dist: 2.871e12, color: [0.5, 0.7, 0.9] },
                    { id: 9, name: 'Neptune', mass: 1.024e26, radius: 2.462e7, dist: 4.495e12, color: [0.2, 0.3, 0.9] },
                ];
                const bodies = [
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
    /** Velocity Verlet integration step (O(N²) direct gravity) */
    step() {
        if (this.state.config.paused) {
            return this.emptyResult();
        }
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
    getPositions() {
        const result = new Float64Array(this.state.bodies.length * 3);
        for (let i = 0; i < this.state.bodies.length; i++) {
            result[i * 3 + 0] = this.state.bodies[i].position.x;
            result[i * 3 + 1] = this.state.bodies[i].position.y;
            result[i * 3 + 2] = this.state.bodies[i].position.z;
        }
        return result;
    }
    addBody(body) {
        this.state.bodies.push(body);
    }
    removeBody(id) {
        const idx = this.state.bodies.findIndex((b) => b.id === id);
        if (idx >= 0) {
            this.state.bodies.splice(idx, 1);
            return true;
        }
        return false;
    }
    nextBodyId() {
        return Math.max(0, ...this.state.bodies.map((b) => b.id)) + 1;
    }
    emptyResult() {
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
    options;
    wss = null;
    physics;
    players = new Map();
    nextPlayerId = 1;
    tickInterval = null;
    tickCount = 0;
    lastTickTime = 0;
    avgTickDuration = 0;
    constructor(options) {
        this.options = options;
        this.physics = new PhysicsEngine(options.preset, options.seed);
    }
    async start() {
        this.wss = new WebSocketServer({ port: this.options.port });
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
        // Start tick loop
        const tickMs = 1000 / this.options.tickRate;
        this.lastTickTime = performance.now();
        this.tickInterval = setInterval(() => {
            this.tick();
        }, tickMs);
        console.log(`Server listening on ws://localhost:${this.options.port}`);
        console.log(`Simulation started with ${this.physics.state.bodies.length} bodies`);
    }
    stop() {
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        for (const [, player] of this.players) {
            player.ws.close(1001, 'Server shutting down');
        }
        this.wss?.close();
        console.log('Server stopped.');
    }
    handleConnection(ws, req) {
        const ip = req.socket.remoteAddress || 'unknown';
        console.log(`New connection from ${ip}`);
        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                this.handleMessage(ws, msg);
            }
            catch (err) {
                console.error('Invalid message:', err);
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
    handleMessage(ws, msg) {
        switch (msg.type) {
            case ClientMessageType.Join:
                this.handleJoin(ws, msg.playerName);
                break;
            case ClientMessageType.Input:
                this.handleInput(ws, msg.seq, msg.action);
                break;
            case ClientMessageType.RequestSnapshot:
                this.sendSnapshot(ws);
                break;
            case ClientMessageType.Ping:
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
    handleJoin(ws, playerName) {
        const playerId = this.nextPlayerId++;
        const player = {
            ws,
            player: {
                id: playerId,
                name: playerName,
                color: [Math.random(), Math.random(), Math.random()],
                controlledBodyId: null,
                camera: {
                    mode: 'orbit',
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
        console.log(`Player ${playerName} joined as #${playerId}${player.player.isAdmin ? ' (admin)' : ''}`);
        // Send snapshot
        this.sendSnapshot(ws, playerId);
        // Notify others
        this.broadcastJson({
            type: ServerMessageType.PlayerJoined,
            playerId,
            playerName,
        }, ws);
    }
    handleInput(ws, seq, action) {
        // Apply the action on the server (authoritative)
        if ('SpawnBody' in action) {
            const d = action.SpawnBody;
            const id = this.physics.nextBodyId();
            const body = {
                id,
                name: d.name,
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
                    type: 'body_added',
                    tick: this.physics.state.config.tick,
                    data: { body },
                },
            });
        }
        else if ('DeleteBody' in action) {
            this.physics.removeBody(action.DeleteBody.body_id);
            this.broadcastJson({
                type: ServerMessageType.Event,
                event: {
                    type: 'body_removed',
                    tick: this.physics.state.config.tick,
                    data: { body_id: action.DeleteBody.body_id },
                },
            });
        }
        else if ('ApplyThrust' in action) {
            const d = action.ApplyThrust;
            const body = this.physics.state.bodies.find((b) => b.id === d.body_id);
            if (body && body.mass > 0) {
                body.acceleration.x += d.force[0] / body.mass;
                body.acceleration.y += d.force[1] / body.mass;
                body.acceleration.z += d.force[2] / body.mass;
            }
        }
        else if ('SetPaused' in action) {
            this.physics.state.config.paused = action.SetPaused.paused;
        }
        else if ('SetTimeScale' in action) {
            this.physics.state.config.time_scale = action.SetTimeScale.scale;
        }
    }
    handleAdminCommand(ws, command, args) {
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
        let data = null;
        switch (command) {
            case 'pause':
                this.physics.state.config.paused = true;
                break;
            case 'unpause':
                this.physics.state.config.paused = false;
                break;
            case 'set_timescale':
                this.physics.state.config.time_scale = args.scale || 1;
                break;
            case 'set_solver':
                this.physics.state.config.solver_type = args.solver || SolverType.Direct;
                break;
            case 'set_integrator':
                this.physics.state.config.integrator_type = args.integrator || IntegratorType.VelocityVerlet;
                break;
            case 'status':
                data = {
                    tick: this.physics.state.config.tick,
                    time: this.physics.state.config.time,
                    bodies: this.physics.state.bodies.length,
                    players: this.players.size,
                    avgTickMs: this.avgTickDuration.toFixed(2),
                };
                break;
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
    tick() {
        const start = performance.now();
        // Step physics
        const result = this.physics.step();
        this.tickCount++;
        // Send position updates (binary) to all connected players
        const positions = this.physics.getPositions();
        const buffer = encodePositions(this.physics.state.config.tick, positions);
        for (const [, player] of this.players) {
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(buffer);
            }
        }
        // Send step diagnostics every 60 ticks
        if (this.tickCount % 60 === 0) {
            this.broadcastJson({
                type: ServerMessageType.StepResult,
                result,
            });
        }
        // Full snapshot every SNAPSHOT_INTERVAL ticks
        if (this.tickCount % 300 === 0) {
            for (const [, player] of this.players) {
                this.sendSnapshot(player.ws, player.player.id);
            }
        }
        const duration = performance.now() - start;
        this.avgTickDuration = this.avgTickDuration * 0.95 + duration * 0.05;
        // Warn if tick taking too long
        const budgetMs = 1000 / this.options.tickRate;
        if (duration > budgetMs * 0.8 && this.tickCount % 600 === 0) {
            console.warn(`Tick ${this.tickCount}: ${duration.toFixed(1)}ms (budget: ${budgetMs.toFixed(1)}ms)`);
        }
    }
    sendSnapshot(ws, playerId) {
        if (ws.readyState !== WebSocket.OPEN)
            return;
        this.sendJson(ws, {
            type: ServerMessageType.Snapshot,
            state: this.physics.state,
            yourPlayerId: playerId || 0,
            serverTick: this.physics.state.config.tick,
        });
    }
    sendJson(ws, msg) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(msg));
        }
    }
    broadcastJson(msg, exclude) {
        const json = JSON.stringify(msg);
        for (const [, player] of this.players) {
            if (player.ws !== exclude && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(json);
            }
        }
    }
}
//# sourceMappingURL=server.js.map