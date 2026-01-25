/**
 * ============================================
 * Input Manager
 * ============================================
 * 
 * Handles all input: keyboard, mouse, pointer lock.
 * Provides a clean interface for querying input state.
 */

class InputManager {
    constructor() {
        // Keyboard state
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {},
            buttonsJustPressed: {},
            buttonsJustReleased: {},
            wheel: 0
        };
        
        // Pointer lock state
        this.isPointerLocked = false;
        this.pointerLockElement = null;
        
        // Callbacks
        this.onPointerLockChange = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize input handling
     */
    init(canvas) {
        console.info('Initializing Input Manager...');
        
        try {
            this.pointerLockElement = canvas;
            
            // Keyboard events
            window.addEventListener('keydown', (e) => this.onKeyDown(e));
            window.addEventListener('keyup', (e) => this.onKeyUp(e));
            
            // Mouse events
            window.addEventListener('mousemove', (e) => this.onMouseMove(e));
            window.addEventListener('mousedown', (e) => this.onMouseDown(e));
            window.addEventListener('mouseup', (e) => this.onMouseUp(e));
            window.addEventListener('wheel', (e) => this.onWheel(e));
            
            // Pointer lock events
            document.addEventListener('pointerlockchange', () => this.onPointerLockChanged());
            document.addEventListener('pointerlockerror', () => this.onPointerLockError());
            
            // Click to request pointer lock
            canvas.addEventListener('click', () => {
                if (!this.isPointerLocked && !this.isMenuOpen()) {
                    this.requestPointerLock();
                }
            });
            
            this.isInitialized = true;
            console.success('Input Manager initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Input Manager: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Check if any menu is currently open
     */
    isMenuOpen() {
        const devConsole = document.getElementById('dev-console');
        return devConsole && !devConsole.classList.contains('hidden');
    }
    
    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (this.pointerLockElement) {
            this.pointerLockElement.requestPointerLock();
        }
    }
    
    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Handle pointer lock change
     */
    onPointerLockChanged() {
        this.isPointerLocked = document.pointerLockElement === this.pointerLockElement;
        
        // Update cursor visibility
        document.body.style.cursor = this.isPointerLocked ? 'none' : 'auto';
        
        // Update crosshair
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.classList.toggle('hidden', !this.isPointerLocked);
        }
        
        if (this.onPointerLockChange) {
            this.onPointerLockChange(this.isPointerLocked);
        }
        
        console.info(`Pointer lock: ${this.isPointerLocked ? 'engaged' : 'released'}`);
    }
    
    /**
     * Handle pointer lock error
     */
    onPointerLockError() {
        console.error('Pointer lock failed');
    }
    
    /**
     * Keyboard handlers
     */
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        
        if (!this.keys[key]) {
            this.keysJustPressed[key] = true;
        }
        this.keys[key] = true;
        
        // Handle special keys
        if (key === 'escape') {
            // Don't exit pointer lock if dev console is open
            const devConsole = document.getElementById('dev-console');
            if (devConsole && !devConsole.classList.contains('hidden')) {
                // Close dev console instead
                devConsole.classList.add('hidden');
                this.requestPointerLock();
            } else {
                this.exitPointerLock();
            }
        }
    }
    
    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        this.keysJustReleased[key] = true;
    }
    
    /**
     * Mouse handlers
     */
    onMouseMove(event) {
        if (this.isPointerLocked) {
            this.mouse.deltaX += event.movementX;
            this.mouse.deltaY += event.movementY;
        }
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
    }
    
    onMouseDown(event) {
        const button = event.button;
        if (!this.mouse.buttons[button]) {
            this.mouse.buttonsJustPressed[button] = true;
        }
        this.mouse.buttons[button] = true;
    }
    
    onMouseUp(event) {
        const button = event.button;
        this.mouse.buttons[button] = false;
        this.mouse.buttonsJustReleased[button] = true;
    }
    
    onWheel(event) {
        this.mouse.wheel += event.deltaY;
    }
    
    /**
     * Query methods
     */
    
    // Is key currently held down
    isKeyDown(key) {
        return !!this.keys[key.toLowerCase()];
    }
    
    // Was key just pressed this frame
    isKeyJustPressed(key) {
        return !!this.keysJustPressed[key.toLowerCase()];
    }
    
    // Was key just released this frame
    isKeyJustReleased(key) {
        return !!this.keysJustReleased[key.toLowerCase()];
    }
    
    // Is mouse button held
    isMouseButtonDown(button) {
        return !!this.mouse.buttons[button];
    }
    
    // Was mouse button just pressed
    isMouseButtonJustPressed(button) {
        return !!this.mouse.buttonsJustPressed[button];
    }
    
    // Was mouse button just released
    isMouseButtonJustReleased(button) {
        return !!this.mouse.buttonsJustReleased[button];
    }
    
    // Get mouse delta and reset
    getMouseDelta() {
        const delta = {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY
        };
        return delta;
    }
    
    // Get scroll wheel delta
    getScrollDelta() {
        const delta = this.mouse.wheel;
        return delta;
    }
    
    /**
     * Clear per-frame state (call at end of frame)
     */
    update() {
        // Clear just-pressed/released states
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouse.buttonsJustPressed = {};
        this.mouse.buttonsJustReleased = {};
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    /**
     * Get movement input vector
     */
    getMovementInput() {
        const input = { x: 0, y: 0, z: 0 };
        
        if (this.isKeyDown('w')) input.z -= 1;
        if (this.isKeyDown('s')) input.z += 1;
        if (this.isKeyDown('a')) input.x -= 1;
        if (this.isKeyDown('d')) input.x += 1;
        if (this.isKeyDown(' ')) input.y += 1;  // Space
        if (this.isKeyDown('shift')) input.y -= 1;
        
        return input;
    }
}
