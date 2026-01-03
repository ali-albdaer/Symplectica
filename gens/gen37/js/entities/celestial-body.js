/**
 * Celestial Body - Base class for all celestial objects (planets, moons, sun)
 */

class CelestialBody extends EntityBase {
    constructor(config) {
        super(config.name, 'celestial');
        
        this.config = config;
        
        // Physical properties
        this.mass = config.mass || 1e24;
        this.radius = config.radius || 1e6;
        this.density = config.density || 5000;
        
        // Orbital properties
        this.orbitalRadius = config.orbitalRadius || 0;
        this.orbitalPeriod = 0;
        this.orbitalVelocity = 0;
        
        // Rotation
        this.rotationPeriod = config.rotationPeriod || 86400;
        this.axialTilt = config.axialTilt || 0;
        this.rotationAngle = 0;
        
        // Visual properties
        this.color = config.color || 0xffffff;
        this.atmosphereColor = config.atmosphereColor;
        this.hasAtmosphere = config.hasAtmosphere || false;
        
        // References
        this.orbitLine = null;
        this.atmosphere = null;
        
        // Parent body for orbiting (sun for planets, planet for moons)
        this.orbitParent = null;
    }
    
    /**
     * Initialize the celestial body
     */
    init(scene, orbitParent = null) {
        this.orbitParent = orbitParent;
        
        // Calculate orbital parameters if orbiting something
        if (orbitParent && this.orbitalRadius > 0) {
            const parentMass = orbitParent.mass;
            this.orbitalVelocity = MathUtils.calculateOrbitalVelocity(
                parentMass, 
                this.orbitalRadius, 
                Config.PHYSICS.G
            );
            this.orbitalPeriod = MathUtils.calculateOrbitalPeriod(
                parentMass, 
                this.orbitalRadius, 
                Config.PHYSICS.G
            );
            
            Logger.info('CelestialBody', 
                `${this.name} orbital velocity: ${MathUtils.formatSI(this.orbitalVelocity)}m/s, ` +
                `period: ${(this.orbitalPeriod / 86400).toFixed(2)} days`
            );
        }
        
        // Create visual representation
        this.createMesh();
        
        // Create atmosphere if applicable
        if (this.hasAtmosphere) {
            this.createAtmosphere();
        }
        
        // Create orbit visualization
        if (this.orbitalRadius > 0 && Config.DEBUG.showOrbits) {
            this.createOrbitLine();
        }
        
        // Create physics body
        this.createPhysicsBody();
        
        // Add to scene
        scene.add(this.group);
        
        Logger.info('CelestialBody', `Initialized ${this.name}`);
    }
    
    /**
     * Create the main mesh
     */
    createMesh() {
        const fidelity = Config.RENDERING.fidelityLevel;
        const segments = Config.RENDERING.geometry[fidelity].planetSegments;
        
        // Scale radius for visualization
        const visualRadius = Config.scaleSize(this.radius);
        
        const geometry = new THREE.SphereGeometry(visualRadius, segments, segments / 2);
        
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
    }
    
    /**
     * Create atmosphere effect
     */
    createAtmosphere() {
        const visualRadius = Config.scaleSize(this.radius);
        const atmosphereScale = this.config.atmosphereScale || 1.02;
        
        const geometry = new THREE.SphereGeometry(
            visualRadius * atmosphereScale, 
            32, 16
        );
        
        const material = new THREE.MeshBasicMaterial({
            color: this.atmosphereColor || 0x88aaff,
            transparent: true,
            opacity: this.config.atmosphereOpacity || 0.15,
            side: THREE.BackSide
        });
        
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.group.add(this.atmosphere);
    }
    
    /**
     * Create orbit visualization line
     */
    createOrbitLine() {
        const scaledRadius = this.orbitalRadius / Config.SCALE.distance;
        const segments = 128;
        
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * scaledRadius,
                0,
                Math.sin(angle) * scaledRadius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444466,
            transparent: true,
            opacity: 0.3
        });
        
        this.orbitLine = new THREE.Line(geometry, material);
        
        // Position orbit at parent's location
        if (this.orbitParent) {
            // Will be updated each frame
        }
    }
    
    /**
     * Create physics body
     */
    createPhysicsBody() {
        // Initial position
        let x = 0, y = 0, z = 0;
        let vx = 0, vy = 0, vz = 0;
        
        if (this.orbitParent && this.orbitalRadius > 0) {
            // Start at +X position relative to parent
            x = this.orbitParent.physicsBody.position.x + this.orbitalRadius;
            y = this.orbitParent.physicsBody.position.y;
            z = this.orbitParent.physicsBody.position.z;
            
            // Velocity perpendicular to radius (in +Z direction for CCW orbit)
            vx = this.orbitParent.physicsBody.velocity.x;
            vy = this.orbitParent.physicsBody.velocity.y;
            vz = this.orbitParent.physicsBody.velocity.z + this.orbitalVelocity;
        }
        
        this.physicsBody = PhysicsEngine.createBody({
            name: this.name,
            x: x,
            y: y,
            z: z,
            vx: vx,
            vy: vy,
            vz: vz,
            mass: this.mass,
            radius: this.radius,
            isCelestial: true,
            isStatic: false,
            affectedByGravity: true
        });
        
        // Link mesh to physics body
        this.physicsBody.mesh = this.group;
    }
    
    /**
     * Update the celestial body
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update visual position from physics
        if (this.physicsBody) {
            const scaledPos = Config.scalePosition({
                x: this.physicsBody.position.x,
                y: this.physicsBody.position.y,
                z: this.physicsBody.position.z
            });
            
            this.group.position.set(scaledPos.x, scaledPos.y, scaledPos.z);
        }
        
        // Self-rotation
        if (this.mesh && this.rotationPeriod > 0) {
            const rotationSpeed = (2 * Math.PI) / this.rotationPeriod;
            this.rotationAngle += rotationSpeed * deltaTime * Config.PHYSICS.timeScale;
            this.mesh.rotation.y = this.rotationAngle;
        }
        
        // Update orbit line position if parent moved
        if (this.orbitLine && this.orbitParent) {
            const parentPos = Config.scalePosition({
                x: this.orbitParent.physicsBody.position.x,
                y: this.orbitParent.physicsBody.position.y,
                z: this.orbitParent.physicsBody.position.z
            });
            this.orbitLine.position.set(parentPos.x, parentPos.y, parentPos.z);
        }
    }
    
    /**
     * Get surface position for a given lat/long
     */
    getSurfacePosition(latitude, longitude) {
        const latRad = MathUtils.degToRad(latitude);
        const lonRad = MathUtils.degToRad(longitude);
        
        const pos = this.physicsBody.position.clone();
        
        // Convert spherical to cartesian
        const r = this.radius;
        const offset = new THREE.Vector3(
            r * Math.cos(latRad) * Math.cos(lonRad),
            r * Math.sin(latRad),
            r * Math.cos(latRad) * Math.sin(lonRad)
        );
        
        return pos.add(offset);
    }
    
    /**
     * Get gravity at surface
     */
    getSurfaceGravity() {
        return MathUtils.calculateSurfaceGravity(this.mass, this.radius, Config.PHYSICS.G);
    }
    
    /**
     * Show/hide orbit line
     */
    setOrbitVisible(visible) {
        if (this.orbitLine) {
            this.orbitLine.visible = visible;
        }
    }
    
    /**
     * Get surface velocity at a point (due to rotation)
     * This is defined at base class level so all celestial bodies have it
     */
    getSurfaceVelocityAtPoint(worldPosition) {
        if (!this.physicsBody) {
            return new THREE.Vector3(0, 0, 0);
        }
        
        // Angular velocity
        const omega = this.rotationPeriod > 0 ? (2 * Math.PI) / this.rotationPeriod : 0;
        
        // Position relative to body center
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
        
        // Add body's orbital velocity
        return surfaceVel.add(this.physicsBody.velocity);
    }
    
    /**
     * Get spawn position on surface (convenience method)
     */
    getSpawnPosition(latitude = 0, longitude = 0, heightAboveSurface = 10) {
        const latRad = MathUtils.degToRad(latitude);
        const lonRad = MathUtils.degToRad(longitude);
        
        // Get body's current position
        const bodyPos = this.physicsBody.position.clone();
        
        // Calculate surface point in local coordinates
        const r = this.radius + heightAboveSurface;
        const localOffset = new THREE.Vector3(
            r * Math.cos(latRad) * Math.cos(lonRad),
            r * Math.sin(latRad),
            r * Math.cos(latRad) * Math.sin(lonRad)
        );
        
        // Return world position
        return bodyPos.add(localOffset);
    }
}

window.CelestialBody = CelestialBody;
