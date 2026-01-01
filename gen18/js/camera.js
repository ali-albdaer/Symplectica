/**
 * Camera System
 * Manages first-person and cinematic third-person cameras with smooth transitions
 */
class CameraController {
    constructor(canvas, aspect = 16/9) {
        this.canvas = canvas;
        this.camera = new THREE.PerspectiveCamera(
            Config.camera.fov,
            aspect,
            Config.camera.near,
            Config.camera.far
        );
        
        // Set initial camera position to see the solar system
        this.camera.position.set(200000, 100000, 150000);
        this.camera.lookAt(0, 0, 0);

        // Camera state
        this.mode = 'firstperson'; // 'firstperson' or 'thirdperson'
        this.transitionProgress = 0;
        this.transitionDuration = 0.5;

        // First-person
        this.fpCamera = this.camera.clone();
        this.fpOffset = new THREE.Vector3();

        // Third-person
        this.tpCamera = this.camera.clone();
        this.tpTarget = new THREE.Vector3();
        this.tpDistance = Config.camera.thirdPerson.distance;
        this.tpHeight = Config.camera.thirdPerson.height;
        this.tpLookAhead = Config.camera.thirdPerson.lookAhead;

        // Euler angles for smooth rotation
        this.euler = new THREE.Euler(0, 0, 'YXZ');
        this.pitch = 0;
        this.yaw = 0;

        this.targetPitch = 0;
        this.targetYaw = 0;

        // Smoothing
        this.smoothing = 0.08;
        this.sensitivity = Config.controls.sensitivity;
    }

    /**
     * Update camera based on player and input
     */
    update(player, deltaTime, lookInput) {
        if (!player) return;

        // Update rotation from input
        this.yaw += lookInput.x * this.sensitivity;
        this.pitch += lookInput.y * this.sensitivity * (Config.controls.invertY ? -1 : 1);
        this.pitch = Utilities.math.clamp(this.pitch, -Math.PI / 2, Math.PI / 2);

        // Smooth rotation
        this.targetYaw = this.yaw;
        this.targetPitch = this.pitch;

        // Get camera direction
        this.euler.order = 'YXZ';
        this.euler.setFromQuaternion(this.camera.quaternion);

        // Update based on mode
        if (this.mode === 'firstperson') {
            this.updateFirstPerson(player, deltaTime);
        } else {
            this.updateThirdPerson(player, deltaTime);
        }
    }

    /**
     * Update first-person camera
     */
    updateFirstPerson(player, deltaTime) {
        // Camera at player eye position
        const eyePos = player.getEyePosition();

        // Set camera position
        this.camera.position.lerp(eyePos, Config.player.cameraSmoothing);

        // Update rotation
        this.euler.setFromQuaternion(this.camera.quaternion);
        this.euler.setFromEuler(this.targetYaw, this.targetPitch, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(this.euler);
    }

    /**
     * Update third-person camera
     */
    updateThirdPerson(player, deltaTime) {
        // Calculate target position
        const playerPos = player.position.clone();
        const cameraDir = new THREE.Vector3();
        
        // Calculate direction from euler angles
        cameraDir.set(
            Math.sin(this.targetYaw),
            0,
            Math.cos(this.targetYaw)
        ).normalize();

        // Calculate camera position (offset from player)
        const offset = cameraDir.clone()
            .multiplyScalar(this.tpDistance)
            .addScaledVector(new THREE.Vector3(0, 1, 0), this.tpHeight);

        const targetCamPos = playerPos.clone().add(offset);

        // Smooth camera movement
        this.camera.position.lerp(targetCamPos, Config.camera.thirdPerson.smoothing);

        // Look at point slightly ahead of player
        this.tpTarget = playerPos.clone()
            .addScaledVector(cameraDir, this.tpLookAhead)
            .addScaledVector(new THREE.Vector3(0, 1, 0), 1.5);

        this.camera.lookAt(this.tpTarget);
    }

    /**
     * Get camera forward direction
     */
    getForwardDirection() {
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        return dir.normalize();
    }

    /**
     * Get camera right direction
     */
    getRightDirection() {
        const dir = new THREE.Vector3(1, 0, 0);
        dir.applyQuaternion(this.camera.quaternion);
        return dir.normalize();
    }

    /**
     * Get camera up direction
     */
    getUpDirection() {
        const dir = new THREE.Vector3(0, 1, 0);
        dir.applyQuaternion(this.camera.quaternion);
        return dir.normalize();
    }

    /**
     * Toggle camera mode with smooth transition
     */
    toggleMode() {
        this.mode = this.mode === 'firstperson' ? 'thirdperson' : 'firstperson';
        this.transitionProgress = 0;
        DebugLog.info(`Camera Mode: ${this.mode === 'firstperson' ? 'First-Person' : 'Third-Person'}`);
    }

    /**
     * Set camera mode directly
     */
    setMode(mode) {
        if (['firstperson', 'thirdperson'].includes(mode)) {
            this.mode = mode;
            this.transitionProgress = 0;
        }
    }

    /**
     * Add look offset
     */
    addLookDelta(deltaX, deltaY) {
        this.yaw += deltaX * this.sensitivity;
        this.pitch += deltaY * this.sensitivity * (Config.controls.invertY ? -1 : 1);
        this.pitch = Utilities.math.clamp(this.pitch, -Math.PI / 2, Math.PI / 2);
    }

    /**
     * Set camera sensitivity
     */
    setSensitivity(sensitivity) {
        this.sensitivity = sensitivity;
        Config.controls.sensitivity = sensitivity;
    }

    /**
     * Handle window resize
     */
    onWindowResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Get camera data for serialization
     */
    serialize() {
        return {
            mode: this.mode,
            pitch: this.pitch,
            yaw: this.yaw,
            position: this.camera.position.toArray(),
            fov: this.camera.fov
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraController;
}
