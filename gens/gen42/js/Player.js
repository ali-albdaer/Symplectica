/**
 * Player.js - Player Entity Module
 * 
 * Handles player state, position, and model.
 */

import Config from './Config.js';
import Debug from './Debug.js';

class Player {
    constructor() {
        // Position and movement
        this.position = {
            x: Config.player.spawnPosition.x,
            y: Config.player.spawnPosition.y,
            z: Config.player.spawnPosition.z
        };
        
        this.velocity = { x: 0, y: 0, z: 0 };
        
        // Orientation (euler angles)
        this.rotation = { pitch: 0, yaw: 0, roll: 0 };
        
        // State
        this.isFlying = false;
        this.isGrounded = false;
        this.isSprinting = false;
        
        // Camera mode
        this.isFirstPerson = true;
        this.thirdPersonOffset = { x: 0, y: 0, z: 0 };
        
        // Physical properties
        this.mass = Config.player.mass;
        this.height = Config.player.height;
        this.radius = Config.player.radius;
        
        // Three.js objects
        this.mesh = null;
        this.camera = null;
        this.cameraHolder = null;
    }
    
    /**
     * Initialize player with Three.js scene
     */
    init(THREE, camera) {
        this.THREE = THREE;
        this.camera = camera;
        
        // Create a camera holder for smooth rotations
        this.cameraHolder = new THREE.Object3D();
        this.cameraHolder.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        // Create simple player mesh (cylinder with spheres for a capsule-like shape)
        const bodyGeometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height - this.radius * 2,
            8
        );
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            emissive: 0x112244,
            emissiveIntensity: 0.3,
            roughness: 0.5,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.visible = false; // Hidden in first person
        
        // Position mesh
        this.mesh.position.set(
            this.position.x,
            this.position.y,
            this.position.z
        );
        
        Debug.info('Player initialized');
        return this.mesh;
    }
    
    /**
     * Toggle between first and third person camera
     */
    toggleCameraView() {
        this.isFirstPerson = !this.isFirstPerson;
        this.mesh.visible = !this.isFirstPerson;
        
        Debug.info(`Camera: ${this.isFirstPerson ? 'First Person' : 'Third Person'}`);
    }
    
    /**
     * Toggle flight mode
     */
    toggleFlightMode() {
        this.isFlying = !this.isFlying;
        
        if (this.isFlying) {
            Debug.info('Flight mode enabled');
        } else {
            Debug.info('Walking mode enabled');
        }
    }
    
    /**
     * Update player state
     */
    update(deltaTime) {
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z
            );
            this.mesh.rotation.y = this.rotation.yaw;
        }
        
        // Update camera position based on mode
        if (this.camera) {
            if (this.isFirstPerson) {
                this.camera.position.set(
                    this.position.x,
                    this.position.y + this.height * 0.4,
                    this.position.z
                );
            } else {
                // Third person - smooth follow
                const targetOffset = this.calculateThirdPersonOffset();
                
                // Smooth interpolation for cinematic feel
                const lerpFactor = 1 - Math.pow(0.01, deltaTime);
                this.thirdPersonOffset.x += (targetOffset.x - this.thirdPersonOffset.x) * lerpFactor;
                this.thirdPersonOffset.y += (targetOffset.y - this.thirdPersonOffset.y) * lerpFactor;
                this.thirdPersonOffset.z += (targetOffset.z - this.thirdPersonOffset.z) * lerpFactor;
                
                this.camera.position.set(
                    this.position.x + this.thirdPersonOffset.x,
                    this.position.y + this.thirdPersonOffset.y,
                    this.position.z + this.thirdPersonOffset.z
                );
                
                // Look at player
                this.camera.lookAt(
                    this.position.x,
                    this.position.y + this.height * 0.5,
                    this.position.z
                );
            }
        }
    }
    
    /**
     * Calculate third person camera offset
     */
    calculateThirdPersonOffset() {
        const distance = Config.player.thirdPersonDistance;
        const height = Config.player.thirdPersonHeight;
        
        // Calculate offset based on yaw angle
        const offsetX = Math.sin(this.rotation.yaw) * distance;
        const offsetZ = Math.cos(this.rotation.yaw) * distance;
        
        return {
            x: offsetX,
            y: height,
            z: offsetZ
        };
    }
    
    /**
     * Get forward direction vector
     */
    getForward() {
        return {
            x: -Math.sin(this.rotation.yaw),
            y: 0,
            z: -Math.cos(this.rotation.yaw)
        };
    }
    
    /**
     * Get right direction vector
     */
    getRight() {
        return {
            x: Math.cos(this.rotation.yaw),
            y: 0,
            z: -Math.sin(this.rotation.yaw)
        };
    }
    
    /**
     * Get forward direction including pitch (for flight)
     */
    getFlightForward() {
        const cosPitch = Math.cos(this.rotation.pitch);
        const sinPitch = Math.sin(this.rotation.pitch);
        const cosYaw = Math.cos(this.rotation.yaw);
        const sinYaw = Math.sin(this.rotation.yaw);
        
        return {
            x: -sinYaw * cosPitch,
            y: sinPitch,
            z: -cosYaw * cosPitch
        };
    }
    
    /**
     * Teleport player to position
     */
    teleport(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
        this.velocity = { x: 0, y: 0, z: 0 };
        
        Debug.info(`Teleported to: ${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}`);
    }
    
    /**
     * Get position string for display
     */
    getPositionString() {
        return `${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)}, ${this.position.z.toFixed(1)}`;
    }
}

// Export singleton
const player = new Player();
export default player;
