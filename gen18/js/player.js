/**
 * Player Controller
 * Handles player movement, jumping, and interaction with dual-mode controls
 */
class Player extends Entity {
    constructor(id, scene) {
        const config = {
            type: 'player',
            name: 'Player',
            mass: Config.player.mass,
            radius: Config.player.radius,
            position: { x: 50, y: 10, z: 0 }
        };
        
        super(id, config);
        
        this.scene = scene;
        this.eyeHeight = Config.player.eyeHeight;
        
        // Movement
        this.moveDirection = new THREE.Vector3();
        this.moveInput = new THREE.Vector3();
        this.isGrounded = false;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        this.canJump = true;
        this.jumpCooldown = 0;
        
        // Modes
        this.freeFlyMode = false;
        this.freeFlyVelocity = new THREE.Vector3();
        this.localUp = new THREE.Vector3(0, 1, 0);
        
        // Interaction
        this.heldObject = null;
        this.grabOffset = new THREE.Vector3();
        this.grabDistance = 5;
        
        // Raycasting
        this.rayOrigin = new THREE.Vector3();
        this.rayDirection = new THREE.Vector3();
        
        this.lastFramePosition = this.position.clone();
    }

    /**
     * Create capsule physics body for player
     */
    createPhysicsBody(physicsEngine) {
        const capsuleShape = new CANNON.Sphere(this.radius);
        
        this.physicsBody = physicsEngine.addBody(this.id, {
            mass: this.mass,
            shape: capsuleShape,
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            velocity: new CANNON.Vec3(0, 0, 0),
            linearDamping: Config.player.groundDrag,
            angularDamping: Config.physics.angularDamping
        });

        return this.physicsBody;
    }

    /**
     * Set movement input
     */
    setMovementInput(x, y, z) {
        this.moveInput.set(x, y, z).normalize();
    }

    /**
     * Apply gravity-aligned movement
     */
    applyMovement(deltaTime, cameraDirection) {
        if (this.freeFlyMode) {
            this.applyFreeFlyMovement(deltaTime, cameraDirection);
        } else {
            this.applyWalkMovement(deltaTime, cameraDirection);
        }
    }

    /**
     * Walking movement with ground-relative controls
     */
    applyWalkMovement(deltaTime, cameraDirection) {
        if (!this.physicsBody) return;

        // Align local up with gravity center if close to celestial body
        this.alignLocalUp();

        // Get camera forward/right relative to local up
        const forward = cameraDirection.clone();
        const worldUp = this.localUp;
        
        // Project forward onto plane perpendicular to local up
        const projForward = forward.clone().sub(worldUp.clone().multiplyScalar(forward.dot(worldUp))).normalize();
        
        // Get right vector
        const right = new THREE.Vector3().crossVectors(worldUp, projForward).normalize();
        
        // Calculate movement direction
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(projForward, this.moveInput.z);
        moveDir.addScaledVector(right, this.moveInput.x);
        
        if (moveDir.length() > 0.01) {
            moveDir.normalize();
            
            // Apply acceleration
            const targetVelocity = moveDir.multiplyScalar(Config.player.walkSpeed);
            const currentSpeed = this.physicsBody.velocity.length();
            
            const velocity = new THREE.Vector3(
                this.physicsBody.velocity.x,
                this.physicsBody.velocity.y,
                this.physicsBody.velocity.z
            );
            
            const horizontalVel = velocity.clone().sub(worldUp.clone().multiplyScalar(velocity.dot(worldUp)));
            
            if (horizontalVel.length() < Config.player.walkSpeed) {
                const accel = moveDir.multiplyScalar(Config.player.moveAccel * deltaTime);
                this.physicsBody.velocity.x += accel.x;
                this.physicsBody.velocity.y += accel.y;
                this.physicsBody.velocity.z += accel.z;
            }
        }

        // Apply drag
        const drag = this.isGrounded ? Config.player.groundDrag : Config.player.airDrag;
        this.physicsBody.velocity.x *= drag;
        this.physicsBody.velocity.z *= drag;

        // Maintain vertical velocity for jumps
        const verticalVel = this.physicsBody.velocity.dot(worldUp);
        if (this.isGrounded && verticalVel < 0.1) {
            const horizontalVel = new THREE.Vector3(
                this.physicsBody.velocity.x,
                this.physicsBody.velocity.y,
                this.physicsBody.velocity.z
            ).sub(worldUp.clone().multiplyScalar(verticalVel));
            
            this.physicsBody.velocity.x = horizontalVel.x;
            this.physicsBody.velocity.y = horizontalVel.y;
            this.physicsBody.velocity.z = horizontalVel.z;
        }
    }

    /**
     * Free flight 6-DOF movement
     */
    applyFreeFlyMovement(deltaTime, cameraDirection) {
        if (!this.physicsBody) return;

        const forward = cameraDirection.clone();
        const up = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(forward, up).normalize();
        up.crossVectors(right, forward).normalize();

        // Calculate target velocity
        const targetVel = new THREE.Vector3();
        targetVel.addScaledVector(forward, this.moveInput.z);
        targetVel.addScaledVector(right, this.moveInput.x);
        targetVel.addScaledVector(up, this.moveInput.y);

        if (targetVel.length() > 0.01) {
            targetVel.normalize().multiplyScalar(Config.player.freeFlySpeed);
        }

        // Smooth acceleration
        this.freeFlyVelocity.lerp(targetVel, deltaTime * Config.player.freeFlyAccel / 10);

        // Apply velocity
        this.physicsBody.velocity.x = this.freeFlyVelocity.x;
        this.physicsBody.velocity.y = this.freeFlyVelocity.y;
        this.physicsBody.velocity.z = this.freeFlyVelocity.z;

        this.isGrounded = false;
    }

    /**
     * Jump
     */
    jump() {
        if (!this.isGrounded || !this.canJump) return;

        const jumpForce = Config.player.jumpForce;
        this.physicsBody.velocity.y += jumpForce;
        
        this.isGrounded = false;
        this.canJump = false;
        this.jumpCooldown = 0.3;
    }

    /**
     * Toggle free flight mode
     */
    toggleFreeFlyMode() {
        this.freeFlyMode = !this.freeFlyMode;
        
        if (this.freeFlyMode) {
            this.freeFlyVelocity.copy(new THREE.Vector3(
                this.physicsBody.velocity.x,
                this.physicsBody.velocity.y,
                this.physicsBody.velocity.z
            ));
        }

        DebugLog.info(`Free Flight: ${this.freeFlyMode ? 'ON' : 'OFF'}`);
    }

    /**
     * Align local up vector with gravity direction (for planet surfaces)
     */
    alignLocalUp() {
        // TODO: Find nearest celestial body and align to its center
        // For now, maintain world up
        this.localUp.set(0, 1, 0);
    }

    /**
     * Perform raycast for grabbing objects
     */
    performRaycast(physicsEngine) {
        this.rayOrigin.copy(this.position).addScaledVector(this.localUp, this.eyeHeight);
        
        const rayResult = physicsEngine.raycast(
            new CANNON.Vec3(this.rayOrigin.x, this.rayOrigin.y, this.rayOrigin.z),
            new CANNON.Vec3(this.rayDirection.x, this.rayDirection.y, this.rayDirection.z),
            this.grabDistance
        );

        return rayResult;
    }

    /**
     * Grab object
     */
    grabObject(object, physicsEngine) {
        if (this.heldObject) return; // Already holding something

        const rayResult = this.performRaycast(physicsEngine);
        
        if (rayResult.hit && rayResult.body && rayResult.body.mass > 0) {
            this.heldObject = {
                entity: null,
                body: rayResult.body,
                grabPoint: rayResult.point || new THREE.Vector3()
            };

            // Calculate offset
            const grabPos = new THREE.Vector3(
                rayResult.body.position.x,
                rayResult.body.position.y,
                rayResult.body.position.z
            );
            this.grabOffset = grabPos.sub(this.rayOrigin);

            DebugLog.info('Object grabbed');
        }
    }

    /**
     * Release held object
     */
    releaseObject() {
        if (this.heldObject) {
            // Apply momentum when releasing
            this.heldObject.body.velocity.x = this.physicsBody.velocity.x;
            this.heldObject.body.velocity.y = this.physicsBody.velocity.y;
            this.heldObject.body.velocity.z = this.physicsBody.velocity.z;
            
            this.heldObject = null;
            DebugLog.info('Object released');
        }
    }

    /**
     * Update held object position
     */
    updateHeldObject() {
        if (!this.heldObject) return;

        const targetPos = this.rayOrigin.clone().add(this.grabOffset);
        const body = this.heldObject.body;

        // Move object to follow hand
        body.position.x = targetPos.x;
        body.position.y = targetPos.y;
        body.position.z = targetPos.z;
    }

    /**
     * Check ground state
     */
    checkGround(entities, distance = 0.1) {
        const checkPos = this.position.clone().sub(this.localUp.clone().multiplyScalar(this.radius + distance));
        
        this.isGrounded = false;
        let closestDistance = Infinity;

        // Raycast downward
        const rayDir = this.localUp.clone().multiplyScalar(-1);
        
        for (const entity of entities) {
            if (entity === this) continue;
            
            const toEntity = entity.position.clone().sub(checkPos);
            const projDistance = toEntity.dot(rayDir);
            
            if (projDistance > 0 && projDistance < distance) {
                const sideDistance = toEntity.clone().sub(rayDir.clone().multiplyScalar(projDistance)).length();
                if (sideDistance < this.radius && projDistance < closestDistance) {
                    this.isGrounded = true;
                    this.groundNormal = rayDir.clone().multiplyScalar(-1);
                    closestDistance = projDistance;
                }
            }
        }
    }

    /**
     * Update player each frame
     */
    update(deltaTime, entities = []) {
        if (!this.active) return;

        // Update physics
        if (this.physicsBody) {
            this.position.copy(this.physicsBody.position);
            this.velocity.copy(this.physicsBody.velocity);
        }

        // Check ground
        this.checkGround(entities);

        // Update jump cooldown
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= deltaTime;
        } else {
            this.canJump = true;
        }

        // Update held object
        this.updateHeldObject();

        this.lastFramePosition.copy(this.position);
    }

    /**
     * Get eye position
     */
    getEyePosition() {
        return this.position.clone().addScaledVector(this.localUp, this.eyeHeight);
    }

    /**
     * Get forward direction (camera-relative)
     */
    getForwardDirection(cameraDirection) {
        return cameraDirection.clone();
    }

    /**
     * Serialize player data
     */
    serialize() {
        return {
            ...super.serialize(),
            freeFlyMode: this.freeFlyMode,
            isGrounded: this.isGrounded,
            heldObject: this.heldObject ? true : false
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}
