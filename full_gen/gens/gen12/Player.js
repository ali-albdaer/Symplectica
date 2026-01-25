/**
 * Player.js - Player Controller with Dual-Mode Movement
 * Handles walking (gravity-aligned) and free flight (6-DOF) modes
 */

import { Config } from './Config.js';
import { Logger, EventBus, Utils } from './Utils.js';

export class Player {
    constructor(scene, physicsWorld, inputManager) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.inputManager = inputManager;
        
        // Physical properties
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.radius = Config.player.radius;
        this.height = Config.player.height;
        this.mass = Config.player.mass;
        
        // Orientation
        this.quaternion = new THREE.Quaternion();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        
        // Local coordinate frame (aligned to gravity)
        this.upVector = new THREE.Vector3(0, 1, 0);
        this.forwardVector = new THREE.Vector3(0, 0, -1);
        this.rightVector = new THREE.Vector3(1, 0, 0);
        
        // Movement state
        this.isFlying = false;
        this.isGrounded = false;
        this.isJumping = false;
        this.currentPlanet = null;
        
        // Movement speeds
        this.walkSpeed = Config.player.walkSpeed;
        this.runSpeed = Config.player.runSpeed;
        this.flySpeed = Config.player.flySpeed;
        this.jumpForce = Config.player.jumpForce;
        
        // Camera pitch (separate from body orientation)
        this.pitch = 0;
        this.yaw = 0;
        
        // Grab mechanics
        this.heldObject = null;
        this.grabDistance = Config.player.grabDistance;
        this.grabForce = Config.player.grabForce;
        
        // Visual representation (capsule for debug)
        this.mesh = null;
        this.createMesh();
        
        // Setup event listeners
        this.setupEvents();
        
        // Register with physics
        this.physicsWorld.setPlayer(this);
        
        Logger.player('Player initialized');
    }

    createMesh() {
        // Create a simple capsule representation for debugging using cylinder + spheres
        // (CapsuleGeometry not available in Three.js r128)
        const group = new THREE.Group();
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FF00,
            transparent: true,
            opacity: 0.5,
            visible: false // Hidden in first person
        });
        
        // Cylinder body
        const cylinderHeight = this.height - this.radius * 2;
        const cylinderGeom = new THREE.CylinderGeometry(this.radius, this.radius, cylinderHeight, 16);
        const cylinder = new THREE.Mesh(cylinderGeom, material);
        group.add(cylinder);
        
        // Top sphere
        const sphereGeom = new THREE.SphereGeometry(this.radius, 16, 8);
        const topSphere = new THREE.Mesh(sphereGeom, material);
        topSphere.position.y = cylinderHeight / 2;
        group.add(topSphere);
        
        // Bottom sphere
        const bottomSphere = new THREE.Mesh(sphereGeom, material);
        bottomSphere.position.y = -cylinderHeight / 2;
        group.add(bottomSphere);
        
        group.castShadow = true;
        this.mesh = group;
        this.scene.add(this.mesh);
    }

    setupEvents() {
        EventBus.on('toggleFlight', () => this.toggleFlightMode());
        EventBus.on('mouseMove', (data) => this.handleMouseMove(data));
        EventBus.on('grabStart', () => this.tryGrab());
        EventBus.on('grabEnd', () => this.releaseGrab());
    }

    /**
     * Spawn player on a planet surface
     */
    spawnOnPlanet(planet) {
        this.currentPlanet = planet;
        
        // Calculate spawn position on planet surface
        const spawnDirection = new THREE.Vector3(1, 0, 0).normalize();
        const spawnHeight = planet.radius + Config.player.spawnHeight;
        
        this.position.copy(planet.position).add(spawnDirection.multiplyScalar(spawnHeight));
        
        // Set initial up vector (away from planet center)
        this.upVector = new THREE.Vector3().subVectors(this.position, planet.position).normalize();
        
        // Calculate initial orientation
        this.updateOrientationFromGravity();
        
        // Clear velocity
        this.velocity.set(0, 0, 0);
        
        // Match planet velocity
        this.velocity.copy(planet.velocity);
        
        Logger.player(`Spawned on ${planet.name}`, { position: this.position.clone() });
        
        return this.position.clone();
    }

    /**
     * Toggle between walking and flight modes
     */
    toggleFlightMode() {
        this.isFlying = !this.isFlying;
        
        if (this.isFlying) {
            Logger.player('Flight mode enabled');
        } else {
            Logger.player('Walking mode enabled');
        }
        
        EventBus.emit('flightModeChange', { flying: this.isFlying });
    }

    /**
     * Handle mouse movement for camera rotation
     */
    handleMouseMove(data) {
        if (!this.inputManager.isPointerLocked) return;
        
        // Update yaw and pitch
        this.yaw -= data.deltaX;
        this.pitch -= data.deltaY;
        
        // Clamp pitch
        this.pitch = Utils.clamp(this.pitch, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    }

    /**
     * Update player each frame
     */
    update(deltaTime) {
        if (this.isFlying) {
            this.updateFlightMode(deltaTime);
        } else {
            this.updateWalkingMode(deltaTime);
        }
        
        // Update held object position
        this.updateHeldObject();
        
        // Sync mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        }
    }

    /**
     * Update walking mode with planet gravity alignment
     */
    updateWalkingMode(deltaTime) {
        // Find nearest planet
        const { body: nearestPlanet, distance } = this.physicsWorld.getNearestBody(this.position);
        
        if (nearestPlanet) {
            this.currentPlanet = nearestPlanet;
            
            // Update gravity direction (opposite to surface normal)
            const gravityDirection = new THREE.Vector3()
                .subVectors(nearestPlanet.position, this.position)
                .normalize();
            
            // Calculate target up vector (opposite to gravity)
            const targetUp = gravityDirection.clone().negate();
            
            // Smoothly align up vector to gravity
            this.upVector.lerp(targetUp, Config.player.gravityAlignSpeed * deltaTime);
            this.upVector.normalize();
            
            // Update orientation from new up vector
            this.updateOrientationFromGravity();
            
            // Check if grounded
            const surfaceDistance = distance - nearestPlanet.radius - this.height / 2;
            this.isGrounded = surfaceDistance < 0.1;
            
            // Apply gravity
            if (!this.isGrounded) {
                const G = Config.physics.G_SCALED;
                const gravityMagnitude = G * nearestPlanet.mass / (distance * distance);
                const gravityForce = gravityDirection.multiplyScalar(gravityMagnitude * deltaTime * 60);
                this.velocity.add(gravityForce);
            } else {
                // On ground - apply friction and prevent sinking
                const normalVelocity = this.upVector.clone().multiplyScalar(
                    this.velocity.dot(this.upVector)
                );
                
                // Remove downward velocity component
                if (normalVelocity.dot(this.upVector) < 0) {
                    this.velocity.sub(normalVelocity);
                }
                
                // Correct position if sinking
                if (surfaceDistance < 0) {
                    this.position.add(this.upVector.clone().multiplyScalar(-surfaceDistance + 0.05));
                }
                
                // Apply ground friction
                const groundFriction = 0.9;
                const tangentialVelocity = this.velocity.clone().sub(normalVelocity);
                tangentialVelocity.multiplyScalar(groundFriction);
                this.velocity.copy(tangentialVelocity).add(normalVelocity.multiplyScalar(0.5));
            }
        }
        
        // Get movement input
        const input = this.inputManager.getMovementInput();
        
        // Calculate movement direction in local space
        const moveDirection = new THREE.Vector3();
        
        // Forward/backward (relative to where player is looking)
        if (input.z !== 0) {
            moveDirection.add(this.forwardVector.clone().multiplyScalar(-input.z));
        }
        
        // Left/right strafe
        if (input.x !== 0) {
            moveDirection.add(this.rightVector.clone().multiplyScalar(input.x));
        }
        
        // Normalize and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            
            const speed = this.inputManager.isSprinting() ? this.runSpeed : this.walkSpeed;
            const targetVelocity = moveDirection.multiplyScalar(speed);
            
            // Add planet velocity
            if (this.currentPlanet) {
                targetVelocity.add(this.currentPlanet.velocity);
            }
            
            // Smoothly accelerate
            const acceleration = 10 * deltaTime;
            this.velocity.lerp(targetVelocity, acceleration);
        }
        
        // Jump
        if (input.y > 0 && this.isGrounded && !this.isJumping) {
            this.velocity.add(this.upVector.clone().multiplyScalar(this.jumpForce));
            this.isJumping = true;
            this.isGrounded = false;
            Logger.player('Jump');
        }
        
        // Reset jump state when grounded
        if (this.isGrounded && this.isJumping) {
            this.isJumping = false;
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }

    /**
     * Update flight mode with 6-DOF movement
     */
    updateFlightMode(deltaTime) {
        // Get movement input
        const input = this.inputManager.getMovementInput();
        
        // In flight mode, use camera orientation for movement
        const moveDirection = new THREE.Vector3();
        
        // Forward/backward
        if (input.z !== 0) {
            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(this.getViewQuaternion());
            moveDirection.add(forward.multiplyScalar(-input.z));
        }
        
        // Left/right
        if (input.x !== 0) {
            const right = new THREE.Vector3(1, 0, 0);
            right.applyQuaternion(this.getViewQuaternion());
            moveDirection.add(right.multiplyScalar(input.x));
        }
        
        // Up/down (relative to camera up)
        if (input.y !== 0) {
            const up = new THREE.Vector3(0, 1, 0);
            up.applyQuaternion(this.getViewQuaternion());
            moveDirection.add(up.multiplyScalar(input.y));
        }
        
        // Apply movement
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            
            const speed = this.inputManager.isSprinting() 
                ? this.flySpeed * Config.player.flySprintMultiplier 
                : this.flySpeed;
            
            const targetVelocity = moveDirection.multiplyScalar(speed);
            
            // Smoothly accelerate
            const acceleration = 5 * deltaTime;
            this.velocity.lerp(targetVelocity, acceleration);
        } else {
            // Dampen velocity when not moving
            this.velocity.multiplyScalar(0.95);
        }
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // In flight mode, up vector follows camera
        this.updateOrientationFromCamera();
    }

    /**
     * Update orientation based on gravity (for walking mode)
     */
    updateOrientationFromGravity() {
        // Calculate forward based on yaw rotation around up vector
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(this.upVector, this.yaw);
        
        // Get initial forward perpendicular to up
        let baseForward = new THREE.Vector3(0, 0, -1);
        
        // Make sure forward is perpendicular to up
        baseForward.sub(this.upVector.clone().multiplyScalar(baseForward.dot(this.upVector)));
        baseForward.normalize();
        
        // If forward became zero, find another direction
        if (baseForward.length() < 0.01) {
            baseForward = new THREE.Vector3(1, 0, 0);
            baseForward.sub(this.upVector.clone().multiplyScalar(baseForward.dot(this.upVector)));
            baseForward.normalize();
        }
        
        // Apply yaw rotation
        this.forwardVector = baseForward.applyQuaternion(yawQuat);
        
        // Calculate right vector
        this.rightVector = new THREE.Vector3().crossVectors(this.forwardVector, this.upVector).normalize();
        
        // Recalculate forward to ensure orthogonality
        this.forwardVector = new THREE.Vector3().crossVectors(this.upVector, this.rightVector).normalize();
        
        // Build quaternion from axes
        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeBasis(this.rightVector, this.upVector, this.forwardVector.clone().negate());
        this.quaternion.setFromRotationMatrix(rotationMatrix);
    }

    /**
     * Update orientation for flight mode (camera-based)
     */
    updateOrientationFromCamera() {
        // In flight mode, orientation is purely camera-based
        const viewQuat = this.getViewQuaternion();
        this.quaternion.copy(viewQuat);
        
        // Update vectors from quaternion
        this.forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(viewQuat);
        this.upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(viewQuat);
        this.rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(viewQuat);
    }

    /**
     * Get quaternion representing view direction (yaw + pitch)
     */
    getViewQuaternion() {
        const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
        return new THREE.Quaternion().setFromEuler(euler);
    }

    /**
     * Get look direction vector
     */
    getLookDirection() {
        const direction = new THREE.Vector3(0, 0, -1);
        
        if (this.isFlying) {
            direction.applyQuaternion(this.getViewQuaternion());
        } else {
            // In walking mode, apply pitch to forward vector
            const pitchQuat = new THREE.Quaternion().setFromAxisAngle(this.rightVector, this.pitch);
            direction.copy(this.forwardVector).applyQuaternion(pitchQuat);
        }
        
        return direction;
    }

    /**
     * Try to grab an object in front of player
     */
    tryGrab() {
        if (this.heldObject) return;
        
        const lookDir = this.getLookDirection();
        const rayStart = this.position.clone().add(this.upVector.clone().multiplyScalar(this.height * 0.4));
        
        EventBus.emit('raycastForGrab', {
            origin: rayStart,
            direction: lookDir,
            maxDistance: this.grabDistance,
            callback: (result) => {
                if (result && result.object) {
                    this.heldObject = result.object;
                    this.heldObject.grab(this);
                    Logger.player('Grabbed object', { type: this.heldObject.type });
                }
            }
        });
    }

    /**
     * Release grabbed object
     */
    releaseGrab() {
        if (!this.heldObject) return;
        
        // Calculate throw velocity (player velocity + look direction)
        const throwVelocity = this.velocity.clone()
            .add(this.getLookDirection().multiplyScalar(10));
        
        this.heldObject.release(throwVelocity);
        this.heldObject = null;
        
        Logger.player('Released object');
    }

    /**
     * Update held object position
     */
    updateHeldObject() {
        if (!this.heldObject) return;
        
        // Calculate hold position in front of player
        const holdDistance = 2;
        const holdHeight = this.height * 0.4;
        
        const holdPosition = this.position.clone()
            .add(this.upVector.clone().multiplyScalar(holdHeight))
            .add(this.getLookDirection().multiplyScalar(holdDistance));
        
        this.heldObject.updateHeld(holdPosition);
    }

    /**
     * Get eye position for camera
     */
    getEyePosition() {
        return this.position.clone().add(
            this.upVector.clone().multiplyScalar(this.height * 0.4)
        );
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            speed: this.velocity.length(),
            isFlying: this.isFlying,
            isGrounded: this.isGrounded,
            currentPlanet: this.currentPlanet?.name || 'None',
            upVector: this.upVector.clone(),
            pitch: Utils.radToDeg(this.pitch).toFixed(1),
            yaw: Utils.radToDeg(this.yaw).toFixed(1)
        };
    }

    /**
     * Dispose resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
        }
        Logger.player('Player disposed');
    }
}

export default Player;
