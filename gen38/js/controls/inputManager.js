/**
 * Solar System Simulation - Input Manager
 * ========================================
 * Handles keyboard, mouse, and pointer lock.
 */

class InputManager {
    constructor() {
        // Key states
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {},
            wheel: 0,
        };
        
        // Pointer lock state
        this.isPointerLocked = false;
        
        // Callbacks
        this.onKeyDown = null;
        this.onKeyUp = null;
        this.onMouseDown = null;
        this.onMouseUp = null;
        
        // Bound handlers (for removal)
        this._boundHandlers = {};
        
        Logger.info('InputManager created');
    }
    
    /**
     * Initialize input system
     */
    init() {
        // Keyboard events
        this._boundHandlers.keydown = (e) => this.handleKeyDown(e);
        this._boundHandlers.keyup = (e) => this.handleKeyUp(e);
        window.addEventListener('keydown', this._boundHandlers.keydown);
        window.addEventListener('keyup', this._boundHandlers.keyup);
        
        // Mouse events
        this._boundHandlers.mousedown = (e) => this.handleMouseDown(e);
        this._boundHandlers.mouseup = (e) => this.handleMouseUp(e);
        this._boundHandlers.mousemove = (e) => this.handleMouseMove(e);
        this._boundHandlers.wheel = (e) => this.handleWheel(e);
        window.addEventListener('mousedown', this._boundHandlers.mousedown);
        window.addEventListener('mouseup', this._boundHandlers.mouseup);
        window.addEventListener('mousemove', this._boundHandlers.mousemove);
        window.addEventListener('wheel', this._boundHandlers.wheel);
        
        // Pointer lock events
        this._boundHandlers.pointerlockchange = () => this.handlePointerLockChange();
        this._boundHandlers.pointerlockerror = () => this.handlePointerLockError();
        document.addEventListener('pointerlockchange', this._boundHandlers.pointerlockchange);
        document.addEventListener('pointerlockerror', this._boundHandlers.pointerlockerror);
        
        // Click to lock
        this._boundHandlers.click = (e) => this.handleClick(e);
        document.body.addEventListener('click', this._boundHandlers.click);
        
        Logger.success('Input system initialized');
    }
    
    /**
     * Handle key down
     */
    handleKeyDown(event) {
        const key = event.code;
        
        if (!this.keys[key]) {
            this.keysPressed[key] = true;
        }
        this.keys[key] = true;
        
        // Call callback if set
        if (this.onKeyDown) {
            this.onKeyDown(key, event);
        }
    }
    
    /**
     * Handle key up
     */
    handleKeyUp(event) {
        const key = event.code;
        
        this.keys[key] = false;
        this.keysReleased[key] = true;
        
        // Call callback if set
        if (this.onKeyUp) {
            this.onKeyUp(key, event);
        }
    }
    
    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        this.mouse.buttons[event.button] = true;
        
        if (this.onMouseDown) {
            this.onMouseDown(event.button, event);
        }
    }
    
    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        this.mouse.buttons[event.button] = false;
        
        if (this.onMouseUp) {
            this.onMouseUp(event.button, event);
        }
    }
    
    /**
     * Handle mouse move
     */
    handleMouseMove(event) {
        if (this.isPointerLocked) {
            this.mouse.deltaX += event.movementX || 0;
            this.mouse.deltaY += event.movementY || 0;
        }
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    /**
     * Handle wheel
     */
    handleWheel(event) {
        this.mouse.wheel = event.deltaY;
    }
    
    /**
     * Handle click for pointer lock
     */
    handleClick(event) {
        // Don't lock if clicking UI elements
        if (event.target.closest('#dev-menu') ||
            event.target.closest('#debug-console') ||
            event.target.closest('#controls-help')) {
            return;
        }
        
        if (!this.isPointerLocked && !MenuManager?.isAnyMenuOpen()) {
            this.requestPointerLock();
        }
    }
    
    /**
     * Request pointer lock
     */
    requestPointerLock() {
        document.body.requestPointerLock();
    }
    
    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        document.exitPointerLock();
    }
    
    /**
     * Handle pointer lock change
     */
    handlePointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
        
        // Update cursor visibility
        if (this.isPointerLocked) {
            document.getElementById('crosshair')?.classList.remove('hidden');
        } else {
            document.getElementById('crosshair')?.classList.add('hidden');
        }
        
        Logger.debug(`Pointer lock: ${this.isPointerLocked}`);
    }
    
    /**
     * Handle pointer lock error
     */
    handlePointerLockError() {
        Logger.error('Pointer lock failed');
    }
    
    /**
     * Check if a key is currently held
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }
    
    /**
     * Check if a key was just pressed this frame
     */
    isKeyPressed(key) {
        return this.keysPressed[key] === true;
    }
    
    /**
     * Check if a key was just released this frame
     */
    isKeyReleased(key) {
        return this.keysReleased[key] === true;
    }
    
    /**
     * Check if a mouse button is held
     */
    isMouseDown(button) {
        return this.mouse.buttons[button] === true;
    }
    
    /**
     * Get and clear mouse delta
     */
    getMouseDelta() {
        const delta = {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY
        };
        return delta;
    }
    
    /**
     * Clear per-frame input state
     */
    clearFrameState() {
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    /**
     * Get movement input from WASD
     */
    getMovementInput() {
        let x = 0, y = 0, z = 0;
        
        // Forward/back
        if (this.isKeyDown('KeyW')) z += 1;
        if (this.isKeyDown('KeyS')) z -= 1;
        
        // Left/right
        if (this.isKeyDown('KeyA')) x -= 1;
        if (this.isKeyDown('KeyD')) x += 1;
        
        // Up/down (for flying)
        if (this.isKeyDown('Space')) y += 1;
        if (this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight')) y -= 1;
        
        return { x, y, z };
    }
    
    /**
     * Dispose input system
     */
    dispose() {
        window.removeEventListener('keydown', this._boundHandlers.keydown);
        window.removeEventListener('keyup', this._boundHandlers.keyup);
        window.removeEventListener('mousedown', this._boundHandlers.mousedown);
        window.removeEventListener('mouseup', this._boundHandlers.mouseup);
        window.removeEventListener('mousemove', this._boundHandlers.mousemove);
        window.removeEventListener('wheel', this._boundHandlers.wheel);
        document.removeEventListener('pointerlockchange', this._boundHandlers.pointerlockchange);
        document.removeEventListener('pointerlockerror', this._boundHandlers.pointerlockerror);
        document.body.removeEventListener('click', this._boundHandlers.click);
        
        Logger.info('InputManager disposed');
    }
}

// Global instance
const Input = new InputManager();
