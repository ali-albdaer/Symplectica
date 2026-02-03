/**
 * Network Client
 * ==============
 * WebSocket client for connecting to the game server.
 * Handles message encoding/decoding and state synchronization.
 */

import {
  MessageType,
  NetworkMessage,
  decodeWorldState,
  WorldStateMessage,
  PlayerInputState,
  CelestialBodyDefinition,
  Vector3,
} from '@space-sim/shared';

export interface ServerConfig {
  host: string;
  port: number;
  secure: boolean;
}

export interface NetworkClientEvents {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onWorldState?: (state: WorldStateMessage) => void;
  onPlayerJoined?: (playerId: string, name: string) => void;
  onPlayerLeft?: (playerId: string) => void;
  onChat?: (playerId: string, playerName: string, message: string) => void;
  onBodyAdded?: (body: CelestialBodyDefinition) => void;
  onBodyRemoved?: (bodyId: string) => void;
  onSpawnConfirm?: (success: boolean, spawnPoint: Vector3) => void;
  onPing?: (latency: number) => void;
}

export class NetworkClient {
  private ws: WebSocket | null = null;
  private config: ServerConfig;
  private events: NetworkClientEvents;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  // Latency tracking
  private lastPingTime: number = 0;
  private latency: number = 0;
  private pingInterval: number | null = null;

  // Sequence numbers
  private inputSequence: number = 0;

  // Player info
  private playerId: string | null = null;
  private playerName: string = 'Player';

  constructor(config: ServerConfig, events: NetworkClientEvents = {}) {
    this.config = config;
    this.events = events;
  }

  /**
   * Connect to the server
   */
  async connect(playerName: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.playerName = playerName;

      const protocol = this.config.secure ? 'wss' : 'ws';
      const url = `${protocol}://${this.config.host}:${this.config.port}`;

      try {
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('Connected to server');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Send join message
          this.send({
            type: MessageType.JOIN,
            payload: { name: playerName },
          });

          // Start ping interval
          this.startPing();

          this.events.onConnect?.();
          resolve(true);
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.stopPing();

          const reason = event.reason || 'Connection closed';
          console.log('Disconnected:', reason);

          this.events.onDisconnect?.(reason);

          // Attempt reconnect
          this.attemptReconnect();

          resolve(false);
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.events.onError?.(new Error('WebSocket connection error'));
          resolve(false);
        };

        this.ws.onmessage = this.handleMessage.bind(this);
      } catch (error) {
        console.error('Failed to connect:', error);
        this.events.onError?.(error as Error);
        resolve(false);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Check if binary (world state)
      if (event.data instanceof ArrayBuffer) {
        const state = decodeWorldState(event.data);
        this.events.onWorldState?.(state);
        return;
      }

      // JSON message
      const message: NetworkMessage = JSON.parse(event.data);

      switch (message.type) {
        case MessageType.JOIN_ACK:
          this.playerId = message.payload.playerId;
          console.log('Joined as player:', this.playerId);
          break;

        case MessageType.PLAYER_JOINED:
          this.events.onPlayerJoined?.(
            message.payload.playerId,
            message.payload.name
          );
          break;

        case MessageType.PLAYER_LEFT:
          this.events.onPlayerLeft?.(message.payload.playerId);
          break;

        case MessageType.CHAT:
          this.events.onChat?.(
            message.payload.playerId,
            message.payload.playerName,
            message.payload.message
          );
          break;

        case MessageType.BODY_ADDED:
          this.events.onBodyAdded?.(message.payload.body);
          break;

        case MessageType.BODY_REMOVED:
          this.events.onBodyRemoved?.(message.payload.bodyId);
          break;

        case MessageType.SPAWN_CONFIRM:
          this.events.onSpawnConfirm?.(
            message.payload.success,
            message.payload.position
          );
          break;

        case MessageType.PONG:
          this.latency = performance.now() - this.lastPingTime;
          this.events.onPing?.(this.latency);
          break;

        case MessageType.ERROR:
          console.error('Server error:', message.payload.message);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
    }
  }

  /**
   * Send a message to the server
   */
  send(message: NetworkMessage): void {
    if (!this.ws || !this.isConnected) {
      console.warn('Cannot send: not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  /**
   * Send player input
   */
  sendInput(input: Omit<PlayerInputState, 'sequence'>): void {
    if (!this.isConnected) return;

    const fullInput: PlayerInputState = {
      ...input,
      sequence: this.inputSequence++,
    };

    this.send({
      type: MessageType.INPUT,
      payload: fullInput,
    });
  }

  /**
   * Send chat message
   */
  sendChat(message: string): void {
    this.send({
      type: MessageType.CHAT,
      payload: { message },
    });
  }

  /**
   * Request spawn at a specific body
   */
  requestSpawn(bodyId: string): void {
    this.send({
      type: MessageType.SPAWN_REQUEST,
      payload: { bodyId },
    });
  }

  /**
   * Add a celestial body (world builder mode)
   */
  addBody(body: CelestialBodyDefinition): void {
    this.send({
      type: MessageType.BODY_ADDED,
      payload: { body },
    });
  }

  /**
   * Remove a celestial body
   */
  removeBody(bodyId: string): void {
    this.send({
      type: MessageType.BODY_REMOVED,
      payload: { bodyId },
    });
  }

  /**
   * Start ping interval
   */
  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      if (this.isConnected) {
        this.lastPingTime = performance.now();
        this.send({ type: MessageType.PING, payload: {} });
      }
    }, 1000);
  }

  /**
   * Stop ping interval
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting reconnect in ${delay}ms...`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(this.playerName);
      }
    }, delay);
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.stopPing();

    if (this.ws) {
      this.send({ type: MessageType.LEAVE, payload: {} });
      this.ws.close();
      this.ws = null;
    }

    this.isConnected = false;
  }

  /**
   * Get connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get player ID
   */
  getPlayerId(): string | null {
    return this.playerId;
  }

  /**
   * Get current latency
   */
  getLatency(): number {
    return this.latency;
  }

  /**
   * Get input sequence number
   */
  getInputSequence(): number {
    return this.inputSequence;
  }
}
