/**
 * Main game server: manages simulation loop, player connections, state sync.
 * Uses Rust WASM physics engine when available, TypeScript Velocity Verlet as fallback.
 */
interface ServerOptions {
    port: number;
    tickRate: number;
    preset: string;
    seed: number;
}
export declare class GameServer {
    private options;
    private wss;
    private physics;
    private players;
    private nextPlayerId;
    private tickInterval;
    private staleCheckInterval;
    private tickCount;
    private lastTickTime;
    private avgTickDuration;
    private previousPositions;
    private previousBodyCount;
    private readonly DELTA_THRESHOLD;
    constructor(options: ServerOptions);
    start(): Promise<void>;
    stop(): void;
    private handleConnection;
    private handleMessage;
    private handleJoin;
    private handleInput;
    private handleAdminCommand;
    private tick;
    private sendSnapshot;
    private sendJson;
    private broadcastJson;
}
export {};
//# sourceMappingURL=server.d.ts.map