/**
 * ============================================
 * Sun Entity
 * ============================================
 * 
 * The star at the center of the solar system.
 * Acts as the primary light source.
 */

class Sun extends CelestialBody {
    constructor(config) {
        super(config);
        
        this.bodyType = 'star';
        this.light = null;
        this.coronaMesh = null;
        this.glowMesh = null;
    }
    
    /**
     * Initialize the sun
     */
    init(fidelitySettings) {
        console.info(`Initializing Sun: ${this.name}`);
        
        try {
            // Create the main mesh
            this.createMesh(fidelitySettings);
            
            // Create corona effect
            this.createCorona(fidelitySettings);
            
            // Create outer glow
            this.createGlow(fidelitySettings);
            
            // Sync position from physics
            this.syncFromPhysics();
            
            this.isInitialized = true;
            console.success(`Sun ${this.name} initialized`);
            
            return this;
            
        } catch (error) {
            console.error(`Failed to initialize Sun ${this.name}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Create the sun mesh with emissive material
     */
    createMesh(fidelitySettings) {
        const segments = fidelitySettings.planetSegments || 32;
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        
        const geometry = new THREE.SphereGeometry(renderRadius, segments, segments);
        
        // Bright emissive material
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: false
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = `${this.name}_mesh`;
        
        // Sun doesn't cast/receive shadows (it IS the light source)
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Create corona effect around the sun
     */
    createCorona(fidelitySettings) {
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        const coronaRadius = renderRadius * 1.2;
        const segments = fidelitySettings.planetSegments || 32;
        
        const geometry = new THREE.SphereGeometry(coronaRadius, segments, segments);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                coronaColor: { value: new THREE.Color(this.emissiveColor || this.color) },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 coronaColor;
                uniform float time;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDir = normalize(cameraPosition - vPosition);
                    float intensity = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
                    
                    // Add some animated variation
                    float flicker = 0.9 + 0.1 * sin(time * 2.0 + vPosition.x * 10.0);
                    
                    vec3 color = coronaColor * intensity * flicker;
                    gl_FragColor = vec4(color, intensity * 0.8);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.coronaMesh = new THREE.Mesh(geometry, material);
        this.coronaMesh.name = `${this.name}_corona`;
        this.group.add(this.coronaMesh);
    }
    
    /**
     * Create outer glow sprite
     */
    createGlow(fidelitySettings) {
        const renderRadius = this.physicsData.radius / CONFIG.PHYSICS.DISTANCE_SCALE;
        
        // Create a simple glow using a sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(renderRadius * 8, renderRadius * 8, 1);
        sprite.name = `${this.name}_glow`;
        
        this.glowMesh = sprite;
        this.group.add(sprite);
    }
    
    /**
     * Update sun animation
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Animate corona
        if (this.coronaMesh && this.coronaMesh.material.uniforms) {
            this.coronaMesh.material.uniforms.time.value += deltaTime;
        }
    }
}
