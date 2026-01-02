/**
 * ============================================
 * Celestial Body Base Class
 * ============================================
 * 
 * Base class for all celestial bodies (stars, planets, moons).
 * Handles orbital mechanics, rotation, and rendering.
 */

class CelestialBody extends Entity {
    constructor(config) {
        super(config);
        
        this.type = 'celestial';
        this.bodyType = config.type || 'planet'; // star, planet, moon
        
        // Physical properties
        this.physicsData.mass = config.mass || 1e24;
        this.physicsData.radius = config.radius || 6371; // km
        
        // Visual properties
        this.color = config.color || 0x4488FF;
        this.emissiveColor = config.emissiveColor || null;
        this.luminosity = config.luminosity || 0;
        this.temperature = config.temperature || 300;
        
        // Rotation
        this.rotationPeriod = config.rotationPeriod || 86400; // seconds
        this.axialTilt = (config.axialTilt || 0) * MathUtils.DEG2RAD;
        this.currentRotation = 0;
        
        // Atmosphere
        this.hasAtmosphere = config.hasAtmosphere || false;
        this.atmosphereColor = config.atmosphereColor || 0x88AAFF;
        this.atmosphereScale = config.atmosphereScale || 1.02;
        this.atmosphereMesh = null;
        
        // Parent body (for moons)
        this.parentBody = null;
        this.parentBodyId = config.parentBody || null;
        
        // LOD meshes
        this.lodLevels = [];
        
        // Set initial position and velocity
        if (config.position) {
            this.physicsData.position = { ...config.position };
        }
        if (config.velocity) {
            this.physicsData.velocity = { ...config.velocity };
        }
    }
    
    /**
     * Initialize the celestial body
     */
    init(fidelitySettings) {
        console.info(`Initializing celestial body: ${this.name}`);
        
        try {
            // Create the main mesh
            this.createMesh(fidelitySettings);
            
            // Create atmosphere if applicable
            if (this.hasAtmosphere && fidelitySettings.atmosphereEnabled) {
                this.createAtmosphere(fidelitySettings);
            }
            
            // Apply axial tilt
            if (this.axialTilt !== 0) {
                this.group.rotation.z = this.axialTilt;
            }
            
            // Sync position from physics
            this.syncFromPhysics();
            
            this.isInitialized = true;
            console.success(`Celestial body ${this.name} initialized`);
            
            return this;
            
        } catch (error) {
            console.error(`Failed to initialize ${this.name}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Create the main mesh
     */
    createMesh(fidelitySettings) {
        const segments = fidelitySettings.planetSegments || 32;
        
        // Render radius (convert from km to render units)
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(renderRadius, segments, segments);
        
        // Create material based on body type
        let material;
        
        if (this.bodyType === 'star') {
            // Emissive material for stars
            material = new THREE.MeshBasicMaterial({
                color: this.color,
                emissive: this.emissiveColor || this.color,
                emissiveIntensity: 1.0
            });
        } else {
            // Standard material for planets/moons
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                roughness: 0.8,
                metalness: 0.1,
                flatShading: false
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = this.bodyType !== 'star';
        this.mesh.receiveShadow = this.bodyType !== 'star';
        this.mesh.name = `${this.name}_mesh`;
        
        this.group.add(this.mesh);
        
        // Add surface detail procedurally
        this.addSurfaceDetail(renderRadius, segments);
    }
    
    /**
     * Add procedural surface detail
     */
    addSurfaceDetail(radius, segments) {
        if (this.bodyType === 'star') return;
        
        // Modify vertices for some surface variation
        const geometry = this.mesh.geometry;
        const positions = geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Simple noise-based displacement
            const noise = this.simpleNoise(x * 10, y * 10, z * 10) * 0.002;
            const len = Math.sqrt(x * x + y * y + z * z);
            const newLen = len * (1 + noise);
            
            if (len > 0) {
                positions.setXYZ(i, 
                    x / len * newLen,
                    y / len * newLen,
                    z / len * newLen
                );
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
    
    /**
     * Simple 3D noise function
     */
    simpleNoise(x, y, z) {
        const p = x * 12.9898 + y * 78.233 + z * 37.719;
        return Math.sin(p) * 43758.5453 % 1;
    }
    
    /**
     * Create atmosphere effect
     */
    createAtmosphere(fidelitySettings) {
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        const atmosRadius = renderRadius * this.atmosphereScale;
        const segments = fidelitySettings.planetSegments || 32;
        
        const geometry = new THREE.SphereGeometry(atmosRadius, segments, segments);
        
        // Custom atmosphere shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: new THREE.Color(this.atmosphereColor) },
                sunPosition: { value: new THREE.Vector3(0, 0, 0) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform vec3 sunPosition;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    float intensity = pow(1.0 - abs(dot(vNormal, viewDir)), 2.0);
                    
                    // Simple sun-facing glow
                    vec3 sunDir = normalize(sunPosition - vPosition);
                    float sunFacing = max(0.0, dot(vNormal, sunDir));
                    
                    vec3 color = atmosphereColor * intensity * (0.5 + sunFacing * 0.5);
                    gl_FragColor = vec4(color, intensity * 0.5);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.atmosphereMesh = new THREE.Mesh(geometry, material);
        this.atmosphereMesh.name = `${this.name}_atmosphere`;
        this.group.add(this.atmosphereMesh);
    }
    
    /**
     * Update the celestial body
     */
    update(deltaTime) {
        if (!this.isInitialized) return;
        
        // Update rotation
        const scaledDt = deltaTime * CONFIG.PHYSICS.TIME_SCALE;
        const rotationSpeed = (Math.PI * 2) / this.rotationPeriod;
        this.currentRotation += rotationSpeed * scaledDt;
        
        if (this.mesh) {
            this.mesh.rotation.y = this.currentRotation;
        }
        
        // Update atmosphere sun position if present
        if (this.atmosphereMesh && this.atmosphereMesh.material.uniforms) {
            // Sun is at origin in render space
            this.atmosphereMesh.material.uniforms.sunPosition.value.set(0, 0, 0);
        }
    }
    
    /**
     * Sync Three.js object from physics data
     */
    syncFromPhysics() {
        if (this.group) {
            const scale = 1 / CONFIG.PHYSICS.DISTANCE_SCALE;
            this.group.position.set(
                this.physicsData.position.x * scale,
                this.physicsData.position.y * scale,
                this.physicsData.position.z * scale
            );
        }
    }
    
    /**
     * Get surface position at lat/lon
     */
    getSurfacePosition(latitude, longitude) {
        const pos = MathUtils.latLonToPosition(latitude, longitude, this.physicsData.radius);
        
        // Add body's position
        return {
            x: this.physicsData.position.x + pos.x,
            y: this.physicsData.position.y + pos.y,
            z: this.physicsData.position.z + pos.z
        };
    }
    
    /**
     * Get velocity at surface point (includes rotation)
     */
    getSurfaceVelocity(latitude, longitude) {
        // Body's orbital velocity
        const orbitalVel = { ...this.physicsData.velocity };
        
        // Add rotational velocity at this point
        const pos = MathUtils.latLonToPosition(latitude, longitude, this.physicsData.radius);
        const angularVel = (2 * Math.PI) / this.rotationPeriod; // rad/s
        
        // Tangential velocity from rotation (perpendicular to radial direction)
        const rotVel = {
            x: -pos.z * angularVel,
            y: 0,
            z: pos.x * angularVel
        };
        
        return {
            x: orbitalVel.x + rotVel.x,
            y: orbitalVel.y + rotVel.y,
            z: orbitalVel.z + rotVel.z
        };
    }
    
    /**
     * Get body data for dev console
     */
    getEditableProperties() {
        return {
            mass: { value: this.physicsData.mass, type: 'number', label: 'Mass (kg)' },
            radius: { value: this.physicsData.radius, type: 'number', label: 'Radius (km)' },
            rotationPeriod: { value: this.rotationPeriod, type: 'number', label: 'Rotation Period (s)' },
            positionX: { value: this.physicsData.position.x, type: 'number', label: 'Position X (km)' },
            positionY: { value: this.physicsData.position.y, type: 'number', label: 'Position Y (km)' },
            positionZ: { value: this.physicsData.position.z, type: 'number', label: 'Position Z (km)' },
            velocityX: { value: this.physicsData.velocity.x, type: 'number', label: 'Velocity X (km/s)' },
            velocityY: { value: this.physicsData.velocity.y, type: 'number', label: 'Velocity Y (km/s)' },
            velocityZ: { value: this.physicsData.velocity.z, type: 'number', label: 'Velocity Z (km/s)' }
        };
    }
    
    /**
     * Set property from dev console
     */
    setProperty(name, value) {
        switch (name) {
            case 'mass':
                this.physicsData.mass = parseFloat(value);
                break;
            case 'radius':
                this.physicsData.radius = parseFloat(value);
                // Would need to rebuild mesh for visual update
                break;
            case 'rotationPeriod':
                this.rotationPeriod = parseFloat(value);
                break;
            case 'positionX':
                this.physicsData.position.x = parseFloat(value);
                this.syncFromPhysics();
                break;
            case 'positionY':
                this.physicsData.position.y = parseFloat(value);
                this.syncFromPhysics();
                break;
            case 'positionZ':
                this.physicsData.position.z = parseFloat(value);
                this.syncFromPhysics();
                break;
            case 'velocityX':
                this.physicsData.velocity.x = parseFloat(value);
                break;
            case 'velocityY':
                this.physicsData.velocity.y = parseFloat(value);
                break;
            case 'velocityZ':
                this.physicsData.velocity.z = parseFloat(value);
                break;
        }
    }
}
