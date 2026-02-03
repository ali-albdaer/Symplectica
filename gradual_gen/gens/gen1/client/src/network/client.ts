/**
 * Network Client
 * 
 * Handles WebSocket communication with the server
 * 
 * @module network
 */

import type {
  SerializedBody,
  SerializedPlayer,
  BodyId,
  PlayerInput
} from '@nbody/shared';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface NetworkCallbacks {
  onConnected: () => void;
  onDisconnected: (reason: string) => void;
  onError: (error: Error) => void;
  onWorldState: (tick: number, julianDate: number, bodies: SerializedBody[], players: SerializedPlayer[]) => void;
  onPlayerSpawned: (playerId: string, position: [number, number, number]) => void;
  onPlayerJoined: (player: SerializedPlayer) => void;
  onPlayerLeft: (playerId: string, name: string) => void;
  onPlayerUpdate: (player: SerializedPlayer) => void;
  onChatMessage: (senderId: string, text: string) => void;
  onIdentified: (playerId: string) => void;
}

export class NetworkClient {
  private socket: WebSocket | null = null;
  private callbacks: NetworkCallbacks;
  private inputSequence: number = 0;
  private lastPingSent: number = 0;
  private ping: number = 0;
  private pingInterval: number | null = null;
  
  constructor(callbacks: NetworkCallbacks) {
    this.callbacks = callbacks;
  }
  
  /**
   * Connect to server
   */
  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);
        
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
          this.socket?.close();
        }, 10000);
        
        this.socket.onopen = () => {
          console.log('[Network] WebSocket connected');
          clearTimeout(timeout);
          this.callbacks.onConnected();
          this.startPingInterval();
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('[Network] Failed to parse message:', e);
          }
        };
        
        this.socket.onclose = (event) => {
          console.log('[Network] Disconnected:', event.code, event.reason);
          this.stopPingInterval();
          this.callbacks.onDisconnected(event.reason || 'Connection closed');
        };
        
        this.socket.onerror = () => {
          console.error('[Network] WebSocket error');
          reject(new Error('Failed to connect to server'));
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.stopPingInterval();
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }
  
  /**
   * Start ping interval
   */
  private startPingInterval(): void {
    this.pingInterval = window.setInterval(() => {
      this.lastPingSent = Date.now();
      this.send({ type: 'ping', timestamp: this.lastPingSent });
    }, 5000);
  }
  
  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval !== null) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  /**
   * Handle incoming message
   */
  private handleMessage(message: Record<string, unknown>): void {
    const type = message.type as string;
    
    switch (type) {
      case 'pong':
        this.ping = Date.now() - this.lastPingSent;
        break;
        
      case 'identified':
        this.callbacks.onIdentified(message.playerId as string);
        break;
        
      case 'world-state': {
        const tick = message.tick as number;
        const julianDate = message.julianDate as number;
        const bodies = message.bodies as SerializedBody[];
        const players = message.players as SerializedPlayer[];
        this.callbacks.onWorldState(tick, julianDate, bodies, players);
        break;
      }
        
      case 'player-spawned':
        this.callbacks.onPlayerSpawned(
          message.playerId as string,
          message.position as [number, number, number]
        );
        break;
        
      case 'player-joined':
        this.callbacks.onPlayerJoined(message.player as SerializedPlayer);
        break;
        
      case 'player-left':
        this.callbacks.onPlayerLeft(
          message.playerId as string,
          message.name as string
        );
        break;
        
      case 'player-update':
        this.callbacks.onPlayerUpdate(message.player as SerializedPlayer);
        break;
        
      case 'chat':
        this.callbacks.onChatMessage(
          message.senderId as string,
          message.text as string
        );
        break;
    }
  }
  
  /**
   * Send message to server
   */
  private send(message: Record<string, unknown>): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
  
  /**
   * Identify with the server
   */
  identify(name: string): void {
    this.send({
      type: 'identify',
      name
    });
  }
  
  /**
   * Request spawn near a body
   */
  requestSpawn(bodyId: BodyId): void {
    this.send({
      type: 'spawn',
      bodyId
    });
  }
  
  /**
   * Send player input
   */
  sendInput(input: PlayerInput): void {
    this.inputSequence++;
    this.send({
      type: 'input',
      input,
      sequence: this.inputSequence
    });
  }
  
  /**
   * Send chat message
   */
  sendChat(text: string): void {
    this.send({
      type: 'chat',
      text
    });
  }
  
  /**
   * Get current ping
   */
  getPing(): number {
    return this.ping;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
