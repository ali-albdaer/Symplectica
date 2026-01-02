/**
 * Player Controller - Handles player physics, movement, and interaction
 */

class PlayerController extends EntityBase {
    constructor() {
        super('Player', 'player');
        
        // Movement mode
        this.isFlying = false;
        
        // Movement state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
        this.isSprinting = false;
        
        // Physics state
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.isGrounded = false;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        this.currentPlanet = null;
        
        // Held object
        this.heldObject = null;
        
        // Temporary vectors for calculations
        this._tempVec = new THREE.Vector3();
        this._moveDirection = new THREE.Vector3();
        this._gravityDir = new THREE.Vector3();
    }
    
    /**
     * Initialize the player
     */
    init(scene, spawnPlanet, cameraController) {
        this.scene = scene;
        this.cameraController = cameraController;
        this.currentPlanet = spawnPlanet;
        
        // Get spawn position on planet surface
        const spawnPosition = spawnPlanet.getSpawnPosition(0, 0, Config.PLAYER.height * 2);
        
        // Create player mesh (simple capsule representation)
        this.createMesh();
        
        // Create physics body
        this.createPhysicsBody(spawnPosition, spawnPlanet);
        
        // Set initial gravity direction
        this.updateGravityDirection();
        
        scene.add(this.group);
        
        Logger.info('Player', `Spawned on ${spawnPlanet.name} at`, 
            `(${spawnPosition.x.toFixed(0)}, ${spawnPosition.y.toFixed(0)}, ${spawnPosition.z.toFixed(0)})`);
    }
    
    /**
     * Create player visual representation
     */
    createMesh() {
        const height = Config.PLAYER.height;
        const radius = Config.PLAYER.radius;
        
        // Create a simple capsule-like shape for the player body
        const bodyGeometry = new THREE.CylinderGeometry(radius, radius, height - radius * 2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        this.mesh.name = 'PlayerBody';
        
        // Offset so feet are at origin
        this.mesh.position.y = height / 2;
        
        // Add head sphere
        const headGeometry = new THREE.SphereGeometry(radius * 1.2, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = height - radius;
        head.castShadow = true;
        
        this.group.add(this.mesh);
        this.group.add(head);
    }
    
    /**
     * Create physics body
     */
    createPhysicsBody(position, planet) {
        // Get initial velocity to match planet surface velocity
        const surfaceVelocity = planet.getSurfaceVelocityAtPoint(position);
        
        this.physicsBody = PhysicsEngine.createBody({
            name: 'Player',
            x: position.x,
            y: position.y,
            z: position.z,
            vx: surfaceVelocity.x,
            vy: surfaceVelocity.y,
            vz: surfaceVelocity.z,
            mass: Config.PLAYER.mass,
            radius: Config.PLAYER.radius,
            isCelestial: false,
            isStatic: false,
            affectedByGravity: false,  // We handle gravity manually for player
            collisionEnabled: true,
            collisionGroup: 'player'
        });
        
        this.velocity.copy(surfaceVelocity);
    }
    
    /**
     * Update gravity direction based on nearby celestial bodies
     */
    updateGravityDirection() {
        const celestialBodies = PhysicsEngine.getCelestialBodies();
        const gravity = GravitySolver.getGravityAtPoint(
            this.physicsBody.position, 
            celestialBodies
        );
        
        if (gravity.length() > 0) {
            this._gravityDir.copy(gravity).normalize();
        } else {
            this._gravityDir.set(0, -1, 0);  // Default down
        }
        
        // Store gravity magnitude
        this.gravityMagnitude = gravity.length();
        
        // Ground normal is opposite of gravity
        this.groundNormal.copy(this._gravityDir).negate();
    }
    
    /**
     * Update player movement
     */
    update(deltaTime) {
        if (!this.physicsBody) return;
        
        // Update gravity direction
        this.updateGravityDirection();
        
        // Check if grounded
        this.checkGrounded();
        
        // Find closest planet
        this.updateCurrentPlanet();
        
        if (this.isFlying) {
            this.updateFlightMode(deltaTime);
        } else {
            this.updateWalkingMode(deltaTime);
        }
        
        // Apply velocity to position
        this.physicsBody.position.addScaledVector(this.velocity, deltaTime);
        
        // Update visual position
        this.group.position.copy(this.physicsBody.position);
        
        // Orient player to stand "upright" relative to gravity
        this.updateOrientation();
        
        // Update held object position
        if (this.heldObject) {
            this.updateHeldObject();
        }
        
        super.update(deltaTime);
    }
    
    /**
     * Update movement in walking mode
     */
    updateWalkingMode(deltaTime) {
        const speed = this.isSprinting ? Config.PLAYER.runSpeed : Config.PLAYER.walkSpeed;
        
        // Get camera-relative movement direction
        this._moveDirection.set(0, 0, 0);
        
        const forward = this.cameraController.getForwardDirection();
        const right = this.cameraController.getRightDirection();
        
        // Project forward/right onto the plane perpendicular to gravity
        const up = this.groundNormal;
        
        // Forward: remove component along gravity direction
        const flatForward = forward.clone();
        flatForward.addScaledVector(up, -forward.dot(up));
        flatForward.normalize();
        
        // Right: remove component along gravity direction
        const flatRight = right.clone();
        flatRight.addScaledVector(up, -right.dot(up));
        flatRight.normalize();
        
        if (this.moveForward) this._moveDirection.add(flatForward);
        if (this.moveBackward) this._moveDirection.sub(flatForward);
        if (this.moveRight) this._moveDirection.add(flatRight);
        if (this.moveLeft) this._moveDirection.sub(flatRight);
        
        if (this._moveDirection.lengthSq() > 0) {
            this._moveDirection.normalize();
        }
        
        // Target velocity in movement plane
        const targetVelLocal = this._moveDirection.clone().multiplyScalar(speed);
        
        // Add current planet's surface velocity
        if (this.currentPlanet) {
            const surfaceVel = this.currentPlanet.getSurfaceVelocityAtPoint(this.physicsBody.position);
            targetVelLocal.add(surfaceVel);
        }
        
        // Decompose current velocity into gravity-aligned and perpendicular components
        const velAlongGravity = this._gravityDir.clone().multiplyScalar(
            this.velocity.dot(this._gravityDir)
        );
        
        // Smoothly transition horizontal velocity
        const velHorizontal = this.velocity.clone().sub(velAlongGravity);
        velHorizontal.lerp(targetVelLocal, 10 * deltaTime);
        
        // Apply gravity if not grounded
        if (!this.isGrounded) {
            velAlongGravity.addScaledVector(this._gravityDir, this.gravityMagnitude * deltaTime);
        } else {
            // Snap to surface - zero out velocity toward ground
            const velTowardGround = velAlongGravity.dot(this._gravityDir);
            if (velTowardGround > 0) {  // Moving toward ground
                velAlongGravity.set(0, 0, 0);
            }
        }
        
        // Recombine velocity
        this.velocity.copy(velHorizontal).add(velAlongGravity);
    }
    
    /**
     * Update movement in flight mode
     */
    updateFlightMode(deltaTime) {
        const speed = this.isSprinting ? Config.PLAYER.flySprintSpeed : Config.PLAYER.flySpeed;
        const acceleration = Config.PLAYER.flyAcceleration;
        
        // Get camera directions
        const forward = this.cameraController.getForwardDirection();
        const right = this.cameraController.getRightDirection();
        const up = new THREE.Vector3(0, 1, 0);
        
        // In fly mode, up is always world up (or could be camera up)
        // For space, use camera-relative up
        const cameraUp = this.cameraController.getUpDirection();
        
        // Calculate input direction
        this._moveDirection.set(0, 0, 0);
        
        if (this.moveForward) this._moveDirection.add(forward);
        if (this.moveBackward) this._moveDirection.sub(forward);
        if (this.moveRight) this._moveDirection.add(right);
        if (this.moveLeft) this._moveDirection.sub(right);
        if (this.moveUp) this._moveDirection.add(cameraUp);
        if (this.moveDown) this._moveDirection.sub(cameraUp);
        
        if (this._moveDirection.lengthSq() > 0) {
            this._moveDirection.normalize();
            
            // Accelerate in input direction
            this.velocity.addScaledVector(this._moveDirection, acceleration * deltaTime);
        }
        
        // Clamp to max speed
        if (this.velocity.length() > speed) {
            this.velocity.normalize().multiplyScalar(speed);
        }
        
        // Apply damping when not moving
        if (this._moveDirection.lengthSq() === 0) {
            this.velocity.multiplyScalar(Config.PLAYER.flyDamping);
        }
    }
    
    /**
     * Check if player is grounded on a surface
     */
    checkGrounded() {
        const celestialBodies = PhysicsEngine.getCelestialBodies();
        const result = PhysicsEngine.getClosestCelestialBody(this.physicsBody.position);
        
        if (!result.body) {
            this.isGrounded = false;
            return;
        }
        
        // Check distance from surface
        const tolerance = Config.PLAYER.height * 0.1;
        this.isGrounded = result.distance <= tolerance;
        
        // If we're below surface, push up
        if (result.distance < 0) {
            const normal = PhysicsEngine.getSurfaceNormal(
                this.physicsBody.position, 
                result.body
            );
            this.physicsBody.position.addScaledVector(normal, -result.distance);
        }
    }
    
    /**
     * Update current planet reference
     */
    updateCurrentPlanet() {
        const result = PhysicsEngine.getClosestCelestialBody(this.physicsBody.position);
        if (result.body && result.body !== this.currentPlanet) {
            // Check if we're in this planet's sphere of influence
            const hillSphere = result.body.radius * 10;  // Simplified
            if (result.distance < hillSphere) {
                this.currentPlanet = result.body;
                Logger.debug('Player', `Now in ${result.body.name}'s gravity well`);
            }
        }
    }
    
    /**
     * Update player orientation to match local "up"
     */
    updateOrientation() {
        // Create rotation that aligns Y-axis with ground normal
        const up = this.groundNormal;
        const forward = this.cameraController.getForwardDirection();
        
        // Project forward onto ground plane
        const flatForward = forward.clone();
        flatForward.addScaledVector(up, -forward.dot(up));
        
        if (flatForward.lengthSq() > 0.001) {
            flatForward.normalize();
            
            const quaternion = new THREE.Quaternion();
            const matrix = new THREE.Matrix4();
            
            const right = new THREE.Vector3().crossVectors(up, flatForward).normalize();
            const adjustedForward = new THREE.Vector3().crossVectors(right, up).normalize();
            
            matrix.makeBasis(right, up, adjustedForward.negate());
            quaternion.setFromRotationMatrix(matrix);
            
            this.group.quaternion.slerp(quaternion, 0.1);
        }
    }
    
    /**
     * Jump (walking mode only)
     */
    jump() {
        if (!this.isGrounded || this.isFlying) return;
        
        // Jump in direction opposite to gravity
        const jumpVelocity = this.groundNormal.clone()
            .multiplyScalar(Config.PLAYER.jumpForce);
        
        this.velocity.add(jumpVelocity);
        this.isGrounded = false;
        
        Logger.debug('Player', 'Jump!');
    }
    
    /**
     * Toggle flight mode
     */
    toggleFlightMode() {
        this.isFlying = !this.isFlying;
        Logger.info('Player', `Flight mode: ${this.isFlying ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Get the position for the camera
     */
    getCameraPosition() {
        const eyeHeight = Config.PLAYER.eyeHeight;
        const eyeOffset = this.groundNormal.clone().multiplyScalar(eyeHeight);
        return this.physicsBody.position.clone().add(eyeOffset);
    }
    
    /**
     * Try to grab an object
     */
    tryGrab(interactiveObjects) {
        if (this.heldObject) {
            this.releaseObject();
            return null;
        }
        
        const grabDistance = Config.PLAYER.grabDistance;
        const cameraPos = this.getCameraPosition();
        const lookDir = this.cameraController.getForwardDirection();
        
        let closestObj = null;
        let closestDist = grabDistance;
        
        for (const obj of interactiveObjects) {
            if (obj.isHeld) continue;
            
            // Ray-sphere intersection
            const toObj = obj.group.position.clone().sub(cameraPos);
            const dist = toObj.length();
            
            if (dist < closestDist) {
                // Check if object is roughly in front of camera
                const dot = toObj.normalize().dot(lookDir);
                if (dot > 0.7) {  // Within ~45 degree cone
                    closestDist = dist;
                    closestObj = obj;
                }
            }
        }
        
        if (closestObj) {
            closestObj.grab();
            this.heldObject = closestObj;
            return closestObj;
        }
        
        return null;
    }
    
    /**
     * Release held object
     */
    releaseObject(throwForce = 0) {
        if (!this.heldObject) return;
        
        if (throwForce > 0) {
            const throwDir = this.cameraController.getForwardDirection();
            const throwVel = throwDir.multiplyScalar(throwForce);
            throwVel.add(this.velocity);
            this.heldObject.release(throwVel);
        } else {
            this.heldObject.release(this.velocity.clone());
        }
        
        this.heldObject = null;
    }
    
    /**
     * Update held object position
     */
    updateHeldObject() {
        if (!this.heldObject) return;
        
        const holdDistance = Config.PLAYER.holdDistance;
        const cameraPos = this.getCameraPosition();
        const lookDir = this.cameraController.getForwardDirection();
        
        const holdPosition = cameraPos.clone()
            .add(lookDir.multiplyScalar(holdDistance));
        
        this.heldObject.setPosition(holdPosition);
    }
    
    /**
     * Get raycast info for what player is looking at
     */
    getLookTarget(maxDistance, objects) {
        const cameraPos = this.getCameraPosition();
        const lookDir = this.cameraController.getForwardDirection();
        
        let closestObj = null;
        let closestDist = maxDistance;
        
        for (const obj of objects) {
            const toObj = obj.group.position.clone().sub(cameraPos);
            const dist = toObj.length();
            
            if (dist < closestDist) {
                const dot = toObj.normalize().dot(lookDir);
                if (dot > 0.9) {  // Tighter cone for targeting
                    closestDist = dist;
                    closestObj = obj;
                }
            }
        }
        
        return { object: closestObj, distance: closestDist };
    }
    
    /**
     * Get world position
     */
    getWorldPosition() {
        return this.physicsBody.position.clone();
    }
    
    /**
     * Get velocity magnitude
     */
    getSpeed() {
        return this.velocity.length();
    }
    
    /**
     * Get relative velocity (relative to current planet surface)
     */
    getRelativeSpeed() {
        if (!this.currentPlanet) return this.getSpeed();
        
        const surfaceVel = this.currentPlanet.getSurfaceVelocityAtPoint(
            this.physicsBody.position
        );
        return this.velocity.clone().sub(surfaceVel).length();
    }
}

window.PlayerController = PlayerController;
