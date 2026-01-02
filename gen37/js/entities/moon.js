/**
 * Moon - A natural satellite orbiting a planet
 */

class Moon extends CelestialBody {
    constructor(configKey) {
        const config = Config.MOONS[configKey];
        if (!config) {
            throw new Error(`Unknown moon configuration: ${configKey}`);
        }
        
        super({
            name: config.name,
            mass: config.mass,
            radius: config.radius,
            color: config.color,
            orbitalRadius: config.orbitalRadius,
            orbitalInclination: config.orbitalInclination,
            orbitalEccentricity: config.orbitalEccentricity,
            rotationPeriod: config.rotationPeriod,
            axialTilt: 0,
            roughness: config.roughness,
            metalness: config.metalness
        });
        
        this.type = 'moon';
        this.configKey = configKey;
        this.parentPlanetKey = config.parentPlanet;
        this.tidallyLocked = config.tidallyLocked || false;
        this.surfaceGravity = config.surfaceGravity;
        this.density = config.density;
    }
    
    /**
     * Initialize the moon
     */
    init(scene, parentPlanet) {
        // Call parent init which sets up orbit around planet
        super.init(scene, parentPlanet);
        
        // If tidally locked, sync rotation with orbit
        if (this.tidallyLocked) {
            this.rotationPeriod = this.orbitalPeriod;
        }
        
        Logger.info('Moon', 
            `${this.name} initialized - Orbiting ${parentPlanet.name}, ` +
            `Orbital radius: ${MathUtils.formatDistance(this.orbitalRadius)}`
        );
    }
    
    /**
     * Override mesh creation for moon-specific features
     */
    createMesh() {
        const fidelity = Config.RENDERING.fidelityLevel;
        const segments = Config.RENDERING.geometry[fidelity].sphereSegments;
        
        // Scale radius for visualization
        const visualRadius = Config.scaleSize(this.radius);
        
        const geometry = new THREE.SphereGeometry(visualRadius, segments, segments / 2);
        
        // Cratered appearance
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: this.config.roughness || 0.95,
            metalness: this.config.metalness || 0.0
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.name;
        
        this.group.add(this.mesh);
        
        // Add crater details
        this.addCraterDetails(visualRadius);
    }
    
    /**
     * Add visual crater details
     */
    addCraterDetails(visualRadius) {
        // Simple approach: add some darker spots as "craters"
        const craterCount = 5;
        
        for (let i = 0; i < craterCount; i++) {
            const craterSize = visualRadius * (0.1 + Math.random() * 0.15);
            const craterGeometry = new THREE.CircleGeometry(craterSize, 16);
            
            const craterMaterial = new THREE.MeshStandardMaterial({
                color: new THREE.Color(this.color).multiplyScalar(0.6),
                roughness: 1.0,
                metalness: 0.0
            });
            
            const crater = new THREE.Mesh(craterGeometry, craterMaterial);
            
            // Position on surface
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            crater.position.set(
                visualRadius * 1.001 * Math.sin(phi) * Math.cos(theta),
                visualRadius * 1.001 * Math.sin(phi) * Math.sin(theta),
                visualRadius * 1.001 * Math.cos(phi)
            );
            
            // Orient to face outward
            crater.lookAt(0, 0, 0);
            crater.rotateX(Math.PI);
            
            this.group.add(crater);
        }
    }
    
    /**
     * Update moon
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // If tidally locked, always face parent planet
        if (this.tidallyLocked && this.orbitParent && this.mesh) {
            const parentPos = Config.scalePosition({
                x: this.orbitParent.physicsBody.position.x,
                y: this.orbitParent.physicsBody.position.y,
                z: this.orbitParent.physicsBody.position.z
            });
            
            // Look at parent while maintaining up direction
            const currentPos = this.group.position.clone();
            const direction = new THREE.Vector3().subVectors(parentPos, currentPos);
            
            // Create rotation to face parent
            this.mesh.lookAt(
                currentPos.x + direction.x,
                currentPos.y,
                currentPos.z + direction.z
            );
        }
    }
}

window.Moon = Moon;
