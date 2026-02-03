/**
 * Player Session Management
 */
import { WebSocket } from 'ws';
import { Player, type PlayerState, type PlayerInputState, type CelestialBody, type NetworkMessage } from '@space-sim/shared';
/**
 * Connected client session
 */
export interface ClientSession {
    id: string;
    socket: WebSocket;
    player: Player;
    isConnected: boolean;
    joinedAt: number;
    lastPing: number;
    latency: number;
    lastInputSequence: number;
}
/**
 * Session manager for all connected clients
 */
export declare class SessionManager {
    private sessions;
    private sessionsBySocket;
    /**
     * Create a new session for a connecting client
     */
    createSession(socket: WebSocket, playerName: string): ClientSession;
    /**
     * Remove a session
     */
    removeSession(sessionOrId: ClientSession | string): boolean;
    /**
     * Get session by ID
     */
    getSession(id: string): ClientSession | undefined;
    /**
     * Get session by WebSocket
     */
    getSessionBySocket(socket: WebSocket): ClientSession | undefined;
    /**
     * Get all sessions
     */
    getAllSessions(): ClientSession[];
    /**
     * Get connected sessions
     */
    getConnectedSessions(): ClientSession[];
    /**
     * Get player count
     */
    getPlayerCount(): number;
    /**
     * Send message to a specific session
     */
    sendToSession(session: ClientSession, message: NetworkMessage): void;
    /**
     * Send binary data to a session
     */
    sendBinaryToSession(session: ClientSession, data: ArrayBuffer): void;
    /**
     * Broadcast message to all connected sessions
     */
    broadcast(message: NetworkMessage, exclude?: ClientSession): void;
    /**
     * Broadcast binary data to all connected sessions
     */
    broadcastBinary(data: ArrayBuffer, exclude?: ClientSession): void;
    /**
     * Broadcast player joined
     */
    broadcastPlayerJoined(session: ClientSession): void;
    /**
     * Broadcast player left
     */
    broadcastPlayerLeft(session: ClientSession, reason?: string): void;
    /**
     * Broadcast chat message
     */
    broadcastChat(session: ClientSession, text: string): void;
    /**
     * Broadcast system message
     */
    broadcastSystemMessage(text: string, level?: 'info' | 'warning' | 'error' | 'success'): void;
    /**
     * Update ping for a session
     */
    updatePing(session: ClientSession, clientTime: number): number;
    /**
     * Check for timed out sessions
     */
    checkTimeouts(timeoutMs?: number): ClientSession[];
    /**
     * Get all player states for network sync
     */
    getPlayerStates(): PlayerState[];
    /**
     * Apply input to a player
     */
    applyPlayerInput(session: ClientSession, input: PlayerInputState, dt: number): void;
    /**
     * Spawn player on a body
     */
    spawnPlayerOnBody(session: ClientSession, body: CelestialBody): void;
}
//# sourceMappingURL=SessionManager.d.ts.map