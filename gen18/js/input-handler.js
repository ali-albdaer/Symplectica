/**
 * Input Handler
 * Manages keyboard, mouse, and gamepad input with proper pointer lock handling
 */
class InputHandler {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Keyboard state
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        
        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.mouseDown = false;
        this.rightMouseDown = false;
        
        // Pointer lock
        this.isLocked = false;
        this.requestLock = false;
        
        // Look input
        this.lookInput = { x: 0, y: 0 };
        
        // Gamepad
        this.gamepadState = {
            connected: false,
            buttons: new Array(17).fill(false),
            axes: new Array(6).fill(0)
        };
        
        this.attachListeners();
        this.setupPointerLock();
        
        DebugLog.info('InputHandler: Initialized');
    }

    /**
     * Attach input event listeners
     */
    attachListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Focus
        window.addEventListener('focus', () => this.onFocus());
        window.addEventListener('blur', () => this.onBlur());
        
        // Gamepad
        window.addEventListener('gamepadconnected', (e) => this.onGamepadConnected(e));
        window.addEventListener('gamepaddisconnected', (e) => this.onGamepadDisconnected(e));
    }

    /**
     * Setup pointer lock
     */
    setupPointerLock() {
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.canvas;
            if (this.isLocked) {
                DebugLog.debug('Pointer locked');
            } else {
                DebugLog.debug('Pointer unlocked');
            }
        });
        
        document.addEventListener('pointerlockerror', () => {
            DebugLog.error('Pointer lock error');
        });
    }

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (Config.controls.pointerLock && !this.isLocked) {
            this.canvas.requestPointerLock = this.canvas.requestPointerLock || 
                                             this.canvas.mozRequestPointerLock;
            if (this.canvas.requestPointerLock) {
                this.canvas.requestPointerLock();
            }
        }
    }

    /**
     * Release pointer lock
     */
    releasePointerLock() {
        if (this.isLocked) {
            document.exitPointerLock = document.exitPointerLock || 
                                      document.mozExitPointerLock;
            if (document.exitPointerLock) {
                document.exitPointerLock();
            }
        }
    }

    /**
     * Key down handler
     */
    onKeyDown(event) {
        const key = event.key.toLowerCase();
        
        if (!this.keys[key]) {
            this.keysPressed[key] = true;
        }
        this.keys[key] = true;
        
        event.preventDefault();
    }

    /**
     * Key up handler
     */
    onKeyUp(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = false;
        this.keysReleased[key] = true;
    }

    /**
     * Mouse down handler
     */
    onMouseDown(event) {
        if (event.button === 0) {
            this.mouseDown = true;
        } else if (event.button === 2) {
            this.rightMouseDown = true;
        }
    }

    /**
     * Mouse up handler
     */
    onMouseUp(event) {
        if (event.button === 0) {
            this.mouseDown = false;
        } else if (event.button === 2) {
            this.rightMouseDown = false;
        }
    }

    /**
     * Mouse move handler
     */
    onMouseMove(event) {
        this.mouseDeltaX = event.movementX || 0;
        this.mouseDeltaY = event.movementY || 0;
        
        this.mouseX += this.mouseDeltaX;
        this.mouseY += this.mouseDeltaY;
    }

    /**
     * Focus handler
     */
    onFocus() {
        this.keys = {};
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
    }

    /**
     * Blur handler
     */
    onBlur() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouseDown = false;
        this.rightMouseDown = false;
    }

    /**
     * Gamepad connected
     */
    onGamepadConnected(event) {
        DebugLog.info(`Gamepad connected: ${event.gamepad.id}`);
        this.gamepadState.connected = true;
    }

    /**
     * Gamepad disconnected
     */
    onGamepadDisconnected(event) {
        DebugLog.info(`Gamepad disconnected: ${event.gamepad.id}`);
        this.gamepadState.connected = false;
    }

    /**
     * Update gamepad state
     */
    updateGamepad() {
        if (!Config.controls.gamepadEnabled) return;

        const gamepads = navigator.getGamepads();
        if (!gamepads || !gamepads[0]) return;

        const pad = gamepads[0];
        
        // Update buttons
        for (let i = 0; i < pad.buttons.length; i++) {
            this.gamepadState.buttons[i] = pad.buttons[i].pressed;
        }
        
        // Update axes
        for (let i = 0; i < pad.axes.length; i++) {
            this.gamepadState.axes[i] = Math.abs(pad.axes[i]) > 0.1 ? pad.axes[i] : 0;
        }
    }

    /**
     * Get movement input (WASD/Gamepad)
     */
    getMovementInput() {
        let x = 0, y = 0, z = 0;
        
        // Keyboard
        if (this.keys['w'] || this.keys['arrowup']) z += 1;
        if (this.keys['s'] || this.keys['arrowdown']) z -= 1;
        if (this.keys['a'] || this.keys['arrowleft']) x -= 1;
        if (this.keys['d'] || this.keys['arrowright']) x += 1;
        
        // Gamepad left stick
        x += this.gamepadState.axes[0];
        z += this.gamepadState.axes[1];
        
        // Normalize
        const length = Math.sqrt(x * x + z * z);
        if (length > 1) {
            x /= length;
            z /= length;
        }
        
        return { x, y, z };
    }

    /**
     * Get look input
     */
    getLookInput() {
        let x = this.mouseDeltaX;
        let y = this.mouseDeltaY;
        
        // Gamepad right stick
        x += this.gamepadState.axes[2] * 10;
        y += this.gamepadState.axes[3] * 10;
        
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        
        return { x, y };
    }

    /**
     * Check if specific key is pressed
     */
    isKeyPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }

    /**
     * Check if specific key was just pressed this frame
     */
    wasKeyPressed(key) {
        return !!this.keysPressed[key.toLowerCase()];
    }

    /**
     * Check if specific key was just released this frame
     */
    wasKeyReleased(key) {
        return !!this.keysReleased[key.toLowerCase()];
    }

    /**
     * Check if jump button is pressed
     */
    isJumpPressed() {
        return this.wasKeyPressed(' ') || this.gamepadState.buttons[0]; // Spacebar or gamepad A
    }

    /**
     * Check if interact button is pressed
     */
    isInteractPressed() {
        return this.wasKeyPressed('e') || this.gamepadState.buttons[2]; // E or gamepad X
    }

    /**
     * Check if grab button is pressed
     */
    isGrabPressed() {
        return this.rightMouseDown || this.gamepadState.buttons[5]; // Right-click or gamepad RB
    }

    /**
     * Check if crouch is pressed
     */
    isCrouchPressed() {
        return this.isKeyPressed('control') || this.isKeyPressed('c') || this.gamepadState.buttons[1]; // Ctrl/C or gamepad B
    }

    /**
     * Check if ascend/descend is pressed (for free flight)
     */
    isAscendPressed() {
        return this.isKeyPressed(' ') || this.gamepadState.buttons[3]; // Space or gamepad Y
    }

    isDescendPressed() {
        return this.isKeyPressed('shift') || this.gamepadState.buttons[5]; // Shift or gamepad RB
    }

    /**
     * Update input state (call once per frame)
     */
    update() {
        // Update gamepad
        this.updateGamepad();
        
        // Clear single-frame inputs
        this.keysPressed = {};
        this.keysReleased = {};
    }

    /**
     * Serialize input state
     */
    serialize() {
        return {
            isLocked: this.isLocked,
            mousePosition: { x: this.mouseX, y: this.mouseY }
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}
