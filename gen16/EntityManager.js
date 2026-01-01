/**
 * EntityManager.js - Entity Management System
 * Manages creation, updating, and synchronization of all game entities
 */

class EntityManager {
    constructor(config, physicsEngine, renderer) {
        this.config = config;
        this.physics = physicsEngine;
        this.renderer = renderer;
        
        this.entities = new Map(); // name -> entity object
        this.entityTypes = new Map(); // name -> type ('celestial', 'object', 'player')
        
        this.rotations = new Map(); // Track rotation for visual rendering
        this.lastPositions = new Map(); // For interpolation
        
        Logger.info('EntityManager initialized');
    }

    /**
     * Create all celestial bodies
     */
    createCelestialBodies() {
        try {
            let count = 0;
            for (const [key, config] of Object.entries(this.config.BODIES)) {
                this.createCelestialBody(key, config);
                count++;
            }
            console.log(`EntityManager: Created ${count} celestial bodies`);
            Logger.info(`Celestial bodies created: ${count}`);
        } catch (error) {
            Logger.error(`Failed to create celestial bodies: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a single celestial body
     */
    createCelestialBody(key, bodyConfig) {
        const name = bodyConfig.name;
        
        // Add to physics
        this.physics.addBody(
            name,
            bodyConfig.mass,
            bodyConfig.radius,
            bodyConfig.position,
            bodyConfig.velocity,
            false // Not kinematic
        );
        
        // Create mesh
        this.renderer.createCelestialMesh(
            name,
            bodyConfig.radius,
            bodyConfig.color,
            bodyConfig.emissive,
            bodyConfig.emissiveIntensity || 0,
            bodyConfig.segments || 32
        );
        
        // Store entity data
        this.entities.set(name, {
            name,
            type: 'celestial',
            config: bodyConfig,
            rotationSpeed: bodyConfig.rotationSpeed || 0,
        });
        
        this.entityTypes.set(name, 'celestial');
        this.rotations.set(name, { x: 0, y: 0, z: 0 });
        this.lastPositions.set(name, { ...bodyConfig.position });
    }

    /**
     * Create interactive objects
     */
    createInteractiveObjects() {
        try {
            for (const objConfig of this.config.OBJECTS) {
                this.createInteractiveObject(objConfig);
            }
            console.log(`EntityManager: Created ${this.config.OBJECTS.length} interactive objects`);
            Logger.info(`Interactive objects created: ${this.config.OBJECTS.length}`);
        } catch (error) {
            Logger.error(`Failed to create interactive objects: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a single interactive object
     */
    createInteractiveObject(objConfig) {
        const name = objConfig.name;
        
        // Determine radius for physics
        let radius = objConfig.radius || 1;
        if (objConfig.type === 'box') {
            radius = Math.max(objConfig.dimensions.x, objConfig.dimensions.y, objConfig.dimensions.z) / 2;
        }
        
        // Add to physics
        this.physics.addBody(
            name,
            objConfig.mass,
            radius,
            objConfig.position,
            objConfig.velocity || { x: 0, y: 0, z: 0 },
            false // Not kinematic
        );
        
        // Create mesh
        this.renderer.createObjectMesh(
            name,
            objConfig.type,
            objConfig.type === 'sphere' ? { radius } : objConfig.dimensions,
            objConfig.color
        );
        
        // Store entity data
        this.entities.set(name, {
            name,
            type: 'object',
            config: objConfig,
            isGrabbed: false,
            grabOffset: { x: 0, y: 0, z: 0 },
        });
        
        this.entityTypes.set(name, 'object');
        this.rotations.set(name, { x: 0, y: 0, z: 0 });
        this.lastPositions.set(name, { ...objConfig.position });
    }

    /**
     * Update all entities from physics simulation
     */
    updateEntities(deltaTime) {
        const positions = this.physics.getAllPositions();
        const velocities = this.physics.getAllVelocities();
        
        for (const [name, position] of Object.entries(positions)) {
            this.updateEntityTransform(name, position, velocities[name], deltaTime);
        }
    }

    /**
     * Update a single entity's transform
     */
    updateEntityTransform(name, position, velocity, deltaTime) {
        const entity = this.entities.get(name);
        if (!entity) return;
        
        // Update mesh position
        this.renderer.updateMeshTransform(name, position);
        
        // Update rotation for visual effect
        if (entity.rotationSpeed) {
            const rotation = this.rotations.get(name);
            rotation.y += entity.rotationSpeed * deltaTime;
            this.renderer.updateMeshTransform(name, position, rotation);
        }
        
        this.lastPositions.set(name, { ...position });
    }

    /**
     * Update sun light to follow sun mesh
     */
    updateSunLight() {
        const sunPos = this.physics.getPosition('Sun');
        if (sunPos) {
            this.renderer.updateSunLight(new THREE.Vector3(sunPos.x, sunPos.y, sunPos.z));
        }
    }

    /**
     * Grab an interactive object
     */
    grabObject(name) {
        const entity = this.entities.get(name);
        if (!entity || entity.type === 'celestial') return false;
        
        entity.isGrabbed = true;
        Logger.info(`Grabbed object: ${name}`);
        return true;
    }

    /**
     * Release a grabbed object
     */
    releaseObject(name) {
        const entity = this.entities.get(name);
        if (!entity) return false;
        
        entity.isGrabbed = false;
        Logger.info(`Released object: ${name}`);
        return true;
    }

    /**
     * Apply force to grabbed object toward player hand
     */
    updateGrabbedObject(name, targetPosition, force) {
        const entity = this.entities.get(name);
        if (!entity || !entity.isGrabbed) return;
        
        const objPos = this.physics.getPosition(name);
        if (!objPos) return;
        
        // Calculate direction to target
        const dx = targetPosition.x - objPos.x;
        const dy = targetPosition.y - objPos.y;
        const dz = targetPosition.z - objPos.z;
        
        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (distance < 0.1) {
            // Already at target
            this.physics.setVelocity(name, { x: 0, y: 0, z: 0 });
            return;
        }
        
        const dirX = dx / distance;
        const dirY = dy / distance;
        const dirZ = dz / distance;
        
        // Apply attractive force
        this.physics.applyForce(name, {
            x: dirX * force,
            y: dirY * force,
            z: dirZ * force,
        });
    }

    /**
     * Get entity info
     */
    getEntity(name) {
        return this.entities.get(name);
    }

    /**
     * Get entity position
     */
    getEntityPosition(name) {
        return this.physics.getPosition(name);
    }

    /**
     * Get all entities
     */
    getAllEntities() {
        return Array.from(this.entities.values());
    }

    /**
     * Get entity count
     */
    getEntityCount() {
        return this.entities.size;
    }

    /**
     * Find nearest interactive object to player
     */
    findNearestInteractiveObject(playerPos, maxDistance) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const [name, entity] of this.entities) {
            if (entity.type !== 'object') continue;
            
            const dist = this.physics.getDistance('Player', name);
            if (dist && dist < nearestDist) {
                nearestDist = dist;
                nearest = name;
            }
        }
        
        return nearest;
    }

    /**
     * Add a special entity (e.g., blackhole, telescope)
     * Allows for easy extension without refactoring core
     */
    addSpecialEntity(name, config) {
        try {
            if (config.type === 'blackhole') {
                this.createBlackhole(name, config);
            } else if (config.type === 'telescope') {
                this.createTelescope(name, config);
            } else {
                Logger.warn(`Unknown special entity type: ${config.type}`);
            }
        } catch (error) {
            Logger.error(`Failed to add special entity ${name}: ${error.message}`);
        }
    }

    /**
     * Create a blackhole (gravitational sink with visual effect)
     */
    createBlackhole(name, config) {
        // Physics body
        this.physics.addBody(
            name,
            config.mass,
            config.radius,
            config.position,
            { x: 0, y: 0, z: 0 },
            true // Kinematic
        );
        
        // Visual mesh (dark sphere with ring)
        const geometry = new THREE.IcosahedronGeometry(config.radius, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x1a0033,
            roughness: 1,
            metalness: 0,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.userData.name = name;
        
        this.renderer.getScene().add(mesh);
        this.renderer.meshes.set(name, mesh);
        
        // Accretion disk ring
        const ringGeometry = new THREE.TorusGeometry(config.radius * 2, config.radius * 0.5, 16, 64);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xFF6B00,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8,
            metalness: 0.8,
            roughness: 0.2,
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI * 0.3;
        ring.position.copy(config.position);
        this.renderer.getScene().add(ring);
        
        this.entities.set(name, {
            name,
            type: 'blackhole',
            config,
            ring,
        });
        
        Logger.info(`Blackhole created: ${name}`);
    }

    /**
     * Create a telescope (visual landmark)
     */
    createTelescope(name, config) {
        const group = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.CylinderGeometry(config.baseRadius, config.baseRadius, 2, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x404040,
            metalness: 0.5,
            roughness: 0.7,
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Tube
        const tubeGeometry = new THREE.CylinderGeometry(0.5, 0.5, config.length, 8);
        const tubeMaterial = new THREE.MeshStandardMaterial({
            color: 0x505050,
            metalness: 0.6,
            roughness: 0.6,
        });
        const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
        tube.castShadow = true;
        tube.receiveShadow = true;
        tube.position.z = config.length / 2;
        group.add(tube);
        
        // Lens
        const lensGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const lensMaterial = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.6,
        });
        const lens = new THREE.Mesh(lensGeometry, lensMaterial);
        lens.castShadow = true;
        lens.receiveShadow = true;
        lens.position.z = config.length;
        group.add(lens);
        
        group.position.set(config.position.x, config.position.y, config.position.z);
        group.userData.name = name;
        
        this.renderer.getScene().add(group);
        
        this.entities.set(name, {
            name,
            type: 'telescope',
            config,
            group,
        });
        
        Logger.info(`Telescope created: ${name}`);
    }
}
