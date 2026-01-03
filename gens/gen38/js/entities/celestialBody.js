/**
 * Solar System Simulation - Celestial Body Base Class
 * ====================================================
 * Base class for all celestial bodies (Sun, Planets, Moons).
 * Designed for easy extension with special entities (black holes, etc.)
 */

class CelestialBody {
    constructor(config) {
        // Identity
        this.name = config.name || 'Unknown Body';
        this.type = config.type || 'body';
        
        // Physical properties (real-world values)
        this.mass = config.mass || 1e20;
        this.radius = config.radius || 1e6;
        this.density = config.density || 1000;
        this.rotationPeriod = config.rotationPeriod || 86400;
        
        // Position and velocity in real-world coordinates (meters, m/s)
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
        
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.prevAcceleration = new THREE.Vector3(0, 0, 0);
        
        // Rotation (radians)
        this.rotation = config.rotation || 0;
        this.axialTilt = config.axialTilt || 0;
        
        // Visual properties
        this.visualRadius = config.visualRadius || 1;
        this.color = config.color || 0xFFFFFF;
        
        // Three.js objects
        this.mesh = null;
        this.group = new THREE.Group();
        this.orbitLine = null;
        
        // Parent reference (for moons)
        this.parent = config.parent || null;
        this.children = [];
        
        // State
        this.isVisible = true;
        this.needsUpdate = true;
        
        Logger.debug(`CelestialBody created: ${this.name}`);
    }
    
    /**
     * Initialize the visual mesh - to be overridden by subclasses
     */
    createMesh() {
        const geometry = new THREE.SphereGeometry(this.visualRadius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.8,
            metalness: 0.2,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Apply axial tilt
        this.mesh.rotation.z = this.axialTilt;
        
        this.group.add(this.mesh);
        
        return this.group;
    }
    
    /**
     * Update mesh position from physics position
     */
    updateMeshPosition() {
        if (!this.mesh) return;
        
        // Scale position for rendering
        const scale = Config.scale.distance;
        this.group.position.set(
            this.position.x * scale,
            this.position.y * scale,
            this.position.z * scale
        );
        
        // Update rotation
        if (this.mesh) {
            this.mesh.rotation.y = this.rotation;
        }
    }
    
    /**
     * Create orbit visualization line
     */
    createOrbitLine(parentBody, segments = 128) {
        if (!parentBody) return null;
        
        const points = [];
        const orbitalRadius = MathUtils.distanceVec3(this.position, parentBody.position);
        const scaledRadius = orbitalRadius * Config.scale.distance;
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * MathUtils.TWO_PI;
            points.push(new THREE.Vector3(
                Math.cos(theta) * scaledRadius,
                0,
                Math.sin(theta) * scaledRadius
            ));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            opacity: 0.3,
            transparent: true,
        });
        
        this.orbitLine = new THREE.Line(geometry, material);
        this.orbitLine.visible = Config.debug.showOrbits;
        
        return this.orbitLine;
    }
    
    /**
     * Set visibility
     */
    setVisible(visible) {
        this.isVisible = visible;
        if (this.group) {
            this.group.visible = visible;
        }
    }
    
    /**
     * Get surface position (for spawning objects/players)
     */
    getSurfacePosition(latitude, longitude) {
        const scaledRadius = this.visualRadius;
        const phi = (90 - latitude) * MathUtils.DEG_TO_RAD;
        const theta = longitude * MathUtils.DEG_TO_RAD;
        
        const localPos = MathUtils.sphericalToCartesian(scaledRadius, theta, phi);
        
        return {
            x: this.group.position.x + localPos.x,
            y: this.group.position.y + localPos.y,
            z: this.group.position.z + localPos.z
        };
    }
    
    /**
     * Get surface normal at position
     */
    getSurfaceNormal(worldPosition) {
        const dx = worldPosition.x - this.group.position.x;
        const dy = worldPosition.y - this.group.position.y;
        const dz = worldPosition.z - this.group.position.z;
        
        return MathUtils.normalize(dx, dy, dz);
    }
    
    /**
     * Calculate surface gravity
     */
    getSurfaceGravity() {
        return MathUtils.surfaceGravity(Config.physics.G, this.mass, this.radius);
    }
    
    /**
     * Calculate escape velocity
     */
    getEscapeVelocity() {
        return MathUtils.escapeVelocity(Config.physics.G, this.mass, this.radius);
    }
    
    /**
     * Get orbital velocity around this body at given radius
     */
    getOrbitalVelocity(radius) {
        return MathUtils.orbitalVelocity(Config.physics.G, this.mass, radius);
    }
    
    /**
     * Check if a point is inside this body
     */
    containsPoint(point) {
        const dist = MathUtils.distanceVec3(point, this.group.position);
        return dist <= this.visualRadius;
    }
    
    /**
     * Get distance to another body or point
     */
    distanceTo(target) {
        if (target.position) {
            return MathUtils.distanceVec3(this.position, target.position);
        }
        return MathUtils.distanceVec3(this.group.position, target);
    }
    
    /**
     * Add child body (e.g., moon)
     */
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
    
    /**
     * Update method called each frame
     */
    update(deltaTime) {
        // Override in subclasses for specific behavior
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.orbitLine) {
            this.orbitLine.geometry.dispose();
            this.orbitLine.material.dispose();
        }
        
        Logger.debug(`Disposed celestial body: ${this.name}`);
    }
    
    /**
     * Get serializable state
     */
    getState() {
        return {
            name: this.name,
            type: this.type,
            mass: this.mass,
            radius: this.radius,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
            rotation: this.rotation,
        };
    }
    
    /**
     * Restore from state
     */
    setState(state) {
        if (state.position) {
            this.position.set(state.position.x, state.position.y, state.position.z);
        }
        if (state.velocity) {
            this.velocity.set(state.velocity.x, state.velocity.y, state.velocity.z);
        }
        if (state.rotation !== undefined) {
            this.rotation = state.rotation;
        }
        this.updateMeshPosition();
    }
}
