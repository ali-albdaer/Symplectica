/**
 * INTERACTIVE OBJECTS
 * Small physics objects that player can interact with
 * Some are luminous
 */

class InteractiveObject {
    constructor(config, type, position, scene, physicsEngine) {
        this.config = config;
        this.type = type;
        this.scene = scene;
        this.physics = physicsEngine;
        
        // Physical properties
        this.mass = type.mass;
        this.size = type.size;
        this.color = type.color;
        this.luminous = type.luminous || false;
        
        // Position and velocity
        this.position = { ...position };
        this.velocity = { x: 0, y: 0, z: 0 };
        
        // State
        this.isHeld = false;
        this.mesh = null;
        this.light = null;
        
        // Create mesh
        this.createMesh();
        
        // Register with physics
        this.physics.registerBody(this);
    }

    createMesh() {
        let geometry;
        
        // Different shapes for variety
        switch (this.type.name) {
            case 'Crate':
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
                break;
            case 'Sphere':
                geometry = new THREE.SphereGeometry(this.size / 2, 16, 16);
                break;
            case 'Crystal':
                geometry = new THREE.OctahedronGeometry(this.size / 2, 0);
                break;
            case 'Lantern':
                geometry = new THREE.CylinderGeometry(this.size / 3, this.size / 3, this.size, 8);
                break;
            default:
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: this.luminous ? 0.3 : 0.7,
            metalness: this.luminous ? 0.8 : 0.2,
            emissive: this.luminous ? this.color : 0x000000,
            emissiveIntensity: this.type.emissiveIntensity || 0,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Add light if luminous
        if (this.luminous && this.type.lightIntensity) {
            this.light = new THREE.PointLight(
                this.color,
                this.type.lightIntensity,
                this.type.lightDistance || 5,
                2
            );
            this.light.castShadow = false; // Small lights don't cast shadows for performance
            this.scene.add(this.light);
        }
    }

    update(deltaTime) {
        if (!this.isHeld) {
            // Update position from physics
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;
        }
        
        // Update mesh
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        }
        
        // Update light
        if (this.light) {
            this.light.position.set(this.position.x, this.position.y, this.position.z);
        }
    }

    grab() {
        this.isHeld = true;
    }

    release() {
        this.isHeld = false;
    }

    destroy() {
        this.physics.unregisterBody(this);
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
    }
}

/**
 * Object Manager - spawns and manages interactive objects
 */
class ObjectManager {
    constructor(config, scene, physicsEngine) {
        this.config = config;
        this.scene = scene;
        this.physics = physicsEngine;
        this.objects = [];
    }

    spawnObjects(spawnPosition, planet) {
        const objectConfig = this.config.interactiveObjects;
        
        console.log(`[OBJECTS] Spawning ${objectConfig.count} interactive objects...`);
        
        for (let i = 0; i < objectConfig.count; i++) {
            // Random type
            const type = objectConfig.types[Math.floor(Math.random() * objectConfig.types.length)];
            
            // Random position around spawn point
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * objectConfig.spawnRadius;
            const height = 0.5 + Math.random() * 2;
            
            const position = {
                x: spawnPosition.x + Math.cos(angle) * distance,
                y: spawnPosition.y + height,
                z: spawnPosition.z + Math.sin(angle) * distance
            };
            
            const obj = new InteractiveObject(this.config, type, position, this.scene, this.physics);
            
            // Give object the same initial velocity as the planet
            obj.velocity.x = planet.velocity.x;
            obj.velocity.y = planet.velocity.y;
            obj.velocity.z = planet.velocity.z;
            
            this.objects.push(obj);
        }
        
        console.log(`[OBJECTS] Spawned ${this.objects.length} objects`);
    }

    update(deltaTime) {
        for (const obj of this.objects) {
            obj.update(deltaTime);
        }
    }

    findObjectInRay(rayStart, rayDir, maxDistance) {
        let closestObject = null;
        let closestDistance = maxDistance;
        
        for (const obj of this.objects) {
            if (obj.isHeld) continue;
            
            // Simple ray-sphere intersection
            const toObject = {
                x: obj.position.x - rayStart.x,
                y: obj.position.y - rayStart.y,
                z: obj.position.z - rayStart.z
            };
            
            const dot = toObject.x * rayDir.x + toObject.y * rayDir.y + toObject.z * rayDir.z;
            
            if (dot < 0) continue; // Behind ray
            
            const closestPoint = {
                x: rayStart.x + rayDir.x * dot,
                y: rayStart.y + rayDir.y * dot,
                z: rayStart.z + rayDir.z * dot
            };
            
            const dx = closestPoint.x - obj.position.x;
            const dy = closestPoint.y - obj.position.y;
            const dz = closestPoint.z - obj.position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < obj.size && dot < closestDistance) {
                closestObject = obj;
                closestDistance = dot;
            }
        }
        
        return closestObject;
    }

    reset() {
        for (const obj of this.objects) {
            obj.destroy();
        }
        this.objects = [];
    }
}

// Global function for player to grab objects
window.tryGrabObjectFromPlayer = function(rayStart, rayDir, maxDistance, player) {
    if (window.objectManager) {
        const obj = window.objectManager.findObjectInRay(rayStart, rayDir, maxDistance);
        if (obj) {
            obj.grab();
            player.heldObject = obj;
            console.log(`[PLAYER] Grabbed ${obj.type.name}`);
        }
    }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractiveObject, ObjectManager };
}
