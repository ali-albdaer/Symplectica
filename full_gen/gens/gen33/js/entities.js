import * as THREE from 'three';
import { Config } from './config.js';

export class Entity {
    constructor(name, mass, radius, position, velocity, color) {
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.position = new THREE.Vector3(position.x, position.y, position.z);
        this.velocity = new THREE.Vector3(velocity.x, velocity.y, velocity.z);
        this.force = new THREE.Vector3();
        this.color = color;
        this.isStatic = false;
        this.mesh = null;
        this.type = 'entity';
    }

    update(dt) {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }
}

export class CelestialBody extends Entity {
    constructor(config) {
        super(config.name, config.mass, config.radius, config.position || {x:0,y:0,z:0}, config.velocity || {x:0,y:0,z:0}, config.color);
        this.type = config.type || 'planet';
        this.emissive = config.emissive || 0x000000;
        this.rotationSpeed = config.rotationSpeed || 0;
        
        // Create Mesh
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: this.color,
            emissive: this.emissive,
            emissiveIntensity: this.type === 'star' ? 1 : 0,
            roughness: 0.8,
            metalness: 0.2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = this.type !== 'star'; // Stars don't cast shadows, they emit light
        this.mesh.receiveShadow = this.type !== 'star';
        this.mesh.userData = { entity: this };
        
        if (this.type === 'star') {
            // Add point light for the sun
            const light = new THREE.PointLight(0xffffff, 2, 0, 0); // Infinite range, no decay for simplicity or adjust
            light.intensity = 1000; // High intensity for space
            light.castShadow = Config.graphics.shadows;
            light.shadow.mapSize.width = Config.graphics.shadowMapSize;
            light.shadow.mapSize.height = Config.graphics.shadowMapSize;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 5000;
            this.mesh.add(light);
        }
    }

    update(dt) {
        super.update(dt);
        if (this.mesh) {
            this.mesh.rotation.y += this.rotationSpeed * dt;
        }
    }
}

export class Player extends Entity {
    constructor(startPos, physicsEngine) {
        super("Player", Config.player.mass, 0.5, startPos, {x:0,y:0,z:0}, 0xffffff);
        this.physicsEngine = physicsEngine;
        this.height = Config.player.height;
        this.cameraOffset = new THREE.Vector3(0, this.height * 0.9, 0);
        
        // Player is a capsule visually (or just a camera in FPS)
        // We'll make a simple mesh for 3rd person
        const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData = { entity: this };
        
        // Camera rig
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.cameraMode = 'first'; // 'first' or 'third'
        this.yaw = 0;
        this.pitch = 0;
        
        this.isGrounded = false;
        this.groundBody = null;
        this.flyMode = false;
        
        // Orientation
        this.up = new THREE.Vector3(0, 1, 0);
        this.forward = new THREE.Vector3(0, 0, -1);
        this.right = new THREE.Vector3(1, 0, 0);
    }

    update(dt, input) {
        // 1. Determine "Up" vector (opposite to gravity)
        const gravityVec = this.physicsEngine.getGravityAt(this.position, this);
        const gravityLen = gravityVec.length();
        
        if (gravityLen > 0.00001) {
            this.up.copy(gravityVec).normalize().negate();
        }

        // 2. Handle Input & Movement
        this.handleMovement(dt, input);

        // 3. Update Camera
        this.updateCamera();
        
        // 4. Sync Mesh
        this.mesh.position.copy(this.position);
        
        // Align mesh to Up vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.up);
        // We also need to apply yaw rotation around the up vector
        const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.mesh.quaternion.multiplyQuaternions(quaternion, yawQ);
    }

    handleMovement(dt, input) {
        // Calculate local forward/right vectors based on Up and Yaw
        const dummyUp = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(dummyUp, this.up);
        
        // Local directions
        const forwardLocal = new THREE.Vector3(0, 0, -1).applyAxisAngle(dummyUp, this.yaw).applyQuaternion(q);
        const rightLocal = new THREE.Vector3(1, 0, 0).applyAxisAngle(dummyUp, this.yaw).applyQuaternion(q);
        const upLocal = this.up.clone();

        const speed = this.flyMode ? Config.player.flySpeed : Config.player.speed;
        const moveDir = new THREE.Vector3();

        if (input.keys['KeyW']) moveDir.add(forwardLocal);
        if (input.keys['KeyS']) moveDir.sub(forwardLocal);
        if (input.keys['KeyD']) moveDir.add(rightLocal);
        if (input.keys['KeyA']) moveDir.sub(rightLocal);
        
        if (this.flyMode) {
            if (input.keys['Space']) moveDir.add(upLocal);
            if (input.keys['ShiftLeft']) moveDir.sub(upLocal);
        }

        if (moveDir.lengthSq() > 0) {
            moveDir.normalize().multiplyScalar(speed);
            
            if (this.flyMode) {
                this.velocity.copy(moveDir);
            } else {
                // In walk mode, we only control horizontal velocity
                // Preserve vertical velocity (gravity/jumping)
                const velDotUp = this.velocity.dot(this.up);
                const vertVel = this.up.clone().multiplyScalar(velDotUp);
                
                // Apply movement to horizontal component
                this.velocity.sub(vertVel).add(moveDir).add(vertVel);
            }
        } else {
            if (this.flyMode) {
                this.velocity.set(0, 0, 0);
            } else if (this.isGrounded) {
                // Friction/Stop when grounded and no input
                const velDotUp = this.velocity.dot(this.up);
                const vertVel = this.up.clone().multiplyScalar(velDotUp);
                this.velocity.copy(vertVel);
            }
        }

        // Jumping
        if (input.keys['Space'] && this.isGrounded && !this.flyMode) {
            this.velocity.add(this.up.clone().multiplyScalar(Config.player.jumpForce));
            this.isGrounded = false;
        }

        // Toggle Fly Mode
        if (input.keys['KeyF'] && !input.prevKeys['KeyF']) {
            this.flyMode = !this.flyMode;
            this.velocity.set(0, 0, 0);
        }
        
        // Toggle Camera Mode
        if (input.keys['KeyV'] && !input.prevKeys['KeyV']) {
            this.cameraMode = this.cameraMode === 'first' ? 'third' : 'first';
            this.mesh.visible = this.cameraMode === 'third';
        }

        // Mouse Look
        this.yaw -= input.mouseDelta.x * Config.player.mouseSensitivity;
        this.pitch -= input.mouseDelta.y * Config.player.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
        
        // Reset mouse delta
        input.mouseDelta.set(0, 0);
    }

    updateCamera() {
        // Position camera
        const camPos = this.position.clone();
        
        // Align camera orientation
        const dummyUp = new THREE.Vector3(0, 1, 0);
        const q = new THREE.Quaternion().setFromUnitVectors(dummyUp, this.up);
        
        // Apply Yaw (around local up)
        const yawQ = new THREE.Quaternion().setFromAxisAngle(dummyUp, this.yaw);
        // Apply Pitch (around local right)
        const pitchQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch);
        
        const finalQ = q.multiply(yawQ).multiply(pitchQ);
        this.camera.quaternion.copy(finalQ);

        if (this.cameraMode === 'first') {
            // Offset for eyes
            const eyeOffset = new THREE.Vector3(0, this.height * 0.9, 0).applyQuaternion(q); // Just align offset with up
            camPos.add(eyeOffset);
        } else {
            // Third person: behind and up
            const offset = new THREE.Vector3(0, 2, 5); // Local offset
            offset.applyQuaternion(finalQ); // Rotate offset by camera rotation
            camPos.add(offset);
        }
        
        this.camera.position.copy(camPos);
    }
}

export class InteractiveObject extends Entity {
    constructor(pos, physicsEngine) {
        super("Box", 0.1, 0.5, pos, {x:0,y:0,z:0}, 0xff00ff);
        this.physicsEngine = physicsEngine;
        
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData = { entity: this };
    }
}
