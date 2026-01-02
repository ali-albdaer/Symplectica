/**
 * Solar System Simulation - Camera Controller
 * ============================================
 * Handles camera movement and object interaction raycasting.
 */

class CameraController {
    constructor() {
        this.camera = null;
        this.player = null;
        this.raycaster = new THREE.Raycaster();
        
        // Raycast results
        this.hoveredObject = null;
        
        Logger.info('CameraController created');
    }
    
    /**
     * Initialize with camera and player
     */
    init(camera, player) {
        this.camera = camera;
        this.player = player;
        player.init(camera);
        
        Logger.success('CameraController initialized');
    }
    
    /**
     * Update camera and process input
     */
    update(deltaTime, interactiveObjects) {
        if (!this.player || !this.camera) return;
        
        // Only process input if pointer is locked
        if (Input.isPointerLocked) {
            // Get mouse movement for look
            const mouseDelta = Input.getMouseDelta();
            this.player.setLookInput(mouseDelta.x, mouseDelta.y);
            
            // Get movement input
            const moveInput = Input.getMovementInput();
            
            // Handle movement differently based on flight mode
            if (this.player.isFlying) {
                this.player.setMoveInput(moveInput.x, moveInput.y, moveInput.z);
            } else {
                // Walking mode: space is jump, not up
                this.player.setMoveInput(moveInput.x, 0, moveInput.z);
                
                // Jump on space press
                if (Input.isKeyPressed('Space')) {
                    this.player.jump();
                }
            }
            
            // Running
            this.player.isRunning = Input.isKeyDown('ShiftLeft') || Input.isKeyDown('ShiftRight');
        }
        
        // Handle special key presses (even when not pointer locked)
        this.handleKeyActions();
        
        // Update player
        this.player.update(deltaTime);
        
        // Object interaction raycasting
        if (Input.isPointerLocked && interactiveObjects) {
            this.updateRaycast(interactiveObjects);
        }
    }
    
    /**
     * Handle special key actions
     */
    handleKeyActions() {
        // Toggle flight mode
        if (Input.isKeyPressed('KeyF')) {
            this.player.toggleFlightMode();
        }
        
        // Toggle camera view
        if (Input.isKeyPressed('KeyV')) {
            this.player.toggleCameraView();
        }
    }
    
    /**
     * Update raycasting for object interaction
     */
    updateRaycast(interactiveObjects) {
        // Ray from center of screen
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Get meshes from interactive objects
        const meshes = interactiveObjects
            .filter(obj => obj.mesh && !obj.isHeld)
            .map(obj => obj.mesh);
        
        const intersects = this.raycaster.intersectObjects(meshes);
        
        // Clear previous hover
        if (this.hoveredObject && this.hoveredObject !== this.player.heldObject) {
            this.hoveredObject.setHighlighted(false);
        }
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            const distance = hit.distance;
            
            // Check if within grab range
            if (distance <= Config.interactiveObjects.grabDistance) {
                const obj = hit.object.userData.interactiveObject;
                
                if (obj) {
                    obj.setHighlighted(true);
                    this.hoveredObject = obj;
                    
                    // Grab on right click
                    if (Input.isMouseDown(2)) { // Right mouse button
                        this.player.grabObject(obj);
                    }
                }
            } else {
                this.hoveredObject = null;
            }
        } else {
            this.hoveredObject = null;
        }
        
        // Release on right click release
        if (this.player.heldObject && !Input.isMouseDown(2)) {
            // Throw if moving
            const throwForce = this.player.velocity.length() > 1 ? 
                Config.interactiveObjects.throwForce : 0;
            this.player.releaseObject(throwForce);
        }
    }
    
    /**
     * Get camera position
     */
    getPosition() {
        return this.camera?.position.clone() || new THREE.Vector3();
    }
    
    /**
     * Get camera direction
     */
    getDirection() {
        const dir = new THREE.Vector3(0, 0, -1);
        return dir.applyQuaternion(this.camera.quaternion);
    }
}

// Global instance
const Camera = new CameraController();
