/**
 * ============================================
 * Player Entity
 * ============================================
 * 
 * The player character with walking and flight modes.
 * Handles movement, gravity, jumping, and object interaction.
 */

class Player extends Entity {
    constructor(config = {}) {
        super(config);
        
        this.type = 'player';
        this.name = 'Player';
        
        // Physical properties
        this.physicsData.mass = CONFIG.PLAYER.MASS;
        this.physicsData.radius = CONFIG.PLAYER.RADIUS;
        this.height = CONFIG.PLAYER.HEIGHT;
        
        // Movement settings
        this.walkSpeed = CONFIG.PLAYER.WALK_SPEED;
        this.runSpeed = CONFIG.PLAYER.RUN_SPEED;
        this.flightSpeed = CONFIG.PLAYER.FLIGHT_SPEED;
        this.flightSpeedFast = CONFIG.PLAYER.FLIGHT_SPEED_FAST;
        this.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
        
        // Camera sensitivity
        this.mouseSensitivity = CONFIG.PLAYER.MOUSE_SENSITIVITY;
        
        // State
        this.isFlying = false;
        this.isGrounded = false;
        this.isJumping = false;
        this.currentBody = null; // The celestial body we're on
        
        // Camera control
        this.yaw = 0;   // Horizontal rotation
        this.pitch = 0; // Vertical rotation
        
        // Local coordinate system (on planet surface)
        this.localUp = new THREE.Vector3(0, 1, 0);
        this.localForward = new THREE.Vector3(0, 0, -1);
        this.localRight = new THREE.Vector3(1, 0, 0);
        
        // Orientation quaternion
        this.orientation = new THREE.Quaternion();
        
        // Object holding
        this.heldObject = null;
        this.holdDistance = 2;
        
        // Input reference
        this.input = null;
        
        // Visual mesh (simple capsule)
        this.bodyMesh = null;
    }
    
    /**
     * Initialize the player
     */
    init(inputManager, spawnBody, fidelitySettings) {
        console.info('Initializing Player...');
        
        try {
            this.input = inputManager;
            
            // Create visual representation
            this.createMesh();
            
            // Spawn on the specified body
            if (spawnBody) {
                this.spawnOnBody(spawnBody);
            }
            
            this.isInitialized = true;
            console.success('Player initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Player: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Create player visual representation
     */
    createMesh() {
        // Simple capsule for the player body
        const bodyGeometry = new THREE.CapsuleGeometry(
            this.physicsData.radius,
            this.height - this.physicsData.radius * 2,
            8, 16
        );
        
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x44AA88,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.bodyMesh.castShadow = true;
        this.bodyMesh.receiveShadow = true;
        this.bodyMesh.name = 'PlayerBody';
        
        // Offset so feet are at origin
        this.bodyMesh.position.y = this.height / 2;
        
        this.group.add(this.bodyMesh);
    }
    
    /**
     * Spawn player on a celestial body's surface
     */
    spawnOnBody(body) {
        this.currentBody = body;
        
        const lat = CONFIG.PLAYER.SPAWN_LATITUDE;
        const lon = CONFIG.PLAYER.SPAWN_LONGITUDE;
        
        // Get surface position in km
        const surfacePos = body.getSurfacePosition(lat, lon);
        
        // Add player height offset (convert height to km)
        const heightKm = (this.height + 0.5) / 1000;
        const up = MathUtils.vec3.normalize({
            x: surfacePos.x - body.physicsData.position.x,
            y: surfacePos.y - body.physicsData.position.y,
            z: surfacePos.z - body.physicsData.position.z
        });
        
        this.physicsData.position = {
            x: surfacePos.x + up.x * heightKm,
            y: surfacePos.y + up.y * heightKm,
            z: surfacePos.z + up.z * heightKm
        };
        
        // Match body's velocity
        const surfaceVel = body.getSurfaceVelocity(lat, lon);
        this.physicsData.velocity = { ...surfaceVel };
        
        // Update local up vector
        this.localUp.set(up.x, up.y, up.z);
        
        // Calculate initial orientation
        this.updateOrientation();
        
        // Sync to render position
        this.syncFromPhysics();
        
        console.info(`Player spawned on ${body.name} at lat: ${lat}, lon: ${lon}`);
    }
    
    /**
     * Update the player each frame
     */
    update(deltaTime, physics, inputManager) {
        if (!this.isInitialized || !inputManager) return;
        
        // Handle mode toggles
        this.handleModeToggles(inputManager);
        
        // Handle camera look
        if (inputManager.isPointerLocked) {
            this.handleMouseLook(inputManager);
        }
        
        // Handle movement based on mode
        if (this.isFlying) {
            this.handleFlightMovement(deltaTime, inputManager);
        } else {
            this.handleWalkingMovement(deltaTime, physics, inputManager);
        }
        
        // Handle object interaction
        this.handleObjectInteraction(inputManager);
        
        // Update held object position
        if (this.heldObject) {
            this.updateHeldObject();
        }
        
        // Sync visual to physics
        this.syncFromPhysics();
        
        // Apply orientation
        this.group.quaternion.copy(this.orientation);
    }
    
    /**
     * Handle mode toggle inputs
     */
    handleModeToggles(input) {
        // Toggle flight mode
        if (input.isKeyJustPressed('f')) {
            this.isFlying = !this.isFlying;
            console.info(`Flight mode: ${this.isFlying ? 'ON' : 'OFF'}`);
        }
    }
    
    /**
     * Handle mouse look for camera rotation
     */
    handleMouseLook(input) {
        const delta = input.getMouseDelta();
        
        this.yaw -= delta.x * this.mouseSensitivity;
        this.pitch -= delta.y * this.mouseSensitivity;
        
        // Clamp pitch
        this.pitch = MathUtils.clamp(this.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
        
        // Update orientation
        this.updateOrientation();
    }
    
    /**
     * Update player orientation quaternion
     */
    updateOrientation() {
        // Calculate forward and right vectors from local up
        const worldUp = new THREE.Vector3(0, 1, 0);
        
        if (this.isFlying) {
            // In flight mode, use world coordinates
            this.orientation.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        } else {
            // On surface, align with local gravity
            const up = this.localUp.clone();
            
            // Find a reference forward direction
            let forward = new THREE.Vector3(0, 0, -1);
            if (Math.abs(up.dot(worldUp)) > 0.999) {
                forward = new THREE.Vector3(0, 0, -1);
            } else {
                // Cross product to get perpendicular forward
                forward = new THREE.Vector3().crossVectors(worldUp, up).cross(up).normalize();
            }
            
            // Create rotation matrix from local coordinate system
            const matrix = new THREE.Matrix4();
            const right = new THREE.Vector3().crossVectors(up, forward).normalize();
            forward.crossVectors(right, up).normalize();
            
            matrix.makeBasis(right, up, forward);
            
            // Apply yaw and pitch on top
            const localRotation = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ')
            );
            
            this.orientation.setFromRotationMatrix(matrix);
            this.orientation.multiply(localRotation);
            
            // Update local vectors
            this.localForward.set(0, 0, -1).applyQuaternion(this.orientation);
            this.localRight.set(1, 0, 0).applyQuaternion(this.orientation);
        }
    }
    
    /**
     * Handle walking/ground movement
     */
    handleWalkingMovement(deltaTime, physics, input) {
        if (!physics) return;
        
        // Get nearest body for gravity
        const { body, distance } = physics.getNearestBody(this.physicsData.position);
        
        if (body) {
            this.currentBody = body;
            
            // Update local up vector
            const bodyPos = body.physicsData.position;
            const up = MathUtils.vec3.normalize({
                x: this.physicsData.position.x - bodyPos.x,
                y: this.physicsData.position.y - bodyPos.y,
                z: this.physicsData.position.z - bodyPos.z
            });
            this.localUp.set(up.x, up.y, up.z);
            
            // Check if grounded
            const altitude = distance - body.physicsData.radius;
            const groundThreshold = 0.002; // 2 meters in km
            this.isGrounded = altitude <= groundThreshold;
            
            // Get movement input
            const moveInput = input.getMovementInput();
            
            // Calculate movement direction in world space
            const forward = this.localForward.clone();
            const right = this.localRight.clone();
            
            // Project onto surface tangent plane
            forward.sub(this.localUp.clone().multiplyScalar(forward.dot(this.localUp))).normalize();
            right.sub(this.localUp.clone().multiplyScalar(right.dot(this.localUp))).normalize();
            
            // Apply movement
            const speed = this.walkSpeed / 1000; // Convert to km/s
            const moveDir = new THREE.Vector3();
            
            moveDir.addScaledVector(forward, -moveInput.z);
            moveDir.addScaledVector(right, moveInput.x);
            
            if (moveDir.length() > 0) {
                moveDir.normalize().multiplyScalar(speed * deltaTime * CONFIG.PHYSICS.TIME_SCALE);
                
                // Apply to velocity (relative to body)
                this.physicsData.velocity.x = body.physicsData.velocity.x + moveDir.x / deltaTime * 1000;
                this.physicsData.velocity.y = body.physicsData.velocity.y + moveDir.y / deltaTime * 1000;
                this.physicsData.velocity.z = body.physicsData.velocity.z + moveDir.z / deltaTime * 1000;
            } else if (this.isGrounded) {
                // Match body velocity when not moving
                this.physicsData.velocity.x = body.physicsData.velocity.x;
                this.physicsData.velocity.y = body.physicsData.velocity.y;
                this.physicsData.velocity.z = body.physicsData.velocity.z;
            }
            
            // Jumping
            if (this.isGrounded && input.isKeyJustPressed(' ')) {
                const jumpVel = this.jumpForce / 1000; // km/s
                this.physicsData.velocity.x += this.localUp.x * jumpVel;
                this.physicsData.velocity.y += this.localUp.y * jumpVel;
                this.physicsData.velocity.z += this.localUp.z * jumpVel;
                this.isJumping = true;
                console.info('Jump!');
            }
            
            // Keep player on surface when grounded
            if (this.isGrounded && altitude < groundThreshold) {
                const targetAlt = body.physicsData.radius + (this.height / 2) / 1000;
                this.physicsData.position.x = bodyPos.x + up.x * targetAlt;
                this.physicsData.position.y = bodyPos.y + up.y * targetAlt;
                this.physicsData.position.z = bodyPos.z + up.z * targetAlt;
            }
        }
        
        // Update orientation
        this.updateOrientation();
    }
    
    /**
     * Handle flight movement
     */
    handleFlightMovement(deltaTime, input) {
        const moveInput = input.getMovementInput();
        
        // Get camera-relative directions
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.orientation);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.orientation);
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.orientation);
        
        // Calculate speed
        const speed = input.isKeyDown('shift') && moveInput.y < 0 
            ? this.flightSpeedFast 
            : this.flightSpeed;
        
        // Apply movement
        const velocity = new THREE.Vector3();
        velocity.addScaledVector(forward, -moveInput.z);
        velocity.addScaledVector(right, moveInput.x);
        velocity.addScaledVector(up, moveInput.y);
        
        if (velocity.length() > 0) {
            velocity.normalize().multiplyScalar(speed);
        }
        
        // In flight mode, position is in render units, need to convert
        const scale = CONFIG.PHYSICS.DISTANCE_SCALE;
        
        this.physicsData.position.x += velocity.x * deltaTime * scale;
        this.physicsData.position.y += velocity.y * deltaTime * scale;
        this.physicsData.position.z += velocity.z * deltaTime * scale;
        
        // Also update render velocity for visual consistency
        this.physicsData.velocity.x = velocity.x * scale;
        this.physicsData.velocity.y = velocity.y * scale;
        this.physicsData.velocity.z = velocity.z * scale;
    }
    
    /**
     * Handle object interaction (picking up/releasing)
     */
    handleObjectInteraction(input) {
        // Right click to grab/release
        if (input.isMouseButtonJustPressed(2)) { // Right click
            if (this.heldObject) {
                // Release object with throw velocity
                const throwDir = this.localForward.clone().multiplyScalar(5);
                this.heldObject.release({
                    x: throwDir.x,
                    y: throwDir.y,
                    z: throwDir.z
                });
                this.heldObject = null;
                
                // Update crosshair
                const crosshair = document.getElementById('crosshair');
                if (crosshair) crosshair.classList.remove('grabbing');
            }
        }
    }
    
    /**
     * Pick up an object
     */
    pickupObject(obj) {
        if (this.heldObject) {
            this.heldObject.release();
        }
        
        this.heldObject = obj;
        obj.pickup(this);
        
        // Update crosshair
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.classList.add('grabbing');
    }
    
    /**
     * Update held object position
     */
    updateHeldObject() {
        if (!this.heldObject) return;
        
        // Position in front of player
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.orientation);
        const holdPos = this.group.position.clone().add(
            forward.multiplyScalar(this.holdDistance)
        );
        
        this.heldObject.setHeldPosition(holdPos, this.orientation);
    }
    
    /**
     * Get camera position for first-person view
     */
    getFirstPersonCameraPosition() {
        const pos = this.group.position.clone();
        const eyeOffset = new THREE.Vector3(0, this.height * 0.4, 0);
        eyeOffset.applyQuaternion(this.orientation);
        return pos.add(eyeOffset);
    }
    
    /**
     * Get camera rotation
     */
    getCameraRotation() {
        return this.orientation.clone();
    }
    
    /**
     * Get look direction
     */
    getLookDirection() {
        return new THREE.Vector3(0, 0, -1).applyQuaternion(this.orientation);
    }
    
    /**
     * Sync from physics to render
     */
    syncFromPhysics() {
        if (this.group) {
            const scale = 1 / CONFIG.PHYSICS.DISTANCE_SCALE;
            this.group.position.set(
                this.physicsData.position.x * scale,
                this.physicsData.position.y * scale,
                this.physicsData.position.z * scale
            );
        }
    }
    
    /**
     * Get formatted position for HUD
     */
    getFormattedPosition() {
        const p = this.physicsData.position;
        return `${MathUtils.formatSI(p.x)}, ${MathUtils.formatSI(p.y)}, ${MathUtils.formatSI(p.z)} km`;
    }
    
    /**
     * Get formatted velocity for HUD
     */
    getFormattedVelocity() {
        const v = this.physicsData.velocity;
        const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return `${speed.toFixed(2)} km/s`;
    }
}
