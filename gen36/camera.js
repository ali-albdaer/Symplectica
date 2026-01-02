/**
 * Camera System
 * Handles first-person and third-person camera modes
 */

class CameraController {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player;
        
        // Camera mode
        this.isFirstPerson = true;
        
        // Mouse look
        this.pitch = 0; // Up/down rotation
        this.yaw = 0; // Left/right rotation
        this.mouseSensitivity = CONFIG.PLAYER.mouseSensitivity;
        
        // Third person camera
        this.thirdPersonDistance = CONFIG.CAMERA.thirdPerson.distance;
        this.thirdPersonHeight = CONFIG.CAMERA.thirdPerson.height;
        this.smoothness = CONFIG.CAMERA.thirdPerson.smoothness;
        this.lookAhead = CONFIG.CAMERA.thirdPerson.lookAhead;
        
        // Current camera position (for smoothing)
        this.currentCameraPos = new THREE.Vector3();
        this.currentLookAtPos = new THREE.Vector3();
        
        // Pointer lock
        this.isPointerLocked = false;
        
        // Setup controls
        this.setupControls();
    }

    setupControls() {
        // Mouse movement
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;
            
            this.yaw -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity;
            
            // Clamp pitch to prevent flipping
            const maxPitch = Math.PI / 2 - 0.1;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
        });
        
        // Toggle camera mode
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyV') {
                this.toggleCameraMode();
            }
        });
        
        // Pointer lock
        document.addEventListener('click', () => {
            if (!this.isPointerLocked && !this.isMenuOpen()) {
                document.body.requestPointerLock();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockState === 'locked';
        });
        
        // Right click to grab
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2 && this.isPointerLocked) { // Right click
                this.tryGrabObject();
                e.preventDefault();
            }
        });
        
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    isMenuOpen() {
        const settingsMenu = document.getElementById('settingsMenu');
        const devConsole = document.getElementById('devConsole');
        return (settingsMenu && settingsMenu.style.display !== 'none') ||
               (devConsole && devConsole.style.display !== 'none');
    }

    toggleCameraMode() {
        this.isFirstPerson = !this.isFirstPerson;
        
        // Show/hide player mesh
        if (this.player && this.player.mesh) {
            this.player.mesh.visible = !this.isFirstPerson;
        }
        
        console.log(`Camera mode: ${this.isFirstPerson ? 'First Person' : 'Third Person'}`);
    }

    update(dt) {
        // Calculate camera direction from pitch and yaw
        const direction = new THREE.Vector3();
        direction.x = Math.cos(this.pitch) * Math.sin(this.yaw);
        direction.y = Math.sin(this.pitch);
        direction.z = Math.cos(this.pitch) * Math.cos(this.yaw);
        direction.normalize();
        
        // Calculate right and up vectors
        const right = new THREE.Vector3();
        right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
        
        const up = new THREE.Vector3();
        up.crossVectors(right, direction).normalize();
        
        // Update player's camera vectors for movement
        this.player.updateCameraVectors(direction, right, up);
        
        if (this.isFirstPerson) {
            this.updateFirstPerson(direction);
        } else {
            this.updateThirdPerson(direction, dt);
        }
    }

    updateFirstPerson(direction) {
        // Position camera at player's eye level
        const eyeOffset = CONFIG.CAMERA.firstPerson.offset;
        const playerPos = this.player.getPosition();
        
        // Get surface normal for proper orientation
        let upVector = new THREE.Vector3(0, 1, 0);
        if (this.player.currentPlanet && this.player.isOnGround) {
            upVector = this.player.physicsEngine.getSurfaceNormal(
                playerPos,
                this.player.currentPlanet
            );
        }
        
        // Camera position (scaled for rendering)
        this.camera.position.set(
            playerPos.x / 1e6 + eyeOffset.x,
            playerPos.y / 1e6 + eyeOffset.y,
            playerPos.z / 1e6 + eyeOffset.z
        );
        
        // Look direction
        const lookAt = this.camera.position.clone().add(direction);
        this.camera.lookAt(lookAt);
    }

    updateThirdPerson(direction, dt) {
        const playerPos = this.player.getPosition();
        
        // Get surface normal for proper orientation
        let upVector = new THREE.Vector3(0, 1, 0);
        if (this.player.currentPlanet && this.player.isOnGround) {
            upVector = this.player.physicsEngine.getSurfaceNormal(
                playerPos,
                this.player.currentPlanet
            );
        }
        
        // Target camera position (behind and above player)
        const targetCameraPos = playerPos.clone();
        
        // Offset backwards from look direction
        targetCameraPos.addScaledVector(direction, -this.thirdPersonDistance);
        
        // Offset upwards
        targetCameraPos.addScaledVector(upVector, this.thirdPersonHeight);
        
        // Smooth camera position
        if (this.currentCameraPos.lengthSq() === 0) {
            this.currentCameraPos.copy(targetCameraPos);
        } else {
            this.currentCameraPos.lerp(targetCameraPos, this.smoothness);
        }
        
        // Set camera position (scaled for rendering)
        this.camera.position.set(
            this.currentCameraPos.x / 1e6,
            this.currentCameraPos.y / 1e6,
            this.currentCameraPos.z / 1e6
        );
        
        // Look at point (slightly ahead of player)
        const lookAtPos = playerPos.clone();
        lookAtPos.addScaledVector(direction, this.lookAhead);
        
        // Smooth look-at
        if (this.currentLookAtPos.lengthSq() === 0) {
            this.currentLookAtPos.copy(lookAtPos);
        } else {
            this.currentLookAtPos.lerp(lookAtPos, this.smoothness * 2);
        }
        
        this.camera.lookAt(
            this.currentLookAtPos.x / 1e6,
            this.currentLookAtPos.y / 1e6,
            this.currentLookAtPos.z / 1e6
        );
    }

    tryGrabObject() {
        // Raycast to find object in front of player
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3();
        
        this.camera.getWorldDirection(direction);
        raycaster.set(this.camera.position, direction);
        
        // Find interactive objects
        const interactiveObjects = [];
        this.player.scene.traverse((obj) => {
            if (obj.userData && obj.userData.interactiveObject) {
                interactiveObjects.push(obj);
            }
        });
        
        const intersects = raycaster.intersectObjects(interactiveObjects, true);
        
        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            let interactiveObj = intersected;
            
            // Find the root interactive object
            while (interactiveObj.parent && !interactiveObj.userData.interactiveObject) {
                interactiveObj = interactiveObj.parent;
            }
            
            if (interactiveObj.userData.interactiveObject) {
                this.player.grabObject(interactiveObj.userData.interactiveObject);
            }
        } else {
            this.player.releaseObject();
        }
    }

    releasePointerLock() {
        if (this.isPointerLocked) {
            document.exitPointerLock();
        }
    }

    requestPointerLock() {
        if (!this.isPointerLocked && !this.isMenuOpen()) {
            document.body.requestPointerLock();
        }
    }
}
