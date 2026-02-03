/**
 * Space Simulator Client Entry Point
 * ===================================
 * High-Fidelity Multiplayer N-Body Space Simulator
 */

import { GameClient } from './GameClient';

// Get configuration from URL params or defaults
const params = new URLSearchParams(window.location.search);
const serverHost = params.get('host') || 'localhost';
const serverPort = parseInt(params.get('port') || '8080', 10);
const offlineMode = params.get('offline') === 'true';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Space Simulator initializing...');
  console.log(`Server: ${serverHost}:${serverPort}`);
  console.log(`Offline mode: ${offlineMode}`);

  // Get canvas element
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Create game client
  const game = new GameClient({
    canvas,
    serverHost,
    serverPort,
    offlineMode,
  });

  // Start the game
  await game.start();

  // Handle page unload
  window.addEventListener('beforeunload', () => {
    game.stop();
  });

  // Expose to console for debugging
  (window as any).game = game;

  console.log('Space Simulator started!');
  console.log('Controls: WASD to move, Space/Shift for up/down, Ctrl for boost');
  console.log('Press ESC to pause, T or Enter for chat');
});
