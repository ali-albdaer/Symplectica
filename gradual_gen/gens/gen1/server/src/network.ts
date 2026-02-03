/**
 * WebSocket Game Server
 * 
 * Handles client connections and message routing.
 * Implements authoritative server model with:
 * - State broadcasting at fixed rate
 * - Client input processing
 * - Player session management
 * 
 * @module network
 */

import { WebSocketServer, WebSocket, RawData } from 'ws';
import { v4 as uuid } from 'uuid';
import type {
  PlayerId,
  BodyId,
  NetworkMessage,
  PlayerInputMessage,
  PlayerInput,
  SerializedWorldState,
  StateDelta,
  MessageType
} from '@nbody/shared';

import { WorldManager } from './world.js';
import type { ServerConfig } from './config.js';

/**
 * Connected client session
 */
interface ClientSession {
  id: PlayerId;
  socket: WebSocket;
  name: string | null;
  authenticated: boolean;
  lastInputSequence: number;
  pendingInputs: PlayerInput[];
  lastPing: number;
  pingStart: number;
}

/**
 * Server message to send to clients
 */
interface ServerMessage {
  type: MessageType;
  timestamp: number;
  [key: string]: unknown;
}

/**
 * Game server handling network and simulation
 */
export class GameServer {
  private wss: WebSocketServer | null = null;
  private world: WorldManager;
  private config: ServerConfig;
  private clients: Map<PlayerId, ClientSession>;
  private running: boolean = false;
  
  // Timing
  private lastUpdate: number = 0;
  private lastNetworkTick: number = 0;
  private lastFullSync: number = 0;
  
  constructor(config: ServerConfig) {
    this.config = config;
    this.world = new WorldManager(config.physics, config.universeSize);
    this.clients = new Map();
  }
  
  /**
   * Start the server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.config.port });
        
        this.wss.on('connection', (socket, request) => {
          this.handleConnection(socket);
        });
        
        this.wss.on('error', (error) => {
          console.error('[Server] WebSocket error:', error);
          reject(error);
        });
        
        this.wss.on('listening', () => {
          console.log(`[Server] WebSocket server listening on port ${this.config.port}`);
          this.running = true;
          this.lastUpdate = Date.now();
          this.startGameLoop();
          resolve();
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Stop the server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.running = false;
      
      // Disconnect all clients
      for (const client of this.clients.values()) {
        client.socket.close(1000, 'Server shutting down');
      }
      this.clients.clear();
      
      if (this.wss) {
        this.wss.close(() => {
          console.log('[Server] WebSocket server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  /**
   * Handle new client connection
   */
  private handleConnection(socket: WebSocket): void {
    const clientId = uuid();
    
    const session: ClientSession = {
      id: clientId,
      socket,
      name: null,
      authenticated: false,
      lastInputSequence: 0,
      pendingInputs: [],
      lastPing: 0,
      pingStart: 0
    };
    
    this.clients.set(clientId, session);
    console.log(`[Server] Client connected: ${clientId}`);
    
    // Send initial world state
    this.sendToClient(session, {
      type: 'connect',
      timestamp: Date.now(),
      playerId: clientId,
      serverName: this.config.serverName,
      universeSize: this.config.universeSize
    });
    
    socket.on('message', (data) => {
      this.handleMessage(session, data);
    });
    
    socket.on('close', (code, reason) => {
      this.handleDisconnect(session, code, reason.toString());
    });
    
    socket.on('error', (error) => {
      console.error(`[Server] Client ${clientId} error:`, error);
    });
    
    // Start ping
    this.sendPing(session);
  }
  
  /**
   * Handle client message
   */
  private handleMessage(client: ClientSession, rawData: RawData): void {
    try {
      const message = JSON.parse(rawData.toString()) as Record<string, unknown>;
      const type = message.type as string;
      
      switch (type) {
        case 'ping':
          this.sendToClient(client, {
            type: 'pong',
            timestamp: Date.now()
          });
          break;
          
        case 'pong':
          client.lastPing = Date.now() - client.pingStart;
          const player = this.world.getPlayer(client.id);
          if (player) {
            player.ping = client.lastPing;
          }
          break;
          
        case 'identify':
          this.handleIdentify(client, message.name as string);
          break;
          
        case 'spawn':
          this.handleSpawn(client, message.bodyId as BodyId);
          break;
          
        case 'input':
          this.handlePlayerInput(client, message.input as PlayerInput, message.sequence as number);
          break;
          
        case 'chat':
          this.handleChatMessage(client, message.text as string);
          break;
          
        default:
          if (this.config.debug) {
            console.log(`[Server] Unknown message type: ${message.type}`);
          }
      }
    } catch (error) {
      console.error(`[Server] Failed to parse message from ${client.id}:`, error);
    }
  }
  
  /**
   * Handle player identification
   */
  private handleIdentify(client: ClientSession, name: string): void {
    client.name = name;
    client.authenticated = true;
    
    console.log(`[Server] Player identified: ${name} (${client.id})`);
    
    // Send confirmation
    this.sendToClient(client, {
      type: 'identified',
      timestamp: Date.now(),
      playerId: client.id
    });
    
    // Send initial world state
    this.sendWorldState(client);
  }
  
  /**
   * Handle spawn request
   */
  private handleSpawn(client: ClientSession, bodyId: BodyId): void {
    if (!client.authenticated || !client.name) {
      console.log(`[Server] Unauthenticated spawn request from ${client.id}`);
      return;
    }
    
    try {
      const player = this.world.addPlayer(client.id, client.name, bodyId);
      
      console.log(`[Server] Player spawned: ${client.name} near ${bodyId}`);
      
      // Send spawn confirmation
      this.sendToClient(client, {
        type: 'player-spawned',
        timestamp: Date.now(),
        playerId: client.id,
        position: [player.worldPosition.x, player.worldPosition.y, player.worldPosition.z]
      });
      
      // Notify other players
      this.broadcast({
        type: 'player-joined',
        timestamp: Date.now(),
        player: this.serializePlayer(player)
      }, client.id);
      
    } catch (error) {
      console.error(`[Server] Failed to spawn player:`, error);
    }
  }

  /**
   * Handle player input
   */
  private handlePlayerInput(client: ClientSession, input: PlayerInput, sequence: number): void {
    if (!client.authenticated) return;
    
    // Queue input for processing
    if (client.pendingInputs.length < this.config.maxPendingInputs) {
      client.pendingInputs.push(input);
      client.lastInputSequence = sequence;
    }
  }
  
  /**
   * Handle chat message
   */
  private handleChatMessage(client: ClientSession, text: string): void {
    if (!client.authenticated || !client.name) return;
    
    // Broadcast to all other clients (sender already showed it locally)
    this.broadcast({
      type: 'chat',
      timestamp: Date.now(),
      senderId: client.id,
      text
    }, client.id);
  }
  
  /**
   * Handle client disconnect
   */
  private handleDisconnect(client: ClientSession, code: number, reason: string): void {
    console.log(`[Server] Client disconnected: ${client.id} (${code}: ${reason})`);
    
    if (client.authenticated && client.name) {
      this.world.removePlayer(client.id);
      
      this.broadcast({
        type: 'player-left',
        timestamp: Date.now(),
        playerId: client.id,
        name: client.name
      });
    }
    
    this.clients.delete(client.id);
  }
  
  /**
   * Send ping to client
   */
  private sendPing(client: ClientSession): void {
    client.pingStart = Date.now();
    this.sendToClient(client, {
      type: 'ping',
      timestamp: Date.now()
    });
  }
  
  /**
   * Main game loop
   */
  private startGameLoop(): void {
    const loop = () => {
      if (!this.running) return;
      
      const now = Date.now();
      const dt = (now - this.lastUpdate) / 1000; // Convert to seconds
      this.lastUpdate = now;
      
      // Process pending inputs
      this.processInputs();
      
      // Update physics
      this.world.update(dt);
      
      // Network tick (20 Hz)
      const networkInterval = 1000 / this.config.networkTickRate;
      if (now - this.lastNetworkTick >= networkInterval) {
        this.sendStateDelta();
        this.lastNetworkTick = now;
      }
      
      // Full sync (every 5 seconds)
      const fullSyncInterval = this.config.fullSyncInterval * 1000;
      if (now - this.lastFullSync >= fullSyncInterval) {
        this.sendFullSync();
        this.lastFullSync = now;
        
        // Also ping all clients
        for (const client of this.clients.values()) {
          this.sendPing(client);
        }
      }
      
      // Schedule next tick
      setImmediate(loop);
    };
    
    loop();
  }
  
  /**
   * Process pending player inputs
   */
  private processInputs(): void {
    for (const client of this.clients.values()) {
      if (!client.authenticated) continue;
      
      const player = this.world.getPlayer(client.id);
      if (!player) continue;
      
      // Process all pending inputs
      while (client.pendingInputs.length > 0) {
        const input = client.pendingInputs.shift()!;
        this.applyInput(player, input);
      }
    }
  }
  
  /**
   * Apply player input to their state
   */
  private applyInput(player: ReturnType<WorldManager['getPlayer']>, input: PlayerInput): void {
    if (!player) return;
    
    // Basic movement (on-planet)
    const moveSpeed = 5; // m/s walking speed
    
    player.localVelocity.x = input.moveDirection[0] * moveSpeed * (input.sprint ? 2 : 1);
    player.localVelocity.y = input.moveDirection[1] * moveSpeed * (input.sprint ? 2 : 1);
    player.localVelocity.z = input.moveDirection[2] * moveSpeed * (input.sprint ? 2 : 1);
    
    // Jump (simplified - just adds upward velocity)
    if (input.jump) {
      // Would need proper collision detection
    }
    
    player.lastUpdate = input.timestamp;
  }
  
  /**
   * Send world state to a client
   */
  private sendWorldState(client: ClientSession): void {
    const bodies = this.world.getAllBodies();
    const players = this.world.getAllPlayers();
    
    this.sendToClient(client, {
      type: 'world-state',
      timestamp: Date.now(),
      tick: this.world.getTick(),
      julianDate: this.world.getTime(),
      bodies: bodies.map(b => this.serializeBody(b)),
      players: players.map(p => this.serializePlayer(p))
    });
  }
  
  /**
   * Send state delta to all clients
   */
  private sendStateDelta(): void {
    const bodies = this.world.getAllBodies();
    const players = this.world.getAllPlayers();
    
    const message: ServerMessage = {
      type: 'world-state',
      timestamp: Date.now(),
      tick: this.world.getTick(),
      julianDate: this.world.getTime(),
      bodies: bodies.map(b => this.serializeBody(b)),
      players: players.map(p => this.serializePlayer(p))
    };
    
    this.broadcast(message);
  }
  
  /**
   * Send full world state to all clients
   */
  private sendFullSync(): void {
    const bodies = this.world.getAllBodies();
    const players = this.world.getAllPlayers();
    
    const message: ServerMessage = {
      type: 'world-state',
      timestamp: Date.now(),
      tick: this.world.getTick(),
      julianDate: this.world.getTime(),
      bodies: bodies.map(b => this.serializeBody(b)),
      players: players.map(p => this.serializePlayer(p))
    };
    
    this.broadcast(message);
  }
  
  /**
   * Serialize body for network
   */
  private serializeBody(body: ReturnType<WorldManager['getAllBodies']>[number]) {
    return {
      id: body.core.id,
      name: body.core.name,
      mass: body.core.mass,
      radius: body.core.radius,
      celestialType: body.core.celestialType,
      parentId: body.core.parentId,
      position: [body.state.position.x, body.state.position.y, body.state.position.z] as [number, number, number],
      velocity: [body.state.velocity.x, body.state.velocity.y, body.state.velocity.z] as [number, number, number],
      rotation: body.state.rotation
    };
  }
  
  /**
   * Serialize player for network
   */
  private serializePlayer(player: NonNullable<ReturnType<WorldManager['getPlayer']>>) {
    return {
      id: player.id,
      name: player.name,
      currentBodyId: player.currentBodyId,
      position: [player.worldPosition.x, player.worldPosition.y, player.worldPosition.z] as [number, number, number],
      velocity: [player.worldVelocity.x, player.worldVelocity.y, player.worldVelocity.z] as [number, number, number],
      rotation: player.rotation,
      inVehicle: player.inVehicle,
      vehicleId: player.vehicleId
    };
  }
  
  /**
   * Send message to specific client
   */
  private sendToClient(client: ClientSession, message: ServerMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast message to all clients
   */
  private broadcast(message: ServerMessage, excludeId?: PlayerId): void {
    const data = JSON.stringify(message);
    
    for (const client of this.clients.values()) {
      if (client.id !== excludeId && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(data);
      }
    }
  }
  
  /**
   * Get world manager for direct access (presets, admin)
   */
  getWorld(): WorldManager {
    return this.world;
  }
  
  /**
   * Get server statistics
   */
  getStats() {
    return {
      connectedClients: this.clients.size,
      authenticatedPlayers: Array.from(this.clients.values()).filter(c => c.authenticated).length,
      ...this.world.getStats()
    };
  }
}
