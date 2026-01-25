/**
 * PLAYER CONTROLLER
 * First-person character with walking, jumping, and free flight
 * Camera-relative movement on planetary surfaces
 */

class Player {
    constructor(config, scene, physicsEngine, camera) {
        this.config = config.player;
        this.scene = scene;
        this.physics = physicsEngine;
        this.camera = camera;
        
        // Physical properties
        this.mass = this.config.mass;
        this.height = this.config.height;
        this.radius = this.config.radius;
        
        // Position and velocity
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        
        // Movement state
        this.isGrounded = false;
        this.groundBody = null;
        this.groundNormal = { x: 0, y: 1, z: 0 };
        
        // Flight mode
        this.freeFlightMode = false;
        
        // Input state
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        
        // Camera angles
        this.yaw = 0;   // Horizontal rotation
        this.pitch = 0; // Vertical rotation
        
        // Held object
        this.heldObject = null;
        this.grabDistance = this.config.grabDistance;
        
        // Create visual representation (for third person)
        this.createMesh();
        
        // Setup input listeners
        this.setupInput();
        
        console.log('[PLAYER] Initialized');
    }

    createMesh() {
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height - 2 * this.radius, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FF00,
            roughness: 0.7,
            metalness: 0.3,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.visible = false; // Hidden in first person
        this.scene.add(this.mesh);
    }

    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Toggle flight mode
            if (e.key.toLowerCase() === this.config.flightToggleKey) {
                this.toggleFlightMode();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Mouse movement (handled by camera controller)
        
        // Mouse click for grabbing
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right click
                this.tryGrabObject();
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.releaseObject();
            }
        });
        
        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    spawn(planetBody) {
        // Spawn on top of the planet
        this.position.x = planetBody.position.x;
        this.position.y = planetBody.position.y + planetBody.displayRadius + this.config.spawnHeight;
        this.position.z = planetBody.position.z;
        
        // Match planet's velocity
        this.velocity.x = planetBody.velocity.x;
        this.velocity.y = planetBody.velocity.y;
        this.velocity.z = planetBody.velocity.z;
        
        console.log(`[PLAYER] Spawned on ${planetBody.name} at (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)})`);
    }

    toggleFlightMode() {
        this.freeFlightMode = !this.freeFlightMode;
        console.log(`[PLAYER] Free flight: ${this.freeFlightMode ? 'ENABLED' : 'DISABLED'}`);
    }

    update(deltaTime) {
        // Update camera rotation from mouse
        this.updateCameraRotation();
        
        // Handle movement
        if (this.freeFlightMode) {
            this.updateFlightMovement(deltaTime);
        } else {
            this.updateWalkingMovement(deltaTime);
        }
        
        // Apply gravity
        this.applyGravity(deltaTime);
        
        // Check ground collision
        this.checkGroundCollision();
        
        // Update held object
        if (this.heldObject) {
            this.updateHeldObject(deltaTime);
        }
        
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    updateCameraRotation() {
        // Rotation is handled by camera controller
        // But we store yaw and pitch for movement direction
    }

    updateWalkingMovement(deltaTime) {
        // Get camera direction (yaw only, ignore pitch for horizontal movement)
        const forward = new THREE.Vector3(
            Math.sin(this.yaw),
            0,
            Math.cos(this.yaw)
        ).normalize();
        
        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        ).normalize();
        
        // Calculate movement direction
        const moveDir = new THREE.Vector3(0, 0, 0);
        
        if (this.keys['w']) moveDir.add(forward);
        if (this.keys['s']) moveDir.sub(forward);
        if (this.keys['d']) moveDir.add(right);
        if (this.keys['a']) moveDir.sub(right);
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // If on ground, project movement onto surface
            if (this.isGrounded && this.groundNormal) {
                // Project movement direction onto ground plane
                const dot = moveDir.x * this.groundNormal.x + 
                           moveDir.y * this.groundNormal.y + 
                           moveDir.z * this.groundNormal.z;
                
                moveDir.x -= this.groundNormal.x * dot;
                moveDir.y -= this.groundNormal.y * dot;
                moveDir.z -= this.groundNormal.z * dot;
                moveDir.normalize();
            }
            
            const speed = this.keys['shift'] ? this.config.runSpeed : this.config.walkSpeed;
            
            this.velocity.x += moveDir.x * speed * deltaTime * 10;
            this.velocity.y += moveDir.y * speed * deltaTime * 10;
            this.velocity.z += moveDir.z * speed * deltaTime * 10;
            
            // Apply friction
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
        } else if (this.isGrounded) {
            // Apply friction when not moving
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }
        
        // Jump
        if (this.keys[' '] && this.isGrounded) {
            const jumpDir = {
                x: this.groundNormal.x,
                y: this.groundNormal.y,
                z: this.groundNormal.z
            };
            
            const impulse = this.config.jumpForce * deltaTime;
            this.velocity.x += jumpDir.x * impulse / this.mass;
            this.velocity.y += jumpDir.y * impulse / this.mass;
            this.velocity.z += jumpDir.z * impulse / this.mass;
            
            this.isGrounded = false;
        }
    }

    updateFlightMovement(deltaTime) {
        // Get camera direction vectors
        const forward = new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            -Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        ).normalize();
        
        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        ).normalize();
        
        const up = new THREE.Vector3(0, 1, 0);
        
        // Calculate movement
        const moveDir = new THREE.Vector3(0, 0, 0);
        
        if (this.keys['w']) moveDir.add(forward);
        if (this.keys['s']) moveDir.sub(forward);
        if (this.keys['d']) moveDir.add(right);
        if (this.keys['a']) moveDir.sub(right);
        if (this.keys[' ']) moveDir.add(up);
        if (this.keys['shift']) moveDir.sub(up);
        
        if (moveDir.length() > 0) {
            moveDir.normalize();
            const speed = this.config.flightSpeed;
            
            this.velocity.x = moveDir.x * speed;
            this.velocity.y = moveDir.y * speed;
            this.velocity.z = moveDir.z * speed;
        } else {
            // Damping in flight mode
            this.velocity.x *= 0.95;
            this.velocity.y *= 0.95;
            this.velocity.z *= 0.95;
        }
    }

    applyGravity(deltaTime) {
        if (this.freeFlightMode) return;
        
        // Get gravitational acceleration at player position
        const gravity = this.physics.getGravityAtPoint(this.position);
        
        this.velocity.x += gravity.x * deltaTime;
        this.velocity.y += gravity.y * deltaTime;
        this.velocity.z += gravity.z * deltaTime;
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
    }

    checkGroundCollision() {
        const collision = this.physics.checkSphereCollision(this.position, this.radius);
        
        if (collision.collided) {
            this.isGrounded = true;
            this.groundBody = collision.body;
            this.groundNormal = collision.normal;
            
            // Push player out of collision
            const overlap = (this.radius + collision.body.displayRadius) - collision.distance;
            this.position.x += collision.normal.x * overlap;
            this.position.y += collision.normal.y * overlap;
            this.position.z += collision.normal.z * overlap;
            
            // Remove velocity component into ground
            const dot = this.velocity.x * collision.normal.x +
                       this.velocity.y * collision.normal.y +
                       this.velocity.z * collision.normal.z;
            
            if (dot < 0) {
                this.velocity.x -= collision.normal.x * dot;
                this.velocity.y -= collision.normal.y * dot;
                this.velocity.z -= collision.normal.z * dot;
            }
        } else {
            this.isGrounded = false;
            this.groundBody = null;
        }
    }

    tryGrabObject() {
        // Find interactive object in front of player
        const rayStart = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
        const rayDir = new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            -Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        );
        
        // Check for interactive objects (handled by objects system)
        window.tryGrabObjectFromPlayer && window.tryGrabObjectFromPlayer(rayStart, rayDir, this.grabDistance, this);
    }

    releaseObject() {
        if (this.heldObject) {
            this.heldObject.release();
            this.heldObject = null;
        }
    }

    updateHeldObject(deltaTime) {
        if (!this.heldObject) return;
        
        // Position in front of player
        const holdDistance = 2;
        const targetPos = {
            x: this.position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * holdDistance,
            y: this.position.y - Math.sin(this.pitch) * holdDistance,
            z: this.position.z + Math.cos(this.yaw) * Math.cos(this.pitch) * holdDistance
        };
        
        // Apply spring force to held object
        const spring = this.config.grabForce;
        const dx = targetPos.x - this.heldObject.position.x;
        const dy = targetPos.y - this.heldObject.position.y;
        const dz = targetPos.z - this.heldObject.position.z;
        
        this.heldObject.velocity.x += dx * spring * deltaTime;
        this.heldObject.velocity.y += dy * spring * deltaTime;
        this.heldObject.velocity.z += dz * spring * deltaTime;
        
        // Damping
        this.heldObject.velocity.x *= 0.9;
        this.heldObject.velocity.y *= 0.9;
        this.heldObject.velocity.z *= 0.9;
    }

    getForwardVector() {
        return new THREE.Vector3(
            Math.sin(this.yaw) * Math.cos(this.pitch),
            -Math.sin(this.pitch),
            Math.cos(this.yaw) * Math.cos(this.pitch)
        );
    }

    getRightVector() {
        return new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        );
    }

    getUpVector() {
        if (this.isGrounded && this.groundNormal) {
            return { ...this.groundNormal };
        }
        return { x: 0, y: 1, z: 0 };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
