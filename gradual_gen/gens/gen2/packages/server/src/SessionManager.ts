/**
 * Player Session Management
 */

import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import {
  Player,
  type PlayerState,
  type PlayerInputState,
  type CelestialBody,
  type NetworkMessage,
  MessageType,
  createMessage,
  type PlayerJoinedMessage,
  type PlayerLeftMessage,
  type ChatMessageMessage,
  type SystemMessageMessage
} from '@space-sim/shared';

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
export class SessionManager {
  private sessions: Map<string, ClientSession> = new Map();
  private sessionsBySocket: Map<WebSocket, ClientSession> = new Map();

  /**
   * Create a new session for a connecting client
   */
  createSession(socket: WebSocket, playerName: string): ClientSession {
    const id = uuidv4();
    const player = new Player(id, playerName);

    const session: ClientSession = {
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
  removeSession(sessionOrId: ClientSession | string): boolean {
    const session = typeof sessionOrId === 'string' 
      ? this.sessions.get(sessionOrId) 
      : sessionOrId;

    if (!session) return false;

    this.sessions.delete(session.id);
    this.sessionsBySocket.delete(session.socket);

    return true;
  }

  /**
   * Get session by ID
   */
  getSession(id: string): ClientSession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Get session by WebSocket
   */
  getSessionBySocket(socket: WebSocket): ClientSession | undefined {
    return this.sessionsBySocket.get(socket);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): ClientSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get connected sessions
   */
  getConnectedSessions(): ClientSession[] {
    return this.getAllSessions().filter(s => s.isConnected);
  }

  /**
   * Get player count
   */
  getPlayerCount(): number {
    return this.getConnectedSessions().length;
  }

  /**
   * Send message to a specific session
   */
  sendToSession(session: ClientSession, message: NetworkMessage): void {
    if (!session.isConnected || session.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      session.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to ${session.id}:`, error);
    }
  }

  /**
   * Send binary data to a session
   */
  sendBinaryToSession(session: ClientSession, data: ArrayBuffer): void {
    if (!session.isConnected || session.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      session.socket.send(data);
    } catch (error) {
      console.error(`Failed to send binary to ${session.id}:`, error);
    }
  }

  /**
   * Broadcast message to all connected sessions
   */
  broadcast(message: NetworkMessage, exclude?: ClientSession): void {
    const messageStr = JSON.stringify(message);

    for (const session of this.getConnectedSessions()) {
      if (session === exclude) continue;

      if (session.socket.readyState === WebSocket.OPEN) {
        try {
          session.socket.send(messageStr);
        } catch (error) {
          console.error(`Broadcast failed for ${session.id}:`, error);
        }
      }
    }
  }

  /**
   * Broadcast binary data to all connected sessions
   */
  broadcastBinary(data: ArrayBuffer, exclude?: ClientSession): void {
    for (const session of this.getConnectedSessions()) {
      if (session === exclude) continue;

      if (session.socket.readyState === WebSocket.OPEN) {
        try {
          session.socket.send(data);
        } catch (error) {
          console.error(`Binary broadcast failed for ${session.id}:`, error);
        }
      }
    }
  }

  /**
   * Broadcast player joined
   */
  broadcastPlayerJoined(session: ClientSession): void {
    const message = createMessage<PlayerJoinedMessage>(MessageType.PLAYER_JOINED, {
      playerId: session.id,
      playerName: session.player.name
    });
    this.broadcast(message, session);
  }

  /**
   * Broadcast player left
   */
  broadcastPlayerLeft(session: ClientSession, reason: string = 'disconnected'): void {
    const message = createMessage<PlayerLeftMessage>(MessageType.PLAYER_LEFT, {
      playerId: session.id,
      reason
    });
    this.broadcast(message, session);
  }

  /**
   * Broadcast chat message
   */
  broadcastChat(session: ClientSession, text: string): void {
    const message = createMessage<ChatMessageMessage>(MessageType.CHAT_MESSAGE, {
      playerId: session.id,
      playerName: session.player.name,
      message: text
    });
    this.broadcast(message);
  }

  /**
   * Broadcast system message
   */
  broadcastSystemMessage(text: string, level: 'info' | 'warning' | 'error' | 'success' = 'info'): void {
    const message = createMessage<SystemMessageMessage>(MessageType.SYSTEM_MESSAGE, {
      message: text,
      level
    });
    this.broadcast(message);
  }

  /**
   * Update ping for a session
   */
  updatePing(session: ClientSession, clientTime: number): number {
    const now = Date.now();
    session.latency = now - clientTime;
    session.lastPing = now;
    return session.latency;
  }

  /**
   * Check for timed out sessions
   */
  checkTimeouts(timeoutMs: number = 30000): ClientSession[] {
    const now = Date.now();
    const timedOut: ClientSession[] = [];

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
  getPlayerStates(): PlayerState[] {
    return this.getConnectedSessions().map(s => s.player.toNetworkState());
  }

  /**
   * Apply input to a player
   */
  applyPlayerInput(session: ClientSession, input: PlayerInputState, dt: number): void {
    session.player.applyInput(input, dt);
    session.lastInputSequence = input.sequence;
  }

  /**
   * Spawn player on a body
   */
  spawnPlayerOnBody(session: ClientSession, body: CelestialBody): void {
    session.player.spawnOnBody(body);
  }
}
