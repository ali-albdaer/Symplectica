/**
 * Space Simulator Game Client
 * ===========================
 * Main client application that coordinates rendering, networking, and input.
 * 
 * Architecture:
 * - Three.js for WebGL rendering
 * - WebSocket for real-time server communication
 * - Client-side prediction with server reconciliation
 * - Floating origin for AU-scale rendering
 */

import * as THREE from 'three';
import {
  PhysicsEngine,
  CelestialBody,
  Player,
  PlayerMode,
  Vector3,
  PHYSICS_DT,
  AU,
  type WorldStateMessage,
  type CelestialBodyDefinition,
  getPresetWorld,
  GravityMethod,
  createPhysicsEngine,
} from '@space-sim/shared';

import { FloatingOriginCamera } from './rendering/FloatingOriginCamera';
import { CelestialRenderer } from './rendering/CelestialRenderer';
import { ProceduralStarfield } from './rendering/ProceduralStarfield';
import { InputManager } from './input/InputManager';
import { NetworkClient } from './network/NetworkClient';
import { UIManager } from './ui/UIManager';

export interface GameClientConfig {
  canvas: HTMLCanvasElement;
  serverHost: string;
  serverPort: number;
  offlineMode: boolean;
}

export class GameClient {
  private config: GameClientConfig;

  // Three.js
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: FloatingOriginCamera;

  // Rendering
  private celestialRenderer: CelestialRenderer;
  private starfield: ProceduralStarfield;

  // Game state
  private physics: PhysicsEngine | null = null;
  private player: Player | null = null;
  private localBodies: Map<string, CelestialBody> = new Map();

  // Input
  private input: InputManager;

  // Network
  private network: NetworkClient | null = null;

  // UI
  private ui: UIManager;

  // Timing
  private lastTime: number = 0;
  private accumulator: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;
  private fps: number = 60;

  // State
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  constructor(config: GameClientConfig) {
    this.config = config;

    // Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: config.canvas,
      antialias: true,
      logarithmicDepthBuffer: true, // Critical for AU-scale rendering
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);

    // Create camera
    this.camera = new FloatingOriginCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1e16
    );
    this.scene.add(this.camera.camera);

    // Create celestial renderer
    this.celestialRenderer = new CelestialRenderer(this.scene, this.camera);

    // Create starfield
    this.starfield = new ProceduralStarfield({
      seed: 12345,
      starCount: 15000,
      radius: 1e15,
    });
    this.scene.add(this.starfield.getMesh());

    // Initialize input
    this.input = new InputManager(config.canvas);
    this.input.onPauseToggle = () => this.togglePause();
    this.input.onChatToggle = () => this.toggleChat();

    // Initialize UI
    this.ui = new UIManager();
    this.ui.onConnect = (name) => this.handleConnect(name);
    this.ui.onSpawn = (bodyId) => this.handleSpawn(bodyId);
    this.ui.onChat = (message) => this.handleChatSend(message);
    this.ui.onResume = () => this.resume();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Setup network if not offline
    if (!config.offlineMode) {
      this.network = new NetworkClient(
        {
          host: config.serverHost,
          port: config.serverPort,
          secure: false,
        },
        {
          onConnect: () => this.onNetworkConnect(),
          onDisconnect: (reason) => this.onNetworkDisconnect(reason),
          onWorldState: (state) => this.onWorldState(state),
          onPlayerJoined: (id, name) => this.onPlayerJoined(id, name),
          onPlayerLeft: (id) => this.onPlayerLeft(id),
          onChat: (id, name, msg) => this.onChatReceived(id, name, msg),
          onBodyAdded: (body) => this.onBodyAdded(body),
          onBodyRemoved: (id) => this.onBodyRemoved(id),
          onSpawnConfirm: (success, pos) => this.onSpawnConfirm(success, pos),
          onPing: (latency) => this.onPing(latency),
        }
      );
    }
  }

  /**
   * Start the game
   */
  async start(): Promise<void> {
    console.log('Starting Space Simulator...');

    // Start UI in connection state
    if (this.config.offlineMode) {
      // Offline mode - start with default preset
      this.initializeOfflineMode();
    } else {
      this.ui.setState('connecting');
    }

    // Start game loop
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Initialize offline mode with a preset
   */
  private initializeOfflineMode(): void {
    console.log('Starting in offline mode...');

    // Create physics engine with solar system preset
    const preset = getPresetWorld('sun-earth-moon')!;
    this.physics = createPhysicsEngine({
      gravityMethod: GravityMethod.BARNES_HUT,
      barnesHutTheta: 0.5,
    });

    // Add bodies from preset
    for (const bodyDef of preset.bodies) {
      const body = new CelestialBody(bodyDef);
      this.physics.addBody(bodyDef);
      this.localBodies.set(body.id, body);
      this.celestialRenderer.addBody(body);
    }

    // Create player
    this.player = new Player('offline-player', 'Player');
    this.player.mode = PlayerMode.SPACE;

    // Spawn at Earth
    const earth = this.localBodies.get('earth');
    if (earth) {
      const spawnHeight = earth.radius + 10000; // 10km above surface
      this.player.position.set(
        earth.position.x + spawnHeight,
        earth.position.y,
        earth.position.z
      );
      this.camera.setWorldPosition(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z
      );
    }

    // Populate spawn selection for reference
    this.ui.populateSpawnSelection(preset.bodies);
    
    // Show controls then start playing
    this.ui.showControlsModal();
    this.ui.setState('playing');
  }

  /**
   * Main game loop
   */
  private gameLoop(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Cap delta time to prevent spiral of death
    const clampedDelta = Math.min(deltaTime, 0.1);

    // Update FPS counter
    this.frameCount++;
    this.fpsTime += deltaTime;
    if (this.fpsTime >= 1.0) {
      this.fps = this.frameCount / this.fpsTime;
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // Update game state
    if (!this.isPaused) {
      this.update(clampedDelta);
    }

    // Render
    this.render();

    // Update UI
    this.updateUI();

    // End frame input processing
    this.input.endFrame();

    // Request next frame
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    // Update starfield animation
    this.starfield.update(deltaTime);

    // Skip if not playing
    if (this.ui.getState() !== 'playing' && this.ui.getState() !== 'chat') {
      return;
    }

    // Process input
    this.processInput(deltaTime);

    // Update physics (offline mode only)
    if (this.config.offlineMode && this.physics) {
      this.accumulator += deltaTime;
      
      while (this.accumulator >= PHYSICS_DT) {
        this.physics.step(PHYSICS_DT);
        this.accumulator -= PHYSICS_DT;
      }

      // Update local bodies from physics
      for (const body of this.physics.getAllBodies()) {
        this.localBodies.set(body.id, body);
      }
    }

    // Update celestial renderer
    this.celestialRenderer.update();
  }

  /**
   * Process player input
   */
  private processInput(deltaTime: number): void {
    if (!this.player || !this.input.isLocked()) return;

    // Get mouse delta for camera rotation
    const mouseDelta = this.input.getMouseDelta();
    this.camera.rotate(-mouseDelta.x, -mouseDelta.y);

    // Get movement input
    const state = this.input.getState();
    const speed = state.boost ? 1e6 : 1e4; // 10 km/s or 1000 km/s with boost

    // Calculate movement direction
    const forward = this.camera.getForward();
    const right = this.camera.getRight();
    const up = this.camera.getUp();

    let moveX = 0, moveY = 0, moveZ = 0;

    if (state.forward) {
      moveX += forward.x * speed * deltaTime;
      moveY += forward.y * speed * deltaTime;
      moveZ += forward.z * speed * deltaTime;
    }
    if (state.backward) {
      moveX -= forward.x * speed * deltaTime;
      moveY -= forward.y * speed * deltaTime;
      moveZ -= forward.z * speed * deltaTime;
    }
    if (state.right) {
      moveX += right.x * speed * deltaTime;
      moveY += right.y * speed * deltaTime;
      moveZ += right.z * speed * deltaTime;
    }
    if (state.left) {
      moveX -= right.x * speed * deltaTime;
      moveY -= right.y * speed * deltaTime;
      moveZ -= right.z * speed * deltaTime;
    }
    if (state.up) {
      moveX += up.x * speed * deltaTime;
      moveY += up.y * speed * deltaTime;
      moveZ += up.z * speed * deltaTime;
    }
    if (state.down) {
      moveX -= up.x * speed * deltaTime;
      moveY -= up.y * speed * deltaTime;
      moveZ -= up.z * speed * deltaTime;
    }

    // Update player position
    this.player.position.x += moveX;
    this.player.position.y += moveY;
    this.player.position.z += moveZ;

    // Update camera position
    this.camera.setWorldPosition(
      this.player.position.x,
      this.player.position.y,
      this.player.position.z
    );

    // Send input to server
    if (this.network?.isConnectedToServer()) {
      const inputState = this.input.toPlayerInputState(
        this.network.getInputSequence()
      );
      this.network.sendInput(inputState);
    }

    // Handle scroll for FOV zoom
    const scroll = this.input.getScroll();
    if (scroll !== 0) {
      const currentFov = this.camera.camera.fov;
      const newFov = Math.max(10, Math.min(120, currentFov + scroll * 5));
      this.camera.setFOV(newFov);
    }
  }

  /**
   * Render the scene
   */
  private render(): void {
    // Move starfield with camera (always at camera position)
    this.starfield.setPosition(0, 0, 0);

    // Render scene
    this.renderer.render(this.scene, this.camera.camera);
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    if (this.ui.getState() !== 'playing' && this.ui.getState() !== 'chat') {
      return;
    }

    // Update position display
    if (this.player) {
      this.ui.updatePosition(
        this.player.position.x,
        this.player.position.y,
        this.player.position.z
      );

      // Calculate velocity magnitude
      const velMag = Math.sqrt(
        this.player.velocity.x ** 2 +
        this.player.velocity.y ** 2 +
        this.player.velocity.z ** 2
      );
      this.ui.updateVelocity(velMag);

      // Find nearest body and altitude
      let nearestDist = Infinity;
      let nearestBody: CelestialBody | null = null;

      for (const body of this.localBodies.values()) {
        const dx = body.position.x - this.player.position.x;
        const dy = body.position.y - this.player.position.y;
        const dz = body.position.z - this.player.position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestBody = body;
        }
      }

      if (nearestBody) {
        const altitude = nearestDist - nearestBody.radius;
        this.ui.updateAltitude(altitude, nearestBody.name);
      }
    }

    // Update diagnostics
    this.ui.updateDiagnostics(
      this.fps,
      this.network?.getLatency() ?? 0,
      this.localBodies.size,
      1 // TODO: Track player count
    );

    // Color array to hex helper
    const colorToHex = (c: [number, number, number]): number => {
      return (Math.floor(c[0] * 255) << 16) | (Math.floor(c[1] * 255) << 8) | Math.floor(c[2] * 255);
    };

    // Update minimap
    const minimapBodies = Array.from(this.localBodies.values()).map((body) => ({
      x: body.position.x,
      y: body.position.z, // Top-down view
      radius: body.radius,
      color: colorToHex(body.color),
    }));

    this.ui.updateMinimap(
      minimapBodies,
      this.player?.position.x ?? 0,
      this.player?.position.z ?? 0,
      AU / 10 // Scale: 0.1 AU per minimap width
    );
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.camera.setAspect(width / height);
  }

  /**
   * Handle connect button click
   */
  private async handleConnect(playerName: string): Promise<void> {
    if (this.network) {
      // Show loading state
      this.ui.setConnectButtonLoading(true);
      
      const success = await this.network.connect(playerName);
      
      this.ui.setConnectButtonLoading(false);
      
      if (!success) {
        this.ui.showConnectionError('Failed to connect to server. Is the server running?');
      }
    } else {
      // No network configured - shouldn't happen in online mode
      this.ui.showConnectionError('Network not configured');
    }
  }

  /**
   * Handle spawn selection
   */
  private handleSpawn(bodyId: string): void {
    if (this.network?.isConnectedToServer()) {
      this.network.requestSpawn(bodyId);
    } else if (this.config.offlineMode) {
      const body = this.localBodies.get(bodyId);
      if (body && this.player) {
        const spawnHeight = body.radius + 10000;
        this.player.position.set(
          body.position.x + spawnHeight,
          body.position.y,
          body.position.z
        );
        this.camera.setWorldPosition(
          this.player.position.x,
          this.player.position.y,
          this.player.position.z
        );
        this.ui.showControlsModal();
      }
    }
  }

  /**
   * Handle chat send
   */
  private handleChatSend(message: string): void {
    if (this.network?.isConnectedToServer()) {
      this.network.sendChat(message);
    }
    // Show own message immediately
    this.ui.addChatMessage('You', message);
  }

  /**
   * Toggle pause state
   */
  private togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /**
   * Pause the game
   */
  private pause(): void {
    this.isPaused = true;
    this.ui.setState('paused');
  }

  /**
   * Resume the game
   */
  private resume(): void {
    this.isPaused = false;
    this.ui.setState('playing');
    this.input.requestPointerLock();
  }

  /**
   * Toggle chat
   */
  private toggleChat(): void {
    if (this.ui.getState() === 'chat') {
      this.ui.setState('playing');
      this.input.requestPointerLock();
    } else if (this.ui.getState() === 'playing') {
      this.ui.setState('chat');
      this.ui.focusChat();
    }
  }

  // Network event handlers

  private onNetworkConnect(): void {
    console.log('Connected to server');
    this.ui.addChatMessage('System', 'Connected to server!', true);
    // Transition to spawn selection - server will send world state
  }

  private onNetworkDisconnect(reason: string): void {
    console.log('Disconnected:', reason);
    this.ui.addChatMessage('System', `Disconnected: ${reason}`, true);
  }

  private onWorldState(state: WorldStateMessage): void {
    console.log('onWorldState received, current UI state:', this.ui.getState());
    console.log('World:', state.worldName, 'Bodies:', state.bodies.length);
    
    // Initialize bodies from server state
    for (const bodyDef of state.bodies) {
      let body = this.localBodies.get(bodyDef.id);
      if (!body) {
        body = new CelestialBody(bodyDef);
        this.localBodies.set(body.id, body);
        this.celestialRenderer.addBody(body);
      } else {
        // Update existing body from definition
        body.position.set(bodyDef.position.x, bodyDef.position.y, bodyDef.position.z);
        body.velocity.set(bodyDef.velocity.x, bodyDef.velocity.y, bodyDef.velocity.z);
      }
    }

    // If first world state, show spawn selection
    if (this.ui.getState() === 'connecting') {
      console.log('Transitioning to spawn-select');
      this.ui.populateSpawnSelection(state.bodies);
      this.ui.setState('spawn-select');
      console.log('UI state after transition:', this.ui.getState());
    }
  }

  private onPlayerJoined(_playerId: string, name: string): void {
    this.ui.addChatMessage('System', `${name} joined the game`, true);
  }

  private onPlayerLeft(_playerId: string): void {
    this.ui.addChatMessage('System', `A player left the game`, true);
  }

  private onChatReceived(playerId: string, name: string, message: string): void {
    if (playerId !== this.network?.getPlayerId()) {
      this.ui.addChatMessage(name, message);
    }
  }

  private onBodyAdded(bodyDef: CelestialBodyDefinition): void {
    const body = new CelestialBody(bodyDef);
    this.localBodies.set(body.id, body);
    this.celestialRenderer.addBody(body);
  }

  private onBodyRemoved(bodyId: string): void {
    this.localBodies.delete(bodyId);
    this.celestialRenderer.removeBody(bodyId);
  }

  private onSpawnConfirm(success: boolean, position: Vector3): void {
    if (success && this.player) {
      this.player.position.copy(position);
      this.camera.setWorldPosition(position.x, position.y, position.z);
      this.ui.showControlsModal();
    } else {
      this.ui.addChatMessage('System', 'Failed to spawn', true);
    }
  }

  private onPing(_latency: number): void {
    // Latency updated, UI will reflect on next update
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.isRunning = false;
    this.network?.disconnect();
    this.celestialRenderer.dispose();
    this.starfield.dispose();
    this.renderer.dispose();
  }
}
