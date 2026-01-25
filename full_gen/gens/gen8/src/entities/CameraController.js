/**
 * CameraController.js
 * Handles first-person and third-person camera modes with smooth transitions.
 * Features cinematic camera movement and various viewing options.
 */

import * as THREE from 'three';
import { CAMERA, RENDER_SCALE, configManager } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Camera');

export class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        
        // Camera modes
        this.isFirstPerson = true;
        this.isOrbiting = false;
        
        // Smooth camera state
        this.currentPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        
        // Third person settings
        this.thirdPersonDistance = CAMERA.thirdPersonDistance * RENDER_SCALE.distance;
        this.thirdPersonHeight = CAMERA.thirdPersonHeight * RENDER_SCALE.distance;
        this.orbitAngle = 0;
        
        // Smoothing
        this.smoothingFactor = CAMERA.smoothingFactor;
        this.cinematicSmoothness = CAMERA.cinematicSmoothness;
        
        // Cinematic mode for dramatic shots
        this.cinematicMode = false;
        this.cinematicTarget = null;
        
        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        
        // Key binding
        this.setupInput();
        
        logger.info('Camera controller initialized');
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyV') {
                this.toggleViewMode();
            }
            if (e.code === 'KeyC') {
                this.toggleCinematicMode();
            }
        });
    }

    /**
     * Toggle between first and third person
     */
    toggleViewMode() {
        this.isFirstPerson = !this.isFirstPerson;
        logger.info(`Camera mode: ${this.isFirstPerson ? 'First Person' : 'Third Person'}`);
    }

    /**
     * Toggle cinematic mode
     */
    toggleCinematicMode() {
        this.cinematicMode = !this.cinematicMode;
        logger.info(`Cinematic mode: ${this.cinematicMode ? 'ON' : 'OFF'}`);
    }

    /**
     * Set camera to orbit around a target
     */
    setOrbitTarget(target) {
        this.isOrbiting = true;
        this.cinematicTarget = target;
        logger.info(`Orbiting: ${target?.name || 'object'}`);
    }

    /**
     * Stop orbiting and return to player
     */
    stopOrbiting() {
        this.isOrbiting = false;
        this.cinematicTarget = null;
    }

    /**
     * Add camera shake effect
     */
    addShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    /**
     * Main update loop
     */
    update(deltaTime) {
        const dt = deltaTime / 1000;
        
        if (this.isOrbiting && this.cinematicTarget) {
            this.updateOrbitCamera(dt);
        } else if (this.isFirstPerson) {
            this.updateFirstPersonCamera(dt);
        } else {
            this.updateThirdPersonCamera(dt);
        }
        
        // Apply camera shake
        if (this.shakeDuration > 0) {
            this.applyShake(dt);
        }
    }

    /**
     * First person camera - directly at player head
     */
    updateFirstPersonCamera(dt) {
        const playerPos = this.player.getScaledPosition();
        const playerUp = this.player.getLocalUpVector();
        
        // Position at player's head height
        const headHeight = CAMERA.thirdPersonHeight * RENDER_SCALE.distance * 0.5;
        this.targetPosition.set(
            playerPos.x + playerUp.x * headHeight,
            playerPos.y + playerUp.y * headHeight,
            playerPos.z + playerUp.z * headHeight
        );
        
        // Calculate look direction from player rotation
        const forward = new THREE.Vector3(0, 0, -1);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(
            this.player.rotation.pitch,
            this.player.rotation.yaw,
            0,
            'YXZ'
        ));
        forward.applyQuaternion(quaternion);
        
        // Look ahead
        this.targetLookAt.set(
            this.targetPosition.x + forward.x,
            this.targetPosition.y + forward.y,
            this.targetPosition.z + forward.z
        );
        
        // Apply with smoothing
        const smoothing = this.cinematicMode ? this.cinematicSmoothness : 1.0;
        this.applySmoothCamera(smoothing);
        
        // Set up vector based on local gravity
        const upVec = new THREE.Vector3(playerUp.x, playerUp.y, playerUp.z);
        this.camera.up.copy(upVec);
    }

    /**
     * Third person camera - behind and above player
     */
    updateThirdPersonCamera(dt) {
        const playerPos = this.player.getScaledPosition();
        const playerUp = this.player.getLocalUpVector();
        
        // Calculate camera offset behind player
        const yaw = this.player.rotation.yaw;
        const pitch = Math.max(-0.5, Math.min(0.5, this.player.rotation.pitch * 0.3));
        
        // Offset vector (behind and above)
        const offsetX = Math.sin(yaw) * this.thirdPersonDistance;
        const offsetZ = Math.cos(yaw) * this.thirdPersonDistance;
        const offsetY = this.thirdPersonHeight * (1 + pitch);
        
        // Position camera
        this.targetPosition.set(
            playerPos.x + offsetX + playerUp.x * offsetY,
            playerPos.y + playerUp.y * offsetY,
            playerPos.z + offsetZ + playerUp.z * offsetY
        );
        
        // Look at player
        this.targetLookAt.set(playerPos.x, playerPos.y, playerPos.z);
        
        // Apply smooth camera movement
        const smoothing = this.cinematicMode ? this.cinematicSmoothness : this.smoothingFactor;
        this.applySmoothCamera(smoothing);
        
        // Set up vector
        const upVec = new THREE.Vector3(playerUp.x, playerUp.y, playerUp.z);
        this.camera.up.lerp(upVec, smoothing);
    }

    /**
     * Orbit camera around a celestial body or target
     */
    updateOrbitCamera(dt) {
        if (!this.cinematicTarget) return;
        
        // Get target position
        let targetPos;
        if (this.cinematicTarget.getScaledPosition) {
            const scaled = this.cinematicTarget.getScaledPosition();
            targetPos = new THREE.Vector3(scaled.x, scaled.y, scaled.z);
        } else {
            targetPos = this.cinematicTarget.position.clone();
        }
        
        // Orbit around target
        this.orbitAngle += dt * 0.1;
        
        const orbitDistance = this.cinematicTarget.radius ? 
            this.cinematicTarget.radius * RENDER_SCALE.distance * 3 : 
            this.thirdPersonDistance * 10;
        
        this.targetPosition.set(
            targetPos.x + Math.sin(this.orbitAngle) * orbitDistance,
            targetPos.y + orbitDistance * 0.3,
            targetPos.z + Math.cos(this.orbitAngle) * orbitDistance
        );
        
        this.targetLookAt.copy(targetPos);
        
        // Very smooth movement for cinematic effect
        this.applySmoothCamera(0.02);
        
        this.camera.up.set(0, 1, 0);
    }

    /**
     * Apply smooth interpolation to camera
     */
    applySmoothCamera(smoothing) {
        this.currentPosition.lerp(this.targetPosition, smoothing);
        this.currentLookAt.lerp(this.targetLookAt, smoothing);
        
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
    }

    /**
     * Apply camera shake effect
     */
    applyShake(dt) {
        const shake = new THREE.Vector3(
            (Math.random() - 0.5) * this.shakeIntensity,
            (Math.random() - 0.5) * this.shakeIntensity,
            (Math.random() - 0.5) * this.shakeIntensity
        );
        
        this.camera.position.add(shake);
        
        this.shakeDuration -= dt;
        if (this.shakeDuration <= 0) {
            this.shakeIntensity = 0;
            this.shakeDuration = 0;
        }
    }

    /**
     * Focus on a specific object
     */
    focusOn(object, distance = null) {
        this.cinematicTarget = object;
        this.isOrbiting = true;
        
        if (distance !== null) {
            this.thirdPersonDistance = distance;
        }
    }

    /**
     * Get camera state for debug
     */
    getDebugInfo() {
        return {
            mode: this.isFirstPerson ? 'First Person' : 'Third Person',
            isOrbiting: this.isOrbiting,
            cinematicMode: this.cinematicMode,
            position: {
                x: this.camera.position.x.toFixed(4),
                y: this.camera.position.y.toFixed(4),
                z: this.camera.position.z.toFixed(4),
            },
            target: this.cinematicTarget?.name || null,
        };
    }

    /**
     * Dispose resources
     */
    dispose() {
        logger.info('Camera controller disposed');
    }
}
