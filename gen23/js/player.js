class Player {
    constructor(scene, camera, physicsEngine, inputManager) {
        this.scene = scene;
        this.camera = camera;
        this.physicsEngine = physicsEngine;
        this.input = inputManager;

        this.mass = 1; // Player mass
        this.height = 2;
        this.moveSpeed = 10;
        this.jumpForce = 15;
        this.flySpeed = 50;
        
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        this.isFlying = false;
        this.isGrounded = false;
        this.groundNormal = new THREE.Vector3(0, 1, 0);
        
        // Camera control
        this.pitch = 0;
        this.yaw = 0;
        
        // Interaction
        this.heldObject = null;
        this.raycaster = new THREE.Raycaster();
        
        // Visual debug (optional)
        // this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));
        // scene.add(this.mesh);

        // Register with physics
        this.physicsEngine.addBody(this);
        
        // Third person
        this.isThirdPerson = false;
        this.cameraOffset = new THREE.Vector3(0, 2, 5);
    }

    spawn(planet) {
        // Spawn on surface of planet
        const spawnDir = new THREE.Vector3(1, 0, 0).normalize();
        this.position.copy(planet.position).add(spawnDir.multiplyScalar(planet.radius + this.height + 1));
        this.velocity.copy(planet.velocity); // Match orbital velocity initially
        
        // Align view
        this.groundNormal.copy(spawnDir);
    }

    update(dt) {
        this.handleInput(dt);
        this.updateCamera();
        this.checkGroundCollision();
        this.handleInteraction();
    }

    handleInput(dt) {
        // Toggle Fly Mode
        if (this.input.keys['KeyF'] && !this.lastF) {
            this.isFlying = !this.isFlying;
            this.velocity.set(0,0,0); // Reset velocity when switching
        }
        this.lastF = this.input.keys['KeyF'];

        // Toggle Camera Mode
        if (this.input.keys['KeyV'] && !this.lastV) {
            this.isThirdPerson = !this.isThirdPerson;
        }
        this.lastV = this.input.keys['KeyV'];

        // Mouse Look
        const sensitivity = 0.002;
        this.yaw -= this.input.mouse.dx * sensitivity;
        this.pitch -= this.input.mouse.dy * sensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        // Movement
        const moveDir = new THREE.Vector3();
        if (this.input.keys['KeyW']) moveDir.z -= 1;
        if (this.input.keys['KeyS']) moveDir.z += 1;
        if (this.input.keys['KeyA']) moveDir.x -= 1;
        if (this.input.keys['KeyD']) moveDir.x += 1;

        if (this.isFlying) {
            // Fly Mode
            if (this.input.keys['Space']) moveDir.y += 1;
            if (this.input.keys['ShiftLeft']) moveDir.y -= 1;
            
            const rotation = new THREE.Quaternion();
            rotation.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
            moveDir.applyQuaternion(rotation);
            
            this.velocity.copy(moveDir.multiplyScalar(this.flySpeed));
            this.acceleration.set(0,0,0); // No gravity in fly mode (manual override)
        } else {
            // Walk Mode
            // Calculate local coordinate frame based on ground normal
            const up = this.groundNormal.clone();
            const right = new THREE.Vector3().crossVectors(up, this.camera.getWorldDirection(new THREE.Vector3())).normalize();
            // Recalculate forward to be tangent to surface
            const forward = new THREE.Vector3().crossVectors(right, up).normalize();
            
            // Apply movement force
            const moveForce = new THREE.Vector3();
            moveForce.add(forward.multiplyScalar(-moveDir.z));
            moveForce.add(right.multiplyScalar(moveDir.x));
            moveForce.normalize().multiplyScalar(this.moveSpeed * 10); // Force multiplier
            
            // Apply to velocity (simple impulse for responsiveness)
            if (moveDir.lengthSq() > 0) {
                this.velocity.add(moveForce.multiplyScalar(dt));
            }
            
            // Damping (friction)
            const damping = 5.0;
            const velTangent = this.velocity.clone().projectOnPlane(up);
            this.velocity.sub(velTangent.multiplyScalar(damping * dt));

            // Jump
            if (this.input.keys['Space'] && this.isGrounded) {
                this.velocity.add(up.multiplyScalar(this.jumpForce));
                this.isGrounded = false;
            }
        }
    }

    checkGroundCollision() {
        if (this.isFlying) return;

        let nearestDist = Infinity;
        let nearestBody = null;

        // Find nearest planet
        for (const body of this.physicsEngine.bodies) {
            if (body === this || body instanceof Prop) continue; // Ignore self and props
            
            const dist = this.position.distanceTo(body.position);
            const surfaceDist = dist - body.radius;
            
            if (surfaceDist < nearestDist) {
                nearestDist = surfaceDist;
                nearestBody = body;
            }
        }

        if (nearestBody) {
            const toPlayer = new THREE.Vector3().subVectors(this.position, nearestBody.position).normalize();
            this.groundNormal.copy(toPlayer);
            
            // Simple collision constraint
            if (nearestDist < this.height) {
                this.isGrounded = true;
                // Project out
                const penetration = this.height - nearestDist;
                this.position.add(toPlayer.multiplyScalar(penetration));
                
                // Cancel normal velocity
                const velNormal = this.velocity.dot(toPlayer);
                if (velNormal < 0) {
                    this.velocity.sub(toPlayer.multiplyScalar(velNormal));
                }
                
                // Friction with moving platform (planet rotation/orbit)
                // Ideally we add the planet's velocity to the player if they are "stuck" to it
                // But since we are in a vacuum, we just need to match the orbital velocity initially.
                // Friction is handled in handleInput by damping relative to "stopped".
                // Actually, we should damp relative to the planet surface velocity.
                // For now, simple damping in world space is "okay" if planets move slowly, 
                // but for accurate physics we should damp relative to `nearestBody.velocity`.
                
                const relVel = this.velocity.clone().sub(nearestBody.velocity);
                const relVelTangent = relVel.clone().projectOnPlane(toPlayer);
                // Apply friction to this relative tangent velocity
                this.velocity.sub(relVelTangent.multiplyScalar(2.0 * window.Config.physics.dt));
            } else {
                this.isGrounded = false;
            }
        }
    }

    updateCamera() {
        // Position camera
        if (this.isThirdPerson) {
            // Smooth follow
            // Calculate desired camera position
            // We want the camera behind the player relative to the look direction
            
            // Construct rotation from pitch/yaw relative to ground normal
            // This is tricky. Let's just use a simple "LookAt" approach.
            
            // Basis vectors
            const up = this.isFlying ? new THREE.Vector3(0,1,0) : this.groundNormal;
            
            // We need a stable "forward" reference. 
            // Let's maintain a quaternion for the player's orientation.
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), up);
            const lookQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.yaw, 0));
            const finalQ = q.multiply(lookQ);
            
            const offset = this.cameraOffset.clone().applyQuaternion(finalQ);
            const targetPos = this.position.clone().add(offset);
            
            this.camera.position.lerp(targetPos, 0.1);
            this.camera.lookAt(this.position);
            
        } else {
            // First person
            this.camera.position.copy(this.position).add(this.groundNormal.clone().multiplyScalar(this.height * 0.4)); // Eye level
            
            // Orientation
            // Up is groundNormal
            // Forward is determined by yaw/pitch
            
            const up = this.isFlying ? new THREE.Vector3(0,1,0) : this.groundNormal;
            
            // Create a basis
            // We need a "forward" that isn't parallel to "up".
            // Use a temporary global up (0,1,0) or (0,0,1) to generate a right vector
            let tempUp = new THREE.Vector3(0,1,0);
            if (Math.abs(up.dot(tempUp)) > 0.99) tempUp = new THREE.Vector3(0,0,1);
            
            const right = new THREE.Vector3().crossVectors(tempUp, up).normalize();
            const forward = new THREE.Vector3().crossVectors(up, right).normalize();
            
            // Now rotate this basis by yaw around up
            const qYaw = new THREE.Quaternion().setFromAxisAngle(up, this.yaw);
            const finalForward = forward.clone().applyQuaternion(qYaw);
            const finalRight = right.clone().applyQuaternion(qYaw);
            
            // Now rotate by pitch around right
            const qPitch = new THREE.Quaternion().setFromAxisAngle(finalRight, this.pitch);
            const lookDir = finalForward.clone().applyQuaternion(qPitch);
            
            this.camera.up.copy(up);
            this.camera.lookAt(this.camera.position.clone().add(lookDir));
        }
    }

    handleInteraction() {
        if (this.input.mouse.right) {
            if (!this.heldObject) {
                // Try to grab
                this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children);
                
                for (const hit of intersects) {
                    // Find the object in physics engine
                    const body = this.physicsEngine.bodies.find(b => b.mesh === hit.object);
                    if (body && body instanceof Prop && hit.distance < 10) {
                        this.heldObject = body;
                        break;
                    }
                }
            }
        } else {
            this.heldObject = null;
        }

        if (this.heldObject) {
            // Move object to hold position
            const holdPos = this.camera.position.clone().add(this.camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(5));
            
            // Spring force to hold position
            const force = holdPos.sub(this.heldObject.position).multiplyScalar(50); // Spring constant
            // Damping
            force.sub(this.heldObject.velocity.clone().multiplyScalar(2));
            
            this.heldObject.acceleration.add(force.divideScalar(this.heldObject.mass));
        }
    }
}

window.Player = Player;
