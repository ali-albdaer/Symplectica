/**
 * Player Session Management
 */
import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Player, MessageType, createMessage } from '@space-sim/shared';
/**
 * Session manager for all connected clients
 */
export class SessionManager {
    sessions = new Map();
    sessionsBySocket = new Map();
    /**
     * Create a new session for a connecting client
     */
    createSession(socket, playerName) {
        const id = uuidv4();
        const player = new Player(id, playerName);
        const session = {
            id,
            socket,
            player,
            isConnected: true,
            joinedAt: Date.now(),
            lastPing: Date.now(),
            latency: 0,
            lastInputSequence: 0
        };
        this.sessions.set(id, session);
        this.sessionsBySocket.set(socket, session);
        return session;
    }
    /**
     * Remove a session
     */
    removeSession(sessionOrId) {
        const session = typeof sessionOrId === 'string'
            ? this.sessions.get(sessionOrId)
            : sessionOrId;
        if (!session)
            return false;
        this.sessions.delete(session.id);
        this.sessionsBySocket.delete(session.socket);
        return true;
    }
    /**
     * Get session by ID
     */
    getSession(id) {
        return this.sessions.get(id);
    }
    /**
     * Get session by WebSocket
     */
    getSessionBySocket(socket) {
        return this.sessionsBySocket.get(socket);
    }
    /**
     * Get all sessions
     */
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    /**
     * Get connected sessions
     */
    getConnectedSessions() {
        return this.getAllSessions().filter(s => s.isConnected);
    }
    /**
     * Get player count
     */
    getPlayerCount() {
        return this.getConnectedSessions().length;
    }
    /**
     * Send message to a specific session
     */
    sendToSession(session, message) {
        if (!session.isConnected || session.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        try {
            session.socket.send(JSON.stringify(message));
        }
        catch (error) {
            console.error(`Failed to send message to ${session.id}:`, error);
        }
    }
    /**
     * Send binary data to a session
     */
    sendBinaryToSession(session, data) {
        if (!session.isConnected || session.socket.readyState !== WebSocket.OPEN) {
            return;
        }
        try {
            session.socket.send(data);
        }
        catch (error) {
            console.error(`Failed to send binary to ${session.id}:`, error);
        }
    }
    /**
     * Broadcast message to all connected sessions
     */
    broadcast(message, exclude) {
        const messageStr = JSON.stringify(message);
        for (const session of this.getConnectedSessions()) {
            if (session === exclude)
                continue;
            if (session.socket.readyState === WebSocket.OPEN) {
                try {
                    session.socket.send(messageStr);
                }
                catch (error) {
                    console.error(`Broadcast failed for ${session.id}:`, error);
                }
            }
        }
    }
    /**
     * Broadcast binary data to all connected sessions
     */
    broadcastBinary(data, exclude) {
        for (const session of this.getConnectedSessions()) {
            if (session === exclude)
                continue;
            if (session.socket.readyState === WebSocket.OPEN) {
                try {
                    session.socket.send(data);
                }
                catch (error) {
                    console.error(`Binary broadcast failed for ${session.id}:`, error);
                }
            }
        }
    }
    /**
     * Broadcast player joined
     */
    broadcastPlayerJoined(session) {
        const message = createMessage(MessageType.PLAYER_JOINED, {
            playerId: session.id,
            playerName: session.player.name
        });
        this.broadcast(message, session);
    }
    /**
     * Broadcast player left
     */
    broadcastPlayerLeft(session, reason = 'disconnected') {
        const message = createMessage(MessageType.PLAYER_LEFT, {
            playerId: session.id,
            reason
        });
        this.broadcast(message, session);
    }
    /**
     * Broadcast chat message
     */
    broadcastChat(session, text) {
        const message = createMessage(MessageType.CHAT_MESSAGE, {
            playerId: session.id,
            playerName: session.player.name,
            message: text
        });
        this.broadcast(message);
    }
    /**
     * Broadcast system message
     */
    broadcastSystemMessage(text, level = 'info') {
        const message = createMessage(MessageType.SYSTEM_MESSAGE, {
            message: text,
            level
        });
        this.broadcast(message);
    }
    /**
     * Update ping for a session
     */
    updatePing(session, clientTime) {
        const now = Date.now();
        session.latency = now - clientTime;
        session.lastPing = now;
        return session.latency;
    }
    /**
     * Check for timed out sessions
     */
    checkTimeouts(timeoutMs = 30000) {
        const now = Date.now();
        const timedOut = [];
        for (const session of this.getAllSessions()) {
            if (now - session.lastPing > timeoutMs) {
                timedOut.push(session);
                session.isConnected = false;
            }
        }
        return timedOut;
    }
    /**
     * Get all player states for network sync
     */
    getPlayerStates() {
        return this.getConnectedSessions().map(s => s.player.toNetworkState());
    }
    /**
     * Apply input to a player
     */
    applyPlayerInput(session, input, dt) {
        session.player.applyInput(input, dt);
        session.lastInputSequence = input.sequence;
    }
    /**
     * Spawn player on a body
     */
    spawnPlayerOnBody(session, body) {
        session.player.spawnOnBody(body);
    }
}
//# sourceMappingURL=SessionManager.js.map