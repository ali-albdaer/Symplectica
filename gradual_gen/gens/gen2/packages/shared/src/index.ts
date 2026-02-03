/**
 * @space-sim/shared
 * ==================
 * Isomorphic TypeScript package for N-Body Space Simulator.
 * Used by both server and client.
 * 
 * All units are SI:
 * - Distance: meters (m)
 * - Mass: kilograms (kg)
 * - Time: seconds (s)
 * - Velocity: m/s
 * - Acceleration: m/s²
 */

// Constants
export * from './constants.js';

// Math utilities
export * from './math/index.js';

// Celestial bodies
export * from './bodies/index.js';

// Physics engine
export * from './physics/index.js';

// Networking
export * from './network/index.js';

// Player
export * from './player/index.js';
