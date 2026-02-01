/**
 * camera.js - Camera Control Systems
 * 
 * Handles camera movement for both Edit Mode (orthographic) and Free View (perspective).
 * Provides smooth, intuitive controls appropriate for each mode.
 */

import * as THREE from 'three';
import { getRenderer } from './renderer.js';
import { getState, AppMode, CursorState } from './state.js';
import { AU } from './constants.js';

/**
 * Camera controller class
 */
export class CameraController {
    constructor() {
        /** @type {Renderer} */
        this.renderer = null;
        
        // ========== Free View State ==========
        /** @type {THREE.Euler} Camera rotation in free view */
        this.freeViewRotation = new THREE.Euler(0, 0, 0, 'YXZ');
        
        /** @type {number} Mouse sensitivity */
        this.mouseSensitivity = 0.002;
        
        /** @type {number} Movement speed (meters per second) */
        this.moveSpeed = AU / 10; // 0.1 AU per second base
        
        /** @type {number} Zoom speed for orthographic */
        this.zoomSpeed = 0.1;
        
        // ========== Movement Input State ==========
        /** @type {Object} Currently pressed movement keys */
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
        };
        
        // ========== Edit Mode State ==========
        /** @type {number} Pan speed multiplier */
        this.panSpeed = 1.0;
        
        // ========== Smoothing ==========
        /** @type {THREE.Vector3} Target position for smooth movement */
        this.targetPosition = new THREE.Vector3();
        
        /** @type {number} Smoothing factor (0-1, higher = more responsive) */
        this.smoothing = 0.1;
        
        /** @type {boolean} Whether controller is initialized */
        this.initialized = false;
    }

    /**
     * Initialize the camera controller
     * @param {Renderer} renderer - The renderer instance
     */
    init(renderer) {
        this.renderer = renderer;
        
        // Initialize target position from perspective camera
        this.targetPosition.copy(renderer.perspectiveCamera.position);
        
        // Initialize rotation from state
        const state = getState();
        this.freeViewRotation.set(
            state.freeCamera.rotation.x,
            state.freeCamera.rotation.y,
            0,
            'YXZ'
        );
        
        this.initialized = true;
    }

    /**
     * Handle mouse movement for camera look (free view only)
     * @param {number} deltaX - Mouse X movement
     * @param {number} deltaY - Mouse Y movement
     */
    handleMouseMove(deltaX, deltaY) {
        const state = getState();
        
        if (state.mode !== AppMode.FREE_VIEW || !state.pointerLocked) {
            return;
        }
        
        // Yaw (left/right)
        this.freeViewRotation.y -= deltaX * this.mouseSensitivity;
        
        // Pitch (up/down) with clamping
        this.freeViewRotation.x -= deltaY * this.mouseSensitivity;
        this.freeViewRotation.x = Math.max(
            -Math.PI / 2 + 0.01,
            Math.min(Math.PI / 2 - 0.01, this.freeViewRotation.x)
        );
        
        // Update state
        state.freeCamera.rotation.x = this.freeViewRotation.x;
        state.freeCamera.rotation.y = this.freeViewRotation.y;
    }

    /**
     * Handle scroll wheel for zoom
     * @param {number} delta - Scroll delta
     */
    handleScroll(delta) {
        const state = getState();
        
        if (state.mode === AppMode.EDIT) {
            // Orthographic zoom
            this.renderer.zoomOrthographic(delta);
        } else {
            // Perspective: adjust move speed
            const factor = delta > 0 ? 0.9 : 1.1;
            this.moveSpeed = Math.max(1e6, Math.min(AU * 10, this.moveSpeed * factor));
        }
    }

    /**
     * Set movement key state
     * @param {string} key - Key identifier
     * @param {boolean} pressed - Whether key is pressed
     */
    setMovementKey(key, pressed) {
        if (key in this.keys) {
            this.keys[key] = pressed;
        }
    }

    /**
     * Reset all movement keys
     */
    resetMovementKeys() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
    }

    /**
     * Update camera based on current input state
     * @param {number} deltaTime - Time since last update in seconds
     */
    update(deltaTime) {
        if (!this.initialized) return;
        
        const state = getState();
        
        if (state.mode === AppMode.EDIT) {
            this._updateEditMode(deltaTime);
        } else {
            this._updateFreeView(deltaTime);
        }
    }

    /**
     * Update edit mode camera
     * @param {number} deltaTime - Delta time
     * @private
     */
    _updateEditMode(deltaTime) {
        const camera = this.renderer.orthographicCamera;
        const viewScale = this.renderer.viewScale;
        
        // Calculate pan speed based on zoom
        const basePan = AU / viewScale / 2 * this.panSpeed;
        const panAmount = basePan / camera.zoom * deltaTime;
        
        // WASD panning
        if (this.keys.forward) {
            camera.position.z -= panAmount;
        }
        if (this.keys.backward) {
            camera.position.z += panAmount;
        }
        if (this.keys.left) {
            camera.position.x -= panAmount;
        }
        if (this.keys.right) {
            camera.position.x += panAmount;
        }
        
        // Update state
        const state = getState();
        state.editCamera.x = camera.position.x;
        state.editCamera.y = camera.position.z;
        state.editCamera.zoom = camera.zoom;
    }

    /**
     * Update free view camera
     * @param {number} deltaTime - Delta time
     * @private
     */
    _updateFreeView(deltaTime) {
        const camera = this.renderer.perspectiveCamera;
        const viewScale = this.renderer.viewScale;
        
        // Apply rotation
        camera.rotation.copy(this.freeViewRotation);
        
        // Calculate movement direction
        const direction = new THREE.Vector3();
        const right = new THREE.Vector3();
        const up = new THREE.Vector3(0, 1, 0);
        
        // Forward vector (camera direction)
        camera.getWorldDirection(direction);
        
        // Right vector
        right.crossVectors(direction, up).normalize();
        
        // Calculate velocity
        const velocity = new THREE.Vector3();
        const speed = this.moveSpeed / viewScale * deltaTime;
        
        if (this.keys.forward) {
            velocity.add(direction.clone().multiplyScalar(speed));
        }
        if (this.keys.backward) {
            velocity.add(direction.clone().multiplyScalar(-speed));
        }
        if (this.keys.right) {
            velocity.add(right.clone().multiplyScalar(speed));
        }
        if (this.keys.left) {
            velocity.add(right.clone().multiplyScalar(-speed));
        }
        if (this.keys.up) {
            velocity.y += speed;
        }
        if (this.keys.down) {
            velocity.y -= speed;
        }
        
        // Apply velocity to target position
        this.targetPosition.add(velocity);
        
        // Smooth camera movement
        camera.position.lerp(this.targetPosition, this.smoothing);
        
        // Update state
        const state = getState();
        state.freeCamera.position.x = camera.position.x * viewScale;
        state.freeCamera.position.y = camera.position.y * viewScale;
        state.freeCamera.position.z = camera.position.z * viewScale;
    }

    /**
     * Re-center camera on origin or center of mass
     */
    recenter() {
        const state = getState();
        const viewScale = this.renderer.viewScale;
        
        if (state.mode === AppMode.EDIT) {
            const camera = this.renderer.orthographicCamera;
            camera.position.x = 0;
            camera.position.z = 0;
            camera.zoom = 1;
            camera.updateProjectionMatrix();
        } else {
            const camera = this.renderer.perspectiveCamera;
            this.targetPosition.set(0, 5 * AU / viewScale, 5 * AU / viewScale);
            camera.position.copy(this.targetPosition);
            this.freeViewRotation.set(-Math.PI / 4, 0, 0, 'YXZ');
        }
    }

    /**
     * Look at a specific body
     * @param {Body} body - Body to look at
     */
    lookAtBody(body) {
        if (!body) return;
        
        const viewScale = this.renderer.viewScale;
        const pos = new THREE.Vector3(
            body.position.x / viewScale,
            body.position.y / viewScale,
            body.position.z / viewScale
        );
        
        const state = getState();
        
        if (state.mode === AppMode.EDIT) {
            const camera = this.renderer.orthographicCamera;
            camera.position.x = pos.x;
            camera.position.z = pos.z;
        } else {
            // Position camera at a distance from the body
            const distance = Math.max(body.radius * 5, AU / 10) / viewScale;
            this.targetPosition.copy(pos).add(new THREE.Vector3(distance, distance, distance));
            
            // Look at the body
            const direction = pos.clone().sub(this.targetPosition).normalize();
            this.freeViewRotation.x = Math.asin(-direction.y);
            this.freeViewRotation.y = Math.atan2(direction.x, direction.z);
        }
    }

    /**
     * Sync camera state from app state (e.g., after loading)
     */
    syncFromState() {
        const state = getState();
        const viewScale = this.renderer.viewScale;
        
        // Edit camera
        const ortho = this.renderer.orthographicCamera;
        ortho.position.x = state.editCamera.x;
        ortho.position.z = state.editCamera.y;
        ortho.zoom = state.editCamera.zoom;
        ortho.updateProjectionMatrix();
        
        // Free camera
        const persp = this.renderer.perspectiveCamera;
        persp.position.set(
            state.freeCamera.position.x / viewScale,
            state.freeCamera.position.y / viewScale,
            state.freeCamera.position.z / viewScale
        );
        this.targetPosition.copy(persp.position);
        
        this.freeViewRotation.set(
            state.freeCamera.rotation.x,
            state.freeCamera.rotation.y,
            0,
            'YXZ'
        );
    }
}

// Singleton instance
let cameraControllerInstance = null;

/**
 * Get the global camera controller
 * @returns {CameraController}
 */
export function getCameraController() {
    if (!cameraControllerInstance) {
        cameraControllerInstance = new CameraController();
    }
    return cameraControllerInstance;
}

/**
 * Initialize camera controller with renderer
 * @param {Renderer} renderer
 * @returns {CameraController}
 */
export function initCameraController(renderer) {
    const controller = getCameraController();
    controller.init(renderer);
    return controller;
}

export default {
    CameraController,
    getCameraController,
    initCameraController,
};
