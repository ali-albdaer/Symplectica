import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from '../Config.js';

export class Player {
    constructor(scene, physicsWorld, domElement) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.domElement = domElement;

        this.isFlying = false;
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        
        // Container for rotation alignment
        this.rotationContainer = new THREE.Object3D();
        this.scene.add(this.rotationContainer);
        this.rotationContainer.add(this.camera);

        // Physics Body
        this.shape = new CANNON.Sphere(Config.player.height / 2);
        this.body = new CANNON.Body({
            mass: 1,
            shape: this.shape,
            position: new CANNON.Vec3(0, 0, 0),
            fixedRotation: true // We handle rotation manually
        });
        this.body.linearDamping = 0.9;
        this.physicsWorld.addBody(this.body);

        // State
        this.velocity = new THREE.Vector3();
        this.input = { w: false, a: false, s: false, d: false, space: false, shift: false };
        this.mouse = { x: 0, y: 0 };
        this.pitch = 0;
        this.yaw = 0;
        this.currentGravity = new CANNON.Vec3(0, 0, 0);
        
        // Interaction
        this.raycaster = new THREE.Raycaster();
        this.grabConstraint = null;

        this.initInput();
    }

    initInput() {
        document.addEventListener('keydown', (e) => this.onKey(e, true));
        document.addEventListener('keyup', (e) => this.onKey(e, false));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Pointer Lock
        this.domElement.addEventListener('click', () => {
            this.domElement.requestPointerLock();
        });
    }

    onMouseDown(e) {
        if (e.button === 2) { // Right click
            this.attemptGrab();
        }
    }

    onMouseUp(e) {
        if (e.button === 2) {
            this.releaseGrab();
        }
    }

    attemptGrab() {
        if (this.grabConstraint) return;

        // Raycast from center of screen
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // We need to raycast against visual meshes of interactive objects
        // But we only have physics bodies in PhysicsWorld.interactiveObjects
        // We need a way to map back or just raycast against everything in scene?
        // For simplicity, let's assume we can raycast against the scene children that are interactive.
        // But we didn't tag them.
        // Let's just raycast against all scene meshes and check distance.
        
        const intersects = this.raycaster.intersectObjects(this.scene.children);
        
        for (const hit of intersects) {
            if (hit.distance > Config.player.reach) continue;
            
            // Find corresponding physics body. 
            // In a real engine, we'd have a map. 
            // Here, we'll iterate physics bodies and check position match (hacky but works for demo)
            // Or better, we rely on the fact that we only added boxes as interactive.
            
            const hitPos = new CANNON.Vec3(hit.point.x, hit.point.y, hit.point.z);
            
            // Find closest interactive body
            let closestBody = null;
            let minDst = 1.0; // Tolerance

            for (const body of this.physicsWorld.interactiveObjects) {
                const dist = body.position.distanceTo(hitPos);
                if (dist < minDst) {
                    minDst = dist;
                    closestBody = body;
                }
            }

            if (closestBody) {
                // Create constraint
                // Pivot on body is local point.
                const localPivot = new CANNON.Vec3();
                closestBody.pointToLocalFrame(hitPos, localPivot);
                
                // Pivot on player? No, we want to drag it.
                // We create a kinematic body at the hold position and constrain to that.
                // Or just use a PointToPoint constraint between player and object?
                // Let's use a "MousePicker" style constraint (Body to World Point).
                // But we are moving.
                // Let's constrain it to the player body at a fixed offset?
                // No, that's rigid.
                // Let's use a Spring or P2P to a point in front of the camera.
                
                this.grabbedBody = closestBody;
                
                // Create a dummy body for the "hand"
                this.handBody = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, position: hitPos });
                this.handBody.collisionFilterGroup = 0;
                this.physicsWorld.world.addBody(this.handBody);

                this.grabConstraint = new CANNON.PointToPointConstraint(
                    this.handBody, new CANNON.Vec3(0,0,0),
                    closestBody, localPivot
                );
                this.physicsWorld.world.addConstraint(this.grabConstraint);
                
                // Calculate offset from camera
                this.grabOffset = hit.distance;
                return; // Grabbed one
            }
        }
    }

    releaseGrab() {
        if (this.grabConstraint) {
            this.physicsWorld.world.removeConstraint(this.grabConstraint);
            this.physicsWorld.world.removeBody(this.handBody);
            this.grabConstraint = null;
            this.handBody = null;
            this.grabbedBody = null;
        }
    }

    onKey(e, pressed) {
        switch(e.key.toLowerCase()) {
            case 'w': this.input.w = pressed; break;
            case 'a': this.input.a = pressed; break;
            case 's': this.input.s = pressed; break;
            case 'd': this.input.d = pressed; break;
            case ' ': this.input.space = pressed; break;
            case 'shift': this.input.shift = pressed; break;
            case 'f': if (pressed) this.toggleFly(); break;
        }
    }

    onMouseMove(e) {
        if (document.pointerLockElement !== this.domElement) return;
        
        this.yaw -= e.movementX * Config.player.sensitivity;
        this.pitch -= e.movementY * Config.player.sensitivity;

        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }

    toggleFly() {
        this.isFlying = !this.isFlying;
        this.body.velocity.set(0, 0, 0);
        if (this.isFlying) {
            this.body.mass = 0; // Kinematic-ish behavior
            this.body.type = CANNON.Body.KINEMATIC;
            this.body.collisionFilterGroup = 0; // No collisions while flying
        } else {
            this.body.mass = 1;
            this.body.type = CANNON.Body.DYNAMIC;
            this.body.collisionFilterGroup = 1;
        }
        this.body.updateMassProperties();
    }

    get position() {
        return this.body.position;
    }

    update(dt) {
        // 1. Calculate Gravity / Up Vector
        const gravityVec = this.physicsWorld.getGravityAt(this.body.position);
        this.currentGravity.copy(gravityVec);

        let up = new THREE.Vector3(0, 1, 0);
        if (!this.isFlying && gravityVec.length() > 0.001) {
            // Gravity points down, so Up is opposite
            up.copy(gravityVec).normalize().negate();
            
            // Apply gravity force manually since we disabled global gravity
            this.body.applyForce(gravityVec, this.body.position);
        }

        // 2. Orient Player to Up Vector
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        
        // Smoothly interpolate alignment
        this.rotationContainer.quaternion.slerp(targetQuaternion, 0.1);

        // 3. Apply Mouse Rotation (Yaw/Pitch)
        // We apply Yaw to the container's local Y, and Pitch to the camera's local X
        // Actually, to keep it simple:
        // The rotationContainer aligns with the planet.
        // Inside it, we have a "YawObject" and inside that "PitchObject" (Camera).
        
        // Re-construct camera rotation
        const qYaw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        const qPitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        
        // Combine: Container * Yaw * Pitch
        // But we can't just set rotationContainer's rotation because it's being slerped.
        // So we apply Yaw/Pitch to the camera relative to the container.
        
        this.camera.quaternion.copy(qYaw).multiply(qPitch);


        // 4. Movement
        const speed = this.isFlying ? Config.player.flySpeed : Config.player.speed;
        const moveDir = new THREE.Vector3();

        if (this.input.w) moveDir.z -= 1;
        if (this.input.s) moveDir.z += 1;
        if (this.input.a) moveDir.x -= 1;
        if (this.input.d) moveDir.x += 1;

        if (moveDir.length() > 0) moveDir.normalize();

        // Transform moveDir by Camera's Yaw (but not pitch, unless flying)
        const cameraDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        // Flatten to local horizontal plane if walking
        if (!this.isFlying) {
            cameraDir.y = 0; cameraDir.normalize();
            cameraRight.y = 0; cameraRight.normalize();
        }

        const finalMove = new THREE.Vector3();
        if (this.input.w) finalMove.add(cameraDir);
        if (this.input.s) finalMove.sub(cameraDir);
        if (this.input.d) finalMove.add(cameraRight);
        if (this.input.a) finalMove.sub(cameraRight);
        
        if (finalMove.length() > 0) finalMove.normalize().multiplyScalar(speed);

        if (this.isFlying) {
            // Vertical movement
            if (this.input.space) finalMove.y += speed;
            if (this.input.shift) finalMove.y -= speed;
            
            // Apply to body (Kinematic)
            // We need to transform finalMove from "Camera Local" to "World"
            // The cameraDir/Right calculations above were in "Container Local" space? 
            // No, applyQuaternion uses the camera's local rotation.
            // Wait, camera is child of rotationContainer.
            
            // Let's simplify:
            // Get Camera's World Direction
            const worldDir = new THREE.Vector3();
            this.camera.getWorldDirection(worldDir);
            const worldRight = new THREE.Vector3().crossVectors(worldDir, up).normalize(); // Approximate right
            
            const flyMove = new THREE.Vector3();
            if (this.input.w) flyMove.add(worldDir);
            if (this.input.s) flyMove.sub(worldDir);
            if (this.input.d) flyMove.add(worldRight);
            if (this.input.a) flyMove.sub(worldRight);
            if (this.input.space) flyMove.add(up); // Up relative to planet
            if (this.input.shift) flyMove.sub(up);

            if (flyMove.length() > 0) flyMove.normalize().multiplyScalar(speed);
            
            this.body.position.x += flyMove.x * dt;
            this.body.position.y += flyMove.y * dt;
            this.body.position.z += flyMove.z * dt;
            this.body.velocity.set(0,0,0);

        } else {
            // Walking Physics
            // We apply velocity to the body, but we need to respect the current velocity (gravity)
            // We only want to control horizontal velocity.
            
            // Transform finalMove (which is in Container Space) to World Space
            finalMove.applyQuaternion(this.rotationContainer.quaternion);

            // Jump
            if (this.input.space) {
                // Check if grounded (simple check: distance to center approx radius)
                // Or raycast. For now, just allow jump if close to a planet.
                if (gravityVec.length() > 0.1) {
                     // Add jump impulse along Up vector
                     const jumpImpulse = up.clone().multiplyScalar(Config.player.jumpForce);
                     this.body.velocity.x += jumpImpulse.x * dt; // Impulse is force * time? No, impulse is instant change in momentum.
                     // Cannon applyImpulse takes (impulse, worldPoint)
                     // But here we are manipulating velocity directly for responsiveness
                     // Let's just add to velocity if we haven't jumped recently (debounce needed in real game)
                     // For simplicity, just add upward velocity
                     this.body.velocity.vadd(new CANNON.Vec3(jumpImpulse.x, jumpImpulse.y, jumpImpulse.z), this.body.velocity);
                     this.input.space = false; // Consume input
                }
            }

            // Apply horizontal movement
            // This is tricky with physics. We want to set velocity, but preserve falling.
            // Let's use a simple approach: Apply Force to reach target velocity?
            // Or just set X/Z velocity in the local frame?
            
            // Let's try setting velocity directly, but keeping the component along the gravity vector.
            const currentVel = new THREE.Vector3(this.body.velocity.x, this.body.velocity.y, this.body.velocity.z);
            const verticalVel = currentVel.projectOnVector(up);
            
            const targetVel = finalMove.add(verticalVel);
            
            // Softly interpolate to target velocity to allow some physics sliding
            this.body.velocity.x = THREE.MathUtils.lerp(this.body.velocity.x, targetVel.x, 0.1);
            this.body.velocity.y = THREE.MathUtils.lerp(this.body.velocity.y, targetVel.y, 0.1);
            this.body.velocity.z = THREE.MathUtils.lerp(this.body.velocity.z, targetVel.z, 0.1);
        }

        // Sync Camera Position
        this.rotationContainer.position.copy(this.body.position);
        // Offset camera for head height (in local Y of container)
        this.camera.position.set(0, Config.player.height / 2, 0);

        // Update Grab
        if (this.grabConstraint && this.handBody) {
            const rayDir = new THREE.Vector3();
            this.camera.getWorldDirection(rayDir);
            rayDir.normalize();
            
            const handPos = new THREE.Vector3();
            this.camera.getWorldPosition(handPos);
            handPos.add(rayDir.multiplyScalar(this.grabOffset));
            
            this.handBody.position.set(handPos.x, handPos.y, handPos.z);
        }
    }
}
