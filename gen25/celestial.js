/**
 * CELESTIAL BODIES & INTERACTIVE OBJECTS
 * Manages creation and rendering of stars, planets, moons, and interactive objects.
 */

/**
 * Celestial Body (Stars, Planets, Moons)
 */
class CelestialBody extends PhysicsBody {
    constructor(config, scene) {
        super(config);
        
        this.scene = scene;
        this.config = config;
        this.rotationSpeed = config.rotationSpeed || 0;
        
        // Visual properties
        this.color = config.color || 0xFFFFFF;
        this.emissive = config.emissive || 0x000000;
        this.emissiveIntensity = config.emissiveIntensity || 0;
        this.visualScale = config.visualScale || 1.0;
        
        // Rendering
        this.mesh = null;
        this.light = null;
        this.atmosphere = null;
        
        this.createMesh();
    }

    /**
     * Create 3D mesh for the celestial body
     */
    createMesh() {
        const visualRadius = this.radius * this.visualScale;
        
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(visualRadius, 64, 64);
        
        // Create material based on type
        let material;
        if (this.type === 'star') {
            // Emissive material for stars
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.emissive,
                emissiveIntensity: this.emissiveIntensity,
                roughness: 1,
                metalness: 0,
            });
        } else {
            // Standard material for planets/moons
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.8,
                metalness: 0.2,
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = this.type !== 'star';
        this.mesh.receiveShadow = this.type !== 'star';
        this.mesh.userData.celestialBody = this;
        
        this.scene.add(this.mesh);
        
        // Add light for stars
        if (this.type === 'star' && this.config.lightIntensity) {
            this.createLight();
        }
        
        // Add atmosphere for planets
        if (this.config.atmosphere) {
            this.createAtmosphere();
        }
    }

    /**
     * Create light source for stars
     */
    createLight() {
        this.light = new THREE.PointLight(
            this.color,
            this.config.lightIntensity,
            0, // infinite range
            2  // decay
        );
        this.light.position.copy(this.position);
        this.light.castShadow = CONFIG.rendering.shadowsEnabled;
        
        if (this.light.castShadow) {
            this.light.shadow.mapSize.width = CONFIG.rendering.shadowMapSize;
            this.light.shadow.mapSize.height = CONFIG.rendering.shadowMapSize;
            this.light.shadow.camera.near = this.radius * 2;
            this.light.shadow.camera.far = 1e12;
            this.light.shadow.bias = -0.0001;
        }
        
        this.scene.add(this.light);
    }

    /**
     * Create atmospheric halo effect
     */
    createAtmosphere() {
        const visualRadius = this.radius * this.visualScale;
        const atmosphereRadius = visualRadius * 1.1;
        
        const geometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.config.atmosphereColor,
            transparent: true,
            opacity: this.config.atmosphereOpacity,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.atmosphere.position.copy(this.position);
        this.scene.add(this.atmosphere);
    }

    /**
     * Update celestial body
     */
    update(dt) {
        // Update rotation
        this.updateRotation(dt);
        
        // Update light position if star
        if (this.light) {
            this.light.position.copy(this.position);
        }
        
        // Update atmosphere position
        if (this.atmosphere) {
            this.atmosphere.position.copy(this.position);
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
        if (this.atmosphere) {
            this.scene.remove(this.atmosphere);
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }
    }
}

/**
 * Interactive Object (cubes, spheres, etc. that player can interact with)
 */
class InteractiveObject extends PhysicsBody {
    constructor(config, scene, spawnPosition) {
        super({
            name: config.id,
            type: 'interactive',
            mass: config.mass,
            radius: config.radius || config.size / 2,
            position: [
                spawnPosition.x + config.offsetFromPlayer[0],
                spawnPosition.y + config.offsetFromPlayer[1],
                spawnPosition.z + config.offsetFromPlayer[2]
            ],
            velocity: [0, 0, 0],
            physicsEnabled: true,
            isStatic: false,
        });
        
        this.scene = scene;
        this.config = config;
        this.size = config.size || config.radius * 2;
        this.color = config.color;
        this.luminous = config.luminous || false;
        
        // Interaction
        this.isHeld = false;
        this.heldBy = null;
        
        this.createMesh();
    }

    /**
     * Create 3D mesh for the object
     */
    createMesh() {
        let geometry;
        
        switch (this.config.type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(this.config.radius, 32, 32);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(this.size);
                break;
            default:
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            emissive: this.config.emissive,
            emissiveIntensity: this.config.emissiveIntensity,
            roughness: 0.7,
            metalness: 0.3,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactiveObject = this;
        
        this.scene.add(this.mesh);
        
        // Add point light if luminous
        if (this.luminous) {
            this.light = new THREE.PointLight(
                this.color,
                this.config.emissiveIntensity * 2,
                50,
                2
            );
            this.light.position.copy(this.position);
            this.scene.add(this.light);
        }
    }

    /**
     * Update object
     */
    update(dt) {
        // Update mesh position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Update light position
        if (this.light) {
            this.light.position.copy(this.position);
        }
        
        // Add slight rotation for visual interest
        if (this.mesh && !this.isHeld) {
            this.mesh.rotation.x += dt * 0.5;
            this.mesh.rotation.y += dt * 0.3;
        }
    }

    /**
     * Pick up object
     */
    grab(holder) {
        this.isHeld = true;
        this.heldBy = holder;
        this.physicsEnabled = false; // Disable physics while held
    }

    /**
     * Release object
     */
    release(impulse) {
        this.isHeld = false;
        this.heldBy = null;
        this.physicsEnabled = true;
        
        if (impulse) {
            this.velocity.copy(impulse);
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.light) {
            this.scene.remove(this.light);
        }
    }
}

/**
 * Starfield background
 */
class Starfield {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.mesh = null;
        
        this.create();
    }

    /**
     * Create starfield
     */
    create() {
        const starCount = this.config.skybox.starCount;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 1e12; // Very far away
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
            
            // Slight color variation for realism
            const brightness = 0.8 + Math.random() * 0.2;
            const colorVariation = Math.random();
            
            if (colorVariation < 0.7) {
                // White stars
                colors.push(brightness, brightness, brightness);
            } else if (colorVariation < 0.85) {
                // Blue stars
                colors.push(brightness * 0.8, brightness * 0.9, brightness);
            } else {
                // Orange/red stars
                colors.push(brightness, brightness * 0.8, brightness * 0.6);
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.config.skybox.starSize,
            vertexColors: true,
            sizeAttenuation: false,
        });
        
        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);
    }

    /**
     * Update starfield (rotate slowly for subtle effect)
     */
    update(dt) {
        if (this.mesh) {
            this.mesh.rotation.y += dt * 0.00001;
        }
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

/**
 * Celestial System Manager
 */
class CelestialSystem {
    constructor(scene, physicsEngine, config) {
        this.scene = scene;
        this.physics = physicsEngine;
        this.config = config;
        
        this.celestialBodies = {};
        this.interactiveObjects = [];
        this.starfield = null;
        
        this.initialize();
    }

    /**
     * Initialize the solar system
     */
    initialize() {
        console.log('Initializing celestial system...');
        
        // Create sun
        this.createCelestialBody('sun', this.config.sun);
        
        // Create planets
        this.createCelestialBody('planet1', this.config.planet1);
        this.createCelestialBody('planet2', this.config.planet2);
        
        // Create moon
        this.createCelestialBody('moon1', this.config.moon1);
        
        // Create starfield
        if (this.config.skybox.enabled) {
            this.starfield = new Starfield(this.scene, this.config);
        }
        
        console.log(`Created ${Object.keys(this.celestialBodies).length} celestial bodies`);
    }

    /**
     * Create a celestial body
     */
    createCelestialBody(id, config) {
        const body = new CelestialBody(config, this.scene);
        this.celestialBodies[id] = body;
        this.physics.addBody(body);
        return body;
    }

    /**
     * Create interactive objects near spawn point
     */
    createInteractiveObjects(spawnPosition) {
        console.log('Creating interactive objects...');
        
        for (let objConfig of this.config.interactiveObjects) {
            const obj = new InteractiveObject(objConfig, this.scene, spawnPosition);
            this.interactiveObjects.push(obj);
            this.physics.addBody(obj);
        }
        
        console.log(`Created ${this.interactiveObjects.length} interactive objects`);
    }

    /**
     * Get celestial body by ID
     */
    getBody(id) {
        return this.celestialBodies[id];
    }

    /**
     * Get spawn planet
     */
    getSpawnPlanet() {
        for (let id in this.celestialBodies) {
            const body = this.celestialBodies[id];
            if (body.config.hasPlayerSpawn) {
                return body;
            }
        }
        return this.celestialBodies['planet1']; // Default
    }

    /**
     * Update all celestial bodies
     */
    update(dt) {
        // Update celestial bodies
        for (let id in this.celestialBodies) {
            this.celestialBodies[id].update(dt);
        }
        
        // Update interactive objects
        for (let obj of this.interactiveObjects) {
            obj.update(dt);
        }
        
        // Update starfield
        if (this.starfield) {
            this.starfield.update(dt);
        }
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        for (let id in this.celestialBodies) {
            this.celestialBodies[id].dispose();
        }
        for (let obj of this.interactiveObjects) {
            obj.dispose();
        }
        if (this.starfield) {
            this.starfield.dispose();
        }
    }
}
