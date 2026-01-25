import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Config } from './config.js';

export class Player {
    constructor(scene, physics, input, camera) {
        this.scene = scene;
        this.physics = physics;
        this.input = input;
        this.camera = camera;

        this.isFlying = false;
        this.cameraMode = 'first'; // 'first' or 'third'
        this.cameraDistance = 10;
        
        this.pitch = 0;
        this.yaw = 0;

        this.init();
    }

    init() {
        const cfg = Config.player;
        
        // Visual Mesh
        const geometry = new THREE.CapsuleGeometry(0.5, cfg.height - 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);

        // Physics Body
        const shape = new CANNON.Sphere(0.5); // Simple sphere for movement
        this.body = new CANNON.Body({
            mass: cfg.mass,
            position: new CANNON.Vec3(Config.world.planet1Distance, Config.world.planet1Size + 2, 0),
            fixedRotation: true,
            linearDamping: 0.9 // Simulate air resistance / friction
        });
        this.body.addShape(shape, new CANNON.Vec3(0, -cfg.height/2 + 0.5, 0)); // Offset sphere to bottom
        this.physics.addDynamicBody(this.body, this.mesh);

        // Initial Velocity to match planet 1
        // We assume the second body added (index 1) is Planet 1 based on World.js order (Sun, Planet1, Moon, Planet2)
        // A better way is to search by mass or some ID, but let's rely on the config for now.
        // Actually, let's just calculate it using the same formula as World.js
        const G = Config.physics.G;
        const v1 = Math.sqrt((G * Config.world.sunMass) / Config.world.planet1Distance);
        this.body.velocity.set(0, 0, v1);
    }

    update(dt) {
        this.handleInput(dt);
        this.updateCamera();
        this.alignToGravity();
    }

    handleInput(dt) {
        if (!this.input.isLocked) return;

        const cfg = Config.player;
        
        // Toggle Flight
        if (this.input.isPressed('Insert')) {
            // Debounce needed, but for now just toggle
             // This logic is flawed for a continuous check, need a "JustPressed"
        }

        // Movement
        const speed = this.isFlying ? cfg.flightSpeed : cfg.speed;
        const moveDir = new THREE.Vector3(0, 0, 0);

        if (this.input.isPressed('KeyW')) moveDir.z -= 1;
        if (this.input.isPressed('KeyS')) moveDir.z += 1;
        if (this.input.isPressed('KeyA')) moveDir.x -= 1;
        if (this.input.isPressed('KeyD')) moveDir.x += 1;

        if (this.input.isPressed('Space')) {
            if (this.isFlying) {
                this.body.position.y += speed * dt; // This is world Y, not local up
            } else {
                // Jump check (raycast down?)
                // For now, simple jump
                 // this.body.velocity.y = cfg.jumpForce; // This assumes Y is up
            }
        }

        // Apply movement relative to camera view
        if (moveDir.length() > 0) {
            moveDir.normalize();
            
            // Get camera direction but flatten it to the "ground" plane defined by gravity
            // For now, let's just use camera direction
            const camDir = new THREE.Vector3();
            this.camera.getWorldDirection(camDir);
            
            // Get player's up vector (local Y rotated to world)
            const playerUp = new THREE.Vector3(0, 1, 0).applyQuaternion(this.mesh.quaternion);

            const camRight = new THREE.Vector3();
            camRight.crossVectors(camDir, playerUp).normalize();
            
            const camForward = new THREE.Vector3();
            camForward.crossVectors(playerUp, camRight).normalize();

            const finalMove = new THREE.Vector3()
                .addScaledVector(camForward, -moveDir.z)
                .addScaledVector(camRight, moveDir.x);
            
            // Apply force
            const force = new CANNON.Vec3(finalMove.x, finalMove.y, finalMove.z).scale(speed * 50); // Scale for force
            this.body.applyForce(force, this.body.position);
        }
        
        // Jump
        if (this.input.isPressed('Space') && !this.isFlying) {
             // We need a ground check.
             // And apply impulse along local UP
             // const up = new CANNON.Vec3(this.mesh.up.x, this.mesh.up.y, this.mesh.up.z);
             // this.body.applyImpulse(up.scale(cfg.jumpForce), this.body.position);
        }
    }

    alignToGravity() {
        // Find "Down" vector based on gravity
        // We can get the total force applied to the body in the last step?
        // Or recalculate it.
        // Let's recalculate nearest planet direction for orientation
        
        let nearestBody = null;
        let minDist = Infinity;
        
        for (const cel of this.physics.celestialBodies) {
            const dist = this.body.position.distanceTo(cel.body.position);
            if (dist < minDist) {
                minDist = dist;
                nearestBody = cel;
            }
        }

        if (nearestBody) {
            const gravityDir = new THREE.Vector3()
                .subVectors(nearestBody.mesh.position, this.mesh.position)
                .normalize();
            
            const up = new THREE.Vector3().copy(gravityDir).negate();
            
            // Smoothly interpolate up vector
            const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
            this.mesh.quaternion.slerp(targetQuaternion, 0.1);
        }
    }

    updateCamera() {
        const mouseDelta = this.input.getMouseDelta();
        const sensitivity = 0.002;

        this.yaw -= mouseDelta.x * sensitivity;
        this.pitch -= mouseDelta.y * sensitivity;
        this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));

        // Camera Rotation
        // We want to rotate relative to the player's up vector
        // But for simplicity, let's just use a pivot object attached to the player
        
        // Actually, we need to construct a quaternion from yaw/pitch relative to the player's orientation
        // This is tricky on a sphere.
        // Let's keep it simple: Camera is child of Player Mesh? No, Player Mesh rotates to gravity.
        
        // Let's calculate camera position based on mode
        const offset = new THREE.Vector3(0, 0, 0);
        if (this.cameraMode === 'third') {
            offset.z = this.cameraDistance;
            offset.y = 2;
        } else {
            offset.y = Config.player.height - 0.5;
        }

        // Apply rotation
        const rotation = new THREE.Quaternion();
        rotation.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        
        // We need to combine this with the player's up orientation
        // The player mesh is already aligned to gravity.
        // So we can just use the player mesh's rotation as a base?
        // Yes, but yaw should be around the local Y axis.
        
        // Let's try this:
        // 1. Get player position
        const playerPos = this.mesh.position.clone();
        
        // 2. Get player rotation (aligned to gravity)
        const playerRot = this.mesh.quaternion.clone();
        
        // 3. Apply local yaw/pitch
        const localRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        
        // 4. Combine
        const finalRot = playerRot.multiply(localRot);
        
        // 5. Apply offset rotated by finalRot
        const finalOffset = offset.clone().applyQuaternion(finalRot);
        const camPos = playerPos.clone().add(finalOffset);
        
        // Smooth camera for 3rd person
        if (this.cameraMode === 'third') {
            this.camera.position.lerp(camPos, 0.1);
            this.camera.quaternion.slerp(finalRot, 0.1);
        } else {
            this.camera.position.copy(camPos);
            this.camera.quaternion.copy(finalRot);
        }

        // Toggle Camera Mode
        if (this.input.isPressed('KeyV')) {
             // Debounce needed
             // For now, simple toggle
             // this.cameraMode = this.cameraMode === 'first' ? 'third' : 'first';
        }
    }
}