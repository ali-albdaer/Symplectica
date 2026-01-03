/**
 * Solar System Simulation - Player Controller
 * ============================================
 * First-person player with walking and flight modes.
 */

class Player {
    constructor() {
        // Position and physics
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Player dimensions
        this.height = Config.player.height;
        this.radius = Config.player.radius;
        this.mass = Config.player.mass;
        
        // State
        this.isFlying = false;
        this.isGrounded = false;
        this.isRunning = false;
        this.isThirdPerson = false;
        
        // Ground info
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        this.currentPlanet = null;
        
        // Camera
        this.camera = null;
        this.cameraOffset = new THREE.Vector3(0, this.height * 0.9, 0);
        
        // Third person camera state
        this.thirdPersonTarget = new THREE.Vector3();
        this.thirdPersonActual = new THREE.Vector3();
        this.thirdPersonVelocity = new THREE.Vector3();
        
        // Movement input
        this.moveInput = new THREE.Vector3();
        this.lookInput = new THREE.Vector2();
        
        // Pitch limits
        this.minPitch = -Math.PI / 2 + 0.01;
        this.maxPitch = Math.PI / 2 - 0.01;
        
        // Held object
        this.heldObject = null;
        
        // Smoothing
        this.smoothVelocity = new THREE.Vector3();
        
        Logger.info('Player controller initialized');
    }
    
    /**
     * Initialize with camera
     */
    init(camera) {
        this.camera = camera;
        this.updateCameraFOV();
    }
    
    /**
     * Spawn player on a planet
     */
    spawnOn(planet) {
        if (!planet) {
            Logger.error('Cannot spawn player: no planet specified');
            return;
        }
        
        const spawn = planet.getPlayerSpawnPosition();
        this.position.copy(spawn.position);
        this.groundNormal.copy(spawn.normal);
        this.currentPlanet = planet;
        
        // Orient camera to look along surface
        // Calculate up direction (away from planet center)
        const up = spawn.normal;
        
        // Calculate initial forward direction (tangent to surface)
        const right = new THREE.Vector3(1, 0, 0);
        if (Math.abs(up.dot(right)) > 0.99) {
            right.set(0, 0, 1);
        }
        const forward = new THREE.Vector3().crossVectors(right, up).normalize();
        
        // Set rotation
        this.rotation.y = Math.atan2(forward.x, forward.z);
        this.rotation.x = 0;
        
        this.velocity.set(0, 0, 0);
        this.isGrounded = true;
        
        Logger.info(`Player spawned on ${planet.name}`);
    }
    
    /**
     * Update player each frame
     */
    update(deltaTime) {
        // Process look input
        this.processLookInput();
        
        // Process movement
        if (this.isFlying) {
            this.updateFlyingMovement(deltaTime);
        } else {
            this.updateWalkingMovement(deltaTime);
        }
        
        // Update camera
        this.updateCamera(deltaTime);
        
        // Update held object
        this.updateHeldObject();
        
        // Clear inputs
        this.lookInput.set(0, 0);
    }
    
    /**
     * Process look/rotation input
     */
    processLookInput() {
        const sensitivity = Config.player.mouseSensitivity;
        
        // Apply look input
        this.rotation.y -= this.lookInput.x * sensitivity;
        this.rotation.x -= this.lookInput.y * sensitivity;
        
        // Clamp pitch
        this.rotation.x = MathUtils.clamp(this.rotation.x, this.minPitch, this.maxPitch);
        
        // Wrap yaw
        if (this.rotation.y > Math.PI) this.rotation.y -= MathUtils.TWO_PI;
        if (this.rotation.y < -Math.PI) this.rotation.y += MathUtils.TWO_PI;
    }
    
    /**
     * Update walking movement
     */
    updateWalkingMovement(deltaTime) {
        // Get movement direction relative to camera
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        
        // Apply yaw rotation only (not pitch) for ground movement
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.rotation.y
        );
        
        forward.applyQuaternion(yawQuat);
        right.applyQuaternion(yawQuat);
        
        // Project onto ground plane if grounded
        if (this.isGrounded && this.groundNormal) {
            forward.copy(MathUtils.projectOnPlane(forward, this.groundNormal));
            forward.normalize();
            right.copy(MathUtils.projectOnPlane(right, this.groundNormal));
            right.normalize();
        }
        
        // Calculate desired velocity
        const speed = this.isRunning ? Config.player.runSpeed : Config.player.walkSpeed;
        const desiredVelocity = new THREE.Vector3();
        
        desiredVelocity.addScaledVector(forward, this.moveInput.z * speed);
        desiredVelocity.addScaledVector(right, this.moveInput.x * speed);
        
        // Smooth velocity
        const smoothing = Config.player.movementSmoothing;
        this.smoothVelocity.lerp(desiredVelocity, 1 - Math.pow(smoothing, deltaTime));
        
        // Apply horizontal movement (gravity handled by physics engine)
        if (this.isGrounded) {
            // Only apply horizontal velocity, preserve vertical from physics
            this.velocity.x = this.smoothVelocity.x;
            this.velocity.z = this.smoothVelocity.z;
        } else {
            // Air control (reduced)
            this.velocity.x += this.smoothVelocity.x * deltaTime * 2;
            this.velocity.z += this.smoothVelocity.z * deltaTime * 2;
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
    
    /**
     * Update flying movement (6-DOF)
     */
    updateFlyingMovement(deltaTime) {
        // Get movement direction relative to camera (full 3D)
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        
        // Apply full rotation
        const quat = new THREE.Quaternion().setFromEuler(this.rotation);
        forward.applyQuaternion(quat);
        right.applyQuaternion(quat);
        // Up stays world-relative for easier control
        
        // Calculate desired velocity
        const speed = this.isRunning ? Config.player.fastFlySpeed : Config.player.flySpeed;
        const desiredVelocity = new THREE.Vector3();
        
        desiredVelocity.addScaledVector(forward, this.moveInput.z * speed);
        desiredVelocity.addScaledVector(right, this.moveInput.x * speed);
        desiredVelocity.addScaledVector(up, this.moveInput.y * speed);
        
        // Smooth velocity
        const smoothing = Config.player.movementSmoothing;
        this.velocity.lerp(desiredVelocity, 1 - Math.pow(smoothing, deltaTime));
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
    
    /**
     * Update camera position
     */
    updateCamera(deltaTime) {
        if (!this.camera) return;
        
        if (this.isThirdPerson) {
            this.updateThirdPersonCamera(deltaTime);
        } else {
            this.updateFirstPersonCamera();
        }
    }
    
    /**
     * First person camera update
     */
    updateFirstPersonCamera() {
        // Position camera at eye level
        this.camera.position.copy(this.position).add(this.cameraOffset);
        
        // Apply rotation
        this.camera.rotation.copy(this.rotation);
    }
    
    /**
     * Third person camera update with smooth following
     */
    updateThirdPersonCamera(deltaTime) {
        const distance = Config.player.thirdPersonDistance;
        const height = Config.player.thirdPersonHeight;
        
        // Calculate ideal camera position (behind and above player)
        const offset = new THREE.Vector3(0, height, distance);
        
        // Rotate offset by player yaw
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            this.rotation.y
        );
        offset.applyQuaternion(yawQuat);
        
        // Target position
        this.thirdPersonTarget.copy(this.position).add(offset);
        
        // Smooth camera movement using spring physics
        const smoothing = Config.player.cameraSmoothing;
        const stiffness = 10;
        const damping = 5;
        
        // Spring towards target
        const displacement = this.thirdPersonActual.clone().sub(this.thirdPersonTarget);
        const springForce = displacement.multiplyScalar(-stiffness);
        const dampingForce = this.thirdPersonVelocity.clone().multiplyScalar(-damping);
        
        const acceleration = springForce.add(dampingForce);
        this.thirdPersonVelocity.add(acceleration.multiplyScalar(deltaTime));
        this.thirdPersonActual.add(this.thirdPersonVelocity.clone().multiplyScalar(deltaTime));
        
        // Set camera position
        this.camera.position.copy(this.thirdPersonActual);
        
        // Look at player
        const lookTarget = this.position.clone();
        lookTarget.y += this.height * 0.8;
        this.camera.lookAt(lookTarget);
    }
    
    /**
     * Jump action
     */
    jump() {
        if (!this.isGrounded || this.isFlying) return;
        
        // Apply jump force in direction away from planet
        const jumpVelocity = this.groundNormal.clone().multiplyScalar(Config.player.jumpForce);
        this.velocity.add(jumpVelocity);
        this.isGrounded = false;
        
        Logger.debug('Player jumped');
    }
    
    /**
     * Toggle flight mode
     */
    toggleFlightMode() {
        this.isFlying = !this.isFlying;
        
        if (this.isFlying) {
            // Clear velocity when entering flight mode
            this.velocity.set(0, 0, 0);
        }
        
        Logger.info(`Flight mode: ${this.isFlying ? 'ON' : 'OFF'}`);
        this.updateModeIndicator();
    }
    
    /**
     * Toggle camera view
     */
    toggleCameraView() {
        this.isThirdPerson = !this.isThirdPerson;
        
        if (this.isThirdPerson) {
            // Initialize third person camera position
            this.thirdPersonActual.copy(this.camera.position);
            this.thirdPersonVelocity.set(0, 0, 0);
        }
        
        this.updateCameraFOV();
        Logger.info(`Camera view: ${this.isThirdPerson ? '3rd Person' : '1st Person'}`);
        this.updateModeIndicator();
    }
    
    /**
     * Update camera FOV based on view mode
     */
    updateCameraFOV() {
        if (!this.camera) return;
        
        const fov = this.isThirdPerson ? 
            Config.player.thirdPersonFOV : 
            Config.player.firstPersonFOV;
        
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Update mode indicator UI
     */
    updateModeIndicator() {
        const flightEl = document.getElementById('flight-mode');
        const cameraEl = document.getElementById('camera-mode');
        
        if (flightEl) {
            flightEl.textContent = this.isFlying ? 'FLYING' : 'WALKING';
            flightEl.classList.toggle('flying', this.isFlying);
        }
        
        if (cameraEl) {
            cameraEl.textContent = this.isThirdPerson ? '3RD PERSON' : '1ST PERSON';
        }
    }
    
    /**
     * Set movement input
     */
    setMoveInput(x, y, z) {
        this.moveInput.set(x, y, z);
    }
    
    /**
     * Set look input
     */
    setLookInput(x, y) {
        this.lookInput.set(x, y);
    }
    
    /**
     * Grab/release object
     */
    grabObject(object) {
        if (this.heldObject) {
            this.releaseObject();
        }
        
        this.heldObject = object;
        object.hold();
        Logger.debug(`Grabbed: ${object.name}`);
    }
    
    /**
     * Release held object
     */
    releaseObject(throwForce = 0) {
        if (!this.heldObject) return;
        
        if (throwForce > 0) {
            // Calculate throw velocity
            const forward = new THREE.Vector3(0, 0, -1);
            const quat = new THREE.Quaternion().setFromEuler(this.rotation);
            forward.applyQuaternion(quat);
            forward.multiplyScalar(throwForce);
            
            // Add player velocity
            forward.add(this.velocity);
            
            this.heldObject.release(forward);
        } else {
            this.heldObject.release();
        }
        
        Logger.debug(`Released: ${this.heldObject.name}`);
        this.heldObject = null;
    }
    
    /**
     * Update held object position
     */
    updateHeldObject() {
        if (!this.heldObject || !this.camera) return;
        
        // Position in front of camera
        const holdDistance = Config.interactiveObjects.holdDistance;
        const forward = new THREE.Vector3(0, 0, -holdDistance);
        
        const quat = new THREE.Quaternion().setFromEuler(this.rotation);
        forward.applyQuaternion(quat);
        
        this.heldObject.position.copy(this.position).add(this.cameraOffset).add(forward);
        this.heldObject.updateMesh();
    }
    
    /**
     * Raycast from camera for object interaction
     */
    getRaycast() {
        if (!this.camera) return null;
        
        const direction = new THREE.Vector3(0, 0, -1);
        const quat = new THREE.Quaternion().setFromEuler(this.rotation);
        direction.applyQuaternion(quat);
        
        return {
            origin: this.camera.position.clone(),
            direction: direction
        };
    }
    
    /**
     * Get player state for telemetry
     */
    getState() {
        return {
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            isFlying: this.isFlying,
            isGrounded: this.isGrounded,
            currentPlanet: this.currentPlanet?.name || 'None'
        };
    }
}
