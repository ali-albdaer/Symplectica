/**
 * Solar System Simulation - Sun Entity
 * =====================================
 * The star at the center of the solar system.
 * Acts as the primary light source.
 */

class Sun extends CelestialBody {
    constructor(config) {
        super({
            ...config,
            type: 'star',
        });
        
        this.luminosity = config.luminosity || 1.0;
        this.temperature = config.temperature || 5778;
        this.emissionIntensity = config.emissionIntensity || 2.0;
        
        // Light source
        this.light = null;
        this.coronaEffect = null;
        this.glowSprite = null;
        
        Logger.info(`Sun created: ${this.name}`);
    }
    
    /**
     * Create the sun mesh with emission material
     */
    createMesh() {
        // Main sun sphere with emissive material
        const geometry = new THREE.SphereGeometry(this.visualRadius, 64, 64);
        
        // Create a procedural sun texture
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Create gradient for sun surface
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, '#FFFF88');
        gradient.addColorStop(0.3, '#FFDD44');
        gradient.addColorStop(0.6, '#FFAA22');
        gradient.addColorStop(1, '#FF6600');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add some noise/turbulence effect
        const imageData = ctx.getImageData(0, 0, 512, 512);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 30;
            imageData.data[i] = Math.max(0, Math.min(255, imageData.data[i] + noise));
            imageData.data[i + 1] = Math.max(0, Math.min(255, imageData.data[i + 1] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            emissive: new THREE.Color(this.color),
            emissiveIntensity: this.emissionIntensity,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = false;
        this.mesh.receiveShadow = false;
        
        this.group.add(this.mesh);
        
        // Create corona/glow effect
        this.createCorona();
        
        // Create point light
        this.createLight();
        
        // Create glow sprite
        this.createGlowSprite();
        
        return this.group;
    }
    
    /**
     * Create corona effect around the sun
     */
    createCorona() {
        // Create a larger sphere with custom shader for corona
        const coronaGeometry = new THREE.SphereGeometry(this.visualRadius * 1.2, 32, 32);
        
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                sunColor: { value: new THREE.Color(0xFFDD44) },
                viewVector: { value: new THREE.Vector3() },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 sunColor;
                varying vec3 vNormal;
                varying vec3 vPositionNormal;
                
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vPositionNormal), 2.0);
                    gl_FragColor = vec4(sunColor, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });
        
        this.coronaEffect = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.group.add(this.coronaEffect);
    }
    
    /**
     * Create point light for the solar system
     */
    createLight() {
        // Main sunlight
        this.light = new THREE.PointLight(
            0xFFFFEE,
            this.luminosity * 2,
            0, // Infinite distance
            2  // Decay (physically correct)
        );
        
        this.light.castShadow = Config.rendering.shadows.enabled;
        
        // Shadow settings
        if (this.light.shadow) {
            const shadowMapSize = Config.rendering.shadows.mapSize;
            this.light.shadow.mapSize.width = shadowMapSize;
            this.light.shadow.mapSize.height = shadowMapSize;
            this.light.shadow.camera.near = 0.5;
            this.light.shadow.camera.far = 1000;
            this.light.shadow.bias = Config.rendering.shadows.bias;
        }
        
        this.group.add(this.light);
        
        Logger.debug('Sun light created');
    }
    
    /**
     * Create glow sprite visible from far away
     */
    createGlowSprite() {
        // Create a sprite for long-distance visibility
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8,
        });
        
        this.glowSprite = new THREE.Sprite(spriteMaterial);
        this.glowSprite.scale.set(this.visualRadius * 4, this.visualRadius * 4, 1);
        this.group.add(this.glowSprite);
    }
    
    /**
     * Create glow texture procedurally
     */
    createGlowTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 220, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 180, 50, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    /**
     * Update sun-specific effects
     */
    update(deltaTime) {
        // Animate corona
        if (this.coronaEffect && this.coronaEffect.material.uniforms) {
            // Could add pulsing/animation here
        }
        
        // Slowly rotate glow sprite to face camera (handled by Sprite)
    }
    
    /**
     * Update light intensity
     */
    setLuminosity(value) {
        this.luminosity = value;
        if (this.light) {
            this.light.intensity = value * 2;
        }
    }
    
    /**
     * Enable/disable shadows
     */
    setShadowsEnabled(enabled) {
        if (this.light) {
            this.light.castShadow = enabled;
        }
    }
    
    /**
     * Update shadow quality
     */
    updateShadowQuality(mapSize) {
        if (this.light && this.light.shadow) {
            this.light.shadow.mapSize.width = mapSize;
            this.light.shadow.mapSize.height = mapSize;
            this.light.shadow.map?.dispose();
            this.light.shadow.map = null;
        }
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        super.dispose();
        
        if (this.coronaEffect) {
            this.coronaEffect.geometry.dispose();
            this.coronaEffect.material.dispose();
        }
        
        if (this.glowSprite) {
            this.glowSprite.material.map?.dispose();
            this.glowSprite.material.dispose();
        }
        
        if (this.light) {
            this.light.dispose();
        }
    }
}
