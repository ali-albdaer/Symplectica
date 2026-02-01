/**
 * input.js - Centralized Input Handling
 * 
 * Manages all keyboard and mouse input, providing mode-aware control.
 * 
 * Key responsibilities:
 * - Keyboard shortcuts and bindings
 * - Mouse events (clicks, drags, wheel)
 * - Pointer lock management
 * - Input state tracking
 * - Preventing cross-mode input conflicts
 */

import { getState, AppMode, CursorState } from './state.js';
import { getSimulation } from './simulation.js';
import { getRenderer } from './renderer.js';
import { getCameraController } from './camera.js';
import { syncBodyVisuals } from './bodyVisuals.js';
import { Body } from './body.js';
import { getDefaultBodyParams, loadPreset } from './presets.js';
import { exportToFile } from './serialization.js';

/**
 * Input manager class
 */
export class InputManager {
    constructor() {
        /** @type {HTMLElement} Canvas element */
        this.canvas = null;
        
        /** @type {boolean} Whether input is initialized */
        this.initialized = false;
        
        // ========== Mouse State ==========
        /** @type {number} Last mouse X position */
        this.mouseX = 0;
        
        /** @type {number} Last mouse Y position */
        this.mouseY = 0;
        
        /** @type {boolean} Is mouse button pressed */
        this.mouseDown = false;
        
        /** @type {number} Mouse button that is pressed */
        this.mouseButton = -1;
        
        /** @type {Object|null} Drag start info */
        this.dragStart = null;
        
        // ========== Callbacks ==========
        /** @type {Function|null} Called on UI update needed */
        this.onUIUpdate = null;
        
        /** @type {Function|null} Called on error */
        this.onError = null;
        
        /** @type {Function|null} Called on warning */
        this.onWarning = null;
        
        // ========== Key Bindings ==========
        this.keyBindings = {
            // Simulation control
            'KeyT': () => this._toggleSimulation(),
            'Period': () => this._singleStep(),
            'KeyR': () => this._resetSimulation(),
            
            // Mode switching
            'KeyV': () => this._toggleMode(),
            
            // UI toggles
            'KeyH': () => this._toggleUI(),
            'KeyG': () => this._toggleSettings(),
            'Slash': () => this._toggleHelp(),  // ? key
            
            // Camera
            'KeyC': () => this._recenterCamera(),
            
            // Performance presets
            'Digit1': () => this._setPerformancePreset('low'),
            'Digit2': () => this._setPerformancePreset('medium'),
            'Digit3': () => this._setPerformancePreset('high'),
            'Digit4': () => this._setPerformancePreset('ultra'),
            
            // Body management
            'Delete': () => this._deleteSelected(),
            'Backspace': () => this._deleteSelected(),
            
            // Escape - release pointer lock
            'Escape': () => this._handleEscape(),
        };
        
        // Movement keys (handled separately for continuous input)
        this.movementKeys = {
            'KeyW': 'forward',
            'KeyS': 'backward',
            'KeyA': 'left',
            'KeyD': 'right',
            'Space': 'up',
            'ShiftLeft': 'down',
            'ShiftRight': 'down',
        };
        
        // Bound event handlers (for removal)
        this._boundHandlers = {};
    }

    /**
     * Initialize input handling
     * @param {HTMLCanvasElement} canvas - The canvas element
     */
    init(canvas) {
        this.canvas = canvas;
        
        // Bind event handlers
        this._boundHandlers = {
            keydown: (e) => this._onKeyDown(e),
            keyup: (e) => this._onKeyUp(e),
            mousedown: (e) => this._onMouseDown(e),
            mouseup: (e) => this._onMouseUp(e),
            mousemove: (e) => this._onMouseMove(e),
            wheel: (e) => this._onWheel(e),
            contextmenu: (e) => e.preventDefault(),
            pointerlockchange: () => this._onPointerLockChange(),
            pointerlockerror: () => this._onPointerLockError(),
        };
        
        // Add listeners
        document.addEventListener('keydown', this._boundHandlers.keydown);
        document.addEventListener('keyup', this._boundHandlers.keyup);
        canvas.addEventListener('mousedown', this._boundHandlers.mousedown);
        document.addEventListener('mouseup', this._boundHandlers.mouseup);
        document.addEventListener('mousemove', this._boundHandlers.mousemove);
        canvas.addEventListener('wheel', this._boundHandlers.wheel, { passive: false });
        canvas.addEventListener('contextmenu', this._boundHandlers.contextmenu);
        document.addEventListener('pointerlockchange', this._boundHandlers.pointerlockchange);
        document.addEventListener('pointerlockerror', this._boundHandlers.pointerlockerror);
        
        this.initialized = true;
    }

    /**
     * Dispose of event listeners
     */
    dispose() {
        if (!this.initialized) return;
        
        document.removeEventListener('keydown', this._boundHandlers.keydown);
        document.removeEventListener('keyup', this._boundHandlers.keyup);
        this.canvas.removeEventListener('mousedown', this._boundHandlers.mousedown);
        document.removeEventListener('mouseup', this._boundHandlers.mouseup);
        document.removeEventListener('mousemove', this._boundHandlers.mousemove);
        this.canvas.removeEventListener('wheel', this._boundHandlers.wheel);
        this.canvas.removeEventListener('contextmenu', this._boundHandlers.contextmenu);
        document.removeEventListener('pointerlockchange', this._boundHandlers.pointerlockchange);
        document.removeEventListener('pointerlockerror', this._boundHandlers.pointerlockerror);
        
        this.initialized = false;
    }

    // ========== Keyboard Handling ==========

    /**
     * Handle keydown event
     * @param {KeyboardEvent} e
     * @private
     */
    _onKeyDown(e) {
        const state = getState();
        
        // Don't handle input if typing in a text field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        
        // Check for action key bindings
        const action = this.keyBindings[e.code];
        if (action) {
            e.preventDefault();
            action();
            return;
        }
        
        // Check for movement keys
        const movementKey = this.movementKeys[e.code];
        if (movementKey) {
            e.preventDefault();
            getCameraController().setMovementKey(movementKey, true);
            return;
        }
    }

    /**
     * Handle keyup event
     * @param {KeyboardEvent} e
     * @private
     */
    _onKeyUp(e) {
        // Check for movement keys
        const movementKey = this.movementKeys[e.code];
        if (movementKey) {
            e.preventDefault();
            getCameraController().setMovementKey(movementKey, false);
        }
    }

    // ========== Mouse Handling ==========

    /**
     * Handle mousedown event
     * @param {MouseEvent} e
     * @private
     */
    _onMouseDown(e) {
        const state = getState();
        
        // Skip if over UI
        if (state.mouseOverUI) {
            return;
        }
        
        this.mouseDown = true;
        this.mouseButton = e.button;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        if (state.mode === AppMode.EDIT) {
            this._handleEditModeMouseDown(e);
        } else {
            this._handleFreeViewMouseDown(e);
        }
    }

    /**
     * Handle mouseup event
     * @param {MouseEvent} e
     * @private
     */
    _onMouseUp(e) {
        const state = getState();
        
        this.mouseDown = false;
        this.mouseButton = -1;
        
        if (state.mode === AppMode.EDIT) {
            this._handleEditModeMouseUp(e);
        }
        
        this.dragStart = null;
    }

    /**
     * Handle mousemove event
     * @param {MouseEvent} e
     * @private
     */
    _onMouseMove(e) {
        const state = getState();
        const camera = getCameraController();
        
        if (state.mode === AppMode.FREE_VIEW && state.pointerLocked) {
            // Use movement values for camera look
            camera.handleMouseMove(e.movementX, e.movementY);
        } else if (state.mode === AppMode.EDIT) {
            this._handleEditModeMouseMove(e);
        }
        
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    /**
     * Handle wheel event
     * @param {WheelEvent} e
     * @private
     */
    _onWheel(e) {
        const state = getState();
        
        if (state.mouseOverUI) {
            return;
        }
        
        e.preventDefault();
        getCameraController().handleScroll(e.deltaY);
    }

    // ========== Edit Mode Mouse Handling ==========

    /**
     * Handle mouse down in edit mode
     * @param {MouseEvent} e
     * @private
     */
    _handleEditModeMouseDown(e) {
        const state = getState();
        const renderer = getRenderer();
        const simulation = getSimulation();
        
        // Left click
        if (e.button === 0) {
            // Check if spawning
            if (state.isSpawning()) {
                this._spawnBodyAtMouse(e.clientX, e.clientY);
                return;
            }
            
            // Check for body selection
            const intersects = renderer.raycastBodies(e.clientX, e.clientY);
            
            if (intersects.length > 0) {
                // Find the body ID
                let bodyId = null;
                let obj = intersects[0].object;
                while (obj && !bodyId) {
                    if (obj.userData && obj.userData.bodyId !== undefined) {
                        bodyId = obj.userData.bodyId;
                    }
                    obj = obj.parent;
                }
                
                if (bodyId !== null) {
                    state.selectBody(bodyId);
                    
                    // Start dragging
                    this.dragStart = {
                        bodyId: bodyId,
                        startX: e.clientX,
                        startY: e.clientY,
                    };
                    state.startDrag(bodyId);
                    
                    if (this.onUIUpdate) this.onUIUpdate();
                    return;
                }
            }
            
            // Click on empty space - deselect
            state.selectBody(null);
            if (this.onUIUpdate) this.onUIUpdate();
        }
        
        // Middle click - start panning
        if (e.button === 1) {
            this.dragStart = {
                type: 'pan',
                startX: e.clientX,
                startY: e.clientY,
            };
            state.setCursor(CursorState.GRABBING);
        }
    }

    /**
     * Handle mouse up in edit mode
     * @param {MouseEvent} e
     * @private
     */
    _handleEditModeMouseUp(e) {
        const state = getState();
        
        if (state.isDragging()) {
            state.endDrag();
        }
        
        if (this.dragStart && this.dragStart.type === 'pan') {
            state.setCursor(CursorState.DEFAULT);
        }
    }

    /**
     * Handle mouse move in edit mode
     * @param {MouseEvent} e
     * @private
     */
    _handleEditModeMouseMove(e) {
        const state = getState();
        const renderer = getRenderer();
        const simulation = getSimulation();
        
        // Handle body dragging
        if (state.isDragging() && this.dragStart) {
            const body = simulation.getBody(state.draggingBodyId);
            if (body) {
                // Get new world position
                const worldPos = renderer.screenToWorld(e.clientX, e.clientY, 0);
                if (worldPos) {
                    body.position.set(
                        worldPos.x * renderer.viewScale,
                        0,
                        worldPos.z * renderer.viewScale
                    );
                    // Clear velocity when dragging
                    body.velocity.set(0, 0, 0);
                    body.clearTrail();
                    
                    // Update visuals immediately
                    syncBodyVisuals();
                    if (this.onUIUpdate) this.onUIUpdate();
                }
            }
            return;
        }
        
        // Handle panning
        if (this.dragStart && this.dragStart.type === 'pan') {
            const dx = e.clientX - this.dragStart.startX;
            const dy = e.clientY - this.dragStart.startY;
            renderer.panOrthographic(-dx, -dy);
            this.dragStart.startX = e.clientX;
            this.dragStart.startY = e.clientY;
            return;
        }
        
        // Update hover state
        const intersects = renderer.raycastBodies(e.clientX, e.clientY);
        if (intersects.length > 0) {
            let bodyId = null;
            let obj = intersects[0].object;
            while (obj && bodyId === null) {
                if (obj.userData && obj.userData.bodyId !== undefined) {
                    bodyId = obj.userData.bodyId;
                }
                obj = obj.parent;
            }
            state.hoveredBodyId = bodyId;
            state.setCursor(CursorState.POINTER);
        } else {
            state.hoveredBodyId = null;
            if (!state.isSpawning()) {
                state.setCursor(CursorState.DEFAULT);
            }
        }
        
        // Update spawn preview position
        if (state.isSpawning()) {
            const worldPos = renderer.screenToWorld(e.clientX, e.clientY, 0);
            if (worldPos) {
                state.spawnPreviewPosition = {
                    x: worldPos.x * renderer.viewScale,
                    y: 0,
                    z: worldPos.z * renderer.viewScale,
                };
            }
        }
    }

    // ========== Free View Mouse Handling ==========

    /**
     * Handle mouse down in free view mode
     * @param {MouseEvent} e
     * @private
     */
    _handleFreeViewMouseDown(e) {
        const state = getState();
        
        // Request pointer lock on click
        if (!state.pointerLocked) {
            this.canvas.requestPointerLock();
        }
    }

    // ========== Pointer Lock ==========

    /**
     * Handle pointer lock change
     * @private
     */
    _onPointerLockChange() {
        const state = getState();
        state.pointerLocked = document.pointerLockElement === this.canvas;
        
        if (state.pointerLocked) {
            document.body.classList.add('pointer-locked');
            state.setCursor(CursorState.LOCKED);
        } else {
            document.body.classList.remove('pointer-locked');
            getCameraController().resetMovementKeys();
            
            if (state.mode === AppMode.EDIT) {
                state.setCursor(CursorState.DEFAULT);
            }
        }
    }

    /**
     * Handle pointer lock error
     * @private
     */
    _onPointerLockError() {
        if (this.onWarning) {
            this.onWarning('Pointer lock failed. Try clicking the canvas again.');
        }
    }

    // ========== Actions ==========

    /**
     * Toggle simulation running state
     * @private
     */
    _toggleSimulation() {
        const simulation = getSimulation();
        simulation.toggle();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Perform a single simulation step
     * @private
     */
    _singleStep() {
        const simulation = getSimulation();
        if (!simulation.isRunning) {
            simulation.singleStep();
            syncBodyVisuals();
            if (this.onUIUpdate) this.onUIUpdate();
        }
    }

    /**
     * Reset the simulation
     * @private
     */
    _resetSimulation() {
        const simulation = getSimulation();
        simulation.reset();
        syncBodyVisuals();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Toggle between edit and free view modes
     * @private
     */
    _toggleMode() {
        const state = getState();
        
        // Release pointer lock when switching modes
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        state.toggleMode();
        getRenderer().updateVisibility();
        getCameraController().resetMovementKeys();
        
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Toggle UI visibility
     * @private
     */
    _toggleUI() {
        const state = getState();
        state.toggleUI();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Toggle settings panel
     * @private
     */
    _toggleSettings() {
        const state = getState();
        state.toggleSettings();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Toggle help overlay
     * @private
     */
    _toggleHelp() {
        const state = getState();
        state.toggleHelp();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Re-center camera
     * @private
     */
    _recenterCamera() {
        getCameraController().recenter();
    }

    /**
     * Set performance preset
     * @param {string} preset - Preset name
     * @private
     */
    _setPerformancePreset(preset) {
        const state = getState();
        state.performancePreset = preset;
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Delete selected body
     * @private
     */
    _deleteSelected() {
        const state = getState();
        const simulation = getSimulation();
        
        if (state.selectedBodyId !== null) {
            simulation.removeBody(state.selectedBodyId);
            state.selectBody(null);
            syncBodyVisuals();
            if (this.onUIUpdate) this.onUIUpdate();
        }
    }

    /**
     * Handle escape key
     * @private
     */
    _handleEscape() {
        const state = getState();
        
        // Release pointer lock
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        // Cancel spawning
        if (state.isSpawning()) {
            state.cancelSpawning();
        }
        
        // Close help
        if (state.helpVisible) {
            state.helpVisible = false;
        }
        
        // Close settings
        if (state.settingsVisible) {
            state.settingsVisible = false;
        }
        
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Spawn a body at the mouse position
     * @param {number} screenX - Screen X position
     * @param {number} screenY - Screen Y position
     * @private
     */
    _spawnBodyAtMouse(screenX, screenY) {
        const state = getState();
        const renderer = getRenderer();
        const simulation = getSimulation();
        
        if (!state.spawningType) return;
        
        const worldPos = renderer.screenToWorld(screenX, screenY, 0);
        if (!worldPos) return;
        
        // Get default parameters for this body type
        const params = getDefaultBodyParams(state.spawningType);
        
        // Set position
        params.x = worldPos.x * renderer.viewScale;
        params.y = 0;
        params.z = worldPos.z * renderer.viewScale;
        
        // Create and add body
        const body = new Body(params);
        simulation.addBody(body);
        
        // Select the new body
        state.selectBody(body.id);
        
        // End spawning mode
        state.cancelSpawning();
        
        // Update visuals
        syncBodyVisuals();
        if (this.onUIUpdate) this.onUIUpdate();
    }

    /**
     * Set mouse over UI state
     * @param {boolean} over - Whether mouse is over UI
     */
    setMouseOverUI(over) {
        getState().mouseOverUI = over;
    }

    /**
     * Handle mode change (called when switching between edit/free view)
     * @param {string} mode - New mode
     */
    handleModeChange(mode) {
        const state = getState();
        
        // Reset movement keys
        getCameraController().resetMovementKeys();
        
        // Handle pointer lock for free view
        if (mode === AppMode.FREE_VIEW && this.canvas) {
            // Request pointer lock when entering free view
            this.canvas.requestPointerLock();
        } else {
            // Exit pointer lock when entering edit mode
            if (document.pointerLockElement) {
                document.exitPointerLock();
            }
        }
    }
}

// Singleton instance
let inputManagerInstance = null;

/**
 * Get the global input manager
 * @returns {InputManager}
 */
export function getInputManager() {
    if (!inputManagerInstance) {
        inputManagerInstance = new InputManager();
    }
    return inputManagerInstance;
}

/**
 * Initialize input manager with canvas
 * @param {HTMLCanvasElement} canvas
 * @returns {InputManager}
 */
export function initInputManager(canvas) {
    const manager = getInputManager();
    manager.init(canvas);
    return manager;
}

export default {
    InputManager,
    getInputManager,
    initInputManager,
};
