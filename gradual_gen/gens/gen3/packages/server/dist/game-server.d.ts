/**
 * Game Server - Core game logic and WebSocket handling
 */
import { Server as HttpServer } from 'http';
import { WorldPreset } from './presets.js';
interface GameServerOptions {
    tickRate: number;
    maxClients: number;
}
export declare class GameServer {
    private options;
    private wss;
    private simulation;
    private players;
    private chatHistory;
    private maxChatHistory;
    private tickInterval;
    private running;
    private messageSeq;
    constructor(options: GameServerOptions);
    initialize(httpServer: HttpServer): Promise<void>;
    private handleConnection;
    private handleMessage;
    private handleJoin;
    private handleDisconnect;
    private handleInput;
    private handleChat;
    private handlePing;
    private handleSpawn;
    private handleCommand;
    start(): void;
    stop(): void;
    private broadcastState;
    private sendToPlayer;
    private sendToSocket;
    private broadcast;
    private broadcastExcept;
    private findSocket;
    private getPlayerList;
    getStatus(): {
        running: boolean;
        tick: number;
        simTime: number;
        bodyCount: number;
        playerCount: number;
        tickRate: number;
    };
    getBodies(): import('./simulation.js').Body[];
    createCheckpoint(): object;
    restoreCheckpoint(checkpoint: any): void;
    loadWorld(preset: WorldPreset): void;
    addBody(body: any): void;
    removeBody(id: string): void;
}
export {};
//# sourceMappingURL=game-server.d.ts.map