/**
 * Controls.js - Input and Controls Module
 * 
 * Handles keyboard, mouse input, and pointer lock.
 * Supports walking and flight modes with camera-relative movement.
 */

import Config from './Config.js';
import Debug from './Debug.js';
import player from './Player.js';

class Controls {
    constructor() {
        // Key states
        this.keys = {};
        this.mouseButtons = {};
        
        // Mouse movement
        this.mouseDelta = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Callbacks
        this.onToggleFlightMode = null;
        this.onToggleCameraView = null;
        this.onToggleTelemetry = null;
        this.onToggleUI = null;
        this.onToggleDevConsole = null;
        this.onGrab = null;
        this.onRelease = null;
        
        // State
        this.isEnabled = true;
        this.isMenuOpen = false;
    }
    
    /**
     * Initialize controls
     */
    init(renderer) {
        this.renderer = renderer;
        this.canvas = renderer.domElement;
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('pointerlockerror', () => this.onPointerLockError());
        
        // Click to lock pointer
        this.canvas.addEventListener('click', () => this.requestPointerLock());
        
        Debug.info('Controls initialized');
    }
    
    /**
     * Request pointer lock
     */
    requestPointerLock() {
        if (this.isMenuOpen) return;
        
        this.canvas.requestPointerLock();
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
    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === this.canvas;
        
        // Show/hide crosshair
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.classList.toggle('hidden', !this.isPointerLocked);
        }
        
        // Show start prompt if not locked and no menu open
        const startPrompt = document.getElementById('start-prompt');
        if (startPrompt && !this.isMenuOpen) {
            startPrompt.classList.toggle('hidden', this.isPointerLocked);
        }
    }
    
    /**
     * Handle pointer lock error
     */
    onPointerLockError() {
        Debug.warn('Pointer lock failed');
    }
    
    /**
     * Handle key down
     */
    onKeyDown(event) {
        // Don't process if typing in input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        this.keys[event.code] = true;
        
        // Handle special keys
        switch (event.code) {
            case 'KeyF':
                if (this.isPointerLocked && this.onToggleFlightMode) {
                    this.onToggleFlightMode();
                }
                break;
                
            case 'KeyV':
                if (this.isPointerLocked && this.onToggleCameraView) {
                    this.onToggleCameraView();
                }
                break;
                
            case 'KeyT':
                if (this.onToggleTelemetry) {
                    this.onToggleTelemetry();
                }
                break;
                
            case 'KeyH':
                if (this.onToggleUI) {
                    this.onToggleUI();
                }
                break;
                
            case 'Slash':
                event.preventDefault();
                if (this.onToggleDevConsole) {
                    this.onToggleDevConsole();
                }
                break;
                
            case 'Escape':
                if (this.isMenuOpen && this.onToggleDevConsole) {
                    this.onToggleDevConsole();
                }
                break;
        }
    }
    
    /**
     * Handle key up
     */
    onKeyUp(event) {
        this.keys[event.code] = false;
    }
    
    /**
     * Handle mouse move
     */
    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        
        this.mouseDelta.x = event.movementX;
        this.mouseDelta.y = event.movementY;
    }
    
    /**
     * Handle mouse down
     */
    onMouseDown(event) {
        this.mouseButtons[event.button] = true;
        
        // Right click - grab object
        if (event.button === 2 && this.isPointerLocked && this.onGrab) {
            this.onGrab();
        }
    }
    
    /**
     * Handle mouse up
     */
    onMouseUp(event) {
        this.mouseButtons[event.button] = false;
        
        // Right click release - release object
        if (event.button === 2 && this.onRelease) {
            this.onRelease();
        }
    }
    
    /**
     * Update player based on input
     */
    update(deltaTime) {
        if (!this.isEnabled || !this.isPointerLocked) {
            this.mouseDelta.x = 0;
            this.mouseDelta.y = 0;
            return;
        }
        
        // Mouse look
        this.updateMouseLook();
        
        // Movement
        this.updateMovement(deltaTime);
    }
    
    /**
     * Update mouse look (camera rotation)
     */
    updateMouseLook() {
        const sensitivity = Config.player.mouseSensitivity;
        
        // Apply mouse movement to rotation
        player.rotation.yaw -= this.mouseDelta.x * sensitivity;
        player.rotation.pitch -= this.mouseDelta.y * sensitivity;
        
        // Clamp pitch to prevent flipping
        const maxPitch = Math.PI / 2 - 0.01;
        player.rotation.pitch = Math.max(-maxPitch, Math.min(maxPitch, player.rotation.pitch));
        
        // Reset mouse delta
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        
        // Apply rotation to camera (first person only)
        if (player.isFirstPerson && player.camera) {
            player.camera.rotation.order = 'YXZ';
            player.camera.rotation.y = player.rotation.yaw;
            player.camera.rotation.x = player.rotation.pitch;
        }
    }
    
    /**
     * Update player movement
     */
    updateMovement(deltaTime) {
        const isFlying = player.isFlying;
        const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        
        // Get speed based on mode
        let speed;
        if (isFlying) {
            speed = Config.player.flightSpeed;
            if (isSprinting) speed *= Config.player.flightSprintMultiplier;
        } else {
            speed = isSprinting ? Config.player.runSpeed : Config.player.walkSpeed;
        }
        
        // Calculate movement direction
        let moveX = 0, moveY = 0, moveZ = 0;
        
        // Forward/backward
        if (this.keys['KeyW']) {
            if (isFlying) {
                const forward = player.getFlightForward();
                moveX += forward.x;
                moveY += forward.y;
                moveZ += forward.z;
            } else {
                const forward = player.getForward();
                moveX += forward.x;
                moveZ += forward.z;
            }
        }
        if (this.keys['KeyS']) {
            if (isFlying) {
                const forward = player.getFlightForward();
                moveX -= forward.x;
                moveY -= forward.y;
                moveZ -= forward.z;
            } else {
                const forward = player.getForward();
                moveX -= forward.x;
                moveZ -= forward.z;
            }
        }
        
        // Strafe left/right
        if (this.keys['KeyA']) {
            const right = player.getRight();
            moveX -= right.x;
            moveZ -= right.z;
        }
        if (this.keys['KeyD']) {
            const right = player.getRight();
            moveX += right.x;
            moveZ += right.z;
        }
        
        // Vertical movement (flight mode or jump)
        if (isFlying) {
            if (this.keys['Space']) moveY += 1;
            if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                // Shift moves down in flight mode
                moveY -= 1;
                // Don't apply sprint when using shift for descent
                speed = Config.player.flightSpeed;
            }
        } else {
            // Jump in walking mode
            if (this.keys['Space'] && player.isGrounded) {
                player.velocity.y = Config.player.jumpForce;
                player.isGrounded = false;
            }
        }
        
        // Normalize movement vector
        const length = Math.sqrt(moveX * moveX + moveY * moveY + moveZ * moveZ);
        if (length > 0) {
            moveX /= length;
            moveY /= length;
            moveZ /= length;
        }
        
        // Apply movement
        if (isFlying) {
            // Direct position update for flight
            player.position.x += moveX * speed * deltaTime;
            player.position.y += moveY * speed * deltaTime;
            player.position.z += moveZ * speed * deltaTime;
        } else {
            // Velocity-based for walking with simple gravity
            player.velocity.x = moveX * speed;
            player.velocity.z = moveZ * speed;
            
            // Simple gravity
            if (!player.isGrounded) {
                player.velocity.y -= 30 * deltaTime; // Gravity
            }
            
            // Apply velocity
            player.position.x += player.velocity.x * deltaTime;
            player.position.y += player.velocity.y * deltaTime;
            player.position.z += player.velocity.z * deltaTime;
            
            // Simple ground check (for demo, ground at y=0)
            // In full implementation, would raycast to celestial bodies
            if (player.position.y < 0) {
                player.position.y = 0;
                player.velocity.y = 0;
                player.isGrounded = true;
            }
        }
    }
    
    /**
     * Check if a key is pressed
     */
    isKeyPressed(keyCode) {
        return !!this.keys[keyCode];
    }
    
    /**
     * Check if mouse button is pressed
     */
    isMouseButtonPressed(button) {
        return !!this.mouseButtons[button];
    }
    
    /**
     * Set menu open state
     */
    setMenuOpen(isOpen) {
        this.isMenuOpen = isOpen;
        
        if (isOpen) {
            this.exitPointerLock();
            const crosshair = document.getElementById('crosshair');
            if (crosshair) crosshair.classList.add('hidden');
        }
        
        // Hide start prompt when menu is open
        const startPrompt = document.getElementById('start-prompt');
        if (startPrompt && isOpen) {
            startPrompt.classList.add('hidden');
        }
    }
    
    /**
     * Enable/disable controls
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
}

// Export singleton
const controls = new Controls();
export default controls;
