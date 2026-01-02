/**
 * ============================================
 * Base Entity Class
 * ============================================
 * 
 * Base class for all entities in the simulation.
 * Provides common functionality and interface.
 */

class Entity {
    constructor(config = {}) {
        this.id = Entity.nextId++;
        this.name = config.name || `Entity_${this.id}`;
        this.type = config.type || 'entity';
        
        // Three.js object
        this.mesh = null;
        this.group = new THREE.Group();
        this.group.name = this.name;
        
        // Physics data
        this.physicsData = {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            acceleration: { x: 0, y: 0, z: 0 },
            mass: config.mass || 1,
            radius: config.radius || 1,
            isStatic: config.isStatic || false
        };
        
        // State
        this.isInitialized = false;
        this.isActive = true;
    }
    
    /**
     * Initialize the entity
     */
    init() {
        this.isInitialized = true;
        return this;
    }
    
    /**
     * Update the entity (called every frame)
     */
    update(deltaTime) {
        // Override in subclasses
    }
    
    /**
     * Sync Three.js object from physics data
     */
    syncFromPhysics() {
        if (this.group) {
            // Convert physics position (km) to render units
            const scale = 1 / CONFIG.PHYSICS.DISTANCE_SCALE;
            this.group.position.set(
                this.physicsData.position.x * scale,
                this.physicsData.position.y * scale,
                this.physicsData.position.z * scale
            );
        }
    }
    
    /**
     * Sync physics data from Three.js object
     */
    syncToPhysics() {
        if (this.group) {
            const scale = CONFIG.PHYSICS.DISTANCE_SCALE;
            this.physicsData.position.x = this.group.position.x * scale;
            this.physicsData.position.y = this.group.position.y * scale;
            this.physicsData.position.z = this.group.position.z * scale;
        }
    }
    
    /**
     * Set position in physics units (km)
     */
    setPosition(x, y, z) {
        this.physicsData.position.x = x;
        this.physicsData.position.y = y;
        this.physicsData.position.z = z;
        this.syncFromPhysics();
    }
    
    /**
     * Set velocity in physics units (km/s)
     */
    setVelocity(x, y, z) {
        this.physicsData.velocity.x = x;
        this.physicsData.velocity.y = y;
        this.physicsData.velocity.z = z;
    }
    
    /**
     * Get position in render units
     */
    getRenderPosition() {
        return this.group.position.clone();
    }
    
    /**
     * Get position in physics units (km)
     */
    getPhysicsPosition() {
        return { ...this.physicsData.position };
    }
    
    /**
     * Add to scene
     */
    addToScene(scene) {
        if (this.group) {
            scene.add(this.group);
        }
    }
    
    /**
     * Remove from scene
     */
    removeFromScene(scene) {
        if (this.group) {
            scene.remove(this.group);
        }
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(m => m.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
    }
}

// Static ID counter
Entity.nextId = 0;
