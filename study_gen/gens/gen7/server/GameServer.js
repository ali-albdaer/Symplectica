/**
 * Authoritative Game Server
 * Runs headless N-body simulation and manages multiplayer state.
 * @module server/GameServer
 */

import { NBodySimulation } from '../shared/physics/nbody.js';
import { loadUniverse } from '../shared/universe/schema.js';
import { PHYSICS_HZ, DT, BodyType } from '../shared/physics/constants.js';
import { Vector3D } from '../shared/math/Vector3D.js';

// Import presets as JSON
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Main game server managing simulation and players
 */
export class GameServer {
  /**
   * @param {Object} io - Socket.IO server instance
   */
  constructor(io) {
    this.io = io;
    
    /** @type {NBodySimulation} */
    this.simulation = new NBodySimulation();
    
    /** @type {string} Current universe preset */
    this.currentUniverse = 'minimal';
    
    /** @type {Map<string, Object>} Connected players */
    this.players = new Map();
    
    /** @type {number} Physics interval ID */
    this.physicsInterval = null;
    
    /** @type {number} State broadcast interval ID */
    this.broadcastInterval = null;
    
    /** @type {number} Ticks per state broadcast */
    this.broadcastRate = 3; // Send state every 3 ticks (~20Hz)
    
    /** @type {number} Tick counter for broadcast */
    this.tickCounter = 0;
    
    /** @type {number} Server start time */
    this.startTime = Date.now();
    
    // Available universe presets
    this.universePresets = {
      'minimal': require('../shared/universe/presets/minimal.json'),
      'inner-solar': require('../shared/universe/presets/inner-solar.json')
    };
    
    this._setupSocketHandlers();
  }

  /**
   * Setup Socket.IO event handlers
   * @private
   */
  _setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[Server] Player connected: ${socket.id}`);
      
      // Create player
      const player = this._createPlayer(socket.id);
      this.players.set(socket.id, player);
      
      // Send initial state
      socket.emit('init', {
        playerId: socket.id,
        universe: this.currentUniverse,
        state: this.simulation.getState(),
        players: this._getPlayersState()
      });
      
      // Notify others
      socket.broadcast.emit('playerJoined', {
        player: this._serializePlayer(player)
      });
      
      // Handle player input
      socket.on('input', (input) => {
        this._handlePlayerInput(socket.id, input);
      });
      
      // Handle universe change request
      socket.on('changeUniverse', (universeId) => {
        if (this.universePresets[universeId]) {
          this._loadUniverse(universeId);
          this.io.emit('universeChanged', {
            universe: universeId,
            state: this.simulation.getState()
          });
        }
      });
      
      // Handle ping
      socket.on('ping', (timestamp) => {
        socket.emit('pong', timestamp);
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`[Server] Player disconnected: ${socket.id}`);
        this.players.delete(socket.id);
        this.simulation.removeBody(socket.id);
        this.io.emit('playerLeft', { playerId: socket.id });
      });
    });
  }

  /**
   * Create a new player
   * @private
   */
  _createPlayer(id) {
    // Spawn player in orbit around Earth
    const earth = this.simulation.getBody('earth');
    const spawnAltitude = 400000; // 400 km (ISS altitude)
    
    let position = new Vector3D();
    let velocity = new Vector3D();
    
    if (earth) {
      // Random angle in orbit
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = earth.radius + spawnAltitude;
      
      position.x = earth.position.x + orbitRadius * Math.cos(angle);
      position.y = earth.position.y;
      position.z = earth.position.z + orbitRadius * Math.sin(angle);
      
      // Orbital velocity
      const orbitalSpeed = NBodySimulation.calculateOrbitalVelocity(earth.mass, orbitRadius);
      velocity.x = earth.velocity.x - orbitalSpeed * Math.sin(angle);
      velocity.y = earth.velocity.y;
      velocity.z = earth.velocity.z + orbitalSpeed * Math.cos(angle);
    }
    
    const player = {
      id,
      name: `Player-${id.substring(0, 6)}`,
      type: BodyType.SHIP,
      mass: 10000,
      radius: 10,
      position,
      velocity,
      rotation: { x: 0, y: 0, z: 0 },
      input: { thrust: 0, strafeX: 0, strafeY: 0, pitch: 0, yaw: 0, roll: 0 },
      color: Math.random() * 0xffffff
    };
    
    // Add to simulation as passive body
    this.simulation.addBody({
      id: player.id,
      name: player.name,
      type: player.type,
      mass: player.mass,
      radius: player.radius,
      position: player.position,
      velocity: player.velocity
    });
    
    return player;
  }

  /**
   * Handle player input
   * @private
   */
  _handlePlayerInput(playerId, input) {
    const player = this.players.get(playerId);
    if (!player) return;
    
    // Update stored input
    player.input = {
      thrust: input.thrust || 0,
      strafeX: input.strafeX || 0,
      strafeY: input.strafeY || 0,
      pitch: input.pitch || 0,
      yaw: input.yaw || 0,
      roll: input.roll || 0
    };
  }

  /**
   * Serialize player for network
   * @private
   */
  _serializePlayer(player) {
    const body = this.simulation.getBody(player.id);
    return {
      id: player.id,
      name: player.name,
      position: body ? body.position.toJSON() : player.position.toJSON(),
      velocity: body ? body.velocity.toJSON() : player.velocity.toJSON(),
      rotation: player.rotation,
      color: player.color
    };
  }

  /**
   * Get all players state
   * @private
   */
  _getPlayersState() {
    const state = {};
    for (const [id, player] of this.players) {
      state[id] = this._serializePlayer(player);
    }
    return state;
  }

  /**
   * Load a universe preset
   * @private
   */
  _loadUniverse(universeId) {
    const schema = this.universePresets[universeId];
    if (!schema) {
      console.error(`[Server] Unknown universe: ${universeId}`);
      return;
    }
    
    this.currentUniverse = universeId;
    loadUniverse(schema, this.simulation);
    
    // Re-spawn all players
    for (const [id, player] of this.players) {
      const earth = this.simulation.getBody('earth');
      if (earth) {
        const angle = Math.random() * Math.PI * 2;
        const orbitRadius = earth.radius + 400000;
        
        player.position.x = earth.position.x + orbitRadius * Math.cos(angle);
        player.position.y = earth.position.y;
        player.position.z = earth.position.z + orbitRadius * Math.sin(angle);
        
        const orbitalSpeed = NBodySimulation.calculateOrbitalVelocity(earth.mass, orbitRadius);
        player.velocity.x = earth.velocity.x - orbitalSpeed * Math.sin(angle);
        player.velocity.y = earth.velocity.y;
        player.velocity.z = earth.velocity.z + orbitalSpeed * Math.cos(angle);
      }
      
      // Re-add to simulation
      this.simulation.addBody({
        id: player.id,
        name: player.name,
        type: player.type,
        mass: player.mass,
        radius: player.radius,
        position: player.position,
        velocity: player.velocity
      });
    }
    
    console.log(`[Server] Loaded universe: ${universeId}`);
  }

  /**
   * Physics tick
   * @private
   */
  _physicsTick() {
    // Apply player inputs before physics step
    for (const [id, player] of this.players) {
      const body = this.simulation.getBody(id);
      if (!body) continue;
      
      // Apply thrust (simplified - full implementation in client Ship class)
      const thrust = 50000; // 50 kN
      const rotThrust = 1000;
      
      // Forward thrust
      if (player.input.thrust !== 0) {
        body.velocity.x += Math.sin(player.rotation.y) * player.input.thrust * thrust / player.mass * DT;
        body.velocity.z += Math.cos(player.rotation.y) * player.input.thrust * thrust / player.mass * DT;
      }
      
      // Update rotation
      player.rotation.x += player.input.pitch * rotThrust / player.mass * DT;
      player.rotation.y += player.input.yaw * rotThrust / player.mass * DT;
      player.rotation.z += player.input.roll * rotThrust / player.mass * DT;
    }
    
    // Step simulation
    this.simulation.step();
    
    // Broadcast state periodically
    this.tickCounter++;
    if (this.tickCounter >= this.broadcastRate) {
      this.tickCounter = 0;
      this._broadcastState();
    }
  }

  /**
   * Broadcast state to all clients
   * @private
   */
  _broadcastState() {
    const state = {
      tick: this.simulation.tick,
      time: this.simulation.time,
      bodies: this.simulation.getState().bodies,
      players: this._getPlayersState()
    };
    
    this.io.emit('state', state);
  }

  /**
   * Start the server
   */
  start() {
    // Load default universe
    this._loadUniverse(this.currentUniverse);
    
    // Start physics loop
    const tickInterval = 1000 / PHYSICS_HZ;
    this.physicsInterval = setInterval(() => {
      this._physicsTick();
    }, tickInterval);
    
    console.log(`[Server] Started with ${PHYSICS_HZ}Hz physics`);
  }

  /**
   * Stop the server
   */
  stop() {
    if (this.physicsInterval) {
      clearInterval(this.physicsInterval);
      this.physicsInterval = null;
    }
    
    console.log('[Server] Stopped');
  }

  /**
   * Get server stats
   */
  getStats() {
    return {
      uptime: Date.now() - this.startTime,
      players: this.players.size,
      universe: this.currentUniverse,
      simulation: this.simulation.getStats()
    };
  }
}

export default GameServer;
