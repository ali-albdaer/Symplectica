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
        
        // Camera orientation
        this.pitch = 0;
        this.yaw = 0;
        
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
        
        // Position player slightly above surface
        const spawnHeight = this.height;
        const direction = new THREE.Vector3(1, 0, 0).normalize();
        this.position.copy(planet.position).add(
            direction.multiplyScalar(planet.radius + spawnHeight)
        );
        
        this.velocity.set(0, 0, 0);
        this.updateMeshPosition();
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.applyPhysics(deltaTime);
        this.updateMeshPosition();
    }

    handleInput(deltaTime) {
        // Toggle flight mode
        if (this.input.isKeyPressed('Insert')) {
            // Debounce check
            if (!this._flightToggleDebounce) {
                this.isFlying = !this.isFlying;
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
        
        // Calculate movement direction based on camera orientation
        const moveDirection = new THREE.Vector3();
        const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, this.yaw, 0));
        const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, this.yaw, 0));
        
        if (this.isFlying) {
            this.handleFlightMovement(deltaTime, forward, right);
        } else {
            this.handleGroundMovement(deltaTime, forward, right);
        }
    }

    handleGroundMovement(deltaTime, forward, right) {
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
            
            // Apply movement relative to planet surface
            if (this.currentPlanet) {
                // Get local up direction (away from planet center)
                const up = new THREE.Vector3()
                    .subVectors(this.position, this.currentPlanet.position)
                    .normalize();
                
                // Project movement onto planet surface
                const tangentMove = moveDirection.clone();
                tangentMove.sub(up.clone().multiplyScalar(tangentMove.dot(up)));
                tangentMove.normalize();
                
                this.velocity.add(tangentMove.multiplyScalar(speed * deltaTime * 10));
            }
        }
        
        // Jumping
        if (this.input.isKeyPressed('Space') && this.onGround) {
            const jumpDir = new THREE.Vector3()
                .subVectors(this.position, this.currentPlanet.position)
                .normalize();
            this.velocity.add(jumpDir.multiplyScalar(PLAYER.jumpForce));
            this.onGround = false;
        }
    }

    handleFlightMovement(deltaTime, forward, right) {
        const moveDirection = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        
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
            // Get local up direction
            const localUp = this.currentPlanet 
                ? new THREE.Vector3().subVectors(this.position, this.currentPlanet.position).normalize()
                : new THREE.Vector3(0, 1, 0);
            moveDirection.add(localUp);
        }
        if (this.input.isKeyPressed('ShiftLeft') || this.input.isKeyPressed('ShiftRight')) {
            const localUp = this.currentPlanet 
                ? new THREE.Vector3().subVectors(this.position, this.currentPlanet.position).normalize()
                : new THREE.Vector3(0, 1, 0);
            moveDirection.sub(localUp);
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
                    const correctionDir = new THREE.Vector3()
                        .subVectors(this.position, this.currentPlanet.position)
                        .normalize();
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
    }

    getCameraPosition() {
        const offset = PLAYER.cameraOffset;
        const rotatedOffset = new THREE.Vector3(offset.x, offset.y, offset.z)
            .applyEuler(this.rotation);
        return this.position.clone().add(rotatedOffset);
    }

    getCameraDirection() {
        return new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
    }

    setMeshVisible(visible) {
        if (this.mesh) {
            this.mesh.visible = visible;
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
