/**
 * N-Body Physics TypeScript API
 * 
 * This module provides a high-level TypeScript interface to the Rust WASM physics core.
 * All units are SI: meters (m), kilograms (kg), seconds (s).
 */

// Re-export WASM types (will be available after wasm-pack build)
export * from './types';
export * from './simulation';
export * from './loader';
export * from './constants';
export * from './prng';
