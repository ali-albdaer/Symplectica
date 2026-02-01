/**
 * serialization.js - Scene Export/Import
 * 
 * Handles serialization and deserialization of the complete simulation state
 * to JSON format for save/load functionality.
 * 
 * Designed for:
 * - Complete state preservation
 * - Version compatibility
 * - Human-readable output
 * - Future network state synchronization
 */

import { getSimulation } from './simulation.js';
import { getState } from './state.js';

/**
 * Current serialization format version
 */
const FORMAT_VERSION = 1;

/**
 * Serialize the complete application state to JSON
 * @param {Object} options - Serialization options
 * @returns {string} JSON string
 */
export function serializeToJSON(options = {}) {
    const {
        includeUIState = true,
        prettyPrint = true,
    } = options;
    
    const simulation = getSimulation();
    const state = getState();
    
    const data = {
        version: FORMAT_VERSION,
        timestamp: Date.now(),
        simulation: simulation.serialize(),
    };
    
    if (includeUIState) {
        data.uiState = state.serializeUIState();
    }
    
    return prettyPrint 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
}

/**
 * Deserialize JSON and load into application state
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} Result with success status and any errors
 */
export function deserializeFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Validate version
        if (!data.version) {
            return { 
                success: false, 
                error: 'Invalid format: missing version' 
            };
        }
        
        if (data.version > FORMAT_VERSION) {
            return { 
                success: false, 
                error: `Unsupported version: ${data.version} (max supported: ${FORMAT_VERSION})` 
            };
        }
        
        // Load simulation state
        if (data.simulation) {
            const simulation = getSimulation();
            simulation.deserialize(data.simulation);
        }
        
        // Load UI state if present
        if (data.uiState) {
            const state = getState();
            state.deserializeUIState(data.uiState);
        }
        
        return { 
            success: true, 
            bodyCount: getSimulation().bodies.length,
            timestamp: data.timestamp
        };
        
    } catch (e) {
        return { 
            success: false, 
            error: `Parse error: ${e.message}` 
        };
    }
}

/**
 * Export scene to downloadable JSON file
 * @param {string} filename - Filename (without extension)
 */
export function exportToFile(filename = 'celestial_scene') {
    const json = serializeToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Import scene from file input
 * @param {File} file - File object from input
 * @returns {Promise<Object>} Result with success status
 */
export function importFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const result = deserializeFromJSON(e.target.result);
            if (result.success) {
                resolve(result);
            } else {
                reject(new Error(result.error));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Create a state snapshot for undo/redo or networking
 * @returns {Object} Minimal state snapshot
 */
export function createSnapshot() {
    const simulation = getSimulation();
    
    return {
        time: simulation.time,
        bodies: simulation.bodies.map(body => ({
            id: body.id,
            position: body.position.toObject(),
            velocity: body.velocity.toObject(),
        })),
    };
}

/**
 * Apply a state snapshot
 * @param {Object} snapshot - State snapshot
 */
export function applySnapshot(snapshot) {
    const simulation = getSimulation();
    
    simulation.time = snapshot.time;
    
    for (const bodySnapshot of snapshot.bodies) {
        const body = simulation.getBody(bodySnapshot.id);
        if (body) {
            body.position.set(
                bodySnapshot.position.x,
                bodySnapshot.position.y,
                bodySnapshot.position.z
            );
            body.velocity.set(
                bodySnapshot.velocity.x,
                bodySnapshot.velocity.y,
                bodySnapshot.velocity.z
            );
        }
    }
}

/**
 * Compute a hash of the current state (for determinism verification)
 * @returns {number} State hash
 */
export function computeStateHash() {
    const simulation = getSimulation();
    let hash = 0;
    
    // Simple hash combining positions and velocities
    for (const body of simulation.bodies) {
        hash ^= Math.floor(body.position.x * 1e-6) & 0xFFFFFFFF;
        hash ^= Math.floor(body.position.y * 1e-6) & 0xFFFFFFFF;
        hash ^= Math.floor(body.position.z * 1e-6) & 0xFFFFFFFF;
        hash ^= Math.floor(body.velocity.x * 1e-3) & 0xFFFFFFFF;
        hash ^= Math.floor(body.velocity.y * 1e-3) & 0xFFFFFFFF;
        hash ^= Math.floor(body.velocity.z * 1e-3) & 0xFFFFFFFF;
        hash = (hash << 5) - hash; // hash * 31
    }
    
    return hash >>> 0; // Ensure unsigned
}

export default {
    serializeToJSON,
    deserializeFromJSON,
    exportToFile,
    importFromFile,
    createSnapshot,
    applySnapshot,
    computeStateHash,
};
