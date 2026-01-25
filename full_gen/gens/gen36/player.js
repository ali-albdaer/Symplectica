/**
 * Player Controller
 * Handles player movement, physics, and interaction
 */

class Player {
    constructor(scene, physicsEngine, celestialSystem) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.celestialSystem = celestialSystem;
        
        // Physics properties
        this.id = `player_${Math.random().toString(36).substr(2, 9)}`;
        this.name = 'Player';
        this.mass = CONFIG.PLAYER.mass;
        this.radius = CONFIG.PLAYER.radius;
        this.height = CONFIG.PLAYER.height;
        this.isCelestial = false;
        this.fixed = false;
        
        // Position and velocity
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        
        // Movement state
        this.isFlying = false;
        this.isOnGround = false;
        this.currentPlanet = null;
        
        // Movement parameters
        this.walkSpeed = CONFIG.PLAYER.walkSpeed;
        this.flySpeed = CONFIG.PLAYER.flySpeed;
        this.jumpForce = CONFIG.PLAYER.jumpForce;
        
        // Input state
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.jump = false;
        this.moveUp = false;
        this.moveDown = false;
        
        // Camera direction (will be set by camera system)
        this.cameraDirection = new THREE.Vector3(0, 0, -1);
        this.cameraRight = new THREE.Vector3(1, 0, 0);
        this.cameraUp = new THREE.Vector3(0, 1, 0);
        
        // Grabbed object
        this.grabbedObject = null;
        this.grabDistance = 3; // meters
        
        // Create visual representation
        this.createMesh();
        
        // Spawn player
        this.spawn();
        
        // Register with physics
        this.physicsEngine.addBody(this);
        
        // Setup input listeners
        this.setupInputListeners();
    }

    createMesh() {
        // Simple capsule representation (sphere + cylinder)
        const bodyGeometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height - 2 * this.radius,
            16
        );
        
        const headGeometry = new THREE.SphereGeometry(this.radius, 16, 16);
        
        const material = new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            roughness: 0.7,
            metalness: 0.3,
        });
        
        this.mesh = new THREE.Group();
        
        const body = new THREE.Mesh(bodyGeometry, material);
        const head = new THREE.Mesh(headGeometry, material);
        head.position.y = this.height / 2 - this.radius;
        
        this.mesh.add(body);
        this.mesh.add(head);
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.scene.add(this.mesh);
    }

    spawn() {
        // Spawn on Planet 1 surface
        const spawnPlanetName = CONFIG.PLAYER.spawnPlanet;
        const planet = this.celestialSystem.getCelestialBodyByName(spawnPlanetName);
        
        if (!planet) {
            console.error(`Spawn planet ${spawnPlanetName} not found!`);
            return;
        }
        
        this.currentPlanet = planet;
        
        // Spawn at equator (0° latitude, 0° longitude)
        const spawnAltitude = CONFIG.PLAYER.spawnAltitude;
        const spawnPos = planet.getSurfacePosition(0, 0, spawnAltitude);
        
        this.position.copy(spawnPos);
        
        // Initial velocity matches planet's velocity
        this.velocity.copy(planet.velocity);
        
        console.log(`Player spawned on ${planet.name} at altitude ${spawnAltitude}m`);
    }

    setupInputListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'Space': 
                    if (this.isFlying) {
                        this.moveUp = true;
                    } else {
                        this.jump = true;
                    }
                    e.preventDefault();
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    if (this.isFlying) {
                        this.moveDown = true;
                    }
                    break;
                case 'KeyF':
                    this.toggleFlyMode();
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'Space': 
                    this.jump = false;
                    this.moveUp = false;
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.moveDown = false;
                    break;
            }
        });
    }

    toggleFlyMode() {
        this.isFlying = !this.isFlying;
        console.log(`Fly mode: ${this.isFlying ? 'ON' : 'OFF'}`);
    }

    updateCameraVectors(direction, right, up) {
        this.cameraDirection.copy(direction);
        this.cameraRight.copy(right);
        this.cameraUp.copy(up);
    }

    update(dt) {
        // Check ground status
        this.checkGroundStatus();
        
        // Apply movement
        if (this.isFlying) {
            this.updateFlyingMovement(dt);
        } else {
            this.updateWalkingMovement(dt);
        }
        
        // Update mesh position
        this.mesh.position.set(
            this.position.x / 1e6,
            this.position.y / 1e6,
            this.position.z / 1e6
        );
        
        // Orient player to surface normal when on ground
        if (this.isOnGround && this.currentPlanet) {
            const surfaceNormal = this.physicsEngine.getSurfaceNormal(
                this.position,
                this.currentPlanet
            );
            
            // Align player "up" with surface normal
            const targetUp = surfaceNormal.clone();
            this.mesh.up.lerp(targetUp, 0.1);
            this.mesh.lookAt(
                this.mesh.position.x + this.cameraDirection.x,
                this.mesh.position.y + this.cameraDirection.y,
                this.mesh.position.z + this.cameraDirection.z
            );
        }
        
        // Update grabbed object
        if (this.grabbedObject) {
            this.updateGrabbedObject();
        }
    }

    checkGroundStatus() {
        // Find nearest celestial body
        const { body, distance } = this.physicsEngine.getNearestCelestialBody(this.position);
        
        if (!body) {
            this.isOnGround = false;
            this.currentPlanet = null;
            return;
        }
        
        this.currentPlanet = body;
        
        // Check if on surface
        const surfaceDistance = distance - body.radius;
        const groundThreshold = 2.0; // meters
        
        this.isOnGround = surfaceDistance < groundThreshold && !this.isFlying;
        
        // Snap to surface if very close
        if (this.isOnGround && surfaceDistance < 0.5) {
            const surfaceNormal = this.physicsEngine.getSurfaceNormal(this.position, body);
            const targetDistance = body.radius + 0.1;
            
            this.position.copy(body.position);
            this.position.addScaledVector(surfaceNormal, targetDistance);
            
            // Cancel downward velocity
            const normalVel = this.velocity.dot(surfaceNormal);
            if (normalVel < 0) {
                this.velocity.addScaledVector(surfaceNormal, -normalVel);
            }
        }
    }

    updateWalkingMovement(dt) {
        if (!this.currentPlanet) return;
        
        const surfaceNormal = this.physicsEngine.getSurfaceNormal(
            this.position,
            this.currentPlanet
        );
        
        // Calculate movement direction on surface
        const moveDir = new THREE.Vector3();
        
        if (this.moveForward) {
            moveDir.add(this.cameraDirection);
        }
        if (this.moveBackward) {
            moveDir.sub(this.cameraDirection);
        }
        if (this.moveLeft) {
            moveDir.sub(this.cameraRight);
        }
        if (this.moveRight) {
            moveDir.add(this.cameraRight);
        }
        
        // Project movement onto surface plane
        moveDir.addScaledVector(surfaceNormal, -moveDir.dot(surfaceNormal));
        
        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            
            // Apply movement
            const speed = this.walkSpeed;
            this.velocity.x += moveDir.x * speed * dt;
            this.velocity.y += moveDir.y * speed * dt;
            this.velocity.z += moveDir.z * speed * dt;
            
            // Apply friction
            const friction = CONFIG.PHYSICS.FRICTION_COEFFICIENT;
            this.velocity.multiplyScalar(Math.pow(1 - friction, dt * 60));
        }
        
        // Jump
        if (this.jump && this.isOnGround) {
            const jumpImpulse = surfaceNormal.clone().multiplyScalar(this.jumpForce);
            this.physicsEngine.applyImpulse(this, jumpImpulse);
            this.jump = false;
        }
    }

    updateFlyingMovement(dt) {
        const moveDir = new THREE.Vector3();
        
        if (this.moveForward) {
            moveDir.add(this.cameraDirection);
        }
        if (this.moveBackward) {
            moveDir.sub(this.cameraDirection);
        }
        if (this.moveLeft) {
            moveDir.sub(this.cameraRight);
        }
        if (this.moveRight) {
            moveDir.add(this.cameraRight);
        }
        if (this.moveUp) {
            moveDir.add(this.cameraUp);
        }
        if (this.moveDown) {
            moveDir.sub(this.cameraUp);
        }
        
        if (moveDir.lengthSq() > 0) {
            moveDir.normalize();
            
            // Direct velocity control in fly mode
            const speed = this.flySpeed;
            this.velocity.x = moveDir.x * speed;
            this.velocity.y = moveDir.y * speed;
            this.velocity.z = moveDir.z * speed;
        } else {
            // Damping when no input
            this.velocity.multiplyScalar(0.9);
        }
    }

    grabObject(object) {
        if (this.grabbedObject) {
            this.releaseObject();
        }
        
        this.grabbedObject = object;
        object.isGrabbed = true;
        console.log(`Grabbed: ${object.name}`);
    }

    releaseObject() {
        if (this.grabbedObject) {
            this.grabbedObject.isGrabbed = false;
            this.grabbedObject = null;
        }
    }

    updateGrabbedObject() {
        if (!this.grabbedObject) return;
        
        // Position object in front of player
        const targetPos = this.position.clone();
        targetPos.addScaledVector(this.cameraDirection, this.grabDistance);
        
        // Smoothly move object to target position
        this.grabbedObject.position.lerp(targetPos, 0.2);
        
        // Dampen velocity
        this.grabbedObject.velocity.multiplyScalar(0.8);
    }

    getPosition() {
        return this.position.clone();
    }

    getVelocity() {
        return this.velocity.clone();
    }

    destroy() {
        this.physicsEngine.removeBody(this);
        this.scene.remove(this.mesh);
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }
    }
}
