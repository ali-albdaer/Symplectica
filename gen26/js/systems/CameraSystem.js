/**
 * ============================================
 * Camera System
 * ============================================
 * 
 * Manages camera modes (first-person, third-person)
 * and provides smooth camera following.
 */

class CameraSystem {
    constructor() {
        this.camera = null;
        this.target = null; // Player or entity to follow
        
        // Camera modes
        this.mode = 'first-person'; // 'first-person', 'third-person'
        
        // Third-person settings
        this.thirdPersonDistance = CONFIG.RENDERING.THIRD_PERSON_DISTANCE;
        this.thirdPersonHeight = CONFIG.RENDERING.THIRD_PERSON_HEIGHT;
        this.smoothing = CONFIG.RENDERING.CAMERA_SMOOTHING;
        
        // Smooth follow state
        this.currentPosition = new THREE.Vector3();
        this.currentLookAt = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // For cinematic movement
        this.shakeIntensity = 0;
        this.shakeDecay = 0.95;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the camera system
     */
    init() {
        console.info('Initializing Camera System...');
        
        try {
            // Create perspective camera
            this.camera = new THREE.PerspectiveCamera(
                CONFIG.RENDERING.FOV,
                window.innerWidth / window.innerHeight,
                CONFIG.RENDERING.NEAR_CLIP,
                CONFIG.RENDERING.FAR_CLIP
            );
            
            // Handle window resize
            window.addEventListener('resize', () => this.onResize());
            
            this.isInitialized = true;
            console.success('Camera System initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Camera System: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Set the target to follow
     */
    setTarget(target) {
        this.target = target;
        
        // Initialize camera position
        if (target) {
            this.currentPosition.copy(target.getFirstPersonCameraPosition());
            this.camera.position.copy(this.currentPosition);
        }
    }
    
    /**
     * Toggle camera mode
     */
    toggleMode() {
        if (this.mode === 'first-person') {
            this.mode = 'third-person';
        } else {
            this.mode = 'first-person';
        }
        console.info(`Camera mode: ${this.mode}`);
    }
    
    /**
     * Set camera mode directly
     */
    setMode(mode) {
        this.mode = mode;
    }
    
    /**
     * Update camera each frame
     */
    update(deltaTime, input) {
        if (!this.isInitialized || !this.target) return;
        
        // Handle mode toggle
        if (input && input.isKeyJustPressed('v')) {
            this.toggleMode();
        }
        
        // Update based on mode
        if (this.mode === 'first-person') {
            this.updateFirstPerson(deltaTime);
        } else {
            this.updateThirdPerson(deltaTime, input);
        }
        
        // Apply camera shake
        if (this.shakeIntensity > 0.001) {
            this.applyShake();
            this.shakeIntensity *= this.shakeDecay;
        }
    }
    
    /**
     * Update first-person camera
     */
    updateFirstPerson(deltaTime) {
        const targetPos = this.target.getFirstPersonCameraPosition();
        const targetRotation = this.target.getCameraRotation();
        
        // Smooth position interpolation
        this.currentPosition.lerp(targetPos, 1 - Math.pow(this.smoothing, deltaTime * 60));
        
        // Apply to camera
        this.camera.position.copy(this.currentPosition);
        this.camera.quaternion.copy(targetRotation);
    }
    
    /**
     * Update third-person camera
     */
    updateThirdPerson(deltaTime, input) {
        const targetPos = this.target.group.position.clone();
        const targetRotation = this.target.getCameraRotation();
        
        // Calculate ideal camera position behind and above target
        const offset = new THREE.Vector3(0, this.thirdPersonHeight, this.thirdPersonDistance);
        offset.applyQuaternion(targetRotation);
        
        const idealPos = targetPos.clone().add(offset);
        
        // Smooth position interpolation with different smoothing for cinematic feel
        const posSmoothing = this.smoothing * 0.5;
        this.currentPosition.lerp(idealPos, 1 - Math.pow(posSmoothing, deltaTime * 60));
        
        // Smooth look-at target (slightly ahead of player)
        const lookAhead = new THREE.Vector3(0, this.thirdPersonHeight * 0.3, -2);
        lookAhead.applyQuaternion(targetRotation);
        const lookTarget = targetPos.clone().add(lookAhead);
        
        this.currentLookAt.lerp(lookTarget, 1 - Math.pow(this.smoothing, deltaTime * 60));
        
        // Apply to camera
        this.camera.position.copy(this.currentPosition);
        this.camera.lookAt(this.currentLookAt);
        
        // Optional: Handle scroll wheel for zoom
        if (input) {
            const scroll = input.getScrollDelta();
            if (scroll !== 0) {
                this.thirdPersonDistance = MathUtils.clamp(
                    this.thirdPersonDistance + scroll * 0.01,
                    2, 50
                );
            }
        }
    }
    
    /**
     * Apply camera shake effect
     */
    applyShake() {
        const shakeOffset = new THREE.Vector3(
            (Math.random() - 0.5) * this.shakeIntensity,
            (Math.random() - 0.5) * this.shakeIntensity,
            (Math.random() - 0.5) * this.shakeIntensity
        );
        
        this.camera.position.add(shakeOffset);
    }
    
    /**
     * Trigger camera shake
     */
    shake(intensity) {
        this.shakeIntensity = intensity;
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
     * Get the camera for rendering
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Get camera position
     */
    getPosition() {
        return this.camera ? this.camera.position.clone() : new THREE.Vector3();
    }
    
    /**
     * Get camera direction
     */
    getDirection() {
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        return dir;
    }
}
