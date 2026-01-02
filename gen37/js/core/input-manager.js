/**
 * Input Manager - Handles all keyboard and mouse input
 */

const InputManager = (function() {
    'use strict';
    
    // Key states
    const keys = {};
    const keysJustPressed = {};
    const keysJustReleased = {};
    
    // Mouse state
    let mouseDeltaX = 0;
    let mouseDeltaY = 0;
    let mouseButtons = {};
    
    // References
    let player = null;
    let cameraController = null;
    
    // Key bindings
    const BINDINGS = {
        moveForward: ['KeyW', 'ArrowUp'],
        moveBackward: ['KeyS', 'ArrowDown'],
        moveLeft: ['KeyA', 'ArrowLeft'],
        moveRight: ['KeyD', 'ArrowRight'],
        jump: ['Space'],
        moveDown: ['ShiftLeft', 'ShiftRight'],
        sprint: ['ShiftLeft', 'ShiftRight'],
        toggleFlight: ['KeyF'],
        toggleView: ['KeyV'],
        toggleTelemetry: ['KeyT'],
        toggleHelp: ['KeyH'],
        devConsole: ['Slash'],  // "/"
        interact: ['MouseRight']  // Right mouse button
    };
    
    /**
     * Check if any key in a binding is pressed
     */
    function isBindingPressed(bindingName) {
        const codes = BINDINGS[bindingName];
        if (!codes) return false;
        
        for (const code of codes) {
            if (code.startsWith('Mouse')) {
                const button = parseInt(code.replace('Mouse', ''));
                if (mouseButtons[button]) return true;
            } else {
                if (keys[code]) return true;
            }
        }
        return false;
    }
    
    /**
     * Handle keydown
     */
    function onKeyDown(event) {
        // Prevent default for game keys (but not when typing in inputs)
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'SELECT') {
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
                event.preventDefault();
            }
        }
        
        if (!keys[event.code]) {
            keysJustPressed[event.code] = true;
        }
        keys[event.code] = true;
    }
    
    /**
     * Handle keyup
     */
    function onKeyUp(event) {
        keys[event.code] = false;
        keysJustReleased[event.code] = true;
    }
    
    /**
     * Handle mouse movement
     */
    function onMouseMove(event) {
        if (MenuManager.isLocked()) {
            mouseDeltaX += event.movementX;
            mouseDeltaY += event.movementY;
        }
    }
    
    /**
     * Handle mouse button down
     */
    function onMouseDown(event) {
        mouseButtons[event.button] = true;
    }
    
    /**
     * Handle mouse button up
     */
    function onMouseUp(event) {
        mouseButtons[event.button] = false;
    }
    
    /**
     * Handle context menu (prevent right-click menu)
     */
    function onContextMenu(event) {
        event.preventDefault();
    }
    
    return {
        /**
         * Initialize input manager
         */
        init: function() {
            // Keyboard events
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);
            
            // Mouse events
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mouseup', onMouseUp);
            window.addEventListener('contextmenu', onContextMenu);
            
            Logger.info('InputManager', 'Input manager initialized');
        },
        
        /**
         * Set player reference
         */
        setPlayer: function(p) {
            player = p;
        },
        
        /**
         * Set camera controller reference
         */
        setCameraController: function(cam) {
            cameraController = cam;
        },
        
        /**
         * Process input and update game state
         */
        update: function() {
            // Don't process game input if menu is open
            if (DeveloperConsole.isOpen()) {
                this.clearMovementInput();
                return;
            }
            
            // Handle single-press actions
            this.handleSinglePressActions();
            
            // Update player movement state
            if (player) {
                player.moveForward = isBindingPressed('moveForward');
                player.moveBackward = isBindingPressed('moveBackward');
                player.moveLeft = isBindingPressed('moveLeft');
                player.moveRight = isBindingPressed('moveRight');
                player.isSprinting = isBindingPressed('sprint');
                
                if (player.isFlying) {
                    player.moveUp = keys['Space'];
                    player.moveDown = isBindingPressed('moveDown');
                }
            }
            
            // Update camera with mouse movement
            if (cameraController && MenuManager.isLocked()) {
                cameraController.onMouseMove(mouseDeltaX, mouseDeltaY);
            }
            
            // Check for object interaction
            this.handleInteraction();
            
            // Clear mouse delta
            mouseDeltaX = 0;
            mouseDeltaY = 0;
        },
        
        /**
         * Handle single-press actions
         */
        handleSinglePressActions: function() {
            // Toggle flight mode
            if (keysJustPressed['KeyF'] && player) {
                player.toggleFlightMode();
            }
            
            // Toggle camera view
            if (keysJustPressed['KeyV'] && cameraController) {
                cameraController.toggleViewMode();
            }
            
            // Jump (in walking mode)
            if (keysJustPressed['Space'] && player && !player.isFlying) {
                player.jump();
            }
            
            // Toggle developer console
            if (keysJustPressed['Slash']) {
                const isOpen = DeveloperConsole.toggle();
                if (isOpen) {
                    MenuManager.openMenu('devConsole');
                } else {
                    MenuManager.closeMenu('devConsole');
                }
            }
            
            // Toggle telemetry
            if (keysJustPressed['KeyT']) {
                Telemetry.toggle();
            }
            
            // Toggle controls help
            if (keysJustPressed['KeyH']) {
                MenuManager.toggleControlsHelp();
            }
            
            // Escape - close menus or release pointer
            if (keysJustPressed['Escape']) {
                if (DeveloperConsole.isOpen()) {
                    DeveloperConsole.close();
                    MenuManager.closeMenu('devConsole');
                } else {
                    MenuManager.unlockPointer();
                }
            }
            
            // Clear just pressed/released states
            Object.keys(keysJustPressed).forEach(k => delete keysJustPressed[k]);
            Object.keys(keysJustReleased).forEach(k => delete keysJustReleased[k]);
        },
        
        /**
         * Handle object interaction (grab/release)
         */
        handleInteraction: function() {
            if (!player || !MenuManager.isLocked()) return;
            
            const interactiveObjects = EntityManager.getInteractiveObjects();
            
            // Check what player is looking at
            const lookTarget = player.getLookTarget(
                Config.PLAYER.grabDistance, 
                interactiveObjects
            );
            
            // Update highlights
            for (const obj of interactiveObjects) {
                obj.setHighlighted(obj === lookTarget.object && !obj.isHeld);
            }
            
            // Update crosshair and prompt
            const canInteract = lookTarget.object !== null && !player.heldObject;
            MenuManager.setCrosshairInteract(canInteract);
            MenuManager.showInteractionPrompt(canInteract);
            
            // Right-click to grab/release
            if (mouseButtons[2]) {  // Right mouse button
                if (!this._rightClickHeld) {
                    this._rightClickHeld = true;
                    
                    if (player.heldObject) {
                        // Throw object
                        player.releaseObject(Config.PLAYER.throwForce);
                    } else {
                        // Try to grab
                        player.tryGrab(interactiveObjects);
                    }
                }
            } else {
                this._rightClickHeld = false;
            }
        },
        
        /**
         * Clear movement input (when menu is open)
         */
        clearMovementInput: function() {
            if (player) {
                player.moveForward = false;
                player.moveBackward = false;
                player.moveLeft = false;
                player.moveRight = false;
                player.moveUp = false;
                player.moveDown = false;
            }
            mouseDeltaX = 0;
            mouseDeltaY = 0;
        },
        
        /**
         * Check if a key is currently pressed
         */
        isKeyPressed: function(code) {
            return keys[code] || false;
        },
        
        /**
         * Get mouse delta
         */
        getMouseDelta: function() {
            return { x: mouseDeltaX, y: mouseDeltaY };
        }
    };
})();

window.InputManager = InputManager;
