/**
 * Interactive Object - Physics-enabled objects the player can interact with
 */

class InteractiveObject extends EntityBase {
    constructor(config) {
        super(config.name, 'interactive');
        
        this.config = config;
        
        // Physical properties
        this.mass = config.mass || 10;
        this.shape = config.shape || 'box';
        this.size = config.size || { x: 1, y: 1, z: 1 };
        
        // Visual properties
        this.color = config.color || 0xffffff;
        this.metalness = config.metalness || 0.5;
        this.roughness = config.roughness || 0.5;
        
        // Luminosity
        this.isLuminous = config.luminous || false;
        this.emissiveColor = config.emissiveColor || config.color;
        this.emissiveIntensity = config.emissiveIntensity || 1.0;
        this.light = null;
        this.lightRadius = config.lightRadius || 10;
        this.lightIntensity = config.lightIntensity || 0.5;
        
        // Interaction state
        this.isHeld = false;
        this.isHighlighted = false;
        this.originalMaterial = null;
    }
    
    /**
     * Initialize the object
     */
    init(scene, position, velocity) {
        this.createMesh();
        
        if (this.isLuminous) {
            this.createLight();
        }
        
        this.createPhysicsBody(position, velocity);
        
        scene.add(this.group);
        
        Logger.debug('InteractiveObject', `Created ${this.name} at position`, position);
    }
    
    /**
     * Create the mesh based on shape
     */
    createMesh() {
        let geometry;
        let collisionRadius;
        
        const fidelity = Config.RENDERING.fidelityLevel;
        const segments = Config.RENDERING.geometry[fidelity].sphereSegments;
        
        switch (this.shape) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(this.size.radius, segments, segments / 2);
                collisionRadius = this.size.radius;
                break;
                
            case 'box':
                geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
                // Approximate bounding sphere
                collisionRadius = Math.max(this.size.x, this.size.y, this.size.z) * 0.866;
                break;
                
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(this.size.radius);
                collisionRadius = this.size.radius;
                break;
                
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(
                    this.size.radius, 
                    this.size.radius, 
                    this.size.height, 
                    segments
                );
                collisionRadius = Math.max(this.size.radius, this.size.height / 2);
                break;
                
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
                collisionRadius = 0.866;
        }
        
        this.collisionRadius = collisionRadius;
        
        // Create material
        const materialOptions = {
            color: this.color,
            metalness: this.metalness,
            roughness: this.roughness
        };
        
        if (this.isLuminous) {
            materialOptions.emissive = new THREE.Color(this.emissiveColor);
            materialOptions.emissiveIntensity = this.emissiveIntensity;
        }
        
        const material = new THREE.MeshStandardMaterial(materialOptions);
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.name;
        
        // Store original material for highlighting
        this.originalMaterial = material;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Create light for luminous objects
     */
    createLight() {
        const color = new THREE.Color(this.emissiveColor);
        
        this.light = new THREE.PointLight(
            color,
            this.lightIntensity,
            this.lightRadius,
            2  // Physical decay
        );
        
        // Small objects don't cast shadows (performance)
        this.light.castShadow = false;
        
        this.group.add(this.light);
    }
    
    /**
     * Create physics body
     */
    createPhysicsBody(position, velocity) {
        this.physicsBody = PhysicsEngine.createBody({
            name: this.name,
            x: position.x,
            y: position.y,
            z: position.z,
            vx: velocity ? velocity.x : 0,
            vy: velocity ? velocity.y : 0,
            vz: velocity ? velocity.z : 0,
            mass: this.mass,
            radius: this.collisionRadius,
            isCelestial: false,
            isStatic: false,
            affectedByGravity: true,
            collisionEnabled: true,
            collisionGroup: 'object'
        });
        
        this.physicsBody.mesh = this.group;
    }
    
    /**
     * Update the object
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // If held, position is controlled by player
        if (this.isHeld) {
            return;
        }
        
        // Update visual position from physics
        if (this.physicsBody) {
            this.group.position.copy(this.physicsBody.position);
            
            // Apply some rotation based on velocity for visual effect
            if (!this.physicsBody.isGrounded) {
                const rotSpeed = 0.5;
                this.mesh.rotation.x += deltaTime * rotSpeed;
                this.mesh.rotation.z += deltaTime * rotSpeed * 0.7;
            }
        }
        
        // Pulsing effect for luminous objects
        if (this.isLuminous && this.light) {
            const time = performance.now() * 0.001;
            const pulse = 0.8 + Math.sin(time * 3) * 0.2;
            this.light.intensity = this.lightIntensity * pulse;
            
            if (this.mesh.material.emissiveIntensity !== undefined) {
                this.mesh.material.emissiveIntensity = this.emissiveIntensity * pulse;
            }
        }
    }
    
    /**
     * Highlight the object (when player is looking at it)
     */
    setHighlighted(highlighted) {
        if (this.isHighlighted === highlighted) return;
        
        this.isHighlighted = highlighted;
        
        if (highlighted) {
            // Create highlighted material
            this.mesh.material = new THREE.MeshStandardMaterial({
                color: this.color,
                metalness: this.metalness,
                roughness: this.roughness,
                emissive: 0x333333,
                emissiveIntensity: 0.5
            });
            
            if (this.isLuminous) {
                this.mesh.material.emissive = new THREE.Color(this.emissiveColor);
                this.mesh.material.emissiveIntensity = this.emissiveIntensity * 1.5;
            }
        } else {
            // Restore original material
            this.mesh.material = this.originalMaterial;
        }
    }
    
    /**
     * Pick up the object
     */
    grab() {
        if (this.isHeld) return false;
        
        this.isHeld = true;
        
        // Disable physics while held
        if (this.physicsBody) {
            this.physicsBody.affectedByGravity = false;
            this.physicsBody.velocity.set(0, 0, 0);
        }
        
        Logger.debug('InteractiveObject', `Grabbed ${this.name}`);
        return true;
    }
    
    /**
     * Release the object
     */
    release(velocity) {
        if (!this.isHeld) return;
        
        this.isHeld = false;
        
        // Re-enable physics
        if (this.physicsBody) {
            this.physicsBody.affectedByGravity = true;
            
            if (velocity) {
                this.physicsBody.velocity.copy(velocity);
            }
        }
        
        Logger.debug('InteractiveObject', `Released ${this.name}`);
    }
    
    /**
     * Throw the object
     */
    throw(direction, force) {
        const velocity = direction.clone().normalize().multiplyScalar(force);
        this.release(velocity);
    }
    
    /**
     * Move to position (when held)
     */
    setPosition(position) {
        if (this.physicsBody) {
            this.physicsBody.position.copy(position);
        }
        this.group.position.copy(position);
    }
}

window.InteractiveObject = InteractiveObject;

/**
 * Factory function to create multiple interactive objects near a position
 */
function createInteractiveObjects(scene, basePosition, baseVelocity) {
    const objects = [];
    const objectTypes = Config.OBJECTS.types;
    
    const spawnDistance = Config.OBJECTS.spawnDistance;
    const spawnHeight = Config.OBJECTS.spawnHeight;
    
    for (let i = 0; i < objectTypes.length; i++) {
        const config = objectTypes[i];
        
        // Calculate spawn position in a circle around base position
        const angle = (i / objectTypes.length) * Math.PI * 2;
        const offset = new THREE.Vector3(
            Math.cos(angle) * spawnDistance,
            spawnHeight + Math.random() * 2,
            Math.sin(angle) * spawnDistance
        );
        
        const position = basePosition.clone().add(offset);
        
        // Create object
        const obj = new InteractiveObject(config);
        obj.init(scene, position, baseVelocity);
        
        objects.push(obj);
    }
    
    Logger.info('InteractiveObject', `Created ${objects.length} interactive objects`);
    return objects;
}

window.createInteractiveObjects = createInteractiveObjects;
