/**
 * Input Handler
 * Manages keyboard, mouse, and touch input
 */

import { Config } from './config.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: [false, false, false],
            wheel: 0,
            locked: false
        };
        
        this.touch = {
            active: false,
            touches: [],
            joystickLeft: { x: 0, y: 0 },
            joystickRight: { x: 0, y: 0 }
        };
        
        this.callbacks = {
            keyDown: [],
            keyUp: [],
            mouseDown: [],
            mouseUp: [],
            mouseMove: []
        };
        
        this.canvas = null;
        this.enabled = true;
        
        this.bindEvents();
    }
    
    /**
     * Initialize with canvas element
     */
    init(canvas) {
        this.canvas = canvas;
        
        // Request pointer lock on click
        canvas.addEventListener('click', () => {
            if (!this.mouse.locked && this.enabled) {
                canvas.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.mouse.locked = document.pointerLockElement === canvas;
        });
    }
    
    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Keyboard events
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Mouse events
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mousedown', this.onMouseDown.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));
        window.addEventListener('wheel', this.onMouseWheel.bind(this));
        
        // Touch events
        window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        window.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Prevent context menu
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Handle key down
     */
    onKeyDown(event) {
        if (!this.enabled) return;
        
        const key = event.code;
        
        if (!this.keys[key]) {
            this.keysJustPressed[key] = true;
        }
        
        this.keys[key] = true;
        
        // Fire callbacks
        this.callbacks.keyDown.forEach(cb => cb(key, event));
        
        // Prevent default for game keys
        const gameKeys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight'];
        if (gameKeys.includes(key)) {
            event.preventDefault();
        }
    }
    
    /**
     * Handle key up
     */
    onKeyUp(event) {
        const key = event.code;
        
        if (this.keys[key]) {
            this.keysJustReleased[key] = true;
        }
        
        this.keys[key] = false;
        
        // Fire callbacks
        this.callbacks.keyUp.forEach(cb => cb(key, event));
    }
    
    /**
     * Handle mouse move
     */
    onMouseMove(event) {
        if (!this.enabled) return;
        
        if (this.mouse.locked) {
            this.mouse.deltaX = event.movementX || 0;
            this.mouse.deltaY = event.movementY || 0;
        } else {
            this.mouse.deltaX = event.clientX - this.mouse.x;
            this.mouse.deltaY = event.clientY - this.mouse.y;
        }
        
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
        
        this.callbacks.mouseMove.forEach(cb => cb(this.mouse, event));
    }
    
    /**
     * Handle mouse button down
     */
    onMouseDown(event) {
        if (!this.enabled) return;
        
        this.mouse.buttons[event.button] = true;
        this.callbacks.mouseDown.forEach(cb => cb(event.button, event));
    }
    
    /**
     * Handle mouse button up
     */
    onMouseUp(event) {
        this.mouse.buttons[event.button] = false;
        this.callbacks.mouseUp.forEach(cb => cb(event.button, event));
    }
    
    /**
     * Handle mouse wheel
     */
    onMouseWheel(event) {
        if (!this.enabled) return;
        
        this.mouse.wheel = event.deltaY;
    }
    
    /**
     * Handle touch start
     */
    onTouchStart(event) {
        if (!this.enabled) return;
        
        this.touch.active = true;
        this.updateTouches(event.touches);
        event.preventDefault();
    }
    
    /**
     * Handle touch move
     */
    onTouchMove(event) {
        if (!this.enabled) return;
        
        this.updateTouches(event.touches);
        event.preventDefault();
    }
    
    /**
     * Handle touch end
     */
    onTouchEnd(event) {
        this.updateTouches(event.touches);
        if (event.touches.length === 0) {
            this.touch.active = false;
            this.touch.joystickLeft = { x: 0, y: 0 };
            this.touch.joystickRight = { x: 0, y: 0 };
        }
    }
    
    /**
     * Update touch state
     */
    updateTouches(touches) {
        this.touch.touches = Array.from(touches).map(t => ({
            id: t.identifier,
            x: t.clientX,
            y: t.clientY
        }));
        
        // Simple virtual joystick logic
        const screenWidth = window.innerWidth;
        
        for (const touch of this.touch.touches) {
            if (touch.x < screenWidth / 2) {
                // Left side - movement joystick
                this.touch.joystickLeft.x = (touch.x - screenWidth / 4) / (screenWidth / 4);
                this.touch.joystickLeft.y = (touch.y - window.innerHeight / 2) / (window.innerHeight / 2);
            } else {
                // Right side - look joystick
                this.touch.joystickRight.x = (touch.x - screenWidth * 0.75) / (screenWidth / 4);
                this.touch.joystickRight.y = (touch.y - window.innerHeight / 2) / (window.innerHeight / 2);
            }
        }
    }
    
    /**
     * Check if a key is currently pressed
     */
    isKeyDown(key) {
        return this.keys[key] || false;
    }
    
    /**
     * Check if a key was just pressed this frame
     */
    isKeyJustPressed(key) {
        return this.keysJustPressed[key] || false;
    }
    
    /**
     * Check if a key was just released this frame
     */
    isKeyJustReleased(key) {
        return this.keysJustReleased[key] || false;
    }
    
    /**
     * Check if a mouse button is down
     */
    isMouseButtonDown(button) {
        return this.mouse.buttons[button] || false;
    }
    
    /**
     * Get movement input vector
     */
    getMovementInput() {
        let x = 0, z = 0;
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
        
        // Add touch joystick
        if (this.touch.active) {
            x += this.touch.joystickLeft.x;
            z += this.touch.joystickLeft.y;
        }
        
        // Normalize
        const len = Math.sqrt(x * x + z * z);
        if (len > 1) {
            x /= len;
            z /= len;
        }
        
        return { x, z };
    }
    
    /**
     * Get vertical input (jump/descend)
     */
    getVerticalInput() {
        let y = 0;
        
        if (this.keys['Space']) y += 1;
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) y -= 1;
        
        return y;
    }
    
    /**
     * Get look input (mouse delta)
     */
    getLookInput() {
        let x = this.mouse.deltaX;
        let y = this.mouse.deltaY;
        
        // Add touch joystick
        if (this.touch.active) {
            x += this.touch.joystickRight.x * 10;
            y += this.touch.joystickRight.y * 10;
        }
        
        return { x, y };
    }
    
    /**
     * Register a callback
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    /**
     * Remove a callback
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    /**
     * Clear per-frame state
     */
    update() {
        // Clear just pressed/released states
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        
        // Clear mouse delta
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    /**
     * Unlock pointer
     */
    unlockPointer() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Enable/disable input
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.keys = {};
            this.mouse.buttons = [false, false, false];
        }
    }
    
    /**
     * Cleanup
     */
    dispose() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('wheel', this.onMouseWheel);
    }
}

export default InputManager;
