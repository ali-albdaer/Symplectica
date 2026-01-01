/**
 * Player.js - Player Controller
 * 
 * Handles player movement, camera control, and interaction with the world.
 * Implements dual-mode movement: Walking (gravity-aligned) and Free Flight (6-DOF).
 */

import Config from './Config.js';

export class Player {
    constructor(camera, physicsWorld, engine) {
        this.camera = camera;
        this.physicsWorld = physicsWorld;
        this.engine = engine;
        
        this.mesh = null;
        this.body = null;
        
        // Movement mode
        this.mode = 'walking'; // 'walking' or 'flight'
        
        // Input state
        this.keys = {};
        this.mouseMovement = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Camera control
        this.pitch = 0; // Up/down rotation
        this.yaw = 0;   // Left/right rotation
        
        // Camera mode
        this.cameraMode = 'first-person'; // 'first-person' or 'third-person'
        this.cameraDistance = Config.player.thirdPersonDistance;
        
        // Movement
        this.moveDirection = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // Ground detection
        this.isGrounded = false;
        this.groundBody = null;
        
        // Gravity alignment
        this.gravityDirection = new THREE.Vector3(0, -1, 0);
        this.upVector = new THREE.Vector3(0, 1, 0);
        
        // Interaction
        this.grabbedObject = null;
        this.grabDistance = Config.player.grabDistance;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize player
     */
    init() {
        this.createPlayerMesh();
        this.createPhysicsBody();
        this.setupControls();
        
        console.log('Player initialized');
    }

    /**
     * Create player visual mesh (simple capsule)
     */
    createPlayerMesh() {
        // Create a cylinder (capsule-like) representation
        // CapsuleGeometry not available in Three.js r128
        const geometry = new THREE.CylinderGeometry(
            Config.player.radius,
            Config.player.radius,
            Config.player.height,
            8,
            1
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FF00,
            roughness: 0.5,
            metalness: 0.5,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Position player at spawn
        this.mesh.position.set(
            Config.player.spawnPosition[0],
            Config.player.spawnPosition[1],
            Config.player.spawnPosition[2]
        );
        
        // Make mesh semi-transparent in first-person mode
        this.mesh.visible = this.cameraMode === 'third-person';
    }

    /**
     * Create physics body
     */
    createPhysicsBody() {
        this.body = this.physicsWorld.createCapsuleBody(
            Config.player.radius,
            Config.player.height,
            Config.player.mass,
            Config.player.spawnPosition,
            Config.player.spawnVelocity
        );
        
        // Prevent rotation for walking mode
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
        
        this.physicsWorld.addBody(this.mesh, this.body, false);
    }

    /**
     * Setup input controls
     */
    setupControls() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Pointer lock
        document.addEventListener('click', () => {
            if (!this.isPointerLocked && !this.isUIActive()) {
                this.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement !== null;
        });
    }

    /**
     * Check if any UI is active (to prevent pointer lock)
     */
    isUIActive() {
        const devConsole = document.getElementById('dev-console');
        return devConsole && devConsole.classList.contains('visible');
    }

    /**
     * Request pointer lock
     */
    requestPointerLock() {
        const canvas = this.engine.renderer.domElement;
        canvas.requestPointerLock();
    }

    /**
     * Exit pointer lock
     */
    exitPointerLock() {
        document.exitPointerLock();
    }

    /**
     * Keyboard down event
     */
    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Toggle flight mode
        if (event.code === Config.controls.keys.toggleFlight && !event.repeat) {
            this.toggleFlightMode();
        }
        
        // Toggle camera mode
        if (event.code === Config.controls.keys.toggleCamera && !event.repeat) {
            this.toggleCameraMode();
        }
        
        // Jump
        if (event.code === Config.controls.keys.jump && this.mode === 'walking' && this.isGrounded) {
            this.jump();
        }
    }

    /**
     * Keyboard up event
     */
    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    /**
     * Mouse down event
     */
    onMouseDown(event) {
        if (event.button === 2) { // Right click
            event.preventDefault();
            this.interact();
        }
    }

    /**
     * Mouse up event
     */
    onMouseUp(event) {
        if (event.button === 2 && this.grabbedObject) {
            this.releaseObject();
        }
    }

    /**
     * Mouse move event
     */
    onMouseMove(event) {
        if (!this.isPointerLocked) return;
        
        const sensitivity = Config.controls.mouseSensitivity * 0.002;
        
        this.mouseMovement.x = event.movementX * sensitivity;
        this.mouseMovement.y = event.movementY * sensitivity;
        
        // Update camera rotation
        this.yaw -= this.mouseMovement.x;
        this.pitch -= this.mouseMovement.y;
        
        // Clamp pitch
        const maxPitch = Math.PI / 2 - 0.1;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    }

    /**
     * Update player (called every frame)
     */
    update(deltaTime) {
        // Apply gravity from celestial bodies
        if (this.mode === 'walking') {
            this.updateWalkingMode(deltaTime);
        } else {
            this.updateFlightMode(deltaTime);
        }
        
        // Update camera position
        this.updateCamera();
        
        // Update grabbed object
        if (this.grabbedObject) {
            this.updateGrabbedObject();
        }
        
        // Reset mouse movement
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
    }

    /**
     * Update walking mode
     */
    updateWalkingMode(deltaTime) {
        // Find nearest celestial body for gravity alignment
        this.updateGravityAlignment();
        
        // Apply gravity
        this.physicsWorld.applyGravityToBody(this.body);
        
        // Ground check
        this.checkGrounded();
        
        // Movement input
        const moveSpeed = Config.player.walkSpeed;
        const forward = this.keys[Config.controls.keys.forward] ? 1 : 0;
        const backward = this.keys[Config.controls.keys.backward] ? 1 : 0;
        const left = this.keys[Config.controls.keys.left] ? 1 : 0;
        const right = this.keys[Config.controls.keys.right] ? 1 : 0;
        
        // Calculate movement direction relative to camera yaw
        const direction = new THREE.Vector3();
        direction.x = right - left;
        direction.z = backward - forward;
        direction.normalize();
        
        if (direction.length() > 0) {
            // Rotate direction by camera yaw
            const angle = this.yaw;
            const rotatedX = direction.x * Math.cos(angle) - direction.z * Math.sin(angle);
            const rotatedZ = direction.x * Math.sin(angle) + direction.z * Math.cos(angle);
            
            // Apply force in movement direction (tangent to planet surface)
            const force = new THREE.Vector3(rotatedX, 0, rotatedZ).multiplyScalar(moveSpeed * 100);
            this.physicsWorld.applyForce(this.mesh, [force.x, force.y, force.z]);
        }
        
        // Limit horizontal velocity
        const horizontalVel = Math.sqrt(
            this.body.velocity.x ** 2 + this.body.velocity.z ** 2
        );
        const maxVel = moveSpeed * 2;
        if (horizontalVel > maxVel) {
            const scale = maxVel / horizontalVel;
            this.body.velocity.x *= scale;
            this.body.velocity.z *= scale;
        }
    }

    /**
     * Update flight mode (6-DOF)
     */
    updateFlightMode(deltaTime) {
        const flightSpeed = Config.player.flightSpeed;
        
        // Movement input
        const forward = this.keys[Config.controls.keys.forward] ? 1 : 0;
        const backward = this.keys[Config.controls.keys.backward] ? 1 : 0;
        const left = this.keys[Config.controls.keys.left] ? 1 : 0;
        const right = this.keys[Config.controls.keys.right] ? 1 : 0;
        const up = this.keys[Config.controls.keys.jump] ? 1 : 0;
        const down = this.keys[Config.controls.keys.sprint] ? 1 : 0;
        
        // Calculate movement direction relative to camera orientation
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, this.camera.up).normalize();
        
        const cameraUp = this.camera.up.clone();
        
        // Build movement vector
        const movement = new THREE.Vector3();
        movement.addScaledVector(cameraDirection, forward - backward);
        movement.addScaledVector(cameraRight, right - left);
        movement.addScaledVector(cameraUp, up - down);
        
        if (movement.length() > 0) {
            movement.normalize();
            movement.multiplyScalar(flightSpeed);
            
            // Set velocity directly in flight mode
            this.body.velocity.set(movement.x, movement.y, movement.z);
        } else {
            // Damping when no input
            this.body.velocity.scale(0.9, this.body.velocity);
        }
        
        // No gravity in flight mode
        this.body.force.set(0, 0, 0);
    }

    /**
     * Update gravity alignment (find nearest body and align to it)
     */
    updateGravityAlignment() {
        const playerPos = new THREE.Vector3(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        );
        
        let nearestBody = null;
        let minDistance = Infinity;
        
        // Find nearest celestial body
        for (const celestialBody of this.engine.celestialBodies) {
            const distance = celestialBody.getDistanceFromCenter(playerPos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBody = celestialBody;
            }
        }
        
        if (nearestBody) {
            // Calculate up vector (away from planet center)
            this.upVector = nearestBody.getSurfaceNormal(playerPos);
            this.gravityDirection.copy(this.upVector).negate();
            
            this.groundBody = nearestBody;
        }
    }

    /**
     * Check if player is grounded
     */
    checkGrounded() {
        if (!this.groundBody) {
            this.isGrounded = false;
            return;
        }
        
        const playerPos = new THREE.Vector3(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        );
        
        const distance = this.groundBody.getDistanceFromCenter(playerPos);
        const surfaceDistance = distance - this.groundBody.config.radius;
        
        // Consider grounded if within a small distance of the surface
        this.isGrounded = surfaceDistance < Config.player.height / 2 + 0.5;
    }

    /**
     * Jump
     */
    jump() {
        const jumpForce = Config.player.jumpForce;
        const impulse = this.upVector.clone().multiplyScalar(jumpForce);
        this.physicsWorld.applyImpulse(this.mesh, [impulse.x, impulse.y, impulse.z]);
    }

    /**
     * Toggle flight mode
     */
    toggleFlightMode() {
        this.mode = this.mode === 'walking' ? 'flight' : 'walking';
        
        if (this.mode === 'flight') {
            // Disable rotation lock for flight
            this.body.fixedRotation = false;
            this.body.updateMassProperties();
        } else {
            // Enable rotation lock for walking
            this.body.fixedRotation = true;
            this.body.angularVelocity.set(0, 0, 0);
            this.body.updateMassProperties();
        }
        
        console.log(`Flight mode: ${this.mode === 'flight' ? 'ON' : 'OFF'}`);
    }

    /**
     * Toggle camera mode
     */
    toggleCameraMode() {
        this.cameraMode = this.cameraMode === 'first-person' ? 'third-person' : 'first-person';
        this.mesh.visible = this.cameraMode === 'third-person';
        console.log(`Camera mode: ${this.cameraMode}`);
    }

    /**
     * Update camera position based on mode
     */
    updateCamera() {
        const playerPos = new THREE.Vector3(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        );
        
        if (this.cameraMode === 'first-person') {
            // First-person: Camera at eye level
            const offset = new THREE.Vector3(
                Config.player.cameraOffset[0],
                Config.player.cameraOffset[1],
                Config.player.cameraOffset[2]
            );
            
            this.camera.position.copy(playerPos).add(offset);
        } else {
            // Third-person: Camera behind and above player
            const direction = new THREE.Vector3(
                Math.sin(this.yaw) * Math.cos(this.pitch),
                Math.sin(this.pitch),
                Math.cos(this.yaw) * Math.cos(this.pitch)
            );
            
            const cameraPos = playerPos.clone().sub(
                direction.multiplyScalar(this.cameraDistance)
            );
            
            this.camera.position.lerp(cameraPos, Config.player.cameraLerpSpeed);
        }
        
        // Camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    /**
     * Interact with objects (grab/release)
     */
    interact() {
        if (this.grabbedObject) {
            this.releaseObject();
            return;
        }
        
        // Raycast to find object
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const from = this.camera.position.toArray();
        const to = this.camera.position.clone().add(
            direction.multiplyScalar(this.grabDistance)
        ).toArray();
        
        const rayResult = this.physicsWorld.raycast(from, to);
        
        if (rayResult.hasHit) {
            // Check if the hit object is interactable
            for (const obj of this.engine.interactiveObjects) {
                if (this.physicsWorld.getBody(obj.mesh) === rayResult.body) {
                    this.grabObject(obj);
                    break;
                }
            }
        }
    }

    /**
     * Grab an object
     */
    grabObject(object) {
        this.grabbedObject = object;
        object.grab();
        console.log(`Grabbed: ${object.name}`);
    }

    /**
     * Release grabbed object
     */
    releaseObject() {
        if (!this.grabbedObject) return;
        
        // Apply camera velocity to object when releasing
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const throwForce = 5;
        const impulse = direction.multiplyScalar(throwForce);
        
        this.grabbedObject.release([impulse.x, impulse.y, impulse.z]);
        console.log(`Released: ${this.grabbedObject.name}`);
        this.grabbedObject = null;
    }

    /**
     * Update grabbed object position
     */
    updateGrabbedObject() {
        if (!this.grabbedObject) return;
        
        // Position object in front of camera
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        
        const holdDistance = 3;
        const targetPos = this.camera.position.clone().add(
            direction.multiplyScalar(holdDistance)
        );
        
        // Smoothly move object to target position
        const body = this.grabbedObject.body;
        body.position.x = targetPos.x;
        body.position.y = targetPos.y;
        body.position.z = targetPos.z;
        body.velocity.set(0, 0, 0);
    }

    /**
     * Get player position
     */
    getPosition() {
        return new THREE.Vector3(
            this.body.position.x,
            this.body.position.y,
            this.body.position.z
        );
    }

    /**
     * Get player velocity
     */
    getVelocity() {
        return new THREE.Vector3(
            this.body.velocity.x,
            this.body.velocity.y,
            this.body.velocity.z
        );
    }

    /**
     * Cleanup
     */
    dispose() {
        // Remove event listeners
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        
        // Remove from physics world
        if (this.body) {
            this.physicsWorld.removeBody(this.mesh);
        }
    }
}

export default Player;
