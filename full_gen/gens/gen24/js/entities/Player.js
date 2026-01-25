import * as THREE from 'three';
import { Body } from '../physics/Body.js';
import { Config } from '../config.js';
import { getGravityVector } from '../utils/MathUtils.js';

export class Player extends Body {
    constructor(scene, camera, physicsWorld) {
        super({
            mass: 70, // 70kg
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            name: "Player"
        });

        this.camera = camera;
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        
        this.height = Config.player.height;
        this.speed = Config.player.speed;
        this.jumpForce = Config.player.jumpForce;
        
        this.isGrounded = false;
        this.canJump = false;
        this.flyMode = false;
        this.thirdPerson = false;

        // Visual representation (capsule)
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Camera pivot for 3rd person
        this.cameraPivot = new THREE.Object3D();
        this.mesh.add(this.cameraPivot);
        this.cameraPivot.position.set(0, 0.5, 0); // Eye level

        // Internal state
        this.upVector = new THREE.Vector3(0, 1, 0);
        this.inputVector = new THREE.Vector3();
        this.yaw = 0;
        this.pitch = 0;
        
        this.heldObject = null;
        this.raycaster = new THREE.Raycaster();
    }

    spawnOn(body) {
        // Place player on surface of body
        const dir = new THREE.Vector3(1, 0, 0); // Arbitrary start
        const pos = body.position.clone().add(dir.multiplyScalar(body.radius + this.height));
        this.position.copy(pos);
        this.velocity.copy(body.velocity); // Match orbital velocity
        this.mesh.position.copy(this.position);
    }

    handleInput(input, dt, props = []) {
        this.inputVector.set(0, 0, 0);
        if (input.keys['w']) this.inputVector.z -= 1;
        if (input.keys['s']) this.inputVector.z += 1;
        if (input.keys['a']) this.inputVector.x -= 1;
        if (input.keys['d']) this.inputVector.x += 1;
        
        if (input.keys[' '] && this.canJump && !this.flyMode) {
            this.jump();
        }

        if (input.keys['f_pressed']) {
            this.flyMode = !this.flyMode;
            input.keys['f_pressed'] = false; // Consume event
        }

        if (input.keys['v_pressed']) {
            this.thirdPerson = !this.thirdPerson;
            input.keys['v_pressed'] = false;
        }

        // Interaction (Right Click)
        if (input.keys['right_click']) {
            if (!this.heldObject) {
                // Try to grab
                this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
                const intersects = this.raycaster.intersectObjects(props.map(p => p.mesh));
                
                if (intersects.length > 0 && intersects[0].distance < 5) {
                    const hitMesh = intersects[0].object;
                    // Find prop by mesh (hacky, better to store ref in userData)
                    // Actually I stored userData in CelestialBody, let's assume Prop does too?
                    // I didn't add userData to Prop. Let's fix Prop or just search.
                    // Searching is fine for 5 props.
                    this.heldObject = props.find(p => p.mesh === hitMesh);
                    if (this.heldObject) {
                        this.heldObject.isHeld = true;
                    }
                }
            }
        } else {
            // Release
            if (this.heldObject) {
                this.heldObject.isHeld = false;
                // Throw it slightly?
                const throwDir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion).normalize();
                this.heldObject.velocity.copy(this.velocity).add(throwDir.multiplyScalar(5));
                this.heldObject = null;
            }
        }

        // Update held object position
        if (this.heldObject) {
            const holdPos = this.camera.position.clone().add(
                new THREE.Vector3(0, 0, -2).applyQuaternion(this.camera.quaternion)
            );
            this.heldObject.position.copy(holdPos);
            this.heldObject.mesh.position.copy(holdPos);
            this.heldObject.velocity.copy(this.velocity); // Keep velocity synced so it doesn't fly away on release
        }

        // Mouse look
        this.yaw -= input.mouseDelta.x * Config.player.mouseSensitivity;
        this.pitch -= input.mouseDelta.y * Config.player.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        input.mouseDelta.x = 0;
        input.mouseDelta.y = 0;
    }

    jump() {
        const jumpVec = this.upVector.clone().multiplyScalar(this.jumpForce);
        this.velocity.add(jumpVec);
        this.isGrounded = false;
        this.canJump = false;
    }

    update(dt, bodies) {
        // 1. Calculate Gravity & Up Vector
        const gravityInfo = getGravityVector(this.position, bodies, Config.physics.G);
        const gravityAccel = gravityInfo.vector; // This is acceleration
        
        if (!this.flyMode) {
            this.upVector.copy(gravityAccel).normalize().negate();
        } else {
            this.upVector.set(0, 1, 0); // Standard up in fly mode? Or keep local? Let's keep local up for now or just free fly.
            // Actually in free fly, up is just Y usually, but let's stick to camera orientation.
        }

        // 2. Orient Player Mesh to Up Vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.upVector);
        this.mesh.quaternion.slerp(quaternion, 0.1);

        // 3. Movement Logic
        if (this.flyMode) {
            this.velocity.set(0, 0, 0);
            const forward = new THREE.Vector3(0, 0, -1).applyEuler(this.camera.rotation);
            const right = new THREE.Vector3(1, 0, 0).applyEuler(this.camera.rotation);
            const up = new THREE.Vector3(0, 1, 0).applyEuler(this.camera.rotation);

            if (this.inputVector.z < 0) this.velocity.add(forward.multiplyScalar(this.speed * 2));
            if (this.inputVector.z > 0) this.velocity.add(forward.multiplyScalar(-this.speed * 2));
            if (this.inputVector.x < 0) this.velocity.add(right.multiplyScalar(-this.speed * 2));
            if (this.inputVector.x > 0) this.velocity.add(right.multiplyScalar(this.speed * 2));
            
            // Space/Shift for up/down in fly mode
            // We need access to raw keys here or map them in input vector. 
            // Let's assume input vector handles WASD, we need vertical.
            // For now, let's just use camera direction for forward/back.
            
            this.position.add(this.velocity.clone().multiplyScalar(dt));
            this.mesh.position.copy(this.position);

        } else {
            // Walking Physics
            
            // Apply Gravity
            this.velocity.add(gravityAccel.clone().multiplyScalar(dt));

            // Ground Collision
            let dominantBody = gravityInfo.dominantBody;
            if (dominantBody) {
                const dist = this.position.distanceTo(dominantBody.position);
                const surfaceDist = dominantBody.radius + this.height * 0.5; // Capsule half-height
                
                if (dist < surfaceDist) {
                    // Collision response: project out
                    const normal = new THREE.Vector3().subVectors(this.position, dominantBody.position).normalize();
                    this.position.copy(dominantBody.position).add(normal.multiplyScalar(surfaceDist));
                    
                    // Cancel velocity against normal
                    const velDotNormal = this.velocity.dot(normal);
                    if (velDotNormal < 0) {
                        this.velocity.sub(normal.multiplyScalar(velDotNormal));
                    }
                    
                    // Friction/Damping
                    const tangentVel = this.velocity.clone(); // Since we removed normal component
                    tangentVel.multiplyScalar(0.9); // Simple friction
                    this.velocity.copy(tangentVel);

                    // Add dominant body velocity (friction keeps us attached)
                    // Ideally we are in the same reference frame, but here we are in global.
                    // If we are on a moving planet, we need to inherit its velocity?
                    // Yes, but N-body physics handles velocity. 
                    // If we are "stopped" on surface, our velocity should match surface velocity.
                    // Surface velocity = Body Velocity + Rotation x Radius.
                    // For now, let's just assume we stick to it via friction.
                    
                    this.isGrounded = true;
                    this.canJump = true;
                } else {
                    this.isGrounded = false;
                }
            }

            // Apply Input Movement (Relative to Camera and Up Vector)
            if (this.inputVector.lengthSq() > 0) {
                // Get camera forward projected onto the plane defined by UpVector
                const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
                const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
                
                // Project onto tangent plane
                camForward.projectOnPlane(this.upVector).normalize();
                camRight.projectOnPlane(this.upVector).normalize();

                const moveDir = new THREE.Vector3();
                if (this.inputVector.z < 0) moveDir.add(camForward);
                if (this.inputVector.z > 0) moveDir.sub(camForward);
                if (this.inputVector.x < 0) moveDir.sub(camRight);
                if (this.inputVector.x > 0) moveDir.add(camRight);
                
                if (moveDir.lengthSq() > 0) {
                    moveDir.normalize();
                    // Direct velocity change for snappy movement
                    this.velocity.add(moveDir.multiplyScalar(this.speed * dt * 5)); 
                }
            }

            // Update Position
            this.position.add(this.velocity.clone().multiplyScalar(dt));
            this.mesh.position.copy(this.position);
        }

        // Update Camera
        this.updateCamera();
    }

    updateCamera() {
        if (this.thirdPerson) {
            // Orbit around player
            const offset = new THREE.Vector3(0, 2, 5);
            offset.applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
            offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            
            // Transform offset to be relative to player's local up
            // This is tricky. Simple way:
            // Just use the mesh rotation.
            offset.applyQuaternion(this.mesh.quaternion);

            const targetPos = this.mesh.position.clone().add(offset);
            this.camera.position.lerp(targetPos, 0.1);
            this.camera.lookAt(this.mesh.position);
        } else {
            // First person
            this.camera.position.copy(this.mesh.position).add(this.upVector.clone().multiplyScalar(0.4)); // Eyes
            
            // Rotation
            // We need to combine the Up-vector orientation with the mouse look
            // 1. Reset camera to look at -Z, Up Y
            this.camera.quaternion.copy(this.mesh.quaternion);
            
            // 2. Apply local pitch/yaw
            const lookQ = new THREE.Quaternion();
            lookQ.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
            this.camera.quaternion.multiply(lookQ);
        }
    }
}
