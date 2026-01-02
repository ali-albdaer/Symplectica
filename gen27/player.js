/**
 * Player Controller
 * Handles player movement, jumping, and interaction with gravity
 */

window.PlayerController = {
    // Player physics body
    body: null,

    // Movement state
    movement: {
        isWalking: false,
        isJumping: false,
        isFreeFlight: false,
        isSprinting: false,
        wantedInput: new THREE.Vector3(0, 0, 0),
        currentVelocity: new THREE.Vector3(0, 0, 0),
    },

    // Ground detection
    groundDetection: {
        isGrounded: false,
        groundBody: null,
        groundDistance: 0,
        checkDistance: 1.5,  // meters below player
    },

    // Interaction
    interaction: {
        heldObject: null,
        grabDistance: Config.player.grabDistance,
    },

    init(playerBody) {
        this.body = playerBody;
        DebugSystem.info('Player controller initialized', {
            mass: playerBody.mass,
            spawn: Utils.string.formatPosition(playerBody.position),
        });
    },

    /**
     * Update player (main loop)
     */
    update(deltaTime) {
        // Check if grounded
        this.checkGrounded();

        // Update held object position
        if (this.interaction.heldObject) {
            this.updateHeldObject();
        }

        // Apply movement input
        this.applyMovement(deltaTime);

        // Ensure player doesn't fall through terrain
        this.constrainToWorld();
    },

    /**
     * Check if player is standing on a body
     */
    checkGrounded() {
        const checkPos = this.body.position.clone();
        const downDirection = this.getLocalDown();
        const checkDistance = Config.player.height / 2 + 0.1;  // Check slightly below feet

        // Find closest surface below player
        let closestBody = null;
        let minDistance = Infinity;

        for (let otherBody of PhysicsEngine.bodies) {
            if (otherBody === this.body) continue;
            if (!otherBody.affectsGravity) continue;

            const direction = Utils.vec3.subtract(otherBody.position, this.body.position);
            const distance = Utils.vec3.length(direction);
            const normDir = Utils.vec3.multiply(direction, 1 / distance);

            // Check if body is in general downward direction
            if (Utils.vec3.dot(normDir, downDirection) < -0.5) {
                // Check if we're close to surface
                const surfaceDistance = distance - otherBody.radius;
                if (surfaceDistance > 0 && surfaceDistance < checkDistance && surfaceDistance < minDistance) {
                    minDistance = surfaceDistance;
                    closestBody = otherBody;
                }
            }
        }

        this.groundDetection.isGrounded = closestBody !== null && minDistance < checkDistance;
        this.groundDetection.groundBody = closestBody;
        this.groundDetection.groundDistance = minDistance;
    },

    /**
     * Get local down direction (opposite of gravity)
     */
    getLocalDown() {
        if (this.groundDetection.groundBody) {
            // Down is toward center of body
            const direction = Utils.vec3.subtract(
                this.groundDetection.groundBody.position,
                this.body.position
            );
            return Utils.vec3.normalize(direction).multiplyScalar(-1);  // Away from center
        }
        // Default to world down
        return new THREE.Vector3(0, -1, 0);
    },

    /**
     * Get local up direction
     */
    getLocalUp() {
        const down = this.getLocalDown();
        return Utils.vec3.multiply(down, -1);
    },

    /**
     * Apply movement input
     */
    applyMovement(deltaTime) {
        if (this.movement.isFreeFlight) {
            this.applyFreeFlightMovement(deltaTime);
        } else {
            this.applyWalkingMovement(deltaTime);
        }
    },

    /**
     * Walking movement on celestial body surfaces
     */
    applyWalkingMovement(deltaTime) {
        if (!this.groundDetection.isGrounded) return;

        // Get local coordinate system based on ground body
        const up = this.getLocalUp();
        const forward = CameraSystem.getForwardVector();
        const right = CameraSystem.getRightVector();

        // Project forward and right to be tangent to surface
        const forwardProj = Utils.vec3.subtract(forward, Utils.vec3.multiply(up, Utils.vec3.dot(forward, up)));
        const rightProj = Utils.vec3.subtract(right, Utils.vec3.multiply(up, Utils.vec3.dot(right, up)));

        // Normalize
        const forwardDir = Utils.vec3.normalize(forwardProj);
        const rightDir = Utils.vec3.normalize(rightProj);

        // Get input
        const forward_input = this.movement.wantedInput.z;
        const right_input = this.movement.wantedInput.x;
        const jump_input = this.movement.wantedInput.y;

        // Calculate target velocity
        let moveDir = new THREE.Vector3(0, 0, 0);
        moveDir.addScaledVector(forwardDir, forward_input);
        moveDir.addScaledVector(rightDir, right_input);

        const speed = this.movement.isSprinting ? Config.player.sprintSpeed : Config.player.walkSpeed;
        const targetVel = Utils.vec3.multiply(Utils.vec3.normalize(moveDir), forward_input !== 0 || right_input !== 0 ? speed : 0);

        // Apply friction and acceleration
        const friction = 0.85;
        const accel = 30;
        this.body.velocity.multiplyScalar(friction);
        this.body.velocity.addScaledVector(targetVel, accel * deltaTime);

        // Jumping
        if (jump_input > 0.5 && this.groundDetection.isGrounded) {
            const jumpVelocity = Config.player.jumpForce;
            this.body.velocity.addScaledVector(up, jumpVelocity);
            this.movement.isJumping = true;
        } else {
            this.movement.isJumping = false;
        }
    },

    /**
     * Free flight mode (6 DOF)
     */
    applyFreeFlightMovement(deltaTime) {
        const forward = CameraSystem.getForwardVector();
        const right = CameraSystem.getRightVector();
        const up = CameraSystem.getUpVector();

        // Get input
        const forwardInput = this.movement.wantedInput.z;
        const rightInput = this.movement.wantedInput.x;
        const upInput = this.movement.wantedInput.y;

        // Calculate desired velocity
        let velocity = new THREE.Vector3(0, 0, 0);
        velocity.addScaledVector(forward, forwardInput);
        velocity.addScaledVector(right, rightInput);
        velocity.addScaledVector(up, upInput);
        
        velocity = Utils.vec3.normalize(velocity);
        velocity.multiplyScalar(Utils.vec3.length(this.movement.wantedInput) > 0 ? Config.player.freeFlySpeed : 0);

        // Acceleration
        const accel = Config.player.freeFlyAccel;
        this.body.velocity.lerp(velocity, Math.min(1, accel * deltaTime));
    },

    /**
     * Try to grab object at aim position
     */
    grabObject() {
        if (!Config.player.canGrabObjects) return;
        if (this.interaction.heldObject) {
            this.releaseObject();
            return;
        }

        // Raycast from camera
        const ray = Renderer.getWorldRayFromScreen(window.innerWidth / 2, window.innerHeight / 2);
        const cameraPos = Renderer.camera.position;

        // Find closest interactive object in range
        let closest = null;
        let closestDist = Config.player.grabDistance;

        for (let body of PhysicsEngine.bodies) {
            if (body === this.body) continue;
            if (body.isKinematic) continue;

            // Check distance
            const dist = Utils.vec3.distance(cameraPos, body.position);
            if (dist > closestDist) continue;

            // Check if in front of camera
            const toBody = Utils.vec3.subtract(body.position, cameraPos);
            const dotProduct = Utils.vec3.dot(toBody, ray.direction);
            if (dotProduct < 0) continue;

            // Check ray distance to body
            const closest_point_on_line = cameraPos.clone().addScaledVector(ray.direction, dotProduct);
            const distToRay = Utils.vec3.distance(closest_point_on_line, body.position);
            
            if (distToRay < body.radius * 2 && dist < closestDist) {
                closestDist = dist;
                closest = body;
            }
        }

        if (closest) {
            this.interaction.heldObject = closest;
            DebugSystem.info(`Grabbed: ${closest.name}`);
        }
    },

    /**
     * Release held object
     */
    releaseObject() {
        if (!this.interaction.heldObject) return;
        DebugSystem.info(`Released: ${this.interaction.heldObject.name}`);
        this.interaction.heldObject = null;
    },

    /**
     * Update held object position to follow player's hand
     */
    updateHeldObject() {
        if (!this.interaction.heldObject) return;

        const object = this.interaction.heldObject;
        const holdDistance = Config.player.grabDistance * 0.8;

        // Position in front of camera
        const holdPos = Renderer.camera.position.clone();
        const forward = CameraSystem.getForwardVector();
        holdPos.addScaledVector(forward, holdDistance);

        // Move object to held position
        const targetPos = holdPos;
        const currentPos = object.position;
        const direction = Utils.vec3.subtract(targetPos, currentPos);
        const moveForce = Utils.vec3.multiply(direction, 100);  // Stiff constraint

        object.velocity.add(moveForce.multiplyScalar(0.1));
    },

    /**
     * Ensure player stays in valid bounds
     */
    constrainToWorld() {
        // If player is very far from sun, warn
        const distFromSun = Utils.vec3.distance(this.body.position, new THREE.Vector3(0, 0, 0));
        if (distFromSun > Config.camera.far * 0.95) {
            DebugSystem.warn('Player is too far from solar system');
        }

        // Check for NaN
        if (!Utils.test.isVectorFinite(this.body.position)) {
            DebugSystem.error('Player position became invalid', {
                position: this.body.position,
            });
            // Reset to spawn
            this.body.position.set(...Config.player.spawnPosition);
            this.body.velocity.set(0, 0, 0);
        }
    },

    /**
     * Toggle free flight mode
     */
    toggleFreeFlight() {
        this.movement.isFreeFlight = !this.movement.isFreeFlight;
        DebugSystem.info(`Free flight: ${this.movement.isFreeFlight}`);
    },

    /**
     * Set movement input (-1 to 1)
     */
    setMovementInput(x, y, z) {
        this.movement.wantedInput.set(x, y, z);
    },

    /**
     * Debug info
     */
    getDebugInfo() {
        return {
            mode: this.movement.isFreeFlight ? 'Free Flight' : 'Walking',
            grounded: this.groundDetection.isGrounded,
            position: Utils.string.formatPosition(this.body.position),
            velocity: Utils.string.formatVelocity(this.body.velocity),
            speed: Utils.vec3.length(this.body.velocity).toFixed(2),
            held: this.interaction.heldObject?.name || 'None',
        };
    },
};

DebugSystem.info('Player controller loaded');
