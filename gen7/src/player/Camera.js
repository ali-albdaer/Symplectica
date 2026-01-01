/**
 * Camera System
 * Handles first-person and third-person camera modes
 * with smooth transitions and cinematic following
 */

import * as THREE from 'three';
import { CONFIG } from '../../config/globals.js';

export class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        
        // Camera modes
        this.modes = {
            FIRST_PERSON: 'first_person',
            THIRD_PERSON: 'third_person'
        };
        this.currentMode = this.modes.FIRST_PERSON;
        
        // First person settings
        this.firstPersonOffset = new THREE.Vector3(0, CONFIG.PLAYER.height * 0.9, 0);
        
        // Third person settings
        this.thirdPersonDistance = CONFIG.PLAYER.thirdPersonDistance;
        this.thirdPersonHeight = CONFIG.PLAYER.thirdPersonHeight;
        this.cameraSmoothing = CONFIG.PLAYER.cameraSmoothing;
        this.cameraPanSpeed = CONFIG.PLAYER.cameraPanSpeed;
        
        // Camera state
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = CONFIG.PLAYER.mouseSensitivity;
        this.minPitch = CONFIG.PLAYER.minPitch;
        this.maxPitch = CONFIG.PLAYER.maxPitch;
        
        // Smooth camera position
        this.smoothPosition = new THREE.Vector3();
        this.smoothLookAt = new THREE.Vector3();
        
        // Camera shake
        this.shakeAmount = 0;
        this.shakeDuration = 0;
        
        // Initialize
        this.initializePointerLock();
    }

    /**
     * Initialize pointer lock for mouse control
     */
    initializePointerLock() {
        const canvas = document.getElementById('render-canvas');
        
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                document.addEventListener('mousemove', this.onMouseMove.bind(this));
            } else {
                document.removeEventListener('mousemove', this.onMouseMove.bind(this));
            }
        });
    }

    /**
     * Handle mouse movement
     */
    onMouseMove(event) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        this.yaw -= movementX * this.mouseSensitivity;
        this.pitch -= movementY * this.mouseSensitivity;

        // Clamp pitch
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));

        // Update player rotation
        if (this.player) {
            this.player.rotation.y = this.yaw;
        }
    }

    /**
     * Toggle camera mode
     */
    toggleMode() {
        if (this.currentMode === this.modes.FIRST_PERSON) {
            this.currentMode = this.modes.THIRD_PERSON;
            console.log('📷 Switched to Third Person view');
        } else {
            this.currentMode = this.modes.FIRST_PERSON;
            console.log('📷 Switched to First Person view');
        }
    }

    /**
     * Update camera (first person)
     */
    updateFirstPerson() {
        if (!this.player) return;

        // Calculate camera position at player's eye level
        const playerPos = this.player.mesh.position;
        const offset = this.firstPersonOffset.clone();
        
        // Camera position
        this.camera.position.copy(playerPos).add(offset);

        // Camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    /**
     * Update camera (third person)
     */
    updateThirdPerson(deltaTime) {
        if (!this.player) return;

        const playerPos = this.player.mesh.position;

        // Calculate desired camera position behind player
        const horizontalOffset = this.thirdPersonDistance;
        const verticalOffset = this.thirdPersonHeight;

        // Camera direction based on yaw
        const cameraX = Math.sin(this.yaw) * horizontalOffset;
        const cameraZ = Math.cos(this.yaw) * horizontalOffset;

        // Target position
        const targetPos = new THREE.Vector3(
            playerPos.x - cameraX,
            playerPos.y + verticalOffset,
            playerPos.z - cameraZ
        );

        // Smooth camera movement
        if (this.smoothPosition.length() === 0) {
            this.smoothPosition.copy(targetPos);
        } else {
            this.smoothPosition.lerp(targetPos, this.cameraSmoothing);
        }

        // Set camera position
        this.camera.position.copy(this.smoothPosition);

        // Calculate look-at point (slightly above player)
        const lookAtTarget = new THREE.Vector3(
            playerPos.x,
            playerPos.y + CONFIG.PLAYER.height * 0.7,
            playerPos.z
        );

        // Smooth look-at
        if (this.smoothLookAt.length() === 0) {
            this.smoothLookAt.copy(lookAtTarget);
        } else {
            this.smoothLookAt.lerp(lookAtTarget, this.cameraSmoothing);
        }

        // Apply pitch offset to look-at
        const pitchOffset = Math.sin(this.pitch) * 3;
        this.smoothLookAt.y += pitchOffset;

        this.camera.lookAt(this.smoothLookAt);
    }

    /**
     * Update camera
     */
    update(deltaTime) {
        // Update camera shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const shake = new THREE.Vector3(
                (Math.random() - 0.5) * this.shakeAmount,
                (Math.random() - 0.5) * this.shakeAmount,
                (Math.random() - 0.5) * this.shakeAmount
            );
            this.camera.position.add(shake);
        }

        // Update based on mode
        if (this.currentMode === this.modes.FIRST_PERSON) {
            this.updateFirstPerson();
        } else {
            this.updateThirdPerson(deltaTime);
        }
    }

    /**
     * Shake camera
     */
    shake(amount, duration) {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
    }

    /**
     * Set player reference
     */
    setPlayer(player) {
        this.player = player;
        this.smoothPosition.set(0, 0, 0);
        this.smoothLookAt.set(0, 0, 0);
    }

    /**
     * Get forward direction vector
     */
    getForwardVector() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        direction.y = 0; // Keep on horizontal plane
        direction.normalize();
        return direction;
    }

    /**
     * Get right direction vector
     */
    getRightVector() {
        const forward = this.getForwardVector();
        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        right.normalize();
        return right;
    }

    /**
     * Get camera info for debugging
     */
    getInfo() {
        return {
            mode: this.currentMode,
            position: this.camera.position.toArray(),
            pitch: this.pitch,
            yaw: this.yaw,
        };
    }
}

export default CameraController;
