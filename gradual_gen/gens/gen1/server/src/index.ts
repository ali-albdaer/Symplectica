/**
 * N-Body Space Simulator - Authoritative Server
 * 
 * Entry point for the headless game server
 * 
 * @module server
 */

import { getConfig } from './config.js';
import { GameServer } from './network.js';
import { loadPreset } from './presets/index.js';

async function main() {
  console.log('=================================================');
  console.log('  N-Body Space Simulator - Authoritative Server  ');
  console.log('=================================================');
  console.log('');
  
  const config = getConfig();
  
  console.log(`[Init] Server Name: ${config.serverName}`);
  console.log(`[Init] Universe Size: ${config.universeSize}`);
  console.log(`[Init] WebSocket Port: ${config.port}`);
  console.log(`[Init] Debug Mode: ${config.debug}`);
  console.log('');
  
  // Create server
  const server = new GameServer(config);
  
  // Load initial world
  const world = server.getWorld();
  
  if (config.worldFile) {
    console.log(`[Init] Loading world from: ${config.worldFile}`);
    // TODO: Load from file
  } else {
    console.log('[Init] Loading default preset: Sun-Earth-Moon');
    loadPreset(world, 'sun-earth-moon');
  }
  
  // Start server
  try {
    await server.start();
    
    console.log('');
    console.log('[Server] Ready! Waiting for connections...');
    console.log('');
    
    // Print stats every 30 seconds
    setInterval(() => {
      const stats = server.getStats();
      console.log(
        `[Stats] Tick: ${stats.tick} | ` +
        `Time: ${stats.time.toFixed(1)}s | ` +
        `Players: ${stats.playerCount}/${stats.authenticatedPlayers} | ` +
        `Bodies: ${stats.massiveBodyCount} | ` +
        `Energy Error: ${(stats.energy.maxRelativeError * 100).toExponential(2)}%`
      );
    }, 30000);
    
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
  
  // Handle shutdown
  process.on('SIGINT', async () => {
    console.log('\n[Server] Shutting down...');
    await server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n[Server] Shutting down...');
    await server.stop();
    process.exit(0);
  });
}

main().catch(console.error);
