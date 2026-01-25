/**
 * CAMERA SYSTEM
 * First-person and third-person camera with smooth transitions.
 */

class CameraController {
    constructor(config, renderer) {
        this.config = config.camera;
        this.renderer = renderer;
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            this.config.fov,
            window.innerWidth / window.innerHeight,
            this.config.near,
            this.config.far
        );
        
        // Camera state
        this.mode = 'first'; // 'first' or 'third'
        this.target = null;  // Player reference
        
        // Third person state
        this.thirdPersonOffset = new THREE.Vector3();
        this.currentOffset = new THREE.Vector3();
        
        // Pointer lock
        this.isLocked = false;
        
        this.setupPointerLock();
        this.setupResize();
    }

    /**
     * Setup pointer lock API
     */
    setupPointerLock() {
        const canvas = this.renderer.domElement;
        
        // Request pointer lock on click
        canvas.addEventListener('click', () => {
            if (!this.isLocked) {
                canvas.requestPointerLock();
            }
        });
        
        // Pointer lock change events
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === canvas;
            console.log(`Pointer lock: ${this.isLocked ? 'ON' : 'OFF'}`);
        });
        
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (this.isLocked && this.target) {
                this.target.updateRotation(e.movementX, e.movementY);
            }
        });
    }

    /**
     * Setup window resize handling
     */
    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /**
     * Set camera target (player)
     */
    setTarget(player) {
        this.target = player;
    }

    /**
     * Toggle between first and third person
     */
    toggleMode() {
        this.mode = this.mode === 'first' ? 'third' : 'first';
        console.log(`Camera mode: ${this.mode} person`);
    }

    /**
     * Release pointer lock
     */
    releaseLock() {
        if (this.isLocked) {
            document.exitPointerLock();
        }
    }

    /**
     * Request pointer lock
     */
    requestLock() {
        if (!this.isLocked) {
            this.renderer.domElement.requestPointerLock();
        }
    }

    /**
     * Update camera position and orientation
     */
    update(dt) {
        if (!this.target) return;
        
        if (this.mode === 'first') {
            this.updateFirstPerson();
        } else {
            this.updateThirdPerson(dt);
        }
    }

    /**
     * First person camera update
     */
    updateFirstPerson() {
        // Position at player's eye level
        const eyePos = this.target.getEyePosition();
        this.camera.position.copy(eyePos);
        
        // Rotation from player pitch/yaw
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.target.yaw;
        this.camera.rotation.x = this.target.pitch;
    }

    /**
     * Third person camera update with smooth follow
     */
    updateThirdPerson(dt) {
        const eyePos = this.target.getEyePosition();
        
        // Calculate ideal offset based on player orientation
        const distance = this.config.thirdPerson.distance;
        const height = this.config.thirdPerson.height;
        
        // Offset behind and above player
        const offset = new THREE.Vector3(
            -Math.sin(this.target.yaw) * distance,
            height,
            -Math.cos(this.target.yaw) * distance
        );
        
        // Smooth interpolation
        const smoothness = this.config.thirdPerson.smoothness;
        this.currentOffset.lerp(offset, 1 - Math.pow(smoothness, dt * 60));
        
        // Apply offset
        this.camera.position.copy(eyePos).add(this.currentOffset);
        
        // Look at player
        this.camera.lookAt(eyePos);
        
        // Additional pitch rotation
        const pitchOffset = this.target.pitch * 0.3; // Reduced pitch influence
        this.camera.rotation.x += pitchOffset;
    }

    /**
     * Shake camera (for impacts, explosions, etc.)
     */
    shake(intensity, duration) {
        // Future implementation for camera shake effects
    }

    /**
     * Get camera view direction
     */
    getViewDirection() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction);
        return direction;
    }
}
