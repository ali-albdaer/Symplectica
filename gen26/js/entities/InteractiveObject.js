/**
 * ============================================
 * Interactive Object
 * ============================================
 * 
 * Small physics objects that the player can interact with.
 * Some can be luminous.
 */

class InteractiveObject extends Entity {
    constructor(config) {
        super(config);
        
        this.type = 'interactive';
        this.objectType = config.objectType || 'cube';
        
        // Physical properties
        this.physicsData.mass = config.mass || 10;
        this.physicsData.radius = config.radius || 0.5;
        this.physicsData.isStatic = false;
        
        // Visual properties
        this.color = config.color || 0x44AAFF;
        this.geometry = config.geometry || 'box';
        this.size = config.size || { x: 0.5, y: 0.5, z: 0.5 };
        
        // Luminosity
        this.isLuminous = config.luminous || false;
        this.lightIntensity = config.lightIntensity || 2;
        this.lightDistance = config.lightDistance || 10;
        this.pointLight = null;
        
        // Interaction
        this.isHeld = false;
        this.holder = null;
        this.holdOffset = new THREE.Vector3(0, 0, -2);
        
        // Animation
        this.bobPhase = Math.random() * Math.PI * 2;
        this.rotationSpeed = { x: 0.1, y: 0.2, z: 0.05 };
    }
    
    /**
     * Initialize the interactive object
     */
    init(fidelitySettings) {
        try {
            this.createMesh(fidelitySettings);
            
            if (this.isLuminous) {
                this.createLight(fidelitySettings);
            }
            
            this.syncFromPhysics();
            this.isInitialized = true;
            
            return this;
            
        } catch (error) {
            console.error(`Failed to initialize InteractiveObject: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Create the object mesh
     */
    createMesh(fidelitySettings) {
        let geometry;
        
        switch (this.geometry) {
            case 'box':
                geometry = new THREE.BoxGeometry(
                    this.size.x || 0.5,
                    this.size.y || 0.5,
                    this.size.z || 0.5
                );
                break;
                
            case 'sphere':
                geometry = new THREE.SphereGeometry(
                    this.size.radius || 0.3,
                    16, 16
                );
                break;
                
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(this.size.radius || 0.4);
                break;
                
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(this.size.radius || 0.4);
                break;
                
            default:
                geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        }
        
        let material;
        
        if (this.isLuminous) {
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.color,
                emissiveIntensity: 0.5,
                roughness: 0.3,
                metalness: 0.5
            });
        } else {
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.6,
                metalness: 0.3
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.name;
        
        // Store reference for raycasting
        this.mesh.userData.entity = this;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Create point light for luminous objects
     */
    createLight(fidelitySettings) {
        this.pointLight = new THREE.PointLight(
            this.color,
            this.lightIntensity,
            this.lightDistance
        );
        this.pointLight.castShadow = fidelitySettings.shadowsEnabled;
        
        if (fidelitySettings.shadowsEnabled) {
            this.pointLight.shadow.mapSize.width = 256;
            this.pointLight.shadow.mapSize.height = 256;
        }
        
        this.group.add(this.pointLight);
    }
    
    /**
     * Update the object
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        if (this.isHeld) {
            // Object is being held - handled by player
            return;
        }
        
        // Gentle rotation for luminous objects
        if (this.isLuminous && this.mesh) {
            this.mesh.rotation.x += this.rotationSpeed.x * deltaTime;
            this.mesh.rotation.y += this.rotationSpeed.y * deltaTime;
            this.mesh.rotation.z += this.rotationSpeed.z * deltaTime;
            
            // Gentle bobbing
            this.bobPhase += deltaTime;
            const bob = Math.sin(this.bobPhase) * 0.001;
            this.mesh.position.y = bob;
        }
    }
    
    /**
     * Pick up the object
     */
    pickup(holder) {
        this.isHeld = true;
        this.holder = holder;
        console.info(`Picked up: ${this.name}`);
    }
    
    /**
     * Release the object
     */
    release(throwVelocity = null) {
        this.isHeld = false;
        this.holder = null;
        
        if (throwVelocity) {
            this.physicsData.velocity.x += throwVelocity.x;
            this.physicsData.velocity.y += throwVelocity.y;
            this.physicsData.velocity.z += throwVelocity.z;
        }
        
        console.info(`Released: ${this.name}`);
    }
    
    /**
     * Set held position (called by holder)
     */
    setHeldPosition(position, rotation) {
        this.group.position.copy(position);
        this.syncToPhysics();
    }
    
    /**
     * Sync from physics to Three.js
     * For small objects, we use render units directly
     */
    syncFromPhysics() {
        if (this.group) {
            // For small objects, physics position is in render units (meters)
            // not in km like celestial bodies
            this.group.position.set(
                this.physicsData.position.x,
                this.physicsData.position.y,
                this.physicsData.position.z
            );
        }
    }
    
    /**
     * Sync from Three.js to physics
     */
    syncToPhysics() {
        if (this.group) {
            this.physicsData.position.x = this.group.position.x;
            this.physicsData.position.y = this.group.position.y;
            this.physicsData.position.z = this.group.position.z;
        }
    }
}
