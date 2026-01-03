/**
 * Camera Controller - Handles first/third person camera with smooth movement
 */

class CameraController {
    constructor() {
        this.camera = null;
        this.target = null;  // Usually the player
        
        // Camera mode
        this.isFirstPerson = true;
        
        // Rotation
        this.pitch = 0;  // Up/down rotation (radians)
        this.yaw = 0;    // Left/right rotation (radians)
        
        // Limits
        this.minPitch = -Math.PI / 2 + 0.1;
        this.maxPitch = Math.PI / 2 - 0.1;
        
        // Third person settings
        this.thirdPersonOffset = new THREE.Vector3(0, 2, 5);
        this.currentOffset = new THREE.Vector3(0, 2, 5);
        this.orbitAngle = 0;
        this.orbitHeight = 2;
        this.orbitDistance = 5;
        
        // Smooth follow
        this.smoothPosition = new THREE.Vector3();
        this.smoothLookAt = new THREE.Vector3();
        
        // Vectors for calculations
        this._forward = new THREE.Vector3();
        this._right = new THREE.Vector3();
        this._up = new THREE.Vector3();
        
        // Local up direction (based on gravity)
        this.localUp = new THREE.Vector3(0, 1, 0);
    }
    
    /**
     * Initialize the camera
     */
    init(renderer) {
        const aspect = window.innerWidth / window.innerHeight;
        
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1e12);
        this.camera.position.set(0, 0, 0);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
        
        Logger.info('CameraController', 'Camera initialized');
        
        return this.camera;
    }
    
    /**
     * Set the target to follow
     */
    setTarget(target) {
        this.target = target;
        
        // Initialize smooth position
        if (target && target.getCameraPosition) {
            this.smoothPosition.copy(target.getCameraPosition());
            this.smoothLookAt.copy(target.getWorldPosition());
        }
    }
    
    /**
     * Set local up direction (for gravity-relative camera)
     */
    setLocalUp(up) {
        this.localUp.copy(up).normalize();
    }
    
    /**
     * Handle mouse movement for camera rotation
     */
    onMouseMove(deltaX, deltaY) {
        const sensitivity = Config.PLAYER.mouseSensitivity;
        
        this.yaw -= deltaX * sensitivity;
        this.pitch -= deltaY * sensitivity;
        
        // Clamp pitch
        this.pitch = MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
        
        // Wrap yaw
        while (this.yaw > Math.PI) this.yaw -= Math.PI * 2;
        while (this.yaw < -Math.PI) this.yaw += Math.PI * 2;
    }
    
    /**
     * Update camera position and rotation
     */
    update(deltaTime) {
        if (!this.target) return;
        
        // Update local up from player's gravity direction
        if (this.target.groundNormal) {
            this.localUp.copy(this.target.groundNormal);
        }
        
        if (this.isFirstPerson) {
            this.updateFirstPerson(deltaTime);
        } else {
            this.updateThirdPerson(deltaTime);
        }
    }
    
    /**
     * Update first-person camera
     */
    updateFirstPerson(deltaTime) {
        // Get eye position from player
        const eyePosition = this.target.getCameraPosition();
        
        // Apply rotation
        // Build rotation quaternion from pitch and yaw relative to local up
        const quaternion = new THREE.Quaternion();
        
        // Start with local up as reference
        const yawQuat = new THREE.Quaternion();
        yawQuat.setFromAxisAngle(this.localUp, this.yaw);
        
        // Calculate local right axis for pitch
        this._right.set(1, 0, 0).applyQuaternion(yawQuat);
        
        const pitchQuat = new THREE.Quaternion();
        pitchQuat.setFromAxisAngle(this._right, this.pitch);
        
        quaternion.multiplyQuaternions(pitchQuat, yawQuat);
        
        // Position camera at eye position
        this.camera.position.copy(eyePosition);
        this.camera.quaternion.copy(quaternion);
    }
    
    /**
     * Update third-person camera
     */
    updateThirdPerson(deltaTime) {
        const smoothness = Config.PLAYER.cameraSmoothness;
        const targetDistance = Config.PLAYER.thirdPersonDistance;
        const targetHeight = Config.PLAYER.thirdPersonHeight;
        
        // Get player position
        const playerPosition = this.target.getWorldPosition();
        
        // Calculate desired camera position
        // Use yaw to orbit around player
        const horizontalOffset = new THREE.Vector3(
            Math.sin(this.yaw) * targetDistance,
            0,
            Math.cos(this.yaw) * targetDistance
        );
        
        // Rotate offset to align with local up
        const toLocalUp = new THREE.Quaternion();
        toLocalUp.setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.localUp);
        horizontalOffset.applyQuaternion(toLocalUp);
        
        // Add height along local up
        const heightOffset = this.localUp.clone().multiplyScalar(targetHeight);
        
        // Adjust height based on pitch (look down = camera higher)
        const pitchAdjust = this.localUp.clone().multiplyScalar(-this.pitch * 2);
        
        const desiredPosition = playerPosition.clone()
            .add(horizontalOffset)
            .add(heightOffset)
            .add(pitchAdjust);
        
        // Smooth transition
        this.smoothPosition.lerp(desiredPosition, smoothness);
        
        // Look at point slightly above player
        const lookOffset = this.localUp.clone().multiplyScalar(1.5);
        const desiredLookAt = playerPosition.clone().add(lookOffset);
        this.smoothLookAt.lerp(desiredLookAt, smoothness * 2);
        
        // Apply to camera
        this.camera.position.copy(this.smoothPosition);
        this.camera.lookAt(this.smoothLookAt);
        
        // Store the actual camera orientation for getting directions
        this.camera.updateMatrix();
    }
    
    /**
     * Toggle between first and third person
     */
    toggleViewMode() {
        this.isFirstPerson = !this.isFirstPerson;
        
        if (!this.isFirstPerson) {
            // Initialize third person position
            this.smoothPosition.copy(this.camera.position);
            if (this.target) {
                this.smoothLookAt.copy(this.target.getWorldPosition());
            }
        }
        
        Logger.info('CameraController', 
            `Switched to ${this.isFirstPerson ? 'first' : 'third'} person view`);
    }
    
    /**
     * Get forward direction (where camera is looking)
     */
    getForwardDirection() {
        this._forward.set(0, 0, -1);
        this._forward.applyQuaternion(this.camera.quaternion);
        return this._forward.clone();
    }
    
    /**
     * Get right direction
     */
    getRightDirection() {
        this._right.set(1, 0, 0);
        this._right.applyQuaternion(this.camera.quaternion);
        return this._right.clone();
    }
    
    /**
     * Get up direction (camera's up, not world up)
     */
    getUpDirection() {
        this._up.set(0, 1, 0);
        this._up.applyQuaternion(this.camera.quaternion);
        return this._up.clone();
    }
    
    /**
     * Handle window resize
     */
    onResize() {
        if (!this.camera) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
    
    /**
     * Get camera for rendering
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Set field of view
     */
    setFOV(fov) {
        if (this.camera) {
            this.camera.fov = fov;
            this.camera.updateProjectionMatrix();
        }
    }
    
    /**
     * Look at a specific point
     */
    lookAt(point) {
        if (!this.target) return;
        
        const playerPos = this.target.getWorldPosition();
        const direction = new THREE.Vector3().subVectors(point, playerPos);
        
        // Calculate yaw and pitch from direction
        this.yaw = Math.atan2(direction.x, direction.z);
        
        const horizontalDist = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
        this.pitch = -Math.atan2(direction.y, horizontalDist);
        
        // Clamp pitch
        this.pitch = MathUtils.clamp(this.pitch, this.minPitch, this.maxPitch);
    }
}

window.CameraController = CameraController;
