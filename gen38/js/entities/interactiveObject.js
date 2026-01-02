/**
 * Solar System Simulation - Interactive Object
 * =============================================
 * Small physics objects that the player can interact with.
 */

class InteractiveObject {
    constructor(config) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.name = config.name || 'Object';
        this.type = config.type || 'cube';
        
        // Physical properties
        this.mass = config.mass || 1;
        this.radius = config.radius || 0.25;
        this.restitution = config.restitution || 0.5;
        this.friction = config.friction || 0.8;
        
        // Position and velocity
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
        
        this.rotation = new THREE.Euler(0, 0, 0);
        this.angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        
        // Visual properties
        this.color = config.color || 0xFFFFFF;
        this.luminous = config.luminous || false;
        this.luminosity = config.luminosity || 1.0;
        
        // Three.js objects
        this.mesh = null;
        this.light = null;
        
        // Interaction state
        this.isHeld = false;
        this.isHighlighted = false;
        
        // Create mesh
        this.createMesh(config);
    }
    
    /**
     * Create the object mesh
     */
    createMesh(config) {
        let geometry;
        
        switch (config.geometry || this.type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(config.size?.radius || 0.25, 16, 16);
                this.radius = config.size?.radius || 0.25;
                break;
            case 'box':
            case 'cube':
                const size = config.size || { x: 0.5, y: 0.5, z: 0.5 };
                geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
                this.radius = Math.max(size.x, size.y, size.z) * 0.5;
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(config.size?.radius || 0.3);
                this.radius = config.size?.radius || 0.3;
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(config.size?.radius || 0.4);
                this.radius = config.size?.radius || 0.4;
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(config.size?.radius || 0.3);
                this.radius = config.size?.radius || 0.3;
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
                this.radius = 0.4;
                break;
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                this.radius = 0.35;
        }
        
        // Material
        let material;
        if (this.luminous) {
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: new THREE.Color(this.color),
                emissiveIntensity: this.luminosity,
                roughness: 0.3,
                metalness: 0.5,
            });
            
            // Add point light for luminous objects
            this.light = new THREE.PointLight(this.color, this.luminosity * 0.5, 10);
            this.light.castShadow = false; // Performance: small objects don't cast shadows from their light
        } else {
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.7,
                metalness: 0.3,
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactiveObject = this;
        
        // Position mesh
        this.mesh.position.copy(this.position);
        
        // Add light to mesh if luminous
        if (this.light) {
            this.mesh.add(this.light);
        }
    }
    
    /**
     * Update mesh from physics state
     */
    updateMesh() {
        if (!this.mesh) return;
        
        this.mesh.position.copy(this.position);
        this.mesh.rotation.copy(this.rotation);
        
        // Update rotation based on angular velocity
        this.rotation.x += this.angularVelocity.x * 0.016;
        this.rotation.y += this.angularVelocity.y * 0.016;
        this.rotation.z += this.angularVelocity.z * 0.016;
        
        // Pulse effect for luminous objects
        if (this.luminous && this.mesh.material.emissiveIntensity !== undefined) {
            const pulse = 0.8 + Math.sin(Date.now() * 0.003) * 0.2;
            this.mesh.material.emissiveIntensity = this.luminosity * pulse;
            
            if (this.light) {
                this.light.intensity = this.luminosity * 0.5 * pulse;
            }
        }
    }
    
    /**
     * Set highlight state (when player is looking at object)
     */
    setHighlighted(highlighted) {
        if (this.isHighlighted === highlighted) return;
        
        this.isHighlighted = highlighted;
        
        if (this.mesh && this.mesh.material) {
            if (highlighted) {
                this.mesh.material.emissive = new THREE.Color(0x333333);
                if (!this.luminous) {
                    this.mesh.material.emissiveIntensity = 0.3;
                }
            } else {
                if (!this.luminous) {
                    this.mesh.material.emissive = new THREE.Color(0x000000);
                    this.mesh.material.emissiveIntensity = 0;
                } else {
                    this.mesh.material.emissive = new THREE.Color(this.color);
                }
            }
        }
    }
    
    /**
     * Hold the object (player picks it up)
     */
    hold() {
        this.isHeld = true;
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
    }
    
    /**
     * Release the object
     */
    release(throwVelocity = null) {
        this.isHeld = false;
        
        if (throwVelocity) {
            this.velocity.copy(throwVelocity);
        }
    }
    
    /**
     * Apply impulse to the object
     */
    applyImpulse(impulse) {
        this.velocity.x += impulse.x / this.mass;
        this.velocity.y += impulse.y / this.mass;
        this.velocity.z += impulse.z / this.mass;
    }
    
    /**
     * Get kinetic energy
     */
    getKineticEnergy() {
        const speedSq = this.velocity.lengthSq();
        return 0.5 * this.mass * speedSq;
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.light) {
            this.light.dispose();
        }
    }
}

/**
 * Factory for creating interactive objects
 */
class InteractiveObjectFactory {
    /**
     * Create random objects near a position
     */
    static createRandomObjects(centerPosition, count, radius) {
        const objects = [];
        const types = Config.interactiveObjects.types;
        
        for (let i = 0; i < count; i++) {
            // Random position within radius
            const angle = Math.random() * MathUtils.TWO_PI;
            const distance = 2 + Math.random() * (radius - 2);
            const height = 0.5 + Math.random() * 2;
            
            // Random type
            const typeConfig = types[Math.floor(Math.random() * types.length)];
            
            const obj = new InteractiveObject({
                name: `${typeConfig.name} ${i + 1}`,
                geometry: typeConfig.geometry,
                size: typeConfig.size,
                mass: typeConfig.mass,
                color: typeConfig.color,
                luminous: typeConfig.luminous,
                luminosity: typeConfig.luminosity || 1,
                position: {
                    x: centerPosition.x + Math.cos(angle) * distance,
                    y: centerPosition.y + height,
                    z: centerPosition.z + Math.sin(angle) * distance,
                }
            });
            
            objects.push(obj);
        }
        
        Logger.info(`Created ${count} interactive objects`);
        return objects;
    }
    
    /**
     * Create a specific object type
     */
    static create(type, position, options = {}) {
        const typeConfigs = Config.interactiveObjects.types;
        const typeConfig = typeConfigs.find(t => t.name.toLowerCase() === type.toLowerCase()) || typeConfigs[0];
        
        return new InteractiveObject({
            ...typeConfig,
            position,
            ...options,
        });
    }
}
