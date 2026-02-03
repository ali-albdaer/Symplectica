/**
 * Authoritative Game Server
 * ==========================
 * Runs the physics simulation and validates all state.
 * Clients are only allowed to send input; server calculates all physics.
 */
import { type ServerConfig } from './config.js';
/**
 * Game Server
 */
export declare class GameServer {
    private config;
    private wss;
    private physics;
    private sessions;
    private lastPhysicsUpdate;
    private lastNetworkUpdate;
    private isRunning;
    private isPaused;
    private currentWorld;
    private bodyIdHashMap;
    private physicsTick;
    private networkTick;
    constructor(config?: Partial<ServerConfig>);
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Stop the server
     */
    stop(): void;
    /**
     * Load a world by name
     */
    loadWorld(name: string): void;
    /**
     * Handle new WebSocket connection
     */
    private handleConnection;
    /**
     * Handle WebSocket message
     */
    private handleMessage;
    /**
     * Handle JSON message
     */
    private handleJSONMessage;
    /**
     * Handle binary message (reserved for future use)
     */
    private handleBinaryMessage;
    /**
     * Handle player join
     */
    private handleJoin;
    /**
     * Handle ping
     */
    private handlePing;
    /**
     * Handle player input
     */
    private handlePlayerInput;
    /**
     * Handle chat message
     */
    private handleChat;
    /**
     * Handle chat commands
     */
    private handleCommand;
    /**
     * Handle world builder action
     */
    private handleWorldBuilderAction;
    /**
     * Handle configuration update
     */
    private handleConfigUpdate;
    /**
     * Handle time scale change
     */
    private handleTimeScale;
    /**
     * Handle disconnect
     */
    private handleDisconnect;
    /**
     * Send error message
     */
    private sendError;
    /**
     * Send system message to session
     */
    private sendSystemMessage;
    /**
     * Send world state to session
     */
    private sendWorldState;
    /**
     * Broadcast world state to all clients
     */
    private broadcastWorldState;
    /**
     * Broadcast world delta (body states only)
     */
    private broadcastWorldDelta;
    /**
     * Main game loop
     */
    private gameLoop;
    /**
     * Simple string hash
     */
    private hashString;
    /**
     * Get server status
     */
    getStatus(): {
        players: number;
        bodies: number;
        tick: number;
        time: number;
        timeScale: number;
        paused: boolean;
    };
}
/**
 * Create and start the game server
 */
export declare function startServer(config?: Partial<ServerConfig>): Promise<GameServer>;
//# sourceMappingURL=GameServer.d.ts.map