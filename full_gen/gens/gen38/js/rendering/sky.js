/**
 * Solar System Simulation - Sky/Starfield
 * ========================================
 * Procedural starfield for the background.
 * Designed to be expandable for future features.
 */

class SkyManager {
    constructor() {
        this.starField = null;
        this.starPositions = [];
        this.starColors = [];
        this.starSizes = [];
        
        // For future expansion
        this.constellations = [];
        this.nebulae = [];
        this.galaxies = [];
        
        Logger.info('SkyManager created');
    }
    
    /**
     * Initialize the starfield
     */
    init(scene) {
        Logger.time('Starfield initialization');
        
        try {
            this.createStarField(scene);
            
            Logger.timeEnd('Starfield initialization');
            Logger.success('Starfield initialized');
            
            return true;
        } catch (error) {
            Logger.error('Failed to initialize starfield', { error: error.message });
            throw error;
        }
    }
    
    /**
     * Create procedural starfield
     */
    createStarField(scene) {
        const starCount = Config.rendering.starField.count;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        // Star colors (based on stellar classification)
        const starTypes = [
            { color: new THREE.Color(0.6, 0.7, 1.0), weight: 0.1 },   // O/B - Blue
            { color: new THREE.Color(0.8, 0.85, 1.0), weight: 0.15 }, // A - Blue-white
            { color: new THREE.Color(1.0, 1.0, 0.95), weight: 0.2 },  // F - White
            { color: new THREE.Color(1.0, 0.95, 0.8), weight: 0.25 }, // G - Yellow (like Sun)
            { color: new THREE.Color(1.0, 0.85, 0.6), weight: 0.2 },  // K - Orange
            { color: new THREE.Color(1.0, 0.6, 0.4), weight: 0.1 },   // M - Red
        ];
        
        // Distance for starfield (very far away)
        const radius = Config.rendering.farPlane * 0.5;
        
        for (let i = 0; i < starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * MathUtils.TWO_PI;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            
            // Random star type (weighted)
            const rand = Math.random();
            let cumWeight = 0;
            let starColor = starTypes[0].color;
            
            for (const type of starTypes) {
                cumWeight += type.weight;
                if (rand <= cumWeight) {
                    starColor = type.color;
                    break;
                }
            }
            
            // Slight color variation
            const variation = 0.1;
            colors[i * 3] = starColor.r + (Math.random() - 0.5) * variation;
            colors[i * 3 + 1] = starColor.g + (Math.random() - 0.5) * variation;
            colors[i * 3 + 2] = starColor.b + (Math.random() - 0.5) * variation;
            
            // Random size (most stars are small, few are bright)
            const sizeRand = Math.random();
            if (sizeRand > 0.99) {
                sizes[i] = 3.0 + Math.random() * 2.0; // Bright stars
            } else if (sizeRand > 0.95) {
                sizes[i] = 2.0 + Math.random() * 1.0; // Medium stars
            } else {
                sizes[i] = 0.5 + Math.random() * 1.5; // Dim stars
            }
            
            sizes[i] *= Config.rendering.starField.size;
        }
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Create shader material for better looking stars
        const material = new THREE.ShaderMaterial({
            uniforms: {
                brightness: { value: Config.rendering.starField.brightness },
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float brightness;
                varying vec3 vColor;
                
                void main() {
                    // Circular star shape with soft edges
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    // Soft glow
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha = pow(alpha, 0.5);
                    
                    gl_FragColor = vec4(vColor * brightness, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });
        
        this.starField = new THREE.Points(geometry, material);
        this.starField.renderOrder = -1000; // Render behind everything
        
        scene.add(this.starField);
        
        // Store for later updates
        this.starPositions = positions;
        this.starColors = colors;
        this.starSizes = sizes;
        
        Logger.debug(`Created starfield with ${starCount} stars`);
    }
    
    /**
     * Update starfield settings
     */
    updateSettings() {
        if (!this.starField) return;
        
        this.starField.material.uniforms.brightness.value = Config.rendering.starField.brightness;
    }
    
    /**
     * Regenerate starfield with new count
     */
    regenerate(scene) {
        if (this.starField) {
            scene.remove(this.starField);
            this.starField.geometry.dispose();
            this.starField.material.dispose();
        }
        
        this.createStarField(scene);
    }
    
    /**
     * Update starfield (for any animations)
     */
    update(deltaTime) {
        // Could add subtle twinkling here
        // For now, stars are static for performance
    }
    
    /**
     * Add a distant object (for future expansion)
     */
    addDistantObject(type, config) {
        switch (type) {
            case 'nebula':
                this.addNebula(config);
                break;
            case 'galaxy':
                this.addGalaxy(config);
                break;
            default:
                Logger.warn(`Unknown distant object type: ${type}`);
        }
    }
    
    /**
     * Add nebula (placeholder for future)
     */
    addNebula(config) {
        // Future implementation
        Logger.debug('Nebula system not yet implemented');
    }
    
    /**
     * Add distant galaxy (placeholder for future)
     */
    addGalaxy(config) {
        // Future implementation
        Logger.debug('Galaxy system not yet implemented');
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        if (this.starField) {
            this.starField.geometry.dispose();
            this.starField.material.dispose();
        }
        
        Logger.info('SkyManager disposed');
    }
}

// Global instance
const Sky = new SkyManager();
