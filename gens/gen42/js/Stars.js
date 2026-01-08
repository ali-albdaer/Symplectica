/**
 * Stars.js - Background Stars Module
 * 
 * Creates a beautiful, non-demanding star field background.
 * Scalable for future expansion with constellations, galaxies, etc.
 */

import Config from './Config.js';
import Utils from './Utils.js';
import Debug from './Debug.js';

class Stars {
    constructor() {
        this.THREE = null;
        this.starField = null;
        this.starCount = 5000;
        this.starRadius = 50000; // How far out stars are placed
    }
    
    /**
     * Initialize and create star field
     */
    init(THREE, scene) {
        this.THREE = THREE;
        this.scene = scene;
        
        // Get star count from quality settings
        const qualitySettings = Config.getQualitySettings();
        this.starCount = qualitySettings.starCount || 5000;
        
        this.createStarField();
        
        Debug.info(`Created ${this.starCount} stars`);
    }
    
    /**
     * Create the star field using points
     */
    createStarField() {
        const geometry = new this.THREE.BufferGeometry();
        
        // Arrays for star data
        const positions = new Float32Array(this.starCount * 3);
        const colors = new Float32Array(this.starCount * 3);
        const sizes = new Float32Array(this.starCount);
        
        // Star color palette (different stellar types)
        const starColors = [
            { r: 1.0, g: 0.95, b: 0.9 },   // White
            { r: 1.0, g: 0.9, b: 0.7 },    // Yellow-white
            { r: 1.0, g: 0.8, b: 0.6 },    // Yellow
            { r: 1.0, g: 0.7, b: 0.5 },    // Orange
            { r: 0.9, g: 0.9, b: 1.0 },    // Blue-white
            { r: 0.7, g: 0.8, b: 1.0 },    // Blue
            { r: 1.0, g: 0.6, b: 0.5 },    // Red
        ];
        
        for (let i = 0; i < this.starCount; i++) {
            // Random position on a sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = this.starRadius * (0.8 + Math.random() * 0.2);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random color from palette
            const color = Utils.randomFromArray(starColors);
            // Add some brightness variation
            const brightness = 0.7 + Math.random() * 0.3;
            
            colors[i * 3] = color.r * brightness;
            colors[i * 3 + 1] = color.g * brightness;
            colors[i * 3 + 2] = color.b * brightness;
            
            // Random size (most are small, few are bright)
            const sizeFactor = Math.random();
            if (sizeFactor > 0.98) {
                sizes[i] = 3 + Math.random() * 2; // Bright stars
            } else if (sizeFactor > 0.9) {
                sizes[i] = 2 + Math.random(); // Medium stars
            } else {
                sizes[i] = 0.5 + Math.random() * 1.5; // Small stars
            }
        }
        
        geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new this.THREE.BufferAttribute(sizes, 1));
        
        // Custom shader for point stars
        const material = new this.THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: window.devicePixelRatio }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // Circular point with soft edges
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Soft glow falloff
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha = pow(alpha, 1.5);
                    
                    // Twinkle effect based on position
                    float twinkle = 0.8 + 0.2 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
                    
                    gl_FragColor = vec4(vColor * twinkle, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            depthWrite: false,
            blending: this.THREE.AdditiveBlending
        });
        
        this.starField = new this.THREE.Points(geometry, material);
        this.scene.add(this.starField);
    }
    
    /**
     * Update stars (for future animations like twinkling)
     */
    update(deltaTime) {
        if (this.starField && this.starField.material.uniforms) {
            this.starField.material.uniforms.time.value += deltaTime;
        }
    }
    
    /**
     * Update star count based on quality
     */
    setQuality(quality) {
        const settings = Config.graphics.presets[quality];
        if (settings && settings.starCount !== this.starCount) {
            this.starCount = settings.starCount;
            
            // Recreate star field with new count
            if (this.starField) {
                this.scene.remove(this.starField);
                this.starField.geometry.dispose();
                this.starField.material.dispose();
            }
            
            this.createStarField();
            Debug.info(`Updated star count to ${this.starCount}`);
        }
    }
    
    /**
     * Add distant galaxy (future expansion)
     */
    addGalaxy(position, size, color) {
        // Placeholder for future expansion
        // Could add sprite-based galaxies or procedural galaxy shapes
    }
    
    /**
     * Add nebula (future expansion)
     */
    addNebula(position, size, colors) {
        // Placeholder for future expansion
        // Could add volumetric nebula effects
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        if (this.starField) {
            this.scene.remove(this.starField);
            this.starField.geometry.dispose();
            this.starField.material.dispose();
        }
    }
}

// Export singleton
const stars = new Stars();
export default stars;
