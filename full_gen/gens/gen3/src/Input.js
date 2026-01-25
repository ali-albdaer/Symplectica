/**
 * Input Handler - Manages all user input (keyboard, mouse)
 */

export class Input {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            locked: false,
            buttons: {}
        };
        
        this.callbacks = {
            keyDown: [],
            keyUp: [],
            mouseMove: [],
            mouseDown: [],
            mouseUp: []
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
        
        // Prevent context menu
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onKeyDown(event) {
        // Prevent default for game controls
        const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight', 'Insert'];
        if (gameKeys.includes(event.code)) {
            event.preventDefault();
        }
        
        this.keys[event.code] = true;
        
        // Call callbacks
        this.callbacks.keyDown.forEach(cb => cb(event));
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
        
        // Call callbacks
        this.callbacks.keyUp.forEach(cb => cb(event));
    }

    onMouseMove(event) {
        if (this.mouse.locked) {
            this.mouse.deltaX = event.movementX || 0;
            this.mouse.deltaY = event.movementY || 0;
        }
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        // Call callbacks
        this.callbacks.mouseMove.forEach(cb => cb(event));
    }

    onMouseDown(event) {
        this.mouse.buttons[event.button] = true;
        
        // Request pointer lock on canvas click
        if (event.button === 0 && !this.mouse.locked) {
            this.requestPointerLock();
        }
        
        // Call callbacks
        this.callbacks.mouseDown.forEach(cb => cb(event));
    }

    onMouseUp(event) {
        this.mouse.buttons[event.button] = false;
        
        // Call callbacks
        this.callbacks.mouseUp.forEach(cb => cb(event));
    }

    onPointerLockChange() {
        this.mouse.locked = document.pointerLockElement !== null;
    }

    onPointerLockError() {
        console.error('Pointer lock failed');
        this.mouse.locked = false;
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    exitPointerLock() {
        if (this.mouse.locked) {
            document.exitPointerLock();
        }
    }

    // Check if a key is currently pressed
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    // Check if mouse button is pressed
    isMouseButtonPressed(button = 0) {
        return this.mouse.buttons[button] === true;
    }

    // Get mouse delta and reset
    getMouseDelta() {
        const delta = {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY
        };
        
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        
        return delta;
    }

    // Register callbacks
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    // Remove callbacks
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }

    // Reset input state
    reset() {
        this.keys = {};
        this.mouse.buttons = {};
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
    }

    // Dispose
    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
    }
}
