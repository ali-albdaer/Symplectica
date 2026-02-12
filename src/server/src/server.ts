/**
 * N-Body Simulation Server
 * 
 * Authoritative game server running WASM physics core.
 * Handles client connections via WebSocket and broadcasts state at 60Hz.
 */

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { CONFIG } from './config.js';

// Physics WASM module types (will be loaded dynamically)
interface PhysicsModule {
    WasmSimulation: new (seed: bigint) => WasmSimulation;
    createSunEarthMoon: (seed: bigint) => WasmSimulation;
    createFullSolarSystem: (seed: bigint) => WasmSimulation;
    createPlayableSolarSystem: (seed: bigint) => WasmSimulation;
    getG: () => number;
    getAU: () => number;
    getSolarMass: () => number;
    getEarthMass: () => number;
    circularVelocity: (mass: number, distance: number) => number;
    init: () => void;
}

// Speed levels for label lookup (should match time-controller.ts)
const SPEED_LEVELS = [
    { sim: 1, label: '1s/s' },
    { sim: 60, label: '1min/s' },
    { sim: 3600, label: '1hr/s' },
    { sim: 86400, label: '1day/s' },
    { sim: 604800, label: '1wk/s' },
    { sim: 2592000, label: '1mo/s' },
    { sim: 31536000, label: '1yr/s' },
];

function getSpeedLabel(sim: number): string {
    // Find exact match
    const exact = SPEED_LEVELS.find(l => Math.abs(l.sim - sim) < 0.001);
    if (exact) return exact.label;

    // Fallback format
    if (sim < 60) return `${sim.toFixed(1)}s/s`;
    if (sim < 3600) return `${(sim / 60).toFixed(1)}min/s`;
    if (sim < 86400) return `${(sim / 3600).toFixed(1)}hr/s`;
    if (sim < 604800) return `${(sim / 86400).toFixed(1)}day/s`;
    if (sim < 31536000) return `${(sim / 604800).toFixed(1)}wk/s`;
    return `${(sim / 31536000).toFixed(1)}yr/s`;
}

interface WasmSimulation {
    step(): void;
    stepN(n: bigint): void;
    time(): number;
    tick(): bigint;
    bodyCount(): number;
    getPositions(): Float64Array;
    getVelocities(): Float64Array;
    getBodiesJson(): string;
    toJson(): string;
    fromJson(json: string): boolean;
    totalEnergy(): number;
    addStar(name: string, mass: number, radius: number): number;
    addPlanet(name: string, mass: number, radius: number, distance: number, velocity: number): number;
    addBody(name: string, mass: number, radius: number, px: number, py: number, pz: number, vx: number, vy: number, vz: number): number;
    removeBody(id: number): boolean;
    setDt(dt: number): void;
    setSubsteps(substeps: number): void;
    setTheta(theta: number): void;
    useDirectForce(): void;
    useBarnesHut(): void;
    random(): number;
    free(): void;
}

// Message types
interface ClientMessage {
    type: 'join' | 'input' | 'ping' | 'request_snapshot' | 'chat' | 'admin_settings' | 'set_time_scale' | 'apply_snapshot' | 'reset_simulation' | 'set_pause';
    payload?: unknown;
    clientTick?: number;
}

interface ServerMessage {
    type: 'welcome' | 'state' | 'snapshot' | 'pong' | 'error' | 'chat' | 'admin_state';
    payload: unknown;
    serverTick?: number;
    timestamp?: number;
}

interface StatePayload {
    tick: number;
    time: number;
    positions: number[];
    energy: number;
}

interface ChatPayload {
    sender: string;
    text: string;
}

interface AdminStatePayload {
    dt: number;
    substeps: number;
    forceMethod: 'direct' | 'barnes-hut';
    theta: number;
    timeScale: number;
    paused: boolean;
    simMode: 'tick' | 'accumulator';
}


interface Client {
    ws: WebSocket;
    id: string;
    displayName: string;
    lastPing: number;
    latency: number;
}

class SimulationServer {
    private physics!: PhysicsModule;
    private simulation!: WasmSimulation;
    private wss!: WebSocketServer;
    private clients: Map<string, Client> = new Map();
    private tickInterval?: ReturnType<typeof setInterval>;
    private running = false;
    private lastSnapshotTick = 0n;
    private simAccumulator = 0;
    private adminState: AdminStatePayload = {
        dt: 1 / CONFIG.tickRate,
        substeps: 4,
        forceMethod: 'direct',
        theta: 0.5,
        timeScale: 1, // Matches dt * tickRate (1s/s)
        paused: false,
        simMode: 'tick',
    };

    // New properties for HTTP server
    private app!: express.Express;
    private httpServer!: http.Server;

    async start(): Promise<void> {
        console.log('[INFO] Starting N-Body Simulation Server...');

        // Load WASM module
        await this.loadPhysics();

        // Create simulation
        this.createSimulation();

        // Initialize Express and HTTP server
        this.app = express();
        this.httpServer = http.createServer(this.app);

        // Serve static files from client build
        const clientDist = join(dirname(fileURLToPath(import.meta.url)), '../../client/dist');
        this.app.use(express.static(clientDist));
        console.log(`[INFO] Serving static files from: ${clientDist}`);

        // Start WebSocket server (attached to HTTP server)
        this.startWebSocketServer();

        // Start game loop
        this.startGameLoop();

        // Start listening
        this.httpServer.listen(CONFIG.port, () => {
            console.log(`[OK] Server running on port ${CONFIG.port}`);
            console.log(`   Tick rate: ${CONFIG.tickRate} Hz`);
            console.log(`   Seed: ${CONFIG.seed}`);
        });
    }

    private async loadPhysics(): Promise<void> {
        console.log('[INFO] Loading WASM physics module...');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        // Load the WASM module
        const wasmJsPath = join(__dirname, '../../physics-core/pkg/physics_core.js');
        const wasmBinaryPath = join(__dirname, '../../physics-core/pkg/physics_core_bg.wasm');

        try {
            // Convert Windows path to file:// URL for dynamic import
            const wasmJsUrl = `file://${wasmJsPath.replace(/\\/g, '/')}`;

            // Dynamic import for ESM
            const module = await import(wasmJsUrl);

            // Read WASM binary
            const wasmBinary = readFileSync(wasmBinaryPath);

            // Initialize WASM
            await module.default(wasmBinary);
            module.init();

            this.physics = module as PhysicsModule;
            console.log('[OK] WASM physics loaded');
            console.log(`   G = ${this.physics.getG()} m³/(kg·s²)`);
            console.log(`   AU = ${this.physics.getAU()} m`);
        } catch (error) {
            console.error('[ERROR] Failed to load WASM:', error);
            throw error;
        }
    }

    private createSimulation(): void {
        console.log('[INFO] Creating simulation...');

        // Use preset for now
        this.simulation = this.physics.createFullSolarSystem(CONFIG.seed);

        // Configure for 60Hz tick rate
        this.simulation.setDt(1.0 / CONFIG.tickRate);
        this.simulation.setSubsteps(4);
        this.adminState = {
            dt: 1.0 / CONFIG.tickRate,
            substeps: 4,
            forceMethod: 'direct',
            theta: 0.5,
            timeScale: 1.0 / CONFIG.tickRate * CONFIG.tickRate,
            paused: false,
            simMode: 'tick',
        };

        console.log(`   Bodies: ${this.simulation.bodyCount()}`);
        console.log(`   Initial energy: ${this.simulation.totalEnergy().toExponential(4)} J`);
    }

    private startWebSocketServer(): void {
        // Create WebSocket server attached to HTTP server
        this.wss = new WebSocketServer({ server: this.httpServer });

        this.wss.on('connection', (ws: WebSocket) => {
            const clientId = this.generateClientId();
            const displayName = this.generateDisplayName();
            const client: Client = {
                ws,
                id: clientId,
                displayName,
                lastPing: Date.now(),
                latency: 0,
            };

            this.clients.set(clientId, client);
            console.log(`[INFO] Client connected: ${clientId} (${this.clients.size} total)`);

            // Send welcome message with full snapshot
            this.sendMessage(ws, {
                type: 'welcome',
                payload: {
                    clientId,
                    displayName,
                    snapshot: this.simulation.toJson(),
                    players: this.getPlayerNames(),
                    config: {
                        tickRate: CONFIG.tickRate,
                        serverTick: Number(this.simulation.tick()),
                        adminState: this.adminState,
                        visualPresetDefault: 'Ultra',
                    },
                },
                serverTick: Number(this.simulation.tick()),
                timestamp: Date.now(),
            });

            this.broadcastChat({
                sender: 'System',
                text: `${displayName} joined`,
            });

            ws.on('message', (data: Buffer) => {
                try {
                    const message = JSON.parse(data.toString()) as ClientMessage;
                    this.handleMessage(client, message);
                } catch (error) {
                    console.error('Invalid message from client:', error);
                }
            });

            ws.on('close', () => {
                this.clients.delete(clientId);
                console.log(`[INFO] Client disconnected: ${clientId} (${this.clients.size} remaining)`);
                this.broadcastChat({
                    sender: 'System',
                    text: `${client.displayName} left`,
                });
            });

            ws.on('error', (error) => {
                console.error(`Client error ${clientId}:`, error);
            });
        });
    }

    private handleMessage(client: Client, message: ClientMessage): void {
        switch (message.type) {
            case 'ping':
                this.sendMessage(client.ws, {
                    type: 'pong',
                    payload: { clientTick: message.clientTick },
                    serverTick: Number(this.simulation.tick()),
                    timestamp: Date.now(),
                });
                client.lastPing = Date.now();
                break;

            case 'request_snapshot':
                this.sendMessage(client.ws, {
                    type: 'snapshot',
                    payload: this.simulation.toJson(),
                    serverTick: Number(this.simulation.tick()),
                    timestamp: Date.now(),
                });
                break;

            case 'input':
                // Handle player input - to be implemented
                // For now, just acknowledge
                break;

            case 'set_time_scale': {
                const payload = message.payload as { simSecondsPerRealSecond?: number } | undefined;
                const scale = payload?.simSecondsPerRealSecond;
                if (typeof scale !== 'number' || !Number.isFinite(scale) || scale <= 0) {
                    return;
                }

                this.adminState = {
                    ...this.adminState,
                    timeScale: scale,
                };
                if (this.adminState.simMode === 'tick') {
                    const dt = scale / CONFIG.tickRate;
                    this.simulation.setDt(dt);
                    this.adminState = {
                        ...this.adminState,
                        dt,
                    };
                }
                this.broadcastAdminState();
                break;
            }

            case 'admin_settings': {
                const payload = message.payload as Partial<AdminStatePayload> | undefined;
                if (!payload) return;

                const dt = typeof payload.dt === 'number' && payload.dt > 0 ? payload.dt : this.adminState.dt;
                const substeps = typeof payload.substeps === 'number' && payload.substeps > 0 ? payload.substeps : this.adminState.substeps;
                const forceMethod = payload.forceMethod === 'barnes-hut' ? 'barnes-hut' : 'direct';
                const theta = typeof payload.theta === 'number' && payload.theta > 0 ? payload.theta : this.adminState.theta;
                const simMode = payload.simMode === 'accumulator' ? 'accumulator' : 'tick';
                const timeScale = typeof payload.timeScale === 'number' && payload.timeScale > 0
                    ? payload.timeScale
                    : this.adminState.timeScale;

                const changes: string[] = [];
                // Only announce time warp separately or as special message?
                // User requirement: "*** Time warp was set to {new_time warp} (e.g. 1wk/s, 1mo/s etc.)"

                if (timeScale !== this.adminState.timeScale) {
                    const label = getSpeedLabel(timeScale);
                    this.broadcastChat({
                        sender: 'Admin',
                        text: `Time warp was set to ${label}`
                    });
                }

                // Other changes (dt, substeps etc) might not need broadcast or can be grouped
                // For now, let's keep other technical changes minimal or remove if user wants ONLY the formatted ones.
                // User said "Remove the admin updated part, And instead of sending as admin change the messages to something like..."
                // So I will remove the generic "Admin updated settings: ..." and only send the requested ones.

                /*
                if (dt !== this.adminState.dt) changes.push(`dt=${dt}`);
                if (substeps !== this.adminState.substeps) changes.push(`substeps=${substeps}`);
                if (forceMethod !== this.adminState.forceMethod) changes.push(`method=${forceMethod}`);
                if (simMode !== this.adminState.simMode) changes.push(`mode=${simMode}`);
                */

                this.simulation.setDt(dt);
                this.simulation.setSubsteps(substeps);
                if (forceMethod === 'barnes-hut') {
                    this.simulation.setTheta(theta);
                    this.simulation.useBarnesHut();
                } else {
                    this.simulation.useDirectForce();
                }

                this.adminState = {
                    dt,
                    substeps,
                    forceMethod,
                    theta,
                    timeScale,
                    paused: this.adminState.paused,
                    simMode,
                };

                this.simAccumulator = 0;

                if (this.adminState.simMode === 'tick') {
                    const tickDt = this.adminState.timeScale / CONFIG.tickRate;
                    this.simulation.setDt(tickDt);
                    this.adminState = {
                        ...this.adminState,
                        dt: tickDt,
                    };
                }
                this.broadcastAdminState();

                /*
                if (changes.length > 0) {
                    this.broadcastChat({
                        sender: 'System',
                        text: `Admin updated settings: ${changes.join(', ')}`
                    });
                }
                */
                break;
            }

            case 'set_pause': {
                const payload = message.payload as { paused?: boolean } | undefined;
                if (typeof payload?.paused !== 'boolean') return;
                this.adminState = {
                    ...this.adminState,
                    paused: payload.paused,
                };
                this.broadcastAdminState();
                this.broadcastChat({
                    sender: 'System',
                    text: `Simulation ${payload.paused ? 'paused' : 'resumed'}`
                });
                break;
            }


            case 'apply_snapshot': {
                const payload = message.payload as { snapshot?: string; presetName?: string } | undefined;
                if (!payload?.snapshot) return;
                const ok = this.simulation.fromJson(payload.snapshot);
                if (ok) {
                    this.broadcastSnapshot();
                    const name = payload.presetName || 'Custom Snapshot';
                    this.broadcastChat({
                        sender: 'Admin',
                        text: `Universe was changed to ${name}`
                    });
                }
                break;
            }

            case 'reset_simulation':
                this.createSimulation();
                this.broadcastSnapshot();
                this.broadcastAdminState();
                this.broadcastChat({
                    sender: 'Admin',
                    text: 'Universe was changed to Full Solar System (Reset)'
                });
                break;

            case 'chat': {
                const payload = message.payload as Partial<ChatPayload> | undefined;
                const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
                if (!text) return;

                if (text.startsWith('/')) {
                    this.handleChatCommand(client, text);
                    return;
                }

                this.broadcastChat({ sender: client.displayName, text: text.slice(0, 200) });
                break;
            }

            default:
                console.warn(`Unknown message type: ${message.type}`);
        }
    }

    private startGameLoop(): void {
        this.running = true;
        const tickMs = 1000 / CONFIG.tickRate;
        let lastTime = performance.now();

        this.tickInterval = setInterval(() => {
            const now = performance.now();
            const delta = now - lastTime;
            lastTime = now;

            // Step simulation
            if (!this.adminState.paused) {
                if (this.adminState.simMode === 'accumulator') {
                    this.simAccumulator += (delta / 1000) * this.adminState.timeScale;
                    let steps = 0;
                    const maxSteps = 1000;
                    while (this.simAccumulator >= this.adminState.dt && steps < maxSteps) {
                        this.simulation.step();
                        this.simAccumulator -= this.adminState.dt;
                        steps++;
                    }
                    if (steps >= maxSteps) {
                        this.simAccumulator = 0;
                    }
                } else {
                    this.simulation.step();
                }
            }

            const currentTick = this.simulation.tick();

            // Broadcast state to all clients
            if (Number(currentTick) % CONFIG.stateUpdateInterval === 0) {
                this.broadcastState();
            }

            // Send full snapshot periodically
            if (Number(currentTick - this.lastSnapshotTick) >= CONFIG.snapshotInterval) {
                this.broadcastSnapshot();
                this.lastSnapshotTick = currentTick;
            }

            // Log performance occasionally
            if (Number(currentTick) % (CONFIG.tickRate * 10) === 0) {
                console.log(`[STATS] Tick ${currentTick} | Time: ${this.simulation.time().toFixed(2)}s | Energy: ${this.simulation.totalEnergy().toExponential(4)} J | Clients: ${this.clients.size}`);
            }
        }, tickMs);
    }

    private broadcastState(): void {
        const positions = this.simulation.getPositions();

        const state: StatePayload = {
            tick: Number(this.simulation.tick()),
            time: this.simulation.time(),
            positions: Array.from(positions),
            energy: this.simulation.totalEnergy(),
        };

        const message: ServerMessage = {
            type: 'state',
            payload: state,
            serverTick: state.tick,
            timestamp: Date.now(),
        };

        const data = JSON.stringify(message);

        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        }
    }

    private broadcastSnapshot(): void {
        const message: ServerMessage = {
            type: 'snapshot',
            payload: this.simulation.toJson(),
            serverTick: Number(this.simulation.tick()),
            timestamp: Date.now(),
        };

        const data = JSON.stringify(message);

        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        }
    }

    private broadcastAdminState(): void {
        const message: ServerMessage = {
            type: 'admin_state',
            payload: this.adminState,
            serverTick: Number(this.simulation.tick()),
            timestamp: Date.now(),
        };

        const data = JSON.stringify(message);

        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        }
    }


    private broadcastChat(payload: ChatPayload): void {
        const message: ServerMessage = {
            type: 'chat',
            payload,
            serverTick: Number(this.simulation.tick()),
            timestamp: Date.now(),
        };

        const data = JSON.stringify(message);

        for (const client of this.clients.values()) {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(data);
            }
        }
    }

    private sendMessage(ws: WebSocket, message: ServerMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    private sendChatToClient(client: Client, payload: ChatPayload): void {
        this.sendMessage(client.ws, {
            type: 'chat',
            payload,
            serverTick: Number(this.simulation.tick()),
            timestamp: Date.now(),
        });
    }

    private handleChatCommand(client: Client, text: string): void {
        const commandText = text.slice(1).trim();
        const [rawCommand, ...args] = commandText.split(/\s+/);
        const command = rawCommand?.toLowerCase();

        switch (command) {
            case 'help':
                this.sendChatToClient(client, {
                    sender: 'System',
                    text: 'Commands: /help, /name <name>, /players',
                });
                break;

            case 'name': {
                const requested = args.join(' ').replace(/\s+/g, ' ').trim();
                if (!requested) {
                    this.sendChatToClient(client, {
                        sender: 'System',
                        text: 'Usage: /name <name>',
                    });
                    break;
                }

                const normalized = requested.slice(0, 20);
                if (normalized.toLowerCase() === 'system' || normalized.toLowerCase() === 'admin') {
                    this.sendChatToClient(client, {
                        sender: 'System',
                        text: 'no.',
                    });
                    break;
                }
                const previous = client.displayName;
                client.displayName = normalized;

                if (previous !== normalized) {
                    this.broadcastChat({
                        sender: 'System',
                        text: `${previous} is now known as ${normalized}`,
                    });
                } else {
                    this.sendChatToClient(client, {
                        sender: 'System',
                        text: `Name unchanged (${normalized}).`,
                    });
                }
                break;
            }

            case 'players': {
                const players = this.getPlayerNames();
                const list = players.length > 0 ? players.join(', ') : 'none';
                this.sendChatToClient(client, {
                    sender: 'System',
                    text: `Players: ${list}`,
                });
                break;
            }

            default:
                this.sendChatToClient(client, {
                    sender: 'System',
                    text: 'Unknown command. Type /help for a list of commands.',
                });
                break;
        }
    }

    private getPlayerNames(): string[] {
        return Array.from(this.clients.values()).map((client) => client.displayName);
    }

    private generateClientId(): string {
        return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }

    private generateDisplayName(): string {
        const number = Math.floor(1000 + Math.random() * 9000);
        return `Player${number}`;
    }

    stop(): void {
        this.running = false;

        if (this.tickInterval) {
            clearInterval(this.tickInterval);
        }

        if (this.simulation) {
            this.simulation.free();
        }

        if (this.wss) {
            this.wss.close();
        }

        if (this.httpServer) {
            this.httpServer.close();
        }

        console.log('[INFO] Server stopped');
    }
}

// Start server
const server = new SimulationServer();

server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n[INFO] Shutting down...');
    server.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.stop();
    process.exit(0);
});
