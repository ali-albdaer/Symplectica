/**
 * Player Controller
 * Handles player movement, physics, and interaction
 */

import { PhysicsObject } from '../physics/PhysicsObject.js';
import { Vector3D } from '../utils/Vector3D.js';
import { CONFIG } from '../../config/globals.js';

export class Player extends PhysicsObject {
    constructor(config = {}) {
        super({
            mass: CONFIG.PLAYER.mass,
            radius: 0.5,
            ...config
        });

        // Player properties
        this.height = CONFIG.PLAYER.height;
        this.walkSpeed = CONFIG.PLAYER.walkSpeed;
        this.runSpeed = CONFIG.PLAYER.runSpeed;
        this.jumpForce = CONFIG.PLAYER.jumpForce;
        this.flightSpeed = CONFIG.PLAYER.flightSpeed;
        this.flightAcceleration = CONFIG.PLAYER.flightAcceleration;
        this.flightDamping = CONFIG.PLAYER.flightDamping;

        // State
        this.isGrounded = false;
        this.isFlying = false;
        this.canJump = true;
        this.currentPlanet = null;

        // Input state
        this.keys = {};
        this.moveDirection = new Vector3D();

        // Flight velocity
        this.flightVelocity = new Vector3D();

        // Camera reference
        this.camera = null;

        // Initialize input
        this.initializeInput();
    }

    /**
     * Initialize input handlers
     */
    initializeInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    /**
     * Handle key presses
     */
    handleKeyPress(key) {
        switch(key.toLowerCase()) {
            case 'insert':
                this.toggleFlight();
                break;
            case 'v':
                if (this.camera) {
                    this.camera.toggleMode();
                }
                break;
        }
    }

    /**
     * Toggle flight mode
     */
    toggleFlight() {
        this.isFlying = !this.isFlying;
        
        if (this.isFlying) {
            console.log('✈️ Free Flight ENABLED');
            this.affectedByGravity = false;
            // Preserve current velocity
            this.flightVelocity.copy(this.velocity);
        } else {
            console.log('🚶 Free Flight DISABLED');
            this.affectedByGravity = true;
            // Transfer flight velocity back
            this.velocity.copy(this.flightVelocity);
            this.flightVelocity.set(0, 0, 0);
        }
    }

    /**
     * Set camera reference
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Set current planet (for gravity and surface interaction)
     */
    setCurrentPlanet(planet) {
        this.currentPlanet = planet;
    }

    /**
     * Update player
     */
    update(deltaTime) {
        if (this.isFlying) {
            this.updateFlightMode(deltaTime);
        } else {
            this.updateGroundMode(deltaTime);
        }

        // Call parent update
        super.update(deltaTime);

        // Check ground collision with current planet
        if (this.currentPlanet && !this.isFlying) {
            this.checkPlanetSurface();
        }
    }

    /**
     * Update flight mode movement
     */
    updateFlightMode(deltaTime) {
        if (!this.camera) return;

        // Get camera directions
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);

        this.camera.camera.getWorldDirection(forward);
        right.crossVectors(forward, up).normalize();

        // Calculate movement direction
        const moveDir = new THREE.Vector3();

        if (this.keys['w']) moveDir.add(forward);
        if (this.keys['s']) moveDir.sub(forward);
        if (this.keys['a']) moveDir.sub(right);
        if (this.keys['d']) moveDir.add(right);
        if (this.keys[' ']) moveDir.add(up);        // Space = up
        if (this.keys['shift']) moveDir.sub(up);    // Shift = down

        // Normalize movement direction
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // Apply acceleration
            const acceleration = moveDir.multiplyScalar(this.flightAcceleration * deltaTime);
            this.flightVelocity.x += acceleration.x;
            this.flightVelocity.y += acceleration.y;
            this.flightVelocity.z += acceleration.z;

            // Limit speed
            const speed = this.flightVelocity.magnitude();
            if (speed > this.flightSpeed) {
                this.flightVelocity.setMagnitude(this.flightSpeed);
            }
        }

        // Apply damping
        this.flightVelocity.multiplyScalar(this.flightDamping);

        // Update position
        this.position.x += this.flightVelocity.x * deltaTime;
        this.position.y += this.flightVelocity.y * deltaTime;
        this.position.z += this.flightVelocity.z * deltaTime;

        // Update velocity for physics
        this.velocity.copy(this.flightVelocity);
    }

    /**
     * Update ground mode movement
     */
    updateGroundMode(deltaTime) {
        if (!this.camera) return;

        // Get horizontal movement direction from camera
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();

        // Calculate movement
        const moveDir = new THREE.Vector3();
        
        if (this.keys['w']) moveDir.add(forward);
        if (this.keys['s']) moveDir.sub(forward);
        if (this.keys['a']) moveDir.sub(right);
        if (this.keys['d']) moveDir.add(right);

        // Apply movement
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            const speed = this.keys['shift'] && this.isGrounded ? this.runSpeed : this.walkSpeed;
            
            // Apply horizontal velocity
            this.velocity.x = moveDir.x * speed;
            this.velocity.z = moveDir.z * speed;
        } else if (this.isGrounded) {
            // Apply friction when grounded
            this.velocity.x *= CONFIG.PHYSICS.groundFriction;
            this.velocity.z *= CONFIG.PHYSICS.groundFriction;
        }

        // Jumping
        if (this.keys[' '] && this.isGrounded && this.canJump) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            this.canJump = false;
            
            if (this.camera) {
                this.camera.shake(0.1, 0.1);
            }
        }

        // Reset jump when space is released
        if (!this.keys[' ']) {
            this.canJump = true;
        }
    }

    /**
     * Check and handle planet surface collision
     */
    checkPlanetSurface() {
        if (!this.currentPlanet) return;

        const altitude = this.currentPlanet.getAltitude(this.position);
        const surfaceThreshold = this.height / 2;

        if (altitude <= surfaceThreshold) {
            // Snap to surface
            this.currentPlanet.snapToSurface(this, this.height / 2);
            
            // Stop downward velocity
            if (this.velocity.y < 0) {
                this.velocity.y = 0;
            }
            
            this.isGrounded = true;

            // Apply surface friction
            const surfaceVel = this.currentPlanet.getSurfaceVelocity(this.position);
            // Optionally add surface velocity to player (planet rotation)
            
        } else {
            this.isGrounded = false;
        }
    }

    /**
     * Create player mesh
     */
    createMesh(scene) {
        // Simple capsule for player (cylinder + spheres)
        const bodyHeight = this.height * 0.6;
        const bodyRadius = 0.3;

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4488FF,
            roughness: 0.7,
            metalness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

        // Head
        const headGeometry = new THREE.SphereGeometry(bodyRadius * 0.8, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFDDAA,
            roughness: 0.8,
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = bodyHeight / 2 + bodyRadius * 0.8;

        // Create group
        this.mesh = new THREE.Group();
        this.mesh.add(body);
        this.mesh.add(head);
        
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        scene.add(this.mesh);

        // Only show in third person
        this.mesh.visible = false;

        return this.mesh;
    }

    /**
     * Update mesh visibility based on camera mode
     */
    updateMeshVisibility() {
        if (this.mesh && this.camera) {
            this.mesh.visible = this.camera.currentMode === this.camera.modes.THIRD_PERSON;
        }
    }

    /**
     * Override update mesh to handle visibility
     */
    updateMesh() {
        super.updateMesh();
        this.updateMeshVisibility();
    }

    /**
     * Spawn player on a planet
     */
    spawnOnPlanet(planet) {
        this.currentPlanet = planet;
        
        // Place player on planet surface
        const spawnHeight = CONFIG.PLAYER.spawnHeight;
        
        // Default spawn at planet's "north pole" + offset
        const spawnPos = {
            x: planet.position.x,
            y: planet.position.y + planet.renderRadius + spawnHeight,
            z: planet.position.z
        };

        this.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
        this.velocity.set(0, 0, 0);
        
        // Match planet's velocity (orbital motion)
        this.velocity.copy(planet.velocity);

        console.log(`👤 Player spawned on ${planet.name}`);
        console.log(`   Position: ${this.position.toString()}`);
    }

    /**
     * Get player state for UI
     */
    getState() {
        return {
            ...super.getState(),
            isGrounded: this.isGrounded,
            isFlying: this.isFlying,
            currentPlanet: this.currentPlanet ? this.currentPlanet.name : 'None',
            altitude: this.currentPlanet ? this.currentPlanet.getAltitude(this.position) : 0,
        };
    }
}

export default Player;
