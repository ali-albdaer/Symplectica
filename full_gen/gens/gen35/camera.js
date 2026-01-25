/**
 * CAMERA CONTROLLER
 * First and third person camera with smooth cinematic following
 */

class CameraController {
    constructor(config, camera, player) {
        this.config = config.camera;
        this.camera = camera;
        this.player = player;
        
        // Camera mode
        this.firstPerson = true;
        
        // Third person camera state
        this.thirdPersonOffset = {
            distance: this.config.thirdPersonDistance,
            height: this.config.thirdPersonHeight,
            angle: 0
        };
        
        // Smooth camera position (for third person)
        this.smoothPosition = new THREE.Vector3();
        this.smoothLookAt = new THREE.Vector3();
        
        // Mouse control
        this.mouseSensitivity = this.player.config.mouseSensitivity;
        this.pointerLocked = false;
        
        // Setup pointer lock
        this.setupPointerLock();
        
        // Setup camera toggle
        this.setupCameraToggle();
        
        console.log('[CAMERA] Initialized in first person mode');
    }

    setupPointerLock() {
        const canvas = document.querySelector('canvas');
        
        // Request pointer lock on click
        canvas.addEventListener('click', () => {
            if (!this.pointerLocked && !window.isMenuOpen) {
                canvas.requestPointerLock();
            }
        });
        
        // Pointer lock change
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === canvas;
            console.log(`[CAMERA] Pointer lock: ${this.pointerLocked ? 'ENABLED' : 'DISABLED'}`);
        });
        
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (!this.pointerLocked) return;
            
            this.player.yaw -= e.movementX * this.mouseSensitivity;
            this.player.pitch -= e.movementY * this.mouseSensitivity;
            
            // Clamp pitch to prevent flipping
            const maxPitch = Math.PI / 2 - 0.01;
            this.player.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.player.pitch));
        });
    }

    setupCameraToggle() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === this.config.cameraToggleKey) {
                this.toggleCamera();
            }
        });
    }

    toggleCamera() {
        this.firstPerson = !this.firstPerson;
        
        if (this.player.mesh) {
            this.player.mesh.visible = !this.firstPerson;
        }
        
        console.log(`[CAMERA] Switched to ${this.firstPerson ? 'FIRST' : 'THIRD'} person`);
    }

    update(deltaTime) {
        if (this.firstPerson) {
            this.updateFirstPerson();
        } else {
            this.updateThirdPerson(deltaTime);
        }
    }

    updateFirstPerson() {
        // Position camera at player's eye level
        const eyeHeight = this.player.height * 0.5;
        
        this.camera.position.set(
            this.player.position.x,
            this.player.position.y + eyeHeight,
            this.player.position.z
        );
        
        // Set camera rotation based on player yaw and pitch
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = -this.player.yaw;
        this.camera.rotation.x = this.player.pitch;
        this.camera.rotation.z = 0;
    }

    updateThirdPerson(deltaTime) {
        // Calculate ideal camera position behind player
        const distance = this.thirdPersonOffset.distance;
        const height = this.thirdPersonOffset.height;
        
        // Camera offset based on player yaw
        const offsetX = -Math.sin(this.player.yaw) * distance;
        const offsetZ = -Math.cos(this.player.yaw) * distance;
        
        const targetPosition = new THREE.Vector3(
            this.player.position.x + offsetX,
            this.player.position.y + height,
            this.player.position.z + offsetZ
        );
        
        // Smooth camera movement (cinematic)
        const smoothness = this.config.smoothness;
        this.smoothPosition.lerp(targetPosition, smoothness);
        
        this.camera.position.copy(this.smoothPosition);
        
        // Look at player
        const lookTarget = new THREE.Vector3(
            this.player.position.x,
            this.player.position.y + this.player.height * 0.5,
            this.player.position.z
        );
        
        this.smoothLookAt.lerp(lookTarget, smoothness);
        this.camera.lookAt(this.smoothLookAt);
    }

    releasePointerLock() {
        if (this.pointerLocked) {
            document.exitPointerLock();
        }
    }

    requestPointerLock() {
        const canvas = document.querySelector('canvas');
        if (canvas && !this.pointerLocked) {
            canvas.requestPointerLock();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CameraController };
}
