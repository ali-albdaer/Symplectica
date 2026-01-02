/**
 * Camera System
 * First and third person camera with smooth transitions
 */

window.CameraSystem = {
    camera: null,
    
    // Camera state
    state: {
        mode: 'first-person',  // 'first-person' or 'third-person'
        pitchAngle: 0,
        yawAngle: 0,
        fov: Config.camera.fov,
    },

    // Third person specific
    thirdPerson: {
        desiredOffset: new THREE.Vector3(0, 0, 0),
        currentOffset: new THREE.Vector3(0, 0, 0),
        targetDistance: Config.camera.thirdPersonDistance,
        targetHeight: Config.camera.thirdPersonHeight,
    },

    init(camera) {
        this.camera = camera;
        DebugSystem.info('Camera system initialized');
    },

    /**
     * Toggle between first and third person
     */
    toggleMode() {
        if (this.state.mode === 'first-person') {
            this.setMode('third-person');
        } else {
            this.setMode('first-person');
        }
    },

    /**
     * Set camera mode
     */
    setMode(mode) {
        if (this.state.mode === mode) return;
        
        this.state.mode = mode;
        DebugSystem.info(`Camera mode: ${mode}`);
        
        if (mode === 'third-person') {
            this.thirdPerson.currentOffset.copy(this.thirdPerson.desiredOffset);
        }
    },

    /**
     * Update camera based on player position and orientation
     */
    update(playerBody, playerController, deltaTime) {
        if (!playerBody) return;

        // Get rotation from pitch and yaw
        const rotation = this.getRotationMatrix();

        if (this.state.mode === 'first-person') {
            this.updateFirstPerson(playerBody, rotation);
        } else {
            this.updateThirdPerson(playerBody, rotation, deltaTime);
        }

        this.camera.updateProjectionMatrix();
    },

    /**
     * First person camera view
     */
    updateFirstPerson(playerBody, rotationMatrix) {
        const eyeOffset = Config.camera.firstPersonOffset;
        
        // Position camera at player eyes
        const eyePos = new THREE.Vector3(eyeOffset[0], eyeOffset[1], eyeOffset[2]);
        eyePos.applyMatrix4(rotationMatrix);
        eyePos.add(playerBody.position);

        this.camera.position.copy(eyePos);
        this.camera.quaternion.setFromEuler(
            new THREE.Euler(this.state.pitchAngle, this.state.yawAngle, 0, 'YXZ')
        );
    },

    /**
     * Third person camera view with smooth following
     */
    updateThirdPerson(playerBody, rotationMatrix, deltaTime) {
        // Desired camera offset (behind and above player)
        const distance = this.thirdPerson.targetDistance;
        const height = this.thirdPerson.targetHeight;
        
        this.thirdPerson.desiredOffset.set(0, height, distance);
        this.thirdPerson.desiredOffset.applyMatrix4(rotationMatrix);

        // Smooth exponential damping
        const smoothingFactor = Math.min(1, Config.camera.thirdPersonSmoothing * 60 * deltaTime);
        this.thirdPerson.currentOffset.lerp(this.thirdPerson.desiredOffset, smoothingFactor);

        // Position camera
        const cameraPos = playerBody.position.clone().add(this.thirdPerson.currentOffset);
        this.camera.position.copy(cameraPos);

        // Look at player (with slight upward bias)
        const lookTarget = playerBody.position.clone();
        lookTarget.y += Config.player.eyeHeight * 0.5;
        
        this.camera.lookAt(lookTarget);
    },

    /**
     * Handle mouse movement (look around)
     */
    handleMouseMove(deltaX, deltaY) {
        const sensitivity = Config.camera.mouseSensitivity;
        
        this.state.yawAngle -= deltaX * sensitivity;
        this.state.pitchAngle -= deltaY * sensitivity;
        
        // Clamp pitch to prevent flipping
        this.state.pitchAngle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.state.pitchAngle));
        
        // Wrap yaw
        if (this.state.yawAngle > Math.PI) this.state.yawAngle -= Math.PI * 2;
        if (this.state.yawAngle < -Math.PI) this.state.yawAngle += Math.PI * 2;
    },

    /**
     * Get rotation matrix from current angles
     */
    getRotationMatrix() {
        const matrix = new THREE.Matrix4();
        const euler = new THREE.Euler(this.state.pitchAngle, this.state.yawAngle, 0, 'YXZ');
        matrix.makeRotationFromEuler(euler);
        return matrix;
    },

    /**
     * Get forward vector based on camera orientation
     */
    getForwardVector() {
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(new THREE.Euler(this.state.pitchAngle, this.state.yawAngle, 0, 'YXZ'));
        return forward;
    },

    /**
     * Get right vector based on camera orientation
     */
    getRightVector() {
        const right = new THREE.Vector3(1, 0, 0);
        right.applyEuler(new THREE.Euler(this.state.pitchAngle, this.state.yawAngle, 0, 'YXZ'));
        return right;
    },

    /**
     * Get up vector for current orientation
     */
    getUpVector() {
        const up = new THREE.Vector3(0, 1, 0);
        up.applyEuler(new THREE.Euler(this.state.pitchAngle, this.state.yawAngle, 0, 'YXZ'));
        return up;
    },

    /**
     * Get camera direction (normalized forward)
     */
    getDirection() {
        return this.getForwardVector().normalize();
    },

    /**
     * Set pitch and yaw directly
     */
    setRotation(pitch, yaw) {
        this.state.pitchAngle = pitch;
        this.state.yawAngle = yaw;
    },

    /**
     * Adjust field of view
     */
    setFOV(fov) {
        this.state.fov = fov;
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
    },

    /**
     * Get current camera data for debugging
     */
    getDebugInfo() {
        return {
            mode: this.state.mode,
            pitch: Utils.angle.toDegrees(this.state.pitchAngle).toFixed(1),
            yaw: Utils.angle.toDegrees(this.state.yawAngle).toFixed(1),
            position: Utils.string.formatPosition(this.camera.position),
            fov: this.state.fov,
        };
    },
};

DebugSystem.info('Camera system loaded');
