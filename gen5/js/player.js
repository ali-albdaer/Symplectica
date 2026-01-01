import * as THREE from 'three';
import { CONFIG } from './config.js';

export class PlayerController {
    constructor(camera, domElement, physicsWorld, bodyManager) {
        this.camera = camera;
        this.domElement = domElement;
        this.physicsWorld = physicsWorld;
        this.bodyManager = bodyManager;

        this.isLocked = false;
        this.isFreeFlight = false;
        this.isThirdPerson = false; // Default 1st person

        // Physics state
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.radius = 1; // Player collider radius
        this.height = CONFIG.player.height;
        this.isGrounded = false;
        this.groundNormal = new THREE.Vector3(0, 1, 0);

        // Camera state
        this.cameraOffset = new THREE.Vector3(0, 0, 0);
        this.thirdPersonDistance = 5;
        this.pitch = 0;
        this.yaw = 0;

        // Input state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false; // Space in free flight
        this.moveDown = false; // Shift in free flight
        this.jump = false;

        // Helper objects
        this.dummyCamera = new THREE.Object3D();
        this.playerMesh = null;

        this.init();
    }

    init() {
        // Create player mesh (simple capsule/box)
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.playerMesh = new THREE.Mesh(geometry, material);
        this.playerMesh.castShadow = true;
        // Hide mesh in 1st person? Yes, usually.
        this.playerMesh.visible = false; 
        
        // Add to physics world
        const rb = {
            isPlayer: true,
            radius: this.radius,
            position: this.position,
            velocity: this.velocity,
            mesh: this.playerMesh,
            isFreeFlight: false
        };
        this.physicsWorld.addRigidBody(rb);
        this.rb = rb;

        // Spawn on Planet 1
        this.spawn();

        // Event listeners
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        this.domElement.addEventListener('click', () => {
            if (!this.isLocked) this.domElement.requestPointerLock();
        });
    }

    spawn() {
        const planet = this.bodyManager.getBody(CONFIG.player.startBody);
        if (planet) {
            // Spawn on surface + a bit
            const spawnDir = new THREE.Vector3(1, 0, 0).normalize(); // Arbitrary point on equator
            const spawnPos = spawnDir.multiplyScalar(planet.radius + this.height + 2).add(planet.position);
            
            this.position.copy(spawnPos);
            this.velocity.set(0, 0, 0);
            
            // Inherit planet velocity?
            // For now, let's just set position. The physics engine will pull us down.
            // Ideally we should match planet velocity if it's moving fast.
            this.velocity.copy(planet.velocity);
        }
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyD': this.moveRight = true; break;
            case 'Space': 
                if (this.isFreeFlight) this.moveUp = true;
                else if (this.rb.isGrounded) this.jump = true;
                break;
            case 'ShiftLeft': 
                if (this.isFreeFlight) this.moveDown = true;
                break;
            case 'Insert': 
                this.toggleFreeFlight(); 
                break;
            case 'KeyV': // Toggle view
                this.toggleView();
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyD': this.moveRight = false; break;
            case 'Space': 
                this.moveUp = false; 
                this.jump = false;
                break;
            case 'ShiftLeft': this.moveDown = false; break;
        }
    }

    onMouseMove(e) {
        if (!this.isLocked) return;

        const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
        const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

        this.yaw -= movementX * CONFIG.player.sensitivity;
        this.pitch -= movementY * CONFIG.player.sensitivity;

        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
    }

    onPointerLockChange() {
        this.isLocked = document.pointerLockElement === this.domElement;
    }

    toggleFreeFlight() {
        this.isFreeFlight = !this.isFreeFlight;
        this.rb.isFreeFlight = this.isFreeFlight;
        if (this.isFreeFlight) {
            this.velocity.set(0, 0, 0); // Stop momentum
        }
    }

    toggleView() {
        this.isThirdPerson = !this.isThirdPerson;
        this.playerMesh.visible = this.isThirdPerson;
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.style.display = this.isThirdPerson ? 'none' : 'block';
    }

    update(dt) {
        // 1. Determine "Up" vector
        let up = new THREE.Vector3(0, 1, 0);
        
        if (!this.isFreeFlight) {
            // Find closest planet to define "Up"
            let closestDist = Infinity;
            let closestPlanet = null;
            
            // We can use the physics world bodies
            for (const body of this.physicsWorld.bodies) {
                const dist = this.position.distanceTo(body.position);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestPlanet = body;
                }
            }

            if (closestPlanet) {
                up.subVectors(this.position, closestPlanet.position).normalize();
            }
        } else {
            // In free flight, up is global Y or camera up? 
            // Let's keep global Y for simplicity or camera local up.
            // Actually, free flight usually means 6DOF.
            // For now, let's stick to a stable up vector or just use the camera's orientation.
            up.set(0, 1, 0);
        }

        // 2. Orient Player Mesh
        // We want the player to stand on the surface.
        // Quaternion from (0,1,0) to 'up'
        const targetQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
        this.playerMesh.quaternion.slerp(targetQ, 0.1); // Smooth align

        // 3. Handle Movement
        const speed = this.isFreeFlight ? CONFIG.player.speed * 5 : CONFIG.player.speed;
        const moveDir = new THREE.Vector3();

        if (this.moveForward) moveDir.z -= 1;
        if (this.moveBackward) moveDir.z += 1;
        if (this.moveLeft) moveDir.x -= 1;
        if (this.moveRight) moveDir.x += 1;

        if (this.isFreeFlight) {
            if (this.moveUp) moveDir.y += 1;
            if (this.moveDown) moveDir.y -= 1;
            
            // Transform moveDir by camera rotation
            moveDir.applyQuaternion(this.camera.quaternion);
            moveDir.normalize().multiplyScalar(speed * dt);
            
            this.position.add(moveDir);
            this.velocity.set(0, 0, 0); // No physics in free flight
        } else {
            // Walking
            // We need to move relative to the camera's view, but projected onto the tangent plane.
            
            // Get camera forward vector
            const camForward = new THREE.Vector3();
            this.camera.getWorldDirection(camForward);
            
            // Project onto tangent plane (remove 'up' component)
            camForward.projectOnPlane(up).normalize();
            
            // Get camera right vector
            const camRight = new THREE.Vector3();
            camRight.crossVectors(camForward, up).normalize(); // Left actually?
            // Standard: Forward x Up = Right? No. Right x Up = Forward?
            // Let's just use cross product.
            // If camForward is Z-, Up is Y+. Right is X+.
            // Z- x Y+ = X+. Correct.
            
            const intendedMove = new THREE.Vector3();
            if (this.moveForward) intendedMove.add(camForward);
            if (this.moveBackward) intendedMove.sub(camForward);
            if (this.moveRight) intendedMove.add(camRight);
            if (this.moveLeft) intendedMove.sub(camRight);
            
            if (intendedMove.lengthSq() > 0) {
                intendedMove.normalize().multiplyScalar(speed);
                
                // Apply to velocity (instant acceleration for responsiveness, or smooth?)
                // Let's just set horizontal velocity directly for tight controls
                // But we must preserve vertical velocity (gravity/jump)
                
                // Current velocity projected on up
                const vDotUp = this.velocity.dot(up);
                const vertVel = up.clone().multiplyScalar(vDotUp);
                
                this.velocity.copy(vertVel).add(intendedMove);
            } else {
                // Dampen horizontal velocity
                const vDotUp = this.velocity.dot(up);
                const vertVel = up.clone().multiplyScalar(vDotUp);
                // Lerp horizontal to 0
                this.velocity.lerp(vertVel, 0.1);
            }

            // Jump
            if (this.jump && this.rb.isGrounded) {
                this.velocity.add(up.clone().multiplyScalar(CONFIG.player.jumpForce));
                this.jump = false;
                this.rb.isGrounded = false; // Prevent double jump immediately
            }
        }

        // 4. Update Camera
        // Position camera relative to player
        if (this.isThirdPerson) {
            // Orbit camera
            // We need a local coordinate system for the camera based on 'up'
            
            // Calculate camera position based on yaw/pitch
            // We want yaw to rotate around 'up'
            // Pitch to rotate up/down
            
            // Basis vectors
            // We can use the player's quaternion to establish a local frame?
            // Or just construct it.
            
            // Let's use spherical coordinates relative to the "Up" vector
            // But "Up" changes.
            
            // Easier:
            // 1. Place camera at player position.
            // 2. Rotate by global orientation (aligned to up).
            // 3. Rotate by local yaw/pitch.
            // 4. Move back by distance.
            
            this.dummyCamera.position.copy(this.position);
            this.dummyCamera.quaternion.copy(targetQ); // Aligned with planet surface
            
            this.dummyCamera.rotateY(this.yaw);
            this.dummyCamera.rotateX(this.pitch);
            
            this.dummyCamera.translateZ(this.thirdPersonDistance);
            
            // Smooth camera follow
            this.camera.position.lerp(this.dummyCamera.position, 0.1);
            this.camera.quaternion.slerp(this.dummyCamera.quaternion, 0.1);
            
        } else {
            // First person
            // Camera at player position + eye height
            const eyePos = this.position.clone().add(up.clone().multiplyScalar(this.height * 0.9));
            this.camera.position.copy(eyePos);
            
            // Orientation
            this.camera.quaternion.copy(targetQ);
            this.camera.rotateY(this.yaw);
            this.camera.rotateX(this.pitch);
        }
    }
}
