/**
 * Player.js - Player Controller & Camera System
 * Manages player physics, movement, input, and camera transitions
 */

class Player {
    constructor(config, physicsEngine, renderer, inputManager) {
        this.config = config;
        this.physics = physicsEngine;
        this.renderer = renderer;
        this.input = inputManager;
        
        // Player state
        this.position = { ...config.PLAYER.SPAWN_POSITION };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.direction = { x: 0, y: 0, z: 1 };
        this.isGrounded = false;
        this.isFlying = false;
        
        // Camera modes
        this.cameraMode = 'FIRST_PERSON'; // 'FIRST_PERSON' or 'THIRD_PERSON'
        this.firstPersonOffset = { x: 0, y: config.PLAYER.CAMERA_HEIGHT, z: 0 };
        this.thirdPersonDistance = config.PLAYER.THIRD_PERSON_DISTANCE;
        this.thirdPersonHeight = config.PLAYER.THIRD_PERSON_HEIGHT;
        
        // Camera
        this.camera = renderer.getCamera();
        this.lookDir = { x: 0, y: 0, z: 1 };
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.quat = new THREE.Quaternion();
        
        // Grabbed object
        this.heldObject = null;
        this.grabForce = config.INTERACTION.GRAB_FORCE;
        
        // Ground detection
        this.groundCheckDistance = 2;
        this.groundNormal = { x: 0, y: 1, z: 0 };
        
        Logger.info('Player initialized at ' + JSON.stringify(this.position));
    }

    /**
     * Update player state
     */
    update(deltaTime) {
        this.handleInput(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateCamera(deltaTime);
        this.updateGrabbedObject(deltaTime);
    }

    /**
     * Handle player input for movement
     */
    handleInput(deltaTime) {
        const input = this.input;
        
        // Get camera forward and right vectors
        const cameraDir = new THREE.Vector3(0, 0, -1);
        cameraDir.applyQuaternion(this.camera.quaternion);
        const cameraRight = new THREE.Vector3(1, 0, 0);
        cameraRight.applyQuaternion(this.camera.quaternion);
        
        // Calculate movement direction
        let moveDir = new THREE.Vector3(0, 0, 0);
        
        if (input.keys['w'] || input.keys['W']) {
            moveDir.addScaledVector(cameraDir, 1);
        }
        if (input.keys['s'] || input.keys['S']) {
            moveDir.addScaledVector(cameraDir, -1);
        }
        if (input.keys['a'] || input.keys['A']) {
            moveDir.addScaledVector(cameraRight, -1);
        }
        if (input.keys['d'] || input.keys['D']) {
            moveDir.addScaledVector(cameraRight, 1);
        }
        
        // Normalize and apply movement
        if (moveDir.length() > 0) {
            moveDir.normalize();
        }
        
        if (this.isFlying) {
            // Flight mode - 6-DOF movement
            this.handleFlightMovement(moveDir, deltaTime);
        } else {
            // Walking mode - ground-based movement
            this.handleWalkingMovement(moveDir, deltaTime);
        }
        
        // Jump (walking mode only)
        if ((input.keys[' '] || input.keys['spacebar']) && this.isGrounded && !this.isFlying) {
            this.velocity.y = this.config.PLAYER.JUMP_FORCE;
            this.isGrounded = false;
        }
        
        // Up/Down in flight mode
        if (this.isFlying) {
            if (input.keys[' '] || input.keys['spacebar']) {
                this.velocity.y += this.config.PLAYER.FLIGHT_ACCELERATION * deltaTime;
            }
            if (input.keys['Shift'] || input.keys['shift']) {
                this.velocity.y -= this.config.PLAYER.FLIGHT_ACCELERATION * deltaTime;
            }
        }
    }

    /**
     * Handle walking movement (ground-based)
     */
    handleWalkingMovement(moveDir, deltaTime) {
        const accel = this.config.PLAYER.WALK_ACCELERATION;
        const decel = this.config.PLAYER.WALK_DECELERATION;
        const maxSpeed = this.config.PLAYER.WALK_SPEED;
        
        // Apply acceleration/deceleration
        if (moveDir.length() > 0) {
            this.velocity.x += moveDir.x * accel * deltaTime;
            this.velocity.z += moveDir.z * accel * deltaTime;
        } else {
            // Apply ground drag
            this.velocity.x *= 1 - this.config.PLAYER.GROUND_DRAG;
            this.velocity.z *= 1 - this.config.PLAYER.GROUND_DRAG;
        }
        
        // Limit speed
        const hSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        if (hSpeed > maxSpeed) {
            const scale = maxSpeed / hSpeed;
            this.velocity.x *= scale;
            this.velocity.z *= scale;
        }
        
        // Apply gravity
        this.velocity.y -= 9.81 * deltaTime; // Simple gravity
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Simple ground check (Y = 0)
        if (this.position.y <= 0) {
            this.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }

    /**
     * Handle flight movement (6-DOF)
     */
    handleFlightMovement(moveDir, deltaTime) {
        const accel = this.config.PLAYER.FLIGHT_ACCELERATION;
        const decel = this.config.PLAYER.FLIGHT_DECELERATION;
        const maxSpeed = this.config.PLAYER.FLIGHT_SPEED;
        const drag = this.config.PLAYER.FLIGHT_DRAG;
        
        // Apply acceleration/deceleration
        if (moveDir.length() > 0) {
            this.velocity.x += moveDir.x * accel * deltaTime;
            this.velocity.y += moveDir.y * accel * deltaTime;
            this.velocity.z += moveDir.z * accel * deltaTime;
        }
        
        // Apply drag
        this.velocity.x *= 1 - drag;
        this.velocity.z *= 1 - drag;
        
        // Limit speed
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            this.velocity.x *= scale;
            this.velocity.y *= scale;
            this.velocity.z *= scale;
        }
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
    }

    /**
     * Update camera with smooth transitions between modes
     */
    updateCamera(deltaTime) {
        // Update camera rotation from mouse
        const mouseDelta = this.input.getMouseDelta();
        const sensitivity = this.config.PLAYER.MOUSE_SENSITIVITY;
        
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.rotateY(-mouseDelta.x * sensitivity);
        this.euler.rotateX(-mouseDelta.y * sensitivity);
        
        // Clamp pitch
        this.euler.order = 'YXZ';
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        
        this.camera.quaternion.setFromEuler(this.euler);
        
        // Position camera
        if (this.cameraMode === 'FIRST_PERSON') {
            const camPos = {
                x: this.position.x + this.firstPersonOffset.x,
                y: this.position.y + this.firstPersonOffset.y,
                z: this.position.z + this.firstPersonOffset.z,
            };
            
            this.camera.position.lerp(
                new THREE.Vector3(camPos.x, camPos.y, camPos.z),
                this.config.PLAYER.CAMERA_LERP_SPEED
            );
        } else if (this.cameraMode === 'THIRD_PERSON') {
            // Position behind and above player
            const backDir = new THREE.Vector3(0, 0, 1);
            backDir.applyQuaternion(this.camera.quaternion);
            
            const camPos = {
                x: this.position.x - backDir.x * this.thirdPersonDistance,
                y: this.position.y + this.thirdPersonHeight,
                z: this.position.z - backDir.z * this.thirdPersonDistance,
            };
            
            this.camera.position.lerp(
                new THREE.Vector3(camPos.x, camPos.y, camPos.z),
                this.config.PLAYER.CAMERA_LERP_SPEED
            );
            
            // Look at player + offset
            const lookTarget = new THREE.Vector3(
                this.position.x,
                this.position.y + this.firstPersonOffset.y,
                this.position.z
            );
            const camLookDir = new THREE.Vector3();
            camLookDir.subVectors(lookTarget, this.camera.position);
            this.camera.lookAt(lookTarget);
        }
    }

    /**
     * Update grabbed object physics
     */
    updateGrabbedObject(deltaTime) {
        if (!this.heldObject) return;
        
        // Get grab point (in front of player)
        const grabDir = new THREE.Vector3(0, 0, -1);
        grabDir.applyQuaternion(this.camera.quaternion);
        
        const grabPoint = {
            x: this.position.x + grabDir.x * 5,
            y: this.position.y + this.firstPersonOffset.y + grabDir.y * 5,
            z: this.position.z + grabDir.z * 5,
        };
        
        // Apply attractive force to object
        const objPos = this.physics.getPosition(this.heldObject);
        if (objPos) {
            const dx = grabPoint.x - objPos.x;
            const dy = grabPoint.y - objPos.y;
            const dz = grabPoint.z - objPos.z;
            
            const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (distance > 0.1) {
                const dirX = dx / distance;
                const dirY = dy / distance;
                const dirZ = dz / distance;
                
                this.physics.applyForce(this.heldObject, {
                    x: dirX * this.grabForce,
                    y: dirY * this.grabForce,
                    z: dirZ * this.grabForce,
                });
            }
        }
    }

    /**
     * Update physics (called when not in flight mode primarily)
     */
    updatePhysics(deltaTime) {
        // Physics handled in handleWalkingMovement and handleFlightMovement
    }

    /**
     * Get player position
     */
    getPosition() {
        return { ...this.position };
    }

    /**
     * Get player forward direction
     */
    getForwardDirection() {
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        return { x: dir.x, y: dir.y, z: dir.z };
    }

    /**
     * Toggle flight mode
     */
    toggleFlight() {
        this.isFlying = !this.isFlying;
        if (this.isFlying) {
            this.velocity.y = 0; // Reset vertical velocity
            Logger.info('Flight mode enabled');
        } else {
            Logger.info('Flight mode disabled');
        }
    }

    /**
     * Toggle camera mode
     */
    toggleCameraMode() {
        if (this.cameraMode === 'FIRST_PERSON') {
            this.cameraMode = 'THIRD_PERSON';
            Logger.info('Camera mode: Third-Person');
        } else {
            this.cameraMode = 'FIRST_PERSON';
            Logger.info('Camera mode: First-Person');
        }
    }

    /**
     * Grab an object
     */
    grabObject(objectName) {
        this.heldObject = objectName;
        Logger.info(`Holding: ${objectName}`);
    }

    /**
     * Release held object
     */
    releaseObject() {
        if (this.heldObject) {
            Logger.info(`Released: ${this.heldObject}`);
        }
        this.heldObject = null;
    }

    /**
     * Check if holding an object
     */
    isHoldingObject() {
        return this.heldObject !== null;
    }
}
