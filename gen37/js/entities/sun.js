/**
 * Sun - The star at the center of our solar system
 * Provides light and gravitational anchor
 */

class Sun extends CelestialBody {
    constructor() {
        super({
            name: Config.SUN.name,
            mass: Config.SUN.mass,
            radius: Config.SUN.radius,
            color: Config.SUN.color,
            rotationPeriod: Config.SUN.rotationPeriod,
            axialTilt: 0
        });
        
        this.type = 'star';
        this.luminosity = Config.SUN.luminosity;
        this.temperature = Config.SUN.temperature;
        
        // Light source
        this.light = null;
        this.coronaEffect = null;
        this.glowSprite = null;
    }
    
    /**
     * Initialize the sun
     */
    init(scene) {
        // Create physics body first (at origin)
        this.physicsBody = PhysicsEngine.createBody({
            name: this.name,
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            mass: this.mass,
            radius: this.radius,
            isCelestial: true,
            isStatic: false,  // Sun can move slightly due to planetary influence
            affectedByGravity: true
        });
        
        // Create visual representation
        this.createMesh();
        this.createLight();
        this.createCorona();
        this.createGlow();
        
        // Link mesh to physics body
        this.physicsBody.mesh = this.group;
        
        // Add to scene
        scene.add(this.group);
        
        Logger.info('Sun', `Initialized ${this.name} - Mass: ${MathUtils.formatSI(this.mass)}kg`);
    }
    
    /**
     * Create the sun's mesh with emissive material
     */
    createMesh() {
        const fidelity = Config.RENDERING.fidelityLevel;
        const segments = Config.RENDERING.geometry[fidelity].planetSegments;
        
        // Scale radius for visualization
        const visualRadius = Config.scaleSize(this.radius);
        
        const geometry = new THREE.SphereGeometry(visualRadius, segments, segments / 2);
        
        // Emissive material - sun generates its own light
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            emissive: this.color,
            emissiveIntensity: Config.SUN.emissiveIntensity
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.name = this.name;
        
        this.group.add(this.mesh);
    }
    
    /**
     * Create the point light source
     */
    createLight() {
        this.light = new THREE.PointLight(
            0xffffff,
            Config.SUN.lightIntensity,
            0,  // Infinite distance
            2   // Physical decay
        );
        
        // Enable shadows
        if (Config.RENDERING.shadows[Config.RENDERING.fidelityLevel].enabled) {
            this.light.castShadow = true;
            
            const shadowMapSize = Config.SUN.shadowMapSize;
            this.light.shadow.mapSize.width = shadowMapSize;
            this.light.shadow.mapSize.height = shadowMapSize;
            this.light.shadow.camera.near = 0.1;
            this.light.shadow.camera.far = Config.SUN.lightDistance / Config.SCALE.distance;
            this.light.shadow.bias = -0.001;
        }
        
        this.group.add(this.light);
        
        Logger.debug('Sun', `Light created - Intensity: ${Config.SUN.lightIntensity}`);
    }
    
    /**
     * Create corona effect (glowing atmosphere around sun)
     */
    createCorona() {
        const visualRadius = Config.scaleSize(this.radius);
        const coronaSize = Config.SUN.coronaSize;
        
        // Inner corona
        const coronaGeometry = new THREE.SphereGeometry(
            visualRadius * coronaSize, 
            32, 16
        );
        
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0xffaa44) },
                viewVector: { value: new THREE.Vector3(0, 0, 1) },
                intensity: { value: 0.8 }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal = normalize(normalMatrix * normal);
                    vec3 vNormel = normalize(normalMatrix * viewVector);
                    intensity = pow(0.7 - dot(vNormal, vNormel), 2.0);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying float intensity;
                void main() {
                    vec3 glow = glowColor * intensity;
                    gl_FragColor = vec4(glow, intensity * 0.5);
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        // Simplified corona using basic material (shader above is for future use)
        const simpleCoronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa44,
            transparent: true,
            opacity: Config.SUN.coronaOpacity,
            side: THREE.BackSide
        });
        
        this.coronaEffect = new THREE.Mesh(coronaGeometry, simpleCoronaMaterial);
        this.group.add(this.coronaEffect);
    }
    
    /**
     * Create lens flare / glow sprite
     */
    createGlow() {
        const visualRadius = Config.scaleSize(this.radius);
        
        // Create a glowing sprite that always faces camera
        const spriteMaterial = new THREE.SpriteMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.glowSprite = new THREE.Sprite(spriteMaterial);
        this.glowSprite.scale.set(visualRadius * 4, visualRadius * 4, 1);
        this.group.add(this.glowSprite);
    }
    
    /**
     * Update the sun
     */
    update(deltaTime, camera) {
        super.update(deltaTime);
        
        // Update corona to face camera
        if (this.coronaEffect && camera) {
            // Corona shader could use camera direction here
        }
        
        // Pulsating glow effect
        if (this.glowSprite) {
            const time = performance.now() * 0.001;
            const pulse = 1 + Math.sin(time * 2) * 0.05;
            const visualRadius = Config.scaleSize(this.radius);
            this.glowSprite.scale.set(
                visualRadius * 4 * pulse, 
                visualRadius * 4 * pulse, 
                1
            );
        }
    }
    
    /**
     * Update light intensity
     */
    setLightIntensity(intensity) {
        if (this.light) {
            this.light.intensity = intensity;
        }
    }
    
    /**
     * Get luminosity at a distance
     */
    getLuminosityAtDistance(distance) {
        // Inverse square law
        return this.luminosity / (4 * Math.PI * distance * distance);
    }
}

window.Sun = Sun;
