/**
 * ============================================
 * Sky System
 * ============================================
 * 
 * Creates the star field and background sky.
 * Optimized for performance while maintaining beauty.
 */

class SkySystem {
    constructor() {
        this.starField = null;
        this.starCount = CONFIG.SKY.STAR_COUNT;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the sky system
     */
    init(scene, fidelitySettings) {
        console.info('Initializing Sky System...');
        
        try {
            // Get star count from fidelity settings
            this.starCount = fidelitySettings.starCount || CONFIG.SKY.STAR_COUNT;
            
            // Create star field
            this.createStarField(scene);
            
            this.isInitialized = true;
            console.success('Sky System initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Sky System: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Create the star field using points
     */
    createStarField(scene) {
        const starPositions = [];
        const starColors = [];
        const starSizes = [];
        
        const radius = CONFIG.SKY.STAR_FIELD_RADIUS / CONFIG.PHYSICS.DISTANCE_SCALE;
        const colors = CONFIG.SKY.STAR_COLORS;
        
        for (let i = 0; i < this.starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            starPositions.push(x, y, z);
            
            // Random color from palette
            const colorHex = colors[Math.floor(Math.random() * colors.length)];
            const color = new THREE.Color(colorHex);
            starColors.push(color.r, color.g, color.b);
            
            // Random size
            const size = MathUtils.randomRange(
                CONFIG.SKY.STAR_MIN_SIZE,
                CONFIG.SKY.STAR_MAX_SIZE
            );
            starSizes.push(size);
        }
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
        
        // Custom shader material for stars
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                
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
                uniform float time;
                
                varying vec3 vColor;
                varying float vSize;
                
                void main() {
                    // Circular point with soft edge
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Soft glow falloff
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    
                    // Subtle twinkle
                    float twinkle = 0.8 + 0.2 * sin(time * 2.0 + vSize * 100.0);
                    
                    gl_FragColor = vec4(vColor * twinkle, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true
        });
        
        this.starField = new THREE.Points(geometry, material);
        this.starField.name = 'StarField';
        this.starField.frustumCulled = false; // Always render
        
        scene.add(this.starField);
    }
    
    /**
     * Update sky animation
     */
    update(deltaTime) {
        if (!this.isInitialized || !this.starField) return;
        
        // Update twinkle animation
        if (this.starField.material.uniforms) {
            this.starField.material.uniforms.time.value += deltaTime;
        }
    }
    
    /**
     * Update star count (requires rebuild)
     */
    setStarCount(count, scene) {
        if (this.starField) {
            scene.remove(this.starField);
            this.starField.geometry.dispose();
            this.starField.material.dispose();
        }
        
        this.starCount = count;
        this.createStarField(scene);
    }
}
