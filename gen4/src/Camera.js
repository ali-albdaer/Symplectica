/**
 * Camera System
 * First/Third person camera with smooth following and cinematic effects
 */

import { Config, CAMERA } from './config.js';
import { Vector3, Quaternion, clamp, lerp, smoothstep } from './Math3D.js';

export class CameraController {
    constructor(camera) {
        this.camera = camera;
        this.player = null;
        
        // Camera state
        this.position = new Vector3();
        this.targetPosition = new Vector3();
        this.lookAt = new Vector3();
        
        // Third person settings
        this.thirdPersonDistance = Config.camera.THIRD_PERSON_DISTANCE;
        this.thirdPersonHeight = Config.camera.THIRD_PERSON_HEIGHT;
        this.currentDistance = this.thirdPersonDistance;
        
        // Smoothing
        this.smoothing = Config.camera.SMOOTHING;
        this.cinematicSmoothing = Config.camera.CINEMATIC_SMOOTHING;
        
        // Camera shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffset = new Vector3();
        
        // Cinematic mode
        this.cinematicMode = false;
        this.cinematicTarget = null;
        
        // Collision
        this.collisionEnabled = true;
        this.minDistance = 1;
        
        // Orbit mode for viewing planets
        this.orbitMode = false;
        this.orbitTarget = null;
        this.orbitDistance = 10;
        this.orbitAngle = 0;
        this.orbitPitch = 0.3;
    }
    
    /**
     * Set the player to follow
     */
    setPlayer(player) {
        this.player = player;
    }
    
    /**
     * Update camera
     */
    update(deltaTime, input) {
        if (this.orbitMode) {
            this.updateOrbitMode(deltaTime, input);
        } else if (this.player) {
            if (this.player.viewMode === 'first') {
                this.updateFirstPerson(deltaTime);
            } else {
                this.updateThirdPerson(deltaTime, input);
            }
        }
        
        // Update camera shake
        this.updateShake(deltaTime);
        
        // Apply to Three.js camera
        this.applyToCamera();
    }
    
    /**
     * Update first person camera
     */
    updateFirstPerson(deltaTime) {
        // Camera at eye position
        const eyePos = this.player.getEyePosition();
        
        // Smooth camera position
        const smoothing = this.smoothing;
        this.position.x = lerp(this.position.x, eyePos.x, smoothing);
        this.position.y = lerp(this.position.y, eyePos.y, smoothing);
        this.position.z = lerp(this.position.z, eyePos.z, smoothing);
        
        // Look direction from player rotation
        const forward = this.player.getForwardVector();
        this.lookAt.x = this.position.x + forward.x;
        this.lookAt.y = this.position.y + forward.y;
        this.lookAt.z = this.position.z + forward.z;
    }
    
    /**
     * Update third person camera
     */
    updateThirdPerson(deltaTime, input) {
        // Handle zoom with mouse wheel
        if (input.mouse.wheel !== 0) {
            this.thirdPersonDistance += input.mouse.wheel * 0.01;
            this.thirdPersonDistance = clamp(this.thirdPersonDistance, 2, 20);
        }
        
        // Calculate ideal camera position
        const playerPos = this.player.position;
        const localUp = this.player.localUp;
        
        // Get camera offset based on player rotation
        const yaw = this.player.rotation.yaw;
        const pitch = this.player.rotation.pitch * 0.3; // Reduce pitch influence
        
        // Calculate offset direction (behind and above player)
        const offsetX = Math.sin(yaw) * Math.cos(pitch) * this.thirdPersonDistance;
        const offsetY = this.thirdPersonHeight + Math.sin(pitch) * this.thirdPersonDistance * 0.5;
        const offsetZ = Math.cos(yaw) * Math.cos(pitch) * this.thirdPersonDistance;
        
        // Target position
        this.targetPosition.x = playerPos.x + offsetX + localUp.x * offsetY;
        this.targetPosition.y = playerPos.y + offsetY;
        this.targetPosition.z = playerPos.z + offsetZ + localUp.z * offsetY;
        
        // Collision detection
        if (this.collisionEnabled) {
            this.handleCameraCollision();
        }
        
        // Smooth follow with cinematic feel
        const smoothing = this.cinematicMode ? this.cinematicSmoothing : this.smoothing;
        this.position.x = lerp(this.position.x, this.targetPosition.x, smoothing);
        this.position.y = lerp(this.position.y, this.targetPosition.y, smoothing);
        this.position.z = lerp(this.position.z, this.targetPosition.z, smoothing);
        
        // Look at player (slightly above center)
        const lookOffset = this.player.height * 0.7;
        this.lookAt.x = playerPos.x + localUp.x * lookOffset;
        this.lookAt.y = playerPos.y + localUp.y * lookOffset;
        this.lookAt.z = playerPos.z + localUp.z * lookOffset;
    }
    
    /**
     * Update orbit mode (for viewing celestial bodies)
     */
    updateOrbitMode(deltaTime, input) {
        if (!this.orbitTarget) return;
        
        // Handle orbit controls
        if (input.isMouseButtonDown(0)) {
            this.orbitAngle -= input.mouse.deltaX * 0.01;
            this.orbitPitch -= input.mouse.deltaY * 0.01;
            this.orbitPitch = clamp(this.orbitPitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
        }
        
        // Zoom
        if (input.mouse.wheel !== 0) {
            this.orbitDistance *= 1 + input.mouse.wheel * 0.001;
            this.orbitDistance = clamp(this.orbitDistance, 1, 1000);
        }
        
        // Calculate camera position
        const targetPos = this.orbitTarget.position || this.orbitTarget;
        
        this.targetPosition.x = targetPos.x + Math.cos(this.orbitAngle) * Math.cos(this.orbitPitch) * this.orbitDistance;
        this.targetPosition.y = targetPos.y + Math.sin(this.orbitPitch) * this.orbitDistance;
        this.targetPosition.z = targetPos.z + Math.sin(this.orbitAngle) * Math.cos(this.orbitPitch) * this.orbitDistance;
        
        // Smooth movement
        const smoothing = 0.1;
        this.position.x = lerp(this.position.x, this.targetPosition.x, smoothing);
        this.position.y = lerp(this.position.y, this.targetPosition.y, smoothing);
        this.position.z = lerp(this.position.z, this.targetPosition.z, smoothing);
        
        // Look at target
        this.lookAt.x = targetPos.x;
        this.lookAt.y = targetPos.y;
        this.lookAt.z = targetPos.z;
    }
    
    /**
     * Handle camera collision with geometry
     */
    handleCameraCollision() {
        // Simple ray collision from player to target camera position
        const playerPos = this.player.position;
        const dx = this.targetPosition.x - playerPos.x;
        const dy = this.targetPosition.y - playerPos.y;
        const dz = this.targetPosition.z - playerPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (dist < 0.001) return;
        
        const direction = new Vector3(dx / dist, dy / dist, dz / dist);
        
        // Simple sphere cast against celestial bodies
        // In a full implementation, this would use proper collision detection
        this.currentDistance = this.thirdPersonDistance;
    }
    
    /**
     * Update camera shake effect
     */
    updateShake(deltaTime) {
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            
            const intensity = this.shakeIntensity * (this.shakeDuration > 0 ? 1 : 0);
            this.shakeOffset.x = (Math.random() - 0.5) * intensity;
            this.shakeOffset.y = (Math.random() - 0.5) * intensity;
            this.shakeOffset.z = (Math.random() - 0.5) * intensity;
        } else {
            this.shakeOffset.set(0, 0, 0);
        }
    }
    
    /**
     * Apply position to Three.js camera
     */
    applyToCamera() {
        if (!this.camera) return;
        
        // Apply position with shake
        this.camera.position.set(
            this.position.x + this.shakeOffset.x,
            this.position.y + this.shakeOffset.y,
            this.position.z + this.shakeOffset.z
        );
        
        // Look at target
        this.camera.lookAt(this.lookAt.x, this.lookAt.y, this.lookAt.z);
        
        // Update up vector based on player's local up (for planetary surface)
        if (this.player && !this.orbitMode) {
            const localUp = this.player.localUp;
            this.camera.up.set(localUp.x, localUp.y, localUp.z);
        } else {
            this.camera.up.set(0, 1, 0);
        }
    }
    
    /**
     * Trigger camera shake
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }
    
    /**
     * Enter orbit mode around a celestial body
     */
    enterOrbitMode(target, distance) {
        this.orbitMode = true;
        this.orbitTarget = target;
        this.orbitDistance = distance || 10;
        this.orbitAngle = 0;
        this.orbitPitch = 0.3;
    }
    
    /**
     * Exit orbit mode
     */
    exitOrbitMode() {
        this.orbitMode = false;
        this.orbitTarget = null;
    }
    
    /**
     * Toggle cinematic mode
     */
    setCinematicMode(enabled) {
        this.cinematicMode = enabled;
    }
    
    /**
     * Focus on a specific target
     */
    focusOn(target, smooth = true) {
        const pos = target.position || target;
        
        if (smooth) {
            this.targetPosition.copy(pos);
        } else {
            this.position.copy(pos);
        }
    }
    
    /**
     * Get current view info
     */
    getViewInfo() {
        return {
            position: this.position.clone(),
            lookAt: this.lookAt.clone(),
            distance: this.currentDistance,
            orbitMode: this.orbitMode,
            cinematicMode: this.cinematicMode
        };
    }
    
    /**
     * Interpolate camera for smooth transitions
     */
    transitionTo(targetPosition, targetLookAt, duration, callback) {
        const startPosition = this.position.clone();
        const startLookAt = this.lookAt.clone();
        let elapsed = 0;
        
        const animate = (dt) => {
            elapsed += dt;
            const t = Math.min(elapsed / duration, 1);
            const eased = smoothstep(0, 1, t);
            
            this.position = Vector3.lerp(startPosition, targetPosition, eased);
            this.lookAt = Vector3.lerp(startLookAt, targetLookAt, eased);
            
            if (t >= 1 && callback) {
                callback();
            }
            
            return t < 1;
        };
        
        return animate;
    }
}

export default CameraController;
