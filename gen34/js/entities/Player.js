import * as THREE from 'three';
import { Config } from '../config.js';

export class Player {
    constructor(scene, camera, inputManager) {
        this.camera = camera;
        this.input = inputManager;
        
        this.height = Config.player.height;
        this.mass = Config.player.mass;
        
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        this.isGrounded = false;
        this.isFlying = false;
        
        // Camera control
        this.pitch = 0;
        this.yaw = 0;
        this.cameraOffset = new THREE.Vector3(0, 0, 0); // First person
        this.thirdPersonOffset = new THREE.Vector3(0, 2, 5);
        this.isThirdPerson = false;

        // Visual representation (simple capsule/box)
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Held object
        this.heldObject = null;
    }

    update(dt) {
        this.handleInput(dt);
        this.updateCamera();
        this.mesh.position.copy(this.position);
        
        // Align mesh to up vector (gravity opposite)
        // This is tricky. We need to know the "up" direction.
        // We'll assume the physics engine updates our orientation or we derive it from gravity.
    }

    applyGravity(gravityDir, gravityMagnitude, dt) {
        // gravityDir points TOWARDS the center of mass
        const up = gravityDir.clone().negate();
        
        // Apply gravity force
        this.velocity.add(gravityDir.clone().multiplyScalar(gravityMagnitude * dt));

        // Align player up vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        // Smoothly interpolate orientation? For now, snap.
        // Actually, we should only rotate the "up" reference, not necessarily the mesh instantly if we want smooth movement around a planet.
        // But for a simple implementation:
        this.mesh.quaternion.slerp(quaternion, 0.1);
    }

    handleInput(dt) {
        // Toggle Flight
        if (this.input.isKeyDown('KeyF') && !this.lastF) {
            this.isFlying = !this.isFlying;
            this.velocity.set(0,0,0); // Reset velocity on toggle for safety
        }
        this.lastF = this.input.isKeyDown('KeyF');

        // Toggle Camera
        if (this.input.isKeyDown('KeyV') && !this.lastV) {
            this.isThirdPerson = !this.isThirdPerson;
        }
        this.lastV = this.input.isKeyDown('KeyV');

        // Mouse Look
        const mouseDelta = this.input.getMouseDelta();
        const sensitivity = 0.002;
        this.yaw -= mouseDelta.x * sensitivity;
        this.pitch -= mouseDelta.y * sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        // Movement
        const moveSpeed = this.input.isKeyDown('ShiftLeft') && !this.isFlying ? Config.player.runSpeed : Config.player.walkSpeed;
        const flightSpeed = Config.player.flightSpeed * (this.input.isKeyDown('ShiftLeft') ? Config.player.flightBoostMultiplier : 1);
        
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        // Flatten vectors for walking (remove Y component relative to player Up)
        // This requires knowing "Up". Let's use the mesh's up vector.
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);
        
        if (!this.isFlying) {
            forward.projectOnPlane(up).normalize();
            right.projectOnPlane(up).normalize();
        }

        const moveDir = new THREE.Vector3();
        if (this.input.isKeyDown('KeyW')) moveDir.add(forward);
        if (this.input.isKeyDown('KeyS')) moveDir.sub(forward);
        if (this.input.isKeyDown('KeyA')) moveDir.sub(right);
        if (this.input.isKeyDown('KeyD')) moveDir.add(right);

        if (moveDir.lengthSq() > 0) moveDir.normalize();

        if (this.isFlying) {
            this.velocity.copy(moveDir.multiplyScalar(flightSpeed));
            if (this.input.isKeyDown('Space')) this.velocity.add(up.multiplyScalar(flightSpeed));
            if (this.input.isKeyDown('ControlLeft')) this.velocity.sub(up.multiplyScalar(flightSpeed));
            
            this.position.add(this.velocity.clone().multiplyScalar(dt));
        } else {
            // Walking
            if (this.isGrounded) {
                // Direct velocity control for walking (snappy)
                const targetVel = moveDir.multiplyScalar(moveSpeed);
                // Blend with existing vertical velocity (gravity)
                const verticalVel = this.velocity.clone().projectOnVector(up);
                this.velocity.copy(targetVel).add(verticalVel);

                // Jump
                if (this.input.isKeyDown('Space')) {
                    this.velocity.add(up.multiplyScalar(Config.player.jumpForce));
                    this.isGrounded = false;
                }
            }
            
            // Position update is handled by Physics Engine (Verlet) mostly, 
            // but here we modify velocity which feeds into the next step.
            // Wait, PhysicsEngine updates position based on velocity. 
            // So we just set velocity here.
        }
    }

    updateCamera() {
        // Calculate camera position based on player position and rotation
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);
        
        // Local rotation (Yaw/Pitch)
        // We need to rotate the camera relative to the player's up vector.
        const qYaw = new THREE.Quaternion().setFromAxisAngle(up, this.yaw);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.mesh.quaternion).applyQuaternion(qYaw);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(right, this.pitch);
        
        const lookQuat = qYaw.multiply(qPitch); // Combine rotations

        if (this.isThirdPerson) {
            // Offset relative to look direction
            const offset = this.thirdPersonOffset.clone().applyQuaternion(this.mesh.quaternion).applyQuaternion(lookQuat);
            const camPos = this.position.clone().add(up.clone().multiplyScalar(1.5)).add(offset); // 1.5m eye height base
            this.camera.position.copy(camPos);
            this.camera.lookAt(this.position.clone().add(up.clone().multiplyScalar(1.5)));
        } else {
            const camPos = this.position.clone().add(up.clone().multiplyScalar(1.6)); // Eye height
            this.camera.position.copy(camPos);
            
            // Look direction
            const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.mesh.quaternion).applyQuaternion(lookQuat);
            this.camera.lookAt(camPos.clone().add(forward));
            this.camera.up.copy(up);
        }
    }
}
