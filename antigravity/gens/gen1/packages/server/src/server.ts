/**
 * N-Body Simulation Server
 * 
 * Authoritative game server running WASM physics core.
 * Handles client connections via WebSocket and broadcasts state at 60Hz.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Physics WASM module types (will be loaded dynamically)
interface PhysicsModule {
    WasmSimulation: new (seed: bigint) => WasmSimulation;
    createSunEarthMoon: (seed: bigint) => WasmSimulation;
    getG: () => number;
    getAU: () => number;
    getSolarMass: () => number;
    getEarthMass: () => number;
    circularVelocity: (mass: number, distance: number) => number;
    init: () => void;
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
    type: 'join' | 'input' | 'ping' | 'request_snapshot';
    payload?: unknown;
    clientTick?: number;
}

interface ServerMessage {
    type: 'welcome' | 'state' | 'snapshot' | 'pong' | 'error';
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

interface Client {
    ws: WebSocket;
    id: string;
    lastPing: number;
    latency: number;
}

// Server configuration
const CONFIG = {
    port: parseInt(process.env.PORT || '8080'),
    tickRate: 60, // Hz
    snapshotInterval: 300, // Every 5 seconds at 60Hz
    seed: BigInt(Date.now()),
    stateUpdateInterval: 1, // Send state every tick
};

class SimulationServer {
    private physics!: PhysicsModule;
    private simulation!: WasmSimulation;
    private wss!: WebSocketServer;
    private clients: Map<string, Client> = new Map();
    private tickInterval?: ReturnType<typeof setInterval>;
    private running = false;
    private lastSnapshotTick = 0n;

    async start(): Promise<void> {
        console.log('🚀 Starting N-Body Simulation Server...');

        // Load WASM module
        await this.loadPhysics();

        // Create simulation
        this.createSimulation();

        // Start WebSocket server
        this.startWebSocketServer();

        // Start game loop
        this.startGameLoop();

        console.log(`✅ Server running on port ${CONFIG.port}`);
        console.log(`   Tick rate: ${CONFIG.tickRate} Hz`);
        console.log(`   Seed: ${CONFIG.seed}`);
    }

    private async loadPhysics(): Promise<void> {
        console.log('📦 Loading WASM physics module...');

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
            console.log('✅ WASM physics loaded');
            console.log(`   G = ${this.physics.getG()} m³/(kg·s²)`);
            console.log(`   AU = ${this.physics.getAU()} m`);
        } catch (error) {
            console.error('❌ Failed to load WASM:', error);
            throw error;
        }
    }

    private createSimulation(): void {
        console.log('🌍 Creating simulation...');

        // Use preset for now
        this.simulation = this.physics.createSunEarthMoon(CONFIG.seed);

        // Configure for 60Hz tick rate
        this.simulation.setDt(1.0 / CONFIG.tickRate);
        this.simulation.setSubsteps(4);

        console.log(`   Bodies: ${this.simulation.bodyCount()}`);
        console.log(`   Initial energy: ${this.simulation.totalEnergy().toExponential(4)} J`);
    }

    private startWebSocketServer(): void {
        this.wss = new WebSocketServer({ port: CONFIG.port });

        this.wss.on('connection', (ws: WebSocket) => {
            const clientId = this.generateClientId();
            const client: Client = {
                ws,
                id: clientId,
                lastPing: Date.now(),
                latency: 0,
            };

            this.clients.set(clientId, client);
            console.log(`👤 Client connected: ${clientId} (${this.clients.size} total)`);

            // Send welcome message with full snapshot
            this.sendMessage(ws, {
                type: 'welcome',
                payload: {
                    clientId,
                    snapshot: this.simulation.toJson(),
                    config: {
                        tickRate: CONFIG.tickRate,
                        serverTick: Number(this.simulation.tick()),
                    },
                },
                serverTick: Number(this.simulation.tick()),
                timestamp: Date.now(),
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
                console.log(`👤 Client disconnected: ${clientId} (${this.clients.size} remaining)`);
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
            this.simulation.step();

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
                console.log(`📊 Tick ${currentTick} | Time: ${this.simulation.time().toFixed(2)}s | Energy: ${this.simulation.totalEnergy().toExponential(4)} J | Clients: ${this.clients.size}`);
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

    private sendMessage(ws: WebSocket, message: ServerMessage): void {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    private generateClientId(): string {
        return `client-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

        console.log('🛑 Server stopped');
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
    console.log('\n🛑 Shutting down...');
    server.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.stop();
    process.exit(0);
});
