/**
 * Game Server Configuration
 */

import { PhysicsConfig, GravityMethod, DEFAULT_PHYSICS_CONFIG } from '@space-sim/shared';

export interface ServerConfig {
  // Network
  port: number;
  adminPort: number;
  maxPlayers: number;
  tickRate: number; // Network tick rate in Hz

  // World
  defaultWorld: string;
  worldsDirectory: string;

  // Physics
  physics: PhysicsConfig;

  // Timing
  networkTickRate: number;
}

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3000,
  adminPort: 3001,
  maxPlayers: 32,
  tickRate: 20,

  defaultWorld: 'sun-earth-moon',
  worldsDirectory: './worlds',

  physics: DEFAULT_PHYSICS_CONFIG,

  networkTickRate: 20
};

/**
 * Load configuration from environment variables
 */
export function loadServerConfig(): ServerConfig {
  return {
    ...DEFAULT_SERVER_CONFIG,
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    adminPort: parseInt(process.env['ADMIN_PORT'] ?? '3001', 10),
    maxPlayers: parseInt(process.env['MAX_PLAYERS'] ?? '32', 10),
    defaultWorld: process.env['DEFAULT_WORLD'] ?? 'sun-earth-moon',
    worldsDirectory: process.env['WORLDS_DIR'] ?? './worlds'
  };
}
