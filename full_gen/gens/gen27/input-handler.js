/**
 * Input Handler
 * Manages keyboard and mouse input with proper event delegation
 */

window.InputHandler = {
    // Key states
    keys: {},
    
    // Mouse state
    mouse: {
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        isLocked: false,
        lastX: 0,
        lastY: 0,
    },

    // Input mapping
    keyBindings: {
        forward: ['w', 'W'],
        backward: ['s', 'S'],
        left: ['a', 'A'],
        right: ['d', 'D'],
        jump: [' '],
        sprint: ['Shift'],
        freeFly: ['f', 'F'],
        grab: ['r', 'R'],
        perspective: ['v', 'V'],
        devConsole: ['/'],
        help: ['h', 'H'],
        telemetry: ['g', 'G'],
        debugLog: ['l', 'L'],
    },

    init() {
        this.setupKeyboardInput();
        this.setupMouseInput();
        this.setupPointerLock();
        DebugSystem.info('Input handler initialized');
    },

    /**
     * Setup keyboard events
     */
    setupKeyboardInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyDown(e);
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.handleKeyUp(e);
        });
    },

    /**
     * Setup mouse movement tracking
     */
    setupMouseInput() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.deltaX = e.movementX || 0;
            this.mouse.deltaY = e.movementY || 0;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });

        document.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    },

    /**
     * Setup pointer lock for mouse look
     */
    setupPointerLock() {
        const canvas = document.getElementById('canvas');
        
        canvas.addEventListener('click', () => {
            // Only request lock if no UI is open
            if (!this.isUIOpen()) {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
                canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouse.isLocked = document.pointerLockElement === canvas;
            this.updatePointerLockIndicator();
        });

        document.addEventListener('pointerlockerror', () => {
            DebugSystem.warn('Pointer lock error');
        });
    },

    /**
     * Handle key down events
     */
    handleKeyDown(event) {
        // Check for special commands
        if (this.matchesBinding(event.key, this.keyBindings.devConsole)) {
            event.preventDefault();
            window.gameUI?.toggleDevConsole();
            return;
        }

        if (this.matchesBinding(event.key, this.keyBindings.help)) {
            event.preventDefault();
            window.gameUI?.toggleHelp();
            return;
        }

        if (this.matchesBinding(event.key, this.keyBindings.telemetry)) {
            event.preventDefault();
            Config.ui.showTelemetry = !Config.ui.showTelemetry;
            window.gameUI?.updateTelemetry();
            return;
        }

        if (this.matchesBinding(event.key, this.keyBindings.debugLog)) {
            event.preventDefault();
            Config.ui.showDebugLog = !Config.ui.showDebugLog;
            return;
        }

        if (this.matchesBinding(event.key, this.keyBindings.perspective)) {
            event.preventDefault();
            CameraSystem?.toggleMode();
            return;
        }

        if (this.matchesBinding(event.key, this.keyBindings.freeFly)) {
            event.preventDefault();
            PlayerController?.toggleFreeFlight();
            return;
        }

        // If UI is open, don't process movement
        if (this.isUIOpen()) {
            return;
        }

        // Grab action on 'r'
        if (this.matchesBinding(event.key, this.keyBindings.grab)) {
            event.preventDefault();
            PlayerController?.grabObject();
            return;
        }
    },

    /**
     * Handle key up events
     */
    handleKeyUp(event) {
        // Handle key release
    },

    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        if (event.button === 2) {  // Right click
            event.preventDefault();
            if (!this.isUIOpen()) {
                PlayerController?.grabObject();
            }
        }
    },

    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        if (event.button === 2) {  // Right click
            event.preventDefault();
            PlayerController?.releaseObject();
        }
    },

    /**
     * Handle click events
     */
    handleClick(event) {
        // Request pointer lock on canvas click (if no UI open)
        if (event.target.id === 'canvas' && !this.isUIOpen()) {
            document.getElementById('canvas').requestPointerLock = 
                document.getElementById('canvas').requestPointerLock || 
                document.getElementById('canvas').mozRequestPointerLock;
            document.getElementById('canvas').requestPointerLock();
        }
    },

    /**
     * Update player input based on current key states
     */
    updateMovementInput() {
        let x = 0, y = 0, z = 0;

        if (this.isKeyPressed(this.keyBindings.forward)) z = 1;
        if (this.isKeyPressed(this.keyBindings.backward)) z = -1;
        if (this.isKeyPressed(this.keyBindings.right)) x = 1;
        if (this.isKeyPressed(this.keyBindings.left)) x = -1;

        if (this.isKeyPressed(this.keyBindings.jump)) {
            if (PlayerController.movement.isFreeFlight) {
                y = 1;  // Up in free flight
            } else {
                y = 1;  // Jump trigger in walking
            }
        }

        if (this.isKeyPressed(this.keyBindings.sprint)) {
            PlayerController.movement.isSprinting = true;
        } else {
            PlayerController.movement.isSprinting = false;
        }

        // Down in free flight
        if (this.isKeyPressed(['Shift']) && PlayerController.movement.isFreeFlight) {
            y = -1;
        }

        PlayerController.setMovementInput(x, y, z);
    },

    /**
     * Update camera look based on mouse movement
     */
    updateMouseLook() {
        if (!this.mouse.isLocked) {
            this.mouse.deltaX = 0;
            this.mouse.deltaY = 0;
            return;
        }

        if (this.mouse.deltaX !== 0 || this.mouse.deltaY !== 0) {
            CameraSystem.handleMouseMove(this.mouse.deltaX, this.mouse.deltaY);
        }
    },

    /**
     * Check if key binding is pressed
     */
    isKeyPressed(keys) {
        for (let key of keys) {
            if (this.keys[key]) return true;
        }
        return false;
    },

    /**
     * Match key against binding
     */
    matchesBinding(key, binding) {
        return binding.includes(key);
    },

    /**
     * Check if any UI is open
     */
    isUIOpen() {
        const devConsole = document.getElementById('devConsole');
        const helpPanel = document.getElementById('helpPanel');
        
        return !devConsole.classList.contains('hidden') || 
               !helpPanel.classList.contains('hidden');
    },

    /**
     * Update pointer lock indicator
     */
    updatePointerLockIndicator() {
        const indicator = document.getElementById('pointerLockIndicator');
        const body = document.body;
        
        if (this.mouse.isLocked) {
            body.classList.add('pointer-locked');
        } else {
            body.classList.remove('pointer-locked');
        }
    },

    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    },

    /**
     * Process all input (call each frame)
     */
    processInput() {
        this.updateMovementInput();
        this.updateMouseLook();
    },
};

DebugSystem.info('Input handler loaded');
