/**
 * Network Client
 * ==============
 * WebSocket client for connecting to the game server.
 * Handles message encoding/decoding and state synchronization.
 */

import {
  MessageType,
  type NetworkMessage,
  type JoinMessage,
  type JoinedMessage,
  type PlayerJoinedMessage,
  type PlayerLeftMessage,
  type ChatMessageMessage,
  type ErrorMessage,
  type PingMessage,
  type PongMessage,
  type BodyAddMessage,
  type BodyRemoveMessage,
  type WorldStateMessage,
  type PlayerInputMessage,
  type PlayerInputState,
  type PlayerStateMessage,
  type PlayerState,
  type CelestialBodyDefinition,
  type Vector3,
  decodeBodyStates,
  buildIdHashMap,
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
  onPlayerStateUpdate?: (players: PlayerState[]) => void;
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

  // ID hash map for binary decoding
  private idHashMap: Map<number, string> = new Map();

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
          const joinMsg: JoinMessage = {
            type: MessageType.JOIN,
            timestamp: Date.now(),
            playerName: playerName,
          };
          this.send(joinMsg);

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
      // Check if binary (body state updates)
      if (event.data instanceof ArrayBuffer) {
        const result = decodeBodyStates(event.data, this.idHashMap);
        // Handle binary state update - this is handled separately
        console.log('Received binary state update:', result.states.length, 'bodies');
        return;
      }

      // JSON message
      const message: NetworkMessage = JSON.parse(event.data);
      console.log('Received message:', message.type, message);

      switch (message.type) {
        case MessageType.JOINED: {
          const joined = message as JoinedMessage;
          this.playerId = joined.playerId;
          console.log('Joined as player:', this.playerId);
          break;
        }

        case MessageType.PLAYER_JOINED: {
          const pj = message as PlayerJoinedMessage;
          this.events.onPlayerJoined?.(pj.playerId, pj.playerName);
          break;
        }

        case MessageType.PLAYER_LEFT: {
          const pl = message as PlayerLeftMessage;
          this.events.onPlayerLeft?.(pl.playerId);
          break;
        }

        case MessageType.CHAT_MESSAGE: {
          const chat = message as ChatMessageMessage;
          this.events.onChat?.(chat.playerId, chat.playerName, chat.message);
          break;
        }

        case MessageType.BODY_ADD: {
          const bodyAdd = message as BodyAddMessage;
          this.events.onBodyAdded?.(bodyAdd.body);
          break;
        }

        case MessageType.BODY_REMOVE: {
          const bodyRemove = message as BodyRemoveMessage;
          this.events.onBodyRemoved?.(bodyRemove.bodyId);
          break;
        }

        case MessageType.WORLD_STATE: {
          const worldState = message as WorldStateMessage;
          // Build ID hash map for binary decoding
          this.idHashMap = buildIdHashMap(worldState.bodies.map(b => b.id));
          this.events.onWorldState?.(worldState);
          break;
        }

        case MessageType.PLAYER_STATE: {
          const playerState = message as PlayerStateMessage;
          this.events.onPlayerStateUpdate?.(playerState.players);
          break;
        }

        case MessageType.PONG: {
          const pong = message as PongMessage;
          this.latency = performance.now() - pong.clientTime;
          this.events.onPing?.(this.latency);
          break;
        }

        case MessageType.ERROR: {
          const err = message as ErrorMessage;
          console.error('Server error:', err.message);
          break;
        }

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
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send: not connected, readyState:', this.ws?.readyState);
      return;
    }

    try {
      const json = JSON.stringify(message);
      console.log('Sending message:', message.type, json.substring(0, 100));
      this.ws.send(json);
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

    const msg: PlayerInputMessage = {
      type: MessageType.PLAYER_INPUT,
      timestamp: Date.now(),
      playerId: this.playerId || '',
      input: fullInput,
    };
    this.send(msg);
  }

  /**
   * Send chat message
   */
  sendChat(text: string): void {
    const msg: ChatMessageMessage = {
      type: MessageType.CHAT_MESSAGE,
      timestamp: Date.now(),
      playerId: this.playerId || '',
      playerName: this.playerName,
      message: text,
    };
    this.send(msg);
  }

  /**
   * Request spawn at a specific body
   */
  requestSpawn(_bodyId: string): void {
    // TODO: Implement spawn request message type when added to protocol
    console.log('Spawn request not yet implemented');
  }

  /**
   * Add a celestial body (world builder mode)
   */
  addBody(body: CelestialBodyDefinition): void {
    const msg: BodyAddMessage = {
      type: MessageType.BODY_ADD,
      timestamp: Date.now(),
      body,
    };
    this.send(msg);
  }

  /**
   * Remove a celestial body
   */
  removeBody(bodyId: string): void {
    const msg: BodyRemoveMessage = {
      type: MessageType.BODY_REMOVE,
      timestamp: Date.now(),
      bodyId,
    };
    this.send(msg);
  }

  /**
   * Start ping interval
   */
  private startPing(): void {
    this.pingInterval = window.setInterval(() => {
      if (this.isConnected) {
        this.lastPingTime = performance.now();
        const msg: PingMessage = {
          type: MessageType.PING,
          timestamp: Date.now(),
          clientTime: this.lastPingTime,
        };
        this.send(msg);
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
