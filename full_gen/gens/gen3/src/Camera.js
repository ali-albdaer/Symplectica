/**
 * Camera Controller - Handles first-person and third-person camera with smooth transitions
 */

import * as THREE from 'three';
import { PLAYER } from './config.js';

export class CameraController {
    constructor(player, input) {
        this.player = player;
        this.input = input;
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            100000
        );
        
        // Camera modes
        this.modes = {
            FIRST_PERSON: 'first_person',
            THIRD_PERSON: 'third_person'
        };
        this.currentMode = this.modes.FIRST_PERSON;
        
        // Third person settings
        this.thirdPersonDistance = PLAYER.thirdPersonDistance;
        this.thirdPersonHeight = PLAYER.thirdPersonHeight;
        this.currentDistance = this.thirdPersonDistance;
        this.currentHeight = this.thirdPersonHeight;
        
        // Smooth camera
        this.smoothPosition = new THREE.Vector3();
        this.smoothTarget = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // Camera shake
        this.shake = {
            intensity: 0,
            decay: 0.95
        };
        
        this.setupInputHandlers();
    }

    setupInputHandlers() {
        // Toggle camera mode with V key
        this.input.on('keyDown', (event) => {
            if (event.code === 'KeyV') {
                this.toggleMode();
            }
        });
    }

    toggleMode() {
        if (this.currentMode === this.modes.FIRST_PERSON) {
            this.currentMode = this.modes.THIRD_PERSON;
            this.player.setMeshVisible(true);
        } else {
            this.currentMode = this.modes.FIRST_PERSON;
            this.player.setMeshVisible(false);
        }
        
        // Update UI
        const modeElement = document.getElementById('camera-mode');
        if (modeElement) {
            modeElement.textContent = this.currentMode === this.modes.FIRST_PERSON 
                ? 'First Person' 
                : 'Third Person';
        }
    }

    update(deltaTime) {
        if (this.currentMode === this.modes.FIRST_PERSON) {
            this.updateFirstPerson(deltaTime);
        } else {
            this.updateThirdPerson(deltaTime);
        }
        
        // Apply camera shake
        this.applyShake();
        
        // Update shake decay
        this.shake.intensity *= this.shake.decay;
    }

    updateFirstPerson(deltaTime) {
        // Camera position at player's eye level
        const targetPosition = this.player.getCameraPosition();
        
        // Smooth camera movement
        this.smoothPosition.lerp(targetPosition, PLAYER.cameraSmoothing);
        this.camera.position.copy(this.smoothPosition);
        
        // Camera looks in player's direction
        const lookDirection = this.player.getCameraDirection();
        const lookTarget = this.camera.position.clone().add(lookDirection);
        this.camera.lookAt(lookTarget);
    }

    updateThirdPerson(deltaTime) {
        const playerPos = this.player.position;
        
        // Calculate camera position behind and above player
        const cameraOffset = new THREE.Vector3(0, 0, this.thirdPersonDistance);
        cameraOffset.applyEuler(new THREE.Euler(
            -0.3, // Look down slightly
            this.player.yaw,
            0
        ));
        
        // Add height offset relative to planet
        let upDirection;
        if (this.player.currentPlanet) {
            upDirection = new THREE.Vector3()
                .subVectors(playerPos, this.player.currentPlanet.position)
                .normalize();
        } else {
            upDirection = new THREE.Vector3(0, 1, 0);
        }
        
        cameraOffset.add(upDirection.multiplyScalar(this.thirdPersonHeight));
        
        const targetPosition = playerPos.clone().add(cameraOffset);
        
        // Smooth camera position with cinematic easing
        const smoothFactor = 0.05; // Lower = smoother
        this.smoothPosition.lerp(targetPosition, smoothFactor);
        
        // Look-ahead: camera looks slightly ahead of player's movement
        const lookAheadTarget = playerPos.clone();
        if (this.player.velocity.length() > 0.1) {
            const velocityDirection = this.player.velocity.clone().normalize();
            lookAheadTarget.add(velocityDirection.multiplyScalar(PLAYER.cameraLookAhead));
        }
        
        // Smooth target
        this.smoothTarget.lerp(lookAheadTarget, smoothFactor);
        
        // Apply camera position and look at target
        this.camera.position.copy(this.smoothPosition);
        this.camera.lookAt(this.smoothTarget);
    }

    applyShake() {
        if (this.shake.intensity > 0.001) {
            const shakeX = (Math.random() - 0.5) * this.shake.intensity;
            const shakeY = (Math.random() - 0.5) * this.shake.intensity;
            const shakeZ = (Math.random() - 0.5) * this.shake.intensity;
            
            this.camera.position.add(new THREE.Vector3(shakeX, shakeY, shakeZ));
        }
    }

    addShake(intensity) {
        this.shake.intensity = Math.min(this.shake.intensity + intensity, 1.0);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }

    getCurrentMode() {
        return this.currentMode;
    }

    // Set camera for specific viewing angle (useful for cutscenes or special views)
    setCustomView(position, target, duration = 1) {
        // Future enhancement: smooth transition to custom view
        this.camera.position.copy(position);
        this.camera.lookAt(target);
    }
}
