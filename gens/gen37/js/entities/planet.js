/**
 * Planet - A celestial body orbiting a star
 */

class Planet extends CelestialBody {
    constructor(configKey) {
        const config = Config.PLANETS[configKey];
        if (!config) {
            throw new Error(`Unknown planet configuration: ${configKey}`);
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
            axialTilt: config.axialTilt,
            hasAtmosphere: config.hasAtmosphere,
            atmosphereColor: config.atmosphereColor,
            atmosphereOpacity: config.atmosphereOpacity,
            atmosphereScale: config.atmosphereScale,
            roughness: config.roughness,
            metalness: config.metalness
        });
        
        this.type = 'planet';
        this.configKey = configKey;
        this.surfaceGravity = config.surfaceGravity;
        this.density = config.density;
        
        // Moons orbiting this planet
        this.moons = [];
    }
    
    /**
     * Initialize the planet
     */
    init(scene, sun) {
        // Call parent init which sets up orbit around sun
        super.init(scene, sun);
        
        Logger.info('Planet', 
            `${this.name} initialized - Orbital radius: ${MathUtils.formatDistance(this.orbitalRadius)}, ` +
            `Surface gravity: ${this.surfaceGravity.toFixed(2)} m/s²`
        );
    }
    
    /**
     * Override mesh creation for planet-specific features
     */
    createMesh() {
        const fidelity = Config.RENDERING.fidelityLevel;
        const segments = Config.RENDERING.geometry[fidelity].planetSegments;
        
        // Scale radius for visualization
        const visualRadius = Config.scaleSize(this.radius);
        
        const geometry = new THREE.SphereGeometry(visualRadius, segments, segments / 2);
        
        // Create procedural texture-like material
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: this.config.roughness || 0.8,
            metalness: this.config.metalness || 0.1
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.name = this.name;
        
        // Apply axial tilt
        if (this.axialTilt) {
            this.mesh.rotation.z = MathUtils.degToRad(this.axialTilt);
        }
        
        this.group.add(this.mesh);
        
        // Add surface details for visual interest
        this.addSurfaceDetails(visualRadius, segments);
    }
    
    /**
     * Add visual surface details
     */
    addSurfaceDetails(visualRadius, segments) {
        // Add subtle color variation using a second layer
        const detailGeometry = new THREE.SphereGeometry(
            visualRadius * 1.001, 
            segments / 2, 
            segments / 4
        );
        
        // Slightly different shade for surface features
        const darkerColor = new THREE.Color(this.color).multiplyScalar(0.7);
        
        const detailMaterial = new THREE.MeshStandardMaterial({
            color: darkerColor,
            roughness: 0.9,
            metalness: 0.0,
            transparent: true,
            opacity: 0.3
        });
        
        const detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
        detailMesh.rotation.y = Math.random() * Math.PI * 2;
        detailMesh.rotation.x = Math.random() * 0.3;
        
        this.group.add(detailMesh);
    }
    
    /**
     * Add a moon to this planet
     */
    addMoon(moon) {
        this.moons.push(moon);
        this.addChild(moon);
    }
    
    /**
     * Get spawn position on surface
     * Returns a position slightly above the surface at the given coordinates
     */
    getSpawnPosition(latitude = 0, longitude = 0, heightAboveSurface = 10) {
        const latRad = MathUtils.degToRad(latitude);
        const lonRad = MathUtils.degToRad(longitude);
        
        // Get planet's current position
        const planetPos = this.physicsBody.position.clone();
        
        // Calculate surface point in local coordinates
        const r = this.radius + heightAboveSurface;
        const localOffset = new THREE.Vector3(
            r * Math.cos(latRad) * Math.cos(lonRad),
            r * Math.sin(latRad),
            r * Math.cos(latRad) * Math.sin(lonRad)
        );
        
        // Return world position
        return planetPos.add(localOffset);
    }
    
    /**
     * Get the "up" direction at a point (away from center)
     */
    getUpDirection(worldPosition) {
        return worldPosition.clone().sub(this.physicsBody.position).normalize();
    }
    
    /**
     * Check if a point is on or near the surface
     */
    isOnSurface(worldPosition, tolerance = 100) {
        const distanceFromCenter = worldPosition.distanceTo(this.physicsBody.position);
        return Math.abs(distanceFromCenter - this.radius) < tolerance;
    }
    
    /**
     * Get surface velocity at a point (due to rotation)
     */
    getSurfaceVelocityAtPoint(worldPosition) {
        // Angular velocity
        const omega = (2 * Math.PI) / this.rotationPeriod;
        
        // Position relative to planet center
        const relPos = worldPosition.clone().sub(this.physicsBody.position);
        
        // Rotation axis (Y-axis, adjusted for tilt)
        const rotAxis = new THREE.Vector3(0, 1, 0);
        if (this.axialTilt) {
            rotAxis.applyAxisAngle(
                new THREE.Vector3(0, 0, 1), 
                MathUtils.degToRad(this.axialTilt)
            );
        }
        
        // Surface velocity = omega × r
        const surfaceVel = new THREE.Vector3().crossVectors(rotAxis, relPos);
        surfaceVel.multiplyScalar(omega);
        
        // Add planet's orbital velocity
        return surfaceVel.add(this.physicsBody.velocity);
    }
    
    /**
     * Update planet and its moons
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update moons
        for (const moon of this.moons) {
            moon.update(deltaTime);
        }
    }
}

window.Planet = Planet;
