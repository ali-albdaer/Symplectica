/**
 * Skybox - Beautiful star field background
 * Performant and expandable for future features
 */

class Skybox {
    constructor() {
        this.starField = null;
        this.starMaterial = null;
        this.starCount = Config.RENDERING.stars.count;
        
        // For future expansion: nebulae, galaxies, etc.
        this.backgroundLayers = [];
    }
    
    /**
     * Initialize the skybox
     */
    init(scene) {
        this.scene = scene;
        
        this.createStarField();
        
        Logger.info('Skybox', `Created star field with ${this.starCount} stars`);
    }
    
    /**
     * Create the star field using points
     */
    createStarField() {
        const starConfig = Config.RENDERING.stars;
        const count = starConfig.count;
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        const radius = 1e10;  // Very far away
        
        for (let i = 0; i < count; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Color with some variation
            const colorVariation = starConfig.colorVariation;
            const baseColor = new THREE.Color();
            
            // Star color based on temperature simulation
            const temp = Math.random();
            if (temp < 0.1) {
                // Red/orange stars
                baseColor.setHSL(0.05 + Math.random() * 0.05, 0.8, 0.5 + Math.random() * 0.3);
            } else if (temp < 0.3) {
                // Yellow stars
                baseColor.setHSL(0.12 + Math.random() * 0.05, 0.7, 0.6 + Math.random() * 0.3);
            } else if (temp < 0.7) {
                // White stars
                baseColor.setHSL(0.15, 0.1 + Math.random() * 0.2, 0.8 + Math.random() * 0.2);
            } else {
                // Blue/white stars
                baseColor.setHSL(0.6 + Math.random() * 0.1, 0.5 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
            }
            
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
            
            // Size variation - mostly small with some bright ones
            const sizeRandom = Math.random();
            if (sizeRandom > 0.98) {
                sizes[i] = starConfig.size * 3;  // Bright stars
            } else if (sizeRandom > 0.9) {
                sizes[i] = starConfig.size * 1.5;
            } else {
                sizes[i] = starConfig.size * (0.3 + Math.random() * 0.7);
            }
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Shader material for better-looking stars
        this.starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                opacity: { value: starConfig.opacity },
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                varying float vSize;
                
                void main() {
                    vColor = color;
                    vSize = size;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float opacity;
                uniform float time;
                varying vec3 vColor;
                varying float vSize;
                
                void main() {
                    // Circular point with soft edge
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Subtle twinkle effect for larger stars
                    float twinkle = 1.0;
                    if (vSize > 1.0) {
                        twinkle = 0.8 + 0.2 * sin(time * 2.0 + vSize * 10.0);
                    }
                    
                    gl_FragColor = vec4(vColor * twinkle, alpha * opacity);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        this.starField = new THREE.Points(geometry, this.starMaterial);
        this.starField.name = 'StarField';
        this.starField.frustumCulled = false;  // Always render
        
        this.scene.add(this.starField);
    }
    
    /**
     * Update the skybox
     */
    update(deltaTime, cameraPosition) {
        // Update time for twinkle effect
        if (this.starMaterial) {
            this.starMaterial.uniforms.time.value += deltaTime;
        }
        
        // Keep star field centered on camera (appears infinitely far)
        if (this.starField && cameraPosition) {
            this.starField.position.copy(cameraPosition);
        }
    }
    
    /**
     * Set star field opacity
     */
    setOpacity(opacity) {
        if (this.starMaterial) {
            this.starMaterial.uniforms.opacity.value = opacity;
        }
    }
    
    /**
     * Update star count (recreates the field)
     */
    setStarCount(count) {
        if (count === this.starCount) return;
        
        this.starCount = count;
        Config.RENDERING.stars.count = count;
        
        // Remove old
        if (this.starField) {
            this.scene.remove(this.starField);
            this.starField.geometry.dispose();
        }
        
        // Create new
        this.createStarField();
    }
    
    /**
     * Add a nebula layer (for future expansion)
     */
    addNebulaLayer(config) {
        // TODO: Implement nebula backgrounds
        // This could use a large textured sphere or custom shader
        Logger.debug('Skybox', 'Nebula layers not yet implemented');
    }
    
    /**
     * Add a galaxy texture (for future expansion)
     */
    addGalaxyBackground(textureUrl) {
        // TODO: Implement galaxy backgrounds
        Logger.debug('Skybox', 'Galaxy backgrounds not yet implemented');
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        if (this.starField) {
            this.scene.remove(this.starField);
            this.starField.geometry.dispose();
            if (this.starMaterial) {
                this.starMaterial.dispose();
            }
        }
        
        for (const layer of this.backgroundLayers) {
            this.scene.remove(layer);
            if (layer.geometry) layer.geometry.dispose();
            if (layer.material) layer.material.dispose();
        }
    }
}

window.Skybox = Skybox;
