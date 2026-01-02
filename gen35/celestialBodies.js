/**
 * CELESTIAL BODIES
 * Sun, planets, moons - all participating in N-body physics
 */

class CelestialBody {
    constructor(name, config, scene, physicsEngine) {
        this.name = name;
        this.config = config;
        this.scene = scene;
        this.physics = physicsEngine;
        
        // Physical properties
        this.mass = config.mass;
        this.radius = config.radius;
        this.displayRadius = config.displayRadius;
        this.rotationPeriod = config.rotationPeriod;
        this.isCelestial = true;
        this.fixed = false;
        
        // Position and velocity
        this.position = { ...config.position } || { x: 0, y: 0, z: 0 };
        this.velocity = { ...config.velocity } || { x: 0, y: 0, z: 0 };
        
        // Rotation
        this.rotation = 0;
        this.rotationSpeed = (2 * Math.PI) / config.rotationPeriod; // rad/s
        
        // Three.js mesh
        this.mesh = null;
        this.light = null;
        
        // Create visual representation
        this.createMesh();
        
        // Register with physics
        this.physics.registerBody(this);
    }

    createMesh() {
        // Override in subclasses
    }

    update(deltaTime) {
        // Update rotation
        this.rotation += this.rotationSpeed * deltaTime * CONFIG.physics.timeScale;
        
        if (this.mesh) {
            // Update mesh position
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            
            // Update mesh rotation
            this.mesh.rotation.y = this.rotation;
        }
        
        if (this.light) {
            // Update light position
            this.light.position.set(this.position.x, this.position.y, this.position.z);
        }
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

class Sun extends CelestialBody {
    constructor(config, scene, physicsEngine) {
        super('Sun', config.sun, scene, physicsEngine);
        this.fixed = true; // Sun stays at origin
        this.luminosity = this.config.luminosity;
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.displayRadius, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            emissive: this.config.color,
            emissiveIntensity: this.config.emissiveIntensity,
            roughness: 1,
            metalness: 0,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        this.scene.add(this.mesh);
        
        // Create sun light
        this.light = new THREE.PointLight(
            this.config.lightColor,
            this.config.lightIntensity,
            0, // Infinite distance
            2  // Decay
        );
        this.light.position.set(this.position.x, this.position.y, this.position.z);
        this.light.castShadow = true;
        this.light.shadow.mapSize.width = CONFIG.rendering.shadowMapSize;
        this.light.shadow.mapSize.height = CONFIG.rendering.shadowMapSize;
        this.light.shadow.camera.near = 0.1;
        this.light.shadow.camera.far = 1000;
        this.light.shadow.bias = -0.001;
        this.scene.add(this.light);
        
        console.log('[SUN] Created at origin with light');
    }
}

class Planet extends CelestialBody {
    constructor(name, config, planetConfig, scene, physicsEngine) {
        // Set initial position and velocity for orbit
        const angle = Math.random() * Math.PI * 2; // Random starting angle
        planetConfig.position = {
            x: planetConfig.displayOrbitalRadius * Math.cos(angle),
            y: 0,
            z: planetConfig.displayOrbitalRadius * Math.sin(angle)
        };
        
        // Set velocity perpendicular to radius for circular orbit
        // Velocities are now in display units
        const displayVelocity = planetConfig.orbitalVelocity;
        
        planetConfig.velocity = {
            x: -displayVelocity * Math.sin(angle),
            y: 0,
            z: displayVelocity * Math.cos(angle)
        };
        
        super(name, planetConfig, scene, physicsEngine);
        
        this.orbitalRadius = planetConfig.orbitalRadius;
        this.displayOrbitalRadius = planetConfig.displayOrbitalRadius;
        this.hasAtmosphere = planetConfig.hasAtmosphere || false;
        this.atmosphereMesh = null;
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.displayRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.8,
            metalness: 0.2,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Add atmosphere if applicable
        if (this.hasAtmosphere) {
            const atmGeometry = new THREE.SphereGeometry(this.displayRadius * 1.05, 32, 32);
            const atmMaterial = new THREE.MeshStandardMaterial({
                color: this.config.atmosphereColor,
                transparent: true,
                opacity: this.config.atmosphereOpacity,
                side: THREE.BackSide,
                depthWrite: false,
            });
            
            this.atmosphereMesh = new THREE.Mesh(atmGeometry, atmMaterial);
            this.mesh.add(this.atmosphereMesh);
        }
        
        console.log(`[PLANET] ${this.name} created at (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)})`);
        console.log(`  Velocity: (${this.velocity.x.toFixed(2)}, ${this.velocity.y.toFixed(2)}, ${this.velocity.z.toFixed(2)}) m/s`);
    }
}

class Moon extends CelestialBody {
    constructor(name, config, moonConfig, parentPlanet, scene, physicsEngine) {
        // Set initial position relative to parent planet BEFORE calling super
        const angle = Math.random() * Math.PI * 2;
        moonConfig.position = {
            x: parentPlanet.position.x + moonConfig.displayOrbitalRadius * Math.cos(angle),
            y: parentPlanet.position.y,
            z: parentPlanet.position.z + moonConfig.displayOrbitalRadius * Math.sin(angle)
        };
        
        // Set velocity: parent's velocity + orbital velocity around parent
        // Velocities are now in display units
        const displayVelocity = moonConfig.orbitalVelocity;
        
        moonConfig.velocity = {
            x: parentPlanet.velocity.x - displayVelocity * Math.sin(angle),
            y: parentPlanet.velocity.y,
            z: parentPlanet.velocity.z + displayVelocity * Math.cos(angle)
        };
        
        // Call super constructor
        super(name, moonConfig, scene, physicsEngine);
        
        // Now we can set instance properties
        this.parentPlanet = parentPlanet;
        this.orbitalRadius = moonConfig.orbitalRadius;
        this.displayOrbitalRadius = moonConfig.displayOrbitalRadius;
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.displayRadius, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.9,
            metalness: 0.1,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        console.log(`[MOON] ${this.name} created`);
    }
}

/**
 * Create all celestial bodies for the solar system
 */
function createSolarSystem(config, scene, physicsEngine) {
    console.log('[SOLAR SYSTEM] Initializing...');
    
    const bodies = {};
    
    // Create Sun
    bodies.sun = new Sun(config, scene, physicsEngine);
    
    // Create Planets
    bodies.planet1 = new Planet('Planet 1', config, config.planet1, scene, physicsEngine);
    bodies.planet2 = new Planet('Planet 2', config, config.planet2, scene, physicsEngine);
    
    // Create Moon orbiting Planet 1
    bodies.moon1 = new Moon('Moon 1', config, config.moon1, bodies.planet1, scene, physicsEngine);
    
    console.log('[SOLAR SYSTEM] Initialization complete');
    console.log(`  Total bodies: ${Object.keys(bodies).length}`);
    
    return bodies;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CelestialBody, Sun, Planet, Moon, createSolarSystem };
}
