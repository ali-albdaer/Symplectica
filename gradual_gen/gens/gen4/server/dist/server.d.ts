/**
 * Main game server: manages simulation loop, player connections, state sync.
 * Uses a simple in-process physics engine (TypeScript fallback) until
 * native Rust FFI bridge is set up. Can also run the WASM module for parity.
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
    private tickCount;
    private lastTickTime;
    private avgTickDuration;
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