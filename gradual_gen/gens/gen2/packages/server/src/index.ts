/**
 * N-Body Space Simulator - Game Server
 * =====================================
 * Authoritative headless server for physics simulation.
 */

import { startServer } from './GameServer.js';
import { loadServerConfig } from './config.js';

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  N-Body Space Simulator - Authoritative Game Server');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  const config = loadServerConfig();
  
  console.log('Configuration:');
  console.log(`  Port: ${config.port}`);
  console.log(`  Max Players: ${config.maxPlayers}`);
  console.log(`  Default World: ${config.defaultWorld}`);
  console.log(`  Physics Tick Rate: 60 Hz`);
  console.log(`  Network Tick Rate: ${config.networkTickRate} Hz`);
  console.log('');

  try {
    const server = await startServer(config);

    // Handle shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down...');
      server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\nShutting down...');
      server.stop();
      process.exit(0);
    });

    // Status logging
    setInterval(() => {
      const status = server.getStatus();
      console.log(`[Status] Players: ${status.players}, Bodies: ${status.bodies}, Tick: ${status.tick}, Time: ${status.time.toFixed(1)}s, Scale: ${status.timeScale}x${status.paused ? ' (PAUSED)' : ''}`);
    }, 10000);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
