/**
 * Entity Base Class
 * Provides common functionality for all entities in the scene
 */
class Entity {
    constructor(id, config = {}) {
        this.id = id;
        this.name = config.name || `Entity_${id}`;
        this.type = config.type || 'generic';
        
        // Transform
        this.position = new THREE.Vector3(
            config.position?.x || 0,
            config.position?.y || 0,
            config.position?.z || 0
        );
        this.velocity = new THREE.Vector3(
            config.velocity?.x || 0,
            config.velocity?.y || 0,
            config.velocity?.z || 0
        );
        this.rotation = new THREE.Euler(
            config.rotation?.x || 0,
            config.rotation?.y || 0,
            config.rotation?.z || 0
        );
        this.quaternion = new THREE.Quaternion();
        this.quaternion.setFromEuler(this.rotation);
        
        // Physics
        this.mass = config.mass || 1;
        this.density = config.density || 1;
        this.radius = config.radius || 1;
        this.physicsBody = null;
        this.isKinematic = config.isKinematic || false;
        
        // Graphics
        this.mesh = null;
        this.material = null;
        this.castShadow = config.castShadow !== false;
        this.receiveShadow = config.receiveShadow !== false;
        this.color = config.color || 0xffffff;
        
        // State
        this.active = true;
        this.visible = true;
        this.userData = config.userData || {};
        
        // Events
        this.onUpdate = null;
        this.onDestroy = null;
    }

    /**
     * Create mesh for this entity
     */
    createMesh(geometry, material) {
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.quaternion);
        this.mesh.castShadow = this.castShadow;
        this.mesh.receiveShadow = this.receiveShadow;
        this.mesh.userData.entityId = this.id;
        
        this.material = material;
        return this.mesh;
    }

    /**
     * Update entity (called each frame)
     */
    update(deltaTime) {
        if (!this.active) return;

        // Sync with physics body
        if (this.physicsBody) {
            this.position.copy(this.physicsBody.position);
            this.velocity.copy(this.physicsBody.velocity);
            this.quaternion.copy(this.physicsBody.quaternion);
            this.rotation.setFromQuaternion(this.quaternion);
        }

        // Update mesh
        if (this.mesh && this.visible) {
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        }

        // User callback
        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
    }

    /**
     * Set position
     */
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        if (this.physicsBody) {
            this.physicsBody.position.copy(this.position);
        }
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }

    /**
     * Set velocity
     */
    setVelocity(x, y, z) {
        this.velocity.set(x, y, z);
        if (this.physicsBody) {
            this.physicsBody.velocity.copy(this.velocity);
        }
    }

    /**
     * Set rotation (in radians)
     */
    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        this.quaternion.setFromEuler(this.rotation);
        if (this.physicsBody) {
            this.physicsBody.quaternion.copy(this.quaternion);
        }
        if (this.mesh) {
            this.mesh.quaternion.copy(this.quaternion);
        }
    }

    /**
     * Get distance to another entity
     */
    distanceTo(other) {
        return this.position.distanceTo(other.position);
    }

    /**
     * Get direction to another entity
     */
    directionTo(other) {
        const dir = other.position.clone().sub(this.position);
        return dir.normalize();
    }

    /**
     * Destroy entity
     */
    destroy() {
        this.active = false;
        
        if (this.onDestroy) {
            this.onDestroy();
        }

        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }

        // Cleanup geometry
        if (this.mesh && this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }

        // Cleanup material
        if (this.material) {
            if (this.material.map) this.material.map.dispose();
            this.material.dispose();
        }
    }

    /**
     * Get entity data for serialization
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            position: this.position.toArray(),
            velocity: this.velocity.toArray(),
            rotation: this.rotation.toArray(),
            mass: this.mass,
            color: this.color
        };
    }
}

/**
 * Entity Manager
 * Manages all entities in the scene
 */
class EntityManager {
    constructor() {
        this.entities = new Map();
        this.entityList = [];
        this.nextId = 0;
        this.groups = new Map(); // type -> entities[]
    }

    /**
     * Create and register entity
     */
    create(config) {
        const id = this.nextId++;
        const entity = new Entity(id, config);
        
        this.entities.set(id, entity);
        this.entityList.push(entity);

        // Group by type
        if (!this.groups.has(entity.type)) {
            this.groups.set(entity.type, []);
        }
        this.groups.get(entity.type).push(entity);

        DebugLog.debug(`Entity created: ${entity.name} (id: ${id})`);
        return entity;
    }

    /**
     * Get entity by id
     */
    getById(id) {
        return this.entities.get(id);
    }

    /**
     * Get entities by type
     */
    getByType(type) {
        return this.groups.get(type) || [];
    }

    /**
     * Get all entities
     */
    getAll() {
        return [...this.entityList];
    }

    /**
     * Find entities matching predicate
     */
    find(predicate) {
        return this.entityList.filter(predicate);
    }

    /**
     * Update all entities
     */
    updateAll(deltaTime) {
        for (const entity of this.entityList) {
            if (entity.active) {
                entity.update(deltaTime);
            }
        }
    }

    /**
     * Destroy entity
     */
    destroy(id) {
        const entity = this.entities.get(id);
        if (entity) {
            entity.destroy();
            this.entities.delete(id);
            Utilities.array.remove(this.entityList, e => e.id === id);
            
            const typeGroup = this.groups.get(entity.type);
            if (typeGroup) {
                Utilities.array.remove(typeGroup, e => e.id === id);
            }

            DebugLog.debug(`Entity destroyed: ${entity.name} (id: ${id})`);
        }
    }

    /**
     * Clear all entities
     */
    clear() {
        for (const entity of this.entityList) {
            entity.destroy();
        }
        this.entities.clear();
        this.entityList = [];
        this.groups.clear();
    }

    /**
     * Get entity count
     */
    getCount() {
        return this.entityList.length;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Entity, EntityManager };
}
