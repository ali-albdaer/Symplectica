/**
 * Project Odyssey - Client Entry Point
 * High-Fidelity Multiplayer N-Body Space Simulator
 */

import * as THREE from 'three';

// Core systems
import { CoordinateEngine } from './core/CoordinateEngine.js';
import { Renderer } from './core/Renderer.js';
import { GameLoop } from './core/GameLoop.js';
import { InputController } from './core/InputController.js';

// Entities
import { Ship, FlightMode } from './entities/Ship.js';

// Network
import { NetworkClient } from './network/NetworkClient.js';
import { ClientPrediction } from './network/Prediction.js';

// Shared
import { NBodySimulation } from '@shared/physics/nbody.js';
import { loadUniverse } from '@shared/universe/schema.js';
import { Vector3D } from '@shared/math/Vector3D.js';
import { DT } from '@shared/physics/constants.js';

// UI
import { HUD } from './ui/HUD.js';

// Import universe presets
import minimalPreset from '@shared/universe/presets/minimal.json';
import innerSolarPreset from '@shared/universe/presets/inner-solar.json';

/**
 * Main game client class
 */
class OdysseyClient {
  constructor() {
    // DOM
    this.container = document.getElementById('canvas-container');
    
    // Core systems
    this.coords = new CoordinateEngine();
    this.renderer = new Renderer(this.container, this.coords);
    this.input = new InputController(this.container);
    this.hud = new HUD();
    
    // Local simulation (for offline/prediction)
    this.simulation = new NBodySimulation();
    
    // Player ship
    this.ship = null;
    
    // Network
    this.network = new NetworkClient();
    this.prediction = new ClientPrediction();
    this.isOnline = false;
    
    // Universe presets
    this.universes = {
      'minimal': minimalPreset,
      'inner-solar': innerSolarPreset
    };
    this.currentUniverse = 'minimal';
    
    // Camera
    this.cameraDistance = 50;
    this.cameraTarget = new THREE.Vector3();
    
    // Timing
    this.localTick = 0;
    
    // Game loop
    this.gameLoop = new GameLoop({
      update: (dt) => this.update(dt),
      render: (alpha) => this.render(alpha),
      onSlowDown: (ticks) => console.warn(`[Loop] Physics can't keep up: ${ticks.toFixed(1)} ticks behind`)
    });
    
    this._setupCallbacks();
  }

  /**
   * Setup system callbacks
   * @private
   */
  _setupCallbacks() {
    // Input callbacks
    this.input.onToggleSAS = () => {
      if (this.ship) {
        const mode = this.ship.toggleFlightMode();
        this.hud.showNotification(`Flight Mode: ${mode.toUpperCase()}`);
      }
    };
    
    this.input.onTogglePause = () => {
      const paused = this.gameLoop.togglePause();
      this.hud.showNotification(paused ? 'Paused' : 'Resumed');
    };
    
    this.input.onZoom = (factor) => {
      this.cameraDistance /= factor;
      this.cameraDistance = Math.max(10, Math.min(1000, this.cameraDistance));
    };
    
    // HUD callbacks
    this.hud.onUniverseChange = (universeId) => {
      this.loadUniverse(universeId);
    };
    
    // Network callbacks
    this.network.onConnect = () => {
      this.isOnline = true;
      this.hud.showNotification('Connected to server', 'info');
    };
    
    this.network.onDisconnect = (reason) => {
      this.isOnline = false;
      this.hud.showNotification(`Disconnected: ${reason}`, 'warning');
    };
    
    this.network.onInit = (data) => {
      console.log('[Client] Initialized with player ID:', data.playerId);
      
      // Load universe from server
      if (data.universe && this.universes[data.universe]) {
        this.currentUniverse = data.universe;
        this.hud.setSelectedUniverse(data.universe);
      }
      
      // Sync simulation state
      if (data.state) {
        this.simulation.loadState(data.state);
      }
      
      // Update ship from server player data
      if (data.players && data.players[data.playerId]) {
        const playerData = data.players[data.playerId];
        this.ship.position = Vector3D.fromJSON(playerData.position);
        this.ship.velocity = Vector3D.fromJSON(playerData.velocity);
      }
    };
    
    this.network.onStateUpdate = (state) => {
      // Reconcile local ship with server
      if (state.players && state.players[this.network.playerId]) {
        const serverPlayerState = state.players[this.network.playerId];
        this.prediction.reconcile(
          serverPlayerState,
          state.tick,
          this.ship,
          this.simulation.massiveBodies,
          DT
        );
      }
    };
    
    this.network.onUniverseChanged = (data) => {
      this.currentUniverse = data.universe;
      this.hud.setSelectedUniverse(data.universe);
      
      if (data.state) {
        this.simulation.loadState(data.state);
        this._spawnShip();
      }
      
      this.prediction.clear();
      this.hud.showNotification(`Universe: ${data.universe}`, 'info');
    };
    
    this.network.onPlayerJoined = (player) => {
      this.hud.showNotification(`${player.name} joined`);
    };
    
    this.network.onPlayerLeft = (playerId) => {
      this.renderer.removeShipMesh(playerId);
    };
  }

  /**
   * Load a universe preset
   * @param {string} universeId
   */
  loadUniverse(universeId) {
    const schema = this.universes[universeId];
    if (!schema) {
      console.error(`Unknown universe: ${universeId}`);
      return;
    }
    
    this.currentUniverse = universeId;
    
    if (this.isOnline) {
      // Request server to change universe
      this.network.requestUniverseChange(universeId);
    } else {
      // Offline mode: load locally
      loadUniverse(schema, this.simulation);
      this._spawnShip();
      this.hud.showNotification(`Loaded: ${schema.name}`, 'info');
    }
  }

  /**
   * Spawn player ship
   * @private
   */
  _spawnShip() {
    // Create ship
    this.ship = new Ship('local-player', {
      name: 'Odyssey-1'
    });
    
    // Spawn in orbit around Earth (or first planet)
    const earth = this.simulation.getBody('earth');
    if (earth) {
      this.ship.spawnInOrbit(earth, 400000, Math.random() * Math.PI * 2);
      this.ship.soiBody = earth;
    } else {
      // Fallback position
      this.ship.position.set(1.5e11, 0, 0);
    }
    
    // Set initial camera focus
    this.coords.setFocus(null);
    this.coords.setOrigin(this.ship.position);
  }

  /**
   * Initialize and start the client
   */
  async init() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   PROJECT ODYSSEY - Space Simulator        ║');
    console.log('║   Phase 1-2: Foundation + Multiplayer      ║');
    console.log('╚════════════════════════════════════════════╝');
    
    // Load initial universe
    this.loadUniverse(this.currentUniverse);
    
    // Connect to server
    try {
      this.network.connect();
    } catch (e) {
      console.warn('[Client] Could not connect to server, running offline');
      this.hud.showNotification('Offline Mode', 'warning');
    }
    
    // Start game loop
    this.gameLoop.start();
    
    console.log('[Client] Initialized');
  }

  /**
   * Fixed timestep update (physics)
   * @param {number} dt - Timestep in seconds
   */
  update(dt) {
    this.localTick++;
    
    // Get input
    const inputState = this.input.update(dt);
    
    // Apply boost multiplier
    if (inputState.boost) {
      inputState.thrust *= 3;
      inputState.strafeX *= 3;
      inputState.strafeY *= 3;
    }
    
    // Update ship with input
    if (this.ship) {
      this.ship.setInput(inputState);
      this.ship.update(dt, this.simulation.massiveBodies);
      
      // Record for prediction
      this.prediction.recordInput(this.localTick, inputState, this.ship);
      
      // Send input to server
      if (this.isOnline) {
        this.network.sendInput(inputState);
      }
      
      // Update SOI
      const soi = this.simulation.findSOI(this.ship.position);
      if (soi && soi !== this.ship.soiBody) {
        this.ship.soiBody = soi;
        this.hud.showNotification(`Entered ${soi.name} SOI`);
      }
    }
    
    // Step local simulation (for celestial bodies)
    if (!this.isOnline) {
      this.simulation.step();
    }
  }

  /**
   * Render frame
   * @param {number} alpha - Interpolation factor
   */
  render(alpha) {
    // Update coordinate engine origin to ship position
    if (this.ship) {
      this.coords.setOrigin(this.ship.position);
    }
    
    // Get state to render (interpolated if online)
    const state = this.isOnline 
      ? this.network.getInterpolatedState(Date.now())
      : this.simulation.getState();
    
    // Update body meshes
    if (state && state.bodies) {
      for (const bodyData of state.bodies) {
        // Convert to Vector3D if needed
        const body = {
          ...bodyData,
          position: bodyData.position instanceof Vector3D 
            ? bodyData.position 
            : Vector3D.fromJSON(bodyData.position)
        };
        this.renderer.updateBodyMesh(body);
      }
    }
    
    // Update local ship mesh
    if (this.ship) {
      this.renderer.updateShipMesh({
        id: 'local-player',
        position: this.ship.position,
        rotation: this.ship.rotation,
        color: 0x00ff88
      });
    }
    
    // Update remote player ships
    for (const [id, player] of Object.entries(this.network.remotePlayers)) {
      this.renderer.updateShipMesh({
        id,
        position: Vector3D.fromJSON(player.position),
        rotation: player.rotation,
        color: player.color
      });
    }
    
    // Update camera (chase cam behind ship)
    if (this.ship) {
      // Calculate camera position behind and above ship
      const shipPos = this.renderer.bodyMeshes.get('local-player')?.position ||
                      this.renderer.shipMeshes.get('local-player')?.position;
      
      if (shipPos) {
        // Get ship forward direction
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.ship.rotation);
        
        // Camera behind and above
        const cameraOffset = new THREE.Vector3(
          -forward.x * this.cameraDistance,
          this.cameraDistance * 0.3,
          -forward.z * this.cameraDistance
        );
        
        this.renderer.camera.position.copy(shipPos).add(cameraOffset);
        this.cameraTarget.copy(shipPos);
        this.renderer.camera.lookAt(this.cameraTarget);
      }
    }
    
    // Render scene
    this.renderer.render(alpha);
    
    // Update HUD
    this._updateHUD();
  }

  /**
   * Update HUD elements
   * @private
   */
  _updateHUD() {
    if (this.ship) {
      this.hud.updateShipStats(this.ship);
      this.hud.updateSOI(this.ship.soiBody?.name || 'None');
    }
    
    this.hud.updateSimStats({
      time: this.simulation.time,
      bodyCount: this.simulation.bodies.size
    });
    
    this.hud.updateNetworkStats(this.network.getStats());
  }

  /**
   * Cleanup
   */
  dispose() {
    this.gameLoop.stop();
    this.network.disconnect();
    this.input.dispose();
    this.renderer.dispose();
  }
}

// Start the client
const client = new OdysseyClient();
client.init();

// Expose for debugging
window.odyssey = client;
