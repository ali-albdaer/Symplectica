/**
 * Player Controller - Handles player movement, jumping, and flight
 */

import * as THREE from 'three';
import { PLAYER } from './config.js';

export class Player {
    constructor(input, physicsEngine) {
        this.input = input;
        this.physicsEngine = physicsEngine;
        
        // Physical properties
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
        this.height = PLAYER.height;
        this.radius = PLAYER.radius;
        this.mass = PLAYER.mass;
        
        // Movement state
        this.onGround = false;
        this.isFlying = false;
        this.isRunning = false;

        this.heldObject = null;
        
        // Camera orientation
        this.pitch = 0;
        this.yaw = 0;

        this._flightToggleDebounce = false;

        // Mouse button state tracking
        this._rightHoldActive = false;
        this._throwCooldown = 0;
        
        // Reference to current planet
        this.currentPlanet = null;
        
        // Collision mesh (for visualization in third person)
        this.createCollisionMesh();
    }

    createCollisionMesh() {
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height - this.radius * 2, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.visible = false; // Hidden in first person by default
    }

    spawn(planet) {
        // Spawn player on planet surface
        this.currentPlanet = planet;
        
        // Position player comfortably above surface
        const spawnHeight = this.height + 3;
        const direction = new THREE.Vector3(1, 0.1, 0).normalize();
        this.position.copy(planet.position).add(
            direction.multiplyScalar(planet.radius + spawnHeight)
        );
        
        // Match planet orbital velocity so the player stays bound to the surface frame
        this.velocity.copy(planet.velocity || new THREE.Vector3());
        this.updateMeshPosition();
    }

    update(deltaTime) {
        if (this._throwCooldown > 0) {
            this._throwCooldown -= deltaTime;
        }
        this.handleInput(deltaTime);
        this.handleInteraction();
        this.applyPhysics(deltaTime);
        this.updateMeshPosition();
    }

    handleInput(deltaTime) {
        // Toggle flight mode (F)
        if (this.input.isKeyPressed('KeyF')) {
            // Debounce check
            if (!this._flightToggleDebounce) {
                this.isFlying = !this.isFlying;
                this.onGround = false;
                if (this.isFlying && this.velocity.length() < 1) {
                    this.velocity.set(0, 0, 0);
                }
                this._flightToggleDebounce = true;
                setTimeout(() => this._flightToggleDebounce = false, 200);
            }
        }
        
        // Handle mouse look
        if (this.input.mouse.locked) {
            const mouseDelta = this.input.getMouseDelta();
            this.yaw -= mouseDelta.x * PLAYER.mouseSensitivity;
            this.pitch -= mouseDelta.y * PLAYER.mouseSensitivity;
            
            // Clamp pitch
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            
            this.rotation.set(this.pitch, this.yaw, 0);
        }
        
        // Calculate local forward/right based on look + local up
        const { forward, right, up } = this.getLocalAxes();

        if (this.isFlying) {
            this.handleFlightMovement(deltaTime, forward, right, up);
        } else {
            this.handleGroundMovement(deltaTime, forward, right, up);
        }
    }

    handleGroundMovement(deltaTime, forward, right, up) {
        const moveDirection = new THREE.Vector3();
        
        // WASD movement
        if (this.input.isKeyPressed('KeyW')) {
            moveDirection.add(forward);
        }
        if (this.input.isKeyPressed('KeyS')) {
            moveDirection.sub(forward);
        }
        if (this.input.isKeyPressed('KeyA')) {
            moveDirection.sub(right);
        }
        if (this.input.isKeyPressed('KeyD')) {
            moveDirection.add(right);
        }
        
        // Normalize and apply speed
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            
            // Check if running
            this.isRunning = this.input.isKeyPressed('ShiftLeft') || this.input.isKeyPressed('ShiftRight');
            const speed = this.isRunning ? PLAYER.runSpeed : PLAYER.walkSpeed;
            
            // Project movement onto planet surface
            const tangentMove = moveDirection.clone();
            tangentMove.sub(up.clone().multiplyScalar(tangentMove.dot(up)));
            tangentMove.normalize();
            
            this.velocity.add(tangentMove.multiplyScalar(speed * deltaTime * 10));
        }
        
        // Jumping
        if (this.input.isKeyPressed('Space') && this.onGround) {
            const jumpDir = up.clone();
            this.velocity.add(jumpDir.multiplyScalar(PLAYER.jumpForce));
            this.onGround = false;
        }
    }

    handleFlightMovement(deltaTime, forward, right, up) {
        const moveDirection = new THREE.Vector3();
        
        // Include pitch in forward direction for flight
        const pitchedForward = forward.clone().applyAxisAngle(right, this.pitch);
        
        // WASD movement in 3D space
        if (this.input.isKeyPressed('KeyW')) {
            moveDirection.add(pitchedForward);
        }
        if (this.input.isKeyPressed('KeyS')) {
            moveDirection.sub(pitchedForward);
        }
        if (this.input.isKeyPressed('KeyA')) {
            moveDirection.sub(right);
        }
        if (this.input.isKeyPressed('KeyD')) {
            moveDirection.add(right);
        }
        
        // Up/Down in flight mode
        if (this.input.isKeyPressed('Space')) {
            moveDirection.add(up);
        }
        if (this.input.isKeyPressed('ShiftLeft') || this.input.isKeyPressed('ShiftRight')) {
            moveDirection.sub(up);
        }
        
        // Apply flight movement
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
            this.velocity.add(moveDirection.multiplyScalar(PLAYER.flightAcceleration * deltaTime * 60));
        }
        
        // Clamp flight speed
        if (this.velocity.length() > PLAYER.flightMaxSpeed) {
            this.velocity.normalize().multiplyScalar(PLAYER.flightMaxSpeed);
        }
        
        // Apply drag in flight mode
        this.velocity.multiplyScalar(0.95);
    }

    handleInteraction() {
        const rightHeld = this.input.isMouseButtonPressed(2);

        if (rightHeld && !this._rightHoldActive && !this.heldObject) {
            this.pickUpObject();
            this._rightHoldActive = true;
        }

        if (!rightHeld && this.heldObject) {
            this.dropObject();
            this._rightHoldActive = false;
        }

        if (!rightHeld) {
            this._rightHoldActive = false;
        }

        if (this.heldObject && this.input.isMouseButtonPressed(0) && this._throwCooldown <= 0) {
            this.throwObject();
            this._throwCooldown = 0.25;
        }
    }

    applyPhysics(deltaTime) {
        if (this.isFlying) {
            // In flight mode, just apply velocity
            this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        } else {
            // Apply gravity when not flying
            if (this.currentPlanet) {
                const gravityDir = new THREE.Vector3()
                    .subVectors(this.currentPlanet.position, this.position)
                    .normalize();
                
                const surfaceGravity = this.currentPlanet.getSurfaceGravity();
                const distance = this.currentPlanet.getDistanceTo(this.position);
                const distanceFromSurface = distance - this.currentPlanet.radius;
                
                // Apply gravity
                this.velocity.add(gravityDir.multiplyScalar(surfaceGravity * deltaTime));
                
                // Ground collision
                if (distanceFromSurface <= this.height) {
                    this.onGround = true;
                    
                    // Position correction
                    const correctionDir = gravityDir.clone().negate();
                    this.position.copy(this.currentPlanet.position).add(
                        correctionDir.multiplyScalar(this.currentPlanet.radius + this.height)
                    );
                    
                    // Remove velocity component toward planet
                    const velocityTowardPlanet = this.velocity.dot(gravityDir);
                    if (velocityTowardPlanet > 0) {
                        this.velocity.sub(gravityDir.multiplyScalar(velocityTowardPlanet));
                    }
                    
                    // Apply friction
                    this.velocity.multiplyScalar(0.85);
                } else {
                    this.onGround = false;
                }
            }
            
            // Update position
            this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        }
    }

    updateMeshPosition() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.copy(this.rotation);
        }

        if (this.heldObject) {
            const forward = this.getForwardVector();
            const up = this.getLocalAxes().up;
            const holdDistance = 2;
            const holdHeight = 0.5;
            this.heldObject.position.copy(this.position)
                .addScaledVector(forward, holdDistance)
                .addScaledVector(up, holdHeight);
            this.heldObject.velocity.set(0, 0, 0);
        }
    }

    getCameraPosition() {
        const offset = PLAYER.cameraOffset;
        const { forward, right, up } = this.getLocalAxes();
        const rotatedOffset = new THREE.Vector3()
            .addScaledVector(right, offset.x)
            .addScaledVector(up, offset.y)
            .addScaledVector(forward, offset.z);
        return this.position.clone().add(rotatedOffset);
    }

    getCameraDirection() {
        const { forward } = this.getLocalAxes();
        // Apply pitch around local right
        const right = this.getLocalAxes().right;
        return forward.clone().applyAxisAngle(right, this.pitch).normalize();
    }

    getForwardVector() {
        const { forward, right } = this.getLocalAxes();
        return forward.clone().applyAxisAngle(right, this.pitch).normalize();
    }

    setMeshVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
        }
    }

    getLocalAxes() {
        const up = this.currentPlanet
            ? new THREE.Vector3().subVectors(this.position, this.currentPlanet.position).normalize()
            : new THREE.Vector3(0, 1, 0);
        const yawQuat = new THREE.Quaternion().setFromAxisAngle(up, this.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(yawQuat).normalize();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yawQuat).normalize();
        return { forward, right, up };
    }

    getEyePosition() {
        const up = this.getLocalAxes().up;
        return this.position.clone().addScaledVector(up, this.height * 0.5);
    }

    pickUpObject() {
        const rayOrigin = this.getEyePosition();
        const rayDir = this.getForwardVector();
        const hit = this.physicsEngine.raycast(rayOrigin, rayDir, 5)[0];

        if (hit && hit.object && hit.object !== this.currentPlanet) {
            this.heldObject = hit.object;
            this.heldObject.isHeld = true;
            this.heldObject.velocity.set(0, 0, 0);
        }
    }

    dropObject() {
        if (this.heldObject) {
            this.heldObject.isHeld = false;
            this.heldObject = null;
        }
    }

    throwObject() {
        if (this.heldObject) {
            const forward = this.getForwardVector();
            const throwForce = 25;
            this.heldObject.velocity.copy(this.velocity).addScaledVector(forward, throwForce);
            this.dropObject();
        }
    }

    getInfo() {
        return {
            position: this.position.clone(),
            velocity: this.velocity.clone(),
            onGround: this.onGround,
            isFlying: this.isFlying,
            currentPlanet: this.currentPlanet ? this.currentPlanet.config.name : 'None'
        };
    }
}
