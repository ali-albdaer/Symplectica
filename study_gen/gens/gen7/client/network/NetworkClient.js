/**
 * Network Client
 * Handles connection to authoritative server with interpolation and prediction.
 * @module client/network/NetworkClient
 */

import { io } from 'socket.io-client';
import { Vector3D } from '@shared/math/Vector3D.js';

/**
 * @typedef {Object} NetworkState
 * @property {boolean} connected - Connection status
 * @property {number} ping - Round-trip time in ms
 * @property {number} playerCount - Number of connected players
 * @property {number} lastServerTick - Last received server tick
 */

/**
 * Network client with state synchronization
 */
export class NetworkClient {
  /**
   * @param {string} serverUrl - Server URL (e.g., 'http://localhost:3001')
   */
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    
    /** @type {import('socket.io-client').Socket|null} */
    this.socket = null;
    
    /** @type {boolean} */
    this.connected = false;
    
    /** @type {string|null} */
    this.playerId = null;
    
    /** @type {number} */
    this.ping = 0;
    
    /** @type {number} */
    this.lastPingTime = 0;
    
    /** @type {number} */
    this.pingInterval = null;
    
    /** @type {number} */
    this.lastServerTick = 0;
    
    /** @type {Object|null} */
    this.lastServerState = null;
    
    /** @type {Object} */
    this.remotePlayers = {};
    
    /** @type {number} */
    this.interpolationDelay = 100; // 100ms buffer for smooth interpolation
    
    /** @type {Array} */
    this.stateBuffer = [];
    
    /** @type {number} */
    this.maxBufferSize = 60;
    
    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onInit = null;
    this.onStateUpdate = null;
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onUniverseChanged = null;
  }

  /**
   * Connect to the server
   */
  connect() {
    console.log(`[Network] Connecting to ${this.serverUrl}...`);
    
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });
    
    this._setupEventHandlers();
  }

  /**
   * Setup socket event handlers
   * @private
   */
  _setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('[Network] Connected');
      this.connected = true;
      this._startPing();
      if (this.onConnect) this.onConnect();
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`[Network] Disconnected: ${reason}`);
      this.connected = false;
      this._stopPing();
      if (this.onDisconnect) this.onDisconnect(reason);
    });
    
    this.socket.on('init', (data) => {
      console.log('[Network] Received init:', data.universe);
      this.playerId = data.playerId;
      this.remotePlayers = data.players || {};
      delete this.remotePlayers[this.playerId]; // Remove self
      
      if (this.onInit) this.onInit(data);
    });
    
    this.socket.on('state', (state) => {
      this._handleStateUpdate(state);
    });
    
    this.socket.on('playerJoined', (data) => {
      console.log(`[Network] Player joined: ${data.player.id}`);
      this.remotePlayers[data.player.id] = data.player;
      if (this.onPlayerJoined) this.onPlayerJoined(data.player);
    });
    
    this.socket.on('playerLeft', (data) => {
      console.log(`[Network] Player left: ${data.playerId}`);
      delete this.remotePlayers[data.playerId];
      if (this.onPlayerLeft) this.onPlayerLeft(data.playerId);
    });
    
    this.socket.on('universeChanged', (data) => {
      console.log(`[Network] Universe changed: ${data.universe}`);
      // Clear state buffer on universe change
      this.stateBuffer = [];
      if (this.onUniverseChanged) this.onUniverseChanged(data);
    });
    
    this.socket.on('pong', (timestamp) => {
      this.ping = Date.now() - timestamp;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[Network] Connection error:', error.message);
    });
  }

  /**
   * Handle incoming state update
   * @private
   */
  _handleStateUpdate(state) {
    this.lastServerTick = state.tick;
    this.lastServerState = state;
    
    // Update remote players
    if (state.players) {
      for (const [id, playerData] of Object.entries(state.players)) {
        if (id === this.playerId) continue;
        this.remotePlayers[id] = playerData;
      }
    }
    
    // Add to interpolation buffer
    this.stateBuffer.push({
      timestamp: Date.now(),
      state: state
    });
    
    // Trim buffer
    while (this.stateBuffer.length > this.maxBufferSize) {
      this.stateBuffer.shift();
    }
    
    if (this.onStateUpdate) this.onStateUpdate(state);
  }

  /**
   * Start ping measurement
   * @private
   */
  _startPing() {
    this.pingInterval = setInterval(() => {
      if (this.connected) {
        this.socket.emit('ping', Date.now());
      }
    }, 1000);
  }

  /**
   * Stop ping measurement
   * @private
   */
  _stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send player input to server
   * @param {Object} input - Input state
   */
  sendInput(input) {
    if (!this.connected) return;
    
    this.socket.emit('input', {
      thrust: input.thrust || 0,
      strafeX: input.strafeX || 0,
      strafeY: input.strafeY || 0,
      pitch: input.pitch || 0,
      yaw: input.yaw || 0,
      roll: input.roll || 0
    });
  }

  /**
   * Request universe change
   * @param {string} universeId 
   */
  requestUniverseChange(universeId) {
    if (!this.connected) return;
    this.socket.emit('changeUniverse', universeId);
  }

  /**
   * Get interpolated state for rendering
   * Uses state buffer to render slightly in the past for smooth playback
   * @param {number} renderTime - Current render time (Date.now())
   * @returns {Object|null} Interpolated state
   */
  getInterpolatedState(renderTime) {
    const targetTime = renderTime - this.interpolationDelay;
    
    if (this.stateBuffer.length < 2) {
      return this.lastServerState;
    }
    
    // Find two states to interpolate between
    let before = null;
    let after = null;
    
    for (let i = 0; i < this.stateBuffer.length - 1; i++) {
      if (this.stateBuffer[i].timestamp <= targetTime &&
          this.stateBuffer[i + 1].timestamp >= targetTime) {
        before = this.stateBuffer[i];
        after = this.stateBuffer[i + 1];
        break;
      }
    }
    
    if (!before || !after) {
      // Use latest state if no interpolation range found
      return this.stateBuffer[this.stateBuffer.length - 1].state;
    }
    
    // Calculate interpolation factor
    const range = after.timestamp - before.timestamp;
    const alpha = range > 0 ? (targetTime - before.timestamp) / range : 0;
    
    // Interpolate body positions
    return this._interpolateStates(before.state, after.state, alpha);
  }

  /**
   * Interpolate between two states
   * @private
   */
  _interpolateStates(stateA, stateB, alpha) {
    const interpolated = {
      tick: stateB.tick,
      time: stateA.time + (stateB.time - stateA.time) * alpha,
      bodies: [],
      players: {}
    };
    
    // Interpolate bodies
    for (const bodyB of stateB.bodies) {
      const bodyA = stateA.bodies.find(b => b.id === bodyB.id);
      
      if (bodyA) {
        interpolated.bodies.push({
          ...bodyB,
          position: {
            x: bodyA.position.x + (bodyB.position.x - bodyA.position.x) * alpha,
            y: bodyA.position.y + (bodyB.position.y - bodyA.position.y) * alpha,
            z: bodyA.position.z + (bodyB.position.z - bodyA.position.z) * alpha
          }
        });
      } else {
        interpolated.bodies.push(bodyB);
      }
    }
    
    // Interpolate players
    for (const [id, playerB] of Object.entries(stateB.players || {})) {
      const playerA = stateA.players?.[id];
      
      if (playerA) {
        interpolated.players[id] = {
          ...playerB,
          position: {
            x: playerA.position.x + (playerB.position.x - playerA.position.x) * alpha,
            y: playerA.position.y + (playerB.position.y - playerA.position.y) * alpha,
            z: playerA.position.z + (playerB.position.z - playerA.position.z) * alpha
          }
        };
      } else {
        interpolated.players[id] = playerB;
      }
    }
    
    return interpolated;
  }

  /**
   * Get current network statistics
   * @returns {NetworkState}
   */
  getStats() {
    return {
      connected: this.connected,
      ping: this.ping,
      playerCount: Object.keys(this.remotePlayers).length + (this.connected ? 1 : 0),
      lastServerTick: this.lastServerTick
    };
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.socket) {
      this._stopPing();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }
}

export default NetworkClient;
