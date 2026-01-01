/**
 * Player Controller
 * Handles player movement, physics, and state
 */

import { Config, PLAYER } from './config.js';
import { Vector3, Quaternion, clamp, degToRad } from './Math3D.js';
import { PhysicsBody } from './Physics.js';

export class Player {
    constructor(physics, celestialManager) {
        this.physics = physics;
        this.celestialManager = celestialManager;
        
        // Player state
        this.position = new Vector3();
        this.velocity = new Vector3();
        this.rotation = { yaw: 0, pitch: 0 };
        
        // Physics body
        this.physicsBody = null;
        
        // Movement state
        this.isGrounded = false;
        this.isFlying = false;
        this.isSprinting = false;
        this.currentPlanet = null;
        this.localUp = new Vector3(0, 1, 0);
        
        // View mode
        this.viewMode = 'first'; // 'first' or 'third'
        
        // Player mesh
        this.mesh = null;
        this.height = Config.player.HEIGHT;
        this.radius = Config.player.RADIUS;
        
        // Jump cooldown
        this.jumpCooldown = 0;
        
        // Interaction
        this.heldObject = null;
        this.interactionRange = 3;
    }
    
    /**
     * Initialize player at spawn point
     */
    initialize(scene) {
        // Create player mesh (capsule approximation)
        const geometry = new THREE.CapsuleGeometry(this.radius, this.height - this.radius * 2, 8, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4488FF,
            transparent: true,
            opacity: 0.8
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.visible = false; // Hidden in first person
        
        scene.add(this.mesh);
        
        // Create physics body
        this.physicsBody = new PhysicsBody({
            id: 'player',
            type: 'dynamic',
            mass: Config.player.MASS,
            radius: this.radius,
            restitution: 0.1,
            friction: 0.8
        });
        
        this.physics.addBody(this.physicsBody);
        
        // Spawn on planet
        this.spawnOnPlanet('planet1');
    }
    
    /**
     * Spawn player on a planet's surface
     */
    spawnOnPlanet(planetId) {
        const planet = this.celestialManager.getBody(planetId);
        if (!planet) {
            console.error(`Planet ${planetId} not found`);
            return;
        }
        
        this.currentPlanet = planet;
        
        // Get surface position (at equator, 0 longitude)
        const surfaceRadius = planet.config.radius * this.celestialManager.worldScale;
        const spawnHeight = surfaceRadius + this.height;
        
        // Position on top of planet
        this.position.set(
            planet.position.x,
            planet.position.y + spawnHeight,
            planet.position.z
        );
        
        // Match planet velocity
        this.velocity.copy(planet.velocity);
        
        // Update physics body
        this.physicsBody.position.copy(this.position);
        this.physicsBody.velocity.copy(this.velocity);
        
        // Set local up vector
        this.localUp.set(0, 1, 0);
        
        this.isGrounded = true;
    }
    
    /**
     * Update player state
     */
    update(deltaTime, input) {
        // Update cooldowns
        if (this.jumpCooldown > 0) {
            this.jumpCooldown -= deltaTime;
        }
        
        // Handle mode switching
        if (input.isKeyJustPressed('Insert')) {
            this.toggleFlightMode();
        }
        
        if (input.isKeyJustPressed('KeyV')) {
            this.toggleViewMode();
        }
        
        // Get current gravity source
        this.updateGravityReference();
        
        // Handle movement based on mode
        if (this.isFlying) {
            this.handleFlightMovement(deltaTime, input);
        } else {
            this.handleGroundMovement(deltaTime, input);
        }
        
        // Handle looking
        this.handleLook(input);
        
        // Handle interaction
        this.handleInteraction(input);
        
        // Sync with physics
        this.syncWithPhysics();
        
        // Update mesh
        this.updateMesh();
    }
    
    /**
     * Update local gravity reference
     */
    updateGravityReference() {
        const gravitySource = this.physics.getDominantGravitySource(this.position);
        
        if (gravitySource.body) {
            const body = this.celestialManager.bodies.get(gravitySource.body.id);
            if (body) {
                this.currentPlanet = body;
                
                // Calculate local up (away from planet center)
                const dx = this.position.x - body.position.x;
                const dy = this.position.y - body.position.y;
                const dz = this.position.z - body.position.z;
                const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (len > 0.001) {
                    this.localUp.set(dx / len, dy / len, dz / len);
                }
            }
        }
        
        // Check grounded state from physics
        this.isGrounded = this.physicsBody.isGrounded;
    }
    
    /**
     * Handle ground/walking movement
     */
    handleGroundMovement(deltaTime, input) {
        const moveInput = input.getMovementInput();
        const sprint = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
        
        this.isSprinting = sprint && this.isGrounded;
        
        // Calculate movement speed
        const speed = sprint ? Config.player.RUN_SPEED : Config.player.WALK_SPEED;
        
        // Get forward and right vectors relative to camera and local up
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        
        // Movement direction
        const moveDir = new Vector3(
            forward.x * (-moveInput.z) + right.x * moveInput.x,
            forward.y * (-moveInput.z) + right.y * moveInput.x,
            forward.z * (-moveInput.z) + right.z * moveInput.x
        );
        
        // Project onto surface plane (perpendicular to local up)
        const upDot = moveDir.x * this.localUp.x + moveDir.y * this.localUp.y + moveDir.z * this.localUp.z;
        moveDir.x -= this.localUp.x * upDot;
        moveDir.y -= this.localUp.y * upDot;
        moveDir.z -= this.localUp.z * upDot;
        
        // Normalize and apply speed
        const moveDirLen = moveDir.length();
        if (moveDirLen > 0.001) {
            moveDir.multiplyScalar(speed / moveDirLen);
        }
        
        // Apply movement force
        if (this.isGrounded) {
            // Direct velocity control on ground
            const targetVelX = moveDir.x;
            const targetVelY = moveDir.y;
            const targetVelZ = moveDir.z;
            
            // Get velocity relative to planet
            const relVelX = this.physicsBody.velocity.x - (this.currentPlanet ? this.currentPlanet.velocity.x : 0);
            const relVelY = this.physicsBody.velocity.y - (this.currentPlanet ? this.currentPlanet.velocity.y : 0);
            const relVelZ = this.physicsBody.velocity.z - (this.currentPlanet ? this.currentPlanet.velocity.z : 0);
            
            // Remove vertical component
            const upVel = relVelX * this.localUp.x + relVelY * this.localUp.y + relVelZ * this.localUp.z;
            
            // Lerp horizontal velocity
            const lerp = 0.2;
            const newVelX = relVelX + (targetVelX - relVelX) * lerp;
            const newVelY = relVelY + (targetVelY - relVelY) * lerp;
            const newVelZ = relVelZ + (targetVelZ - relVelZ) * lerp;
            
            // Add back vertical velocity and planet velocity
            this.physicsBody.velocity.x = newVelX + (this.currentPlanet ? this.currentPlanet.velocity.x : 0);
            this.physicsBody.velocity.y = newVelY + (this.currentPlanet ? this.currentPlanet.velocity.y : 0);
            this.physicsBody.velocity.z = newVelZ + (this.currentPlanet ? this.currentPlanet.velocity.z : 0);
        } else {
            // Air control (reduced)
            const airControl = 0.3;
            this.physicsBody.velocity.x += moveDir.x * airControl * deltaTime;
            this.physicsBody.velocity.y += moveDir.y * airControl * deltaTime;
            this.physicsBody.velocity.z += moveDir.z * airControl * deltaTime;
        }
        
        // Jump
        if (input.isKeyDown('Space') && this.isGrounded && this.jumpCooldown <= 0) {
            const jumpForce = Config.player.JUMP_FORCE;
            
            // Get surface gravity for this planet
            const surfaceGravity = this.currentPlanet ? this.currentPlanet.getSurfaceGravity() : 9.81;
            const jumpMultiplier = Math.sqrt(9.81 / surfaceGravity);
            
            this.physicsBody.velocity.x += this.localUp.x * jumpForce * jumpMultiplier;
            this.physicsBody.velocity.y += this.localUp.y * jumpForce * jumpMultiplier;
            this.physicsBody.velocity.z += this.localUp.z * jumpForce * jumpMultiplier;
            
            this.isGrounded = false;
            this.physicsBody.isGrounded = false;
            this.jumpCooldown = 0.2;
        }
    }
    
    /**
     * Handle free flight movement
     */
    handleFlightMovement(deltaTime, input) {
        const moveInput = input.getMovementInput();
        const verticalInput = input.getVerticalInput();
        const sprint = input.isKeyDown('ShiftLeft') || input.isKeyDown('ShiftRight');
        
        // Flight speed
        const speed = sprint ? Config.player.FLIGHT_SPEED_FAST : Config.player.FLIGHT_SPEED;
        
        // Get camera-relative directions
        const forward = this.getForwardVector();
        const right = this.getRightVector();
        const up = new Vector3(0, 1, 0); // World up for flight
        
        // Calculate movement direction
        const moveDir = new Vector3(
            forward.x * (-moveInput.z) + right.x * moveInput.x + up.x * verticalInput,
            forward.y * (-moveInput.z) + right.y * moveInput.x + up.y * verticalInput,
            forward.z * (-moveInput.z) + right.z * moveInput.x + up.z * verticalInput
        );
        
        // Normalize and apply speed
        const moveDirLen = moveDir.length();
        if (moveDirLen > 0.001) {
            moveDir.multiplyScalar(speed / moveDirLen);
        }
        
        // Set velocity directly in flight mode
        this.physicsBody.velocity.x = moveDir.x;
        this.physicsBody.velocity.y = moveDir.y;
        this.physicsBody.velocity.z = moveDir.z;
        
        // In flight mode, override gravity
        this.physicsBody.isStatic = true; // Temporarily disable gravity
    }
    
    /**
     * Handle mouse look
     */
    handleLook(input) {
        const look = input.getLookInput();
        const sensitivity = Config.player.MOUSE_SENSITIVITY;
        
        this.rotation.yaw -= look.x * sensitivity;
        this.rotation.pitch -= look.y * sensitivity;
        
        // Clamp pitch
        this.rotation.pitch = clamp(this.rotation.pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    }
    
    /**
     * Handle object interaction
     */
    handleInteraction(input) {
        // Pick up / drop objects
        if (input.isKeyJustPressed('KeyE')) {
            if (this.heldObject) {
                this.dropObject();
            } else {
                this.pickUpObject();
            }
        }
        
        // Throw held object
        if (input.isMouseButtonDown(0) && this.heldObject) {
            this.throwObject();
        }
    }
    
    /**
     * Try to pick up nearby object
     */
    pickUpObject() {
        const forward = this.getForwardVector();
        const rayOrigin = this.getEyePosition();
        
        const hit = this.physics.raycast(rayOrigin, forward, this.interactionRange);
        
        if (hit && hit.body.type !== 'celestial' && hit.body.id !== 'player') {
            this.heldObject = hit.body;
            this.heldObject.isHeld = true;
        }
    }
    
    /**
     * Drop held object
     */
    dropObject() {
        if (this.heldObject) {
            this.heldObject.isHeld = false;
            this.heldObject = null;
        }
    }
    
    /**
     * Throw held object
     */
    throwObject() {
        if (this.heldObject) {
            const forward = this.getForwardVector();
            const throwForce = 20;
            
            this.heldObject.velocity.x = this.velocity.x + forward.x * throwForce;
            this.heldObject.velocity.y = this.velocity.y + forward.y * throwForce;
            this.heldObject.velocity.z = this.velocity.z + forward.z * throwForce;
            
            this.dropObject();
        }
    }
    
    /**
     * Sync position with physics body
     */
    syncWithPhysics() {
        // Get position from physics
        if (this.physicsBody.renderPosition) {
            this.position.copy(this.physicsBody.renderPosition);
        } else {
            this.position.copy(this.physicsBody.position);
        }
        
        this.velocity.copy(this.physicsBody.velocity);
        
        // Update held object position
        if (this.heldObject) {
            const forward = this.getForwardVector();
            const holdDistance = 2;
            
            this.heldObject.position.x = this.position.x + forward.x * holdDistance;
            this.heldObject.position.y = this.position.y + forward.y * holdDistance + this.height * 0.5;
            this.heldObject.position.z = this.position.z + forward.z * holdDistance;
            
            // Match velocity
            this.heldObject.velocity.copy(this.velocity);
        }
        
        // Re-enable physics in flight mode for next frame
        if (this.isFlying) {
            this.physicsBody.isStatic = false;
        }
    }
    
    /**
     * Update player mesh
     */
    updateMesh() {
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            
            // Rotate to align with local up
            const defaultUp = new THREE.Vector3(0, 1, 0);
            const localUp = new THREE.Vector3(this.localUp.x, this.localUp.y, this.localUp.z);
            
            const quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(defaultUp, localUp);
            this.mesh.quaternion.copy(quaternion);
            
            // Apply yaw rotation
            this.mesh.rotateY(this.rotation.yaw);
            
            // Visibility based on view mode
            this.mesh.visible = this.viewMode === 'third';
        }
    }
    
    /**
     * Toggle between first and third person
     */
    toggleViewMode() {
        this.viewMode = this.viewMode === 'first' ? 'third' : 'first';
        if (this.mesh) {
            this.mesh.visible = this.viewMode === 'third';
        }
    }
    
    /**
     * Toggle flight mode
     */
    toggleFlightMode() {
        this.isFlying = !this.isFlying;
        this.physicsBody.isStatic = false;
        
        if (this.isFlying) {
            // Clear gravity effects
            this.physicsBody.isGrounded = false;
        }
    }
    
    /**
     * Get forward direction vector
     */
    getForwardVector() {
        const x = Math.sin(this.rotation.yaw) * Math.cos(this.rotation.pitch);
        const y = Math.sin(this.rotation.pitch);
        const z = Math.cos(this.rotation.yaw) * Math.cos(this.rotation.pitch);
        return new Vector3(x, y, z);
    }
    
    /**
     * Get right direction vector
     */
    getRightVector() {
        const forward = this.getForwardVector();
        return Vector3.cross(forward, this.localUp).normalize();
    }
    
    /**
     * Get eye position
     */
    getEyePosition() {
        return new Vector3(
            this.position.x + this.localUp.x * (this.height - 0.2),
            this.position.y + this.localUp.y * (this.height - 0.2),
            this.position.z + this.localUp.z * (this.height - 0.2)
        );
    }
    
    /**
     * Get current speed
     */
    getSpeed() {
        // Speed relative to current planet
        if (this.currentPlanet) {
            const relVel = new Vector3(
                this.velocity.x - this.currentPlanet.velocity.x,
                this.velocity.y - this.currentPlanet.velocity.y,
                this.velocity.z - this.currentPlanet.velocity.z
            );
            return relVel.length();
        }
        return this.velocity.length();
    }
    
    /**
     * Get player state info
     */
    getState() {
        return {
            position: this.position,
            velocity: this.velocity,
            speed: this.getSpeed(),
            isGrounded: this.isGrounded,
            isFlying: this.isFlying,
            viewMode: this.viewMode,
            currentPlanet: this.currentPlanet ? this.currentPlanet.config.name : 'Space'
        };
    }
    
    /**
     * Cleanup
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.physicsBody) {
            this.physics.removeBody(this.physicsBody);
        }
    }
}

export default Player;
