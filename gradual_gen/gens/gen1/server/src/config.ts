/**
 * Server Configuration
 * 
 * Environment-based configuration for the game server
 * 
 * @module config
 */

import { UNIVERSE_PRESETS, type UniverseSize, type PhysicsConfig } from '@nbody/shared';
import { DEFAULT_PHYSICS_CONFIG } from '@nbody/physics-core';

/**
 * Server configuration
 */
export interface ServerConfig {
  /** WebSocket server port */
  port: number;
  
  /** HTTP server port (for admin UI) */
  httpPort: number;
  
  /** Universe size preset */
  universeSize: UniverseSize;
  
  /** Physics configuration */
  physics: PhysicsConfig;
  
  /** Network tick rate (state broadcasts per second) */
  networkTickRate: number;
  
  /** Full state sync interval (seconds) */
  fullSyncInterval: number;
  
  /** Maximum pending inputs per player */
  maxPendingInputs: number;
  
  /** Server name */
  serverName: string;
  
  /** World file to load on startup */
  worldFile: string | null;
  
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Get configuration from environment variables
 */
export function getConfig(): ServerConfig {
  const universeSize = (process.env['UNIVERSE_SIZE'] as UniverseSize) || 'medium';
  const preset = UNIVERSE_PRESETS[universeSize];
  
  return {
    port: parseInt(process.env['PORT'] || '8080', 10),
    httpPort: parseInt(process.env['HTTP_PORT'] || '3000', 10),
    universeSize,
    physics: {
      ...DEFAULT_PHYSICS_CONFIG,
      barnesHutTheta: preset.barnesHutTheta,
      octreeMaxDepth: preset.octreeMaxDepth
    },
    networkTickRate: 20, // 20 Hz network updates (50ms)
    fullSyncInterval: 5, // Full state sync every 5 seconds
    maxPendingInputs: 60,
    serverName: process.env['SERVER_NAME'] || 'N-Body Space Simulator',
    worldFile: process.env['WORLD_FILE'] || null,
    debug: process.env['DEBUG'] === 'true'
  };
}

/**
 * Get limits for current universe size
 */
export function getUniverseLimits(size: UniverseSize) {
  return UNIVERSE_PRESETS[size];
}
