/**
 * CameraController.js - Camera Management with Smooth Transitions
 * Handles First-Person and Cinematic Third-Person cameras
 */

import { Config } from './Config.js';
import { Logger, EventBus, Utils } from './Utils.js';

export class CameraController {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        
        // Create main camera
        this.camera = new THREE.PerspectiveCamera(
            Config.camera.fov,
            window.innerWidth / window.innerHeight,
            Config.camera.near,
            Config.camera.far
        );
        
        // Camera modes
        this.MODE = {
            FIRST_PERSON: 'firstPerson',
            THIRD_PERSON: 'thirdPerson',
            CINEMATIC: 'cinematic',
            ORBIT: 'orbit'
        };
        
        this.currentMode = this.MODE.FIRST_PERSON;
        this.targetMode = this.MODE.FIRST_PERSON;
        this.isTransitioning = false;
        this.transitionProgress = 0;
        
        // Camera positions for interpolation
        this.currentPosition = new THREE.Vector3();
        this.targetPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.targetLookAt = new THREE.Vector3();
        
        // Current quaternion for smooth rotation
        this.currentQuaternion = new THREE.Quaternion();
        this.targetQuaternion = new THREE.Quaternion();
        
        // Third person settings
        this.thirdPersonDistance = Config.camera.thirdPersonDistance;
        this.thirdPersonHeight = Config.camera.thirdPersonHeight;
        this.thirdPersonAngle = 0;
        
        // Cinematic settings
        this.cinematicTarget = null;
        this.cinematicOffset = new THREE.Vector3(0, 5, 20);
        
        // Reference to player
        this.player = null;
        
        // Interpolation speeds
        this.lerpSpeed = Config.camera.lerpSpeed;
        this.slerpSpeed = Config.camera.slerpSpeed;
        
        // Setup events
        this.setupEvents();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        Logger.render('CameraController initialized');
    }

    setupEvents() {
        EventBus.on('toggleCamera', () => this.toggleCameraMode());
        EventBus.on('mouseWheel', (data) => this.handleScroll(data));
    }

    /**
     * Set the player reference
     */
    setPlayer(player) {
        this.player = player;
    }

    /**
     * Toggle between first and third person
     */
    toggleCameraMode() {
        if (this.currentMode === this.MODE.FIRST_PERSON) {
            this.transitionTo(this.MODE.THIRD_PERSON);
        } else {
            this.transitionTo(this.MODE.FIRST_PERSON);
        }
        
        Logger.render(`Camera mode: ${this.currentMode}`);
    }

    /**
     * Start transition to a new camera mode
     */
    transitionTo(mode) {
        this.targetMode = mode;
        this.isTransitioning = true;
        this.transitionProgress = 0;
        
        // Store current state for interpolation
        this.currentPosition.copy(this.camera.position);
        this.currentQuaternion.copy(this.camera.quaternion);
        this.currentLookAt.copy(this.getLookAtPoint());
    }

    /**
     * Get current look-at point
     */
    getLookAtPoint() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);
        return this.camera.position.clone().add(direction.multiplyScalar(10));
    }

    /**
     * Handle scroll for third person distance
     */
    handleScroll(data) {
        if (this.currentMode === this.MODE.THIRD_PERSON) {
            this.thirdPersonDistance += data.deltaY * 0.01;
            this.thirdPersonDistance = Utils.clamp(this.thirdPersonDistance, 3, 50);
        }
    }

    /**
     * Update camera each frame
     */
    update(deltaTime) {
        if (!this.player) return;
        
        // Handle mode transition
        if (this.isTransitioning) {
            this.updateTransition(deltaTime);
        } else {
            // Update based on current mode
            switch (this.currentMode) {
                case this.MODE.FIRST_PERSON:
                    this.updateFirstPerson(deltaTime);
                    break;
                case this.MODE.THIRD_PERSON:
                    this.updateThirdPerson(deltaTime);
                    break;
                case this.MODE.CINEMATIC:
                    this.updateCinematic(deltaTime);
                    break;
                case this.MODE.ORBIT:
                    this.updateOrbit(deltaTime);
                    break;
            }
        }
    }

    /**
     * Update transition between modes
     */
    updateTransition(deltaTime) {
        this.transitionProgress += deltaTime * Config.camera.cinematicLerpSpeed;
        
        if (this.transitionProgress >= 1) {
            this.transitionProgress = 1;
            this.isTransitioning = false;
            this.currentMode = this.targetMode;
        }
        
        // Smooth step for nicer transitions
        const t = Utils.smoothstep(0, 1, this.transitionProgress);
        
        // Calculate target position based on target mode
        this.calculateTargetPosition(this.targetMode);
        
        // Interpolate position
        this.camera.position.lerpVectors(this.currentPosition, this.targetPosition, t);
        
        // Interpolate rotation using slerp
        this.camera.quaternion.slerpQuaternions(this.currentQuaternion, this.targetQuaternion, t);
    }

    /**
     * Calculate target camera position for a given mode
     */
    calculateTargetPosition(mode) {
        const playerPos = this.player.position;
        const playerUp = this.player.upVector;
        const playerForward = this.player.forwardVector;
        
        switch (mode) {
            case this.MODE.FIRST_PERSON:
                this.targetPosition.copy(this.player.getEyePosition());
                break;
                
            case this.MODE.THIRD_PERSON:
                // Position behind and above player
                const behindOffset = playerForward.clone().multiplyScalar(-this.thirdPersonDistance);
                const upOffset = playerUp.clone().multiplyScalar(this.thirdPersonHeight);
                this.targetPosition.copy(playerPos).add(behindOffset).add(upOffset);
                break;
                
            case this.MODE.CINEMATIC:
                if (this.cinematicTarget) {
                    this.targetPosition.copy(this.cinematicTarget.position).add(this.cinematicOffset);
                }
                break;
        }
        
        // Calculate target rotation to look at player
        const lookAtMatrix = new THREE.Matrix4();
        const lookTarget = mode === this.MODE.FIRST_PERSON 
            ? playerPos.clone().add(this.player.getLookDirection().multiplyScalar(10))
            : playerPos;
        
        lookAtMatrix.lookAt(this.targetPosition, lookTarget, playerUp);
        this.targetQuaternion.setFromRotationMatrix(lookAtMatrix);
    }

    /**
     * Update first person camera
     */
    updateFirstPerson(deltaTime) {
        // Position at player's eyes
        this.targetPosition.copy(this.player.getEyePosition());
        
        // Smooth position
        this.camera.position.lerp(this.targetPosition, this.lerpSpeed * deltaTime * 10);
        
        // Set rotation from player view
        if (this.player.isFlying) {
            // In flight, use player's view quaternion directly
            this.targetQuaternion.copy(this.player.getViewQuaternion());
        } else {
            // In walking mode, combine body orientation with pitch
            const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
                this.player.rightVector, 
                this.player.pitch
            );
            this.targetQuaternion.copy(this.player.quaternion).multiply(pitchQuat);
        }
        
        // Smooth rotation
        this.camera.quaternion.slerp(this.targetQuaternion, this.slerpSpeed * deltaTime * 10);
    }

    /**
     * Update third person camera
     */
    updateThirdPerson(deltaTime) {
        const playerPos = this.player.position;
        const playerUp = this.player.upVector;
        const playerForward = this.player.forwardVector;
        
        // Calculate ideal camera position
        const behindOffset = playerForward.clone().multiplyScalar(-this.thirdPersonDistance);
        const upOffset = playerUp.clone().multiplyScalar(this.thirdPersonHeight);
        
        this.targetPosition.copy(playerPos).add(behindOffset).add(upOffset);
        
        // TODO: Raycast for collision with terrain/objects
        
        // Smooth position
        this.camera.position.lerp(this.targetPosition, this.lerpSpeed * deltaTime);
        
        // Look at player
        const lookAtMatrix = new THREE.Matrix4();
        lookAtMatrix.lookAt(this.camera.position, playerPos, playerUp);
        this.targetQuaternion.setFromRotationMatrix(lookAtMatrix);
        
        // Smooth rotation
        this.camera.quaternion.slerp(this.targetQuaternion, this.slerpSpeed * deltaTime);
    }

    /**
     * Update cinematic camera (for cutscenes or viewing celestial bodies)
     */
    updateCinematic(deltaTime) {
        if (!this.cinematicTarget) return;
        
        // Slowly orbit around target
        this.thirdPersonAngle += deltaTime * 0.1;
        
        const orbitRadius = this.cinematicTarget.radius * 3;
        const orbitHeight = this.cinematicTarget.radius;
        
        this.targetPosition.set(
            this.cinematicTarget.position.x + Math.cos(this.thirdPersonAngle) * orbitRadius,
            this.cinematicTarget.position.y + orbitHeight,
            this.cinematicTarget.position.z + Math.sin(this.thirdPersonAngle) * orbitRadius
        );
        
        // Very smooth movement
        this.camera.position.lerp(this.targetPosition, Config.camera.cinematicLerpSpeed * deltaTime);
        
        // Look at target
        const lookAtMatrix = new THREE.Matrix4();
        lookAtMatrix.lookAt(
            this.camera.position, 
            this.cinematicTarget.position, 
            new THREE.Vector3(0, 1, 0)
        );
        this.targetQuaternion.setFromRotationMatrix(lookAtMatrix);
        
        this.camera.quaternion.slerp(this.targetQuaternion, Config.camera.cinematicLerpSpeed * deltaTime);
    }

    /**
     * Update orbit camera (debug view)
     */
    updateOrbit(deltaTime) {
        // Free orbit around world origin
        // This is mainly for debugging
    }

    /**
     * Set cinematic target
     */
    setCinematicTarget(target) {
        this.cinematicTarget = target;
        this.transitionTo(this.MODE.CINEMATIC);
    }

    /**
     * Return to player view
     */
    returnToPlayer() {
        this.cinematicTarget = null;
        this.transitionTo(this.MODE.FIRST_PERSON);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Get the camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get camera world position
     */
    getPosition() {
        return this.camera.position.clone();
    }

    /**
     * Get camera forward direction
     */
    getForward() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.camera.quaternion);
        return forward;
    }

    /**
     * Get debug info
     */
    getDebugInfo() {
        return {
            mode: this.currentMode,
            position: this.camera.position.clone(),
            isTransitioning: this.isTransitioning,
            thirdPersonDistance: this.thirdPersonDistance
        };
    }

    /**
     * Dispose resources
     */
    dispose() {
        window.removeEventListener('resize', this.onWindowResize);
        Logger.render('CameraController disposed');
    }
}

export default CameraController;
