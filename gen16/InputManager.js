/**
 * InputManager.js - Input Handling & Pointer Lock
 * Manages keyboard, mouse, and interaction inputs
 */

class InputManager {
    constructor() {
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        
        this.isPointerLocked = false;
        this.pointerLockElement = document.documentElement;
        
        this.setupEventListeners();
        Logger.info('InputManager initialized');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Pointer lock
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('mozpointerlockchange', () => this.onPointerLockChange());
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle keydown events
     */
    onKeyDown(event) {
        this.keys[event.key] = true;
        
        // Special key handlers
        switch (event.key.toLowerCase()) {
            case '/':
                event.preventDefault();
                // Handled in DebugUI
                break;
            case 'f':
                // Flight toggle handled in Main
                break;
            case 'c':
                // Camera toggle handled in Main
                break;
            case 't':
                // Telemetry toggle handled in Main
                break;
        }
    }

    /**
     * Handle keyup events
     */
    onKeyUp(event) {
        this.keys[event.key] = false;
    }

    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        this.lastMouseX = this.mouseX;
        this.lastMouseY = this.mouseY;
        
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        
        if (this.isPointerLocked) {
            this.mouseDeltaX += event.movementX;
            this.mouseDeltaY += event.movementY;
        }
    }

    /**
     * Handle mouse down
     */
    onMouseDown(event) {
        if (event.button === 2) {
            // Right-click - request pointer lock for interaction
            this.requestPointerLock();
        }
    }

    /**
     * Handle mouse up
     */
    onMouseUp(event) {
        // Handled by game logic
    }

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (!this.isPointerLocked && !this.isUIActive()) {
            document.documentElement.requestPointerLock =
                document.documentElement.requestPointerLock ||
                document.documentElement.mozRequestPointerLock;
            
            document.documentElement.requestPointerLock();
        }
    }

    /**
     * Release pointer lock
     */
    releasePointerLock() {
        if (this.isPointerLocked) {
            document.exitPointerLock =
                document.exitPointerLock ||
                document.mozExitPointerLock;
            
            document.exitPointerLock();
            this.isPointerLocked = false;
        }
    }

    /**
     * Handle pointer lock change
     */
    onPointerLockChange() {
        this.isPointerLocked =
            document.pointerLockElement === document.documentElement ||
            document.mozPointerLockElement === document.documentElement;
        
        if (this.isPointerLocked) {
            Logger.info('Pointer locked');
        } else {
            Logger.info('Pointer unlocked');
        }
    }

    /**
     * Get mouse delta since last frame
     */
    getMouseDelta() {
        const delta = {
            x: this.mouseDeltaX,
            y: this.mouseDeltaY,
        };
        
        // Reset delta
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        
        return delta;
    }

    /**
     * Get normalized mouse coordinates (-1 to 1)
     */
    getNormalizedMouseCoords() {
        return {
            x: (this.mouseX / window.innerWidth) * 2 - 1,
            y: -(this.mouseY / window.innerHeight) * 2 + 1,
        };
    }

    /**
     * Check if any UI is active (console, editor, etc.)
     */
    isUIActive() {
        const console = document.getElementById('dev-console');
        const editor = document.getElementById('attribute-editor');
        
        return (console && console.classList.contains('active')) ||
               (editor && editor.classList.contains('active'));
    }

    /**
     * Check if a key is pressed
     */
    isKeyPressed(key) {
        return this.keys[key] || this.keys[key.toLowerCase()];
    }

    /**
     * Get current mouse position
     */
    getMousePosition() {
        return {
            x: this.mouseX,
            y: this.mouseY,
        };
    }

    /**
     * Consume mouse delta (for external consumers)
     */
    consumeMouseDelta() {
        const delta = this.getMouseDelta();
        return delta;
    }
}
