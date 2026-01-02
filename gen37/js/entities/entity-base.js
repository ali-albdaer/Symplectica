/**
 * Entity Base - Base class for all game entities
 * Provides common functionality for entities in the simulation
 */

class EntityBase {
    constructor(name, type) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = name || 'Entity';
        this.type = type || 'generic';
        
        // Three.js representation
        this.mesh = null;
        this.group = new THREE.Group();
        
        // Physics body reference
        this.physicsBody = null;
        
        // State
        this.isActive = true;
        this.isVisible = true;
        
        // Parent/child relationships
        this.parent = null;
        this.children = [];
        
        Logger.debug('Entity', `Created entity: ${this.name} (${this.type})`);
    }
    
    /**
     * Initialize the entity (override in subclass)
     */
    init() {
        // Override in subclass
    }
    
    /**
     * Update the entity (override in subclass)
     */
    update(deltaTime) {
        // Update children
        for (const child of this.children) {
            if (child.isActive) {
                child.update(deltaTime);
            }
        }
    }
    
    /**
     * Add a child entity
     */
    addChild(entity) {
        entity.parent = this;
        this.children.push(entity);
        this.group.add(entity.group);
    }
    
    /**
     * Remove a child entity
     */
    removeChild(entity) {
        const idx = this.children.indexOf(entity);
        if (idx !== -1) {
            this.children.splice(idx, 1);
            entity.parent = null;
            this.group.remove(entity.group);
        }
    }
    
    /**
     * Get world position
     */
    getWorldPosition() {
        const pos = new THREE.Vector3();
        this.group.getWorldPosition(pos);
        return pos;
    }
    
    /**
     * Set visibility
     */
    setVisible(visible) {
        this.isVisible = visible;
        this.group.visible = visible;
    }
    
    /**
     * Destroy the entity
     */
    destroy() {
        this.isActive = false;
        
        // Remove from parent
        if (this.parent) {
            this.parent.removeChild(this);
        }
        
        // Destroy children
        for (const child of [...this.children]) {
            child.destroy();
        }
        
        // Clean up Three.js resources
        if (this.mesh) {
            if (this.mesh.geometry) {
                this.mesh.geometry.dispose();
            }
            if (this.mesh.material) {
                if (Array.isArray(this.mesh.material)) {
                    this.mesh.material.forEach(m => m.dispose());
                } else {
                    this.mesh.material.dispose();
                }
            }
        }
        
        // Remove physics body
        if (this.physicsBody) {
            PhysicsEngine.removeBody(this.physicsBody);
        }
        
        Logger.debug('Entity', `Destroyed entity: ${this.name}`);
    }
}

// Make available globally
window.EntityBase = EntityBase;
