/**
 * Celestial Body Class
 * Specialized entity for planets, moons, and stars with orbital mechanics
 */
class CelestialBody extends Entity {
    constructor(id, config = {}) {
        super(id, config);
        
        this.type = config.type || 'celestial';
        this.sceneRadius = config.sceneRadius || 1;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.luminosity = config.luminosity || 0;
        this.isLightSource = config.isLightSource || false;
        this.emissive = config.emissive !== undefined ? config.emissive : 0x000000;
        this.emissiveIntensity = config.emissiveIntensity !== undefined ? config.emissiveIntensity : 0;
        
        // Orbital parameters
        this.parentBody = null;
        this.orbitDistance = 0;
        this.orbitVelocity = 0;
        this.eccentricity = 0;
        this.inclination = 0;
        this.ascendingNodeLongitude = 0;
        this.argumentOfPeriapsis = 0;
        this.trueAnomaly = 0;
        
        // Rotation axis
        this.axialTilt = config.axialTilt || 0;
        this.rotationAxis = new THREE.Vector3(0, 1, 0);
        
        // LOD
        this.lod = 'high';
        this.lodGeometry = {
            high: null,
            medium: null,
            low: null
        };
    }

    /**
     * Create sphere geometry for celestial body with LOD support
     */
    createGeometry(detailLevel = 'high') {
        const detailMap = {
            high: 64,
            medium: 32,
            low: 16
        };
        
        const segments = detailMap[detailLevel] || 64;
        const geometry = new THREE.IcosahedronGeometry(this.sceneRadius, segments);
        
        this.lodGeometry[detailLevel] = geometry;
        return geometry;
    }

    /**
     * Create material for celestial body
     */
    createMaterial(fidelity = 'medium') {
        const materialOptions = {
            color: new THREE.Color(this.color),
            emissive: new THREE.Color(this.emissive),
            emissiveIntensity: this.emissiveIntensity,
            metalness: 0.3,
            roughness: 0.7,
            castShadow: this.castShadow,
            receiveShadow: this.receiveShadow
        };

        let material;
        if (fidelity === 'ultra') {
            material = new THREE.MeshStandardMaterial(materialOptions);
        } else if (fidelity === 'low') {
            material = new THREE.MeshLambertMaterial({
                color: materialOptions.color,
                emissive: materialOptions.emissive,
                emissiveIntensity: materialOptions.emissiveIntensity
            });
        } else {
            material = new THREE.MeshPhongMaterial(materialOptions);
        }

        this.material = material;
        return material;
    }

    /**
     * Create complete celestial body with mesh
     */
    createMesh(fidelity = 'medium') {
        const detailLevel = fidelity === 'ultra' ? 'high' : fidelity === 'low' ? 'low' : 'medium';
        const geometry = this.createGeometry(detailLevel);
        const material = this.createMaterial(fidelity);
        
        return super.createMesh(geometry, material);
    }

    /**
     * Update LOD based on distance from camera
     */
    updateLOD(cameraPosition) {
        if (!Config.render.enableLOD) return;

        const distance = this.position.distanceTo(cameraPosition);
        
        if (distance < Config.lod.high) {
            this.lod = 'high';
        } else if (distance < Config.lod.medium) {
            this.lod = 'medium';
        } else {
            this.lod = 'low';
        }
    }

    /**
     * Update rotation
     */
    updateRotation(deltaTime) {
        const rotationDelta = this.rotationSpeed * deltaTime;
        const axis = this.rotationAxis.clone().normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, rotationDelta);
        
        this.quaternion.multiplyQuaternions(quaternion, this.quaternion);
        this.rotation.setFromQuaternion(this.quaternion);
    }

    /**
     * Calculate orbital position (simplified Kepler orbit)
     */
    updateOrbitalPosition(deltaTime, parentPosition, parentMass) {
        if (!parentPosition) return;

        // Simple circular orbit approximation
        // In reality, would use Kepler's equations for elliptical orbits
        const distance = this.position.clone().sub(parentPosition).length();
        
        if (distance > 0.1) {
            // Maintain orbital velocity
            const toParent = parentPosition.clone().sub(this.position);
            const tangent = new THREE.Vector3(-toParent.z, 0, toParent.x).normalize();
            
            this.velocity.copy(tangent).multiplyScalar(this.orbitVelocity);
        }
    }

    /**
     * Update entity (overridden for celestial bodies)
     */
    update(deltaTime) {
        if (!this.active) return;

        // Update rotation
        this.updateRotation(deltaTime);

        // Sync with physics
        if (this.physicsBody) {
            this.position.copy(this.physicsBody.position);
            this.velocity.copy(this.physicsBody.velocity);
        }

        // Update mesh
        if (this.mesh && this.visible) {
            this.mesh.position.copy(this.position);
            this.mesh.quaternion.copy(this.quaternion);
        }

        if (this.onUpdate) {
            this.onUpdate(deltaTime);
        }
    }

    /**
     * Get celestial body specific data
     */
    serialize() {
        const base = super.serialize();
        return {
            ...base,
            sceneRadius: this.sceneRadius,
            luminosity: this.luminosity,
            rotationSpeed: this.rotationSpeed
        };
    }
}

/**
 * Special Entity: Blackhole
 * Demonstrates how to extend for special entities
 */
class Blackhole extends CelestialBody {
    constructor(id, config = {}) {
        super(id, config);
        this.type = 'blackhole';
        
        // Schwarzschild radius = 2GM/c^2
        const G = Config.physics.universalG;
        const c = 3e8; // speed of light
        this.schwarzschildRadius = (2 * G * this.mass) / (c * c);
        
        this.eventHorizonColor = config.eventHorizonColor || 0x000000;
        this.accretionDiskColor = config.accretionDiskColor || 0xFF6600;
        this.accretionDiskRadiusScale = config.accretionDiskRadiusScale || 3;
    }

    /**
     * Create blackhole with event horizon and accretion disk
     */
    createMesh(fidelity = 'medium') {
        const group = new THREE.Group();
        
        // Event horizon (dark sphere)
        const horizonGeometry = new THREE.IcosahedronGeometry(this.schwarzschildRadius, 32);
        const horizonMaterial = new THREE.MeshBasicMaterial({
            color: this.eventHorizonColor,
            emissive: this.eventHorizonColor,
            emissiveIntensity: 0.2
        });
        const horizonMesh = new THREE.Mesh(horizonGeometry, horizonMaterial);
        group.add(horizonMesh);
        
        // Accretion disk (glowing ring)
        const diskGeometry = new THREE.TorusGeometry(
            this.schwarzschildRadius * this.accretionDiskRadiusScale,
            this.schwarzschildRadius * 0.5,
            32,
            100
        );
        const diskMaterial = new THREE.MeshBasicMaterial({
            color: this.accretionDiskColor,
            emissive: this.accretionDiskColor,
            emissiveIntensity: 1.0,
            side: THREE.DoubleSide
        });
        const diskMesh = new THREE.Mesh(diskGeometry, diskMaterial);
        diskMesh.rotation.x = Math.PI / 4;
        group.add(diskMesh);
        
        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.mesh.userData.entityId = this.id;
        
        return this.mesh;
    }

    /**
     * Calculate tidal force (spaghettification)
     */
    calculateTidalForce(otherPosition, otherMass, otherRadius) {
        const distance = this.position.distanceTo(otherPosition);
        const G = Config.physics.universalG;
        
        if (distance < this.schwarzschildRadius * 2) {
            // Inside tidal disruption radius
            return (2 * G * this.mass * otherRadius) / Math.pow(distance, 3);
        }
        return 0;
    }
}

/**
 * Special Entity: Volumetric Object (for telescope/visual effects)
 */
class VolumetricObject extends Entity {
    constructor(id, config = {}) {
        super(id, config);
        this.type = 'volumetric';
        
        this.volumeScale = config.volumeScale || 1;
        this.density = config.density || 0.5;
        this.noiseScale = config.noiseScale || 1;
    }

    /**
     * Create volumetric rendering setup (using point clouds or particle system)
     */
    createMesh(quality = 'medium') {
        const particleCount = quality === 'ultra' ? 50000 : quality === 'medium' ? 10000 : 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * this.volumeScale;
            
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: this.color,
            size: 0.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.3
        });
        
        this.mesh = new THREE.Points(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.userData.entityId = this.id;
        
        return this.mesh;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CelestialBody, Blackhole, VolumetricObject };
}
