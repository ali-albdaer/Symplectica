/**
 * PLAYER CONTROLLER
 * First-person and flight controls with physics-based movement.
 */

class PlayerController {
    constructor(config, physics, camera) {
        this.config = config.player;
        this.physics = physics;
        this.camera = camera;
        
        // Player state
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.mass = this.config.mass;
        
        // Movement state
        this.isFlying = false;
        this.isGrounded = false;
        this.groundBody = null;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        
        // Input state
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        
        // Camera orientation
        this.pitch = 0; // Up/down rotation
        this.yaw = 0;   // Left/right rotation
        
        // Interaction
        this.heldObject = null;
        this.holdDistance = 3;
        
        // Physics body representation
        this.physicsBody = new PhysicsBody({
            name: 'Player',
            type: 'player',
            mass: this.mass,
            radius: this.config.height / 2,
            position: this.position.toArray(),
            velocity: this.velocity.toArray(),
            physicsEnabled: true,
            isStatic: false,
        });
        
        this.setupControls();
    }

    /**
     * Setup keyboard and mouse controls
     */
    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Toggle flight mode
            if (e.code === this.config.controls?.toggleFlight || e.code === 'KeyF') {
                this.toggleFlight();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse movement (handled by camera controller)
    }

    /**
     * Spawn player on a celestial body
     */
    spawn(celestialBody) {
        // Spawn on surface
        const spawnHeight = celestialBody.radius + this.config.height + 2;
        this.position.copy(celestialBody.position);
        this.position.y += spawnHeight;
        
        this.velocity.set(0, 0, 0);
        
        // Match planet's velocity
        this.velocity.copy(celestialBody.velocity);
        
        // Update physics body
        this.physicsBody.position.copy(this.position);
        this.physicsBody.velocity.copy(this.velocity);
        
        // Add to physics system
        this.physics.addBody(this.physicsBody);
        
        console.log(`Player spawned on ${celestialBody.name} at`, this.position.toArray());
    }

    /**
     * Toggle flight mode
     */
    toggleFlight() {
        this.isFlying = !this.isFlying;
        console.log(`Flight mode: ${this.isFlying ? 'ON' : 'OFF'}`);
    }

    /**
     * Update player
     */
    update(dt, celestialSystem) {
        // Update from physics body
        this.position.copy(this.physicsBody.position);
        this.velocity.copy(this.physicsBody.velocity);
        
        // Check ground contact
        this.updateGroundContact(celestialSystem);
        
        // Handle movement
        if (this.isFlying) {
            this.updateFlightMovement(dt);
        } else {
            this.updateWalkingMovement(dt);
        }
        
        // Update held object
        this.updateHeldObject(dt);
        
        // Update physics body
        this.physicsBody.position.copy(this.position);
        this.physicsBody.velocity.copy(this.velocity);
    }

    /**
     * Check if player is on ground
     */
    updateGroundContact(celestialSystem) {
        const nearestResult = this.physics.getNearestBody(this.position, 'planet');
        
        if (nearestResult.body) {
            const surfaceDist = nearestResult.distance - nearestResult.body.radius;
            this.isGrounded = surfaceDist < this.config.height * 0.6;
            
            if (this.isGrounded) {
                this.groundBody = nearestResult.body;
                this.groundNormal = this.physics.getSurfaceNormal(this.position, nearestResult.body);
            } else {
                this.groundBody = null;
            }
        } else {
            this.isGrounded = false;
            this.groundBody = null;
        }
    }

    /**
     * Walking movement with gravity
     */
    updateWalkingMovement(dt) {
        const controls = CONFIG.controls;
        
        // Get camera direction (forward/right)
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.camera.getWorldDirection(forward);
        
        if (this.isGrounded && this.groundBody) {
            // Project movement onto ground plane
            forward.projectOnPlane(this.groundNormal).normalize();
            right.crossVectors(this.groundNormal, forward).normalize();
        } else {
            // Free air movement
            right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        }
        
        // Calculate movement input
        const moveDir = new THREE.Vector3();
        
        if (this.keys[controls.forward]) moveDir.add(forward);
        if (this.keys[controls.backward]) moveDir.sub(forward);
        if (this.keys[controls.left]) moveDir.add(right);
        if (this.keys[controls.right]) moveDir.sub(right);
        
        // Normalize diagonal movement
        if (moveDir.length() > 0) {
            moveDir.normalize();
        }
        
        // Apply movement speed
        const speed = this.config.walkSpeed * (this.keys['ShiftLeft'] ? this.config.sprintMultiplier : 1);
        const moveForce = moveDir.multiplyScalar(speed * this.mass * 10);
        
        // Apply movement force
        if (moveForce.length() > 0) {
            this.physics.applyForce(this.physicsBody, moveForce);
        }
        
        // Jumping
        if (this.keys[controls.jump] && this.isGrounded) {
            const jumpImpulse = this.groundNormal.clone().multiplyScalar(this.config.jumpForce * dt);
            this.physics.applyImpulse(this.physicsBody, jumpImpulse);
        }
        
        // Ground friction
        if (this.isGrounded) {
            const friction = this.velocity.clone().multiplyScalar(-0.5 * this.mass);
            this.physics.applyForce(this.physicsBody, friction);
        }
    }

    /**
     * Free flight movement
     */
    updateFlightMovement(dt) {
        const controls = CONFIG.controls;
        
        // Get camera direction
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        
        this.camera.camera.getWorldDirection(forward);
        right.crossVectors(forward, up).normalize();
        
        // Calculate movement input
        const moveDir = new THREE.Vector3();
        
        if (this.keys[controls.forward]) moveDir.add(forward);
        if (this.keys[controls.backward]) moveDir.sub(forward);
        if (this.keys[controls.left]) moveDir.add(right);
        if (this.keys[controls.right]) moveDir.sub(right);
        if (this.keys[controls.jump]) moveDir.add(up);
        if (this.keys[controls.down]) moveDir.sub(up);
        
        // Normalize diagonal movement
        if (moveDir.length() > 0) {
            moveDir.normalize();
        }
        
        // Apply flight speed
        const speed = this.config.flightSpeed * (this.keys['ShiftLeft'] ? this.config.flightSprintMultiplier : 1);
        const targetVelocity = moveDir.multiplyScalar(speed);
        
        // Smooth acceleration
        this.velocity.lerp(targetVelocity, dt * 5);
        this.position.addScaledVector(this.velocity, dt);
        
        // In flight mode, reduce gravity effect
        const gravity = this.physics.getGravityAtPoint(this.position);
        const dampedGravity = gravity.multiplyScalar(0.1); // 90% gravity reduction
        this.velocity.addScaledVector(dampedGravity, dt);
    }

    /**
     * Update camera rotation from mouse movement
     */
    updateRotation(deltaX, deltaY) {
        this.yaw -= deltaX * this.config.mouseSensitivity;
        this.pitch -= deltaY * this.config.mouseSensitivity;
        
        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    /**
     * Try to grab object
     */
    grabObject(interactiveObjects) {
        if (this.heldObject) {
            // Release current object
            const releaseImpulse = new THREE.Vector3();
            this.camera.camera.getWorldDirection(releaseImpulse);
            releaseImpulse.multiplyScalar(this.velocity.length() + 10);
            
            this.heldObject.release(releaseImpulse);
            this.heldObject = null;
            console.log('Released object');
        } else {
            // Try to grab nearest object
            const grabDirection = new THREE.Vector3();
            this.camera.camera.getWorldDirection(grabDirection);
            
            let nearest = null;
            let minDist = this.config.interactionDistance;
            
            for (let obj of interactiveObjects) {
                const toObj = new THREE.Vector3().subVectors(obj.position, this.position);
                const dist = toObj.length();
                const angle = toObj.angleTo(grabDirection);
                
                if (dist < minDist && angle < Math.PI / 4) {
                    minDist = dist;
                    nearest = obj;
                }
            }
            
            if (nearest) {
                this.heldObject = nearest;
                this.heldObject.grab(this);
                console.log(`Grabbed ${this.heldObject.name}`);
            }
        }
    }

    /**
     * Update held object position
     */
    updateHeldObject(dt) {
        if (this.heldObject) {
            // Position object in front of camera
            const holdPosition = new THREE.Vector3();
            this.camera.camera.getWorldDirection(holdPosition);
            holdPosition.multiplyScalar(this.holdDistance);
            holdPosition.add(this.position);
            
            // Smooth movement
            this.heldObject.position.lerp(holdPosition, dt * 10);
            this.heldObject.velocity.copy(this.velocity);
        }
    }

    /**
     * Get position for camera
     */
    getEyePosition() {
        return this.position.clone().add(new THREE.Vector3(0, this.config.height * 0.85, 0));
    }

    /**
     * Get forward direction
     */
    getForwardDirection() {
        return new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        );
    }
}
