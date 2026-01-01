/**
 * CelestialBody.js - Celestial Body Entity
 * 
 * Represents planets, moons, stars, and other celestial objects.
 * Handles visual representation and self-rotation.
 */

import Config from './Config.js';

export class CelestialBody {
    constructor(config, physicsWorld) {
        this.config = config;
        this.physicsWorld = physicsWorld;
        
        this.mesh = null;
        this.body = null;
        
        // LOD (Level of Detail) meshes
        this.lodMeshes = [];
        this.currentLOD = 0;
        
        // Atmosphere (if applicable)
        this.atmosphereMesh = null;
        
        this.init();
    }

    /**
     * Initialize the celestial body
     */
    init() {
        // Create visual mesh
        this.createMesh();
        
        // Create atmosphere if enabled
        if (this.config.atmosphere && this.config.atmosphere.enabled) {
            this.createAtmosphere();
        }
        
        // Create physics body
        this.createPhysicsBody();
    }

    /**
     * Create the visual mesh with LOD
     */
    createMesh() {
        const radius = this.config.radius;
        const color = this.config.color;
        
        // Create geometry with appropriate detail levels
        const geometries = [
            new THREE.SphereGeometry(radius, 64, 64),  // High detail
            new THREE.SphereGeometry(radius, 32, 32),  // Medium detail
            new THREE.SphereGeometry(radius, 16, 16),  // Low detail
        ];
        
        // Create material based on body type
        let material;
        
        if (this.config.type === 'star') {
            // Star material (emissive)
            material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: this.config.emissive,
                emissiveIntensity: this.config.emissiveIntensity,
                roughness: 1.0,
                metalness: 0.0,
            });
        } else {
            // Planet/Moon material
            material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8,
                metalness: 0.2,
            });
        }
        
        // Create LOD meshes
        const lod = new THREE.LOD();
        
        for (let i = 0; i < geometries.length; i++) {
            const mesh = new THREE.Mesh(geometries[i], material);
            mesh.castShadow = this.config.castShadow;
            mesh.receiveShadow = this.config.receiveShadow;
            
            // Set LOD distances
            const distance = i === 0 ? 0 : 
                           i === 1 ? Config.rendering.lod.high : 
                           Config.rendering.lod.medium;
            
            lod.addLevel(mesh, distance);
        }
        
        this.mesh = lod;
        
        // Set initial position
        this.mesh.position.set(
            this.config.position[0],
            this.config.position[1],
            this.config.position[2]
        );
        
        // Store reference to this body
        this.mesh.userData.celestialBody = this;
    }

    /**
     * Create atmosphere mesh
     */
    createAtmosphere() {
        const radius = this.config.radius * 1.1; // Slightly larger than planet
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.config.atmosphere.color,
            transparent: true,
            opacity: this.config.atmosphere.opacity,
            side: THREE.BackSide,
        });
        
        this.atmosphereMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.atmosphereMesh);
    }

    /**
     * Create physics body
     */
    createPhysicsBody() {
        const radius = this.config.radius;
        const mass = this.config.mass;
        const position = this.config.position;
        const velocity = this.config.velocity;
        
        // Create sphere body
        this.body = this.physicsWorld.createSphereBody(
            radius,
            mass,
            position,
            velocity,
            this.physicsWorld.materials.ground
        );
        
        // Stars and very massive bodies should be kinematic (don't move)
        if (this.config.type === 'star') {
            this.body.type = CANNON.Body.KINEMATIC;
            this.body.mass = 0; // Kinematic bodies have zero mass in Cannon
            // But store original mass for gravity calculations
        }
        
        // Add to physics world
        // Stars still exert gravity, so mark as gravitational
        this.physicsWorld.addBody(
            this.mesh,
            this.body,
            true // isGravitational
        );
        
        // Store original mass for gravity calculations
        if (this.config.type === 'star') {
            // Use the config mass for gravity calculations
            const bodyData = this.physicsWorld.gravitationalBodies.find(
                gb => gb.body === this.body
            );
            if (bodyData) {
                bodyData.mass = this.config.mass;
            }
        }
    }

    /**
     * Update the celestial body
     */
    update(deltaTime) {
        // Self-rotation
        if (this.config.rotationSpeed) {
            this.mesh.rotation.y += this.config.rotationSpeed * deltaTime * 10;
        }
        
        // Update atmosphere rotation (slightly different for visual effect)
        if (this.atmosphereMesh) {
            this.atmosphereMesh.rotation.y += this.config.rotationSpeed * deltaTime * 8;
        }
        
        // LOD updates are handled automatically by THREE.LOD
    }

    /**
     * Get the surface normal at a point (for player gravity alignment)
     */
    getSurfaceNormal(position) {
        // For a sphere, the normal is just the direction from center to point
        const center = this.mesh.position;
        const normal = new THREE.Vector3(
            position.x - center.x,
            position.y - center.y,
            position.z - center.z
        );
        normal.normalize();
        return normal;
    }

    /**
     * Get distance from center
     */
    getDistanceFromCenter(position) {
        return this.mesh.position.distanceTo(position);
    }

    /**
     * Check if a point is on the surface (within tolerance)
     */
    isOnSurface(position, tolerance = 2) {
        const distance = this.getDistanceFromCenter(position);
        return Math.abs(distance - this.config.radius) <= tolerance;
    }

    /**
     * Get the gravitational acceleration at a point
     */
    getGravityAtPoint(position) {
        const G = Config.physics.G;
        const mass = this.config.mass;
        
        const dx = this.mesh.position.x - position.x;
        const dy = this.mesh.position.y - position.y;
        const dz = this.mesh.position.z - position.z;
        
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const distance = Math.sqrt(distanceSquared);
        
        if (distance < 1) return new THREE.Vector3(0, 0, 0);
        
        const acceleration = (G * mass) / distanceSquared;
        
        return new THREE.Vector3(
            (dx / distance) * acceleration,
            (dy / distance) * acceleration,
            (dz / distance) * acceleration
        );
    }

    /**
     * Apply textures (for future enhancement)
     */
    applyTexture(textureUrl) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(textureUrl, (texture) => {
            this.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });
        });
    }

    /**
     * Get world position
     */
    getPosition() {
        return this.mesh.position.clone();
    }

    /**
     * Get velocity from physics body
     */
    getVelocity() {
        if (this.body) {
            return new THREE.Vector3(
                this.body.velocity.x,
                this.body.velocity.y,
                this.body.velocity.z
            );
        }
        return new THREE.Vector3(0, 0, 0);
    }

    /**
     * Cleanup
     */
    dispose() {
        // Dispose geometries
        this.mesh.traverse((child) => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                child.material.dispose();
            }
        });
        
        // Remove from physics world
        if (this.body) {
            this.physicsWorld.removeBody(this.mesh);
        }
    }
}

/**
 * InteractiveObject - Similar to CelestialBody but for small objects
 */
export class InteractiveObject {
    constructor(config, physicsWorld) {
        this.config = config;
        this.physicsWorld = physicsWorld;
        this.name = config.name;
        
        this.mesh = null;
        this.body = null;
        this.isGrabbed = false;
        
        this.init();
    }

    /**
     * Initialize the interactive object
     */
    init() {
        this.createMesh();
        this.createPhysicsBody();
    }

    /**
     * Create visual mesh based on type
     */
    createMesh() {
        let geometry;
        
        switch (this.config.type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(this.config.radius, 16, 16);
                break;
            case 'box':
                const dims = this.config.dimensions;
                geometry = new THREE.BoxGeometry(dims[0], dims[1], dims[2]);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(this.config.radius);
                break;
            default:
                geometry = new THREE.SphereGeometry(1, 16, 16);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.7,
            metalness: 0.3,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        this.mesh.position.set(
            this.config.position[0],
            this.config.position[1],
            this.config.position[2]
        );
        
        this.mesh.userData.interactiveObject = this;
    }

    /**
     * Create physics body based on type
     */
    createPhysicsBody() {
        const position = this.config.position;
        const velocity = this.config.velocity;
        const mass = this.config.mass;
        
        if (this.config.type === 'box') {
            this.body = this.physicsWorld.createBoxBody(
                this.config.dimensions,
                mass,
                position,
                velocity
            );
        } else {
            // Sphere or octahedron (use sphere collision)
            this.body = this.physicsWorld.createSphereBody(
                this.config.radius,
                mass,
                position,
                velocity
            );
        }
        
        this.physicsWorld.addBody(this.mesh, this.body, false);
    }

    /**
     * Update the object (apply gravity if needed)
     */
    update(deltaTime) {
        // Apply N-body gravity to this object
        if (!this.isGrabbed) {
            this.physicsWorld.applyGravityToBody(this.body);
        }
    }

    /**
     * Grab the object (disable physics temporarily)
     */
    grab() {
        this.isGrabbed = true;
        this.body.velocity.set(0, 0, 0);
        this.body.angularVelocity.set(0, 0, 0);
    }

    /**
     * Release the object
     */
    release(impulse = null) {
        this.isGrabbed = false;
        if (impulse) {
            this.body.velocity.set(impulse[0], impulse[1], impulse[2]);
        }
    }

    /**
     * Get position
     */
    getPosition() {
        return this.mesh.position.clone();
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
        }
        if (this.mesh.material) {
            this.mesh.material.dispose();
        }
        
        if (this.body) {
            this.physicsWorld.removeBody(this.mesh);
        }
    }
}

export default CelestialBody;
