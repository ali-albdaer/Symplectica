/**
 * state.js - Central State Management
 * 
 * Provides a centralized state manager for the entire application.
 * Designed for:
 * - Single source of truth
 * - Deterministic state transitions
 * - Serialization-ready for networking
 * - Clear separation between physics state and UI state
 */

import { getSimulation } from './simulation.js';

/**
 * Application modes
 */
export const AppMode = {
    EDIT: 'edit',
    FREE_VIEW: 'freeview',
};

/**
 * Cursor states
 */
export const CursorState = {
    DEFAULT: 'default',
    GRAB: 'grab',
    GRABBING: 'grabbing',
    POINTER: 'pointer',
    CROSSHAIR: 'crosshair',
    LOCKED: 'locked',
};

/**
 * Central application state
 */
class AppState {
    constructor() {
        // ========== Mode State ==========
        /** @type {string} Current application mode */
        this.mode = AppMode.EDIT;
        
        /** @type {boolean} Whether pointer is locked (for free camera) */
        this.pointerLocked = false;

        // ========== UI State ==========
        /** @type {boolean} Whether UI is visible */
        this.uiVisible = true;
        
        /** @type {boolean} Whether help overlay is visible */
        this.helpVisible = false;
        
        /** @type {boolean} Whether settings panel is visible */
        this.settingsVisible = false;
        
        /** @type {string} Current cursor state */
        this.cursorState = CursorState.DEFAULT;
        
        /** @type {boolean} Whether mouse is over UI element */
        this.mouseOverUI = false;

        // ========== Selection State ==========
        /** @type {number|null} Currently selected body ID */
        this.selectedBodyId = null;
        
        /** @type {number|null} Body ID being hovered */
        this.hoveredBodyId = null;
        
        /** @type {number|null} Body being dragged */
        this.draggingBodyId = null;

        // ========== Spawn State ==========
        /** @type {string|null} Body type being spawned */
        this.spawningType = null;
        
        /** @type {Object|null} Spawn preview position */
        this.spawnPreviewPosition = null;

        // ========== Camera State ==========
        /** @type {Object} Edit mode camera state */
        this.editCamera = {
            x: 0,
            y: 0,
            zoom: 1,
            planeHeight: 0, // Y position of edit plane
        };
        
        /** @type {Object} Free view camera state */
        this.freeCamera = {
            position: { x: 0, y: 5e11, z: 5e11 },
            rotation: { x: -Math.PI / 4, y: 0, z: 0 },
        };

        // ========== Performance State ==========
        /** @type {number} Current FPS */
        this.fps = 0;
        
        /** @type {string} Current performance preset */
        this.performancePreset = 'medium';
        
        /** @type {boolean} Show trails */
        this.showTrails = true;
        
        /** @type {boolean} Show velocity vectors */
        this.showVelocityVectors = false;
        
        /** @type {boolean} Show grid */
        this.showGrid = true;

        // ========== Rendering Options ==========
        /** @type {boolean} Enable advanced effects */
        this.effectsEnabled = true;
        
        /** @type {number} Max trail points */
        this.maxTrailPoints = 200;

        // ========== Event Subscribers ==========
        /** @type {Map<string, Set<Function>>} Event listeners */
        this._listeners = new Map();
    }

    /**
     * Subscribe to state changes
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, callback) {
        return this.on(event, callback);
    }

    /**
     * Subscribe to state changes
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);
        
        return () => {
            this._listeners.get(event).delete(callback);
        };
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        const listeners = this._listeners.get(event);
        if (listeners) {
            for (const callback of listeners) {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in ${event} listener:`, e);
                }
            }
        }
    }

    // ========== Mode Management ==========

    /**
     * Set the application mode
     * @param {string} mode - New mode
     */
    setMode(mode) {
        if (mode === this.mode) return;
        
        const oldMode = this.mode;
        this.mode = mode;
        
        // Update cursor state based on mode
        if (mode === AppMode.FREE_VIEW) {
            this.cursorState = CursorState.LOCKED;
        } else {
            this.cursorState = CursorState.DEFAULT;
            this.pointerLocked = false;
        }
        
        // Clear dragging state on mode change
        this.draggingBodyId = null;
        this.spawningType = null;
        
        this.emit('modeChange', { oldMode, newMode: mode });
    }

    /**
     * Toggle between EDIT and FREE_VIEW modes
     * @returns {string} New mode
     */
    toggleMode() {
        const newMode = this.mode === AppMode.EDIT ? AppMode.FREE_VIEW : AppMode.EDIT;
        this.setMode(newMode);
        return this.mode;
    }

    // ========== Selection Management ==========

    /**
     * Select a body
     * @param {number|null} bodyId - Body ID to select, or null to deselect
     */
    selectBody(bodyId) {
        if (bodyId === this.selectedBodyId) return;
        
        const oldId = this.selectedBodyId;
        this.selectedBodyId = bodyId;
        
        // Update body selection state
        const sim = getSimulation();
        if (oldId !== null) {
            const oldBody = sim.getBody(oldId);
            if (oldBody) oldBody.isSelected = false;
        }
        if (bodyId !== null) {
            const newBody = sim.getBody(bodyId);
            if (newBody) newBody.isSelected = true;
        }
        
        this.emit('selectionChange', { oldId, newId: bodyId });
    }

    /**
     * Get the selected body
     * @returns {Body|null} Selected body or null
     */
    getSelectedBody() {
        if (this.selectedBodyId === null) return null;
        return getSimulation().getBody(this.selectedBodyId);
    }

    // ========== UI Management ==========

    /**
     * Toggle UI visibility
     * @returns {boolean} New visibility state
     */
    toggleUI() {
        this.uiVisible = !this.uiVisible;
        this.emit('uiVisibilityChange', this.uiVisible);
        return this.uiVisible;
    }

    /**
     * Toggle help visibility
     * @returns {boolean} New visibility state
     */
    toggleHelp() {
        this.helpVisible = !this.helpVisible;
        this.emit('helpVisibilityChange', this.helpVisible);
        return this.helpVisible;
    }

    /**
     * Toggle settings visibility
     * @returns {boolean} New visibility state
     */
    toggleSettings() {
        this.settingsVisible = !this.settingsVisible;
        this.emit('settingsVisibilityChange', this.settingsVisible);
        return this.settingsVisible;
    }

    /**
     * Set cursor state
     * @param {string} state - Cursor state
     */
    setCursor(state) {
        if (state === this.cursorState) return;
        this.cursorState = state;
        this.emit('cursorChange', state);
    }

    // ========== Drag and Drop ==========

    /**
     * Start dragging a body
     * @param {number} bodyId - Body ID to drag
     */
    startDrag(bodyId) {
        this.draggingBodyId = bodyId;
        this.setCursor(CursorState.GRABBING);
        this.emit('dragStart', bodyId);
    }

    /**
     * End dragging
     */
    endDrag() {
        const bodyId = this.draggingBodyId;
        this.draggingBodyId = null;
        this.setCursor(CursorState.DEFAULT);
        this.emit('dragEnd', bodyId);
    }

    /**
     * Check if currently dragging
     * @returns {boolean} True if dragging
     */
    isDragging() {
        return this.draggingBodyId !== null;
    }

    // ========== Spawning ==========

    /**
     * Start spawning a body type
     * @param {string} type - Body type to spawn
     */
    startSpawning(type) {
        this.spawningType = type;
        this.setCursor(CursorState.CROSSHAIR);
        this.emit('spawnStart', type);
    }

    /**
     * Cancel spawning
     */
    cancelSpawning() {
        this.spawningType = null;
        this.spawnPreviewPosition = null;
        this.setCursor(CursorState.DEFAULT);
        this.emit('spawnCancel', null);
    }

    /**
     * Check if currently spawning
     * @returns {boolean} True if spawning
     */
    isSpawning() {
        return this.spawningType !== null;
    }

    // ========== Serialization ==========

    /**
     * Get serializable UI state (not physics)
     * @returns {Object} Serializable state
     */
    serializeUIState() {
        return {
            mode: this.mode,
            performancePreset: this.performancePreset,
            showTrails: this.showTrails,
            showVelocityVectors: this.showVelocityVectors,
            showGrid: this.showGrid,
            effectsEnabled: this.effectsEnabled,
            editCamera: { ...this.editCamera },
            freeCamera: {
                position: { ...this.freeCamera.position },
                rotation: { ...this.freeCamera.rotation },
            },
        };
    }

    /**
     * Restore UI state from serialized data
     * @param {Object} data - Serialized UI state
     */
    deserializeUIState(data) {
        if (data.mode) this.mode = data.mode;
        if (data.performancePreset) this.performancePreset = data.performancePreset;
        if (data.showTrails !== undefined) this.showTrails = data.showTrails;
        if (data.showVelocityVectors !== undefined) this.showVelocityVectors = data.showVelocityVectors;
        if (data.showGrid !== undefined) this.showGrid = data.showGrid;
        if (data.effectsEnabled !== undefined) this.effectsEnabled = data.effectsEnabled;
        if (data.editCamera) Object.assign(this.editCamera, data.editCamera);
        if (data.freeCamera) {
            if (data.freeCamera.position) Object.assign(this.freeCamera.position, data.freeCamera.position);
            if (data.freeCamera.rotation) Object.assign(this.freeCamera.rotation, data.freeCamera.rotation);
        }
    }
}

// Singleton state instance
let stateInstance = null;

/**
 * Get the global application state
 * @returns {AppState} Global state
 */
export function getState() {
    if (!stateInstance) {
        stateInstance = new AppState();
    }
    return stateInstance;
}

/**
 * Initialize the global state (alias for getState for consistency)
 * @returns {AppState} Global state
 */
export function initState() {
    return getState();
}

/**
 * Reset the global state
 * @returns {AppState} New state instance
 */
export function resetState() {
    stateInstance = new AppState();
    return stateInstance;
}

export default {
    AppMode,
    CursorState,
    AppState,
    getState,
    initState,
    resetState,
};
