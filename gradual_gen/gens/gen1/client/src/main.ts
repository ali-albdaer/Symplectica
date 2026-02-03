/**
 * Main Client Entry Point
 * 
 * Wires together all client systems:
 * - Renderer (Three.js)
 * - Network (WebSocket)
 * - Input (Keyboard/Mouse)
 * - UI (DOM)
 * 
 * @module main
 */

import { Renderer } from './rendering/renderer';
import { NetworkClient } from './network/client';
import { InputManager } from './input/input-manager';
import { UIManager } from './ui/ui-manager';
import type { SerializedBody, SerializedPlayer } from '@nbody/shared';

// Application state
interface AppState {
  connected: boolean;
  spawned: boolean;
  localPlayerId: string | null;
  playerName: string;
  serverUrl: string;
  
  // Performance tracking
  frameCount: number;
  lastFpsUpdate: number;
  currentFps: number;
  
  // World state
  bodies: Map<string, SerializedBody>;
  players: Map<string, SerializedPlayer>;
  
  // Camera follow
  followBodyId: string | null;
  cameraDistance: number;
}

const state: AppState = {
  connected: false,
  spawned: false,
  localPlayerId: null,
  playerName: '',
  serverUrl: '',
  
  frameCount: 0,
  lastFpsUpdate: 0,
  currentFps: 60,
  
  bodies: new Map(),
  players: new Map(),
  
  followBodyId: null,
  cameraDistance: 50 // 50 meters default (third person view)
};

// Systems
let renderer: Renderer;
let network: NetworkClient;
let inputManager: InputManager;
let ui: UIManager;

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  console.log('🚀 N-Body Space Simulator Client');
  console.log('================================');
  
  // Initialize renderer
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  renderer = new Renderer(canvas);
  console.log('✓ Renderer initialized');
  
  // Initialize input manager (not yet active)
  inputManager = new InputManager(canvas);
  console.log('✓ Input manager initialized');
  
  // Initialize UI
  ui = new UIManager({
    onConnect: handleConnect,
    onSpawnSelect: handleSpawnSelect,
    onChatSend: handleChatSend
  });
  console.log('✓ UI manager initialized');
  
  // Show connect modal
  ui.showModal('connect');
  
  // Start render loop
  requestAnimationFrame(gameLoop);
  console.log('✓ Game loop started');
  
  // Handle window resize
  window.addEventListener('resize', () => {
    renderer.resize();
  });
  
  // Handle keyboard shortcuts
  window.addEventListener('keydown', handleGlobalKeyDown);
  
  console.log('');
  console.log('Waiting for connection...');
}

/**
 * Handle connection attempt
 */
async function handleConnect(name: string, serverUrl: string): Promise<void> {
  state.playerName = name;
  state.serverUrl = serverUrl;
  
  // Create network client
  network = new NetworkClient({
    onConnected: () => {
      console.log('✓ Connected to server');
      state.connected = true;
      
      // Identify ourselves
      network.identify(state.playerName);
    },
    
    onDisconnected: (reason) => {
      console.log(`✗ Disconnected: ${reason}`);
      state.connected = false;
      state.spawned = false;
      ui.showHUD(false);
      ui.showModal('connect');
      ui.addChatMessage(null, `Disconnected: ${reason}`, 'system', 'red');
    },
    
    onError: (error) => {
      console.error('Network error:', error);
    },
    
    onWorldState: handleWorldState,
    
    onPlayerSpawned: (playerId, position) => {
      if (playerId === state.localPlayerId) {
        console.log('✓ Player spawned at position:', position);
        state.spawned = true;
        inputManager.enable();
        ui.addChatMessage(null, 'Spawned! WASD to move, click to look around.', 'system', 'green');
      }
    },
    
    onPlayerJoined: (player) => {
      state.players.set(player.id, player);
      ui.addChatMessage(null, `${player.name} joined`, 'system');
    },
    
    onPlayerLeft: (playerId, name) => {
      state.players.delete(playerId);
      ui.addChatMessage(null, `${name} left`, 'system');
    },
    
    onPlayerUpdate: (player) => {
      state.players.set(player.id, player);
    },
    
    onChatMessage: (senderId, text) => {
      const player = state.players.get(senderId);
      const senderName = player?.name ?? 'Unknown';
      ui.addChatMessage(senderName, text);
    },
    
    onIdentified: (playerId) => {
      console.log('✓ Identified as player:', playerId);
      state.localPlayerId = playerId;
    }
  });
  
  // Connect
  await network.connect(serverUrl);
}

/**
 * Handle world state updates
 */
function handleWorldState(
  tick: number,
  julianDate: number,
  bodies: SerializedBody[],
  players: SerializedPlayer[]
): void {
  // First update - show spawn modal
  if (!state.spawned && state.localPlayerId) {
    ui.showModal('spawn');
    ui.populateSpawnGrid(bodies);
  }
  
  // Update bodies map
  state.bodies.clear();
  for (const body of bodies) {
    state.bodies.set(body.id, body);
  }
  
  // Update players map
  for (const player of players) {
    state.players.set(player.id, player);
  }
  
  // Update renderer
  renderer.updateBodies(bodies);
  
  // Update HUD
  ui.updateHUD({
    tick,
    julianDate
  });
  
  // Update ping
  const ping = network.getPing();
  ui.updateHUD({ ping });
}

/**
 * Handle spawn selection
 */
function handleSpawnSelect(bodyId: string): void {
  if (!network || !state.localPlayerId) return;
  
  state.followBodyId = bodyId;
  
  // Request spawn near this body
  network.requestSpawn(bodyId);
}

/**
 * Handle chat message send
 */
function handleChatSend(text: string): void {
  if (!network || !state.localPlayerId) return;
  network.sendChat(text);
  
  // Show own message immediately
  ui.addChatMessage(state.playerName, text);
}

/**
 * Handle global keyboard input
 */
function handleGlobalKeyDown(e: KeyboardEvent): void {
  // Don't handle when chat is open
  if (ui.isChatOpen()) return;
  
  switch (e.key) {
    case 'Enter':
    case 't':
    case 'T':
      if (state.spawned) {
        e.preventDefault();
        ui.openChatInput();
      }
      break;
      
    case 'Tab':
      // Toggle player list (future)
      e.preventDefault();
      break;
      
    case 'Escape':
      // Release pointer lock
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      break;
  }
}

/**
 * Main game loop
 */
let lastTime = 0;

function gameLoop(time: number): void {
  // Calculate delta time
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  
  // Update FPS counter
  state.frameCount++;
  if (time - state.lastFpsUpdate >= 1000) {
    state.currentFps = state.frameCount;
    state.frameCount = 0;
    state.lastFpsUpdate = time;
    
    if (state.spawned) {
      ui.updateHUD({ fps: state.currentFps });
    }
  }
  
  // Process input and send to server
  if (state.spawned && network) {
    inputManager.update(deltaTime);
    const input = inputManager.toPlayerInput();
    network.sendInput(input);
    
    // Update camera based on follow target
    if (state.followBodyId) {
      const body = state.bodies.get(state.followBodyId);
      if (body) {
        // Get local player
        const player = state.players.get(state.localPlayerId!);
        if (player) {
          // Update HUD with player info
          const velocityMag = Math.sqrt(
            player.velocity[0]**2 + 
            player.velocity[1]**2 + 
            player.velocity[2]**2
          );
          
          ui.updateHUD({
            position: player.position as [number, number, number],
            velocity: velocityMag,
            bodyName: body.name
          });
          
          // Update camera position relative to player
          const yaw = inputManager.getYaw();
          const pitch = inputManager.getPitch();
          
          // Calculate camera position (orbital around player)
          const dist = state.cameraDistance;
          
          // Spherical coordinates: camera orbits around player based on yaw/pitch
          // yaw = horizontal rotation, pitch = vertical angle
          const camX = dist * Math.cos(pitch) * Math.sin(yaw);
          const camY = dist * Math.sin(pitch);
          const camZ = dist * Math.cos(pitch) * Math.cos(yaw);
          
          const camOffset: [number, number, number] = [camX, camY, camZ];
          
          renderer.setCameraOffset(camOffset);
          // Camera origin is at player position
          renderer.setFollowTarget(player.position as [number, number, number]);
          // Camera looks at player (origin after setFollowTarget)
          renderer.lookAtOrigin();
        }
      }
    }
  }
  
  // Render
  renderer.render();
  
  // Continue loop
  requestAnimationFrame(gameLoop);
}

// Handle scroll for zoom
document.addEventListener('wheel', (e) => {
  if (!state.spawned) return;
  
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
  state.cameraDistance = Math.max(
    5,       // 5 meters min (close third person)
    Math.min(
      1e9,   // 1 million km max
      state.cameraDistance * zoomFactor
    )
  );
}, { passive: true });

// Start application
init().catch((error) => {
  console.error('Failed to initialize:', error);
});
