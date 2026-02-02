/**
 * Game Server Entry Point
 * Runs headless authoritative N-body simulation.
 */

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { GameServer } from './GameServer.js';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }
  
  // Stats endpoint
  if (req.url === '/stats') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(gameServer.getStats()));
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Create game server
const gameServer = new GameServer(io);

// Start server
httpServer.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║     PROJECT ODYSSEY - Game Server          ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║  Port: ${PORT}                                 ║`);
  console.log(`║  Physics: 60Hz Velocity-Verlet             ║`);
  console.log(`║  Universe: ${gameServer.currentUniverse.padEnd(26)}     ║`);
  console.log('╚════════════════════════════════════════════╝');
  
  gameServer.start();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down...');
  gameServer.stop();
  httpServer.close(() => {
    console.log('[Server] Goodbye!');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  gameServer.stop();
  process.exit(1);
});

export { gameServer };
