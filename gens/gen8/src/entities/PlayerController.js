/**
 * PlayerController.js
 * Handles player movement, physics, and input on celestial body surfaces.
 * Supports walking, jumping, and free flight modes.
 */

import * as THREE from 'three';
import { PLAYER, PHYSICS, RENDER_SCALE, UI, configManager } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Player');

export class PlayerController {
    constructor(physicsEngine, solarSystem, camera) {
        this.physics = physicsEngine;
        this.solarSystem = solarSystem;
        this.camera = camera;
        
        // Player state
        this.position = { x: 0, y: 0, z: 0 }; // World position in km
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { pitch: 0, yaw: 0 }; // Camera rotation
        
        // Movement state
        this.isGrounded = false;
        this.isFreeFlightMode = false;
        this.groundedBody = null;
        
        // Input state
        this.keys = {};
        this.mouseLocked = false;
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        
        // Player mesh (visible in third person)
        this.mesh = null;
        this.group = new THREE.Group();
        
        // Settings from config
        this.height = PLAYER.height;
        this.walkSpeed = PLAYER.walkSpeed;
        this.runSpeed = PLAYER.runSpeed;
        this.jumpForce = PLAYER.jumpForce;
        this.mouseSensitivity = PLAYER.mouseSensitivity;
        this.freeFlightSpeed = PLAYER.freeFlightSpeed;
        
        this.setupInput();
        this.createPlayerMesh();
        
        logger.info('Player controller initialized');
    }

    /**
     * Create the player visual representation
     */
    createPlayerMesh() {
        // Simple capsule shape for the player
        const bodyGeometry = new THREE.CapsuleGeometry(
            PLAYER.height * RENDER_SCALE.distance * 0.3,
            PLAYER.height * RENDER_SCALE.distance,
            4,
            8
        );
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488FF,
            roughness: 0.5,
            metalness: 0.2,
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;
        
        // Add visor
        const visorGeometry = new THREE.BoxGeometry(
            PLAYER.height * RENDER_SCALE.distance * 0.4,
            PLAYER.height * RENDER_SCALE.distance * 0.15,
            PLAYER.height * RENDER_SCALE.distance * 0.1
        );
        const visorMaterial = new THREE.MeshStandardMaterial({
            color: 0x88CCFF,
            roughness: 0.1,
            metalness: 0.8,
            transparent: true,
            opacity: 0.7,
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.y = PLAYER.height * RENDER_SCALE.distance * 0.4;
        visor.position.z = PLAYER.height * RENDER_SCALE.distance * 0.2;
        
        this.mesh.add(visor);
        this.group.add(this.mesh);
    }

    /**
     * Setup keyboard and mouse input handlers
     */
    setupInput() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        
        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', () => this.requestPointerLock());
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement !== null;
            logger.debug(`Pointer lock: ${this.mouseLocked}`);
        });
    }

    onKeyDown(event) {
        this.keys[event.code] = true;
        
        // Toggle free flight
        if (event.code === 'Insert') {
            this.toggleFreeFlightMode();
        }
    }

    onKeyUp(event) {
        this.keys[event.code] = false;
    }

    onMouseMove(event) {
        if (!this.mouseLocked) return;
        
        this.mouseDeltaX += event.movementX;
        this.mouseDeltaY += event.movementY;
    }

    requestPointerLock() {
        if (!this.mouseLocked) {
            document.body.requestPointerLock();
        }
    }

    /**
     * Toggle between walking and free flight mode
     */
    toggleFreeFlightMode() {
        this.isFreeFlightMode = !this.isFreeFlightMode;
        logger.info(`Free flight mode: ${this.isFreeFlightMode ? 'ON' : 'OFF'}`);
        
        if (this.isFreeFlightMode) {
            // Store current velocity and clear it
            this.velocity = { x: 0, y: 0, z: 0 };
        }
    }

    /**
     * Spawn player at a specific position
     */
    spawn(position, groundedBody = null) {
        this.position = { ...position };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.groundedBody = groundedBody;
        
        // If spawning on a body, inherit its velocity
        if (groundedBody && groundedBody.physicsBody) {
            this.velocity = { ...groundedBody.physicsBody.velocity };
        }
        
        logger.info(`Player spawned at ${JSON.stringify(position)}`);
        this.updateMeshPosition();
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        // Convert delta to seconds
        const dt = deltaTime / 1000;
        
        // Handle mouse look
        this.updateRotation();
        
        // Handle movement based on mode
        if (this.isFreeFlightMode) {
            this.updateFreeFlight(dt);
        } else {
            this.updateGroundMovement(dt);
        }
        
        // Update mesh position
        this.updateMeshPosition();
    }

    /**
     * Update camera rotation from mouse input
     */
    updateRotation() {
        this.rotation.yaw -= this.mouseDeltaX * this.mouseSensitivity;
        this.rotation.pitch -= this.mouseDeltaY * this.mouseSensitivity;
        
        // Clamp pitch
        this.rotation.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.rotation.pitch));
        
        // Reset deltas
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
    }

    /**
     * Update ground-based movement
     */
    updateGroundMovement(dt) {
        // Find the nearest celestial body
        const { body: nearestBody, distance } = this.solarSystem.getNearestBody(this.position);
        
        if (!nearestBody) return;
        
        // Get local "up" direction (away from planet center)
        const dx = this.position.x - nearestBody.position.x;
        const dy = this.position.y - nearestBody.position.y;
        const dz = this.position.z - nearestBody.position.z;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        const upVector = {
            x: dx / distFromCenter,
            y: dy / distFromCenter,
            z: dz / distFromCenter,
        };
        
        // Calculate altitude above surface
        const altitude = distFromCenter - nearestBody.radius;
        
        // Check if grounded
        const wasGrounded = this.isGrounded;
        this.isGrounded = altitude <= this.height * 1.1;
        
        if (this.isGrounded && !wasGrounded) {
            logger.debug(`Landed on ${nearestBody.name}`);
            this.groundedBody = nearestBody;
        }
        
        // Get surface gravity
        const gravity = nearestBody.getSurfaceGravity();
        
        // Calculate forward and right vectors (relative to surface)
        const forward = this.getForwardVector(upVector);
        const right = this.getRightVector(upVector);
        
        // Handle input
        let moveX = 0, moveZ = 0;
        const speed = this.keys['ShiftLeft'] ? this.runSpeed : this.walkSpeed;
        
        if (this.keys['KeyW']) moveZ += 1;
        if (this.keys['KeyS']) moveZ -= 1;
        if (this.keys['KeyA']) moveX -= 1;
        if (this.keys['KeyD']) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveZ !== 0) {
            const norm = 1 / Math.sqrt(2);
            moveX *= norm;
            moveZ *= norm;
        }
        
        // Apply movement
        if (this.isGrounded) {
            // Inherit grounded body velocity
            if (this.groundedBody && this.groundedBody.physicsBody) {
                const bodyVel = this.groundedBody.physicsBody.velocity;
                this.velocity.x = bodyVel.x;
                this.velocity.y = bodyVel.y;
                this.velocity.z = bodyVel.z;
            }
            
            // Add player movement
            this.velocity.x += (forward.x * moveZ + right.x * moveX) * speed;
            this.velocity.y += (forward.y * moveZ + right.y * moveX) * speed;
            this.velocity.z += (forward.z * moveZ + right.z * moveX) * speed;
            
            // Handle jumping
            if (this.keys['Space']) {
                this.velocity.x += upVector.x * this.jumpForce;
                this.velocity.y += upVector.y * this.jumpForce;
                this.velocity.z += upVector.z * this.jumpForce;
                this.isGrounded = false;
                logger.debug('Jump!');
            }
        } else {
            // Apply gravity
            this.velocity.x -= upVector.x * gravity * dt;
            this.velocity.y -= upVector.y * gravity * dt;
            this.velocity.z -= upVector.z * gravity * dt;
        }
        
        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.z += this.velocity.z * dt;
        
        // Collision with ground
        if (altitude < this.height) {
            // Push player to surface
            const correction = this.height - altitude;
            this.position.x += upVector.x * correction;
            this.position.y += upVector.y * correction;
            this.position.z += upVector.z * correction;
            
            // Remove velocity component towards surface
            const velDotUp = this.velocity.x * upVector.x + 
                            this.velocity.y * upVector.y + 
                            this.velocity.z * upVector.z;
            if (velDotUp < 0) {
                this.velocity.x -= velDotUp * upVector.x;
                this.velocity.y -= velDotUp * upVector.y;
                this.velocity.z -= velDotUp * upVector.z;
            }
            
            this.isGrounded = true;
        }
    }

    /**
     * Update free flight movement
     */
    updateFreeFlight(dt) {
        const speed = this.keys['ShiftLeft'] ? 
            this.freeFlightSpeed * PLAYER.freeFlightFastMultiplier : 
            this.freeFlightSpeed;
        
        // Get camera direction
        const forward = new THREE.Vector3(0, 0, -1);
        const right = new THREE.Vector3(1, 0, 0);
        const up = new THREE.Vector3(0, 1, 0);
        
        // Apply rotation
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(this.rotation.pitch, this.rotation.yaw, 0, 'YXZ'));
        forward.applyQuaternion(quaternion);
        right.applyQuaternion(quaternion);
        
        // Handle input
        if (this.keys['KeyW']) {
            this.position.x += forward.x * speed;
            this.position.y += forward.y * speed;
            this.position.z += forward.z * speed;
        }
        if (this.keys['KeyS']) {
            this.position.x -= forward.x * speed;
            this.position.y -= forward.y * speed;
            this.position.z -= forward.z * speed;
        }
        if (this.keys['KeyA']) {
            this.position.x -= right.x * speed;
            this.position.y -= right.y * speed;
            this.position.z -= right.z * speed;
        }
        if (this.keys['KeyD']) {
            this.position.x += right.x * speed;
            this.position.y += right.y * speed;
            this.position.z += right.z * speed;
        }
        if (this.keys['Space']) {
            this.position.y += speed;
        }
        if (this.keys['ShiftRight'] || this.keys['ControlLeft']) {
            this.position.y -= speed;
        }
    }

    /**
     * Calculate forward vector relative to surface
     */
    getForwardVector(upVector) {
        // Camera forward direction
        const camForward = new THREE.Vector3(
            Math.sin(this.rotation.yaw) * Math.cos(this.rotation.pitch),
            Math.sin(this.rotation.pitch),
            -Math.cos(this.rotation.yaw) * Math.cos(this.rotation.pitch)
        );
        
        // Project onto surface plane
        const up = new THREE.Vector3(upVector.x, upVector.y, upVector.z);
        camForward.sub(up.multiplyScalar(camForward.dot(up)));
        camForward.normalize();
        
        return { x: camForward.x, y: camForward.y, z: camForward.z };
    }

    /**
     * Calculate right vector relative to surface
     */
    getRightVector(upVector) {
        const forward = this.getForwardVector(upVector);
        const up = new THREE.Vector3(upVector.x, upVector.y, upVector.z);
        const fwd = new THREE.Vector3(forward.x, forward.y, forward.z);
        const right = new THREE.Vector3().crossVectors(fwd, up).normalize();
        
        return { x: right.x, y: right.y, z: right.z };
    }

    /**
     * Get the "up" vector at player position (away from nearest body center)
     */
    getLocalUpVector() {
        const { body } = this.solarSystem.getNearestBody(this.position);
        if (!body) return { x: 0, y: 1, z: 0 };
        
        const dx = this.position.x - body.position.x;
        const dy = this.position.y - body.position.y;
        const dz = this.position.z - body.position.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return { x: dx / len, y: dy / len, z: dz / len };
    }

    /**
     * Update mesh visual position
     */
    updateMeshPosition() {
        const scaled = this.getScaledPosition();
        this.group.position.set(scaled.x, scaled.y, scaled.z);
        
        // Rotate mesh to face movement direction
        this.group.rotation.set(0, this.rotation.yaw, 0);
        
        // Align to surface normal
        if (!this.isFreeFlightMode) {
            const up = this.getLocalUpVector();
            const upVec = new THREE.Vector3(up.x, up.y, up.z);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
            this.group.quaternion.copy(quaternion);
            this.group.rotateY(this.rotation.yaw);
        }
    }

    /**
     * Get scaled position for rendering
     */
    getScaledPosition() {
        return {
            x: this.position.x * RENDER_SCALE.distance,
            y: this.position.y * RENDER_SCALE.distance,
            z: this.position.z * RENDER_SCALE.distance,
        };
    }

    /**
     * Get player info for debug display
     */
    getDebugInfo() {
        const { body, distance } = this.solarSystem.getNearestBody(this.position);
        const altitude = body ? distance - body.radius : 0;
        
        return {
            position: this.position,
            velocity: this.velocity,
            speed: Math.sqrt(
                this.velocity.x ** 2 + 
                this.velocity.y ** 2 + 
                this.velocity.z ** 2
            ),
            isGrounded: this.isGrounded,
            isFreeFlightMode: this.isFreeFlightMode,
            nearestBody: body ? body.name : 'None',
            altitude: altitude,
        };
    }

    /**
     * Get the Three.js group for the player mesh
     */
    getObject3D() {
        return this.group;
    }

    /**
     * Dispose resources
     */
    dispose() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        document.removeEventListener('mousemove', this.onMouseMove);
        
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        logger.info('Player controller disposed');
    }
}
