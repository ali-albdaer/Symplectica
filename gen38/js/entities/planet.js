/**
 * Solar System Simulation - Planet Entity
 * ========================================
 * Planets orbiting the sun with optional atmosphere.
 */

class Planet extends CelestialBody {
    constructor(config) {
        super({
            ...config,
            type: 'planet',
        });
        
        // Orbital properties
        this.orbitalRadius = config.orbitalRadius || 1e11;
        this.orbitalVelocity = config.orbitalVelocity || 30000;
        this.orbitalAngle = config.orbitalAngle || 0;
        
        // Atmosphere
        this.hasAtmosphere = config.hasAtmosphere || false;
        this.atmosphereColor = config.atmosphereColor || 0x4488FF;
        this.atmosphereMesh = null;
        
        // Surface properties
        this.surfaceTexture = null;
        
        // Initialize orbital position and velocity
        this.initializeOrbit();
        
        Logger.info(`Planet created: ${this.name}`);
    }
    
    /**
     * Initialize orbital position and velocity
     */
    initializeOrbit() {
        // Position in circular orbit
        this.position.x = Math.cos(this.orbitalAngle) * this.orbitalRadius;
        this.position.y = 0;
        this.position.z = Math.sin(this.orbitalAngle) * this.orbitalRadius;
        
        // Velocity perpendicular to position (tangential)
        // For counterclockwise orbit when viewed from above (+Y)
        const vAngle = this.orbitalAngle + Math.PI / 2;
        this.velocity.x = Math.cos(vAngle) * this.orbitalVelocity;
        this.velocity.y = 0;
        this.velocity.z = Math.sin(vAngle) * this.orbitalVelocity;
        
        Logger.debug(`${this.name} orbit initialized: r=${this.orbitalRadius.toExponential(2)}m, v=${this.orbitalVelocity.toFixed(0)}m/s`);
    }
    
    /**
     * Create planet mesh with procedural texture
     */
    createMesh() {
        const geometry = new THREE.SphereGeometry(this.visualRadius, 64, 64);
        
        // Create procedural planet texture
        const texture = this.createPlanetTexture();
        
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.8,
            metalness: 0.1,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Apply axial tilt
        this.mesh.rotation.z = this.axialTilt;
        
        this.group.add(this.mesh);
        
        // Create atmosphere if applicable
        if (this.hasAtmosphere) {
            this.createAtmosphere();
        }
        
        return this.group;
    }
    
    /**
     * Create procedural planet texture
     */
    createPlanetTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base color
        const baseColor = new THREE.Color(this.color);
        
        // Fill with base color
        ctx.fillStyle = `rgb(${Math.floor(baseColor.r * 255)}, ${Math.floor(baseColor.g * 255)}, ${Math.floor(baseColor.b * 255)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise for terrain variation
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Simple noise pattern
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                
                // Create some procedural variation
                const noise1 = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 20;
                const noise2 = Math.sin(x * 0.05 + y * 0.03) * 15;
                const noise3 = (Math.random() - 0.5) * 10;
                const totalNoise = noise1 + noise2 + noise3;
                
                imageData.data[i] = MathUtils.clamp(imageData.data[i] + totalNoise, 0, 255);
                imageData.data[i + 1] = MathUtils.clamp(imageData.data[i + 1] + totalNoise * 0.8, 0, 255);
                imageData.data[i + 2] = MathUtils.clamp(imageData.data[i + 2] + totalNoise * 0.6, 0, 255);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add some "continents" or features
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = 50 + Math.random() * 100;
            
            const featureColor = baseColor.clone();
            featureColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.3);
            
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${Math.floor(featureColor.r * 255)}, ${Math.floor(featureColor.g * 255)}, ${Math.floor(featureColor.b * 255)})`;
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        return texture;
    }
    
    /**
     * Create atmospheric glow effect
     */
    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(this.visualRadius * 1.05, 32, 32);
        
        const atmosphereColor = new THREE.Color(this.atmosphereColor);
        
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: atmosphereColor },
                sunPosition: { value: new THREE.Vector3(0, 0, 0) },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform vec3 sunPosition;
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    // Fresnel-like effect for atmosphere edge
                    vec3 viewDir = normalize(-vPosition);
                    float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
                    rim = pow(rim, 3.0);
                    
                    // Simple scattering approximation
                    float scatter = rim * 0.8;
                    
                    gl_FragColor = vec4(atmosphereColor, scatter);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });
        
        this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.atmosphereMesh);
    }
    
    /**
     * Update planet
     */
    update(deltaTime) {
        // Atmosphere follows planet rotation indirectly through group
        if (this.atmosphereMesh && this.atmosphereMesh.material.uniforms) {
            // Update sun position for atmosphere shader
            // The sun is always at origin in our simulation
            const sunWorldPos = new THREE.Vector3(0, 0, 0);
            this.atmosphereMesh.material.uniforms.sunPosition.value.copy(sunWorldPos);
        }
    }
    
    /**
     * Get spawn position for player
     */
    getPlayerSpawnPosition() {
        // Spawn on the side facing away from the sun
        // Get direction from sun (at origin) to planet
        const dirFromSun = this.group.position.clone().normalize();
        
        // Spawn position on the sunny side, slightly above surface
        const spawnOffset = dirFromSun.multiplyScalar(this.visualRadius + Config.player.spawnHeight);
        
        return {
            position: this.group.position.clone().add(spawnOffset),
            normal: dirFromSun.clone()
        };
    }
    
    /**
     * Get orbital period
     */
    getOrbitalPeriod() {
        return MathUtils.orbitalPeriod(Config.physics.G, Config.sun.mass, this.orbitalRadius);
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        super.dispose();
        
        if (this.atmosphereMesh) {
            this.atmosphereMesh.geometry.dispose();
            this.atmosphereMesh.material.dispose();
        }
    }
}
