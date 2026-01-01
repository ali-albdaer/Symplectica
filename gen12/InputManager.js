/**
 * InputManager.js - Centralized Input Handling
 * Manages keyboard, mouse, and pointer lock state
 */

import { Config } from './Config.js';
import { Logger, EventBus } from './Utils.js';

export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {}
        };
        
        this.isPointerLocked = false;
        this.isMenuActive = false;
        this.isConsoleActive = false;
        
        this.sensitivity = Config.player.mouseSensitivity;
        
        // Bind event handlers
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onPointerLockError = this.onPointerLockError.bind(this);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onWheel = this.onWheel.bind(this);
        
        this.setupEventListeners();
        
        Logger.input('InputManager initialized');
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('wheel', this.onWheel);
        document.addEventListener('contextmenu', this.onContextMenu);
        document.addEventListener('pointerlockchange', this.onPointerLockChange);
        document.addEventListener('pointerlockerror', this.onPointerLockError);
    }

    onKeyDown(event) {
        // Don't process if typing in console
        if (this.isConsoleActive && event.code !== Config.controls.toggleConsole) {
            return;
        }
        
        this.keys[event.code] = true;
        
        // Handle special key events
        if (event.code === Config.controls.toggleConsole) {
            event.preventDefault();
            this.toggleConsole();
        } else if (event.code === Config.controls.toggleFlight) {
            EventBus.emit('toggleFlight');
        } else if (event.code === Config.controls.toggleCamera) {
            EventBus.emit('toggleCamera');
        } else if (event.code === Config.controls.toggleTelemetry) {
            EventBus.emit('toggleTelemetry');
        }
        
        EventBus.emit('keyDown', { code: event.code, key: event.key });
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
        EventBus.emit('keyUp', { code: event.code, key: event.key });
    }

    onMouseMove(event) {
        if (!this.isPointerLocked) {
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;
            return;
        }
        
        this.mouse.deltaX = event.movementX * this.sensitivity;
        this.mouse.deltaY = event.movementY * this.sensitivity;
        
        EventBus.emit('mouseMove', {
            deltaX: this.mouse.deltaX,
            deltaY: this.mouse.deltaY
        });
    }

    onMouseDown(event) {
        this.mouse.buttons[event.button] = true;
        
        // Request pointer lock on left click if not locked
        if (event.button === 0 && !this.isPointerLocked && !this.isMenuActive && !this.isConsoleActive) {
            this.requestPointerLock();
        }
        
        // Right click for grab
        if (event.button === Config.controls.grab && this.isPointerLocked) {
            EventBus.emit('grabStart');
        }
        
        EventBus.emit('mouseDown', { button: event.button });
    }

    onMouseUp(event) {
        this.mouse.buttons[event.button] = false;
        
        // Release grab
        if (event.button === Config.controls.grab) {
            EventBus.emit('grabEnd');
        }
        
        EventBus.emit('mouseUp', { button: event.button });
    }

    onWheel(event) {
        EventBus.emit('mouseWheel', { deltaY: event.deltaY });
    }

    onContextMenu(event) {
        // Prevent context menu when pointer is locked
        if (this.isPointerLocked) {
            event.preventDefault();
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement !== null;
        
        if (this.isPointerLocked) {
            Logger.input('Pointer locked');
        } else {
            Logger.input('Pointer unlocked');
        }
        
        EventBus.emit('pointerLockChange', { locked: this.isPointerLocked });
    }

    onPointerLockError() {
        Logger.error('Pointer lock error');
        EventBus.emit('pointerLockError');
    }

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (this.isMenuActive || this.isConsoleActive) return;
        
        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.requestPointerLock();
        }
    }

    /**
     * Release pointer lock
     */
    releasePointerLock() {
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
    }

    /**
     * Toggle developer console
     */
    toggleConsole() {
        this.isConsoleActive = !this.isConsoleActive;
        
        if (this.isConsoleActive) {
            this.releasePointerLock();
        }
        
        EventBus.emit('toggleConsole', { active: this.isConsoleActive });
    }

    /**
     * Set menu state
     */
    setMenuActive(active) {
        this.isMenuActive = active;
        
        if (active) {
            this.releasePointerLock();
        }
        
        EventBus.emit('menuStateChange', { active });
    }

    /**
     * Check if a key is pressed
     */
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    /**
     * Check if a mouse button is pressed
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttons[button] === true;
    }

    /**
     * Get movement input vector
     */
    getMovementInput() {
        const input = new THREE.Vector3(0, 0, 0);
        
        if (this.isKeyPressed(Config.controls.forward)) input.z -= 1;
        if (this.isKeyPressed(Config.controls.backward)) input.z += 1;
        if (this.isKeyPressed(Config.controls.left)) input.x -= 1;
        if (this.isKeyPressed(Config.controls.right)) input.x += 1;
        if (this.isKeyPressed(Config.controls.jump)) input.y += 1;
        if (this.isKeyPressed(Config.controls.descend)) input.y -= 1;
        
        return input;
    }

    /**
     * Check if sprinting
     */
    isSprinting() {
        return this.isKeyPressed(Config.controls.sprint);
    }

    /**
     * Get mouse delta and reset
     */
    getMouseDelta() {
        const delta = {
            x: this.mouse.deltaX,
            y: this.mouse.deltaY
        };
        
        // Reset delta after reading
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        
        return delta;
    }

    /**
     * Update sensitivity
     */
    setSensitivity(value) {
        this.sensitivity = value;
    }

    /**
     * Clean up event listeners
     */
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('wheel', this.onWheel);
        document.removeEventListener('contextmenu', this.onContextMenu);
        document.removeEventListener('pointerlockchange', this.onPointerLockChange);
        document.removeEventListener('pointerlockerror', this.onPointerLockError);
        
        Logger.input('InputManager disposed');
    }
}

export default InputManager;
