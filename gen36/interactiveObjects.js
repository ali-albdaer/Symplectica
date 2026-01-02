/**
 * Interactive Objects
 * Small physics objects that the player can interact with
 */

class InteractiveObject {
    constructor(config, scene, physicsEngine, spawnPosition) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.config = config;
        
        // Physics properties
        this.id = `interactive_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name;
        this.mass = config.mass;
        this.isCelestial = false;
        this.fixed = false;
        this.isGrabbed = false;
        
        // Position and velocity
        this.position = new THREE.Vector3().copy(spawnPosition);
        this.velocity = new THREE.Vector3(0, 0, 0);
        
        // Determine shape and size
        if (config.radius) {
            this.radius = config.radius;
            this.shape = 'sphere';
        } else {
            this.radius = config.size / 2;
            this.size = config.size;
            this.shape = config.shape || 'box';
        }
        
        // Create mesh
        this.createMesh();
        
        // Register with physics
        this.physicsEngine.addBody(this);
    }

    createMesh() {
        let geometry;
        
        switch (this.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(this.radius, 32, 32);
                break;
            case 'box':
            default:
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
                break;
        }
        
        const materialConfig = {
            color: this.config.color,
            roughness: this.config.metalness ? 0.2 : 0.8,
            metalness: this.config.metalness || 0.1,
        };
        
        // Add emissive properties for luminous objects
        if (this.config.luminous) {
            materialConfig.emissive = this.config.color;
            materialConfig.emissiveIntensity = this.config.emissiveIntensity || 0.5;
            
            // Add point light for luminous objects
            this.light = new THREE.PointLight(
                this.config.color,
                this.config.emissiveIntensity * 2,
                50 // range in meters
            );
        }
        
        const material = new THREE.MeshStandardMaterial(materialConfig);
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactiveObject = this;
        
        this.scene.add(this.mesh);
        
        // Add light if luminous
        if (this.light) {
            this.mesh.add(this.light);
        }
    }

    update(dt) {
        // Update mesh position from physics position (scaled for rendering)
        this.mesh.position.set(
            this.position.x / 1e6,
            this.position.y / 1e6,
            this.position.z / 1e6
        );
        
        // Add some rotation for visual interest
        if (!this.isGrabbed) {
            this.mesh.rotation.x += dt * 0.5;
            this.mesh.rotation.y += dt * 0.3;
        }
    }

    destroy() {
        this.physicsEngine.removeBody(this);
        this.scene.remove(this.mesh);
        if (this.mesh.geometry) this.mesh.geometry.dispose();
        if (this.mesh.material) this.mesh.material.dispose();
        if (this.light) {
            this.light.dispose();
        }
    }
}

/**
 * Manages all interactive objects
 */
class InteractiveObjectManager {
    constructor(scene, physicsEngine, player) {
        this.scene = scene;
        this.physicsEngine = physicsEngine;
        this.player = player;
        this.objects = [];
        
        console.log('Creating interactive objects...');
        this.spawnObjects();
    }

    spawnObjects() {
        const objectTypes = CONFIG.INTERACTIVE_OBJECTS.types;
        const count = CONFIG.INTERACTIVE_OBJECTS.count;
        const spawnRadius = CONFIG.INTERACTIVE_OBJECTS.spawnRadius;
        const spawnHeight = CONFIG.INTERACTIVE_OBJECTS.spawnHeight;
        
        const playerPos = this.player.getPosition();
        
        // Get surface normal at player position
        let upVector = new THREE.Vector3(0, 1, 0);
        if (this.player.currentPlanet) {
            upVector = this.physicsEngine.getSurfaceNormal(
                playerPos,
                this.player.currentPlanet
            );
        }
        
        // Create random objects around player
        for (let i = 0; i < count; i++) {
            // Random position in circle around player
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = spawnRadius * (0.5 + Math.random() * 0.5);
            
            // Random perpendicular direction on surface
            const randomDir = new THREE.Vector3(
                Math.cos(angle),
                0,
                Math.sin(angle)
            );
            
            // Project onto surface plane
            randomDir.addScaledVector(upVector, -randomDir.dot(upVector));
            randomDir.normalize();
            
            // Calculate spawn position
            const spawnPos = playerPos.clone();
            spawnPos.addScaledVector(randomDir, distance);
            spawnPos.addScaledVector(upVector, spawnHeight);
            
            // Choose random object type
            const objectType = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            
            // Create object
            const obj = new InteractiveObject(
                objectType,
                this.scene,
                this.physicsEngine,
                spawnPos
            );
            
            // Match planet's velocity
            if (this.player.currentPlanet) {
                obj.velocity.copy(this.player.currentPlanet.velocity);
            }
            
            this.objects.push(obj);
        }
        
        console.log(`Spawned ${this.objects.length} interactive objects`);
    }

    update(dt) {
        for (const obj of this.objects) {
            obj.update(dt);
        }
    }

    destroy() {
        for (const obj of this.objects) {
            obj.destroy();
        }
        this.objects = [];
    }
}
